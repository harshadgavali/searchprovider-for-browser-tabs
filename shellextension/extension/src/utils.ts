/* eslint-disable lines-around-comment */

import { FileUtils, Gio } from '../imports.js';

interface CreateProxyArguments {
    /** name of dbus server */
    name: string,
    /** object path of dbus server */
    path: string,
    /** interface for which to create proxy */
    iface: string,
    /** interface schema in xml format.If this is not provided, try to laod schema from dbus files */
    interfaceXml?: string | null,
    /** bus on which to create proxy (session or system bus). default is 'session' */
    bus?: Gio.DBusConnection,
    /** flags for creating proxy */
    flags?: Gio.DBusProxyFlags,
    cancellable?: Gio.Cancellable,
    /** async callback to call when proxy is ready */
    onProxyReady?: (proxy?: Gio.DBusProxy) => Promise<void>,
}

/** Create DBus proxy for giver server interface */
export function createProxy(proxy: CreateProxyArguments): Gio.DBusProxy {
    proxy.bus ??= Gio.DBus.session;
    proxy.flags ??= Gio.DBusProxyFlags.NONE;
    proxy.interfaceXml ??= FileUtils.loadInterfaceXML(proxy.iface);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const proxyWrapper = Gio.DBusProxy.makeProxyWrapper(proxy.interfaceXml);

    // function signature from https://gitlab.gnome.org/GNOME/gjs/-/blob/master/modules/core/overrides/Gio.js#L233
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return proxyWrapper(
        proxy.bus,
        proxy.name,
        proxy.path,
        proxy.onProxyReady,
        proxy.cancellable,
        proxy.flags,
    );
}

/** 
 * Run command and return it's output
 */
export function trySpawnCommandline(argv: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const process = Gio.Subprocess.new(
                argv,
                Gio.SubprocessFlags.STDERR_PIPE | Gio.SubprocessFlags.STDOUT_PIPE,
            );

            process.communicate_utf8_async(null, null, (_process, res) => {
                const [_, stdout, stderr] = process.communicate_utf8_finish(res);
                if (process.get_successful())
                    resolve(stdout);
                else
                    reject(stderr);
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * return pid of parent process
 */
export async function getParentProcessId(pid: number) {
    try {
        const result = await trySpawnCommandline(['/usr/bin/ps', '-o', 'ppid=', '-p', pid.toString()]);
        const number = Number(result);
        if (!Number.isNaN(number))
            return number;
        console.log(`Could not parse parent id(${result}) for ${pid}`);
        return undefined;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`Could not get parent id for ${pid}: ${err}`);
        return undefined;
    }
}