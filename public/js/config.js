/**
 * @fileoverview Configuration module for API endpoints
 * @description Contains all API base URLs and endpoint configurations
 * @module Config
 */

/**
 * API Configuration object
 * @constant {Object} CONFIG
 */
var CONFIG = {
  WELLBEING_API_BASE_URL: "http://localhost/wellbeing-api",
  HW1_API_BASE_URL: "http://localhost/hw1",
  SPORTS_DB_API_URL: "https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php",
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
}

/**
 * API Endpoints
 * @constant {Object} ENDPOINTS
 */
var ENDPOINTS = {
  HEALTH_SERVICES: "/health_services",
  VENDORS: "/vendors",
  SWITCHES: "/switches",
}

window.CONFIG = CONFIG
window.ENDPOINTS = ENDPOINTS
