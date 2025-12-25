import jwt, { JwtPayload } from 'jsonwebtoken';

export interface TokenServiceOptions {
  secret: string;
  expiresIn: string;
}

export interface AccessTokenPayload {
  sub: string | number;
  [key: string]: unknown;
}

export class TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(options: TokenServiceOptions) {
    this.secret = options.secret;
    this.expiresIn = options.expiresIn;
  }

  generateAccessToken(payload: AccessTokenPayload): string {
    // Casts are used here to avoid tight coupling to jsonwebtoken's type overloads,
    // while preserving correct runtime behavior.
    return (jwt as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sign: (payload: any, secret: any, options?: any) => string;
    }).sign(payload as JwtPayload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, this.secret);
    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload type');
    }
    return decoded as AccessTokenPayload;
  }
}
