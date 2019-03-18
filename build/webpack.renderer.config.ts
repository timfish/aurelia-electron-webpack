import { renderer } from './webpack.common.config';

export = [
  renderer({
    renderer: './src/renderer'
    // Add multiple renderer entry points that can be opened in other windows
    // page2: './src/page2'
  })
  // Bundle for a renderer with nodeIntegration disabled
  // renderer({ renderer: './src/renderer' }, false),
];
