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
define(["require", "exports", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/splitview/splitview", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/common/views", "vs/platform/terminal/common/terminal", "vs/base/browser/dom", "vs/workbench/services/views/browser/viewsService"], function (require, exports, terminal_1, event_1, lifecycle_1, splitview_1, layoutService_1, instantiation_1, terminal_2, views_1, terminal_3, dom_1, viewsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalGroup = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The minimum size in pixels of a split pane.
         */
        Constants[Constants["SplitPaneMinSize"] = 80] = "SplitPaneMinSize";
        /**
         * The number of cells the terminal gets added or removed when asked to increase or decrease
         * the view size.
         */
        Constants[Constants["ResizePartCellCount"] = 4] = "ResizePartCellCount";
    })(Constants || (Constants = {}));
    let SplitPaneContainer = class SplitPaneContainer extends lifecycle_1.Disposable {
        get onDidChange() { return this._onDidChange; }
        constructor(_container, orientation, _layoutService) {
            super();
            this._container = _container;
            this.orientation = orientation;
            this._layoutService = _layoutService;
            this._splitViewDisposables = this._register(new lifecycle_1.DisposableStore());
            this._children = [];
            this._terminalToPane = new Map();
            this._onDidChange = event_1.Event.None;
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;
            this._createSplitView();
            this._splitView.layout(this.orientation === 1 /* Orientation.HORIZONTAL */ ? this._width : this._height);
        }
        _createSplitView() {
            this._splitView = new splitview_1.SplitView(this._container, { orientation: this.orientation });
            this._splitViewDisposables.clear();
            this._splitViewDisposables.add(this._splitView.onDidSashReset(() => this._splitView.distributeViewSizes()));
        }
        split(instance, index) {
            this._addChild(instance, index);
        }
        resizePane(index, direction, amount, part) {
            const isHorizontal = (direction === 0 /* Direction.Left */) || (direction === 1 /* Direction.Right */);
            if ((isHorizontal && this.orientation !== 1 /* Orientation.HORIZONTAL */) ||
                (!isHorizontal && this.orientation !== 0 /* Orientation.VERTICAL */)) {
                // Resize the entire pane as a whole
                if ((this.orientation === 1 /* Orientation.HORIZONTAL */ && direction === 3 /* Direction.Down */) ||
                    (part === "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ && direction === 0 /* Direction.Left */) ||
                    (part === "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */ && direction === 1 /* Direction.Right */)) {
                    amount *= -1;
                }
                this._layoutService.resizePart(part, amount, amount);
                return;
            }
            // Resize left/right in horizontal or up/down in vertical
            // Only resize when there is more than one pane
            if (this._children.length <= 1) {
                return;
            }
            // Get sizes
            const sizes = [];
            for (let i = 0; i < this._splitView.length; i++) {
                sizes.push(this._splitView.getViewSize(i));
            }
            // Remove size from right pane, unless index is the last pane in which case use left pane
            const isSizingEndPane = index !== this._children.length - 1;
            const indexToChange = isSizingEndPane ? index + 1 : index - 1;
            if (isSizingEndPane && direction === 0 /* Direction.Left */) {
                amount *= -1;
            }
            else if (!isSizingEndPane && direction === 1 /* Direction.Right */) {
                amount *= -1;
            }
            else if (isSizingEndPane && direction === 2 /* Direction.Up */) {
                amount *= -1;
            }
            else if (!isSizingEndPane && direction === 3 /* Direction.Down */) {
                amount *= -1;
            }
            // Ensure the size is not reduced beyond the minimum, otherwise weird things can happen
            if (sizes[index] + amount < 80 /* Constants.SplitPaneMinSize */) {
                amount = 80 /* Constants.SplitPaneMinSize */ - sizes[index];
            }
            else if (sizes[indexToChange] - amount < 80 /* Constants.SplitPaneMinSize */) {
                amount = sizes[indexToChange] - 80 /* Constants.SplitPaneMinSize */;
            }
            // Apply the size change
            sizes[index] += amount;
            sizes[indexToChange] -= amount;
            for (let i = 0; i < this._splitView.length - 1; i++) {
                this._splitView.resizeView(i, sizes[i]);
            }
        }
        resizePanes(relativeSizes) {
            if (this._children.length <= 1) {
                return;
            }
            // assign any extra size to last terminal
            relativeSizes[relativeSizes.length - 1] += 1 - relativeSizes.reduce((totalValue, currentValue) => totalValue + currentValue, 0);
            let totalSize = 0;
            for (let i = 0; i < this._splitView.length; i++) {
                totalSize += this._splitView.getViewSize(i);
            }
            for (let i = 0; i < this._splitView.length; i++) {
                this._splitView.resizeView(i, totalSize * relativeSizes[i]);
            }
        }
        getPaneSize(instance) {
            const paneForInstance = this._terminalToPane.get(instance);
            if (!paneForInstance) {
                return 0;
            }
            const index = this._children.indexOf(paneForInstance);
            return this._splitView.getViewSize(index);
        }
        _addChild(instance, index) {
            const child = new SplitPane(instance, this.orientation === 1 /* Orientation.HORIZONTAL */ ? this._height : this._width);
            child.orientation = this.orientation;
            if (typeof index === 'number') {
                this._children.splice(index, 0, child);
            }
            else {
                this._children.push(child);
            }
            this._terminalToPane.set(instance, this._children[this._children.indexOf(child)]);
            this._withDisabledLayout(() => this._splitView.addView(child, splitview_1.Sizing.Distribute, index));
            this.layout(this._width, this._height);
            this._onDidChange = event_1.Event.any(...this._children.map(c => c.onDidChange));
        }
        remove(instance) {
            let index = null;
            for (let i = 0; i < this._children.length; i++) {
                if (this._children[i].instance === instance) {
                    index = i;
                }
            }
            if (index !== null) {
                this._children.splice(index, 1);
                this._terminalToPane.delete(instance);
                this._splitView.removeView(index, splitview_1.Sizing.Distribute);
                instance.detachFromElement();
            }
        }
        layout(width, height) {
            this._width = width;
            this._height = height;
            if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                this._children.forEach(c => c.orthogonalLayout(height));
                this._splitView.layout(width);
            }
            else {
                this._children.forEach(c => c.orthogonalLayout(width));
                this._splitView.layout(height);
            }
        }
        setOrientation(orientation) {
            if (this.orientation === orientation) {
                return;
            }
            this.orientation = orientation;
            // Remove old split view
            while (this._container.children.length > 0) {
                this._container.removeChild(this._container.children[0]);
            }
            this._splitViewDisposables.clear();
            this._splitView.dispose();
            // Create new split view with updated orientation
            this._createSplitView();
            this._withDisabledLayout(() => {
                this._children.forEach(child => {
                    child.orientation = orientation;
                    this._splitView.addView(child, 1);
                });
            });
        }
        _withDisabledLayout(innerFunction) {
            // Whenever manipulating views that are going to be changed immediately, disabling
            // layout/resize events in the terminal prevent bad dimensions going to the pty.
            this._children.forEach(c => c.instance.disableLayout = true);
            innerFunction();
            this._children.forEach(c => c.instance.disableLayout = false);
        }
    };
    SplitPaneContainer = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], SplitPaneContainer);
    class SplitPane {
        get onDidChange() { return this._onDidChange; }
        constructor(instance, orthogonalSize) {
            this.instance = instance;
            this.orthogonalSize = orthogonalSize;
            this.minimumSize = 80 /* Constants.SplitPaneMinSize */;
            this.maximumSize = Number.MAX_VALUE;
            this._onDidChange = event_1.Event.None;
            this.element = document.createElement('div');
            this.element.className = 'terminal-split-pane';
            this.instance.attachToElement(this.element);
        }
        layout(size) {
            // Only layout when both sizes are known
            if (!size || !this.orthogonalSize) {
                return;
            }
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.instance.layout({ width: this.orthogonalSize, height: size });
            }
            else {
                this.instance.layout({ width: size, height: this.orthogonalSize });
            }
        }
        orthogonalLayout(size) {
            this.orthogonalSize = size;
        }
    }
    let TerminalGroup = class TerminalGroup extends lifecycle_1.Disposable {
        get terminalInstances() { return this._terminalInstances; }
        constructor(_container, shellLaunchConfigOrInstance, _terminalService, _terminalInstanceService, _layoutService, _viewDescriptorService, _instantiationService) {
            super();
            this._container = _container;
            this._terminalService = _terminalService;
            this._terminalInstanceService = _terminalInstanceService;
            this._layoutService = _layoutService;
            this._viewDescriptorService = _viewDescriptorService;
            this._instantiationService = _instantiationService;
            this._terminalInstances = [];
            this._panelPosition = 2 /* Position.BOTTOM */;
            this._terminalLocation = 1 /* ViewContainerLocation.Panel */;
            this._instanceDisposables = new Map();
            this._activeInstanceIndex = -1;
            this._visible = false;
            this._onDidDisposeInstance = this._register(new event_1.Emitter());
            this.onDidDisposeInstance = this._onDidDisposeInstance.event;
            this._onDidFocusInstance = this._register(new event_1.Emitter());
            this.onDidFocusInstance = this._onDidFocusInstance.event;
            this._onDidChangeInstanceCapability = this._register(new event_1.Emitter());
            this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
            this._onDisposed = this._register(new event_1.Emitter());
            this.onDisposed = this._onDisposed.event;
            this._onInstancesChanged = this._register(new event_1.Emitter());
            this.onInstancesChanged = this._onInstancesChanged.event;
            this._onDidChangeActiveInstance = this._register(new event_1.Emitter());
            this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
            this._onPanelOrientationChanged = this._register(new event_1.Emitter());
            this.onPanelOrientationChanged = this._onPanelOrientationChanged.event;
            if (shellLaunchConfigOrInstance) {
                this.addInstance(shellLaunchConfigOrInstance);
            }
            if (this._container) {
                this.attachToElement(this._container);
            }
            this._onPanelOrientationChanged.fire(this._terminalLocation === 1 /* ViewContainerLocation.Panel */ && this._panelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */);
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this._container && this._groupElement) {
                    this._container.removeChild(this._groupElement);
                    this._groupElement = undefined;
                }
            }));
        }
        addInstance(shellLaunchConfigOrInstance, parentTerminalId) {
            let instance;
            // if a parent terminal is provided, find it
            // otherwise, parent is the active terminal
            const parentIndex = parentTerminalId ? this._terminalInstances.findIndex(t => t.instanceId === parentTerminalId) : this._activeInstanceIndex;
            if ('instanceId' in shellLaunchConfigOrInstance) {
                instance = shellLaunchConfigOrInstance;
            }
            else {
                instance = this._terminalInstanceService.createInstance(shellLaunchConfigOrInstance, terminal_3.TerminalLocation.Panel);
            }
            if (this._terminalInstances.length === 0) {
                this._terminalInstances.push(instance);
                this._activeInstanceIndex = 0;
            }
            else {
                this._terminalInstances.splice(parentIndex + 1, 0, instance);
            }
            this._initInstanceListeners(instance);
            if (this._splitPaneContainer) {
                this._splitPaneContainer.split(instance, parentIndex + 1);
            }
            this._onInstancesChanged.fire();
        }
        dispose() {
            this._terminalInstances = [];
            this._onInstancesChanged.fire();
            super.dispose();
        }
        get activeInstance() {
            if (this._terminalInstances.length === 0) {
                return undefined;
            }
            return this._terminalInstances[this._activeInstanceIndex];
        }
        getLayoutInfo(isActive) {
            const instances = this.terminalInstances.filter(instance => typeof instance.persistentProcessId === 'number' && instance.shouldPersist);
            const totalSize = instances.map(t => this._splitPaneContainer?.getPaneSize(t) || 0).reduce((total, size) => total += size, 0);
            return {
                isActive: isActive,
                activePersistentProcessId: this.activeInstance ? this.activeInstance.persistentProcessId : undefined,
                terminals: instances.map(t => {
                    return {
                        relativeSize: totalSize > 0 ? this._splitPaneContainer.getPaneSize(t) / totalSize : 0,
                        terminal: t.persistentProcessId || 0
                    };
                })
            };
        }
        _initInstanceListeners(instance) {
            this._instanceDisposables.set(instance.instanceId, [
                instance.onDisposed(instance => {
                    this._onDidDisposeInstance.fire(instance);
                    this._handleOnDidDisposeInstance(instance);
                }),
                instance.onDidFocus(instance => {
                    this._setActiveInstance(instance);
                    this._onDidFocusInstance.fire(instance);
                }),
                instance.capabilities.onDidAddCapabilityType(() => this._onDidChangeInstanceCapability.fire(instance)),
                instance.capabilities.onDidRemoveCapabilityType(() => this._onDidChangeInstanceCapability.fire(instance)),
            ]);
        }
        _handleOnDidDisposeInstance(instance) {
            this._removeInstance(instance);
        }
        removeInstance(instance) {
            this._removeInstance(instance);
        }
        _removeInstance(instance) {
            const index = this._terminalInstances.indexOf(instance);
            if (index === -1) {
                return;
            }
            const wasActiveInstance = instance === this.activeInstance;
            this._terminalInstances.splice(index, 1);
            // Adjust focus if the instance was active
            if (wasActiveInstance && this._terminalInstances.length > 0) {
                const newIndex = index < this._terminalInstances.length ? index : this._terminalInstances.length - 1;
                this.setActiveInstanceByIndex(newIndex);
                // TODO: Only focus the new instance if the group had focus?
                this.activeInstance?.focus(true);
            }
            else if (index < this._activeInstanceIndex) {
                // Adjust active instance index if needed
                this._activeInstanceIndex--;
            }
            this._splitPaneContainer?.remove(instance);
            // Fire events and dispose group if it was the last instance
            if (this._terminalInstances.length === 0) {
                this._onDisposed.fire(this);
                this.dispose();
            }
            else {
                this._onInstancesChanged.fire();
            }
            // Dispose instance event listeners
            const disposables = this._instanceDisposables.get(instance.instanceId);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
                this._instanceDisposables.delete(instance.instanceId);
            }
        }
        moveInstance(instance, index) {
            const sourceIndex = this.terminalInstances.indexOf(instance);
            if (sourceIndex === -1) {
                return;
            }
            this._terminalInstances.splice(sourceIndex, 1);
            this._terminalInstances.splice(index, 0, instance);
            if (this._splitPaneContainer) {
                this._splitPaneContainer.remove(instance);
                this._splitPaneContainer.split(instance, index);
            }
            this._onInstancesChanged.fire();
        }
        _setActiveInstance(instance) {
            this.setActiveInstanceByIndex(this._getIndexFromId(instance.instanceId));
        }
        _getIndexFromId(terminalId) {
            let terminalIndex = -1;
            this.terminalInstances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        setActiveInstanceByIndex(index, force) {
            // Check for invalid value
            if (index < 0 || index >= this._terminalInstances.length) {
                return;
            }
            const oldActiveInstance = this.activeInstance;
            this._activeInstanceIndex = index;
            if (oldActiveInstance !== this.activeInstance || force) {
                this._onInstancesChanged.fire();
                this._onDidChangeActiveInstance.fire(this.activeInstance);
            }
        }
        attachToElement(element) {
            this._container = element;
            // If we already have a group element, we can reparent it
            if (!this._groupElement) {
                this._groupElement = document.createElement('div');
                this._groupElement.classList.add('terminal-group');
            }
            this._container.appendChild(this._groupElement);
            if (!this._splitPaneContainer) {
                this._panelPosition = this._layoutService.getPanelPosition();
                this._terminalLocation = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID);
                const orientation = this._terminalLocation === 1 /* ViewContainerLocation.Panel */ && this._panelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
                this._splitPaneContainer = this._instantiationService.createInstance(SplitPaneContainer, this._groupElement, orientation);
                this.terminalInstances.forEach(instance => this._splitPaneContainer.split(instance, this._activeInstanceIndex + 1));
            }
        }
        get title() {
            if (this._terminalInstances.length === 0) {
                // Normally consumers should not call into title at all after the group is disposed but
                // this is required when the group is used as part of a tree.
                return '';
            }
            let title = this.terminalInstances[0].title + this._getBellTitle(this.terminalInstances[0]);
            if (this.terminalInstances[0].description) {
                title += ` (${this.terminalInstances[0].description})`;
            }
            for (let i = 1; i < this.terminalInstances.length; i++) {
                const instance = this.terminalInstances[i];
                if (instance.title) {
                    title += `, ${instance.title + this._getBellTitle(instance)}`;
                    if (instance.description) {
                        title += ` (${instance.description})`;
                    }
                }
            }
            return title;
        }
        _getBellTitle(instance) {
            if (this._terminalService.configHelper.config.enableBell && instance.statusList.statuses.some(e => e.id === "bell" /* TerminalStatus.Bell */)) {
                return '*';
            }
            return '';
        }
        setVisible(visible) {
            this._visible = visible;
            if (this._groupElement) {
                this._groupElement.style.display = visible ? '' : 'none';
            }
            this.terminalInstances.forEach(i => i.setVisible(visible));
        }
        split(shellLaunchConfig) {
            const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_3.TerminalLocation.Panel);
            this.addInstance(instance, shellLaunchConfig.parentTerminalId);
            this._setActiveInstance(instance);
            return instance;
        }
        addDisposable(disposable) {
            this._register(disposable);
        }
        layout(width, height) {
            if (this._splitPaneContainer) {
                // Check if the panel position changed and rotate panes if so
                const newPanelPosition = this._layoutService.getPanelPosition();
                const newTerminalLocation = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID);
                const terminalPositionChanged = newPanelPosition !== this._panelPosition || newTerminalLocation !== this._terminalLocation;
                if (terminalPositionChanged) {
                    const newOrientation = newTerminalLocation === 1 /* ViewContainerLocation.Panel */ && newPanelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
                    this._splitPaneContainer.setOrientation(newOrientation);
                    this._panelPosition = newPanelPosition;
                    this._terminalLocation = newTerminalLocation;
                    this._onPanelOrientationChanged.fire(this._splitPaneContainer.orientation);
                }
                this._splitPaneContainer.layout(width, height);
                if (this._initialRelativeSizes && this._visible) {
                    this.resizePanes(this._initialRelativeSizes);
                    this._initialRelativeSizes = undefined;
                }
            }
        }
        focusPreviousPane() {
            const newIndex = this._activeInstanceIndex === 0 ? this._terminalInstances.length - 1 : this._activeInstanceIndex - 1;
            this.setActiveInstanceByIndex(newIndex);
        }
        focusNextPane() {
            const newIndex = this._activeInstanceIndex === this._terminalInstances.length - 1 ? 0 : this._activeInstanceIndex + 1;
            this.setActiveInstanceByIndex(newIndex);
        }
        resizePane(direction) {
            if (!this._splitPaneContainer) {
                return;
            }
            const isHorizontal = (direction === 0 /* Direction.Left */ || direction === 1 /* Direction.Right */);
            const font = this._terminalService.configHelper.getFont((0, dom_1.getWindow)(this._groupElement));
            // TODO: Support letter spacing and line height
            const charSize = (isHorizontal ? font.charWidth : font.charHeight);
            if (charSize) {
                this._splitPaneContainer.resizePane(this._activeInstanceIndex, direction, charSize * 4 /* Constants.ResizePartCellCount */, (0, viewsService_1.getPartByLocation)(this._terminalLocation));
            }
        }
        resizePanes(relativeSizes) {
            if (!this._splitPaneContainer) {
                this._initialRelativeSizes = relativeSizes;
                return;
            }
            this._splitPaneContainer.resizePanes(relativeSizes);
        }
    };
    exports.TerminalGroup = TerminalGroup;
    exports.TerminalGroup = TerminalGroup = __decorate([
        __param(2, terminal_2.ITerminalService),
        __param(3, terminal_2.ITerminalInstanceService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService)
    ], TerminalGroup);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxHcm91cC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbEdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWVoRyxJQUFXLFNBVVY7SUFWRCxXQUFXLFNBQVM7UUFDbkI7O1dBRUc7UUFDSCxrRUFBcUIsQ0FBQTtRQUNyQjs7O1dBR0c7UUFDSCx1RUFBdUIsQ0FBQTtJQUN4QixDQUFDLEVBVlUsU0FBUyxLQUFULFNBQVMsUUFVbkI7SUFFRCxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFVO1FBUzFDLElBQUksV0FBVyxLQUFnQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRTFFLFlBQ1MsVUFBdUIsRUFDeEIsV0FBd0IsRUFDTixjQUF3RDtZQUVqRixLQUFLLEVBQUUsQ0FBQztZQUpBLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDVyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFWakUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLGNBQVMsR0FBZ0IsRUFBRSxDQUFDO1lBQzVCLG9CQUFlLEdBQXNDLElBQUksR0FBRyxFQUFFLENBQUM7WUFFL0QsaUJBQVksR0FBOEIsYUFBSyxDQUFDLElBQUksQ0FBQztZQVM1RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDNUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsbUNBQTJCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBRU8sZ0JBQWdCO1lBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBRUQsS0FBSyxDQUFDLFFBQTJCLEVBQUUsS0FBYTtZQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFvQixFQUFFLE1BQWMsRUFBRSxJQUFXO1lBQzFFLE1BQU0sWUFBWSxHQUFHLENBQUMsU0FBUywyQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyw0QkFBb0IsQ0FBQyxDQUFDO1lBRXZGLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFdBQVcsbUNBQTJCLENBQUM7Z0JBQ2hFLENBQUMsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFdBQVcsaUNBQXlCLENBQUMsRUFBRSxDQUFDO2dCQUMvRCxvQ0FBb0M7Z0JBQ3BDLElBQ0MsQ0FBQyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsSUFBSSxTQUFTLDJCQUFtQixDQUFDO29CQUM3RSxDQUFDLElBQUksdURBQXVCLElBQUksU0FBUywyQkFBbUIsQ0FBQztvQkFDN0QsQ0FBQyxJQUFJLGlFQUE0QixJQUFJLFNBQVMsNEJBQW9CLENBQUMsRUFDbEUsQ0FBQztvQkFDRixNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxPQUFPO1lBQ1IsQ0FBQztZQUVELHlEQUF5RDtZQUN6RCwrQ0FBK0M7WUFDL0MsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsT0FBTztZQUNSLENBQUM7WUFFRCxZQUFZO1lBQ1osTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUVELHlGQUF5RjtZQUN6RixNQUFNLGVBQWUsR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQzVELE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUM5RCxJQUFJLGVBQWUsSUFBSSxTQUFTLDJCQUFtQixFQUFFLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNkLENBQUM7aUJBQU0sSUFBSSxDQUFDLGVBQWUsSUFBSSxTQUFTLDRCQUFvQixFQUFFLENBQUM7Z0JBQzlELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNkLENBQUM7aUJBQU0sSUFBSSxlQUFlLElBQUksU0FBUyx5QkFBaUIsRUFBRSxDQUFDO2dCQUMxRCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDZCxDQUFDO2lCQUFNLElBQUksQ0FBQyxlQUFlLElBQUksU0FBUywyQkFBbUIsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDZCxDQUFDO1lBRUQsdUZBQXVGO1lBQ3ZGLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sc0NBQTZCLEVBQUUsQ0FBQztnQkFDeEQsTUFBTSxHQUFHLHNDQUE2QixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEQsQ0FBQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLHNDQUE2QixFQUFFLENBQUM7Z0JBQ3ZFLE1BQU0sR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLHNDQUE2QixDQUFDO1lBQzVELENBQUM7WUFFRCx3QkFBd0I7WUFDeEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQztZQUN2QixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksTUFBTSxDQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLGFBQXVCO1lBQ2xDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLE9BQU87WUFDUixDQUFDO1lBRUQseUNBQXlDO1lBQ3pDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsVUFBVSxHQUFHLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoSSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pELFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxTQUFTLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsQ0FBQztRQUNGLENBQUM7UUFFRCxXQUFXLENBQUMsUUFBMkI7WUFDdEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN0QixPQUFPLENBQUMsQ0FBQztZQUNWLENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN0RCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFTyxTQUFTLENBQUMsUUFBMkIsRUFBRSxLQUFhO1lBQzNELE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hILEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsa0JBQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXZDLElBQUksQ0FBQyxZQUFZLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUEyQjtZQUNqQyxJQUFJLEtBQUssR0FBa0IsSUFBSSxDQUFDO1lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUM3QyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNYLENBQUM7WUFDRixDQUFDO1lBQ0QsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxrQkFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyRCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM5QixDQUFDO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFhLEVBQUUsTUFBYztZQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLElBQUksQ0FBQyxXQUFXLG1DQUEyQixFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxDQUFDO1FBQ0YsQ0FBQztRQUVELGNBQWMsQ0FBQyxXQUF3QjtZQUN0QyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQ3RDLE9BQU87WUFDUixDQUFDO1lBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFFL0Isd0JBQXdCO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFDRCxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUxQixpREFBaUQ7WUFDakQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzlCLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO29CQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sbUJBQW1CLENBQUMsYUFBeUI7WUFDcEQsa0ZBQWtGO1lBQ2xGLGdGQUFnRjtZQUNoRixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzdELGFBQWEsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDL0QsQ0FBQztLQUNELENBQUE7SUE5TEssa0JBQWtCO1FBY3JCLFdBQUEsdUNBQXVCLENBQUE7T0FkcEIsa0JBQWtCLENBOEx2QjtJQUVELE1BQU0sU0FBUztRQU9kLElBQUksV0FBVyxLQUFnQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBSTFFLFlBQ1UsUUFBMkIsRUFDN0IsY0FBc0I7WUFEcEIsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDN0IsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFaOUIsZ0JBQVcsdUNBQXNDO1lBQ2pELGdCQUFXLEdBQVcsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUkvQixpQkFBWSxHQUE4QixhQUFLLENBQUMsSUFBSSxDQUFDO1lBUzVELElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztZQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFZO1lBQ2xCLHdDQUF3QztZQUN4QyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNuQyxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLFdBQVcsaUNBQXlCLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDO1FBQ0YsQ0FBQztRQUVELGdCQUFnQixDQUFDLElBQVk7WUFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDNUIsQ0FBQztLQUNEO0lBRU0sSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBVTVDLElBQUksaUJBQWlCLEtBQTBCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQW9CaEYsWUFDUyxVQUFtQyxFQUMzQywyQkFBK0UsRUFDN0QsZ0JBQW1ELEVBQzNDLHdCQUFtRSxFQUNwRSxjQUF3RCxFQUN6RCxzQkFBK0QsRUFDaEUscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBUkEsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7WUFFUixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQzFCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDbkQsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBQ3hDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFDL0MsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQXBDN0UsdUJBQWtCLEdBQXdCLEVBQUUsQ0FBQztZQUc3QyxtQkFBYywyQkFBNkI7WUFDM0Msc0JBQWlCLHVDQUFzRDtZQUN2RSx5QkFBb0IsR0FBK0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUU3RCx5QkFBb0IsR0FBVyxDQUFDLENBQUMsQ0FBQztZQUtsQyxhQUFRLEdBQVksS0FBSyxDQUFDO1lBRWpCLDBCQUFxQixHQUErQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDN0cseUJBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUNoRCx3QkFBbUIsR0FBK0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUIsQ0FBQyxDQUFDO1lBQzNHLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFDNUMsbUNBQThCLEdBQStCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUN0SCxrQ0FBNkIsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDO1lBQ2xFLGdCQUFXLEdBQTRCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUM3RixlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDNUIsd0JBQW1CLEdBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2pGLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFDNUMsK0JBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBaUMsQ0FBQyxDQUFDO1lBQ2xHLDhCQUF5QixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFDMUQsK0JBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDaEYsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQVkxRSxJQUFJLDJCQUEyQixFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxXQUFXLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsd0NBQWdDLElBQUksSUFBSSxDQUFDLGNBQWMsNEJBQW9CLENBQUMsQ0FBQyxnQ0FBd0IsQ0FBQyw2QkFBcUIsQ0FBQyxDQUFDO1lBQ3hMLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNoRCxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztnQkFDaEMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsV0FBVyxDQUFDLDJCQUFtRSxFQUFFLGdCQUF5QjtZQUN6RyxJQUFJLFFBQTJCLENBQUM7WUFDaEMsNENBQTRDO1lBQzVDLDJDQUEyQztZQUMzQyxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1lBQzdJLElBQUksWUFBWSxJQUFJLDJCQUEyQixFQUFFLENBQUM7Z0JBQ2pELFFBQVEsR0FBRywyQkFBMkIsQ0FBQztZQUN4QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsUUFBUSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsMkJBQTJCLEVBQUUsMkJBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUcsQ0FBQztZQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztZQUMvQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBQ0QsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXRDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLGNBQWM7WUFDakIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELGFBQWEsQ0FBQyxRQUFpQjtZQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxRQUFRLENBQUMsbUJBQW1CLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4SSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlILE9BQU87Z0JBQ04sUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLHlCQUF5QixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQ3BHLFNBQVMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUM1QixPQUFPO3dCQUNOLFlBQVksRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEYsUUFBUSxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDO3FCQUNwQyxDQUFDO2dCQUNILENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO1FBRU8sc0JBQXNCLENBQUMsUUFBMkI7WUFDekQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUNsRCxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUM5QixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzVDLENBQUMsQ0FBQztnQkFDRixRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUM5QixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pDLENBQUMsQ0FBQztnQkFDRixRQUFRLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RHLFFBQVEsQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN6RyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sMkJBQTJCLENBQUMsUUFBMkI7WUFDOUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsY0FBYyxDQUFDLFFBQTJCO1lBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVPLGVBQWUsQ0FBQyxRQUEyQjtZQUNsRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUMzRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV6QywwQ0FBMEM7WUFDMUMsSUFBSSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDckcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4Qyw0REFBNEQ7Z0JBQzVELElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLENBQUM7aUJBQU0sSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzlDLHlDQUF5QztnQkFDekMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDN0IsQ0FBQztZQUVELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFM0MsNERBQTREO1lBQzVELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxtQ0FBbUM7WUFDbkMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkUsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsSUFBQSxtQkFBTyxFQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2RCxDQUFDO1FBQ0YsQ0FBQztRQUVELFlBQVksQ0FBQyxRQUEyQixFQUFFLEtBQWE7WUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3RCxJQUFJLFdBQVcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN4QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxRQUEyQjtZQUNyRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRU8sZUFBZSxDQUFDLFVBQWtCO1lBQ3pDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEQsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFLENBQUM7b0JBQ2hELGFBQWEsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksYUFBYSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLFVBQVUsaURBQWlELENBQUMsQ0FBQztZQUNsRyxDQUFDO1lBQ0QsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVELHdCQUF3QixDQUFDLEtBQWEsRUFBRSxLQUFlO1lBQ3RELDBCQUEwQjtZQUMxQixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDMUQsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDOUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNsQyxJQUFJLGlCQUFpQixLQUFLLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNGLENBQUM7UUFFRCxlQUFlLENBQUMsT0FBb0I7WUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7WUFFMUIseURBQXlEO1lBQ3pELElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM3RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLDJCQUFnQixDQUFFLENBQUM7Z0JBQzVGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsd0NBQWdDLElBQUksSUFBSSxDQUFDLGNBQWMsNEJBQW9CLENBQUMsQ0FBQyxnQ0FBd0IsQ0FBQyw2QkFBcUIsQ0FBQztnQkFDdEssSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDMUgsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQ1IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMxQyx1RkFBdUY7Z0JBQ3ZGLDZEQUE2RDtnQkFDN0QsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMzQyxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUM7WUFDeEQsQ0FBQztZQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3BCLEtBQUssSUFBSSxLQUFLLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUM5RCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDMUIsS0FBSyxJQUFJLEtBQUssUUFBUSxDQUFDLFdBQVcsR0FBRyxDQUFDO29CQUN2QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sYUFBYSxDQUFDLFFBQTJCO1lBQ2hELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLHFDQUF3QixDQUFDLEVBQUUsQ0FBQztnQkFDbEksT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsVUFBVSxDQUFDLE9BQWdCO1lBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUMxRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGlCQUFxQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLDJCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxhQUFhLENBQUMsVUFBdUI7WUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQWEsRUFBRSxNQUFjO1lBQ25DLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQzlCLDZEQUE2RDtnQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLDJCQUFnQixDQUFFLENBQUM7Z0JBQy9GLE1BQU0sdUJBQXVCLEdBQUcsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLGNBQWMsSUFBSSxtQkFBbUIsS0FBSyxJQUFJLENBQUMsaUJBQWlCLENBQUM7Z0JBQzNILElBQUksdUJBQXVCLEVBQUUsQ0FBQztvQkFDN0IsTUFBTSxjQUFjLEdBQUcsbUJBQW1CLHdDQUFnQyxJQUFJLGdCQUFnQiw0QkFBb0IsQ0FBQyxDQUFDLGdDQUF3QixDQUFDLDZCQUFxQixDQUFDO29CQUNuSyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUN4RCxJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDO29CQUN2QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7b0JBQzdDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RSxDQUFDO2dCQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQzdDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxTQUFTLENBQUM7Z0JBQ3hDLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELGlCQUFpQjtZQUNoQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztZQUN0SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELGFBQWE7WUFDWixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEtBQUssSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztZQUN0SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELFVBQVUsQ0FBQyxTQUFvQjtZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQy9CLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxTQUFTLDJCQUFtQixJQUFJLFNBQVMsNEJBQW9CLENBQUMsQ0FBQztZQUNyRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFBLGVBQVMsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN2RiwrQ0FBK0M7WUFDL0MsTUFBTSxRQUFRLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRSxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxRQUFRLHdDQUFnQyxFQUFFLElBQUEsZ0NBQWlCLEVBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUNoSyxDQUFDO1FBQ0YsQ0FBQztRQUVELFdBQVcsQ0FBQyxhQUF1QjtZQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxhQUFhLENBQUM7Z0JBQzNDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQ0QsQ0FBQTtJQTlVWSxzQ0FBYTs0QkFBYixhQUFhO1FBaUN2QixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsbUNBQXdCLENBQUE7UUFDeEIsV0FBQSx1Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLDhCQUFzQixDQUFBO1FBQ3RCLFdBQUEscUNBQXFCLENBQUE7T0FyQ1gsYUFBYSxDQThVekIifQ==