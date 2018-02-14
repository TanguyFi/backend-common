import { EventEmitter } from 'events';

class Service {
  constructor(serviceName, { logger }) {
    this.serviceName = serviceName;
    this.logger = logger;
    this.bus = new EventEmitter();

    Object.getOwnPropertyNames(this.constructor.prototype).forEach(
      propertyName => {
        const property = this[propertyName];
        if (typeof property === 'function') {
          const f = property.bind(this);
          this[propertyName] = (...args) => {
            const argsView = args.length > 1 ? args : args[0];
            logger.info(`Call ${serviceName}.${propertyName}`, argsView);
            return f(...args);
          };
        }
      },
    );
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
