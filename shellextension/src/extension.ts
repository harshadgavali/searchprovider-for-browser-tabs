
class Extension implements IExtension {
    enable(): void {
        throw new Error('Method not implemented.');
    }
    disable(): void {
        throw new Error('Method not implemented.');
    }
}

function init() {
    return new Extension();
}