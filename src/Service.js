import { EventEmitter } from 'events';
import { without } from 'ramda';

class Service {
  constructor(serviceName, { logger }, logConfig = {}) {
    this.serviceName = serviceName;
    this.logger = logger;
    this.logConfig = logConfig;
    this.bus = new EventEmitter();

    without(
      ['init'],
      Object.getOwnPropertyNames(this.constructor.prototype),
    ).forEach(propertyName => {
      const property = this[propertyName];
      if (typeof property === 'function') {
        const f = property.bind(this);
        this[propertyName] = (...args) => {
          const defaultArgView = args.length > 1 ? args : args[0];
          const argsView = logConfig[propertyName]
            ? logConfig[propertyName](args)
            : defaultArgView;
          logger.info(`Call ${serviceName}.${propertyName}`, argsView);
          return f(...args);
        };
      }
    });
  }

  dispatch(event) {
    this.logger.info(`<== ${event.entityType}/${event.type}`, event);
    this.bus.emit('event', event);
  }

  onEvent(listener) {
    this.bus.on('event', listener);
  }
}

export default Service;
