declare module 'resource:///org/gnome/shell/extensions/sharedInternals.js' {
    import Gio from 'gi://Gio';

    export abstract class ExtensionBase {
        constructor(metadata: GnomeShellObject);

        metadata: GnomeShellObject;
        get uuid(): string;
        get dir(): Gio.File;
        get path(): string;

        getSettings(schema?: string | undefined): Gio.Settings;
    }
}
