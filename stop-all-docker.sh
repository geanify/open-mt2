#!/bin/bash

# Stop all running containers
echo "Stopping all running containers..."
docker stop $(docker ps -q)

# Remove all containers
echo "Removing all containers..."
docker rm $(docker ps -aq)

# Remove all unused networks
echo "Removing all unused networks..."
docker network prune -f

# (Optional) Remove all unused volumes
# Uncomment the next two lines if you want to remove all unused volumes as well
# echo "Removing all unused volumes..."
# docker volume prune -f

echo "All Docker containers and networks stopped and removed." 