/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/cancellation", "vs/base/common/hotReload", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/config/elementSizeObserver", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, arraysFind_1, cancellation_1, hotReload_1, lifecycle_1, observable_1, elementSizeObserver_1, position_1, range_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.filterWithPrevious = exports.bindContextKey = exports.translatePosition = exports.DisposableCancellationTokenSource = exports.applyViewZones = exports.observeHotReloadableExports = exports.readHotReloadableExport = exports.applyStyle = exports.ManagedOverlayWidget = exports.PlaceholderViewZone = exports.ViewZoneOverlayWidget = exports.deepMerge = exports.animatedObservable = exports.ObservableElementSizeObserver = exports.observableConfigValue = exports.appendRemoveOnDispose = exports.applyObservableDecorations = exports.joinCombine = void 0;
    function joinCombine(arr1, arr2, keySelector, combine) {
        if (arr1.length === 0) {
            return arr2;
        }
        if (arr2.length === 0) {
            return arr1;
        }
        const result = [];
        let i = 0;
        let j = 0;
        while (i < arr1.length && j < arr2.length) {
            const val1 = arr1[i];
            const val2 = arr2[j];
            const key1 = keySelector(val1);
            const key2 = keySelector(val2);
            if (key1 < key2) {
                result.push(val1);
                i++;
            }
            else if (key1 > key2) {
                result.push(val2);
                j++;
            }
            else {
                result.push(combine(val1, val2));
                i++;
                j++;
            }
        }
        while (i < arr1.length) {
            result.push(arr1[i]);
            i++;
        }
        while (j < arr2.length) {
            result.push(arr2[j]);
            j++;
        }
        return result;
    }
    exports.joinCombine = joinCombine;
    // TODO make utility
    function applyObservableDecorations(editor, decorations) {
        const d = new lifecycle_1.DisposableStore();
        const decorationsCollection = editor.createDecorationsCollection();
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            decorationsCollection.set(d);
        }));
        d.add({
            dispose: () => {
                decorationsCollection.clear();
            }
        });
        return d;
    }
    exports.applyObservableDecorations = applyObservableDecorations;
    function appendRemoveOnDispose(parent, child) {
        parent.appendChild(child);
        return (0, lifecycle_1.toDisposable)(() => {
            parent.removeChild(child);
        });
    }
    exports.appendRemoveOnDispose = appendRemoveOnDispose;
    function observableConfigValue(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
    exports.observableConfigValue = observableConfigValue;
    class ObservableElementSizeObserver extends lifecycle_1.Disposable {
        get width() { return this._width; }
        get height() { return this._height; }
        constructor(element, dimension) {
            super();
            this.elementSizeObserver = this._register(new elementSizeObserver_1.ElementSizeObserver(element, dimension));
            this._width = (0, observable_1.observableValue)(this, this.elementSizeObserver.getWidth());
            this._height = (0, observable_1.observableValue)(this, this.elementSizeObserver.getHeight());
            this._register(this.elementSizeObserver.onDidChange(e => (0, observable_1.transaction)(tx => {
                /** @description Set width/height from elementSizeObserver */
                this._width.set(this.elementSizeObserver.getWidth(), tx);
                this._height.set(this.elementSizeObserver.getHeight(), tx);
            })));
        }
        observe(dimension) {
            this.elementSizeObserver.observe(dimension);
        }
        setAutomaticLayout(automaticLayout) {
            if (automaticLayout) {
                this.elementSizeObserver.startObserving();
            }
            else {
                this.elementSizeObserver.stopObserving();
            }
        }
    }
    exports.ObservableElementSizeObserver = ObservableElementSizeObserver;
    function animatedObservable(targetWindow, base, store) {
        let targetVal = base.get();
        let startVal = targetVal;
        let curVal = targetVal;
        const result = (0, observable_1.observableValue)('animatedValue', targetVal);
        let animationStartMs = -1;
        const durationMs = 300;
        let animationFrame = undefined;
        store.add((0, observable_1.autorunHandleChanges)({
            createEmptyChangeSummary: () => ({ animate: false }),
            handleChange: (ctx, s) => {
                if (ctx.didChange(base)) {
                    s.animate = s.animate || ctx.change;
                }
                return true;
            }
        }, (reader, s) => {
            /** @description update value */
            if (animationFrame !== undefined) {
                targetWindow.cancelAnimationFrame(animationFrame);
                animationFrame = undefined;
            }
            startVal = curVal;
            targetVal = base.read(reader);
            animationStartMs = Date.now() - (s.animate ? 0 : durationMs);
            update();
        }));
        function update() {
            const passedMs = Date.now() - animationStartMs;
            curVal = Math.floor(easeOutExpo(passedMs, startVal, targetVal - startVal, durationMs));
            if (passedMs < durationMs) {
                animationFrame = targetWindow.requestAnimationFrame(update);
            }
            else {
                curVal = targetVal;
            }
            result.set(curVal, undefined);
        }
        return result;
    }
    exports.animatedObservable = animatedObservable;
    function easeOutExpo(t, b, c, d) {
        return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
    function deepMerge(source1, source2) {
        const result = {};
        for (const key in source1) {
            result[key] = source1[key];
        }
        for (const key in source2) {
            const source2Value = source2[key];
            if (typeof result[key] === 'object' && source2Value && typeof source2Value === 'object') {
                result[key] = deepMerge(result[key], source2Value);
            }
            else {
                result[key] = source2Value;
            }
        }
        return result;
    }
    exports.deepMerge = deepMerge;
    class ViewZoneOverlayWidget extends lifecycle_1.Disposable {
        constructor(editor, viewZone, htmlElement) {
            super();
            this._register(new ManagedOverlayWidget(editor, htmlElement));
            this._register(applyStyle(htmlElement, {
                height: viewZone.actualHeight,
                top: viewZone.actualTop,
            }));
        }
    }
    exports.ViewZoneOverlayWidget = ViewZoneOverlayWidget;
    class PlaceholderViewZone {
        get afterLineNumber() { return this._afterLineNumber.get(); }
        constructor(_afterLineNumber, heightInPx) {
            this._afterLineNumber = _afterLineNumber;
            this.heightInPx = heightInPx;
            this.domNode = document.createElement('div');
            this._actualTop = (0, observable_1.observableValue)(this, undefined);
            this._actualHeight = (0, observable_1.observableValue)(this, undefined);
            this.actualTop = this._actualTop;
            this.actualHeight = this._actualHeight;
            this.showInHiddenAreas = true;
            this.onChange = this._afterLineNumber;
            this.onDomNodeTop = (top) => {
                this._actualTop.set(top, undefined);
            };
            this.onComputedHeight = (height) => {
                this._actualHeight.set(height, undefined);
            };
        }
    }
    exports.PlaceholderViewZone = PlaceholderViewZone;
    class ManagedOverlayWidget {
        static { this._counter = 0; }
        constructor(_editor, _domElement) {
            this._editor = _editor;
            this._domElement = _domElement;
            this._overlayWidgetId = `managedOverlayWidget-${ManagedOverlayWidget._counter++}`;
            this._overlayWidget = {
                getId: () => this._overlayWidgetId,
                getDomNode: () => this._domElement,
                getPosition: () => null
            };
            this._editor.addOverlayWidget(this._overlayWidget);
        }
        dispose() {
            this._editor.removeOverlayWidget(this._overlayWidget);
        }
    }
    exports.ManagedOverlayWidget = ManagedOverlayWidget;
    function applyStyle(domNode, style) {
        return (0, observable_1.autorun)(reader => {
            /** @description applyStyle */
            for (let [key, val] of Object.entries(style)) {
                if (val && typeof val === 'object' && 'read' in val) {
                    val = val.read(reader);
                }
                if (typeof val === 'number') {
                    val = `${val}px`;
                }
                key = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
                domNode.style[key] = val;
            }
        });
    }
    exports.applyStyle = applyStyle;
    function readHotReloadableExport(value, reader) {
        observeHotReloadableExports([value], reader);
        return value;
    }
    exports.readHotReloadableExport = readHotReloadableExport;
    function observeHotReloadableExports(values, reader) {
        if ((0, hotReload_1.isHotReloadEnabled)()) {
            const o = (0, observable_1.observableSignalFromEvent)('reload', event => (0, hotReload_1.registerHotReloadHandler)(({ oldExports }) => {
                if (![...Object.values(oldExports)].some(v => values.includes(v))) {
                    return undefined;
                }
                return (_newExports) => {
                    event(undefined);
                    return true;
                };
            }));
            o.read(reader);
        }
    }
    exports.observeHotReloadableExports = observeHotReloadableExports;
    function applyViewZones(editor, viewZones, setIsUpdating, zoneIds) {
        const store = new lifecycle_1.DisposableStore();
        const lastViewZoneIds = [];
        store.add((0, observable_1.autorunWithStore)((reader, store) => {
            /** @description applyViewZones */
            const curViewZones = viewZones.read(reader);
            const viewZonIdsPerViewZone = new Map();
            const viewZoneIdPerOnChangeObservable = new Map();
            // Add/remove view zones
            if (setIsUpdating) {
                setIsUpdating(true);
            }
            editor.changeViewZones(a => {
                for (const id of lastViewZoneIds) {
                    a.removeZone(id);
                    zoneIds?.delete(id);
                }
                lastViewZoneIds.length = 0;
                for (const z of curViewZones) {
                    const id = a.addZone(z);
                    if (z.setZoneId) {
                        z.setZoneId(id);
                    }
                    lastViewZoneIds.push(id);
                    zoneIds?.add(id);
                    viewZonIdsPerViewZone.set(z, id);
                }
            });
            if (setIsUpdating) {
                setIsUpdating(false);
            }
            // Layout zone on change
            store.add((0, observable_1.autorunHandleChanges)({
                createEmptyChangeSummary() {
                    return { zoneIds: [] };
                },
                handleChange(context, changeSummary) {
                    const id = viewZoneIdPerOnChangeObservable.get(context.changedObservable);
                    if (id !== undefined) {
                        changeSummary.zoneIds.push(id);
                    }
                    return true;
                },
            }, (reader, changeSummary) => {
                /** @description layoutZone on change */
                for (const vz of curViewZones) {
                    if (vz.onChange) {
                        viewZoneIdPerOnChangeObservable.set(vz.onChange, viewZonIdsPerViewZone.get(vz));
                        vz.onChange.read(reader);
                    }
                }
                if (setIsUpdating) {
                    setIsUpdating(true);
                }
                editor.changeViewZones(a => { for (const id of changeSummary.zoneIds) {
                    a.layoutZone(id);
                } });
                if (setIsUpdating) {
                    setIsUpdating(false);
                }
            }));
        }));
        store.add({
            dispose() {
                if (setIsUpdating) {
                    setIsUpdating(true);
                }
                editor.changeViewZones(a => { for (const id of lastViewZoneIds) {
                    a.removeZone(id);
                } });
                zoneIds?.clear();
                if (setIsUpdating) {
                    setIsUpdating(false);
                }
            }
        });
        return store;
    }
    exports.applyViewZones = applyViewZones;
    class DisposableCancellationTokenSource extends cancellation_1.CancellationTokenSource {
        dispose() {
            super.dispose(true);
        }
    }
    exports.DisposableCancellationTokenSource = DisposableCancellationTokenSource;
    function translatePosition(posInOriginal, mappings) {
        const mapping = (0, arraysFind_1.findLast)(mappings, m => m.original.startLineNumber <= posInOriginal.lineNumber);
        if (!mapping) {
            // No changes before the position
            return range_1.Range.fromPositions(posInOriginal);
        }
        if (mapping.original.endLineNumberExclusive <= posInOriginal.lineNumber) {
            const newLineNumber = posInOriginal.lineNumber - mapping.original.endLineNumberExclusive + mapping.modified.endLineNumberExclusive;
            return range_1.Range.fromPositions(new position_1.Position(newLineNumber, posInOriginal.column));
        }
        if (!mapping.innerChanges) {
            // Only for legacy algorithm
            return range_1.Range.fromPositions(new position_1.Position(mapping.modified.startLineNumber, 1));
        }
        const innerMapping = (0, arraysFind_1.findLast)(mapping.innerChanges, m => m.originalRange.getStartPosition().isBeforeOrEqual(posInOriginal));
        if (!innerMapping) {
            const newLineNumber = posInOriginal.lineNumber - mapping.original.startLineNumber + mapping.modified.startLineNumber;
            return range_1.Range.fromPositions(new position_1.Position(newLineNumber, posInOriginal.column));
        }
        if (innerMapping.originalRange.containsPosition(posInOriginal)) {
            return innerMapping.modifiedRange;
        }
        else {
            const l = lengthBetweenPositions(innerMapping.originalRange.getEndPosition(), posInOriginal);
            return range_1.Range.fromPositions(addLength(innerMapping.modifiedRange.getEndPosition(), l));
        }
    }
    exports.translatePosition = translatePosition;
    function lengthBetweenPositions(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new length_1.LengthObj(0, position2.column - position1.column);
        }
        else {
            return new length_1.LengthObj(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    function addLength(position, length) {
        if (length.lineCount === 0) {
            return new position_1.Position(position.lineNumber, position.column + length.columnCount);
        }
        else {
            return new position_1.Position(position.lineNumber + length.lineCount, length.columnCount + 1);
        }
    }
    function bindContextKey(key, service, computeValue) {
        const boundKey = key.bindTo(service);
        return (0, observable_1.autorunOpts)({ debugName: () => `Update ${key.key}` }, reader => {
            boundKey.set(computeValue(reader));
        });
    }
    exports.bindContextKey = bindContextKey;
    function filterWithPrevious(arr, filter) {
        let prev;
        return arr.filter(cur => {
            const result = filter(cur, prev);
            prev = cur;
            return result;
        });
    }
    exports.filterWithPrevious = filterWithPrevious;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsU0FBZ0IsV0FBVyxDQUFJLElBQWtCLEVBQUUsSUFBa0IsRUFBRSxXQUErQixFQUFFLE9BQTRCO1FBQ25JLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xCLENBQUMsRUFBRSxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxJQUFJLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQztn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