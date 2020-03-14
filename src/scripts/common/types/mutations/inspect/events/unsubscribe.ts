// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as InspectEventsUnsubscribe from "@common/graphql/mutations/inspect/events/unsubscribe.graphql";

import {MutationResponse} from "@common/types/graphql-types";

type InspectEventsUnsubscribeOutbound = Pick<MutationResponse, "inspectEventsUnsubscribe">;

export {
    InspectEventsUnsubscribe,
    InspectEventsUnsubscribeOutbound,
}
