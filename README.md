[![bitHound Overalll Score](https://www.bithound.io/github/sematext/spm-agent-mongodb/badges/score.svg)](https://www.bithound.io/github/sematext/spm-agent-mongodb) [![Build Status](https://travis-ci.org/sematext/spm-agent-mongodb.svg?branch=master)](https://travis-ci.org/sematext/spm-agent-mongodb)

This is the MongoDB monitoring Agent for [SPM Performance Monitoring](http://sematext.com/spm/)

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

# In case you use Sematext Cloud EU (https://apps.eu.sematext.com): 
#   configure the API endpoints for EU. 
#   The  following commands create the file /etc/sematext/receivers.config: 
# sudo spm-mongodb-setup -r EU 
#   Note: To switch back to Sematext US region use
# sudo spm-mongodb-setup -r US # default for apps.sematext.com

# Install systemd or upstart service file for spm-agent-mongodb
# Create an SPM App of type MongoDB in Sematext UI 
# and use your SPM Token:
sudo spm-mongodb-setup -t SPM_TOKEN -m mongodb://localhost:27017/local

# or to specify the username and password for the agent to use to connect to MongoDB
sudo spm-mongodb-setup -t SPM_TOKEN -m mongodb://UsernameHere:PasswordHere@localhost:27017/DbNameHere
```
Note that the monitoring agent requires admin rights to query the relevant tables. It should have ClusterAdmin role and read access to any DB.

# Configuration 

The setup script will store your configuration in /etc/sematext/spm-agent-mongodb.config 

If you with to change the settings later edit /etc/sematext/spm-agent-mongodb.config. 
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

## Setup on Docker

The MongoDB agent is integrated in [SPM-Client docker image](https://hub.docker.com/r/sematext/spm-client/).
The relevant SPM_CONFIG string ist: 
```mongodb SPM_TOKEN MONGODB_URL```. 

Run SPM-Client, replace the SPM Token and MongoDB URL with your configuration: 
```
docker run --name spm-client --restart=always -v /var/run/docker.sock:/var/run/docker.sock -e SPM_CONFIG="mongodb YOUR_SPM_MONGODB_TOKEN mongodb://mongodbUser:mogodbPassword@mongodb-server:port/database" sematext/spm-client
```

Docker-Compose example with SPM-Client and MongoDB server: [docker-compose.yml](https://github.com/sematext/docker-spm-client/blob/master/examples/mongodb/docker-compose.yml). 

# Results

![Metrics Overview](https://sematext.files.wordpress.com/2015/12/mongodb_overview.png)

More Information: 
- [Announcement blog post](http://blog.sematext.com/2015/12/16/mongodb-monitoring/) 
- [MongoDB reports video](https://www.youtube.com/watch?v=BIERrXzbiNM) 

# Support 

- Twitter: [@sematext](http://www.twitter.com/sematext)
- Blog: [blog.sematext.com](http://blog.sematext.com)
- Homepage: [www.sematext.com](http://www.sematext.com)
