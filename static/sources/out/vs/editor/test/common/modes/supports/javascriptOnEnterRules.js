/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/languageConfiguration"], function (require, exports, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.javascriptOnEnterRules = void 0;
    exports.javascriptOnEnterRules = [
        {
            // e.g. /** | */
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            afterText: /^\s*\*\/$/,
            action: { indentAction: languageConfiguration_1.IndentAction.IndentOutdent, appendText: ' * ' }
        }, {
            // e.g. /** ...|
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: ' * ' }
        }, {
            // e.g.  * ...|
            beforeText: /^(\t|[ ])*[ ]\*([ ]([^\*]|\*(?!\/))*)?$/,
            previousLineText: /(?=^(\s*(\/\*\*|\*)).*)(?=(?!(\s*\*\/)))/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: '* ' }
        }, {
            // e.g.  */|
            beforeText: /^(\t|[ ])*[ ]\*\/\s*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
        },
        {
            // e.g.  *-----*/|
            beforeText: /^(\t|[ ])*[ ]\*[^/]*\*\/\s*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
        }
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdE9uRW50ZXJSdWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVzL3N1cHBvcnRzL2phdmFzY3JpcHRPbkVudGVyUnVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSW5GLFFBQUEsc0JBQXNCLEdBQUc7UUFDckM7WUFDQyxnQkFBZ0I7WUFDaEIsVUFBVSxFQUFFLG9DQUFvQztZQUNoRCxTQUFTLEVBQUUsV0FBVztZQUN0QixNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsb0NBQVksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRTtTQUN2RSxFQUFFO1lBQ0YsZ0JBQWdCO1lBQ2hCLFVBQVUsRUFBRSxvQ0FBb0M7WUFDaEQsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLG9DQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUU7U0FDOUQsRUFBRTtZQUNGLGVBQWU7WUFDZixVQUFVLEVBQUUseUNBQXlDO1lBQ3JELGdCQUFnQixFQUFFLDBDQUEwQztZQUM1RCxNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsb0NBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtTQUM3RCxFQUFFO1lBQ0YsWUFBWTtZQUNaLFVBQVUsRUFBRSx1QkFBdUI7WUFDbkMsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLG9DQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7U0FDMUQ7UUFDRDtZQUNDLGtCQUFrQjtZQUNsQixVQUFVLEVBQUUsOEJBQThCO1lBQzFDLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxvQ0FBWSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO1NBQzFEO0tBQ0QsQ0FBQyJ9