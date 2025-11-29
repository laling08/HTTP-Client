/**
 * @fileoverview Validation functions for form inputs
 * @description Provides client-side validation for all form inputs before sending API requests
 * @module Validators
 */

/**
 * Validates Health Service form data
 * Validates hospital_name, service_type, is_free, and requirements fields
 * @param {Object} data - The form data to validate
 * @param {string} data.hospital_name - The name of the hospital
 * @param {string} data.service_type - The type of service (child_mental, prenatal, adult, general, other)
 * @param {number} data.is_free - Whether the service is free (1) or paid (0)
 * @param {string} [data.requirements] - Optional requirements for the service
 * @returns {Object} Object with isValid boolean and errors array
 */
function validateHealthService(data) {
  var errors = []

  // Validate hospital name
  if (!data.hospital_name || data.hospital_name.trim() === "") {
    errors.push("Hospital name is required.")
  } else if (data.hospital_name.length < 3) {
    errors.push("Hospital name must be at least 3 characters long.")
  } else if (data.hospital_name.length > 100) {
    errors.push("Hospital name must not exceed 100 characters.")
  }

  // Validate service type
  var validServiceTypes = ["child_mental", "prenatal", "adult", "general", "other"]
  if (!data.service_type || data.service_type.trim() === "") {
    errors.push("Service type is required.")
  } else if (validServiceTypes.indexOf(data.service_type) === -1) {
    errors.push("Invalid service type. Must be one of: child_mental, prenatal, adult, general, other.")
  }

  // Validate is_free
  if (data.is_free === "" || data.is_free === undefined || data.is_free === null) {
    errors.push("Cost (free/paid) selection is required.")
  } else if ([0, 1, "0", "1"].indexOf(data.is_free) === -1) {
    errors.push("Invalid cost selection.")
  }

  // Validate requirements (optional but has max length)
  if (data.requirements && data.requirements.length > 500) {
    errors.push("Requirements must not exceed 500 characters.")
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  }
}

/**
 * Validates a resource ID
 * Ensures the ID is a positive integer
 * @param {string|number} id - The ID to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Object with isValid boolean and errors array
 */
function validateId(id, fieldName) {
  fieldName = fieldName || "ID"
  var errors = []

  if (!id || id === "") {
    errors.push(fieldName + " is required.")
  } else if (isNaN(Number.parseInt(id)) || Number.parseInt(id) <= 0) {
    errors.push(fieldName + " must be a positive number.")
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  }
}

/**
 * Validates TheSportsDB search parameters
 * Requires at least one of sport or country to be provided
 * @param {Object} params - The search parameters
 * @param {string} [params.sport] - The sport to filter by
 * @param {string} [params.country] - The country to filter by
 * @returns {Object} Object with isValid boolean and errors array
 */
function validateSportsDbParams(params) {
  var errors = []

  // At least one filter should be provided
  if ((!params.sport || params.sport.trim() === "") && (!params.country || params.country.trim() === "")) {
    errors.push("Please provide at least a sport or country filter.")
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  }
}

/**
 * Sanitizes filter parameters by removing empty values
 * Trims whitespace from all string values
 * @param {Object} filters - The filter parameters object
 * @returns {Object} Sanitized filter object with only non-empty values
 */
function sanitizeFilters(filters) {
  var sanitized = {}

  for (var key in filters) {
    if (filters.hasOwnProperty(key)) {
      var value = filters[key]
      if (value !== null && value !== undefined && value !== "") {
        sanitized[key] = String(value).trim()
      }
    }
  }

  return sanitized
}

window.validateHealthService = validateHealthService
window.validateId = validateId
window.validateSportsDbParams = validateSportsDbParams
window.sanitizeFilters = sanitizeFilters
