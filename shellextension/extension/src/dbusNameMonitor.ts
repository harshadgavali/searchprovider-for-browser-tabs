import { Gio } from '../imports.js';
import { createProxy } from './utils.js';


declare type CallbackFunction = (name: string) => Promise<void>;
declare type FunctionArguments<T> = T extends (...args: infer R) => unknown ? R : never;

/**
 * Class to monitor dbus server names
 */
export class DBusNameMonitor {
    private _proxy?: Gio.DBusProxy;
    private _dbusNameStartsWith: string;
    private _cbOnNameAdded: CallbackFunction;
    private _cbOnNameRemoved: CallbackFunction;
    private _connectId?: unknown;

    constructor(dbusNameStartsWith: string, onNameAdded: CallbackFunction, onNameRemoved: CallbackFunction) {
        this._dbusNameStartsWith = dbusNameStartsWith;
        this._cbOnNameAdded = onNameAdded;
        this._cbOnNameRemoved = onNameRemoved;

        createProxy({
            name: 'org.freedesktop.DBus',
            path: '/org/freedesktop/DBus',
            iface: 'org.freedesktop.DBus',
            onProxyReady: this._onProxyReady.bind(this),
        });
    }

    clear() {
        if (this._connectId) {
            this._proxy?.disconnectSignal(this._connectId);
            this._connectId = undefined;
        }

        this._proxy = undefined;
    }

    async GetDBusServerPID(dbusName: string) {
        if (!this._proxy)
            return;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const [pid] = await this._proxy.GetConnectionUnixProcessIDAsync(dbusName) as [number];
            return pid;
        }
        catch (err) {
            console.error(err);
            return;
        }
    }

    private async _onProxyReady(proxy?: Gio.DBusProxy) {
        if (!proxy) {
            console.log('Proxy infact wasn\'t ready!');
            return;
        }
        this._proxy = proxy;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const [names] = await this._proxy.ListNamesAsync() as [string[],];
        for await (const name of names) {
            if (!name.startsWith(this._dbusNameStartsWith))
                continue;
            console.log(`${this._onProxyReady.name}: ${name} [${this._dbusNameStartsWith}]`);
            await this._tryCallback(this._cbOnNameAdded, name);
        }

        this._connectId = this._proxy.connectSignal('NameOwnerChanged', this._onNameOwnerChanged.bind(this));
    }

    private async _onNameOwnerChanged(_proxy: unknown, _sender: unknown, [name, oldOwner, newOwner]: string[]) {
        if (!name.startsWith(this._dbusNameStartsWith))
            return;

        console.log(`${this._onNameOwnerChanged.name}: ${name} [${this._dbusNameStartsWith}] (${newOwner},${oldOwner})`);

        if (newOwner && !oldOwner)
            await this._tryCallback(this._cbOnNameAdded, name);

        if (!newOwner && oldOwner)
            await this._tryCallback(this._cbOnNameRemoved, name);
    }

    private async _tryCallback(callback: CallbackFunction, ...args: FunctionArguments<CallbackFunction>) {
        try {
            await callback(...args);
        } catch (err) {
            console.error(err);
        }
    }
}