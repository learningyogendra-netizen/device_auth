
export type AuthType = 'jwt' | 'session';

export interface PasswordRulesConfig {
  minLength: number;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface TokenConfig {
  /** e.g. '15m', '1h' */
  accessTokenTtl: string;
}

export interface DeviceAuthConfig {
  signupFields: string[];
  defaultRole: string;
  authType: AuthType;
  password: PasswordRulesConfig;
  token: TokenConfig;
}

export const defaultConfig: DeviceAuthConfig = {
  signupFields: ['email', 'password'],
  defaultRole: 'user',
  authType: 'jwt',
  password: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  token: {
    accessTokenTtl: '15m',
  },
};
