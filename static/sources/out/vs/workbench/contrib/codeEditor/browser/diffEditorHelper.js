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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/diffEditor/diffEditor.contribution", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/workbench/browser/codeeditor", "vs/workbench/common/configuration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/accessibility/browser/editorAccessibilityHelp", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, observable_1, editorExtensions_1, codeEditorService_1, diffEditor_contribution_1, diffEditorWidget_1, embeddedCodeEditorWidget_1, nls_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, notification_1, platform_1, codeeditor_1, configuration_2, accessibleView_1, accessibleViewActions_1, editorAccessibilityHelp_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DiffEditorHelperContribution = class DiffEditorHelperContribution extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.diffEditorHelper'; }
        constructor(_diffEditor, _instantiationService, _configurationService, _notificationService) {
            super();
            this._diffEditor = _diffEditor;
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            this._notificationService = _notificationService;
            this._register(createScreenReaderHelp());
            const isEmbeddedDiffEditor = this._diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget;
            if (!isEmbeddedDiffEditor) {
                const computationResult = (0, observable_1.observableFromEvent)(e => this._diffEditor.onDidUpdateDiff(e), () => /** @description diffEditor.diffComputationResult */ this._diffEditor.getDiffComputationResult());
                const onlyWhiteSpaceChange = computationResult.map(r => r && !r.identical && r.changes2.length === 0);
                this._register((0, observable_1.autorunWithStore)((reader, store) => {
                    /** @description update state */
                    if (onlyWhiteSpaceChange.read(reader)) {
                        const helperWidget = store.add(this._instantiationService.createInstance(codeeditor_1.FloatingEditorClickWidget, this._diffEditor.getModifiedEditor(), (0, nls_1.localize)('hintWhitespace', "Show Whitespace Differences"), null));
                        store.add(helperWidget.onClick(() => {
                            this._configurationService.updateValue('diffEditor.ignoreTrimWhitespace', false);
                        }));
                        helperWidget.render();
                    }
                }));
                this._register(this._diffEditor.onDidUpdateDiff(() => {
                    const diffComputationResult = this._diffEditor.getDiffComputationResult();
                    if (diffComputationResult && diffComputationResult.quitEarly) {
                        this._notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('hintTimeout', "The diff algorithm was stopped early (after {0} ms.)", this._diffEditor.maxComputationTime), [{
                                label: (0, nls_1.localize)('removeTimeout', "Remove Limit"),
                                run: () => {
                                    this._configurationService.updateValue('diffEditor.maxComputationTime', 0);
                                }
                            }], {});
                    }
                }));
            }
        }
    };
    DiffEditorHelperContribution = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService)
    ], DiffEditorHelperContribution);
    function createScreenReaderHelp() {
        return accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'diff-editor', async (accessor) => {
            const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const next = keybindingService.lookupKeybinding(diffEditor_contribution_1.AccessibleDiffViewerNext.id)?.getAriaLabel();
            const previous = keybindingService.lookupKeybinding(diffEditor_contribution_1.AccessibleDiffViewerPrev.id)?.getAriaLabel();
            if (!(editorService.activeTextEditorControl instanceof diffEditorWidget_1.DiffEditorWidget)) {
                return;
            }
            const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
            if (!codeEditor) {
                return;
            }
            const keys = ['audioCues.diffLineDeleted', 'audioCues.diffLineInserted', 'audioCues.diffLineModified'];
            const content = [
                (0, nls_1.localize)('msg1', "You are in a diff editor."),
                (0, nls_1.localize)('msg2', "View the next ({0}) or previous ({1}) diff in diff review mode, which is optimized for screen readers.", next, previous),
                (0, nls_1.localize)('msg3', "To control which audio cues should be played, the following settings can be configured: {0}.", keys.join(', ')),
            ];
            const commentCommandInfo = (0, editorAccessibilityHelp_1.getCommentCommandInfo)(keybindingService, contextKeyService, codeEditor);
            if (commentCommandInfo) {
                content.push(commentCommandInfo);
            }
            accessibleViewService.show({
                id: "diffEditor" /* AccessibleViewProviderId.DiffEditor */,
                verbositySettingKey: "accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */,
                provideContent: () => content.join('\n\n'),
                onClose: () => {
                    codeEditor.focus();
                },
                options: { type: "help" /* AccessibleViewType.Help */ }
            });
        }, contextkey_1.ContextKeyEqualsExpr.create('isInDiffEditor', true));
    }
    (0, editorExtensions_1.registerDiffEditorContribution)(DiffEditorHelperContribution.ID, DiffEditorHelperContribution);
    platform_1.Registry.as(configuration_2.Extensions.ConfigurationMigration)
        .registerConfigurationMigrations([{
            key: 'diffEditor.experimental.collapseUnchangedRegions',
            migrateFn: (value, accessor) => {
                return [
                    ['diffEditor.hideUnchangedRegions.enabled', { value }],
                    ['diffEditor.experimental.collapseUnchangedRegions', { value: undefined }]
                ];
            }
        }]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvckhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL2RpZmZFZGl0b3JIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7aUJBQzdCLE9BQUUsR0FBRyxpQ0FBaUMsQUFBcEMsQ0FBcUM7UUFFOUQsWUFDa0IsV0FBd0IsRUFDRCxxQkFBNEMsRUFDNUMscUJBQTRDLEVBQzdDLG9CQUEwQztZQUVqRixLQUFLLEVBQUUsQ0FBQztZQUxTLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ0QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFJakYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7WUFFekMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsV0FBVyxZQUFZLG1EQUF3QixDQUFDO1lBRWxGLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUMzQixNQUFNLGlCQUFpQixHQUFHLElBQUEsZ0NBQW1CLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxvREFBb0QsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQztnQkFDaE0sTUFBTSxvQkFBb0IsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFD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