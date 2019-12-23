import App from '@/App';

(async function() {
  const app = new App();
  await app.init();
  app.start();
})();
