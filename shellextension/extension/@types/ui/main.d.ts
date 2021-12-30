declare module 'resource:///org/gnome/shell/js/ui/main.js' {
    import Meta from '@gi-types/meta8';
    import { WindowAttentionHandler } from 'resource:///org/gnome/shell/js/ui/windowAttentionHandler.js';

    export function activateWindow(window: Meta.Window, time?: number, workspaceNum?: number): void;
    export const windowAttentionHandler: WindowAttentionHandler;
}