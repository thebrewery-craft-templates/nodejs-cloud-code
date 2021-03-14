/*
 * Express-based Cloud Code Example
 */

import express from "express";
const app = express();

app.get("/hello-craft", (req, res) => {
  res.send(
    "Hello! and welcome to Cloud Code (Express) Functions --from Craft Team"
  );
});

/*
 * Exporting of module.exports = app is required.
 * we mount it automaticaly to the Parse Server Deployment (in ./index.js).
 */
module.exports = app;
