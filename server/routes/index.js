// @ts-check

import contact from './contact';

const controllers = [
  contact,
];

export default (app) => controllers.forEach((f) => f(app));
