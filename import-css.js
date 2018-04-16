/*
 * Copied with a little modifications from github.com/faceyspacey/babel-plugin-dual-import
 */

var ADDED = {};

function importCss(chunkName) {
	var href = getHref(chunkName)
	if (!href) {
		if (process.env.NODE_ENV === 'development') {
			if (typeof window === 'undefined' || !window.__CSS_CHUNKS_HASH__) {
				console.warn('[DUAL-IMPORT] no css chunks hash found at "window.__CSS_CHUNKS_HASH__"');
			} else {
				console.warn('[DUAL-IMPORT] css chunk "' + chunkName + '" not found in "window.__CSS_CHUNKS_HASH__"');
			}
		}
		return Promise.resolve();
	}

	if (ADDED[href] === true) {
		return Promise.resolve();
	}
	ADDED[href] = true;

	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');

	link.href = href;
	link.charset = 'utf-8';
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.timeout = 30000;

	return new Promise(function(resolve, reject) {
		var timeout;
		var img;

		function onload() {
			// Check if we created the img tag.
			// If we did then the chunk was loaded via img.src
			// and we need to set the link.href which will then
			// load the resource from cache
			if (img) {
				link.href = href;
				img.onerror = null; // avoid mem leaks in IE.
			}
			link.onerror = null; // avoid mem leaks in IE.
			clearTimeout(timeout);
			resolve();
		}

		link.onerror = function() {
			link.onerror = link.onload = null; // avoid mem leaks in IE.
			clearTimeout(timeout);
			var message = 'could not load css chunk: ' + chunkName;
			reject(new Error(message));
		}

		if (isOnloadSupported() && 'onload' in link) {
			link.onload = onload;
			link.href = href;
		} else {
			// Use img.src as a fallback to loading the css chunk in browsers
			// which don’t support link.onload
			// We use the img.onerror handler because an error will always fire
			// when parsing the response
			// Then we know the resource has been loaded
			img = document.createElement('img');
			img.onerror = onload;
			img.src = href;
		}

		timeout = setTimeout(link.onerror, link.timeout)
		head.appendChild(link)
	});
}

function getHref(chunkName) {
	if (typeof window === 'undefined' ||
			!window.__CSS_CHUNKS_HASH__ ||
			!window.__CSS_CHUNKS_HASH__[chunkName]) {
		return null;
	}
	if (document.dir === 'rtl') {
		return window.__CSS_CHUNKS_HASH__[chunkName]['rtl'];
	}
	return window.__CSS_CHUNKS_HASH__[chunkName]['default'];
}

// Checks whether the browser supports link.onload
// Reference: https://pie.gd/test/script-link-events/
function isOnloadSupported() {
	var userAgent = navigator.userAgent;
	var supportedMajor = 535;
	var supportedMinor = 24;
	var match = userAgent.match(/\ AppleWebKit\/(\d+)\.(\d+)/);
	if (match) {
		var major = +match[1];
		var minor = +match[2];
		return (
			(major === supportedMajor && minor >= supportedMinor) ||
			major > supportedMajor
		);
	}
	// All other browsers support it
	return true;
}

exports.importCss = importCss;
