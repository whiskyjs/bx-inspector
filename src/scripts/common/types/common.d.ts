import {App} from "@std/app";

declare global {
    interface Window {
        App: App;
        config: JsonMap;
    }

    type GenericObject = {
        [key: string]: any;
    };

    type Optional<T> = T | undefined;
}
