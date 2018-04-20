#!/usr/bin/env node

'use strict';

const pkg = require('../package.json');
const fs = require('fs');
const stream = require('stream');
const es = require('event-stream');
const yargs = require('yargs');
const argv = yargs
	.demand(1)
	.usage('Usage: rwh [branch]\n       rwh [--option]')
	.help('h')
	.alias('h', ['?', 'help'])
	.showHelpOnFail(true)
	.boolean('continue')
	.describe('continue', 'Continue the rebase operation')
	.boolean('skip')
	.describe('skip', 'Skip the current commit and continue')
	.boolean('next')
	.describe('next', 'Commits the current index and continue the rebase operation')
	.version(pkg.version + '\n')
	.argv;

const file = argv._[0];
const GIT_FOLDER_REGEXP = /^(.+)\.git\/(.+)$/;
const RWH_NEXT_PICK = file.replace(GIT_FOLDER_REGEXP,'$1.git/RWH_NEXT_PICK');
let endReached = false;
let lineNr = 0;
const lines = [];
const pickPrefix = 'Picked from';
let strategy;
const strategies = {
	reword: {
		line: function (line) {
			lines.push(line);
		},
		endReached: function () {
			var commit = fs.readFileSync(RWH_NEXT_PICK);
			if (!commit) {
				throw new Error(`File ${RWH_NEXT_PICK} is empty`);
			}
			const lastIndex = lines.length - 1;
			let lastLine = lines[lastIndex];
			// Make sure we have an empty line at the end
			if (lastLine.length !== 0 && !/^\s*$/.test(lastLine)) {
				console.info('Added missing empty line');
				lines.push('');
			} else {
				console.info('Last line is empty: no need to add one.');
				lastLine = lines[lastIndex - 1];
			}
			// Append line if last line is not a pick
			if (lastLine.indexOf(pickPrefix) !== 0) {
				console.info('Last line is NOT a pick');
				lines.push(`${pickPrefix} ${commit}`);
			} else {
				console.info('Last line is a pick');
				lines[lastIndex] = `${pickPrefix} ${commit}`;
			}
		},
		end: function () {
			fs.unlinkSync(RWH_NEXT_PICK);
			console.log(`Commit reworded successfully`);
		}
	},
	rebase: {
		line: function (line) {
			line = line.replace(/^pick ([a-f0-9]+) (.+)$/, `x sh -c "echo $1 > '${RWH_NEXT_PICK}'"\nr $1 $2`);
			lines.push(line);
		},
		endReached: function () {},
		end: function () {
			console.log('Rebase edited successfully.');
		}
	}
};
const s = fs.createReadStream(file)
	.pipe(es.split())
	.pipe(es.map(function (line, nextLine) {
		// pause the readstream
		s.pause();
		
		if (!strategy) {
			strategy = line.indexOf('pick') === 0 ? 'rebase' : 'reword';
		}
		if (!endReached && line.indexOf('#') === 0) {
			endReached = true;
			strategies[strategy].endReached();
		}
		
		lineNr += 1;
		
		if (endReached) {
			lines.push(line);
		} else {
			strategies[strategy].line(line);
		}
		
		// resume
		s.resume();
		
		// next
		nextLine();
	})
	.on('error', function (err) {
		throw new Error('Error while reading file: ' + file + ' ' + err.message);
	})
	.on('end', function () {
		const data = lines.join('\n');
		console.log(data);
		fs.writeFileSync(file, data);
		
		if (strategy) {
			strategies[strategy].end();
		} else {
			throw new Error('Empty file');
		}
	}));

require('update-notifier')({pkg}).notify();

