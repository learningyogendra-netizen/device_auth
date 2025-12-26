export interface ResponseLike {
  status(code: number): this;
  json(body: unknown): this;
}

export const sendJson = <T>(res: ResponseLike, body: T, statusCode = 200): void => {
  if (statusCode !== 200) {
    res.status(statusCode).json(body);
  } else {
    res.json(body);
  }
};

export const sendError = (
  res: ResponseLike,
  statusCode: number,
  message: string,
): void => {
  res.status(statusCode).json({ error: message });
};

export const badRequest = (res: ResponseLike, message: string): void => {
  sendError(res, 400, message);
};

export const unauthorized = (res: ResponseLike, message = 'Unauthorized'): void => {
  sendError(res, 401, message);
};

export const forbidden = (res: ResponseLike, message = 'Forbidden'): void => {
  sendError(res, 403, message);
};

export const internalError = (
  res: ResponseLike,
  message = 'An unexpected error occurred',
): void => {
  sendError(res, 500, message);
};
