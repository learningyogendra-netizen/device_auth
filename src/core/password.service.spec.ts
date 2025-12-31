import { PasswordService } from './password.service';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('PasswordService', () => {
  const options = { saltRounds: 10 };
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService(options);
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password using bcrypt', async () => {
      const plainPassword = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await passwordService.hashPassword(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, options.saltRounds);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true if passwords match', async () => {
      const plainPassword = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await passwordService.comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      const plainPassword = 'wrongPassword';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await passwordService.comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
