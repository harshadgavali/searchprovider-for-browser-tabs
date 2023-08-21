
declare module 'resource:///org/gnome/shell/ui/remoteSearch.js' {
    import Gio from 'gi://Gio';
    import St from 'gi://St';

    export interface IResultMeta {
        id: string;
        name: string;
        description: string;
        createIcon: (size: number) => St.Icon;
    }

    export interface IRemoteSearchProvider2 {
        id: string;
        isRemoteProvider: boolean;
        canLaunchSearch: boolean;
        appInfo: Gio.DesktopAppInfo;

        filterResults(results: string[], maxNumber: number): string[];

        getInitialResultSet(terms: string[], cancellable: Gio.Cancellable): Promise<string[]>;
        getSubsearchResultSet(previousResults: string[], newTerms: string[], cancellable: Gio.Cancellable): Promise<string[]>;
        getResultMetas(ids: string[], cancellable: Gio.Cancellable): Promise<IResultMeta[]>;
        activateResult(id: string, terms: string[]): void;
        launchSearch(terms: string[]): void;
    }
}