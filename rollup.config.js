import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';

export default {
  input: './src/Game.ts',
  plugins: [
    typescript({
      verbosity: 2,
      clean: true
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      ignoreGlobal: true,
    }),
    globals(),
    json()
  ],
  output: [
    {
      file: 'bin/arduz.js',
      format: 'iife',
      name: 'Arduz',
      sourcemap: true
    }
  ],
  external: [
    'PIXI',
    'SimplePeer'
  ]
}