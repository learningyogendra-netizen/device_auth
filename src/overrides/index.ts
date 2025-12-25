import { deviceAuth } from '../deviceAuth';
import type { RegistrationsController } from '../controllers/registrations.controller';
import type { SessionsController } from '../controllers/sessions.controller';

export interface ControllerOverrideConfig {
  registrations?: RegistrationsController;
  sessions?: SessionsController;
}

export const applyControllerOverrides = (config: ControllerOverrideConfig): void => {
  if (config.registrations) {
    deviceAuth.override('registrations', config.registrations);
  }

  if (config.sessions) {
    deviceAuth.override('sessions', config.sessions);
  }
};
