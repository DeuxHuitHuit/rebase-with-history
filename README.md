# Rebase With History ![David DM](https://david-dm.org/DeuxHuitHuit/rebase-with-history.png) [![npm version](https://badge.fury.io/js/rwh.svg)](http://badge.fury.io/js/rwh)

> Simple tool that adds the picked commit into the commit message

## Installation

```
npm i -g rwh
```

## WTF?

Fan of `git rebase` but you do not want to loose the original commit since people complained on it on github?
`rwh` has your covered.

It is a simple wrapper around the `git rebase` command, that will temporarily replace your `$GIT_EDITOR` with a automated one. This "editor" will reword the original commit and insert a new paragraph with the original commit sha1 reference. You use it the same way as with git, i.e. `rwh master`. It can be run multiple times.

```
Usage: rwh [branch]
       rwh [--option]

Options:
  -h, -?, --help  Show help                            [boolean]
  --continue      Continue the rebase operation        [boolean]
  --skip          Skip the current commit and continue [boolean]
  --next          Commits the current index and continue the rebase operation [boolean]
  --version       Show version number                  [boolean]
```

## Example

```
commit 53a499cb36d75446f4bcbcc5c80f6abb8e78f361
Author: nitriques <nitriques@users.noreply.github.com>
Date:   Tue Jun 13 22:34:25 2017 -0400

    Better usage message
    
    Picked from 46f4bcbcc
    
```

## Requirements

1. Bash
2. Node

### LICENSE

[MIT](https://deuxhuithuit.mit-license.org)    
Made with love in Montréal by [Deux Huit Huit](https://deuxhuithuit.com)    
Copyrights (c) 2017
