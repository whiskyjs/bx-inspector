import {types} from "mobx-state-tree";

// Монитор событий
export const EventMonitor = types
    .model("EventMonitor", {
        isEventModalOpen: types.optional(types.boolean, false),
        isSubscriptionActive: types.optional(types.boolean, false),
        filterValue: types.optional(types.string, ""),
        eventLog: types.optional(types.string, ""),
    })
    .actions((self) => {
        return {
            setEventModalOpen(open: boolean): void {
                self.isEventModalOpen = open;
            },
            setSubscriptionActive(active: boolean): void {
                self.isSubscriptionActive = active;
            },
            setFilterValue(value: string): void {
                self.filterValue = value;
            },
            setEventLog(value: string): void {
                self.eventLog = value;
            },
            appendToEventLog(value: string): void {
                self.eventLog = self.eventLog.concat(
                    self.eventLog ? "\n\n" : "",
                    value
                );
            },
        };
    });

export const RuntimePanelStore = types
    .model("RuntimePanelStore", {
        eventMonitor: EventMonitor,
    });
