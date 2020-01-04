import {Singleton} from "@std/base/Singleton";

declare global {
    type SingletonInstanceType<T extends Singleton = Singleton> = T extends new () => infer R ? R : Singleton;

    interface SingletonInstanceStorage {
        [klass: string]: SingletonInstanceType<Singleton>;
    }

    type JsonValue = boolean | number | string | null | JsonArray | JsonMap;

    interface JsonMap {
        [key: string]: JsonValue;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface JsonArray extends Array<JsonValue> {
    }
}
