(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, proxyIdentifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostContext = exports.MainContext = exports.ExtHostTestingResource = exports.ISuggestResultDtoField = exports.ISuggestDataDtoField = exports.IdObject = exports.CandidatePortSource = exports.NotebookEditorRevealType = exports.CellOutputKind = exports.WebviewMessageArrayBufferViewType = exports.WebviewEditorCapabilities = exports.TabModelOperationKind = exports.TabInputKind = exports.TextEditorRevealType = void 0;
    var TextEditorRevealType;
    (function (TextEditorRevealType) {
        TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
        TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
        TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
    })(TextEditorRevealType || (exports.TextEditorRevealType = TextEditorRevealType = {}));
    //#region --- tabs model
    var TabInputKind;
    (function (TabInputKind) {
        TabInputKind[TabInputKind["UnknownInput"] = 0] = "UnknownInput";
        TabInputKind[TabInputKind["TextInput"] = 1] = "TextInput";
        TabInputKind[TabInputKind["TextDiffInput"] = 2] = "TextDiffInput";
        TabInputKind[TabInputKind["TextMergeInput"] = 3] = "TextMergeInput";
        TabInputKind[TabInputKind["NotebookInput"] = 4] = "NotebookInput";
        TabInputKind[TabInputKind["NotebookDiffInput"] = 5] = "NotebookDiffInput";
        TabInputKind[TabInputKind["CustomEditorInput"] = 6] = "CustomEditorInput";
        TabInputKind[TabInputKind["WebviewEditorInput"] = 7] = "WebviewEditorInput";
        TabInputKind[TabInputKind["TerminalEditorInput"] = 8] = "TerminalEditorInput";
        TabInputKind[TabInputKind["InteractiveEditorInput"] = 9] = "InteractiveEditorInput";
        TabInputKind[TabInputKind["ChatEditorInput"] = 10] = "ChatEditorInput";
    })(TabInputKind || (exports.TabInputKind = TabInputKind = {}));
    var TabModelOperationKind;
    (function (TabModelOperationKind) {
        TabModelOperationKind[TabModelOperationKind["TAB_OPEN"] = 0] = "TAB_OPEN";
        TabModelOperationKind[TabModelOperationKind["TAB_CLOSE"] = 1] = "TAB_CLOSE";
        TabModelOperationKind[TabModelOperationKind["TAB_UPDATE"] = 2] = "TAB_UPDATE";
        TabModelOperationKind[TabModelOperationKind["TAB_MOVE"] = 3] = "TAB_MOVE";
    })(TabModelOperationKind || (exports.TabModelOperationKind = TabModelOperationKind = {}));
    var WebviewEditorCapabilities;
    (function (WebviewEditorCapabilities) {
        WebviewEditorCapabilities[WebviewEditorCapabilities["Editable"] = 0] = "Editable";
        WebviewEditorCapabilities[WebviewEditorCapabilities["SupportsHotExit"] = 1] = "SupportsHotExit";
    })(WebviewEditorCapabilities || (exports.WebviewEditorCapabilities = WebviewEditorCapabilities = {}));
    var WebviewMessageArrayBufferViewType;
    (function (WebviewMessageArrayBufferViewType) {
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int8Array"] = 1] = "Int8Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint8Array"] = 2] = "Uint8Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint8ClampedArray"] = 3] = "Uint8ClampedArray";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int16Array"] = 4] = "Int16Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint16Array"] = 5] = "Uint16Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int32Array"] = 6] = "Int32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint32Array"] = 7] = "Uint32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Float32Array"] = 8] = "Float32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Float64Array"] = 9] = "Float64Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["BigInt64Array"] = 10] = "BigInt64Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["BigUint64Array"] = 11] = "BigUint64Array";
    })(WebviewMessageArrayBufferViewType || (exports.WebviewMessageArrayBufferViewType = WebviewMessageArrayBufferViewType = {}));
    var CellOutputKind;
    (function (CellOutputKind) {
        CellOutputKind[CellOutputKind["Text"] = 1] = "Text";
        CellOutputKind[CellOutputKind["Error"] = 2] = "Error";
        CellOutputKind[CellOutputKind["Rich"] = 3] = "Rich";
    })(CellOutputKind || (exports.CellOutputKind = CellOutputKind = {}));
    var NotebookEditorRevealType;
    (function (NotebookEditorRevealType) {
        NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
    })(NotebookEditorRevealType || (exports.NotebookEditorRevealType = NotebookEditorRevealType = {}));
    var CandidatePortSource;
    (function (CandidatePortSource) {
        CandidatePortSource[CandidatePortSource["None"] = 0] = "None";
        CandidatePortSource[CandidatePortSource["Process"] = 1] = "Process";
        CandidatePortSource[CandidatePortSource["Output"] = 2] = "Output";
    })(CandidatePortSource || (exports.CandidatePortSource = CandidatePortSource = {}));
    class IdObject {
        static { this._n = 0; }
        static mixin(object) {
            object._id = IdObject._n++;
            return object;
        }
    }
    exports.IdObject = IdObject;
    var ISuggestDataDtoField;
    (function (ISuggestDataDtoField) {
        ISuggestDataDtoField["label"] = "a";
        ISuggestDataDtoField["kind"] = "b";
        ISuggestDataDtoField["detail"] = "c";
        ISuggestDataDtoField["documentation"] = "d";
        ISuggestDataDtoField["sortText"] = "e";
        ISuggestDataDtoField["filterText"] = "f";
        ISuggestDataDtoField["preselect"] = "g";
        ISuggestDataDtoField["insertText"] = "h";
        ISuggestDataDtoField["insertTextRules"] = "i";
        ISuggestDataDtoField["range"] = "j";
        ISuggestDataDtoField["commitCharacters"] = "k";
        ISuggestDataDtoField["additionalTextEdits"] = "l";
        ISuggestDataDtoField["kindModifier"] = "m";
        ISuggestDataDtoField["commandIdent"] = "n";
        ISuggestDataDtoField["commandId"] = "o";
        ISuggestDataDtoField["commandArguments"] = "p";
    })(ISuggestDataDtoField || (exports.ISuggestDataDtoField = ISuggestDataDtoField = {}));
    var ISuggestResultDtoField;
    (function (ISuggestResultDtoField) {
        ISuggestResultDtoField["defaultRanges"] = "a";
        ISuggestResultDtoField["completions"] = "b";
        ISuggestResultDtoField["isIncomplete"] = "c";
        ISuggestResultDtoField["duration"] = "d";
    })(ISuggestResultDtoField || (exports.ISuggestResultDtoField = ISuggestResultDtoField = {}));
    var ExtHostTestingResource;
    (function (ExtHostTestingResource) {
        ExtHostTestingResource[ExtHostTestingResource["Workspace"] = 0] = "Workspace";
        ExtHostTestingResource[ExtHostTestingResource["TextDocument"] = 1] = "TextDocument";
    })(ExtHostTestingResource || (exports.ExtHostTestingResource = ExtHostTestingResource = {}));
    // --- proxy identifiers
    exports.MainContext = {
        MainThreadAuthentication: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadAuthentication'),
        MainThreadBulkEdits: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadBulkEdits'),
        MainThreadChatProvider: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatProvider'),
        MainThreadChatAgents2: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatAgents2'),
        MainThreadChatVariables: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatVariables'),
        MainThreadClipboard: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadClipboard'),
        MainThreadCommands: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadCommands'),
        MainThreadComments: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadComments'),
        MainThreadConfiguration: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadConfiguration'),
        MainThreadConsole: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadConsole'),
        MainThreadDebugService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDebugService'),
        MainThreadDecorations: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDecorations'),
        MainThreadDiagnostics: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDiagnostics'),
        MainThreadDialogs: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDiaglogs'),
        MainThreadDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDocuments'),
        MainThreadDocumentContentProviders: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDocumentContentProviders'),
        MainThreadTextEditors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTextEditors'),
        MainThreadEditorInsets: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadEditorInsets'),
        MainThreadEditorTabs: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadEditorTabs'),
        MainThreadErrors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadErrors'),
        MainThreadTreeViews: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTreeViews'),
        MainThreadDownloadService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDownloadService'),
        MainThreadLanguageFeatures: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLanguageFeatures'),
        MainThreadLanguages: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLanguages'),
        MainThreadLogger: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLogger'),
        MainThreadMessageService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadMessageService'),
        MainThreadOutputService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadOutputService'),
        MainThreadProgress: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadProgress'),
        MainThreadQuickDiff: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadQuickDiff'),
        MainThreadQuickOpen: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadQuickOpen'),
        MainThreadStatusBar: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadStatusBar'),
        MainThreadSecretState: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSecretState'),
        MainThreadStorage: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadStorage'),
        MainThreadSpeech: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSpeechProvider'),
        MainThreadTelemetry: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTelemetry'),
        MainThreadTerminalService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTerminalService'),
        MainThreadWebviews: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWebviews'),
        MainThreadWebviewPanels: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWebviewPanels'),
        MainThreadWebviewViews: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWebviewViews'),
        MainThreadCustomEditors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadCustomEditors'),
        MainThreadUrls: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadUrls'),
        MainThreadUriOpeners: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadUriOpeners'),
        MainThreadProfileContentHandlers: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadProfileContentHandlers'),
        MainThreadWorkspace: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWorkspace'),
        MainThreadFileSystem: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadFileSystem'),
        MainThreadFileSystemEventService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadFileSystemEventService'),
        MainThreadExtensionService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadExtensionService'),
        MainThreadSCM: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSCM'),
        MainThreadSearch: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSearch'),
        MainThreadShare: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadShare'),
        MainThreadTask: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTask'),
        MainThreadWindow: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWindow'),
        MainThreadLabelService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLabelService'),
        MainThreadNotebook: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebook'),
        MainThreadNotebookDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookDocumentsShape'),
        MainThreadNotebookEditors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookEditorsShape'),
        MainThreadNotebookKernels: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookKernels'),
        MainThreadNotebookRenderers: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookRenderers'),
        MainThreadInteractive: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadInteractive'),
        MainThreadChat: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChat'),
        MainThreadInlineChat: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadInlineChatShape'),
        MainThreadTheming: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTheming'),
        MainThreadTunnelService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTunnelService'),
        MainThreadManagedSockets: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadManagedSockets'),
        MainThreadTimeline: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTimeline'),
        MainThreadTesting: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTesting'),
        MainThreadLocalization: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLocalizationShape'),
        MainThreadAiRelatedInformation: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadAiRelatedInformation'),
        MainThreadAiEmbeddingVector: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadAiEmbeddingVector'),
        MainThreadIssueReporter: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadIssueReporter'),
    };
    exports.ExtHostContext = {
        ExtHostCommands: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostCommands'),
        ExtHostConfiguration: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostConfiguration'),
        ExtHostDiagnostics: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDiagnostics'),
        ExtHostDebugService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDebugService'),
        ExtHostDecorations: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDecorations'),
        ExtHostDocumentsAndEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocumentsAndEditors'),
        ExtHostDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocuments'),
        ExtHostDocumentContentProviders: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocumentContentProviders'),
        ExtHostDocumentSaveParticipant: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocumentSaveParticipant'),
        ExtHostEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostEditors'),
        ExtHostTreeViews: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTreeViews'),
        ExtHostFileSystem: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostFileSystem'),
        ExtHostFileSystemInfo: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostFileSystemInfo'),
        ExtHostFileSystemEventService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostFileSystemEventService'),
        ExtHostLanguages: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLanguages'),
        ExtHostLanguageFeatures: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLanguageFeatures'),
        ExtHostQuickOpen: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostQuickOpen'),
        ExtHostQuickDiff: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostQuickDiff'),
        ExtHostStatusBar: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostStatusBar'),
        ExtHostShare: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostShare'),
        ExtHostExtensionService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostExtensionService'),
        ExtHostLogLevelServiceShape: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLogLevelServiceShape'),
        ExtHostTerminalService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTerminalService'),
        ExtHostSCM: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSCM'),
        ExtHostSearch: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSearch'),
        ExtHostTask: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTask'),
        ExtHostWorkspace: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWorkspace'),
        ExtHostWindow: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWindow'),
        ExtHostWebviews: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWebviews'),
        ExtHostWebviewPanels: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWebviewPanels'),
        ExtHostCustomEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostCustomEditors'),
        ExtHostWebviewViews: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWebviewViews'),
        ExtHostEditorInsets: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostEditorInsets'),
        ExtHostEditorTabs: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostEditorTabs'),
        ExtHostProgress: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostProgress'),
        ExtHostComments: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostComments'),
        ExtHostSecretState: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSecretState'),
        ExtHostStorage: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostStorage'),
        ExtHostUrls: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostUrls'),
        ExtHostUriOpeners: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostUriOpeners'),
        ExtHostProfileContentHandlers: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostProfileContentHandlers'),
        ExtHostOutputService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostOutputService'),
        ExtHostLabelService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLabelService'),
        ExtHostNotebook: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebook'),
        ExtHostNotebookDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookDocuments'),
        ExtHostNotebookEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookEditors'),
        ExtHostNotebookKernels: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookKernels'),
        ExtHostNotebookRenderers: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookRenderers'),
        ExtHostNotebookDocumentSaveParticipant: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookDocumentSaveParticipant'),
        ExtHostInteractive: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostInteractive'),
        ExtHostInlineChat: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostInlineChatShape'),
        ExtHostChat: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChat'),
        ExtHostChatAgents2: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatAgents'),
        ExtHostChatVariables: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatVariables'),
        ExtHostChatProvider: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatProvider'),
        ExtHostSpeech: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSpeech'),
        ExtHostAiRelatedInformation: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostAiRelatedInformation'),
        ExtHostAiEmbeddingVector: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostAiEmbeddingVector'),
        ExtHostTheming: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTheming'),
        ExtHostTunnelService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTunnelService'),
        ExtHostManagedSockets: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostManagedSockets'),
        ExtHostAuthentication: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostAuthentication'),
        ExtHostTimeline: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTimeline'),
        ExtHostTesting: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTesting'),
        ExtHostTelemetry: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTelemetry'),
        ExtHostLocalization: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLocalization'),
        ExtHostIssueReporter: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostIssueReporter'),
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdC5wcm90b2NvbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdC5wcm90b2NvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0T2hHLElBQVksb0JBS1g7SUFMRCxXQUFZLG9CQUFvQjtRQUMvQixxRUFBVyxDQUFBO1FBQ1gsdUVBQVksQ0FBQTtRQUNaLHlHQUE2QixDQUFBO1FBQzdCLGlFQUFTLENBQUE7SUFDVixDQUFDLEVBTFcsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFLL0I7SUFvYkQsd0JBQXdCO0lBRXhCLElBQWtCLFlBWWpCO0lBWkQsV0FBa0IsWUFBWTtRQUM3QiwrREFBWSxDQUFBO1FBQ1oseURBQVMsQ0FBQTtRQUNULGlFQUFhLENBQUE7UUFDYixtRUFBYyxDQUFBO1FBQ2QsaUVBQWEsQ0FBQTtRQUNiLHlFQUFpQixDQUFBO1FBQ2pCLHlFQUFpQixDQUFBO1FBQ2pCLDJFQUFrQixDQUFBO1FBQ2xCLDZFQUFtQixDQUFBO1FBQ25CLG1GQUFzQixDQUFBO1FBQ3RCLHNFQUFlLENBQUE7SUFDaEIsQ0FBQyxFQVppQixZQUFZLDRCQUFaLFlBQVksUUFZN0I7SUFFRCxJQUFrQixxQkFLakI7SUFMRCxXQUFrQixxQkFBcUI7UUFDdEMseUVBQVEsQ0FBQTtRQUNSLDJFQUFTLENBQUE7UUFDVCw2RUFBVSxDQUFBO1FBQ1YseUVBQVEsQ0FBQTtJQUNULENBQUMsRUFMaUIscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFLdEM7SUE2SEQsSUFBWSx5QkFHWDtJQUhELFdBQVkseUJBQXlCO1FBQ3BDLGlGQUFRLENBQUE7UUFDUiwrRkFBZSxDQUFBO0lBQ2hCLENBQUMsRUFIVyx5QkFBeUIseUNBQXpCLHlCQUF5QixRQUdwQztJQXdCRCxJQUFrQixpQ0FZakI7SUFaRCxXQUFrQixp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SUFBQSx1Q0FBcUIsRUFBMEIsb0JBQW9CLENBQUM7UUFDeEYsdUJBQXVCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBK0IseUJBQXlCLENBQUM7UUFDdkcsaUJBQWlCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBeUIsbUJBQW1CLENBQUM7UUFDckYsc0JBQXNCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBOEIsd0JBQXdCLENBQUM7UUFDcEcscUJBQXFCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBNkIsdUJBQXVCLENBQUM7UUFDakcscUJBQXFCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBNkIsdUJBQXVCLENBQUM7UUFDakcsaUJBQWlCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBMEIsb0JBQW9CLENBQUM7UUFDdkYsbUJBQW1CLEVBQUUsSUFBQSx1Q0FBcUIsRUFBMkIscUJBQXFCLENBQUM7UUFDM0Ysa0NBQWtDLEVBQUUsSUFBQSx1Q0FBcUIsRUFBMEMsb0NBQW9DLENBQUM7UUFDeEkscUJBQXFCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBNkIsdUJBQXVCLENBQUM7UUFDakcsc0JBQXNCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBOEIsd0JBQXdCLENBQUM7UUFDcEcsb0JBQW9CLEVBQUUsSUFBQSx1Q0FBcUIsRUFBNEIsc0JBQXNCLENBQUM7UUFDOUYsZ0JBQWdCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBd0Isa0JBQWtCLENBQUM7UUFDbEYsbUJBQW1CLEVBQUUsSUFBQSx1Q0FBcUIsRUFBMkIscUJBQXFCLENBQUM7UUFDM0YseUJBQXlCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBaUMsMkJBQTJCLENBQUM7UUFDN0csMEJBQTBCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBa0MsNEJBQTRCLENBQUM7UUFDaEgsbUJBQW1CLEVBQUUsSUFBQSx1Q0FBcUIsRUFBMkIscUJBQXFCLENBQUM7UUFDM0YsZ0JBQWdCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBd0Isa0JBQWtCLENBQUM7UUFDbEYsd0JBQXdCLEVBQUUsSUFBQSx1Q0FBcUIsRUFBZ0MsMEJBQTBCLENBQUM7UUFDMUcs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
//# sourceURL=../../../vs/workbench/api/common/extHost.protocol.js
})