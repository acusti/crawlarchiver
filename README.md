# wbdl

crawl and archive a website and all its pages as plain HTML files organized
in directories to match the URL structure of the website.

the simplest intended usage is as a shell script:

```
npx wbdl https://websitetoarchive.net
```
this will print out the path to the folder containing the website archive that is created on your filesystem. you can also have the utility open up the resulting folder via the `--open` CLI flag:
```
npx wbdl --open https://another.website.org
```

the utility can also be installed as a node.js package and invoked programatically. to install via npm:
```
npm install --save wbdl
```
or yarn:
```
yarn add wbdl
```

then to import and use it:
```
import { wbdl } from 'wbdl';

const pathToArchive = await wbdl(urlString);
```

here’s the jsdoc signature for the `wbdl` function (using typescript’s jsdoc type annotations):
```js
/**
 * Takes a URL, downloads its HTML, and crawls it for any links to other pages
 * on the same domain. It then repeats the process for any link it finds. Each
 * page is stored as an index.html file in a directory structure based on the
 * hierarchy of their URLs. Lastly, it compresses the website into a ZIP file
 * and returns the path to the generated archive.
 *
 * @param {string} url The initial URL to crawl
 * @returns {Promise<string>} Path to the generated ZIP file
 */
```
