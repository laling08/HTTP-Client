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
export function showAlert(containerId, message, type = "danger") {
  const container = document.getElementById(containerId)
  if (!container) return

  container.className = `alert alert-${type}`
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
export function showErrorList(containerId, errors) {
  const container = document.getElementById(containerId)
  if (!container) return

  let html = '<strong>Please fix the following errors:</strong><ul class="mb-0 mt-2">'
  errors.forEach((error) => {
    html += `<li>${error}</li>`
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
export function hideAlert(containerId) {
  const container = document.getElementById(containerId)
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
export function showLoading(containerId, message = "Loading...") {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">${message}</p>
        </div>
    `
}

/**
 * Shows an empty state message in the specified container
 * @param {string} containerId - The ID of the container element
 * @param {string} message - The message to display
 */
export function showEmptyState(containerId, message = "No data found.") {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="mt-2 text-muted">${message}</p>
        </div>
    `
}

/**
 * Clears the content of a container
 * @param {string} containerId - The ID of the container element
 */
export function clearContainer(containerId) {
  const container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = ""
  }
}

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
