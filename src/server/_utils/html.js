import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkFile, generateId, sanitizedFilePath } from './common.js';
import { cache } from './cache.js';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '../..');

function cssIdWrapper(elemId, css) {
  return `#${elemId} { ${css} }`;
}

function htmlTagWrapper(tag, html) {
  const { name, ...options } = tag;

  let propList = '';
  for (const key in options) {
      propList += `${key}=${options[key]} `;
  }
  return `<${name} ${propList} >${html}</${name}>`;
}

function htmlContentWrapper(content, wrappedContent, identifier = '<filler />') {
  const contentInd = Buffer.from(content).indexOf(identifier);
  if (contentInd === -1) return content;

  console.log({ content });
  return content.toString().replace(identifier, wrappedContent);
}

 async function buildHtmlTriplet(path, docType = 'page') {
  const filePaths = {
      html: join(srcDir, path, `./${docType}.html`),
      js: join(srcDir, path, `./${docType}.js`),
      css: join(srcDir, path, `./${docType}.css`)
  };
  if (!(await checkFile(filePaths.html))) return { status: false, data: null };

  let html = await readFile(filePaths.html);
  const wrapperId = `_${generateId()}`;
  html = htmlTagWrapper({ name: 'div', id: wrapperId }, html);
  cache.pageRootIds[sanitizedFilePath(`${path}_${docType}`)] = wrapperId;

  if (await checkFile(filePaths.css)) {
      const css = await readFile(filePaths.css);
      html = htmlTagWrapper({ name: 'style' }, cssIdWrapper(wrapperId, css)) + html;
  }

  if (await checkFile(filePaths.js)) {
      const js = await readFile(filePaths.js);
      html = htmlTagWrapper({ name: 'script', id: `script_${wrapperId}` }, js) + html;
  }

  return { status: true, data: html };
}

export {
  htmlContentWrapper,
  buildHtmlTriplet,
}