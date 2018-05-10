import uuid from 'uuid';
import { omit } from 'ramda';
import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import { DomainError, ValidationError } from '../errors';

export function addRequestIdMiddleware() {
  return function addRequestId(req, res, next) {
    req.requestId = uuid();
    next();
  };
}

export function errorHandlerMiddleware(logger) {
  const BAD_JSON = 'BAD_JSON';
  return function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      res.statusCode = 400;
      res.json({
        error: {
          message: err.message,
          errorCode: BAD_JSON,
          payload: null,
        },
      });
    } else if (err instanceof DomainError || err instanceof ValidationError) {
      res.statusCode = 400;
      res.json({ error: err.toObject() });
    } else {
      logger.error(err.stack, { requestId: req.requestId });
      res.statusCode = 500;
      res.json({ error: `${req.requestId}` });
    }

    return next();
  };
}

export function logRequestMiddleware(logger) {
  return function logRequest(req, res, next) {
    const startTime = Date.now();
    let responseTime;
    onHeaders(res, () => {
      responseTime = Date.now() - startTime;
    });
    onFinished(res, () => {
      const message = `${res.statusCode} ${req.method} ${req.originalUrl}`;
      const data = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        headers: omit(['cookie', 'authorization'], req.headers),
        responseTime,
      };
      if (res.statusCode === 500) {
        logger.error(message, data);
      } else {
        logger.info(message, data);
      }
    });
    next();
  };
}

export function notFoundMiddleware() {
  return function notFound(req, res) {
    if (!res.headersSent) {
      res.status(404).json({
        error: `${req.method} ${req.originalUrl}: Not found`,
      });
    }
  };
}

export function debug() {
  const DEBUG_THROW_HEADER = 'DEBUG-THROW';
  const DEBUG_DELAY_HEADER = 'DEBUG-DELAY';
  if (process.env.NODE_ENV === 'production') {
    return (req, res, next) => next();
  }

  return function debugMiddleware(req, res, next) {
    const shouldThrow = !!req.get(DEBUG_THROW_HEADER);
    const delayDuration = Number(req.get(DEBUG_DELAY_HEADER) || 0);

    new Promise(resolve => setTimeout(resolve, delayDuration)).then(() => {
      next(shouldThrow ? new Error() : undefined);
    });
  };
}
