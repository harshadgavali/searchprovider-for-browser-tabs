
// imports variable
declare interface GjsImports {
    ui: {
        main: typeof import('resource:///org/gnome/shell/js/ui/main.js'),
        remoteSearch: typeof import('resource:///org/gnome/shell/js/ui/remoteSearch.js'),
    }

    misc: {
        util: typeof import('resource:///org/gnome/shell/js/misc/util.js'),
    }
}

/* ui folder */

// declare module 'resource:///org/gnome/shell/js/ui/main.js' {
//     export default imports.ui.main;
// }

// /* util folder */

// declare module 'resource:///org/gnome/shell/js/misc/util.js' {
//     export default imports.misc.util;
// }