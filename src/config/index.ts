import { defaultConfig, type DeviceAuthConfig } from './default.config';

// Merge user config with defaults, including nested objects we know about
export const mergeConfig = (
  userConfig?: Partial<DeviceAuthConfig>,
): DeviceAuthConfig => {
  if (!userConfig) return { ...defaultConfig };

  return {
    ...defaultConfig,
    ...userConfig,
    password: {
      ...defaultConfig.password,
      ...(userConfig.password ?? {}),
    },
    token: {
      ...defaultConfig.token,
      ...(userConfig.token ?? {}),
    },
  };
};

export type { DeviceAuthConfig };
export { defaultConfig };
