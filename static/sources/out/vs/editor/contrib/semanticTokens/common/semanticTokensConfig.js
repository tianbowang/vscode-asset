/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSemanticColoringEnabled = exports.SEMANTIC_HIGHLIGHTING_SETTING_ID = void 0;
    exports.SEMANTIC_HIGHLIGHTING_SETTING_ID = 'editor.semanticHighlighting';
    function isSemanticColoringEnabled(model, themeService, configurationService) {
        const setting = configurationService.getValue(exports.SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: model.getLanguageId(), resource: model.uri })?.enabled;
        if (typeof setting === 'boolean') {
            return setting;
        }
        return themeService.getColorTheme().semanticHighlighting;
    }
    exports.isSemanticColoringEnabled = isSemanticColoringEnabled;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNDb25maWcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NlbWFudGljVG9rZW5zL2NvbW1vbi9zZW1hbnRpY1Rva2Vuc0NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNbkYsUUFBQSxnQ0FBZ0MsR0FBRyw2QkFBNkIsQ0FBQztJQU05RSxTQUFnQix5QkFBeUIsQ0FBQyxLQUFpQixFQUFFLFlBQTJCLEVBQUUsb0JBQTJDO1FBQ3BJLE1BQU0sT0FBTyxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBcUMsd0NBQWdDLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQztRQUNqTSxJQUFJLE9BQU8sT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFDRCxPQUFPLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztJQUMxRCxDQUFDO0lBTkQsOERBTUMifQ==