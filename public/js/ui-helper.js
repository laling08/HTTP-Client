/**
 * @fileoverview UI Helper functions for DOM manipulation and alerts
 * @description Provides utility functions for showing alerts and updating UI elements
 * @module UIHelpers
 */

/**
 * Shows a Bootstrap alert with the specified message and type
 * @param {string} containerId - The ID of the alert container element
 * @param {string} message - The message to display
 * @param {string} type - The alert type ('success', 'danger', 'warning', 'info')
 */
function showAlert(containerId, message, type) {
  type = type || "danger"
  var container = document.getElementById(containerId)
  if (!container) return

  container.className = "alert alert-" + type
  container.innerHTML = message
  container.classList.remove("d-none")

  // Auto-hide success alerts after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      hideAlert(containerId)
    }, 5000)
  }
}

/**
 * Shows multiple error messages in an alert
 * @param {string} containerId - The ID of the alert container element
 * @param {Array<string>} errors - Array of error messages
 */
function showErrorList(containerId, errors) {
  var container = document.getElementById(containerId)
  if (!container) return

  var html = '<strong>Please fix the following errors:</strong><ul class="mb-0 mt-2">'
  errors.forEach((error) => {
    html += "<li>" + error + "</li>"
  })
  html += "</ul>"

  container.className = "alert alert-danger"
  container.innerHTML = html
  container.classList.remove("d-none")
}

/**
 * Hides the specified alert container
 * @param {string} containerId - The ID of the alert container element
 */
function hideAlert(containerId) {
  var container = document.getElementById(containerId)
  if (container) {
    container.classList.add("d-none")
    container.innerHTML = ""
  }
}

/**
 * Shows a loading spinner in the specified container
 * @param {string} containerId - The ID of the container element
 * @param {string} message - Optional loading message
 */
function showLoading(containerId, message) {
  message = message || "Loading..."
  var container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML =
    "<tr>" +
    '<td colspan="10" class="text-center py-5">' +
    '<div class="spinner-border text-primary" role="status">' +
    '<span class="visually-hidden">Loading...</span>' +
    "</div>" +
    '<p class="mt-2 text-muted">' +
    message +
    "</p>" +
    "</td>" +
    "</tr>"
}

/**
 * Shows an empty state message in the specified container
 * @param {string} containerId - The ID of the container element
 * @param {string} message - The message to display
 * @param {number} colspan - Number of columns to span
 */
function showEmptyState(containerId, message, colspan) {
  message = message || "No data found."
  colspan = colspan || 6
  var container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML =
    "<tr>" +
    '<td colspan="' +
    colspan +
    '" class="text-center py-5">' +
    '<i class="bi bi-inbox fs-1 text-muted"></i>' +
    '<p class="mt-2 text-muted">' +
    message +
    "</p>" +
    "</td>" +
    "</tr>"
}

/**
 * Clears the content of a container
 * @param {string} containerId - The ID of the container element
 */
function clearContainer(containerId) {
  var container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = ""
  }
}

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return ""
  var div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

window.showAlert = showAlert
window.showErrorList = showErrorList
window.hideAlert = hideAlert
window.showLoading = showLoading
window.showEmptyState = showEmptyState
window.clearContainer = clearContainer
window.escapeHtml = escapeHtml
