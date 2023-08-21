import { DBUS_BASE_ID, EXENAME } from '../constants.js';
import { trySpawnCommandline } from './utils.js';


/** dbusName is expected to follow `<BASE_ID>.<APP_NAME>(.<anything>)?` */
export function getDBusAppName(dbusName: string) {
    const [busExtName] = dbusName.substring(DBUS_BASE_ID.length + 1).split('.', 1);
    return busExtName;
}

/**
 * @param dbusName name of dbus server 
 * @returns list of app-ids for possible apps that created dbus server with given name 
 */
export function getAppIdsforDBus(dbusName: string) {
    const idMap = new Map(Object.entries({
        Firefox: ['firefox.desktop'],
        Chromium: ['org.chromium.Chromium.desktop', 'chromium-browser.desktop'],
        Edge: ['microsoft-edge.desktop', 'microsoft-edge-dev.desktop'],
    }));

    const dbusAppName = getDBusAppName(dbusName);
    return idMap.get(dbusAppName) ?? [];
}

/**
 * Terminates all host connectors which weren't killed after browser is closed
*/
export async function stopDBusSearchServers(): Promise<void> {
    try {
        await trySpawnCommandline(['/usr/bin/killall', EXENAME]);
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`error while stopping dbus server(${DBUS_BASE_ID}]): ${err}`);
    }
}