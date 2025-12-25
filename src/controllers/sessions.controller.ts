import { deviceAuth } from '../deviceAuth';
import { AuthService, type LoginResult } from '../core/auth.service';
import type { AdapterUser } from '../adapters/base.adapter';
import { PasswordService } from '../core/password.service';
import { TokenService } from '../core/token.service';

export type SessionsController = (email: string, password: string) => Promise<LoginResult>;

const sanitizeUser = (user: AdapterUser): AdapterUser => {
  const { password: _password, ...safeUser } = user as AdapterUser & { password?: unknown };
  return safeUser;
};

const sanitizeLoginResult = (result: LoginResult): LoginResult => {
  return {
    ...result,
    user: sanitizeUser(result.user),
  };
};

const createAuthService = (): AuthService => {
  const config = deviceAuth.config;
  const adapter = deviceAuth.adapter;

  const passwordService = new PasswordService({
    saltRounds: config.password.saltRounds,
  });

  const secret = process.env.DEVICE_AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error(
      'DEVICE_AUTH_JWT_SECRET environment variable is required for JWT authentication. Set DEVICE_AUTH_JWT_SECRET to a strong, random secret in your environment configuration.',
    );
  }

  const tokenService = new TokenService({
    secret,
    expiresIn: config.token.accessTokenTtl,
  });

  return new AuthService({
    adapter,
    config,
    passwordService,
    tokenService,
    runHooks: deviceAuth.runHooks.bind(deviceAuth),
  });
};

const defaultSessionsController: SessionsController = async (email, password) => {
  const authService = createAuthService();
  const result = await authService.login(email, password);
  return sanitizeLoginResult(result);
};

export const getSessionsController = (): SessionsController => {
  const override = deviceAuth.getControllerOverride<SessionsController>('sessions');
  return override ?? defaultSessionsController;
};
