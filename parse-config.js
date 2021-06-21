/*
 * PLEASE NOTE THAT THESE CONFIGURATIONS ARE FOR LOCAL DEVELOPMENT ONLY.
 * ANY CHANGES HERE MAY NOT REFLECT ON YOUR DEPLOYED PROJECT IN CRAFT.
 *
 */

module.exports = {
  databaseURI:
    process.env.DATABASE_URI ||
    "postgres://postgres:postgres@localhost:5432/parse", //format: "postgres://user:password@localhost:5432/dbname"
  appId: process.env.APP_ID || "myAppId",
  clientKey: process.env.CLIENT_KEY || "myClientKey",
  masterKey: process.env.MASTER_KEY || "masterKey",
  serverURL: process.env.SERVER_URL || "http://localhost:1337/parse",
  graphQLServerURL:
    process.env.GRAPHQL_SERVER_URL || "http://localhost:1337/graphql",
  javascriptKey: process.env.JAVASCRIPT_KEY || "myJSKey",
  restAPIKey: process.env.REST_API_KEY || "restAPIKey",
  cloud: process.env.PARSE_CLOUD_CODE || "./cloud/main.js",
  isDev: process.env.IS_DEVELOPMENT || 1, //this will set some rules for local development
  liveQuery: {
    classNames: [], // List of classes (from My Apps > Your App > Dasnboard > Browser) to support for query subscriptions example: [ 'User', 'Posts', 'Comments' ]
  },
  verbose: false,
};
