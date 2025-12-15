/**
 * @fileoverview FetchWrapper module - A reusable wrapper around the Fetch API
 * @description Provides a clean interface for making HTTP requests with error handling
 * @module FetchWrapper
 */

/**
 * Custom error class for handling application errors
 * @class CustomError
 * @extends Error
 */
class CustomError extends Error {
  /**
   * Creates a new CustomError instance
   * @param {number} status - HTTP status code
   * @param {string} statusText - HTTP status text
   * @param {string} message - Error message
   */
  constructor(status, statusText, message) {
    super(message)
    this.name = "CustomError"
    this.status = status
    this.statusText = statusText
  }
}

/**
 * Custom error class for network-related errors
 * @class NetworkError
 * @extends Error
 */
class NetworkError extends Error {
  /**
   * Creates a new NetworkError instance
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message)
    this.name = "NetworkError"
  }
}

/**
 * Custom error class for validation errors
 * @class ValidationError
 * @extends Error
 */
class ValidationError extends Error {
  /**
   * Creates a new ValidationError instance
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation error messages
   */
  constructor(message, errors = []) {
    super(message)
    this.name = "ValidationError"
    this.errors = errors
  }
}

/**
 * FetchWrapper class - Provides a clean interface for making HTTP requests
 * @class FetchWrapper
 */
class FetchWrapper {
  /**
   * Creates a new FetchWrapper instance
   * @param {string} baseUrl - The base URL for all requests
   * @param {Object} defaultHeaders - Default headers to include in all requests
   */
  constructor(baseUrl = "", defaultHeaders = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = defaultHeaders
  }

  /**
   * Sends an HTTP request using the Fetch API
   * @async
   * @param {string} uri - The URI to send the request to
   * @param {Object} options - Request options (method, headers, body, etc.)
   * @returns {Promise<Object>} The parsed JSON response
   * @throws {CustomError} If the response status is not in the 200-299 range
   * @throws {NetworkError} If there is a network error
   */
  async sendRequest(uri, options = {}) {
    const url = this.baseUrl ? `${this.baseUrl}${uri}` : uri

    // Set default headers
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.defaultHeaders,
    }

    // Merge default headers with provided headers
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // Check if response is successful (status 200-299)
      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`

        // Try to parse error message from response body
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (parseError) {
          // Use default error message if parsing fails
        }

        throw new CustomError(response.status, response.statusText, errorMessage)
      }

      // Parse and return JSON response
      const data = await response.json()
      return data
    } catch (error) {
      // Re-throw CustomError as-is
      if (error instanceof CustomError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError("Network error: Unable to reach the server. Please check your connection.")
      }

      // Handle other errors
      throw new NetworkError(`Request failed: ${error.message}`)
    }
  }

  /**
   * Sends a GET request
   * @async
   * @param {string} uri - The URI to send the request to
   * @param {Object} options - Additional request options
   * @returns {Promise<Object>} The parsed JSON response
   */
  async get(uri, options = {}) {
    return this.sendRequest(uri, {
      ...options,
      method: "GET",
    })
  }

  /**
   * Sends a POST request
   * @async
   * @param {string} uri - The URI to send the request to
   * @param {Object} body - The request body data
   * @param {Object} options - Additional request options
   * @returns {Promise<Object>} The parsed JSON response
   */
  async post(uri, body = {}, options = {}) {
    return this.sendRequest(uri, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  /**
   * Sends a PUT request
   * @async
   * @param {string} uri - The URI to send the request to
   * @param {Object} body - The request body data
   * @param {Object} options - Additional request options
   * @returns {Promise<Object>} The parsed JSON response
   */
  async put(uri, body = {}, options = {}) {
    return this.sendRequest(uri, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  /**
   * Sends a DELETE request
   * @async
   * @param {string} uri - The URI to send the request to
   * @param {Object} options - Additional request options
   * @returns {Promise<Object>} The parsed JSON response
   */
  async delete(uri, options = {}) {
    return this.sendRequest(uri, {
      ...options,
      method: "DELETE",
    })
  }

  /**
   * Sends a PATCH request
   * @async
   * @param {string} uri - The URI to send the request to
   * @param {Object} body - The request body data
   * @param {Object} options - Additional request options
   * @returns {Promise<Object>} The parsed JSON response
   */
  async patch(uri, body = {}, options = {}) {
    return this.sendRequest(uri, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    })
  }
}

window.FetchWrapper = FetchWrapper
window.CustomError = CustomError
window.NetworkError = NetworkError
window.ValidationError = ValidationError
