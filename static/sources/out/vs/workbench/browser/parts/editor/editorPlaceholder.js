/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/base/common/severity", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/theme/common/themeService", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/platform/editor/common/editor", "vs/workbench/browser/editor", "vs/base/browser/ui/button/button", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/files/common/files", "vs/base/common/errorMessage", "vs/platform/dialogs/common/dialogs", "vs/css!./media/editorplaceholder"], function (require, exports, nls_1, strings_1, severity_1, editor_1, editorPane_1, telemetry_1, scrollableElement_1, themeService_1, dom_1, lifecycle_1, storage_1, types_1, commands_1, workspace_1, editor_2, editor_3, button_1, defaultStyles_1, simpleIconLabel_1, files_1, errorMessage_1, dialogs_1) {
    "use strict";
    var EditorPlaceholder_1, WorkspaceTrustRequiredPlaceholderEditor_1, ErrorPlaceholderEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ErrorPlaceholderEditor = exports.WorkspaceTrustRequiredPlaceholderEditor = exports.EditorPlaceholder = void 0;
    let EditorPlaceholder = class EditorPlaceholder extends editorPane_1.EditorPane {
        static { EditorPlaceholder_1 = this; }
        static { this.PLACEHOLDER_LABEL_MAX_LENGTH = 1024; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            this.inputDisposable = this._register(new lifecycle_1.MutableDisposable());
        }
        createEditor(parent) {
            // Container
            this.container = document.createElement('div');
            this.container.className = 'monaco-editor-pane-placeholder';
            this.container.style.outline = 'none';
            this.container.tabIndex = 0; // enable focus support from the editor part (do not remove)
            // Custom Scrollbars
            this.scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.container, { horizontal: 1 /* ScrollbarVisibility.Auto */, vertical: 1 /* ScrollbarVisibility.Auto */ }));
            parent.appendChild(this.scrollbar.getDomNode());
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }
            // Render Input
            this.inputDisposable.value = await this.renderInput(input, options);
        }
        async renderInput(input, options) {
            const [container, scrollbar] = (0, types_1.assertAllDefined)(this.container, this.scrollbar);
            // Reset any previous contents
            (0, dom_1.clearNode)(container);
            // Delegate to implementation for contents
            const disposables = new lifecycle_1.DisposableStore();
            const { icon, label, actions } = await this.getContents(input, options, disposables);
            const truncatedLabel = (0, strings_1.truncate)(label, EditorPlaceholder_1.PLACEHOLDER_LABEL_MAX_LENGTH);
            // Icon
            const iconContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-icon-container'));
            const iconWidget = new simpleIconLabel_1.SimpleIconLabel(iconContainer);
            iconWidget.text = icon;
            // Label
            const labelContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-label-container'));
            const labelWidget = document.createElement('span');
            labelWidget.textContent = truncatedLabel;
            labelContainer.appendChild(labelWidget);
            // ARIA label
            container.setAttribute('aria-label', `${(0, editor_3.computeEditorAriaLabel)(input, undefined, this.group, undefined)}, ${truncatedLabel}`);
            // Buttons
            if (actions.length) {
                const actionsContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-buttons-container'));
                const buttons = disposables.add(new button_1.ButtonBar(actionsContainer));
                for (let i = 0; i < actions.length; i++) {
                    const button = disposables.add(buttons.addButton({
                        ...defaultStyles_1.defaultButtonStyles,
                        secondary: i !== 0
                    }));
                    button.label = actions[i].label;
                    disposables.add(button.onDidClick(e => {
                        if (e) {
                            dom_1.EventHelper.stop(e, true);
                        }
                        actions[i].run();
                    }));
                }
            }
            // Adjust scrollbar
            scrollbar.scanDomNode();
            return disposables;
        }
        clearInput() {
            if (this.container) {
                (0, dom_1.clearNode)(this.container);
            }
            this.inputDisposable.clear();
            super.clearInput();
        }
        layout(dimension) {
            const [container, scrollbar] = (0, types_1.assertAllDefined)(this.container, this.scrollbar);
            // Pass on to Container
            (0, dom_1.size)(container, dimension.width, dimension.height);
            // Adjust scrollbar
            scrollbar.scanDomNode();
            // Toggle responsive class
            container.classList.toggle('max-height-200px', dimension.height <= 200);
        }
        focus() {
            super.focus();
            this.container?.focus();
        }
        dispose() {
            this.container?.remove();
            super.dispose();
        }
    };
    exports.EditorPlaceholder = EditorPlaceholder;
    exports.EditorPlaceholder = EditorPlaceholder = EditorPlaceholder_1 = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, themeService_1.IThemeService),
        __param(3, storage_1.IStorageService)
    ], EditorPlaceholder);
    let WorkspaceTrustRequiredPlaceholderEditor = class WorkspaceTrustRequiredPlaceholderEditor extends EditorPlaceholder {
        static { WorkspaceTrustRequiredPlaceholderEditor_1 = this; }
        static { this.ID = 'workbench.editors.workspaceTrustRequiredEditor'; }
        static { this.LABEL = (0, nls_1.localize)('trustRequiredEditor', "Workspace Trust Required"); }
        static { this.DESCRIPTOR = editor_3.EditorPaneDescriptor.create(WorkspaceTrustRequiredPlaceholderEditor_1, WorkspaceTrustRequiredPlaceholderEditor_1.ID, WorkspaceTrustRequiredPlaceholderEditor_1.LABEL); }
        constructor(telemetryService, themeService, commandService, workspaceService, storageService) {
            super(WorkspaceTrustRequiredPlaceholderEditor_1.ID, telemetryService, themeService, storageService);
            this.commandService = commandService;
            this.workspaceService = workspaceService;
        }
        getTitle() {
            return WorkspaceTrustRequiredPlaceholderEditor_1.LABEL;
        }
        async getContents() {
            return {
                icon: '$(workspace-untrusted)',
                label: (0, workspace_1.isSingleFolderWorkspaceIdentifier)((0, workspace_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace())) ?
                    (0, nls_1.localize)('requiresFolderTrustText', "The file is not displayed in the editor because trust has not been granted to the folder.") :
                    (0, nls_1.localize)('requiresWorkspaceTrustText', "The file is not displayed in the editor because trust has not been granted to the workspace."),
                actions: [
                    {
                        label: (0, nls_1.localize)('manageTrust', "Manage Workspace Trust"),
                        run: () => this.commandService.executeCommand('workbench.trust.manage')
                    }
                ]
            };
        }
    };
    exports.WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor;
    exports.WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, commands_1.ICommandService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, storage_1.IStorageService)
    ], WorkspaceTrustRequiredPlaceholderEditor);
    let ErrorPlaceholderEditor = class ErrorPlaceholderEditor extends EditorPlaceholder {
        static { ErrorPlaceholderEditor_1 = this; }
        static { this.ID = 'workbench.editors.errorEditor'; }
        static { this.LABEL = (0, nls_1.localize)('errorEditor', "Error Editor"); }
        static { this.DESCRIPTOR = editor_3.EditorPaneDescriptor.create(ErrorPlaceholderEditor_1, ErrorPlaceholderEditor_1.ID, ErrorPlaceholderEditor_1.LABEL); }
        constructor(telemetryService, themeService, storageService, fileService, dialogService) {
            super(ErrorPlaceholderEditor_1.ID, telemetryService, themeService, storageService);
            this.fileService = fileService;
            this.dialogService = dialogService;
        }
        async getContents(input, options, disposables) {
            const resource = input.resource;
            const group = this.group;
            const error = options.error;
            const isFileNotFound = error?.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            // Error Label
            let label;
            if (isFileNotFound) {
                label = (0, nls_1.localize)('unavailableResourceErrorEditorText', "The editor could not be opened because the file was not found.");
            }
            else if ((0, editor_1.isEditorOpenError)(error) && error.forceMessage) {
                label = error.message;
            }
            else if (error) {
                label = (0, nls_1.localize)('unknownErrorEditorTextWithError', "The editor could not be opened due to an unexpected error: {0}", (0, strings_1.truncateMiddle)((0, errorMessage_1.toErrorMessage)(error), EditorPlaceholder.PLACEHOLDER_LABEL_MAX_LENGTH / 2));
            }
            else {
                label = (0, nls_1.localize)('unknownErrorEditorTextWithoutError', "The editor could not be opened due to an unexpected error.");
            }
            // Error Icon
            let icon = '$(error)';
            if ((0, editor_1.isEditorOpenError)(error)) {
                if (error.forceSeverity === severity_1.default.Info) {
                    icon = '$(info)';
                }
                else if (error.forceSeverity === severity_1.default.Warning) {
                    icon = '$(warning)';
                }
            }
            // Actions
            let actions = undefined;
            if ((0, editor_1.isEditorOpenError)(error) && error.actions.length > 0) {
                actions = error.actions.map(action => {
                    return {
                        label: action.label,
                        run: () => {
                            const result = action.run();
                            if (result instanceof Promise) {
                                result.catch(error => this.dialogService.error((0, errorMessage_1.toErrorMessage)(error)));
                            }
                        }
                    };
                });
            }
            else if (group) {
                actions = [
                    {
                        label: (0, nls_1.localize)('retry', "Try Again"),
                        run: () => group.openEditor(input, { ...options, source: editor_2.EditorOpenSource.USER /* explicit user gesture */ })
                    }
                ];
            }
            // Auto-reload when file is added
            if (group && isFileNotFound && resource && this.fileService.hasProvider(resource)) {
                disposables.add(this.fileService.onDidFilesChange(e => {
                    if (e.contains(resource, 1 /* FileChangeType.ADDED */, 0 /* FileChangeType.UPDATED */)) {
                        group.openEditor(input, options);
                    }
                }));
            }
            return { icon, label, actions: actions ?? [] };
        }
    };
    exports.ErrorPlaceholderEditor = ErrorPlaceholderEditor;
    exports.ErrorPlaceholderEditor = ErrorPlaceholderEditor = ErrorPlaceholderEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, files_1.IFileService),
        __param(4, dialogs_1.IDialogService)
    ], ErrorPlaceholderEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGxhY2Vob2xkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JQbGFjZWhvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNEN6RixJQUFlLGlCQUFpQixHQUFoQyxNQUFlLGlCQUFrQixTQUFRLHVCQUFVOztpQkFFL0IsaUNBQTRCLEdBQUcsSUFBSSxBQUFQLENBQVE7UUFNOUQsWUFDQyxFQUFVLEVBQ1MsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3pCLGNBQStCO1lBRWhELEtBQUssQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBUm5ELG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztRQVNsRSxDQUFDO1FBRVMsWUFBWSxDQUFDLE1BQW1CO1lBRXpDLFlBQVk7WUFDWixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyw0REFBNEQ7WUFFekYsb0JBQW9CO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdDQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLGtDQUEwQixFQUFFLFFBQVEsa0NBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFD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