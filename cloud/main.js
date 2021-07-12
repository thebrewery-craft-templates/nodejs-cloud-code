require("./functions");
require("./job-scheduler");
require("./mailer");

/*
 * If you want to use Express-based Cloud Code,
 * exporting of module.exports.app is required.
 * We mount it automaticaly to the Parse Server Deployment (in ./index.js).
 * If you don't want to use it just comment module.exports.app
 */
module.exports.express = require("../express");
