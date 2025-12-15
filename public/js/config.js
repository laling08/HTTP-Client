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
  SPORTS_DB_API_URL:
    "https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php",
  WELLBEING_API_TOKEN:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJXZWxsYmVpbmcgQVBJIiwiYXVkIjoiQXVkaWVuY2UiLCJpYXQiOjE3NjU3NzEzNjEsImV4cCI6MTc2NTc3NDk2MSwidXNlcl9pZCI6Miwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJlZHdhcmRAdGVzdC5jb20ifQ.eayyUtpFFL54ag1pXA9WEWkwNreZ4hrQa15NSM2kdhc",
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
};

/**
 * API Endpoints
 * @constant {Object} ENDPOINTS
 */
var ENDPOINTS = {
  HEALTH_SERVICES: "/health_services",
  VENDORS: "/vendors",
  SWITCHES: "/switches",
};

window.CONFIG = CONFIG;
window.ENDPOINTS = ENDPOINTS;
