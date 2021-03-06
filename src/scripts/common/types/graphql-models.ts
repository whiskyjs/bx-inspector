import {IAnyModelType, types} from "mobx-state-tree";

export const EvaluationLanguageValues = [
    "PHP",
    "SQL",
];

export const EvaluationLanguage = types.enumeration("EvaluationLanguage", EvaluationLanguageValues);

export const ModuleFormEventsValues = [
    "OnBeforeResultAdd",
    "OnAfterResultAdd",
];

export const ModuleFormEvents = types.enumeration("ModuleFormEvents", ModuleFormEventsValues);

export const ModuleIblockEventsValues = [
    "OnBeforeIBlockElementUpdate",
    "OnAfterIBlockElementUpdate",
];

export const ModuleIblockEvents = types.enumeration("ModuleIblockEvents", ModuleIblockEventsValues);

export const ModuleMainEventsValues = [
    "OnBeforeEventAdd",
    "OnBeforeEventSend",
];

export const ModuleMainEvents = types.enumeration("ModuleMainEvents", ModuleMainEventsValues);

export const GroupFilterInput = types
    .model("GroupFilterInput", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
    });

export const ModuleEventSetInput = types
    .model("ModuleEventSetInput", {
        "main": types.maybe(types.array(ModuleMainEvents)),
        "iblock": types.maybe(types.array(ModuleIblockEvents)),
        "form": types.maybe(types.array(ModuleFormEvents)),
    });

export const UserFilterInput = types
    .model("UserFilterInput", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
    });

export const EvaluationResult = types
    .model("EvaluationResult", {
        "output": types.string,
        "result": types.string,
    });

export const User = types
    .model("User", {
        "ID": types.string,
        "LOGIN": types.string,
        "EMAIL": types.string,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        "GROUPS": types.maybe(types.array(types.maybe(types.late((): IAnyModelType => Group)))),
    });

export const Group = types
    .model("Group", {
        "ID": types.string,
        "NAME": types.maybe(types.string),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        "USERS": types.maybe(types.array(types.maybe(types.late((): IAnyModelType => User)))),
    });

export const Inspect = types
    .model("Inspect", {
        "version": types.maybe(types.string),
        "evaluate": types.maybe(EvaluationResult),
    });

export const Mutation = types
    .model("Mutation", {
        "inspectEventsSubscribe": types.maybe(types.string),
        "inspectEventsUnsubscribe": types.maybe(types.string),
    });

export const Query = types
    .model("Query", {
        "user": types.maybe(User),
        "group": types.maybe(Group),
        "inspect": types.maybe(Inspect),
    });
