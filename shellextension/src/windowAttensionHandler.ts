const { windowAttentionHandler, activateWindow } = imports.ui.main;
export class WindowAttentionHandlerExtension {
    enable() {
        global.display.block_signal_handler(windowAttentionHandler._windowDemandsAttentionId);
        global.display.block_signal_handler(windowAttentionHandler._windowMarkedUrgentId);
        this._signalIds = [
            global.display.connect('window-demands-attention', this._windowDemandsAttention.bind(this)),
            global.display.connect('window-marked-urgent', this._windowDemandsAttention.bind(this)),
        ];
    }
    disable() {
        this._signalIds.reverse().forEach(id => global.display.disconnect(id));
        this._signalIds = [];
        global.display.unblock_signal_handler(windowAttentionHandler._windowMarkedUrgentId);
        global.display.unblock_signal_handler(windowAttentionHandler._windowDemandsAttentionId);
    }
    _windowDemandsAttention(display, window) {
        if (!window || window.skip_taskbar)
            return;
        activateWindow(window);
    }
};
