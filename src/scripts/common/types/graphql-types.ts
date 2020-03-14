import {Instance} from "mobx-state-tree";

import * as MobX from "@common/types/graphql-models";

export interface InspectEvaluateParams {
    language: Instance<typeof MobX.EvaluationLanguage>;
    source: string;
}

export interface InspectRequest {
    evaluate: InspectEvaluateParams;
}

export interface InspectResponse {
    evaluate: Optional<Instance<typeof MobX.EvaluationResult>>;
}

export interface MutationInspectEventsSubscribeParams {
    clientId: string;
    events: Instance<typeof MobX.ModuleEventSetInput>;
}

export interface MutationInspectEventsUnsubscribeParams {
    clientId: string;
}

export interface MutationRequest {
    inspectEventsSubscribe: MutationInspectEventsSubscribeParams;
    inspectEventsUnsubscribe: MutationInspectEventsUnsubscribeParams;
}

export interface MutationResponse {
    inspectEventsSubscribe: Optional<string>;
    inspectEventsUnsubscribe: Optional<string>;
}

export interface QueryUserParams {
    by: Optional<string>;
    order: Optional<string>;
    filter: Optional<Instance<typeof MobX.UserFilterInput>>;
}

export interface QueryGroupParams {
    by: Optional<string>;
    order: Optional<string>;
    filter: Optional<Instance<typeof MobX.GroupFilterInput>>;
}

export interface QueryRequest {
    user: QueryUserParams;
    group: QueryGroupParams;
}

export interface QueryResponse {
    user: Optional<Instance<typeof MobX.User>>;
    group: Optional<Instance<typeof MobX.Group>>;
}
