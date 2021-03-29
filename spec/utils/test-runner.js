import ParseServer from "parse-server";
import { config, app } from "../../index.js";
import Config from "../../node_modules/parse-server/lib/Config";

let parseServerState = {};
const dropDB = async () => {
  await Parse.User.logOut();
  const app = Config.get("test");
  return await app.database.deleteEverything(true);
};

/**
 * Starts the ParseServer instance
 * @param {Object} parseServerOptions Used for creating the `ParseServer`
 * @return {Promise} Runner state
 */
async function startParseServer() {
  delete config.databaseAdapter;
  const parseServerOptions = Object.assign(config, {
    databaseURI: "postgres://postgres:postgres@localhost:5432/cloud-code",
    masterKey: "test",
    javascriptKey: "test",
    appId: "test",
    port: 30001,
    mountPath: "/test",
    serverURL: `http://localhost:30001/test`,
    logLevel: "error",
    silent: true,
  });
  const parseServer = new ParseServer(parseServerOptions);
  app.use(parseServerOptions.mountPath, parseServer.app);
  const httpServer = require("http").createServer(app);
  httpServer.listen(parseServerOptions.port, function() {
    Object.assign(parseServerState, {
      parseServer,
      httpServer,
      expressApp: app,
      parseServerOptions,
    });
  });
  return parseServerOptions;
}

/**
 * Stops the ParseServer instance
 * @return {Promise}
 */
async function stopParseServer() {
  const { httpServer } = parseServerState;
  await new Promise((resolve) => httpServer.close(resolve));
  parseServerState = {};
}

export { dropDB, startParseServer, stopParseServer, parseServerState };
