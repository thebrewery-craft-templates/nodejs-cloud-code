/*
 *** NOTE: PLEASE DO NOT EDIT THIS FILE ***
 * WE OVERWRITE THIS FILE DURING DEPLOYMENT
 */
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { default: ParseServer, ParseGraphQLServer } = require("parse-server");
const ParseDashboard = require("parse-dashboard");
const args = process.argv || [];
const test = args.some((arg) => arg.includes("jasmine"));

const config = require("./parse.config");
const databaseUri = process.env.DATABASE_URI;

if (!databaseUri) {
  console.log("DATABASE_URI not specified, falling back to localhost.");
}

const mountPath = process.env.PARSE_MOUNT || "/parse";
const port = process.env.PORT || 1337;

const app = express();
app.enable("trust proxy");
app.use(express.json());

// This will enable New Relic
if (!test) {
  /* New Relic setup */
  const newrelicParseServerName = process.env.NEWRELIC_PARSE_SERVER_NAME;
  const newrelicLicenseKey = process.env.NEWRELIC_LICENSE_KEY;
  if (newrelicLicenseKey && newrelicParseServerName) {
    // Tag the user request for analytics purposes
    const newrelic = require("newrelic");
    const instrumentedPath = new RegExp("^" + mountPath + "((?!/users/me).)*$");
    app.use(instrumentedPath, (req, res, next) => {
      const sessionToken =
        req.headers["x-parse-session-token"] || req.body["_SessionToken"];
      if (sessionToken) {
        const parseServerUrl =
          req.protocol + "://" + req.get("host") + mountPath;
        Parse.initialize(config.appId, config.javascriptKey, config.masterKey);
        Parse.serverURL = parseServerUrl;
        Parse.User.enableUnsafeCurrentUser();
        Parse.User.become(sessionToken, { useMasterKey: true }).then(
          (user) => {
            newrelic.addCustomAttribute("user_id", user.id);
            next();
          },
          (error) => {
            console.log(error);
            next();
          }
        );
      } else {
        next();
      }
    });
  }
}

if (!test && config.filesAdapter.module === "@parse/s3-files-adapter") {
  // This will run cron job to remove orphaned files
  var CronJob = require("cron").CronJob;
  var job = new CronJob(
    "0 0 0 * * *", // Run the Job every 12 Midnight Server Time
    function() {
      cleanUpS3Bucket();
    },
    null,
    true,
    "Asia/Manila"
  );
  job.start();
}

app.use(helmet());

// This will enable and handle your CORS settings
try {
  allowedOrigins = require("./cors.config");
  if (Object.values(allowedOrigins).length !== 0) {
    app.use(
      cors({
        credentials: true,
        origin: (origin, callback) => {
          // allow requests with no origin
          // (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) === -1) {
            var msg =
              "The CORS policy for this site does not " +
              "allow access from the specified Origin.";
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
      })
    );
    app.options("*", cors()); // Enable CORS-Pre-Flight
  } else {
    app.use(cors());
  }
} catch (e) {
  app.use(cors());
}

// This will enable Parse Dashboard on your dev env
if (process.env.NODE_ENV === "development" && !test) {
  const users = [
    {
      user: "admin",
      pass: "$2y$12$zkMYmegpI00X2NmNBKHiEuujT6xl7AKWpO/Lx.3d2Gq2K2RBeulzi",
    },
  ];

  app.use(
    "/dashboard",
    new ParseDashboard(
      {
        apps: [
          {
            serverURL: config.serverURL,
            graphQLServerURL: config.graphQLServerURL,
            appId: config.appId,
            masterKey: config.masterKey,
            appName: "my-dev-parse-server",
          },
        ],
        users,
        useEncryptedPasswords: true,
      },
      true
    )
  );
}

// Serve static assets from the /public folder
app.use(express.static(path.join(__dirname, "/public")));

if (!test) {
  // Mount your cloud express app
  const api = new ParseServer(config);

  app.use("/", require("./cloud/main").express);
  // Serve the Parse API on the /parse URL prefix
  app.use(mountPath, api.app);
  const httpServer = require("http").createServer(app);
  httpServer.listen(port, () => {
    console.log(`REST API Running on http://localhost:${port}/parse`);
  });

  const parseGraphQLServer = new ParseGraphQLServer(api, {
    graphQLPath: "/graphql",
  });
  parseGraphQLServer.applyGraphQL(app);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `Parse Dashboard Running on http://localhost:${port}/dashboard. 
 **From Dashboard you can access GraphQL playground, go to Core > API Console > GraphQL Console`
    );
  }

  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

/**
 * AWS S3 Cleanup Functions
 */

function cleanUpS3Bucket() {
  console.log("Cleaning up S3 bucket", new Date().toString());
  const AWS = require("aws-sdk");

  const { options } = config.filesAdapter;
  const bucketOptions = options.bucket.split("/");
  if (!bucketOptions || bucketOptions.length < 2) {
    throw new Error("Invalid S3 bucket name provided");
  }

  const bucket = bucketOptions[0];
  bucketOptions.shift();
  const prefix = bucketOptions.join("/");

  const s3Options = {
    params: { Bucket: bucket, Prefix: prefix },
    region: options.region,
    signatureVersion: options.signatureVersion,
    globalCacheControl: options.globalCacheControl,
  };

  if (options.s3overrides.accessKeyId && options.s3overrides.secretAccessKey) {
    s3Options.accessKeyId = options.s3overrides.accessKeyId;
    s3Options.secretAccessKey = options.s3overrides.secretAccessKey;
  }

  Object.assign(s3Options, options.s3overrides);
  const s3Client = new AWS.S3(s3Options);

  getAllFileObjectsInS3(s3Client)
    .then((data) => {
      getAllFileObjectsInParse()
        .then((parseFiles) => {
          const fileNames = parseFiles.map((file) => file.fileName);

          for (const s3Obj of data.Contents) {
            s3ObjKeyFileName = s3Obj.Key.split("/").pop();
            if (fileNames.indexOf(s3ObjKeyFileName) === -1) {
              deleteFilesInS3(s3Obj.Key, s3Client);
            }
          }
        })
        .catch((error) => console.log(error));
    })
    .catch((err) => console.error(err));
}

function getAllFileObjectsInS3(s3Client) {
  return new Promise((resolve, reject) => {
    s3Client.listObjects((err, data) => {
      if (err) reject(err);

      if (data) {
        resolve(data);
      }
    });
  });
}

function getAllFileObjectsInParse() {
  Parse.initialize(config.appId, config.javascriptKey, config.masterKey);
  Parse.serverURL = config.serverURL;

  return Parse.Schema.all()
    .then(function(res) {
      var schemasWithFiles = onlyFiles(res);
      return Promise.all(schemasWithFiles.map(getObjectsWithFilesFromSchema));
    })
    .then(function(results) {
      var files = results
        .reduce(function(c, r) {
          return c.concat(r);
        }, [])
        .filter(function(file) {
          return file.fileName !== "DELETE";
        });

      return Promise.resolve(files);
    });
}

function onlyFiles(schemas) {
  return schemas
    .map(function(schema) {
      var fileFields = Object.keys(schema.fields).filter(function(key) {
        var value = schema.fields[key];
        return value.type == "File";
      });
      if (fileFields.length > 0) {
        return {
          className: schema.className,
          fields: fileFields,
        };
      }
    })
    .filter(function(s) {
      return s != undefined;
    });
}

function getAllObjects(baseQuery) {
  var allObjects = [];
  var next = function() {
    if (allObjects.length) {
      baseQuery.greaterThan(
        "createdAt",
        allObjects[allObjects.length - 1].createdAt
      );
    }
    return baseQuery.find({ useMasterKey: true }).then(function(r) {
      allObjects = allObjects.concat(r);
      if (r.length == 0) {
        return Promise.resolve(allObjects);
      } else {
        return next();
      }
    });
  };
  return next();
}

function getObjectsWithFilesFromSchema(schema) {
  var query = new Parse.Query(schema.className);
  query.select(schema.fields.concat("createdAt"));
  query.ascending("createdAt");
  query.limit(1000);

  var checks = schema.fields.map(function(field) {
    return new Parse.Query(schema.className).exists(field);
  });
  query._orQuery(checks);

  return getAllObjects(query).then(function(results) {
    return results.reduce(function(current, result) {
      return current.concat(
        schema.fields.map(function(field) {
          var fName = result.get(field) ? result.get(field).name() : "DELETE";
          var fUrl = result.get(field) ? result.get(field).url() : "DELETE";
          return {
            className: schema.className,
            objectId: result.id,
            fieldName: field,
            fileName: fName,
            url: fUrl,
          };
        })
      );
    }, []);
  });
}

function deleteFilesInS3(key, s3Client) {
  return new Promise((resolve, reject) => {
    s3Client.deleteObject({ Key: key }, (err, data) => {
      if (err) reject(err);

      if (data) {
        resolve(data);
      }
    });
  });
}

module.exports = {
  app,
  config,
};
