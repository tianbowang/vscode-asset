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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/notification/common/notification", "vs/platform/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/css!./media/extension"], function (require, exports, dom_1, lifecycle_1, actionbar_1, instantiation_1, event_1, extensions_1, extensionsActions_1, extensionManagementUtil_1, extensionsWidgets_1, extensions_2, extensionManagement_1, notification_1, extensions_3, themeService_1, themables_1, theme_1, contextView_1, extensionsIcons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Renderer = exports.Delegate = void 0;
    const EXTENSION_LIST_ELEMENT_HEIGHT = 72;
    class Delegate {
        getHeight() { return EXTENSION_LIST_ELEMENT_HEIGHT; }
        getTemplateId() { return 'extension'; }
    }
    exports.Delegate = Delegate;
    let Renderer = class Renderer {
        constructor(extensionViewState, options, instantiationService, notificationService, extensionService, extensionManagementServerService, extensionsWorkbenchService, contextMenuService) {
            this.extensionViewState = extensionViewState;
            this.options = options;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.contextMenuService = contextMenuService;
        }
        get templateId() { return 'extension'; }
        renderTemplate(root) {
            const recommendationWidget = this.instantiationService.createInstance(extensionsWidgets_1.RecommendationWidget, (0, dom_1.append)(root, (0, dom_1.$)('.extension-bookmark-container')));
            const preReleaseWidget = this.instantiationService.createInstance(extensionsWidgets_1.PreReleaseBookmarkWidget, (0, dom_1.append)(root, (0, dom_1.$)('.extension-bookmark-container')));
            const element = (0, dom_1.append)(root, (0, dom_1.$)('.extension-list-item'));
            const iconContainer = (0, dom_1.append)(element, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon', { alt: '' }));
            const iconRemoteBadgeWidget = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, iconContainer, false);
            const extensionPackBadgeWidget = this.instantiationService.createInstance(extensionsWidgets_1.ExtensionPackCountWidget, iconContainer);
            const details = (0, dom_1.append)(element, (0, dom_1.$)('.details'));
            const headerContainer = (0, dom_1.append)(details, (0, dom_1.$)('.header-container'));
            const header = (0, dom_1.append)(headerContainer, (0, dom_1.$)('.header'));
            const name = (0, dom_1.append)(header, (0, dom_1.$)('span.name'));
            const installCount = (0, dom_1.append)(header, (0, dom_1.$)('span.install-count'));
            const ratings = (0, dom_1.append)(header, (0, dom_1.$)('span.ratings'));
            const syncIgnore = (0, dom_1.append)(header, (0, dom_1.$)('span.sync-ignored'));
            const activationStatus = (0, dom_1.append)(header, (0, dom_1.$)('span.activation-status'));
            const headerRemoteBadgeWidget = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, header, false);
            const description = (0, dom_1.append)(details, (0, dom_1.$)('.description.ellipsis'));
            const footer = (0, dom_1.append)(details, (0, dom_1.$)('.footer'));
            const publisher = (0, dom_1.append)(footer, (0, dom_1.$)('.author.ellipsis'));
            const verifiedPublisherWidget = this.instantiationService.createInstance(extensionsWidgets_1.VerifiedPublisherWidget, (0, dom_1.append)(publisher, (0, dom_1.$)(`.verified-publisher`)), true);
            const publisherDisplayName = (0, dom_1.append)(publisher, (0, dom_1.$)('.publisher-name.ellipsis'));
            const actionbar = new actionbar_1.ActionBar(footer, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.ActionWithDropDownAction) {
                        return new extensionsActions_1.ExtensionActionWithDropdownActionViewItem(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.contextMenuService);
                    }
                    if (action instanceof extensionsActions_1.ExtensionDropDownAction) {
                        return action.createActionViewItem();
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            });
            actionbar.setFocusable(false);
            actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
            const extensionStatusIconAction = this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusAction);
            const actions = [
                this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.MigrateDeprecatedExtensionAction, true),
                this.instantiationService.createInstance(extensionsActions_1.ReloadAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.updateActions', '', [[this.instantiationService.createInstance(extensionsActions_1.UpdateAction, false)], [this.instantiationService.createInstance(extensionsActions_1.ToggleAutoUpdateForExtensionAction, true, [true, 'onlyEnabledExtensions'])]]),
                this.instantiationService.createInstance(extensionsActions_1.InstallDropdownAction),
                this.instantiationService.createInstance(extensionsActions_1.InstallingLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.SetLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.ClearLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.RemoteInstallAction, false),
                this.instantiationService.createInstance(extensionsActions_1.LocalInstallAction),
                this.instantiationService.createInstance(extensionsActions_1.WebInstallAction),
                extensionStatusIconAction,
                this.instantiationService.createInstance(extensionsActions_1.ManageExtensionAction)
            ];
            const extensionHoverWidget = this.instantiationService.createInstance(extensionsWidgets_1.ExtensionHoverWidget, { target: root, position: this.options.hoverOptions.position }, extensionStatusIconAction);
            const widgets = [
                recommendationWidget,
                preReleaseWidget,
                iconRemoteBadgeWidget,
                extensionPackBadgeWidget,
                headerRemoteBadgeWidget,
                verifiedPublisherWidget,
                extensionHoverWidget,
                this.instantiationService.createInstance(extensionsWidgets_1.SyncIgnoredWidget, syncIgnore),
                this.instantiationService.createInstance(extensionsWidgets_1.ExtensionActivationStatusWidget, activationStatus, true),
                this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, installCount, true),
                this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, ratings, true),
            ];
            const extensionContainers = this.instantiationService.createInstance(extensions_1.ExtensionContainers, [...actions, ...widgets]);
            actionbar.push(actions, { icon: true, label: true });
            const disposable = (0, lifecycle_1.combinedDisposable)(...actions, ...widgets, actionbar, extensionContainers);
            return {
                root, element, icon, name, installCount, ratings, description, publisherDisplayName, disposables: [disposable], actionbar,
                extensionDisposables: [],
                set extension(extension) {
                    extensionContainers.extension = extension;
                }
            };
        }
        renderPlaceholder(index, data) {
            data.element.classList.add('loading');
            data.root.removeAttribute('aria-label');
            data.root.removeAttribute('data-extension-id');
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
            data.icon.src = '';
            data.name.textContent = '';
            data.description.textContent = '';
            data.publisherDisplayName.textContent = '';
            data.installCount.style.display = 'none';
            data.ratings.style.display = 'none';
            data.extension = null;
        }
        renderElement(extension, index, data) {
            data.element.classList.remove('loading');
            data.root.setAttribute('data-extension-id', extension.identifier.id);
            if (extension.state !== 3 /* ExtensionState.Uninstalled */ && !extension.server) {
                // Get the extension if it is installed and has no server information
                extension = this.extensionsWorkbenchService.local.filter(e => e.server === extension.server && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0] || extension;
            }
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
            const computeEnablement = async () => {
                if (extension.state === 3 /* ExtensionState.Uninstalled */) {
                    if (!!extension.deprecationInfo) {
                        return true;
                    }
                    if (this.extensionsWorkbenchService.canSetLanguage(extension)) {
                        return false;
                    }
                    return !(await this.extensionsWorkbenchService.canInstall(extension));
                }
                else if (extension.local && !(0, extensions_3.isLanguagePackExtension)(extension.local.manifest)) {
                    const runningExtension = this.extensionService.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, extension.identifier))[0];
                    return !(runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(runningExtension)));
                }
                return false;
            };
            const updateEnablement = async () => {
                const disabled = await computeEnablement();
                const deprecated = !!extension.deprecationInfo;
                data.element.classList.toggle('deprecated', deprecated);
                data.root.classList.toggle('disabled', disabled);
            };
            updateEnablement();
            this.extensionService.onDidChangeExtensions(() => updateEnablement(), this, data.extensionDisposables);
            data.extensionDisposables.push((0, dom_1.addDisposableListener)(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
            data.icon.src = extension.iconUrl;
            if (!data.icon.complete) {
                data.icon.style.visibility = 'hidden';
                data.icon.onload = () => data.icon.style.visibility = 'inherit';
            }
            else {
                data.icon.style.visibility = 'inherit';
            }
            data.name.textContent = extension.displayName;
            data.description.textContent = extension.description;
            const updatePublisher = () => {
                data.publisherDisplayName.textContent = extension.publisherDisplayName;
            };
            updatePublisher();
            event_1.Event.filter(this.extensionsWorkbenchService.onChange, e => !!e && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))(() => updatePublisher(), this, data.extensionDisposables);
            data.installCount.style.display = '';
            data.ratings.style.display = '';
            data.extension = extension;
            if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
                data.description.textContent = extension.gallery.properties.localizedLanguages.map(name => name[0].toLocaleUpperCase() + name.slice(1)).join(', ');
            }
            this.extensionViewState.onFocus(e => {
                if ((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, e.identifier)) {
                    data.actionbar.setFocusable(true);
                }
            }, this, data.extensionDisposables);
            this.extensionViewState.onBlur(e => {
                if ((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, e.identifier)) {
                    data.actionbar.setFocusable(false);
                }
            }, this, data.extensionDisposables);
        }
        disposeElement(extension, index, data) {
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
        }
        disposeTemplate(data) {
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
            data.disposables = (0, lifecycle_1.dispose)(data.disposables);
        }
    };
    exports.Renderer = Renderer;
    exports.Renderer = Renderer = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, notification_1.INotificationService),
        __param(4, extensions_2.IExtensionService),
        __param(5, extensionManagement_1.IExtensionManagementServerService),
        __param(6, extensions_1.IExtensionsWorkbenchService),
        __param(7, contextView_1.IContextMenuService)
    ], Renderer);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const verifiedPublisherIconColor = theme.getColor(extensionsWidgets_1.extensionVerifiedPublisherIconColor);
        if (verifiedPublisherIconColor) {
            const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(.5).makeOpaque((0, theme_1.WORKBENCH_BACKGROUND)(theme));
            collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled .author .verified-publisher ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.verifiedPublisherIcon)} { color: ${disabledVerifiedPublisherIconColor}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0xpc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zTGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQU0sNkJBQTZCLEdBQUcsRUFBRSxDQUFDO0lBc0J6QyxNQUFhLFFBQVE7UUFDcEIsU0FBUyxLQUFLLE9BQU8sNkJBQTZCLENBQUMsQ0FBQyxDQUFDO1FBQ3JELGFBQWEsS0FBSyxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUM7S0FDdkM7SUFIRCw0QkFHQztJQVFNLElBQU0sUUFBUSxHQUFkLE1BQU0sUUFBUTtRQUVwQixZQUNTLGtCQUF3QyxFQUMvQixPQUFxQyxFQUNkLG9CQUEyQyxFQUM1QyxtQkFBeUMsRUFDNUMsZ0JBQW1DLEVBQ25CLGdDQUFtRSxFQUN6RSwwQkFBdUQsRUFDL0Qsa0JBQXVDO1lBUHJFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDL0IsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7WUFDZCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNuQixxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQ3pFLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDL0QsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtRQUMxRSxDQUFDO1FBRUwsSUFBSSxVQUFVLEtBQUssT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXhDLGNBQWMsQ0FBQyxJQUFpQjtZQUMvQixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsd0NBQW9CLEVB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