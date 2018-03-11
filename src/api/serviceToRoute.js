import { keys } from 'ramda';

function serviceToRoute(serviceFunction) {
  return (req, res, next) => {
    let args;

    if (['GET', 'DELETE'].includes(req.method)) {
      const paramNames = keys(req.params);
      args = paramNames.length === 1 ? req.params[paramNames[0]] : req.params;
    } else {
      args = {
        ...req.body,
        ...req.params,
      };
    }

    serviceFunction(args, req.context)
      .then(serviceResult => res.json(serviceResult))
      .then(() => next())
      .catch(next);
  };
}

export default serviceToRoute;
