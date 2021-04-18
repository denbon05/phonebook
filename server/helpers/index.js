import i18next from 'i18next';
import _ from 'lodash';
import debug from 'debug';

const logHelpers = debug('app:helpers');

export default (app) => ({
  route(name, params) {
    logHelpers('route namespacing and params %O', name, params);
    return app.reverse(name, params);
  },
  t(key) {
    return i18next.t(key);
  },
  _,
  getAlertClass(type) {
    switch (type) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown flash type: '${type}'`);
    }
  },
});
