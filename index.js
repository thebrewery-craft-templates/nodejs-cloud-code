require("dotenv").config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { default: ParseServer, ParseGraphQLServer } = require('parse-server');

const options = require('./parse-config');
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const mountPath = process.env.PARSE_MOUNT || '/parse';
const port = process.env.PORT || 1337;
const api = new ParseServer(options);
const app = express();
app.enable('trust proxy');
app.use(express.json());

const newrelicParseServerName = process.env.NEWRELIC_PARSE_SERVER_NAME;
const newrelicLicenseKey = process.env.NEWRELIC_LICENSE_KEY;
if (newrelicLicenseKey && newrelicParseServerName) {
  // Tag the user request for analytics purposes
  const newrelic = require('newrelic');
  const instrumentedPath = new RegExp('^' + mountPath + '((?!/users/me).)*$');
  app.use(instrumentedPath, (req, res, next) => {
    const sessionToken = req.headers['x-parse-session-token'] || req.body['_SessionToken'];
    if (sessionToken) {
      const parseServerUrl = req.protocol + '://' + req.get('host') + mountPath;
      Parse.initialize(options.appId, options.javascriptKey, options.masterKey);
      Parse.serverURL = parseServerUrl;
      Parse.User.enableUnsafeCurrentUser();
      Parse.User.become(sessionToken, { useMasterKey: true }).then(user => {
        newrelic.addCustomAttribute('user_id', user.id);
        next();
      }, (error) => {
        console.log(error);
        next();
      });
    }
    else {
      next();
    }
  });
}


app.use(cors());

const parseGraphQLServer = new ParseGraphQLServer(
  api,
  {
    graphQLPath: '/graphql'
  }
);


parseGraphQLServer.applyGraphQL(app); // Mounts the GraphQL API

// Serve static assets from the /public folder
app.use(express.static(path.join(__dirname, '/public')));

// Mount your cloud express app
app.use('/', require('./cloud/main.js').app);

// Serve the Parse API on the /parse URL prefix
app.use(mountPath, api.app);

const httpServer = require('http').createServer(app);
httpServer.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
