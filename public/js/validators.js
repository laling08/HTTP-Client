/**
 * @fileoverview Validation functions for form inputs
 * @description Provides client-side validation for all form inputs before sending API requests
 * @module Validators
 * @author Ishilia Gilcedes V. Labrador (2242125)
 */

import { ValidationError } from "./fetch-wrapper.js"

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
export function validateHealthService(data) {
  const errors = []

  // Validate hospital name
  if (!data.hospital_name || data.hospital_name.trim() === "") {
    errors.push("Hospital name is required.")
  } else if (data.hospital_name.length < 3) {
    errors.push("Hospital name must be at least 3 characters long.")
  } else if (data.hospital_name.length > 100) {
    errors.push("Hospital name must not exceed 100 characters.")
  }

  // Validate service type
  const validServiceTypes = ["child_mental", "prenatal", "adult", "general", "other"]
  if (!data.service_type || data.service_type.trim() === "") {
    errors.push("Service type is required.")
  } else if (!validServiceTypes.includes(data.service_type)) {
    errors.push("Invalid service type. Must be one of: child_mental, prenatal, adult, general, other.")
  }

  // Validate is_free
  if (data.is_free === "" || data.is_free === undefined || data.is_free === null) {
    errors.push("Cost (free/paid) selection is required.")
  } else if (![0, 1, "0", "1"].includes(data.is_free)) {
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
export function validateId(id, fieldName = "ID") {
  const errors = []

  if (!id || id === "") {
    errors.push(`${fieldName} is required.`)
  } else if (isNaN(Number.parseInt(id)) || Number.parseInt(id) <= 0) {
    errors.push(`${fieldName} must be a positive number.`)
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
export function validateSportsDbParams(params) {
  const errors = []

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
export function sanitizeFilters(filters) {
  const sanitized = {}

  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== "") {
      sanitized[key] = String(value).trim()
    }
  }

  return sanitized
}

/**
 * Throws a ValidationError if validation fails
 * Utility function to convert validation results to exceptions
 * @param {Object} validationResult - Result from validation function
 * @param {boolean} validationResult.isValid - Whether validation passed
 * @param {Array<string>} validationResult.errors - Array of error messages
 * @throws {ValidationError} If validation failed
 */
export function throwIfInvalid(validationResult) {
  if (!validationResult.isValid) {
    throw new ValidationError("Validation failed", validationResult.errors)
  }
}
