#!/usr/bin/env node

'use strict';

const fs = require('fs');
const stream = require('stream');
const es = require('event-stream');
const yargs = require('yargs');

if (process.argv.length !== 3) {
	throw new Error(`Wrong count of arguments (${process.argv.length})`);
}

const file = process.argv[2];
const RWH_NEXT_PICK = file.replace(/^(.+)\.git\/(.+)$/,'$1.git/RWH_NEXT_PICK');
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
			const lastLine = lines[lastIndex];
			if (lastLine.length != 0) {
				lines.push('');
			}
			if (lastLine.indexOf(pickPrefix) !== 0) {
				lines[lastIndex] += `${pickPrefix} ${commit}`;
			} else {
				lines[lastIndex] = `${pickPrefix} ${commit}`;
			}
		},
		end: function () {
			fs.unlinkSync(`${RWH_NEXT_PICK}`);
			console.log('Commit reword\'ed successfully');
		}
	},
	rebase: {
		line: function (line) {
			line = line.replace(/^pick ([a-f0-9]+) (.+)$/, `x sh -c "echo $1 > ${RWH_NEXT_PICK}"\nr $1 $2`);
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