import { TokenService } from './token.service';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('TokenService', () => {
  const options = {
    secret: 'test-secret',
    expiresIn: '1h',
  };
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService(options);
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a token with correct payload and options', () => {
      const payload = { sub: '123', role: 'user' };
      const expectedToken = 'generated-token';

      (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

      const result = tokenService.generateAccessToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, options.secret, {
        expiresIn: options.expiresIn,
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return decoded payload', () => {
      const token = 'valid-token';
      const decoded = { sub: '123', role: 'user' };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      const result = tokenService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, options.secret);
      expect(result).toEqual(decoded);
    });

    it('should throw error if verified payload is a string', () => {
      const token = 'valid-token-string-payload';

      (jwt.verify as jest.Mock).mockReturnValue('some string');

      expect(() => tokenService.verifyToken(token)).toThrow('Invalid token payload type');
    });

    it('should throw error if verification fails', () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => tokenService.verifyToken(token)).toThrow(error);
    });
  });
});
