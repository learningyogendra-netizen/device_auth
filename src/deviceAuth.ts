import type { DeviceAuthConfig } from './config';
import { mergeConfig } from './config';
import type { BaseAdapter } from './adapters/base.adapter';

export type HookName =
  | 'beforeRegister'
  | 'afterRegister'
  | 'beforeLogin'
  | 'afterLogin';

export type HookFn = (...args: unknown[]) => unknown | Promise<unknown>;

export interface ControllerOverrides {
  // e.g. registrations, sessions; concrete types will be added later
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [controllerName: string]: any;
}

class DeviceAuthCore {
  private _config: DeviceAuthConfig;
  private _adapter: BaseAdapter | null = null;
  private _hooks: Partial<Record<HookName, HookFn[]>> = {};
  private _controllerOverrides: ControllerOverrides = {};

  constructor() {
    this._config = mergeConfig();
  }

  /** Initialize global configuration (Devise-style initializer). */
  init(config?: Partial<DeviceAuthConfig>): this {
    this._config = mergeConfig(config);
    return this;
  }

  /** Register the database adapter (Prisma, Mongoose, etc.). */
  useAdapter(adapter: BaseAdapter): this {
    this._adapter = adapter;
    return this;
  }

  /** Register a hook callback for a given lifecycle event. */
  registerHook(name: HookName, fn: HookFn): this {
    if (!this._hooks[name]) {
      this._hooks[name] = [];
    }
    this._hooks[name]!.push(fn);
    return this;
  }

  /** Internal: execute all hooks for an event, without breaking core flow. */
  async runHooks(name: HookName, ...args: unknown[]): Promise<void> {
    const fns = this._hooks[name];
    if (!fns || fns.length === 0) return;

    for (const fn of fns) {
      try {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await fn(...args);
      } catch (err) {
        // Intentionally swallow errors to avoid breaking core flow
        // In future we can add optional logging hooks
      }
    }
  }

  /** Register or override controllers (full or partial). */
  override(controllerName: string, implementation: unknown): this {
    this._controllerOverrides[controllerName] = implementation;
    return this;
  }

  /** Get an overridden controller implementation, if any. */
  getControllerOverride<T = unknown>(controllerName: string): T | undefined {
    return this._controllerOverrides[controllerName] as T | undefined;
  }

  /** Expose current config (read-only by convention). */
  get config(): DeviceAuthConfig {
    return this._config;
  }

  /** Expose current adapter. Will throw if not configured. */
  get adapter(): BaseAdapter {
    if (!this._adapter) {
      throw new Error('device_auth adapter is not configured. Call deviceAuth.useAdapter().');
    }
    return this._adapter;
  }
}

export const deviceAuth = new DeviceAuthCore();

export type { DeviceAuthConfig };
