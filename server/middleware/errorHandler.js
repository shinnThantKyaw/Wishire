export function errorHandler(err, req, res, next) {
  console.error(`[${err.name || "Error"}] ${err.message}`);

  const status = err.status || 500;
  const response = {
    error: err.message || "Internal server error",
  };

  if (err.code) {
    response.code = err.code;
  }

  res.status(status).json(response);
}
