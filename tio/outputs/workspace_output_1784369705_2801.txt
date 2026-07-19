/**
 * middleware/errorHandler.js
 * Centralised error handler mounted last in the middleware chain.
 *
 * Logs the error and returns a JSON response for API routes or a
 * friendly HTML error page otherwise.
 */

'use strict';

function notFound(req, res) {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err.stack || err.message || err);

  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal server error.'
    });
  }

  res.status(err.status || 500).sendFile(
    require('path').join(__dirname, '..', 'public', '500.html')
  );
}

module.exports = errorHandler;
module.exports.notFound = notFound;
