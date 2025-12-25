import { deviceAuth } from '../deviceAuth';
import type { AdapterUser } from '../adapters/base.adapter';
import { createAuthService } from '../factories/auth-service.factory';

interface RequestLike {
  headers?: Record<string, unknown>;
  // Optional session object for session-based auth.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any;
}

interface ResponseLike {
  status(code: number): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json(body: any): this;
}

type NextFunction = () => void;

export interface AuthenticatedRequest extends RequestLike {
  user?: AdapterUser | null;
}

const sendUnauthorized = (res: ResponseLike): void => {
  res.status(401).json({ error: 'Unauthorized' });
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: ResponseLike,
  next: NextFunction,
): Promise<void> => {
  const config = deviceAuth.config;

  try {
    if (config.authType === 'jwt') {
      const authHeader = req.headers?.['authorization'];
      if (!authHeader || typeof authHeader !== 'string') {
        sendUnauthorized(res);
        return;
      }

      const [scheme, token] = authHeader.split(' ');
      if (scheme !== 'Bearer' || !token) {
        sendUnauthorized(res);
        return;
      }

      const authService = createAuthService();
      const user = await authService.validateUserFromToken(token);

      if (!user) {
        sendUnauthorized(res);
        return;
      }

      req.user = user;
      next();
      return;
    }

    // Basic session-based auth support: expect req.session.user to be populated by the host app.
    const sessionUser = req.session?.user as AdapterUser | null | undefined;
    if (!sessionUser) {
      sendUnauthorized(res);
      return;
    }

    req.user = sessionUser;
    next();
  } catch (err) {
    sendUnauthorized(res);
  }
};
