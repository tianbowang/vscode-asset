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
define(["require", "exports", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/workbench/browser/labels", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/theme/common/themeService", "./util", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/base/common/resourceTree", "vs/base/common/iterator", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/comparers", "vs/base/common/filters", "vs/workbench/common/views", "vs/nls", "vs/base/common/arrays", "vs/platform/storage/common/storage", "vs/workbench/common/editor", "vs/workbench/common/theme", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/editor/common/services/model", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/instantiation/common/serviceCollection", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/colorPicker/browser/colorDetector", "vs/editor/contrib/links/browser/links", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/workbench/browser/style", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/platform/theme/common/theme", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/button/button", "vs/platform/notification/common/notification", "vs/workbench/contrib/scm/browser/scmViewService", "vs/editor/contrib/dnd/browser/dnd", "vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/editor/contrib/message/browser/messageController", "vs/platform/theme/browser/defaultStyles", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/common/services/resolverService", "vs/base/common/network", "vs/workbench/browser/dnd", "vs/platform/dnd/browser/dnd", "vs/editor/contrib/format/browser/formatActions", "vs/editor/common/config/editorOptions", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/core/editOperation", "vs/base/common/iconLabels", "vs/base/browser/ui/iconLabel/iconLabel", "vs/platform/theme/common/colorRegistry", "vs/platform/actions/browser/toolbar", "vs/base/common/cancellation", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/base/common/numbers", "vs/css!./media/scm"], function (require, exports, event_1, resources_1, lifecycle_1, viewPane_1, dom_1, scm_1, labels_1, countBadge_1, editorService_1, instantiation_1, contextView_1, contextkey_1, commands_1, keybinding_1, actions_1, actions_2, actionbar_1, themeService_1, util_1, listService_1, configuration_1, async_1, resourceTree_1, iterator_1, uri_1, files_1, comparers_1, filters_1, views_1, nls_1, arrays_1, storage_1, editor_1, theme_1, codeEditorWidget_1, simpleEditorOptions_1, model_1, editorExtensions_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, platform, strings_1, suggestController_1, snippetController2_1, serviceCollection_1, hover_1, colorDetector_1, links_1, opener_1, telemetry_1, language_1, label_1, style_1, codicons_1, themables_1, scmRepositoryRenderer_1, theme_2, editorCommands_1, menuEntryActionViewItem_1, markdownRenderer_1, button_1, notification_1, scmViewService_1, dnd_1, dropIntoEditorController_1, messageController_1, defaultStyles_1, inlineCompletionsController_1, codeActionController_1, resolverService_1, network_1, dnd_2, dnd_3, formatActions_1, editorOptions_1, uriIdentity_1, editOperation_1, iconLabels_1, iconLabel_1, colorRegistry_1, toolbar_1, cancellation_1, dropdownWithPrimaryActionViewItem_1, numbers_1) {
    "use strict";
    var ActionButtonRenderer_1, InputRenderer_1, ResourceGroupRenderer_1, ResourceRenderer_1, HistoryItemGroupRenderer_1, HistoryItemRenderer_1, HistoryItemChangeRenderer_1, SCMInputWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMActionButton = exports.SCMViewPane = exports.SCMAccessibilityProvider = exports.SCMTreeKeyboardNavigationLabelProvider = exports.SCMTreeSorter = exports.ActionButtonRenderer = void 0;
    (0, colorRegistry_1.registerColor)('scm.historyItemAdditionsForeground', {
        dark: 'gitDecoration.addedResourceForeground',
        light: 'gitDecoration.addedResourceForeground',
        hcDark: 'gitDecoration.addedResourceForeground',
        hcLight: 'gitDecoration.addedResourceForeground'
    }, (0, nls_1.localize)('scm.historyItemAdditionsForeground', "History item additions foreground color."));
    (0, colorRegistry_1.registerColor)('scm.historyItemDeletionsForeground', {
        dark: 'gitDecoration.deletedResourceForeground',
        light: 'gitDecoration.deletedResourceForeground',
        hcDark: 'gitDecoration.deletedResourceForeground',
        hcLight: 'gitDecoration.deletedResourceForeground'
    }, (0, nls_1.localize)('scm.historyItemDeletionsForeground', "History item deletions foreground color."));
    (0, colorRegistry_1.registerColor)('scm.historyItemStatisticsBorder', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.foreground, 0.2),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.foreground, 0.2),
        hcDark: (0, colorRegistry_1.transparent)(colorRegistry_1.foreground, 0.2),
        hcLight: (0, colorRegistry_1.transparent)(colorRegistry_1.foreground, 0.2)
    }, (0, nls_1.localize)('scm.historyItemStatisticsBorder', "History item statistics border color."));
    (0, colorRegistry_1.registerColor)('scm.historyItemSelectedStatisticsBorder', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.listActiveSelectionForeground, 0.2),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.listActiveSelectionForeground, 0.2),
        hcDark: (0, colorRegistry_1.transparent)(colorRegistry_1.listActiveSelectionForeground, 0.2),
        hcLight: (0, colorRegistry_1.transparent)(colorRegistry_1.listActiveSelectionForeground, 0.2)
    }, (0, nls_1.localize)('scm.historyItemSelectedStatisticsBorder', "History item selected statistics border color."));
    let ActionButtonRenderer = class ActionButtonRenderer {
        static { ActionButtonRenderer_1 = this; }
        static { this.DEFAULT_HEIGHT = 30; }
        static { this.TEMPLATE_ID = 'actionButton'; }
        get templateId() { return ActionButtonRenderer_1.TEMPLATE_ID; }
        constructor(commandService, contextMenuService, notificationService) {
            this.commandService = commandService;
            this.contextMenuService = contextMenuService;
            this.notificationService = notificationService;
            this.actionButtons = new Map();
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Use default cursor & disable hover for list item
            container.parentElement.parentElement.classList.add('cursor-default', 'force-no-hover');
            const buttonContainer = (0, dom_1.append)(container, (0, dom_1.$)('.button-container'));
            const actionButton = new SCMActionButton(buttonContainer, this.contextMenuService, this.commandService, this.notificationService);
            return { actionButton, disposable: lifecycle_1.Disposable.None, templateDisposable: actionButton };
        }
        renderElement(node, index, templateData, height) {
            templateData.disposable.dispose();
            const disposables = new lifecycle_1.DisposableStore();
            const actionButton = node.element;
            templateData.actionButton.setButton(node.element.button);
            // Remember action button
            const renderedActionButtons = this.actionButtons.get(actionButton) ?? [];
            this.actionButtons.set(actionButton, [...renderedActionButtons, templateData.actionButton]);
            disposables.add({
                dispose: () => {
                    const renderedActionButtons = this.actionButtons.get(actionButton) ?? [];
                    const renderedWidgetIndex = renderedActionButtons.findIndex(renderedActionButton => renderedActionButton === templateData.actionButton);
                    if (renderedWidgetIndex < 0) {
                        throw new Error('Disposing unknown action button');
                    }
                    if (renderedActionButtons.length === 1) {
                        this.actionButtons.delete(actionButton);
                    }
                    else {
                        renderedActionButtons.splice(renderedWidgetIndex, 1);
                    }
                }
            });
            templateData.disposable = disposables;
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        focusActionButton(actionButton) {
            this.actionButtons.get(actionButton)?.forEach(renderedActionButton => renderedActionButton.focus());
        }
        disposeElement(node, index, template) {
            template.disposable.dispose();
        }
        disposeTemplate(templateData) {
            templateData.disposable.dispose();
            templateData.templateDisposable.dispose();
        }
    };
    exports.ActionButtonRenderer = ActionButtonRenderer;
    exports.ActionButtonRenderer = ActionButtonRenderer = ActionButtonRenderer_1 = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, notification_1.INotificationService)
    ], ActionButtonRenderer);
    class SCMTreeDragAndDrop {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        getDragURI(element) {
            if ((0, util_1.isSCMResource)(element)) {
                return element.sourceUri.toString();
            }
            return null;
        }
        onDragStart(data, originalEvent) {
            const items = SCMTreeDragAndDrop.getResourcesFromDragAndDropData(data);
            if (originalEvent.dataTransfer && items?.length) {
                this.instantiationService.invokeFunction(accessor => (0, dnd_2.fillEditorsDragData)(accessor, items, originalEvent));
                const fileResources = items.filter(s => s.scheme === network_1.Schemas.file).map(r => r.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_3.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        }
        getDragLabel(elements, originalEvent) {
            if (elements.length === 1) {
                const element = elements[0];
                if ((0, util_1.isSCMResource)(element)) {
                    return (0, resources_1.basename)(element.sourceUri);
                }
            }
            return String(elements.length);
        }
        onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
            return true;
        }
        drop(data, targetElement, targetIndex, targetSector, originalEvent) { }
        static getResourcesFromDragAndDropData(data) {
            const uris = [];
            for (const element of [...data.context ?? [], ...data.elements]) {
                if ((0, util_1.isSCMResource)(element)) {
                    uris.push(element.sourceUri);
                }
            }
            return uris;
        }
        dispose() { }
    }
    let InputRenderer = class InputRenderer {
        static { InputRenderer_1 = this; }
        static { this.DEFAULT_HEIGHT = 26; }
        static { this.TEMPLATE_ID = 'input'; }
        get templateId() { return InputRenderer_1.TEMPLATE_ID; }
        constructor(outerLayout, overflowWidgetsDomNode, updateHeight, instantiationService) {
            this.outerLayout = outerLayout;
            this.overflowWidgetsDomNode = overflowWidgetsDomNode;
            this.updateHeight = updateHeight;
            this.instantiationService = instantiationService;
            this.inputWidgets = new Map();
            this.contentHeights = new WeakMap();
            this.editorSelections = new WeakMap();
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Disable hover for list item
            container.parentElement.parentElement.classList.add('force-no-hover');
            const templateDisposable = new lifecycle_1.DisposableStore();
            const inputElement = (0, dom_1.append)(container, (0, dom_1.$)('.scm-input'));
            const inputWidget = this.instantiationService.createInstance(SCMInputWidget, inputElement, this.overflowWidgetsDomNode);
            templateDisposable.add(inputWidget);
            return { inputWidget, inputWidgetHeight: InputRenderer_1.DEFAULT_HEIGHT, elementDisposables: new lifecycle_1.DisposableStore(), templateDisposable };
        }
        renderElement(node, index, templateData) {
            const input = node.element;
            templateData.inputWidget.setInput(input);
            // Remember widget
            const renderedWidgets = this.inputWidgets.get(input) ?? [];
            this.inputWidgets.set(input, [...renderedWidgets, templateData.inputWidget]);
            templateData.elementDisposables.add({
                dispose: () => {
                    const renderedWidgets = this.inputWidgets.get(input) ?? [];
                    const renderedWidgetIndex = renderedWidgets.findIndex(renderedWidget => renderedWidget === templateData.inputWidget);
                    if (renderedWidgetIndex < 0) {
                        throw new Error('Disposing unknown input widget');
                    }
                    if (renderedWidgets.length === 1) {
                        this.inputWidgets.delete(input);
                    }
                    else {
                        renderedWidgets.splice(renderedWidgetIndex, 1);
                    }
                }
            });
            // Widget cursor selections
            const selections = this.editorSelections.get(input);
            if (selections) {
                templateData.inputWidget.selections = selections;
            }
            templateData.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                const selections = templateData.inputWidget.selections;
                if (selections) {
                    this.editorSelections.set(input, selections);
                }
            }));
            // Rerender the element whenever the editor content height changes
            const onDidChangeContentHeight = () => {
                const contentHeight = templateData.inputWidget.getContentHeight();
                this.contentHeights.set(input, contentHeight);
                if (templateData.inputWidgetHeight !== contentHeight) {
                    this.updateHeight(input, contentHeight + 10);
                    templateData.inputWidgetHeight = contentHeight;
                    templateData.inputWidget.layout();
                }
            };
            const startListeningContentHeightChange = () => {
                templateData.elementDisposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
                onDidChangeContentHeight();
            };
            // Setup height change listener on next tick
            (0, async_1.disposableTimeout)(startListeningContentHeightChange, 0, templateData.elementDisposables);
            // Layout the editor whenever the outer layout happens
            const layoutEditor = () => templateData.inputWidget.layout();
            templateData.elementDisposables.add(this.outerLayout.onDidChange(layoutEditor));
            layoutEditor();
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        getHeight(input) {
            return (this.contentHeights.get(input) ?? InputRenderer_1.DEFAULT_HEIGHT) + 10;
        }
        getRenderedInputWidget(input) {
            return this.inputWidgets.get(input);
        }
        getFocusedInput() {
            for (const [input, inputWidgets] of this.inputWidgets) {
                for (const inputWidget of inputWidgets) {
                    if (inputWidget.hasFocus()) {
                        return input;
                    }
                }
            }
            return undefined;
        }
        clearValidation() {
            for (const [, inputWidgets] of this.inputWidgets) {
                for (const inputWidget of inputWidgets) {
                    inputWidget.clearValidation();
                }
            }
        }
    };
    InputRenderer = InputRenderer_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], InputRenderer);
    let ResourceGroupRenderer = class ResourceGroupRenderer {
        static { ResourceGroupRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'resource group'; }
        get templateId() { return ResourceGroupRenderer_1.TEMPLATE_ID; }
        constructor(actionViewItemProvider, scmViewService) {
            this.actionViewItemProvider = actionViewItemProvider;
            this.scmViewService = scmViewService;
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.resource-group'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const actionsContainer = (0, dom_1.append)(element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider });
            const countContainer = (0, dom_1.append)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.CountBadge(countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            const disposables = (0, lifecycle_1.combinedDisposable)(actionBar);
            return { name, count, actionBar, elementDisposables: new lifecycle_1.DisposableStore(), disposables };
        }
        renderElement(node, index, template) {
            const group = node.element;
            template.name.textContent = group.label;
            template.actionBar.clear();
            template.actionBar.context = group;
            template.count.setCount(group.resources.length);
            const menus = this.scmViewService.menus.getRepositoryMenus(group.provider);
            template.elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceGroupMenu(group), template.actionBar));
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.elementDisposables.clear();
        }
        disposeTemplate(template) {
            template.elementDisposables.dispose();
            template.disposables.dispose();
        }
    };
    ResourceGroupRenderer = ResourceGroupRenderer_1 = __decorate([
        __param(1, scm_1.ISCMViewService)
    ], ResourceGroupRenderer);
    class RepositoryPaneActionRunner extends actions_2.ActionRunner {
        constructor(getSelectedResources) {
            super();
            this.getSelectedResources = getSelectedResources;
        }
        async runAction(action, context) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return super.runAction(action, context);
            }
            const selection = this.getSelectedResources();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const args = (0, arrays_1.flatten)(actualContext.map(e => resourceTree_1.ResourceTree.isResourceNode(e) ? resourceTree_1.ResourceTree.collect(e) : [e]));
            await action.run(...args);
        }
    }
    let ResourceRenderer = class ResourceRenderer {
        static { ResourceRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'resource'; }
        get templateId() { return ResourceRenderer_1.TEMPLATE_ID; }
        constructor(viewMode, labels, actionViewItemProvider, actionRunner, labelService, scmViewService, themeService) {
            this.viewMode = viewMode;
            this.labels = labels;
            this.actionViewItemProvider = actionViewItemProvider;
            this.actionRunner = actionRunner;
            this.labelService = labelService;
            this.scmViewService = scmViewService;
            this.themeService = themeService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.renderedResources = new Map();
            themeService.onDidColorThemeChange(this.onDidColorThemeChange, this, this.disposables);
        }
        renderTemplate(container) {
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.resource'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const actionsContainer = (0, dom_1.append)(fileLabel.element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: this.actionViewItemProvider,
                actionRunner: this.actionRunner
            });
            const decorationIcon = (0, dom_1.append)(element, (0, dom_1.$)('.decoration-icon'));
            const actionBarMenuListener = new lifecycle_1.MutableDisposable();
            const disposables = (0, lifecycle_1.combinedDisposable)(actionBar, fileLabel, actionBarMenuListener);
            return { element, name, fileLabel, decorationIcon, actionBar, actionBarMenu: undefined, actionBarMenuListener, elementDisposables: new lifecycle_1.DisposableStore(), disposables };
        }
        renderElement(node, index, template) {
            const resourceOrFolder = node.element;
            const iconResource = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
            const uri = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
            const fileKind = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const tooltip = !resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || '';
            const hidePath = this.viewMode() === "tree" /* ViewMode.Tree */;
            let matches;
            let descriptionMatches;
            let strikethrough;
            if (resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder)) {
                if (resourceOrFolder.element) {
                    const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
                    this._renderActionBar(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder.element));
                    template.element.classList.toggle('faded', resourceOrFolder.element.decorations.faded);
                    strikethrough = resourceOrFolder.element.decorations.strikeThrough;
                }
                else {
                    const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.context.provider);
                    this._renderActionBar(template, resourceOrFolder, menus.getResourceFolderMenu(resourceOrFolder.context));
                    matches = (0, filters_1.createMatches)(node.filterData);
                    template.element.classList.remove('faded');
                }
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
                this._renderActionBar(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder));
                [matches, descriptionMatches] = this._processFilterData(uri, node.filterData);
                template.element.classList.toggle('faded', resourceOrFolder.decorations.faded);
                strikethrough = resourceOrFolder.decorations.strikeThrough;
            }
            const renderedData = {
                tooltip, uri, fileLabelOptions: { hidePath, fileKind, matches, descriptionMatches, strikethrough }, iconResource
            };
            this.renderIcon(template, renderedData);
            this.renderedResources.set(template, renderedData);
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => this.renderedResources.delete(template)));
            template.element.setAttribute('data-tooltip', tooltip);
        }
        disposeElement(resource, index, template) {
            template.elementDisposables.clear();
        }
        renderCompressedElements(node, index, template, height) {
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name);
            const fileKind = files_1.FileKind.FOLDER;
            const matches = (0, filters_1.createMatches)(node.filterData);
            template.fileLabel.setResource({ resource: folder.uri, name: label }, {
                fileDecorations: { colors: false, badges: true },
                fileKind,
                matches,
                separator: this.labelService.getSeparator(folder.uri.scheme)
            });
            const menus = this.scmViewService.menus.getRepositoryMenus(folder.context.provider);
            this._renderActionBar(template, folder, menus.getResourceFolderMenu(folder.context));
            template.name.classList.remove('strike-through');
            template.element.classList.remove('faded');
            template.decorationIcon.style.display = 'none';
            template.decorationIcon.style.backgroundImage = '';
            template.element.setAttribute('data-tooltip', '');
        }
        disposeCompressedElements(node, index, template, height) {
            template.elementDisposables.clear();
        }
        disposeTemplate(template) {
            template.elementDisposables.dispose();
            template.disposables.dispose();
        }
        _renderActionBar(template, resourceOrFolder, menu) {
            if (!template.actionBarMenu || template.actionBarMenu !== menu) {
                template.actionBar.clear();
                template.actionBarMenu = menu;
                template.actionBarMenuListener.value = (0, util_1.connectPrimaryMenuToInlineActionBar)(menu, template.actionBar);
            }
            template.actionBar.context = resourceOrFolder;
        }
        _processFilterData(uri, filterData) {
            if (!filterData) {
                return [undefined, undefined];
            }
            if (!filterData.label) {
                const matches = (0, filters_1.createMatches)(filterData);
                return [matches, undefined];
            }
            const fileName = (0, resources_1.basename)(uri);
            const label = filterData.label;
            const pathLength = label.length - fileName.length;
            const matches = (0, filters_1.createMatches)(filterData.score);
            // FileName match
            if (label === fileName) {
                return [matches, undefined];
            }
            // FilePath match
            const labelMatches = [];
            const descriptionMatches = [];
            for (const match of matches) {
                if (match.start > pathLength) {
                    // Label match
                    labelMatches.push({
                        start: match.start - pathLength,
                        end: match.end - pathLength
                    });
                }
                else if (match.end < pathLength) {
                    // Description match
                    descriptionMatches.push(match);
                }
                else {
                    // Spanning match
                    labelMatches.push({
                        start: 0,
                        end: match.end - pathLength
                    });
                    descriptionMatches.push({
                        start: match.start,
                        end: pathLength
                    });
                }
            }
            return [labelMatches, descriptionMatches];
        }
        onDidColorThemeChange() {
            for (const [template, data] of this.renderedResources) {
                this.renderIcon(template, data);
            }
        }
        renderIcon(template, data) {
            const theme = this.themeService.getColorTheme();
            const icon = theme.type === theme_2.ColorScheme.LIGHT ? data.iconResource?.decorations.icon : data.iconResource?.decorations.iconDark;
            template.fileLabel.setFile(data.uri, {
                ...data.fileLabelOptions,
                fileDecorations: { colors: false, badges: !icon },
            });
            if (icon) {
                if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                    template.decorationIcon.className = `decoration-icon ${themables_1.ThemeIcon.asClassName(icon)}`;
                    if (icon.color) {
                        template.decorationIcon.style.color = theme.getColor(icon.color.id)?.toString() ?? '';
                    }
                    template.decorationIcon.style.display = '';
                    template.decorationIcon.style.backgroundImage = '';
                }
                else {
                    template.decorationIcon.className = 'decoration-icon';
                    template.decorationIcon.style.color = '';
                    template.decorationIcon.style.display = '';
                    template.decorationIcon.style.backgroundImage = (0, dom_1.asCSSUrl)(icon);
                }
                template.decorationIcon.title = data.tooltip;
            }
            else {
                template.decorationIcon.className = 'decoration-icon';
                template.decorationIcon.style.color = '';
                template.decorationIcon.style.display = 'none';
                template.decorationIcon.style.backgroundImage = '';
                template.decorationIcon.title = '';
            }
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    ResourceRenderer = ResourceRenderer_1 = __decorate([
        __param(4, label_1.ILabelService),
        __param(5, scm_1.ISCMViewService),
        __param(6, themeService_1.IThemeService)
    ], ResourceRenderer);
    class HistoryItemGroupActionRunner extends actions_2.ActionRunner {
        runAction(action, context) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return super.runAction(action, context);
            }
            return action.run(context.repository.provider, context.id);
        }
    }
    let HistoryItemGroupRenderer = class HistoryItemGroupRenderer {
        static { HistoryItemGroupRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'history-item-group'; }
        get templateId() { return HistoryItemGroupRenderer_1.TEMPLATE_ID; }
        constructor(actionRunner, contextKeyService, contextMenuService, keybindingService, menuService, scmViewService, telemetryService) {
            this.actionRunner = actionRunner;
            this.contextKeyService = contextKeyService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.menuService = menuService;
            this.scmViewService = scmViewService;
            this.telemetryService = telemetryService;
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.history-item-group'));
            const label = new iconLabel_1.IconLabel(element, { supportIcons: true });
            const iconContainer = (0, dom_1.prepend)(label.element, (0, dom_1.$)('.icon-container'));
            const templateDisposables = new lifecycle_1.DisposableStore();
            const toolBar = new toolbar_1.WorkbenchToolBar((0, dom_1.append)(element, (0, dom_1.$)('.actions')), { actionRunner: this.actionRunner, menuOptions: { shouldForwardArgs: true } }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.telemetryService);
            templateDisposables.add(toolBar);
            const countContainer = (0, dom_1.append)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.CountBadge(countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            return { iconContainer, label, toolBar, count, elementDisposables: new lifecycle_1.DisposableStore(), templateDisposables };
        }
        renderElement(node, index, templateData, height) {
            const historyItemGroup = node.element;
            templateData.iconContainer.className = 'icon-container';
            if (historyItemGroup.icon && themables_1.ThemeIcon.isThemeIcon(historyItemGroup.icon)) {
                templateData.iconContainer.classList.add(...themables_1.ThemeIcon.asClassNameArray(historyItemGroup.icon));
            }
            templateData.label.setLabel(historyItemGroup.label, historyItemGroup.description, { title: historyItemGroup.ariaLabel });
            templateData.count.setCount(historyItemGroup.count ?? 0);
            const repositoryMenus = this.scmViewService.menus.getRepositoryMenus(historyItemGroup.repository.provider);
            const historyProviderMenu = repositoryMenus.historyProviderMenu;
            if (historyProviderMenu) {
                const menuId = historyItemGroup.direction === 'incoming' ? actions_1.MenuId.SCMIncomingChanges : actions_1.MenuId.SCMOutgoingChanges;
                const menu = historyItemGroup.direction === 'incoming' ? historyProviderMenu.incomingHistoryItemGroupMenu : historyProviderMenu.outgoingHistoryItemGroupMenu;
                templateData.elementDisposables.add((0, util_1.connectPrimaryMenu)(menu, (primary, secondary) => {
                    templateData.toolBar.setActions(primary, secondary, [menuId]);
                }));
                templateData.toolBar.context = historyItemGroup;
            }
            else {
                templateData.toolBar.setActions([], []);
                templateData.toolBar.context = undefined;
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(node, index, templateData, height) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.elementDisposables.dispose();
            templateData.templateDisposables.dispose();
        }
    };
    HistoryItemGroupRenderer = HistoryItemGroupRenderer_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, actions_1.IMenuService),
        __param(5, scm_1.ISCMViewService),
        __param(6, telemetry_1.ITelemetryService)
    ], HistoryItemGroupRenderer);
    class HistoryItemActionRunner extends actions_2.ActionRunner {
        async runAction(action, context) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return super.runAction(action, context);
            }
            const args = [];
            args.push(context.historyItemGroup.repository.provider);
            args.push({
                id: context.id,
                parentIds: context.parentIds,
                label: context.label,
                description: context.description,
                icon: context.icon,
                timestamp: context.timestamp,
                statistics: context.statistics,
            });
            await action.run(...args);
        }
    }
    let HistoryItemRenderer = class HistoryItemRenderer {
        static { HistoryItemRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'history-item'; }
        get templateId() { return HistoryItemRenderer_1.TEMPLATE_ID; }
        constructor(actionRunner, actionViewItemProvider, scmViewService) {
            this.actionRunner = actionRunner;
            this.actionViewItemProvider = actionViewItemProvider;
            this.scmViewService = scmViewService;
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.history-item'));
            const iconLabel = new iconLabel_1.IconLabel(element, { supportIcons: true });
            const iconContainer = (0, dom_1.prepend)(iconLabel.element, (0, dom_1.$)('.icon-container'));
            const disposables = new lifecycle_1.DisposableStore();
            const actionsContainer = (0, dom_1.append)(element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, { actionRunner: this.actionRunner, actionViewItemProvider: this.actionViewItemProvider });
            disposables.add(actionBar);
            const statsContainer = (0, dom_1.append)(element, (0, dom_1.$)('.stats-container'));
            const filesLabel = (0, dom_1.append)(statsContainer, (0, dom_1.$)('.files-label'));
            const insertionsLabel = (0, dom_1.append)(statsContainer, (0, dom_1.$)('.insertions-label'));
            const deletionsLabel = (0, dom_1.append)(statsContainer, (0, dom_1.$)('.deletions-label'));
            return { iconContainer, label: iconLabel, actionBar, statsContainer, filesLabel, insertionsLabel, deletionsLabel, elementDisposables: new lifecycle_1.DisposableStore(), disposables };
        }
        renderElement(node, index, templateData, height) {
            const historyItem = node.element;
            templateData.iconContainer.className = 'icon-container';
            if (historyItem.icon && themables_1.ThemeIcon.isThemeIcon(historyItem.icon)) {
                templateData.iconContainer.classList.add(...themables_1.ThemeIcon.asClassNameArray(historyItem.icon));
            }
            templateData.label.setLabel(historyItem.label, historyItem.description);
            templateData.actionBar.clear();
            templateData.actionBar.context = historyItem;
            const menus = this.scmViewService.menus.getRepositoryMenus(historyItem.historyItemGroup.repository.provider);
            if (menus.historyProviderMenu) {
                const historyItemMenu = menus.historyProviderMenu.getHistoryItemMenu(historyItem);
                templateData.elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(historyItemMenu, templateData.actionBar));
            }
            this.renderStatistics(node, index, templateData, height);
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible');
        }
        renderStatistics(node, index, templateData, height) {
            const historyItem = node.element;
            if (historyItem.statistics) {
                const statsAriaLabel = [
                    historyItem.statistics.files === 1 ?
                        (0, nls_1.localize)('fileChanged', "{0} file changed", historyItem.statistics.files) :
                        (0, nls_1.localize)('filesChanged', "{0} files changed", historyItem.statistics.files),
                    historyItem.statistics.insertions === 1 ? (0, nls_1.localize)('insertion', "{0} insertion{1}", historyItem.statistics.insertions, '(+)') :
                        historyItem.statistics.insertions > 1 ? (0, nls_1.localize)('insertions', "{0} insertions{1}", historyItem.statistics.insertions, '(+)') : '',
                    historyItem.statistics.deletions === 1 ? (0, nls_1.localize)('deletion', "{0} deletion{1}", historyItem.statistics.deletions, '(-)') :
                        historyItem.statistics.deletions > 1 ? (0, nls_1.localize)('deletions', "{0} deletions{1}", historyItem.statistics.deletions, '(-)') : ''
                ];
                const statsTitle = statsAriaLabel
                    .filter(l => l !== '').join(', ');
                templateData.statsContainer.title = statsTitle;
                templateData.statsContainer.setAttribute('aria-label', statsTitle);
                templateData.filesLabel.textContent = historyItem.statistics.files.toString();
                templateData.insertionsLabel.textContent = historyItem.statistics.insertions > 0 ? `+${historyItem.statistics.insertions}` : '';
                templateData.insertionsLabel.classList.toggle('hidden', historyItem.statistics.insertions === 0);
                templateData.deletionsLabel.textContent = historyItem.statistics.deletions > 0 ? `-${historyItem.statistics.deletions}` : '';
                templateData.deletionsLabel.classList.toggle('hidden', historyItem.statistics.deletions === 0);
            }
            templateData.statsContainer.classList.toggle('hidden', historyItem.statistics === undefined);
        }
        disposeElement(element, index, templateData, height) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    HistoryItemRenderer = HistoryItemRenderer_1 = __decorate([
        __param(2, scm_1.ISCMViewService)
    ], HistoryItemRenderer);
    let HistoryItemChangeRenderer = class HistoryItemChangeRenderer {
        static { HistoryItemChangeRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'historyItemChange'; }
        get templateId() { return HistoryItemChangeRenderer_1.TEMPLATE_ID; }
        constructor(viewMode, labels, labelService) {
            this.viewMode = viewMode;
            this.labels = labels;
            this.labelService = labelService;
        }
        renderTemplate(container) {
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.change'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const decorationIcon = (0, dom_1.append)(element, (0, dom_1.$)('.decoration-icon'));
            return { element, name, fileLabel, decorationIcon, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(node, index, templateData, height) {
            const historyItemChangeOrFolder = node.element;
            const uri = resourceTree_1.ResourceTree.isResourceNode(historyItemChangeOrFolder) ? historyItemChangeOrFolder.element?.uri ?? historyItemChangeOrFolder.uri : historyItemChangeOrFolder.uri;
            const fileKind = resourceTree_1.ResourceTree.isResourceNode(historyItemChangeOrFolder) ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const hidePath = this.viewMode() === "tree" /* ViewMode.Tree */;
            templateData.fileLabel.setFile(uri, { fileDecorations: { colors: false, badges: true }, fileKind, hidePath, });
        }
        renderCompressedElements(node, index, templateData, height) {
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name);
            templateData.fileLabel.setResource({ resource: folder.uri, name: label }, {
                fileDecorations: { colors: false, badges: true },
                fileKind: files_1.FileKind.FOLDER,
                separator: this.labelService.getSeparator(folder.uri.scheme)
            });
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    HistoryItemChangeRenderer = HistoryItemChangeRenderer_1 = __decorate([
        __param(2, label_1.ILabelService)
    ], HistoryItemChangeRenderer);
    class SeparatorRenderer {
        static { this.TEMPLATE_ID = 'separator'; }
        get templateId() { return SeparatorRenderer.TEMPLATE_ID; }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Use default cursor & disable hover for list item
            container.parentElement.parentElement.classList.add('cursor-default', 'force-no-hover');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.separator-container'));
            const label = new iconLabel_1.IconLabel(element, { supportIcons: true, });
            (0, dom_1.append)(element, (0, dom_1.$)('.separator'));
            return { label, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(element, index, templateData, height) {
            templateData.label.setLabel(element.element.label, undefined, { title: element.element.ariaLabel });
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeTemplate(templateData) {
            throw new Error('Method not implemented.');
        }
    }
    class ListDelegate {
        constructor(inputRenderer) {
            this.inputRenderer = inputRenderer;
        }
        getHeight(element) {
            if ((0, util_1.isSCMInput)(element)) {
                return this.inputRenderer.getHeight(element);
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return ActionButtonRenderer.DEFAULT_HEIGHT + 10;
            }
            else {
                return 22;
            }
        }
        getTemplateId(element) {
            if ((0, util_1.isSCMRepository)(element)) {
                return scmRepositoryRenderer_1.RepositoryRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return InputRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return ActionButtonRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return ResourceGroupRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMResource)(element) || (0, util_1.isSCMResourceNode)(element)) {
                return ResourceRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(element)) {
                return HistoryItemGroupRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMHistoryItemTreeElement)(element)) {
                return HistoryItemRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMHistoryItemChangeTreeElement)(element) || (0, util_1.isSCMHistoryItemChangeNode)(element)) {
                return HistoryItemChangeRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMViewSeparator)(element)) {
                return SeparatorRenderer.TEMPLATE_ID;
            }
            else {
                throw new Error('Unknown element');
            }
        }
    }
    class SCMTreeCompressionDelegate {
        isIncompressible(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return element.childrenCount === 0 || !element.parent || !element.parent.parent;
            }
            return true;
        }
    }
    class SCMTreeFilter {
        filter(element) {
            if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.resources.length > 0 || !element.hideWhenEmpty;
            }
            else {
                return true;
            }
        }
    }
    class SCMTreeSorter {
        constructor(viewMode, viewSortKey) {
            this.viewMode = viewMode;
            this.viewSortKey = viewSortKey;
        }
        compare(one, other) {
            if ((0, util_1.isSCMRepository)(one)) {
                if (!(0, util_1.isSCMRepository)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            if ((0, util_1.isSCMInput)(one)) {
                return -1;
            }
            else if ((0, util_1.isSCMInput)(other)) {
                return 1;
            }
            if ((0, util_1.isSCMActionButton)(one)) {
                return -1;
            }
            else if ((0, util_1.isSCMActionButton)(other)) {
                return 1;
            }
            if ((0, util_1.isSCMResourceGroup)(one)) {
                return (0, util_1.isSCMResourceGroup)(other) ? 0 : -1;
            }
            if ((0, util_1.isSCMViewSeparator)(one)) {
                return (0, util_1.isSCMResourceGroup)(other) ? 1 : -1;
            }
            if ((0, util_1.isSCMHistoryItemGroupTreeElement)(one)) {
                return (0, util_1.isSCMHistoryItemGroupTreeElement)(other) ? 0 : 1;
            }
            if ((0, util_1.isSCMHistoryItemTreeElement)(one)) {
                if (!(0, util_1.isSCMHistoryItemTreeElement)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            if ((0, util_1.isSCMHistoryItemChangeTreeElement)(one) || (0, util_1.isSCMHistoryItemChangeNode)(one)) {
                // List
                if (this.viewMode() === "list" /* ViewMode.List */) {
                    if (!(0, util_1.isSCMHistoryItemChangeTreeElement)(other)) {
                        throw new Error('Invalid comparison');
                    }
                    return (0, comparers_1.comparePaths)(one.uri.fsPath, other.uri.fsPath);
                }
                // Tree
                if (!(0, util_1.isSCMHistoryItemChangeTreeElement)(other) && !(0, util_1.isSCMHistoryItemChangeNode)(other)) {
                    throw new Error('Invalid comparison');
                }
                const oneName = (0, util_1.isSCMHistoryItemChangeNode)(one) ? one.name : (0, resources_1.basename)(one.uri);
                const otherName = (0, util_1.isSCMHistoryItemChangeNode)(other) ? other.name : (0, resources_1.basename)(other.uri);
                return (0, comparers_1.compareFileNames)(oneName, otherName);
            }
            // Resource (List)
            if (this.viewMode() === "list" /* ViewMode.List */) {
                // FileName
                if (this.viewSortKey() === "name" /* ViewSortKey.Name */) {
                    const oneName = (0, resources_1.basename)(one.sourceUri);
                    const otherName = (0, resources_1.basename)(other.sourceUri);
                    return (0, comparers_1.compareFileNames)(oneName, otherName);
                }
                // Status
                if (this.viewSortKey() === "status" /* ViewSortKey.Status */) {
                    const oneTooltip = one.decorations.tooltip ?? '';
                    const otherTooltip = other.decorations.tooltip ?? '';
                    if (oneTooltip !== otherTooltip) {
                        return (0, strings_1.compare)(oneTooltip, otherTooltip);
                    }
                }
                // Path (default)
                const onePath = one.sourceUri.fsPath;
                const otherPath = other.sourceUri.fsPath;
                return (0, comparers_1.comparePaths)(onePath, otherPath);
            }
            // Resource (Tree)
            const oneIsDirectory = resourceTree_1.ResourceTree.isResourceNode(one);
            const otherIsDirectory = resourceTree_1.ResourceTree.isResourceNode(other);
            if (oneIsDirectory !== otherIsDirectory) {
                return oneIsDirectory ? -1 : 1;
            }
            const oneName = resourceTree_1.ResourceTree.isResourceNode(one) ? one.name : (0, resources_1.basename)(one.sourceUri);
            const otherName = resourceTree_1.ResourceTree.isResourceNode(other) ? other.name : (0, resources_1.basename)(other.sourceUri);
            return (0, comparers_1.compareFileNames)(oneName, otherName);
        }
    }
    exports.SCMTreeSorter = SCMTreeSorter;
    let SCMTreeKeyboardNavigationLabelProvider = class SCMTreeKeyboardNavigationLabelProvider {
        constructor(viewMode, labelService) {
            this.viewMode = viewMode;
            this.labelService = labelService;
        }
        getKeyboardNavigationLabel(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return element.name;
            }
            else if ((0, util_1.isSCMRepository)(element) || (0, util_1.isSCMInput)(element) || (0, util_1.isSCMActionButton)(element)) {
                return undefined;
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.label;
            }
            else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(element)) {
                return element.label;
            }
            else if ((0, util_1.isSCMHistoryItemTreeElement)(element)) {
                return element.label;
            }
            else if ((0, util_1.isSCMViewSeparator)(element)) {
                return element.label;
            }
            else {
                if (this.viewMode() === "list" /* ViewMode.List */) {
                    // In List mode match using the file name and the path.
                    // Since we want to match both on the file name and the
                    // full path we return an array of labels. A match in the
                    // file name takes precedence over a match in the path.
                    const uri = (0, util_1.isSCMResource)(element) ? element.sourceUri : element.uri;
                    return [(0, resources_1.basename)(uri), this.labelService.getUriLabel(uri, { relative: true })];
                }
                else {
                    // In Tree mode only match using the file name
                    return (0, resources_1.basename)((0, util_1.isSCMResource)(element) ? element.sourceUri : element.uri);
                }
            }
        }
        getCompressedNodeKeyboardNavigationLabel(elements) {
            const folders = elements;
            return folders.map(e => e.name).join('/');
        }
    };
    exports.SCMTreeKeyboardNavigationLabelProvider = SCMTreeKeyboardNavigationLabelProvider;
    exports.SCMTreeKeyboardNavigationLabelProvider = SCMTreeKeyboardNavigationLabelProvider = __decorate([
        __param(1, label_1.ILabelService)
    ], SCMTreeKeyboardNavigationLabelProvider);
    function getSCMResourceId(element) {
        if ((0, util_1.isSCMRepository)(element)) {
            const provider = element.provider;
            return `repo:${provider.id}`;
        }
        else if ((0, util_1.isSCMInput)(element)) {
            const provider = element.repository.provider;
            return `input:${provider.id}`;
        }
        else if ((0, util_1.isSCMActionButton)(element)) {
            const provider = element.repository.provider;
            return `actionButton:${provider.id}`;
        }
        else if ((0, util_1.isSCMResourceGroup)(element)) {
            const provider = element.provider;
            return `resourceGroup:${provider.id}/${element.id}`;
        }
        else if ((0, util_1.isSCMResource)(element)) {
            const group = element.resourceGroup;
            const provider = group.provider;
            return `resource:${provider.id}/${group.id}/${element.sourceUri.toString()}`;
        }
        else if ((0, util_1.isSCMResourceNode)(element)) {
            const group = element.context;
            return `folder:${group.provider.id}/${group.id}/$FOLDER/${element.uri.toString()}`;
        }
        else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(element)) {
            const provider = element.repository.provider;
            return `historyItemGroup:${provider.id}/${element.id}`;
        }
        else if ((0, util_1.isSCMHistoryItemTreeElement)(element)) {
            const historyItemGroup = element.historyItemGroup;
            const provider = historyItemGroup.repository.provider;
            return `historyItem:${provider.id}/${historyItemGroup.id}/${element.id}/${element.parentIds.join(',')}`;
        }
        else if ((0, util_1.isSCMHistoryItemChangeTreeElement)(element)) {
            const historyItem = element.historyItem;
            const historyItemGroup = historyItem.historyItemGroup;
            const provider = historyItemGroup.repository.provider;
            return `historyItemChange:${provider.id}/${historyItemGroup.id}/${historyItem.id}/${element.uri.toString()}`;
        }
        else if ((0, util_1.isSCMHistoryItemChangeNode)(element)) {
            const historyItem = element.context;
            const historyItemGroup = historyItem.historyItemGroup;
            const provider = historyItemGroup.repository.provider;
            return `folder:${provider.id}/${historyItemGroup.id}/${historyItem.id}/$FOLDER/${element.uri.toString()}`;
        }
        else if ((0, util_1.isSCMViewSeparator)(element)) {
            const provider = element.repository.provider;
            return `separator:${provider.id}`;
        }
        else {
            throw new Error('Invalid tree element');
        }
    }
    class SCMResourceIdentityProvider {
        getId(element) {
            return getSCMResourceId(element);
        }
    }
    let SCMAccessibilityProvider = class SCMAccessibilityProvider {
        constructor(labelService) {
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('scm', "Source Control Management");
        }
        getAriaLabel(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return this.labelService.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
            }
            else if ((0, util_1.isSCMRepository)(element)) {
                return `${element.provider.name} ${element.provider.label}`;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return (0, nls_1.localize)('input', "Source Control Input");
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return element.button?.command.title ?? '';
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.label;
            }
            else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(element)) {
                return element.ariaLabel ?? `${element.label.trim()}${element.description ? `, ${element.description}` : ''}`;
            }
            else if ((0, util_1.isSCMHistoryItemTreeElement)(element)) {
                return `${(0, iconLabels_1.stripIcons)(element.label).trim()}${element.description ? `, ${element.description}` : ''}`;
            }
            else if ((0, util_1.isSCMHistoryItemChangeTreeElement)(element)) {
                const result = [(0, resources_1.basename)(element.uri)];
                const path = this.labelService.getUriLabel((0, resources_1.dirname)(element.uri), { relative: true, noPrefix: true });
                if (path) {
                    result.push(path);
                }
                return result.join(', ');
            }
            else if ((0, util_1.isSCMViewSeparator)(element)) {
                return element.ariaLabel ?? element.label;
            }
            else {
                const result = [];
                result.push((0, resources_1.basename)(element.sourceUri));
                if (element.decorations.tooltip) {
                    result.push(element.decorations.tooltip);
                }
                const path = this.labelService.getUriLabel((0, resources_1.dirname)(element.sourceUri), { relative: true, noPrefix: true });
                if (path) {
                    result.push(path);
                }
                return result.join(', ');
            }
        }
    };
    exports.SCMAccessibilityProvider = SCMAccessibilityProvider;
    exports.SCMAccessibilityProvider = SCMAccessibilityProvider = __decorate([
        __param(0, label_1.ILabelService)
    ], SCMAccessibilityProvider);
    var ViewMode;
    (function (ViewMode) {
        ViewMode["List"] = "list";
        ViewMode["Tree"] = "tree";
    })(ViewMode || (ViewMode = {}));
    var ViewSortKey;
    (function (ViewSortKey) {
        ViewSortKey["Path"] = "path";
        ViewSortKey["Name"] = "name";
        ViewSortKey["Status"] = "status";
    })(ViewSortKey || (ViewSortKey = {}));
    const Menus = {
        ViewSort: new actions_1.MenuId('SCMViewSort'),
        Repositories: new actions_1.MenuId('SCMRepositories'),
    };
    const ContextKeys = {
        SCMViewMode: new contextkey_1.RawContextKey('scmViewMode', "list" /* ViewMode.List */),
        SCMViewSortKey: new contextkey_1.RawContextKey('scmViewSortKey', "path" /* ViewSortKey.Path */),
        SCMViewAreAllRepositoriesCollapsed: new contextkey_1.RawContextKey('scmViewAreAllRepositoriesCollapsed', false),
        SCMViewIsAnyRepositoryCollapsible: new contextkey_1.RawContextKey('scmViewIsAnyRepositoryCollapsible', false),
        SCMProvider: new contextkey_1.RawContextKey('scmProvider', undefined),
        SCMProviderRootUri: new contextkey_1.RawContextKey('scmProviderRootUri', undefined),
        SCMProviderHasRootUri: new contextkey_1.RawContextKey('scmProviderHasRootUri', undefined),
        RepositoryCount: new contextkey_1.RawContextKey('scmRepositoryCount', 0),
        RepositoryVisibilityCount: new contextkey_1.RawContextKey('scmRepositoryVisibleCount', 0),
        RepositoryVisibility(repository) {
            return new contextkey_1.RawContextKey(`scmRepositoryVisible:${repository.provider.id}`, false);
        }
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMTitle, {
        title: (0, nls_1.localize)('sortAction', "View & Sort"),
        submenu: Menus.ViewSort,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0)),
        group: '0_view&sort'
    });
    actions_1.MenuRegistry.appendMenuItem(Menus.ViewSort, {
        title: (0, nls_1.localize)('repositories', "Repositories"),
        submenu: Menus.Repositories,
        group: '0_repositories'
    });
    class RepositoryVisibilityAction extends actions_1.Action2 {
        constructor(repository) {
            super({
                id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
                title: repository.provider.name,
                f1: false,
                precondition: contextkey_1.ContextKeyExpr.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
                toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
                menu: { id: Menus.Repositories, group: '0_repositories' }
            });
            this.repository = repository;
        }
        run(accessor) {
            const scmViewService = accessor.get(scm_1.ISCMViewService);
            scmViewService.toggleVisibility(this.repository);
        }
    }
    let RepositoryVisibilityActionController = class RepositoryVisibilityActionController {
        constructor(contextKeyService, scmViewService, scmService) {
            this.contextKeyService = contextKeyService;
            this.scmViewService = scmViewService;
            this.items = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryCountContextKey = ContextKeys.RepositoryCount.bindTo(contextKeyService);
            this.repositoryVisibilityCountContextKey = ContextKeys.RepositoryVisibilityCount.bindTo(contextKeyService);
            scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
            scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
            for (const repository of scmService.repositories) {
                this.onDidAddRepository(repository);
            }
        }
        onDidAddRepository(repository) {
            const action = (0, actions_1.registerAction2)(class extends RepositoryVisibilityAction {
                constructor() {
                    super(repository);
                }
            });
            const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.contextKeyService);
            contextKey.set(this.scmViewService.isVisible(repository));
            this.items.set(repository, {
                contextKey,
                dispose() {
                    contextKey.reset();
                    action.dispose();
                }
            });
            this.updateRepositoryContextKeys();
        }
        onDidRemoveRepository(repository) {
            this.items.get(repository)?.dispose();
            this.items.delete(repository);
            this.updateRepositoryContextKeys();
        }
        onDidChangeVisibleRepositories() {
            let count = 0;
            for (const [repository, item] of this.items) {
                const isVisible = this.scmViewService.isVisible(repository);
                item.contextKey.set(isVisible);
                if (isVisible) {
                    count++;
                }
            }
            this.repositoryCountContextKey.set(this.items.size);
            this.repositoryVisibilityCountContextKey.set(count);
        }
        updateRepositoryContextKeys() {
            this.repositoryCountContextKey.set(this.items.size);
            this.repositoryVisibilityCountContextKey.set(iterator_1.Iterable.reduce(this.items.keys(), (r, repository) => r + (this.scmViewService.isVisible(repository) ? 1 : 0), 0));
        }
        dispose() {
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.items.values());
            this.items.clear();
        }
    };
    RepositoryVisibilityActionController = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, scm_1.ISCMViewService),
        __param(2, scm_1.ISCMService)
    ], RepositoryVisibilityActionController);
    class SetListViewModeAction extends viewPane_1.ViewAction {
        constructor(id = 'workbench.scm.action.setListViewMode', menu = {}) {
            super({
                id,
                title: (0, nls_1.localize)('setListViewMode', "View as List"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.listTree,
                toggled: ContextKeys.SCMViewMode.isEqualTo("list" /* ViewMode.List */),
                menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
            });
        }
        async runInView(_, view) {
            view.viewMode = "list" /* ViewMode.List */;
        }
    }
    class SetListViewModeNavigationAction extends SetListViewModeAction {
        constructor() {
            super('workbench.scm.action.setListViewModeNavigation', {
                id: actions_1.MenuId.SCMTitle,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.SCMViewMode.isEqualTo("tree" /* ViewMode.Tree */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    class SetTreeViewModeAction extends viewPane_1.ViewAction {
        constructor(id = 'workbench.scm.action.setTreeViewMode', menu = {}) {
            super({
                id,
                title: (0, nls_1.localize)('setTreeViewMode', "View as Tree"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.listFlat,
                toggled: ContextKeys.SCMViewMode.isEqualTo("tree" /* ViewMode.Tree */),
                menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
            });
        }
        async runInView(_, view) {
            view.viewMode = "tree" /* ViewMode.Tree */;
        }
    }
    class SetTreeViewModeNavigationAction extends SetTreeViewModeAction {
        constructor() {
            super('workbench.scm.action.setTreeViewModeNavigation', {
                id: actions_1.MenuId.SCMTitle,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.SCMViewMode.isEqualTo("list" /* ViewMode.List */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    (0, actions_1.registerAction2)(SetListViewModeAction);
    (0, actions_1.registerAction2)(SetTreeViewModeAction);
    (0, actions_1.registerAction2)(SetListViewModeNavigationAction);
    (0, actions_1.registerAction2)(SetTreeViewModeNavigationAction);
    class RepositorySortAction extends viewPane_1.ViewAction {
        constructor(sortKey, title) {
            super({
                id: `workbench.scm.action.repositories.setSortKey.${sortKey}`,
                title,
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                toggled: scmViewService_1.RepositoryContextKeys.RepositorySortKey.isEqualTo(sortKey),
                menu: [
                    {
                        id: Menus.Repositories,
                        group: '1_sort'
                    },
                    {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyExpr.equals('view', scm_1.REPOSITORIES_VIEW_PANE_ID),
                        group: '1_sort',
                    },
                ]
            });
            this.sortKey = sortKey;
        }
        runInView(accessor) {
            accessor.get(scm_1.ISCMViewService).toggleSortKey(this.sortKey);
        }
    }
    class RepositorySortByDiscoveryTimeAction extends RepositorySortAction {
        constructor() {
            super("discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */, (0, nls_1.localize)('repositorySortByDiscoveryTime', "Sort by Discovery Time"));
        }
    }
    class RepositorySortByNameAction extends RepositorySortAction {
        constructor() {
            super("name" /* ISCMRepositorySortKey.Name */, (0, nls_1.localize)('repositorySortByName', "Sort by Name"));
        }
    }
    class RepositorySortByPathAction extends RepositorySortAction {
        constructor() {
            super("path" /* ISCMRepositorySortKey.Path */, (0, nls_1.localize)('repositorySortByPath', "Sort by Path"));
        }
    }
    (0, actions_1.registerAction2)(RepositorySortByDiscoveryTimeAction);
    (0, actions_1.registerAction2)(RepositorySortByNameAction);
    (0, actions_1.registerAction2)(RepositorySortByPathAction);
    class SetSortKeyAction extends viewPane_1.ViewAction {
        constructor(sortKey, title) {
            super({
                id: `workbench.scm.action.setSortKey.${sortKey}`,
                title,
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                toggled: ContextKeys.SCMViewSortKey.isEqualTo(sortKey),
                precondition: ContextKeys.SCMViewMode.isEqualTo("list" /* ViewMode.List */),
                menu: { id: Menus.ViewSort, group: '2_sort' }
            });
            this.sortKey = sortKey;
        }
        async runInView(_, view) {
            view.viewSortKey = this.sortKey;
        }
    }
    class SetSortByNameAction extends SetSortKeyAction {
        constructor() {
            super("name" /* ViewSortKey.Name */, (0, nls_1.localize)('sortChangesByName', "Sort Changes by Name"));
        }
    }
    class SetSortByPathAction extends SetSortKeyAction {
        constructor() {
            super("path" /* ViewSortKey.Path */, (0, nls_1.localize)('sortChangesByPath', "Sort Changes by Path"));
        }
    }
    class SetSortByStatusAction extends SetSortKeyAction {
        constructor() {
            super("status" /* ViewSortKey.Status */, (0, nls_1.localize)('sortChangesByStatus', "Sort Changes by Status"));
        }
    }
    (0, actions_1.registerAction2)(SetSortByNameAction);
    (0, actions_1.registerAction2)(SetSortByPathAction);
    (0, actions_1.registerAction2)(SetSortByStatusAction);
    class CollapseAllRepositoriesAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.scm.action.collapseAllRepositories`,
                title: (0, nls_1.localize)('collapse all', "Collapse All Repositories"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.SCMViewIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.SCMViewAreAllRepositoriesCollapsed.isEqualTo(false))
                }
            });
        }
        async runInView(_, view) {
            view.collapseAllRepositories();
        }
    }
    class ExpandAllRepositoriesAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.scm.action.expandAllRepositories`,
                title: (0, nls_1.localize)('expand all', "Expand All Repositories"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.expandAll,
                menu: {
                    id: actions_1.MenuId.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.SCMViewIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.SCMViewAreAllRepositoriesCollapsed.isEqualTo(true))
                }
            });
        }
        async runInView(_, view) {
            view.expandAllRepositories();
        }
    }
    (0, actions_1.registerAction2)(CollapseAllRepositoriesAction);
    (0, actions_1.registerAction2)(ExpandAllRepositoriesAction);
    var SCMInputWidgetCommandId;
    (function (SCMInputWidgetCommandId) {
        SCMInputWidgetCommandId["CancelAction"] = "scm.input.cancelAction";
    })(SCMInputWidgetCommandId || (SCMInputWidgetCommandId = {}));
    var SCMInputWidgetStorageKey;
    (function (SCMInputWidgetStorageKey) {
        SCMInputWidgetStorageKey["LastActionId"] = "scm.input.lastActionId";
    })(SCMInputWidgetStorageKey || (SCMInputWidgetStorageKey = {}));
    let SCMInputWidgetActionRunner = class SCMInputWidgetActionRunner extends actions_2.ActionRunner {
        get runningActions() { return this._runningActions; }
        constructor(input, storageService) {
            super();
            this.input = input;
            this.storageService = storageService;
            this._runningActions = new Set();
        }
        async runAction(action) {
            try {
                // Cancel previous action
                if (this.runningActions.size !== 0) {
                    this._cts?.cancel();
                    if (action.id === "scm.input.cancelAction" /* SCMInputWidgetCommandId.CancelAction */) {
                        return;
                    }
                }
                // Create action context
                const context = [];
                for (const group of this.input.repository.provider.groups) {
                    context.push({
                        resourceGroupId: group.id,
                        resources: [...group.resources.map(r => r.sourceUri)]
                    });
                }
                // Run action
                this._runningActions.add(action);
                this._cts = new cancellation_1.CancellationTokenSource();
                await action.run(...[this.input.repository.provider.rootUri, context, this._cts.token]);
            }
            finally {
                this._runningActions.delete(action);
                // Save last action
                if (this._runningActions.size === 0) {
                    this.storageService.store("scm.input.lastActionId" /* SCMInputWidgetStorageKey.LastActionId */, action.id, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                }
            }
        }
    };
    SCMInputWidgetActionRunner = __decorate([
        __param(1, storage_1.IStorageService)
    ], SCMInputWidgetActionRunner);
    let SCMInputWidgetToolbar = class SCMInputWidgetToolbar extends toolbar_1.WorkbenchToolBar {
        get dropdownActions() { return this._dropdownActions; }
        get dropdownAction() { return this._dropdownAction; }
        constructor(container, options, menuService, contextKeyService, contextMenuService, commandService, keybindingService, storageService, telemetryService) {
            super(container, { resetMenu: actions_1.MenuId.SCMInputBox, ...options }, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService);
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.storageService = storageService;
            this._dropdownActions = [];
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.repositoryDisposables = new lifecycle_1.DisposableStore();
            this._dropdownAction = new actions_2.Action('scmInputMoreActions', (0, nls_1.localize)('scmInputMoreActions', "More Actions..."), 'codicon-chevron-down');
            this._cancelAction = new actions_1.MenuItemAction({
                id: "scm.input.cancelAction" /* SCMInputWidgetCommandId.CancelAction */,
                title: (0, nls_1.localize)('scmInputCancelAction', "Cancel"),
                icon: codicons_1.Codicon.debugStop,
            }, undefined, undefined, undefined, contextKeyService, commandService);
        }
        setInput(input) {
            this.repositoryDisposables.clear();
            const contextKeyService = this.contextKeyService.createOverlay([
                ['scmProvider', input.repository.provider.contextValue],
                ['scmProviderRootUri', input.repository.provider.rootUri?.toString()],
                ['scmProviderHasRootUri', !!input.repository.provider.rootUri]
            ]);
            const menu = this.repositoryDisposables.add(this.menuService.createMenu(actions_1.MenuId.SCMInputBox, contextKeyService, { emitEventsForSubmenuChanges: true }));
            const isEnabled = () => {
                return input.repository.provider.groups.some(g => g.resources.length > 0);
            };
            const updateToolbar = () => {
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, actions);
                for (const action of actions) {
                    action.enabled = isEnabled();
                }
                this._dropdownAction.enabled = isEnabled();
                let primaryAction = undefined;
                if (actions.length === 1) {
                    primaryAction = actions[0];
                }
                else if (actions.length > 1) {
                    const lastActionId = this.storageService.get("scm.input.lastActionId" /* SCMInputWidgetStorageKey.LastActionId */, 0 /* StorageScope.PROFILE */, '');
                    primaryAction = actions.find(a => a.id === lastActionId) ?? actions[0];
                }
                this._dropdownActions = actions.length === 1 ? [] : actions;
                super.setActions(primaryAction ? [primaryAction] : [], []);
                this._onDidChange.fire();
            };
            this.repositoryDisposables.add(menu.onDidChange(() => updateToolbar()));
            this.repositoryDisposables.add(input.repository.provider.onDidChangeResources(() => updateToolbar()));
            this.repositoryDisposables.add(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, "scm.input.lastActionId" /* SCMInputWidgetStorageKey.LastActionId */, this.repositoryDisposables)(() => updateToolbar()));
            this.actionRunner = new SCMInputWidgetActionRunner(input, this.storageService);
            this.repositoryDisposables.add(this.actionRunner.onWillRun(e => {
                if (this.actionRunner.runningActions.size === 0) {
                    super.setActions([this._cancelAction], []);
                    this._onDidChange.fire();
                }
            }));
            this.repositoryDisposables.add(this.actionRunner.onDidRun(e => {
                if (this.actionRunner.runningActions.size === 0) {
                    updateToolbar();
                }
            }));
            updateToolbar();
        }
    };
    SCMInputWidgetToolbar = __decorate([
        __param(2, actions_1.IMenuService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, commands_1.ICommandService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, storage_1.IStorageService),
        __param(8, telemetry_1.ITelemetryService)
    ], SCMInputWidgetToolbar);
    class SCMInputWidgetEditorOptions {
        constructor(overflowWidgetsDomNode, configurationService) {
            this.overflowWidgetsDomNode = overflowWidgetsDomNode;
            this.configurationService = configurationService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.defaultInputFontFamily = style_1.DEFAULT_FONT_FAMILY;
            this._disposables = new lifecycle_1.DisposableStore();
            const onDidChangeConfiguration = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => {
                return e.affectsConfiguration('editor.accessibilitySupport') ||
                    e.affectsConfiguration('editor.cursorBlinking') ||
                    e.affectsConfiguration('editor.fontFamily') ||
                    e.affectsConfiguration('editor.rulers') ||
                    e.affectsConfiguration('editor.wordWrap') ||
                    e.affectsConfiguration('scm.inputFontFamily') ||
                    e.affectsConfiguration('scm.inputFontSize');
            }, this._disposables);
            this._disposables.add(onDidChangeConfiguration(() => this._onDidChange.fire()));
        }
        getEditorConstructionOptions() {
            const fontFamily = this._getEditorFontFamily();
            const fontSize = this._getEditorFontSize();
            const lineHeight = this._getEditorLineHeight(fontSize);
            return {
                ...(0, simpleEditorOptions_1.getSimpleEditorOptions)(this.configurationService),
                ...this._getEditorLanguageConfiguration(),
                cursorWidth: 1,
                dragAndDrop: true,
                dropIntoEditor: { enabled: true },
                fontFamily: fontFamily,
                fontSize: fontSize,
                formatOnType: true,
                lineDecorationsWidth: 6,
                lineHeight: lineHeight,
                overflowWidgetsDomNode: this.overflowWidgetsDomNode,
                padding: { top: 2, bottom: 2 },
                quickSuggestions: false,
                renderWhitespace: 'none',
                scrollbar: {
                    alwaysConsumeMouseWheel: false,
                    vertical: 'hidden'
                },
                wrappingIndent: 'none',
                wrappingStrategy: 'advanced',
            };
        }
        getEditorOptions() {
            const fontFamily = this._getEditorFontFamily();
            const fontSize = this._getEditorFontSize();
            const lineHeight = this._getEditorLineHeight(fontSize);
            const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
            const cursorBlinking = this.configurationService.getValue('editor.cursorBlinking');
            return { ...this._getEditorLanguageConfiguration(), accessibilitySupport, cursorBlinking, fontFamily, fontSize, lineHeight };
        }
        _getEditorFontFamily() {
            const inputFontFamily = this.configurationService.getValue('scm.inputFontFamily').trim();
            if (inputFontFamily.toLowerCase() === 'editor') {
                return this.configurationService.getValue('editor.fontFamily').trim();
            }
            if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== 'default') {
                return inputFontFamily;
            }
            return this.defaultInputFontFamily;
        }
        _getEditorFontSize() {
            return this.configurationService.getValue('scm.inputFontSize');
        }
        _getEditorLanguageConfiguration() {
            // editor.rulers
            const rulersConfig = this.configurationService.inspect('editor.rulers', { overrideIdentifier: 'scminput' });
            const rulers = rulersConfig.overrideIdentifiers?.includes('scminput') ? editorOptions_1.EditorOptions.rulers.validate(rulersConfig.value) : [];
            // editor.wordWrap
            const wordWrapConfig = this.configurationService.inspect('editor.wordWrap', { overrideIdentifier: 'scminput' });
            const wordWrap = wordWrapConfig.overrideIdentifiers?.includes('scminput') ? editorOptions_1.EditorOptions.wordWrap.validate(wordWrapConfig.value) : 'on';
            return { rulers, wordWrap };
        }
        _getEditorLineHeight(fontSize) {
            return Math.round(fontSize * 1.5);
        }
        dispose() {
            this._disposables.dispose();
        }
    }
    let SCMInputWidget = class SCMInputWidget {
        static { SCMInputWidget_1 = this; }
        static { this.ValidationTimeouts = {
            [2 /* InputValidationType.Information */]: 5000,
            [1 /* InputValidationType.Warning */]: 8000,
            [0 /* InputValidationType.Error */]: 10000
        }; }
        get input() {
            return this.model?.input;
        }
        async setInput(input) {
            if (input === this.input) {
                return;
            }
            this.clearValidation();
            this.element.classList.remove('synthetic-focus');
            this.repositoryDisposables.clear();
            this.repositoryIdContextKey.set(input?.repository.id);
            if (!input) {
                this.model?.textModelRef?.dispose();
                this.inputEditor.setModel(undefined);
                this.model = undefined;
                return;
            }
            const uri = input.repository.provider.inputBoxDocumentUri;
            if (this.configurationService.getValue('editor.wordBasedSuggestions', { resource: uri }) !== 'off') {
                this.configurationService.updateValue('editor.wordBasedSuggestions', 'off', { resource: uri }, 8 /* ConfigurationTarget.MEMORY */);
            }
            const modelValue = { input, textModelRef: undefined };
            // Save model
            this.model = modelValue;
            const modelRef = await this.textModelService.createModelReference(uri);
            // Model has been changed in the meantime
            if (this.model !== modelValue) {
                modelRef.dispose();
                return;
            }
            modelValue.textModelRef = modelRef;
            const textModel = modelRef.object.textEditorModel;
            this.inputEditor.setModel(textModel);
            // Validation
            const validationDelayer = new async_1.ThrottledDelayer(200);
            const validate = async () => {
                const position = this.inputEditor.getSelection()?.getStartPosition();
                const offset = position && textModel.getOffsetAt(position);
                const value = textModel.getValue();
                this.setValidation(await input.validateInput(value, offset || 0));
            };
            const triggerValidation = () => validationDelayer.trigger(validate);
            this.repositoryDisposables.add(validationDelayer);
            this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
            // Adaptive indentation rules
            const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
            const onEnter = event_1.Event.filter(this.inputEditor.onKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */, this.repositoryDisposables);
            this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
            // Keep model in sync with API
            textModel.setValue(input.value);
            this.repositoryDisposables.add(input.onDidChange(({ value, reason }) => {
                const currentValue = textModel.getValue();
                if (value === currentValue) { // circuit breaker
                    return;
                }
                textModel.pushStackElement();
                textModel.pushEditOperations(null, [editOperation_1.EditOperation.replaceMove(textModel.getFullModelRange(), value)], () => []);
                const position = reason === scm_1.SCMInputChangeReason.HistoryPrevious
                    ? textModel.getFullModelRange().getStartPosition()
                    : textModel.getFullModelRange().getEndPosition();
                this.inputEditor.setPosition(position);
                this.inputEditor.revealPositionInCenterIfOutsideViewport(position);
            }));
            this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
            this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
            this.repositoryDisposables.add(input.onDidChangeValidateInput((e) => triggerValidation()));
            // Keep API in sync with model, update placeholder visibility and validate
            const updatePlaceholderVisibility = () => this.placeholderTextContainer.classList.toggle('hidden', textModel.getValueLength() > 0);
            this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
                input.setValue(textModel.getValue(), true);
                updatePlaceholderVisibility();
                triggerValidation();
            }));
            updatePlaceholderVisibility();
            // Update placeholder text
            const updatePlaceholderText = () => {
                const binding = this.keybindingService.lookupKeybinding('scm.acceptInput');
                const label = binding ? binding.getLabel() : (platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter');
                const placeholderText = (0, strings_1.format)(input.placeholder, label);
                this.inputEditor.updateOptions({ ariaLabel: placeholderText });
                this.placeholderTextContainer.textContent = placeholderText;
            };
            this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
            this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
            updatePlaceholderText();
            // Update input template
            let commitTemplate = '';
            const updateTemplate = () => {
                if (typeof input.repository.provider.commitTemplate === 'undefined' || !input.visible) {
                    return;
                }
                const oldCommitTemplate = commitTemplate;
                commitTemplate = input.repository.provider.commitTemplate;
                const value = textModel.getValue();
                if (value && value !== oldCommitTemplate) {
                    return;
                }
                textModel.setValue(commitTemplate);
            };
            this.repositoryDisposables.add(input.repository.provider.onDidChangeCommitTemplate(updateTemplate, this));
            updateTemplate();
            // Update input enablement
            const updateEnablement = (enabled) => {
                this.inputEditor.updateOptions({ readOnly: !enabled });
            };
            this.repositoryDisposables.add(input.onDidChangeEnablement(enabled => updateEnablement(enabled)));
            updateEnablement(input.enabled);
            // Toolbar
            this.toolbar.setInput(input);
        }
        get selections() {
            return this.inputEditor.getSelections();
        }
        set selections(selections) {
            if (selections) {
                this.inputEditor.setSelections(selections);
            }
        }
        setValidation(validation, options) {
            if (this._validationTimer) {
                clearTimeout(this._validationTimer);
                this._validationTimer = 0;
            }
            this.validation = validation;
            this.renderValidation();
            if (options?.focus && !this.hasFocus()) {
                this.focus();
            }
            if (validation && options?.timeout) {
                this._validationTimer = setTimeout(() => this.setValidation(undefined), SCMInputWidget_1.ValidationTimeouts[validation.type]);
            }
        }
        constructor(container, overflowWidgetsDomNode, contextKeyService, modelService, textModelService, keybindingService, configurationService, instantiationService, scmViewService, contextViewService, openerService, contextMenuService) {
            this.modelService = modelService;
            this.textModelService = textModelService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.scmViewService = scmViewService;
            this.contextViewService = contextViewService;
            this.openerService = openerService;
            this.contextMenuService = contextMenuService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryDisposables = new lifecycle_1.DisposableStore();
            this.validationDisposable = lifecycle_1.Disposable.None;
            this.validationHasFocus = false;
            // This is due to "Setup height change listener on next tick" above
            // https://github.com/microsoft/vscode/issues/108067
            this.lastLayoutWasTrash = false;
            this.shouldFocusAfterLayout = false;
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('.scm-editor'));
            this.editorContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('.scm-editor-container'));
            this.placeholderTextContainer = (0, dom_1.append)(this.editorContainer, (0, dom_1.$)('.scm-editor-placeholder'));
            this.toolbarContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('.scm-editor-toolbar'));
            this.contextKeyService = contextKeyService.createScoped(this.element);
            this.repositoryIdContextKey = this.contextKeyService.createKey('scmRepository', undefined);
            this.inputEditorOptions = new SCMInputWidgetEditorOptions(overflowWidgetsDomNode, this.configurationService);
            this.disposables.add(this.inputEditorOptions.onDidChange(this.onDidChangeEditorOptions, this));
            this.disposables.add(this.inputEditorOptions);
            const editorConstructionOptions = this.inputEditorOptions.getEditorConstructionOptions();
            this.setPlaceholderFontStyles(editorConstructionOptions.fontFamily, editorConstructionOptions.fontSize, editorConstructionOptions.lineHeight);
            const codeEditorWidgetOptions = {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    colorDetector_1.ColorDetector.ID,
                    contextmenu_1.ContextMenuController.ID,
                    dnd_1.DragAndDropController.ID,
                    dropIntoEditorController_1.DropIntoEditorController.ID,
                    links_1.LinkDetector.ID,
                    menuPreventer_1.MenuPreventer.ID,
                    messageController_1.MessageController.ID,
                    hover_1.HoverController.ID,
                    selectionClipboard_1.SelectionClipboardContributionID,
                    snippetController2_1.SnippetController2.ID,
                    suggestController_1.SuggestController.ID,
                    inlineCompletionsController_1.InlineCompletionsController.ID,
                    codeActionController_1.CodeActionController.ID,
                    formatActions_1.FormatOnType.ID
                ])
            };
            const services = new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]);
            const instantiationService2 = instantiationService.createChild(services);
            this.inputEditor = instantiationService2.createInstance(codeEditorWidget_1.CodeEditorWidget, this.editorContainer, editorConstructionOptions, codeEditorWidgetOptions);
            this.disposables.add(this.inputEditor);
            this.disposables.add(this.inputEditor.onDidFocusEditorText(() => {
                if (this.input?.repository) {
                    this.scmViewService.focus(this.input.repository);
                }
                this.element.classList.add('synthetic-focus');
                this.renderValidation();
            }));
            this.disposables.add(this.inputEditor.onDidBlurEditorText(() => {
                this.element.classList.remove('synthetic-focus');
                setTimeout(() => {
                    if (!this.validation || !this.validationHasFocus) {
                        this.clearValidation();
                    }
                }, 0);
            }));
            const firstLineKey = this.contextKeyService.createKey('scmInputIsInFirstPosition', false);
            const lastLineKey = this.contextKeyService.createKey('scmInputIsInLastPosition', false);
            this.disposables.add(this.inputEditor.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.inputEditor._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
                lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
            }));
            this.disposables.add(this.inputEditor.onDidScrollChange(e => {
                this.toolbarContainer.classList.toggle('scroll-decoration', e.scrollTop > 0);
            }));
            event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.showInputActionButton'))(() => this.layout(), this, this.disposables);
            this.onDidChangeContentHeight = event_1.Event.signal(event_1.Event.filter(this.inputEditor.onDidContentSizeChange, e => e.contentHeightChanged, this.disposables));
            // Toolbar
            this.toolbar = instantiationService2.createInstance(SCMInputWidgetToolbar, this.toolbarContainer, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction && this.toolbar.dropdownActions.length > 1) {
                        return instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, action, this.toolbar.dropdownAction, this.toolbar.dropdownActions, '', this.contextMenuService, { actionRunner: this.toolbar.actionRunner });
                    }
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(instantiationService, action);
                },
                menuOptions: {
                    shouldForwardArgs: true
                }
            });
            this.disposables.add(this.toolbar.onDidChange(() => this.layout()));
            this.disposables.add(this.toolbar);
        }
        getContentHeight() {
            const lineHeight = this.inputEditor.getOption(66 /* EditorOption.lineHeight */);
            const { top, bottom } = this.inputEditor.getOption(83 /* EditorOption.padding */);
            const inputMinLinesConfig = this.configurationService.getValue('scm.inputMinLineCount');
            const inputMinLines = typeof inputMinLinesConfig === 'number' ? (0, numbers_1.clamp)(inputMinLinesConfig, 1, 50) : 1;
            const editorMinHeight = inputMinLines * lineHeight + top + bottom;
            const inputMaxLinesConfig = this.configurationService.getValue('scm.inputMaxLineCount');
            const inputMaxLines = typeof inputMaxLinesConfig === 'number' ? (0, numbers_1.clamp)(inputMaxLinesConfig, 1, 50) : 10;
            const editorMaxHeight = inputMaxLines * lineHeight + top + bottom;
            return (0, numbers_1.clamp)(this.inputEditor.getContentHeight(), editorMinHeight, editorMaxHeight);
        }
        layout() {
            const editorHeight = this.getContentHeight();
            const toolbarWidth = this.getToolbarWidth();
            const dimension = new dom_1.Dimension(this.element.clientWidth - toolbarWidth, editorHeight);
            if (dimension.width < 0) {
                this.lastLayoutWasTrash = true;
                return;
            }
            this.lastLayoutWasTrash = false;
            this.inputEditor.layout(dimension);
            this.placeholderTextContainer.style.width = `${dimension.width}px`;
            this.renderValidation();
            const showInputActionButton = this.configurationService.getValue('scm.showInputActionButton') === true;
            this.toolbarContainer.classList.toggle('hidden', !showInputActionButton || this.toolbar?.isEmpty() === true);
            if (this.shouldFocusAfterLayout) {
                this.shouldFocusAfterLayout = false;
                this.focus();
            }
        }
        focus() {
            if (this.lastLayoutWasTrash) {
                this.lastLayoutWasTrash = false;
                this.shouldFocusAfterLayout = true;
                return;
            }
            this.inputEditor.focus();
            this.element.classList.add('synthetic-focus');
        }
        hasFocus() {
            return this.inputEditor.hasTextFocus();
        }
        onDidChangeEditorOptions() {
            const editorOptions = this.inputEditorOptions.getEditorOptions();
            this.inputEditor.updateOptions(editorOptions);
            this.setPlaceholderFontStyles(editorOptions.fontFamily, editorOptions.fontSize, editorOptions.lineHeight);
        }
        renderValidation() {
            this.clearValidation();
            this.element.classList.toggle('validation-info', this.validation?.type === 2 /* InputValidationType.Information */);
            this.element.classList.toggle('validation-warning', this.validation?.type === 1 /* InputValidationType.Warning */);
            this.element.classList.toggle('validation-error', this.validation?.type === 0 /* InputValidationType.Error */);
            if (!this.validation || !this.inputEditor.hasTextFocus()) {
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            this.validationDisposable = this.contextViewService.showContextView({
                getAnchor: () => this.element,
                render: container => {
                    this.element.style.borderBottomLeftRadius = '0';
                    this.element.style.borderBottomRightRadius = '0';
                    const validationContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-editor-validation-container'));
                    validationContainer.classList.toggle('validation-info', this.validation.type === 2 /* InputValidationType.Information */);
                    validationContainer.classList.toggle('validation-warning', this.validation.type === 1 /* InputValidationType.Warning */);
                    validationContainer.classList.toggle('validation-error', this.validation.type === 0 /* InputValidationType.Error */);
                    validationContainer.style.width = `${this.element.clientWidth + 2}px`;
                    const element = (0, dom_1.append)(validationContainer, (0, dom_1.$)('.scm-editor-validation'));
                    const message = this.validation.message;
                    if (typeof message === 'string') {
                        element.textContent = message;
                    }
                    else {
                        const tracker = (0, dom_1.trackFocus)(element);
                        disposables.add(tracker);
                        disposables.add(tracker.onDidFocus(() => (this.validationHasFocus = true)));
                        disposables.add(tracker.onDidBlur(() => {
                            this.validationHasFocus = false;
                            this.element.style.borderBottomLeftRadius = '2px';
                            this.element.style.borderBottomRightRadius = '2px';
                            this.contextViewService.hideContextView();
                        }));
                        const renderer = disposables.add(this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {}));
                        const renderedMarkdown = renderer.render(message, {
                            actionHandler: {
                                callback: (link) => {
                                    (0, markdownRenderer_1.openLinkFromMarkdown)(this.openerService, link, message.isTrusted);
                                    this.element.style.borderBottomLeftRadius = '2px';
                                    this.element.style.borderBottomRightRadius = '2px';
                                    this.contextViewService.hideContextView();
                                },
                                disposables: disposables
                            },
                        });
                        disposables.add(renderedMarkdown);
                        element.appendChild(renderedMarkdown.element);
                    }
                    const actionsContainer = (0, dom_1.append)(validationContainer, (0, dom_1.$)('.scm-editor-validation-actions'));
                    const actionbar = new actionbar_1.ActionBar(actionsContainer);
                    const action = new actions_2.Action('scmInputWidget.validationMessage.close', (0, nls_1.localize)('label.close', "Close"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close), true, () => {
                        this.contextViewService.hideContextView();
                        this.element.style.borderBottomLeftRadius = '2px';
                        this.element.style.borderBottomRightRadius = '2px';
                    });
                    disposables.add(actionbar);
                    actionbar.push(action, { icon: true, label: false });
                    return lifecycle_1.Disposable.None;
                },
                onHide: () => {
                    this.validationHasFocus = false;
                    this.element.style.borderBottomLeftRadius = '2px';
                    this.element.style.borderBottomRightRadius = '2px';
                    disposables.dispose();
                },
                anchorAlignment: 0 /* AnchorAlignment.LEFT */
            });
        }
        getToolbarWidth() {
            const showInputActionButton = this.configurationService.getValue('scm.showInputActionButton');
            if (!this.toolbar || !showInputActionButton || this.toolbar?.isEmpty() === true) {
                return 0;
            }
            return this.toolbar.dropdownActions.length === 0 ?
                26 /* 22px action + 4px margin */ :
                39 /* 35px action + 4px margin */;
        }
        setPlaceholderFontStyles(fontFamily, fontSize, lineHeight) {
            this.placeholderTextContainer.style.fontFamily = fontFamily;
            this.placeholderTextContainer.style.fontSize = `${fontSize}px`;
            this.placeholderTextContainer.style.lineHeight = `${lineHeight}px`;
        }
        clearValidation() {
            this.validationDisposable.dispose();
            this.validationHasFocus = false;
        }
        dispose() {
            this.setInput(undefined);
            this.repositoryDisposables.dispose();
            this.clearValidation();
            this.disposables.dispose();
        }
    };
    SCMInputWidget = SCMInputWidget_1 = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, model_1.IModelService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, scm_1.ISCMViewService),
        __param(9, contextView_1.IContextViewService),
        __param(10, opener_1.IOpenerService),
        __param(11, contextView_1.IContextMenuService)
    ], SCMInputWidget);
    let SCMViewPane = class SCMViewPane extends viewPane_1.ViewPane {
        get viewMode() { return this._viewMode; }
        set viewMode(mode) {
            if (this._viewMode === mode) {
                return;
            }
            this._viewMode = mode;
            // Update sort key based on view mode
            this.viewSortKey = this.getViewSortKey();
            this.updateChildren();
            this.onDidActiveEditorChange();
            this._onDidChangeViewMode.fire(mode);
            this.viewModeContextKey.set(mode);
            this.updateIndentStyles(this.themeService.getFileIconTheme());
            this.storageService.store(`scm.viewMode`, mode, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        get viewSortKey() { return this._viewSortKey; }
        set viewSortKey(sortKey) {
            if (this._viewSortKey === sortKey) {
                return;
            }
            this._viewSortKey = sortKey;
            this.updateChildren();
            this.viewSortKeyContextKey.set(sortKey);
            this._onDidChangeViewSortKey.fire(sortKey);
            if (this._viewMode === "list" /* ViewMode.List */) {
                this.storageService.store(`scm.viewSortKey`, sortKey, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            }
        }
        constructor(options, commandService, editorService, menuService, scmService, scmViewService, storageService, uriIdentityService, keybindingService, themeService, contextMenuService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, telemetryService) {
            super({ ...options, titleMenuId: actions_1.MenuId.SCMTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.commandService = commandService;
            this.editorService = editorService;
            this.menuService = menuService;
            this.scmService = scmService;
            this.scmViewService = scmViewService;
            this.storageService = storageService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeViewMode = new event_1.Emitter();
            this.onDidChangeViewMode = this._onDidChangeViewMode.event;
            this._onDidChangeViewSortKey = new event_1.Emitter();
            this.onDidChangeViewSortKey = this._onDidChangeViewSortKey.event;
            this.items = new lifecycle_1.DisposableMap();
            this.visibilityDisposables = new lifecycle_1.DisposableStore();
            this.treeOperationSequencer = new async_1.Sequencer();
            this.revealResourceThrottler = new async_1.Throttler();
            this.updateChildrenThrottler = new async_1.Throttler();
            this.disposables = new lifecycle_1.DisposableStore();
            // View mode and sort key
            this._viewMode = this.getViewMode();
            this._viewSortKey = this.getViewSortKey();
            // Context Keys
            this.viewModeContextKey = ContextKeys.SCMViewMode.bindTo(contextKeyService);
            this.viewModeContextKey.set(this._viewMode);
            this.viewSortKeyContextKey = ContextKeys.SCMViewSortKey.bindTo(contextKeyService);
            this.viewSortKeyContextKey.set(this.viewSortKey);
            this.areAllRepositoriesCollapsedContextKey = ContextKeys.SCMViewAreAllRepositoriesCollapsed.bindTo(contextKeyService);
            this.isAnyRepositoryCollapsibleContextKey = ContextKeys.SCMViewIsAnyRepositoryCollapsible.bindTo(contextKeyService);
            this.scmProviderContextKey = ContextKeys.SCMProvider.bindTo(contextKeyService);
            this.scmProviderRootUriContextKey = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
            this.scmProviderHasRootUriContextKey = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
            this._onDidLayout = new event_1.Emitter();
            this.layoutCache = { height: undefined, width: undefined, onDidChange: this._onDidLayout.event };
            this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, this.disposables)(e => {
                switch (e.key) {
                    case 'scm.viewMode':
                        this.viewMode = this.getViewMode();
                        break;
                    case 'scm.viewSortKey':
                        this.viewSortKey = this.getViewSortKey();
                        break;
                }
            }, this, this.disposables);
            this.storageService.onWillSaveState(e => {
                this.viewMode = this.getViewMode();
                this.viewSortKey = this.getViewSortKey();
                this.storeTreeViewState();
            }, this, this.disposables);
            this.disposables.add(this.instantiationService.createInstance(ScmInputContentProvider));
            event_1.Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository)(() => this._onDidChangeViewWelcomeState.fire(), this, this.disposables);
            this.disposables.add(this.revealResourceThrottler);
            this.disposables.add(this.updateChildrenThrottler);
        }
        layoutBody(height = this.layoutCache.height, width = this.layoutCache.width) {
            if (height === undefined) {
                return;
            }
            if (width !== undefined) {
                super.layoutBody(height, width);
            }
            this.layoutCache.height = height;
            this.layoutCache.width = width;
            this._onDidLayout.fire();
            this.treeContainer.style.height = `${height}px`;
            this.tree.layout(height, width);
        }
        renderBody(container) {
            super.renderBody(container);
            // Tree
            this.treeContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-view.show-file-icons'));
            this.treeContainer.classList.add('file-icon-themable-tree');
            this.treeContainer.classList.add('show-file-icons');
            const updateActionsVisibility = () => this.treeContainer.classList.toggle('show-actions', this.configurationService.getValue('scm.alwaysShowActions'));
            event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowActions'), this.disposables)(updateActionsVisibility, this, this.disposables);
            updateActionsVisibility();
            const updateProviderCountVisibility = () => {
                const value = this.configurationService.getValue('scm.providerCountBadge');
                this.treeContainer.classList.toggle('hide-provider-counts', value === 'hidden');
                this.treeContainer.classList.toggle('auto-provider-counts', value === 'auto');
            };
            event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.providerCountBadge'), this.disposables)(updateProviderCountVisibility, this, this.disposables);
            updateProviderCountVisibility();
            const viewState = this.loadTreeViewState();
            this.createTree(this.treeContainer, viewState);
            this.onDidChangeBodyVisibility(async (visible) => {
                if (visible) {
                    await this.tree.setInput(this.scmViewService, viewState);
                    event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowRepositories'), this.visibilityDisposables)(() => {
                        this.updateActions();
                        this.updateChildren();
                    }, this, this.visibilityDisposables);
                    event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.inputMinLineCount') ||
                        e.affectsConfiguration('scm.inputMaxLineCount') ||
                        e.affectsConfiguration('scm.showActionButton') ||
                        e.affectsConfiguration('scm.showChangesSummary') ||
                        e.affectsConfiguration('scm.showIncomingChanges') ||
                        e.affectsConfiguration('scm.showOutgoingChanges'), this.visibilityDisposables)(() => this.updateChildren(), this, this.visibilityDisposables);
                    // Add visible repositories
                    this.editorService.onDidActiveEditorChange(this.onDidActiveEditorChange, this, this.visibilityDisposables);
                    this.scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.visibilityDisposables);
                    this.onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: iterator_1.Iterable.empty() });
                    // Restore scroll position
                    if (typeof this.treeScrollTop === 'number') {
                        this.tree.scrollTop = this.treeScrollTop;
                        this.treeScrollTop = undefined;
                    }
                }
                else {
                    this.visibilityDisposables.clear();
                    this.onDidChangeVisibleRepositories({ added: iterator_1.Iterable.empty(), removed: [...this.items.keys()] });
                    this.treeScrollTop = this.tree.scrollTop;
                }
                this.updateRepositoryCollapseAllContextKeys();
            }, this, this.disposables);
            this.disposables.add(this.instantiationService.createInstance(RepositoryVisibilityActionController));
            this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this, this.disposables);
            this.updateIndentStyles(this.themeService.getFileIconTheme());
        }
        createTree(container, viewState) {
            const overflowWidgetsDomNode = (0, dom_1.$)('.scm-overflow-widgets-container.monaco-editor');
            this.inputRenderer = this.instantiationService.createInstance(InputRenderer, this.layoutCache, overflowWidgetsDomNode, (input, height) => { this.tree.updateElementHeight(input, height); });
            this.actionButtonRenderer = this.instantiationService.createInstance(ActionButtonRenderer);
            this.listLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.disposables.add(this.listLabels);
            const resourceActionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
            resourceActionRunner.onWillRun(() => this.tree.domFocus(), this, this.disposables);
            this.disposables.add(resourceActionRunner);
            const historyItemGroupActionRunner = new HistoryItemGroupActionRunner();
            historyItemGroupActionRunner.onWillRun(() => this.tree.domFocus(), this, this.disposables);
            this.disposables.add(historyItemGroupActionRunner);
            const historyItemActionRunner = new HistoryItemActionRunner();
            historyItemActionRunner.onWillRun(() => this.tree.domFocus(), this, this.disposables);
            this.disposables.add(historyItemActionRunner);
            const treeDataSource = this.instantiationService.createInstance(SCMTreeDataSource, () => this.viewMode);
            this.disposables.add(treeDataSource);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'SCM Tree Repo', container, new ListDelegate(this.inputRenderer), new SCMTreeCompressionDelegate(), [
                this.inputRenderer,
                this.actionButtonRenderer,
                this.instantiationService.createInstance(scmRepositoryRenderer_1.RepositoryRenderer, actions_1.MenuId.SCMTitle, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.instantiationService.createInstance(ResourceGroupRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.instantiationService.createInstance(ResourceRenderer, () => this.viewMode, this.listLabels, (0, util_1.getActionViewItemProvider)(this.instantiationService), resourceActionRunner),
                this.instantiationService.createInstance(HistoryItemGroupRenderer, historyItemGroupActionRunner),
                this.instantiationService.createInstance(HistoryItemRenderer, historyItemActionRunner, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.instantiationService.createInstance(HistoryItemChangeRenderer, () => this.viewMode, this.listLabels),
                this.instantiationService.createInstance(SeparatorRenderer)
            ], treeDataSource, {
                horizontalScrolling: false,
                setRowLineHeight: false,
                transformOptimization: false,
                filter: new SCMTreeFilter(),
                dnd: new SCMTreeDragAndDrop(this.instantiationService),
                identityProvider: new SCMResourceIdentityProvider(),
                sorter: new SCMTreeSorter(() => this.viewMode, () => this.viewSortKey),
                keyboardNavigationLabelProvider: this.instantiationService.createInstance(SCMTreeKeyboardNavigationLabelProvider, () => this.viewMode),
                overrideStyles: {
                    listBackground: this.viewDescriptorService.getViewLocationById(this.id) === 1 /* ViewContainerLocation.Panel */ ? theme_1.PANEL_BACKGROUND : theme_1.SIDE_BAR_BACKGROUND
                },
                collapseByDefault: (e) => {
                    // Repository, Resource Group, Resource Folder (Tree), History Item Change Folder (Tree)
                    if ((0, util_1.isSCMRepository)(e) || (0, util_1.isSCMResourceGroup)(e) || (0, util_1.isSCMResourceNode)(e) || (0, util_1.isSCMHistoryItemChangeNode)(e)) {
                        return false;
                    }
                    // History Item Group, History Item, or History Item Change
                    return (viewState?.expanded ?? []).indexOf(getSCMResourceId(e)) === -1;
                },
                accessibilityProvider: this.instantiationService.createInstance(SCMAccessibilityProvider)
            });
            this.disposables.add(this.tree);
            this.tree.onDidOpen(this.open, this, this.disposables);
            this.tree.onContextMenu(this.onListContextMenu, this, this.disposables);
            this.tree.onDidScroll(this.inputRenderer.clearValidation, this.inputRenderer, this.disposables);
            event_1.Event.filter(this.tree.onDidChangeCollapseState, e => (0, util_1.isSCMRepository)(e.node.element?.element), this.disposables)(this.updateRepositoryCollapseAllContextKeys, this, this.disposables);
            (0, dom_1.append)(container, overflowWidgetsDomNode);
        }
        async open(e) {
            if (!e.element) {
                return;
            }
            else if ((0, util_1.isSCMRepository)(e.element)) {
                this.scmViewService.focus(e.element);
                return;
            }
            else if ((0, util_1.isSCMInput)(e.element)) {
                this.scmViewService.focus(e.element.repository);
                const widgets = this.inputRenderer.getRenderedInputWidget(e.element);
                if (widgets) {
                    for (const widget of widgets) {
                        widget.focus();
                    }
                    this.tree.setFocus([], e.browserEvent);
                    const selection = this.tree.getSelection();
                    if (selection.length === 1 && selection[0] === e.element) {
                        setTimeout(() => this.tree.setSelection([]));
                    }
                }
                return;
            }
            else if ((0, util_1.isSCMActionButton)(e.element)) {
                this.scmViewService.focus(e.element.repository);
                // Focus the action button
                this.actionButtonRenderer.focusActionButton(e.element);
                this.tree.setFocus([], e.browserEvent);
                return;
            }
            else if ((0, util_1.isSCMResourceGroup)(e.element)) {
                const provider = e.element.provider;
                const repository = iterator_1.Iterable.find(this.scmService.repositories, r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
                return;
            }
            else if ((0, util_1.isSCMResource)(e.element)) {
                if (e.element.command?.id === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || e.element.command?.id === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                    await this.commandService.executeCommand(e.element.command.id, ...(e.element.command.arguments || []), e);
                }
                else {
                    await e.element.open(!!e.editorOptions.preserveFocus);
                    if (e.editorOptions.pinned) {
                        const activeEditorPane = this.editorService.activeEditorPane;
                        activeEditorPane?.group.pinEditor(activeEditorPane.input);
                    }
                }
                const provider = e.element.resourceGroup.provider;
                const repository = iterator_1.Iterable.find(this.scmService.repositories, r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
            }
            else if ((0, util_1.isSCMResourceNode)(e.element)) {
                const provider = e.element.context.provider;
                const repository = iterator_1.Iterable.find(this.scmService.repositories, r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
                return;
            }
            else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(e.element)) {
                this.scmViewService.focus(e.element.repository);
                return;
            }
            else if ((0, util_1.isSCMHistoryItemTreeElement)(e.element)) {
                this.scmViewService.focus(e.element.historyItemGroup.repository);
                return;
            }
            else if ((0, util_1.isSCMHistoryItemChangeTreeElement)(e.element)) {
                if (e.element.originalUri && e.element.modifiedUri) {
                    await this.commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, ...(0, util_1.toDiffEditorArguments)(e.element.uri, e.element.originalUri, e.element.modifiedUri), e);
                }
                this.scmViewService.focus(e.element.historyItem.historyItemGroup.repository);
                return;
            }
            else if ((0, util_1.isSCMHistoryItemChangeNode)(e.element)) {
                this.scmViewService.focus(e.element.context.historyItemGroup.repository);
                return;
            }
        }
        onDidActiveEditorChange() {
            if (!this.configurationService.getValue('scm.autoReveal')) {
                return;
            }
            const uri = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!uri) {
                return;
            }
            // Do not set focus/selection when the resource is already focused and selected
            if (this.tree.getFocus().some(e => (0, util_1.isSCMResource)(e) && this.uriIdentityService.extUri.isEqual(e.sourceUri, uri)) &&
                this.tree.getSelection().some(e => (0, util_1.isSCMResource)(e) && this.uriIdentityService.extUri.isEqual(e.sourceUri, uri))) {
                return;
            }
            this.revealResourceThrottler.queue(() => this.treeOperationSequencer.queue(async () => {
                for (const repository of this.scmViewService.visibleRepositories) {
                    const item = this.items.get(repository);
                    if (!item) {
                        continue;
                    }
                    // go backwards from last group
                    for (let j = repository.provider.groups.length - 1; j >= 0; j--) {
                        const groupItem = repository.provider.groups[j];
                        const resource = this.viewMode === "tree" /* ViewMode.Tree */
                            ? groupItem.resourceTree.getNode(uri)?.element
                            : groupItem.resources.find(r => this.uriIdentityService.extUri.isEqual(r.sourceUri, uri));
                        if (resource) {
                            await this.tree.expandTo(resource);
                            this.tree.setSelection([resource]);
                            this.tree.setFocus([resource]);
                            return;
                        }
                    }
                }
            }));
        }
        onDidChangeVisibleRepositories({ added, removed }) {
            // Added repositories
            for (const repository of added) {
                const repositoryDisposables = new lifecycle_1.DisposableStore();
                repositoryDisposables.add(repository.provider.onDidChange(() => this.updateChildren(repository)));
                repositoryDisposables.add(repository.input.onDidChangeVisibility(() => this.updateChildren(repository)));
                repositoryDisposables.add(repository.provider.onDidChangeResourceGroups(() => this.updateChildren(repository)));
                if (repository.provider.historyProvider) {
                    repositoryDisposables.add(repository.provider.historyProvider.onDidChangeCurrentHistoryItemGroup(() => this.updateChildren(repository)));
                }
                const resourceGroupDisposables = repositoryDisposables.add(new lifecycle_1.DisposableMap());
                const onDidChangeResourceGroups = () => {
                    for (const [resourceGroup] of resourceGroupDisposables) {
                        if (!repository.provider.groups.includes(resourceGroup)) {
                            resourceGroupDisposables.deleteAndDispose(resourceGroup);
                        }
                    }
                    for (const resourceGroup of repository.provider.groups) {
                        if (!resourceGroupDisposables.has(resourceGroup)) {
                            const disposableStore = new lifecycle_1.DisposableStore();
                            disposableStore.add(resourceGroup.onDidChange(() => this.updateChildren(repository)));
                            disposableStore.add(resourceGroup.onDidChangeResources(() => this.updateChildren(repository)));
                            resourceGroupDisposables.set(resourceGroup, disposableStore);
                        }
                    }
                };
                repositoryDisposables.add(repository.provider.onDidChangeResourceGroups(onDidChangeResourceGroups));
                onDidChangeResourceGroups();
                this.items.set(repository, repositoryDisposables);
            }
            // Removed repositories
            for (const repository of removed) {
                this.items.deleteAndDispose(repository);
            }
            this.updateChildren();
            this.onDidActiveEditorChange();
        }
        onListContextMenu(e) {
            if (!e.element) {
                const menu = this.menuService.createMenu(Menus.ViewSort, this.contextKeyService);
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, actions);
                return this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    onHide: () => {
                        menu.dispose();
                    }
                });
            }
            const element = e.element;
            let context = element;
            let actions = [];
            if ((0, util_1.isSCMRepository)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
                const menu = menus.repositoryContextMenu;
                context = element.provider;
                actions = (0, util_1.collectContextMenuActions)(menu);
            }
            else if ((0, util_1.isSCMInput)(element) || (0, util_1.isSCMActionButton)(element)) {
                // noop
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
                const menu = menus.getResourceGroupMenu(element);
                actions = (0, util_1.collectContextMenuActions)(menu);
            }
            else if ((0, util_1.isSCMResource)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.resourceGroup.provider);
                const menu = menus.getResourceMenu(element);
                actions = (0, util_1.collectContextMenuActions)(menu);
            }
            else if ((0, util_1.isSCMResourceNode)(element)) {
                if (element.element) {
                    const menus = this.scmViewService.menus.getRepositoryMenus(element.element.resourceGroup.provider);
                    const menu = menus.getResourceMenu(element.element);
                    actions = (0, util_1.collectContextMenuActions)(menu);
                }
                else {
                    const menus = this.scmViewService.menus.getRepositoryMenus(element.context.provider);
                    const menu = menus.getResourceFolderMenu(element.context);
                    actions = (0, util_1.collectContextMenuActions)(menu);
                }
            }
            const actionRunner = (0, util_1.isSCMRepository)(element) ?
                new scmRepositoryRenderer_1.RepositoryActionRunner(() => this.getSelectedRepositories()) :
                new RepositoryPaneActionRunner(() => this.getSelectedResources());
            actionRunner.onWillRun(() => this.tree.domFocus());
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => context,
                actionRunner
            });
        }
        getSelectedRepositories() {
            const focusedRepositories = this.tree.getFocus().filter(r => !!r && (0, util_1.isSCMRepository)(r));
            const selectedRepositories = this.tree.getSelection().filter(r => !!r && (0, util_1.isSCMRepository)(r));
            return Array.from(new Set([...focusedRepositories, ...selectedRepositories]));
        }
        getSelectedResources() {
            return this.tree.getSelection()
                .filter(r => !!r && !(0, util_1.isSCMResourceGroup)(r));
        }
        getViewMode() {
            let mode = this.configurationService.getValue('scm.defaultViewMode') === 'list' ? "list" /* ViewMode.List */ : "tree" /* ViewMode.Tree */;
            const storageMode = this.storageService.get(`scm.viewMode`, 1 /* StorageScope.WORKSPACE */);
            if (typeof storageMode === 'string') {
                mode = storageMode;
            }
            return mode;
        }
        getViewSortKey() {
            // Tree
            if (this._viewMode === "tree" /* ViewMode.Tree */) {
                return "path" /* ViewSortKey.Path */;
            }
            // List
            let viewSortKey;
            const viewSortKeyString = this.configurationService.getValue('scm.defaultViewSortKey');
            switch (viewSortKeyString) {
                case 'name':
                    viewSortKey = "name" /* ViewSortKey.Name */;
                    break;
                case 'status':
                    viewSortKey = "status" /* ViewSortKey.Status */;
                    break;
                default:
                    viewSortKey = "path" /* ViewSortKey.Path */;
                    break;
            }
            const storageSortKey = this.storageService.get(`scm.viewSortKey`, 1 /* StorageScope.WORKSPACE */);
            if (typeof storageSortKey === 'string') {
                viewSortKey = storageSortKey;
            }
            return viewSortKey;
        }
        loadTreeViewState() {
            const storageViewState = this.storageService.get('scm.viewState2', 1 /* StorageScope.WORKSPACE */);
            if (!storageViewState) {
                return undefined;
            }
            try {
                const treeViewState = JSON.parse(storageViewState);
                return treeViewState;
            }
            catch {
                return undefined;
            }
        }
        storeTreeViewState() {
            if (this.tree) {
                this.storageService.store('scm.viewState2', JSON.stringify(this.tree.getViewState()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        updateChildren(element) {
            this.updateChildrenThrottler.queue(() => this.treeOperationSequencer.queue(async () => {
                const focusedInput = this.inputRenderer.getFocusedInput();
                if (element && this.tree.hasNode(element)) {
                    // Refresh specific repository
                    await this.tree.updateChildren(element);
                }
                else {
                    // Refresh the entire tree
                    await this.tree.updateChildren(undefined);
                }
                if (focusedInput) {
                    this.inputRenderer.getRenderedInputWidget(focusedInput)?.forEach(widget => widget.focus());
                }
                this.updateScmProviderContextKeys();
                this.updateRepositoryCollapseAllContextKeys();
            }));
        }
        updateIndentStyles(theme) {
            this.treeContainer.classList.toggle('list-view-mode', this.viewMode === "list" /* ViewMode.List */);
            this.treeContainer.classList.toggle('tree-view-mode', this.viewMode === "tree" /* ViewMode.Tree */);
            this.treeContainer.classList.toggle('align-icons-and-twisties', (this.viewMode === "list" /* ViewMode.List */ && theme.hasFileIcons) || (theme.hasFileIcons && !theme.hasFolderIcons));
            this.treeContainer.classList.toggle('hide-arrows', this.viewMode === "tree" /* ViewMode.Tree */ && theme.hidesExplorerArrows === true);
        }
        updateScmProviderContextKeys() {
            const alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories');
            if (!alwaysShowRepositories && this.items.size === 1) {
                const provider = iterator_1.Iterable.first(this.items.keys()).provider;
                this.scmProviderContextKey.set(provider.contextValue);
                this.scmProviderRootUriContextKey.set(provider.rootUri?.toString());
                this.scmProviderHasRootUriContextKey.set(!!provider.rootUri);
            }
            else {
                this.scmProviderContextKey.set(undefined);
                this.scmProviderRootUriContextKey.set(undefined);
                this.scmProviderHasRootUriContextKey.set(false);
            }
        }
        updateRepositoryCollapseAllContextKeys() {
            if (!this.isBodyVisible() || this.items.size === 1) {
                this.isAnyRepositoryCollapsibleContextKey.set(false);
                this.areAllRepositoriesCollapsedContextKey.set(false);
                return;
            }
            this.isAnyRepositoryCollapsibleContextKey.set(this.scmViewService.visibleRepositories.some(r => this.tree.hasElement(r) && this.tree.isCollapsible(r)));
            this.areAllRepositoriesCollapsedContextKey.set(this.scmViewService.visibleRepositories.every(r => this.tree.hasElement(r) && (!this.tree.isCollapsible(r) || this.tree.isCollapsed(r))));
        }
        collapseAllRepositories() {
            for (const repository of this.scmViewService.visibleRepositories) {
                if (this.tree.isCollapsible(repository)) {
                    this.tree.collapse(repository);
                }
            }
        }
        expandAllRepositories() {
            for (const repository of this.scmViewService.visibleRepositories) {
                if (this.tree.isCollapsible(repository)) {
                    this.tree.expand(repository);
                }
            }
        }
        shouldShowWelcome() {
            return this.scmService.repositoryCount === 0;
        }
        getActionsContext() {
            return this.scmViewService.visibleRepositories.length === 1 ? this.scmViewService.visibleRepositories[0].provider : undefined;
        }
        focus() {
            super.focus();
            if (this.isExpanded()) {
                if (this.tree.getFocus().length === 0) {
                    for (const repository of this.scmViewService.visibleRepositories) {
                        const widgets = this.inputRenderer.getRenderedInputWidget(repository.input);
                        if (widgets) {
                            for (const widget of widgets) {
                                widget.focus();
                            }
                            return;
                        }
                    }
                }
                this.tree.domFocus();
            }
        }
        dispose() {
            this.visibilityDisposables.dispose();
            this.disposables.dispose();
            this.items.dispose();
            super.dispose();
        }
    };
    exports.SCMViewPane = SCMViewPane;
    exports.SCMViewPane = SCMViewPane = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, editorService_1.IEditorService),
        __param(3, actions_1.IMenuService),
        __param(4, scm_1.ISCMService),
        __param(5, scm_1.ISCMViewService),
        __param(6, storage_1.IStorageService),
        __param(7, uriIdentity_1.IUriIdentityService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, themeService_1.IThemeService),
        __param(10, contextView_1.IContextMenuService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, views_1.IViewDescriptorService),
        __param(13, configuration_1.IConfigurationService),
        __param(14, contextkey_1.IContextKeyService),
        __param(15, opener_1.IOpenerService),
        __param(16, telemetry_1.ITelemetryService)
    ], SCMViewPane);
    let SCMTreeDataSource = class SCMTreeDataSource {
        constructor(viewMode, configurationService, scmViewService, uriIdentityService) {
            this.viewMode = viewMode;
            this.configurationService = configurationService;
            this.scmViewService = scmViewService;
            this.uriIdentityService = uriIdentityService;
            this.historyProviderCache = new Map();
            this.repositoryDisposables = new lifecycle_1.DisposableMap();
            this.disposables = new lifecycle_1.DisposableStore();
            const onDidChangeConfiguration = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.showChangesSummary'), this.disposables);
            this.disposables.add(onDidChangeConfiguration(() => this.historyProviderCache.clear()));
            this.scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
            this.onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: iterator_1.Iterable.empty() });
        }
        hasChildren(inputOrElement) {
            if ((0, util_1.isSCMViewService)(inputOrElement)) {
                return this.scmViewService.visibleRepositories.length !== 0;
            }
            else if ((0, util_1.isSCMRepository)(inputOrElement)) {
                return true;
            }
            else if ((0, util_1.isSCMInput)(inputOrElement)) {
                return false;
            }
            else if ((0, util_1.isSCMActionButton)(inputOrElement)) {
                return false;
            }
            else if ((0, util_1.isSCMResourceGroup)(inputOrElement)) {
                return true;
            }
            else if ((0, util_1.isSCMResource)(inputOrElement)) {
                return false;
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(inputOrElement)) {
                return inputOrElement.childrenCount > 0;
            }
            else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(inputOrElement)) {
                return true;
            }
            else if ((0, util_1.isSCMHistoryItemTreeElement)(inputOrElement)) {
                return true;
            }
            else if ((0, util_1.isSCMHistoryItemChangeTreeElement)(inputOrElement)) {
                return false;
            }
            else if ((0, util_1.isSCMViewSeparator)(inputOrElement)) {
                return false;
            }
            else {
                throw new Error('hasChildren not implemented.');
            }
        }
        async getChildren(inputOrElement) {
            const { alwaysShowRepositories, showActionButton } = this.getConfiguration();
            const repositoryCount = this.scmViewService.visibleRepositories.length;
            if ((0, util_1.isSCMViewService)(inputOrElement) && (repositoryCount > 1 || alwaysShowRepositories)) {
                return this.scmViewService.visibleRepositories;
            }
            else if (((0, util_1.isSCMViewService)(inputOrElement) && repositoryCount === 1 && !alwaysShowRepositories) || (0, util_1.isSCMRepository)(inputOrElement)) {
                const children = [];
                inputOrElement = (0, util_1.isSCMRepository)(inputOrElement) ? inputOrElement : this.scmViewService.visibleRepositories[0];
                const actionButton = inputOrElement.provider.actionButton;
                const resourceGroups = inputOrElement.provider.groups;
                // SCM Input
                if (inputOrElement.input.visible) {
                    children.push(inputOrElement.input);
                }
                // Action Button
                if (showActionButton && actionButton) {
                    children.push({
                        type: 'actionButton',
                        repository: inputOrElement,
                        button: actionButton
                    });
                }
                // ResourceGroups
                const hasSomeChanges = resourceGroups.some(group => group.resources.length > 0);
                if (hasSomeChanges || (repositoryCount === 1 && (!showActionButton || !actionButton))) {
                    children.push(...resourceGroups);
                }
                // History item groups
                const historyItemGroups = await this.getHistoryItemGroups(inputOrElement);
                // Incoming/Outgoing Separator
                if (historyItemGroups.length > 0) {
                    let label = (0, nls_1.localize)('syncSeparatorHeader', "Incoming/Outgoing");
                    let ariaLabel = (0, nls_1.localize)('syncSeparatorHeaderAriaLabel', "Incoming and outgoing changes");
                    const incomingHistoryItems = historyItemGroups.find(g => g.direction === 'incoming');
                    const outgoingHistoryItems = historyItemGroups.find(g => g.direction === 'outgoing');
                    if (incomingHistoryItems && !outgoingHistoryItems) {
                        label = (0, nls_1.localize)('syncIncomingSeparatorHeader', "Incoming");
                        ariaLabel = (0, nls_1.localize)('syncIncomingSeparatorHeaderAriaLabel', "Incoming changes");
                    }
                    else if (!incomingHistoryItems && outgoingHistoryItems) {
                        label = (0, nls_1.localize)('syncOutgoingSeparatorHeader', "Outgoing");
                        ariaLabel = (0, nls_1.localize)('syncOutgoingSeparatorHeaderAriaLabel', "Outgoing changes");
                    }
                    children.push({ label, ariaLabel, repository: inputOrElement, type: 'separator' });
                }
                children.push(...historyItemGroups);
                return children;
            }
            else if ((0, util_1.isSCMResourceGroup)(inputOrElement)) {
                if (this.viewMode() === "list" /* ViewMode.List */) {
                    // Resources (List)
                    return inputOrElement.resources;
                }
                else if (this.viewMode() === "tree" /* ViewMode.Tree */) {
                    // Resources (Tree)
                    const children = [];
                    for (const node of inputOrElement.resourceTree.root.children) {
                        children.push(node.element && node.childrenCount === 0 ? node.element : node);
                    }
                    return children;
                }
            }
            else if ((0, util_1.isSCMResourceNode)(inputOrElement) || (0, util_1.isSCMHistoryItemChangeNode)(inputOrElement)) {
                // Resources (Tree), History item changes (Tree)
                const children = [];
                for (const node of inputOrElement.children) {
                    children.push(node.element && node.childrenCount === 0 ? node.element : node);
                }
                return children;
            }
            else if ((0, util_1.isSCMHistoryItemGroupTreeElement)(inputOrElement)) {
                // History item group
                return this.getHistoryItems(inputOrElement);
            }
            else if ((0, util_1.isSCMHistoryItemTreeElement)(inputOrElement)) {
                // History item changes (List/Tree)
                return this.getHistoryItemChanges(inputOrElement);
            }
            return [];
        }
        async getHistoryItemGroups(element) {
            const { showIncomingChanges, showOutgoingChanges } = this.getConfiguration();
            const scmProvider = element.provider;
            const historyProvider = scmProvider.historyProvider;
            const currentHistoryItemGroup = historyProvider?.currentHistoryItemGroup;
            if (!historyProvider || !currentHistoryItemGroup || (showIncomingChanges === 'never' && showOutgoingChanges === 'never')) {
                return [];
            }
            const children = [];
            const historyProviderCacheEntry = this.getHistoryProviderCacheEntry(element);
            let incomingHistoryItemGroup = historyProviderCacheEntry?.incomingHistoryItemGroup;
            let outgoingHistoryItemGroup = historyProviderCacheEntry?.outgoingHistoryItemGroup;
            if (!incomingHistoryItemGroup || !outgoingHistoryItemGroup) {
                // Common ancestor, ahead, behind
                const ancestor = await historyProvider.resolveHistoryItemGroupCommonAncestor(currentHistoryItemGroup.id, currentHistoryItemGroup.base?.id);
                if (!ancestor) {
                    return [];
                }
                // Only show "Incoming" node if there is a base branch
                incomingHistoryItemGroup = currentHistoryItemGroup.base ? {
                    id: currentHistoryItemGroup.base.id,
                    label: currentHistoryItemGroup.base.label,
                    ariaLabel: (0, nls_1.localize)('incomingChangesAriaLabel', "Incoming changes from {0}", currentHistoryItemGroup.base.label),
                    icon: codicons_1.Codicon.arrowCircleDown,
                    direction: 'incoming',
                    ancestor: ancestor.id,
                    count: ancestor.behind,
                    repository: element,
                    type: 'historyItemGroup'
                } : undefined;
                outgoingHistoryItemGroup = {
                    id: currentHistoryItemGroup.id,
                    label: currentHistoryItemGroup.label,
                    ariaLabel: (0, nls_1.localize)('outgoingChangesAriaLabel', "Outgoing changes to {0}", currentHistoryItemGroup.label),
                    icon: codicons_1.Codicon.arrowCircleUp,
                    direction: 'outgoing',
                    ancestor: ancestor.id,
                    count: ancestor.ahead,
                    repository: element,
                    type: 'historyItemGroup'
                };
                this.historyProviderCache.set(element, {
                    ...historyProviderCacheEntry,
                    incomingHistoryItemGroup,
                    outgoingHistoryItemGroup
                });
            }
            // Incoming
            if (incomingHistoryItemGroup &&
                (showIncomingChanges === 'always' ||
                    (showIncomingChanges === 'auto' && (incomingHistoryItemGroup.count ?? 0) > 0))) {
                children.push(incomingHistoryItemGroup);
            }
            // Outgoing
            if (outgoingHistoryItemGroup &&
                (showOutgoingChanges === 'always' ||
                    (showOutgoingChanges === 'auto' && (outgoingHistoryItemGroup.count ?? 0) > 0))) {
                children.push(outgoingHistoryItemGroup);
            }
            return children;
        }
        async getHistoryItems(element) {
            const repository = element.repository;
            const historyProvider = repository.provider.historyProvider;
            if (!historyProvider) {
                return [];
            }
            const historyProviderCacheEntry = this.getHistoryProviderCacheEntry(repository);
            const historyItemsMap = historyProviderCacheEntry.historyItems;
            let historyItemsElement = historyProviderCacheEntry.historyItems.get(element.id);
            if (!historyItemsElement) {
                const historyItems = await historyProvider.provideHistoryItems(element.id, { limit: { id: element.ancestor } }) ?? [];
                // All Changes
                const { showChangesSummary } = this.getConfiguration();
                const allChanges = showChangesSummary && historyItems.length >= 2 ?
                    await historyProvider.provideHistoryItemSummary(historyItems[0].id, element.ancestor) : undefined;
                historyItemsElement = [allChanges, historyItems];
                this.historyProviderCache.set(repository, {
                    ...historyProviderCacheEntry,
                    historyItems: historyItemsMap.set(element.id, historyItemsElement)
                });
            }
            const children = [];
            if (historyItemsElement[0]) {
                children.push({
                    ...historyItemsElement[0],
                    icon: historyItemsElement[0].icon ?? codicons_1.Codicon.files,
                    label: (0, nls_1.localize)('allChanges', "All Changes"),
                    historyItemGroup: element,
                    type: 'allChanges'
                });
            }
            children.push(...historyItemsElement[1]
                .map(historyItem => ({
                ...historyItem,
                historyItemGroup: element,
                type: 'historyItem'
            })));
            return children;
        }
        async getHistoryItemChanges(element) {
            const repository = element.historyItemGroup.repository;
            const historyProvider = repository.provider.historyProvider;
            if (!historyProvider) {
                return [];
            }
            const historyProviderCacheEntry = this.getHistoryProviderCacheEntry(repository);
            const historyItemChangesMap = historyProviderCacheEntry.historyItemChanges;
            const historyItemParentId = element.parentIds.length > 0 ? element.parentIds[0] : undefined;
            let historyItemChanges = historyItemChangesMap.get(`${element.id}/${historyItemParentId}`);
            if (!historyItemChanges) {
                const historyItemParentId = element.parentIds.length > 0 ? element.parentIds[0] : undefined;
                historyItemChanges = await historyProvider.provideHistoryItemChanges(element.id, historyItemParentId) ?? [];
                this.historyProviderCache.set(repository, {
                    ...historyProviderCacheEntry,
                    historyItemChanges: historyItemChangesMap.set(`${element.id}/${historyItemParentId}`, historyItemChanges)
                });
            }
            if (this.viewMode() === "list" /* ViewMode.List */) {
                // List
                return historyItemChanges.map(change => ({
                    ...change,
                    historyItem: element,
                    type: 'historyItemChange'
                }));
            }
            // Tree
            const tree = new resourceTree_1.ResourceTree(element, repository.provider.rootUri ?? uri_1.URI.file('/'), this.uriIdentityService.extUri);
            for (const change of historyItemChanges) {
                tree.add(change.uri, {
                    ...change,
                    historyItem: element,
                    type: 'historyItemChange'
                });
            }
            const children = [];
            for (const node of tree.root.children) {
                children.push(node.element ?? node);
            }
            return children;
        }
        getParent(element) {
            if ((0, util_1.isSCMResourceNode)(element)) {
                if (element.parent === element.context.resourceTree.root) {
                    return element.context;
                }
                else if (element.parent) {
                    return element.parent;
                }
                else {
                    throw new Error('Invalid element passed to getParent');
                }
            }
            else if ((0, util_1.isSCMResource)(element)) {
                if (this.viewMode() === "list" /* ViewMode.List */) {
                    return element.resourceGroup;
                }
                const node = element.resourceGroup.resourceTree.getNode(element.sourceUri);
                const result = node?.parent;
                if (!result) {
                    throw new Error('Invalid element passed to getParent');
                }
                if (result === element.resourceGroup.resourceTree.root) {
                    return element.resourceGroup;
                }
                return result;
            }
            else {
                throw new Error('Unexpected call to getParent');
            }
        }
        getConfiguration() {
            return {
                alwaysShowRepositories: this.configurationService.getValue('scm.alwaysShowRepositories'),
                showActionButton: this.configurationService.getValue('scm.showActionButton'),
                showChangesSummary: this.configurationService.getValue('scm.showChangesSummary'),
                showIncomingChanges: this.configurationService.getValue('scm.showIncomingChanges'),
                showOutgoingChanges: this.configurationService.getValue('scm.showOutgoingChanges')
            };
        }
        onDidChangeVisibleRepositories({ added, removed }) {
            // Added repositories
            for (const repository of added) {
                const repositoryDisposables = new lifecycle_1.DisposableStore();
                if (repository.provider.historyProvider) {
                    repositoryDisposables.add(repository.provider.historyProvider.onDidChangeCurrentHistoryItemGroup(() => this.historyProviderCache.delete(repository)));
                }
                this.repositoryDisposables.set(repository, repositoryDisposables);
            }
            // Removed repositories
            for (const repository of removed) {
                this.repositoryDisposables.deleteAndDispose(repository);
                this.historyProviderCache.delete(repository);
            }
        }
        getHistoryProviderCacheEntry(repository) {
            return this.historyProviderCache.get(repository) ?? {
                incomingHistoryItemGroup: undefined,
                outgoingHistoryItemGroup: undefined,
                historyItems: new Map(),
                historyItemChanges: new Map()
            };
        }
        dispose() {
            this.repositoryDisposables.dispose();
            this.disposables.dispose();
        }
    };
    SCMTreeDataSource = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, scm_1.ISCMViewService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], SCMTreeDataSource);
    class SCMActionButton {
        constructor(container, contextMenuService, commandService, notificationService) {
            this.container = container;
            this.contextMenuService = contextMenuService;
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.disposables = new lifecycle_1.MutableDisposable();
        }
        dispose() {
            this.disposables?.dispose();
        }
        setButton(button) {
            // Clear old button
            this.clear();
            if (!button) {
                return;
            }
            if (button.secondaryCommands?.length) {
                const actions = [];
                for (let index = 0; index < button.secondaryCommands.length; index++) {
                    const commands = button.secondaryCommands[index];
                    for (const command of commands) {
                        actions.push(new actions_2.Action(command.id, command.title, undefined, true, async () => await this.executeCommand(command.id, ...(command.arguments || []))));
                    }
                    if (commands.length) {
                        actions.push(new actions_2.Separator());
                    }
                }
                // Remove last separator
                actions.pop();
                // ButtonWithDropdown
                this.button = new button_1.ButtonWithDropdown(this.container, {
                    actions: actions,
                    addPrimaryActionToDropdown: false,
                    contextMenuProvider: this.contextMenuService,
                    title: button.command.tooltip,
                    supportIcons: true,
                    ...defaultStyles_1.defaultButtonStyles
                });
            }
            else {
                // Button
                this.button = new button_1.Button(this.container, { supportIcons: true, supportShortLabel: !!button.description, title: button.command.tooltip, ...defaultStyles_1.defaultButtonStyles });
            }
            this.button.enabled = button.enabled;
            this.button.label = button.command.title;
            if (this.button instanceof button_1.Button && button.description) {
                this.button.labelShort = button.description;
            }
            this.button.onDidClick(async () => await this.executeCommand(button.command.id, ...(button.command.arguments || [])), null, this.disposables.value);
            this.disposables.value.add(this.button);
        }
        focus() {
            this.button?.focus();
        }
        clear() {
            this.disposables.value = new lifecycle_1.DisposableStore();
            this.button = undefined;
            (0, dom_1.clearNode)(this.container);
        }
        async executeCommand(commandId, ...args) {
            try {
                await this.commandService.executeCommand(commandId, ...args);
            }
            catch (ex) {
                this.notificationService.error(ex);
            }
        }
    }
    exports.SCMActionButton = SCMActionButton;
    let ScmInputContentProvider = class ScmInputContentProvider extends lifecycle_1.Disposable {
        constructor(textModelService, _modelService, _languageService) {
            super();
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._register(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeSourceControl, this));
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            return this._modelService.createModel('', this._languageService.createById('scminput'), resource);
        }
    };
    ScmInputContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService)
    ], ScmInputContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtVmlld1BhbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NjbS9icm93c2VyL3NjbVZpZXdQYW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5SGhHLElBQUEsNkJBQWEsRUFBQyxvQ0FBb0MsRUFBRTtRQUNuRCxJQUFJLEVBQUUsdUNBQXVDO1FBQzdDLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsTUFBTSxFQUFFLHVDQUF1QztRQUMvQyxPQUFPLEVBQUUsdUNBQXVDO0tBQ2hELEVBQUUsSUFBQSxjQUFRLEVBQUMsb0NBQW9DLEVBQUUsMENBQTBDLENBQUMsQ0FBQyxDQUFDO0lBRS9GLElBQUEsNkJBQWEsRUFBQyxvQ0FBb0MsRUFBRTtRQUNuRCxJQUFJLEVBQUUseUNBQXlDO1FBQy9DLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsTUFBTSxFQUFFLHlDQUF5QztRQUNqRCxPQUFPLEVBQUUseUNBQXlDO0tBQ2xELEVBQUUsSUFBQSxjQUFRLEVBQUMsb0NBQW9DLEVBQUUsMENBQTBDLENBQUMsQ0FBQyxDQUFDO0lBRS9GLElBQUEsNkJBQWEsRUFBQyxpQ0FBaUMsRUFBRTtRQUNoRCxJQUFJLEVBQUUsSUFBQSwyQkFBVyxFQUFDLDBCQUFVLEVBQUUsR0FBRyxDQUFDO1FBQ2xDLEtBQUssRUFBRSxJQUFBLDJCQUFXLEVBQUMsMEJBQVUsRUFBRSxHQUFHLENBQUM7UUFDbkMsTUFBTSxFQUFFLElBQUEsMkJBQVcsRUFBQywwQkFBVSxFQUFFLEdBQUcsQ0FBQztRQUNwQyxPQUFPLEVBQUUsSUFBQSwyQkFBVyxFQUFDLDBCQUFVLEVBQUUsR0FBRyxDQUFDO0tBQ3JDLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUNBQWlDLEVBQUUsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO0lBRXpGLElBQUEsNkJB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