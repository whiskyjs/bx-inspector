import {types} from "mobx-state-tree";

export const EnumTypeNameValues = [
    "EnumTypeValue",
];

export const EnumTypeName = types.enumeration("EnumTypeName", EnumTypeNameValues);
