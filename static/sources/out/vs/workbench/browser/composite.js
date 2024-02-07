/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/workbench/common/component", "vs/base/common/event", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/types"], function (require, exports, actions_1, component_1, event_1, dom_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositeRegistry = exports.CompositeDescriptor = exports.Composite = void 0;
    /**
     * Composites are layed out in the sidebar and panel part of the workbench. At a time only one composite
     * can be open in the sidebar, and only one composite can be open in the panel.
     *
     * Each composite has a minimized representation that is good enough to provide some
     * information about the state of the composite data.
     *
     * The workbench will keep a composite alive after it has been created and show/hide it based on
     * user interaction. The lifecycle of a composite goes in the order create(), setVisible(true|false),
     * layout(), focus(), dispose(). During use of the workbench, a composite will often receive a setVisible,
     * layout and focus call, but only one create and dispose call.
     */
    class Composite extends component_1.Component {
        get onDidFocus() {
            if (!this._onDidFocus) {
                this._onDidFocus = this.registerFocusTrackEvents().onDidFocus;
            }
            return this._onDidFocus.event;
        }
        fireOnDidFocus() {
            this._onDidFocus?.fire();
        }
        get onDidBlur() {
            if (!this._onDidBlur) {
                this._onDidBlur = this.registerFocusTrackEvents().onDidBlur;
            }
            return this._onDidBlur.event;
        }
        hasFocus() {
            return this._hasFocus;
        }
        registerFocusTrackEvents() {
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const focusTracker = this._register((0, dom_1.trackFocus)(container));
            const onDidFocus = this._onDidFocus = this._register(new event_1.Emitter());
            this._register(focusTracker.onDidFocus(() => {
                this._hasFocus = true;
                onDidFocus.fire();
            }));
            const onDidBlur = this._onDidBlur = this._register(new event_1.Emitter());
            this._register(focusTracker.onDidBlur(() => {
                this._hasFocus = false;
                onDidBlur.fire();
            }));
            return { onDidFocus, onDidBlur };
        }
        get telemetryService() { return this._telemetryService; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, themeService, storageService);
            this._onTitleAreaUpdate = this._register(new event_1.Emitter());
            this.onTitleAreaUpdate = this._onTitleAreaUpdate.event;
            this._hasFocus = false;
            this._telemetryService = telemetryService;
            this.visible = false;
        }
        getTitle() {
            return undefined;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to create this composite on the provided parent. This method is only
         * called once during the lifetime of the workbench.
         * Note that DOM-dependent calculations should be performed from the setVisible()
         * call. Only then the composite will be part of the DOM.
         */
        create(parent) {
            this.parent = parent;
        }
        /**
         * Returns the container this composite is being build in.
         */
        getContainer() {
            return this.parent;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to indicate that the composite has become visible or hidden. This method
         * is called more than once during workbench lifecycle depending on the user interaction.
         * The composite will be on-DOM if visible is set to true and off-DOM otherwise.
         *
         * Typically this operation should be fast though because setVisible might be called many times during a session.
         * If there is a long running operation it is fine to have it running in the background asyncly and return before.
         */
        setVisible(visible) {
            if (this.visible !== !!visible) {
                this.visible = visible;
            }
        }
        /**
         * Called when this composite should receive keyboard focus.
         */
        focus() {
            const container = this.getContainer();
            if (container) {
                // Make sure to focus the window of the container
                // because it is possible that the composite is
                // opened in a auxiliary window that is not focused.
                (0, dom_1.focusWindow)(container);
            }
        }
        /**
         *
         * @returns the action runner for this composite
         */
        getMenuIds() {
            return [];
        }
        /**
         * Returns an array of actions to show in the action bar of the composite.
         */
        getActions() {
            return [];
        }
        /**
         * Returns an array of actions to show in the action bar of the composite
         * in a less prominent way then action from getActions.
         */
        getSecondaryActions() {
            return [];
        }
        /**
         * Returns an array of actions to show in the context menu of the composite
         */
        getContextMenuActions() {
            return [];
        }
        /**
         * For any of the actions returned by this composite, provide an IActionViewItem in
         * cases where the implementor of the composite wants to override the presentation
         * of an action. Returns undefined to indicate that the action is not rendered through
         * an action item.
         */
        getActionViewItem(action) {
            return undefined;
        }
        /**
         * Provide a context to be passed to the toolbar.
         */
        getActionsContext() {
            return null;
        }
        /**
         * Returns the instance of IActionRunner to use with this composite for the
         * composite tool bar.
         */
        getActionRunner() {
            if (!this.actionRunner) {
                this.actionRunner = this._register(new actions_1.ActionRunner());
            }
            return this.actionRunner;
        }
        /**
         * Method for composite implementors to indicate to the composite container that the title or the actions
         * of the composite have changed. Calling this method will cause the container to ask for title (getTitle())
         * and actions (getActions(), getSecondaryActions()) if the composite is visible or the next time the composite
         * gets visible.
         */
        updateTitleArea() {
            this._onTitleAreaUpdate.fire();
        }
        /**
         * Returns true if this composite is currently visible and false otherwise.
         */
        isVisible() {
            return this.visible;
        }
        /**
         * Returns the underlying composite control or `undefined` if it is not accessible.
         */
        getControl() {
            return undefined;
        }
    }
    exports.Composite = Composite;
    /**
     * A composite descriptor is a lightweight descriptor of a composite in the workbench.
     */
    class CompositeDescriptor {
        constructor(ctor, id, name, cssClass, order, requestedIndex) {
            this.ctor = ctor;
            this.id = id;
            this.name = name;
            this.cssClass = cssClass;
            this.order = order;
            this.requestedIndex = requestedIndex;
        }
        instantiate(instantiationService) {
            return instantiationService.createInstance(this.ctor);
        }
    }
    exports.CompositeDescriptor = CompositeDescriptor;
    class CompositeRegistry extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidRegister = this._register(new event_1.Emitter());
            this.onDidRegister = this._onDidRegister.event;
            this._onDidDeregister = this._register(new event_1.Emitter());
            this.onDidDeregister = this._onDidDeregister.event;
            this.composites = [];
        }
        registerComposite(descriptor) {
            if (this.compositeById(descriptor.id)) {
                return;
            }
            this.composites.push(descriptor);
            this._onDidRegister.fire(descriptor);
        }
        deregisterComposite(id) {
            const descriptor = this.compositeById(id);
            if (!descriptor) {
                return;
            }
            this.composites.splice(this.composites.indexOf(descriptor), 1);
            this._onDidDeregister.fire(descriptor);
        }
        getComposite(id) {
            return this.compositeById(id);
        }
        getComposites() {
            return this.composites.slice(0);
        }
        compositeById(id) {
            return this.composites.find(composite => composite.id === id);
        }
    }
    exports.CompositeRegistry = CompositeRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9jb21wb3NpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRzs7Ozs7Ozs7Ozs7T0FXRztJQUNILE1BQXNCLFNBQVUsU0FBUSxxQkFBUztRQU1oRCxJQUFJLFVBQVU7WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUMvRCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBRVMsY0FBYztZQUN2QixJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFHRCxJQUFJLFNBQVM7WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUM3RCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM5QixDQUFDO1FBR0QsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUEsdUJBQWUsRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUN2RCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRTNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLEdB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