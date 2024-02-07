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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/severity", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, event_1, severity_1, nls_1, accessibility_1, commands_1, configuration_1, notification_1, statusbar_1, editorGroupsService_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityStatus = void 0;
    let ScreenReaderModeStatusEntry = class ScreenReaderModeStatusEntry extends lifecycle_1.Disposable {
        constructor(statusbarService) {
            super();
            this.statusbarService = statusbarService;
            this.screenReaderModeElement = this._register(new lifecycle_1.MutableDisposable());
        }
        updateScreenReaderModeElement(visible) {
            if (visible) {
                if (!this.screenReaderModeElement.value) {
                    const text = (0, nls_1.localize)('screenReaderDetected', "Screen Reader Optimized");
                    this.screenReaderModeElement.value = this.statusbarService.addEntry({
                        name: (0, nls_1.localize)('status.editor.screenReaderMode', "Screen Reader Mode"),
                        text,
                        ariaLabel: text,
                        command: 'showEditorScreenReaderNotification',
                        kind: 'prominent'
                    }, 'status.editor.screenReaderMode', 1 /* StatusbarAlignment.RIGHT */, 100.6);
                }
            }
            else {
                this.screenReaderModeElement.clear();
            }
        }
    };
    ScreenReaderModeStatusEntry = __decorate([
        __param(0, statusbar_1.IStatusbarService)
    ], ScreenReaderModeStatusEntry);
    let AccessibilityStatus = class AccessibilityStatus extends lifecycle_1.Disposable {
        constructor(configurationService, notificationService, accessibilityService, instantiationService, editorGroupService) {
            super();
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.accessibilityService = accessibilityService;
            this.editorGroupService = editorGroupService;
            this.screenReaderNotification = null;
            this.promptedScreenReader = false;
            this.screenReaderModeElements = new Set();
            this.createScreenReaderModeElement(instantiationService, this._store);
            this.updateScreenReaderModeElements(accessibilityService.isScreenReaderOptimized());
            commands_1.CommandsRegistry.registerCommand({ id: 'showEditorScreenReaderNotification', handler: () => this.showScreenReaderNotification() });
            this.registerListeners();
        }
        createScreenReaderModeElement(instantiationService, disposables) {
            const entry = disposables.add(instantiationService.createInstance(ScreenReaderModeStatusEntry));
            this.screenReaderModeElements.add(entry);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.screenReaderModeElements.delete(entry)));
            return entry;
        }
        updateScreenReaderModeElements(visible) {
            for (const entry of this.screenReaderModeElements) {
                entry.updateScreenReaderModeElement(visible);
            }
        }
        registerListeners() {
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.onScreenReaderModeChange()));
            this._register(this.configurationService.onDidChangeConfiguration(c => {
                if (c.affectsConfiguration('editor.accessibilitySupport')) {
                    this.onScreenReaderModeChange();
                }
            }));
            this._register(this.editorGroupService.onDidCreateAuxiliaryEditorPart(({ instantiationService, disposables }) => {
                const entry = this.createScreenReaderModeElement(instantiationService, disposables);
                entry.updateScreenReaderModeElement(this.accessibilityService.isScreenReaderOptimized());
            }));
        }
        showScreenReaderNotification() {
            this.screenReaderNotification = this.notificationService.prompt(severity_1.default.Info, (0, nls_1.localize)('screenReaderDetectedExplanation.question', "Are you using a screen reader to operate VS Code?"), [{
                    label: (0, nls_1.localize)('screenReaderDetectedExplanation.answerYes', "Yes"),
                    run: () => {
                        this.configurationService.updateValue('editor.accessibilitySupport', 'on', 2 /* ConfigurationTarget.USER */);
                    }
                }, {
                    label: (0, nls_1.localize)('screenReaderDetectedExplanation.answerNo', "No"),
                    run: () => {
                        this.configurationService.updateValue('editor.accessibilitySupport', 'off', 2 /* ConfigurationTarget.USER */);
                    }
                }], {
                sticky: true,
                priority: notification_1.NotificationPriority.URGENT
            });
            event_1.Event.once(this.screenReaderNotification.onDidClose)(() => this.screenReaderNotification = null);
        }
        onScreenReaderModeChange() {
            // We only support text based editors
            const screenReaderDetected = this.accessibilityService.isScreenReaderOptimized();
            if (screenReaderDetected) {
                const screenReaderConfiguration = this.configurationService.getValue('editor.accessibilitySupport');
                if (screenReaderConfiguration === 'auto') {
                    if (!this.promptedScreenReader) {
                        this.promptedScreenReader = true;
                        setTimeout(() => this.showScreenReaderNotification(), 100);
                    }
                }
            }
            if (this.screenReaderNotification) {
                this.screenReaderNotification.close();
            }
            this.updateScreenReaderModeElements(this.accessibilityService.isScreenReaderOptimized());
        }
        dispose() {
            super.dispose();
            for (const entry of this.screenReaderModeElements) {
                entry.dispose();
            }
        }
    };
    exports.AccessibilityStatus = AccessibilityStatus;
    exports.AccessibilityStatus = AccessibilityStatus = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, notification_1.INotificationService),
        __param(2, accessibility_1.IAccessibilityService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, editorGroupsService_1.IEditorGroupsService)
    ], AccessibilityStatus);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eVN0YXR1cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYWNjZXNzaWJpbGl0eS9icm93c2VyL2FjY2Vzc2liaWxpdHlTdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZWhHLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFJbkQsWUFBK0IsZ0JBQW9EO1lBQ2xGLEtBQUssRUFBRSxDQUFDO1lBRHVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFGbEUsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUEyQixDQUFDLENBQUM7UUFJNUcsQ0FBQztRQUVELDZCQUE2QixDQUFDLE9BQWdCO1lBQzdDLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDekMsTUFBTSxJQUFJLEdBQUcsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztvQkFDekUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO3dCQUNuRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsb0JBQW9CLENBQUM7d0JBQ3RFLElBQUk7d0JBQ0osU0FBUyxFQUFFLElBQUk7d0JBQ2YsT0FBTyxFQUFFLG9DQUFvQzt3QkFDN0MsSUFBSSxFQUFFLFdBQVc7cUJBQ2pCLEVBQUUsZ0NBQWdDLG9DQUE0QixLQUFLLENBQUMsQ0FBQztnQkFDdkUsQ0FBQztZQUNGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsdUJBQXVCLENB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