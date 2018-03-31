'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

let options;

const PATTERN_DYNAMIC_IMPORT = /([^a-z0-9_])(import\(\s*\/\*\s*webpackChunkName: (['"][a-z0-9\-_\.]+['"])\s*\*\/\s*['"][a-z0-9\-_\/\.]+['"]\s*(?:\/\/.*?\s*)*\))/ig;
const PATTERN_REQUIRE_BEGIN = /require\.ensure\([\s\/]*\[['"a-z0-9\-_,\.\s\/]*\][^{]+{/i;
const PATTERN_REQUIRE_END = /^}(?:[\s]*\.[\s]*bind\([a-z0-9_,\.\s\/]+\))?,[\s]*(['"][a-z0-9\-_\.]+['"])(?:\s*\/\*.+?\*\/\s*)*[\s]*\)/i;

module.exports = function(source) {
	options = loaderUtils.getOptions(this) || {};

	const processors = [processDynamicImport];
	if (options.processRequireEnsure) {
		processors.push(processRequireEnsure);
	}
	let processed = 0;
	for (let i in processors) {
		const res = processors[i](source);
		if (res.processed > 0) {
			processed += res.processed;
			source = res.source;
		}
	}
	if (processed > 0) {
		source = insertHelperImportLine(source);
	}

	return source;
};

function processDynamicImport(source) {
	let processed = 0;

	source = source.replace(
		PATTERN_DYNAMIC_IMPORT,
		function() {
			processed++;
			const pre = arguments[1];
			const dynamicImport = arguments[2];
			const chunkName = arguments[3];
			return pre +
					'Promise.all([' +
					dynamicImport + ',' +
					'importCss(' + chunkName + ')' +
					']).then(promises => promises[0])';
		}
	);

	return {
		source: source,
		processed: processed
	};
}

function processRequireEnsure(source) {
	let processed = 0;

	let start = 0;
	while (true) {
		if (start >= source.length) {
			break;
		}
		const match = source.slice(start).match(PATTERN_REQUIRE_BEGIN);
		if (!match) {
			break;
		}
		const requireStart = start + match.index;
		const funcBodyStart = start + match.index + match[0].length;
		start = funcBodyStart;

		let sourceFuncBody = source.slice(funcBodyStart)
		let braces = 1
		let funcBodyEnd = -1;
		for (let i = 0; i < sourceFuncBody.length; i++) {
			if (sourceFuncBody[i] == '{') {
				braces++;
			}
			if (sourceFuncBody[i] == '}') {
				braces--;
			}
			if (braces == 0) {
				funcBodyEnd = funcBodyStart + i;
				break;
			}
		}
		if (funcBodyEnd > 0) {
			const matchName = source.slice(funcBodyEnd).match(PATTERN_REQUIRE_END);
			if (matchName) {
				processed++;
				const requireEnd = funcBodyEnd + matchName[0].length;
				const chunkName = matchName[1];
				const importCss = 'importCss(' + chunkName + ')';
				const sourceBefore = source.slice(0, requireStart);
				const sourceRequireEnsure = source.slice(requireStart, requireEnd);
				const sourceAfter = source.slice(requireEnd);
				source = sourceBefore +
						importCss + '.then(function(){' + sourceRequireEnsure + ';}.bind(this))' +
						sourceAfter;
				start = start + importCss.length;
			}
		}
	}

	return {
		source: source,
		processed: processed
	};
}

function insertHelperImportLine(source) {
	const lines = source.split('\n');
	let insertBeforeLine = 0;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.trim().length === 0) {
			continue;
		}
		if (/^'use strict'/.test(line.trim())) {
			continue;
		}
		if (/^\/\//.test(line.trim())) {
			continue;
		}
		if (/^\/?\*/.test(line.trim())) {
			continue;
		}
		insertBeforeLine = i;
		break;
	}

	lines.splice(insertBeforeLine, 0, helperImport());
	source = lines.join('\n');

	return source;
}

function helperImport() {
	const importCss = path.join(__dirname, 'import-css.js');
	if (options.useES6Import) {
		return 'import { importCss } from \'' + importCss + '\';';
	} else {
		return 'var importCss = require(\'' + importCss + '\').importCss;';
	}
}
