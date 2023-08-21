
import { Gio, Shell } from '../imports.js';
import { DBusNameMonitor } from './dbusNameMonitor.js';
import { stopDBusSearchServers } from './tabSearchUtils.js';
import { DbusSearchProviderWrapper } from './searchController.js';
import { DBUS_BASE_ID } from '../constants.js';

const SEARCH_PROVIDERS_SCHEMA = 'org.gnome.desktop.search-providers';
const SEARCH_PROVIDERS_DISABLED_EXTENSIONS_SCHEMAKEY = 'disabled';

/**
 * A class to manage search providers for one dbus server.
 */

/**
 * Sub-extension which will monitor dbus for servers
 * When search server is online, register it with overview and arcmenu
 */
export class BrowserTabExtension implements ISubExtension {
    private _dbusNameMonitor?: DBusNameMonitor;
    private _dbusProviders = new Map<string, DbusSearchProviderWrapper>();
    private _appSystem: Shell.AppSystem;
    private _searchSettings: Gio.Settings;

    constructor() {
        this._appSystem = Shell.AppSystem.get_default();
        this._searchSettings = new Gio.Settings({ schemaId: SEARCH_PROVIDERS_SCHEMA });
        this._startDBusNameMonitor();
    }

    clear() {
        this._dbusNameMonitor?.clear();
        this._dbusNameMonitor = undefined;
        this._dbusProviders.forEach((_, dbusName) => { this._onDbusNameRemoved(dbusName).catch(console.error); });
        stopDBusSearchServers().catch(console.error);
    }

    private _startDBusNameMonitor() {
        if (this._dbusNameMonitor)
            return;
        this._dbusNameMonitor = new DBusNameMonitor(
            DBUS_BASE_ID,
            this._onDbusNameAdded.bind(this),
            this._onDbusNameRemoved.bind(this)
        );
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private async _onDbusNameRemoved(dbusName: string) {
        console.log(`${this._onDbusNameRemoved.name}(${dbusName})`);

        this._dbusProviders.get(dbusName)?.clear();
        this._dbusProviders.delete(dbusName);
    }

    private async _onDbusNameAdded(dbusName: string) {
        console.log(`${this._onDbusNameAdded.name}(${dbusName})`);
        if (this._dbusProviders.has(dbusName))
            return;

        const dbusPid = await this._dbusNameMonitor?.GetDBusServerPID(dbusName);
        if (!dbusPid)
            return;

        const dbusProvider = await DbusSearchProviderWrapper.create(dbusName, dbusPid);
        if (!dbusProvider)
            return;

        this._dbusProviders.set(dbusName, dbusProvider);
        this._forceReloadRemoteProviders();
    }

    /**
     * We want tabs search result to appear before other remote providers
     * To force load remote providers, add empty string to list of disabled providers
     * if empty string is already in the list, delete it instead
     */
    private _forceReloadRemoteProviders() {
        const dummyId = '';
        const disabledIds = this._searchSettings.get_strv(SEARCH_PROVIDERS_DISABLED_EXTENSIONS_SCHEMAKEY);

        const emptyIndex = disabledIds.findIndex(id => id === dummyId);
        if (emptyIndex === -1)
            disabledIds.push(dummyId);
        else
            disabledIds.splice(emptyIndex, 1);

        this._searchSettings.set_strv(SEARCH_PROVIDERS_DISABLED_EXTENSIONS_SCHEMAKEY, disabledIds);
    }
}
