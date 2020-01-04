import {IAnyModelType, IAnyType, Instance, types} from "mobx-state-tree";

export const EvaluationLanguageType = types.enumeration("EvaluationLanguageType", [
    "PHP",
    "SQL",
]);

export const EvaluationResultType = types
    .model("EvaluationResultType", {
        "output": types.maybe(types.string),
        "result": types.maybe(types.string),
    }).actions((self) => {
        return {
            // "ObjectTypeAction"(argument) {},
        };
    });

export const UserType = types
    .model("UserType", {
        "ID": types.maybe(types.string),
        "LOGIN": types.maybe(types.string),
        "EMAIL": types.maybe(types.string),
        "GROUPS": types.maybe(types.array(types.maybe(types.late(((): IAnyModelType => GroupType))))),
    });

export const UserTypeHelper = {
    getGroups(self: Instance<typeof UserType>): Instance<typeof UserType.properties.GROUPS> {
        return self.GROUPS;
    }
};

export const GroupType = types
    .model("GroupType", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
        "USERS": types.late(() => types.maybe(types.array(types.maybe(UserType)))),
    }).actions((self) => {
        return {
            // "ObjectTypeAction"(argument) {},
        };
    });

export const QueryType = types
    .model("QueryType", {
        "user": types.maybe(UserType),
        "group": types.maybe(GroupType),
        "version": types.maybe(types.string),
        "evaluate": types.maybe(EvaluationResultType),
    }).actions((self) => {
        return {
            // "ObjectTypeAction"(argument) {},
        };
    });

export const GroupFilterType = types
    .model("GroupFilterType", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
    }).actions((self) => {
        return {
            // "ObjectTypeAction"(argument) {},
        };
    });

export const UserFilterType = types
    .model("UserFilterType", {
        "ID": types.maybe(types.string),
        "NAME": types.maybe(types.string),
    }).actions((self) => {
        return {
            // "ObjectTypeAction"(argument) {},
        };
    });
