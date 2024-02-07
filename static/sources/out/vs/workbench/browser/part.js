/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/component", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/types", "vs/base/common/lifecycle", "vs/css!./media/part"], function (require, exports, component_1, dom_1, event_1, types_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiWindowParts = exports.Part = void 0;
    /**
     * Parts are layed out in the workbench and have their own layout that
     * arranges an optional title and mandatory content area to show content.
     */
    class Part extends component_1.Component {
        get dimension() { return this._dimension; }
        constructor(id, options, themeService, storageService, layoutService) {
            super(id, themeService, storageService);
            this.options = options;
            this.layoutService = layoutService;
            this._onDidVisibilityChange = this._register(new event_1.Emitter());
            this.onDidVisibilityChange = this._onDidVisibilityChange.event;
            //#region ISerializableView
            this._onDidChange = this._register(new event_1.Emitter());
            layoutService.registerPart(this);
        }
        onThemeChange(theme) {
            // only call if our create() method has been called
            if (this.parent) {
                super.onThemeChange(theme);
            }
        }
        updateStyles() {
            super.updateStyles();
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to create title and content area of the part.
         */
        create(parent, options) {
            this.parent = parent;
            this.titleArea = this.createTitleArea(parent, options);
            this.contentArea = this.createContentArea(parent, options);
            this.partLayout = new PartLayout(this.options, this.contentArea);
            this.updateStyles();
        }
        /**
         * Returns the overall part container.
         */
        getContainer() {
            return this.parent;
        }
        /**
         * Subclasses override to provide a title area implementation.
         */
        createTitleArea(parent, options) {
            return undefined;
        }
        /**
         * Returns the title area container.
         */
        getTitleArea() {
            return this.titleArea;
        }
        /**
         * Subclasses override to provide a content area implementation.
         */
        createContentArea(parent, options) {
            return undefined;
        }
        /**
         * Returns the content area container.
         */
        getContentArea() {
            return this.contentArea;
        }
        /**
         * Layout title and content area in the given dimension.
         */
        layoutContents(width, height) {
            const partLayout = (0, types_1.assertIsDefined)(this.partLayout);
            return partLayout.layout(width, height);
        }
        get onDidChange() { return this._onDidChange.event; }
        layout(width, height, _top, _left) {
            this._dimension = new dom_1.Dimension(width, height);
        }
        setVisible(visible) {
            this._onDidVisibilityChange.fire(visible);
        }
    }
    exports.Part = Part;
    class PartLayout {
        static { this.TITLE_HEIGHT = 35; }
        constructor(options, contentArea) {
            this.options = options;
            this.contentArea = contentArea;
        }
        layout(width, height) {
            // Title Size: Width (Fill), Height (Variable)
            let titleSize;
            if (this.options.hasTitle) {
                titleSize = new dom_1.Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
            }
            else {
                titleSize = dom_1.Dimension.None;
            }
            let contentWidth = width;
            if (this.options && typeof this.options.borderWidth === 'function') {
                contentWidth -= this.options.borderWidth(); // adjust for border size
            }
            // Content Size: Width (Fill), Height (Variable)
            const contentSize = new dom_1.Dimension(contentWidth, height - titleSize.height);
            // Content
            if (this.contentArea) {
                (0, dom_1.size)(this.contentArea, contentSize.width, contentSize.height);
            }
            return { titleSize, contentSize };
        }
    }
    class MultiWindowParts extends component_1.Component {
        constructor() {
            super(...arguments);
            this._parts = new Set();
        }
        get parts() { return Array.from(this._parts); }
        registerPart(part) {
            this._parts.add(part);
            return this._register((0, lifecycle_1.toDisposable)(() => this.unregisterPart(part)));
        }
        unregisterPart(part) {
            this._parts.delete(part);
        }
        getPart(container) {
            return this.getPartByDocument(container.ownerDocument);
        }
        getPartByDocument(document) {
            if (this._parts.size > 1) {
                for (const part of this._parts) {
                    if (part.element?.ownerDocument === document) {
                        return part;
                    }
                }
            }
            return this.mainPart;
        }
        get activePart() {
            return this.getPartByDocument((0, dom_1.getActiveDocument)());
        }
    }
    exports.MultiWindowParts = MultiWindowParts;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHOzs7T0FHRztJQUNILE1BQXNCLElBQUssU0FBUSxxQkFBUztRQUczQyxJQUFJLFNBQVMsS0FBNEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQVVsRSxZQUNDLEVBQVUsRUFDRixPQUFxQixFQUM3QixZQUEyQixFQUMzQixjQUErQixFQUNaLGFBQXNDO1lBRXpELEtBQUssQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBTGhDLFlBQU8sR0FBUCxPQUFPLENBQWM7WUFHVixrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFiaEQsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDakUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQTJGbkUsMkJBQTJCO1lBRWpCLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1lBN0U3RSxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFa0IsYUFBYSxDQUFDLEtBQWtCO1lBRWxELG1EQUFtRDtZQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0YsQ0FBQztRQUVRLFlBQVk7WUFDcEIsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILE1BQU0sQ0FBQyxNQUFtQixF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