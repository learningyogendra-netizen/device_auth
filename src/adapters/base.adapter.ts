export type AdapterUser = Record<string, unknown>;

export type CreateUserData = Record<string, unknown>;

export type UpdateUserData = Record<string, unknown>;

/**
 * Base database adapter contract for device_auth.
 *
 * This interface is intentionally DB-agnostic and contains no ORM types
 * or database-specific logic. Concrete adapters (Prisma, Mongoose, SQL, etc.)
 * must implement this contract so that device_auth can talk to any backend
 * in a uniform way.
 */
export interface BaseAdapter {
  /** Create a new user record. */
  createUser(data: CreateUserData): Promise<AdapterUser>;

  /** Look up a user by email, or return null if not found. */
  findUserByEmail(email: string): Promise<AdapterUser | null>;

  /** Look up a user by primary identifier, or return null if not found. */
  findUserById(id: string | number): Promise<AdapterUser | null>;

  /** Update an existing user and return the updated record. */
  updateUser(id: string | number, data: UpdateUserData): Promise<AdapterUser>;
}
