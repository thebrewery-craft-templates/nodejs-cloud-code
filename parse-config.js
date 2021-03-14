/*
 * PLEASE NOTE THAT THESE CONFIGURATIONS ARE FOR LOCAL DEVELOPMENT ONLY.
 * ANY CHANGES HERE MAY NOT REFLECT ON YOUR DEPLOYED PROJECT IN CRAFT.
 *
 */
module.exports = {
  databaseURI: process.env.DATABASE_URI || "mongodb://localhost:27017/dev",
  appId: process.env.APP_ID || "myAppId",
  clientKey: process.env.CLIENT_KEY || "myClientKey",
  masterKey: process.env.MASTER_KEY || "masterKey", //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || "http://localhost:1337/parse",
  javascriptKey: process.env.JAVASCRIPT_KEY || "myJSKey",
  restAPIKey: process.env.REST_API_KEY || "restAPIKey",
  cloud: process.env.PARSE_CLOUD_CODE || "./cloud/main.js",
  liveQuery: {
    classNames: [], // List of classes to support for query subscriptions example: [ 'Posts', 'Comments' ]
  },
  verbose: false,
};
