
declare module 'resource:///org/gnome/shell/ui/main.js' {
    import { Overview } from 'resource:///org/gnome/shell/ui/overview.js';

    export const overview: Overview;
    export const wm: GnomeShellObject;
}