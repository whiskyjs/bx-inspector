// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as QueryEvaluate from "@common/graphql/queries/evaluate.graphql";

import {QueryResponse} from "@common/types/graphql-types";

type QueryEvaluateOutbound = Pick<QueryResponse, "evaluate">;

export {
    QueryEvaluate,
    QueryEvaluateOutbound,
}
