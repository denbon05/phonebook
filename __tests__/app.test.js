// @ts-check
import axios from 'axios';

import server from '../index.js';

const hostname = 'http://localhost';
const port = 9000;
const base = `${hostname}:${port}`;

let currentServer;

describe('Phonebook', () => {
  afterEach(() => {
    currentServer.close();
  });

  describe('Server', () => {
    it('GET /', () => (
      new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          try {
            const res = await axios.get(base);
            expect(res.data).toBe('Welcome to The Phonebook\nRecords count: 1000\n');
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      })
    ));

    it('GET /search?q=<substr>', () => {
      const expected = { data: [{ name: 'Miss Lindsey Hermann', phone: '1-559-706-3580' }, { name: 'Miss Herman Orn', phone: '988-099-6371' }, { name: 'Ms. Liana Herman', phone: '(422) 346-7454' }, { name: 'Herman Oberbrunner', phone: '315-607-3728' }] };

      return new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          const url = new URL('/search.json', base);
          url.searchParams.set('q', 'HermaN');
          try {
            const res = await axios.get(url.toString());
            expect(res.headers['content-type']).toBe('application/json');
            expect(res.data).toEqual(expected);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });

    it('/users.json', () => {
      const result = {
        meta: { page: 1, perPage: 3, totalPages: 334 },
        data: [
          { name: 'Chelsie Eichmann', phone: '1-466-807-1978' },
          { name: 'Miss Ewald Dickinson', phone: '699-653-9379' },
          { name: 'Mauricio Cassin', phone: '(683) 115-8139' },
        ],
      };

      return new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          const url = new URL('/users.json', base);
          // @ts-ignore
          url.searchParams.set('perPage', 3);
          try {
            const res = await axios.get(url.toString());
            expect(res.headers['content-type']).toBe('application/json');
            expect(res.status).toBe(200);
            expect(res.data).toEqual(result);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });

    it('/users.json?perPage&page', () => {
      const result = {
        meta: { page: 3, perPage: 4, totalPages: 250 },
        data: [
          { name: 'Mrs. Marlee Lesch', phone: '(412) 979-7311' },
          { name: 'Mrs. Mabelle Cormier', phone: '307.095.4754' },
          { name: 'Kale Macejkovic', phone: '699-803-8578' },
          { name: 'Miss Verla West', phone: '(546) 173-8884' },
        ],
      };

      return new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          const url = new URL('/users.json', base);
          // @ts-ignore
          url.searchParams.set('perPage', 4);
          // @ts-ignore
          url.searchParams.set('page', 3);
          try {
            const res = await axios.get(url.toString());
            expect(res.headers['content-type']).toBe('application/json');
            expect(res.status).toBe(200);
            expect(res.data).toEqual(result);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  });

  describe('Dynamic routes', () => {
    it('/users/<id>', () => {
      const result = {
        data: {
          name: 'Mrs. Marlee Lesch',
          phone: '(412) 979-7311',
        },
      };

      return new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          try {
            const url = new URL('/users/9.json', base);
            const res = await axios.get(url.toString());
            expect(res.status).toBe(200);
            expect(res.data).toEqual(result);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });

    it('/users/<undefined>', () => (
      new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          try {
            const url = new URL('/users/10000.json', base);
            const res = await axios.get(url.toString(), { validateStatus: () => true });
            expect(res.status).toBe(404);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      })
    ));
  });

  describe('POST /', () => {
    it('POST /users.json', () => {
      const result = {
        data: {
          id: 1001,
          name: 'Tom',
          phone: '1234-234-234',
        },
        meta: {
          location: '/users/1001.json',
        },
      };

      const data = {
        name: 'Tom',
        phone: '1234-234-234',
      };

      return new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          try {
            const url = new URL('/users.json', base);
            const res = await axios.post(url.toString(), data);
            expect(res.status).toBe(201);
            expect(res.data).toEqual(result);

            const url2 = new URL('/users/1001.json', base);
            const res2 = await axios.get(url2.toString());
            expect(res2.status).toBe(200);
            expect(res2.data).toEqual({ data });
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });

    it('POST /users.json (with errors)', () => {
      const result = {
        errors: [
          {
            source: 'name',
            title: 'bad format',
          },
          {
            source: 'phone',
            title: "can't be blank",
          },
        ],
      };

      const data = {
        name: '$Tom',
        phone: '',
      };

      return new Promise((resolve, reject) => {
        server(port, async (s) => {
          currentServer = s;
          try {
            const url = new URL('/users.json', base);
            const res = await axios.post(url.toString(), data, { validateStatus: () => true });
            expect(res.status).toBe(422);
            res.data.errors.sort((a, b) => {
              if (a.source > b.source) {
                return 1;
              }
              if (a.source < b.source) {
                return -1;
              }
              return 0;
            });
            expect(res.data).toEqual(result);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  });
});
