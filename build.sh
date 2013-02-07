#!/bin/bash

set -ex

UGLIFY=node_modules/uglify-js/bin/uglifyjs
UGLIFY_OPTS="-b -n 4"

echo -n "(function() {"
"$UGLIFY" $UGLIFY_OPTS -- "$@"
echo
echo "})();"
