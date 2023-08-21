
declare module 'resource:///org/gnome/shell/extensions/extension.js' {
    import { ExtensionBase } from 'resource:///org/gnome/shell/extensions/sharedInternals.js';

    export abstract class Extension extends ExtensionBase {
        abstract enable(): void;
        abstract disable(): void;
        openPreferences(): void;
    }

    export class InjectionManager {
        // eslint-disable-next-line @typescript-eslint/ban-types
        overrideMethod(prototype: object, methodName: string, createOverrideFunc: (originalMethod: Function | null) => Function): void;
        restoreMethod(prototype: object, methodName: string): void;
        clear(): void;
    }
}