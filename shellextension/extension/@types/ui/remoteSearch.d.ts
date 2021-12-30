
declare module 'resource:///org/gnome/shell/js/ui/remoteSearch.js' {
    import Gio from 'gi://Gio';

    class RemoteSearchProvider2 {
        constructor(appInfo: typeof Gio.DesktopAppInfo.prototype, dbusName: string, dbusPath: string, autoStart: boolean);
        canLaunchSearch: boolean;
        appInfo: Gio.DesktopAppInfo;
        id: string;
        isRemoteProvider: boolean;
        _getResultsFinished(results: unknown[], error: typeof Gio.DBusError.prototype, callback: (results: unknown[]) => void): void;
        _getResultMetasFinished(results: unknown[], error: typeof Gio.DBusError.prototype, callback: (results: unknown[]) => void): void
    }

    function loadRemoteSearchProviders(searchSettings: typeof Gio.Settings.prototype, callback: (providers: RemoteSearchProvider2[]) => void): void;
}