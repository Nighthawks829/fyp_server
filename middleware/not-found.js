// Middleware function to handle 404 errors (Route Not Found)
const notFound = (req, res) => res.status(404).send("Route does not exist");

// Export both middleware functions for use in routes
module.exports = notFound;
