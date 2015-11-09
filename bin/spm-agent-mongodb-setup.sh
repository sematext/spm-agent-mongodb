#!/usr/bin/env bash

SERVICE_NAME=spm-agent-mongodb
SYSTEMD_SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
UPSTART_SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

function generate_upstart()
{
echo -e "description \"SPM for MongoDB\"
start on runlevel [2345]
stop on runlevel [06]
respawn
env SPM_MONGODB_URL=$3
env SPM_TOKEN=$2
chdir  /tmp
exec $1 $2 $3" > /etc/init/${SERVICE_NAME}.conf
CMD="service restart ${SERVICE_NAME}"
echo $CMD
sudo $CMD
}

function generate_systemd() 
{
echo -e \
"
[Unit]
Description=SPM for MongoDB
After=network.target

[Service]
Restart=always\nRestartSec=10
ExecStart=$1 $2 $3

[Install]
WantedBy=multi-user.target" > $SYSTEMD_SERVICE_FILE

echo "Service file $SERVICE_FILE:"
cat $SYSTEMD_SERVICE_FILE
systemctl enable $SERVICE_NAME
systemctl stop $SERVICE_NAME > /dev/null
systemctl start $SERVICE_NAME
}

function install_script ()
{
	if if [[ `/sbin/init --version` =~ upstart ]]>/dev/null; then 
		echo "Generate upstart script ${UPSTART_SERVICE_FILE}"
		generate_upstart $1 $2 $3 	
		return
	fi
	if [[ `systemctl` =~ -\.mount ]]; then 
		echo "Generate systemd script "
		generate_systemd $1 $2 $3 
		return 
	fi
}

if [[ -n "$1" && -n "$2" ]] ; then 
  token=$1
  mongodb=$2
	command=$(which spm-mongodb)
  install_script $command $token $mongodb;
else 
	echo "Missing paramaters. Usage:"
	echo " spm-agent-mongodb-setup.sh SPM_TOKEN MONGODB_URL (mongodb://dbuser:dbpassword@localhost:27017/admin)"
	echo "Please obtain your application token from https://apps.sematext.com/"
	read -p "SPM Token: " token
	token=${token:-none}
	read -p "MongoDB URL (mongodb://localhost:27017/admin):" mongodb
	mongodb=${mongodb:-mongodb://localhost:27017/local}
	command=$(which spm-mongodb)
  install_script $command $token $mongodb;
fi 