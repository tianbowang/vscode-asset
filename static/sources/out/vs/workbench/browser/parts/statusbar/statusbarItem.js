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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/theme/common/themeService", "vs/editor/common/editorCommon", "vs/base/browser/dom", "vs/platform/notification/common/notification", "vs/base/common/types", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/platform/theme/common/iconRegistry", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/htmlContent", "vs/base/browser/touch"], function (require, exports, errorMessage_1, lifecycle_1, simpleIconLabel_1, commands_1, telemetry_1, statusbar_1, themeService_1, editorCommon_1, dom_1, notification_1, types_1, keyboardEvent_1, iconLabels_1, iconRegistry_1, iconLabelHover_1, htmlContent_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarEntryItem = void 0;
    let StatusbarEntryItem = class StatusbarEntryItem extends lifecycle_1.Disposable {
        get name() {
            return (0, types_1.assertIsDefined)(this.entry).name;
        }
        get hasCommand() {
            return typeof this.entry?.command !== 'undefined';
        }
        constructor(container, entry, hoverDelegate, commandService, notificationService, telemetryService, themeService) {
            super();
            this.container = container;
            this.hoverDelegate = hoverDelegate;
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.themeService = themeService;
            this.entry = undefined;
            this.foregroundListener = this._register(new lifecycle_1.MutableDisposable());
            this.backgroundListener = this._register(new lifecycle_1.MutableDisposable());
            this.commandMouseListener = this._register(new lifecycle_1.MutableDisposable());
            this.commandTouchListener = this._register(new lifecycle_1.MutableDisposable());
            this.commandKeyboardListener = this._register(new lifecycle_1.MutableDisposable());
            this.focusListener = this._register(new lifecycle_1.MutableDisposable());
            this.focusOutListener = this._register(new lifecycle_1.MutableDisposable());
            this.hover = undefined;
            // Label Container
            this.labelContainer = document.createElement('a');
            this.labelContainer.tabIndex = -1; // allows screen readers to read title, but still prevents tab focus.
            this.labelContainer.setAttribute('role', 'button');
            this.labelContainer.className = 'statusbar-item-label';
            this._register(touch_1.Gesture.addTarget(this.labelContainer)); // enable touch
            // Label (with support for progress)
            this.label = new StatusBarCodiconLabel(this.labelContainer);
            this.container.appendChild(this.labelContainer);
            // Beak Container
            this.beakContainer = document.createElement('div');
            this.beakContainer.className = 'status-bar-item-beak-container';
            this.container.appendChild(this.beakContainer);
            this.update(entry);
        }
        update(entry) {
            // Update: Progress
            this.label.showProgress = entry.showProgress ?? false;
            // Update: Text
            if (!this.entry || entry.text !== this.entry.text) {
                this.label.text = entry.text;
                if (entry.text) {
                    (0, dom_1.show)(this.labelContainer);
                }
                else {
                    (0, dom_1.hide)(this.labelContainer);
                }
            }
            // Update: ARIA label
            //
            // Set the aria label on both elements so screen readers would read
            // the correct thing without duplication #96210
            if (!this.entry || entry.ariaLabel !== this.entry.ariaLabel) {
                this.container.setAttribute('aria-label', entry.ariaLabel);
                this.labelContainer.setAttribute('aria-label', entry.ariaLabel);
            }
            if (!this.entry || entry.role !== this.entry.role) {
                this.labelContainer.setAttribute('role', entry.role || 'button');
            }
            // Update: Hover
            if (!this.entry || !this.isEqualTooltip(this.entry, entry)) {
                const hoverContents = (0, htmlContent_1.isMarkdownString)(entry.tooltip) ? { markdown: entry.tooltip, markdownNotSupportedFallback: undefined } : entry.tooltip;
                if (this.hover) {
                    this.hover.update(hoverContents);
                }
                else {
                    this.hover = this._register((0, iconLabelHover_1.setupCustomHover)(this.hoverDelegate, this.container, hoverContents));
                }
                if (entry.command !== statusbar_1.ShowTooltipCommand /* prevents flicker on click */) {
                    this.focusListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, dom_1.EventType.FOCUS, e => {
                        dom_1.EventHelper.stop(e);
                        this.hover?.show(false);
                    });
                    this.focusOutListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, dom_1.EventType.FOCUS_OUT, e => {
                        dom_1.EventHelper.stop(e);
                        this.hover?.hide();
                    });
                }
            }
            // Update: Command
            if (!this.entry || entry.command !== this.entry.command) {
                this.commandMouseListener.clear();
                this.commandTouchListener.clear();
                this.commandKeyboardListener.clear();
                const command = entry.command;
                if (command && (command !== statusbar_1.ShowTooltipCommand || this.hover) /* "Show Hover" is only valid when we have a hover */) {
                    this.commandMouseListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, dom_1.EventType.CLICK, () => this.executeCommand(command));
                    this.commandTouchListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, touch_1.EventType.Tap, () => this.executeCommand(command));
                    this.commandKeyboardListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, dom_1.EventType.KEY_DOWN, e => {
                        const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                        if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                            dom_1.EventHelper.stop(e);
                            this.executeCommand(command);
                        }
                        else if (event.equals(9 /* KeyCode.Escape */) || event.equals(15 /* KeyCode.LeftArrow */) || event.equals(17 /* KeyCode.RightArrow */)) {
                            dom_1.EventHelper.stop(e);
                            this.hover?.hide();
                        }
                    });
                    this.labelContainer.classList.remove('disabled');
                }
                else {
                    this.labelContainer.classList.add('disabled');
                }
            }
            // Update: Beak
            if (!this.entry || entry.showBeak !== this.entry.showBeak) {
                if (entry.showBeak) {
                    this.container.classList.add('has-beak');
                }
                else {
                    this.container.classList.remove('has-beak');
                }
            }
            const hasBackgroundColor = !!entry.backgroundColor || (entry.kind && entry.kind !== 'standard');
            // Update: Kind
            if (!this.entry || entry.kind !== this.entry.kind) {
                for (const kind of statusbar_1.StatusbarEntryKinds) {
                    this.container.classList.remove(`${kind}-kind`);
                }
                if (entry.kind && entry.kind !== 'standard') {
                    this.container.classList.add(`${entry.kind}-kind`);
                }
                this.container.classList.toggle('has-background-color', hasBackgroundColor);
            }
            // Update: Foreground
            if (!this.entry || entry.color !== this.entry.color) {
                this.applyColor(this.labelContainer, entry.color);
            }
            // Update: Background
            if (!this.entry || entry.backgroundColor !== this.entry.backgroundColor) {
                this.container.classList.toggle('has-background-color', hasBackgroundColor);
                this.applyColor(this.container, entry.backgroundColor, true);
            }
            // Remember for next round
            this.entry = entry;
        }
        isEqualTooltip({ tooltip }, { tooltip: otherTooltip }) {
            if (tooltip === undefined) {
                return otherTooltip === undefined;
            }
            if ((0, htmlContent_1.isMarkdownString)(tooltip)) {
                return (0, htmlContent_1.isMarkdownString)(otherTooltip) && (0, htmlContent_1.markdownStringEqual)(tooltip, otherTooltip);
            }
            return tooltip === otherTooltip;
        }
        async executeCommand(command) {
            // Custom command from us: Show tooltip
            if (command === statusbar_1.ShowTooltipCommand) {
                this.hover?.show(true /* focus */);
            }
            // Any other command is going through command service
            else {
                const id = typeof command === 'string' ? command : command.id;
                const args = typeof command === 'string' ? [] : command.arguments ?? [];
                this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: 'status bar' });
                try {
                    await this.commandService.executeCommand(id, ...args);
                }
                catch (error) {
                    this.notificationService.error((0, errorMessage_1.toErrorMessage)(error));
                }
            }
        }
        applyColor(container, color, isBackground) {
            let colorResult = undefined;
            if (isBackground) {
                this.backgroundListener.clear();
            }
            else {
                this.foregroundListener.clear();
            }
            if (color) {
                if ((0, editorCommon_1.isThemeColor)(color)) {
                    colorResult = this.themeService.getColorTheme().getColor(color.id)?.toString();
                    const listener = this.themeService.onDidColorThemeChange(theme => {
                        const colorValue = theme.getColor(color.id)?.toString();
                        if (isBackground) {
                            container.style.backgroundColor = colorValue ?? '';
                        }
                        else {
                            container.style.color = colorValue ?? '';
                        }
                    });
                    if (isBackground) {
                        this.backgroundListener.value = listener;
                    }
                    else {
                        this.foregroundListener.value = listener;
                    }
                }
                else {
                    colorResult = color;
                }
            }
            if (isBackground) {
                container.style.backgroundColor = colorResult ?? '';
            }
            else {
                container.style.color = colorResult ?? '';
            }
        }
    };
    exports.StatusbarEntryItem = StatusbarEntryItem;
    exports.StatusbarEntryItem = StatusbarEntryItem = __decorate([
        __param(3, commands_1.ICommandService),
        __param(4, notification_1.INotificationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, themeService_1.IThemeService)
    ], StatusbarEntryItem);
    class StatusBarCodiconLabel extends simpleIconLabel_1.SimpleIconLabel {
        constructor(container) {
            super(container);
            this.container = container;
            this.progressCodicon = (0, iconLabels_1.renderIcon)(iconRegistry_1.syncing);
            this.currentText = '';
            this.currentShowProgress = false;
        }
        set showProgress(showProgress) {
            if (this.currentShowProgress !== showProgress) {
                this.currentShowProgress = showProgress;
                this.progressCodicon = (0, iconLabels_1.renderIcon)(showProgress === 'loading' ? iconRegistry_1.spinningLoading : iconRegistry_1.syncing);
                this.text = this.currentText;
            }
        }
        set text(text) {
            // Progress: insert progress codicon as first element as needed
            // but keep it stable so that the animation does not reset
            if (this.currentShowProgress) {
                // Append as needed
                if (this.container.firstChild !== this.progressCodicon) {
                    this.container.appendChild(this.progressCodicon);
                }
                // Remove others
                for (const node of Array.from(this.container.childNodes)) {
                    if (node !== this.progressCodicon) {
                        node.remove();
                    }
                }
                // If we have text to show, add a space to separate from progress
                let textContent = text ?? '';
                if (textContent) {
                    textContent = ` ${textContent}`;
                }
                // Append new elements
                (0, dom_1.append)(this.container, ...(0, iconLabels_1.renderLabelWithIcons)(textContent));
            }
            // No Progress: no special handling
            else {
                super.text = text;
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFySXRlbS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvc3RhdHVzYmFyL3N0YXR1c2Jhckl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJ6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFVO1FBb0JqRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUEsdUJBQWUsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3pDLENBQUM7UUFFRCxJQUFJLFVBQVU7WUFDYixPQUFPLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssV0FBVyxDQUFDO1FBQ25ELENBQUM7UUFFRCxZQUNTLFNBQXNCLEVBQzlCLEtBQXNCLEVBQ0wsYUFBNkIsRUFDN0IsY0FBZ0QsRUFDM0MsbUJBQTBELEVBQzdELGdCQUFvRCxFQUN4RCxZQUE0QztZQUUzRCxLQUFLLEVBQUUsQ0FBQztZQVJBLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFFYixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDWixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDMUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBL0JwRCxVQUFLLEdBQWdDLFNBQVMsQ0FBQztZQUV0Qyx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQzdELHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFFN0QseUJBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUMvRCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDbEUsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFFcEUsVUFBSyxHQUE2QixTQUFTLENBQUM7WUF3Qm5ELGtCQUFrQjtZQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxRUFBcUU7WUFDeEcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO1lBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWU7WUFFdkUsb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWhELGlCQUFpQjtZQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFzQjtZQUU1QixtQkFBbUI7WUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUM7WUFFdEQsZUFBZTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFFN0IsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLElBQUEsVUFBSSxFQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUEsVUFBSSxFQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztZQUNGLENBQUM7WUFFRCxxQkFBcUI7WUFDckIsRUFBRTtZQUNGLG1FQUFtRTtZQUNuRSwrQ0FBK0M7WUFFL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3RCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFFRCxnQkFBZ0I7WUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDNUQsTUFBTSxhQUFhLEdBQUcsSUFBQSw4QkFBZ0IsRUFBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7Z0JBQzdJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLGlDQUFnQixFQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNsRyxDQUFDO2dCQUNELElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyw4QkFBa0IsQ0FBQywrQkFBK0IsRUFBRSxDQUFDO29CQUMxRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDMUYsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN6QixDQUFDLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLElBQUEsMkJBQXFCLEVBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxlQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFO3dCQUNqRyxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDcEIsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDcEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNGLENBQUM7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN6RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUVyQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO2dCQUM5QixJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyw4QkFBa0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMscURBQXFELEVBQUUsQ0FBQztvQkFDckgsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssR0FBRyxJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBUyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2xJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEdBQUcsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGlCQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDckksSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssR0FBRyxJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDdkcsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0MsSUFBSSxLQUFLLENBQUMsTUFBTSx3QkFBZSxJQUFJLEtBQUssQ0FBQyxNQUFNLHVCQUFlLEVBQUUsQ0FBQzs0QkFDaEUsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBRXBCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzlCLENBQUM7NkJBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSx3QkFBZ0IsSUFBSSxLQUFLLENBQUMsTUFBTSw0QkFBbUIsSUFBSSxLQUFLLENBQUMsTUFBTSw2QkFBb0IsRUFBRSxDQUFDOzRCQUNoSCxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFFcEIsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQzt3QkFDcEIsQ0FBQztvQkFDRixDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xELENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQy9DLENBQUM7WUFDRixDQUFDO1lBRUQsZUFBZTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDM0QsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDN0MsQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBRWhHLGVBQWU7WUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25ELEtBQUssTUFBTSxJQUFJLElBQUksK0JBQW1CLEVBQUUsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQztnQkFDakQsQ0FBQztnQkFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUUsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUM7Z0JBQ3BELENBQUM7Z0JBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUVELHFCQUFxQjtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUVELHFCQUFxQjtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM1RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBRUQsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFFTyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQW1CLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFtQjtZQUM5RixJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxZQUFZLEtBQUssU0FBUyxDQUFDO1lBQ25DLENBQUM7WUFFRCxJQUFJLElBQUEsOEJBQWdCLEVBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxJQUFBLDhCQUFnQixFQUFDLFlBQVksQ0FBQyxJQUFJLElBQUEsaUNBQW1CLEVBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3JGLENBQUM7WUFFRCxPQUFPLE9BQU8sS0FBSyxZQUFZLENBQUM7UUFDakMsQ0FBQztRQUVPLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBeUI7WUFFckQsdUNBQXVDO1lBQ3ZDLElBQUksT0FBTyxLQUFLLDhCQUFrQixFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBRUQscURBQXFEO2lCQUNoRCxDQUFDO2dCQUNMLE1BQU0sRUFBRSxHQUFHLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7Z0JBRXhFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO2dCQUM3SixJQUFJLENBQUM7b0JBQ0osTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLElBQUEsNkJBQWMsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFTyxVQUFVLENBQUMsU0FBc0IsRUFBRSxLQUFzQyxFQUFFLFlBQXNCO1lBQ3hHLElBQUksV0FBVyxHQUF1QixTQUFTLENBQUM7WUFFaEQsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakMsQ0FBQztZQUVELElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxJQUFBLDJCQUFZLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDekIsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFFL0UsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDaEUsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7d0JBRXhELElBQUksWUFBWSxFQUFFLENBQUM7NEJBQ2xCLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7d0JBQ3BELENBQUM7NkJBQU0sQ0FBQzs0QkFDUCxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLElBQUksRUFBRSxDQUFDO3dCQUMxQyxDQUFDO29CQUNGLENBQUMsQ0FBQyxDQUFDO29CQUVILElBQUksWUFBWSxFQUFFLENBQUM7d0JBQ2xCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO29CQUMxQyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7b0JBQzFDLENBQUM7Z0JBQ0YsQ0FBQztxQkFBTSxDQUFDO29CQUNQLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUNyRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUMzQyxDQUFDO1FBQ0YsQ0FBQztLQUNELENBQUE7SUF4UFksZ0RBQWtCO2lDQUFsQixrQkFBa0I7UUFnQzVCLFdBQUEsMEJBQWUsQ0FBQTtRQUNmLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLDRCQUFhLENBQUE7T0FuQ0gsa0JBQWtCLENBd1A5QjtJQUVELE1BQU0scUJBQXNCLFNBQVEsaUNBQWU7UUFPbEQsWUFDa0IsU0FBc0I7WUFFdkMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRkEsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQU5oQyxvQkFBZSxHQUFHLElBQUEsdUJBQVUsRUFBQyxzQkFBTyxDQUFDLENBQUM7WUFFdEMsZ0JBQVcsR0FBRyxFQUFFLENBQUM7WUFDakIsd0JBQW1CLEdBQW9DLEtBQUssQ0FBQztRQU1yRSxDQUFDO1FBRUQsSUFBSSxZQUFZLENBQUMsWUFBNkM7WUFDN0QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssWUFBWSxFQUFFLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBQSx1QkFBVSxFQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUFlLENBQUMsQ0FBQyxDQUFDLHNCQUFPLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzlCLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBYSxJQUFJLENBQUMsSUFBWTtZQUU3QiwrREFBK0Q7WUFDL0QsMERBQTBEO1lBQzFELElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBRTlCLG1CQUFtQjtnQkFDbkIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDbEQsQ0FBQztnQkFFRCxnQkFBZ0I7Z0JBQ2hCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQzFELElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFDbkMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNmLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxpRUFBaUU7Z0JBQ2pFLElBQUksV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQzdCLElBQUksV0FBVyxFQUFFLENBQUM7b0JBQ2pCLFdBQVcsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNqQyxDQUFDO2dCQUVELHNCQUFzQjtnQkFDdEIsSUFBQSxZQUFNLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUEsaUNBQW9CLEVBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBRUQsbUNBQW1DO2lCQUM5QixDQUFDO2dCQUNMLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ25CLENBQUM7UUFDRixDQUFDO0tBQ0QifQ==