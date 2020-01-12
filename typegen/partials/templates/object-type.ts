import {types} from "mobx-state-tree";

export const ObjectTypeName = types
    .model("ObjectTypeName", {
        "ObjectTypeFieldName": "ObjectTypeFieldType",
    });
