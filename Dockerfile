FROM docker.io/library/node:14-alpine as build
# Install git
RUN apk add --no-cache git
ARG BUILD_DIR=/opt/app-root/src/

# Create app directory
WORKDIR $BUILD_DIR

COPY . $BUILD_DIR

# Install app dependencies
RUN npm install

FROM docker.io/library/node:14-alpine as prod

ARG APP_DIR=/opt/app-root/src/
WORKDIR $APP_DIR
RUN chgrp -R 0 $APP_DIR && \
  chmod -R g=u $APP_DIR

COPY --from=build /opt/app-root/src/ .

EXPOSE 1337
CMD [ "npm", "start" ]
