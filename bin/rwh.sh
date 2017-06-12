#!/bin/sh

ED="./rwh.js";
GED="$GIT_EDITOR";
export GIT_EDITOR=$ED;
git rebase -i $@
export GIT_EDITOR=$GED;
