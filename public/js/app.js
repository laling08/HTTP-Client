/**
 * @fileoverview Main application module for Assignment 2 HTTP Client
 * @description Handles all UI interactions and API calls for Health Services,
 *              Vendor Switches, and TheSportsDB endpoints
 * @module App
 * @author Ishilia Gilcedes V.Labrador (2242125)
 */

console.log("[hewo] app.js loading...")

// Initialize FetchWrapper instances for each API
var wellbeingApi = new window.FetchWrapper(window.CONFIG.WELLBEING_API_BASE_URL, {
  Authorization: "Bearer " + window.CONFIG.WELLBEING_API_TOKEN,
})
var hw1Api = new window.FetchWrapper(window.CONFIG.HW1_API_BASE_URL)

// Store fetched data for client-side pagination
var healthServicesData = []
var vendorSwitchesData = []

// Initialize pagination managers
var healthServicesPagination = new window.PaginationManager({
  pageSize: window.CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  onPageChange: () => {
    renderHealthServicesTable()
  },
})

var vendorSwitchesPagination = new window.PaginationManager({
  pageSize: window.CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  onPageChange: () => {
    renderVendorSwitchesTable()
  },
})

// Declare bootstrap variable
var bootstrap = window.bootstrap

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("[hewo] Initializing application...")

  var modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.addEventListener("hide.bs.modal", () => {
      // Remove focus from any element inside the modal before hiding
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.activeElement.blur()
      }
    })
  })

  // Initialize navigation
  initializeNavigation()
  initializeHealthServicesHandlers()
  initializeVendorSwitchesHandlers()
  initializeSportsDbHandlers()

  // Load initial data for health services
  fetchHealthServices()
})

/**
 * Initializes navigation between sections
 */
function initializeNavigation() {
  var navLinks = document.querySelectorAll("[data-section]")
  var sections = document.querySelectorAll(".content-section")

  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function (e) {
      e.preventDefault()
      var targetSection = this.getAttribute("data-section")

      // Update active nav link
      for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].classList.remove("active")
      }
      this.classList.add("active")

      // Show target section, hide others
      for (var k = 0; k < sections.length; k++) {
        if (sections[k].id === targetSection + "-section") {
          sections[k].classList.remove("d-none")
        } else {
          sections[k].classList.add("d-none")
        }
      }
    })
  }
}

// ============================================================================
// HEALTH SERVICES (Collection Resource)
// ============================================================================

/**
 * Initializes event handlers for Health Services section
 */
function initializeHealthServicesHandlers() {
  // Filter form submission
  var filterForm = document.getElementById("healthServicesFilterForm")
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      fetchHealthServices()
    })
  }

  // Clear filters button
  var clearBtn = document.getElementById("clearFiltersBtn")
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("filterServiceType").value = ""
      document.getElementById("filterIsFree").value = ""
      document.getElementById("filterHospitalName").value = ""
      fetchHealthServices()
    })
  }

  // Create button
  var submitCreateBtn = document.getElementById("submitCreateBtn")
  if (submitCreateBtn) {
    submitCreateBtn.addEventListener("click", () => {
      createHealthService()
    })
  }

  // Edit button
  var submitEditBtn = document.getElementById("submitEditBtn")
  if (submitEditBtn) {
    submitEditBtn.addEventListener("click", () => {
      updateHealthService()
    })
  }

  // Delete confirmation button
  var confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      deleteHealthService()
    })
  }
}

/**
 * Fetches health services from the API with optional filters
 * Fetches ALL pages from server for client-side pagination
 * @async
 * @function fetchHealthServices
 * @returns {Promise<void>}
 */
async function fetchHealthServices() {
  console.log("[hewo] Fetching health services...")
  window.showLoading("healthServicesTableBody", "Loading health services...")
  window.hideAlert("healthServicesAlert")

  try {
    // Get filter values
    var filters = window.sanitizeFilters({
      service_type: document.getElementById("filterServiceType").value,
      is_free: document.getElementById("filterIsFree").value,
      hospital_name: document.getElementById("filterHospitalName").value,
    })

    var allRecords = []
    var currentPage = 1
    var totalPages = 1

    // Fetch first page to get pagination info
    var endpoint = window.ENDPOINTS.HEALTH_SERVICES
    var queryParams = new URLSearchParams(filters)
    queryParams.set("page", currentPage)
    var firstPageEndpoint = endpoint + "?" + queryParams.toString()

    console.log("[hewo] Fetching first page:", firstPageEndpoint)
    var response = await wellbeingApi.get(firstPageEndpoint)
    console.log("[hewo] First page response:", response)

    // Extract data from response
    if (response && response.data && Array.isArray(response.data)) {
      allRecords = allRecords.concat(response.data)
    }

    // Get total pages from pagination metadata
    if (response && response.pagination) {
      totalPages = response.pagination.total_pages || response.pagination.last_page || 1
      console.log("[hewo] Total pages from API:", totalPages)
    }

    // Fetch remaining pages if there are more
    for (var page = 2; page <= totalPages; page++) {
      queryParams.set("page", page)
      var pageEndpoint = endpoint + "?" + queryParams.toString()
      console.log("[hewo] Fetching page " + page + ":", pageEndpoint)

      var pageResponse = await wellbeingApi.get(pageEndpoint)
      if (pageResponse && pageResponse.data && Array.isArray(pageResponse.data)) {
        allRecords = allRecords.concat(pageResponse.data)
      }
    }

    healthServicesData = allRecords
    console.log("[hewo] Total health services loaded:", healthServicesData.length)

    // Set pagination with total items
    healthServicesPagination.setTotalItems(healthServicesData.length)
    healthServicesPagination.currentPage = 1

    // Render table
    renderHealthServicesTable()
  } catch (error) {
    console.error("[hewo] Error fetching health services:", error)
    if (error instanceof window.CustomError) {
      window.showAlert("healthServicesAlert", "Error " + error.status + ": " + error.message, "danger")
    } else if (error instanceof window.NetworkError) {
      window.showAlert("healthServicesAlert", error.message, "danger")
    } else {
      window.showAlert("healthServicesAlert", "An unexpected error occurred while fetching health services.", "danger")
    }
    window.showEmptyState("healthServicesTableBody", "Failed to load health services.", 6)
  }
}

/**
 * Renders the health services table with current page data
 */
function renderHealthServicesTable() {
  var tableBody = document.getElementById("healthServicesTableBody")

  if (!healthServicesData || healthServicesData.length === 0) {
    window.showEmptyState("healthServicesTableBody", "No health services found.", 6)
    window.clearContainer("healthServicesPagination")
    return
  }

  // Get current page data
  var pageData = healthServicesPagination.getPageData(healthServicesData)

  var html = ""
  for (var i = 0; i < pageData.length; i++) {
    var service = pageData[i]
    var isFree = service.is_free == 1 || service.is_free === true
    var serviceId = service.Health_ServicesID || service.id
    html +=
      "<tr>" +
      "<td>" +
      window.escapeHtml(serviceId) +
      "</td>" +
      "<td>" +
      window.escapeHtml(service.hospital_name) +
      "</td>" +
      '<td><span class="badge bg-secondary">' +
      window.escapeHtml(service.service_type) +
      "</span></td>" +
      '<td><span class="badge ' +
      (isFree ? "bg-success" : "bg-warning text-dark") +
      '">' +
      (isFree ? "Free" : "Paid") +
      "</span></td>" +
      "<td>" +
      window.escapeHtml(service.requirements || "-") +
      "</td>" +
      '<td class="action-column">' +
      '<button class="btn btn-sm btn-outline-info me-1" onclick="viewHealthService(' +
      serviceId +
      ')" title="View">' +
      '<i class="bi bi-eye"></i></button>' +
      '<button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(' +
      serviceId +
      ')" title="Edit">' +
      '<i class="bi bi-pencil-square"></i></button>' +
      '<button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(' +
      serviceId +
      ')" title="Delete">' +
      '<i class="bi bi-trash"></i></button>' +
      "</td></tr>"
  }

  tableBody.innerHTML = html

  // Render pagination
  healthServicesPagination.render("healthServicesPagination")
}

/**
 * Creates a new health service
 * @async
 */
async function createHealthService() {
  window.hideAlert("createModalAlert")

  // Get form data
  var data = {
    hospital_name: document.getElementById("createHospitalName").value,
    service_type: document.getElementById("createServiceType").value,
    is_free: document.getElementById("createIsFree").value,
    requirements: document.getElementById("createRequirements").value,
  }

  // Validate
  var validation = window.validateHealthService(data)
  if (!validation.isValid) {
    window.showErrorList("createModalAlert", validation.errors)
    return
  }

  try {
    var response = await wellbeingApi.post(window.ENDPOINTS.HEALTH_SERVICES, [data])

    // Close modal
    var modal = bootstrap.Modal.getInstance(document.getElementById("createHealthServiceModal"))
    modal.hide()

    // Reset form
    document.getElementById("createHealthServiceForm").reset()

    // Show success message
    window.showAlert("healthServicesAlert", "Health service created successfully!", "success")

    // Refresh table
    await fetchHealthServices()
  } catch (error) {
    console.log("[hewo] Error creating health service:", error)
    window.showAlert("createModalAlert", error.message || "Failed to create health service.", "danger")
  }
}

/**
 * Opens the delete confirmation modal
 * @param {number} id - The ID of the health service to delete
 */
function confirmDelete(id) {
  document.getElementById("deleteServiceId").value = id
  var modal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"))
  modal.show()
}

/**
 * Deletes a health service
 * @async
 */
async function deleteHealthService() {
  var id = document.getElementById("deleteServiceId").value

  // Validate ID
  var validation = window.validateId(id, "Service ID")
  if (!validation.isValid) {
    window.showAlert("healthServicesAlert", validation.errors[0], "danger")
    return
  }

  try {
    // Send DELETE request
    await wellbeingApi.delete(window.ENDPOINTS.HEALTH_SERVICES + "/" + id)

    // Close modal
    var modal = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"))
    modal.hide()

    // Show success message
    window.showAlert("healthServicesAlert", "Health service deleted successfully!", "success")

    // Refresh table
    await fetchHealthServices()
  } catch (error) {
    console.error("[hewo] Error deleting health service:", error)

    // Close modal first
    var modalInstance = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"))
    modalInstance.hide()

    if (error instanceof window.CustomError) {
      window.showAlert("healthServicesAlert", "Error " + error.status + ": " + error.message, "danger")
    } else if (error instanceof window.NetworkError) {
      window.showAlert("healthServicesAlert", error.message, "danger")
    } else {
      window.showAlert("healthServicesAlert", "An unexpected error occurred while deleting.", "danger")
    }
  }
}

/**
 * Views a single health service details
 * @async
 * @param {number} id - The ID of the health service to view
 */
async function viewHealthService(id) {
  try {
    var response = await wellbeingApi.get(window.ENDPOINTS.HEALTH_SERVICES + "/" + id)
    var service = response.health_service || response.data || response

    var isFree = service.is_free == 1 || service.is_free === true
    var modalBody = document.getElementById("viewHealthServiceBody")
    modalBody.innerHTML =
      '<div class="row">' +
      '<div class="col-md-6 mb-3"><strong>ID:</strong><br>' +
      window.escapeHtml(service.Health_ServicesID || service.id) +
      "</div>" +
      '<div class="col-md-6 mb-3"><strong>Hospital Name:</strong><br>' +
      window.escapeHtml(service.hospital_name) +
      "</div>" +
      '<div class="col-md-6 mb-3"><strong>Service Type:</strong><br><span class="badge bg-secondary">' +
      window.escapeHtml(service.service_type) +
      "</span></div>" +
      '<div class="col-md-6 mb-3"><strong>Cost:</strong><br><span class="badge ' +
      (isFree ? "bg-success" : "bg-warning text-dark") +
      '">' +
      (isFree ? "Free" : "Paid") +
      "</span></div>" +
      '<div class="col-12 mb-3"><strong>Requirements:</strong><br>' +
      window.escapeHtml(service.requirements || "None specified") +
      "</div>" +
      "</div>"

    var modal = new bootstrap.Modal(document.getElementById("viewHealthServiceModal"))
    modal.show()
  } catch (error) {
    console.error("[hewo] Error viewing health service:", error)
    if (error instanceof window.CustomError) {
      window.showAlert("healthServicesAlert", "Error " + error.status + ": " + error.message, "danger")
    } else {
      window.showAlert("healthServicesAlert", "Failed to load health service details.", "danger")
    }
  }
}

// ============================================================================
// VENDOR SWITCHES (Sub-collection)
// ============================================================================

/**
 * Initializes event handlers for Vendor Switches section
 */
function initializeVendorSwitchesHandlers() {
  var form = document.getElementById("vendorSwitchesForm")
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      fetchVendorSwitches()
    })
  }
}

/**
 * Fetches switches for a specific vendor
 * @async
 */
async function fetchVendorSwitches() {
  var vendorId = document.getElementById("vendorId").value
  window.hideAlert("vendorSwitchesAlert")

  // Validate vendor ID
  var validation = window.validateId(vendorId, "Vendor ID")
  if (!validation.isValid) {
    window.showErrorList("vendorSwitchesAlert", validation.errors)
    return
  }

  window.showLoading("vendorSwitchesTableBody", "Loading switches...")
  window.clearContainer("vendorInfoContainer")

  try {
    // Fetch switches for the vendor - using /vendors/{id}/switches
    var endpoint = window.ENDPOINTS.VENDORS + "/" + vendorId + window.ENDPOINTS.SWITCHES
    console.log("[hewo] Fetching vendor switches from:", endpoint)

    var response = await hw1Api.get(endpoint)
    console.log("[hewo] Vendor switches response:", response)

    // Display vendor info if available
    if (response.vendor) {
      renderVendorInfo(response.vendor)
    }

    // Get switches array from response
    vendorSwitchesData = response.switches || response.data || response || []

    // Set pagination
    vendorSwitchesPagination.setTotalItems(vendorSwitchesData.length)
    vendorSwitchesPagination.currentPage = 1

    // Render table
    renderVendorSwitchesTable()
  } catch (error) {
    console.error("[hewo] Error fetching vendor switches:", error)
    if (error instanceof window.CustomError) {
      window.showAlert("vendorSwitchesAlert", "Error " + error.status + ": " + error.message, "danger")
    } else if (error instanceof window.NetworkError) {
      window.showAlert("vendorSwitchesAlert", error.message, "danger")
    } else {
      window.showAlert("vendorSwitchesAlert", "An unexpected error occurred while fetching switches.", "danger")
    }
    window.showEmptyState("vendorSwitchesTableBody", "Failed to load switches.", 7)
  }
}

/**
 * Renders vendor information card
 * @param {Object} vendor - The vendor data
 */
function renderVendorInfo(vendor) {
  var container = document.getElementById("vendorInfoContainer")
  container.innerHTML =
    '<div class="card bg-light">' +
    '<div class="card-body">' +
    '<h5 class="card-title"><i class="bi bi-building me-2"></i>Vendor Information</h5>' +
    '<div class="row">' +
    '<div class="col-md-4"><strong>ID:</strong> ' +
    window.escapeHtml(vendor.vendor_id || vendor.id) +
    "</div>" +
    '<div class="col-md-4"><strong>Name:</strong> ' +
    window.escapeHtml(vendor.vendor_name || vendor.name) +
    "</div>" +
    '<div class="col-md-4"><strong>Country:</strong> ' +
    window.escapeHtml(vendor.country || "-") +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>"
}

/**
 * Renders the vendor switches table with current page data
 */
function renderVendorSwitchesTable() {
  var tableBody = document.getElementById("vendorSwitchesTableBody")

  if (!vendorSwitchesData || vendorSwitchesData.length === 0) {
    window.showEmptyState("vendorSwitchesTableBody", "No switches found for this vendor.", 7)
    window.clearContainer("vendorSwitchesPagination")
    return
  }

  // Get current page data
  var pageData = vendorSwitchesPagination.getPageData(vendorSwitchesData)

  var html = ""
  for (var i = 0; i < pageData.length; i++) {
    var switchItem = pageData[i]
    html +=
      "<tr>" +
      "<td>" +
      window.escapeHtml(switchItem.switch_id || switchItem.id) +
      "</td>" +
      "<td>" +
      window.escapeHtml(switchItem.name || switchItem.switch_name) +
      "</td>" +
      '<td><span class="badge bg-info">' +
      window.escapeHtml(switchItem.type || switchItem.switch_type || "-") +
      "</span></td>" +
      "<td>" +
      window.escapeHtml(switchItem.actuation_force || "-") +
      "g</td>" +
      "<td>" +
      window.escapeHtml(switchItem.total_travel || "-") +
      "mm</td>" +
      "<td>" +
      window.escapeHtml(switchItem.lifespan_million || "-") +
      "M</td>" +
      "<td>" +
      window.escapeHtml(switchItem.release_date || "-") +
      "</td>" +
      "</tr>"
  }

  tableBody.innerHTML = html

  // Render pagination
  vendorSwitchesPagination.render("vendorSwitchesPagination")
}

// ============================================================================
// THESPORTSDB (External API)
// ============================================================================

/**
 * Initializes event handlers for TheSportsDB section
 */
function initializeSportsDbHandlers() {
  var form = document.getElementById("sportsDbForm")
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      fetchSportsDbLeagues()
    })
  }
}

/**
 * Fetches leagues from TheSportsDB API
 * @async
 */
async function fetchSportsDbLeagues() {
  var sport = document.getElementById("sportFilter").value
  var country = document.getElementById("countryFilter").value
  window.hideAlert("sportsDbAlert")

  // Validate - at least one filter required
  var validation = window.validateSportsDbParams({
    sport: sport,
    country: country,
  })
  if (!validation.isValid) {
    window.showErrorList("sportsDbAlert", validation.errors)
    return
  }

  var resultsContainer = document.getElementById("sportsDbResults")
  resultsContainer.innerHTML =
    '<div class="col-12 text-center py-5">' +
    '<div class="spinner-border text-primary" role="status">' +
    '<span class="visually-hidden">Loading...</span>' +
    "</div>" +
    '<p class="mt-2 text-muted">Searching leagues...</p>' +
    "</div>"

  try {
    // Build URL with query parameters
    var params = new URLSearchParams()
    if (sport) params.append("s", sport)
    if (country) params.append("c", country)

    var url = window.CONFIG.SPORTS_DB_API_URL + "?" + params.toString()
    console.log("[hewo] Fetching from TheSportsDB:", url)

    // Make direct fetch call for external API
    var response = await fetch(url)

    if (!response.ok) {
      throw new window.CustomError(response.status, response.statusText, "Failed to fetch from TheSportsDB")
    }

    var data = await response.json()
    console.log("[hewo] TheSportsDB response:", data)

    // Render results - response contains 'countries' array (which are actually leagues)
    renderSportsDbResults(data.countries || [])
  } catch (error) {
    console.error("[hewo] Error fetching from TheSportsDB:", error)
    if (error instanceof window.CustomError) {
      window.showAlert("sportsDbAlert", "Error " + error.status + ": " + error.message, "danger")
    } else {
      window.showAlert("sportsDbAlert", "Failed to fetch leagues from TheSportsDB. Please try again.", "danger")
    }
    resultsContainer.innerHTML =
      '<div class="col-12 text-center py-5 text-muted">' +
      '<i class="bi bi-exclamation-triangle fs-1"></i>' +
      '<p class="mt-2">Failed to load leagues</p>' +
      "</div>"
  }
}

/**
 * Renders TheSportsDB league results
 * @param {Array} leagues - Array of league objects from the API
 */
function renderSportsDbResults(leagues) {
  var container = document.getElementById("sportsDbResults")

  if (!leagues || leagues.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center py-5 text-muted">' +
      '<i class="bi bi-search fs-1"></i>' +
      '<p class="mt-2">No leagues found matching your criteria</p>' +
      "</div>"
    return
  }

  var html = ""
  for (var i = 0; i < leagues.length; i++) {
    var league = leagues[i]
    html +=
      '<div class="col-md-6 col-lg-4">' +
      '<div class="card h-100">' +
      '<div class="card-body">' +
      '<h5 class="card-title">' +
      window.escapeHtml(league.strLeague || league.strLeagueAlternate || "Unknown League") +
      "</h5>" +
      '<p class="card-text">' +
      '<span class="badge bg-primary me-1">' +
      window.escapeHtml(league.strSport || "-") +
      "</span>" +
      '<span class="badge bg-secondary">' +
      window.escapeHtml(league.strCountry || "-") +
      "</span>" +
      "</p>" +
      "</div>" +
      '<div class="card-footer bg-transparent">' +
      '<small class="text-muted">ID: ' +
      window.escapeHtml(league.idLeague || "-") +
      "</small>" +
      "</div>" +
      "</div>" +
      "</div>"
  }

  container.innerHTML = html
}

/**
 * Opens the edit modal and populates it with existing health service data
 * @async
 * @param {number} id - The ID of the health service to edit
 */
async function openEditModal(id) {
  try {
    window.hideAlert("editModalAlert")

    // Fetch the health service data
    var response = await wellbeingApi.get(window.ENDPOINTS.HEALTH_SERVICES + "/" + id)
    var service = response.health_service || response.data || response

    // Populate the form fields
    document.getElementById("editServiceId").value = service.Health_ServicesID || service.id
    document.getElementById("editHospitalName").value = service.hospital_name
    document.getElementById("editServiceType").value = service.service_type
    document.getElementById("editIsFree").value = service.is_free == 1 ? "1" : "0"
    document.getElementById("editRequirements").value = service.requirements || ""

    // Show the modal
    var modal = new bootstrap.Modal(document.getElementById("editHealthServiceModal"))
    modal.show()
  } catch (error) {
    console.error("[hewo] Error loading health service for edit:", error)
    if (error instanceof window.CustomError) {
      window.showAlert("healthServicesAlert", "Error " + error.status + ": " + error.message, "danger")
    } else if (error instanceof window.NetworkError) {
      window.showAlert("healthServicesAlert", error.message, "danger")
    } else {
      window.showAlert("healthServicesAlert", "An unexpected error occurred while loading the service.", "danger")
    }
  }
}

/**
 * Updates an existing health service
 * @async
 */
async function updateHealthService() {
  window.hideAlert("editModalAlert")

  // Get the service ID
  var serviceId = document.getElementById("editServiceId").value

  // Get form data
  var data = {
    Health_ServicesID: Number.parseInt(serviceId),
    hospital_name: document.getElementById("editHospitalName").value,
    service_type: document.getElementById("editServiceType").value,
    is_free: document.getElementById("editIsFree").value,
    requirements: document.getElementById("editRequirements").value,
  }

  // Validate
  var validation = window.validateHealthService(data)
  if (!validation.isValid) {
    window.showErrorList("editModalAlert", validation.errors)
    return
  }

  try {
    // Send PUT request
    var response = await wellbeingApi.put(window.ENDPOINTS.HEALTH_SERVICES, [data])

    // Close modal
    var modal = bootstrap.Modal.getInstance(document.getElementById("editHealthServiceModal"))
    modal.hide()

    // Reset form
    document.getElementById("editHealthServiceForm").reset()

    // Show success message
    window.showAlert("healthServicesAlert", "Health service updated successfully!", "success")

    // Refresh table
    await fetchHealthServices()
  } catch (error) {
    console.error("[hewo] Error updating health service:", error)
    if (error instanceof window.CustomError) {
      window.showAlert("editModalAlert", "Error " + error.status + ": " + error.message, "danger")
    } else if (error instanceof window.NetworkError) {
      window.showAlert("editModalAlert", error.message, "danger")
    } else {
      window.showAlert("editModalAlert", "An unexpected error occurred while updating.", "danger")
    }
  }
}

// Expose functions to global scope for onclick handlers
window.viewHealthService = viewHealthService
window.confirmDelete = confirmDelete
window.openEditModal = openEditModal

console.log("[hewo] app.js loaded successfully")
