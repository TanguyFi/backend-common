import { keys } from 'ramda';

function serviceToRoute(serviceFunction) {
  return (req, res, next) => {
    let args;

    if (['GET', 'DELETE'].includes(req.method)) {
      const paramNames = keys(req.params);
      switch (paramNames.length) {
        case 0:
          args = req.body;
          break;
        case 1:
          args = req.params[paramNames[0]];
          break;
        default:
          args = req.params;
      }
    } else if (Array.isArray(req.body)) {
      args = req.body;
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
