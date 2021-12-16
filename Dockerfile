# PLEASE NOTE THAT THIS DOCKERFILE IS USED DURING DEPLOYMENT SO PLEASE BE CAREFUL WHEN MODIFYING THIS FILE.
# ANY CHANGES HERE WILL AFFECT THE DEPLOYED APP IN OUR PLATFORM.

FROM docker.io/library/node:14-alpine as build
# Install git
RUN apk add --no-cache git
RUN apk add --no-cache curl
ARG BUILD_DIR=/opt/app-root/src/

# Create app directory
WORKDIR $BUILD_DIR

COPY . $BUILD_DIR

# Override the index.js and parse.config.js
RUN curl https://raw.githubusercontent.com/rcdelacruz/s2i-cloud-code-v2/main/root/opt/app-root/etc/parse/src/index.js > index.js
RUN curl https://raw.githubusercontent.com/rcdelacruz/s2i-cloud-code-v2/main/root/opt/app-root/etc/parse/src/parse.config.js > parse.config.js


# Install app dependencies
RUN npm install
RUN npm install --save @parse/s3-files-adapter

FROM docker.io/library/node:14-alpine as prod

ARG APP_DIR=/opt/app-root/src/
WORKDIR $APP_DIR
RUN chgrp -R 0 $APP_DIR && \
  chmod -R g=u $APP_DIR

COPY --from=build /opt/app-root/src/ .

EXPOSE 1337
CMD [ "npm", "start" ]
