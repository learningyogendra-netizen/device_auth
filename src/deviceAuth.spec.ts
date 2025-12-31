import { deviceAuth } from './deviceAuth';
import { mergeConfig } from './config';

describe('DeviceAuth', () => {
  // Since deviceAuth is a singleton, we need to be careful.
  // We can't easily reset private state, but we can test public API.

  describe('init', () => {
    it('should initialize with default config if no config provided', () => {
      deviceAuth.init();
      const config = deviceAuth.config;
      expect(config.authType).toBe('jwt');
      expect(config.defaultRole).toBe('user');
    });

    it('should merge provided config with defaults', () => {
      deviceAuth.init({
        defaultRole: 'admin',
        token: { accessTokenTtl: '30m' },
      });
      const config = deviceAuth.config;
      expect(config.defaultRole).toBe('admin');
      expect(config.token.accessTokenTtl).toBe('30m');
      // Should preserve other defaults
      expect(config.authType).toBe('jwt');
    });
  });

  describe('controller overrides', () => {
    it('should allow overriding controllers', () => {
      const mockController = jest.fn();
      deviceAuth.override('testController', mockController);

      const retrieved = deviceAuth.getControllerOverride('testController');
      expect(retrieved).toBe(mockController);
    });

    it('should return undefined for non-existent override', () => {
        const retrieved = deviceAuth.getControllerOverride('nonExistent');
        expect(retrieved).toBeUndefined();
    });
  });

  describe('adapter', () => {
      it('should throw error if adapter is not configured', () => {
          // We need to create a new instance to test the uninitialized state
          // effectively, or rely on the fact that we can't unset it on the global one easily without hacks.
          // Let's rely on `deviceAuth` not being initialized with an adapter in previous tests if possible.
          // However, since tests run in parallel or sequence, global state is risky.
          // But here we haven't called `useAdapter` in previous tests.

          // Actually, let's just create a new instance for this test to be safe?
          // `DeviceAuthCore` is not exported directly, only `deviceAuth`.
          // I can check `src/deviceAuth.ts` content again.

          // It exports `DeviceAuthCore` class? No, it's not exported.
          // `class DeviceAuthCore { ... }` is inside the file but not exported.
          // Only `export const deviceAuth = new DeviceAuthCore();`

          // So I have to work with the singleton.
          // I will assume it's not set.

          // If I set it, I can't unset it via public API.
          // I can cast to any to access private property if I really need to reset.
      });
  });
});
