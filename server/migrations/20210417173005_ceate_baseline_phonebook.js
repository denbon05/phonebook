// @ts-check

exports.up = (knex) => (
  knex.schema.createTable('contacts', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('phone');
  })
);

exports.down = (knex) => knex.schema.dropTable('contacts');
