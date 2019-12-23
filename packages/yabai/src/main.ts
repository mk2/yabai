import App from '@/App';
import { configure } from 'mobx';

configure({
  enforceActions: 'observed',
});

(async function() {
  const app = new App();
  await app.init();
  app.start();
})();
