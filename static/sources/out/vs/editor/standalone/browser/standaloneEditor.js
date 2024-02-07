/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/window", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/browser/config/fontMeasurements", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/services/webWorker", "vs/editor/common/config/editorOptions", "vs/editor/common/config/editorZoom", "vs/editor/common/config/fontInfo", "vs/editor/common/editorCommon", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/common/model", "vs/editor/common/services/model", "vs/editor/common/standalone/standaloneEnums", "vs/editor/standalone/browser/colorizer", "vs/editor/standalone/browser/standaloneCodeEditor", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/standaloneTheme", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/markers/common/markers", "vs/platform/opener/common/opener", "vs/editor/browser/widget/multiDiffEditorWidget/multiDiffEditorWidget", "vs/css!./standalone-tokens"], function (require, exports, window_1, lifecycle_1, strings_1, uri_1, fontMeasurements_1, editorExtensions_1, codeEditorService_1, webWorker_1, editorOptions_1, editorZoom_1, fontInfo_1, editorCommon_1, languages, language_1, languageConfigurationRegistry_1, modesRegistry_1, nullTokenize_1, model_1, model_2, standaloneEnums, colorizer_1, standaloneCodeEditor_1, standaloneServices_1, standaloneTheme_1, actions_1, commands_1, contextkey_1, keybinding_1, markers_1, opener_1, multiDiffEditorWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMonacoEditorAPI = exports.registerEditorOpener = exports.registerLinkOpener = exports.registerCommand = exports.remeasureFonts = exports.setTheme = exports.defineTheme = exports.tokenize = exports.colorizeModelLine = exports.colorize = exports.colorizeElement = exports.createWebWorker = exports.onDidChangeModelLanguage = exports.onWillDisposeModel = exports.onDidCreateModel = exports.getModels = exports.getModel = exports.onDidChangeMarkers = exports.getModelMarkers = exports.removeAllMarkers = exports.setModelMarkers = exports.setModelLanguage = exports.createModel = exports.addKeybindingRules = exports.addKeybindingRule = exports.addEditorAction = exports.addCommand = exports.createMultiFileDiffEditor = exports.createDiffEditor = exports.getDiffEditors = exports.getEditors = exports.onDidCreateDiffEditor = exports.onDidCreateEditor = exports.create = void 0;
    /**
     * Create a new editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    function create(domElement, options, override) {
        const instantiationService = standaloneServices_1.StandaloneServices.initialize(override || {});
        return instantiationService.createInstance(standaloneCodeEditor_1.StandaloneEditor, domElement, options);
    }
    exports.create = create;
    /**
     * Emitted when an editor is created.
     * Creating a diff editor might cause this listener to be invoked with the two editors.
     * @event
     */
    function onDidCreateEditor(listener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.onCodeEditorAdd((editor) => {
            listener(editor);
        });
    }
    exports.onDidCreateEditor = onDidCreateEditor;
    /**
     * Emitted when an diff editor is created.
     * @event
     */
    function onDidCreateDiffEditor(listener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.onDiffEditorAdd((editor) => {
            listener(editor);
        });
    }
    exports.onDidCreateDiffEditor = onDidCreateDiffEditor;
    /**
     * Get all the created editors.
     */
    function getEditors() {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.listCodeEditors();
    }
    exports.getEditors = getEditors;
    /**
     * Get all the created diff editors.
     */
    function getDiffEditors() {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.listDiffEditors();
    }
    exports.getDiffEditors = getDiffEditors;
    /**
     * Create a new diff editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    function createDiffEditor(domElement, options, override) {
        const instantiationService = standaloneServices_1.StandaloneServices.initialize(override || {});
        return instantiationService.createInstance(standaloneCodeEditor_1.StandaloneDiffEditor2, domElement, options);
    }
    exports.createDiffEditor = createDiffEditor;
    function createMultiFileDiffEditor(domElement, override) {
        const instantiationService = standaloneServices_1.StandaloneServices.initialize(override || {});
        return new multiDiffEditorWidget_1.MultiDiffEditorWidget(domElement, {}, instantiationService);
    }
    exports.createMultiFileDiffEditor = createMultiFileDiffEditor;
    /**
     * Add a command.
     */
    function addCommand(descriptor) {
        if ((typeof descriptor.id !== 'string') || (typeof descriptor.run !== 'function')) {
            throw new Error('Invalid command descriptor, `id` and `run` are required properties!');
        }
        return commands_1.CommandsRegistry.registerCommand(descriptor.id, descriptor.run);
    }
    exports.addCommand = addCommand;
    /**
     * Add an action to all editors.
     */
    function addEditorAction(descriptor) {
        if ((typeof descriptor.id !== 'string') || (typeof descriptor.label !== 'string') || (typeof descriptor.run !== 'function')) {
            throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
        }
        const precondition = contextkey_1.ContextKeyExpr.deserialize(descriptor.precondition);
        const run = (accessor, ...args) => {
            return editorExtensions_1.EditorCommand.runEditorCommand(accessor, args, precondition, (accessor, editor, args) => Promise.resolve(descriptor.run(editor, ...args)));
        };
        const toDispose = new lifecycle_1.DisposableStore();
        // Register the command
        toDispose.add(commands_1.CommandsRegistry.registerCommand(descriptor.id, run));
        // Register the context menu item
        if (descriptor.contextMenuGroupId) {
            const menuItem = {
                command: {
                    id: descriptor.id,
                    title: descriptor.label
                },
                when: precondition,
                group: descriptor.contextMenuGroupId,
                order: descriptor.contextMenuOrder || 0
            };
            toDispose.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem));
        }
        // Register the keybindings
        if (Array.isArray(descriptor.keybindings)) {
            const keybindingService = standaloneServices_1.StandaloneServices.get(keybinding_1.IKeybindingService);
            if (!(keybindingService instanceof standaloneServices_1.StandaloneKeybindingService)) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
            }
            else {
                const keybindingsWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(descriptor.keybindingContext));
                toDispose.add(keybindingService.addDynamicKeybindings(descriptor.keybindings.map((keybinding) => {
                    return {
                        keybinding,
                        command: descriptor.id,
                        when: keybindingsWhen
                    };
                })));
            }
        }
        return toDispose;
    }
    exports.addEditorAction = addEditorAction;
    /**
     * Add a keybinding rule.
     */
    function addKeybindingRule(rule) {
        return addKeybindingRules([rule]);
    }
    exports.addKeybindingRule = addKeybindingRule;
    /**
     * Add keybinding rules.
     */
    function addKeybindingRules(rules) {
        const keybindingService = standaloneServices_1.StandaloneServices.get(keybinding_1.IKeybindingService);
        if (!(keybindingService instanceof standaloneServices_1.StandaloneKeybindingService)) {
            console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
            return lifecycle_1.Disposable.None;
        }
        return keybindingService.addDynamicKeybindings(rules.map((rule) => {
            return {
                keybinding: rule.keybinding,
                command: rule.command,
                commandArgs: rule.commandArgs,
                when: contextkey_1.ContextKeyExpr.deserialize(rule.when),
            };
        }));
    }
    exports.addKeybindingRules = addKeybindingRules;
    /**
     * Create a new editor model.
     * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
     */
    function createModel(value, language, uri) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const languageId = languageService.getLanguageIdByMimeType(language) || language;
        return (0, standaloneCodeEditor_1.createTextModel)(standaloneServices_1.StandaloneServices.get(model_2.IModelService), languageService, value, languageId, uri);
    }
    exports.createModel = createModel;
    /**
     * Change the language for a model.
     */
    function setModelLanguage(model, mimeTypeOrLanguageId) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const languageId = languageService.getLanguageIdByMimeType(mimeTypeOrLanguageId) || mimeTypeOrLanguageId || modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
        model.setLanguage(languageService.createById(languageId));
    }
    exports.setModelLanguage = setModelLanguage;
    /**
     * Set the markers for a model.
     */
    function setModelMarkers(model, owner, markers) {
        if (model) {
            const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
            markerService.changeOne(owner, model.uri, markers);
        }
    }
    exports.setModelMarkers = setModelMarkers;
    /**
     * Remove all markers of an owner.
     */
    function removeAllMarkers(owner) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
        markerService.changeAll(owner, []);
    }
    exports.removeAllMarkers = removeAllMarkers;
    /**
     * Get markers for owner and/or resource
     *
     * @returns list of markers
     */
    function getModelMarkers(filter) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
        return markerService.read(filter);
    }
    exports.getModelMarkers = getModelMarkers;
    /**
     * Emitted when markers change for a model.
     * @event
     */
    function onDidChangeMarkers(listener) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
        return markerService.onMarkerChanged(listener);
    }
    exports.onDidChangeMarkers = onDidChangeMarkers;
    /**
     * Get the model that has `uri` if it exists.
     */
    function getModel(uri) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.getModel(uri);
    }
    exports.getModel = getModel;
    /**
     * Get all the created models.
     */
    function getModels() {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.getModels();
    }
    exports.getModels = getModels;
    /**
     * Emitted when a model is created.
     * @event
     */
    function onDidCreateModel(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.onModelAdded(listener);
    }
    exports.onDidCreateModel = onDidCreateModel;
    /**
     * Emitted right before a model is disposed.
     * @event
     */
    function onWillDisposeModel(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.onModelRemoved(listener);
    }
    exports.onWillDisposeModel = onWillDisposeModel;
    /**
     * Emitted when a different language is set to a model.
     * @event
     */
    function onDidChangeModelLanguage(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.onModelLanguageChanged((e) => {
            listener({
                model: e.model,
                oldLanguage: e.oldLanguageId
            });
        });
    }
    exports.onDidChangeModelLanguage = onDidChangeModelLanguage;
    /**
     * Create a new web worker that has model syncing capabilities built in.
     * Specify an AMD module to load that will `create` an object that will be proxied.
     */
    function createWebWorker(opts) {
        return (0, webWorker_1.createWebWorker)(standaloneServices_1.StandaloneServices.get(model_2.IModelService), standaloneServices_1.StandaloneServices.get(languageConfigurationRegistry_1.ILanguageConfigurationService), opts);
    }
    exports.createWebWorker = createWebWorker;
    /**
     * Colorize the contents of `domNode` using attribute `data-lang`.
     */
    function colorizeElement(domNode, options) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        return colorizer_1.Colorizer.colorizeElement(themeService, languageService, domNode, options).then(() => {
            themeService.registerEditorContainer(domNode);
        });
    }
    exports.colorizeElement = colorizeElement;
    /**
     * Colorize `text` using language `languageId`.
     */
    function colorize(text, languageId, options) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        themeService.registerEditorContainer(window_1.mainWindow.document.body);
        return colorizer_1.Colorizer.colorize(languageService, text, languageId, options);
    }
    exports.colorize = colorize;
    /**
     * Colorize a line in a model.
     */
    function colorizeModelLine(model, lineNumber, tabSize = 4) {
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        themeService.registerEditorContainer(window_1.mainWindow.document.body);
        return colorizer_1.Colorizer.colorizeModelLine(model, lineNumber, tabSize);
    }
    exports.colorizeModelLine = colorizeModelLine;
    /**
     * @internal
     */
    function getSafeTokenizationSupport(language) {
        const tokenizationSupport = languages.TokenizationRegistry.get(language);
        if (tokenizationSupport) {
            return tokenizationSupport;
        }
        return {
            getInitialState: () => nullTokenize_1.NullState,
            tokenize: (line, hasEOL, state) => (0, nullTokenize_1.nullTokenize)(language, state)
        };
    }
    /**
     * Tokenize `text` using language `languageId`
     */
    function tokenize(text, languageId) {
        // Needed in order to get the mode registered for subsequent look-ups
        languages.TokenizationRegistry.getOrCreate(languageId);
        const tokenizationSupport = getSafeTokenizationSupport(languageId);
        const lines = (0, strings_1.splitLines)(text);
        const result = [];
        let state = tokenizationSupport.getInitialState();
        for (let i = 0, len = lines.length; i < len; i++) {
            const line = lines[i];
            const tokenizationResult = tokenizationSupport.tokenize(line, true, state);
            result[i] = tokenizationResult.tokens;
            state = tokenizationResult.endState;
        }
        return result;
    }
    exports.tokenize = tokenize;
    /**
     * Define a new theme or update an existing theme.
     */
    function defineTheme(themeName, themeData) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        standaloneThemeService.defineTheme(themeName, themeData);
    }
    exports.defineTheme = defineTheme;
    /**
     * Switches to a theme.
     */
    function setTheme(themeName) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        standaloneThemeService.setTheme(themeName);
    }
    exports.setTheme = setTheme;
    /**
     * Clears all cached font measurements and triggers re-measurement.
     */
    function remeasureFonts() {
        fontMeasurements_1.FontMeasurements.clearAllFontInfos();
    }
    exports.remeasureFonts = remeasureFonts;
    /**
     * Register a command.
     */
    function registerCommand(id, handler) {
        return commands_1.CommandsRegistry.registerCommand({ id, handler });
    }
    exports.registerCommand = registerCommand;
    /**
     * Registers a handler that is called when a link is opened in any editor. The handler callback should return `true` if the link was handled and `false` otherwise.
     * The handler that was registered last will be called first when a link is opened.
     *
     * Returns a disposable that can unregister the opener again.
     */
    function registerLinkOpener(opener) {
        const openerService = standaloneServices_1.StandaloneServices.get(opener_1.IOpenerService);
        return openerService.registerOpener({
            async open(resource) {
                if (typeof resource === 'string') {
                    resource = uri_1.URI.parse(resource);
                }
                return opener.open(resource);
            }
        });
    }
    exports.registerLinkOpener = registerLinkOpener;
    /**
     * Registers a handler that is called when a resource other than the current model should be opened in the editor (e.g. "go to definition").
     * The handler callback should return `true` if the request was handled and `false` otherwise.
     *
     * Returns a disposable that can unregister the opener again.
     *
     * If no handler is registered the default behavior is to do nothing for models other than the currently attached one.
     */
    function registerEditorOpener(opener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.registerCodeEditorOpenHandler(async (input, source, sideBySide) => {
            if (!source) {
                return null;
            }
            const selection = input.options?.selection;
            let selectionOrPosition;
            if (selection && typeof selection.endLineNumber === 'number' && typeof selection.endColumn === 'number') {
                selectionOrPosition = selection;
            }
            else if (selection) {
                selectionOrPosition = { lineNumber: selection.startLineNumber, column: selection.startColumn };
            }
            if (await opener.openCodeEditor(source, input.resource, selectionOrPosition)) {
                return source; // return source editor to indicate that this handler has successfully handled the opening
            }
            return null; // fallback to other registered handlers
        });
    }
    exports.registerEditorOpener = registerEditorOpener;
    /**
     * @internal
     */
    function createMonacoEditorAPI() {
        return {
            // methods
            create: create,
            getEditors: getEditors,
            getDiffEditors: getDiffEditors,
            onDidCreateEditor: onDidCreateEditor,
            onDidCreateDiffEditor: onDidCreateDiffEditor,
            createDiffEditor: createDiffEditor,
            addCommand: addCommand,
            addEditorAction: addEditorAction,
            addKeybindingRule: addKeybindingRule,
            addKeybindingRules: addKeybindingRules,
            createModel: createModel,
            setModelLanguage: setModelLanguage,
            setModelMarkers: setModelMarkers,
            getModelMarkers: getModelMarkers,
            removeAllMarkers: removeAllMarkers,
            onDidChangeMarkers: onDidChangeMarkers,
            getModels: getModels,
            getModel: getModel,
            onDidCreateModel: onDidCreateModel,
            onWillDisposeModel: onWillDisposeModel,
            onDidChangeModelLanguage: onDidChangeModelLanguage,
            createWebWorker: createWebWorker,
            colorizeElement: colorizeElement,
            colorize: colorize,
            colorizeModelLine: colorizeModelLine,
            tokenize: tokenize,
            defineTheme: defineTheme,
            setTheme: setTheme,
            remeasureFonts: remeasureFonts,
            registerCommand: registerCommand,
            registerLinkOpener: registerLinkOpener,
            registerEditorOpener: registerEditorOpener,
            // enums
            AccessibilitySupport: standaloneEnums.AccessibilitySupport,
            ContentWidgetPositionPreference: standaloneEnums.ContentWidgetPositionPreference,
            CursorChangeReason: standaloneEnums.CursorChangeReason,
            DefaultEndOfLine: standaloneEnums.DefaultEndOfLine,
            EditorAutoIndentStrategy: standaloneEnums.EditorAutoIndentStrategy,
            EditorOption: standaloneEnums.EditorOption,
            EndOfLinePreference: standaloneEnums.EndOfLinePreference,
            EndOfLineSequence: standaloneEnums.EndOfLineSequence,
            MinimapPosition: standaloneEnums.MinimapPosition,
            MouseTargetType: standaloneEnums.MouseTargetType,
            OverlayWidgetPositionPreference: standaloneEnums.OverlayWidgetPositionPreference,
            OverviewRulerLane: standaloneEnums.OverviewRulerLane,
            GlyphMarginLane: standaloneEnums.GlyphMarginLane,
            RenderLineNumbersType: standaloneEnums.RenderLineNumbersType,
            RenderMinimap: standaloneEnums.RenderMinimap,
            ScrollbarVisibility: standaloneEnums.ScrollbarVisibility,
            ScrollType: standaloneEnums.ScrollType,
            TextEditorCursorBlinkingStyle: standaloneEnums.TextEditorCursorBlinkingStyle,
            TextEditorCursorStyle: standaloneEnums.TextEditorCursorStyle,
            TrackedRangeStickiness: standaloneEnums.TrackedRangeStickiness,
            WrappingIndent: standaloneEnums.WrappingIndent,
            InjectedTextCursorStops: standaloneEnums.InjectedTextCursorStops,
            PositionAffinity: standaloneEnums.PositionAffinity,
            ShowLightbulbIconMode: standaloneEnums.ShowLightbulbIconMode,
            // classes
            ConfigurationChangedEvent: editorOptions_1.ConfigurationChangedEvent,
            BareFontInfo: fontInfo_1.BareFontInfo,
            FontInfo: fontInfo_1.FontInfo,
            TextModelResolvedOptions: model_1.TextModelResolvedOptions,
            FindMatch: model_1.FindMatch,
            ApplyUpdateResult: editorOptions_1.ApplyUpdateResult,
            EditorZoom: editorZoom_1.EditorZoom,
            createMultiFileDiffEditor: createMultiFileDiffEditor,
            // vars
            EditorType: editorCommon_1.EditorType,
            EditorOptions: editorOptions_1.EditorOptions
        };
    }
    exports.createMonacoEditorAPI = createMonacoEditorAPI;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci9zdGFuZGFsb25lRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdDaEc7Ozs7T0FJRztJQUNILFNBQWdCLE1BQU0sQ0FBQyxVQUF1QixFQUFFLE9BQThDLEVBQUUsUUFBa0M7UUFDakksTUFBTSxvQkFBb0IsR0FBRyx1Q0FBa0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVDQUFnQixFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBSEQsd0JBR0M7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsUUFBMkM7UUFDNUUsTUFBTSxpQkFBaUIsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQztRQUNyRSxPQUFPLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ25ELFFBQVEsQ0FBYyxNQUFNLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFMRCw4Q0FLQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLHFCQUFxQixDQUFDLFFBQTJDO1FBQ2hGLE1BQU0saUJBQWlCLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUM7UUFDckUsT0FBTyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNuRCxRQUFRLENBQWMsTUFBTSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBTEQsc0RBS0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLFVBQVU7UUFDekIsTUFBTSxpQkFBaUIsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQztRQUNyRSxPQUFPLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFIRCxnQ0FHQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsY0FBYztRQUM3QixNQUFNLGlCQUFpQixHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8saUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUhELHdDQUdDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLFVBQXVCLEVBQUUsT0FBa0QsRUFBRSxRQUFrQztRQUMvSSxNQUFNLG9CQUFvQixHQUFHLHVDQUFrQixDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7UUFDM0UsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNENBQXFCLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFIRCw0Q0FHQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLFVBQXVCLEVBQUUsUUFBa0M7UUFDcEcsTUFBTSxvQkFBb0IsR0FBRyx1Q0FBa0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLE9BQU8sSUFBSSw2Q0FBcUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUhELDhEQUdDO0lBZ0JEOztPQUVHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLFVBQThCO1FBQ3hELElBQUksQ0FBQyxPQUFPLFVBQVUsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLFVBQVUsQ0FBQyxHQUFHLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUNuRixNQUFNLElBQUksS0FBSyxDQUFDLHFFQUFxRSxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUNELE9BQU8sMkJBQWdCLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFMRCxnQ0FLQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFDLFVBQTZCO1FBQzVELElBQUksQ0FBQyxPQUFPLFVBQVUsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLFVBQVUsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLFVBQVUsQ0FBQyxHQUFHLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3SCxNQUFNLElBQUksS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLDJCQUFjLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RSxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXLEVBQXdCLEVBQUU7WUFDaEYsT0FBTyxnQ0FBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkosQ0FBQyxDQUFDO1FBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFeEMsdUJBQXVCO1FBQ3ZCLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVwRSxpQ0FBaUM7UUFDakMsSUFBSSxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNuQyxNQUFNLFFBQVEsR0FBYztnQkFDM0IsT0FBTyxFQUFFO29CQUNSLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTtvQkFDakIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLO2lCQUN2QjtnQkFDRCxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7Z0JBQ3BDLEtBQUssRUFBRSxVQUFVLENBQUMsZ0JBQWdCLElBQUksQ0FBQzthQUN2QyxDQUFDO1lBQ0YsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCwyQkFBMkI7UUFDM0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQzNDLE1BQU0saUJBQWlCLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLENBQUMsaUJBQWlCLFlBQVksZ0RBQTJCLENBQUMsRUFBRSxDQUFDO2dCQUNqRSxPQUFPLENBQUMsSUFBSSxDQUFDLCtGQUErRixDQUFDLENBQUM7WUFDL0csQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sZUFBZSxHQUFHLDJCQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSwyQkFBYyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNuSCxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQy9GLE9BQU87d0JBQ04sVUFBVTt3QkFDVixPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ3RCLElBQUksRUFBRSxlQUFlO3FCQUNyQixDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNOLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQS9DRCwwQ0ErQ0M7SUFZRDs7T0FFRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLElBQXFCO1FBQ3RELE9BQU8sa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFGRCw4Q0FFQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsS0FBd0I7UUFDMUQsTUFBTSxpQkFBaUIsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsWUFBWSxnREFBMkIsQ0FBQyxFQUFFLENBQUM7WUFDakUsT0FBTyxDQUFDLElBQUksQ0FBQywrRkFBK0YsQ0FBQyxDQUFDO1lBQzlHLE9BQU8sc0JBQVUsQ0FBQyxJQUFJLENBQUM7UUFDeEIsQ0FBQztRQUVELE9BQU8saUJBQWlCLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2pFLE9BQU87Z0JBQ04sVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsSUFBSSxFQUFFLDJCQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDM0MsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBZkQsZ0RBZUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixXQUFXLENBQUMsS0FBYSxFQUFFLFFBQWlCLEVBQUUsR0FBUztRQUN0RSxNQUFNLGVBQWUsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztRQUNqRSxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDO1FBQ2pGLE9BQU8sSUFBQSxzQ0FBZSxFQUNyQix1Q0FBa0IsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxFQUNyQyxlQUFlLEVBQ2YsS0FBSyxFQUNMLFVBQVUsRUFDVixHQUFHLENBQ0gsQ0FBQztJQUNILENBQUM7SUFWRCxrQ0FVQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBaUIsRUFBRSxvQkFBNEI7UUFDL0UsTUFBTSxlQUFlLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7UUFDakUsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLHVCQUF1QixDQUFDLG9CQUFvQixDQUFDLElBQUksb0JBQW9CLElBQUkscUNBQXFCLENBQUM7UUFDbEksS0FBSyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUpELDRDQUlDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixlQUFlLENBQUMsS0FBaUIsRUFBRSxLQUFhLEVBQUUsT0FBc0I7UUFDdkYsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNYLE1BQU0sYUFBYSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7WUFDN0QsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO0lBQ0YsQ0FBQztJQUxELDBDQUtDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxLQUFhO1FBQzdDLE1BQU0sYUFBYSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7UUFDN0QsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUhELDRDQUdDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLGVBQWUsQ0FBQyxNQUF5RDtRQUN4RixNQUFNLGFBQWEsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxDQUFDO1FBQzdELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBSEQsMENBR0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxRQUFxQztRQUN2RSxNQUFNLGFBQWEsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxDQUFDO1FBQzdELE9BQU8sYUFBYSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBSEQsZ0RBR0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLFFBQVEsQ0FBQyxHQUFRO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDM0QsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFIRCw0QkFHQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsU0FBUztRQUN4QixNQUFNLFlBQVksR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQzNELE9BQU8sWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFIRCw4QkFHQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLFFBQXFDO1FBQ3JFLE1BQU0sWUFBWSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDM0QsT0FBTyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFIRCw0Q0FHQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGtCQUFrQixDQUFDLFFBQXFDO1FBQ3ZFLE1BQU0sWUFBWSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDM0QsT0FBTyxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFIRCxnREFHQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLHdCQUF3QixDQUFDLFFBQW1GO1FBQzNILE1BQU0sWUFBWSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDM0QsT0FBTyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoRCxRQUFRLENBQUM7Z0JBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO2dCQUNkLFdBQVcsRUFBRSxDQUFDLENBQUMsYUFBYTthQUM1QixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFSRCw0REFRQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGVBQWUsQ0FBbUIsSUFBdUI7UUFDeEUsT0FBTyxJQUFBLDJCQUFxQixFQUFJLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLEVBQUUsdUNBQWtCLENBQUMsR0FBRyxDQUFDLDZEQUE2QixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckksQ0FBQztJQUZELDBDQUVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixlQUFlLENBQUMsT0FBb0IsRUFBRSxPQUFpQztRQUN0RixNQUFNLGVBQWUsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztRQUNqRSxNQUFNLFlBQVksR0FBMkIsdUNBQWtCLENBQUMsR0FBRyxDQUFDLHlDQUF1QixDQUFDLENBQUM7UUFDN0YsT0FBTyxxQkFBUyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQzNGLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFORCwwQ0FNQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUFDLElBQVksRUFBRSxVQUFrQixFQUFFLE9BQTBCO1FBQ3BGLE1BQU0sZUFBZSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sWUFBWSxHQUEyQix1Q0FBa0IsQ0FBQyxHQUFHLENBQUMseUNBQXVCLENBQUMsQ0FBQztRQUM3RixZQUFZLENBQUMsdUJBQXVCLENBQUMsbUJBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsT0FBTyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBTEQsNEJBS0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLEtBQWlCLEVBQUUsVUFBa0IsRUFBRSxVQUFrQixDQUFDO1FBQzNGLE1BQU0sWUFBWSxHQUEyQix1Q0FBa0IsQ0FBQyxHQUFHLENBQUMseUNBQXVCLENBQUMsQ0FBQztRQUM3RixZQUFZLENBQUMsdUJBQXVCLENBQUMsbUJBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsT0FBTyxxQkFBUyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUpELDhDQUlDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLDBCQUEwQixDQUFDLFFBQWdCO1FBQ25ELE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RSxJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDekIsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBQ0QsT0FBTztZQUNOLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyx3QkFBUztZQUNoQyxRQUFRLEVBQUUsQ0FBQyxJQUFZLEVBQUUsTUFBZSxFQUFFLEtBQXVCLEVBQUUsRUFBRSxDQUFDLElBQUEsMkJBQVksRUFBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO1NBQ25HLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixRQUFRLENBQUMsSUFBWSxFQUFFLFVBQWtCO1FBQ3hELHFFQUFxRTtRQUNyRSxTQUFTLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXZELE1BQU0sbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkUsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sTUFBTSxHQUF3QixFQUFFLENBQUM7UUFDdkMsSUFBSSxLQUFLLEdBQUcsbUJBQW1CLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTNFLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7WUFDdEMsS0FBSyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBaEJELDRCQWdCQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLFNBQWlCLEVBQUUsU0FBK0I7UUFDN0UsTUFBTSxzQkFBc0IsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMseUNBQXVCLENBQUMsQ0FBQztRQUMvRSxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFIRCxrQ0FHQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUFDLFNBQWlCO1FBQ3pDLE1BQU0sc0JBQXNCLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLHlDQUF1QixDQUFDLENBQUM7UUFDL0Usc0JBQXNCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFIRCw0QkFHQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsY0FBYztRQUM3QixtQ0FBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFGRCx3Q0FFQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFDLEVBQVUsRUFBRSxPQUFnRDtRQUMzRixPQUFPLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFGRCwwQ0FFQztJQU1EOzs7OztPQUtHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsTUFBbUI7UUFDckQsTUFBTSxhQUFhLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLHVCQUFjLENBQUMsQ0FBQztRQUM3RCxPQUFPLGFBQWEsQ0FBQyxjQUFjLENBQUM7WUFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFzQjtnQkFDaEMsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDbEMsUUFBUSxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBVkQsZ0RBVUM7SUFpQkQ7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLG9CQUFvQixDQUFDLE1BQXlCO1FBQzdELE1BQU0saUJBQWlCLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUM7UUFDckUsT0FBTyxpQkFBaUIsQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsS0FBK0IsRUFBRSxNQUEwQixFQUFFLFVBQW9CLEVBQUUsRUFBRTtZQUNsSixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBQ0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7WUFDM0MsSUFBSSxtQkFBbUQsQ0FBQztZQUN4RCxJQUFJLFNBQVMsSUFBSSxPQUFPLFNBQVMsQ0FBQyxhQUFhLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDekcsbUJBQW1CLEdBQVcsU0FBUyxDQUFDO1lBQ3pDLENBQUM7aUJBQU0sSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDdEIsbUJBQW1CLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hHLENBQUM7WUFDRCxJQUFJLE1BQU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7Z0JBQzlFLE9BQU8sTUFBTSxDQUFDLENBQUMsMEZBQTBGO1lBQzFHLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDLHdDQUF3QztRQUN0RCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFsQkQsb0RBa0JDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixxQkFBcUI7UUFDcEMsT0FBTztZQUNOLFVBQVU7WUFDVixNQUFNLEVBQU8sTUFBTTtZQUNuQixVQUFVLEVBQU8sVUFBVTtZQUMzQixjQUFjLEVBQU8sY0FBYztZQUNuQyxpQkFBaUIsRUFBTyxpQkFBaUI7WUFDekMscUJBQXFCLEVBQU8scUJBQXFCO1lBQ2pELGdCQUFnQixFQUFPLGdCQUFnQjtZQUV2QyxVQUFVLEVBQU8sVUFBVTtZQUMzQixlQUFlLEVBQU8sZUFBZTtZQUNyQyxpQkFBaUIsRUFBTyxpQkFBaUI7WUFDekMsa0JBQWtCLEVBQU8sa0JBQWtCO1lBRTNDLFdBQVcsRUFBTyxXQUFXO1lBQzdCLGdCQUFnQixFQUFPLGdCQUFnQjtZQUN2QyxlQUFlLEVBQU8sZUFBZTtZQUNyQyxlQUFlLEVBQU8sZUFBZTtZQUNyQyxnQkFBZ0IsRUFBRSxnQkFBZ0I7WUFDbEMsa0JBQWtCLEVBQU8sa0JBQWtCO1lBQzNDLFNBQVMsRUFBTyxTQUFTO1lBQ3pCLFFBQVEsRUFBTyxRQUFRO1lBQ3ZCLGdCQUFnQixFQUFPLGdCQUFnQjtZQUN2QyxrQkFBa0IsRUFBTyxrQkFBa0I7WUFDM0Msd0JBQXdCLEVBQU8sd0JBQXdCO1lBR3ZELGVBQWUsRUFBTyxlQUFlO1lBQ3JDLGVBQWUsRUFBTyxlQUFlO1lBQ3JDLFFBQVEsRUFBTyxRQUFRO1lBQ3ZCLGlCQUFpQixFQUFPLGlCQUFpQjtZQUN6QyxRQUFRLEVBQU8sUUFBUTtZQUN2QixXQUFXLEVBQU8sV0FBVztZQUM3QixRQUFRLEVBQU8sUUFBUTtZQUN2QixjQUFjLEVBQUUsY0FBYztZQUM5QixlQUFlLEVBQUUsZUFBZTtZQUVoQyxrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsb0JBQW9CLEVBQU8sb0JBQW9CO1lBRS9DLFFBQVE7WUFDUixvQkFBb0IsRUFBRSxlQUFlLENBQUMsb0JBQW9CO1lBQzFELCtCQUErQixFQUFFLGVBQWUsQ0FBQywrQkFBK0I7WUFDaEYsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLGtCQUFrQjtZQUN0RCxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsZ0JBQWdCO1lBQ2xELHdCQUF3QixFQUFFLGVBQWUsQ0FBQyx3QkFBd0I7WUFDbEUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxZQUFZO1lBQzFDLG1CQUFtQixFQUFFLGVBQWUsQ0FBQyxtQkFBbUI7WUFDeEQsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLGlCQUFpQjtZQUNwRCxlQUFlLEVBQUUsZUFBZSxDQUFDLGVBQWU7WUFDaEQsZUFBZSxFQUFFLGVBQWUsQ0FBQyxlQUFlO1lBQ2hELCtCQUErQixFQUFFLGVBQWUsQ0FBQywrQkFBK0I7WUFDaEYsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLGlCQUFpQjtZQUNwRCxlQUFlLEVBQUUsZUFBZSxDQUFDLGVBQWU7WUFDaEQscUJBQXFCLEVBQUUsZUFBZSxDQUFDLHFCQUFxQjtZQUM1RCxhQUFhLEVBQUUsZUFBZSxDQUFDLGFBQWE7WUFDNUMsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLG1CQUFtQjtZQUN4RCxVQUFVLEVBQUUsZUFBZSxDQUFDLFVBQVU7WUFDdEMsNkJBQTZCLEVBQUUsZUFBZSxDQUFDLDZCQUE2QjtZQUM1RSxxQkFBcUIsRUFBRSxlQUFlLENBQUMscUJBQXFCO1lBQzVELHNCQUFzQixFQUFFLGVBQWUsQ0FBQyxzQkFBc0I7WUFDOUQsY0FBYyxFQUFFLGVBQWUsQ0FBQyxjQUFjO1lBQzlDLHVCQUF1QixFQUFFLGVBQWUsQ0FBQyx1QkFBdUI7WUFDaEUsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLGdCQUFnQjtZQUNsRCxxQkFBcUIsRUFBRSxlQUFlLENBQUMscUJBQXFCO1lBRTVELFVBQVU7WUFDVix5QkFBeUIsRUFBTyx5Q0FBeUI7WUFDekQsWUFBWSxFQUFPLHVCQUFZO1lBQy9CLFFBQVEsRUFBTyxtQkFBUTtZQUN2Qix3QkFBd0IsRUFBTyxnQ0FBd0I7WUFDdkQsU0FBUyxFQUFPLGlCQUFTO1lBQ3pCLGlCQUFpQixFQUFPLGlDQUFpQjtZQUN6QyxVQUFVLEVBQU8sdUJBQVU7WUFFM0IseUJBQXlCLEVBQU8seUJBQXlCO1lBRXpELE9BQU87WUFDUCxVQUFVLEVBQUUseUJBQVU7WUFDdEIsYUFBYSxFQUFPLDZCQUFhO1NBRWpDLENBQUM7SUFDSCxDQUFDO0lBbkZELHNEQW1GQyJ9