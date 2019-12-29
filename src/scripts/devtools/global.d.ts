import {App} from "@devtools/app";

declare global {
    interface Window {
        App: App;
        config: JsonMap;
    }
}
