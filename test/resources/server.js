const url = require('url');
const http = require('http');
const fs = require('fs');
const config = require('../../config');

const resourcesPath = config.testResourcesPath;

// route definitions
const loginPath = '/login';
const indexPaths = ['/listings/1', '/listings/2'];
const itemPaths = ['/items/1', '/items/2', '/items/3'];
const ignorePaths = ['favicon.ico'];

const server = http.createServer((request, response) => {

    const path = url.parse(request.url).path;

    // simple router for testing
    if (path === loginPath) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(fs.readFileSync(`${resourcesPath}/loginPage.html`));
    }

    else if (indexPaths.includes(path)) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(fs.readFileSync(`${resourcesPath}/indexPage.html`));
    }

    else if (itemPaths.includes(path)) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(fs.readFileSync(`${resourcesPath}/itemPage.html`));
    }

    else if (ignorePaths.includes(path)) {
        response.writeHead(204, { 'Content-Type': 'text/html' });
        response.write('<html><body>204 No content</body></html>');
    }

    else {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.write('<html><body>404 Not Found</body></html>');
    }

    response.end();
});

module.exports = server;