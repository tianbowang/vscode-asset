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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/platform", "vs/base/common/themables", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/iconRegistry", "vs/css!./inlineCompletionsHintsWidget"], function (require, exports, dom_1, actionViewItems_1, keybindingLabel_1, actions_1, arrays_1, async_1, codicons_1, lifecycle_1, observable_1, platform_1, themables_1, position_1, languages_1, commandIds_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_2, commands_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, telemetry_1, iconRegistry_1) {
    "use strict";
    var InlineSuggestionHintsContentWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomizedMenuWorkbenchToolBar = exports.InlineSuggestionHintsContentWidget = exports.InlineCompletionsHintsWidget = void 0;
    let InlineCompletionsHintsWidget = class InlineCompletionsHintsWidget extends lifecycle_1.Disposable {
        constructor(editor, model, instantiationService) {
            super();
            this.editor = editor;
            this.model = model;
            this.instantiationService = instantiationService;
            this.alwaysShowToolbar = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(62 /* EditorOption.inlineSuggest */).showToolbar === 'always');
            this.sessionPosition = undefined;
            this.position = (0, observable_1.derived)(this, reader => {
                const ghostText = this.model.read(reader)?.ghostText.read(reader);
                if (!this.alwaysShowToolbar.read(reader) || !ghostText || ghostText.parts.length === 0) {
                    this.sessionPosition = undefined;
                    return null;
                }
                const firstColumn = ghostText.parts[0].column;
                if (this.sessionPosition && this.sessionPosition.lineNumber !== ghostText.lineNumber) {
                    this.sessionPosition = undefined;
                }
                const position = new position_1.Position(ghostText.lineNumber, Math.min(firstColumn, this.sessionPosition?.column ?? Number.MAX_SAFE_INTEGER));
                this.sessionPosition = position;
                return position;
            });
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description setup content widget */
                const model = this.model.read(reader);
                if (!model || !this.alwaysShowToolbar.read(reader)) {
                    return;
                }
                const contentWidget = store.add(this.instantiationService.createInstance(InlineSuggestionHintsContentWidget, this.editor, true, this.position, model.selectedInlineCompletionIndex, model.inlineCompletionsCount, model.selectedInlineCompletion.map(v => /** @description commands */ v?.inlineCompletion.source.inlineCompletions.commands ?? [])));
                editor.addContentWidget(contentWidget);
                store.add((0, lifecycle_1.toDisposable)(() => editor.removeContentWidget(contentWidget)));
                store.add((0, observable_1.autorun)(reader => {
                    /** @description request explicit */
                    const position = this.position.read(reader);
                    if (!position) {
                        return;
                    }
                    if (model.lastTriggerKind.read(reader) !== languages_1.InlineCompletionTriggerKind.Explicit) {
                        model.triggerExplicitly();
                    }
                }));
            }));
        }
    };
    exports.InlineCompletionsHintsWidget = InlineCompletionsHintsWidget;
    exports.InlineCompletionsHintsWidget = InlineCompletionsHintsWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], InlineCompletionsHintsWidget);
    const inlineSuggestionHintsNextIcon = (0, iconRegistry_1.registerIcon)('inline-suggestion-hints-next', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('parameterHintsNextIcon', 'Icon for show next parameter hint.'));
    const inlineSuggestionHintsPreviousIcon = (0, iconRegistry_1.registerIcon)('inline-suggestion-hints-previous', codicons_1.Codicon.chevronLeft, (0, nls_1.localize)('parameterHintsPreviousIcon', 'Icon for show previous parameter hint.'));
    let InlineSuggestionHintsContentWidget = class InlineSuggestionHintsContentWidget extends lifecycle_1.Disposable {
        static { InlineSuggestionHintsContentWidget_1 = this; }
        static { this._dropDownVisible = false; }
        static get dropDownVisible() { return this._dropDownVisible; }
        static { this.id = 0; }
        createCommandAction(commandId, label, iconClassName) {
            const action = new actions_1.Action(commandId, label, iconClassName, true, () => this._commandService.executeCommand(commandId));
            const kb = this.keybindingService.lookupKeybinding(commandId, this._contextKeyService);
            let tooltip = label;
            if (kb) {
                tooltip = (0, nls_1.localize)({ key: 'content', comment: ['A label', 'A keybinding'] }, '{0} ({1})', label, kb.getLabel());
            }
            action.tooltip = tooltip;
            return action;
        }
        constructor(editor, withBorder, _position, _currentSuggestionIdx, _suggestionCount, _extraCommands, _commandService, instantiationService, keybindingService, _contextKeyService, _menuService) {
            super();
            this.editor = editor;
            this.withBorder = withBorder;
            this._position = _position;
            this._currentSuggestionIdx = _currentSuggestionIdx;
            this._suggestionCount = _suggestionCount;
            this._extraCommands = _extraCommands;
            this._commandService = _commandService;
            this.keybindingService = keybindingService;
            this._contextKeyService = _contextKeyService;
            this._menuService = _menuService;
            this.id = `InlineSuggestionHintsContentWidget${InlineSuggestionHintsContentWidget_1.id++}`;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this.nodes = (0, dom_1.h)('div.inlineSuggestionsHints', { className: this.withBorder ? '.withBorder' : '' }, [
                (0, dom_1.h)('div@toolBar'),
            ]);
            this.previousAction = this.createCommandAction(commandIds_1.showPreviousInlineSuggestionActionId, (0, nls_1.localize)('previous', 'Previous'), themables_1.ThemeIcon.asClassName(inlineSuggestionHintsPreviousIcon));
            this.availableSuggestionCountAction = new actions_1.Action('inlineSuggestionHints.availableSuggestionCount', '', undefined, false);
            this.nextAction = this.createCommandAction(commandIds_1.showNextInlineSuggestionActionId, (0, nls_1.localize)('next', 'Next'), themables_1.ThemeIcon.asClassName(inlineSuggestionHintsNextIcon));
            // TODO@hediet: deprecate MenuId.InlineCompletionsActions
            this.inlineCompletionsActionsMenus = this._register(this._menuService.createMenu(actions_2.MenuId.InlineCompletionsActions, this._contextKeyService));
            this.clearAvailableSuggestionCountLabelDebounced = this._register(new async_1.RunOnceScheduler(() => {
                this.availableSuggestionCountAction.label = '';
            }, 100));
            this.disableButtonsDebounced = this._register(new async_1.RunOnceScheduler(() => {
                this.previousAction.enabled = this.nextAction.enabled = false;
            }, 100));
            this.lastCommands = [];
            this.toolBar = this._register(instantiationService.createInstance(CustomizedMenuWorkbenchToolBar, this.nodes.toolBar, actions_2.MenuId.InlineSuggestionToolbar, {
                menuOptions: { renderShortTitle: true },
                toolbarOptions: { primaryGroup: g => g.startsWith('primary') },
                actionViewItemProvider: (action, options) => {
                    if (action instanceof actions_2.MenuItemAction) {
                        return instantiationService.createInstance(StatusBarViewItem, action, undefined);
                    }
                    if (action === this.availableSuggestionCountAction) {
                        const a = new ActionViewItemWithClassName(undefined, action, { label: true, icon: false });
                        a.setClass('availableSuggestionCount');
                        return a;
                    }
                    return undefined;
                },
                telemetrySource: 'InlineSuggestionToolbar',
            }));
            this.toolBar.setPrependedPrimaryActions([
                this.previousAction,
                this.availableSuggestionCountAction,
                this.nextAction,
            ]);
            this._register(this.toolBar.onDidChangeDropdownVisibility(e => {
                InlineSuggestionHintsContentWidget_1._dropDownVisible = e;
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update position */
                this._position.read(reader);
                this.editor.layoutContentWidget(this);
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description counts */
                const suggestionCount = this._suggestionCount.read(reader);
                const currentSuggestionIdx = this._currentSuggestionIdx.read(reader);
                if (suggestionCount !== undefined) {
                    this.clearAvailableSuggestionCountLabelDebounced.cancel();
                    this.availableSuggestionCountAction.label = `${currentSuggestionIdx + 1}/${suggestionCount}`;
                }
                else {
                    this.clearAvailableSuggestionCountLabelDebounced.schedule();
                }
                if (suggestionCount !== undefined && suggestionCount > 1) {
                    this.disableButtonsDebounced.cancel();
                    this.previousAction.enabled = this.nextAction.enabled = true;
                }
                else {
                    this.disableButtonsDebounced.schedule();
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description extra commands */
                const extraCommands = this._extraCommands.read(reader);
                if ((0, arrays_1.equals)(this.lastCommands, extraCommands)) {
                    // nothing to update
                    return;
                }
                this.lastCommands = extraCommands;
                const extraActions = extraCommands.map(c => ({
                    class: undefined,
                    id: c.id,
                    enabled: true,
                    tooltip: c.tooltip || '',
                    label: c.title,
                    run: (event) => {
                        return this._commandService.executeCommand(c.id);
                    },
                }));
                for (const [_, group] of this.inlineCompletionsActionsMenus.getActions()) {
                    for (const action of group) {
                        if (action instanceof actions_2.MenuItemAction) {
                            extraActions.push(action);
                        }
                    }
                }
                if (extraActions.length > 0) {
                    extraActions.unshift(new actions_1.Separator());
                }
                this.toolBar.setAdditionalSecondaryActions(extraActions);
            }));
        }
        getId() { return this.id; }
        getDomNode() {
            return this.nodes.root;
        }
        getPosition() {
            return {
                position: this._position.get(),
                preference: [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */],
                positionAffinity: 3 /* PositionAffinity.LeftOfInjectedText */,
            };
        }
    };
    exports.InlineSuggestionHintsContentWidget = InlineSuggestionHintsContentWidget;
    exports.InlineSuggestionHintsContentWidget = InlineSuggestionHintsContentWidget = InlineSuggestionHintsContentWidget_1 = __decorate([
        __param(6, commands_1.ICommandService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, actions_2.IMenuService)
    ], InlineSuggestionHintsContentWidget);
    class ActionViewItemWithClassName extends actionViewItems_1.ActionViewItem {
        constructor() {
            super(...arguments);
            this._className = undefined;
        }
        setClass(className) {
            this._className = className;
        }
        render(container) {
            super.render(container);
            if (this._className) {
                container.classList.add(this._className);
            }
        }
        updateTooltip() {
            // NOOP, disable tooltip
        }
    }
    class StatusBarViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        updateLabel() {
            const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService);
            if (!kb) {
                return super.updateLabel();
            }
            if (this.label) {
                const div = (0, dom_1.h)('div.keybinding').root;
                const k = new keybindingLabel_1.KeybindingLabel(div, platform_1.OS, { disableTitle: true, ...keybindingLabel_1.unthemedKeybindingLabelOptions });
                k.set(kb);
                this.label.textContent = this._action.label;
                this.label.appendChild(div);
                this.label.classList.add('inlineSuggestionStatusBarItemLabel');
            }
        }
        updateTooltip() {
            // NOOP, disable tooltip
        }
    }
    let CustomizedMenuWorkbenchToolBar = class CustomizedMenuWorkbenchToolBar extends toolbar_1.WorkbenchToolBar {
        constructor(container, menuId, options2, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container, { resetMenu: menuId, ...options2 }, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService);
            this.menuId = menuId;
            this.options2 = options2;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.menu = this._store.add(this.menuService.createMenu(this.menuId, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
            this.additionalActions = [];
            this.prependedPrimaryActions = [];
            this._store.add(this.menu.onDidChange(() => this.updateToolbar()));
            this.updateToolbar();
        }
        updateToolbar() {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, this.options2?.menuOptions, { primary, secondary }, this.options2?.toolbarOptions?.primaryGroup, this.options2?.toolbarOptions?.shouldInlineSubmenu, this.options2?.toolbarOptions?.useSeparatorsInPrimaryActions);
            secondary.push(...this.additionalActions);
            primary.unshift(...this.prependedPrimaryActions);
            this.setActions(primary, secondary);
        }
        setPrependedPrimaryActions(actions) {
            if ((0, arrays_1.equals)(this.prependedPrimaryActions, actions, (a, b) => a === b)) {
                return;
            }
            this.prependedPrimaryActions = actions;
            this.updateToolbar();
        }
        setAdditionalSecondaryActions(actions) {
            if ((0, arrays_1.equals)(this.additionalActions, actions, (a, b) => a === b)) {
                return;
            }
            this.additionalActions = actions;
            this.updateToolbar();
        }
    };
    exports.CustomizedMenuWorkbenchToolBar = CustomizedMenuWorkbenchToolBar;
    exports.CustomizedMenuWorkbenchToolBar = CustomizedMenuWorkbenchToolBar = __decorate([
        __param(3, actions_2.IMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, telemetry_1.ITelemetryService)
    ], CustomizedMenuWorkbenchToolBar);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNIaW50c1dpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9pbmxpbmVDb21wbGV0aW9uc0hpbnRzV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpQ3pGLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7UUF1QjNELFlBQ2tCLE1BQW1CLEVBQ25CLEtBQXNELEVBQ2hELG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUpTLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBaUQ7WUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQXpCbkUsc0JBQWlCLEdBQUcsSUFBQSxnQ0FBbUIsRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxxQ0FBNEIsQ0FBQyxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUM7WUFFekssb0JBQWUsR0FBeUIsU0FBUyxDQUFDO1lBRXpDLGFBQVEsR0FBRyxJQUFBLG9CQUFPLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNsRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVsRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUs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