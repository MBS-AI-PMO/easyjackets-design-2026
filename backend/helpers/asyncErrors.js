import Layer from 'express/lib/router/layer.js';

// Express 4 only passes on errors a handler throws synchronously. When an async handler's promise is rejected
// (a database error, a malformed id), the request was never answered and hung until the client gave up. This
// wraps every route handler once, at start-up, so a rejected promise goes to the error handler in server.mjs
// like any other error. (What the small express-async-errors package does, without another dependency.)
let installed = false;

export const answerAsyncErrors = () => {
  if (installed) return;
  installed = true;
  const original = Layer.prototype.handle_request;
  Layer.prototype.handle_request = function handleRequest(req, res, next) {
    const fn = this.handle;
    // error handlers (4 arguments) are handled by Express itself
    if (fn.length > 3) return original.call(this, req, res, next);
    try {
      const result = fn(req, res, next);
      if (result && typeof result.catch === 'function') {
        result.catch((error) => next(error || new Error('Request failed')));
      }
    } catch (error) {
      next(error);
    }
    return undefined;
  };
};
