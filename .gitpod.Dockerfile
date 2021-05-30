FROM gitpod/workspace-postgres

USER root

RUN mkdir -p /var/lib/pgadmin && \
    mkdir -p /var/log/pgadmin && \
    chown gitpod /var/lib/pgadmin && \
    chown gitpod /var/log/pgadmin

RUN apt-get update && \
    apt-get install -y libgtk-3-0 libx11-xcb1 libnss3 libxss1 libasound2 build-essential libssl-dev libffi-dev libgmp3-dev python3-virtualenv libpq-dev python3-dev netcat && \
    apt-get clean

RUN pip install pgadmin4

RUN touch config_distro.py
RUN echo "import mimetypes\nmimetypes.add_type('text/javascript', '.js')\nHELP_PATH = '../../docs/en_US/_build/html/'\nMINIFY_HTML = False" >> config_distro.py
RUN bash -l -c 'cp config_distro.py $(find /home/gitpod/.pyenv/versions -name config_distro.py | grep pgadmin4)'

USER gitpod
