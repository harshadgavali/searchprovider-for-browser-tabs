
declare module 'resource:///org/gnome/shell/js/ui/main.js' {
    import Shell from '@gi-types/shell0';
    import Meta from '@gi-types/meta8';
    import St from '@gi-types/st1';
    import Clutter from '@gi-types/clutter8';

    export const actionMode: Shell.ActionMode;
    export function notify(message: string): void;
    export function activateWindow(window: Meta.Window, time?: number, workspaceNum?: number): void;

    export const panel: {
        addToStatusArea(role: string, indicator: Clutter.Actor, position?: number, box?: string): void,
    } & Clutter.Actor;

    export const overview: {
        dash: {
            showAppsButton: St.Button
        };
        searchEntry: St.Entry,
        shouldToggleByCornerOrButton(): boolean,
        visible: boolean,
        show(): void,
        hide(): void,
        showApps(): void,
        connect(signal: 'showing' | 'hiding' | 'hidden' | 'shown', callback: () => void): number,
        disconnect(id: number): void,
    };

    export const layoutManager: {
        uiGroup: Clutter.Actor,
        panelBox: St.BoxLayout,
        getWorkAreaForMonitor: (index: number) => Meta.Rectangle,
    };

    export const wm: {
        skipNextEffect(actor: Meta.WindowActor): void;
    };

    export const osdWindowManager: {
        hideAll(): void;
    };

}