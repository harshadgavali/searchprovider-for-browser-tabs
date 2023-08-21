declare module 'resource:///org/gnome/shell/ui/overview.js' {
    import { SearchController } from 'resource:///org/gnome/shell/ui/searchController.js';

    export class Overview {
        get searchController(): SearchController;
    }
}