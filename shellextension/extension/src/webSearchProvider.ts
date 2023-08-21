
import { GLib, Gio, RemoteSearch, St } from '../imports.js';
import { DBUS_BASE_ID, SettingValues } from '../constants.js';
import { getDBusAppName } from './tabSearchUtils.js';
import { createProxy } from './utils.js';

export const SEARCHPROVIDER2_IFACE = `
<node>
  <interface name="org.gnome.Shell.SearchProvider2">
    <method name="GetInitialResultSet">
      <arg type="as" direction="in" />
      <arg type="as" direction="out" />
    </method>
    <method name="GetSubsearchResultSet">
      <arg type="as" direction="in" />
      <arg type="as" direction="in" />
      <arg type="as" direction="out" />
    </method>
    <method name="GetResultMetas">
      <arg type="as" direction="in" />
      <arg type="aa{sv}" direction="out" />
    </method>
    <method name="ActivateResult">
      <arg type="s" direction="in" />
      <arg type="as" direction="in" />
      <arg type="u" direction="in" />
    </method>
    <method name="LaunchSearch">
      <arg type="as" direction="in" />
      <arg type="u" direction="in" />
    </method>
  </interface>
</node>`;


/**
 * @param dbusName name of dbus server
 * @returns proxy for search provider dbus server with given name 
 */
export function createSearchProviderProxy(dbusName: string) {
    const dbusAppName = getDBusAppName(dbusName);
    const dbusPath = `/${DBUS_BASE_ID.replace(/\./g, '/')}/${dbusAppName}`;
    return createProxy({
        name: dbusName,
        path: dbusPath,
        iface: 'org.gnome.Shell.SearchProvider2',
        interfaceXml: SEARCHPROVIDER2_IFACE,
        flags: Gio.DBusProxyFlags.DO_NOT_AUTO_START | Gio.DBusProxyFlags.DO_NOT_LOAD_PROPERTIES,
    });
}

/**
 * 
 */
export class WebSearchProvider implements RemoteSearch.IRemoteSearchProvider2 {
    id: string;
    isRemoteProvider = false;
    canLaunchSearch = false;
    appInfo: Gio.DesktopAppInfo;
    private _proxy: Gio.DBusProxy;

    constructor(dbusName: string, appInfo: Gio.DesktopAppInfo) {
        this.id = dbusName;
        this.appInfo = appInfo;
        this._proxy = createSearchProviderProxy(dbusName);
    }

    createIcon(size: number): St.Icon {
        const gicon = this.appInfo.get_icon();
        if (!gicon)
            return new St.Icon({ iconName: 'icon-missing-symbolic', iconSize: size });
        return new St.Icon({ gicon, iconSize: size });
    }

    filterResults(results: string[], maxNumber: number): string[] {
        return results.slice(0, maxNumber);
    }

    private _handleDBusError(error: unknown) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`Received error from D-Bus search provider ${this.id}: ${error}`);
    }

    private _shouldDoSearch(terms: string[]) {
        // there should be atleast one term with has required minimum term length
        if (!terms.some(t => t.length >= SettingValues.MinTermLength)) {
            return false;
        }

        // empty slash probably isn't meant for tab search (it could be for calculator)
        if (SettingValues.ExcludeSlash && terms.some(t => t === '/')) {
            return false;
        }

        return true;
    }


    async getInitialResultSet(terms: string[], cancellable: Gio.Cancellable) {
        // we need to server to make request with browser, server will only query browser for this request 

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const [results] = await this._proxy.GetInitialResultSetAsync(terms, cancellable) as [string[]];

            if (!this._shouldDoSearch(terms))
                return [];
            return results;

        } catch (error) {
            this._handleDBusError(error);
            return [];
        }
    }

    async getSubsearchResultSet(previousResults: string[], newTerms: string[], cancellable: Gio.Cancellable) {
        // previousResults is ignored by server, so we can just treat this as new query
        // but we can't call 'getInitialResultSet' from here, because server will do fresh query to browser for initial-search
        // server won't do more browser queries in sub-searches 

        if (!this._shouldDoSearch(newTerms)) {
            return [];
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const [results] = await this._proxy.GetSubsearchResultSetAsync(previousResults, newTerms, cancellable) as [string[]];
            return results;
        } catch (error) {
            this._handleDBusError(error);
            return [];
        }
    }

    async getResultMetas(ids: string[], cancellable: Gio.Cancellable): Promise<RemoteSearch.IResultMeta[]> {
        let metas: Record<string, GLib.Variant<'s'>>[];
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            [metas] = await this._proxy.GetResultMetasAsync(ids, cancellable) as [Record<string, GLib.Variant<'s'>>[]];
            // new GLib.Variant<'aa{sv}'>('aa{sv}', [{}]).deepUnpack();
        } catch (error) {
            this._handleDBusError(error);
            return [];
        }

        const resultMetas = metas.map(meta => {
            // serialize GLib.Variants
            return {
                id: meta['id'].deepUnpack(),
                name: meta['name'].deepUnpack(),
                description: meta['description'].deepUnpack(),
                createIcon: (size: number) => this.createIcon(size),
            };
        });

        return resultMetas;
    }

    activateResult(id: string, terms: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const promise = this._proxy.ActivateResultAsync(id, terms, global.get_current_time()) as Promise<void>;
        promise.catch(console.error);
    }

    launchSearch(_terms: string[]) {
        console.log(`Search provider ${this.id} does not implement LaunchSearch`);
    }
}