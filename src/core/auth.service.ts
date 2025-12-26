import type { BaseAdapter, AdapterUser, CreateUserData } from '../adapters/base.adapter';
import type { DeviceAuthConfig } from '../config';
import type { HookName } from '../deviceAuth';
import type { PasswordService } from './password.service';
import type { TokenService, AccessTokenPayload } from './token.service';

export interface AuthServiceDeps {
  adapter: BaseAdapter;
  config: DeviceAuthConfig;
  passwordService: PasswordService;
  tokenService: TokenService;
  runHooks: (name: HookName, ...args: unknown[]) => Promise<void>;
}

export interface SignupResult {
  user: AdapterUser;
  accessToken?: string;
}

export interface LoginResult {
  user: AdapterUser;
  accessToken?: string;
}

export class AuthService {
  private readonly adapter: BaseAdapter;
  private readonly config: DeviceAuthConfig;
  private readonly passwordService: PasswordService;
  private readonly tokenService: TokenService;
  private readonly runHooks: (name: HookName, ...args: unknown[]) => Promise<void>;

  constructor(deps: AuthServiceDeps) {
    this.adapter = deps.adapter;
    this.config = deps.config;
    this.passwordService = deps.passwordService;
    this.tokenService = deps.tokenService;
    this.runHooks = deps.runHooks;
  }

  async signup(data: Record<string, unknown>): Promise<SignupResult> {
    this.ensureSignupFields(data);

    const password = data['password'];
    if (typeof password !== 'string') {
      throw new Error('Password is required and must be a string');
    }

    this.ensurePasswordRules(password);

    const hashedPassword = await this.passwordService.hashPassword(password);

    const createData: CreateUserData = {
      ...data,
      password: hashedPassword,
    };

    if (createData['role'] == null) {
      createData['role'] = this.config.defaultRole;
    }

    await this.runHooks('beforeRegister', createData);
    const user = await this.adapter.createUser(createData);
    await this.runHooks('afterRegister', user);

    if (this.config.authType === 'jwt') {
      const accessToken = this.issueAccessTokenFromUser(user);
      return { user, accessToken };
    }

    return { user };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.adapter.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const storedPassword = user['password'];
    if (typeof storedPassword !== 'string') {
      throw new Error('Invalid user password configuration');
    }

    await this.runHooks('beforeLogin', user);

    const isValid = await this.passwordService.comparePassword(password, storedPassword);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    await this.runHooks('afterLogin', user);

    if (this.config.authType === 'jwt') {
      const accessToken = this.issueAccessTokenFromUser(user);
      return { user, accessToken };
    }

    return { user };
  }

  async logout(): Promise<void> {
    return;
  }

  async validateUserFromToken(token: string): Promise<AdapterUser | null> {
    if (this.config.authType !== 'jwt') {
      throw new Error('Token-based validation is only available for jwt authType');
    }

    const payload = this.tokenService.verifyToken(token) as AccessTokenPayload;
    const userId = payload.sub;
    if (userId == null) {
      throw new Error('Token payload missing subject');
    }

    const user = await this.adapter.findUserById(userId);

    if (user) {
      const mutableUser = user as Record<string, unknown>;

      if (mutableUser['id'] == null) {
        mutableUser['id'] = userId;
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'role')) {
        mutableUser['role'] = payload['role'];
      }
    }

    return user;
  }

  private ensureSignupFields(data: Record<string, unknown>): void {
    for (const field of this.config.signupFields) {
      if (data[field] == null) {
        throw new Error(`Missing required signup field: ${field}`);
      }
    }
  }

  private ensurePasswordRules(password: string): void {
    const rules = this.config.password;

    if (password.length < rules.minLength) {
      throw new Error('Password does not meet minimum length requirement');
    }

    if (rules.requireNumbers && !/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  private issueAccessTokenFromUser(user: AdapterUser): string {
    const userId = user['id'];
    if (userId == null) {
      throw new Error('User record does not contain an id field');
    }

    const role = user['role'] ?? null;

    const payload: AccessTokenPayload = {
      sub: userId as string | number,
      role,
    };

    return this.tokenService.generateAccessToken(payload);
  }
}
