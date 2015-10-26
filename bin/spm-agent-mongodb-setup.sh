# /usr/bin/env bash
export SERVICE_NAME=spm-agent-mongodb.service
export SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}"
function generate_file() 
{
	echo -e "[Unit]\nDescription=SPM for MongoDB\nAfter=network.target\n[Service]\nRestart=always\nRestartSec=10 \nType=simple\n
	ExecStart=$1 $2 $3\n[Install]\n
	WantedBy=multi-user.target" > $SERVICE_FILE

	echo "Service file $SERVICE_FILE:"
	cat $SERVICE_FILE
	systemctl enable $SERVICE_NAME
	sleep 3 
	systemctl status $SERVICE_NAME
}


if [[ -n "$1" && -n "$2" ]] ; then 
  token=$1
  mongodb=$2
	command=$(which spm-mongodb)
  generate_file $command $token $mongodb;
else 
	echo "Missing paramaters. Usage:"
	echo "spm-agent-mongodb-setup.sh SPM_TOKEN MONGODB_URL (mongodb://dbuser:dbpassword@localhost:27017"
	echo "Please obtain your application token from https://apps.sematext.com/"
	read -p "SPM Token:" token
	token=${token:-none}
	read -p "MongoDB URL user:pass@host:port/db (localhost:27017/local):" mongodb
	mongodb=${mongodb:-mongodb://localhost:27017/local}
	command=$(which spm-mongodb)
  generate_file $command $token $mongodb;
fi 