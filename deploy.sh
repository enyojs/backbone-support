#!/bin/bash

SOURCE=$(cd `dirname $0`; pwd)

# target location
TARGET=$1

if [ x$TARGET = x ]; then
  
cat <<EOF
Must supply target folder paramter, e.g.:

  deploy.sh ../deploy/lib/mvc
EOF
else
  mkdir -p $TARGET/foss/backbone
  mkdir -p $TARGET/foss/underscore
  cp $SOURCE/foss/backbone/backbone-min.js $TARGET/foss/backbone/backbone.js
  cp $SOURCE/foss/underscore/underscore-min.js $TARGET/foss/underscore/underscore.js
  for dir in "controllers" "ext" "models" "views"
  do
    cp -r $SOURCE/$dir $TARGET/
  done
  cp $SOURCE/package.js $TARGET/
fi