[![bitHound Overalll Score](https://www.bithound.io/github/sematext/spm-agent-mongodb/badges/score.svg)](https://www.bithound.io/github/sematext/spm-agent-mongodb) [![Build Status](https://travis-ci.org/sematext/spm-agent-mongodb.svg?branch=master)](https://travis-ci.org/sematext/spm-agent-mongodb)

This is the MongoDB monitoring Agent for [SPM Docker Monitoring](http://sematext.com/spm/)

# Preparation 

1. Get a free account at [sematext.com/spm](https://apps.sematext.com/users-web/register.do)  
2. [Create an SPM App](https://apps.sematext.com/spm-reports/registerApplication.do) of type "MongoDB" and copy the SPM Application Token - or execute the commands displayed in the Sematext UI (which are described here as well)

3. [Install Node.js](https://nodejs.org/en/download/package-manager/) on your MongoDB server
4. The MongoDB driver might need libkrb5-dev for Kerberos authentication (if you use Kerberos ...)
```
apt-get install libkrb5-dev
```
# Setup 
```sh
# Install spm-agent-mongodb 
npm i spm-agent-mongodb -g
# Install systemd or upstart service file for spm-agent-mongodb
spm-mongodb-setup SPM_TOKEN mongodb://localhost:27017/local
```
# Configuration 

The setup script will store your configuration in /etc/spmagent/config 

In case you like to change settings later edit /etc/spmagent/config 
Then restart the SPM MongoDB Agent after config changes, depending on the init system:
- Upstart (Ubuntu):  
```
    sudo service spm-agent-mongodb restart 
```
- Systemd (Linux others):  
```
    sudo systemctl stop spm-agent-mongodb
    sudo systemctl start spm-agent-mongodb
```
- Launchd (Mac OS X): 
```
    sudo launchctl stop com.sematext.spm-agent-mongodb
    sudo launchctl stop com.sematext.spm-agent-mongodb
```

For tests you can just run the agent from command line:
```
spm-agent-mongodb SPM_TOKEN MONGODB_URL
```

# Results

![](https://sematext.files.wordpress.com/2015/12/mongodb_overview.png)
More Information: 
- [Announcement blog post](https://sematext.files.wordpress.com/2015/12/mongodb_overview.png) 
- [MongoDB reports video](https://www.youtube.com/watch?v=BIERrXzbiNM) 

# Support 

- Twitter: [@sematext](http://www.twitter.com/sematext)
- Blog: [blog.sematext.com](http://blog.sematext.com)
- Homepage: [www.sematext.com](http://www.sematext.com)

