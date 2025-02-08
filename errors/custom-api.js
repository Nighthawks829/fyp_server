// Define a custom error class for API errors
class CustomAPIError extends Error {
  constructor(message) {
    super(message);   // Call the parent class (Error) constructor with the provided message
  }
}

// Export the CustomAPIError class for use in other parts of the application
module.exports = CustomAPIError;
