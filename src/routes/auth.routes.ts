import { Router, type Request, type Response, type NextFunction } from 'express';
import { getRegistrationsController } from '../controllers/registrations.controller';
import { getSessionsController } from '../controllers/sessions.controller';

export const createAuthRouter = (): Router => {
  const router = Router();

  const registrationsController = getRegistrationsController();
  const sessionsController = getSessionsController();

  router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body ?? {};

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid signup payload' });
      }

      const result = await registrationsController(data);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ error: message });
    }
  });

  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body ?? {};

      if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Invalid login payload' });
      }

      const result = await sessionsController(email, password);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ error: message });
    }
  });

  return router;
};
