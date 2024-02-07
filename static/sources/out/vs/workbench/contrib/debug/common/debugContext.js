/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/debug/common/debug"], function (require, exports, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getContextForVariable = void 0;
    /**
     * Gets a context key overlay that has context for the given variable.
     */
    function getContextForVariable(parentContext, variable, additionalContext = []) {
        const session = variable.getSession();
        const contextKeys = [
            [debug_1.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT.key, variable.variableMenuContext || ''],
            [debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.key, !!variable.evaluateName],
            [debug_1.CONTEXT_CAN_VIEW_MEMORY.key, !!session?.capabilities.supportsReadMemoryRequest && variable.memoryReference !== undefined],
            [debug_1.CONTEXT_VARIABLE_IS_READONLY.key, !!variable.presentationHint?.attributes?.includes('readOnly') || variable.presentationHint?.lazy],
            [debug_1.CONTEXT_DEBUG_TYPE.key, session?.configuration.type],
            ...additionalContext,
        ];
        return parentContext.createOverlay(contextKeys);
    }
    exports.getContextForVariable = getContextForVariable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb250ZXh0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWdDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRzs7T0FFRztJQUNILFNBQWdCLHFCQUFxQixDQUFDLGFBQWlDLEVBQUUsUUFBa0IsRUFBRSxvQkFBeUMsRUFBRTtRQUN2SSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEMsTUFBTSxXQUFXLEdBQXdCO1lBQ3hDLENBQUMsb0RBQTRDLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUM7WUFDdEYsQ0FBQyw4Q0FBc0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFDckUsQ0FBQywrQkFBdUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMseUJBQXlCLElBQUksUUFBUSxDQUFDLGVBQWUsS0FBSyxTQUFTLENBQUM7WUFDMUgsQ0FBQyxvQ0FBNEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7WUFDcEksQ0FBQywwQkFBa0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDckQsR0FBRyxpQkFBaUI7U0FDcEIsQ0FBQztRQUVGLE9BQU8sYUFBYSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBWkQsc0RBWUMifQ==