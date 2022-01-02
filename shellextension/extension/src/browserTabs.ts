const { Shell, Gio } = imports.gi;

const RemoteSearch = imports.ui.remoteSearch;
const Util = imports.misc.util;
const Main = imports.ui.main;
const ExtensionUtils = (imports.misc as any).extensionUtils;

const DOMAIN_NAME = 'com.github.harshadgavali';
const BASE_ID = `${DOMAIN_NAME}.SearchProvider`;
const BASE_PATH = `/${DOMAIN_NAME.replace(/\./g, '/')}/SearchProvider`;
const SEARCH_PROVIDERS_SCHEMA = 'org.gnome.desktop.search-providers';
const EXENAME = `${DOMAIN_NAME}.tabsearchproviderconnector`;
const ARCMENU_UUID = 'arcmenu@arcmenu.com';

export class WebBrowserTabSearchProvider extends RemoteSearch.RemoteSearchProvider2 {
    constructor(appInfo: typeof Gio.DesktopAppInfo.prototype, dbusName: string, dbusPath: string, autoStart: boolean) {
        super(appInfo, dbusName, dbusPath, autoStart);

        this.id = `tabsearchprovider.${dbusName}`;
        this.isRemoteProvider = true;
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
    private _appSystem: any;
    // private _arcMenuProviders: WebBrowserTabSearchProvider[];
    private _shellProviders: WebBrowserTabSearchProvider[];
    private _shellSearchResults: any;
    private _waitForArcMenuId = 0;
    private _extensionManager: any;
    private _arcMenuProviderCallbackFunc: () => void;

    constructor() {
        this._searchSettings = new Gio.Settings({ schema_id: SEARCH_PROVIDERS_SCHEMA });
        this._loadRemoteSearchProviders = RemoteSearch.loadRemoteSearchProviders;
        this._appSystem = Shell.AppSystem.get_default();

        /// shell providers
        this._extensionManager = (Main as any).extensionManager;
        this._shellSearchResults = (Main as any).overview._overview._controls._searchController._searchResults;
        this._shellProviders = this._getProviders();
        this._shellProviders.forEach((provider: any) => {
            provider.isRemoteProvider = false;  // shell provider can't be registered again
            provider.searchInProgress = false;
            log(`this._shellSearchResults._registerProvider(${provider.id});`);
            // this._shellSearchResults._registerProvider(provider);
            this._shellSearchResults._providers.push(provider);
            this._shellSearchResults._ensureProviderDisplay(provider);
        });

        /// arcmeny providers
        this._arcMenuProviderCallbackFunc = this._getProviders.bind(this);
        this._registerToArcMenu();

        // RemoteSearch.loadRemoteSearchProviders = function (searchSettings, callback) {
        //     extensionThis._loadRemoteSearchProviders(searchSettings, results => {
        //         .forEach(provider => {
        //         if (provider)
        //             results.unshift(provider);
        //     });

        //         callback(results);
        //     });
        // };

        // this._reloadProviders();
    }

    destroy() {
        if (this._waitForArcMenuId) {
            this._extensionManager.disconnect(this._waitForArcMenuId);
        }

        const arcmenu = this._extensionManager.lookup(ARCMENU_UUID);
        if (arcmenu?.api?.unregisterSearchProviderCallback) {
            arcmenu.api.unregisterSearchProviderCallback(this._arcMenuProviderCallbackFunc);
        }

        this._shellProviders.forEach(provider => {
            provider.isRemoteProvider = false;  // shell provider can't be registered again
            log(`this._shellSearchResults._unregisterProvider(${provider.id});`);
            this._shellSearchResults._unregisterProvider(provider);
        });

        // RemoteSearch.loadRemoteSearchProviders = this._loadRemoteSearchProviders;
        // this._reloadProviders();
        Util.spawn(["/usr/bin/killall", EXENAME]);
    }

    _registerToArcMenu() {
        const arcmenu = this._extensionManager.lookup(ARCMENU_UUID);
        log([arcmenu?.state, ExtensionUtils.ExtensionState.ENABLED, JSON.stringify(arcmenu?.api)]);
        if (arcmenu?.state === ExtensionUtils.ExtensionState.ENABLED) {
            if (arcmenu.api?.registerSearchProviderCallback) {
                arcmenu.api.registerSearchProviderCallback(this._arcMenuProviderCallbackFunc);
            }
        }

        this._waitForArcMenuId = this._extensionManager.connect('extension-state-changed', (_obj: any, extension: any) => {
            if (extension?.state !== ExtensionUtils.ExtensionState.ENABLED) return;
            if (extension.uuid !== ARCMENU_UUID) return;

            log([JSON.stringify(extension?.api)]);
            if (extension.api?.registerSearchProviderCallback) {
                extension.api.registerSearchProviderCallback(this._arcMenuProviderCallbackFunc);
            }

            this._extensionManager.disconnect(this._waitForArcMenuId);
            this._waitForArcMenuId = 0;
        });
    }

    _getProviders() {
        return [
            getProvider(this._appSystem.lookup_app('org.chromium.Chromium.desktop'), 'Chromium'),
            getProvider(this._appSystem.lookup_app('microsoft-edge.desktop'), 'Edge'),
            getProvider(this._appSystem.lookup_app('firefox.desktop'), 'Firefox'),
        ].filter((p: WebBrowserTabSearchProvider | undefined): p is WebBrowserTabSearchProvider => p !== undefined);
    }

    // _reloadProviders() {
    //     this._searchSettings.set_boolean('disable-external', true);
    //     this._searchSettings.set_boolean('disable-external', false);
    // }
}
