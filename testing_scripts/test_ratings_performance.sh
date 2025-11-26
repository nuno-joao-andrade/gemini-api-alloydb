#!/bin/bash

# Default host
HOST="http://localhost:3000"

# Check if a host is provided as an argument
if [ ! -z "$1" ]; then
  HOST="$1"
fi

ENDPOINT="/api/ratings?limit=10"
URL="${HOST}${ENDPOINT}"

echo "Running hey load test against: ${URL}"

# Run hey command
hey -n 5000 -c 50 "${URL}"
