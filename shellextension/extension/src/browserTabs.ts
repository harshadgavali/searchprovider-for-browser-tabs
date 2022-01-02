const { Shell, Gio } = imports.gi;

const Main = imports.ui.main;
const RemoteSearch = imports.ui.remoteSearch;
const Util = imports.misc.util;

const DOMAIN_NAME = 'com.github.harshadgavali';
const BASE_ID = `${DOMAIN_NAME}.SearchProvider`;
const BASE_PATH = `/${DOMAIN_NAME.replace(/\./g, '/')}/SearchProvider`;
const SEARCH_PROVIDERS_SCHEMA = 'org.gnome.desktop.search-providers';
const EXENAME = `${DOMAIN_NAME}.tabsearchproviderconnector`;

export class WebBrowserTabSearchProvider extends RemoteSearch.RemoteSearchProvider2 {
    constructor(appInfo: typeof Gio.DesktopAppInfo.prototype, dbusName: string, dbusPath: string, autoStart: boolean) {
        super(appInfo, dbusName, dbusPath, autoStart);

        this.id = `tabsearchprovider.${dbusName}`;
        this.isRemoteProvider = false;
        this.canLaunchSearch = false;
    }

    override _getResultsFinished(results: unknown[], error: typeof Gio.DBusError.prototype, callback: (results: unknown[]) => void): void {
        if (error) {
            callback([]);
            return;
        }
        super._getResultsFinished(results, error, callback);
    }

    override _getResultMetasFinished(results: unknown[], error: typeof Gio.DBusError.prototype, callback: (results: unknown[]) => void): void {
        if (error) {
            callback([]);
            return;
        }
        super._getResultMetasFinished(results, error, callback);
    }
}
function getProvider(app: typeof Shell.App.prototype | undefined, appName: string) {
    if (!app)
        return;
    const appInfo = app.get_app_info();
    appInfo.get_description = () => `List of tabs open in ${appInfo}`;
    appInfo.get_name = () => `${appName} Tabs`;

    return new WebBrowserTabSearchProvider(
        appInfo,
        `${BASE_ID}.${appName}`,
        `${BASE_PATH}/${appName}`,
        true,
    );
}

export class BrowserTabExtension implements ISubExtension {
    private _searchSettings: typeof Gio.Settings.prototype;
    private _loadRemoteSearchProviders: (searchSettings: typeof Gio.Settings.prototype, callback: (providers: (typeof RemoteSearch.RemoteSearchProvider2.prototype)[]) => void) => void;

    constructor() {
        this._searchSettings = new Gio.Settings({ schema_id: SEARCH_PROVIDERS_SCHEMA });
        this._loadRemoteSearchProviders = RemoteSearch.loadRemoteSearchProviders;

        const appSystem = Shell.AppSystem.get_default();
        const extensionThis = this;

        RemoteSearch.loadRemoteSearchProviders = function (searchSettings, callback) {
            extensionThis._loadRemoteSearchProviders(searchSettings, results => {
                [
                    getProvider(appSystem.lookup_app('org.chromium.Chromium.desktop'), 'Chromium'),
                    getProvider(appSystem.lookup_app('microsoft-edge.desktop'), 'Edge'),
                    getProvider(appSystem.lookup_app('firefox.desktop'), 'Firefox'),
                ].forEach(provider => {
                    if (provider)
                        results.unshift(provider);
                });

                callback(results);
            });
        };

        this._reloadProviders();
    }

    destroy() {
        RemoteSearch.loadRemoteSearchProviders = this._loadRemoteSearchProviders;
        this._reloadProviders();
        Util.spawn(["/usr/bin/killall", EXENAME]);
    }

    _reloadProviders() {
        this._searchSettings.set_boolean('disable-external', true);
        this._searchSettings.set_boolean('disable-external', false);
    }
}
