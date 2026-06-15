import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config';
import { AuthUser } from '@modules/auth/auth.types';
import { RedisCache } from '@infrastructure/redis/redis.cache';
import { RedisPubSub } from '@infrastructure/redis/redis.pubsub';

const CHANNELS = {
  MATCH: 'notify:match',
  SOS:   'notify:sos',
};

export function createSocketGateway(
  httpServer: HttpServer,
  cache: RedisCache,
  pubsub: RedisPubSub,
): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin:      appConfig.CORS_ORIGIN,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT middleware for Socket.io connections
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));

    try {
      const user = jwt.verify(token, appConfig.JWT_SECRET) as AuthUser;

      // Check token blacklist
      const isBlacklisted = await cache.exists(`blacklist:${token}`);
      if (isBlacklisted) return next(new Error('Token revoked'));

      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as AuthUser;
    console.log(`[Socket] ${user.name} connected (${socket.id})`);

    // Join personal room for targeted notifications
    void socket.join(`user:${user.id}`);

    // Donors join blood-type room for SOS broadcasts
    void socket.join(`bloodtype:${user.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] ${user.name} disconnected`);
    });
  });

  // Subscribe to Redis channels and forward to connected clients
  pubsub.subscribe(CHANNELS.MATCH, (message) => {
    const msg = message as { requestId: string; donorIds: string[]; urgencyLevel: string };
    for (const donorId of msg.donorIds) {
      io.to(`user:${donorId}`).emit('notification:new', {
        type: 'BLOOD_REQUEST_MATCH',
        requestId: msg.requestId,
        urgencyLevel: msg.urgencyLevel,
      });
    }
  });

  pubsub.subscribe(CHANNELS.SOS, (message) => {
    const msg = message as { requestId: string; donorIds: string[]; urgencyLevel: string };
    for (const donorId of msg.donorIds) {
      io.to(`user:${donorId}`).emit('notification:new', {
        type: 'SOS_ALERT',
        requestId: msg.requestId,
        urgencyLevel: 'SOS',
      });
    }
    // SOS also broadcasts to all connected clients in same blood type room
    io.emit('sos:broadcast', { requestId: msg.requestId });
  });

  return io;
}
