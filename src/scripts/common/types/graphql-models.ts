import {IAnyModelType, types} from "mobx-state-tree";

export const EvaluationLanguage = types.enumeration("EvaluationLanguage", [
    "PHP",
    "SQL",
]);

export const EvaluationResult = types
    .model("EvaluationResult", {
        "output": types.maybe(types.string),
        "result": types.maybe(types.string),
    });

export const User = types
    .model("User", {
        "ID": types.maybe(types.string),
        "LOGIN": types.maybe(types.string),
        "EMAIL": types.maybe(types.string),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        "GROUPS": types.maybe(types.array(types.maybe(types.late((): IAnyModelType => Group)))),
    });

export const Group = types
    .model("Group", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        "USERS": types.maybe(types.array(types.maybe(types.late((): IAnyModelType => User)))),
    });

export const Query = types
    .model("Query", {
        "user": types.maybe(User),
        "group": types.maybe(Group),
        "version": types.maybe(types.string),
        "evaluate": types.maybe(EvaluationResult),
    });

export const GroupFilterInput = types
    .model("GroupFilterInput", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
    });

export const UserFilterInput = types
    .model("UserFilterInput", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
    });
