import { deviceAuth } from '../deviceAuth';
import type { SignupResult } from '../core/auth.service';
import type { AdapterUser } from '../adapters/base.adapter';
import { createAuthService } from '../factories/auth-service.factory';

export type RegistrationsController = (data: Record<string, unknown>) => Promise<SignupResult>;

const sanitizeUser = (user: AdapterUser): AdapterUser => {
  const { password: _password, ...safeUser } = user as AdapterUser & { password?: unknown };
  return safeUser;
};

const sanitizeSignupResult = (result: SignupResult): SignupResult => {
  return {
    ...result,
    user: sanitizeUser(result.user),
  };
};

const defaultRegistrationsController: RegistrationsController = async (data) => {
  const authService = createAuthService();
  const result = await authService.signup(data);
  return sanitizeSignupResult(result);
};

export const getRegistrationsController = (): RegistrationsController => {
  const override = deviceAuth.getControllerOverride<RegistrationsController>('registrations');
  return override ?? defaultRegistrationsController;
};
