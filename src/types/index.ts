import type { AdapterUser, BaseAdapter } from '../adapters/base.adapter';
import type { DeviceAuthConfig } from '../config';

export type Role = string;

export interface User extends Record<string, unknown> {
  id?: string | number;
  email?: string;
  password?: string;
  role?: Role;
}

export type Adapter = BaseAdapter;

export type Config = DeviceAuthConfig;
