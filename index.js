'use strict';

import cheerio from 'cheerio';
import { webcrypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';
import { zip } from 'zip-a-folder';

// This regex matches any URL to a webpage file (.html, .aspx, .php, .cfm, etc)
const WEBPAGE_EXTENSION = /\.([djmprsxz]?html?|php3?|aspx?|cfml?)$/i;

/**
 * Takes a URL and a basePath and downloads the HTML for the URL, then crawls it
 * to find any links to other pages on the same domain. It then recursively
 * invokes itself for every page it finds. Each page is saved as an index.html
 * in a directory structure that represents the URLs of those pages.
 *
 * @param {string} url The initial URL to crawl
 * @param {string} basePath The path to the root directory of the archive
 * @returns {Promise<void>}
 */
async function downloadPage(url, basePath, visited = new Set()) {
    const { origin, pathname } = new URL(url);
    const pathSuffix = WEBPAGE_EXTENSION.test(pathname) ? '' : 'index.html';
    const filePath = path.join(basePath, pathname, pathSuffix);
    const folderPath = path.dirname(filePath);
    // If we’ve already handled this page, move on
    if (visited.has(filePath)) return;

    visited.add(filePath);
    const response = await fetch(url);
    const html = await response.text();

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(filePath, html);

    const $ = cheerio.load(html);
    const anchors = $('a').toArray();

    await Promise.all(
        anchors.map(async (element) => {
            const href = $(element).attr('href');
            if (!href) return;

            const newURL = new URL(href, origin).href;
            if (!newURL.startsWith(origin)) return;

            await downloadPage(newURL, basePath, visited);
        }),
    );
}

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
export async function crawlarchiver(url) {
    const { hostname } = new URL(url);
    const outputFolder = path.resolve(webcrypto.randomUUID(), hostname);
    const outputPath = `${outputFolder}.zip`;
    try {
        await downloadPage(url, outputFolder);
    } catch (error) {
        console.error('Error downloading pages:', error);
        throw error;
    }

    try {
        await zip(outputFolder, outputPath);
    } catch (error) {
        console.error('Error generating zip archive:', error);
        throw error;
    }

    return outputPath;
}
