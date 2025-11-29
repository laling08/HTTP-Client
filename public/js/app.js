/**
 * @fileoverview Main application module for Assignment 2 HTTP Client
 * @description Handles all UI interactions and API calls for Health Services,
 *              Vendor Switches, and TheSportsDB endpoints
 * @module App
 * @author Ishilia Gilcedes V. Labrador (2242125)
 */

import { FetchWrapper, CustomError, NetworkError, ValidationError } from "./fetch-wrapper.js"
import { CONFIG, ENDPOINTS } from "./config.js"
import { showAlert, showErrorList, hideAlert, showLoading, escapeHtml, clearContainer } from "./ui-helpers.js"
import { validateHealthService, validateId, validateSportsDbParams, sanitizeFilters } from "./validators.js"
import { PaginationManager } from "./pagination.js"
import * as bootstrap from "bootstrap"

const wellbeingApi = new FetchWrapper(CONFIG.WELLBEING_API_BASE_URL)
const hw1Api = new FetchWrapper(CONFIG.HW1_API_BASE_URL)

let healthServicesData = []
let vendorSwitchesData = []

const healthServicesPagination = new PaginationManager({
  pageSize: CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  onPageChange: () => renderHealthServicesTable(),
})

const vendorSwitchesPagination = new PaginationManager({
  pageSize: CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  onPageChange: () => renderVendorSwitchesTable(),
})

document.addEventListener("DOMContentLoaded", () => {
  initNavigation()
  initHealthServicesSection()
  initVendorSwitchesSection()
  initSportsDbSection()

  // Load initial data
  fetchHealthServices()
})

// =============================================
// NAVIGATION
// =============================================

/**
 * Initializes navigation between sections
 * Sets up click handlers for nav links to show/hide content sections
 */
function initNavigation() {
  const navLinks = document.querySelectorAll("[data-section]")

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const sectionId = link.dataset.section

      // Update active nav link
      navLinks.forEach((l) => l.classList.remove("active"))
      link.classList.add("active")

      // Show selected section, hide others
      document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.add("d-none")
      })
      document.getElementById(`${sectionId}-section`).classList.remove("d-none")

      // Hide global alert when switching sections
      hideAlert("globalAlert")
    })
  })
}

// =============================================
// HEALTH SERVICES SECTION
// =============================================

/**
 * Initializes the Health Services section event listeners
 * Sets up form submissions for filtering, creating, and deleting health services
 */
function initHealthServicesSection() {
  // Filter form submission
  document.getElementById("healthServicesFilterForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    await fetchHealthServices()
  })

  document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    document.getElementById("filterServiceType").value = ""
    document.getElementById("filterIsFree").value = ""
    document.getElementById("filterHospitalName").value = ""
    fetchHealthServices()
  })

  // Create form submission
  document.getElementById("submitCreateBtn").addEventListener("click", async () => {
    await createHealthService()
  })

  // Delete confirmation
  document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
    const serviceId = document.getElementById("deleteServiceId").value
    await deleteHealthService(serviceId)
  })
}

/**
 * Fetches health services from the API with optional filters
 * Supports filtering by service_type, is_free, and hospital_name
 * @async
 */
async function fetchHealthServices() {
  const tableBody = document.getElementById("healthServicesTableBody")
  showLoading("healthServicesTableBody", "Loading health services...")
  hideAlert("healthServicesAlert")

  try {
    const filters = sanitizeFilters({
      service_type: document.getElementById("filterServiceType").value,
      is_free: document.getElementById("filterIsFree").value,
      hospital_name: document.getElementById("filterHospitalName").value,
    })

    const queryString = new URLSearchParams(filters).toString()
    const uri = queryString ? `${ENDPOINTS.HEALTH_SERVICES}?${queryString}` : ENDPOINTS.HEALTH_SERVICES

    const response = await wellbeingApi.get(uri)

    // Store data for pagination - handle response structure
    healthServicesData = response.data || response || []

    // Setup pagination
    healthServicesPagination.setTotalItems(healthServicesData.length)
    healthServicesPagination.currentPage = 1

    renderHealthServicesTable()
    healthServicesPagination.render("healthServicesPagination")
  } catch (error) {
    handleError(error, "healthServicesAlert")
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to load data</td></tr>`
  }
}

/**
 * Renders the health services table with current page data
 * Displays Health_ServicesID, hospital_name, service_type, is_free, and requirements
 */
function renderHealthServicesTable() {
  const tableBody = document.getElementById("healthServicesTableBody")
  const pageData = healthServicesPagination.getPageData(healthServicesData)

  if (pageData.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    No health services found
                </td>
            </tr>
        `
    return
  }

  tableBody.innerHTML = pageData
    .map(
      (service) => `
        <tr>
            <td>${escapeHtml(String(service.Health_ServicesID))}</td>
            <td>${escapeHtml(service.hospital_name)}</td>
            <td><span class="badge bg-primary badge-category">${escapeHtml(service.service_type)}</span></td>
            <td><span class="badge ${service.is_free == 1 ? "bg-success" : "bg-warning"}">${service.is_free == 1 ? "Free" : "Paid"}</span></td>
            <td>${escapeHtml(service.requirements || "N/A")}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewHealthService(${service.Health_ServicesID})" title="View">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="showDeleteModal(${service.Health_ServicesID})" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")

  healthServicesPagination.render("healthServicesPagination")
}

/**
 * Creates a new health service by sending POST request to the API
 * Validates form data before submission
 * @async
 */
async function createHealthService() {
  hideAlert("createModalAlert")

  const formData = {
    hospital_name: document.getElementById("createHospitalName").value,
    service_type: document.getElementById("createServiceType").value,
    is_free: Number.parseInt(document.getElementById("createIsFree").value),
    requirements: document.getElementById("createRequirements").value,
  }

  // Validate form data
  const validation = validateHealthService(formData)
  if (!validation.isValid) {
    showErrorList("createModalAlert", validation.errors)
    return
  }

  try {
    const response = await wellbeingApi.post(ENDPOINTS.HEALTH_SERVICES, formData)

    // Close modal and show success
    const modal = bootstrap.Modal.getInstance(document.getElementById("createHealthServiceModal"))
    modal.hide()

    // Reset form
    document.getElementById("createHealthServiceForm").reset()

    showAlert(
      "healthServicesAlert",
      '<i class="bi bi-check-circle me-2"></i>Health service created successfully!',
      "success",
    )

    // Refresh the table
    await fetchHealthServices()
  } catch (error) {
    handleError(error, "createModalAlert")
  }
}

/**
 * Deletes a health service by sending DELETE request to the API
 * @async
 * @param {number} serviceId - The ID of the service to delete
 */
async function deleteHealthService(serviceId) {
  try {
    await wellbeingApi.delete(`${ENDPOINTS.HEALTH_SERVICES}/${serviceId}`)

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"))
    modal.hide()

    showAlert(
      "healthServicesAlert",
      '<i class="bi bi-check-circle me-2"></i>Health service deleted successfully!',
      "success",
    )

    // Refresh the table
    await fetchHealthServices()
  } catch (error) {
    // Close modal first
    const modal = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"))
    modal.hide()

    handleError(error, "healthServicesAlert")
  }
}

/**
 * Shows the delete confirmation modal
 * @param {number} serviceId - The ID of the service to delete
 */
window.showDeleteModal = (serviceId) => {
  document.getElementById("deleteServiceId").value = serviceId
  const modal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"))
  modal.show()
}

/**
 * Views a health service details in a modal
 * Fetches single service data and displays all fields
 * @param {number} serviceId - The ID of the service to view
 */
window.viewHealthService = async (serviceId) => {
  const modalBody = document.getElementById("viewHealthServiceBody")
  modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border"></div></div>'

  const modal = new bootstrap.Modal(document.getElementById("viewHealthServiceModal"))
  modal.show()

  try {
    const response = await wellbeingApi.get(`${ENDPOINTS.HEALTH_SERVICES}/${serviceId}`)
    const service = response.data || response

    modalBody.innerHTML = `
            <dl class="row mb-0">
                <dt class="col-sm-4">ID</dt>
                <dd class="col-sm-8">${escapeHtml(String(service.Health_ServicesID))}</dd>

                <dt class="col-sm-4">Hospital Name</dt>
                <dd class="col-sm-8">${escapeHtml(service.hospital_name)}</dd>

                <dt class="col-sm-4">Service Type</dt>
                <dd class="col-sm-8"><span class="badge bg-primary">${escapeHtml(service.service_type)}</span></dd>

                <dt class="col-sm-4">Cost</dt>
                <dd class="col-sm-8"><span class="badge ${service.is_free == 1 ? "bg-success" : "bg-warning"}">${service.is_free == 1 ? "Free" : "Paid"}</span></dd>

                <dt class="col-sm-4">Requirements</dt>
                <dd class="col-sm-8">${escapeHtml(service.requirements || "N/A")}</dd>
            </dl>
        `
  } catch (error) {
    modalBody.innerHTML = `<div class="alert alert-danger mb-0">Failed to load service details</div>`
  }
}

// =============================================
// VENDOR SWITCHES SECTION (Sub-collection)
// =============================================

/**
 * Initializes the Vendor Switches section event listeners
 */
function initVendorSwitchesSection() {
  document.getElementById("vendorSwitchesForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    await fetchVendorSwitches()
  })
}

/**
 * Fetches switches for a specific vendor from the API
 * Endpoint: GET /vendors/{vendor_id}/switches
 * Response structure: { vendor: {...}, meta: {...}, switches: [...] }
 * @async
 */
async function fetchVendorSwitches() {
  const vendorId = document.getElementById("vendorId").value
  const tableBody = document.getElementById("vendorSwitchesTableBody")
  const vendorInfoContainer = document.getElementById("vendorInfoContainer")

  hideAlert("vendorSwitchesAlert")

  // Validate vendor ID
  const validation = validateId(vendorId, "Vendor ID")
  if (!validation.isValid) {
    showErrorList("vendorSwitchesAlert", validation.errors)
    return
  }

  showLoading("vendorSwitchesTableBody", "Loading switches...")

  try {
    const response = await hw1Api.get(`${ENDPOINTS.VENDORS}/${vendorId}${ENDPOINTS.SWITCHES}`)

    const vendorData = response.vendor || null
    vendorSwitchesData = response.switches || response.data || []

    // Display vendor info if available
    if (vendorData) {
      renderVendorInfo(vendorData)
    }

    // Setup pagination using response meta or data length
    const totalItems = response.meta?.total_count || vendorSwitchesData.length
    vendorSwitchesPagination.setTotalItems(totalItems)
    vendorSwitchesPagination.currentPage = 1

    renderVendorSwitchesTable()
    vendorSwitchesPagination.render("vendorSwitchesPagination")
  } catch (error) {
    handleError(error, "vendorSwitchesAlert")
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load data</td></tr>`
    clearContainer("vendorSwitchesPagination")
    clearContainer("vendorInfoContainer")
  }
}

/**
 * Renders vendor information card
 * @param {Object} vendor - The vendor data object
 */
function renderVendorInfo(vendor) {
  const container = document.getElementById("vendorInfoContainer")
  container.innerHTML = `
    <div class="alert alert-info">
      <h6 class="alert-heading mb-2"><i class="bi bi-building me-2"></i>Vendor Information</h6>
      <div class="row">
        <div class="col-md-4"><strong>ID:</strong> ${escapeHtml(String(vendor.vendor_id))}</div>
        <div class="col-md-4"><strong>Name:</strong> ${escapeHtml(vendor.name)}</div>
        <div class="col-md-4"><strong>Country:</strong> ${escapeHtml(vendor.country || "N/A")}</div>
      </div>
    </div>
  `
}

/**
 * Renders the vendor switches table with current page data
 * Switch fields: switch_id, name, type, actuation_force, total_travel, lifespan_million, release_date
 */
function renderVendorSwitchesTable() {
  const tableBody = document.getElementById("vendorSwitchesTableBody")
  const pageData = vendorSwitchesPagination.getPageData(vendorSwitchesData)

  if (pageData.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    No switches found for this vendor
                </td>
            </tr>
        `
    return
  }

  tableBody.innerHTML = pageData
    .map(
      (sw) => `
        <tr>
            <td>${escapeHtml(String(sw.switch_id))}</td>
            <td>${escapeHtml(sw.name)}</td>
            <td><span class="badge bg-secondary">${escapeHtml(sw.type || "N/A")}</span></td>
            <td>${escapeHtml(String(sw.actuation_force || "N/A"))}g</td>
            <td>${escapeHtml(String(sw.total_travel || "N/A"))}mm</td>
            <td>${escapeHtml(String(sw.lifespan_million || "N/A"))}M</td>
            <td>${escapeHtml(sw.release_date || "N/A")}</td>
        </tr>
    `,
    )
    .join("")
  vendorSwitchesPagination.render("vendorSwitchesPagination")
}

// =============================================
// SPORTS DB SECTION (External API)
// =============================================

/**
 * Initializes the TheSportsDB section event listeners
 */
function initSportsDbSection() {
  document.getElementById("sportsDbForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    await fetchSportsDbLeagues()
  })
}

/**
 * Fetches leagues from TheSportsDB API
 * Filters by sport (s) and country (c) parameters
 * URL: https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?s=soccer&c=France
 * @async
 */
async function fetchSportsDbLeagues() {
  const sport = document.getElementById("sportFilter").value
  const country = document.getElementById("countryFilter").value
  const resultsContainer = document.getElementById("sportsDbResults")

  hideAlert("sportsDbAlert")

  // Validate inputs
  const validation = validateSportsDbParams({ sport, country })
  if (!validation.isValid) {
    showErrorList("sportsDbAlert", validation.errors)
    return
  }

  resultsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2">Searching leagues...</p>
        </div>
    `

  try {
    const params = new URLSearchParams()
    if (sport) params.append("s", sport)
    if (country) params.append("c", country)

    const fullUrl = `${CONFIG.SPORTS_DB_API_URL}?${params.toString()}`

    // Make direct fetch call since it's external API
    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new CustomError(`HTTP error! Status: ${response.status}`, response.status)
    }
    const data = await response.json()

    const leagues = data.countries || []

    if (leagues.length === 0) {
      resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5 text-muted">
                    <i class="bi bi-search fs-1"></i>
                    <p class="mt-2">No leagues found for the selected criteria</p>
                </div>
            `
      return
    }

    renderSportsDbResults(leagues)
  } catch (error) {
    handleError(error, "sportsDbAlert")
    resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-exclamation-circle fs-1"></i>
                <p class="mt-2">Failed to load leagues</p>
            </div>
        `
  }
}

/**
 * Renders the TheSportsDB league results as cards
 * League fields: idLeague, strLeague, strSport, strCountry, strBadge, strDescriptionEN, strWebsite
 * @param {Array} leagues - Array of league objects from TheSportsDB API
 */
function renderSportsDbResults(leagues) {
  const resultsContainer = document.getElementById("sportsDbResults")

  resultsContainer.innerHTML = leagues
    .map(
      (league) => `
        <div class="col-md-6 col-lg-4">
            <div class="card league-card h-100">
                <div class="card-body text-center">
                    ${
                      league.strBadge
                        ? `<img src="${escapeHtml(league.strBadge)}" alt="${escapeHtml(league.strLeague)}" class="img-fluid mb-3" style="max-height: 80px;">`
                        : `<i class="bi bi-trophy fs-1 text-muted mb-3"></i>`
                    }
                    <h5 class="card-title">${escapeHtml(league.strLeague)}</h5>
                    <p class="card-text">
                        <span class="badge bg-primary me-1">${escapeHtml(league.strSport || "N/A")}</span>
                        <span class="badge bg-secondary">${escapeHtml(league.strCountry || "N/A")}</span>
                    </p>
                    ${league.intFormedYear ? `<p class="card-text small"><strong>Founded:</strong> ${escapeHtml(league.intFormedYear)}</p>` : ""}
                    ${
                      league.strDescriptionEN
                        ? `<p class="card-text small text-muted">${escapeHtml(league.strDescriptionEN.substring(0, 150))}...</p>`
                        : ""
                    }
                </div>
                ${
                  league.strWebsite
                    ? `<div class="card-footer bg-transparent">
                        <a href="https://${escapeHtml(league.strWebsite)}" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                            <i class="bi bi-globe me-1"></i>Visit Website
                        </a>
                    </div>`
                    : ""
                }
            </div>
        </div>
    `,
    )
    .join("")
}

// =============================================
// ERROR HANDLING
// =============================================

/**
 * Handles errors and displays appropriate messages in Bootstrap alerts
 * Supports CustomError, NetworkError, ValidationError, and generic errors
 * @param {Error} error - The error object
 * @param {string} alertContainerId - The ID of the alert container element
 */
function handleError(error, alertContainerId) {
  console.error("Error:", error)

  if (error instanceof ValidationError) {
    showErrorList(alertContainerId, error.errors)
  } else if (error instanceof CustomError) {
    showAlert(
      alertContainerId,
      `<i class="bi bi-exclamation-circle me-2"></i>${error.message} (Status: ${error.status})`,
      "danger",
    )
  } else if (error instanceof NetworkError) {
    showAlert(alertContainerId, `<i class="bi bi-wifi-off me-2"></i>${error.message}`, "danger")
  } else {
    showAlert(
      alertContainerId,
      `<i class="bi bi-exclamation-circle me-2"></i>An unexpected error occurred: ${error.message}`,
      "danger",
    )
  }
}
