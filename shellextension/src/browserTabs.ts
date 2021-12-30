const { Shell, Gio } = imports.gi;

const Main = imports.ui.main;
const RemoteSearch = imports.ui.remoteSearch;
const Util = imports.misc.util;

const BASE_ID = "org.me.SearchProvider";
const BASE_PATH = "/org/me/SearchProvider";
const SEARCH_PROVIDERS_SCHEMA = 'org.gnome.desktop.search-providers';

export class WebBrowserTabSearchProvider extends RemoteSearch.RemoteSearchProvider2 {
    constructor(appInfo: typeof Gio.DesktopAppInfo, dbusName: string, dbusPath: string, autoStart: boolean) {
        super(appInfo, dbusName, dbusPath, autoStart);

        this.canLaunchSearch = false;
    }

    _getResultsFinished(results, error, callback) {
        log(`[Debug]::_getResultsFinished: ${results}, ${error}`);
        if (error) {
            if (error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                return;

            log('[Debug]:: Received error from D-Bus search provider %s: %s'.format(this.id, String(error)));
            callback([]);
            return;
        }

        super._getResultsFinished(results, error, callback);
    }

    _getResultMetasFinished(results, error, callback) {
        log(`[Debug]::_getResultMetasFinished: ${results}, ${error}`);
        if (error) {
            // if (!error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) 
            log('[Debug]:: Received error from D-Bus search provider %s during GetResultMetas: %s'.format(this.id, String(error)));
            // }
            callback([]);
            return;
        }
        super._getResultMetasFinished(results, error, callback);
    }
}
function getProvider(app, appName) {
    if (!app)
        return;
    const appInfo = app.get_app_info();
    appInfo.get_description = () => `List of tabs open in ${appInfo}`;
    appInfo.get_name = () => `${appName} Tabs`;
    // appInfo.get_id = () => `arcmenu.open-browsertabs.${appName}`;

    return new WebBrowserTabSearchProvider(
        appInfo,
        `${BASE_ID}.${appName}`,
        `${BASE_PATH}/${appName}`,
        true,
    );
}

var BrowserTabExtension = class {
    private _searchSettings: typeof Gio.Settings;

    constructor() {
        this._searchSettings = new Gio.Settings({ schema_id: SEARCH_PROVIDERS_SCHEMA });
        this.loadRemoteSearchProviders = RemoteSearch.loadRemoteSearchProviders;
    }

    enable() {
        Util.spawn(["/usr/bin/killall", "searchprovider-connector"]);

        const appSystem = Shell.AppSystem.get_default();
        const extensionThis = this;

        RemoteSearch.loadRemoteSearchProviders = function (searchSettings, callback) {
            log('[Debug]::loadRemoteSearchProviders');
            extensionThis.loadRemoteSearchProviders(searchSettings, results => {
                log(`[Debug]::loadRemoteSearchProviders results: ${results.length}`);
                const providers = [
                    getProvider(appSystem.lookup_app('firefox.desktop'), 'Firefox'),
                    getProvider(appSystem.lookup_app('org.chromium.Chromium.desktop'), 'Chromium'),
                ];
                results.unshift(...providers.filter(p => p !== undefined));
                log(`[Debug]::loadRemoteSearchProviders results: ${results.length}`);
                callback(results);
            });
        };

        this._reloadProviders();

    }

    disable() {
        RemoteSearch.loadRemoteSearchProviders = this.loadRemoteSearchProviders;

        this._reloadProviders();

        Util.spawn(["/usr/bin/killall", "searchprovider-connector"]);
    }

    _reloadProviders() {
        this._searchSettings.set_boolean('disable-external', true);
        this._searchSettings.set_boolean('disable-external', false);
    }
}
