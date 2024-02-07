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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/splitview/splitview", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/iterator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/resolverService", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/browser/floatingMenu", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/editor/editorModel", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/terminal/browser/detachedTerminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/theme", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testCoverageService", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testingUri", "vs/workbench/services/editor/common/editorService", "vs/css!./testingOutputPeek"], function (require, exports, dom, markdownRenderer_1, actionbar_1, aria_1, iconLabels_1, scrollableElement_1, splitview_1, actions_1, async_1, codicons_1, color_1, event_1, iconLabels_2, iterator_1, lazy_1, lifecycle_1, observable_1, strings_1, themables_1, types_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, diffEditorWidget_1, embeddedCodeEditorWidget_1, range_1, editorContextKeys_1, resolverService_1, markdownRenderer_2, peekView_1, nls_1, actionCommonCategories_1, floatingMenu_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, notification_1, opener_1, progress_1, storage_1, telemetry_1, terminalCapabilityStore_1, terminalStrings_1, colorRegistry_1, iconRegistry_1, themeService_1, workspace_1, viewPane_1, editorModel_1, theme_1, views_1, viewsService_1, detachedTerminal_1, terminal_1, xtermTerminal_1, terminalColorRegistry_1, testItemContextOverlay_1, icons, theme_2, configuration_2, observableValue_1, storedValue_1, testCoverageService_1, testExplorerFilterState_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testTypes_1, testingContextKeys_1, testingPeekOpener_1, testingStates_1, testingUri_1, editorService_1) {
    "use strict";
    var TestingOutputPeekController_1, TestResultsViewContent_1, TestResultsPeek_1, TestRunElementRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleTestingPeekHistory = exports.OpenMessageInEditorAction = exports.GoToPreviousMessageAction = exports.GoToNextMessageAction = exports.CloseTestPeek = exports.TestResultsView = exports.TestingOutputPeekController = exports.TestingPeekOpener = void 0;
    class MessageSubject {
        get isDiffable() {
            return this.message.type === 0 /* TestMessageType.Error */ && isDiffable(this.message);
        }
        get contextValue() {
            return this.message.type === 0 /* TestMessageType.Error */ ? this.message.contextValue : undefined;
        }
        get context() {
            return {
                $mid: 18 /* MarshalledId.TestMessageMenuArgs */,
                extId: this.test.extId,
                message: testTypes_1.ITestMessage.serialize(this.message),
            };
        }
        constructor(result, test, taskIndex, messageIndex) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.messageIndex = messageIndex;
            this.test = test.item;
            const messages = test.tasks[taskIndex].messages;
            this.messageIndex = messageIndex;
            const parts = { messageIndex, resultId: result.id, taskIndex, testExtId: test.item.extId };
            this.expectedUri = (0, testingUri_1.buildTestUri)({ ...parts, type: 4 /* TestUriType.ResultExpectedOutput */ });
            this.actualUri = (0, testingUri_1.buildTestUri)({ ...parts, type: 3 /* TestUriType.ResultActualOutput */ });
            this.messageUri = (0, testingUri_1.buildTestUri)({ ...parts, type: 2 /* TestUriType.ResultMessage */ });
            const message = this.message = messages[this.messageIndex];
            this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: range_1.Range.lift(test.item.range) } : undefined);
        }
    }
    class TaskSubject {
        constructor(result, taskIndex) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.outputUri = (0, testingUri_1.buildTestUri)({ resultId: result.id, taskIndex, type: 0 /* TestUriType.TaskOutput */ });
        }
    }
    class TestOutputSubject {
        constructor(result, taskIndex, test) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.test = test;
            this.outputUri = (0, testingUri_1.buildTestUri)({ resultId: this.result.id, taskIndex: this.taskIndex, testExtId: this.test.item.extId, type: 1 /* TestUriType.TestOutput */ });
            this.task = result.tasks[this.taskIndex];
        }
    }
    const equalsSubject = (a, b) => ((a instanceof MessageSubject && b instanceof MessageSubject && a.message === b.message) ||
        (a instanceof TaskSubject && b instanceof TaskSubject && a.result === b.result && a.taskIndex === b.taskIndex) ||
        (a instanceof TestOutputSubject && b instanceof TestOutputSubject && a.test === b.test && a.taskIndex === b.taskIndex));
    /** Iterates through every message in every result */
    function* allMessages(results) {
        for (const result of results) {
            for (const test of result.tests) {
                for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
                    for (let messageIndex = 0; messageIndex < test.tasks[taskIndex].messages.length; messageIndex++) {
                        yield { result, test, taskIndex, messageIndex };
                    }
                }
            }
        }
    }
    let TestingPeekOpener = class TestingPeekOpener extends lifecycle_1.Disposable {
        constructor(configuration, editorService, codeEditorService, testResults, testService, storageService, viewsService, commandService, notificationService) {
            super();
            this.configuration = configuration;
            this.editorService = editorService;
            this.codeEditorService = codeEditorService;
            this.testResults = testResults;
            this.testService = testService;
            this.storageService = storageService;
            this.viewsService = viewsService;
            this.commandService = commandService;
            this.notificationService = notificationService;
            /** @inheritdoc */
            this.historyVisible = observableValue_1.MutableObservableValue.stored(this._register(new storedValue_1.StoredValue({
                key: 'testHistoryVisibleInPeek',
                scope: 0 /* StorageScope.PROFILE */,
                target: 0 /* StorageTarget.USER */,
            }, this.storageService)), false);
            this._register(testResults.onTestChanged(this.openPeekOnFailure, this));
        }
        /** @inheritdoc */
        async open() {
            let uri;
            const active = this.editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(active) && active.getModel()?.uri) {
                const modelUri = active.getModel()?.uri;
                if (modelUri) {
                    uri = await this.getFileCandidateMessage(modelUri, active.getPosition());
                }
            }
            if (!uri) {
                uri = this.lastUri;
            }
            if (!uri) {
                uri = this.getAnyCandidateMessage();
            }
            if (!uri) {
                return false;
            }
            return this.showPeekFromUri(uri);
        }
        /** @inheritdoc */
        tryPeekFirstError(result, test, options) {
            const candidate = this.getFailedCandidateMessage(test);
            if (!candidate) {
                return false;
            }
            this.showPeekFromUri({
                type: 2 /* TestUriType.ResultMessage */,
                documentUri: candidate.location.uri,
                taskIndex: candidate.taskId,
                messageIndex: candidate.index,
                resultId: result.id,
                testExtId: test.item.extId,
            }, undefined, { selection: candidate.location.range, selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */, ...options });
            return true;
        }
        /** @inheritdoc */
        peekUri(uri, options = {}) {
            const parsed = (0, testingUri_1.parseTestUri)(uri);
            const result = parsed && this.testResults.getResult(parsed.resultId);
            if (!parsed || !result || !('testExtId' in parsed)) {
                return false;
            }
            if (!('messageIndex' in parsed)) {
                return false;
            }
            const message = result.getStateById(parsed.testExtId)?.tasks[parsed.taskIndex].messages[parsed.messageIndex];
            if (!message?.location) {
                return false;
            }
            this.showPeekFromUri({
                type: 2 /* TestUriType.ResultMessage */,
                documentUri: message.location.uri,
                taskIndex: parsed.taskIndex,
                messageIndex: parsed.messageIndex,
                resultId: result.id,
                testExtId: parsed.testExtId,
            }, options.inEditor, { selection: message.location.range, ...options.options });
            return true;
        }
        /** @inheritdoc */
        closeAllPeeks() {
            for (const editor of this.codeEditorService.listCodeEditors()) {
                TestingOutputPeekController.get(editor)?.removePeek();
            }
        }
        openCurrentInEditor() {
            const current = this.getActiveControl();
            if (!current) {
                return;
            }
            const options = { pinned: false, revealIfOpened: true };
            if (current instanceof TaskSubject || current instanceof TestOutputSubject) {
                this.editorService.openEditor({ resource: current.outputUri, options });
                return;
            }
            if (current instanceof TestOutputSubject) {
                this.editorService.openEditor({ resource: current.outputUri, options });
                return;
            }
            const message = current.message;
            if (current.isDiffable) {
                this.editorService.openEditor({
                    original: { resource: current.expectedUri },
                    modified: { resource: current.actualUri },
                    options,
                });
            }
            else if (typeof message.message === 'string') {
                this.editorService.openEditor({ resource: current.messageUri, options });
            }
            else {
                this.commandService.executeCommand('markdown.showPreview', current.messageUri).catch(err => {
                    this.notificationService.error((0, nls_1.localize)('testing.markdownPeekError', 'Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.', err.message));
                });
            }
        }
        getActiveControl() {
            const editor = getPeekedEditorFromFocus(this.codeEditorService);
            const controller = editor && TestingOutputPeekController.get(editor);
            return controller?.subject ?? this.viewsService.getActiveViewWithId("workbench.panel.testResults.view" /* Testing.ResultsViewId */)?.subject;
        }
        /** @inheritdoc */
        async showPeekFromUri(uri, editor, options) {
            if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                this.lastUri = uri;
                TestingOutputPeekController.get(editor)?.show((0, testingUri_1.buildTestUri)(this.lastUri));
                return true;
            }
            const pane = await this.editorService.openEditor({
                resource: uri.documentUri,
                options: { revealIfOpened: true, ...options }
            });
            const control = pane?.getControl();
            if (!(0, editorBrowser_1.isCodeEditor)(control)) {
                return false;
            }
            this.lastUri = uri;
            TestingOutputPeekController.get(control)?.show((0, testingUri_1.buildTestUri)(this.lastUri));
            return true;
        }
        /**
         * Opens the peek view on a test failure, based on user preferences.
         */
        openPeekOnFailure(evt) {
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
                return;
            }
            const candidate = this.getFailedCandidateMessage(evt.item);
            if (!candidate) {
                return;
            }
            if (evt.result.request.continuous && !(0, configuration_2.getTestingConfiguration)(this.configuration, "testing.automaticallyOpenPeekViewDuringAutoRun" /* TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun */)) {
                return;
            }
            const editors = this.codeEditorService.listCodeEditors();
            const cfg = (0, configuration_2.getTestingConfiguration)(this.configuration, "testing.automaticallyOpenPeekView" /* TestingConfigKeys.AutoOpenPeekView */);
            // don't show the peek if the user asked to only auto-open peeks for visible tests,
            // and this test is not in any of the editors' models.
            switch (cfg) {
                case "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */: {
                    const editorUris = new Set(editors.map(e => e.getModel()?.uri.toString()));
                    if (!iterator_1.Iterable.some((0, testResult_1.resultItemParents)(evt.result, evt.item), i => i.item.uri && editorUris.has(i.item.uri.toString()))) {
                        return;
                    }
                    break; //continue
                }
                case "failureAnywhere" /* AutoOpenPeekViewWhen.FailureAnywhere */:
                    break; //continue
                default:
                    return; // never show
            }
            const controllers = editors.map(TestingOutputPeekController.get);
            if (controllers.some(c => c?.subject)) {
                return;
            }
            this.tryPeekFirstError(evt.result, evt.item);
        }
        /**
         * Gets the message closest to the given position from a test in the file.
         */
        async getFileCandidateMessage(uri, position) {
            let best;
            let bestDistance = Infinity;
            // Get all tests for the document. In those, find one that has a test
            // message closest to the cursor position.
            const demandedUriStr = uri.toString();
            for (const test of this.testService.collection.all) {
                const result = this.testResults.getStateById(test.item.extId);
                if (!result) {
                    continue;
                }
                mapFindTestMessage(result[1], (_task, message, messageIndex, taskIndex) => {
                    if (message.type !== 0 /* TestMessageType.Error */ || !message.location || message.location.uri.toString() !== demandedUriStr) {
                        return;
                    }
                    const distance = position ? Math.abs(position.lineNumber - message.location.range.startLineNumber) : 0;
                    if (!best || distance <= bestDistance) {
                        bestDistance = distance;
                        best = {
                            type: 2 /* TestUriType.ResultMessage */,
                            testExtId: result[1].item.extId,
                            resultId: result[0].id,
                            taskIndex,
                            messageIndex,
                            documentUri: uri,
                        };
                    }
                });
            }
            return best;
        }
        /**
         * Gets any possible still-relevant message from the results.
         */
        getAnyCandidateMessage() {
            const seen = new Set();
            for (const result of this.testResults.results) {
                for (const test of result.tests) {
                    if (seen.has(test.item.extId)) {
                        continue;
                    }
                    seen.add(test.item.extId);
                    const found = mapFindTestMessage(test, (task, message, messageIndex, taskIndex) => (message.location && {
                        type: 2 /* TestUriType.ResultMessage */,
                        testExtId: test.item.extId,
                        resultId: result.id,
                        taskIndex,
                        messageIndex,
                        documentUri: message.location.uri,
                    }));
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        }
        /**
         * Gets the first failed message that can be displayed from the result.
         */
        getFailedCandidateMessage(test) {
            const fallbackLocation = test.item.uri && test.item.range
                ? { uri: test.item.uri, range: test.item.range }
                : undefined;
            let best;
            mapFindTestMessage(test, (task, message, messageIndex, taskId) => {
                const location = message.location || fallbackLocation;
                if (!(0, testingStates_1.isFailedState)(task.state) || !location) {
                    return;
                }
                if (best && message.type !== 0 /* TestMessageType.Error */) {
                    return;
                }
                best = { taskId, index: messageIndex, message, location };
            });
            return best;
        }
    };
    exports.TestingPeekOpener = TestingPeekOpener;
    exports.TestingPeekOpener = TestingPeekOpener = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, testService_1.ITestService),
        __param(5, storage_1.IStorageService),
        __param(6, viewsService_1.IViewsService),
        __param(7, commands_1.ICommandService),
        __param(8, notification_1.INotificationService)
    ], TestingPeekOpener);
    const mapFindTestMessage = (test, fn) => {
        for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
            const task = test.tasks[taskIndex];
            for (let messageIndex = 0; messageIndex < task.messages.length; messageIndex++) {
                const r = fn(task, task.messages[messageIndex], messageIndex, taskIndex);
                if (r !== undefined) {
                    return r;
                }
            }
        }
        return undefined;
    };
    /**
     * Adds output/message peek functionality to code editors.
     */
    let TestingOutputPeekController = TestingOutputPeekController_1 = class TestingOutputPeekController extends lifecycle_1.Disposable {
        /**
         * Gets the controller associated with the given code editor.
         */
        static get(editor) {
            return editor.getContribution("editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */);
        }
        /**
         * Gets the currently display subject. Undefined if the peek is not open.
         */
        get subject() {
            return this.peek.value?.current;
        }
        constructor(editor, codeEditorService, instantiationService, testResults, contextKeyService) {
            super();
            this.editor = editor;
            this.codeEditorService = codeEditorService;
            this.instantiationService = instantiationService;
            this.testResults = testResults;
            /**
             * Currently-shown peek view.
             */
            this.peek = this._register(new lifecycle_1.MutableDisposable());
            this.visible = testingContextKeys_1.TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
            this._register(editor.onDidChangeModel(() => this.peek.clear()));
            this._register(testResults.onResultsChanged(this.closePeekOnCertainResultEvents, this));
            this._register(testResults.onTestChanged(this.closePeekOnTestChange, this));
        }
        /**
         * Toggles peek visibility for the URI.
         */
        toggle(uri) {
            if (this.currentPeekUri?.toString() === uri.toString()) {
                this.peek.clear();
            }
            else {
                this.show(uri);
            }
        }
        /**
         * Shows a peek for the message in the editor.
         */
        async show(uri) {
            const subject = this.retrieveTest(uri);
            if (!subject) {
                return;
            }
            if (!this.peek.value) {
                this.peek.value = this.instantiationService.createInstance(TestResultsPeek, this.editor);
                this.peek.value.onDidClose(() => {
                    this.visible.set(false);
                    this.currentPeekUri = undefined;
                    this.peek.value = undefined;
                });
                this.visible.set(true);
                this.peek.value.create();
            }
            if (subject instanceof MessageSubject) {
                (0, aria_1.alert)((0, markdownRenderer_1.renderStringAsPlaintext)(subject.message.message));
            }
            this.peek.value.setModel(subject);
            this.currentPeekUri = uri;
        }
        async openAndShow(uri) {
            const subject = this.retrieveTest(uri);
            if (!subject) {
                return;
            }
            if (!subject.revealLocation || subject.revealLocation.uri.toString() === this.editor.getModel()?.uri.toString()) {
                return this.show(uri);
            }
            const otherEditor = await this.codeEditorService.openCodeEditor({
                resource: subject.revealLocation.uri,
                options: { pinned: false, revealIfOpened: true }
            }, this.editor);
            if (otherEditor) {
                TestingOutputPeekController_1.get(otherEditor)?.removePeek();
                return TestingOutputPeekController_1.get(otherEditor)?.show(uri);
            }
        }
        /**
         * Disposes the peek view, if any.
         */
        removePeek() {
            this.peek.clear();
        }
        /**
         * Shows the next message in the peek, if possible.
         */
        next() {
            const subject = this.peek.value?.current;
            if (!subject) {
                return;
            }
            let found = false;
            for (const { messageIndex, taskIndex, result, test } of allMessages(this.testResults.results)) {
                if (subject instanceof TaskSubject && result.id === subject.result.id) {
                    found = true; // open the first message found in the current result
                }
                if (found) {
                    this.openAndShow((0, testingUri_1.buildTestUri)({
                        type: 2 /* TestUriType.ResultMessage */,
                        messageIndex,
                        taskIndex,
                        resultId: result.id,
                        testExtId: test.item.extId
                    }));
                    return;
                }
                if (subject instanceof TestOutputSubject && subject.test.item.extId === test.item.extId && subject.taskIndex === taskIndex && subject.result.id === result.id) {
                    found = true;
                }
                if (subject instanceof MessageSubject && subject.test.extId === test.item.extId && subject.messageIndex === messageIndex && subject.taskIndex === taskIndex && subject.result.id === result.id) {
                    found = true;
                }
            }
        }
        /**
         * Shows the previous message in the peek, if possible.
         */
        previous() {
            const subject = this.peek.value?.current;
            if (!subject) {
                return;
            }
            let previous;
            for (const m of allMessages(this.testResults.results)) {
                if (subject instanceof TaskSubject) {
                    if (m.result.id === subject.result.id) {
                        break;
                    }
                    continue;
                }
                if (subject instanceof TestOutputSubject) {
                    if (m.test.item.extId === subject.test.item.extId && m.result.id === subject.result.id && m.taskIndex === subject.taskIndex) {
                        break;
                    }
                    continue;
                }
                if (subject.test.extId === m.test.item.extId && subject.messageIndex === m.messageIndex && subject.taskIndex === m.taskIndex && subject.result.id === m.result.id) {
                    break;
                }
                previous = m;
            }
            if (previous) {
                this.openAndShow((0, testingUri_1.buildTestUri)({
                    type: 2 /* TestUriType.ResultMessage */,
                    messageIndex: previous.messageIndex,
                    taskIndex: previous.taskIndex,
                    resultId: previous.result.id,
                    testExtId: previous.test.item.extId
                }));
            }
        }
        /**
         * Removes the peek view if it's being displayed on the given test ID.
         */
        removeIfPeekingForTest(testId) {
            const c = this.peek.value?.current;
            if (c && c instanceof MessageSubject && c.test.extId === testId) {
                this.peek.clear();
            }
        }
        /**
         * If the test we're currently showing has its state change to something
         * else, then clear the peek.
         */
        closePeekOnTestChange(evt) {
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */ || evt.previousState === evt.item.ownComputedState) {
                return;
            }
            this.removeIfPeekingForTest(evt.item.item.extId);
        }
        closePeekOnCertainResultEvents(evt) {
            if ('started' in evt) {
                this.peek.clear(); // close peek when runs start
            }
            if ('removed' in evt && this.testResults.results.length === 0) {
                this.peek.clear(); // close the peek if results are cleared
            }
        }
        retrieveTest(uri) {
            const parts = (0, testingUri_1.parseTestUri)(uri);
            if (!parts) {
                return undefined;
            }
            const result = this.testResults.results.find(r => r.id === parts.resultId);
            if (!result) {
                return;
            }
            if (parts.type === 0 /* TestUriType.TaskOutput */) {
                return new TaskSubject(result, parts.taskIndex);
            }
            if (parts.type === 1 /* TestUriType.TestOutput */) {
                const test = result.getStateById(parts.testExtId);
                if (!test) {
                    return;
                }
                return new TestOutputSubject(result, parts.taskIndex, test);
            }
            const { testExtId, taskIndex, messageIndex } = parts;
            const test = result?.getStateById(testExtId);
            if (!test || !test.tasks[parts.taskIndex]) {
                return;
            }
            return new MessageSubject(result, test, taskIndex, messageIndex);
        }
    };
    exports.TestingOutputPeekController = TestingOutputPeekController;
    exports.TestingOutputPeekController = TestingOutputPeekController = TestingOutputPeekController_1 = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, contextkey_1.IContextKeyService)
    ], TestingOutputPeekController);
    let TestResultsViewContent = class TestResultsViewContent extends lifecycle_1.Disposable {
        static { TestResultsViewContent_1 = this; }
        constructor(editor, options, instantiationService, modelService, contextKeyService) {
            super();
            this.editor = editor;
            this.options = options;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.contextKeyService = contextKeyService;
            this.didReveal = this._register(new event_1.Emitter());
            this.currentSubjectStore = this._register(new lifecycle_1.DisposableStore());
            this.contentProvidersUpdateLimiter = this._register(new async_1.Limiter(1));
        }
        fillBody(containerElement) {
            const initialSpitWidth = TestResultsViewContent_1.lastSplitWidth;
            this.splitView = new splitview_1.SplitView(containerElement, { orientation: 1 /* Orientation.HORIZONTAL */ });
            const { historyVisible, showRevealLocationOnMessages } = this.options;
            const isInPeekView = this.editor !== undefined;
            const messageContainer = this.messageContainer = dom.append(containerElement, dom.$('.test-output-peek-message-container'));
            this.contentProviders = [
                this._register(this.instantiationService.createInstance(DiffContentProvider, this.editor, messageContainer)),
                this._register(this.instantiationService.createInstance(MarkdownTestMessagePeek, messageContainer)),
                this._register(this.instantiationService.createInstance(TerminalMessagePeek, messageContainer, isInPeekView)),
                this._register(this.instantiationService.createInstance(PlainTextMessagePeek, this.editor, messageContainer)),
            ];
            this.messageContextKeyService = this._register(this.contextKeyService.createScoped(this.messageContainer));
            this.contextKeyTestMessage = testingContextKeys_1.TestingContextKeys.testMessageContext.bindTo(this.messageContextKeyService);
            this.contextKeyResultOutdated = testingContextKeys_1.TestingContextKeys.testResultOutdated.bindTo(this.messageContextKeyService);
            const treeContainer = dom.append(containerElement, dom.$('.test-output-peek-tree'));
            const tree = this._register(this.instantiationService.createInstance(OutputPeekTree, treeContainer, this.didReveal.event, { showRevealLocationOnMessages, locationForProgress: this.options.locationForProgress }));
            this.onDidRequestReveal = tree.onDidRequestReview;
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: messageContainer,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: width => {
                    TestResultsViewContent_1.lastSplitWidth = width;
                    if (this.dimension) {
                        for (const provider of this.contentProviders) {
                            provider.layout({ height: this.dimension.height, width });
                        }
                    }
                },
            }, splitview_1.Sizing.Distribute);
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: treeContainer,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: width => {
                    if (this.dimension) {
                        tree.layout(this.dimension.height, width);
                    }
                },
            }, splitview_1.Sizing.Distribute);
            const historyViewIndex = 1;
            this.splitView.setViewVisible(historyViewIndex, historyVisible.value);
            this._register(historyVisible.onDidChange(visible => {
                this.splitView.setViewVisible(historyViewIndex, visible);
            }));
            if (initialSpitWidth) {
                queueMicrotask(() => this.splitView.resizeView(0, initialSpitWidth));
            }
        }
        /**
         * Shows a message in-place without showing or changing the peek location.
         * This is mostly used if peeking a message without a location.
         */
        reveal(opts) {
            this.didReveal.fire(opts);
            if (this.current && equalsSubject(this.current, opts.subject)) {
                return Promise.resolve();
            }
            this.current = opts.subject;
            return this.contentProvidersUpdateLimiter.queue(async () => {
                await Promise.all(this.contentProviders.map(p => p.update(opts.subject)));
                this.currentSubjectStore.clear();
                this.populateFloatingClick(opts.subject);
            });
        }
        populateFloatingClick(subject) {
            if (!(subject instanceof MessageSubject)) {
                return;
            }
            this.currentSubjectStore.add((0, lifecycle_1.toDisposable)(() => {
                this.contextKeyResultOutdated.reset();
                this.contextKeyTestMessage.reset();
            }));
            this.contextKeyTestMessage.set(subject.contextValue || '');
            if (subject.result instanceof testResult_1.LiveTestResult) {
                this.contextKeyResultOutdated.set(subject.result.getStateById(subject.test.extId)?.retired ?? false);
                this.currentSubjectStore.add(subject.result.onChange(ev => {
                    if (ev.item.item.extId === subject.test.extId) {
                        this.contextKeyResultOutdated.set(ev.item.retired ?? false);
                    }
                }));
            }
            else {
                this.contextKeyResultOutdated.set(true);
            }
            this.currentSubjectStore.add(this.instantiationService
                .createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.messageContextKeyService]))
                .createInstance(floatingMenu_1.FloatingClickMenu, {
                container: this.messageContainer,
                menuId: actions_2.MenuId.TestMessageContent,
                getActionArg: () => subject.context,
            }));
        }
        onLayoutBody(height, width) {
            this.dimension = new dom.Dimension(width, height);
            this.splitView.layout(width);
        }
        onWidth(width) {
            this.splitView.layout(width);
        }
    };
    TestResultsViewContent = TestResultsViewContent_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, contextkey_1.IContextKeyService)
    ], TestResultsViewContent);
    let TestResultsPeek = class TestResultsPeek extends peekView_1.PeekViewWidget {
        static { TestResultsPeek_1 = this; }
        constructor(editor, themeService, peekViewService, testingPeek, contextKeyService, menuService, instantiationService, modelService) {
            super(editor, { showFrame: true, frameWidth: 1, showArrow: true, isResizeable: true, isAccessible: true, className: 'test-output-peek' }, instantiationService);
            this.themeService = themeService;
            this.testingPeek = testingPeek;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.modelService = modelService;
            this.visibilityChange = this._disposables.add(new event_1.Emitter());
            this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme, this));
            this._disposables.add(this.onDidClose(() => this.visibilityChange.fire(false)));
            peekViewService.addExclusiveWidget(editor, this);
        }
        applyTheme() {
            const theme = this.themeService.getColorTheme();
            const isError = this.current instanceof MessageSubject && this.current.message.type === 0 /* TestMessageType.Error */;
            const borderColor = (isError ? theme.getColor(theme_2.testingPeekBorder) : theme.getColor(theme_2.testingMessagePeekBorder)) || color_1.Color.transparent;
            const headerBg = (isError ? theme.getColor(theme_2.testingPeekHeaderBackground) : theme.getColor(theme_2.testingPeekMessageHeaderBackground)) || color_1.Color.transparent;
            const editorBg = theme.getColor(colorRegistry_1.editorBackground);
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: editorBg && headerBg ? headerBg.makeOpaque(editorBg) : headerBg,
                primaryHeadingColor: theme.getColor(peekView_1.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView_1.peekViewTitleInfoForeground)
            });
        }
        _fillContainer(container) {
            if (!this.scopedContextKeyService) {
                this.scopedContextKeyService = this._disposables.add(this.contextKeyService.createScoped(container));
                testingContextKeys_1.TestingContextKeys.isInPeek.bindTo(this.scopedContextKeyService).set(true);
                const instaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
                this.content = this._disposables.add(instaService.createInstance(TestResultsViewContent, this.editor, { historyVisible: this.testingPeek.historyVisible, showRevealLocationOnMessages: false, locationForProgress: "workbench.panel.testResults.view" /* Testing.ResultsViewId */ }));
            }
            super._fillContainer(container);
        }
        _fillHead(container) {
            super._fillHead(container);
            const actions = [];
            const menu = this.menuService.createMenu(actions_2.MenuId.TestPeekTitle, this.contextKeyService);
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, undefined, actions);
            this._actionbarWidget.push(actions, { label: false, icon: true, index: 0 });
            menu.dispose();
        }
        _fillBody(containerElement) {
            this.content.fillBody(containerElement);
            this.content.onDidRequestReveal(sub => {
                TestingOutputPeekController.get(this.editor)?.show(sub instanceof MessageSubject
                    ? sub.messageUri
                    : sub.outputUri);
            });
        }
        /**
         * Updates the test to be shown.
         */
        setModel(subject) {
            if (subject instanceof TaskSubject || subject instanceof TestOutputSubject) {
                this.current = subject;
                return this.showInPlace(subject);
            }
            const message = subject.message;
            const previous = this.current;
            if (!subject.revealLocation && !previous) {
                return Promise.resolve();
            }
            this.current = subject;
            if (!subject.revealLocation) {
                return this.showInPlace(subject);
            }
            this.show(subject.revealLocation.range, TestResultsPeek_1.lastHeightInLines || hintMessagePeekHeight(message));
            const startPosition = subject.revealLocation.range.getStartPosition();
            this.editor.revealRangeNearTopIfOutsideViewport(range_1.Range.fromPositions(startPosition), 0 /* ScrollType.Smooth */);
            return this.showInPlace(subject);
        }
        /**
         * Shows a message in-place without showing or changing the peek location.
         * This is mostly used if peeking a message without a location.
         */
        async showInPlace(subject) {
            if (subject instanceof MessageSubject) {
                const message = subject.message;
                this.setTitle(firstLine((0, markdownRenderer_1.renderStringAsPlaintext)(message.message)), (0, iconLabels_2.stripIcons)(subject.test.label));
            }
            else {
                this.setTitle((0, nls_1.localize)('testOutputTitle', 'Test Output'));
            }
            this.applyTheme();
            await this.content.reveal({ subject: subject, preserveFocus: false });
        }
        _relayout(newHeightInLines) {
            super._relayout(newHeightInLines);
            TestResultsPeek_1.lastHeightInLines = newHeightInLines;
        }
        /** @override */
        _doLayoutBody(height, width) {
            super._doLayoutBody(height, width);
            this.content.onLayoutBody(height, width);
        }
        /** @override */
        _onWidth(width) {
            super._onWidth(width);
            if (this.dimension) {
                this.dimension = new dom.Dimension(width, this.dimension.height);
            }
            this.content.onWidth(width);
        }
    };
    TestResultsPeek = TestResultsPeek_1 = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, peekView_1.IPeekViewService),
        __param(3, testingPeekOpener_1.ITestingPeekOpener),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, actions_2.IMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, resolverService_1.ITextModelService)
    ], TestResultsPeek);
    let TestResultsView = class TestResultsView extends viewPane_1.ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, resultService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.resultService = resultService;
            this.content = this._register(this.instantiationService.createInstance(TestResultsViewContent, undefined, {
                historyVisible: (0, observableValue_1.staticObservableValue)(true),
                showRevealLocationOnMessages: true,
                locationForProgress: "workbench.view.testing" /* Testing.ExplorerViewId */,
            }));
        }
        get subject() {
            return this.content.current;
        }
        showLatestRun(preserveFocus = false) {
            const result = this.resultService.results.find(r => r.tasks.length);
            if (!result) {
                return;
            }
            this.content.reveal({ preserveFocus, subject: new TaskSubject(result, 0) });
        }
        showMessage(result, test, taskIndex, messageIndex) {
            this.content.reveal({ preserveFocus: false, subject: new MessageSubject(result, test, taskIndex, messageIndex) });
        }
        renderBody(container) {
            super.renderBody(container);
            this.content.fillBody(container);
            this.content.onDidRequestReveal(subject => this.content.reveal({ preserveFocus: true, subject }));
            const [lastResult] = this.resultService.results;
            if (lastResult && lastResult.tasks.length) {
                this.content.reveal({ preserveFocus: true, subject: new TaskSubject(lastResult, 0) });
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.content.onLayoutBody(height, width);
        }
    };
    exports.TestResultsView = TestResultsView;
    exports.TestResultsView = TestResultsView = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, testResultService_1.ITestResultService)
    ], TestResultsView);
    const commonEditorOptions = {
        scrollBeyondLastLine: false,
        links: true,
        lineNumbers: 'off',
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
        },
        fixedOverflowWidgets: true,
        readOnly: true,
        minimap: {
            enabled: false
        },
        wordWrap: 'on',
    };
    const diffEditorOptions = {
        ...commonEditorOptions,
        enableSplitViewResizing: true,
        isInEmbeddedEditor: true,
        renderOverviewRuler: false,
        ignoreTrimWhitespace: false,
        renderSideBySide: true,
        useInlineViewWhenSpaceIsLimited: false,
        originalAriaLabel: (0, nls_1.localize)('testingOutputExpected', 'Expected result'),
        modifiedAriaLabel: (0, nls_1.localize)('testingOutputActual', 'Actual result'),
        diffAlgorithm: 'advanced',
    };
    const isDiffable = (message) => message.type === 0 /* TestMessageType.Error */ && message.actual !== undefined && message.expected !== undefined;
    let DiffContentProvider = class DiffContentProvider extends lifecycle_1.Disposable {
        constructor(editor, container, instantiationService, modelService) {
            super();
            this.editor = editor;
            this.container = container;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.widget = this._register(new lifecycle_1.MutableDisposable());
            this.model = this._register(new lifecycle_1.MutableDisposable());
        }
        async update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.clear();
            }
            const message = subject.message;
            if (!isDiffable(message)) {
                return this.clear();
            }
            const [original, modified] = await Promise.all([
                this.modelService.createModelReference(subject.expectedUri),
                this.modelService.createModelReference(subject.actualUri),
            ]);
            const model = this.model.value = new SimpleDiffEditorModel(original, modified);
            if (!this.widget.value) {
                this.widget.value = this.editor ? this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, this.container, diffEditorOptions, {}, this.editor) : this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, this.container, diffEditorOptions, {});
                if (this.dimension) {
                    this.widget.value.layout(this.dimension);
                }
            }
            this.widget.value.setModel(model);
            this.widget.value.updateOptions(this.getOptions(isMultiline(message.expected) || isMultiline(message.actual)));
        }
        clear() {
            this.model.clear();
            this.widget.clear();
        }
        layout(dimensions) {
            this.dimension = dimensions;
            this.widget.value?.layout(dimensions);
        }
        getOptions(isMultiline) {
            return isMultiline
                ? { ...diffEditorOptions, lineNumbers: 'on' }
                : { ...diffEditorOptions, lineNumbers: 'off' };
        }
    };
    DiffContentProvider = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, resolverService_1.ITextModelService)
    ], DiffContentProvider);
    class ScrollableMarkdownMessage extends lifecycle_1.Disposable {
        constructor(container, markdown, message) {
            super();
            const rendered = this._register(markdown.render(message, {}));
            rendered.element.style.height = '100%';
            rendered.element.style.userSelect = 'text';
            container.appendChild(rendered.element);
            this.element = rendered.element;
            this.scrollable = this._register(new scrollableElement_1.DomScrollableElement(rendered.element, {
                className: 'preview-text',
            }));
            container.appendChild(this.scrollable.getDomNode());
            this._register((0, lifecycle_1.toDisposable)(() => {
                container.removeChild(this.scrollable.getDomNode());
            }));
            this.scrollable.scanDomNode();
        }
        layout(height, width) {
            // Remove padding of `.monaco-editor .zone-widget.test-output-peek .preview-text`
            this.scrollable.setScrollDimensions({
                width: width - 32,
                height: height - 16,
                scrollWidth: this.element.scrollWidth,
                scrollHeight: this.element.scrollHeight
            });
        }
    }
    let MarkdownTestMessagePeek = class MarkdownTestMessagePeek extends lifecycle_1.Disposable {
        constructor(container, instantiationService) {
            super();
            this.container = container;
            this.instantiationService = instantiationService;
            this.markdown = new lazy_1.Lazy(() => this._register(this.instantiationService.createInstance(markdownRenderer_2.MarkdownRenderer, {})));
            this.textPreview = this._register(new lifecycle_1.MutableDisposable());
        }
        update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.textPreview.clear();
            }
            const message = subject.message;
            if (isDiffable(message) || typeof message.message === 'string') {
                return this.textPreview.clear();
            }
            this.textPreview.value = new ScrollableMarkdownMessage(this.container, this.markdown.value, message.message);
        }
        layout(dimension) {
            this.textPreview.value?.layout(dimension.height, dimension.width);
        }
    };
    MarkdownTestMessagePeek = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], MarkdownTestMessagePeek);
    let PlainTextMessagePeek = class PlainTextMessagePeek extends lifecycle_1.Disposable {
        constructor(editor, container, instantiationService, modelService) {
            super();
            this.editor = editor;
            this.container = container;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.widget = this._register(new lifecycle_1.MutableDisposable());
            this.model = this._register(new lifecycle_1.MutableDisposable());
        }
        async update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.clear();
            }
            const message = subject.message;
            if (isDiffable(message) || message.type === 1 /* TestMessageType.Output */ || typeof message.message !== 'string') {
                return this.clear();
            }
            const modelRef = this.model.value = await this.modelService.createModelReference(subject.messageUri);
            if (!this.widget.value) {
                this.widget.value = this.editor ? this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this.container, commonEditorOptions, {}, this.editor) : this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.container, commonEditorOptions, { isSimpleWidget: true });
                if (this.dimension) {
                    this.widget.value.layout(this.dimension);
                }
            }
            this.widget.value.setModel(modelRef.object.textEditorModel);
            this.widget.value.updateOptions(commonEditorOptions);
        }
        clear() {
            this.model.clear();
            this.widget.clear();
        }
        layout(dimensions) {
            this.dimension = dimensions;
            this.widget.value?.layout(dimensions);
        }
    };
    PlainTextMessagePeek = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, resolverService_1.ITextModelService)
    ], PlainTextMessagePeek);
    let TerminalMessagePeek = class TerminalMessagePeek extends lifecycle_1.Disposable {
        constructor(container, isInPeekView, terminalService, viewDescriptorService, workspaceContext) {
            super();
            this.container = container;
            this.isInPeekView = isInPeekView;
            this.terminalService = terminalService;
            this.viewDescriptorService = viewDescriptorService;
            this.workspaceContext = workspaceContext;
            this.terminalCwd = this._register(new observableValue_1.MutableObservableValue(''));
            this.xtermLayoutDelayer = this._register(new async_1.Delayer(50));
            /** Active terminal instance. */
            this.terminal = this._register(new lifecycle_1.MutableDisposable());
            /** Listener for streaming result data */
            this.outputDataListener = this._register(new lifecycle_1.MutableDisposable());
        }
        async makeTerminal() {
            const prev = this.terminal.value;
            if (prev) {
                prev.xterm.clearBuffer();
                prev.xterm.clearSearchDecorations();
                // clearBuffer tries to retain the prompt line, but this doesn't exist for tests.
                // So clear the screen (J) and move to home (H) to ensure previous data is cleaned up.
                prev.xterm.write(`\x1b[2J\x1b[0;0H`);
                return prev;
            }
            const capabilities = new terminalCapabilityStore_1.TerminalCapabilityStore();
            const cwd = this.terminalCwd;
            capabilities.add(0 /* TerminalCapability.CwdDetection */, {
                type: 0 /* TerminalCapability.CwdDetection */,
                get cwds() { return [cwd.value]; },
                onDidChangeCwd: cwd.onDidChange,
                getCwd: () => cwd.value,
                updateCwd: () => { },
            });
            return this.terminal.value = await this.terminalService.createDetachedTerminal({
                rows: 10,
                cols: 80,
                readonly: true,
                capabilities,
                processInfo: new detachedTerminal_1.DetachedProcessInfo({ initialCwd: cwd.value }),
                colorProvider: {
                    getBackgroundColor: theme => {
                        const terminalBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR);
                        if (terminalBackground) {
                            return terminalBackground;
                        }
                        if (this.isInPeekView) {
                            return theme.getColor(peekView_1.peekViewResultsBackground);
                        }
                        const location = this.viewDescriptorService.getViewLocationById("workbench.panel.testResults.view" /* Testing.ResultsViewId */);
                        return location === 1 /* ViewContainerLocation.Panel */
                            ? theme.getColor(theme_1.PANEL_BACKGROUND)
                            : theme.getColor(theme_1.SIDE_BAR_BACKGROUND);
                    },
                }
            });
        }
        async update(subject) {
            this.outputDataListener.clear();
            if (subject instanceof TaskSubject) {
                await this.updateForTaskSubject(subject);
            }
            else if (subject instanceof TestOutputSubject || (subject instanceof MessageSubject && subject.message.type === 1 /* TestMessageType.Output */)) {
                await this.updateForTestSubject(subject);
            }
            else {
                this.clear();
            }
        }
        async updateForTestSubject(subject) {
            const that = this;
            const testItem = subject instanceof TestOutputSubject ? subject.test.item : subject.test;
            const terminal = await this.updateGenerically({
                subject,
                noOutputMessage: (0, nls_1.localize)('caseNoOutput', 'The test case did not report any output.'),
                getTarget: result => result?.tasks[subject.taskIndex].output,
                *doInitialWrite(output, results) {
                    that.updateCwd(testItem.uri);
                    const state = subject instanceof TestOutputSubject ? subject.test : results.getStateById(testItem.extId);
                    if (!state) {
                        return;
                    }
                    for (const message of state.tasks[subject.taskIndex].messages) {
                        if (message.type === 1 /* TestMessageType.Output */) {
                            yield* output.getRangeIter(message.offset, message.length);
                        }
                    }
                },
                doListenForMoreData: (output, result, write) => result.onChange(e => {
                    if (e.reason === 2 /* TestResultItemChangeReason.NewMessage */ && e.item.item.extId === testItem.extId && e.message.type === 1 /* TestMessageType.Output */) {
                        for (const chunk of output.getRangeIter(e.message.offset, e.message.length)) {
                            write(chunk.buffer);
                        }
                    }
                }),
            });
            if (subject instanceof MessageSubject && subject.message.type === 1 /* TestMessageType.Output */ && subject.message.marker !== undefined) {
                terminal?.xterm.selectMarkedRange((0, testTypes_1.getMarkId)(subject.message.marker, true), (0, testTypes_1.getMarkId)(subject.message.marker, false), /* scrollIntoView= */ true);
            }
        }
        updateForTaskSubject(subject) {
            return this.updateGenerically({
                subject,
                noOutputMessage: (0, nls_1.localize)('runNoOutput', 'The test run did not record any output.'),
                getTarget: result => result?.tasks[subject.taskIndex],
                doInitialWrite: (task, result) => {
                    // Update the cwd and use the first test to try to hint at the correct cwd,
                    // but often this will fall back to the first workspace folder.
                    this.updateCwd(iterator_1.Iterable.find(result.tests, t => !!t.item.uri)?.item.uri);
                    return task.output.buffers;
                },
                doListenForMoreData: (task, _result, write) => task.output.onDidWriteData(e => write(e.buffer)),
            });
        }
        async updateGenerically(opts) {
            const result = opts.subject.result;
            const target = opts.getTarget(result);
            if (!target) {
                return this.clear();
            }
            const terminal = await this.makeTerminal();
            let didWriteData = false;
            const pendingWrites = new observableValue_1.MutableObservableValue(0);
            if (result instanceof testResult_1.LiveTestResult) {
                for (const chunk of opts.doInitialWrite(target, result)) {
                    didWriteData ||= chunk.byteLength > 0;
                    pendingWrites.value++;
                    terminal.xterm.write(chunk.buffer, () => pendingWrites.value--);
                }
            }
            else {
                didWriteData = true;
                this.writeNotice(terminal, (0, nls_1.localize)('runNoOutputForPast', 'Test output is only available for new test runs.'));
            }
            this.attachTerminalToDom(terminal);
            this.outputDataListener.clear();
            if (result instanceof testResult_1.LiveTestResult && !result.completedAt) {
                const l1 = result.onComplete(() => {
                    if (!didWriteData) {
                        this.writeNotice(terminal, opts.noOutputMessage);
                    }
                });
                const l2 = opts.doListenForMoreData(target, result, data => {
                    terminal.xterm.write(data);
                    didWriteData ||= data.byteLength > 0;
                });
                this.outputDataListener.value = (0, lifecycle_1.combinedDisposable)(l1, l2);
            }
            if (!this.outputDataListener.value && !didWriteData) {
                this.writeNotice(terminal, opts.noOutputMessage);
            }
            // Ensure pending writes finish, otherwise the selection in `updateForTestSubject`
            // can happen before the markers are processed.
            if (pendingWrites.value > 0) {
                await new Promise(resolve => {
                    const l = pendingWrites.onDidChange(() => {
                        if (pendingWrites.value === 0) {
                            l.dispose();
                            resolve();
                        }
                    });
                });
            }
            return terminal;
        }
        updateCwd(testUri) {
            const wf = (testUri && this.workspaceContext.getWorkspaceFolder(testUri))
                || this.workspaceContext.getWorkspace().folders[0];
            if (wf) {
                this.terminalCwd.value = wf.uri.fsPath;
            }
        }
        writeNotice(terminal, str) {
            terminal.xterm.write((0, terminalStrings_1.formatMessageForTerminal)(str));
        }
        attachTerminalToDom(terminal) {
            terminal.xterm.write('\x1b[?25l'); // hide cursor
            dom.scheduleAtNextAnimationFrame(dom.getWindow(this.container), () => this.layoutTerminal(terminal));
            terminal.attachToElement(this.container, { enableGpu: false });
        }
        clear() {
            this.outputDataListener.clear();
            this.xtermLayoutDelayer.cancel();
            this.terminal.clear();
        }
        layout(dimensions) {
            this.dimensions = dimensions;
            if (this.terminal.value) {
                this.layoutTerminal(this.terminal.value, dimensions.width, dimensions.height);
            }
        }
        layoutTerminal({ xterm }, width = this.dimensions?.width ?? this.container.clientWidth, height = this.dimensions?.height ?? this.container.clientHeight) {
            width -= 10 + 20; // scrollbar width + margin
            this.xtermLayoutDelayer.trigger(() => {
                const scaled = (0, xtermTerminal_1.getXtermScaledDimensions)(dom.getWindow(this.container), xterm.getFont(), width, height);
                if (scaled) {
                    xterm.resize(scaled.cols, scaled.rows);
                }
            });
        }
    };
    TerminalMessagePeek = __decorate([
        __param(2, terminal_1.ITerminalService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], TerminalMessagePeek);
    const hintMessagePeekHeight = (msg) => {
        const msgHeight = isDiffable(msg)
            ? Math.max(hintPeekStrHeight(msg.actual), hintPeekStrHeight(msg.expected))
            : hintPeekStrHeight(typeof msg.message === 'string' ? msg.message : msg.message.value);
        // add 8ish lines for the size of the title and decorations in the peek.
        return msgHeight + 8;
    };
    const firstLine = (str) => {
        const index = str.indexOf('\n');
        return index === -1 ? str : str.slice(0, index);
    };
    const isMultiline = (str) => !!str && str.includes('\n');
    const hintPeekStrHeight = (str) => Math.min((0, strings_1.count)(str, '\n'), 24);
    class SimpleDiffEditorModel extends editorModel_1.EditorModel {
        constructor(_original, _modified) {
            super();
            this._original = _original;
            this._modified = _modified;
            this.original = this._original.object.textEditorModel;
            this.modified = this._modified.object.textEditorModel;
        }
        dispose() {
            super.dispose();
            this._original.dispose();
            this._modified.dispose();
        }
    }
    function getOuterEditorFromDiffEditor(codeEditorService) {
        const diffEditors = codeEditorService.listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                return diffEditor.getParentEditor();
            }
        }
        return null;
    }
    class CloseTestPeek extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.closeTestPeek',
                title: (0, nls_1.localize)('close', 'Close'),
                icon: codicons_1.Codicon.close,
                precondition: contextkey_1.ContextKeyExpr.or(testingContextKeys_1.TestingContextKeys.isInPeek, testingContextKeys_1.TestingContextKeys.isPeekVisible),
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 101,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')
                }
            });
        }
        runEditorCommand(accessor, editor) {
            const parent = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.ICodeEditorService));
            TestingOutputPeekController.get(parent ?? editor)?.removePeek();
        }
    }
    exports.CloseTestPeek = CloseTestPeek;
    class TestResultElement {
        get icon() {
            return icons.testingStatesToIcons.get(this.value.completedAt === undefined
                ? 2 /* TestResultState.Running */
                : (0, testResult_1.maxCountPriority)(this.value.counts));
        }
        constructor(value) {
            this.value = value;
            this.changeEmitter = new event_1.Emitter();
            this.onDidChange = this.changeEmitter.event;
            this.type = 'result';
            this.context = this.value.id;
            this.id = this.value.id;
            this.label = this.value.name;
        }
    }
    const openCoverageLabel = (0, nls_1.localize)('openTestCoverage', 'View Test Coverage');
    const closeCoverageLabel = (0, nls_1.localize)('closeTestCoverage', 'Close Test Coverage');
    class CoverageElement {
        get label() {
            return this.isOpen ? closeCoverageLabel : openCoverageLabel;
        }
        get icon() {
            return this.isOpen ? iconRegistry_1.widgetClose : icons.testingCoverageReport;
        }
        get isOpen() {
            return this.coverageService.selected.get()?.fromTaskId === this.task.id;
        }
        constructor(results, task, coverageService) {
            this.results = results;
            this.task = task;
            this.coverageService = coverageService;
            this.type = 'coverage';
            this.id = `coverage-${this.results.id}/${this.task.id}`;
            this.onDidChange = event_1.Event.fromObservableLight(coverageService.selected);
        }
    }
    class TestCaseElement {
        get onDidChange() {
            if (!(this.results instanceof testResult_1.LiveTestResult)) {
                return event_1.Event.None;
            }
            return event_1.Event.filter(this.results.onChange, e => e.item.item.extId === this.test.item.extId);
        }
        get state() {
            return this.test.tasks[this.taskIndex].state;
        }
        get label() {
            return this.test.item.label;
        }
        get labelWithIcons() {
            return (0, iconLabels_1.renderLabelWithIcons)(this.label);
        }
        get icon() {
            return icons.testingStatesToIcons.get(this.state);
        }
        get outputSubject() {
            return new TestOutputSubject(this.results, this.taskIndex, this.test);
        }
        constructor(results, test, taskIndex) {
            this.results = results;
            this.test = test;
            this.taskIndex = taskIndex;
            this.type = 'test';
            this.context = this.test.item.extId;
            this.id = `${this.results.id}/${this.test.item.extId}`;
        }
    }
    class TaskElement {
        get icon() {
            return this.results.tasks[this.index].running ? icons.testingStatesToIcons.get(2 /* TestResultState.Running */) : undefined;
        }
        constructor(results, task, index) {
            this.results = results;
            this.task = task;
            this.index = index;
            this.changeEmitter = new event_1.Emitter();
            this.onDidChange = this.changeEmitter.event;
            this.type = 'task';
            this.itemsCache = new CreationCache();
            this.id = `${results.id}/${index}`;
            this.task = results.tasks[index];
            this.context = String(index);
            this.label = this.task.name ?? (0, nls_1.localize)('testUnnamedTask', 'Unnamed Task');
        }
    }
    class TestMessageElement {
        get onDidChange() {
            if (!(this.result instanceof testResult_1.LiveTestResult)) {
                return event_1.Event.None;
            }
            // rerender when the test case changes so it gets retired events
            return event_1.Event.filter(this.result.onChange, e => e.item.item.extId === this.test.item.extId);
        }
        get context() {
            return {
                $mid: 18 /* MarshalledId.TestMessageMenuArgs */,
                extId: this.test.item.extId,
                message: testTypes_1.ITestMessage.serialize(this.message),
            };
        }
        constructor(result, test, taskIndex, messageIndex) {
            this.result = result;
            this.test = test;
            this.taskIndex = taskIndex;
            this.messageIndex = messageIndex;
            this.type = 'message';
            const m = this.message = test.tasks[taskIndex].messages[messageIndex];
            this.location = m.location;
            this.contextValue = m.type === 0 /* TestMessageType.Error */ ? m.contextValue : undefined;
            this.uri = (0, testingUri_1.buildTestUri)({
                type: 2 /* TestUriType.ResultMessage */,
                messageIndex,
                resultId: result.id,
                taskIndex,
                testExtId: test.item.extId
            });
            this.id = this.uri.toString();
            const asPlaintext = (0, markdownRenderer_1.renderStringAsPlaintext)(m.message);
            const lines = (0, strings_1.count)(asPlaintext.trimEnd(), '\n');
            this.label = firstLine(asPlaintext);
            if (lines > 0) {
                this.description = lines > 1
                    ? (0, nls_1.localize)('messageMoreLinesN', '+ {0} more lines', lines)
                    : (0, nls_1.localize)('messageMoreLines1', '+ 1 more line');
            }
        }
    }
    let OutputPeekTree = class OutputPeekTree extends lifecycle_1.Disposable {
        constructor(container, onDidReveal, options, contextMenuService, results, instantiationService, explorerFilter, coverageService, progressService) {
            super();
            this.contextMenuService = contextMenuService;
            this.disposed = false;
            this.requestReveal = this._register(new event_1.Emitter());
            this.onDidRequestReview = this.requestReveal.event;
            this.treeActions = instantiationService.createInstance(TreeActionsProvider, options.showRevealLocationOnMessages, this.requestReveal);
            const diffIdentityProvider = {
                getId(e) {
                    return e.id;
                }
            };
            this.tree = this._register(instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'Test Output Peek', container, {
                getHeight: () => 22,
                getTemplateId: () => TestRunElementRenderer.ID,
            }, [instantiationService.createInstance(TestRunElementRenderer, this.treeActions)], {
                compressionEnabled: true,
                hideTwistiesOfChildlessElements: true,
                identityProvider: diffIdentityProvider,
                sorter: {
                    compare(a, b) {
                        if (a instanceof TestCaseElement && b instanceof TestCaseElement) {
                            return (0, testingStates_1.cmpPriority)(a.state, b.state);
                        }
                        return 0;
                    },
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        return element.ariaLabel || element.label;
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('testingPeekLabel', 'Test Result Messages');
                    }
                }
            }));
            const cc = new CreationCache();
            const getTaskChildren = (taskElem) => {
                const { results, index, itemsCache, task } = taskElem;
                const tests = iterator_1.Iterable.filter(results.tests, test => test.tasks[index].state >= 2 /* TestResultState.Running */ || test.tasks[index].messages.length > 0);
                let result = iterator_1.Iterable.map(tests, test => ({
                    element: itemsCache.getOrCreate(test, () => new TestCaseElement(results, test, index)),
                    incompressible: true,
                    children: getTestChildren(results, test, index),
                }));
                if (task.coverage.get()) {
                    result = iterator_1.Iterable.concat(iterator_1.Iterable.single({
                        element: new CoverageElement(results, task, coverageService),
                    }), result);
                }
                return result;
            };
            const getTestChildren = (result, test, taskIndex) => {
                return test.tasks[taskIndex].messages
                    .map((m, messageIndex) => m.type === 0 /* TestMessageType.Error */
                    ? { element: cc.getOrCreate(m, () => new TestMessageElement(result, test, taskIndex, messageIndex)), incompressible: false }
                    : undefined)
                    .filter(types_1.isDefined);
            };
            const getResultChildren = (result) => {
                return result.tasks.map((task, taskIndex) => {
                    const taskElem = cc.getOrCreate(task, () => new TaskElement(result, task, taskIndex));
                    return ({
                        element: taskElem,
                        incompressible: false,
                        children: getTaskChildren(taskElem),
                    });
                });
            };
            const getRootChildren = () => results.results.map(result => {
                const element = cc.getOrCreate(result, () => new TestResultElement(result));
                return {
                    element,
                    incompressible: true,
                    collapsed: this.tree.hasElement(element) ? this.tree.isCollapsed(element) : true,
                    children: getResultChildren(result)
                };
            });
            // Queued result updates to prevent spamming CPU when lots of tests are
            // completing and messaging quickly (#142514)
            const taskChildrenToUpdate = new Set();
            const taskChildrenUpdate = this._register(new async_1.RunOnceScheduler(() => {
                for (const taskNode of taskChildrenToUpdate) {
                    if (this.tree.hasElement(taskNode)) {
                        this.tree.setChildren(taskNode, getTaskChildren(taskNode), { diffIdentityProvider });
                    }
                }
                taskChildrenToUpdate.clear();
            }, 300));
            const queueTaskChildrenUpdate = (taskNode) => {
                taskChildrenToUpdate.add(taskNode);
                if (!taskChildrenUpdate.isScheduled()) {
                    taskChildrenUpdate.schedule();
                }
            };
            const attachToResults = (result) => {
                const resultNode = cc.get(result);
                const disposable = new lifecycle_1.DisposableStore();
                disposable.add(result.onNewTask(i => {
                    if (result.tasks.length === 1) {
                        this.requestReveal.fire(new TaskSubject(result, 0)); // reveal the first task in new runs
                    }
                    if (this.tree.hasElement(resultNode)) {
                        this.tree.setChildren(resultNode, getResultChildren(result), { diffIdentityProvider });
                    }
                    // note: tasks are bounded and their lifetime is equivalent to that of
                    // the test result, so this doesn't leak indefinitely.
                    const task = result.tasks[i];
                    disposable.add((0, observable_1.autorun)(reader => {
                        task.coverage.read(reader); // add it to the autorun
                        queueTaskChildrenUpdate(cc.get(task));
                    }));
                }));
                disposable.add(result.onEndTask(index => {
                    cc.get(result.tasks[index])?.changeEmitter.fire();
                }));
                disposable.add(result.onChange(e => {
                    // try updating the item in each of its tasks
                    for (const [index, task] of result.tasks.entries()) {
                        const taskNode = cc.get(task);
                        if (!this.tree.hasElement(taskNode)) {
                            continue;
                        }
                        const itemNode = taskNode.itemsCache.get(e.item);
                        if (itemNode && this.tree.hasElement(itemNode)) {
                            if (e.reason === 2 /* TestResultItemChangeReason.NewMessage */ && e.message.type === 0 /* TestMessageType.Error */) {
                                this.tree.setChildren(itemNode, getTestChildren(result, e.item, index), { diffIdentityProvider });
                            }
                            return;
                        }
                        queueTaskChildrenUpdate(taskNode);
                    }
                }));
                disposable.add(result.onComplete(() => {
                    resultNode.changeEmitter.fire();
                    disposable.dispose();
                }));
                return resultNode;
            };
            this._register(results.onResultsChanged(e => {
                // little hack here: a result change can cause the peek to be disposed,
                // but this listener will still be queued. Doing stuff with the tree
                // will cause errors.
                if (this.disposed) {
                    return;
                }
                if ('completed' in e) {
                    cc.get(e.completed)?.changeEmitter.fire();
                    return;
                }
                this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
                // done after setChildren intentionally so that the ResultElement exists in the cache.
                if ('started' in e) {
                    for (const child of this.tree.getNode(null).children) {
                        this.tree.collapse(child.element, false);
                    }
                    this.tree.expand(attachToResults(e.started), true);
                }
            }));
            const revealItem = (element, preserveFocus) => {
                this.tree.setFocus([element]);
                this.tree.setSelection([element]);
                if (!preserveFocus) {
                    this.tree.domFocus();
                }
            };
            this._register(onDidReveal(async ({ subject, preserveFocus = false }) => {
                if (subject instanceof TaskSubject) {
                    const resultItem = this.tree.getNode(null).children.find(c => {
                        if (c.element instanceof TaskElement) {
                            return c.element.results.id === subject.result.id && c.element.index === subject.taskIndex;
                        }
                        if (c.element instanceof TestResultElement) {
                            return c.element.id === subject.result.id;
                        }
                        return false;
                    });
                    if (resultItem) {
                        revealItem(resultItem.element, preserveFocus);
                    }
                    return;
                }
                const revealElement = subject instanceof TestOutputSubject
                    ? cc.get(subject.task)?.itemsCache.get(subject.test)
                    : cc.get(subject.message);
                if (!revealElement || !this.tree.hasElement(revealElement)) {
                    return;
                }
                const parents = [];
                for (let parent = this.tree.getParentElement(revealElement); parent; parent = this.tree.getParentElement(parent)) {
                    parents.unshift(parent);
                }
                for (const parent of parents) {
                    this.tree.expand(parent);
                }
                if (this.tree.getRelativeTop(revealElement) === null) {
                    this.tree.reveal(revealElement, 0.5);
                }
                revealItem(revealElement, preserveFocus);
            }));
            this._register(this.tree.onDidOpen(async (e) => {
                if (e.element instanceof TestMessageElement) {
                    this.requestReveal.fire(new MessageSubject(e.element.result, e.element.test, e.element.taskIndex, e.element.messageIndex));
                }
                else if (e.element instanceof TestCaseElement) {
                    const t = e.element;
                    const message = mapFindTestMessage(e.element.test, (_t, _m, mesasgeIndex, taskIndex) => new MessageSubject(t.results, t.test, taskIndex, mesasgeIndex));
                    this.requestReveal.fire(message || new TestOutputSubject(t.results, 0, t.test));
                }
                else if (e.element instanceof CoverageElement) {
                    const task = e.element.task;
                    if (e.element.isOpen) {
                        return coverageService.closeCoverage();
                    }
                    progressService.withProgress({ location: options.locationForProgress }, () => coverageService.openCoverage(task, true));
                }
            }));
            this._register(this.tree.onDidChangeSelection(evt => {
                for (const element of evt.elements) {
                    if (element && 'test' in element) {
                        explorerFilter.reveal.value = element.test.item.extId;
                        break;
                    }
                }
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this.tree.setChildren(null, getRootChildren());
            for (const result of results.results) {
                if (!result.completedAt && result instanceof testResult_1.LiveTestResult) {
                    attachToResults(result);
                }
            }
        }
        layout(height, width) {
            this.tree.layout(height, width);
        }
        onContextMenu(evt) {
            if (!evt.element) {
                return;
            }
            const actions = this.treeActions.provideActionBar(evt.element);
            this.contextMenuService.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.secondary.length
                    ? [...actions.primary, new actions_1.Separator(), ...actions.secondary]
                    : actions.primary,
                getActionsContext: () => evt.element?.context
            });
        }
        dispose() {
            super.dispose();
            this.disposed = true;
        }
    };
    OutputPeekTree = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, testResultService_1.ITestResultService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, testExplorerFilterState_1.ITestExplorerFilterState),
        __param(7, testCoverageService_1.ITestCoverageService),
        __param(8, progress_1.IProgressService)
    ], OutputPeekTree);
    let TestRunElementRenderer = class TestRunElementRenderer {
        static { TestRunElementRenderer_1 = this; }
        static { this.ID = 'testRunElementRenderer'; }
        constructor(treeActions, instantiationService) {
            this.treeActions = treeActions;
            this.instantiationService = instantiationService;
            this.templateId = TestRunElementRenderer_1.ID;
        }
        /** @inheritdoc */
        renderCompressedElements(node, _index, templateData) {
            const chain = node.element.elements;
            const lastElement = chain[chain.length - 1];
            if ((lastElement instanceof TaskElement || lastElement instanceof TestMessageElement) && chain.length >= 2) {
                this.doRender(chain[chain.length - 2], templateData, lastElement);
            }
            else {
                this.doRender(lastElement, templateData);
            }
        }
        /** @inheritdoc */
        renderTemplate(container) {
            const templateDisposable = new lifecycle_1.DisposableStore();
            const wrapper = dom.append(container, dom.$('.test-peek-item'));
            const icon = dom.append(wrapper, dom.$('.state'));
            const label = dom.append(wrapper, dom.$('.name'));
            const actionBar = new actionbar_1.ActionBar(wrapper, {
                actionViewItemProvider: action => action instanceof actions_2.MenuItemAction
                    ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined)
                    : undefined
            });
            const elementDisposable = new lifecycle_1.DisposableStore();
            templateDisposable.add(elementDisposable);
            templateDisposable.add(actionBar);
            return {
                icon,
                label,
                actionBar,
                elementDisposable,
                templateDisposable,
            };
        }
        /** @inheritdoc */
        renderElement(element, _index, templateData) {
            this.doRender(element.element, templateData);
        }
        /** @inheritdoc */
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        /** Called to render a new element */
        doRender(element, templateData, subjectElement) {
            templateData.elementDisposable.clear();
            templateData.elementDisposable.add(element.onDidChange(() => this.doRender(element, templateData, subjectElement)));
            this.doRenderInner(element, templateData, subjectElement);
        }
        /** Called, and may be re-called, to render or re-render an element */
        doRenderInner(element, templateData, subjectElement) {
            let { label, labelWithIcons, description } = element;
            if (subjectElement instanceof TestMessageElement) {
                description = subjectElement.label;
            }
            const descriptionElement = description ? dom.$('span.test-label-description', {}, description) : '';
            if (labelWithIcons) {
                dom.reset(templateData.label, ...labelWithIcons, descriptionElement);
            }
            else {
                dom.reset(templateData.label, label, descriptionElement);
            }
            const icon = element.icon;
            templateData.icon.className = `computed-state ${icon ? themables_1.ThemeIcon.asClassName(icon) : ''}`;
            const actions = this.treeActions.provideActionBar(element);
            templateData.actionBar.clear();
            templateData.actionBar.context = element.context;
            templateData.actionBar.push(actions.primary, { icon: true, label: false });
        }
    };
    TestRunElementRenderer = TestRunElementRenderer_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], TestRunElementRenderer);
    let TreeActionsProvider = class TreeActionsProvider {
        constructor(showRevealLocationOnMessages, requestReveal, contextKeyService, menuService, commandService, testProfileService, editorService) {
            this.showRevealLocationOnMessages = showRevealLocationOnMessages;
            this.requestReveal = requestReveal;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.commandService = commandService;
            this.testProfileService = testProfileService;
            this.editorService = editorService;
        }
        provideActionBar(element) {
            const test = element instanceof TestCaseElement ? element.test : undefined;
            const capabilities = test ? this.testProfileService.capabilitiesForTest(test) : 0;
            const contextKeys = [
                ['peek', "editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */],
                [testingContextKeys_1.TestingContextKeys.peekItemType.key, element.type],
            ];
            let id = actions_2.MenuId.TestPeekElement;
            const primary = [];
            const secondary = [];
            if (element instanceof TaskElement) {
                primary.push(new actions_1.Action('testing.outputPeek.showResultOutput', (0, nls_1.localize)('testing.showResultOutput', "Show Result Output"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.terminal), undefined, () => this.requestReveal.fire(new TaskSubject(element.results, element.index))));
            }
            if (element instanceof TestResultElement) {
                // only show if there are no collapsed test nodes that have more specific choices
                if (element.value.tasks.length === 1) {
                    primary.push(new actions_1.Action('testing.outputPeek.showResultOutput', (0, nls_1.localize)('testing.showResultOutput', "Show Result Output"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.terminal), undefined, () => this.requestReveal.fire(new TaskSubject(element.value, 0))));
                }
                primary.push(new actions_1.Action('testing.outputPeek.reRunLastRun', (0, nls_1.localize)('testing.reRunLastRun', "Rerun Test Run"), themables_1.ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('testing.reRunLastRun', element.value.id)));
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new actions_1.Action('testing.outputPeek.debugLastRun', (0, nls_1.localize)('testing.debugLastRun', "Debug Test Run"), themables_1.ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('testing.debugLastRun', element.value.id)));
                }
            }
            if (element instanceof TestCaseElement || element instanceof TestMessageElement) {
                contextKeys.push([testingContextKeys_1.TestingContextKeys.testResultOutdated.key, element.test.retired], ...(0, testItemContextOverlay_1.getTestItemContextOverlay)(element.test, capabilities));
            }
            if (element instanceof TestCaseElement) {
                const extId = element.test.item.extId;
                if (element.test.tasks[element.taskIndex].messages.some(m => m.type === 1 /* TestMessageType.Output */)) {
                    primary.push(new actions_1.Action('testing.outputPeek.showResultOutput', (0, nls_1.localize)('testing.showResultOutput', "Show Result Output"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.terminal), undefined, () => this.requestReveal.fire(element.outputSubject)));
                }
                secondary.push(new actions_1.Action('testing.outputPeek.revealInExplorer', (0, nls_1.localize)('testing.revealInExplorer', "Reveal in Test Explorer"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.listTree), undefined, () => this.commandService.executeCommand('_revealTestInExplorer', extId)));
                if (capabilities & 2 /* TestRunProfileBitset.Run */) {
                    primary.push(new actions_1.Action('testing.outputPeek.runTest', (0, nls_1.localize)('run test', 'Run Test'), themables_1.ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 2 /* TestRunProfileBitset.Run */, extId)));
                }
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new actions_1.Action('testing.outputPeek.debugTest', (0, nls_1.localize)('debug test', 'Debug Test'), themables_1.ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 4 /* TestRunProfileBitset.Debug */, extId)));
                }
                primary.push(new actions_1.Action('testing.outputPeek.goToFile', (0, nls_1.localize)('testing.goToFile', "Go to Source"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.goToFile), undefined, () => this.commandService.executeCommand('vscode.revealTest', extId)));
            }
            if (element instanceof TestMessageElement) {
                id = actions_2.MenuId.TestMessageContext;
                contextKeys.push([testingContextKeys_1.TestingContextKeys.testMessageContext.key, element.contextValue]);
                if (this.showRevealLocationOnMessages && element.location) {
                    primary.push(new actions_1.Action('testing.outputPeek.goToError', (0, nls_1.localize)('testing.goToError', "Go to Source"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.goToFile), undefined, () => this.editorService.openEditor({
                        resource: element.location.uri,
                        options: {
                            selection: element.location.range,
                            preserveFocus: true,
                        }
                    })));
                }
            }
            const contextOverlay = this.contextKeyService.createOverlay(contextKeys);
            const result = { primary, secondary };
            const menu = this.menuService.createMenu(id, contextOverlay);
            try {
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { arg: element.context }, result, 'inline');
                return result;
            }
            finally {
                menu.dispose();
            }
        }
    };
    TreeActionsProvider = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, actions_2.IMenuService),
        __param(4, commands_1.ICommandService),
        __param(5, testProfileService_1.ITestProfileService),
        __param(6, editorService_1.IEditorService)
    ], TreeActionsProvider);
    const navWhen = contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, testingContextKeys_1.TestingContextKeys.isPeekVisible);
    /**
     * Gets the appropriate editor for peeking based on the currently focused editor.
     */
    const getPeekedEditorFromFocus = (codeEditorService) => {
        const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
        return editor && getPeekedEditor(codeEditorService, editor);
    };
    /**
     * Gets the editor where the peek may be shown, bubbling upwards if the given
     * editor is embedded (i.e. inside a peek already).
     */
    const getPeekedEditor = (codeEditorService, editor) => {
        if (TestingOutputPeekController.get(editor)?.subject) {
            return editor;
        }
        if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            return editor.getParentEditor();
        }
        const outer = getOuterEditorFromDiffEditor(codeEditorService);
        if (outer) {
            return outer;
        }
        return editor;
    };
    class GoToNextMessageAction extends actions_2.Action2 {
        static { this.ID = 'testing.goToNextMessage'; }
        constructor() {
            super({
                id: GoToNextMessageAction.ID,
                f1: true,
                title: (0, nls_1.localize2)('testing.goToNextMessage', 'Go to Next Test Failure'),
                icon: codicons_1.Codicon.arrowDown,
                category: actionCommonCategories_1.Categories.Test,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    when: navWhen,
                },
                menu: [{
                        id: actions_2.MenuId.TestPeekTitle,
                        group: 'navigation',
                        order: 2,
                    }, {
                        id: actions_2.MenuId.CommandPalette,
                        when: navWhen
                    }],
            });
        }
        run(accessor) {
            const editor = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.ICodeEditorService));
            if (editor) {
                TestingOutputPeekController.get(editor)?.next();
            }
        }
    }
    exports.GoToNextMessageAction = GoToNextMessageAction;
    class GoToPreviousMessageAction extends actions_2.Action2 {
        static { this.ID = 'testing.goToPreviousMessage'; }
        constructor() {
            super({
                id: GoToPreviousMessageAction.ID,
                f1: true,
                title: (0, nls_1.localize2)('testing.goToPreviousMessage', 'Go to Previous Test Failure'),
                icon: codicons_1.Codicon.arrowUp,
                category: actionCommonCategories_1.Categories.Test,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    when: navWhen
                },
                menu: [{
                        id: actions_2.MenuId.TestPeekTitle,
                        group: 'navigation',
                        order: 1,
                    }, {
                        id: actions_2.MenuId.CommandPalette,
                        when: navWhen
                    }],
            });
        }
        run(accessor) {
            const editor = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.ICodeEditorService));
            if (editor) {
                TestingOutputPeekController.get(editor)?.previous();
            }
        }
    }
    exports.GoToPreviousMessageAction = GoToPreviousMessageAction;
    class OpenMessageInEditorAction extends actions_2.Action2 {
        static { this.ID = 'testing.openMessageInEditor'; }
        constructor() {
            super({
                id: OpenMessageInEditorAction.ID,
                f1: false,
                title: (0, nls_1.localize2)('testing.openMessageInEditor', 'Open in Editor'),
                icon: codicons_1.Codicon.goToFile,
                category: actionCommonCategories_1.Categories.Test,
                menu: [{ id: actions_2.MenuId.TestPeekTitle }],
            });
        }
        run(accessor) {
            accessor.get(testingPeekOpener_1.ITestingPeekOpener).openCurrentInEditor();
        }
    }
    exports.OpenMessageInEditorAction = OpenMessageInEditorAction;
    class ToggleTestingPeekHistory extends actions_2.Action2 {
        static { this.ID = 'testing.toggleTestingPeekHistory'; }
        constructor() {
            super({
                id: ToggleTestingPeekHistory.ID,
                f1: true,
                title: (0, nls_1.localize2)('testing.toggleTestingPeekHistory', 'Toggle Test History in Peek'),
                icon: codicons_1.Codicon.history,
                category: actionCommonCategories_1.Categories.Test,
                menu: [{
                        id: actions_2.MenuId.TestPeekTitle,
                        group: 'navigation',
                        order: 3,
                    }],
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 38 /* KeyCode.KeyH */,
                    when: testingContextKeys_1.TestingContextKeys.isPeekVisible.isEqualTo(true),
                },
            });
        }
        run(accessor) {
            const opener = accessor.get(testingPeekOpener_1.ITestingPeekOpener);
            opener.historyVisible.value = !opener.historyVisible.value;
        }
    }
    exports.ToggleTestingPeekHistory = ToggleTestingPeekHistory;
    class CreationCache {
        constructor() {
            this.v = new WeakMap();
        }
        get(key) {
            return this.v.get(key);
        }
        getOrCreate(ref, factory) {
            const existing = this.v.get(ref);
            if (existing) {
                return existing;
            }
            const fresh = factory();
            this.v.set(ref, fresh);
            return fresh;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ091dHB1dFBlZWsuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvYnJvd3Nlci90ZXN0aW5nT3V0cHV0UGVlay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUdoRyxNQUFNLGNBQWM7UUFRbkIsSUFBVyxVQUFVO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLGtDQUEwQixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVELElBQVcsWUFBWTtZQUN0QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxrQ0FBMEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM1RixDQUFDO1FBRUQsSUFBVyxPQUFPO1lBQ2pCLE9BQU87Z0JBQ04sSUFBSSwyQ0FBa0M7Z0JBQ3RDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7Z0JBQ3RCLE9BQU8sRUFBRSx3QkFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQzdDLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFBNEIsTUFBbUIsRUFBRSxJQUFvQixFQUFrQixTQUFpQixFQUFrQixZQUFvQjtZQUFsSCxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQXdDLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFBa0IsaUJBQVksR0FBWixZQUFZLENBQVE7WUFDN0ksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3RCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ2hELElB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