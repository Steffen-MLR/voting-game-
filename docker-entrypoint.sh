#!/bin/sh
set -e

# Start the Next.js app in the background
npm start &

# Start the additional WebSocket server
node dist/server.mjs
