const { Shell, Gio } = imports.gi;

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
        this.isRemoteProvider = true;
        this.canLaunchSearch = false;
    }

    override async getInitialResultSet(terms: string[], cancellable: typeof Gio.Cancellable.prototype) {
        try {
            const [results] = await this.proxy.GetInitialResultSetAsync(terms, cancellable);
            return results;
        }
        catch (error) {
            this._handleGioDbusError(error);
            return [];
        }
    }

    override async getSubsearchResultSet(previousResults: unknown[], newTerms: string[], cancellable: typeof Gio.Cancellable.prototype) {
        try {
            const [results] = await this.proxy.GetSubsearchResultSetAsync(previousResults, newTerms, cancellable);
            return results;
        }
        catch (error) {
            this._handleGioDbusError(error);
            return [];
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _handleGioDbusError(error: any) {
        if (
            !error?.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED) &&
            !error?.matches(Gio.DBusError, Gio.DBusError.SERVICE_UNKNOWN)
        ) {
            log(`Received error from D-Bus search provider ${this.id}: ${error}`);
        }
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
    private _appIds: { id: string, name: string }[];
    private _loadRemoteSearchProviders: typeof RemoteSearch.loadRemoteSearchProviders;

    constructor() {
        this._searchSettings = new Gio.Settings({ schema_id: SEARCH_PROVIDERS_SCHEMA });
        this._loadRemoteSearchProviders = RemoteSearch.loadRemoteSearchProviders;
        this._appIds = [
            { id: 'firefox.desktop', name: 'Firefox' },
            { id: 'microsoft-edge.desktop', name: 'Edge' },
            { id: 'org.chromium.Chromium.desktop', name: 'Chromium' },
        ];
        this._appIds.reverse();

        const appSystem = Shell.AppSystem.get_default();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const extensionThis = this;

        RemoteSearch.loadRemoteSearchProviders = function (searchSettings) {
            const providers = extensionThis._loadRemoteSearchProviders(searchSettings);
            extensionThis._appIds.forEach(app => {
                const provider = getProvider(appSystem.lookup_app(app.id), app.name);
                if (provider)
                    providers.unshift(provider);
            });
            return providers;
        };

        this._reloadProviders();
    }

    destroy() {
        RemoteSearch.loadRemoteSearchProviders = this._loadRemoteSearchProviders;
        this._reloadProviders();
        Util.spawn(['/usr/bin/killall', EXENAME]);
    }

    _reloadProviders() {
        this._searchSettings.set_boolean('disable-external', true);
        this._searchSettings.set_boolean('disable-external', false);
    }
}
