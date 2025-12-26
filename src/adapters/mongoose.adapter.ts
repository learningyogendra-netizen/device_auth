import type { AdapterUser, BaseAdapter, CreateUserData, UpdateUserData } from './base.adapter';

interface MinimalMongooseModel<T = unknown> {
  create(data: Record<string, unknown>): Promise<T>;
  findOne(filter: Record<string, unknown>): { exec(): Promise<T | null> };
  findById(id: unknown): { exec(): Promise<T | null> };
  findByIdAndUpdate(
    id: unknown,
    data: Record<string, unknown>,
    options: { new: boolean },
  ): { exec(): Promise<T | null> };
  findOneAndUpdate(
    filter: Record<string, unknown>,
    data: Record<string, unknown>,
    options: { new: boolean },
  ): { exec(): Promise<T | null> };
}

export interface MongooseAdapterOptions {
  userModel: MinimalMongooseModel;
  idField?: string;
  emailField?: string;
}

export class MongooseAdapter implements BaseAdapter {
  private readonly userModel: MinimalMongooseModel;
  private readonly idField: string;
  private readonly emailField: string;

  constructor(options: MongooseAdapterOptions) {
    this.userModel = options.userModel;
    this.idField = options.idField ?? '_id';
    this.emailField = options.emailField ?? 'email';
  }

  async createUser(data: CreateUserData): Promise<AdapterUser> {
    const doc = await this.userModel.create(data);
    return this.normalize(doc);
  }

  async findUserByEmail(email: string): Promise<AdapterUser | null> {
    const doc = await this.userModel.findOne({ [this.emailField]: email }).exec();
    if (!doc) return null;
    return this.normalize(doc);
  }

  async findUserById(id: string | number): Promise<AdapterUser | null> {
    let doc;
    if (this.idField === '_id') {
      doc = await this.userModel.findById(id).exec();
    } else {
      doc = await this.userModel.findOne({ [this.idField]: id }).exec();
    }
    if (!doc) return null;
    return this.normalize(doc);
  }

  async updateUser(id: string | number, data: UpdateUserData): Promise<AdapterUser> {
    let doc;
    if (this.idField === '_id') {
      doc = await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
    } else {
      doc = await this.userModel
        .findOneAndUpdate({ [this.idField]: id }, data, { new: true })
        .exec();
    }

    if (!doc) {
      throw new Error('User not found');
    }

    return this.normalize(doc);
  }

  private normalize(doc: any): AdapterUser {
    const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

    const adapterUser: AdapterUser = { ...obj };
    const rawId = obj[this.idField];

    if (rawId != null) {
      // Expose a normalized id field expected by core
      adapterUser['id'] =
        typeof rawId === 'string' || typeof rawId === 'number' ? rawId : String(rawId);
    }

    return adapterUser;
  }
}

/**
 * Mongoose adapter factory.
 *
 * You can use either the class-based style:
 *
 * ```ts
 * adapter: new MongooseAdapter({ userModel: User });
 * ```
 *
 * or the function-based style (recommended):
 *
 * ```ts
 * adapter: mongooseAdapter({ userModel: User });
 * ```
 */
export function mongooseAdapter(options: MongooseAdapterOptions): BaseAdapter {
  return new MongooseAdapter(options);
}
