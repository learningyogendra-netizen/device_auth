import type { AuthenticatedRequest } from './authenticate.middleware';
import type { AdapterUser } from '../adapters/base.adapter';

interface ResponseLike {
  status(code: number): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json(body: any): this;
}

type NextFunction = () => void;

const getUserRole = (user: AdapterUser): string | null => {
  const role = user['role'];
  if (role == null) return null;
  if (typeof role === 'string') return role;
  return String(role);
};

const sendUnauthorized = (res: ResponseLike): void => {
  res.status(401).json({ error: 'Unauthorized' });
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: ResponseLike, next: NextFunction): void => {
    const fromReq = req.user as AdapterUser | null | undefined;
    const fromSession = req.session?.user as AdapterUser | null | undefined;

    const user = fromReq ?? fromSession ?? null;

    if (!user) {
      sendUnauthorized(res);
      return;
    }

    const userRole = getUserRole(user);

    if (roles.length === 0) {
      next();
      return;
    }

    if (userRole != null && roles.includes(userRole)) {
      next();
      return;
    }

    res.status(403).json({ error: 'Forbidden' });
  };
};
