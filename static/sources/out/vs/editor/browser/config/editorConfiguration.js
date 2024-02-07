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
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/editor/browser/config/elementSizeObserver", "vs/editor/browser/config/fontMeasurements", "vs/editor/browser/config/migrateOptions", "vs/editor/browser/config/tabFocus", "vs/editor/common/config/editorOptions", "vs/editor/common/config/editorZoom", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/common/accessibility"], function (require, exports, browser, arrays, event_1, lifecycle_1, objects, platform, elementSizeObserver_1, fontMeasurements_1, migrateOptions_1, tabFocus_1, editorOptions_1, editorZoom_1, fontInfo_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComputedEditorOptions = exports.EditorConfiguration = void 0;
    let EditorConfiguration = class EditorConfiguration extends lifecycle_1.Disposable {
        constructor(isSimpleWidget, options, container, _accessibilityService) {
            super();
            this._accessibilityService = _accessibilityService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidChangeFast = this._register(new event_1.Emitter());
            this.onDidChangeFast = this._onDidChangeFast.event;
            this._isDominatedByLongLines = false;
            this._viewLineCount = 1;
            this._lineNumbersDigitCount = 1;
            this._reservedHeight = 0;
            this._glyphMarginDecorationLaneCount = 1;
            this._computeOptionsMemory = new editorOptions_1.ComputeOptionsMemory();
            this.isSimpleWidget = isSimpleWidget;
            this._containerObserver = this._register(new elementSizeObserver_1.ElementSizeObserver(container, options.dimension));
            this._rawOptions = deepCloneAndMigrateOptions(options);
            this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
            this.options = this._computeOptions();
            if (this.options.get(13 /* EditorOption.automaticLayout */)) {
                this._containerObserver.startObserving();
            }
            this._register(editorZoom_1.EditorZoom.onDidChangeZoomLevel(() => this._recomputeOptions()));
            this._register(tabFocus_1.TabFocus.onDidChangeTabFocus(() => this._recomputeOptions()));
            this._register(this._containerObserver.onDidChange(() => this._recomputeOptions()));
            this._register(fontMeasurements_1.FontMeasurements.onDidChange(() => this._recomputeOptions()));
            this._register(browser.PixelRatio.onDidChange(() => this._recomputeOptions()));
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => this._recomputeOptions()));
        }
        _recomputeOptions() {
            const newOptions = this._computeOptions();
            const changeEvent = EditorOptionsUtil.checkEquals(this.options, newOptions);
            if (changeEvent === null) {
                // nothing changed!
                return;
            }
            this.options = newOptions;
            this._onDidChangeFast.fire(changeEvent);
            this._onDidChange.fire(changeEvent);
        }
        _computeOptions() {
            const partialEnv = this._readEnvConfiguration();
            const bareFontInfo = fontInfo_1.BareFontInfo.createFromValidatedSettings(this._validatedOptions, partialEnv.pixelRatio, this.isSimpleWidget);
            const fontInfo = this._readFontInfo(bareFontInfo);
            const env = {
                memory: this._computeOptionsMemory,
                outerWidth: partialEnv.outerWidth,
                outerHeight: partialEnv.outerHeight - this._reservedHeight,
                fontInfo: fontInfo,
                extraEditorClassName: partialEnv.extraEditorClassName,
                isDominatedByLongLines: this._isDominatedByLongLines,
                viewLineCount: this._viewLineCount,
                lineNumbersDigitCount: this._lineNumbersDigitCount,
                emptySelectionClipboard: partialEnv.emptySelectionClipboard,
                pixelRatio: partialEnv.pixelRatio,
                tabFocusMode: tabFocus_1.TabFocus.getTabFocusMode(),
                accessibilitySupport: partialEnv.accessibilitySupport,
                glyphMarginDecorationLaneCount: this._glyphMarginDecorationLaneCount
            };
            return EditorOptionsUtil.computeOptions(this._validatedOptions, env);
        }
        _readEnvConfiguration() {
            return {
                extraEditorClassName: getExtraEditorClassName(),
                outerWidth: this._containerObserver.getWidth(),
                outerHeight: this._containerObserver.getHeight(),
                emptySelectionClipboard: browser.isWebKit || browser.isFirefox,
                pixelRatio: browser.PixelRatio.value,
                accessibilitySupport: (this._accessibilityService.isScreenReaderOptimized()
                    ? 2 /* AccessibilitySupport.Enabled */
                    : this._accessibilityService.getAccessibilitySupport())
            };
        }
        _readFontInfo(bareFontInfo) {
            return fontMeasurements_1.FontMeasurements.readFontInfo(bareFontInfo);
        }
        getRawOptions() {
            return this._rawOptions;
        }
        updateOptions(_newOptions) {
            const newOptions = deepCloneAndMigrateOptions(_newOptions);
            const didChange = EditorOptionsUtil.applyUpdate(this._rawOptions, newOptions);
            if (!didChange) {
                return;
            }
            this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
            this._recomputeOptions();
        }
        observeContainer(dimension) {
            this._containerObserver.observe(dimension);
        }
        setIsDominatedByLongLines(isDominatedByLongLines) {
            if (this._isDominatedByLongLines === isDominatedByLongLines) {
                return;
            }
            this._isDominatedByLongLines = isDominatedByLongLines;
            this._recomputeOptions();
        }
        setModelLineCount(modelLineCount) {
            const lineNumbersDigitCount = digitCount(modelLineCount);
            if (this._lineNumbersDigitCount === lineNumbersDigitCount) {
                return;
            }
            this._lineNumbersDigitCount = lineNumbersDigitCount;
            this._recomputeOptions();
        }
        setViewLineCount(viewLineCount) {
            if (this._viewLineCount === viewLineCount) {
                return;
            }
            this._viewLineCount = viewLineCount;
            this._recomputeOptions();
        }
        setReservedHeight(reservedHeight) {
            if (this._reservedHeight === reservedHeight) {
                return;
            }
            this._reservedHeight = reservedHeight;
            this._recomputeOptions();
        }
        setGlyphMarginDecorationLaneCount(decorationLaneCount) {
            if (this._glyphMarginDecorationLaneCount === decorationLaneCount) {
                return;
            }
            this._glyphMarginDecorationLaneCount = decorationLaneCount;
            this._recomputeOptions();
        }
    };
    exports.EditorConfiguration = EditorConfiguration;
    exports.EditorConfiguration = EditorConfiguration = __decorate([
        __param(3, accessibility_1.IAccessibilityService)
    ], EditorConfiguration);
    function digitCount(n) {
        let r = 0;
        while (n) {
            n = Math.floor(n / 10);
            r++;
        }
        return r ? r : 1;
    }
    function getExtraEditorClassName() {
        let extra = '';
        if (!browser.isSafari && !browser.isWebkitWebView) {
            // Use user-select: none in all browsers except Safari and native macOS WebView
            extra += 'no-user-select ';
        }
        if (browser.isSafari) {
            // See https://github.com/microsoft/vscode/issues/108822
            extra += 'no-minimap-shadow ';
            extra += 'enable-user-select ';
        }
        if (platform.isMacintosh) {
            extra += 'mac ';
        }
        return extra;
    }
    class ValidatedEditorOptions {
        constructor() {
            this._values = [];
        }
        _read(option) {
            return this._values[option];
        }
        get(id) {
            return this._values[id];
        }
        _write(option, value) {
            this._values[option] = value;
        }
    }
    class ComputedEditorOptions {
        constructor() {
            this._values = [];
        }
        _read(id) {
            if (id >= this._values.length) {
                throw new Error('Cannot read uninitialized value');
            }
            return this._values[id];
        }
        get(id) {
            return this._read(id);
        }
        _write(id, value) {
            this._values[id] = value;
        }
    }
    exports.ComputedEditorOptions = ComputedEditorOptions;
    class EditorOptionsUtil {
        static validateOptions(options) {
            const result = new ValidatedEditorOptions();
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                const value = (editorOption.name === '_never_' ? undefined : options[editorOption.name]);
                result._write(editorOption.id, editorOption.validate(value));
            }
            return result;
        }
        static computeOptions(options, env) {
            const result = new ComputedEditorOptions();
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                result._write(editorOption.id, editorOption.compute(env, result, options._read(editorOption.id)));
            }
            return result;
        }
        static _deepEquals(a, b) {
            if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
                return a === b;
            }
            if (Array.isArray(a) || Array.isArray(b)) {
                return (Array.isArray(a) && Array.isArray(b) ? arrays.equals(a, b) : false);
            }
            if (Object.keys(a).length !== Object.keys(b).length) {
                return false;
            }
            for (const key in a) {
                if (!EditorOptionsUtil._deepEquals(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        }
        static checkEquals(a, b) {
            const result = [];
            let somethingChanged = false;
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                const changed = !EditorOptionsUtil._deepEquals(a._read(editorOption.id), b._read(editorOption.id));
                result[editorOption.id] = changed;
                if (changed) {
                    somethingChanged = true;
                }
            }
            return (somethingChanged ? new editorOptions_1.ConfigurationChangedEvent(result) : null);
        }
        /**
         * Returns true if something changed.
         * Modifies `options`.
        */
        static applyUpdate(options, update) {
            let changed = false;
            for (const editorOption of editorOptions_1.editorOptionsRegistry) {
                if (update.hasOwnProperty(editorOption.name)) {
                    const result = editorOption.applyUpdate(options[editorOption.name], update[editorOption.name]);
                    options[editorOption.name] = result.newValue;
                    changed = changed || result.didChange;
                }
            }
            return changed;
        }
    }
    function deepCloneAndMigrateOptions(_options) {
        const options = objects.deepClone(_options);
        (0, migrateOptions_1.migrateOptions)(options);
        return options;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvY29uZmlnL2VkaXRvckNvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0J6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBK0JsRCxZQUNDLGNBQXVCLEVBQ3ZCLE9BQTZDLEVBQzdDLFNBQTZCLEVBQ04scUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBRmdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFqQzdFLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBNkIsQ0FBQyxDQUFDO1lBQ2hFLGdCQUFXLEdBQXFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRWhGLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTZCLENBQUMsQ0FBQztZQUNwRSxvQkFBZSxHQUFxQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBS3hGLDRCQUF1QixHQUFZLEtBQUssQ0FBQztZQUN6QyxtQkFBYyxHQUFXLENBQUMsQ0FBQztZQUMzQiwyQkFBc0IsR0FBVyxDQUFDLENBQUM7WUFDbkMsb0JBQWUsR0FBVyxDQUFDLENBQUM7WUFDNUIsb0NBQStCLEdBQVcsQ0FBQyxDQUFDO1lBRW5DLDBCQUFxQixHQUF5QixJQUFJLG9DQUFvQixFQUFFLENBQUM7WUFxQnpGLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUNBQW1CLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFT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