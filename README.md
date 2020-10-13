## Welcome to the private repo of your application. Let's start brewing! 

##### Cloud Code development

`./cloud/main.js` is the root file which we import on Craft's cloud. **Don't change the name of the cloud directory nor move it**, or else your Cloud Code will not run properly.

##### Hosting your website

`public/` is the directory in which you can put your `html`, `css`, `js`, `images` files, in case you want to host your app website on Craft for example :)
For example, you can add your Reacat app bundle or build on it.

##### Deploying to Craft

When you `git push` changes to the `master` branch of this repo, Craft automatically deploys the code to the servers that your app is working on. 

> Remember every push to the `master` branch triggers a deploy. If you want to push you changes without triggering of a deploy, you can push them to the `development` branch for example and when you are done with all the changes ... just merge with the `master` branch.

## Test Craft Cloud Code locally on your computer

So, you have created your first Craft app that comes with built in cloud code functionality and are now wondering what would be the best way to test it. Of course, one of the obvious solutions would be to do a `git push` every time, then test it through the API Console, another REST or GraphQL client, or your app directly. However, you and I both know that there has to be a better way, right?

## Run a local instance of Parse Server

Running a local instance of the Parse Server with your Cloud Code is the first step you should take as it will allow you to iterate on your app much faster and consequently allow us to debug it. Here's how:

### 1. Clone the source of your app

You can go to your Gitlab profile and find the repo of your app. It will be in `craft > [your project group] > [your app name] > cloud-code-app-name`

After you have the repo URL, go to your terminal and run `git clone`.





### 2. Install the npm modules of your app

This will require you to have **node.js** and **npm** installed on your system. We recommend **node.js v10.x** or later.



### 3. Open the directory in your favorite Editor/IDE

In this article, we will use Visual Studio Code.

#### 3.1. Configure your local Parse Server

Set your development environment by renaming ***.env.example*** to ***.env*** and adjust the necessary variables. Normally, you will only need to change the DATABASE_URI.

Make necessary adjusments to your ```parse-config.js``` if needed. Keep in mind that this configuration will **only** affect your local Parse Server. It will look something like this:

JavaScript

```javascript
module.exports = {
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  appId: process.env.APP_ID || 'myAppId',
  clientKey: process.env.CLIENT_KEY || 'myClientKey',
  masterKey: process.env.MASTER_KEY || 'masterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  javascriptKey: process.env.JAVASCRIPT_KEY || 'myJSKey',
  restAPIKey: process.env.REST_API_KEY || 'restAPIKey',
  cloud: process.env.PARSE_CLOUD_CODE || './cloud/main.js',
  liveQuery: {
    classNames: [] // List of classes to support for query subscriptions example: [ 'Posts', 'Comments' ]
  },
  verbose: false
}

```

Here, you can change things like your **Application Id** and **Master Key**. You will be running this Parse instance only locally, but it's still a good practice to change your **Master Key**. 

It's also recommended to run a local instance of MongoDB or PostgreSQL, **we recommend to use PostgreSQL.** 

In case you want to use the same data as your Craft app, you can simply import it in your local PostgreSQL. 

We are using [Adminer](https://www.adminer.org/), a DB management tool and we have a great tutorial on that - [Managing Database Using Adminer](https://serverpilot.io/docs/how-to-manage-your-database-with-adminer/). 

If you want to export/import data from your Craft app, you can use your Adminer credentials from your Craft app **Settings** page.



#### 3.2. Run it

After you have set it all up, it's time to run the Parse Server.:

```npm run dev```



#### 3.3. Check it

Check that everything is working as expected by running:

``curl localhost:1337/parse/health``

By the way, this is how the code for connecting a JavaScript SDK instance to your local server looks like, in case you would want to test some queries or test your mobile app. When connecting to Craft, you will need to go to your app **Settings** page

JavaScript

```javascript
Parse.initialize("YOUR_APP_ID", "YOUR_JAVASCRIPT_KEY");
Parse.serverURL = 'http://localhost:1337/parse/';
```
⚠️ If the Masterkey needs to be provided, use the following. Please note that the master key should only be used in safe environments and never on client side.

```javascript
Parse.initialize("YOUR_APP_ID", "YOUR_JAVASCRIPT_KEY", "YOUR_MASTERKEY");
//javascriptKey is required only if you have it on server.

Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse'
```

For more info on how to use Javascript SDK on client side, pls visit the official [Parse Javascript Guide](https://docs.parseplatform.org/js/guide/)

#### 3.4 Sample Cloud Code Function Query (via cURL)

Query ```parse/functions/<function-name>``` via POST

```bash
curl -X POST \
        -H "X-Parse-Application-Id: your-app-id" \
        -H "X-Parse-Master-Key: your-master-key" \
        http://localhost:1337/parse/functions/hello
{"result":"Hello! and welcome to Cloud Code Functions --from Craft Team"}%

```

#### 3.5 Graphql Playground

Go to http://localhost:1337/playground to access GraphQL Playground


## Using Parse Dashboard on your local machine

Install the dashboard from npm.

```
npm install -g parse-dashboard
```

You can launch the dashboard for an app with a single command by supplying an app ID, master key, URL, and name like this:

```
parse-dashboard --dev --appId yourAppId --masterKey yourMasterKey --serverURL "http://localhost:1337/parse" --appName optionalName

```
You may set the host, port and mount path by supplying the --host, --port and --mountPath options to parse-dashboard. You can use anything you want as the app name, or leave it out in which case the app ID will be used.

NB: the --dev parameter is disabling production-ready security features, do not use this parameter when starting the dashboard in production. This parameter is useful if you are running on docker.

After starting the dashboard, you can visit http://localhost:4040 in your browser.

## Using the Job Scheduler

This library is a minimalist tool that fetches all jobs scheduled objects and schedules cron tasks that will run the scheduled jobs.

Simply create your job, for example

```javascript
Parse.Cloud.job("myJob", (request) =>  {
      // params: passed in the job call
      // headers: from the request that triggered the job
      // log: the ParseServer logger passed in the request
      // message: a function to update the status message of the job object
      const { params, headers, log, message } = request;
      message("I just started");
      return doSomethingVeryLong(request);
    });
```

Then, go to your Craft Dashboard, and schedule that job (```myjob```) you have just created. 

## Using the Email templates

Built-in mail adapter for sending html email templates with Craft platform like (verificationEmail, passwordResetEmail) or a custom email template.

To start configuring email templates, please goto your Craft app Settings page and look for email templates section.

You can use {{paramater}} in your template (using handlebarsjs). See [handlebars documentation](https://handlebars-archive.knappi.org/) for more deatils.

Sample query via CURL:

```bash
curl -X POST \
-H "X-Parse-Application-Id: myAppId" \
-H "X-Parse-Master-Key: masterKey" \
-H "Content-Type: application/json" \
-d '{"to":"email@email.com", "subject": "Subject here", "templatePath": "template path", "templateData": {"data1": "value", "data2": "value"}}' \
http://localhost:1337/parse/functions/sendMail
```

## Updating and Deploying your changes

All changes to your code will be automatically deploy via Gitlab CI/CD workflow. 

To check if your deployment is finished and Cloud Code is up and running, pls use this URL to get the status:

```bash
<your cloud code URL>/health
```
And it will response:
```bash
{"status":"ok"}
```
