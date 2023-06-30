#!/bin/bash

# Start Node.js script
node_script="/path/to/your/node/script.js"
node "$node_script" &

# Open local HTML file in default browser
html_file="/path/to/your/local/file.html"
xdg-open "$html_file"

# Wait for the Node.js script to finish
wait
