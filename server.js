// @ts-check

import http from 'http';
import debug from 'debug';

const logHttp = debug('http');

const getParams = (address, host) => {
  const url = new URL(address, `http://${host}`);
  // @ts-ignore
  return Object.fromEntries(url.searchParams);
};

const router = {
  GET: {
    '/users/(\\w+).json': (req, res, matches, usersById) => {
      res.setHeader('Content-Type', 'application/json');
      logHttp('matches in route %O', matches);
      const userId = matches[1];
      const data = usersById[userId];
      if (!data) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.end(`${JSON.stringify({ data })}\n`);
    },
    '/': (req, res, matches, usersById) => {
      const messages = [
        'Welcome to The Phonebook',
        `Records count: ${Object.keys(usersById).length}\n`,
      ];
      res.end(messages.join('\n'));
    },
    '/search.json': (req, res, matches, usersById) => {
      res.setHeader('Content-Type', 'application/json');
      const { q = '' } = getParams(req.url, req.headers.host);
      logHttp('q %s', q);
      const normalizedSearch = q.trim().toLowerCase();
      const ids = Object.keys(usersById);

      const usersSubset = ids
        .filter((id) => usersById[id].name.toLowerCase().includes(normalizedSearch))
        .map((id) => usersById[id]);
      res.end(`${JSON.stringify({ data: usersSubset })}\n`);
    },
    '/users.json': (req, res, matches, usersById) => {
      res.setHeader('Content-Type', 'application/json');

      const { page = 1, perPage = 10 } = getParams(req.url, req.headers.host);
      const ids = Object.keys(usersById);
      const numPage = Number(page);
      const numPerPage = Number(perPage);

      const usersSubset = ids.slice((numPage * numPerPage) - numPerPage, numPage * numPerPage)
        .map((id) => usersById[id]);
      const totalPages = Math.ceil((ids.length) / numPerPage);
      res.end(`${JSON.stringify({
        meta: { page: numPage, perPage: numPerPage, totalPages }, data: usersSubset,
      })}\n`);
    },
  },
};

export default (users) => http.createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  logHttp('request.method %s', request.method);
  const routes = router[request.method];

  const result = pathname && Object.keys(routes).find((str) => {
    const regexp = new RegExp(`^${str}$`);
    const matches = pathname.match(regexp);

    if (!matches) return false;
    logHttp('routes %O', routes);
    logHttp('matched str %s', str);
    routes[str](request, response, matches, users);
    return true;
  });

  if (!result) {
    response.writeHead(404);
    response.end();
  }
});
