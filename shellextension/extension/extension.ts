import { BrowserTabExtension } from './src/browserTabs.js';
import { WindowAttentionHandlerExtension } from './src/windowAttensionHandler.js';

class Extension implements IExtension {
    private _extensions: ISubExtension[] = [];

    enable(): void {
        this._extensions = [
            new BrowserTabExtension(),
            new WindowAttentionHandlerExtension(),
        ];
    }

    disable(): void {
        this._extensions.reverse().forEach(extension => extension.destroy());
        this._extensions = [];
    }
}

export default function init() {
    return new Extension();
}
