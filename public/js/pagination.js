/**
 * @fileoverview Client-side pagination module
 * @description Handles pagination logic and UI rendering
 * @module Pagination
 */

/**
 * PaginationManager class - Manages client-side pagination
 * @class PaginationManager
 */
function PaginationManager(options) {
  options = options || {}
  this.currentPage = 1
  this.pageSize = options.pageSize || 10
  this.totalItems = 0
  this.totalPages = 0
  this.onPageChange = options.onPageChange || (() => {})
}

/**
 * Sets the total number of items and calculates total pages
 * @param {number} total - Total number of items
 */
PaginationManager.prototype.setTotalItems = function (total) {
  this.totalItems = total
  this.totalPages = Math.ceil(total / this.pageSize)

  // Reset to page 1 if current page exceeds total pages
  if (this.currentPage > this.totalPages && this.totalPages > 0) {
    this.currentPage = 1
  }
}

/**
 * Gets the current page slice of data
 * @param {Array} data - The full data array
 * @returns {Array} The sliced data for the current page
 */
PaginationManager.prototype.getPageData = function (data) {
  var startIndex = (this.currentPage - 1) * this.pageSize
  var endIndex = startIndex + this.pageSize
  return data.slice(startIndex, endIndex)
}

/**
 * Goes to a specific page
 * @param {number} page - The page number to go to
 */
PaginationManager.prototype.goToPage = function (page) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page
    this.onPageChange(this.currentPage)
  }
}

/**
 * Goes to the next page
 */
PaginationManager.prototype.nextPage = function () {
  if (this.currentPage < this.totalPages) {
    this.currentPage++
    this.onPageChange(this.currentPage)
  }
}

/**
 * Goes to the previous page
 */
PaginationManager.prototype.previousPage = function () {
  if (this.currentPage > 1) {
    this.currentPage--
    this.onPageChange(this.currentPage)
  }
}

/**
 * Renders the pagination controls
 * @param {string} containerId - The ID of the container element
 */
PaginationManager.prototype.render = function (containerId) {

  var container = document.getElementById(containerId)
  if (!container) return

  // Don't show pagination if there's only one page or no data
  if (this.totalPages <= 1) {
    container.innerHTML = ""
    return
  }

  var html = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center mb-0">'

  // Previous button
  html +=
    '<li class="page-item ' +
    (this.currentPage === 1 ? "disabled" : "") +
    '">' +
    '<a class="page-link" href="#" data-page="prev" aria-label="Previous">' +
    '<span aria-hidden="true">&laquo;</span></a></li>'

  // Page numbers
  var startPage = Math.max(1, this.currentPage - 2)
  var endPage = Math.min(this.totalPages, this.currentPage + 2)

  // First page if not in range
  if (startPage > 1) {
    html += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>'
    if (startPage > 2) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>'
    }
  }

  // Page numbers in range
  for (var i = startPage; i <= endPage; i++) {
    html +=
      '<li class="page-item ' +
      (i === this.currentPage ? "active" : "") +
      '">' +
      '<a class="page-link" href="#" data-page="' +
      i +
      '">' +
      i +
      "</a></li>"
  }

  // Last page if not in range
  if (endPage < this.totalPages) {
    if (endPage < this.totalPages - 1) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>'
    }
    html +=
      '<li class="page-item"><a class="page-link" href="#" data-page="' +
      this.totalPages +
      '">' +
      this.totalPages +
      "</a></li>"
  }

  // Next button
  html +=
    '<li class="page-item ' +
    (this.currentPage === this.totalPages ? "disabled" : "") +
    '">' +
    '<a class="page-link" href="#" data-page="next" aria-label="Next">' +
    '<span aria-hidden="true">&raquo;</span></a></li>'

  html += "</ul></nav>"

  // Show pagination info
  var startItem = (this.currentPage - 1) * this.pageSize + 1
  var endItem = Math.min(this.currentPage * this.pageSize, this.totalItems)
  html +=
    '<p class="text-center text-muted mt-2 small">Showing ' +
    startItem +
    "-" +
    endItem +
    " of " +
    this.totalItems +
    " items</p>"

  container.innerHTML = html

  // Add click event listeners
  var links = container.querySelectorAll(".page-link")
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      var pageLink = e.target.closest(".page-link")
      var page = pageLink.dataset.page

      if (page === "prev") {
        this.previousPage()
      } else if (page === "next") {
        this.nextPage()
      } else {
        this.goToPage(Number.parseInt(page))
      }

      this.render(containerId)
    })
  })
}

/**
 * Resets pagination to initial state
 */
PaginationManager.prototype.reset = function () {
  this.currentPage = 1
  this.totalItems = 0
  this.totalPages = 0
}

window.PaginationManager = PaginationManager
