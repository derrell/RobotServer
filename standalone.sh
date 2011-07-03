#!/bin/bash

java \
  -Djava.library.path=. \
  -classpath 'jars-linux/*' \
  org.mozilla.javascript.tools.shell.Main $*

