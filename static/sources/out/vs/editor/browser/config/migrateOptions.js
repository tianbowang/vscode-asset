/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateOptions = exports.EditorSettingMigration = void 0;
    class EditorSettingMigration {
        static { this.items = []; }
        constructor(key, migrate) {
            this.key = key;
            this.migrate = migrate;
        }
        apply(options) {
            const value = EditorSettingMigration._read(options, this.key);
            const read = (key) => EditorSettingMigration._read(options, key);
            const write = (key, value) => EditorSettingMigration._write(options, key, value);
            this.migrate(value, read, write);
        }
        static _read(source, key) {
            if (typeof source === 'undefined') {
                return undefined;
            }
            const firstDotIndex = key.indexOf('.');
            if (firstDotIndex >= 0) {
                const firstSegment = key.substring(0, firstDotIndex);
                return this._read(source[firstSegment], key.substring(firstDotIndex + 1));
            }
            return source[key];
        }
        static _write(target, key, value) {
            const firstDotIndex = key.indexOf('.');
            if (firstDotIndex >= 0) {
                const firstSegment = key.substring(0, firstDotIndex);
                target[firstSegment] = target[firstSegment] || {};
                this._write(target[firstSegment], key.substring(firstDotIndex + 1), value);
                return;
            }
            target[key] = value;
        }
    }
    exports.EditorSettingMigration = EditorSettingMigration;
    function registerEditorSettingMigration(key, migrate) {
        EditorSettingMigration.items.push(new EditorSettingMigration(key, migrate));
    }
    function registerSimpleEditorSettingMigration(key, values) {
        registerEditorSettingMigration(key, (value, read, write) => {
            if (typeof value !== 'undefined') {
                for (const [oldValue, newValue] of values) {
                    if (value === oldValue) {
                        write(key, newValue);
                        return;
                    }
                }
            }
        });
    }
    /**
     * Compatibility with old options
     */
    function migrateOptions(options) {
        EditorSettingMigration.items.forEach(migration => migration.apply(options));
    }
    exports.migrateOptions = migrateOptions;
    registerSimpleEditorSettingMigration('wordWrap', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('lineNumbers', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('cursorBlinking', [['visible', 'solid']]);
    registerSimpleEditorSettingMigration('renderWhitespace', [[true, 'boundary'], [false, 'none']]);
    registerSimpleEditorSettingMigration('renderLineHighlight', [[true, 'line'], [false, 'none']]);
    registerSimpleEditorSettingMigration('acceptSuggestionOnEnter', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('tabCompletion', [[false, 'off'], [true, 'onlySnippets']]);
    registerSimpleEditorSettingMigration('hover', [[true, { enabled: true }], [false, { enabled: false }]]);
    registerSimpleEditorSettingMigration('parameterHints', [[true, { enabled: true }], [false, { enabled: false }]]);
    registerSimpleEditorSettingMigration('autoIndent', [[false, 'advanced'], [true, 'full']]);
    registerSimpleEditorSettingMigration('matchBrackets', [[true, 'always'], [false, 'never']]);
    registerSimpleEditorSettingMigration('renderFinalNewline', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('cursorSmoothCaretAnimation', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('occurrencesHighlight', [[true, 'singleFile'], [false, 'off']]);
    registerSimpleEditorSettingMigration('wordBasedSuggestions', [[true, 'matchingDocuments'], [false, 'off']]);
    registerEditorSettingMigration('autoClosingBrackets', (value, read, write) => {
        if (value === false) {
            write('autoClosingBrackets', 'never');
            if (typeof read('autoClosingQuotes') === 'undefined') {
                write('autoClosingQuotes', 'never');
            }
            if (typeof read('autoSurround') === 'undefined') {
                write('autoSurround', 'never');
            }
        }
    });
    registerEditorSettingMigration('renderIndentGuides', (value, read, write) => {
        if (typeof value !== 'undefined') {
            write('renderIndentGuides', undefined);
            if (typeof read('guides.indentation') === 'undefined') {
                write('guides.indentation', !!value);
            }
        }
    });
    registerEditorSettingMigration('highlightActiveIndentGuide', (value, read, write) => {
        if (typeof value !== 'undefined') {
            write('highlightActiveIndentGuide', undefined);
            if (typeof read('guides.highlightActiveIndentation') === 'undefined') {
                write('guides.highlightActiveIndentation', !!value);
            }
        }
    });
    const suggestFilteredTypesMapping = {
        method: 'showMethods',
        function: 'showFunctions',
        constructor: 'showConstructors',
        deprecated: 'showDeprecated',
        field: 'showFields',
        variable: 'showVariables',
        class: 'showClasses',
        struct: 'showStructs',
        interface: 'showInterfaces',
        module: 'showModules',
        property: 'showProperties',
        event: 'showEvents',
        operator: 'showOperators',
        unit: 'showUnits',
        value: 'showValues',
        constant: 'showConstants',
        enum: 'showEnums',
        enumMember: 'showEnumMembers',
        keyword: 'showKeywords',
        text: 'showWords',
        color: 'showColors',
        file: 'showFiles',
        reference: 'showReferences',
        folder: 'showFolders',
        typeParameter: 'showTypeParameters',
        snippet: 'showSnippets',
    };
    registerEditorSettingMigration('suggest.filteredTypes', (value, read, write) => {
        if (value && typeof value === 'object') {
            for (const entry of Object.entries(suggestFilteredTypesMapping)) {
                const v = value[entry[0]];
                if (v === false) {
                    if (typeof read(`suggest.${entry[1]}`) === 'undefined') {
                        write(`suggest.${entry[1]}`, false);
                    }
                }
            }
            write('suggest.filteredTypes', undefined);
        }
    });
    registerEditorSettingMigration('quickSuggestions', (input, read, write) => {
        if (typeof input === 'boolean') {
            const value = input ? 'on' : 'off';
            const newValue = { comments: value, strings: value, other: value };
            write('quickSuggestions', newValue);
        }
    });
    // Sticky Scroll
    registerEditorSettingMigration('experimental.stickyScroll.enabled', (value, read, write) => {
        if (typeof value === 'boolean') {
            write('experimental.stickyScroll.enabled', undefined);
            if (typeof read('stickyScroll.enabled') === 'undefined') {
                write('stickyScroll.enabled', value);
            }
        }
    });
    registerEditorSettingMigration('experimental.stickyScroll.maxLineCount', (value, read, write) => {
        if (typeof value === 'number') {
            write('experimental.stickyScroll.maxLineCount', undefined);
            if (typeof read('stickyScroll.maxLineCount') === 'undefined') {
                write('stickyScroll.maxLineCount', value);
            }
        }
    });
    // Code Actions on Save
    registerEditorSettingMigration('codeActionsOnSave', (value, read, write) => {
        if (value && typeof value === 'object') {
            let toBeModified = false;
            const newValue = {};
            for (const entry of Object.entries(value)) {
                if (typeof entry[1] === 'boolean') {
                    toBeModified = true;
                    newValue[entry[0]] = entry[1] ? 'explicit' : 'never';
                }
                else {
                    newValue[entry[0]] = entry[1];
                }
            }
            if (toBeModified) {
                write(`codeActionsOnSave`, newValue);
            }
        }
    });
    // Migrate Quick Fix Settings
    registerEditorSettingMigration('codeActionWidget.includeNearbyQuickfixes', (value, read, write) => {
        if (typeof value === 'boolean') {
            write('codeActionWidget.includeNearbyQuickfixes', undefined);
            if (typeof read('codeActionWidget.includeNearbyQuickFixes') === 'undefined') {
                write('codeActionWidget.includeNearbyQuickFixes', value);
            }
        }
    });
    // Migrate the lightbulb settings
    registerEditorSettingMigration('lightbulb.enabled', (value, read, write) => {
        if (typeof value === 'boolean') {
            write('lightbulb.enabled', value ? undefined : 'off');
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZU9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL2NvbmZpZy9taWdyYXRlT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBYSxzQkFBc0I7aUJBRXBCLFVBQUssR0FBNkIsRUFBRSxDQUFDO1FBRW5ELFlBQ2lCLEdBQVcsRUFDWCxPQUE0RTtZQUQ1RSxRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQ1gsWUFBTyxHQUFQLE9BQU8sQ0FBcUU7UUFDekYsQ0FBQztRQUVMLEtBQUssQ0FBQyxPQUFZO1lBQ2pCLE1BQU0sS0FBSyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlELE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBVyxFQUFFLEtBQVUsRUFBRSxFQUFFLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQVcsRUFBRSxHQUFXO1lBQzVDLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQ25DLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFFRCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksYUFBYSxJQUFJLENB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