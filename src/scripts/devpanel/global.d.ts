import {App} from "@devpanel/app";

declare global {
    interface Window {
        App: App;
        config: JsonMap;
    }
}
