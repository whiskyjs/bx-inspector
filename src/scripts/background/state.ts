import {applySnapshot, onSnapshot} from "mobx-state-tree";
import localForage from "localforage";

import {BackgroundStore} from "@common/stores/background";
import {defaultBackgroundStore} from "@common/state/background";
import {FlagStore} from "@common/stores/flags";
import {defaultFlagStore} from "@common/state/flags";
import {isProduction} from "@common/functions";

localForage.config({
    driver: localForage.INDEXEDDB,
    name: "bx-inspector",
    storeName: "localforage",
});

const backgroundStore = BackgroundStore.create(defaultBackgroundStore);
const flagStore = FlagStore.create(defaultFlagStore);

let persistBackgroundStore = true;

function setPersistBackgroundStore(persist = true): void {
    persistBackgroundStore = persist;
}

onSnapshot(backgroundStore, (snapshot) => {
    if (persistBackgroundStore && isProduction()) {
        localForage.setItem("data", snapshot);
    }
});


if (isProduction()) {
    (async (): Promise<void> => {
        const snapshot: string = await localForage.getItem("data");

        if (snapshot) {
            setPersistBackgroundStore(false);
            applySnapshot(backgroundStore, snapshot);
            setPersistBackgroundStore(true);
        }
    })();
}

export {
    backgroundStore,
    flagStore,
    setPersistBackgroundStore,
}
