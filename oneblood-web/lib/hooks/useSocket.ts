'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    if (!socket) {
      socket = io(API_URL, {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    socketRef.current = socket;

    socket.on('notification:new', (_data: unknown) => {
      // Increment unread count on new notification
      setUnreadCount(useNotificationStore.getState().unreadCount + 1);
    });

    socket.on('request:updated', (_data: unknown) => {
      // Could trigger a query invalidation here
    });

    return () => {
      socket?.off('notification:new');
      socket?.off('request:updated');
    };
  }, [isAuthenticated, accessToken, setUnreadCount]);

  return socketRef.current;
}
