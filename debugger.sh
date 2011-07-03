#!/bin/sh

java \
  -Djava.library.path=. \
  -classpath 'jars.linux/*' \
  org.mozilla.javascript.tools.debugger.Main bootstrap.js
