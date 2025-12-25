import { deviceAuth, type HookFn } from '../deviceAuth';

export const beforeRegister = (fn: HookFn): void => {
  deviceAuth.registerHook('beforeRegister', fn);
};

export const afterRegister = (fn: HookFn): void => {
  deviceAuth.registerHook('afterRegister', fn);
};

export const beforeLogin = (fn: HookFn): void => {
  deviceAuth.registerHook('beforeLogin', fn);
};

export const afterLogin = (fn: HookFn): void => {
  deviceAuth.registerHook('afterLogin', fn);
};
