const Constants = {
    NATIVE_APPID: "org.me.searchproviderconnector",
};

const State = {
    port: undefined as (chrome.runtime.Port | undefined),
    reconnectTimer: 0 as (number | undefined),
    reconnectDelay: 60_000,
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

interface IActiveTabRequestData {
    id?: any,
}


function sendResponse(message: IResponse) {
    try {
        console.log(`WebExtension SEND: ${JSON.stringify(message)}`);

        if (State.port)
            State.port.postMessage(message);
        else
            console.warn('port is disconnected');

    } catch (e) {
        console.error(e);
    }
}

function getAllTabs(callback: (tabs: IResponseTab[]) => void) {
    chrome.tabs.query({ active: false }, allTabs => {
        const tabs: (IResponseTab | undefined)[] = allTabs.map(t => {
            if (t.id === undefined || t.title === undefined || t.url === undefined)
                return undefined;
            return {
                id: t.id,
                title: t.title,
                url: t.url
            }
        });
        callback(tabs.filter((t): t is IResponseTab => t !== undefined));
    });
}

function handleGetRquest(req: IRequest) {
    switch (req.route) {
        case 'tabs':
            getAllTabs(tabs => {
                sendResponse({ status: 200, data: tabs });
            });
            break;
        default:
            sendResponse({ status: 404, data: `Route '${req.route}' is not available for GET request.` });
    }
}

function activateTab(id: number) {
    chrome.tabs.update(id, { active: true }, tab => {
        if (tab !== undefined) {
            chrome.windows.update(tab.windowId, { focused: true });
        }
    });
}

function handlePostRquest(req: IRequest) {
    switch (req.route) {
        case 'tab':
            const data: IActiveTabRequestData | null = req.data;
            if (typeof data?.id === 'number')
                activateTab(data.id);
            break;
    }
}

function onRequestReceived(request: IRequest) {
    try {
        console.log(`WebExtension RECV: ${JSON.stringify(request)}`);
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
    console.log("Inside onDisconnected(): " + chrome.runtime.lastError?.message);
    State.port = undefined;
    State.reconnectTimer = setTimeout(connectNative, State.reconnectDelay);
}

function connectNative() {
    if (State.reconnectTimer !== undefined) {
        clearTimeout(State.reconnectTimer);
        State.reconnectTimer = undefined;
    }

    State.port = chrome.runtime.connectNative(Constants.NATIVE_APPID);
    State.port.onDisconnect.addListener(onDisconnect);
    State.port.onMessage.addListener(onRequestReceived);
}

function notify(message: any) {
    console.log(`background script received message: ${message}`);
}

/*
Assign `notify()` as a listener to messages from the content script.
*/
chrome.runtime.onMessage.addListener(notify);

connectNative();