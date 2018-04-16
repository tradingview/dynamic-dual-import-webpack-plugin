'use strict';

function DynamicDualImportPlugin(options) {
	this.options = options || {};
}

DynamicDualImportPlugin.prototype.apply = function(compiler) {
	const publicPath = compiler.options.output.publicPath;

	compiler.plugin("emit", (compilation, callback) => {
		const cssChunksHash = {};
		const cssFilePatt = /\.css$/;
		const cssRTLFilePatt = /\.rtl\.css$/;
		for (let i = 0; i < compilation.chunks.length; i++) {
			const chunk = compilation.chunks[i];
			const name = chunk.name || chunk.id;
			if (name) {
				for (let j = 0; j < chunk.files.length; j++) {
					var filename = chunk.files[j];
					if (cssFilePatt.test(filename)) {
						var fullPath = publicPath + filename;
						if (!cssChunksHash[name]) {
							cssChunksHash[name] = {};
						}
						if (cssRTLFilePatt.test(filename)) {
							cssChunksHash[name]['rtl'] = fullPath;
						} else {
							cssChunksHash[name]['default'] = fullPath;
						}
					}
				}
			}
		}

		const hashSource = 'window.__CSS_CHUNKS_HASH__ = ' + JSON.stringify(cssChunksHash) + ';';
		compilation.assets[this.options.cssChunksHashFilename || 'css_chunks_hash.js'] = {
			source: () => {
				return hashSource;
			},
			size: () => {
				return hashSource.length;
			}
		};

		callback();
	});
};

DynamicDualImportPlugin.loader = function(options) {
	return {
		loader: require.resolve('./loader'),
		options: options
	};
};

module.exports = DynamicDualImportPlugin;
