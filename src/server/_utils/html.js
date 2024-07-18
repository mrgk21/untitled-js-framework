import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { checkFile, generateId, sanitizedFilePath } from './common.js';
import { cache } from './cache.js';
import { clientDir } from '../../config.js';

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
      html: join(clientDir, path, `./${docType}.html`),
      js: join(clientDir, path, `./${docType}.js`),
      css: join(clientDir, path, `./${docType}.css`)
  };

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
