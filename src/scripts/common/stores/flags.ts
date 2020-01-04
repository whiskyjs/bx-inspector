import {types} from "mobx-state-tree";

export const RequestFlags = types.model("RequestFlags", {
    active: types.optional(types.boolean, false),
}).actions((self) => {
    return {
        setActive(active = true): void {
            self.active = active;
        }
    };
});

export const FlagStore = types.model("FlagStore", {
    requests: types.optional(RequestFlags, {}),
});
