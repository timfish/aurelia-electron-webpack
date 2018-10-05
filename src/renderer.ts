import { bootstrap } from 'aurelia-bootstrapper';
import { Aurelia } from 'aurelia-framework';
import { App } from './app';
import environment from './environment';

bootstrap(async (aurelia: Aurelia) => {
  aurelia.use.standardConfiguration();

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  await aurelia.start();
  return aurelia.setRoot(App, document.body);
});
