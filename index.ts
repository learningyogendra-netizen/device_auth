export { deviceAuth } from './src/deviceAuth';
export type { DeviceAuthConfig } from './src/config';
export { defaultConfig } from './src/config';
export { applyControllerOverrides } from './src/overrides';
export type { User, Role, Adapter, Config } from './src/types';
export { pick } from './src/utils';
export type { ResponseLike } from './src/utils';
export {
  sendJson,
  sendError,
  badRequest,
  unauthorized,
  forbidden,
  internalError,
} from './src/utils';

export { MongooseAdapter, mongooseAdapter } from './src/adapters/mongoose.adapter';
export type { MongooseAdapterOptions } from './src/adapters/mongoose.adapter';

export { createAuthRouter } from './src/routes/auth.routes';

export { authenticate } from './src/middlewares/authenticate.middleware';

export { authorize } from './src/middlewares/authorize.middleware';
