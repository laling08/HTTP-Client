/**
 * @fileoverview Configuration module for API endpoints
 * @description Contains all API base URLs and endpoint configurations
 * @module config
 */

/**
 * API Configuration object
 * @constant {Object} CONFIG
 */
export const CONFIG = {
  WELLBEING_API_BASE_URL: "http://localhost/wellbeing-api",
  HW1_API_BASE_URL: "http://localhost/hw1",
  SPORTS_DB_API_URL: "https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php",
  PAGINATION: {
    DEFAULT_PAGE_SIZE:10,
    MAX_PAGE_SIZE: 50,
  },
}

/**
 * API Endpoints
 * @constant {Object} ENDPOINTS
 */
export const ENDPOINTS = {
  // Health Services endpoints
  HEALTH_SERVICES: "/health_services",

  // Vendors and Switches endpoints
  VENDORS: "/vendors",
  SWITCHES: "/switches",

  // TheSportsDB endpoints
  SPORTS_DB_LEAGUES: "/search_all_leagues.php",
}
