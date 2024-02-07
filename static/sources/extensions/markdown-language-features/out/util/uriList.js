"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUriList = void 0;
function splitUriList(str) {
    return str.split('\r\n');
}
function parseUriList(str) {
    return splitUriList(str)
        .filter(value => !value.startsWith('#')) // Remove comments
        .map(value => value.trim());
}
exports.parseUriList = parseUriList;
//# sourceMappingURL=uriList.js.map