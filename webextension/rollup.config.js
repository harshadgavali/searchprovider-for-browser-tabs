import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const buildPath = 'dist';
const isProduction = !process.env.ROLLUP_WATCH;

function getConfig(browser) {
    const browserBuildPath = `${buildPath}/${browser}`
    return {
        input: 'src/background.ts',
        output: {
            sourcemap: !isProduction,
            file: `${browserBuildPath}/background.js`,
            // format: 'iife',
            // exports: 'default',
            // name: 'init',
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                sourceMap: !isProduction,
            }),
            copy({
                targets: [
                    { src: `resources/${browser}.manifest.json`, dest: browserBuildPath, rename: 'manifest.json' }
                ]
            })
        ]
    }
}

export default [
    getConfig('chromium'),
    getConfig('firefox'),
];