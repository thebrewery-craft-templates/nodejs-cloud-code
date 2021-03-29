import Parse from "parse/node";
Parse.initialize("test");
Parse.serverURL = "http://localhost:30001/test";

import * as Utils from "./utils/test-runner.js";
beforeAll(async () => {
  await Utils.startParseServer();
}, 100 * 60 * 2);

afterAll(async () => {
  await Utils.dropDB();
  await Utils.stopParseServer();
});
