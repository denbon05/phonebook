// @ts-check

import fs from 'fs';
import debug from 'debug';
import path from 'path';
import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyReverseRoutes from 'fastify-reverse-routes';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifyErrorPage from 'fastify-error-page';
import fastifySensible from 'fastify-sensible';
import fastifyFormbody from 'fastify-formbody';
import fastifySecureSession from 'fastify-secure-session';
import fastifyFlash from 'fastify-flash';
import fastifyMethodOverride from 'fastify-method-override';
import qs from 'qs';
import pointOfView from 'point-of-view';
import Pug from 'pug';
import i18next from 'i18next';
// @ts-ignore
import webpackConfig from '../webpack.config.babel.js';
import resources from './locales/index.js';

import addRoutes from './routes/index.js';
import getHelpers from './helpers/index.js';
import knexConfig from '../knexfile.js';
import models from './models/index.js';

const logApp = debug('app');

const mode = process.env.NODE_ENV || 'development';
const isDevelopment = mode === 'development';
logApp('Mode app: %o', mode);

const setUpViews = (app) => {
  const { devServer } = webpackConfig;
  const devHost = `http://${devServer.host}:${devServer.port}`;
  const domain = isDevelopment ? devHost : '';
  const helpers = getHelpers(app);
  const defaultContext = { ...helpers, assetPath: (filename) => `${domain}/assets/${filename}` };
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext,
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    logApp('locals %O', locals);
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = path.join(__dirname, '..', 'dist', 'public');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const setupLocalization = () => {
  i18next
    .init({
      lng: 'ru',
      fallbackLng: 'en',
      debug: false,
      resources,
    });
};

const registerPlugins = (app) => {
  app.register(fastifySensible);
  app.register(fastifyErrorPage);
  // @ts-ignore
  app.register(fastifyReverseRoutes.plugin);
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifySecureSession, {
    key: fs.readFileSync(path.join(__dirname, '..', 'secret-key')),
    cookie: {
      path: '/',
    },
  });
  app.register(fastifyFlash);
  app.register(fastifyMethodOverride);
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
};

const addHooks = async (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = { // eslint-disable-line
      contacts: await app.objection.models.contact.query(),
    };
  });
};

export default () => {
  const app = fastify({
    logger: {
      prettyPrint: isDevelopment,
    },
  });

  registerPlugins(app);
  addHooks(app);
  setupLocalization();
  setUpStaticAssets(app);
  addRoutes(app);
  setUpViews(app);

  return app;
};
