/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/platform", "vs/editor/common/core/textModelDefaults", "vs/editor/common/core/wordHelper", "vs/nls"], function (require, exports, arrays, objects, platform, textModelDefaults_1, wordHelper_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorOptions = exports.EditorOption = exports.editorOptionsRegistry = exports.EDITOR_FONT_DEFAULTS = exports.WrappingIndent = exports.unicodeHighlightConfigKeys = exports.inUntrustedWorkspace = exports.filterValidationDecorations = exports.RenderLineNumbersType = exports.ShowLightbulbIconMode = exports.EditorLayoutInfoComputer = exports.RenderMinimap = exports.EditorFontVariations = exports.EditorFontLigatures = exports.cursorStyleToString = exports.TextEditorCursorStyle = exports.TextEditorCursorBlinkingStyle = exports.stringSet = exports.clampedFloat = exports.clampedInt = exports.boolean = exports.ApplyUpdateResult = exports.ComputeOptionsMemory = exports.ConfigurationChangedEvent = exports.MINIMAP_GUTTER_WIDTH = exports.EditorAutoIndentStrategy = void 0;
    /**
     * Configuration options for auto indentation in the editor
     */
    var EditorAutoIndentStrategy;
    (function (EditorAutoIndentStrategy) {
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["None"] = 0] = "None";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Keep"] = 1] = "Keep";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Brackets"] = 2] = "Brackets";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Advanced"] = 3] = "Advanced";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Full"] = 4] = "Full";
    })(EditorAutoIndentStrategy || (exports.EditorAutoIndentStrategy = EditorAutoIndentStrategy = {}));
    /**
     * @internal
     * The width of the minimap gutter, in pixels.
     */
    exports.MINIMAP_GUTTER_WIDTH = 8;
    //#endregion
    /**
     * An event describing that the configuration of the editor has changed.
     */
    class ConfigurationChangedEvent {
        /**
         * @internal
         */
        constructor(values) {
            this._values = values;
        }
        hasChanged(id) {
            return this._values[id];
        }
    }
    exports.ConfigurationChangedEvent = ConfigurationChangedEvent;
    /**
     * @internal
     */
    class ComputeOptionsMemory {
        constructor() {
            this.stableMinimapLayoutInput = null;
            this.stableFitMaxMinimapScale = 0;
            this.stableFitRemainingWidth = 0;
        }
    }
    exports.ComputeOptionsMemory = ComputeOptionsMemory;
    /**
     * @internal
     */
    class BaseEditorOption {
        constructor(id, name, defaultValue, schema) {
            this.id = id;
            this.name = name;
            this.defaultValue = defaultValue;
            this.schema = schema;
        }
        applyUpdate(value, update) {
            return applyUpdate(value, update);
        }
        compute(env, options, value) {
            return value;
        }
    }
    class ApplyUpdateResult {
        constructor(newValue, didChange) {
            this.newValue = newValue;
            this.didChange = didChange;
        }
    }
    exports.ApplyUpdateResult = ApplyUpdateResult;
    function applyUpdate(value, update) {
        if (typeof value !== 'object' || typeof update !== 'object' || !value || !update) {
            return new ApplyUpdateResult(update, value !== update);
        }
        if (Array.isArray(value) || Array.isArray(update)) {
            const arrayEquals = Array.isArray(value) && Array.isArray(update) && arrays.equals(value, update);
            return new ApplyUpdateResult(update, !arrayEquals);
        }
        let didChange = false;
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                const result = applyUpdate(value[key], update[key]);
                if (result.didChange) {
                    value[key] = result.newValue;
                    didChange = true;
                }
            }
        }
        return new ApplyUpdateResult(value, didChange);
    }
    /**
     * @internal
     */
    class ComputedEditorOption {
        constructor(id) {
            this.schema = undefined;
            this.id = id;
            this.name = '_never_';
            this.defaultValue = undefined;
        }
        applyUpdate(value, update) {
            return applyUpdate(value, update);
        }
        validate(input) {
            return this.defaultValue;
        }
    }
    class SimpleEditorOption {
        constructor(id, name, defaultValue, schema) {
            this.id = id;
            this.name = name;
            this.defaultValue = defaultValue;
            this.schema = schema;
        }
        applyUpdate(value, update) {
            return applyUpdate(value, update);
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            return input;
        }
        compute(env, options, value) {
            return value;
        }
    }
    /**
     * @internal
     */
    function boolean(value, defaultValue) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        if (value === 'false') {
            // treat the string 'false' as false
            return false;
        }
        return Boolean(value);
    }
    exports.boolean = boolean;
    class EditorBooleanOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'boolean';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
        }
        validate(input) {
            return boolean(input, this.defaultValue);
        }
    }
    /**
     * @internal
     */
    function clampedInt(value, defaultValue, minimum, maximum) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        let r = parseInt(value, 10);
        if (isNaN(r)) {
            return defaultValue;
        }
        r = Math.max(minimum, r);
        r = Math.min(maximum, r);
        return r | 0;
    }
    exports.clampedInt = clampedInt;
    class EditorIntOption extends SimpleEditorOption {
        static clampedInt(value, defaultValue, minimum, maximum) {
            return clampedInt(value, defaultValue, minimum, maximum);
        }
        constructor(id, name, defaultValue, minimum, maximum, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'integer';
                schema.default = defaultValue;
                schema.minimum = minimum;
                schema.maximum = maximum;
            }
            super(id, name, defaultValue, schema);
            this.minimum = minimum;
            this.maximum = maximum;
        }
        validate(input) {
            return EditorIntOption.clampedInt(input, this.defaultValue, this.minimum, this.maximum);
        }
    }
    /**
     * @internal
     */
    function clampedFloat(value, defaultValue, minimum, maximum) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        const r = EditorFloatOption.float(value, defaultValue);
        return EditorFloatOption.clamp(r, minimum, maximum);
    }
    exports.clampedFloat = clampedFloat;
    class EditorFloatOption extends SimpleEditorOption {
        static clamp(n, min, max) {
            if (n < min) {
                return min;
            }
            if (n > max) {
                return max;
            }
            return n;
        }
        static float(value, defaultValue) {
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'undefined') {
                return defaultValue;
            }
            const r = parseFloat(value);
            return (isNaN(r) ? defaultValue : r);
        }
        constructor(id, name, defaultValue, validationFn, schema) {
            if (typeof schema !== 'undefined') {
                schema.type = 'number';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
            this.validationFn = validationFn;
        }
        validate(input) {
            return this.validationFn(EditorFloatOption.float(input, this.defaultValue));
        }
    }
    class EditorStringOption extends SimpleEditorOption {
        static string(value, defaultValue) {
            if (typeof value !== 'string') {
                return defaultValue;
            }
            return value;
        }
        constructor(id, name, defaultValue, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
        }
        validate(input) {
            return EditorStringOption.string(input, this.defaultValue);
        }
    }
    /**
     * @internal
     */
    function stringSet(value, defaultValue, allowedValues, renamedValues) {
        if (typeof value !== 'string') {
            return defaultValue;
        }
        if (renamedValues && value in renamedValues) {
            return renamedValues[value];
        }
        if (allowedValues.indexOf(value) === -1) {
            return defaultValue;
        }
        return value;
    }
    exports.stringSet = stringSet;
    class EditorStringEnumOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, allowedValues, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.enum = allowedValues;
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
            this._allowedValues = allowedValues;
        }
        validate(input) {
            return stringSet(input, this.defaultValue, this._allowedValues);
        }
    }
    class EditorEnumOption extends BaseEditorOption {
        constructor(id, name, defaultValue, defaultStringValue, allowedValues, convert, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.enum = allowedValues;
                schema.default = defaultStringValue;
            }
            super(id, name, defaultValue, schema);
            this._allowedValues = allowedValues;
            this._convert = convert;
        }
        validate(input) {
            if (typeof input !== 'string') {
                return this.defaultValue;
            }
            if (this._allowedValues.indexOf(input) === -1) {
                return this.defaultValue;
            }
            return this._convert(input);
        }
    }
    //#endregion
    //#region autoIndent
    function _autoIndentFromString(autoIndent) {
        switch (autoIndent) {
            case 'none': return 0 /* EditorAutoIndentStrategy.None */;
            case 'keep': return 1 /* EditorAutoIndentStrategy.Keep */;
            case 'brackets': return 2 /* EditorAutoIndentStrategy.Brackets */;
            case 'advanced': return 3 /* EditorAutoIndentStrategy.Advanced */;
            case 'full': return 4 /* EditorAutoIndentStrategy.Full */;
        }
    }
    //#endregion
    //#region accessibilitySupport
    class EditorAccessibilitySupport extends BaseEditorOption {
        constructor() {
            super(2 /* EditorOption.accessibilitySupport */, 'accessibilitySupport', 0 /* AccessibilitySupport.Unknown */, {
                type: 'string',
                enum: ['auto', 'on', 'off'],
                enumDescriptions: [
                    nls.localize('accessibilitySupport.auto', "Use platform APIs to detect when a Screen Reader is attached."),
                    nls.localize('accessibilitySupport.on', "Optimize for usage with a Screen Reader."),
                    nls.localize('accessibilitySupport.off', "Assume a screen reader is not attached."),
                ],
                default: 'auto',
                tags: ['accessibility'],
                description: nls.localize('accessibilitySupport', "Controls if the UI should run in a mode where it is optimized for screen readers.")
            });
        }
        validate(input) {
            switch (input) {
                case 'auto': return 0 /* AccessibilitySupport.Unknown */;
                case 'off': return 1 /* AccessibilitySupport.Disabled */;
                case 'on': return 2 /* AccessibilitySupport.Enabled */;
            }
            return this.defaultValue;
        }
        compute(env, options, value) {
            if (value === 0 /* AccessibilitySupport.Unknown */) {
                // The editor reads the `accessibilitySupport` from the environment
                return env.accessibilitySupport;
            }
            return value;
        }
    }
    class EditorComments extends BaseEditorOption {
        constructor() {
            const defaults = {
                insertSpace: true,
                ignoreEmptyLines: true,
            };
            super(23 /* EditorOption.comments */, 'comments', defaults, {
                'editor.comments.insertSpace': {
                    type: 'boolean',
                    default: defaults.insertSpace,
                    description: nls.localize('comments.insertSpace', "Controls whether a space character is inserted when commenting.")
                },
                'editor.comments.ignoreEmptyLines': {
                    type: 'boolean',
                    default: defaults.ignoreEmptyLines,
                    description: nls.localize('comments.ignoreEmptyLines', 'Controls if empty lines should be ignored with toggle, add or remove actions for line comments.')
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                insertSpace: boolean(input.insertSpace, this.defaultValue.insertSpace),
                ignoreEmptyLines: boolean(input.ignoreEmptyLines, this.defaultValue.ignoreEmptyLines),
            };
        }
    }
    //#endregion
    //#region cursorBlinking
    /**
     * The kind of animation in which the editor's cursor should be rendered.
     */
    var TextEditorCursorBlinkingStyle;
    (function (TextEditorCursorBlinkingStyle) {
        /**
         * Hidden
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Hidden"] = 0] = "Hidden";
        /**
         * Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Blink"] = 1] = "Blink";
        /**
         * Blinking with smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Smooth"] = 2] = "Smooth";
        /**
         * Blinking with prolonged filled state and smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Phase"] = 3] = "Phase";
        /**
         * Expand collapse animation on the y axis
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Expand"] = 4] = "Expand";
        /**
         * No-Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Solid"] = 5] = "Solid";
    })(TextEditorCursorBlinkingStyle || (exports.TextEditorCursorBlinkingStyle = TextEditorCursorBlinkingStyle = {}));
    function _cursorBlinkingStyleFromString(cursorBlinkingStyle) {
        switch (cursorBlinkingStyle) {
            case 'blink': return 1 /* TextEditorCursorBlinkingStyle.Blink */;
            case 'smooth': return 2 /* TextEditorCursorBlinkingStyle.Smooth */;
            case 'phase': return 3 /* TextEditorCursorBlinkingStyle.Phase */;
            case 'expand': return 4 /* TextEditorCursorBlinkingStyle.Expand */;
            case 'solid': return 5 /* TextEditorCursorBlinkingStyle.Solid */;
        }
    }
    //#endregion
    //#region cursorStyle
    /**
     * The style in which the editor's cursor should be rendered.
     */
    var TextEditorCursorStyle;
    (function (TextEditorCursorStyle) {
        /**
         * As a vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Line"] = 1] = "Line";
        /**
         * As a block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Block"] = 2] = "Block";
        /**
         * As a horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Underline"] = 3] = "Underline";
        /**
         * As a thin vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["LineThin"] = 4] = "LineThin";
        /**
         * As an outlined block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["BlockOutline"] = 5] = "BlockOutline";
        /**
         * As a thin horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["UnderlineThin"] = 6] = "UnderlineThin";
    })(TextEditorCursorStyle || (exports.TextEditorCursorStyle = TextEditorCursorStyle = {}));
    /**
     * @internal
     */
    function cursorStyleToString(cursorStyle) {
        switch (cursorStyle) {
            case TextEditorCursorStyle.Line: return 'line';
            case TextEditorCursorStyle.Block: return 'block';
            case TextEditorCursorStyle.Underline: return 'underline';
            case TextEditorCursorStyle.LineThin: return 'line-thin';
            case TextEditorCursorStyle.BlockOutline: return 'block-outline';
            case TextEditorCursorStyle.UnderlineThin: return 'underline-thin';
        }
    }
    exports.cursorStyleToString = cursorStyleToString;
    function _cursorStyleFromString(cursorStyle) {
        switch (cursorStyle) {
            case 'line': return TextEditorCursorStyle.Line;
            case 'block': return TextEditorCursorStyle.Block;
            case 'underline': return TextEditorCursorStyle.Underline;
            case 'line-thin': return TextEditorCursorStyle.LineThin;
            case 'block-outline': return TextEditorCursorStyle.BlockOutline;
            case 'underline-thin': return TextEditorCursorStyle.UnderlineThin;
        }
    }
    //#endregion
    //#region editorClassName
    class EditorClassName extends ComputedEditorOption {
        constructor() {
            super(140 /* EditorOption.editorClassName */);
        }
        compute(env, options, _) {
            const classNames = ['monaco-editor'];
            if (options.get(39 /* EditorOption.extraEditorClassName */)) {
                classNames.push(options.get(39 /* EditorOption.extraEditorClassName */));
            }
            if (env.extraEditorClassName) {
                classNames.push(env.extraEditorClassName);
            }
            if (options.get(73 /* EditorOption.mouseStyle */) === 'default') {
                classNames.push('mouse-default');
            }
            else if (options.get(73 /* EditorOption.mouseStyle */) === 'copy') {
                classNames.push('mouse-copy');
            }
            if (options.get(110 /* EditorOption.showUnused */)) {
                classNames.push('showUnused');
            }
            if (options.get(138 /* EditorOption.showDeprecated */)) {
                classNames.push('showDeprecated');
            }
            return classNames.join(' ');
        }
    }
    //#endregion
    //#region emptySelectionClipboard
    class EditorEmptySelectionClipboard extends EditorBooleanOption {
        constructor() {
            super(37 /* EditorOption.emptySelectionClipboard */, 'emptySelectionClipboard', true, { description: nls.localize('emptySelectionClipboard', "Controls whether copying without a selection copies the current line.") });
        }
        compute(env, options, value) {
            return value && env.emptySelectionClipboard;
        }
    }
    class EditorFind extends BaseEditorOption {
        constructor() {
            const defaults = {
                cursorMoveOnType: true,
                seedSearchStringFromSelection: 'always',
                autoFindInSelection: 'never',
                globalFindClipboard: false,
                addExtraSpaceOnTop: true,
                loop: true
            };
            super(41 /* EditorOption.find */, 'find', defaults, {
                'editor.find.cursorMoveOnType': {
                    type: 'boolean',
                    default: defaults.cursorMoveOnType,
                    description: nls.localize('find.cursorMoveOnType', "Controls whether the cursor should jump to find matches while typing.")
                },
                'editor.find.seedSearchStringFromSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'selection'],
                    default: defaults.seedSearchStringFromSelection,
                    enumDescriptions: [
                        nls.localize('editor.find.seedSearchStringFromSelection.never', 'Never seed search string from the editor selection.'),
                        nls.localize('editor.find.seedSearchStringFromSelection.always', 'Always seed search string from the editor selection, including word at cursor position.'),
                        nls.localize('editor.find.seedSearchStringFromSelection.selection', 'Only seed search string from the editor selection.')
                    ],
                    description: nls.localize('find.seedSearchStringFromSelection', "Controls whether the search string in the Find Widget is seeded from the editor selection.")
                },
                'editor.find.autoFindInSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'multiline'],
                    default: defaults.autoFindInSelection,
                    enumDescriptions: [
                        nls.localize('editor.find.autoFindInSelection.never', 'Never turn on Find in Selection automatically (default).'),
                        nls.localize('editor.find.autoFindInSelection.always', 'Always turn on Find in Selection automatically.'),
                        nls.localize('editor.find.autoFindInSelection.multiline', 'Turn on Find in Selection automatically when multiple lines of content are selected.')
                    ],
                    description: nls.localize('find.autoFindInSelection', "Controls the condition for turning on Find in Selection automatically.")
                },
                'editor.find.globalFindClipboard': {
                    type: 'boolean',
                    default: defaults.globalFindClipboard,
                    description: nls.localize('find.globalFindClipboard', "Controls whether the Find Widget should read or modify the shared find clipboard on macOS."),
                    included: platform.isMacintosh
                },
                'editor.find.addExtraSpaceOnTop': {
                    type: 'boolean',
                    default: defaults.addExtraSpaceOnTop,
                    description: nls.localize('find.addExtraSpaceOnTop', "Controls whether the Find Widget should add extra lines on top of the editor. When true, you can scroll beyond the first line when the Find Widget is visible.")
                },
                'editor.find.loop': {
                    type: 'boolean',
                    default: defaults.loop,
                    description: nls.localize('find.loop', "Controls whether the search automatically restarts from the beginning (or the end) when no further matches can be found.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                cursorMoveOnType: boolean(input.cursorMoveOnType, this.defaultValue.cursorMoveOnType),
                seedSearchStringFromSelection: typeof _input.seedSearchStringFromSelection === 'boolean'
                    ? (_input.seedSearchStringFromSelection ? 'always' : 'never')
                    : stringSet(input.seedSearchStringFromSelection, this.defaultValue.seedSearchStringFromSelection, ['never', 'always', 'selection']),
                autoFindInSelection: typeof _input.autoFindInSelection === 'boolean'
                    ? (_input.autoFindInSelection ? 'always' : 'never')
                    : stringSet(input.autoFindInSelection, this.defaultValue.autoFindInSelection, ['never', 'always', 'multiline']),
                globalFindClipboard: boolean(input.globalFindClipboard, this.defaultValue.globalFindClipboard),
                addExtraSpaceOnTop: boolean(input.addExtraSpaceOnTop, this.defaultValue.addExtraSpaceOnTop),
                loop: boolean(input.loop, this.defaultValue.loop),
            };
        }
    }
    //#endregion
    //#region fontLigatures
    /**
     * @internal
     */
    class EditorFontLigatures extends BaseEditorOption {
        static { this.OFF = '"liga" off, "calt" off'; }
        static { this.ON = '"liga" on, "calt" on'; }
        constructor() {
            super(51 /* EditorOption.fontLigatures */, 'fontLigatures', EditorFontLigatures.OFF, {
                anyOf: [
                    {
                        type: 'boolean',
                        description: nls.localize('fontLigatures', "Enables/Disables font ligatures ('calt' and 'liga' font features). Change this to a string for fine-grained control of the 'font-feature-settings' CSS property."),
                    },
                    {
                        type: 'string',
                        description: nls.localize('fontFeatureSettings', "Explicit 'font-feature-settings' CSS property. A boolean can be passed instead if one only needs to turn on/off ligatures.")
                    }
                ],
                description: nls.localize('fontLigaturesGeneral', "Configures font ligatures or font features. Can be either a boolean to enable/disable ligatures or a string for the value of the CSS 'font-feature-settings' property."),
                default: false
            });
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            if (typeof input === 'string') {
                if (input === 'false' || input.length === 0) {
                    return EditorFontLigatures.OFF;
                }
                if (input === 'true') {
                    return EditorFontLigatures.ON;
                }
                return input;
            }
            if (Boolean(input)) {
                return EditorFontLigatures.ON;
            }
            return EditorFontLigatures.OFF;
        }
    }
    exports.EditorFontLigatures = EditorFontLigatures;
    //#endregion
    //#region fontVariations
    /**
     * @internal
     */
    class EditorFontVariations extends BaseEditorOption {
        // Text is laid out using default settings.
        static { this.OFF = 'normal'; }
        // Translate `fontWeight` config to the `font-variation-settings` CSS property.
        static { this.TRANSLATE = 'translate'; }
        constructor() {
            super(54 /* EditorOption.fontVariations */, 'fontVariations', EditorFontVariations.OFF, {
                anyOf: [
                    {
                        type: 'boolean',
                        description: nls.localize('fontVariations', "Enables/Disables the translation from font-weight to font-variation-settings. Change this to a string for fine-grained control of the 'font-variation-settings' CSS property."),
                    },
                    {
                        type: 'string',
                        description: nls.localize('fontVariationSettings', "Explicit 'font-variation-settings' CSS property. A boolean can be passed instead if one only needs to translate font-weight to font-variation-settings.")
                    }
                ],
                description: nls.localize('fontVariationsGeneral', "Configures font variations. Can be either a boolean to enable/disable the translation from font-weight to font-variation-settings or a string for the value of the CSS 'font-variation-settings' property."),
                default: false
            });
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            if (typeof input === 'string') {
                if (input === 'false') {
                    return EditorFontVariations.OFF;
                }
                if (input === 'true') {
                    return EditorFontVariations.TRANSLATE;
                }
                return input;
            }
            if (Boolean(input)) {
                return EditorFontVariations.TRANSLATE;
            }
            return EditorFontVariations.OFF;
        }
        compute(env, options, value) {
            // The value is computed from the fontWeight if it is true.
            // So take the result from env.fontInfo
            return env.fontInfo.fontVariationSettings;
        }
    }
    exports.EditorFontVariations = EditorFontVariations;
    //#endregion
    //#region fontInfo
    class EditorFontInfo extends ComputedEditorOption {
        constructor() {
            super(50 /* EditorOption.fontInfo */);
        }
        compute(env, options, _) {
            return env.fontInfo;
        }
    }
    //#endregion
    //#region fontSize
    class EditorFontSize extends SimpleEditorOption {
        constructor() {
            super(52 /* EditorOption.fontSize */, 'fontSize', exports.EDITOR_FONT_DEFAULTS.fontSize, {
                type: 'number',
                minimum: 6,
                maximum: 100,
                default: exports.EDITOR_FONT_DEFAULTS.fontSize,
                description: nls.localize('fontSize', "Controls the font size in pixels.")
            });
        }
        validate(input) {
            const r = EditorFloatOption.float(input, this.defaultValue);
            if (r === 0) {
                return exports.EDITOR_FONT_DEFAULTS.fontSize;
            }
            return EditorFloatOption.clamp(r, 6, 100);
        }
        compute(env, options, value) {
            // The final fontSize respects the editor zoom level.
            // So take the result from env.fontInfo
            return env.fontInfo.fontSize;
        }
    }
    //#endregion
    //#region fontWeight
    class EditorFontWeight extends BaseEditorOption {
        static { this.SUGGESTION_VALUES = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']; }
        static { this.MINIMUM_VALUE = 1; }
        static { this.MAXIMUM_VALUE = 1000; }
        constructor() {
            super(53 /* EditorOption.fontWeight */, 'fontWeight', exports.EDITOR_FONT_DEFAULTS.fontWeight, {
                anyOf: [
                    {
                        type: 'number',
                        minimum: EditorFontWeight.MINIMUM_VALUE,
                        maximum: EditorFontWeight.MAXIMUM_VALUE,
                        errorMessage: nls.localize('fontWeightErrorMessage', "Only \"normal\" and \"bold\" keywords or numbers between 1 and 1000 are allowed.")
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: EditorFontWeight.SUGGESTION_VALUES
                    }
                ],
                default: exports.EDITOR_FONT_DEFAULTS.fontWeight,
                description: nls.localize('fontWeight', "Controls the font weight. Accepts \"normal\" and \"bold\" keywords or numbers between 1 and 1000.")
            });
        }
        validate(input) {
            if (input === 'normal' || input === 'bold') {
                return input;
            }
            return String(EditorIntOption.clampedInt(input, exports.EDITOR_FONT_DEFAULTS.fontWeight, EditorFontWeight.MINIMUM_VALUE, EditorFontWeight.MAXIMUM_VALUE));
        }
    }
    class EditorGoToLocation extends BaseEditorOption {
        constructor() {
            const defaults = {
                multiple: 'peek',
                multipleDefinitions: 'peek',
                multipleTypeDefinitions: 'peek',
                multipleDeclarations: 'peek',
                multipleImplementations: 'peek',
                multipleReferences: 'peek',
                alternativeDefinitionCommand: 'editor.action.goToReferences',
                alternativeTypeDefinitionCommand: 'editor.action.goToReferences',
                alternativeDeclarationCommand: 'editor.action.goToReferences',
                alternativeImplementationCommand: '',
                alternativeReferenceCommand: '',
            };
            const jsonSubset = {
                type: 'string',
                enum: ['peek', 'gotoAndPeek', 'goto'],
                default: defaults.multiple,
                enumDescriptions: [
                    nls.localize('editor.gotoLocation.multiple.peek', 'Show Peek view of the results (default)'),
                    nls.localize('editor.gotoLocation.multiple.gotoAndPeek', 'Go to the primary result and show a Peek view'),
                    nls.localize('editor.gotoLocation.multiple.goto', 'Go to the primary result and enable Peek-less navigation to others')
                ]
            };
            const alternativeCommandOptions = ['', 'editor.action.referenceSearch.trigger', 'editor.action.goToReferences', 'editor.action.peekImplementation', 'editor.action.goToImplementation', 'editor.action.peekTypeDefinition', 'editor.action.goToTypeDefinition', 'editor.action.peekDeclaration', 'editor.action.revealDeclaration', 'editor.action.peekDefinition', 'editor.action.revealDefinitionAside', 'editor.action.revealDefinition'];
            super(58 /* EditorOption.gotoLocation */, 'gotoLocation', defaults, {
                'editor.gotoLocation.multiple': {
                    deprecationMessage: nls.localize('editor.gotoLocation.multiple.deprecated', "This setting is deprecated, please use separate settings like 'editor.editor.gotoLocation.multipleDefinitions' or 'editor.editor.gotoLocation.multipleImplementations' instead."),
                },
                'editor.gotoLocation.multipleDefinitions': {
                    description: nls.localize('editor.editor.gotoLocation.multipleDefinitions', "Controls the behavior the 'Go to Definition'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleTypeDefinitions': {
                    description: nls.localize('editor.editor.gotoLocation.multipleTypeDefinitions', "Controls the behavior the 'Go to Type Definition'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleDeclarations': {
                    description: nls.localize('editor.editor.gotoLocation.multipleDeclarations', "Controls the behavior the 'Go to Declaration'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleImplementations': {
                    description: nls.localize('editor.editor.gotoLocation.multipleImplemenattions', "Controls the behavior the 'Go to Implementations'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleReferences': {
                    description: nls.localize('editor.editor.gotoLocation.multipleReferences', "Controls the behavior the 'Go to References'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.alternativeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeDefinitionCommand', "Alternative command id that is being executed when the result of 'Go to Definition' is the current location.")
                },
                'editor.gotoLocation.alternativeTypeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeTypeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeTypeDefinitionCommand', "Alternative command id that is being executed when the result of 'Go to Type Definition' is the current location.")
                },
                'editor.gotoLocation.alternativeDeclarationCommand': {
                    type: 'string',
                    default: defaults.alternativeDeclarationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeDeclarationCommand', "Alternative command id that is being executed when the result of 'Go to Declaration' is the current location.")
                },
                'editor.gotoLocation.alternativeImplementationCommand': {
                    type: 'string',
                    default: defaults.alternativeImplementationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeImplementationCommand', "Alternative command id that is being executed when the result of 'Go to Implementation' is the current location.")
                },
                'editor.gotoLocation.alternativeReferenceCommand': {
                    type: 'string',
                    default: defaults.alternativeReferenceCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeReferenceCommand', "Alternative command id that is being executed when the result of 'Go to Reference' is the current location.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                multiple: stringSet(input.multiple, this.defaultValue.multiple, ['peek', 'gotoAndPeek', 'goto']),
                multipleDefinitions: input.multipleDefinitions ?? stringSet(input.multipleDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleTypeDefinitions: input.multipleTypeDefinitions ?? stringSet(input.multipleTypeDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleDeclarations: input.multipleDeclarations ?? stringSet(input.multipleDeclarations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleImplementations: input.multipleImplementations ?? stringSet(input.multipleImplementations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleReferences: input.multipleReferences ?? stringSet(input.multipleReferences, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                alternativeDefinitionCommand: EditorStringOption.string(input.alternativeDefinitionCommand, this.defaultValue.alternativeDefinitionCommand),
                alternativeTypeDefinitionCommand: EditorStringOption.string(input.alternativeTypeDefinitionCommand, this.defaultValue.alternativeTypeDefinitionCommand),
                alternativeDeclarationCommand: EditorStringOption.string(input.alternativeDeclarationCommand, this.defaultValue.alternativeDeclarationCommand),
                alternativeImplementationCommand: EditorStringOption.string(input.alternativeImplementationCommand, this.defaultValue.alternativeImplementationCommand),
                alternativeReferenceCommand: EditorStringOption.string(input.alternativeReferenceCommand, this.defaultValue.alternativeReferenceCommand),
            };
        }
    }
    class EditorHover extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                delay: 300,
                hidingDelay: 300,
                sticky: true,
                above: true,
            };
            super(60 /* EditorOption.hover */, 'hover', defaults, {
                'editor.hover.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize('hover.enabled', "Controls whether the hover is shown.")
                },
                'editor.hover.delay': {
                    type: 'number',
                    default: defaults.delay,
                    minimum: 0,
                    maximum: 10000,
                    description: nls.localize('hover.delay', "Controls the delay in milliseconds after which the hover is shown.")
                },
                'editor.hover.sticky': {
                    type: 'boolean',
                    default: defaults.sticky,
                    description: nls.localize('hover.sticky', "Controls whether the hover should remain visible when mouse is moved over it.")
                },
                'editor.hover.hidingDelay': {
                    type: 'integer',
                    minimum: 0,
                    default: defaults.hidingDelay,
                    description: nls.localize('hover.hidingDelay', "Controls the delay in milliseconds after which the hover is hidden. Requires `editor.hover.sticky` to be enabled.")
                },
                'editor.hover.above': {
                    type: 'boolean',
                    default: defaults.above,
                    description: nls.localize('hover.above', "Prefer showing hovers above the line, if there's space.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                delay: EditorIntOption.clampedInt(input.delay, this.defaultValue.delay, 0, 10000),
                sticky: boolean(input.sticky, this.defaultValue.sticky),
                hidingDelay: EditorIntOption.clampedInt(input.hidingDelay, this.defaultValue.hidingDelay, 0, 600000),
                above: boolean(input.above, this.defaultValue.above),
            };
        }
    }
    var RenderMinimap;
    (function (RenderMinimap) {
        RenderMinimap[RenderMinimap["None"] = 0] = "None";
        RenderMinimap[RenderMinimap["Text"] = 1] = "Text";
        RenderMinimap[RenderMinimap["Blocks"] = 2] = "Blocks";
    })(RenderMinimap || (exports.RenderMinimap = RenderMinimap = {}));
    /**
     * @internal
     */
    class EditorLayoutInfoComputer extends ComputedEditorOption {
        constructor() {
            super(143 /* EditorOption.layoutInfo */);
        }
        compute(env, options, _) {
            return EditorLayoutInfoComputer.computeLayout(options, {
                memory: env.memory,
                outerWidth: env.outerWidth,
                outerHeight: env.outerHeight,
                isDominatedByLongLines: env.isDominatedByLongLines,
                lineHeight: env.fontInfo.lineHeight,
                viewLineCount: env.viewLineCount,
                lineNumbersDigitCount: env.lineNumbersDigitCount,
                typicalHalfwidthCharacterWidth: env.fontInfo.typicalHalfwidthCharacterWidth,
                maxDigitWidth: env.fontInfo.maxDigitWidth,
                pixelRatio: env.pixelRatio,
                glyphMarginDecorationLaneCount: env.glyphMarginDecorationLaneCount
            });
        }
        static computeContainedMinimapLineCount(input) {
            const typicalViewportLineCount = input.height / input.lineHeight;
            const extraLinesBeforeFirstLine = Math.floor(input.paddingTop / input.lineHeight);
            let extraLinesBeyondLastLine = Math.floor(input.paddingBottom / input.lineHeight);
            if (input.scrollBeyondLastLine) {
                extraLinesBeyondLastLine = Math.max(extraLinesBeyondLastLine, typicalViewportLineCount - 1);
            }
            const desiredRatio = (extraLinesBeforeFirstLine + input.viewLineCount + extraLinesBeyondLastLine) / (input.pixelRatio * input.height);
            const minimapLineCount = Math.floor(input.viewLineCount / desiredRatio);
            return { typicalViewportLineCount, extraLinesBeforeFirstLine, extraLinesBeyondLastLine, desiredRatio, minimapLineCount };
        }
        static _computeMinimapLayout(input, memory) {
            const outerWidth = input.outerWidth;
            const outerHeight = input.outerHeight;
            const pixelRatio = input.pixelRatio;
            if (!input.minimap.enabled) {
                return {
                    renderMinimap: 0 /* RenderMinimap.None */,
                    minimapLeft: 0,
                    minimapWidth: 0,
                    minimapHeightIsEditorHeight: false,
                    minimapIsSampling: false,
                    minimapScale: 1,
                    minimapLineHeight: 1,
                    minimapCanvasInnerWidth: 0,
                    minimapCanvasInnerHeight: Math.floor(pixelRatio * outerHeight),
                    minimapCanvasOuterWidth: 0,
                    minimapCanvasOuterHeight: outerHeight,
                };
            }
            // Can use memory if only the `viewLineCount` and `remainingWidth` have changed
            const stableMinimapLayoutInput = memory.stableMinimapLayoutInput;
            const couldUseMemory = (stableMinimapLayoutInput
                // && input.outerWidth === lastMinimapLayoutInput.outerWidth !!! INTENTIONAL OMITTED
                && input.outerHeight === stableMinimapLayoutInput.outerHeight
                && input.lineHeight === stableMinimapLayoutInput.lineHeight
                && input.typicalHalfwidthCharacterWidth === stableMinimapLayoutInput.typicalHalfwidthCharacterWidth
                && input.pixelRatio === stableMinimapLayoutInput.pixelRatio
                && input.scrollBeyondLastLine === stableMinimapLayoutInput.scrollBeyondLastLine
                && input.paddingTop === stableMinimapLayoutInput.paddingTop
                && input.paddingBottom === stableMinimapLayoutInput.paddingBottom
                && input.minimap.enabled === stableMinimapLayoutInput.minimap.enabled
                && input.minimap.side === stableMinimapLayoutInput.minimap.side
                && input.minimap.size === stableMinimapLayoutInput.minimap.size
                && input.minimap.showSlider === stableMinimapLayoutInput.minimap.showSlider
                && input.minimap.renderCharacters === stableMinimapLayoutInput.minimap.renderCharacters
                && input.minimap.maxColumn === stableMinimapLayoutInput.minimap.maxColumn
                && input.minimap.scale === stableMinimapLayoutInput.minimap.scale
                && input.verticalScrollbarWidth === stableMinimapLayoutInput.verticalScrollbarWidth
                // && input.viewLineCount === lastMinimapLayoutInput.viewLineCount !!! INTENTIONAL OMITTED
                // && input.remainingWidth === lastMinimapLayoutInput.remainingWidth !!! INTENTIONAL OMITTED
                && input.isViewportWrapping === stableMinimapLayoutInput.isViewportWrapping);
            const lineHeight = input.lineHeight;
            const typicalHalfwidthCharacterWidth = input.typicalHalfwidthCharacterWidth;
            const scrollBeyondLastLine = input.scrollBeyondLastLine;
            const minimapRenderCharacters = input.minimap.renderCharacters;
            let minimapScale = (pixelRatio >= 2 ? Math.round(input.minimap.scale * 2) : input.minimap.scale);
            const minimapMaxColumn = input.minimap.maxColumn;
            const minimapSize = input.minimap.size;
            const minimapSide = input.minimap.side;
            const verticalScrollbarWidth = input.verticalScrollbarWidth;
            const viewLineCount = input.viewLineCount;
            const remainingWidth = input.remainingWidth;
            const isViewportWrapping = input.isViewportWrapping;
            const baseCharHeight = minimapRenderCharacters ? 2 : 3;
            let minimapCanvasInnerHeight = Math.floor(pixelRatio * outerHeight);
            const minimapCanvasOuterHeight = minimapCanvasInnerHeight / pixelRatio;
            let minimapHeightIsEditorHeight = false;
            let minimapIsSampling = false;
            let minimapLineHeight = baseCharHeight * minimapScale;
            let minimapCharWidth = minimapScale / pixelRatio;
            let minimapWidthMultiplier = 1;
            if (minimapSize === 'fill' || minimapSize === 'fit') {
                const { typicalViewportLineCount, extraLinesBeforeFirstLine, extraLinesBeyondLastLine, desiredRatio, minimapLineCount } = EditorLayoutInfoComputer.computeContainedMinimapLineCount({
                    viewLineCount: viewLineCount,
                    scrollBeyondLastLine: scrollBeyondLastLine,
                    paddingTop: input.paddingTop,
                    paddingBottom: input.paddingBottom,
                    height: outerHeight,
                    lineHeight: lineHeight,
                    pixelRatio: pixelRatio
                });
                // ratio is intentionally not part of the layout to avoid the layout changing all the time
                // when doing sampling
                const ratio = viewLineCount / minimapLineCount;
                if (ratio > 1) {
                    minimapHeightIsEditorHeight = true;
                    minimapIsSampling = true;
                    minimapScale = 1;
                    minimapLineHeight = 1;
                    minimapCharWidth = minimapScale / pixelRatio;
                }
                else {
                    let fitBecomesFill = false;
                    let maxMinimapScale = minimapScale + 1;
                    if (minimapSize === 'fit') {
                        const effectiveMinimapHeight = Math.ceil((extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight);
                        if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
                            // There is a loop when using `fit` and viewport wrapping:
                            // - view line count impacts minimap layout
                            // - minimap layout impacts viewport width
                            // - viewport width impacts view line count
                            // To break the loop, once we go to a smaller minimap scale, we try to stick with it.
                            fitBecomesFill = true;
                            maxMinimapScale = memory.stableFitMaxMinimapScale;
                        }
                        else {
                            fitBecomesFill = (effectiveMinimapHeight > minimapCanvasInnerHeight);
                        }
                    }
                    if (minimapSize === 'fill' || fitBecomesFill) {
                        minimapHeightIsEditorHeight = true;
                        const configuredMinimapScale = minimapScale;
                        minimapLineHeight = Math.min(lineHeight * pixelRatio, Math.max(1, Math.floor(1 / desiredRatio)));
                        if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
                            // There is a loop when using `fill` and viewport wrapping:
                            // - view line count impacts minimap layout
                            // - minimap layout impacts viewport width
                            // - viewport width impacts view line count
                            // To break the loop, once we go to a smaller minimap scale, we try to stick with it.
                            maxMinimapScale = memory.stableFitMaxMinimapScale;
                        }
                        minimapScale = Math.min(maxMinimapScale, Math.max(1, Math.floor(minimapLineHeight / baseCharHeight)));
                        if (minimapScale > configuredMinimapScale) {
                            minimapWidthMultiplier = Math.min(2, minimapScale / configuredMinimapScale);
                        }
                        minimapCharWidth = minimapScale / pixelRatio / minimapWidthMultiplier;
                        minimapCanvasInnerHeight = Math.ceil((Math.max(typicalViewportLineCount, extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine)) * minimapLineHeight);
                        if (isViewportWrapping) {
                            // remember for next time
                            memory.stableMinimapLayoutInput = input;
                            memory.stableFitRemainingWidth = remainingWidth;
                            memory.stableFitMaxMinimapScale = minimapScale;
                        }
                        else {
                            memory.stableMinimapLayoutInput = null;
                            memory.stableFitRemainingWidth = 0;
                        }
                    }
                }
            }
            // Given:
            // (leaving 2px for the cursor to have space after the last character)
            // viewportColumn = (contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth
            // minimapWidth = viewportColumn * minimapCharWidth
            // contentWidth = remainingWidth - minimapWidth
            // What are good values for contentWidth and minimapWidth ?
            // minimapWidth = ((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth) * minimapCharWidth
            // typicalHalfwidthCharacterWidth * minimapWidth = (contentWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // typicalHalfwidthCharacterWidth * minimapWidth = (remainingWidth - minimapWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // (typicalHalfwidthCharacterWidth + minimapCharWidth) * minimapWidth = (remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // minimapWidth = ((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth)
            const minimapMaxWidth = Math.floor(minimapMaxColumn * minimapCharWidth);
            const minimapWidth = Math.min(minimapMaxWidth, Math.max(0, Math.floor(((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth))) + exports.MINIMAP_GUTTER_WIDTH);
            let minimapCanvasInnerWidth = Math.floor(pixelRatio * minimapWidth);
            const minimapCanvasOuterWidth = minimapCanvasInnerWidth / pixelRatio;
            minimapCanvasInnerWidth = Math.floor(minimapCanvasInnerWidth * minimapWidthMultiplier);
            const renderMinimap = (minimapRenderCharacters ? 1 /* RenderMinimap.Text */ : 2 /* RenderMinimap.Blocks */);
            const minimapLeft = (minimapSide === 'left' ? 0 : (outerWidth - minimapWidth - verticalScrollbarWidth));
            return {
                renderMinimap,
                minimapLeft,
                minimapWidth,
                minimapHeightIsEditorHeight,
                minimapIsSampling,
                minimapScale,
                minimapLineHeight,
                minimapCanvasInnerWidth,
                minimapCanvasInnerHeight,
                minimapCanvasOuterWidth,
                minimapCanvasOuterHeight,
            };
        }
        static computeLayout(options, env) {
            const outerWidth = env.outerWidth | 0;
            const outerHeight = env.outerHeight | 0;
            const lineHeight = env.lineHeight | 0;
            const lineNumbersDigitCount = env.lineNumbersDigitCount | 0;
            const typicalHalfwidthCharacterWidth = env.typicalHalfwidthCharacterWidth;
            const maxDigitWidth = env.maxDigitWidth;
            const pixelRatio = env.pixelRatio;
            const viewLineCount = env.viewLineCount;
            const wordWrapOverride2 = options.get(135 /* EditorOption.wordWrapOverride2 */);
            const wordWrapOverride1 = (wordWrapOverride2 === 'inherit' ? options.get(134 /* EditorOption.wordWrapOverride1 */) : wordWrapOverride2);
            const wordWrap = (wordWrapOverride1 === 'inherit' ? options.get(130 /* EditorOption.wordWrap */) : wordWrapOverride1);
            const wordWrapColumn = options.get(133 /* EditorOption.wordWrapColumn */);
            const isDominatedByLongLines = env.isDominatedByLongLines;
            const showGlyphMargin = options.get(57 /* EditorOption.glyphMargin */);
            const showLineNumbers = (options.get(67 /* EditorOption.lineNumbers */).renderType !== 0 /* RenderLineNumbersType.Off */);
            const lineNumbersMinChars = options.get(68 /* EditorOption.lineNumbersMinChars */);
            const scrollBeyondLastLine = options.get(104 /* EditorOption.scrollBeyondLastLine */);
            const padding = options.get(83 /* EditorOption.padding */);
            const minimap = options.get(72 /* EditorOption.minimap */);
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            const verticalScrollbarWidth = scrollbar.verticalScrollbarSize;
            const verticalScrollbarHasArrows = scrollbar.verticalHasArrows;
            const scrollbarArrowSize = scrollbar.arrowSize;
            const horizontalScrollbarHeight = scrollbar.horizontalScrollbarSize;
            const folding = options.get(43 /* EditorOption.folding */);
            const showFoldingDecoration = options.get(109 /* EditorOption.showFoldingControls */) !== 'never';
            let lineDecorationsWidth = options.get(65 /* EditorOption.lineDecorationsWidth */);
            if (folding && showFoldingDecoration) {
                lineDecorationsWidth += 16;
            }
            let lineNumbersWidth = 0;
            if (showLineNumbers) {
                const digitCount = Math.max(lineNumbersDigitCount, lineNumbersMinChars);
                lineNumbersWidth = Math.round(digitCount * maxDigitWidth);
            }
            let glyphMarginWidth = 0;
            if (showGlyphMargin) {
                glyphMarginWidth = lineHeight * env.glyphMarginDecorationLaneCount;
            }
            let glyphMarginLeft = 0;
            let lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
            let decorationsLeft = lineNumbersLeft + lineNumbersWidth;
            let contentLeft = decorationsLeft + lineDecorationsWidth;
            const remainingWidth = outerWidth - glyphMarginWidth - lineNumbersWidth - lineDecorationsWidth;
            let isWordWrapMinified = false;
            let isViewportWrapping = false;
            let wrappingColumn = -1;
            if (wordWrapOverride1 === 'inherit' && isDominatedByLongLines) {
                // Force viewport width wrapping if model is dominated by long lines
                isWordWrapMinified = true;
                isViewportWrapping = true;
            }
            else if (wordWrap === 'on' || wordWrap === 'bounded') {
                isViewportWrapping = true;
            }
            else if (wordWrap === 'wordWrapColumn') {
                wrappingColumn = wordWrapColumn;
            }
            const minimapLayout = EditorLayoutInfoComputer._computeMinimapLayout({
                outerWidth: outerWidth,
                outerHeight: outerHeight,
                lineHeight: lineHeight,
                typicalHalfwidthCharacterWidth: typicalHalfwidthCharacterWidth,
                pixelRatio: pixelRatio,
                scrollBeyondLastLine: scrollBeyondLastLine,
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                minimap: minimap,
                verticalScrollbarWidth: verticalScrollbarWidth,
                viewLineCount: viewLineCount,
                remainingWidth: remainingWidth,
                isViewportWrapping: isViewportWrapping,
            }, env.memory || new ComputeOptionsMemory());
            if (minimapLayout.renderMinimap !== 0 /* RenderMinimap.None */ && minimapLayout.minimapLeft === 0) {
                // the minimap is rendered to the left, so move everything to the right
                glyphMarginLeft += minimapLayout.minimapWidth;
                lineNumbersLeft += minimapLayout.minimapWidth;
                decorationsLeft += minimapLayout.minimapWidth;
                contentLeft += minimapLayout.minimapWidth;
            }
            const contentWidth = remainingWidth - minimapLayout.minimapWidth;
            // (leaving 2px for the cursor to have space after the last character)
            const viewportColumn = Math.max(1, Math.floor((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth));
            const verticalArrowSize = (verticalScrollbarHasArrows ? scrollbarArrowSize : 0);
            if (isViewportWrapping) {
                // compute the actual wrappingColumn
                wrappingColumn = Math.max(1, viewportColumn);
                if (wordWrap === 'bounded') {
                    wrappingColumn = Math.min(wrappingColumn, wordWrapColumn);
                }
            }
            return {
                width: outerWidth,
                height: outerHeight,
                glyphMarginLeft: glyphMarginLeft,
                glyphMarginWidth: glyphMarginWidth,
                glyphMarginDecorationLaneCount: env.glyphMarginDecorationLaneCount,
                lineNumbersLeft: lineNumbersLeft,
                lineNumbersWidth: lineNumbersWidth,
                decorationsLeft: decorationsLeft,
                decorationsWidth: lineDecorationsWidth,
                contentLeft: contentLeft,
                contentWidth: contentWidth,
                minimap: minimapLayout,
                viewportColumn: viewportColumn,
                isWordWrapMinified: isWordWrapMinified,
                isViewportWrapping: isViewportWrapping,
                wrappingColumn: wrappingColumn,
                verticalScrollbarWidth: verticalScrollbarWidth,
                horizontalScrollbarHeight: horizontalScrollbarHeight,
                overviewRuler: {
                    top: verticalArrowSize,
                    width: verticalScrollbarWidth,
                    height: (outerHeight - 2 * verticalArrowSize),
                    right: 0
                }
            };
        }
    }
    exports.EditorLayoutInfoComputer = EditorLayoutInfoComputer;
    //#endregion
    //#region WrappingStrategy
    class WrappingStrategy extends BaseEditorOption {
        constructor() {
            super(137 /* EditorOption.wrappingStrategy */, 'wrappingStrategy', 'simple', {
                'editor.wrappingStrategy': {
                    enumDescriptions: [
                        nls.localize('wrappingStrategy.simple', "Assumes that all characters are of the same width. This is a fast algorithm that works correctly for monospace fonts and certain scripts (like Latin characters) where glyphs are of equal width."),
                        nls.localize('wrappingStrategy.advanced', "Delegates wrapping points computation to the browser. This is a slow algorithm, that might cause freezes for large files, but it works correctly in all cases.")
                    ],
                    type: 'string',
                    enum: ['simple', 'advanced'],
                    default: 'simple',
                    description: nls.localize('wrappingStrategy', "Controls the algorithm that computes wrapping points. Note that when in accessibility mode, advanced will be used for the best experience.")
                }
            });
        }
        validate(input) {
            return stringSet(input, 'simple', ['simple', 'advanced']);
        }
        compute(env, options, value) {
            const accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            if (accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
                // if we know for a fact that a screen reader is attached, we switch our strategy to advanced to
                // help that the editor's wrapping points match the textarea's wrapping points
                return 'advanced';
            }
            return value;
        }
    }
    //#endregion
    //#region lightbulb
    var ShowLightbulbIconMode;
    (function (ShowLightbulbIconMode) {
        ShowLightbulbIconMode["Off"] = "off";
        ShowLightbulbIconMode["OnCode"] = "onCode";
        ShowLightbulbIconMode["On"] = "on";
    })(ShowLightbulbIconMode || (exports.ShowLightbulbIconMode = ShowLightbulbIconMode = {}));
    class EditorLightbulb extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: ShowLightbulbIconMode.OnCode };
            super(64 /* EditorOption.lightbulb */, 'lightbulb', defaults, {
                'editor.lightbulb.enabled': {
                    type: 'string',
                    tags: ['experimental'],
                    enum: [ShowLightbulbIconMode.Off, ShowLightbulbIconMode.OnCode, ShowLightbulbIconMode.On],
                    default: defaults.enabled,
                    enumDescriptions: [
                        nls.localize('editor.lightbulb.enabled.off', 'Disable the code action menu.'),
                        nls.localize('editor.lightbulb.enabled.onCode', 'Show the code action menu when the cursor is on lines with code.'),
                        nls.localize('editor.lightbulb.enabled.on', 'Show the code action menu when the cursor is on lines with code or on empty lines.'),
                    ],
                    description: nls.localize('enabled', "Enables the Code Action lightbulb in the editor.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: stringSet(input.enabled, this.defaultValue.enabled, [ShowLightbulbIconMode.Off, ShowLightbulbIconMode.OnCode, ShowLightbulbIconMode.On])
            };
        }
    }
    class EditorStickyScroll extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: false, maxLineCount: 5, defaultModel: 'outlineModel', scrollWithEditor: true };
            super(114 /* EditorOption.stickyScroll */, 'stickyScroll', defaults, {
                'editor.stickyScroll.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize('editor.stickyScroll.enabled', "Shows the nested current scopes during the scroll at the top of the editor."),
                    tags: ['experimental']
                },
                'editor.stickyScroll.maxLineCount': {
                    type: 'number',
                    default: defaults.maxLineCount,
                    minimum: 1,
                    maximum: 10,
                    description: nls.localize('editor.stickyScroll.maxLineCount', "Defines the maximum number of sticky lines to show.")
                },
                'editor.stickyScroll.defaultModel': {
                    type: 'string',
                    enum: ['outlineModel', 'foldingProviderModel', 'indentationModel'],
                    default: defaults.defaultModel,
                    description: nls.localize('editor.stickyScroll.defaultModel', "Defines the model to use for determining which lines to stick. If the outline model does not exist, it will fall back on the folding provider model which falls back on the indentation model. This order is respected in all three cases.")
                },
                'editor.stickyScroll.scrollWithEditor': {
                    type: 'boolean',
                    default: defaults.scrollWithEditor,
                    description: nls.localize('editor.stickyScroll.scrollWithEditor', "Enable scrolling of Sticky Scroll with the editor's horizontal scrollbar.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                maxLineCount: EditorIntOption.clampedInt(input.maxLineCount, this.defaultValue.maxLineCount, 1, 10),
                defaultModel: stringSet(input.defaultModel, this.defaultValue.defaultModel, ['outlineModel', 'foldingProviderModel', 'indentationModel']),
                scrollWithEditor: boolean(input.scrollWithEditor, this.defaultValue.scrollWithEditor)
            };
        }
    }
    class EditorInlayHints extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: 'on', fontSize: 0, fontFamily: '', padding: false };
            super(139 /* EditorOption.inlayHints */, 'inlayHints', defaults, {
                'editor.inlayHints.enabled': {
                    type: 'string',
                    default: defaults.enabled,
                    description: nls.localize('inlayHints.enable', "Enables the inlay hints in the editor."),
                    enum: ['on', 'onUnlessPressed', 'offUnlessPressed', 'off'],
                    markdownEnumDescriptions: [
                        nls.localize('editor.inlayHints.on', "Inlay hints are enabled"),
                        nls.localize('editor.inlayHints.onUnlessPressed', "Inlay hints are showing by default and hide when holding {0}", platform.isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`),
                        nls.localize('editor.inlayHints.offUnlessPressed', "Inlay hints are hidden by default and show when holding {0}", platform.isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`),
                        nls.localize('editor.inlayHints.off', "Inlay hints are disabled"),
                    ],
                },
                'editor.inlayHints.fontSize': {
                    type: 'number',
                    default: defaults.fontSize,
                    markdownDescription: nls.localize('inlayHints.fontSize', "Controls font size of inlay hints in the editor. As default the {0} is used when the configured value is less than {1} or greater than the editor font size.", '`#editor.fontSize#`', '`5`')
                },
                'editor.inlayHints.fontFamily': {
                    type: 'string',
                    default: defaults.fontFamily,
                    markdownDescription: nls.localize('inlayHints.fontFamily', "Controls font family of inlay hints in the editor. When set to empty, the {0} is used.", '`#editor.fontFamily#`')
                },
                'editor.inlayHints.padding': {
                    type: 'boolean',
                    default: defaults.padding,
                    description: nls.localize('inlayHints.padding', "Enables the padding around the inlay hints in the editor.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            if (typeof input.enabled === 'boolean') {
                input.enabled = input.enabled ? 'on' : 'off';
            }
            return {
                enabled: stringSet(input.enabled, this.defaultValue.enabled, ['on', 'off', 'offUnlessPressed', 'onUnlessPressed']),
                fontSize: EditorIntOption.clampedInt(input.fontSize, this.defaultValue.fontSize, 0, 100),
                fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily),
                padding: boolean(input.padding, this.defaultValue.padding)
            };
        }
    }
    //#endregion
    //#region lineDecorationsWidth
    class EditorLineDecorationsWidth extends BaseEditorOption {
        constructor() {
            super(65 /* EditorOption.lineDecorationsWidth */, 'lineDecorationsWidth', 10);
        }
        validate(input) {
            if (typeof input === 'string' && /^\d+(\.\d+)?ch$/.test(input)) {
                const multiple = parseFloat(input.substring(0, input.length - 2));
                return -multiple; // negative numbers signal a multiple
            }
            else {
                return EditorIntOption.clampedInt(input, this.defaultValue, 0, 1000);
            }
        }
        compute(env, options, value) {
            if (value < 0) {
                // negative numbers signal a multiple
                return EditorIntOption.clampedInt(-value * env.fontInfo.typicalHalfwidthCharacterWidth, this.defaultValue, 0, 1000);
            }
            else {
                return value;
            }
        }
    }
    //#endregion
    //#region lineHeight
    class EditorLineHeight extends EditorFloatOption {
        constructor() {
            super(66 /* EditorOption.lineHeight */, 'lineHeight', exports.EDITOR_FONT_DEFAULTS.lineHeight, x => EditorFloatOption.clamp(x, 0, 150), { markdownDescription: nls.localize('lineHeight', "Controls the line height. \n - Use 0 to automatically compute the line height from the font size.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values.") });
        }
        compute(env, options, value) {
            // The lineHeight is computed from the fontSize if it is 0.
            // Moreover, the final lineHeight respects the editor zoom level.
            // So take the result from env.fontInfo
            return env.fontInfo.lineHeight;
        }
    }
    class EditorMinimap extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                size: 'proportional',
                side: 'right',
                showSlider: 'mouseover',
                autohide: false,
                renderCharacters: true,
                maxColumn: 120,
                scale: 1,
            };
            super(72 /* EditorOption.minimap */, 'minimap', defaults, {
                'editor.minimap.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize('minimap.enabled', "Controls whether the minimap is shown.")
                },
                'editor.minimap.autohide': {
                    type: 'boolean',
                    default: defaults.autohide,
                    description: nls.localize('minimap.autohide', "Controls whether the minimap is hidden automatically.")
                },
                'editor.minimap.size': {
                    type: 'string',
                    enum: ['proportional', 'fill', 'fit'],
                    enumDescriptions: [
                        nls.localize('minimap.size.proportional', "The minimap has the same size as the editor contents (and might scroll)."),
                        nls.localize('minimap.size.fill', "The minimap will stretch or shrink as necessary to fill the height of the editor (no scrolling)."),
                        nls.localize('minimap.size.fit', "The minimap will shrink as necessary to never be larger than the editor (no scrolling)."),
                    ],
                    default: defaults.size,
                    description: nls.localize('minimap.size', "Controls the size of the minimap.")
                },
                'editor.minimap.side': {
                    type: 'string',
                    enum: ['left', 'right'],
                    default: defaults.side,
                    description: nls.localize('minimap.side', "Controls the side where to render the minimap.")
                },
                'editor.minimap.showSlider': {
                    type: 'string',
                    enum: ['always', 'mouseover'],
                    default: defaults.showSlider,
                    description: nls.localize('minimap.showSlider', "Controls when the minimap slider is shown.")
                },
                'editor.minimap.scale': {
                    type: 'number',
                    default: defaults.scale,
                    minimum: 1,
                    maximum: 3,
                    enum: [1, 2, 3],
                    description: nls.localize('minimap.scale', "Scale of content drawn in the minimap: 1, 2 or 3.")
                },
                'editor.minimap.renderCharacters': {
                    type: 'boolean',
                    default: defaults.renderCharacters,
                    description: nls.localize('minimap.renderCharacters', "Render the actual characters on a line as opposed to color blocks.")
                },
                'editor.minimap.maxColumn': {
                    type: 'number',
                    default: defaults.maxColumn,
                    description: nls.localize('minimap.maxColumn', "Limit the width of the minimap to render at most a certain number of columns.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                autohide: boolean(input.autohide, this.defaultValue.autohide),
                size: stringSet(input.size, this.defaultValue.size, ['proportional', 'fill', 'fit']),
                side: stringSet(input.side, this.defaultValue.side, ['right', 'left']),
                showSlider: stringSet(input.showSlider, this.defaultValue.showSlider, ['always', 'mouseover']),
                renderCharacters: boolean(input.renderCharacters, this.defaultValue.renderCharacters),
                scale: EditorIntOption.clampedInt(input.scale, 1, 1, 3),
                maxColumn: EditorIntOption.clampedInt(input.maxColumn, this.defaultValue.maxColumn, 1, 10000),
            };
        }
    }
    //#endregion
    //#region multiCursorModifier
    function _multiCursorModifierFromString(multiCursorModifier) {
        if (multiCursorModifier === 'ctrlCmd') {
            return (platform.isMacintosh ? 'metaKey' : 'ctrlKey');
        }
        return 'altKey';
    }
    class EditorPadding extends BaseEditorOption {
        constructor() {
            super(83 /* EditorOption.padding */, 'padding', { top: 0, bottom: 0 }, {
                'editor.padding.top': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize('padding.top', "Controls the amount of space between the top edge of the editor and the first line.")
                },
                'editor.padding.bottom': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize('padding.bottom', "Controls the amount of space between the bottom edge of the editor and the last line.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                top: EditorIntOption.clampedInt(input.top, 0, 0, 1000),
                bottom: EditorIntOption.clampedInt(input.bottom, 0, 0, 1000)
            };
        }
    }
    class EditorParameterHints extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                cycle: true
            };
            super(85 /* EditorOption.parameterHints */, 'parameterHints', defaults, {
                'editor.parameterHints.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize('parameterHints.enabled', "Enables a pop-up that shows parameter documentation and type information as you type.")
                },
                'editor.parameterHints.cycle': {
                    type: 'boolean',
                    default: defaults.cycle,
                    description: nls.localize('parameterHints.cycle', "Controls whether the parameter hints menu cycles or closes when reaching the end of the list.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                cycle: boolean(input.cycle, this.defaultValue.cycle)
            };
        }
    }
    //#endregion
    //#region pixelRatio
    class EditorPixelRatio extends ComputedEditorOption {
        constructor() {
            super(141 /* EditorOption.pixelRatio */);
        }
        compute(env, options, _) {
            return env.pixelRatio;
        }
    }
    class EditorQuickSuggestions extends BaseEditorOption {
        constructor() {
            const defaults = {
                other: 'on',
                comments: 'off',
                strings: 'off'
            };
            const types = [
                { type: 'boolean' },
                {
                    type: 'string',
                    enum: ['on', 'inline', 'off'],
                    enumDescriptions: [nls.localize('on', "Quick suggestions show inside the suggest widget"), nls.localize('inline', "Quick suggestions show as ghost text"), nls.localize('off', "Quick suggestions are disabled")]
                }
            ];
            super(88 /* EditorOption.quickSuggestions */, 'quickSuggestions', defaults, {
                type: 'object',
                additionalProperties: false,
                properties: {
                    strings: {
                        anyOf: types,
                        default: defaults.strings,
                        description: nls.localize('quickSuggestions.strings', "Enable quick suggestions inside strings.")
                    },
                    comments: {
                        anyOf: types,
                        default: defaults.comments,
                        description: nls.localize('quickSuggestions.comments', "Enable quick suggestions inside comments.")
                    },
                    other: {
                        anyOf: types,
                        default: defaults.other,
                        description: nls.localize('quickSuggestions.other', "Enable quick suggestions outside of strings and comments.")
                    },
                },
                default: defaults,
                markdownDescription: nls.localize('quickSuggestions', "Controls whether suggestions should automatically show up while typing. This can be controlled for typing in comments, strings, and other code. Quick suggestion can be configured to show as ghost text or with the suggest widget. Also be aware of the '{0}'-setting which controls if suggestions are triggered by special characters.", `#editor.suggestOnTriggerCharacters#`)
            });
            this.defaultValue = defaults;
        }
        validate(input) {
            if (typeof input === 'boolean') {
                // boolean -> all on/off
                const value = input ? 'on' : 'off';
                return { comments: value, strings: value, other: value };
            }
            if (!input || typeof input !== 'object') {
                // invalid object
                return this.defaultValue;
            }
            const { other, comments, strings } = input;
            const allowedValues = ['on', 'inline', 'off'];
            let validatedOther;
            let validatedComments;
            let validatedStrings;
            if (typeof other === 'boolean') {
                validatedOther = other ? 'on' : 'off';
            }
            else {
                validatedOther = stringSet(other, this.defaultValue.other, allowedValues);
            }
            if (typeof comments === 'boolean') {
                validatedComments = comments ? 'on' : 'off';
            }
            else {
                validatedComments = stringSet(comments, this.defaultValue.comments, allowedValues);
            }
            if (typeof strings === 'boolean') {
                validatedStrings = strings ? 'on' : 'off';
            }
            else {
                validatedStrings = stringSet(strings, this.defaultValue.strings, allowedValues);
            }
            return {
                other: validatedOther,
                comments: validatedComments,
                strings: validatedStrings
            };
        }
    }
    var RenderLineNumbersType;
    (function (RenderLineNumbersType) {
        RenderLineNumbersType[RenderLineNumbersType["Off"] = 0] = "Off";
        RenderLineNumbersType[RenderLineNumbersType["On"] = 1] = "On";
        RenderLineNumbersType[RenderLineNumbersType["Relative"] = 2] = "Relative";
        RenderLineNumbersType[RenderLineNumbersType["Interval"] = 3] = "Interval";
        RenderLineNumbersType[RenderLineNumbersType["Custom"] = 4] = "Custom";
    })(RenderLineNumbersType || (exports.RenderLineNumbersType = RenderLineNumbersType = {}));
    class EditorRenderLineNumbersOption extends BaseEditorOption {
        constructor() {
            super(67 /* EditorOption.lineNumbers */, 'lineNumbers', { renderType: 1 /* RenderLineNumbersType.On */, renderFn: null }, {
                type: 'string',
                enum: ['off', 'on', 'relative', 'interval'],
                enumDescriptions: [
                    nls.localize('lineNumbers.off', "Line numbers are not rendered."),
                    nls.localize('lineNumbers.on', "Line numbers are rendered as absolute number."),
                    nls.localize('lineNumbers.relative', "Line numbers are rendered as distance in lines to cursor position."),
                    nls.localize('lineNumbers.interval', "Line numbers are rendered every 10 lines.")
                ],
                default: 'on',
                description: nls.localize('lineNumbers', "Controls the display of line numbers.")
            });
        }
        validate(lineNumbers) {
            let renderType = this.defaultValue.renderType;
            let renderFn = this.defaultValue.renderFn;
            if (typeof lineNumbers !== 'undefined') {
                if (typeof lineNumbers === 'function') {
                    renderType = 4 /* RenderLineNumbersType.Custom */;
                    renderFn = lineNumbers;
                }
                else if (lineNumbers === 'interval') {
                    renderType = 3 /* RenderLineNumbersType.Interval */;
                }
                else if (lineNumbers === 'relative') {
                    renderType = 2 /* RenderLineNumbersType.Relative */;
                }
                else if (lineNumbers === 'on') {
                    renderType = 1 /* RenderLineNumbersType.On */;
                }
                else {
                    renderType = 0 /* RenderLineNumbersType.Off */;
                }
            }
            return {
                renderType,
                renderFn
            };
        }
    }
    //#endregion
    //#region renderValidationDecorations
    /**
     * @internal
     */
    function filterValidationDecorations(options) {
        const renderValidationDecorations = options.get(97 /* EditorOption.renderValidationDecorations */);
        if (renderValidationDecorations === 'editable') {
            return options.get(90 /* EditorOption.readOnly */);
        }
        return renderValidationDecorations === 'on' ? false : true;
    }
    exports.filterValidationDecorations = filterValidationDecorations;
    class EditorRulers extends BaseEditorOption {
        constructor() {
            const defaults = [];
            const columnSchema = { type: 'number', description: nls.localize('rulers.size', "Number of monospace characters at which this editor ruler will render.") };
            super(101 /* EditorOption.rulers */, 'rulers', defaults, {
                type: 'array',
                items: {
                    anyOf: [
                        columnSchema,
                        {
                            type: [
                                'object'
                            ],
                            properties: {
                                column: columnSchema,
                                color: {
                                    type: 'string',
                                    description: nls.localize('rulers.color', "Color of this editor ruler."),
                                    format: 'color-hex'
                                }
                            }
                        }
                    ]
                },
                default: defaults,
                description: nls.localize('rulers', "Render vertical rulers after a certain number of monospace characters. Use multiple values for multiple rulers. No rulers are drawn if array is empty.")
            });
        }
        validate(input) {
            if (Array.isArray(input)) {
                const rulers = [];
                for (const _element of input) {
                    if (typeof _element === 'number') {
                        rulers.push({
                            column: EditorIntOption.clampedInt(_element, 0, 0, 10000),
                            color: null
                        });
                    }
                    else if (_element && typeof _element === 'object') {
                        const element = _element;
                        rulers.push({
                            column: EditorIntOption.clampedInt(element.column, 0, 0, 10000),
                            color: element.color
                        });
                    }
                }
                rulers.sort((a, b) => a.column - b.column);
                return rulers;
            }
            return this.defaultValue;
        }
    }
    //#endregion
    //#region readonly
    /**
     * Configuration options for readonly message
     */
    class ReadonlyMessage extends BaseEditorOption {
        constructor() {
            const defaults = undefined;
            super(91 /* EditorOption.readOnlyMessage */, 'readOnlyMessage', defaults);
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            return _input;
        }
    }
    function _scrollbarVisibilityFromString(visibility, defaultValue) {
        if (typeof visibility !== 'string') {
            return defaultValue;
        }
        switch (visibility) {
            case 'hidden': return 2 /* ScrollbarVisibility.Hidden */;
            case 'visible': return 3 /* ScrollbarVisibility.Visible */;
            default: return 1 /* ScrollbarVisibility.Auto */;
        }
    }
    class EditorScrollbar extends BaseEditorOption {
        constructor() {
            const defaults = {
                vertical: 1 /* ScrollbarVisibility.Auto */,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                arrowSize: 11,
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                horizontalScrollbarSize: 12,
                horizontalSliderSize: 12,
                verticalScrollbarSize: 14,
                verticalSliderSize: 14,
                handleMouseWheel: true,
                alwaysConsumeMouseWheel: true,
                scrollByPage: false,
                ignoreHorizontalScrollbarInContentHeight: false,
            };
            super(102 /* EditorOption.scrollbar */, 'scrollbar', defaults, {
                'editor.scrollbar.vertical': {
                    type: 'string',
                    enum: ['auto', 'visible', 'hidden'],
                    enumDescriptions: [
                        nls.localize('scrollbar.vertical.auto', "The vertical scrollbar will be visible only when necessary."),
                        nls.localize('scrollbar.vertical.visible', "The vertical scrollbar will always be visible."),
                        nls.localize('scrollbar.vertical.fit', "The vertical scrollbar will always be hidden."),
                    ],
                    default: 'auto',
                    description: nls.localize('scrollbar.vertical', "Controls the visibility of the vertical scrollbar.")
                },
                'editor.scrollbar.horizontal': {
                    type: 'string',
                    enum: ['auto', 'visible', 'hidden'],
                    enumDescriptions: [
                        nls.localize('scrollbar.horizontal.auto', "The horizontal scrollbar will be visible only when necessary."),
                        nls.localize('scrollbar.horizontal.visible', "The horizontal scrollbar will always be visible."),
                        nls.localize('scrollbar.horizontal.fit', "The horizontal scrollbar will always be hidden."),
                    ],
                    default: 'auto',
                    description: nls.localize('scrollbar.horizontal', "Controls the visibility of the horizontal scrollbar.")
                },
                'editor.scrollbar.verticalScrollbarSize': {
                    type: 'number',
                    default: defaults.verticalScrollbarSize,
                    description: nls.localize('scrollbar.verticalScrollbarSize', "The width of the vertical scrollbar.")
                },
                'editor.scrollbar.horizontalScrollbarSize': {
                    type: 'number',
                    default: defaults.horizontalScrollbarSize,
                    description: nls.localize('scrollbar.horizontalScrollbarSize', "The height of the horizontal scrollbar.")
                },
                'editor.scrollbar.scrollByPage': {
                    type: 'boolean',
                    default: defaults.scrollByPage,
                    description: nls.localize('scrollbar.scrollByPage', "Controls whether clicks scroll by page or jump to click position.")
                },
                'editor.scrollbar.ignoreHorizontalScrollbarInContentHeight': {
                    type: 'boolean',
                    default: defaults.ignoreHorizontalScrollbarInContentHeight,
                    description: nls.localize('scrollbar.ignoreHorizontalScrollbarInContentHeight', "When set, the horizontal scrollbar will not increase the size of the editor's content.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            const horizontalScrollbarSize = EditorIntOption.clampedInt(input.horizontalScrollbarSize, this.defaultValue.horizontalScrollbarSize, 0, 1000);
            const verticalScrollbarSize = EditorIntOption.clampedInt(input.verticalScrollbarSize, this.defaultValue.verticalScrollbarSize, 0, 1000);
            return {
                arrowSize: EditorIntOption.clampedInt(input.arrowSize, this.defaultValue.arrowSize, 0, 1000),
                vertical: _scrollbarVisibilityFromString(input.vertical, this.defaultValue.vertical),
                horizontal: _scrollbarVisibilityFromString(input.horizontal, this.defaultValue.horizontal),
                useShadows: boolean(input.useShadows, this.defaultValue.useShadows),
                verticalHasArrows: boolean(input.verticalHasArrows, this.defaultValue.verticalHasArrows),
                horizontalHasArrows: boolean(input.horizontalHasArrows, this.defaultValue.horizontalHasArrows),
                handleMouseWheel: boolean(input.handleMouseWheel, this.defaultValue.handleMouseWheel),
                alwaysConsumeMouseWheel: boolean(input.alwaysConsumeMouseWheel, this.defaultValue.alwaysConsumeMouseWheel),
                horizontalScrollbarSize: horizontalScrollbarSize,
                horizontalSliderSize: EditorIntOption.clampedInt(input.horizontalSliderSize, horizontalScrollbarSize, 0, 1000),
                verticalScrollbarSize: verticalScrollbarSize,
                verticalSliderSize: EditorIntOption.clampedInt(input.verticalSliderSize, verticalScrollbarSize, 0, 1000),
                scrollByPage: boolean(input.scrollByPage, this.defaultValue.scrollByPage),
                ignoreHorizontalScrollbarInContentHeight: boolean(input.ignoreHorizontalScrollbarInContentHeight, this.defaultValue.ignoreHorizontalScrollbarInContentHeight),
            };
        }
    }
    /**
     * @internal
    */
    exports.inUntrustedWorkspace = 'inUntrustedWorkspace';
    /**
     * @internal
     */
    exports.unicodeHighlightConfigKeys = {
        allowedCharacters: 'editor.unicodeHighlight.allowedCharacters',
        invisibleCharacters: 'editor.unicodeHighlight.invisibleCharacters',
        nonBasicASCII: 'editor.unicodeHighlight.nonBasicASCII',
        ambiguousCharacters: 'editor.unicodeHighlight.ambiguousCharacters',
        includeComments: 'editor.unicodeHighlight.includeComments',
        includeStrings: 'editor.unicodeHighlight.includeStrings',
        allowedLocales: 'editor.unicodeHighlight.allowedLocales',
    };
    class UnicodeHighlight extends BaseEditorOption {
        constructor() {
            const defaults = {
                nonBasicASCII: exports.inUntrustedWorkspace,
                invisibleCharacters: true,
                ambiguousCharacters: true,
                includeComments: exports.inUntrustedWorkspace,
                includeStrings: true,
                allowedCharacters: {},
                allowedLocales: { _os: true, _vscode: true },
            };
            super(124 /* EditorOption.unicodeHighlighting */, 'unicodeHighlight', defaults, {
                [exports.unicodeHighlightConfigKeys.nonBasicASCII]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.nonBasicASCII,
                    description: nls.localize('unicodeHighlight.nonBasicASCII', "Controls whether all non-basic ASCII characters are highlighted. Only characters between U+0020 and U+007E, tab, line-feed and carriage-return are considered basic ASCII.")
                },
                [exports.unicodeHighlightConfigKeys.invisibleCharacters]: {
                    restricted: true,
                    type: 'boolean',
                    default: defaults.invisibleCharacters,
                    description: nls.localize('unicodeHighlight.invisibleCharacters', "Controls whether characters that just reserve space or have no width at all are highlighted.")
                },
                [exports.unicodeHighlightConfigKeys.ambiguousCharacters]: {
                    restricted: true,
                    type: 'boolean',
                    default: defaults.ambiguousCharacters,
                    description: nls.localize('unicodeHighlight.ambiguousCharacters', "Controls whether characters are highlighted that can be confused with basic ASCII characters, except those that are common in the current user locale.")
                },
                [exports.unicodeHighlightConfigKeys.includeComments]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.includeComments,
                    description: nls.localize('unicodeHighlight.includeComments', "Controls whether characters in comments should also be subject to Unicode highlighting.")
                },
                [exports.unicodeHighlightConfigKeys.includeStrings]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.includeStrings,
                    description: nls.localize('unicodeHighlight.includeStrings', "Controls whether characters in strings should also be subject to Unicode highlighting.")
                },
                [exports.unicodeHighlightConfigKeys.allowedCharacters]: {
                    restricted: true,
                    type: 'object',
                    default: defaults.allowedCharacters,
                    description: nls.localize('unicodeHighlight.allowedCharacters', "Defines allowed characters that are not being highlighted."),
                    additionalProperties: {
                        type: 'boolean'
                    }
                },
                [exports.unicodeHighlightConfigKeys.allowedLocales]: {
                    restricted: true,
                    type: 'object',
                    additionalProperties: {
                        type: 'boolean'
                    },
                    default: defaults.allowedLocales,
                    description: nls.localize('unicodeHighlight.allowedLocales', "Unicode characters that are common in allowed locales are not being highlighted.")
                },
            });
        }
        applyUpdate(value, update) {
            let didChange = false;
            if (update.allowedCharacters && value) {
                // Treat allowedCharacters atomically
                if (!objects.equals(value.allowedCharacters, update.allowedCharacters)) {
                    value = { ...value, allowedCharacters: update.allowedCharacters };
                    didChange = true;
                }
            }
            if (update.allowedLocales && value) {
                // Treat allowedLocales atomically
                if (!objects.equals(value.allowedLocales, update.allowedLocales)) {
                    value = { ...value, allowedLocales: update.allowedLocales };
                    didChange = true;
                }
            }
            const result = super.applyUpdate(value, update);
            if (didChange) {
                return new ApplyUpdateResult(result.newValue, true);
            }
            return result;
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                nonBasicASCII: primitiveSet(input.nonBasicASCII, exports.inUntrustedWorkspace, [true, false, exports.inUntrustedWorkspace]),
                invisibleCharacters: boolean(input.invisibleCharacters, this.defaultValue.invisibleCharacters),
                ambiguousCharacters: boolean(input.ambiguousCharacters, this.defaultValue.ambiguousCharacters),
                includeComments: primitiveSet(input.includeComments, exports.inUntrustedWorkspace, [true, false, exports.inUntrustedWorkspace]),
                includeStrings: primitiveSet(input.includeStrings, exports.inUntrustedWorkspace, [true, false, exports.inUntrustedWorkspace]),
                allowedCharacters: this.validateBooleanMap(_input.allowedCharacters, this.defaultValue.allowedCharacters),
                allowedLocales: this.validateBooleanMap(_input.allowedLocales, this.defaultValue.allowedLocales),
            };
        }
        validateBooleanMap(map, defaultValue) {
            if ((typeof map !== 'object') || !map) {
                return defaultValue;
            }
            const result = {};
            for (const [key, value] of Object.entries(map)) {
                if (value === true) {
                    result[key] = true;
                }
            }
            return result;
        }
    }
    /**
     * Configuration options for inline suggestions
     */
    class InlineEditorSuggest extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                mode: 'subwordSmart',
                showToolbar: 'onHover',
                suppressSuggestions: false,
                keepOnBlur: false,
                fontFamily: 'default'
            };
            super(62 /* EditorOption.inlineSuggest */, 'inlineSuggest', defaults, {
                'editor.inlineSuggest.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize('inlineSuggest.enabled', "Controls whether to automatically show inline suggestions in the editor.")
                },
                'editor.inlineSuggest.showToolbar': {
                    type: 'string',
                    default: defaults.showToolbar,
                    enum: ['always', 'onHover', 'never'],
                    enumDescriptions: [
                        nls.localize('inlineSuggest.showToolbar.always', "Show the inline suggestion toolbar whenever an inline suggestion is shown."),
                        nls.localize('inlineSuggest.showToolbar.onHover', "Show the inline suggestion toolbar when hovering over an inline suggestion."),
                        nls.localize('inlineSuggest.showToolbar.never', "Never show the inline suggestion toolbar."),
                    ],
                    description: nls.localize('inlineSuggest.showToolbar', "Controls when to show the inline suggestion toolbar."),
                },
                'editor.inlineSuggest.suppressSuggestions': {
                    type: 'boolean',
                    default: defaults.suppressSuggestions,
                    description: nls.localize('inlineSuggest.suppressSuggestions', "Controls how inline suggestions interact with the suggest widget. If enabled, the suggest widget is not shown automatically when inline suggestions are available.")
                },
                'editor.inlineSuggest.fontFamily': {
                    type: 'string',
                    default: defaults.fontFamily,
                    description: nls.localize('inlineSuggest.fontFamily', "Controls the font family of the inline suggestions.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                mode: stringSet(input.mode, this.defaultValue.mode, ['prefix', 'subword', 'subwordSmart']),
                showToolbar: stringSet(input.showToolbar, this.defaultValue.showToolbar, ['always', 'onHover', 'never']),
                suppressSuggestions: boolean(input.suppressSuggestions, this.defaultValue.suppressSuggestions),
                keepOnBlur: boolean(input.keepOnBlur, this.defaultValue.keepOnBlur),
                fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily)
            };
        }
    }
    /**
     * Configuration options for inline suggestions
     */
    class BracketPairColorization extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.enabled,
                independentColorPoolPerBracketType: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.independentColorPoolPerBracketType,
            };
            super(15 /* EditorOption.bracketPairColorization */, 'bracketPairColorization', defaults, {
                'editor.bracketPairColorization.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize('bracketPairColorization.enabled', "Controls whether bracket pair colorization is enabled or not. Use {0} to override the bracket highlight colors.", '`#workbench.colorCustomizations#`')
                },
                'editor.bracketPairColorization.independentColorPoolPerBracketType': {
                    type: 'boolean',
                    default: defaults.independentColorPoolPerBracketType,
                    description: nls.localize('bracketPairColorization.independentColorPoolPerBracketType', "Controls whether each bracket type has its own independent color pool.")
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                independentColorPoolPerBracketType: boolean(input.independentColorPoolPerBracketType, this.defaultValue.independentColorPoolPerBracketType),
            };
        }
    }
    /**
     * Configuration options for inline suggestions
     */
    class GuideOptions extends BaseEditorOption {
        constructor() {
            const defaults = {
                bracketPairs: false,
                bracketPairsHorizontal: 'active',
                highlightActiveBracketPair: true,
                indentation: true,
                highlightActiveIndentation: true
            };
            super(16 /* EditorOption.guides */, 'guides', defaults, {
                'editor.guides.bracketPairs': {
                    type: ['boolean', 'string'],
                    enum: [true, 'active', false],
                    enumDescriptions: [
                        nls.localize('editor.guides.bracketPairs.true', "Enables bracket pair guides."),
                        nls.localize('editor.guides.bracketPairs.active', "Enables bracket pair guides only for the active bracket pair."),
                        nls.localize('editor.guides.bracketPairs.false', "Disables bracket pair guides."),
                    ],
                    default: defaults.bracketPairs,
                    description: nls.localize('editor.guides.bracketPairs', "Controls whether bracket pair guides are enabled or not.")
                },
                'editor.guides.bracketPairsHorizontal': {
                    type: ['boolean', 'string'],
                    enum: [true, 'active', false],
                    enumDescriptions: [
                        nls.localize('editor.guides.bracketPairsHorizontal.true', "Enables horizontal guides as addition to vertical bracket pair guides."),
                        nls.localize('editor.guides.bracketPairsHorizontal.active', "Enables horizontal guides only for the active bracket pair."),
                        nls.localize('editor.guides.bracketPairsHorizontal.false', "Disables horizontal bracket pair guides."),
                    ],
                    default: defaults.bracketPairsHorizontal,
                    description: nls.localize('editor.guides.bracketPairsHorizontal', "Controls whether horizontal bracket pair guides are enabled or not.")
                },
                'editor.guides.highlightActiveBracketPair': {
                    type: 'boolean',
                    default: defaults.highlightActiveBracketPair,
                    description: nls.localize('editor.guides.highlightActiveBracketPair', "Controls whether the editor should highlight the active bracket pair.")
                },
                'editor.guides.indentation': {
                    type: 'boolean',
                    default: defaults.indentation,
                    description: nls.localize('editor.guides.indentation', "Controls whether the editor should render indent guides.")
                },
                'editor.guides.highlightActiveIndentation': {
                    type: ['boolean', 'string'],
                    enum: [true, 'always', false],
                    enumDescriptions: [
                        nls.localize('editor.guides.highlightActiveIndentation.true', "Highlights the active indent guide."),
                        nls.localize('editor.guides.highlightActiveIndentation.always', "Highlights the active indent guide even if bracket guides are highlighted."),
                        nls.localize('editor.guides.highlightActiveIndentation.false', "Do not highlight the active indent guide."),
                    ],
                    default: defaults.highlightActiveIndentation,
                    description: nls.localize('editor.guides.highlightActiveIndentation', "Controls whether the editor should highlight the active indent guide.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                bracketPairs: primitiveSet(input.bracketPairs, this.defaultValue.bracketPairs, [true, false, 'active']),
                bracketPairsHorizontal: primitiveSet(input.bracketPairsHorizontal, this.defaultValue.bracketPairsHorizontal, [true, false, 'active']),
                highlightActiveBracketPair: boolean(input.highlightActiveBracketPair, this.defaultValue.highlightActiveBracketPair),
                indentation: boolean(input.indentation, this.defaultValue.indentation),
                highlightActiveIndentation: primitiveSet(input.highlightActiveIndentation, this.defaultValue.highlightActiveIndentation, [true, false, 'always']),
            };
        }
    }
    function primitiveSet(value, defaultValue, allowedValues) {
        const idx = allowedValues.indexOf(value);
        if (idx === -1) {
            return defaultValue;
        }
        return allowedValues[idx];
    }
    class EditorSuggest extends BaseEditorOption {
        constructor() {
            const defaults = {
                insertMode: 'insert',
                filterGraceful: true,
                snippetsPreventQuickSuggestions: false,
                localityBonus: false,
                shareSuggestSelections: false,
                selectionMode: 'always',
                showIcons: true,
                showStatusBar: false,
                preview: false,
                previewMode: 'subwordSmart',
                showInlineDetails: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showDeprecated: true,
                matchOnWordStartOnly: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
                showUsers: true,
                showIssues: true,
            };
            super(117 /* EditorOption.suggest */, 'suggest', defaults, {
                'editor.suggest.insertMode': {
                    type: 'string',
                    enum: ['insert', 'replace'],
                    enumDescriptions: [
                        nls.localize('suggest.insertMode.insert', "Insert suggestion without overwriting text right of the cursor."),
                        nls.localize('suggest.insertMode.replace', "Insert suggestion and overwrite text right of the cursor."),
                    ],
                    default: defaults.insertMode,
                    description: nls.localize('suggest.insertMode', "Controls whether words are overwritten when accepting completions. Note that this depends on extensions opting into this feature.")
                },
                'editor.suggest.filterGraceful': {
                    type: 'boolean',
                    default: defaults.filterGraceful,
                    description: nls.localize('suggest.filterGraceful', "Controls whether filtering and sorting suggestions accounts for small typos.")
                },
                'editor.suggest.localityBonus': {
                    type: 'boolean',
                    default: defaults.localityBonus,
                    description: nls.localize('suggest.localityBonus', "Controls whether sorting favors words that appear close to the cursor.")
                },
                'editor.suggest.shareSuggestSelections': {
                    type: 'boolean',
                    default: defaults.shareSuggestSelections,
                    markdownDescription: nls.localize('suggest.shareSuggestSelections', "Controls whether remembered suggestion selections are shared between multiple workspaces and windows (needs `#editor.suggestSelection#`).")
                },
                'editor.suggest.selectionMode': {
                    type: 'string',
                    enum: ['always', 'never', 'whenTriggerCharacter', 'whenQuickSuggestion'],
                    enumDescriptions: [
                        nls.localize('suggest.insertMode.always', "Always select a suggestion when automatically triggering IntelliSense."),
                        nls.localize('suggest.insertMode.never', "Never select a suggestion when automatically triggering IntelliSense."),
                        nls.localize('suggest.insertMode.whenTriggerCharacter', "Select a suggestion only when triggering IntelliSense from a trigger character."),
                        nls.localize('suggest.insertMode.whenQuickSuggestion', "Select a suggestion only when triggering IntelliSense as you type."),
                    ],
                    default: defaults.selectionMode,
                    markdownDescription: nls.localize('suggest.selectionMode', "Controls whether a suggestion is selected when the widget shows. Note that this only applies to automatically triggered suggestions (`#editor.quickSuggestions#` and `#editor.suggestOnTriggerCharacters#`) and that a suggestion is always selected when explicitly invoked, e.g via `Ctrl+Space`.")
                },
                'editor.suggest.snippetsPreventQuickSuggestions': {
                    type: 'boolean',
                    default: defaults.snippetsPreventQuickSuggestions,
                    description: nls.localize('suggest.snippetsPreventQuickSuggestions', "Controls whether an active snippet prevents quick suggestions.")
                },
                'editor.suggest.showIcons': {
                    type: 'boolean',
                    default: defaults.showIcons,
                    description: nls.localize('suggest.showIcons', "Controls whether to show or hide icons in suggestions.")
                },
                'editor.suggest.showStatusBar': {
                    type: 'boolean',
                    default: defaults.showStatusBar,
                    description: nls.localize('suggest.showStatusBar', "Controls the visibility of the status bar at the bottom of the suggest widget.")
                },
                'editor.suggest.preview': {
                    type: 'boolean',
                    default: defaults.preview,
                    description: nls.localize('suggest.preview', "Controls whether to preview the suggestion outcome in the editor.")
                },
                'editor.suggest.showInlineDetails': {
                    type: 'boolean',
                    default: defaults.showInlineDetails,
                    description: nls.localize('suggest.showInlineDetails', "Controls whether suggest details show inline with the label or only in the details widget.")
                },
                'editor.suggest.maxVisibleSuggestions': {
                    type: 'number',
                    deprecationMessage: nls.localize('suggest.maxVisibleSuggestions.dep', "This setting is deprecated. The suggest widget can now be resized."),
                },
                'editor.suggest.filteredTypes': {
                    type: 'object',
                    deprecationMessage: nls.localize('deprecated', "This setting is deprecated, please use separate settings like 'editor.suggest.showKeywords' or 'editor.suggest.showSnippets' instead.")
                },
                'editor.suggest.showMethods': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showMethods', "When enabled IntelliSense shows `method`-suggestions.")
                },
                'editor.suggest.showFunctions': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFunctions', "When enabled IntelliSense shows `function`-suggestions.")
                },
                'editor.suggest.showConstructors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showConstructors', "When enabled IntelliSense shows `constructor`-suggestions.")
                },
                'editor.suggest.showDeprecated': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showDeprecated', "When enabled IntelliSense shows `deprecated`-suggestions.")
                },
                'editor.suggest.matchOnWordStartOnly': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.matchOnWordStartOnly', "When enabled IntelliSense filtering requires that the first character matches on a word start. For example, `c` on `Console` or `WebContext` but _not_ on `description`. When disabled IntelliSense will show more results but still sorts them by match quality.")
                },
                'editor.suggest.showFields': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFields', "When enabled IntelliSense shows `field`-suggestions.")
                },
                'editor.suggest.showVariables': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showVariables', "When enabled IntelliSense shows `variable`-suggestions.")
                },
                'editor.suggest.showClasses': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showClasss', "When enabled IntelliSense shows `class`-suggestions.")
                },
                'editor.suggest.showStructs': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showStructs', "When enabled IntelliSense shows `struct`-suggestions.")
                },
                'editor.suggest.showInterfaces': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showInterfaces', "When enabled IntelliSense shows `interface`-suggestions.")
                },
                'editor.suggest.showModules': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showModules', "When enabled IntelliSense shows `module`-suggestions.")
                },
                'editor.suggest.showProperties': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showPropertys', "When enabled IntelliSense shows `property`-suggestions.")
                },
                'editor.suggest.showEvents': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showEvents', "When enabled IntelliSense shows `event`-suggestions.")
                },
                'editor.suggest.showOperators': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showOperators', "When enabled IntelliSense shows `operator`-suggestions.")
                },
                'editor.suggest.showUnits': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showUnits', "When enabled IntelliSense shows `unit`-suggestions.")
                },
                'editor.suggest.showValues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showValues', "When enabled IntelliSense shows `value`-suggestions.")
                },
                'editor.suggest.showConstants': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showConstants', "When enabled IntelliSense shows `constant`-suggestions.")
                },
                'editor.suggest.showEnums': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showEnums', "When enabled IntelliSense shows `enum`-suggestions.")
                },
                'editor.suggest.showEnumMembers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showEnumMembers', "When enabled IntelliSense shows `enumMember`-suggestions.")
                },
                'editor.suggest.showKeywords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showKeywords', "When enabled IntelliSense shows `keyword`-suggestions.")
                },
                'editor.suggest.showWords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showTexts', "When enabled IntelliSense shows `text`-suggestions.")
                },
                'editor.suggest.showColors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showColors', "When enabled IntelliSense shows `color`-suggestions.")
                },
                'editor.suggest.showFiles': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFiles', "When enabled IntelliSense shows `file`-suggestions.")
                },
                'editor.suggest.showReferences': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showReferences', "When enabled IntelliSense shows `reference`-suggestions.")
                },
                'editor.suggest.showCustomcolors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showCustomcolors', "When enabled IntelliSense shows `customcolor`-suggestions.")
                },
                'editor.suggest.showFolders': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFolders', "When enabled IntelliSense shows `folder`-suggestions.")
                },
                'editor.suggest.showTypeParameters': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showTypeParameters', "When enabled IntelliSense shows `typeParameter`-suggestions.")
                },
                'editor.suggest.showSnippets': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showSnippets', "When enabled IntelliSense shows `snippet`-suggestions.")
                },
                'editor.suggest.showUsers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showUsers', "When enabled IntelliSense shows `user`-suggestions.")
                },
                'editor.suggest.showIssues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showIssues', "When enabled IntelliSense shows `issues`-suggestions.")
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                insertMode: stringSet(input.insertMode, this.defaultValue.insertMode, ['insert', 'replace']),
                filterGraceful: boolean(input.filterGraceful, this.defaultValue.filterGraceful),
                snippetsPreventQuickSuggestions: boolean(input.snippetsPreventQuickSuggestions, this.defaultValue.filterGraceful),
                localityBonus: boolean(input.localityBonus, this.defaultValue.localityBonus),
                shareSuggestSelections: boolean(input.shareSuggestSelections, this.defaultValue.shareSuggestSelections),
                selectionMode: stringSet(input.selectionMode, this.defaultValue.selectionMode, ['always', 'never', 'whenQuickSuggestion', 'whenTriggerCharacter']),
                showIcons: boolean(input.showIcons, this.defaultValue.showIcons),
                showStatusBar: boolean(input.showStatusBar, this.defaultValue.showStatusBar),
                preview: boolean(input.preview, this.defaultValue.preview),
                previewMode: stringSet(input.previewMode, this.defaultValue.previewMode, ['prefix', 'subword', 'subwordSmart']),
                showInlineDetails: boolean(input.showInlineDetails, this.defaultValue.showInlineDetails),
                showMethods: boolean(input.showMethods, this.defaultValue.showMethods),
                showFunctions: boolean(input.showFunctions, this.defaultValue.showFunctions),
                showConstructors: boolean(input.showConstructors, this.defaultValue.showConstructors),
                showDeprecated: boolean(input.showDeprecated, this.defaultValue.showDeprecated),
                matchOnWordStartOnly: boolean(input.matchOnWordStartOnly, this.defaultValue.matchOnWordStartOnly),
                showFields: boolean(input.showFields, this.defaultValue.showFields),
                showVariables: boolean(input.showVariables, this.defaultValue.showVariables),
                showClasses: boolean(input.showClasses, this.defaultValue.showClasses),
                showStructs: boolean(input.showStructs, this.defaultValue.showStructs),
                showInterfaces: boolean(input.showInterfaces, this.defaultValue.showInterfaces),
                showModules: boolean(input.showModules, this.defaultValue.showModules),
                showProperties: boolean(input.showProperties, this.defaultValue.showProperties),
                showEvents: boolean(input.showEvents, this.defaultValue.showEvents),
                showOperators: boolean(input.showOperators, this.defaultValue.showOperators),
                showUnits: boolean(input.showUnits, this.defaultValue.showUnits),
                showValues: boolean(input.showValues, this.defaultValue.showValues),
                showConstants: boolean(input.showConstants, this.defaultValue.showConstants),
                showEnums: boolean(input.showEnums, this.defaultValue.showEnums),
                showEnumMembers: boolean(input.showEnumMembers, this.defaultValue.showEnumMembers),
                showKeywords: boolean(input.showKeywords, this.defaultValue.showKeywords),
                showWords: boolean(input.showWords, this.defaultValue.showWords),
                showColors: boolean(input.showColors, this.defaultValue.showColors),
                showFiles: boolean(input.showFiles, this.defaultValue.showFiles),
                showReferences: boolean(input.showReferences, this.defaultValue.showReferences),
                showFolders: boolean(input.showFolders, this.defaultValue.showFolders),
                showTypeParameters: boolean(input.showTypeParameters, this.defaultValue.showTypeParameters),
                showSnippets: boolean(input.showSnippets, this.defaultValue.showSnippets),
                showUsers: boolean(input.showUsers, this.defaultValue.showUsers),
                showIssues: boolean(input.showIssues, this.defaultValue.showIssues),
            };
        }
    }
    class SmartSelect extends BaseEditorOption {
        constructor() {
            super(112 /* EditorOption.smartSelect */, 'smartSelect', {
                selectLeadingAndTrailingWhitespace: true,
                selectSubwords: true,
            }, {
                'editor.smartSelect.selectLeadingAndTrailingWhitespace': {
                    description: nls.localize('selectLeadingAndTrailingWhitespace', "Whether leading and trailing whitespace should always be selected."),
                    default: true,
                    type: 'boolean'
                },
                'editor.smartSelect.selectSubwords': {
                    description: nls.localize('selectSubwords', "Whether subwords (like 'foo' in 'fooBar' or 'foo_bar') should be selected."),
                    default: true,
                    type: 'boolean'
                }
            });
        }
        validate(input) {
            if (!input || typeof input !== 'object') {
                return this.defaultValue;
            }
            return {
                selectLeadingAndTrailingWhitespace: boolean(input.selectLeadingAndTrailingWhitespace, this.defaultValue.selectLeadingAndTrailingWhitespace),
                selectSubwords: boolean(input.selectSubwords, this.defaultValue.selectSubwords),
            };
        }
    }
    //#endregion
    //#region wrappingIndent
    /**
     * Describes how to indent wrapped lines.
     */
    var WrappingIndent;
    (function (WrappingIndent) {
        /**
         * No indentation => wrapped lines begin at column 1.
         */
        WrappingIndent[WrappingIndent["None"] = 0] = "None";
        /**
         * Same => wrapped lines get the same indentation as the parent.
         */
        WrappingIndent[WrappingIndent["Same"] = 1] = "Same";
        /**
         * Indent => wrapped lines get +1 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["Indent"] = 2] = "Indent";
        /**
         * DeepIndent => wrapped lines get +2 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["DeepIndent"] = 3] = "DeepIndent";
    })(WrappingIndent || (exports.WrappingIndent = WrappingIndent = {}));
    class WrappingIndentOption extends BaseEditorOption {
        constructor() {
            super(136 /* EditorOption.wrappingIndent */, 'wrappingIndent', 1 /* WrappingIndent.Same */, {
                'editor.wrappingIndent': {
                    type: 'string',
                    enum: ['none', 'same', 'indent', 'deepIndent'],
                    enumDescriptions: [
                        nls.localize('wrappingIndent.none', "No indentation. Wrapped lines begin at column 1."),
                        nls.localize('wrappingIndent.same', "Wrapped lines get the same indentation as the parent."),
                        nls.localize('wrappingIndent.indent', "Wrapped lines get +1 indentation toward the parent."),
                        nls.localize('wrappingIndent.deepIndent', "Wrapped lines get +2 indentation toward the parent."),
                    ],
                    description: nls.localize('wrappingIndent', "Controls the indentation of wrapped lines."),
                    default: 'same'
                }
            });
        }
        validate(input) {
            switch (input) {
                case 'none': return 0 /* WrappingIndent.None */;
                case 'same': return 1 /* WrappingIndent.Same */;
                case 'indent': return 2 /* WrappingIndent.Indent */;
                case 'deepIndent': return 3 /* WrappingIndent.DeepIndent */;
            }
            return 1 /* WrappingIndent.Same */;
        }
        compute(env, options, value) {
            const accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            if (accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
                // if we know for a fact that a screen reader is attached, we use no indent wrapping to
                // help that the editor's wrapping points match the textarea's wrapping points
                return 0 /* WrappingIndent.None */;
            }
            return value;
        }
    }
    class EditorWrappingInfoComputer extends ComputedEditorOption {
        constructor() {
            super(144 /* EditorOption.wrappingInfo */);
        }
        compute(env, options, _) {
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            return {
                isDominatedByLongLines: env.isDominatedByLongLines,
                isWordWrapMinified: layoutInfo.isWordWrapMinified,
                isViewportWrapping: layoutInfo.isViewportWrapping,
                wrappingColumn: layoutInfo.wrappingColumn,
            };
        }
    }
    class EditorDropIntoEditor extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true, showDropSelector: 'afterDrop' };
            super(36 /* EditorOption.dropIntoEditor */, 'dropIntoEditor', defaults, {
                'editor.dropIntoEditor.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize('dropIntoEditor.enabled', "Controls whether you can drag and drop a file into a text editor by holding down the `Shift` key (instead of opening the file in an editor)."),
                },
                'editor.dropIntoEditor.showDropSelector': {
                    type: 'string',
                    markdownDescription: nls.localize('dropIntoEditor.showDropSelector', "Controls if a widget is shown when dropping files into the editor. This widget lets you control how the file is dropped."),
                    enum: [
                        'afterDrop',
                        'never'
                    ],
                    enumDescriptions: [
                        nls.localize('dropIntoEditor.showDropSelector.afterDrop', "Show the drop selector widget after a file is dropped into the editor."),
                        nls.localize('dropIntoEditor.showDropSelector.never', "Never show the drop selector widget. Instead the default drop provider is always used."),
                    ],
                    default: 'afterDrop',
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                showDropSelector: stringSet(input.showDropSelector, this.defaultValue.showDropSelector, ['afterDrop', 'never']),
            };
        }
    }
    class EditorPasteAs extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true, showPasteSelector: 'afterPaste' };
            super(84 /* EditorOption.pasteAs */, 'pasteAs', defaults, {
                'editor.pasteAs.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize('pasteAs.enabled', "Controls whether you can paste content in different ways."),
                },
                'editor.pasteAs.showPasteSelector': {
                    type: 'string',
                    markdownDescription: nls.localize('pasteAs.showPasteSelector', "Controls if a widget is shown when pasting content in to the editor. This widget lets you control how the file is pasted."),
                    enum: [
                        'afterPaste',
                        'never'
                    ],
                    enumDescriptions: [
                        nls.localize('pasteAs.showPasteSelector.afterPaste', "Show the paste selector widget after content is pasted into the editor."),
                        nls.localize('pasteAs.showPasteSelector.never', "Never show the paste selector widget. Instead the default pasting behavior is always used."),
                    ],
                    default: 'afterPaste',
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                showPasteSelector: stringSet(input.showPasteSelector, this.defaultValue.showPasteSelector, ['afterPaste', 'never']),
            };
        }
    }
    //#endregion
    const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
    const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';
    const DEFAULT_LINUX_FONT_FAMILY = '\'Droid Sans Mono\', \'monospace\', monospace';
    /**
     * @internal
     */
    exports.EDITOR_FONT_DEFAULTS = {
        fontFamily: (platform.isMacintosh ? DEFAULT_MAC_FONT_FAMILY : (platform.isLinux ? DEFAULT_LINUX_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY)),
        fontWeight: 'normal',
        fontSize: (platform.isMacintosh ? 12 : 14),
        lineHeight: 0,
        letterSpacing: 0,
    };
    /**
     * @internal
     */
    exports.editorOptionsRegistry = [];
    function register(option) {
        exports.editorOptionsRegistry[option.id] = option;
        return option;
    }
    var EditorOption;
    (function (EditorOption) {
        EditorOption[EditorOption["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
        EditorOption[EditorOption["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
        EditorOption[EditorOption["accessibilitySupport"] = 2] = "accessibilitySupport";
        EditorOption[EditorOption["accessibilityPageSize"] = 3] = "accessibilityPageSize";
        EditorOption[EditorOption["ariaLabel"] = 4] = "ariaLabel";
        EditorOption[EditorOption["ariaRequired"] = 5] = "ariaRequired";
        EditorOption[EditorOption["autoClosingBrackets"] = 6] = "autoClosingBrackets";
        EditorOption[EditorOption["autoClosingComments"] = 7] = "autoClosingComments";
        EditorOption[EditorOption["screenReaderAnnounceInlineSuggestion"] = 8] = "screenReaderAnnounceInlineSuggestion";
        EditorOption[EditorOption["autoClosingDelete"] = 9] = "autoClosingDelete";
        EditorOption[EditorOption["autoClosingOvertype"] = 10] = "autoClosingOvertype";
        EditorOption[EditorOption["autoClosingQuotes"] = 11] = "autoClosingQuotes";
        EditorOption[EditorOption["autoIndent"] = 12] = "autoIndent";
        EditorOption[EditorOption["automaticLayout"] = 13] = "automaticLayout";
        EditorOption[EditorOption["autoSurround"] = 14] = "autoSurround";
        EditorOption[EditorOption["bracketPairColorization"] = 15] = "bracketPairColorization";
        EditorOption[EditorOption["guides"] = 16] = "guides";
        EditorOption[EditorOption["codeLens"] = 17] = "codeLens";
        EditorOption[EditorOption["codeLensFontFamily"] = 18] = "codeLensFontFamily";
        EditorOption[EditorOption["codeLensFontSize"] = 19] = "codeLensFontSize";
        EditorOption[EditorOption["colorDecorators"] = 20] = "colorDecorators";
        EditorOption[EditorOption["colorDecoratorsLimit"] = 21] = "colorDecoratorsLimit";
        EditorOption[EditorOption["columnSelection"] = 22] = "columnSelection";
        EditorOption[EditorOption["comments"] = 23] = "comments";
        EditorOption[EditorOption["contextmenu"] = 24] = "contextmenu";
        EditorOption[EditorOption["copyWithSyntaxHighlighting"] = 25] = "copyWithSyntaxHighlighting";
        EditorOption[EditorOption["cursorBlinking"] = 26] = "cursorBlinking";
        EditorOption[EditorOption["cursorSmoothCaretAnimation"] = 27] = "cursorSmoothCaretAnimation";
        EditorOption[EditorOption["cursorStyle"] = 28] = "cursorStyle";
        EditorOption[EditorOption["cursorSurroundingLines"] = 29] = "cursorSurroundingLines";
        EditorOption[EditorOption["cursorSurroundingLinesStyle"] = 30] = "cursorSurroundingLinesStyle";
        EditorOption[EditorOption["cursorWidth"] = 31] = "cursorWidth";
        EditorOption[EditorOption["disableLayerHinting"] = 32] = "disableLayerHinting";
        EditorOption[EditorOption["disableMonospaceOptimizations"] = 33] = "disableMonospaceOptimizations";
        EditorOption[EditorOption["domReadOnly"] = 34] = "domReadOnly";
        EditorOption[EditorOption["dragAndDrop"] = 35] = "dragAndDrop";
        EditorOption[EditorOption["dropIntoEditor"] = 36] = "dropIntoEditor";
        EditorOption[EditorOption["emptySelectionClipboard"] = 37] = "emptySelectionClipboard";
        EditorOption[EditorOption["experimentalWhitespaceRendering"] = 38] = "experimentalWhitespaceRendering";
        EditorOption[EditorOption["extraEditorClassName"] = 39] = "extraEditorClassName";
        EditorOption[EditorOption["fastScrollSensitivity"] = 40] = "fastScrollSensitivity";
        EditorOption[EditorOption["find"] = 41] = "find";
        EditorOption[EditorOption["fixedOverflowWidgets"] = 42] = "fixedOverflowWidgets";
        EditorOption[EditorOption["folding"] = 43] = "folding";
        EditorOption[EditorOption["foldingStrategy"] = 44] = "foldingStrategy";
        EditorOption[EditorOption["foldingHighlight"] = 45] = "foldingHighlight";
        EditorOption[EditorOption["foldingImportsByDefault"] = 46] = "foldingImportsByDefault";
        EditorOption[EditorOption["foldingMaximumRegions"] = 47] = "foldingMaximumRegions";
        EditorOption[EditorOption["unfoldOnClickAfterEndOfLine"] = 48] = "unfoldOnClickAfterEndOfLine";
        EditorOption[EditorOption["fontFamily"] = 49] = "fontFamily";
        EditorOption[EditorOption["fontInfo"] = 50] = "fontInfo";
        EditorOption[EditorOption["fontLigatures"] = 51] = "fontLigatures";
        EditorOption[EditorOption["fontSize"] = 52] = "fontSize";
        EditorOption[EditorOption["fontWeight"] = 53] = "fontWeight";
        EditorOption[EditorOption["fontVariations"] = 54] = "fontVariations";
        EditorOption[EditorOption["formatOnPaste"] = 55] = "formatOnPaste";
        EditorOption[EditorOption["formatOnType"] = 56] = "formatOnType";
        EditorOption[EditorOption["glyphMargin"] = 57] = "glyphMargin";
        EditorOption[EditorOption["gotoLocation"] = 58] = "gotoLocation";
        EditorOption[EditorOption["hideCursorInOverviewRuler"] = 59] = "hideCursorInOverviewRuler";
        EditorOption[EditorOption["hover"] = 60] = "hover";
        EditorOption[EditorOption["inDiffEditor"] = 61] = "inDiffEditor";
        EditorOption[EditorOption["inlineSuggest"] = 62] = "inlineSuggest";
        EditorOption[EditorOption["letterSpacing"] = 63] = "letterSpacing";
        EditorOption[EditorOption["lightbulb"] = 64] = "lightbulb";
        EditorOption[EditorOption["lineDecorationsWidth"] = 65] = "lineDecorationsWidth";
        EditorOption[EditorOption["lineHeight"] = 66] = "lineHeight";
        EditorOption[EditorOption["lineNumbers"] = 67] = "lineNumbers";
        EditorOption[EditorOption["lineNumbersMinChars"] = 68] = "lineNumbersMinChars";
        EditorOption[EditorOption["linkedEditing"] = 69] = "linkedEditing";
        EditorOption[EditorOption["links"] = 70] = "links";
        EditorOption[EditorOption["matchBrackets"] = 71] = "matchBrackets";
        EditorOption[EditorOption["minimap"] = 72] = "minimap";
        EditorOption[EditorOption["mouseStyle"] = 73] = "mouseStyle";
        EditorOption[EditorOption["mouseWheelScrollSensitivity"] = 74] = "mouseWheelScrollSensitivity";
        EditorOption[EditorOption["mouseWheelZoom"] = 75] = "mouseWheelZoom";
        EditorOption[EditorOption["multiCursorMergeOverlapping"] = 76] = "multiCursorMergeOverlapping";
        EditorOption[EditorOption["multiCursorModifier"] = 77] = "multiCursorModifier";
        EditorOption[EditorOption["multiCursorPaste"] = 78] = "multiCursorPaste";
        EditorOption[EditorOption["multiCursorLimit"] = 79] = "multiCursorLimit";
        EditorOption[EditorOption["occurrencesHighlight"] = 80] = "occurrencesHighlight";
        EditorOption[EditorOption["overviewRulerBorder"] = 81] = "overviewRulerBorder";
        EditorOption[EditorOption["overviewRulerLanes"] = 82] = "overviewRulerLanes";
        EditorOption[EditorOption["padding"] = 83] = "padding";
        EditorOption[EditorOption["pasteAs"] = 84] = "pasteAs";
        EditorOption[EditorOption["parameterHints"] = 85] = "parameterHints";
        EditorOption[EditorOption["peekWidgetDefaultFocus"] = 86] = "peekWidgetDefaultFocus";
        EditorOption[EditorOption["definitionLinkOpensInPeek"] = 87] = "definitionLinkOpensInPeek";
        EditorOption[EditorOption["quickSuggestions"] = 88] = "quickSuggestions";
        EditorOption[EditorOption["quickSuggestionsDelay"] = 89] = "quickSuggestionsDelay";
        EditorOption[EditorOption["readOnly"] = 90] = "readOnly";
        EditorOption[EditorOption["readOnlyMessage"] = 91] = "readOnlyMessage";
        EditorOption[EditorOption["renameOnType"] = 92] = "renameOnType";
        EditorOption[EditorOption["renderControlCharacters"] = 93] = "renderControlCharacters";
        EditorOption[EditorOption["renderFinalNewline"] = 94] = "renderFinalNewline";
        EditorOption[EditorOption["renderLineHighlight"] = 95] = "renderLineHighlight";
        EditorOption[EditorOption["renderLineHighlightOnlyWhenFocus"] = 96] = "renderLineHighlightOnlyWhenFocus";
        EditorOption[EditorOption["renderValidationDecorations"] = 97] = "renderValidationDecorations";
        EditorOption[EditorOption["renderWhitespace"] = 98] = "renderWhitespace";
        EditorOption[EditorOption["revealHorizontalRightPadding"] = 99] = "revealHorizontalRightPadding";
        EditorOption[EditorOption["roundedSelection"] = 100] = "roundedSelection";
        EditorOption[EditorOption["rulers"] = 101] = "rulers";
        EditorOption[EditorOption["scrollbar"] = 102] = "scrollbar";
        EditorOption[EditorOption["scrollBeyondLastColumn"] = 103] = "scrollBeyondLastColumn";
        EditorOption[EditorOption["scrollBeyondLastLine"] = 104] = "scrollBeyondLastLine";
        EditorOption[EditorOption["scrollPredominantAxis"] = 105] = "scrollPredominantAxis";
        EditorOption[EditorOption["selectionClipboard"] = 106] = "selectionClipboard";
        EditorOption[EditorOption["selectionHighlight"] = 107] = "selectionHighlight";
        EditorOption[EditorOption["selectOnLineNumbers"] = 108] = "selectOnLineNumbers";
        EditorOption[EditorOption["showFoldingControls"] = 109] = "showFoldingControls";
        EditorOption[EditorOption["showUnused"] = 110] = "showUnused";
        EditorOption[EditorOption["snippetSuggestions"] = 111] = "snippetSuggestions";
        EditorOption[EditorOption["smartSelect"] = 112] = "smartSelect";
        EditorOption[EditorOption["smoothScrolling"] = 113] = "smoothScrolling";
        EditorOption[EditorOption["stickyScroll"] = 114] = "stickyScroll";
        EditorOption[EditorOption["stickyTabStops"] = 115] = "stickyTabStops";
        EditorOption[EditorOption["stopRenderingLineAfter"] = 116] = "stopRenderingLineAfter";
        EditorOption[EditorOption["suggest"] = 117] = "suggest";
        EditorOption[EditorOption["suggestFontSize"] = 118] = "suggestFontSize";
        EditorOption[EditorOption["suggestLineHeight"] = 119] = "suggestLineHeight";
        EditorOption[EditorOption["suggestOnTriggerCharacters"] = 120] = "suggestOnTriggerCharacters";
        EditorOption[EditorOption["suggestSelection"] = 121] = "suggestSelection";
        EditorOption[EditorOption["tabCompletion"] = 122] = "tabCompletion";
        EditorOption[EditorOption["tabIndex"] = 123] = "tabIndex";
        EditorOption[EditorOption["unicodeHighlighting"] = 124] = "unicodeHighlighting";
        EditorOption[EditorOption["unusualLineTerminators"] = 125] = "unusualLineTerminators";
        EditorOption[EditorOption["useShadowDOM"] = 126] = "useShadowDOM";
        EditorOption[EditorOption["useTabStops"] = 127] = "useTabStops";
        EditorOption[EditorOption["wordBreak"] = 128] = "wordBreak";
        EditorOption[EditorOption["wordSeparators"] = 129] = "wordSeparators";
        EditorOption[EditorOption["wordWrap"] = 130] = "wordWrap";
        EditorOption[EditorOption["wordWrapBreakAfterCharacters"] = 131] = "wordWrapBreakAfterCharacters";
        EditorOption[EditorOption["wordWrapBreakBeforeCharacters"] = 132] = "wordWrapBreakBeforeCharacters";
        EditorOption[EditorOption["wordWrapColumn"] = 133] = "wordWrapColumn";
        EditorOption[EditorOption["wordWrapOverride1"] = 134] = "wordWrapOverride1";
        EditorOption[EditorOption["wordWrapOverride2"] = 135] = "wordWrapOverride2";
        EditorOption[EditorOption["wrappingIndent"] = 136] = "wrappingIndent";
        EditorOption[EditorOption["wrappingStrategy"] = 137] = "wrappingStrategy";
        EditorOption[EditorOption["showDeprecated"] = 138] = "showDeprecated";
        EditorOption[EditorOption["inlayHints"] = 139] = "inlayHints";
        // Leave these at the end (because they have dependencies!)
        EditorOption[EditorOption["editorClassName"] = 140] = "editorClassName";
        EditorOption[EditorOption["pixelRatio"] = 141] = "pixelRatio";
        EditorOption[EditorOption["tabFocusMode"] = 142] = "tabFocusMode";
        EditorOption[EditorOption["layoutInfo"] = 143] = "layoutInfo";
        EditorOption[EditorOption["wrappingInfo"] = 144] = "wrappingInfo";
        EditorOption[EditorOption["defaultColorDecorators"] = 145] = "defaultColorDecorators";
        EditorOption[EditorOption["colorDecoratorsActivatedOn"] = 146] = "colorDecoratorsActivatedOn";
        EditorOption[EditorOption["inlineCompletionsAccessibilityVerbose"] = 147] = "inlineCompletionsAccessibilityVerbose";
    })(EditorOption || (exports.EditorOption = EditorOption = {}));
    exports.EditorOptions = {
        acceptSuggestionOnCommitCharacter: register(new EditorBooleanOption(0 /* EditorOption.acceptSuggestionOnCommitCharacter */, 'acceptSuggestionOnCommitCharacter', true, { markdownDescription: nls.localize('acceptSuggestionOnCommitCharacter', "Controls whether suggestions should be accepted on commit characters. For example, in JavaScript, the semi-colon (`;`) can be a commit character that accepts a suggestion and types that character.") })),
        acceptSuggestionOnEnter: register(new EditorStringEnumOption(1 /* EditorOption.acceptSuggestionOnEnter */, 'acceptSuggestionOnEnter', 'on', ['on', 'smart', 'off'], {
            markdownEnumDescriptions: [
                '',
                nls.localize('acceptSuggestionOnEnterSmart', "Only accept a suggestion with `Enter` when it makes a textual change."),
                ''
            ],
            markdownDescription: nls.localize('acceptSuggestionOnEnter', "Controls whether suggestions should be accepted on `Enter`, in addition to `Tab`. Helps to avoid ambiguity between inserting new lines or accepting suggestions.")
        })),
        accessibilitySupport: register(new EditorAccessibilitySupport()),
        accessibilityPageSize: register(new EditorIntOption(3 /* EditorOption.accessibilityPageSize */, 'accessibilityPageSize', 10, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, {
            description: nls.localize('accessibilityPageSize', "Controls the number of lines in the editor that can be read out by a screen reader at once. When we detect a screen reader we automatically set the default to be 500. Warning: this has a performance implication for numbers larger than the default."),
            tags: ['accessibility']
        })),
        ariaLabel: register(new EditorStringOption(4 /* EditorOption.ariaLabel */, 'ariaLabel', nls.localize('editorViewAccessibleLabel', "Editor content"))),
        ariaRequired: register(new EditorBooleanOption(5 /* EditorOption.ariaRequired */, 'ariaRequired', false, undefined)),
        screenReaderAnnounceInlineSuggestion: register(new EditorBooleanOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */, 'screenReaderAnnounceInlineSuggestion', true, {
            description: nls.localize('screenReaderAnnounceInlineSuggestion', "Control whether inline suggestions are announced by a screen reader."),
            tags: ['accessibility']
        })),
        autoClosingBrackets: register(new EditorStringEnumOption(6 /* EditorOption.autoClosingBrackets */, 'autoClosingBrackets', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingBrackets.languageDefined', "Use language configurations to determine when to autoclose brackets."),
                nls.localize('editor.autoClosingBrackets.beforeWhitespace', "Autoclose brackets only when the cursor is to the left of whitespace."),
                '',
            ],
            description: nls.localize('autoClosingBrackets', "Controls whether the editor should automatically close brackets after the user adds an opening bracket.")
        })),
        autoClosingComments: register(new EditorStringEnumOption(7 /* EditorOption.autoClosingComments */, 'autoClosingComments', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingComments.languageDefined', "Use language configurations to determine when to autoclose comments."),
                nls.localize('editor.autoClosingComments.beforeWhitespace', "Autoclose comments only when the cursor is to the left of whitespace."),
                '',
            ],
            description: nls.localize('autoClosingComments', "Controls whether the editor should automatically close comments after the user adds an opening comment.")
        })),
        autoClosingDelete: register(new EditorStringEnumOption(9 /* EditorOption.autoClosingDelete */, 'autoClosingDelete', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingDelete.auto', "Remove adjacent closing quotes or brackets only if they were automatically inserted."),
                '',
            ],
            description: nls.localize('autoClosingDelete', "Controls whether the editor should remove adjacent closing quotes or brackets when deleting.")
        })),
        autoClosingOvertype: register(new EditorStringEnumOption(10 /* EditorOption.autoClosingOvertype */, 'autoClosingOvertype', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingOvertype.auto', "Type over closing quotes or brackets only if they were automatically inserted."),
                '',
            ],
            description: nls.localize('autoClosingOvertype', "Controls whether the editor should type over closing quotes or brackets.")
        })),
        autoClosingQuotes: register(new EditorStringEnumOption(11 /* EditorOption.autoClosingQuotes */, 'autoClosingQuotes', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingQuotes.languageDefined', "Use language configurations to determine when to autoclose quotes."),
                nls.localize('editor.autoClosingQuotes.beforeWhitespace', "Autoclose quotes only when the cursor is to the left of whitespace."),
                '',
            ],
            description: nls.localize('autoClosingQuotes', "Controls whether the editor should automatically close quotes after the user adds an opening quote.")
        })),
        autoIndent: register(new EditorEnumOption(12 /* EditorOption.autoIndent */, 'autoIndent', 4 /* EditorAutoIndentStrategy.Full */, 'full', ['none', 'keep', 'brackets', 'advanced', 'full'], _autoIndentFromString, {
            enumDescriptions: [
                nls.localize('editor.autoIndent.none', "The editor will not insert indentation automatically."),
                nls.localize('editor.autoIndent.keep', "The editor will keep the current line's indentation."),
                nls.localize('editor.autoIndent.brackets', "The editor will keep the current line's indentation and honor language defined brackets."),
                nls.localize('editor.autoIndent.advanced', "The editor will keep the current line's indentation, honor language defined brackets and invoke special onEnterRules defined by languages."),
                nls.localize('editor.autoIndent.full', "The editor will keep the current line's indentation, honor language defined brackets, invoke special onEnterRules defined by languages, and honor indentationRules defined by languages."),
            ],
            description: nls.localize('autoIndent', "Controls whether the editor should automatically adjust the indentation when users type, paste, move or indent lines.")
        })),
        automaticLayout: register(new EditorBooleanOption(13 /* EditorOption.automaticLayout */, 'automaticLayout', false)),
        autoSurround: register(new EditorStringEnumOption(14 /* EditorOption.autoSurround */, 'autoSurround', 'languageDefined', ['languageDefined', 'quotes', 'brackets', 'never'], {
            enumDescriptions: [
                nls.localize('editor.autoSurround.languageDefined', "Use language configurations to determine when to automatically surround selections."),
                nls.localize('editor.autoSurround.quotes', "Surround with quotes but not brackets."),
                nls.localize('editor.autoSurround.brackets', "Surround with brackets but not quotes."),
                ''
            ],
            description: nls.localize('autoSurround', "Controls whether the editor should automatically surround selections when typing quotes or brackets.")
        })),
        bracketPairColorization: register(new BracketPairColorization()),
        bracketPairGuides: register(new GuideOptions()),
        stickyTabStops: register(new EditorBooleanOption(115 /* EditorOption.stickyTabStops */, 'stickyTabStops', false, { description: nls.localize('stickyTabStops', "Emulate selection behavior of tab characters when using spaces for indentation. Selection will stick to tab stops.") })),
        codeLens: register(new EditorBooleanOption(17 /* EditorOption.codeLens */, 'codeLens', true, { description: nls.localize('codeLens', "Controls whether the editor shows CodeLens.") })),
        codeLensFontFamily: register(new EditorStringOption(18 /* EditorOption.codeLensFontFamily */, 'codeLensFontFamily', '', { description: nls.localize('codeLensFontFamily', "Controls the font family for CodeLens.") })),
        codeLensFontSize: register(new EditorIntOption(19 /* EditorOption.codeLensFontSize */, 'codeLensFontSize', 0, 0, 100, {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: 100,
            markdownDescription: nls.localize('codeLensFontSize', "Controls the font size in pixels for CodeLens. When set to 0, 90% of `#editor.fontSize#` is used.")
        })),
        colorDecorators: register(new EditorBooleanOption(20 /* EditorOption.colorDecorators */, 'colorDecorators', true, { description: nls.localize('colorDecorators', "Controls whether the editor should render the inline color decorators and color picker.") })),
        colorDecoratorActivatedOn: register(new EditorStringEnumOption(146 /* EditorOption.colorDecoratorsActivatedOn */, 'colorDecoratorsActivatedOn', 'clickAndHover', ['clickAndHover', 'hover', 'click'], {
            enumDescriptions: [
                nls.localize('editor.colorDecoratorActivatedOn.clickAndHover', "Make the color picker appear both on click and hover of the color decorator"),
                nls.localize('editor.colorDecoratorActivatedOn.hover', "Make the color picker appear on hover of the color decorator"),
                nls.localize('editor.colorDecoratorActivatedOn.click', "Make the color picker appear on click of the color decorator")
            ],
            description: nls.localize('colorDecoratorActivatedOn', "Controls the condition to make a color picker appear from a color decorator")
        })),
        colorDecoratorsLimit: register(new EditorIntOption(21 /* EditorOption.colorDecoratorsLimit */, 'colorDecoratorsLimit', 500, 1, 1000000, {
            markdownDescription: nls.localize('colorDecoratorsLimit', "Controls the max number of color decorators that can be rendered in an editor at once.")
        })),
        columnSelection: register(new EditorBooleanOption(22 /* EditorOption.columnSelection */, 'columnSelection', false, { description: nls.localize('columnSelection', "Enable that the selection with the mouse and keys is doing column selection.") })),
        comments: register(new EditorComments()),
        contextmenu: register(new EditorBooleanOption(24 /* EditorOption.contextmenu */, 'contextmenu', true)),
        copyWithSyntaxHighlighting: register(new EditorBooleanOption(25 /* EditorOption.copyWithSyntaxHighlighting */, 'copyWithSyntaxHighlighting', true, { description: nls.localize('copyWithSyntaxHighlighting', "Controls whether syntax highlighting should be copied into the clipboard.") })),
        cursorBlinking: register(new EditorEnumOption(26 /* EditorOption.cursorBlinking */, 'cursorBlinking', 1 /* TextEditorCursorBlinkingStyle.Blink */, 'blink', ['blink', 'smooth', 'phase', 'expand', 'solid'], _cursorBlinkingStyleFromString, { description: nls.localize('cursorBlinking', "Control the cursor animation style.") })),
        cursorSmoothCaretAnimation: register(new EditorStringEnumOption(27 /* EditorOption.cursorSmoothCaretAnimation */, 'cursorSmoothCaretAnimation', 'off', ['off', 'explicit', 'on'], {
            enumDescriptions: [
                nls.localize('cursorSmoothCaretAnimation.off', "Smooth caret animation is disabled."),
                nls.localize('cursorSmoothCaretAnimation.explicit', "Smooth caret animation is enabled only when the user moves the cursor with an explicit gesture."),
                nls.localize('cursorSmoothCaretAnimation.on', "Smooth caret animation is always enabled.")
            ],
            description: nls.localize('cursorSmoothCaretAnimation', "Controls whether the smooth caret animation should be enabled.")
        })),
        cursorStyle: register(new EditorEnumOption(28 /* EditorOption.cursorStyle */, 'cursorStyle', TextEditorCursorStyle.Line, 'line', ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'], _cursorStyleFromString, { description: nls.localize('cursorStyle', "Controls the cursor style.") })),
        cursorSurroundingLines: register(new EditorIntOption(29 /* EditorOption.cursorSurroundingLines */, 'cursorSurroundingLines', 0, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize('cursorSurroundingLines', "Controls the minimal number of visible leading lines (minimum 0) and trailing lines (minimum 1) surrounding the cursor. Known as 'scrollOff' or 'scrollOffset' in some other editors.") })),
        cursorSurroundingLinesStyle: register(new EditorStringEnumOption(30 /* EditorOption.cursorSurroundingLinesStyle */, 'cursorSurroundingLinesStyle', 'default', ['default', 'all'], {
            enumDescriptions: [
                nls.localize('cursorSurroundingLinesStyle.default', "`cursorSurroundingLines` is enforced only when triggered via the keyboard or API."),
                nls.localize('cursorSurroundingLinesStyle.all', "`cursorSurroundingLines` is enforced always.")
            ],
            markdownDescription: nls.localize('cursorSurroundingLinesStyle', "Controls when `#cursorSurroundingLines#` should be enforced.")
        })),
        cursorWidth: register(new EditorIntOption(31 /* EditorOption.cursorWidth */, 'cursorWidth', 0, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { markdownDescription: nls.localize('cursorWidth', "Controls the width of the cursor when `#editor.cursorStyle#` is set to `line`.") })),
        disableLayerHinting: register(new EditorBooleanOption(32 /* EditorOption.disableLayerHinting */, 'disableLayerHinting', false)),
        disableMonospaceOptimizations: register(new EditorBooleanOption(33 /* EditorOption.disableMonospaceOptimizations */, 'disableMonospaceOptimizations', false)),
        domReadOnly: register(new EditorBooleanOption(34 /* EditorOption.domReadOnly */, 'domReadOnly', false)),
        dragAndDrop: register(new EditorBooleanOption(35 /* EditorOption.dragAndDrop */, 'dragAndDrop', true, { description: nls.localize('dragAndDrop', "Controls whether the editor should allow moving selections via drag and drop.") })),
        emptySelectionClipboard: register(new EditorEmptySelectionClipboard()),
        dropIntoEditor: register(new EditorDropIntoEditor()),
        stickyScroll: register(new EditorStickyScroll()),
        experimentalWhitespaceRendering: register(new EditorStringEnumOption(38 /* EditorOption.experimentalWhitespaceRendering */, 'experimentalWhitespaceRendering', 'svg', ['svg', 'font', 'off'], {
            enumDescriptions: [
                nls.localize('experimentalWhitespaceRendering.svg', "Use a new rendering method with svgs."),
                nls.localize('experimentalWhitespaceRendering.font', "Use a new rendering method with font characters."),
                nls.localize('experimentalWhitespaceRendering.off', "Use the stable rendering method."),
            ],
            description: nls.localize('experimentalWhitespaceRendering', "Controls whether whitespace is rendered with a new, experimental method.")
        })),
        extraEditorClassName: register(new EditorStringOption(39 /* EditorOption.extraEditorClassName */, 'extraEditorClassName', '')),
        fastScrollSensitivity: register(new EditorFloatOption(40 /* EditorOption.fastScrollSensitivity */, 'fastScrollSensitivity', 5, x => (x <= 0 ? 5 : x), { markdownDescription: nls.localize('fastScrollSensitivity', "Scrolling speed multiplier when pressing `Alt`.") })),
        find: register(new EditorFind()),
        fixedOverflowWidgets: register(new EditorBooleanOption(42 /* EditorOption.fixedOverflowWidgets */, 'fixedOverflowWidgets', false)),
        folding: register(new EditorBooleanOption(43 /* EditorOption.folding */, 'folding', true, { description: nls.localize('folding', "Controls whether the editor has code folding enabled.") })),
        foldingStrategy: register(new EditorStringEnumOption(44 /* EditorOption.foldingStrategy */, 'foldingStrategy', 'auto', ['auto', 'indentation'], {
            enumDescriptions: [
                nls.localize('foldingStrategy.auto', "Use a language-specific folding strategy if available, else the indentation-based one."),
                nls.localize('foldingStrategy.indentation', "Use the indentation-based folding strategy."),
            ],
            description: nls.localize('foldingStrategy', "Controls the strategy for computing folding ranges.")
        })),
        foldingHighlight: register(new EditorBooleanOption(45 /* EditorOption.foldingHighlight */, 'foldingHighlight', true, { description: nls.localize('foldingHighlight', "Controls whether the editor should highlight folded ranges.") })),
        foldingImportsByDefault: register(new EditorBooleanOption(46 /* EditorOption.foldingImportsByDefault */, 'foldingImportsByDefault', false, { description: nls.localize('foldingImportsByDefault', "Controls whether the editor automatically collapses import ranges.") })),
        foldingMaximumRegions: register(new EditorIntOption(47 /* EditorOption.foldingMaximumRegions */, 'foldingMaximumRegions', 5000, 10, 65000, // limit must be less than foldingRanges MAX_FOLDING_REGIONS
        { description: nls.localize('foldingMaximumRegions', "The maximum number of foldable regions. Increasing this value may result in the editor becoming less responsive when the current source has a large number of foldable regions.") })),
        unfoldOnClickAfterEndOfLine: register(new EditorBooleanOption(48 /* EditorOption.unfoldOnClickAfterEndOfLine */, 'unfoldOnClickAfterEndOfLine', false, { description: nls.localize('unfoldOnClickAfterEndOfLine', "Controls whether clicking on the empty content after a folded line will unfold the line.") })),
        fontFamily: register(new EditorStringOption(49 /* EditorOption.fontFamily */, 'fontFamily', exports.EDITOR_FONT_DEFAULTS.fontFamily, { description: nls.localize('fontFamily', "Controls the font family.") })),
        fontInfo: register(new EditorFontInfo()),
        fontLigatures2: register(new EditorFontLigatures()),
        fontSize: register(new EditorFontSize()),
        fontWeight: register(new EditorFontWeight()),
        fontVariations: register(new EditorFontVariations()),
        formatOnPaste: register(new EditorBooleanOption(55 /* EditorOption.formatOnPaste */, 'formatOnPaste', false, { description: nls.localize('formatOnPaste', "Controls whether the editor should automatically format the pasted content. A formatter must be available and the formatter should be able to format a range in a document.") })),
        formatOnType: register(new EditorBooleanOption(56 /* EditorOption.formatOnType */, 'formatOnType', false, { description: nls.localize('formatOnType', "Controls whether the editor should automatically format the line after typing.") })),
        glyphMargin: register(new EditorBooleanOption(57 /* EditorOption.glyphMargin */, 'glyphMargin', true, { description: nls.localize('glyphMargin', "Controls whether the editor should render the vertical glyph margin. Glyph margin is mostly used for debugging.") })),
        gotoLocation: register(new EditorGoToLocation()),
        hideCursorInOverviewRuler: register(new EditorBooleanOption(59 /* EditorOption.hideCursorInOverviewRuler */, 'hideCursorInOverviewRuler', false, { description: nls.localize('hideCursorInOverviewRuler', "Controls whether the cursor should be hidden in the overview ruler.") })),
        hover: register(new EditorHover()),
        inDiffEditor: register(new EditorBooleanOption(61 /* EditorOption.inDiffEditor */, 'inDiffEditor', false)),
        letterSpacing: register(new EditorFloatOption(63 /* EditorOption.letterSpacing */, 'letterSpacing', exports.EDITOR_FONT_DEFAULTS.letterSpacing, x => EditorFloatOption.clamp(x, -5, 20), { description: nls.localize('letterSpacing', "Controls the letter spacing in pixels.") })),
        lightbulb: register(new EditorLightbulb()),
        lineDecorationsWidth: register(new EditorLineDecorationsWidth()),
        lineHeight: register(new EditorLineHeight()),
        lineNumbers: register(new EditorRenderLineNumbersOption()),
        lineNumbersMinChars: register(new EditorIntOption(68 /* EditorOption.lineNumbersMinChars */, 'lineNumbersMinChars', 5, 1, 300)),
        linkedEditing: register(new EditorBooleanOption(69 /* EditorOption.linkedEditing */, 'linkedEditing', false, { description: nls.localize('linkedEditing', "Controls whether the editor has linked editing enabled. Depending on the language, related symbols such as HTML tags, are updated while editing.") })),
        links: register(new EditorBooleanOption(70 /* EditorOption.links */, 'links', true, { description: nls.localize('links', "Controls whether the editor should detect links and make them clickable.") })),
        matchBrackets: register(new EditorStringEnumOption(71 /* EditorOption.matchBrackets */, 'matchBrackets', 'always', ['always', 'near', 'never'], { description: nls.localize('matchBrackets', "Highlight matching brackets.") })),
        minimap: register(new EditorMinimap()),
        mouseStyle: register(new EditorStringEnumOption(73 /* EditorOption.mouseStyle */, 'mouseStyle', 'text', ['text', 'default', 'copy'])),
        mouseWheelScrollSensitivity: register(new EditorFloatOption(74 /* EditorOption.mouseWheelScrollSensitivity */, 'mouseWheelScrollSensitivity', 1, x => (x === 0 ? 1 : x), { markdownDescription: nls.localize('mouseWheelScrollSensitivity', "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.") })),
        mouseWheelZoom: register(new EditorBooleanOption(75 /* EditorOption.mouseWheelZoom */, 'mouseWheelZoom', false, {
            markdownDescription: platform.isMacintosh
                ? nls.localize('mouseWheelZoom.mac', "Zoom the font of the editor when using mouse wheel and holding `Cmd`.")
                : nls.localize('mouseWheelZoom', "Zoom the font of the editor when using mouse wheel and holding `Ctrl`.")
        })),
        multiCursorMergeOverlapping: register(new EditorBooleanOption(76 /* EditorOption.multiCursorMergeOverlapping */, 'multiCursorMergeOverlapping', true, { description: nls.localize('multiCursorMergeOverlapping', "Merge multiple cursors when they are overlapping.") })),
        multiCursorModifier: register(new EditorEnumOption(77 /* EditorOption.multiCursorModifier */, 'multiCursorModifier', 'altKey', 'alt', ['ctrlCmd', 'alt'], _multiCursorModifierFromString, {
            markdownEnumDescriptions: [
                nls.localize('multiCursorModifier.ctrlCmd', "Maps to `Control` on Windows and Linux and to `Command` on macOS."),
                nls.localize('multiCursorModifier.alt', "Maps to `Alt` on Windows and Linux and to `Option` on macOS.")
            ],
            markdownDescription: nls.localize({
                key: 'multiCursorModifier',
                comment: [
                    '- `ctrlCmd` refers to a value the setting can take and should not be localized.',
                    '- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
                ]
            }, "The modifier to be used to add multiple cursors with the mouse. The Go to Definition and Open Link mouse gestures will adapt such that they do not conflict with the [multicursor modifier](https://code.visualstudio.com/docs/editor/codebasics#_multicursor-modifier).")
        })),
        multiCursorPaste: register(new EditorStringEnumOption(78 /* EditorOption.multiCursorPaste */, 'multiCursorPaste', 'spread', ['spread', 'full'], {
            markdownEnumDescriptions: [
                nls.localize('multiCursorPaste.spread', "Each cursor pastes a single line of the text."),
                nls.localize('multiCursorPaste.full', "Each cursor pastes the full text.")
            ],
            markdownDescription: nls.localize('multiCursorPaste', "Controls pasting when the line count of the pasted text matches the cursor count.")
        })),
        multiCursorLimit: register(new EditorIntOption(79 /* EditorOption.multiCursorLimit */, 'multiCursorLimit', 10000, 1, 100000, {
            markdownDescription: nls.localize('multiCursorLimit', "Controls the max number of cursors that can be in an active editor at once.")
        })),
        occurrencesHighlight: register(new EditorStringEnumOption(80 /* EditorOption.occurrencesHighlight */, 'occurrencesHighlight', 'singleFile', ['off', 'singleFile', 'multiFile'], {
            markdownEnumDescriptions: [
                nls.localize('occurrencesHighlight.off', "Does not highlight occurrences."),
                nls.localize('occurrencesHighlight.singleFile', "Highlights occurrences only in the current file."),
                nls.localize('occurrencesHighlight.multiFile', "Experimental: Highlights occurrences across all valid open files.")
            ],
            markdownDescription: nls.localize('occurrencesHighlight', "Controls whether occurrences should be highlighted across open files.")
        })),
        overviewRulerBorder: register(new EditorBooleanOption(81 /* EditorOption.overviewRulerBorder */, 'overviewRulerBorder', true, { description: nls.localize('overviewRulerBorder', "Controls whether a border should be drawn around the overview ruler.") })),
        overviewRulerLanes: register(new EditorIntOption(82 /* EditorOption.overviewRulerLanes */, 'overviewRulerLanes', 3, 0, 3)),
        padding: register(new EditorPadding()),
        pasteAs: register(new EditorPasteAs()),
        parameterHints: register(new EditorParameterHints()),
        peekWidgetDefaultFocus: register(new EditorStringEnumOption(86 /* EditorOption.peekWidgetDefaultFocus */, 'peekWidgetDefaultFocus', 'tree', ['tree', 'editor'], {
            enumDescriptions: [
                nls.localize('peekWidgetDefaultFocus.tree', "Focus the tree when opening peek"),
                nls.localize('peekWidgetDefaultFocus.editor', "Focus the editor when opening peek")
            ],
            description: nls.localize('peekWidgetDefaultFocus', "Controls whether to focus the inline editor or the tree in the peek widget.")
        })),
        definitionLinkOpensInPeek: register(new EditorBooleanOption(87 /* EditorOption.definitionLinkOpensInPeek */, 'definitionLinkOpensInPeek', false, { description: nls.localize('definitionLinkOpensInPeek', "Controls whether the Go to Definition mouse gesture always opens the peek widget.") })),
        quickSuggestions: register(new EditorQuickSuggestions()),
        quickSuggestionsDelay: register(new EditorIntOption(89 /* EditorOption.quickSuggestionsDelay */, 'quickSuggestionsDelay', 10, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize('quickSuggestionsDelay', "Controls the delay in milliseconds after which quick suggestions will show up.") })),
        readOnly: register(new EditorBooleanOption(90 /* EditorOption.readOnly */, 'readOnly', false)),
        readOnlyMessage: register(new ReadonlyMessage()),
        renameOnType: register(new EditorBooleanOption(92 /* EditorOption.renameOnType */, 'renameOnType', false, { description: nls.localize('renameOnType', "Controls whether the editor auto renames on type."), markdownDeprecationMessage: nls.localize('renameOnTypeDeprecate', "Deprecated, use `editor.linkedEditing` instead.") })),
        renderControlCharacters: register(new EditorBooleanOption(93 /* EditorOption.renderControlCharacters */, 'renderControlCharacters', true, { description: nls.localize('renderControlCharacters', "Controls whether the editor should render control characters."), restricted: true })),
        renderFinalNewline: register(new EditorStringEnumOption(94 /* EditorOption.renderFinalNewline */, 'renderFinalNewline', (platform.isLinux ? 'dimmed' : 'on'), ['off', 'on', 'dimmed'], { description: nls.localize('renderFinalNewline', "Render last line number when the file ends with a newline.") })),
        renderLineHighlight: register(new EditorStringEnumOption(95 /* EditorOption.renderLineHighlight */, 'renderLineHighlight', 'line', ['none', 'gutter', 'line', 'all'], {
            enumDescriptions: [
                '',
                '',
                '',
                nls.localize('renderLineHighlight.all', "Highlights both the gutter and the current line."),
            ],
            description: nls.localize('renderLineHighlight', "Controls how the editor should render the current line highlight.")
        })),
        renderLineHighlightOnlyWhenFocus: register(new EditorBooleanOption(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */, 'renderLineHighlightOnlyWhenFocus', false, { description: nls.localize('renderLineHighlightOnlyWhenFocus', "Controls if the editor should render the current line highlight only when the editor is focused.") })),
        renderValidationDecorations: register(new EditorStringEnumOption(97 /* EditorOption.renderValidationDecorations */, 'renderValidationDecorations', 'editable', ['editable', 'on', 'off'])),
        renderWhitespace: register(new EditorStringEnumOption(98 /* EditorOption.renderWhitespace */, 'renderWhitespace', 'selection', ['none', 'boundary', 'selection', 'trailing', 'all'], {
            enumDescriptions: [
                '',
                nls.localize('renderWhitespace.boundary', "Render whitespace characters except for single spaces between words."),
                nls.localize('renderWhitespace.selection', "Render whitespace characters only on selected text."),
                nls.localize('renderWhitespace.trailing', "Render only trailing whitespace characters."),
                ''
            ],
            description: nls.localize('renderWhitespace', "Controls how the editor should render whitespace characters.")
        })),
        revealHorizontalRightPadding: register(new EditorIntOption(99 /* EditorOption.revealHorizontalRightPadding */, 'revealHorizontalRightPadding', 15, 0, 1000)),
        roundedSelection: register(new EditorBooleanOption(100 /* EditorOption.roundedSelection */, 'roundedSelection', true, { description: nls.localize('roundedSelection', "Controls whether selections should have rounded corners.") })),
        rulers: register(new EditorRulers()),
        scrollbar: register(new EditorScrollbar()),
        scrollBeyondLastColumn: register(new EditorIntOption(103 /* EditorOption.scrollBeyondLastColumn */, 'scrollBeyondLastColumn', 4, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize('scrollBeyondLastColumn', "Controls the number of extra characters beyond which the editor will scroll horizontally.") })),
        scrollBeyondLastLine: register(new EditorBooleanOption(104 /* EditorOption.scrollBeyondLastLine */, 'scrollBeyondLastLine', true, { description: nls.localize('scrollBeyondLastLine', "Controls whether the editor will scroll beyond the last line.") })),
        scrollPredominantAxis: register(new EditorBooleanOption(105 /* EditorOption.scrollPredominantAxis */, 'scrollPredominantAxis', true, { description: nls.localize('scrollPredominantAxis', "Scroll only along the predominant axis when scrolling both vertically and horizontally at the same time. Prevents horizontal drift when scrolling vertically on a trackpad.") })),
        selectionClipboard: register(new EditorBooleanOption(106 /* EditorOption.selectionClipboard */, 'selectionClipboard', true, {
            description: nls.localize('selectionClipboard', "Controls whether the Linux primary clipboard should be supported."),
            included: platform.isLinux
        })),
        selectionHighlight: register(new EditorBooleanOption(107 /* EditorOption.selectionHighlight */, 'selectionHighlight', true, { description: nls.localize('selectionHighlight', "Controls whether the editor should highlight matches similar to the selection.") })),
        selectOnLineNumbers: register(new EditorBooleanOption(108 /* EditorOption.selectOnLineNumbers */, 'selectOnLineNumbers', true)),
        showFoldingControls: register(new EditorStringEnumOption(109 /* EditorOption.showFoldingControls */, 'showFoldingControls', 'mouseover', ['always', 'never', 'mouseover'], {
            enumDescriptions: [
                nls.localize('showFoldingControls.always', "Always show the folding controls."),
                nls.localize('showFoldingControls.never', "Never show the folding controls and reduce the gutter size."),
                nls.localize('showFoldingControls.mouseover', "Only show the folding controls when the mouse is over the gutter."),
            ],
            description: nls.localize('showFoldingControls', "Controls when the folding controls on the gutter are shown.")
        })),
        showUnused: register(new EditorBooleanOption(110 /* EditorOption.showUnused */, 'showUnused', true, { description: nls.localize('showUnused', "Controls fading out of unused code.") })),
        showDeprecated: register(new EditorBooleanOption(138 /* EditorOption.showDeprecated */, 'showDeprecated', true, { description: nls.localize('showDeprecated', "Controls strikethrough deprecated variables.") })),
        inlayHints: register(new EditorInlayHints()),
        snippetSuggestions: register(new EditorStringEnumOption(111 /* EditorOption.snippetSuggestions */, 'snippetSuggestions', 'inline', ['top', 'bottom', 'inline', 'none'], {
            enumDescriptions: [
                nls.localize('snippetSuggestions.top', "Show snippet suggestions on top of other suggestions."),
                nls.localize('snippetSuggestions.bottom', "Show snippet suggestions below other suggestions."),
                nls.localize('snippetSuggestions.inline', "Show snippets suggestions with other suggestions."),
                nls.localize('snippetSuggestions.none', "Do not show snippet suggestions."),
            ],
            description: nls.localize('snippetSuggestions', "Controls whether snippets are shown with other suggestions and how they are sorted.")
        })),
        smartSelect: register(new SmartSelect()),
        smoothScrolling: register(new EditorBooleanOption(113 /* EditorOption.smoothScrolling */, 'smoothScrolling', false, { description: nls.localize('smoothScrolling', "Controls whether the editor will scroll using an animation.") })),
        stopRenderingLineAfter: register(new EditorIntOption(116 /* EditorOption.stopRenderingLineAfter */, 'stopRenderingLineAfter', 10000, -1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)),
        suggest: register(new EditorSuggest()),
        inlineSuggest: register(new InlineEditorSuggest()),
        inlineCompletionsAccessibilityVerbose: register(new EditorBooleanOption(147 /* EditorOption.inlineCompletionsAccessibilityVerbose */, 'inlineCompletionsAccessibilityVerbose', false, { description: nls.localize('inlineCompletionsAccessibilityVerbose', "Controls whether the accessibility hint should be provided to screen reader users when an inline completion is shown.") })),
        suggestFontSize: register(new EditorIntOption(118 /* EditorOption.suggestFontSize */, 'suggestFontSize', 0, 0, 1000, { markdownDescription: nls.localize('suggestFontSize', "Font size for the suggest widget. When set to {0}, the value of {1} is used.", '`0`', '`#editor.fontSize#`') })),
        suggestLineHeight: register(new EditorIntOption(119 /* EditorOption.suggestLineHeight */, 'suggestLineHeight', 0, 0, 1000, { markdownDescription: nls.localize('suggestLineHeight', "Line height for the suggest widget. When set to {0}, the value of {1} is used. The minimum value is 8.", '`0`', '`#editor.lineHeight#`') })),
        suggestOnTriggerCharacters: register(new EditorBooleanOption(120 /* EditorOption.suggestOnTriggerCharacters */, 'suggestOnTriggerCharacters', true, { description: nls.localize('suggestOnTriggerCharacters', "Controls whether suggestions should automatically show up when typing trigger characters.") })),
        suggestSelection: register(new EditorStringEnumOption(121 /* EditorOption.suggestSelection */, 'suggestSelection', 'first', ['first', 'recentlyUsed', 'recentlyUsedByPrefix'], {
            markdownEnumDescriptions: [
                nls.localize('suggestSelection.first', "Always select the first suggestion."),
                nls.localize('suggestSelection.recentlyUsed', "Select recent suggestions unless further typing selects one, e.g. `console.| -> console.log` because `log` has been completed recently."),
                nls.localize('suggestSelection.recentlyUsedByPrefix', "Select suggestions based on previous prefixes that have completed those suggestions, e.g. `co -> console` and `con -> const`."),
            ],
            description: nls.localize('suggestSelection', "Controls how suggestions are pre-selected when showing the suggest list.")
        })),
        tabCompletion: register(new EditorStringEnumOption(122 /* EditorOption.tabCompletion */, 'tabCompletion', 'off', ['on', 'off', 'onlySnippets'], {
            enumDescriptions: [
                nls.localize('tabCompletion.on', "Tab complete will insert the best matching suggestion when pressing tab."),
                nls.localize('tabCompletion.off', "Disable tab completions."),
                nls.localize('tabCompletion.onlySnippets', "Tab complete snippets when their prefix match. Works best when 'quickSuggestions' aren't enabled."),
            ],
            description: nls.localize('tabCompletion', "Enables tab completions.")
        })),
        tabIndex: register(new EditorIntOption(123 /* EditorOption.tabIndex */, 'tabIndex', 0, -1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)),
        unicodeHighlight: register(new UnicodeHighlight()),
        unusualLineTerminators: register(new EditorStringEnumOption(125 /* EditorOption.unusualLineTerminators */, 'unusualLineTerminators', 'prompt', ['auto', 'off', 'prompt'], {
            enumDescriptions: [
                nls.localize('unusualLineTerminators.auto', "Unusual line terminators are automatically removed."),
                nls.localize('unusualLineTerminators.off', "Unusual line terminators are ignored."),
                nls.localize('unusualLineTerminators.prompt', "Unusual line terminators prompt to be removed."),
            ],
            description: nls.localize('unusualLineTerminators', "Remove unusual line terminators that might cause problems.")
        })),
        useShadowDOM: register(new EditorBooleanOption(126 /* EditorOption.useShadowDOM */, 'useShadowDOM', true)),
        useTabStops: register(new EditorBooleanOption(127 /* EditorOption.useTabStops */, 'useTabStops', true, { description: nls.localize('useTabStops', "Inserting and deleting whitespace follows tab stops.") })),
        wordBreak: register(new EditorStringEnumOption(128 /* EditorOption.wordBreak */, 'wordBreak', 'normal', ['normal', 'keepAll'], {
            markdownEnumDescriptions: [
                nls.localize('wordBreak.normal', "Use the default line break rule."),
                nls.localize('wordBreak.keepAll', "Word breaks should not be used for Chinese/Japanese/Korean (CJK) text. Non-CJK text behavior is the same as for normal."),
            ],
            description: nls.localize('wordBreak', "Controls the word break rules used for Chinese/Japanese/Korean (CJK) text.")
        })),
        wordSeparators: register(new EditorStringOption(129 /* EditorOption.wordSeparators */, 'wordSeparators', wordHelper_1.USUAL_WORD_SEPARATORS, { description: nls.localize('wordSeparators', "Characters that will be used as word separators when doing word related navigations or operations.") })),
        wordWrap: register(new EditorStringEnumOption(130 /* EditorOption.wordWrap */, 'wordWrap', 'off', ['off', 'on', 'wordWrapColumn', 'bounded'], {
            markdownEnumDescriptions: [
                nls.localize('wordWrap.off', "Lines will never wrap."),
                nls.localize('wordWrap.on', "Lines will wrap at the viewport width."),
                nls.localize({
                    key: 'wordWrap.wordWrapColumn',
                    comment: [
                        '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                    ]
                }, "Lines will wrap at `#editor.wordWrapColumn#`."),
                nls.localize({
                    key: 'wordWrap.bounded',
                    comment: [
                        '- viewport means the edge of the visible window size.',
                        '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                    ]
                }, "Lines will wrap at the minimum of viewport and `#editor.wordWrapColumn#`."),
            ],
            description: nls.localize({
                key: 'wordWrap',
                comment: [
                    '- \'off\', \'on\', \'wordWrapColumn\' and \'bounded\' refer to values the setting can take and should not be localized.',
                    '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                ]
            }, "Controls how lines should wrap.")
        })),
        wordWrapBreakAfterCharacters: register(new EditorStringOption(131 /* EditorOption.wordWrapBreakAfterCharacters */, 'wordWrapBreakAfterCharacters', 
        // allow-any-unicode-next-line
        ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻ｧｨｩｪｫｬｭｮｯｰ”〉》」』】〕）］｝｣')),
        wordWrapBreakBeforeCharacters: register(new EditorStringOption(132 /* EditorOption.wordWrapBreakBeforeCharacters */, 'wordWrapBreakBeforeCharacters', 
        // allow-any-unicode-next-line
        '([{‘“〈《「『【〔（［｛｢£¥＄￡￥+＋')),
        wordWrapColumn: register(new EditorIntOption(133 /* EditorOption.wordWrapColumn */, 'wordWrapColumn', 80, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, {
            markdownDescription: nls.localize({
                key: 'wordWrapColumn',
                comment: [
                    '- `editor.wordWrap` refers to a different setting and should not be localized.',
                    '- \'wordWrapColumn\' and \'bounded\' refer to values the different setting can take and should not be localized.'
                ]
            }, "Controls the wrapping column of the editor when `#editor.wordWrap#` is `wordWrapColumn` or `bounded`.")
        })),
        wordWrapOverride1: register(new EditorStringEnumOption(134 /* EditorOption.wordWrapOverride1 */, 'wordWrapOverride1', 'inherit', ['off', 'on', 'inherit'])),
        wordWrapOverride2: register(new EditorStringEnumOption(135 /* EditorOption.wordWrapOverride2 */, 'wordWrapOverride2', 'inherit', ['off', 'on', 'inherit'])),
        // Leave these at the end (because they have dependencies!)
        editorClassName: register(new EditorClassName()),
        defaultColorDecorators: register(new EditorBooleanOption(145 /* EditorOption.defaultColorDecorators */, 'defaultColorDecorators', false, { markdownDescription: nls.localize('defaultColorDecorators', "Controls whether inline color decorations should be shown using the default document color provider") })),
        pixelRatio: register(new EditorPixelRatio()),
        tabFocusMode: register(new EditorBooleanOption(142 /* EditorOption.tabFocusMode */, 'tabFocusMode', false, { markdownDescription: nls.localize('tabFocusMode', "Controls whether the editor receives tabs or defers them to the workbench for navigation.") })),
        layoutInfo: register(new EditorLayoutInfoComputer()),
        wrappingInfo: register(new EditorWrappingInfoComputer()),
        wrappingIndent: register(new WrappingIndentOption()),
        wrappingStrategy: register(new WrappingStrategy())
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb25maWcvZWRpdG9yT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQ2hHOztPQUVHO0lBQ0gsSUFBa0Isd0JBTWpCO0lBTkQsV0FBa0Isd0JBQXdCO1FBQ3pDLHVFQUFRLENBQUE7UUFDUix1RUFBUSxDQUFBO1FBQ1IsK0VBQVksQ0FBQTtRQUNaLCtFQUFZLENBQUE7UUFDWix1RUFBUSxDQUFBO0lBQ1QsQ0FBQyxFQU5pQix3QkFBd0Isd0NBQXhCLHdCQUF3QixRQU16QztJQTZyQkQ7OztPQUdHO0lBQ1UsUUFBQSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7SUEwSHRDLFlBQVk7SUFFWjs7T0FFRztJQUNILE1BQWEseUJBQXlCO1FBRXJDOztXQUVHO1FBQ0gsWUFBWSxNQUFpQjtZQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBQ00sVUFBVSxDQUFDLEVBQWdCO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDO0tBQ0Q7SUFYRCw4REFXQztJQThCRDs7T0FFRztJQUNILE1BQWEsb0JBQW9CO1FBTWhDO1lBQ0MsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUM7UUFDbEMsQ0FBQztLQUNEO0lBWEQsb0RBV0M7SUFrQ0Q7O09BRUc7SUFDSCxNQUFlLGdCQUFnQjtRQU85QixZQUFZLEVBQUssRUFBRSxJQUF3QixFQUFFLFlBQWUsRUFBRSxNQUF3RjtZQUNySixJQUFJLENBQUMsRUFBRSxHQUFHLEVB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