#!/usr/bin/env node

'use strict';

import { execSync } from 'node:child_process';
import path from 'node:path';
import { argv } from 'node:process';

import { wbdl } from './index.js';

const args = argv.slice(2);
const urlString = args.slice(-1)[0];
const shouldOpen = args.includes('--open');

if (!urlString) {
    console.error(
        'You must provide a URL as an argument to wbdl, e.g. https://example.net',
    );
    process.exit(1);
}

try {
    const pathToArchive = await wbdl(urlString);
    const pathToFolder = path.dirname(pathToArchive);

    console.log('');
    console.log('Website archive created for', urlString, 'at:');
    console.log(pathToFolder);

    if (shouldOpen) {
        execSync(`open ${pathToFolder}`);
    }
} catch (error) {
    console.error('Unable to generate website archive for', urlString);
    console.error('Error:', error);
}
