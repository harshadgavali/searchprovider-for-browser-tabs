declare module 'resource:///org/gnome/shell/ui/searchController.js' {
    import St from 'gi://St';
    import { IRemoteSearchProvider2 } from 'resource:///org/gnome/shell/ui/remoteSearch.js';

    export class SearchController extends St.Widget {
        addProvider(provider: IRemoteSearchProvider2): void;
        removeProvider(provider: IRemoteSearchProvider2): void;
    }
}