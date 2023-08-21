import { Gio, Main, Shell, RemoteSearch } from '../imports.js';
import { getAppIdsforDBus } from './tabSearchUtils.js';
import { getParentProcessId } from './utils.js';
import { WebSearchProvider } from './webSearchProvider.js';

/** Returns app for given dbus server */
async function getDBusServerApp(appSystem: Shell.AppSystem, dbusName: string, dbusPid: number) {
    const browserApps = getAppIdsforDBus(dbusName)
        .map(id => appSystem.lookup_app(id))
        .filter(Boolean);

    // server app isn't one of the known browser    
    if (!browserApps.length)
        return;
    const fallbackApp = browserApps[0];

    // TODO:
    // server should be direct child of one of app's window
    // so this would always return fallbackApp for flatpaked app
    // This might need update after native messaging flatpak portal is merged/accepted
    const windowPid = await getParentProcessId(dbusPid);
    if (!windowPid) return fallbackApp;

    return browserApps.find(app => app.get_pids().includes(windowPid)) ?? fallbackApp;
}

/**
 * A class to manage search provider for one dbus server.
 */
export class DbusSearchProviderWrapper {
    private _provider?: RemoteSearch.IRemoteSearchProvider2;
    private _dbusName: string;
    private _appInfo: Gio.DesktopAppInfo;

    constructor(dbusName: string, appInfo: Gio.DesktopAppInfo) {
        this._dbusName = dbusName;
        this._appInfo = appInfo;
        this._provider = new WebSearchProvider(this._dbusName, this._appInfo);
        Main.overview.searchController.addProvider(this._provider);
    }

    clear() {
        if (this._provider)
            Main.overview.searchController.removeProvider(this._provider);
        this._provider = undefined;
    }

    static async create(dbusName: string, dbusPid: number) {
        const appSystem = Shell.AppSystem.get_default();
        const appId = (await getDBusServerApp(appSystem, dbusName, dbusPid))?.get_id();

        // Gio.DesktopAppInfo.new can return null
        const appInfo = appId ? Gio.DesktopAppInfo.new(appId) : undefined;
        if (!appInfo)
            return;

        const displayName = appInfo.get_display_name();
        appInfo.get_name = () => `${displayName} Tabs`;
        appInfo.get_description = () => `List of tabs open in ${displayName}`;

        return new DbusSearchProviderWrapper(dbusName, appInfo);
    }
}