// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as InspectEventsSubscribe from "@common/graphql/mutations/inspect/events/subscribe.graphql";

import {MutationResponse} from "@common/types/graphql-types";

type InspectEventsSubscribeOutbound = Pick<MutationResponse, "inspectEventsSubscribe">;

export {
    InspectEventsSubscribe,
    InspectEventsSubscribeOutbound,
}
