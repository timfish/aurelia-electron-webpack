import { main } from './webpack.common.config';

export = [
  main({ main: './src/main' })
  // Preload scripts should also be built with main as they they dont support HMR
  // preload({ preload: './src/preload' })
];
