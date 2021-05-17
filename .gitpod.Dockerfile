FROM gitpod/workspace-postgres
RUN sudo apt-get update && sudo apt-get install -y libgtk-3-0 libx11-xcb1 libnss3 libxss1 libasound2 python3-virtualenv libpq-dev python3-dev netcat

RUN pip install pgadmin4
