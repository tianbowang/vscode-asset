/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/test/browser/testCodeEditor"], function (require, exports, position_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testRepeatedActionAndExtractPositions = exports.serializePipePositions = exports.deserializePipePositions = void 0;
    function deserializePipePositions(text) {
        let resultText = '';
        let lineNumber = 1;
        let charIndex = 0;
        const positions = [];
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charAt(i);
            if (chr === '\n') {
                resultText += chr;
                lineNumber++;
                charIndex = 0;
                continue;
            }
            if (chr === '|') {
                positions.push(new position_1.Position(lineNumber, charIndex + 1));
            }
            else {
                resultText += chr;
                charIndex++;
            }
        }
        return [resultText, positions];
    }
    exports.deserializePipePositions = deserializePipePositions;
    function serializePipePositions(text, positions) {
        positions.sort(position_1.Position.compare);
        let resultText = '';
        let lineNumber = 1;
        let charIndex = 0;
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charAt(i);
            if (positions.length > 0 && positions[0].lineNumber === lineNumber && positions[0].column === charIndex + 1) {
                resultText += '|';
                positions.shift();
            }
            resultText += chr;
            if (chr === '\n') {
                lineNumber++;
                charIndex = 0;
            }
            else {
                charIndex++;
            }
        }
        if (positions.length > 0 && positions[0].lineNumber === lineNumber && positions[0].column === charIndex + 1) {
            resultText += '|';
            positions.shift();
        }
        if (positions.length > 0) {
            throw new Error(`Unexpected left over positions!!!`);
        }
        return resultText;
    }
    exports.serializePipePositions = serializePipePositions;
    function testRepeatedActionAndExtractPositions(text, initialPosition, action, record, stopCondition, options = {}) {
        const actualStops = [];
        (0, testCodeEditor_1.withTestCodeEditor)(text, options, (editor) => {
            editor.setPosition(initialPosition);
            while (true) {
                action(editor);
                actualStops.push(record(editor));
                if (stopCondition(editor)) {
                    break;
                }
                if (actualStops.length > 1000) {
                    throw new Error(`Endless loop detected involving position ${editor.getPosition()}!`);
                }
            }
        });
        return actualStops;
    }
    exports.testRepeatedActionAndExtractPositions = testRepeatedActionAndExtractPositions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZFRlc3RVdGlscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvd29yZE9wZXJhdGlvbnMvdGVzdC9icm93c2VyL3dvcmRUZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLFNBQWdCLHdCQUF3QixDQUFDLElBQVk7UUFDcEQsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbEIsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO1FBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNsQixVQUFVLElBQUksR0FBRyxDQUFDO2dCQUNsQixVQUFVLEVBQUUsQ0FBQztnQkFDYixTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLFNBQVM7WUFDVixDQUFDO1lBQ0QsSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUSxDQUFDLFVBQVUsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsVUFBVSxJQUFJLEdBQUcsQ0FBQztnQkFDbEIsU0FBUyxFQUFFLENBQUM7WUFDYixDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sQ0FBQyxVQUFVLEVBQUUsU0FBUyxD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