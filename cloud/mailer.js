const mail = require("@brewery/nodemailer-handlebars");

// sendMail(mailOptions, engineOptions, SMTPCredentials)
Parse.Cloud.define("sendMail", async (req) => {
  let resp = await mail.sendMail(req.params);
  //   }
  //  Optional: Your own handlebars template
  //  {
  //   extName: ".hbs",
  //   templatePath: "./templates"
  // },
  //  Optional: Your own SMTP credentials and settings,
  // {
  //   port: SMTPCredentials.port,
  //   host: SMTPCredentials.host,
  //   secure: SMTPCredentials.secure,
  //   auth: {
  //       user: SMTPCredentials.smtp_username,
  //       pass: SMTPCredentials.smtp_password,
  //   },
  //   debug: SMTPCredentials.is_debug
  // }
  return resp;
});
