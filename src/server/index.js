import { dirname, join } from 'node:path';
import { access, constants, readFile, readdir } from 'node:fs/promises';
import fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { buildHtmlTriplet, htmlContentWrapper } from './_utils/html.js';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = fastify();

server.get('/', async (req, reply) => {
    const html = await readFile(join(srcDir, './client/page.html'));
    return reply.code(200).headers({ 'content-type': 'text/html' }).send(html);
});

server.get('/error/404', async (req, reply) => {
    return reply.code(200).send('Error 404, file not found');
});

server.get('/post', async (req, reply) => {
    let index = await readFile(join(srcDir, "./index.html"));
    let layout = await buildHtmlTriplet('./client/post', 'layout');
    
    if (layout.status) {
        layout = layout.data;
        let info = await buildHtmlTriplet('./client/post', 'page');
        if (info.status) layout = htmlContentWrapper(layout, info.data);
        index = htmlContentWrapper(index, layout);

        return reply.code(200).headers({ 'content-type': 'text/html' }).send(index);
    }

    let info = await buildHtmlTriplet('./client/post');
    if (!info.status) return reply.redirect('/error/404');

    index = htmlContentWrapper(index, info.data);

    return reply.code(200).headers({ 'content-type': 'text/html' }).send(index);
});

server.listen({ port: 3030 }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    } else {
        console.log('server started on port 3030');
    }
});
