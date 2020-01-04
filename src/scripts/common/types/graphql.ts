export type Maybe<T> = T | null;

export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export enum EvaluationLanguageType {
    Php = "PHP",
    Sql = "SQL"
}

export type EvaluationResultType = {
    __typename?: "EvaluationResultType";
    output: Scalars["String"];
    result: Scalars["String"];
};

export type QueryType = {
    __typename?: "QueryType";
    version?: Maybe<Scalars["String"]>;
    evaluate?: Maybe<EvaluationResultType>;
};

export type QueryTypeEvaluateArgs = {
    language: EvaluationLanguageType;
    source: Scalars["String"];
};

import gql from "graphql-tag";

export const Evaluate = gql`
    query evaluate($language: EvaluationLanguageType!, $source: String!) {
        evaluate(language: $language, source: $source) {
            output
            result
        }
    }
`;

export interface IntrospectionResultData {
    __schema: {
        types: {
            kind: string;
            name: string;
            possibleTypes: {
                name: string;
            }[];
        }[];
    };
}

const result: IntrospectionResultData = {
    "__schema": {
        "types": []
    }
};

export default result;
