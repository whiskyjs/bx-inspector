import {Instance} from "mobx-state-tree";

import * as MobX from "@common/types/graphql-models";

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

export interface QueryEvaluateParams {
    language: Optional<Instance<typeof MobX.EvaluationLanguage>>;
    source: Optional<string>; 
}

export interface QueryRequest {
    user: QueryUserParams;
    group: QueryGroupParams;
    evaluate: QueryEvaluateParams;
}

export interface QueryResponse {
    user: Optional<Instance<typeof MobX.User>>;
    group: Optional<Instance<typeof MobX.Group>>;
    evaluate: Optional<Instance<typeof MobX.EvaluationResult>>;
}
