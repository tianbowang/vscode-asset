/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extractSelection = exports.withSelection = exports.IOpenerService = void 0;
    exports.IOpenerService = (0, instantiation_1.createDecorator)('openerService');
    /**
     * Encodes selection into the `URI`.
     *
     * IMPORTANT: you MUST use `extractSelection` to separate the selection
     * again from the original `URI` before passing the `URI` into any
     * component that is not aware of selections.
     */
    function withSelection(uri, selection) {
        return uri.with({ fragment: `${selection.startLineNumber},${selection.startColumn}${selection.endLineNumber ? `-${selection.endLineNumber}${selection.endColumn ? `,${selection.endColumn}` : ''}` : ''}` });
    }
    exports.withSelection = withSelection;
    /**
     * file:///some/file.js#73
     * file:///some/file.js#L73
     * file:///some/file.js#73,84
     * file:///some/file.js#L73,84
     * file:///some/file.js#73-83
     * file:///some/file.js#L73-L83
     * file:///some/file.js#73,84-83,52
     * file:///some/file.js#L73,84-L83,52
     */
    function extractSelection(uri) {
        let selection = undefined;
        const match = /^L?(\d+)(?:,(\d+))?(-L?(\d+)(?:,(\d+))?)?/.exec(uri.fragment);
        if (match) {
            selection = {
                startLineNumber: parseInt(match[1]),
                startColumn: match[2] ? parseInt(match[2]) : 1,
                endLineNumber: match[4] ? parseInt(match[4]) : undefined,
                endColumn: match[4] ? (match[5] ? parseInt(match[5]) : 1) : undefined
            };
            uri = uri.with({ fragment: '' });
        }
        return { selection, uri };
    }
    exports.extractSelection = extractSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9vcGVuZXIvY29tbW9uL29wZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSxjQUFjLEdBQUcsSUFBQSwrQkFBZSxFQUFpQixlQUFlLENBQUMsQ0FBQztJQTJHL0U7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLEdBQVEsRUFBRSxTQUErQjtRQUN0RSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFTLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlNLENBQUM7SUFGRCxzQ0FFQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLEdBQVE7UUFDeEMsSUFBSSxTQUFTLEdBQXFDLFNBQVMsQ0FBQztRQUM1RCxNQUFNLEtBQUssR0FBRywyQ0FBMkMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdFLElBQUksS0FBSyxFQUFFLENBQUM7WUFDWCxTQUFTLEdBQUc7Z0JBQ1gsZUFBZSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUN4RCxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUzthQUNyRSxDQUFDO1lBQ0YsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBYkQsNENBYUMifQ==