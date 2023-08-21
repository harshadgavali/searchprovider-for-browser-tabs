import { SettingKeys, SettingValues } from './constants.js';
import { Extension, Gio } from './imports.js';
import { BrowserTabExtension } from './src/browserTabs.js';

/**
 * Entry point of extension
 */
export default class extends Extension.Extension {
    private _extensions: ISubExtension[];
    private _settings?: Gio.Settings;
    private _connectId?: number;

    constructor(metadata: GnomeShellObject) {
        super(metadata);
        this._extensions = [];
    }

    enable() {
        this._settings = this.getSettings();
        this._syncSettings();
        this._connectId = this._settings.connect('changed', this._syncSettings.bind(this));

        this._extensions = [
            new BrowserTabExtension()
        ];
    }

    disable() {
        this._extensions.reverse().forEach(extension => {
            extension.clear();
        });
        this._extensions = [];

        if (this._connectId) {
            this._settings?.disconnect(this._connectId);
        }
        this._connectId = undefined;
        this._settings = undefined;
    }

    private _syncSettings() {
        if (!this._settings)
            return;

        SettingValues.ExcludeSlash = this._settings.get_boolean(SettingKeys.ExcludeSlash);
        SettingValues.MinTermLength = this._settings.get_uint(SettingKeys.MinTermLength);
    }
}
