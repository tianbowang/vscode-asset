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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./renameInputField"], function (require, exports, lifecycle_1, position_1, nls_1, contextkey_1, keybinding_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenameInputField = exports.CONTEXT_RENAME_INPUT_VISIBLE = void 0;
    exports.CONTEXT_RENAME_INPUT_VISIBLE = new contextkey_1.RawContextKey('renameInputVisible', false, (0, nls_1.localize)('renameInputVisible', "Whether the rename input widget is visible"));
    let RenameInputField = class RenameInputField {
        constructor(_editor, _acceptKeybindings, _themeService, _keybindingService, contextKeyService) {
            this._editor = _editor;
            this._acceptKeybindings = _acceptKeybindings;
            this._themeService = _themeService;
            this._keybindingService = _keybindingService;
            this._disposables = new lifecycle_1.DisposableStore();
            this.allowEditorOverflow = true;
            this._visibleContextKey = exports.CONTEXT_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
            this._editor.addContentWidget(this);
            this._disposables.add(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._updateFont();
                }
            }));
            this._disposables.add(_themeService.onDidColorThemeChange(this._updateStyles, this));
        }
        dispose() {
            this._disposables.dispose();
            this._editor.removeContentWidget(this);
        }
        getId() {
            return '__renameInputWidget';
        }
        getDomNode() {
            if (!this._domNode) {
                this._domNode = document.createElement('div');
                this._domNode.className = 'monaco-editor rename-box';
                this._input = document.createElement('input');
                this._input.className = 'rename-input';
                this._input.type = 'text';
                this._input.setAttribute('aria-label', (0, nls_1.localize)('renameAriaLabel', "Rename input. Type new name and press Enter to commit."));
                this._domNode.appendChild(this._input);
                this._label = document.createElement('div');
                this._label.className = 'rename-label';
                this._domNode.appendChild(this._label);
                this._updateFont();
                this._updateStyles(this._themeService.getColorTheme());
            }
            return this._domNode;
        }
        _updateStyles(theme) {
            if (!this._input || !this._domNode) {
                return;
            }
            const widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
            const widgetBorderColor = theme.getColor(colorRegistry_1.widgetBorder);
            this._domNode.style.backgroundColor = String(theme.getColor(colorRegistry_1.editorWidgetBackground) ?? '');
            this._domNode.style.boxShadow = widgetShadowColor ? ` 0 0 8px 2px ${widgetShadowColor}` : '';
            this._domNode.style.border = widgetBorderColor ? `1px solid ${widgetBorderColor}` : '';
            this._domNode.style.color = String(theme.getColor(colorRegistry_1.inputForeground) ?? '');
            this._input.style.backgroundColor = String(theme.getColor(colorRegistry_1.inputBackground) ?? '');
            // this._input.style.color = String(theme.getColor(inputForeground) ?? '');
            const border = theme.getColor(colorRegistry_1.inputBorder);
            this._input.style.borderWidth = border ? '1px' : '0px';
            this._input.style.borderStyle = border ? 'solid' : 'none';
            this._input.style.borderColor = border?.toString() ?? 'none';
        }
        _updateFont() {
            if (!this._input || !this._label) {
                return;
            }
            const fontInfo = this._editor.getOption(50 /* EditorOption.fontInfo */);
            this._input.style.fontFamily = fontInfo.fontFamily;
            this._input.style.fontWeight = fontInfo.fontWeight;
            this._input.style.fontSize = `${fontInfo.fontSize}px`;
            this._label.style.fontSize = `${fontInfo.fontSize * 0.8}px`;
        }
        getPosition() {
            if (!this._visible) {
                return null;
            }
            return {
                position: this._position,
                preference: [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        beforeRender() {
            const [accept, preview] = this._acceptKeybindings;
            this._label.innerText = (0, nls_1.localize)({ key: 'label', comment: ['placeholders are keybindings, e.g "F2 to Rename, Shift+F2 to Preview"'] }, "{0} to Rename, {1} to Preview", this._keybindingService.lookupKeybinding(accept)?.getLabel(), this._keybindingService.lookupKeybinding(preview)?.getLabel());
            return null;
        }
        afterRender(position) {
            if (!position) {
                // cancel rename when input widget isn't rendered anymore
                this.cancelInput(true);
            }
        }
        acceptInput(wantsPreview) {
            this._currentAcceptInput?.(wantsPreview);
        }
        cancelInput(focusEditor) {
            this._currentCancelInput?.(focusEditor);
        }
        getInput(where, value, selectionStart, selectionEnd, supportPreview, token) {
            this._domNode.classList.toggle('preview', supportPreview);
            this._position = new position_1.Position(where.startLineNumber, where.startColumn);
            this._input.value = value;
            this._input.setAttribute('selectionStart', selectionStart.toString());
            this._input.setAttribute('selectionEnd', selectionEnd.toString());
            this._input.size = Math.max((where.endColumn - where.startColumn) * 1.1, 20);
            const disposeOnDone = new lifecycle_1.DisposableStore();
            return new Promise(resolve => {
                this._currentCancelInput = (focusEditor) => {
                    this._currentAcceptInput = undefined;
                    this._currentCancelInput = undefined;
                    resolve(focusEditor);
                    return true;
                };
                this._currentAcceptInput = (wantsPreview) => {
                    if (this._input.value.trim().length === 0 || this._input.value === value) {
                        // empty or whitespace only or not changed
                        this.cancelInput(true);
                        return;
                    }
                    this._currentAcceptInput = undefined;
                    this._currentCancelInput = undefined;
                    resolve({
                        newName: this._input.value,
                        wantsPreview: supportPreview && wantsPreview
                    });
                };
                disposeOnDone.add(token.onCancellationRequested(() => this.cancelInput(true)));
                disposeOnDone.add(this._editor.onDidBlurEditorWidget(() => this.cancelInput(!this._domNode?.ownerDocument.hasFocus())));
                this._show();
            }).finally(() => {
                disposeOnDone.dispose();
                this._hide();
            });
        }
        _show() {
            this._editor.revealLineInCenterIfOutsideViewport(this._position.lineNumber, 0 /* ScrollType.Smooth */);
            this._visible = true;
            this._visibleContextKey.set(true);
            this._editor.layoutContentWidget(this);
            setTimeout(() => {
                this._input.focus();
                this._input.setSelectionRange(parseInt(this._input.getAttribute('selectionStart')), parseInt(this._input.getAttribute('selectionEnd')));
            }, 100);
        }
        _hide() {
            this._visible = false;
            this._visibleContextKey.reset();
            this._editor.layoutContentWidget(this);
        }
    };
    exports.RenameInputField = RenameInputField;
    exports.RenameInputField = RenameInputField = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextkey_1.IContextKeyService)
    ], RenameInputField);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuYW1lSW5wdXRGaWVsZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvcmVuYW1lL2Jyb3dzZXIvcmVuYW1lSW5wdXRGaWVsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQm5GLFFBQUEsNEJBQTRCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG9CQUFvQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7SUFPM0ssSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7UUFZNUIsWUFDa0IsT0FBb0IsRUFDcEIsa0JBQW9DLEVBQ3RDLGFBQTZDLEVBQ3hDLGtCQUF1RCxFQUN2RCxpQkFBcUM7WUFKeEMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQWtCO1lBQ3JCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ3ZCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFSM0QsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUU3Qyx3QkFBbUIsR0FBWSxJQUFJLENBQUM7WUFTNUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLG9DQUE0QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRWpGLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDL0QsSUFBSSxDQUFDLENBQUMsVUFBVSxnQ0FBdUIsRUFBRSxDQUFDO29CQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BC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