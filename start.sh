#!/bin/bash
set -e

echo "Starting Wavy server..."
cd client
node dist/index.js
