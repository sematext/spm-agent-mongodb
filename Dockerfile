FROM mhart/alpine-node:4
RUN apk update && apk add --update procps git curl coreutils && rm -rf /var/cache/apk/*
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN npm install -g

CMD spm-agent-mongodb
