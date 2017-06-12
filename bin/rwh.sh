#!/bin/sh

ED="$(dirname $0)/rwh.js ${@:2}";
echo $ED;
GED="$GIT_EDITOR";
export GIT_EDITOR=$ED;
git rebase -i $1
export GIT_EDITOR=$GED;
