
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const buildPath = 'dist';

export default [
    {
        input: 'extension/extension.ts',
        output: {
            file: `${buildPath}/extension.js`,
            format: 'iife',
            exports: 'default',
            name: 'init',
        },
        plugins: [
            typescript(),
            // scss({
            //     output: `${buildPath}/stylesheet.css`,
            //     failOnError: true,
            //     watch: 'src/styles',
            // }),
            copy({
                targets: [
                    { src: './resources/metadata.json', dest: `${buildPath}` },
                ],
            }),
        ],
    },
    {
        input: 'extension/prefs.ts',
        output: {
            file: `${buildPath}/prefs.js`,
            format: 'iife',
            exports: 'default',
            name: 'prefs',
            footer: [
                'var init = prefs.init;',
                'var buildPrefsWidget = prefs.buildPrefsWidget;',
            ].join('\n'),
        },
        plugins: [
            typescript(),
        ],
    },
];