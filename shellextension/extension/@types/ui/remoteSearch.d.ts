
declare module 'resource:///org/gnome/shell/js/ui/remoteSearch.js' {
    import Gio from 'gi://Gio';

    class RemoteSearchProvider2 {
        constructor(appInfo: typeof Gio.DesktopAppInfo.prototype, dbusName: string, dbusPath: string, autoStart: boolean);
        canLaunchSearch: boolean;
        appInfo: Gio.DesktopAppInfo;
        id: string;
        isRemoteProvider: boolean;
        proxy: Gio.DBusProxy;

        getInitialResultSet(terms: string[], cancellable: Gio.Cancellable): Promise<unknown[]>;
        getSubsearchResultSet(previousResults: unknown[], newTerms: string[], cancellable: Gio.Cancellable): Promise<unknown[]>;
    }

    function loadRemoteSearchProviders(searchSettings: typeof Gio.Settings.prototype): RemoteSearchProvider2[];
}