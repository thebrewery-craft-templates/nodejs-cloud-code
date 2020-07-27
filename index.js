require("dotenv").config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { default: ParseServer, ParseGraphQLServer } = require('parse-server');

const options = require('./parse-config')
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const mountPath = process.env.PARSE_MOUNT || '/parse';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH
const port = process.env.PORT || 1337;
const api = new ParseServer(options);
const app = express();

app.use(cors());

const parseGraphQLServer = new ParseGraphQLServer(
  api,
  {
    graphQLPath: '/graphql',
    playgroundPath: '/playground'
  }
);


parseGraphQLServer.applyGraphQL(app); // Mounts the GraphQL API
parseGraphQLServer.applyPlayground(app);

// Serve static assets from the /public folder
app.use(express.static(path.join(__dirname, '/public')));

// Mount your cloud express app
app.use('/', require('./cloud/main.js').app);

// Serve the Parse API on the /parse URL prefix
app.use(mountPath, api.app)

const httpServer = require('http').createServer(app);
httpServer.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);