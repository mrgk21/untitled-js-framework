import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import fastify from 'fastify';

import { buildHtmlTriplet, htmlContentWrapper, buildHtmlSingle } from './_utils/html.js';
import {generateClientRoute } from "./_utils/router.js";
import { srcDir } from '../config.js';

const index = await readFile(join(srcDir, "./index.html"));
const server = fastify({ ignoreTrailingSlash: true, ignoreDuplicateSlashes: true });

function setRoutePluginNew(tree) {
  const fn = async (f, options) => {
      f.get(tree.path, async (req, reply) => {
        let layout;
        
        if(tree.isLayoutHtml) {
          layout = await buildHtmlSingle(tree.path, 'layout');
          layout = layout.data;
          if(tree.isPageHtml) {
            const page = await buildHtmlSingle(tree.path, 'page')
            layout = await htmlContentWrapper(layout, page.data);
          }
        } else {
          if(tree.isPageHtml) {
            layout = await buildHtmlSingle(tree.path, 'page');
          }
        }

        if(layout)
          return reply.code(200).headers({ 'content-type': 'text/html' }).send(layout);
        return reply.code(404);
      });
  };

  return fn;
}
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

        } else {
          if(tree.isPageHtml) {
            layout = (await buildHtmlTriplet(tree.path, 'page')).data;  
          }
        }

        if(layout)
          return reply.code(200).headers({ 'content-type': 'text/html' }).send(layout);
        return reply.code(404);
      });
  };

  return fn;
}

function traverseTree(tree) {
  const fn = setRoutePluginNew(tree);
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
