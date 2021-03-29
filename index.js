// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from "express";
import ParseServer from "parse-server";
import path from "path";
const args = process.argv || [];
const test = args.some((arg) => arg.includes("jasmine"));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log("DATABASE_URI not specified, falling back to localhost.");
}
const config = require("./parse-config");

const app = express();

// Serve static assets from the /public folder
app.use("/public", express.static(path.join(__dirname, "/public")));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || "/parse";
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api.app);
}

// Parse Server plays nicely with the rest of your web routes
app.get("/", function(req, res) {
  res
    .status(200)
    .send(
      "I dream of being a website.  Please star the parse-server repo on GitHub!"
    );
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get("/test", function(req, res) {
  res.sendFile(path.join(__dirname, "/public/test.html"));
});

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require("http").createServer(app);
  httpServer.listen(port, function() {
    console.log("parse-server-example running on port " + port + ".");
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

export { app, config };
