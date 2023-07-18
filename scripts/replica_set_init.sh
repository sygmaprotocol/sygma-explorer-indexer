#!/bin/bash

set -e
set -u
# set -x	# Uncomment for debugging

_config=\
'
{ "_id": "my-replica-set", "version": 1, "members": [ { "_id": 0, "host": "mongo1:30001", "priority": 2 }, { "_id": 1, "host": "mongo2:30002", "priority": 0 }, { "_id": 2, "host": "mongo3:30003", "priority": 0 }] }
'

sleep 5;


if [[ -n "${DB_USERNAME:-}" && -n "${DB_PASSWORD:-}" ]]; then
	mongosh --quiet \
	--host mongo1 --port 30001 \
	-u $DB_USERNAME -p $DB_PASSWORD \
	--authenticationDatabase admin \
	<<-EOF
		rs.initiate($_config);
	EOF
else
	mongosh --quiet \
	--host mongo1 --port 30001 \
	<<-EOF
		rs.initiate($_config);
	EOF
fi

exec "$@"
