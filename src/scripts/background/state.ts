import {BackgroundStore} from "@common/stores/background";
import {defaultBackgroundStore} from "@common/state/background";
import {applySnapshot, onSnapshot} from "mobx-state-tree";
import localForage from "localforage";

localForage.config({
    driver: localForage.INDEXEDDB,
    name: "bx-inspector",
    storeName: "localforage",
});

const backgroundStore = BackgroundStore.create(defaultBackgroundStore);

let persistStore = true;

function setPersistStore(persist = true): void {
    persistStore = persist;
}

onSnapshot(backgroundStore, (snapshot) => {
    if (persistStore) {
        localForage.setItem("data", snapshot);
    }
});

(async(): Promise<any> => {
    const snapshot: string = await localForage.getItem("data");

    if (snapshot) {
        setPersistStore(false);
        applySnapshot(backgroundStore, snapshot);
        setPersistStore(true);
    }
})();

export {
    backgroundStore,
    setPersistStore,
}
