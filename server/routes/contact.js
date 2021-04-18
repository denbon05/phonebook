// @ts-check

import i18next from 'i18next';
import debug from 'debug';

const logRoute = debug('app:routes');

export default (app) => {
  app
    .get('/', { name: 'root' }, async (req, reply) => {
      const contact = await new app.objection.models.contact(); // eslint-disable-line
      return reply.render('contact/new', { contact, errors: {} });
    })
    .post('/', { name: 'createContact' }, async (req, reply) => {
      logRoute('req.body.data %O', req.body.data);
      try {
        const contact = await app.objection.models.contact.fromJson(req.body.data);
        logRoute('contact %O', contact);
        await app.objection.models.contact.query().insert(contact);
        req.flash('info', i18next.t('flash.contact.createSuccess'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (err) {
        logRoute('post error %O', err);
        req.flash('error', i18next.t('flash.contact.createError'));
        reply.render('contact/new', { contact: req.body.data, errors: err.data });
        return reply.code(403);
      }
    })
    .delete('/contacts/:id', { name: 'deleteContact' }, async (req, reply) => {
      await app.objection.models.contact.query().deleteById(req.params.id);
      req.flash('info', i18next.t('flash.contact.deleted'));
      return reply.redirect(app.reverse('root'));
    });
};
