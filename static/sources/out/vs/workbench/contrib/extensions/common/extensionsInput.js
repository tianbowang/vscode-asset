/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/nls", "vs/workbench/common/editor/editorInput", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/path", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, network_1, uri_1, nls_1, editorInput_1, extensionManagementUtil_1, path_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsInput = void 0;
    const ExtensionEditorIcon = (0, iconRegistry_1.registerIcon)('extensions-editor-label-icon', codicons_1.Codicon.extensions, (0, nls_1.localize)('extensionsEditorLabelIcon', 'Icon of the extensions editor label.'));
    class ExtensionsInput extends editorInput_1.EditorInput {
        static { this.ID = 'workbench.extensions.input2'; }
        get typeId() {
            return ExtensionsInput.ID;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */ | 1024 /* EditorInputCapabilities.AuxWindowUnsupported */;
        }
        get resource() {
            return uri_1.URI.from({
                scheme: network_1.Schemas.extension,
                path: (0, path_1.join)(this._extension.identifier.id, 'extension')
            });
        }
        constructor(_extension) {
            super();
            this._extension = _extension;
        }
        get extension() { return this._extension; }
        getName() {
            return (0, nls_1.localize)('extensionsInputName', "Extension: {0}", this._extension.displayName);
        }
        getIcon() {
            return ExtensionEditorIcon;
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            return other instanceof ExtensionsInput && (0, extensionManagementUtil_1.areSameExtensions)(this._extension.identifier, other._extension.identifier);
        }
    }
    exports.ExtensionsInput = ExtensionsInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0lucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25zSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQU0sbUJBQW1CLEdBQUcsSUFBQSwyQkFBWSxFQUFDLDhCQUE4QixFQUFFLGtCQUFPLENBQUMsVUFBVSxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLHNDQUFzQyxDQUFDLENBQUMsQ0FBQztJQVE1SyxNQUFhLGVBQWdCLFNBQVEseUJBQVc7aUJBRS9CLE9BQUUsR0FBRyw2QkFBNkIsQ0FBQztRQUVuRCxJQUFhLE1BQU07WUFDbEIsT0FBTyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFhLFlBQVk7WUFDeEIsT0FBTyxvRkFBb0UsMERBQStDLENBQUM7UUFDNUgsQ0FBQztRQUVELElBQWEsUUFBUTtZQUNwQixPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLGlCQUFPLENBQUMsU0FBUztnQkFDekIsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUM7YUFDdEQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELFlBQW9CLFVBQXNCO1lBQ3pDLEtBQUssRUFBRSxDQUFDO1lBRFcsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUUxQyxDQUFDO1FBRUQsSUFBSSxTQUFTLEtBQWlCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFOUMsT0FBTztZQUNmLE9BQU8sSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRVEsT0FBTztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVRLE9BQU8sQ0FBQyxLQUF3QztZQUN4RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsT0FBTyxLQUFLLFlBQVksZUFBZSxJQUFJLElBQUEsMkNBQWlCLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2SCxDQUFDOztJQXZDRiwwQ0F3Q0MifQ==