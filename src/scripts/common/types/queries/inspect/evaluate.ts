// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as InspectEvaluate from "@common/graphql/queries/inspect/evaluate.graphql";

import {InspectResponse} from "@common/types/graphql-types";

interface InspectEvaluateOutbound {
    inspect: Pick<InspectResponse, "evaluate">;
}

export {
    InspectEvaluate,
    InspectEvaluateOutbound,
}
