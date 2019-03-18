// tslint:disable:max-classes-per-file
import { readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import * as webpack from 'webpack';

const readFileAsync = promisify(readFile) as (path: string, opt: string) => Promise<string>;

/**
 * Wraps webpack DefinePlugin and replaces `process.type` so that code can be
 * automatically stripped from each process
 */
export class ElectronProcessPlugin implements webpack.Plugin {
  private nodeTargets = ['async-node', 'electron-main', 'node'];

  public apply(compiler: webpack.Compiler): void {
    const procType = this.nodeTargets.includes(compiler.options.target as string)
      ? 'browser'
      : 'renderer';

    new webpack.DefinePlugin({
      'process.type': JSON.stringify(procType)
    }).apply(compiler);
  }
}

/**
 * `electron-builder` automatically attempts to install and build all dependencies
 * listed in `package.json`. As we've already packaged the app this is
 * unnecessary. Because we've moved the `package.json` it will likely fail when
 * using a mono-repository
 */
export class CopyPkgJsonAndRemoveKeys implements webpack.Plugin {
  constructor(
    private file: string = 'package.json',
    private properties: string[] = ['dependencies', 'devDependencies']
  ) {}

  public apply(compiler: webpack.Compiler): void {
    compiler.hooks.emit.tapPromise('CopyPkgJsonAndRemoveKeys', async compilation => {
      try {
        const srcPath = join(compiler.options.context, this.file);
        const srcJson = JSON.parse(await readFileAsync(srcPath, 'utf8'));

        for (const prop of this.properties) {
          delete srcJson[prop];
        }

        const outJson = JSON.stringify(srcJson, null, '  ');

        compilation.assets[this.file] = {
          source: () => {
            return outJson;
          },
          size: () => {
            return outJson.length;
          }
        };
      } catch (e) {
        compilation.errors.push(e);
      }
    });
  }
}
