/**
 * @fileoverview Client-side pagination module
 * @description Handles pagination logic and UI rendering
 * @module Pagination
 */

console.log("[NANIII] pagination.js loading...");

/**
 * PaginationManager class - Manages client-side pagination
 * @class PaginationManager
 * @param {Object} options - Configuration options
 */
function PaginationManager(options) {
  options = options || {};
  this.currentPage = 1;
  this.pageSize = options.pageSize || 10;
  this.totalItems = 0;
  this.totalPages = 0;
  this.onPageChange = options.onPageChange || (() => {});
}

/**
 * Sets the total number of items and calculates total pages
 * @param {number} total - Total number of items
 */
PaginationManager.prototype.setTotalItems = function (total) {
  this.totalItems = total;
  this.totalPages = Math.ceil(total / this.pageSize);

  // Reset to page 1 if current page exceeds total pages
  if (this.currentPage > this.totalPages && this.totalPages > 0) {
    this.currentPage = 1;
  }
};

/**
 * Gets the current page slice of data
 * @param {Array} data - The full data array
 * @returns {Array} The sliced data for the current page
 */
PaginationManager.prototype.getPageData = function (data) {
  var startIndex = (this.currentPage - 1) * this.pageSize;
  var endIndex = startIndex + this.pageSize;
  return data.slice(startIndex, endIndex);
};

/**
 * Goes to a specific page
 * @param {number} page - The page number to go to
 */
PaginationManager.prototype.goToPage = function (page) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.onPageChange(this.currentPage);
  }
};

/**
 * Goes to the next page
 */
PaginationManager.prototype.nextPage = function () {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.onPageChange(this.currentPage);
  }
};

/**
 * Goes to the previous page
 */
PaginationManager.prototype.previousPage = function () {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.onPageChange(this.currentPage);
  }
};

/**
 * Goes to the first page
 */
PaginationManager.prototype.firstPage = function () {
  if (this.currentPage !== 1) {
    this.currentPage = 1;
    this.onPageChange(this.currentPage);
  }
};

/**
 * Goes to the last page
 */
PaginationManager.prototype.lastPage = function () {
  if (this.currentPage !== this.totalPages) {
    this.currentPage = this.totalPages;
    this.onPageChange(this.currentPage);
  }
};

/**
 * Renders the pagination controls (Amazon-style with page numbers)
 * @param {string} containerId - The ID of the container element
 */
PaginationManager.prototype.render = function (containerId) {
  var self = this;
  var container = document.getElementById(containerId);
  if (!container) return;

  // Don't show pagination if there's only one page or no data
  if (this.totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  var html = '<nav aria-label="Page navigation">';
  html += '<ul class="pagination justify-content-center mb-2">';

  html +=
    '<li class="page-item ' +
    (this.currentPage === 1 ? "disabled" : "") +
    '">' +
    '<a class="page-link" href="#" data-page="first" aria-label="First" title="Go to first page">' +
    '<span aria-hidden="true">&laquo;&laquo;</span></a></li>';

  // Previous button (<)
  html +=
    '<li class="page-item ' +
    (this.currentPage === 1 ? "disabled" : "") +
    '">' +
    '<a class="page-link" href="#" data-page="prev" aria-label="Previous" title="Previous page">' +
    '<span aria-hidden="true">&laquo;</span></a></li>';

  var maxVisiblePages = 7;
  var startPage, endPage;

  if (this.totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max
    startPage = 1;
    endPage = this.totalPages;
  } else {
    // Calculate range around current page
    var halfVisible = Math.floor(maxVisiblePages / 2);
    startPage = Math.max(1, this.currentPage - halfVisible);
    endPage = Math.min(this.totalPages, this.currentPage + halfVisible);

    // Adjust if at the beginning or end
    if (this.currentPage <= halfVisible) {
      endPage = maxVisiblePages;
    } else if (this.currentPage >= this.totalPages - halfVisible) {
      startPage = this.totalPages - maxVisiblePages + 1;
    }
  }

  // First page with ellipsis if needed
  if (startPage > 1) {
    html +=
      '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
    if (startPage > 2) {
      html +=
        '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  // Page numbers in range
  for (var i = startPage; i <= endPage; i++) {
    if (i === 1 && startPage > 1) continue; // Skip if already shown
    if (i === this.totalPages && endPage < this.totalPages) continue; // Skip if will be shown

    html +=
      '<li class="page-item ' +
      (i === this.currentPage ? "active" : "") +
      '">' +
      '<a class="page-link" href="#" data-page="' +
      i +
      '">' +
      i +
      "</a></li>";
  }

  // Last page with ellipsis if needed
  if (endPage < this.totalPages) {
    if (endPage < this.totalPages - 1) {
      html +=
        '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
    html +=
      '<li class="page-item"><a class="page-link" href="#" data-page="' +
      this.totalPages +
      '">' +
      this.totalPages +
      "</a></li>";
  }

  // Next button (>)
  html +=
    '<li class="page-item ' +
    (this.currentPage === this.totalPages ? "disabled" : "") +
    '">' +
    '<a class="page-link" href="#" data-page="next" aria-label="Next" title="Next page">' +
    '<span aria-hidden="true">&raquo;</span></a></li>';

  html +=
    '<li class="page-item ' +
    (this.currentPage === this.totalPages ? "disabled" : "") +
    '">' +
    '<a class="page-link" href="#" data-page="last" aria-label="Last" title="Go to last page">' +
    '<span aria-hidden="true">&raquo;&raquo;</span></a></li>';

  html += "</ul></nav>";

  var startItem = (this.currentPage - 1) * this.pageSize + 1;
  var endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
  html +=
    '<div class="text-center text-muted small">' +
    "Showing <strong>" +
    startItem +
    "-" +
    endItem +
    "</strong> of <strong>" +
    this.totalItems +
    "</strong> items " +
    "(Page <strong>" +
    this.currentPage +
    "</strong> of <strong>" +
    this.totalPages +
    "</strong>)" +
    "</div>";

  container.innerHTML = html;

  // Add click event listeners
  var links = container.querySelectorAll(".page-link[data-page]");
  for (var j = 0; j < links.length; j++) {
    links[j].addEventListener("click", function (e) {
      e.preventDefault();
      var page = this.getAttribute("data-page");

      if (page === "first") {
        self.firstPage();
      } else if (page === "prev") {
        self.previousPage();
      } else if (page === "next") {
        self.nextPage();
      } else if (page === "last") {
        self.lastPage();
      } else {
        self.goToPage(Number.parseInt(page));
      }

      self.render(containerId);
    });
  }
};

/**
 * Resets pagination to initial state
 */
PaginationManager.prototype.reset = function () {
  this.currentPage = 1;
  this.totalItems = 0;
  this.totalPages = 0;
};

// Attach to window object for global access
window.PaginationManager = PaginationManager;

console.log("[UMAII] pagination.js loaded successfully");
