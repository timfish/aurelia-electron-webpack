/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
import { bootstrap } from 'aurelia-bootstrapper';
import { Aurelia } from 'aurelia-framework';
import { App } from './app';
import environment from './environment';

bootstrap(async (aurelia: Aurelia) => {
  aurelia.use.standardConfiguration();

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  return aurelia.start().then(() => aurelia.setRoot(App, document.body));
});
