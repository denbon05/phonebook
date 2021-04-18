// @ts-check

import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['phone'] });

export default class Contact extends unique(Model) {
  // @ts-ignore
  static get tableName() {
    return 'contacts';
  }

  // @ts-ignore
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'phone'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 3, errorMessage: 'Have be at least 3 characters' },
        phone: { type: 'string', minLength: 6, errorMessage: 'Have be at least 6 characters' },
      },
    };
  }
}
