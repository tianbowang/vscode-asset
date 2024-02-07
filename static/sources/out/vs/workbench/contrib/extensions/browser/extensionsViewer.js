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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/base/common/cancellation", "vs/base/common/arrays", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/platform/theme/common/colorRegistry", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/workbench/contrib/extensions/browser/extensionsViews"], function (require, exports, dom, nls_1, lifecycle_1, actions_1, extensions_1, event_1, instantiation_1, listService_1, configuration_1, contextkey_1, themeService_1, cancellation_1, arrays_1, extensionsList_1, colorRegistry_1, keyboardEvent_1, mouseEvent_1, extensionsViews_1) {
    "use strict";
    var ExtensionRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getExtensions = exports.ExtensionData = exports.ExtensionsTree = exports.ExtensionsGridView = void 0;
    let ExtensionsGridView = class ExtensionsGridView extends lifecycle_1.Disposable {
        constructor(parent, delegate, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.element = dom.append(parent, dom.$('.extensions-grid-view'));
            this.renderer = this.instantiationService.createInstance(extensionsList_1.Renderer, { onFocus: event_1.Event.None, onBlur: event_1.Event.None }, { hoverOptions: { position() { return 2 /* HoverPosition.BELOW */; } } });
            this.delegate = delegate;
            this.disposableStore = this._register(new lifecycle_1.DisposableStore());
        }
        setExtensions(extensions) {
            this.disposableStore.clear();
            extensions.forEach((e, index) => this.renderExtension(e, index));
        }
        renderExtension(extension, index) {
            const extensionContainer = dom.append(this.element, dom.$('.extension-container'));
            extensionContainer.style.height = `${this.delegate.getHeight()}px`;
            extensionContainer.setAttribute('tabindex', '0');
            const template = this.renderer.renderTemplate(extensionContainer);
            this.disposableStore.add((0, lifecycle_1.toDisposable)(() => this.renderer.disposeTemplate(template)));
            const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
            openExtensionAction.extension = extension;
            template.name.setAttribute('tabindex', '0');
            const handleEvent = (e) => {
                if (e instanceof keyboardEvent_1.StandardKeyboardEvent && e.keyCode !== 3 /* KeyCode.Enter */) {
                    return;
                }
                openExtensionAction.run(e.ctrlKey || e.metaKey);
                e.stopPropagation();
                e.preventDefault();
            };
            this.disposableStore.add(dom.addDisposableListener(template.name, dom.EventType.CLICK, (e) => handleEvent(new mouseEvent_1.StandardMouseEvent(dom.getWindow(template.name), e))));
            this.disposableStore.add(dom.addDisposableListener(template.name, dom.EventType.KEY_DOWN, (e) => handleEvent(new keyboardEvent_1.StandardKeyboardEvent(e))));
            this.disposableStore.add(dom.addDisposableListener(extensionContainer, dom.EventType.KEY_DOWN, (e) => handleEvent(new keyboardEvent_1.StandardKeyboardEvent(e))));
            this.renderer.renderElement(extension, index, template);
        }
    };
    exports.ExtensionsGridView = ExtensionsGridView;
    exports.ExtensionsGridView = ExtensionsGridView = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], ExtensionsGridView);
    class AsyncDataSource {
        hasChildren({ hasChildren }) {
            return hasChildren;
        }
        getChildren(extensionData) {
            return extensionData.getChildren();
        }
    }
    class VirualDelegate {
        getHeight(element) {
            return 62;
        }
        getTemplateId({ extension }) {
            return extension ? ExtensionRenderer.TEMPLATE_ID : UnknownExtensionRenderer.TEMPLATE_ID;
        }
    }
    let ExtensionRenderer = class ExtensionRenderer {
        static { ExtensionRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'extension-template'; }
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        get templateId() {
            return ExtensionRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('extension');
            const icon = dom.append(container, dom.$('img.icon'));
            const details = dom.append(container, dom.$('.details'));
            const header = dom.append(details, dom.$('.header'));
            const name = dom.append(header, dom.$('span.name'));
            const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
            const extensionDisposables = [dom.addDisposableListener(name, 'click', (e) => {
                    openExtensionAction.run(e.ctrlKey || e.metaKey);
                    e.stopPropagation();
                    e.preventDefault();
                })];
            const identifier = dom.append(header, dom.$('span.identifier'));
            const footer = dom.append(details, dom.$('.footer'));
            const author = dom.append(footer, dom.$('.author'));
            return {
                icon,
                name,
                identifier,
                author,
                extensionDisposables,
                set extensionData(extensionData) {
                    openExtensionAction.extension = extensionData.extension;
                }
            };
        }
        renderElement(node, index, data) {
            const extension = node.element.extension;
            data.extensionDisposables.push(dom.addDisposableListener(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
            data.icon.src = extension.iconUrl;
            if (!data.icon.complete) {
                data.icon.style.visibility = 'hidden';
                data.icon.onload = () => data.icon.style.visibility = 'inherit';
            }
            else {
                data.icon.style.visibility = 'inherit';
            }
            data.name.textContent = extension.displayName;
            data.identifier.textContent = extension.identifier.id;
            data.author.textContent = extension.publisherDisplayName;
            data.extensionData = node.element;
        }
        disposeTemplate(templateData) {
            templateData.extensionDisposables = (0, lifecycle_1.dispose)(templateData.extensionDisposables);
        }
    };
    ExtensionRenderer = ExtensionRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ExtensionRenderer);
    class UnknownExtensionRenderer {
        static { this.TEMPLATE_ID = 'unknown-extension-template'; }
        get templateId() {
            return UnknownExtensionRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const messageContainer = dom.append(container, dom.$('div.unknown-extension'));
            dom.append(messageContainer, dom.$('span.error-marker')).textContent = (0, nls_1.localize)('error', "Error");
            dom.append(messageContainer, dom.$('span.message')).textContent = (0, nls_1.localize)('Unknown Extension', "Unknown Extension:");
            const identifier = dom.append(messageContainer, dom.$('span.message'));
            return { identifier };
        }
        renderElement(node, index, data) {
            data.identifier.textContent = node.element.extension.identifier.id;
        }
        disposeTemplate(data) {
        }
    }
    let OpenExtensionAction = class OpenExtensionAction extends actions_1.Action {
        constructor(extensionsWorkdbenchService) {
            super('extensions.action.openExtension', '');
            this.extensionsWorkdbenchService = extensionsWorkdbenchService;
        }
        set extension(extension) {
            this._extension = extension;
        }
        run(sideByside) {
            if (this._extension) {
                return this.extensionsWorkdbenchService.open(this._extension, { sideByside });
            }
            return Promise.resolve();
        }
    };
    OpenExtensionAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], OpenExtensionAction);
    let ExtensionsTree = class ExtensionsTree extends listService_1.WorkbenchAsyncDataTree {
        constructor(input, container, overrideStyles, contextKeyService, listService, instantiationService, configurationService, extensionsWorkdbenchService) {
            const delegate = new VirualDelegate();
            const dataSource = new AsyncDataSource();
            const renderers = [instantiationService.createInstance(ExtensionRenderer), instantiationService.createInstance(UnknownExtensionRenderer)];
            const identityProvider = {
                getId({ extension, parent }) {
                    return parent ? this.getId(parent) + '/' + extension.identifier.id : extension.identifier.id;
                }
            };
            super('ExtensionsTree', container, delegate, renderers, dataSource, {
                indent: 40,
                identityProvider,
                multipleSelectionSupport: false,
                overrideStyles,
                accessibilityProvider: {
                    getAriaLabel(extensionData) {
                        return (0, extensionsViews_1.getAriaLabelForExtension)(extensionData.extension);
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('extensions', "Extensions");
                    }
                }
            }, instantiationService, contextKeyService, listService, configurationService);
            this.setInput(input);
            this.disposables.add(this.onDidChangeSelection(event => {
                if (dom.isKeyboardEvent(event.browserEvent)) {
                    extensionsWorkdbenchService.open(event.elements[0].extension, { sideByside: false });
                }
            }));
        }
    };
    exports.ExtensionsTree = ExtensionsTree;
    exports.ExtensionsTree = ExtensionsTree = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensions_1.IExtensionsWorkbenchService)
    ], ExtensionsTree);
    class ExtensionData {
        constructor(extension, parent, getChildrenExtensionIds, extensionsWorkbenchService) {
            this.extension = extension;
            this.parent = parent;
            this.getChildrenExtensionIds = getChildrenExtensionIds;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.childrenExtensionIds = this.getChildrenExtensionIds(extension);
        }
        get hasChildren() {
            return (0, arrays_1.isNonEmptyArray)(this.childrenExtensionIds);
        }
        async getChildren() {
            if (this.hasChildren) {
                const result = await getExtensions(this.childrenExtensionIds, this.extensionsWorkbenchService);
                return result.map(extension => new ExtensionData(extension, this, this.getChildrenExtensionIds, this.extensionsWorkbenchService));
            }
            return null;
        }
    }
    exports.ExtensionData = ExtensionData;
    async function getExtensions(extensions, extensionsWorkbenchService) {
        const localById = extensionsWorkbenchService.local.reduce((result, e) => { result.set(e.identifier.id.toLowerCase(), e); return result; }, new Map());
        const result = [];
        const toQuery = [];
        for (const extensionId of extensions) {
            const id = extensionId.toLowerCase();
            const local = localById.get(id);
            if (local) {
                result.push(local);
            }
            else {
                toQuery.push(id);
            }
        }
        if (toQuery.length) {
            const galleryResult = await extensionsWorkbenchService.getExtensions(toQuery.map(id => ({ id })), cancellation_1.CancellationToken.None);
            result.push(...galleryResult);
        }
        return result;
    }
    exports.getExtensions = getExtensions;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const focusBackground = theme.getColor(colorRegistry_1.listFocusBackground);
        if (focusBackground) {
            collector.addRule(`.extensions-grid-view .extension-container:focus { background-color: ${focusBackground}; outline: none; }`);
        }
        const focusForeground = theme.getColor(colorRegistry_1.listFocusForeground);
        if (focusForeground) {
            collector.addRule(`.extensions-grid-view .extension-container:focus { color: ${focusForeground}; }`);
        }
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        const editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
        if (foregroundColor && editorBackgroundColor) {
            const authorForeground = foregroundColor.transparent(.9).makeOpaque(editorBackgroundColor);
            collector.addRule(`.extensions-grid-view .extension-container:not(.disabled) .author { color: ${authorForeground}; }`);
            const disabledExtensionForeground = foregroundColor.transparent(.5).makeOpaque(editorBackgroundColor);
            collector.addRule(`.extensions-grid-view .extension-container.disabled { color: ${disabledExtensionForeground}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1ZpZXdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnNWaWV3ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJCekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQU9qRCxZQUNDLE1BQW1CLEVBQ25CLFFBQWtCLEVBQ3NCLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUZnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBR25GLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHlCQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsUUFBUSxLQUFLLG1DQUEyQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsTCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsYUFBYSxDQUFDLFVBQXdCO1lBQ3JDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVB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