/*
 * Express-based Cloud Code Example
 */

const express = require('express');
const app = express();

app.get('/hello-craft', (req, res) => {
    res.send("Hello! and welcome to Cloud Code Functions --from Craft Team");
});

/*
 * Exporting of module.exports.app is required.
 * we mount it automaticaly to the Parse Server Deployment.
 */

module.exports = app;
