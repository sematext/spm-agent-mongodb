This is the MongoDB monitoring Agent for [SPM Performance Monitoring]([SPM Docker Monitoring](http://sematext.com/spm/)
[![bitHound Overalll Score](https://www.bithound.io/github/sematext/spm-agent-mongodb/badges/score.svg)](https://www.bithound.io/github/sematext/spm-agent-mongodb) [![Build Status](https://travis-ci.org/sematext/spm-agent-mongodb.svg?branch=master)](https://travis-ci.org/sematext/spm-agent-mongodb)

Work in progress ... 

# Preparation 

1. [Install Node.js](https://nodejs.org/en/download/package-manager/) 
2. The MongoDB driver might need libkrb5-dev for Kerberos authentication
```
apt-get install libkrb5-dev
```

3. Setup 

```sh
# Install spm-agent-mongodb 
npm i sematext/spm-agent-mongodb -g
# Install systemd or upstart service file for spm-agent-mongodb
spm-mongodb-setup SPM_TOKEN mongodb://localhost:27017/local
```

4. Configuration 

The setup script will store your configuration in /etc/spmagent/spm

Command line:
```
spm-agent-mongodb TOKEN MONGODB_URL
```


