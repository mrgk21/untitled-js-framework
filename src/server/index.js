import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import fastify from 'fastify';

import { buildHtmlTriplet, htmlContentWrapper } from './_utils/html.js';
import {generateClientRoute } from "./_utils/router.js";
import { srcDir } from '../config.js';

const index = await readFile(join(srcDir, "./index.html"));
const server = fastify({ ignoreTrailingSlash: true, ignoreDuplicateSlashes: true });

function setRoutePlugin(tree) {
      
  const fn = async (f, options) => {
      f.get(tree.path, async (req, reply) => {
        let layout, page;
        
        if(tree.isLayoutHtml) {
          layout = await buildHtmlTriplet(tree.path, 'layout');
          layout = htmlContentWrapper(index, layout.data);
          
          if(tree.isPageHtml) {
            page = await buildHtmlTriplet(tree.path, 'page');
            layout = htmlContentWrapper(layout, page.data);
          }

          return reply.code(200).headers({ 'content-type': 'text/html' }).send(layout);
        }
    });
  };

  return fn;
}

function traverseTree(tree) {

  const fn = setRoutePlugin(tree);
  server.register(fn);

  for(const item of tree.children) {
    traverseTree(item)
  }
}

generateClientRoute()
  .then(traverseTree)
  .then(() => {
    server.listen({ port: 3030 }, (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      } else {
        console.log('server started on port 3030');
      }
    });
  })
  .catch(console.log);
