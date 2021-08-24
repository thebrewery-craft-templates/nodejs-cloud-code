require("./functions");
require("./job-scheduler"); //built-in
require("./mailer"); //built-in

Parse.Cloud.beforeDelete("TestClass", async (request, response) => {
  const file = request.object.get("Image");
  if (file) {
    const split_url = file.url().split("/");
    const filename = split_url[split_url.length - 1];
    try {
      await Parse.Cloud.httpRequest({
        url: `${process.env.SERVER_URL}/files/${filename}`,
        method: "DELETE",
        headers: {
          "X-Parse-Master-Key": process.env.MASTER_KEY,
          "X-Parse-Application-Id": process.env.APP_ID,
        },
      });
    } catch (e) {
      const error = `error deleting file ${filename} - ${e.message ||
        e.stack ||
        e.text ||
        JSON.stringify(e)}`;
      console.error(error);
      return response.error(error);
    }
  }

  return true;
});

Parse.Cloud.afterSave("TestClass", async (request) => {
  const image = request.object.get("Image");
  const imageOriginal = request.original.get("Image");
  if (imageOriginal && image === imageOriginal) {
    return;
  }
  console.log(imageOriginal);
  const split_url = imageOriginal.url().split("/");
  const filename = split_url[split_url.length - 1];
  try {
    await Parse.Cloud.httpRequest({
      url: `${process.env.SERVER_URL}/files/${filename}`,
      method: "DELETE",
      headers: {
        "X-Parse-Master-Key": process.env.MASTER_KEY,
        "X-Parse-Application-Id": process.env.APP_ID,
      },
    });
    console.info("File Deleted");
  } catch (e) {
    const error = `error deleting file ${filename} - ${e.message ||
      e.stack ||
      e.text ||
      JSON.stringify(e)}`;
    console.error(error);
  }
});

/*
 * If you want to use Express-based Cloud Code,
 * exporting of module.exports.app is required.
 * We mount it automatically to the Parse Server Deployment (in ./index.js).
 */
module.exports.express = require("../express");
