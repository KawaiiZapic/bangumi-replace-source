import { storage } from "webextension-polyfill";

export interface IConfig {
    isEnabled: boolean;
    offset: number;
    forceAlign: boolean;
    autoPromptSelect: boolean;
};

const _config: IConfig = {
    isEnabled: true,
    offset: 0,
    forceAlign: true,
    autoPromptSelect: false
};

async function loadConfig() {
    const r = await storage.local.get();
    Object.assign(_config, r);
    return config;
}
storage.onChanged.addListener(async () => {
    await loadConfig();
});
const config = new Proxy(_config, {
    set(t, k, v) {
        _config[k] = v;
        storage.local.set({
            [k]: v
        });
        return true;
    }
});
function listenConfigChanged(cb?: () => void) {
    storage.onChanged.addListener(async () => {
        await loadConfig();
        cb?.();
    })
}

export {
    config,
    listenConfigChanged,
    loadConfig
}