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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/date", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/hover/browser/hover"], function (require, exports, dom, async_1, date_1, htmlContent_1, lifecycle_1, nls_1, configuration_1, contextView_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateLayout = exports.TerminalDecorationHoverManager = exports.DecorationSelector = void 0;
    var DecorationStyles;
    (function (DecorationStyles) {
        DecorationStyles[DecorationStyles["DefaultDimension"] = 16] = "DefaultDimension";
        DecorationStyles[DecorationStyles["MarginLeft"] = -17] = "MarginLeft";
    })(DecorationStyles || (DecorationStyles = {}));
    var DecorationSelector;
    (function (DecorationSelector) {
        DecorationSelector["CommandDecoration"] = "terminal-command-decoration";
        DecorationSelector["Hide"] = "hide";
        DecorationSelector["ErrorColor"] = "error";
        DecorationSelector["DefaultColor"] = "default-color";
        DecorationSelector["Default"] = "default";
        DecorationSelector["Codicon"] = "codicon";
        DecorationSelector["XtermDecoration"] = "xterm-decoration";
        DecorationSelector["OverviewRuler"] = ".xterm-decoration-overview-ruler";
        DecorationSelector["QuickFix"] = "quick-fix";
    })(DecorationSelector || (exports.DecorationSelector = DecorationSelector = {}));
    let TerminalDecorationHoverManager = class TerminalDecorationHoverManager extends lifecycle_1.Disposable {
        constructor(_hoverService, configurationService, contextMenuService) {
            super();
            this._hoverService = _hoverService;
            this._contextMenuVisible = false;
            this._register(contextMenuService.onDidShowContextMenu(() => this._contextMenuVisible = true));
            this._register(contextMenuService.onDidHideContextMenu(() => this._contextMenuVisible = false));
            this._hoverDelayer = this._register(new async_1.Delayer(configurationService.getValue('workbench.hover.delay')));
        }
        hideHover() {
            this._hoverDelayer.cancel();
            this._hoverService.hideHover();
        }
        createHover(element, command, hoverMessage) {
            return (0, lifecycle_1.combinedDisposable)(dom.addDisposableListener(element, dom.EventType.MOUSE_ENTER, () => {
                if (this._contextMenuVisible) {
                    return;
                }
                this._hoverDelayer.trigger(() => {
                    let hoverContent = `${(0, nls_1.localize)('terminalPromptContextMenu', "Show Command Actions")}`;
                    hoverContent += '\n\n---\n\n';
                    if (!command) {
                        if (hoverMessage) {
                            hoverContent = hoverMessage;
                        }
                        else {
                            return;
                        }
                    }
                    else if (command.markProperties || hoverMessage) {
                        if (command.markProperties?.hoverMessage || hoverMessage) {
                            hoverContent = command.markProperties?.hoverMessage || hoverMessage || '';
                        }
                        else {
                            return;
                        }
                    }
                    else if (command.exitCode) {
                        if (command.exitCode === -1) {
                            hoverContent += (0, nls_1.localize)('terminalPromptCommandFailed', 'Command executed {0} and failed', (0, date_1.fromNow)(command.timestamp, true));
                        }
                        else {
                            hoverContent += (0, nls_1.localize)('terminalPromptCommandFailedWithExitCode', 'Command executed {0} and failed (Exit Code {1})', (0, date_1.fromNow)(command.timestamp, true), command.exitCode);
                        }
                    }
                    else {
                        hoverContent += (0, nls_1.localize)('terminalPromptCommandSuccess', 'Command executed {0}', (0, date_1.fromNow)(command.timestamp, true));
                    }
                    this._hoverService.showHover({ content: new htmlContent_1.MarkdownString(hoverContent), target: element });
                });
            }), dom.addDisposableListener(element, dom.EventType.MOUSE_LEAVE, () => this.hideHover()), dom.addDisposableListener(element, dom.EventType.MOUSE_OUT, () => this.hideHover()));
        }
    };
    exports.TerminalDecorationHoverManager = TerminalDecorationHoverManager;
    exports.TerminalDecorationHoverManager = TerminalDecorationHoverManager = __decorate([
        __param(0, hover_1.IHoverService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, contextView_1.IContextMenuService)
    ], TerminalDecorationHoverManager);
    function updateLayout(configurationService, element) {
        if (!element) {
            return;
        }
        const fontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).value;
        const defaultFontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).defaultValue;
        const lineHeight = configurationService.inspect("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */).value;
        if (typeof fontSize === 'number' && typeof defaultFontSize === 'number' && typeof lineHeight === 'number') {
            const scalar = (fontSize / defaultFontSize) <= 1 ? (fontSize / defaultFontSize) : 1;
            // must be inlined to override the inlined styles from xterm
            element.style.width = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
            element.style.height = `${scalar * 16 /* DecorationStyles.DefaultDimension */ * lineHeight}px`;
            element.style.fontSize = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
            element.style.marginLeft = `${scalar * -17 /* DecorationStyles.MarginLeft */}px`;
        }
    }
    exports.updateLayout = updateLayout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvblN0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci94dGVybS9kZWNvcmF0aW9uU3R5bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxJQUFXLGdCQUdWO0lBSEQsV0FBVyxnQkFBZ0I7UUFDMUIsZ0ZBQXFCLENBQUE7UUFDckIscUVBQWdCLENBQUE7SUFDakIsQ0FBQyxFQUhVLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFHMUI7SUFFRCxJQUFrQixrQkFVakI7SUFWRCxXQUFrQixrQkFBa0I7UUFDbkMsdUVBQWlELENBQUE7UUFDakQsbUNBQWEsQ0FBQTtRQUNiLDBDQUFvQixDQUFBO1FBQ3BCLG9EQUE4QixDQUFBO1FBQzlCLHlDQUFtQixDQUFBO1FBQ25CLHlDQUFtQixDQUFBO1FBQ25CLDBEQUFvQyxDQUFBO1FBQ3BDLHdFQUFrRCxDQUFBO1FBQ2xELDRDQUFzQixDQUFBO0lBQ3ZCLENBQUMsRUFWaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFVbkM7SUFFTSxJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLHNCQUFVO1FBSTdELFlBQTJCLGFBQTZDLEVBQ2hELG9CQUEyQyxFQUM3QyxrQkFBdUM7WUFDNUQsS0FBSyxFQUFFLENBQUM7WUFIbUMsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFGaEUsd0JBQW1CLEdBQVksS0FBSyxDQUFDO1lBTTVDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FB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