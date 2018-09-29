# aurelia-electron-webpack

A basic boilerplate to build Electron apps with Aurelia and Webpack.

The app simply lists connected USB devices and updates when changes are detected.

- Builds and bundles both main and renderer processes
- Supports hot-module-reload for the renderer process
- Bundles all JavaScript and excludes `node_modules` from packaged app for smallest app size
- Native modules are built and included
  > **Note:** If a native library uses the [bindings](https://www.npmjs.com/package/bindings) helper
  > to locate the binary, the path must be included in [bindings.js](./build/bindings.js) so webpack
  > can find it.

## Getting Started

From the project folder, execute the following commands:

```
yarn install
```

## Development Build

To run the app in development mode with HMR, run:

```
yarn dev
```

In another console start the app with:

```
yarn start
```

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
