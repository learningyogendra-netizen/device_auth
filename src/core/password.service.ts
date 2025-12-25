import bcrypt from 'bcrypt';

export interface PasswordServiceOptions {
  saltRounds: number;
}

export class PasswordService {
  private readonly saltRounds: number;

  constructor(options: PasswordServiceOptions) {
    this.saltRounds = options.saltRounds;
  }

  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
