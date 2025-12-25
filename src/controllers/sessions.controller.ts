import { deviceAuth } from '../deviceAuth';
import type { LoginResult } from '../core/auth.service';
import type { AdapterUser } from '../adapters/base.adapter';
import { createAuthService } from '../factories/auth-service.factory';

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

const defaultSessionsController: SessionsController = async (email, password) => {
  const authService = createAuthService();
  const result = await authService.login(email, password);
  return sanitizeLoginResult(result);
};

export const getSessionsController = (): SessionsController => {
  const override = deviceAuth.getControllerOverride<SessionsController>('sessions');
  return override ?? defaultSessionsController;
};
