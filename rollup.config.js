import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: './src/Game.ts',
  plugins: [
    typescript({
      verbosity: 2,
      clean: true
    }),
    resolve()
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
    'PIXI'
  ]
}