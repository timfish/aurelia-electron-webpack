# aurelia-electron-webpack

A basic boilerplate to build Electron apps with Aurelia and Webpack.

The app simply lists connected USB devices and updates when changes are detected.

- Builds and bundles both main and renderer processes
- Supports hot-module-reload in the renderer process
- Bundles all JavaScript and excludes `node_modules` from packaged app for smallest app size
- Use vscode to debug both processes simultaneously with breakpoints in original source files
- Native modules are built and included

## Getting Started

From the project folder, execute the following commands:

```
yarn install
```

## Development Build

To build the app in development mode run:

```
yarn build:dev
```

To build the app in development/watch mode with HMR in the renderer, run:

```
yarn watch
```

and in another console start the app with:

```
yarn start
```

Alternatively, in vscode, go to `Debug`, select the `Debug Both Processes` configuration and and
start the debug session with breakpoints in either process.

## Production Build

To build the app in production mode and run it, run:

```
yarn build && yarn start
```

## Building Releases

To package the app and create a distributable for the current platform, run:

```
yarn build && yarn release
```
