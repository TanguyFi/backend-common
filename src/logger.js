import winston from 'winston';
import { assocPath, path } from 'ramda';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [],
});

const { NODE_ENV, DEBUG } = process.env;
function getLevel() {
  if (DEBUG === 'true') {
    return 'debug';
  }
  return NODE_ENV === 'test' ? 'warn' : 'info';
}

if (NODE_ENV === 'production') {
  logger.add(new winston.transports.Console());
} else {
  logger.add(
    new winston.transports.Console({
      level: getLevel(),
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp(),
      ),
    }),
  );
}

const MASK = '*************';
export function mask(attributes) {
  const maskedAttributes = Array.isArray(attributes)
    ? attributes
    : [attributes];
  return function maskAttributes(input) {
    return maskedAttributes.reduce((obj, attribute) => {
      const attributePath = attribute.split('.');
      return path(attributePath, obj)
        ? assocPath(attributePath, MASK, obj)
        : obj;
    }, input);
  };
}

export function maskArgs(attributes) {
  return function maskAttributesArgs([arg0, ...args]) {
    return [mask(attributes)(arg0), ...args];
  };
}

export default logger;
