/* eslint-disable no-restricted-imports */
/**
 * As of writing this module (2023 August 8)
 * 'gi://<name>' modules only export 'default'. Only use 'default' export type with them.
 *      e.g., `import Gio from 'gi://Gio';`
 *      e.g., `export { default as Meta } from 'gi://Meta;` // re-export 'Meta'
 * 'resource://<resource-id>' modules do not have default exports. Only use 'named' and 'namespace' export types with them.
 *      e.g., `import * as Main from 'resource:///org/gnome/shell/ui/main.js'`
 *      e.g., `export * as Util from 'resource:///org/gnome/shell/misc/util.js'` // re-export util.js
 *      e.g., `import { panel } from 'resource:///org/gnome/shell/ui/main.js'`
 */


// gjs
// export { default as GObject } from 'gi://GObject';
export { default as GLib } from 'gi://GLib';
export { default as Gio } from 'gi://Gio';
// export { GLib, Gio };

// shell library
export { default as Meta } from 'gi://Meta';
export { default as Shell } from 'gi://Shell';
export { default as St } from 'gi://St';

// shell js
//ui
export * as Main from 'resource:///org/gnome/shell/ui/main.js';
export * as RemoteSearch from 'resource:///org/gnome/shell/ui/remoteSearch.js';
// misc
export * as FileUtils from 'resource:///org/gnome/shell/misc/fileUtils.js';
// extensions
export * as Extension from 'resource:///org/gnome/shell/extensions/extension.js';
