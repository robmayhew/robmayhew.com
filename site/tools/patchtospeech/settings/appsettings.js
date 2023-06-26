export class AppSettings {
    constructor() {
        // Default settings
        this.playbackRate = 1;
        this.pitch = 1;
        this.volume = 1;
    }
}
export class SettingsStorage {
    save(settings) {
        localStorage.removeItem(SettingsStorage.key);
        let json = JSON.stringify(settings);
        console.debug("Savings " + json);
        localStorage.setItem(SettingsStorage.key, json);
    }
    load() {
        let settings = new AppSettings();
        let json = localStorage.getItem(SettingsStorage.key);
        if (json != undefined) {
            console.debug("Loading: " + json);
            settings = JSON.parse(json);
        }
        return settings;
    }
}
SettingsStorage.key = "settings";
