#!/bin/bash
set -ex

eval $(gp env --export)

if [ -z "$PGADMIN_DEFAULT_EMAIL" ] ; then
    gp env PGADMIN_DEFAULT_EMAIL=pgadmin@gitpod.io
fi

if [ -z "$PGADMIN_DEFAULT_PASSWORD" ] ; then
    gp env PGADMIN_DEFAULT_PASSWORD=postgres
fi

eval $(gp env --export)

export AUTOMATED=1
export PGADMIN_SETUP_EMAIL=pgadmin@gitpod.io
export PGADMIN_SETUP_PASSWORD=postgres
export PGADMIN_CONFIG_DEFAULT_SERVER=0.0.0.0
export PGADMIN_LISTEN_ADDRESS=0.0.0.0
export PGADMIN_SERVER_JSON_FILE=./.gitpod/server.json

/home/gitpod/.pyenv/shims/pgadmin4 &

# wait for pgadmin to start
while ! nc -z localhost 5050; do   
  sleep 1
done

SETUP_SCRIPT_PATH=$(find /home/gitpod/.pyenv/versions -name setup.py | grep pgadmin4)

/home/gitpod/.pyenv/shims/python $SETUP_SCRIPT_PATH  \
    --load-servers $PGADMIN_SERVER_JSON_FILE \
    --user pgadmin@gitpod.io

echo "pgAdmin4 configured with credentials:
$(gp env | grep PGADMIN_DEFAULT)"
