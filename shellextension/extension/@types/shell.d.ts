
import Shell from 'gi://Shell';
import Clutter from 'gi://Clutter';

declare namespace GnomeShell {
    interface Global extends Shell.Global {
        stage: Clutter.Stage;
    }
}

declare global {
    type GnomeShellString = string & Record<string, undefined>;
    type GnomeShellNumber = number & Record<string, undefined>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    type GnomeShellFunction = Function & Record<string, undefined>;
    type GnomeShellObject = undefined | null |
        GnomeShellString | GnomeShellNumber | GnomeShellFunction | {
            [key: string]: GnomeShellObject;
        };

    const global: GnomeShell.Global;
    // const imports: never;
}
