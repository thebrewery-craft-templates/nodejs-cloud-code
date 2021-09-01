/*
 * PLEASE NOTE THAT THESE CONFIGURATIONS ARE FOR LOCAL DEVELOPMENT ONLY.
 * ANY CHANGES HERE MAY NOT REFLECT ON YOUR DEPLOYED PROJECT IN CRAFT.
 *
 */

module.exports = {
  databaseURI:
    process.env.DATABASE_URI ||
    "postgres://postgres:postgres@localhost:5432/cloudcode", //format: "postgres://user:password@localhost:5432/dbname"
  appId: process.env.APP_ID || "myAppId",
  clientKey: process.env.CLIENT_KEY || "myClientKey",
  masterKey: process.env.MASTER_KEY || "myMasterKey",
  serverURL: process.env.SERVER_URL || "http://localhost:1337/parse",
  graphQLServerURL:
    process.env.GRAPHQL_SERVER_URL || "http://localhost:1337/graphql",
  javascriptKey: process.env.JAVASCRIPT_KEY || "myJSKey",
  restAPIKey: process.env.REST_API_KEY || "myRestAPIKey",
  cloud: process.env.PARSE_CLOUD_CODE || "./cloud/main.js",
  liveQuery: {
    classNames: [], // List of classes (from My Apps > Your App > Dashboard > Browser) to support for query subscriptions (PubSub) example: [ 'User', 'Posts', 'Comments' ]
  },
  verbose: false,
  filesAdapter: {
    module: "@parse/s3-files-adapter",
    options: {
      bucket: process.env.S3_BUCKET_NAME || "myBucket",
      // optional:
      region: "us-west-2", // default value
      bucketPrefix: "", // default value
      directAccess: false, // default value
      fileAcl: null, // default value
      baseUrl: null, // default value
      baseUrlDirect: false, // default value
      signatureVersion: "v4", // default value
      globalCacheControl: null, // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
      ServerSideEncryption: "AES256|aws:kms", //AES256 or aws:kms, or if you do not pass this, encryption won't be done
      validateFilename: null, // Default to parse-server FilesAdapter::validateFilename.
      generateKey: null, // Will default to Parse.FilesController.preserveFileName
      s3overrides: {
        accessKeyId: process.env.S3_AWS_KEY,
        secretAccessKey: process.env.S3_AWS_SECRET,
      },
    },
  },
  maxUploadSize: "2MB",
};
