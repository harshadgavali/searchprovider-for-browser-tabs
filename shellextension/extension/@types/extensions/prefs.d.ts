declare module 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js' {
    import { ExtensionBase } from 'resource:///org/gnome/shell/extensions/sharedInternals.js';

    export abstract class ExtensionPreferences extends ExtensionBase {
        // static lookupByUUID(uuid: string): any;

        /**
         * Fill the preferences window with preferences.
         *
         * The default implementation adds the widget
         * returned by getPreferencesWidget().
         *
         * @param {Adw.PreferencesWindow} window - the preferences window
         */
        abstract fillPreferencesWindow(window: Adw.PreferencesWindow): void;
    }
}
