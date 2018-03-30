# dynamic-dual-import-webpack-plugin
Makes dual import (js chunk + css chunk) for dynamic import and require.ensure.

It works in cooperation with <a href="https://www.npmjs.com/package/extract-css-chunks-webpack-plugin">extract-css-chunks-webpack-plugin</a>.

# How to setup
**1.** Add plugins to webpack.config.js:

```js
var ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');
var DynamicDualImportPlugin = require('dynamic-dual-import-webpack-plugin');
// ...
module.exports = {
  plugins: [
    // ...
    new ExtractCssChunksPlugin({
      filename: '[name].css'
    }),
    new DynamicDualImportPlugin({
      cssChunksHashFilename: 'css_chunks_hash.js'
    }),
    // ...
  ]
};
```

**2.** Add loaders to webpack.plugin.js:

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.ts$/,  // for example
        use: [
          DynamicDualImportPlugin.loader({
            processRequireEnsure: true  // if you need process both `import()` and `require.ensure`
                // by default only `import()`
          }),
          {
            loader: 'ts-loader'
          },
          // ...
        ]
      },
      // ...
```

**3.** Include chunks hash into your html:

```html
<head>
  ...
  <script type="text/javascript" src="/my_public_path/css_chunks_hash.js"></script>
</head>
```

**4.** After this `import()` and `require.ensure` will automatically import both .js and .css chunks.

**But** format have to be:

```js
import(
  /* webpackChunkName: "my-chunk-name" */  // chunk name is mandatory!
  './my-module'
).then((m) => {
  m.doSomething();
});

require.ensure([], (require) => {
  const m = require('./my-module');
  m.doSomething();
}, 'my-chunk-name');  // chunk name is mandatory!
```
