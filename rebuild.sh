#!/bin/bash

./stop.sh

docker-compose -f docker-compose.yml up -d

sleep 20

bun run migrate

./run.sh
