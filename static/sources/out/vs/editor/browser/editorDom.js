/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry"], function (require, exports, dom, globalPointerMoveMonitor_1, mouseEvent_1, async_1, lifecycle_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicCssRules = exports.GlobalEditorPointerMoveMonitor = exports.EditorPointerEventFactory = exports.EditorMouseEventFactory = exports.EditorMouseEvent = exports.createCoordinatesRelativeToEditor = exports.createEditorPagePosition = exports.CoordinatesRelativeToEditor = exports.EditorPagePosition = exports.ClientCoordinates = exports.PageCoordinates = void 0;
    /**
     * Coordinates relative to the whole document (e.g. mouse event's pageX and pageY)
     */
    class PageCoordinates {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this._pageCoordinatesBrand = undefined;
        }
        toClientCoordinates(targetWindow) {
            return new ClientCoordinates(this.x - targetWindow.scrollX, this.y - targetWindow.scrollY);
        }
    }
    exports.PageCoordinates = PageCoordinates;
    /**
     * Coordinates within the application's client area (i.e. origin is document's scroll position).
     *
     * For example, clicking in the top-left corner of the client area will
     * always result in a mouse event with a client.x value of 0, regardless
     * of whether the page is scrolled horizontally.
     */
    class ClientCoordinates {
        constructor(clientX, clientY) {
            this.clientX = clientX;
            this.clientY = clientY;
            this._clientCoordinatesBrand = undefined;
        }
        toPageCoordinates(targetWindow) {
            return new PageCoordinates(this.clientX + targetWindow.scrollX, this.clientY + targetWindow.scrollY);
        }
    }
    exports.ClientCoordinates = ClientCoordinates;
    /**
     * The position of the editor in the page.
     */
    class EditorPagePosition {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this._editorPagePositionBrand = undefined;
        }
    }
    exports.EditorPagePosition = EditorPagePosition;
    /**
     * Coordinates relative to the the (top;left) of the editor that can be used safely with other internal editor metrics.
     * **NOTE**: This position is obtained by taking page coordinates and transforming them relative to the
     * editor's (top;left) position in a way in which scale transformations are taken into account.
     * **NOTE**: These coordinates could be negative if the mouse position is outside the editor.
     */
    class CoordinatesRelativeToEditor {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this._positionRelativeToEditorBrand = undefined;
        }
    }
    exports.CoordinatesRelativeToEditor = CoordinatesRelativeToEditor;
    function createEditorPagePosition(editorViewDomNode) {
        const editorPos = dom.getDomNodePagePosition(editorViewDomNode);
        return new EditorPagePosition(editorPos.left, editorPos.top, editorPos.width, editorPos.height);
    }
    exports.createEditorPagePosition = createEditorPagePosition;
    function createCoordinatesRelativeToEditor(editorViewDomNode, editorPagePosition, pos) {
        // The editor's page position is read from the DOM using getBoundingClientRect().
        //
        // getBoundingClientRect() returns the actual dimensions, while offsetWidth and offsetHeight
        // reflect the unscaled size. We can use this difference to detect a transform:scale()
        // and we will apply the transformation in inverse to get mouse coordinates that make sense inside the editor.
        //
        // This could be expanded to cover rotation as well maybe by walking the DOM up from `editorViewDomNode`
        // and computing the effective transformation matrix using getComputedStyle(element).transform.
        //
        const scaleX = editorPagePosition.width / editorViewDomNode.offsetWidth;
        const scaleY = editorPagePosition.height / editorViewDomNode.offsetHeight;
        // Adjust mouse offsets if editor appears to be scaled via transforms
        const relativeX = (pos.x - editorPagePosition.x) / scaleX;
        const relativeY = (pos.y - editorPagePosition.y) / scaleY;
        return new CoordinatesRelativeToEditor(relativeX, relativeY);
    }
    exports.createCoordinatesRelativeToEditor = createCoordinatesRelativeToEditor;
    class EditorMouseEvent extends mouseEvent_1.StandardMouseEvent {
        constructor(e, isFromPointerCapture, editorViewDomNode) {
            super(dom.getWindow(editorViewDomNode), e);
            this._editorMouseEventBrand = undefined;
            this.isFromPointerCapture = isFromPointerCapture;
            this.pos = new PageCoordinates(this.posx, this.posy);
            this.editorPos = createEditorPagePosition(editorViewDomNode);
            this.relativePos = createCoordinatesRelativeToEditor(editorViewDomNode, this.editorPos, this.pos);
        }
    }
    exports.EditorMouseEvent = EditorMouseEvent;
    class EditorMouseEventFactory {
        constructor(editorViewDomNode) {
            this._editorViewDomNode = editorViewDomNode;
        }
        _create(e) {
            return new EditorMouseEvent(e, false, this._editorViewDomNode);
        }
        onContextMenu(target, callback) {
            return dom.addDisposableListener(target, 'contextmenu', (e) => {
                callback(this._create(e));
            });
        }
        onMouseUp(target, callback) {
            return dom.addDisposableListener(target, 'mouseup', (e) => {
                callback(this._create(e));
            });
        }
        onMouseDown(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.MOUSE_DOWN, (e) => {
                callback(this._create(e));
            });
        }
        onPointerDown(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.POINTER_DOWN, (e) => {
                callback(this._create(e), e.pointerId);
            });
        }
        onMouseLeave(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.MOUSE_LEAVE, (e) => {
                callback(this._create(e));
            });
        }
        onMouseMove(target, callback) {
            return dom.addDisposableListener(target, 'mousemove', (e) => callback(this._create(e)));
        }
    }
    exports.EditorMouseEventFactory = EditorMouseEventFactory;
    class EditorPointerEventFactory {
        constructor(editorViewDomNode) {
            this._editorViewDomNode = editorViewDomNode;
        }
        _create(e) {
            return new EditorMouseEvent(e, false, this._editorViewDomNode);
        }
        onPointerUp(target, callback) {
            return dom.addDisposableListener(target, 'pointerup', (e) => {
                callback(this._create(e));
            });
        }
        onPointerDown(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.POINTER_DOWN, (e) => {
                callback(this._create(e), e.pointerId);
            });
        }
        onPointerLeave(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.POINTER_LEAVE, (e) => {
                callback(this._create(e));
            });
        }
        onPointerMove(target, callback) {
            return dom.addDisposableListener(target, 'pointermove', (e) => callback(this._create(e)));
        }
    }
    exports.EditorPointerEventFactory = EditorPointerEventFactory;
    class GlobalEditorPointerMoveMonitor extends lifecycle_1.Disposable {
        constructor(editorViewDomNode) {
            super();
            this._editorViewDomNode = editorViewDomNode;
            this._globalPointerMoveMonitor = this._register(new globalPointerMoveMonitor_1.GlobalPointerMoveMonitor());
            this._keydownListener = null;
        }
        startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
            // Add a <<capture>> keydown event listener that will cancel the monitoring
            // if something other than a modifier key is pressed
            this._keydownListener = dom.addStandardDisposableListener(initialElement.ownerDocument, 'keydown', (e) => {
                const chord = e.toKeyCodeChord();
                if (chord.isModifierKey()) {
                    // Allow modifier keys
                    return;
                }
                this._globalPointerMoveMonitor.stopMonitoring(true, e.browserEvent);
            }, true);
            this._globalPointerMoveMonitor.startMonitoring(initialElement, pointerId, initialButtons, (e) => {
                pointerMoveCallback(new EditorMouseEvent(e, true, this._editorViewDomNode));
            }, (e) => {
                this._keydownListener.dispose();
                onStopCallback(e);
            });
        }
        stopMonitoring() {
            this._globalPointerMoveMonitor.stopMonitoring(true);
        }
    }
    exports.GlobalEditorPointerMoveMonitor = GlobalEditorPointerMoveMonitor;
    /**
     * A helper to create dynamic css rules, bound to a class name.
     * Rules are reused.
     * Reference counting and delayed garbage collection ensure that no rules leak.
    */
    class DynamicCssRules {
        static { this._idPool = 0; }
        constructor(_editor) {
            this._editor = _editor;
            this._instanceId = ++DynamicCssRules._idPool;
            this._counter = 0;
            this._rules = new Map();
            // We delay garbage collection so that hanging rules can be reused.
            this._garbageCollectionScheduler = new async_1.RunOnceScheduler(() => this.garbageCollect(), 1000);
        }
        createClassNameRef(options) {
            const rule = this.getOrCreateRule(options);
            rule.increaseRefCount();
            return {
                className: rule.className,
                dispose: () => {
                    rule.decreaseRefCount();
                    this._garbageCollectionScheduler.schedule();
                }
            };
        }
        getOrCreateRule(properties) {
            const key = this.computeUniqueKey(properties);
            let existingRule = this._rules.get(key);
            if (!existingRule) {
                const counter = this._counter++;
                existingRule = new RefCountedCssRule(key, `dyn-rule-${this._instanceId}-${counter}`, dom.isInShadowDOM(this._editor.getContainerDomNode())
                    ? this._editor.getContainerDomNode()
                    : undefined, properties);
                this._rules.set(key, existingRule);
            }
            return existingRule;
        }
        computeUniqueKey(properties) {
            return JSON.stringify(properties);
        }
        garbageCollect() {
            for (const rule of this._rules.values()) {
                if (!rule.hasReferences()) {
                    this._rules.delete(rule.key);
                    rule.dispose();
                }
            }
        }
    }
    exports.DynamicCssRules = DynamicCssRules;
    class RefCountedCssRule {
        constructor(key, className, _containerElement, properties) {
            this.key = key;
            this.className = className;
            this.properties = properties;
            this._referenceCount = 0;
            this._styleElementDisposables = new lifecycle_1.DisposableStore();
            this._styleElement = dom.createStyleSheet(_containerElement, undefined, this._styleElementDisposables);
            this._styleElement.textContent = this.getCssText(this.className, this.properties);
        }
        getCssText(className, properties) {
            let str = `.${className} {`;
            for (const prop in properties) {
                const value = properties[prop];
                let cssValue;
                if (typeof value === 'object') {
                    cssValue = (0, colorRegistry_1.asCssVariable)(value.id);
                }
                else {
                    cssValue = value;
                }
                const cssPropName = camelToDashes(prop);
                str += `\n\t${cssPropName}: ${cssValue};`;
            }
            str += `\n}`;
            return str;
        }
        dispose() {
            this._styleElementDisposables.dispose();
            this._styleElement = undefined;
        }
        increaseRefCount() {
            this._referenceCount++;
        }
        decreaseRefCount() {
            this._referenceCount--;
        }
        hasReferences() {
            return this._referenceCount > 0;
        }
    }
    function camelToDashes(str) {
        return str.replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
            .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yRG9tLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9lZGl0b3JEb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHOztPQUVHO0lBQ0gsTUFBYSxlQUFlO1FBRzNCLFlBQ2lCLENBQVMsRUFDVCxDQUFTO1lBRFQsTUFBQyxHQUFELENBQUMsQ0FBUTtZQUNULE1BQUMsR0FBRCxDQUFDLENBQVE7WUFKMUIsMEJBQXFCLEdBQVMsU0FBUyxDQUFDO1FBS3BDLENBQUM7UUFFRSxtQkFBbUIsQ0FBQyxZQUFvQjtZQUM5QyxPQUFPLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVGLENBQUM7S0FDRDtJQVhELDBDQVdDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsTUFBYSxpQkFBaUI7UUFHN0IsWUFDaUIsT0FBZSxFQUNmLE9BQWU7WUFEZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBQ2YsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUpoQyw0QkFBdUIsR0FBUyxTQUFTLENBQUM7UUFLdEMsQ0FBQztRQUVFLGlCQUFpQixDQUFDLFlBQW9CO1lBQzVDLE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RHLENBQUM7S0FDRDtJQVhELDhDQVdDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLGtCQUFrQjtRQUc5QixZQUNpQixDQUFTLEVBQ1QsQ0FBUyxFQUNULEtBQWEsRUFDYixNQUFjO1lBSGQsTUFBQyxHQUFELENBQUMsQ0FBUTtZQUNULE1BQUMsR0FBRCxDQUFDLENBQVE7WUFDVCxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQU4vQiw2QkFBd0IsR0FBUyxTQUFTLENBQUM7UUFPdkMsQ0FBQztLQUNMO0lBVEQsZ0RBU0M7SUFFRDs7Ozs7T0FLRztJQUNILE1BQWEsMkJBQTJCO1FBR3ZDLFlBQ2lCLENBQVMsRUFDVCxDQUFTO1lBRFQsTUFBQyxHQUFELENBQUMsQ0FBUTtZQUNULE1BQUMsR0FBRCxDQUFDLENBQVE7WUFKMUIsbUNBQThCLEdBQVMsU0FBUyxDQUFDO1FBSzdDLENBQUM7S0FDTDtJQVBELGtFQU9DO0lBRUQsU0FBZ0Isd0JBQXdCLENBQUMsaUJBQThCO1FBQ3RFLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUhELDREQUdDO0lBRUQsU0FBZ0IsaUNBQWlDLENBQUMsaUJBQThCLEVBQUUsa0JBQXNDLEVBQUUsR0FBb0I7UUFDN0ksaUZBQWlGO1FBQ2pGLEVBQUU7UUFDRiw0RkFBNEY7UUFDNUYsc0ZBQXNGO1FBQ3RGLDhHQUE4RztRQUM5RyxFQUFFO1FBQ0Ysd0dBQXdHO1FBQ3hHLCtGQUErRjtRQUMvRixFQUFFO1FBQ0YsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztRQUN4RSxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsWUFBWSxDQUFDO1FBRTFFLHFFQUFxRTtRQUNyRSxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzFELE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDMUQsT0FBTyxJQUFJLDJCQUEyQixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBakJELDhFQWlCQztJQUVELE1BQWEsZ0JBQWlCLFNBQVEsK0JBQWtCO1FBMEJ2RCxZQUFZLENBQWEsRUFBRSxvQkFBNkIsRUFBRSxpQkFBOEI7WUFDdkYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQTFCNUMsMkJBQXNCLEdBQVMsU0FBUyxDQUFDO1lBMkJ4QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7WUFDakQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxpQ0FBaUMsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRyxDQUFDO0tBQ0Q7SUFqQ0QsNENBaUNDO0lBRUQsTUFBYSx1QkFBdUI7UUFJbkMsWUFBWSxpQkFBOEI7WUFDekMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzdDLENBQUM7UUFFTyxPQUFPLENBQUMsQ0FBYTtZQUM1QixPQUFPLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRU0sYUFBYSxDQUFDLE1BQW1CLEVBQUUsUUFBdUM7WUFDaEYsT0FBTyxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO2dCQUN6RSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLFNBQVMsQ0FBQyxNQUFtQixFQUFFLFFBQXVDO1lBQzVFLE9BQU8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRTtnQkFDckUsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxXQUFXLENBQUMsTUFBbUIsRUFBRSxRQUF1QztZQUM5RSxPQUFPLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRTtnQkFDcEYsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxhQUFhLENBQUMsTUFBbUIsRUFBRSxRQUEwRDtZQUNuRyxPQUFPLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFlLEVBQUUsRUFBRTtnQkFDeEYsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLFlBQVksQ0FBQyxNQUFtQixFQUFFLFFBQXVDO1lBQy9FLE9BQU8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO2dCQUNyRixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLFdBQVcsQ0FBQyxNQUFtQixFQUFFLFFBQXVDO1lBQzlFLE9BQU8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQ0Q7SUE3Q0QsMERBNkNDO0lBRUQsTUFBYSx5QkFBeUI7UUFJckMsWUFBWSxpQkFBOEI7WUFDekMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzdDLENBQUM7UUFFTyxPQUFPLENBQUMsQ0FBYTtZQUM1QixPQUFPLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRU0sV0FBVyxDQUFDLE1BQW1CLEVBQUUsUUFBdUM7WUFDOUUsT0FBTyxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO2dCQUN2RSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLGFBQWEsQ0FBQyxNQUFtQixFQUFFLFFBQTBEO1lBQ25HLE9BQU8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQWUsRUFBRSxFQUFFO2dCQUN4RixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sY0FBYyxDQUFDLE1BQW1CLEVBQUUsUUFBdUM7WUFDakYsT0FBTyxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBYSxFQUFFLEVBQUU7Z0JBQ3ZGLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sYUFBYSxDQUFDLE1BQW1CLEVBQUUsUUFBdUM7WUFDaEYsT0FBTyxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7S0FDRDtJQWpDRCw4REFpQ0M7SUFFRCxNQUFhLDhCQUErQixTQUFRLHNCQUFVO1FBTTdELFlBQVksaUJBQThCO1lBQ3pDLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1lBQzVDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksbURBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDOUIsQ0FBQztRQUVNLGVBQWUsQ0FDckIsY0FBdUIsRUFDdkIsU0FBaUIsRUFDakIsY0FBc0IsRUFDdEIsbUJBQWtELEVBQ2xELGNBQXFFO1lBR3JFLDJFQUEyRTtZQUMzRSxvREFBb0Q7WUFDcEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBTSxjQUFjLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUM3RyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2pDLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7b0JBQzNCLHNCQUFzQjtvQkFDdEIsT0FBTztnQkFDUixDQUFDO2dCQUNELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFVCxJQUFJLENBQUMseUJBQXlCLENBQUMsZUFBZSxDQUM3QyxjQUFjLEVBQ2QsU0FBUyxFQUNULGNBQWMsRUFDZCxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNMLG1CQUFtQixDQUFDLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdFLENBQUMsRUFDRCxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNMLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FDRCxDQUFDO1FBQ0gsQ0FBQztRQUVNLGNBQWM7WUFDcEIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQ0Q7SUFqREQsd0VBaURDO0lBR0Q7Ozs7TUFJRTtJQUNGLE1BQWEsZUFBZTtpQkFDWixZQUFPLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFRM0IsWUFBNkIsT0FBb0I7WUFBcEIsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQVBoQyxnQkFBVyxHQUFHLEVBQUUsZUFBZSxDQUFDLE9BQU8sQ0FBQztZQUNqRCxhQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ0osV0FBTSxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBRS9ELG1FQUFtRTtZQUNsRCxnQ0FBMkIsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUd2RyxDQUFDO1FBRU0sa0JBQWtCLENBQUMsT0FBc0I7WUFDL0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUV4QixPQUFPO2dCQUNOLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM3QyxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFTyxlQUFlLENBQUMsVUFBeUI7WUFDaEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQyxZQUFZLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsWUFBWSxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sRUFBRSxFQUNsRixHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDcEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUU7b0JBQ3BDLENBQUMsQ0FBQyxTQUFTLEVBQ1osVUFBVSxDQUNWLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFDRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsVUFBeUI7WUFDakQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyxjQUFjO1lBQ3JCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7O0lBcERGLDBDQXFEQztJQTRCRCxNQUFNLGlCQUFpQjtRQUt0QixZQUNpQixHQUFXLEVBQ1gsU0FBaUIsRUFDakMsaUJBQTBDLEVBQzFCLFVBQXlCO1lBSHpCLFFBQUcsR0FBSCxHQUFHLENBQVE7WUFDWCxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBRWpCLGVBQVUsR0FBVixVQUFVLENBQWU7WUFSbEMsb0JBQWUsR0FBVyxDQUFDLENBQUM7WUFVbkMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUN2RyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25GLENBQUM7UUFFTyxVQUFVLENBQUMsU0FBaUIsRUFBRSxVQUF5QjtZQUM5RCxJQUFJLEdBQUcsR0FBRyxJQUFJLFNBQVMsSUFBSSxDQUFDO1lBQzVCLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sS0FBSyxHQUFJLFVBQWtCLENBQUMsSUFBSSxDQUF3QixDQUFDO2dCQUMvRCxJQUFJLFFBQVEsQ0FBQztnQkFDYixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUMvQixRQUFRLEdBQUcsSUFBQSw2QkFBYSxFQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ2xCLENBQUM7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxHQUFHLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxHQUFHLENBQUM7WUFDM0MsQ0FBQztZQUNELEdBQUcsSUFBSSxLQUFLLENBQUM7WUFDYixPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBQ2hDLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQztLQUNEO0lBRUQsU0FBUyxhQUFhLENBQUMsR0FBVztRQUNqQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzlELE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakUsQ0FBQyJ9