interface IConstants {
    readonly NATIVE_APPID: string,
    readonly SUPPORTED_PLATFORMS: ReadonlyArray<chrome.runtime.PlatformOs>
}

const Constants: IConstants = {
    NATIVE_APPID: "com.github.harshadgavali.tabsearchproviderconnector",
    SUPPORTED_PLATFORMS: ['linux'],
};

type Nullable<T> = T | undefined | null;

/**
 * This is typescript type gaurd to determine whether object is non nullable
 * @returns true if obj is neither null nor undefined
 */
function IsNonNullable<T>(obj: Nullable<T>): obj is T {
    return obj !== undefined && obj !== null;
}

const State = {
    port: undefined as Nullable<chrome.runtime.Port>,
    reconnectTimer: 0 as Nullable<number>,
    // restart host app after 5ms
    // host app is killed when session is locked
    // so this delay needs to be small
    reconnectDelay: 5_000,
    activeTabTracker: new Map<number, number>(),
};

interface IResponse {
    status: 200 | 404,
    data: unknown,
}

interface IResponseTab {
    id: number,
    title: string,
    url: string,
}

interface IRequest {
    type?: 'GET' | 'POST',
    route?: 'tabs' | 'tab',
    data?: any,
}

interface IGetTabsRequestData {
    // let client requesting tabs decide whether to exclude active tabs from result
    excludeActiveTabs?: boolean,
}

interface IActiveTabRequestData {
    id?: any,
}

/**
 * Send message to native host
 */
function sendResponse(message: IResponse) {
    try {
        // console.log(`WebExtension SEND: ${JSON.stringify(message)}`);
        if (State.port)
            State.port.postMessage(message);
        else
            console.warn('port is disconnected');
    } catch (e) {
        console.error(e);
    }
}


function getAllTabs(reqData: Nullable<IGetTabsRequestData>, callback: (tabs: IResponseTab[]) => void) {
    chrome.tabs.query(
        {
            // if true, only active tabs are returned
            // if false, active tabs are excluded,
            // if undefined, all tabs are returned
            active: reqData?.excludeActiveTabs ? false : undefined,
        },
        allTabs => {
            const tabs = allTabs
                .map(t => {
                    if (IsNonNullable(t.id) && IsNonNullable(t.title) && IsNonNullable(t.url)) {
                        return {
                            id: t.id,
                            title: t.title,
                            url: t.url
                        }
                    }
                    return undefined;
                })
                .filter(IsNonNullable);
            callback(tabs);
        },
    );
}

function handleGetRquest(req: IRequest) {
    switch (req.route) {
        case 'tabs':
            getAllTabs(req.data, tabs => {
                sendResponse({ status: 200, data: tabs });
            });
            break;
        default:
            sendResponse({ status: 404, data: `Route '${req.route}' is not available for GET request.` });
    }
}

/**
 * Activate browser tab with given id and focus window containing tab
 * @param id id of tab
 */
function activateTab(id: number) {
    chrome.tabs.update(id, { active: true }, tab => {
        if (IsNonNullable(tab)) {
            chrome.windows.update(tab.windowId, { focused: true });
        }
    });
}

function handlePostRquest(req: IRequest) {
    switch (req.route) {
        case 'tab':
            const data: Nullable<IActiveTabRequestData> = req.data;
            if (typeof data?.id === 'number')
                activateTab(data.id);
            break;
    }
}

/**
 * handle request received from native host
 */
function onRequestReceived(request: IRequest) {
    try {
        // console.log(`WebExtension RECV: ${JSON.stringify(request)}`);
        switch (request.type) {
            case 'GET':
                handleGetRquest(request);
                break;
            case 'POST':
                handlePostRquest(request);
                break;
        }
    } catch (e) {
        console.error(e);
    }
}

function onDisconnect(port: chrome.runtime.Port) {
    const errorMessage = (chrome.runtime.lastError ?? ((port as any).error as Nullable<Error>))?.message;
    console.log("Inside onDisconnected(): " + errorMessage);
    State.port = undefined;
    State.reconnectTimer = setTimeout(connectNative, State.reconnectDelay);
}

function connectNative() {
    if (IsNonNullable(State.reconnectTimer)) {
        clearTimeout(State.reconnectTimer);
        State.reconnectTimer = undefined;
    }

    State.port = chrome.runtime.connectNative(Constants.NATIVE_APPID);
    State.port.onDisconnect.addListener(onDisconnect);
    State.port.onMessage.addListener(onRequestReceived);
}

chrome.runtime.getPlatformInfo(platformInfo => {
    if (Constants.SUPPORTED_PLATFORMS.indexOf(platformInfo.os) >= 0)
        connectNative();
});