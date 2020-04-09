import { configure } from 'mobx';

import App from '@/App';

configure({
  enforceActions: 'observed',
});

(async function() {
  const app = new App();
  await app.init();
  app.start();
})();
