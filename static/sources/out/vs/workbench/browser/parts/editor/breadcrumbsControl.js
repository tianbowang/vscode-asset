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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/breadcrumbs/breadcrumbsWidget", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/workbench/browser/parts/editor/breadcrumbsModel", "vs/workbench/browser/parts/editor/breadcrumbsPicker", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/browser", "vs/platform/label/common/label", "vs/platform/action/common/actionCommonCategories", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/css!./media/breadcrumbscontrol"], function (require, exports, dom, mouseEvent_1, breadcrumbsWidget_1, arrays_1, async_1, lifecycle_1, resources_1, uri_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybindingsRegistry_1, listService_1, quickInput_1, labels_1, breadcrumbs_1, breadcrumbsModel_1, breadcrumbsPicker_1, editor_1, editorService_1, editorGroupsService_1, browser_1, label_1, actionCommonCategories_1, iconRegistry_1, codicons_1, defaultStyles_1, event_1) {
    "use strict";
    var BreadcrumbsControl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsControlFactory = exports.BreadcrumbsControl = void 0;
    class OutlineItem extends breadcrumbsWidget_1.BreadcrumbsItem {
        constructor(model, element, options) {
            super();
            this.model = model;
            this.element = element;
            this.options = options;
            this._disposables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._disposables.dispose();
        }
        equals(other) {
            if (!(other instanceof OutlineItem)) {
                return false;
            }
            return this.element.element === other.element.element &&
                this.options.showFileIcons === other.options.showFileIcons &&
                this.options.showSymbolIcons === other.options.showSymbolIcons;
        }
        render(container) {
            const { element, outline } = this.element;
            if (element === outline) {
                const element = dom.$('span', undefined, '…');
                container.appendChild(element);
                return;
            }
            const templateId = outline.config.delegate.getTemplateId(element);
            const renderer = outline.config.renderers.find(renderer => renderer.templateId === templateId);
            if (!renderer) {
                container.innerText = '<<NO RENDERER>>';
                return;
            }
            const template = renderer.renderTemplate(container);
            renderer.renderElement({
                element,
                children: [],
                depth: 0,
                visibleChildrenCount: 0,
                visibleChildIndex: 0,
                collapsible: false,
                collapsed: false,
                visible: true,
                filterData: undefined
            }, 0, template, undefined);
            this._disposables.add((0, lifecycle_1.toDisposable)(() => { renderer.disposeTemplate(template); }));
        }
    }
    class FileItem extends breadcrumbsWidget_1.BreadcrumbsItem {
        constructor(model, element, options, _labels) {
            super();
            this.model = model;
            this.element = element;
            this.options = options;
            this._labels = _labels;
            this._disposables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._disposables.dispose();
        }
        equals(other) {
            if (!(other instanceof FileItem)) {
                return false;
            }
            return (resources_1.extUri.isEqual(this.element.uri, other.element.uri) &&
                this.options.showFileIcons === other.options.showFileIcons &&
                this.options.showSymbolIcons === other.options.showSymbolIcons);
        }
        render(container) {
            // file/folder
            const label = this._labels.create(container);
            label.setFile(this.element.uri, {
                hidePath: true,
                hideIcon: this.element.kind === files_1.FileKind.FOLDER || !this.options.showFileIcons,
                fileKind: this.element.kind,
                fileDecorations: { colors: this.options.showDecorationColors, badges: false },
            });
            container.classList.add(files_1.FileKind[this.element.kind].toLowerCase());
            this._disposables.add(label);
        }
    }
    const separatorIcon = (0, iconRegistry_1.registerIcon)('breadcrumb-separator', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('separatorIcon', 'Icon for the separator in the breadcrumbs.'));
    let BreadcrumbsControl = class BreadcrumbsControl {
        static { BreadcrumbsControl_1 = this; }
        static { this.HEIGHT = 22; }
        static { this.SCROLLBAR_SIZES = {
            default: 3,
            large: 8
        }; }
        static { this.Payload_Reveal = {}; }
        static { this.Payload_RevealAside = {}; }
        static { this.Payload_Pick = {}; }
        static { this.CK_BreadcrumbsPossible = new contextkey_1.RawContextKey('breadcrumbsPossible', false, (0, nls_1.localize)('breadcrumbsPossible', "Whether the editor can show breadcrumbs")); }
        static { this.CK_BreadcrumbsVisible = new contextkey_1.RawContextKey('breadcrumbsVisible', false, (0, nls_1.localize)('breadcrumbsVisible', "Whether breadcrumbs are currently visible")); }
        static { this.CK_BreadcrumbsActive = new contextkey_1.RawContextKey('breadcrumbsActive', false, (0, nls_1.localize)('breadcrumbsActive', "Whether breadcrumbs have focus")); }
        get onDidVisibilityChange() { return this._onDidVisibilityChange.event; }
        constructor(container, _options, _editorGroup, _contextKeyService, _contextViewService, _instantiationService, _quickInputService, _fileService, _editorService, _labelService, configurationService, breadcrumbsService) {
            this._options = _options;
            this._editorGroup = _editorGroup;
            this._contextKeyService = _contextKeyService;
            this._contextViewService = _contextViewService;
            this._instantiationService = _instantiationService;
            this._quickInputService = _quickInputService;
            this._fileService = _fileService;
            this._editorService = _editorService;
            this._labelService = _labelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._breadcrumbsDisposables = new lifecycle_1.DisposableStore();
            this._model = new lifecycle_1.MutableDisposable();
            this._breadcrumbsPickerShowing = false;
            this._onDidVisibilityChange = this._disposables.add(new event_1.Emitter());
            this.domNode = document.createElement('div');
            this.domNode.classList.add('breadcrumbs-control');
            dom.append(container, this.domNode);
            this._cfUseQuickPick = breadcrumbs_1.BreadcrumbsConfig.UseQuickPick.bindTo(configurationService);
            this._cfShowIcons = breadcrumbs_1.BreadcrumbsConfig.Icons.bindTo(configurationService);
            this._cfTitleScrollbarSizing = breadcrumbs_1.BreadcrumbsConfig.TitleScrollbarSizing.bindTo(configurationService);
            this._labels = this._instantiationService.createInstance(labels_1.ResourceLabels, labels_1.DEFAULT_LABELS_CONTAINER);
            const sizing = this._cfTitleScrollbarSizing.getValue() ?? 'default';
            const styles = _options.widgetStyles ?? defaultStyles_1.defaultBreadcrumbsWidgetStyles;
            this._widget = new breadcrumbsWidget_1.BreadcrumbsWidget(this.domNode, BreadcrumbsControl_1.SCROLLBAR_SIZES[sizing], separatorIcon, styles);
            this._widget.onDidSelectItem(this._onSelectEvent, this, this._disposables);
            this._widget.onDidFocusItem(this._onFocusEvent, this, this._disposables);
            this._widget.onDidChangeFocus(this._updateCkBreadcrumbsActive, this, this._disposables);
            this._ckBreadcrumbsPossible = BreadcrumbsControl_1.CK_BreadcrumbsPossible.bindTo(this._contextKeyService);
            this._ckBreadcrumbsVisible = BreadcrumbsControl_1.CK_BreadcrumbsVisible.bindTo(this._contextKeyService);
            this._ckBreadcrumbsActive = BreadcrumbsControl_1.CK_BreadcrumbsActive.bindTo(this._contextKeyService);
            this._disposables.add(breadcrumbsService.register(this._editorGroup.id, this._widget));
            this.hide();
        }
        dispose() {
            this._disposables.dispose();
            this._breadcrumbsDisposables.dispose();
            this._ckBreadcrumbsPossible.reset();
            this._ckBreadcrumbsVisible.reset();
            this._ckBreadcrumbsActive.reset();
            this._cfUseQuickPick.dispose();
            this._cfShowIcons.dispose();
            this._widget.dispose();
            this._labels.dispose();
            this.domNode.remove();
        }
        get model() {
            return this._model.value;
        }
        layout(dim) {
            this._widget.layout(dim);
        }
        isHidden() {
            return this.domNode.classList.contains('hidden');
        }
        hide() {
            const wasHidden = this.isHidden();
            this._breadcrumbsDisposables.clear();
            this._ckBreadcrumbsVisible.set(false);
            this.domNode.classList.toggle('hidden', true);
            if (!wasHidden) {
                this._onDidVisibilityChange.fire();
            }
        }
        show() {
            const wasHidden = this.isHidden();
            this._ckBreadcrumbsVisible.set(true);
            this.domNode.classList.toggle('hidden', false);
            if (wasHidden) {
                this._onDidVisibilityChange.fire();
            }
        }
        revealLast() {
            this._widget.revealLast();
        }
        update() {
            this._breadcrumbsDisposables.clear();
            // honor diff editors and such
            const uri = editor_1.EditorResourceAccessor.getCanonicalUri(this._editorGroup.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const wasHidden = this.isHidden();
            if (!uri || !this._fileService.hasProvider(uri)) {
                // cleanup and return when there is no input or when
                // we cannot handle this input
                this._ckBreadcrumbsPossible.set(false);
                if (!wasHidden) {
                    this.hide();
                    return true;
                }
                else {
                    return false;
                }
            }
            // display uri which can be derived from certain inputs
            const fileInfoUri = editor_1.EditorResourceAccessor.getOriginalUri(this._editorGroup.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            this.show();
            this._ckBreadcrumbsPossible.set(true);
            const model = this._instantiationService.createInstance(breadcrumbsModel_1.BreadcrumbsModel, fileInfoUri ?? uri, this._editorGroup.activeEditorPane);
            this._model.value = model;
            this.domNode.classList.toggle('backslash-path', this._labelService.getSeparator(uri.scheme, uri.authority) === '\\');
            const updateBreadcrumbs = () => {
                this.domNode.classList.toggle('relative-path', model.isRelative());
                const showIcons = this._cfShowIcons.getValue();
                const options = {
                    ...this._options,
                    showFileIcons: this._options.showFileIcons && showIcons,
                    showSymbolIcons: this._options.showSymbolIcons && showIcons
                };
                const items = model.getElements().map(element => element instanceof breadcrumbsModel_1.FileElement ? new FileItem(model, element, options, this._labels) : new OutlineItem(model, element, options));
                if (items.length === 0) {
                    this._widget.setEnabled(false);
                    this._widget.setItems([new class extends breadcrumbsWidget_1.BreadcrumbsItem {
                            render(container) {
                                container.innerText = (0, nls_1.localize)('empty', "no elements");
                            }
                            equals(other) {
                                return other === this;
                            }
                            dispose() {
                            }
                        }]);
                }
                else {
                    this._widget.setEnabled(true);
                    this._widget.setItems(items);
                    this._widget.reveal(items[items.length - 1]);
                }
            };
            const listener = model.onDidUpdate(updateBreadcrumbs);
            const configListener = this._cfShowIcons.onDidChange(updateBreadcrumbs);
            updateBreadcrumbs();
            this._breadcrumbsDisposables.clear();
            this._breadcrumbsDisposables.add(listener);
            this._breadcrumbsDisposables.add((0, lifecycle_1.toDisposable)(() => this._model.clear()));
            this._breadcrumbsDisposables.add(configListener);
            this._breadcrumbsDisposables.add((0, lifecycle_1.toDisposable)(() => this._widget.setItems([])));
            const updateScrollbarSizing = () => {
                const sizing = this._cfTitleScrollbarSizing.getValue() ?? 'default';
                this._widget.setHorizontalScrollbarSize(BreadcrumbsControl_1.SCROLLBAR_SIZES[sizing]);
            };
            updateScrollbarSizing();
            const updateScrollbarSizeListener = this._cfTitleScrollbarSizing.onDidChange(updateScrollbarSizing);
            this._breadcrumbsDisposables.add(updateScrollbarSizeListener);
            // close picker on hide/update
            this._breadcrumbsDisposables.add({
                dispose: () => {
                    if (this._breadcrumbsPickerShowing) {
                        this._contextViewService.hideContextView({ source: this });
                    }
                }
            });
            return wasHidden !== this.isHidden();
        }
        _onFocusEvent(event) {
            if (event.item && this._breadcrumbsPickerShowing) {
                this._breadcrumbsPickerIgnoreOnceItem = undefined;
                this._widget.setSelection(event.item);
            }
        }
        _onSelectEvent(event) {
            if (!event.item) {
                return;
            }
            if (event.item === this._breadcrumbsPickerIgnoreOnceItem) {
                this._breadcrumbsPickerIgnoreOnceItem = undefined;
                this._widget.setFocused(undefined);
                this._widget.setSelection(undefined);
                return;
            }
            const { element } = event.item;
            this._editorGroup.focus();
            const group = this._getEditorGroup(event.payload);
            if (group !== undefined) {
                // reveal the item
                this._widget.setFocused(undefined);
                this._widget.setSelection(undefined);
                this._revealInEditor(event, element, group);
                return;
            }
            if (this._cfUseQuickPick.getValue()) {
                // using quick pick
                this._widget.setFocused(undefined);
                this._widget.setSelection(undefined);
                this._quickInputService.quickAccess.show(element instanceof breadcrumbsModel_1.OutlineElement2 ? '@' : '');
                return;
            }
            // show picker
            let picker;
            let pickerAnchor;
            this._contextViewService.showContextView({
                render: (parent) => {
                    if (event.item instanceof FileItem) {
                        picker = this._instantiationService.createInstance(breadcrumbsPicker_1.BreadcrumbsFilePicker, parent, event.item.model.resource);
                    }
                    else if (event.item instanceof OutlineItem) {
                        picker = this._instantiationService.createInstance(breadcrumbsPicker_1.BreadcrumbsOutlinePicker, parent, event.item.model.resource);
                    }
                    const selectListener = picker.onWillPickElement(() => this._contextViewService.hideContextView({ source: this, didPick: true }));
                    const zoomListener = browser_1.PixelRatio.onDidChange(() => this._contextViewService.hideContextView({ source: this }));
                    const focusTracker = dom.trackFocus(parent);
                    const blurListener = focusTracker.onDidBlur(() => {
                        this._breadcrumbsPickerIgnoreOnceItem = this._widget.isDOMFocused() ? event.item : undefined;
                        this._contextViewService.hideContextView({ source: this });
                    });
                    this._breadcrumbsPickerShowing = true;
                    this._updateCkBreadcrumbsActive();
                    return (0, lifecycle_1.combinedDisposable)(picker, selectListener, zoomListener, focusTracker, blurListener);
                },
                getAnchor: () => {
                    if (!pickerAnchor) {
                        const window = dom.getWindow(this.domNode);
                        const maxInnerWidth = window.innerWidth - 8 /*a little less the full widget*/;
                        let maxHeight = Math.min(window.innerHeight * 0.7, 300);
                        const pickerWidth = Math.min(maxInnerWidth, Math.max(240, maxInnerWidth / 4.17));
                        const pickerArrowSize = 8;
                        let pickerArrowOffset;
                        const data = dom.getDomNodePagePosition(event.node.firstChild);
                        const y = data.top + data.height + pickerArrowSize;
                        if (y + maxHeight >= window.innerHeight) {
                            maxHeight = window.innerHeight - y - 30 /* room for shadow and status bar*/;
                        }
                        let x = data.left;
                        if (x + pickerWidth >= maxInnerWidth) {
                            x = maxInnerWidth - pickerWidth;
                        }
                        if (event.payload instanceof mouseEvent_1.StandardMouseEvent) {
                            const maxPickerArrowOffset = pickerWidth - 2 * pickerArrowSize;
                            pickerArrowOffset = event.payload.posx - x;
                            if (pickerArrowOffset > maxPickerArrowOffset) {
                                x = Math.min(maxInnerWidth - pickerWidth, x + pickerArrowOffset - maxPickerArrowOffset);
                                pickerArrowOffset = maxPickerArrowOffset;
                            }
                        }
                        else {
                            pickerArrowOffset = (data.left + (data.width * 0.3)) - x;
                        }
                        picker.show(element, maxHeight, pickerWidth, pickerArrowSize, Math.max(0, pickerArrowOffset));
                        pickerAnchor = { x, y };
                    }
                    return pickerAnchor;
                },
                onHide: (data) => {
                    if (!data?.didPick) {
                        picker.restoreViewState();
                    }
                    this._breadcrumbsPickerShowing = false;
                    this._updateCkBreadcrumbsActive();
                    if (data?.source === this) {
                        this._widget.setFocused(undefined);
                        this._widget.setSelection(undefined);
                    }
                    picker.dispose();
                }
            });
        }
        _updateCkBreadcrumbsActive() {
            const value = this._widget.isDOMFocused() || this._breadcrumbsPickerShowing;
            this._ckBreadcrumbsActive.set(value);
        }
        async _revealInEditor(event, element, group, pinned = false) {
            if (element instanceof breadcrumbsModel_1.FileElement) {
                if (element.kind === files_1.FileKind.FILE) {
                    await this._editorService.openEditor({ resource: element.uri, options: { pinned } }, group);
                }
                else {
                    // show next picker
                    const items = this._widget.getItems();
                    const idx = items.indexOf(event.item);
                    this._widget.setFocused(items[idx + 1]);
                    this._widget.setSelection(items[idx + 1], BreadcrumbsControl_1.Payload_Pick);
                }
            }
            else {
                element.outline.reveal(element, { pinned }, group === editorService_1.SIDE_GROUP);
            }
        }
        _getEditorGroup(data) {
            if (data === BreadcrumbsControl_1.Payload_RevealAside) {
                return editorService_1.SIDE_GROUP;
            }
            else if (data === BreadcrumbsControl_1.Payload_Reveal) {
                return editorService_1.ACTIVE_GROUP;
            }
            else {
                return undefined;
            }
        }
    };
    exports.BreadcrumbsControl = BreadcrumbsControl;
    exports.BreadcrumbsControl = BreadcrumbsControl = BreadcrumbsControl_1 = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, contextView_1.IContextViewService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, quickInput_1.IQuickInputService),
        __param(7, files_1.IFileService),
        __param(8, editorService_1.IEditorService),
        __param(9, label_1.ILabelService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, breadcrumbs_1.IBreadcrumbsService)
    ], BreadcrumbsControl);
    let BreadcrumbsControlFactory = class BreadcrumbsControlFactory {
        get control() { return this._control; }
        get onDidEnablementChange() { return this._onDidEnablementChange.event; }
        get onDidVisibilityChange() { return this._onDidVisibilityChange.event; }
        constructor(_container, _editorGroup, _options, configurationService, _instantiationService, fileService) {
            this._container = _container;
            this._editorGroup = _editorGroup;
            this._options = _options;
            this._instantiationService = _instantiationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._controlDisposables = new lifecycle_1.DisposableStore();
            this._onDidEnablementChange = this._disposables.add(new event_1.Emitter());
            this._onDidVisibilityChange = this._disposables.add(new event_1.Emitter());
            const config = this._disposables.add(breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(configurationService));
            this._disposables.add(config.onDidChange(() => {
                const value = config.getValue();
                if (!value && this._control) {
                    this._controlDisposables.clear();
                    this._control = undefined;
                    this._onDidEnablementChange.fire();
                }
                else if (value && !this._control) {
                    this._control = this.createControl();
                    this._control.update();
                    this._onDidEnablementChange.fire();
                }
            }));
            if (config.getValue()) {
                this._control = this.createControl();
            }
            this._disposables.add(fileService.onDidChangeFileSystemProviderRegistrations(e => {
                if (this._control?.model && this._control.model.resource.scheme !== e.scheme) {
                    // ignore if the scheme of the breadcrumbs resource is not affected
                    return;
                }
                if (this._control?.update()) {
                    this._onDidEnablementChange.fire();
                }
            }));
        }
        createControl() {
            const control = this._controlDisposables.add(this._instantiationService.createInstance(BreadcrumbsControl, this._container, this._options, this._editorGroup));
            this._controlDisposables.add(control.onDidVisibilityChange(() => this._onDidVisibilityChange.fire()));
            return control;
        }
        dispose() {
            this._disposables.dispose();
            this._controlDisposables.dispose();
        }
    };
    exports.BreadcrumbsControlFactory = BreadcrumbsControlFactory;
    exports.BreadcrumbsControlFactory = BreadcrumbsControlFactory = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, files_1.IFileService)
    ], BreadcrumbsControlFactory);
    //#region commands
    // toggle command
    (0, actions_1.registerAction2)(class ToggleBreadcrumb extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.toggle',
                title: {
                    value: (0, nls_1.localize)('cmd.toggle', "Toggle Breadcrumbs"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miBreadcrumbs', comment: ['&& denotes a mnemonic'] }, "Toggle &&Breadcrumbs"),
                    original: 'Toggle Breadcrumbs',
                },
                category: actionCommonCategories_1.Categories.View,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.breadcrumbs.enabled', true),
                    title: (0, nls_1.localize)('cmd.toggle2', "Breadcrumbs"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miBreadcrumbs2', comment: ['&& denotes a mnemonic'] }, "&&Breadcrumbs")
                },
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: actions_1.MenuId.MenubarAppearanceMenu, group: '4_editor', order: 2 },
                    { id: actions_1.MenuId.NotebookToolbar, group: 'notebookLayout', order: 2 },
                    { id: actions_1.MenuId.StickyScrollContext }
                ]
            });
        }
        run(accessor) {
            const config = accessor.get(configuration_1.IConfigurationService);
            const value = breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(config).getValue();
            breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(config).updateValue(!value);
        }
    });
    // focus/focus-and-select
    function focusAndSelectHandler(accessor, select) {
        // find widget and focus/select
        const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
        const widget = breadcrumbs.getWidget(groups.activeGroup.id);
        if (widget) {
            const item = (0, arrays_1.tail)(widget.getItems());
            widget.setFocused(item);
            if (select) {
                widget.setSelection(item, BreadcrumbsControl.Payload_Pick);
            }
        }
    }
    (0, actions_1.registerAction2)(class FocusAndSelectBreadcrumbs extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.focusAndSelect',
                title: {
                    value: (0, nls_1.localize)('cmd.focusAndSelect', "Focus and Select Breadcrumbs"),
                    original: 'Focus and Select Breadcrumbs'
                },
                precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
                    when: BreadcrumbsControl.CK_BreadcrumbsPossible,
                },
                f1: true
            });
        }
        run(accessor, ...args) {
            focusAndSelectHandler(accessor, true);
        }
    });
    (0, actions_1.registerAction2)(class FocusBreadcrumbs extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.focus',
                title: {
                    value: (0, nls_1.localize)('cmd.focus', "Focus Breadcrumbs"),
                    original: 'Focus Breadcrumbs'
                },
                precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 85 /* KeyCode.Semicolon */,
                    when: BreadcrumbsControl.CK_BreadcrumbsPossible,
                },
                f1: true
            });
        }
        run(accessor, ...args) {
            focusAndSelectHandler(accessor, false);
        }
    });
    // this commands is only enabled when breadcrumbs are
    // disabled which it then enables and focuses
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.toggleToOn',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
        when: contextkey_1.ContextKeyExpr.not('config.breadcrumbs.enabled'),
        handler: async (accessor) => {
            const instant = accessor.get(instantiation_1.IInstantiationService);
            const config = accessor.get(configuration_1.IConfigurationService);
            // check if enabled and iff not enable
            const isEnabled = breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(config);
            if (!isEnabled.getValue()) {
                await isEnabled.updateValue(true);
                await (0, async_1.timeout)(50); // hacky - the widget might not be ready yet...
            }
            return instant.invokeFunction(focusAndSelectHandler, true);
        }
    });
    // navigation
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */],
        mac: {
            primary: 17 /* KeyCode.RightArrow */,
            secondary: [512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */],
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusNext();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */],
        mac: {
            primary: 15 /* KeyCode.LeftArrow */,
            secondary: [512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */],
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusPrev();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusNextWithPicker',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
        mac: {
            primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, listService_1.WorkbenchListFocusContextKey),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusNext();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusPreviousWithPicker',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, listService_1.WorkbenchListFocusContextKey),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusPrev();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.selectFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 3 /* KeyCode.Enter */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setSelection(widget.getFocused(), BreadcrumbsControl.Payload_Pick);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.revealFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 10 /* KeyCode.Space */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */],
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setSelection(widget.getFocused(), BreadcrumbsControl.Payload_Reveal);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.selectEditor',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 9 /* KeyCode.Escape */,
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setFocused(undefined);
            widget.setSelection(undefined);
            groups.activeGroup.activeEditorPane?.focus();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.revealFocusedFromTreeAside',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, listService_1.WorkbenchListFocusContextKey),
        handler(accessor) {
            const editors = accessor.get(editorService_1.IEditorService);
            const lists = accessor.get(listService_1.IListService);
            const tree = lists.lastFocusedList;
            if (!(tree instanceof listService_1.WorkbenchDataTree) && !(tree instanceof listService_1.WorkbenchAsyncDataTree)) {
                return;
            }
            const element = tree.getFocus()[0];
            if (uri_1.URI.isUri(element?.resource)) {
                // IFileStat: open file in editor
                return editors.openEditor({
                    resource: element.resource,
                    options: { pinned: true }
                }, editorService_1.SIDE_GROUP);
            }
            // IOutline: check if this the outline and iff so reveal element
            const input = tree.getInput();
            if (input && typeof input.outlineKind === 'string') {
                return input.reveal(element, {
                    pinned: true,
                    preserveFocus: false
                }, true);
            }
        }
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYnNDb250cm9sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvYnJlYWRjcnVtYnNDb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF3Q2hHLE1BQU0sV0FBWSxTQUFRLG1DQUFlO1FBSXhDLFlBQ1UsS0FBdUIsRUFDdkIsT0FBd0IsRUFDeEIsT0FBbUM7WUFFNUMsS0FBSyxFQUFFLENBQUM7WUFKQyxVQUFLLEdBQUwsS0FBSyxDQUFrQjtZQUN2QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtZQUN4QixZQUFPLEdBQVAsT0FBTyxDQUE0QjtZQUw1QixpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBUXRELENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQXNCO1lBQzVCLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTztnQkFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztRQUNqRSxDQUFDO1FBRUQsTUFBTSxDQUFDLFNBQXNCO1lBQzVCLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUUxQyxJ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