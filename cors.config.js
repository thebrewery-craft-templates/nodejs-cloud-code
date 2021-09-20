/*
 * Default filename: cors-config.js
 * You can set here the CORS allowed origins.
 * Removing/renaming this file will default to allow access from any origin.
 */

/*For example:
module.exports = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://showcase.domain.com",
  "https://test.domain.com",
];

*/

// This is the default setting, allows access from any origin.
// You may add restrictions by adding domains (see example above).
module.exports = [
  "https://parse-dashboard-craft.apps.dev.thebrewery.app",
  "https://parse-dashboard-craft-dev.apps.dev.thebrewery.app",
];
