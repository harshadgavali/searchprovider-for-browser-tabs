
declare module 'resource:///org/gnome/shell/js/ui/remoteSearch.js' {
    import Gio from 'gi://Gio';

    class RemoteSearchProvider2 {
        constructor(appInfo: typeof Gio.DesktopAppInfo, dbusName: string, dbusPath: string, autoStart: boolean);
        canLaunchSearch: boolean;
        appInfo: Gio.DesktopAppInfo;
        id: string;
        isRemoteProvider: boolean;
        _getResultsFinished(results: any, error: any, callback: any): void;
        _getResultMetasFinished(results: any, error: any, callback: any): void;
    }

    function loadRemoteSearchProviders(_: never, callback: never): void;
}