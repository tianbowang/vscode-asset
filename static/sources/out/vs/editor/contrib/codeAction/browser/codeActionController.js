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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/errors", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver", "vs/editor/contrib/codeAction/browser/codeActionMenu", "vs/editor/contrib/codeAction/browser/lightBulbWidget", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/actionWidget/browser/actionWidget", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "../common/types", "./codeActionModel"], function (require, exports, dom_1, aria, errors_1, lazy_1, lifecycle_1, position_1, textModel_1, languageFeatures_1, codeAction_1, codeActionKeybindingResolver_1, codeActionMenu_1, lightBulbWidget_1, messageController_1, nls_1, actionWidget_1, commands_1, configuration_1, contextkey_1, instantiation_1, markers_1, progress_1, colorRegistry_1, theme_1, themeService_1, types_1, codeActionModel_1) {
    "use strict";
    var CodeActionController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionController = void 0;
    const DECORATION_CLASS_NAME = 'quickfix-edit-highlight';
    let CodeActionController = class CodeActionController extends lifecycle_1.Disposable {
        static { CodeActionController_1 = this; }
        static { this.ID = 'editor.contrib.codeActionController'; }
        static get(editor) {
            return editor.getContribution(CodeActionController_1.ID);
        }
        constructor(editor, markerService, contextKeyService, instantiationService, languageFeaturesService, progressService, _commandService, _configurationService, _actionWidgetService, _instantiationService) {
            super();
            this._commandService = _commandService;
            this._configurationService = _configurationService;
            this._actionWidgetService = _actionWidgetService;
            this._instantiationService = _instantiationService;
            this._activeCodeActions = this._register(new lifecycle_1.MutableDisposable());
            this._showDisabled = false;
            this._disposed = false;
            this._editor = editor;
            this._model = this._register(new codeActionModel_1.CodeActionModel(this._editor, languageFeaturesService.codeActionProvider, markerService, contextKeyService, progressService, _configurationService));
            this._register(this._model.onDidChangeState(newState => this.update(newState)));
            this._lightBulbWidget = new lazy_1.Lazy(() => {
                const widget = this._editor.getContribution(lightBulbWidget_1.LightBulbWidget.ID);
                if (widget) {
                    this._register(widget.onClick(e => this.showCodeActionList(e.actions, e, { includeDisabledActions: false, fromLightbulb: true })));
                }
                return widget;
            });
            this._resolver = instantiationService.createInstance(codeActionKeybindingResolver_1.CodeActionKeybindingResolver);
            this._register(this._editor.onDidLayoutChange(() => this._actionWidgetService.hide()));
        }
        dispose() {
            this._disposed = true;
            super.dispose();
        }
        showCodeActions(_trigger, actions, at) {
            return this.showCodeActionList(actions, at, { includeDisabledActions: false, fromLightbulb: false });
        }
        hideCodeActions() {
            this._actionWidgetService.hide();
        }
        manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply) {
            if (!this._editor.hasModel()) {
                return;
            }
            messageController_1.MessageController.get(this._editor)?.closeMessage();
            const triggerPosition = this._editor.getPosition();
            this._trigger({ type: 1 /* CodeActionTriggerType.Invoke */, triggerAction, filter, autoApply, context: { notAvailableMessage, position: triggerPosition } });
        }
        _trigger(trigger) {
            return this._model.trigger(trigger);
        }
        async _applyCodeAction(action, retrigger, preview) {
            try {
                await this._instantiationService.invokeFunction(codeAction_1.applyCodeAction, action, codeAction_1.ApplyCodeActionReason.FromCodeActions, { preview, editor: this._editor });
            }
            finally {
                if (retrigger) {
                    this._trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.QuickFix, filter: {} });
                }
            }
        }
        hideLightBulbWidget() {
            this._lightBulbWidget.rawValue?.hide();
        }
        async update(newState) {
            if (newState.type !== 1 /* CodeActionsState.Type.Triggered */) {
                this._lightBulbWidget.rawValue?.hide();
                return;
            }
            let actions;
            try {
                actions = await newState.actions;
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                return;
            }
            if (this._disposed) {
                return;
            }
            this._lightBulbWidget.value?.update(actions, newState.trigger, newState.position);
            if (newState.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
                if (newState.trigger.filter?.include) { // Triggered for specific scope
                    // Check to see if we want to auto apply.
                    const validActionToApply = this.tryGetValidActionToApply(newState.trigger, actions);
                    if (validActionToApply) {
                        try {
                            this._lightBulbWidget.value?.hide();
                            await this._applyCodeAction(validActionToApply, false, false);
                        }
                        finally {
                            actions.dispose();
                        }
                        return;
                    }
                    // Check to see if there is an action that we would have applied were it not invalid
                    if (newState.trigger.context) {
                        const invalidAction = this.getInvalidActionThatWouldHaveBeenApplied(newState.trigger, actions);
                        if (invalidAction && invalidAction.action.disabled) {
                            messageController_1.MessageController.get(this._editor)?.showMessage(invalidAction.action.disabled, newState.trigger.context.position);
                            actions.dispose();
                            return;
                        }
                    }
                }
                const includeDisabledActions = !!newState.trigger.filter?.include;
                if (newState.trigger.context) {
                    if (!actions.allActions.length || !includeDisabledActions && !actions.validActions.length) {
                        messageController_1.MessageController.get(this._editor)?.showMessage(newState.trigger.context.notAvailableMessage, newState.trigger.context.position);
                        this._activeCodeActions.value = actions;
                        actions.dispose();
                        return;
                    }
                }
                this._activeCodeActions.value = actions;
                this.showCodeActionList(actions, this.toCoords(newState.position), { includeDisabledActions, fromLightbulb: false });
            }
            else {
                // auto magically triggered
                if (this._actionWidgetService.isVisible) {
                    // TODO: Figure out if we should update the showing menu?
                    actions.dispose();
                }
                else {
                    this._activeCodeActions.value = actions;
                }
            }
        }
        getInvalidActionThatWouldHaveBeenApplied(trigger, actions) {
            if (!actions.allActions.length) {
                return undefined;
            }
            if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length === 0)
                || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.allActions.length === 1)) {
                return actions.allActions.find(({ action }) => action.disabled);
            }
            return undefined;
        }
        tryGetValidActionToApply(trigger, actions) {
            if (!actions.validActions.length) {
                return undefined;
            }
            if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length > 0)
                || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.validActions.length === 1)) {
                return actions.validActions[0];
            }
            return undefined;
        }
        static { this.DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'quickfix-highlight',
            className: DECORATION_CLASS_NAME
        }); }
        async showCodeActionList(actions, at, options) {
            const currentDecorations = this._editor.createDecorationsCollection();
            const editorDom = this._editor.getDomNode();
            if (!editorDom) {
                return;
            }
            const actionsToShow = options.includeDisabledActions && (this._showDisabled || actions.validActions.length === 0) ? actions.allActions : actions.validActions;
            if (!actionsToShow.length) {
                return;
            }
            const anchor = position_1.Position.isIPosition(at) ? this.toCoords(at) : at;
            const delegate = {
                onSelect: async (action, preview) => {
                    this._applyCodeAction(action, /* retrigger */ true, !!preview);
                    this._actionWidgetService.hide();
                    currentDecorations.clear();
                },
                onHide: () => {
                    this._editor?.focus();
                    currentDecorations.clear();
                },
                onHover: async (action, token) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    return { canPreview: !!action.action.edit?.edits.length };
                },
                onFocus: (action) => {
                    if (action && action.action) {
                        const ranges = action.action.ranges;
                        const diagnostics = action.action.diagnostics;
                        currentDecorations.clear();
                        if (ranges && ranges.length > 0) {
                            const decorations = ranges.map(range => ({ range, options: CodeActionController_1.DECORATION }));
                            currentDecorations.set(decorations);
                        }
                        else if (diagnostics && diagnostics.length > 0) {
                            const decorations = diagnostics.map(diagnostic => ({ range: diagnostic, options: CodeActionController_1.DECORATION }));
                            currentDecorations.set(decorations);
                            const diagnostic = diagnostics[0];
                            if (diagnostic.startLineNumber && diagnostic.startColumn) {
                                const selectionText = this._editor.getModel()?.getWordAtPosition({ lineNumber: diagnostic.startLineNumber, column: diagnostic.startColumn })?.word;
                                aria.status((0, nls_1.localize)('editingNewSelection', "Context: {0} at line {1} and column {2}.", selectionText, diagnostic.startLineNumber, diagnostic.startColumn));
                            }
                        }
                    }
                    else {
                        currentDecorations.clear();
                    }
                }
            };
            this._actionWidgetService.show('codeActionWidget', true, (0, codeActionMenu_1.toMenuItems)(actionsToShow, this._shouldShowHeaders(), this._resolver.getResolver()), delegate, anchor, editorDom, this._getActionBarActions(actions, at, options));
        }
        toCoords(position) {
            if (!this._editor.hasModel()) {
                return { x: 0, y: 0 };
            }
            this._editor.revealPosition(position, 1 /* ScrollType.Immediate */);
            this._editor.render();
            // Translate to absolute editor position
            const cursorCoords = this._editor.getScrolledVisiblePosition(position);
            const editorCoords = (0, dom_1.getDomNodePagePosition)(this._editor.getDomNode());
            const x = editorCoords.left + cursorCoords.left;
            const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
            return { x, y };
        }
        _shouldShowHeaders() {
            const model = this._editor?.getModel();
            return this._configurationService.getValue('editor.codeActionWidget.showHeaders', { resource: model?.uri });
        }
        _getActionBarActions(actions, at, options) {
            if (options.fromLightbulb) {
                return [];
            }
            const resultActions = actions.documentation.map((command) => ({
                id: command.id,
                label: command.title,
                tooltip: command.tooltip ?? '',
                class: undefined,
                enabled: true,
                run: () => this._commandService.executeCommand(command.id, ...(command.arguments ?? [])),
            }));
            if (options.includeDisabledActions && actions.validActions.length > 0 && actions.allActions.length !== actions.validActions.length) {
                resultActions.push(this._showDisabled ? {
                    id: 'hideMoreActions',
                    label: (0, nls_1.localize)('hideMoreActions', 'Hide Disabled'),
                    enabled: true,
                    tooltip: '',
                    class: undefined,
                    run: () => {
                        this._showDisabled = false;
                        return this.showCodeActionList(actions, at, options);
                    }
                } : {
                    id: 'showMoreActions',
                    label: (0, nls_1.localize)('showMoreActions', 'Show Disabled'),
                    enabled: true,
                    tooltip: '',
                    class: undefined,
                    run: () => {
                        this._showDisabled = true;
                        return this.showCodeActionList(actions, at, options);
                    }
                });
            }
            return resultActions;
        }
    };
    exports.CodeActionController = CodeActionController;
    exports.CodeActionController = CodeActionController = CodeActionController_1 = __decorate([
        __param(1, markers_1.IMarkerService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, progress_1.IEditorProgressService),
        __param(6, commands_1.ICommandService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, actionWidget_1.IActionWidgetService),
        __param(9, instantiation_1.IInstantiationService)
    ], CodeActionController);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const addBackgroundColorRule = (selector, color) => {
            if (color) {
                collector.addRule(`.monaco-editor ${selector} { background-color: ${color}; }`);
            }
        };
        addBackgroundColorRule('.quickfix-edit-highlight', theme.getColor(colorRegistry_1.editorFindMatchHighlight));
        const findMatchHighlightBorder = theme.getColor(colorRegistry_1.editorFindMatchHighlightBorder);
        if (findMatchHighlightBorder) {
            collector.addRule(`.monaco-editor .quickfix-edit-highlight { border: 1px ${(0, theme_1.isHighContrast)(theme.type) ? 'dotted' : 'solid'} ${findMatchHighlightBorder}; box-sizing: border-box; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbkNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVBY3Rpb24vYnJvd3Nlci9jb2RlQWN0aW9uQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNkNoRyxNQUFNLHFCQUFxQixHQUFHLHlCQUF5QixDQUFDO0lBRWpELElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7O2lCQUU1QixPQUFFLEdBQUcscUNBQXFDLEFBQXhDLENBQXlDO1FBRTNELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDcEMsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUF1QixzQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBYUQsWUFDQyxNQUFtQixFQUNILGFBQTZCLEVBQ3pCLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDeEMsdUJBQWlELEVBQ25ELGVBQXVDLEVBQzlDLGVBQWlELEVBQzNDLHFCQUE2RCxFQUM5RCxvQkFBMkQsRUFDMUQscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBTDBCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUMxQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDekMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQWpCcEUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFpQixDQUFDLENBQUM7WUFDckYsa0JBQWEsR0FBRyxLQUFLLENBQUM7WUFJdEIsY0FBUyxHQUFHLEtBQUssQ0FBQztZQWdCekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLE1B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