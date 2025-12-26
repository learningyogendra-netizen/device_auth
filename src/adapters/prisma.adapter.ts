import type { AdapterUser, BaseAdapter, CreateUserData, UpdateUserData } from './base.adapter';

export interface PrismaDelegate<TUser> {
  create(args: { data: Record<string, unknown> }): Promise<TUser>;
  findUnique(args: { where: Record<string, unknown> }): Promise<TUser | null>;
  update(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<TUser>;
}

export interface PrismaAdapterOptions<TUser extends Record<string, unknown>> {
  userDelegate: PrismaDelegate<TUser>;
  idField?: string;
  emailField?: string;
}

export class PrismaAdapter<TUser extends Record<string, unknown>> implements BaseAdapter {
  private readonly userDelegate: PrismaDelegate<TUser>;
  private readonly idField: string;
  private readonly emailField: string;

  constructor(options: PrismaAdapterOptions<TUser>) {
    this.userDelegate = options.userDelegate;
    this.idField = options.idField ?? 'id';
    this.emailField = options.emailField ?? 'email';
  }

  async createUser(data: CreateUserData): Promise<AdapterUser> {
    const user = await this.userDelegate.create({ data });
    return this.normalize(user);
  }

  async findUserByEmail(email: string): Promise<AdapterUser | null> {
    const user = await this.userDelegate.findUnique({ where: { [this.emailField]: email } });
    if (!user) return null;
    return this.normalize(user);
  }

  async findUserById(id: string | number): Promise<AdapterUser | null> {
    const user = await this.userDelegate.findUnique({ where: { [this.idField]: id } });
    if (!user) return null;
    return this.normalize(user);
  }

  async updateUser(id: string | number, data: UpdateUserData): Promise<AdapterUser> {
    const user = await this.userDelegate.update({ where: { [this.idField]: id }, data });
    return this.normalize(user);
  }

  private normalize(user: TUser): AdapterUser {
    const adapterUser: AdapterUser = { ...user };
    const rawId = (user as Record<string, unknown>)[this.idField];

    if (rawId != null) {
      adapterUser['id'] =
        typeof rawId === 'string' || typeof rawId === 'number' ? rawId : String(rawId);
    }

    return adapterUser;
  }
}
