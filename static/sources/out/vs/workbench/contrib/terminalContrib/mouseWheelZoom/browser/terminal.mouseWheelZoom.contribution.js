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
define(["require", "exports", "vs/base/common/event", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/platform/configuration/common/configuration"], function (require, exports, event_1, scrollableElement_1, lifecycle_1, platform_1, terminalExtensions_1, configuration_1) {
    "use strict";
    var TerminalMouseWheelZoomContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let TerminalMouseWheelZoomContribution = class TerminalMouseWheelZoomContribution extends lifecycle_1.Disposable {
        static { TerminalMouseWheelZoomContribution_1 = this; }
        static { this.ID = 'terminal.mouseWheelZoom'; }
        static get(instance) {
            return instance.getContribution(TerminalMouseWheelZoomContribution_1.ID);
        }
        constructor(instance, processManager, widgetManager, _configurationService) {
            super();
            this._configurationService = _configurationService;
            this._listener = this._register(new lifecycle_1.MutableDisposable());
        }
        xtermOpen(xterm) {
            this._register(event_1.Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, e => {
                if (!e || e.affectsConfiguration("terminal.integrated.mouseWheelZoom" /* TerminalSettingId.MouseWheelZoom */)) {
                    if (!!this._configurationService.getValue("terminal.integrated.mouseWheelZoom" /* TerminalSettingId.MouseWheelZoom */)) {
                        this._setupMouseWheelZoomListener(xterm.raw);
                    }
                    else {
                        this._listener.clear();
                    }
                }
            }));
        }
        _getConfigFontSize() {
            return this._configurationService.getValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */);
        }
        _setupMouseWheelZoomListener(raw) {
            // This is essentially a copy of what we do in the editor, just we modify font size directly
            // as there is no separate zoom level concept in the terminal
            const classifier = scrollableElement_1.MouseWheelClassifier.INSTANCE;
            let prevMouseWheelTime = 0;
            let gestureStartFontSize = this._getConfigFontSize();
            let gestureHasZoomModifiers = false;
            let gestureAccumulatedDelta = 0;
            raw.attachCustomWheelEventHandler((e) => {
                const browserEvent = e;
                if (classifier.isPhysicalMouseWheel()) {
                    if (hasMouseWheelZoomModifiers(browserEvent)) {
                        const delta = browserEvent.deltaY > 0 ? -1 : 1;
                        this._configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, this._getConfigFontSize() + delta);
                        // EditorZoom.setZoomLevel(zoomLevel + delta);
                        browserEvent.preventDefault();
                        browserEvent.stopPropagation();
                        return false;
                    }
                }
                else {
                    // we consider mousewheel events that occur within 50ms of each other to be part of the same gesture
                    // we don't want to consider mouse wheel events where ctrl/cmd is pressed during the inertia phase
                    // we also want to accumulate deltaY values from the same gesture and use that to set the zoom level
                    if (Date.now() - prevMouseWheelTime > 50) {
                        // reset if more than 50ms have passed
                        gestureStartFontSize = this._getConfigFontSize();
                        gestureHasZoomModifiers = hasMouseWheelZoomModifiers(browserEvent);
                        gestureAccumulatedDelta = 0;
                    }
                    prevMouseWheelTime = Date.now();
                    gestureAccumulatedDelta += browserEvent.deltaY;
                    if (gestureHasZoomModifiers) {
                        const deltaAbs = Math.ceil(Math.abs(gestureAccumulatedDelta / 5));
                        const deltaDirection = gestureAccumulatedDelta > 0 ? -1 : 1;
                        const delta = deltaAbs * deltaDirection;
                        this._configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, gestureStartFontSize + delta);
                        gestureAccumulatedDelta += browserEvent.deltaY;
                        browserEvent.preventDefault();
                        browserEvent.stopPropagation();
                        return false;
                    }
                }
                return true;
            });
            this._listener.value = (0, lifecycle_1.toDisposable)(() => raw.attachCustomWheelEventHandler(() => true));
        }
    };
    TerminalMouseWheelZoomContribution = TerminalMouseWheelZoomContribution_1 = __decorate([
        __param(3, configuration_1.IConfigurationService)
    ], TerminalMouseWheelZoomContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalMouseWheelZoomContribution.ID, TerminalMouseWheelZoomContribution, true);
    function hasMouseWheelZoomModifiers(browserEvent) {
        return (platform_1.isMacintosh
            // on macOS we support cmd + two fingers scroll (`metaKey` set)
            // and also the two fingers pinch gesture (`ctrKey` set)
            ? ((browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey)
            : (browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwubW91c2VXaGVlbFpvb20uY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbW91c2VXaGVlbFpvb20vYnJvd3Nlci90ZXJtaW5hbC5tb3VzZVdoZWVsWm9vbS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZWhHLElBQU0sa0NBQWtDLEdBQXhDLE1BQU0sa0NBQW1DLFNBQVEsc0JBQVU7O2lCQUMxQyxPQUFFLEdBQUcseUJBQXlCLEFBQTVCLENBQTZCO1FBUS9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBdUQ7WUFDakUsT0FBTyxRQUFRLENBQUMsZUFBZSxDQUFxQyxvQ0FBa0MsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBSUQsWUFDQyxRQUF1RCxFQUN2RCxjQUE4RCxFQUM5RCxhQUFvQyxFQUNiLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUZnQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBTjdFLGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBUzVELENBQUM7UUFFRCxTQUFTLENBQUMsS0FBaUQ7WUFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDN0YsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsb0JBQW9CLDZFQUFrQyxFQUFFLENBQUM7b0JBQ3BFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLDZFQUFrQyxFQUFFLENBQUM7d0JBQzdFLElB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