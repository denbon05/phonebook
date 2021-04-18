// @ts-check

import {
  describe, beforeAll, it, expect, afterAll, beforeEach, afterEach,
} from '@jest/globals';
import getApp from '../server/index.js';

const contact1 = { name: 'Tirion Lanister', phone: '323773' };

const existingContacts = [{ id: 1, name: 'John Snow', phone: '894761' }, { id: 2, name: 'Arya Stark', phone: '430876' }];

const prepareData = async (app) => {
  const { knex } = app.objection;
  await knex('contacts').insert(existingContacts);
};

describe('test contacts CRD', () => {
  let app;
  let knex;
  let models;

  beforeAll(async () => {
    app = await getApp();
    // @ts-ignore
    knex = app.objection.knex;
    // @ts-ignore
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('root'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createContact'),
      payload: {
        data: contact1,
      },
    });
    expect(response.statusCode).toBe(302);

    const contact = await models.contact.query().findOne({ phone: contact1.phone });
    expect(contact).toMatchObject(contact);
  });

  it('create with the same data', async () => {
    const existingContact = existingContacts[0];
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createContact'),
      payload: {
        data: existingContact,
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('create with the empty fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createContact'),
      payload: {
        data: { name: '', phone: '' },
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('delete', async () => {
    const existingContact = existingContacts[1];
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteContact', { id: existingContact.id }),
    });
    expect(response.statusCode).toBe(302);

    const contact = await models.contact.query().findOne({ id: existingContact.id });
    expect(contact).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback(); // * после каждого теста откатываем миграции
  });

  afterAll(() => {
    app.close();
  });
});
