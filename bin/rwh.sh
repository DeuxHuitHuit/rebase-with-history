#!/bin/sh

ED="$(dirname $0)/rwh.js";
echo $ED;
GED="$GIT_EDITOR";

for i in "$@"
do
case $i in
	--continue)
		shift # past argument=value
		export GIT_EDITOR="${ED}";
		git rebase --continue
	;;
	--version)
		node $ED --version;
		exit;
	;;
	--help)
		node $ED --help;
		exit;
	;;
	*)
		export GIT_EDITOR="${ED} ${@:2}";
		git rebase -i $1
	;;
esac
done

export GIT_EDITOR=$GED;
