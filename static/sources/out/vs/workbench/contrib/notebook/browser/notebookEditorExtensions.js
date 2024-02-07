/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorExtensionsRegistry = exports.registerNotebookContribution = void 0;
    class EditorContributionRegistry {
        static { this.INSTANCE = new EditorContributionRegistry(); }
        constructor() {
            this.editorContributions = [];
        }
        registerEditorContribution(id, ctor) {
            this.editorContributions.push({ id, ctor: ctor });
        }
        getEditorContributions() {
            return this.editorContributions.slice(0);
        }
    }
    function registerNotebookContribution(id, ctor) {
        EditorContributionRegistry.INSTANCE.registerEditorContribution(id, ctor);
    }
    exports.registerNotebookContribution = registerNotebookContribution;
    var NotebookEditorExtensionsRegistry;
    (function (NotebookEditorExtensionsRegistry) {
        function getEditorContributions() {
            return EditorContributionRegistry.INSTANCE.getEditorContributions();
        }
        NotebookEditorExtensionsRegistry.getEditorContributions = getEditorContributions;
        function getSomeEditorContributions(ids) {
            return EditorContributionRegistry.INSTANCE.getEditorContributions().filter(c => ids.indexOf(c.id) >= 0);
        }
        NotebookEditorExtensionsRegistry.getSomeEditorContributions = getSomeEditorContributions;
    })(NotebookEditorExtensionsRegistry || (exports.NotebookEditorExtensionsRegistry = NotebookEditorExtensionsRegistry = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JFeHRlbnNpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rRWRpdG9yRXh0ZW5zaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBTSwwQkFBMEI7aUJBQ1IsYUFBUSxHQUFHLElBQUksMEJBQTBCLEVBQUUsQ0FBQztRQUduRTtZQUNDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVNLDBCQUEwQixDQUFvQyxFQUFVLEVBQUUsSUFBMEY7WUFDMUssSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBdUMsRUFBRSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQzs7SUFHRixTQUFnQiw0QkFBNEIsQ0FBb0MsRUFBVSxFQUFFLElBQTBGO1FBQ3JMLDBCQUEwQixDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUZELG9FQUVDO0lBRUQsSUFBaUIsZ0NBQWdDLENBU2hEO0lBVEQsV0FBaUIsZ0NBQWdDO1FBRWhELFNBQWdCLHNCQUFzQjtZQUNyQyxPQUFPLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3JFLENBQUM7UUFGZSx1REFBc0IseUJBRXJDLENBQUE7UUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxHQUFhO1lBQ3ZELE9BQU8sMEJBQTBCLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekcsQ0FBQztRQUZlLDJEQUEwQiw2QkFFekMsQ0FBQTtJQUNGLENBQUMsRUFUZ0IsZ0NBQWdDLGdEQUFoQyxnQ0FBZ0MsUUFTaEQifQ==