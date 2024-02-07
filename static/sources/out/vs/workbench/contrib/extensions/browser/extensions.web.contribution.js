/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/editor", "vs/workbench/contrib/extensions/browser/browserRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/common/editor"], function (require, exports, nls_1, platform_1, descriptors_1, editor_1, browserRuntimeExtensionsEditor_1, runtimeExtensionsInput_1, editor_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Running Extensions
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(browserRuntimeExtensionsEditor_1.RuntimeExtensionsEditor, browserRuntimeExtensionsEditor_1.RuntimeExtensionsEditor.ID, (0, nls_1.localize)('runtimeExtension', "Running Extensions")), [new descriptors_1.SyncDescriptor(runtimeExtensionsInput_1.RuntimeExtensionsInput)]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy53ZWIuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9ucy53ZWIuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLHFCQUFxQjtJQUNyQixtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLENBQy9FLDZCQUFvQixDQUFDLE1BQU0sQ0FBQyx3REFBdUIsRUFBRSx3REFBdUIsQ0FBQyxFQUFFLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxFQUNwSSxDQUFDLElBQUksNEJBQWMsQ0FBQywrQ0FBc0IsQ0FBQyxDQUFDLENBQzVDLENBQUMifQ==