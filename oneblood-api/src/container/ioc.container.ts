// ─── Infrastructure ───────────────────────────────────────────────────────────
import { DbClient }          from '@infrastructure/database/db.client';
import { RedisCache }        from '@infrastructure/redis/redis.cache';
import { RedisPubSub }       from '@infrastructure/redis/redis.pubsub';
import { NodemailerAdapter } from '@infrastructure/messaging/nodemailer.adapter';
// import { TwilioAdapter } from '@infrastructure/messaging/twilio.adapter'; // uncomment to switch to SMS
import { OtpService }        from '@infrastructure/messaging/otp.service';

// ─── Core ─────────────────────────────────────────────────────────────────────
import { MatchingEngine } from '@core/matching/matching.engine';

// ─── Repositories ─────────────────────────────────────────────────────────────
import { AuthRepository }          from '@modules/auth/auth.repository';
import { UsersRepository }         from '@modules/users/users.repository';
import { DonorsRepository }        from '@modules/donors/donors.repository';
import { RequestsRepository }      from '@modules/requests/requests.repository';
import { DonationsRepository }     from '@modules/donations/donations.repository';
import { NotificationsRepository } from '@modules/notifications/notifications.repository';
import { AdminRepository }         from '@modules/admin/admin.repository';

// ─── Services ─────────────────────────────────────────────────────────────────
import { AuthService }          from '@modules/auth/auth.service';
import { UsersService }         from '@modules/users/users.service';
import { DonorsService }        from '@modules/donors/donors.service';
import { RequestsService }      from '@modules/requests/requests.service';
import { DonationsService }     from '@modules/donations/donations.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { AdminService }         from '@modules/admin/admin.service';

// ─── Controllers ──────────────────────────────────────────────────────────────
import { AuthController }          from '@modules/auth/auth.controller';
import { UsersController }         from '@modules/users/users.controller';
import { DonorsController }        from '@modules/donors/donors.controller';
import { RequestsController }      from '@modules/requests/requests.controller';
import { DonationsController }     from '@modules/donations/donations.controller';
import { NotificationsController } from '@modules/notifications/notifications.controller';
import { AdminController }         from '@modules/admin/admin.controller';

// ─── Route Factories ──────────────────────────────────────────────────────────
import { createAuthRoutes }          from '@modules/auth/auth.routes';
import { createUsersRoutes }         from '@modules/users/users.routes';
import { createDonorsRoutes }        from '@modules/donors/donors.routes';
import { createRequestsRoutes }      from '@modules/requests/requests.routes';
import { createDonationsRoutes }     from '@modules/donations/donations.routes';
import { createNotificationsRoutes } from '@modules/notifications/notifications.routes';
import { createAdminRoutes }         from '@modules/admin/admin.routes';

// ─── Wire Up ──────────────────────────────────────────────────────────────────

// Infrastructure
const db     = new DbClient();
const cache  = new RedisCache();
const pubsub = new RedisPubSub();

// Messaging (swap NodemailerAdapter → TwilioAdapter when Twilio is configured)
const messageSender = new NodemailerAdapter();
// const messageSender = new TwilioAdapter();
const otpService    = new OtpService(messageSender, cache);

// Core
const matchingEngine = new MatchingEngine(db, cache, pubsub);

// Repositories
const authRepo          = new AuthRepository(db);
const usersRepo         = new UsersRepository(db);
const donorsRepo        = new DonorsRepository(db);
const requestsRepo      = new RequestsRepository(db);
const donationsRepo     = new DonationsRepository(db);
const notificationsRepo = new NotificationsRepository(db);
const adminRepo         = new AdminRepository(db);

// Services
const authService          = new AuthService(authRepo, cache, otpService);
const usersService         = new UsersService(usersRepo);
const donorsService        = new DonorsService(donorsRepo);
const requestsService      = new RequestsService(requestsRepo, donorsRepo, matchingEngine);
const donationsService     = new DonationsService(donationsRepo, donorsRepo);
const notificationsService = new NotificationsService(notificationsRepo);
const adminService         = new AdminService(adminRepo);

// Controllers
const authController          = new AuthController(authService);
const usersController         = new UsersController(usersService);
const donorsController        = new DonorsController(donorsService);
const requestsController      = new RequestsController(requestsService);
const donationsController     = new DonationsController(donationsService);
const notificationsController = new NotificationsController(notificationsService);
const adminController         = new AdminController(adminService);

// Assembled routes
export const routes = {
  auth:          createAuthRoutes(authController),
  users:         createUsersRoutes(usersController),
  donors:        createDonorsRoutes(donorsController),
  requests:      createRequestsRoutes(requestsController),
  donations:     createDonationsRoutes(donationsController),
  notifications: createNotificationsRoutes(notificationsController),
  admin:         createAdminRoutes(adminController),
};

export { db };
