/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["exports","require","vs/base/common/lifecycle","vs/nls","vs/nls!vs/workbench/workbench.web.main","vs/platform/instantiation/common/instantiation","vs/base/common/event","vs/platform/contextkey/common/contextkey","vs/base/browser/dom","vs/platform/configuration/common/configuration","vs/base/common/uri","vs/base/common/async","vs/platform/actions/common/actions","vs/base/common/arrays","vs/base/common/platform","vs/base/common/types","vs/editor/common/core/range","vs/base/common/errors","vs/platform/registry/common/platform","vs/workbench/services/editor/common/editorService","vs/platform/log/common/log","vs/base/common/resources","vs/platform/storage/common/storage","vs/base/common/network","vs/css!vs/workbench/workbench.web.main","vs/platform/files/common/files","vs/platform/theme/common/themeService","vs/base/common/cancellation","vs/base/common/codicons","vs/platform/telemetry/common/telemetry","vs/base/common/strings","vs/platform/commands/common/commands","vs/base/common/themables","vs/platform/notification/common/notification","vs/platform/instantiation/common/extensions","vs/platform/keybinding/common/keybinding","vs/platform/workspace/common/workspace","vs/base/common/actions","vs/platform/theme/common/colorRegistry","vs/platform/contextview/browser/contextView","vs/editor/browser/editorExtensions","vs/editor/common/core/position","vs/workbench/services/extensions/common/extensions","vs/platform/opener/common/opener","vs/platform/quickinput/common/quickInput","vs/workbench/common/contributions","vs/workbench/common/editor","vs/editor/common/languages/language","vs/platform/uriIdentity/common/uriIdentity","vs/platform/dialogs/common/dialogs","vs/base/common/map","vs/editor/common/services/model","vs/platform/product/common/productService","vs/platform/label/common/label","vs/workbench/common/views","vs/base/common/objects","vs/workbench/services/environment/common/environmentService","vs/workbench/contrib/notebook/common/notebookCommon","vs/base/common/buffer","vs/editor/common/editorContextKeys","vs/platform/configuration/common/configurationRegistry","vs/base/common/path","vs/platform/theme/common/iconRegistry","vs/editor/common/services/languageFeatures","vs/workbench/services/editor/common/editorGroupsService","vs/workbench/api/common/extHost.protocol","vs/base/browser/window","vs/editor/common/services/resolverService","vs/editor/browser/services/codeEditorService","vs/workbench/services/extensions/common/extHostCustomers","vs/workbench/services/host/browser/host","vs/base/common/observable","vs/platform/progress/common/progress","vs/platform/theme/browser/defaultStyles","vs/platform/list/browser/listService","vs/base/common/iterator","vs/platform/action/common/actionCommonCategories","vs/base/common/uuid","vs/platform/actions/browser/menuEntryActionViewItem","vs/workbench/common/contextkeys","vs/base/common/htmlContent","vs/base/common/severity","vs/base/common/color","vs/editor/common/core/selection","vs/platform/instantiation/common/descriptors","vs/workbench/services/views/common/viewsService","vs/base/browser/ui/actionbar/actionbar","vs/editor/common/languages","vs/platform/accessibility/common/accessibility","vs/workbench/contrib/debug/common/debug","vs/workbench/services/lifecycle/common/lifecycle","vs/workbench/contrib/notebook/browser/notebookBrowser","vs/base/browser/keyboardEvent","vs/platform/environment/common/environment","vs/platform/extensionManagement/common/extensionManagement","vs/workbench/services/textfile/common/textfiles","vs/workbench/services/layout/browser/layoutService","vs/editor/common/model/textModel","vs/base/browser/ui/aria/aria","vs/platform/extensions/common/extensions","vs/platform/clipboard/common/clipboardService","vs/platform/userDataSync/common/userDataSync","vs/base/common/filters","vs/editor/browser/editorBrowser","vs/workbench/common/theme","vs/workbench/services/userDataProfile/common/userDataProfile","vs/editor/common/model","vs/platform/userDataProfile/common/userDataProfile","vs/base/common/keyCodes","vs/base/common/decorators","vs/editor/common/services/textResourceConfiguration","vs/platform/extensionManagement/common/extensionManagementUtil","vs/workbench/services/remote/common/remoteAgentService","vs/base/browser/browser","vs/base/common/hash","vs/workbench/browser/parts/views/viewPane","vs/platform/instantiation/common/serviceCollection","vs/workbench/services/preferences/common/preferences","vs/editor/common/languages/languageConfigurationRegistry","vs/workbench/contrib/terminal/browser/terminal","vs/workbench/services/panecomposite/browser/panecomposite","vs/base/common/errorMessage","vs/platform/keybinding/common/keybindingsRegistry","vs/workbench/contrib/extensions/common/extensions","vs/base/browser/mouseEvent","vs/workbench/services/path/common/pathService","vs/editor/common/config/editorOptions","vs/platform/markers/common/markers","vs/editor/common/languages/modesRegistry","vs/workbench/contrib/notebook/common/notebookService","vs/workbench/services/extensionManagement/common/extensionManagement","vs/editor/common/core/editOperation","vs/platform/terminal/common/terminal","vs/workbench/services/extensions/common/extensionsRegistry","vs/workbench/services/filesConfiguration/common/filesConfigurationService","vs/base/browser/fastDomNode","vs/base/common/json","vs/base/browser/ui/iconLabel/iconLabels","vs/editor/browser/services/bulkEditService","vs/base/common/stopwatch","vs/base/common/marshalling","vs/base/browser/touch","vs/base/browser/ui/scrollbar/scrollableElement","vs/platform/workspace/common/workspaceTrust","vs/workbench/services/environment/browser/environmentService","vs/base/browser/ui/actionbar/actionViewItems","vs/platform/contextkey/common/contextkeys","vs/base/common/lazy","vs/platform/accessibilitySignal/browser/accessibilitySignalService","vs/workbench/contrib/terminal/common/terminal","vs/workbench/contrib/notebook/common/notebookContextKeys","vs/base/browser/ui/button/button","vs/base/common/numbers","vs/base/common/labels","vs/workbench/contrib/notebook/common/notebookExecutionStateService","vs/platform/actions/browser/toolbar","vs/workbench/services/editor/common/editorResolverService","vs/workbench/services/workingCopy/common/workingCopyService","vs/base/common/arraysFind","vs/platform/hover/browser/hover","vs/platform/theme/common/theme","vs/workbench/services/statusbar/browser/statusbar","vs/base/common/performance","vs/base/browser/ui/widget","vs/base/common/glob","vs/platform/telemetry/common/telemetryUtils","vs/workbench/contrib/files/common/files","vs/workbench/browser/editor","vs/workbench/browser/parts/views/viewPaneContainer","vs/platform/layout/browser/layoutService","vs/platform/undoRedo/common/undoRedo","vs/workbench/contrib/terminal/common/terminalContextKey","vs/workbench/common/configuration","vs/workbench/services/search/common/search","vs/workbench/browser/parts/editor/editorCommands","vs/base/common/assert","vs/base/common/mime","vs/platform/editor/common/editor","vs/editor/common/services/editorWorker","vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer","vs/platform/remote/common/remoteAuthorityResolver","vs/editor/browser/widget/codeEditorWidget","vs/workbench/services/configuration/common/configuration","vs/base/common/linkedList","vs/base/browser/event","vs/editor/common/core/lineRange","vs/platform/jsonschemas/common/jsonContributionRegistry","vs/editor/contrib/snippet/browser/snippetController2","vs/workbench/contrib/chat/browser/chat","vs/workbench/contrib/notebook/common/notebookKernelService","vs/workbench/services/activity/common/activity","vs/workbench/services/extensionManagement/common/extensionFeatures","vs/workbench/contrib/notebook/browser/controller/coreActions","vs/base/browser/ui/hover/hoverDelegate","vs/base/common/date","vs/base/browser/ui/list/listWidget","vs/workbench/common/editor/editorInput","vs/workbench/common/memento","vs/workbench/browser/parts/editor/editorPane","vs/workbench/contrib/chat/common/chatService","vs/workbench/browser/labels","vs/base/common/extpath","vs/base/browser/markdownRenderer","vs/editor/browser/widget/embeddedCodeEditorWidget","vs/workbench/contrib/notebook/browser/view/cellPart","vs/workbench/contrib/testing/common/testId","vs/workbench/contrib/inlineChat/common/inlineChat","vs/base/common/iconLabels","vs/editor/browser/view/viewPart","vs/workbench/common/editor/sideBySideEditorInput","vs/workbench/contrib/debug/common/debugModel","vs/base/browser/ui/toggle/toggle","vs/editor/contrib/peekView/browser/peekView","vs/workbench/contrib/chat/common/chatContextKeys","vs/workbench/contrib/notebook/browser/notebookIcons","vs/workbench/contrib/webview/browser/webview","vs/workbench/services/output/common/output","vs/workbench/contrib/accessibility/browser/accessibleView","vs/workbench/services/workingCopy/common/workingCopyBackup","vs/workbench/services/workingCopy/common/workingCopyFileService","vs/base/common/functional","vs/editor/common/core/offsetRange","vs/editor/contrib/codeAction/common/types","vs/base/common/process","vs/base/browser/dnd","vs/base/browser/ui/iconLabel/iconLabelHover","vs/base/browser/ui/inputbox/inputBox","vs/platform/dnd/browser/dnd","vs/editor/common/services/getIconClasses","vs/editor/common/core/editorColorRegistry","vs/platform/workspace/common/virtualWorkspace","vs/workbench/contrib/chat/common/chatParserTypes","vs/workbench/contrib/debug/browser/debugIcons","vs/workbench/common/editor/diffEditorInput","vs/workbench/browser/dnd","vs/base/browser/pixelRatio","vs/base/browser/ui/splitview/splitview","vs/base/browser/ui/iconLabel/iconLabel","vs/platform/quickinput/common/quickAccess","vs/workbench/contrib/chat/common/chatAgents","vs/workbench/contrib/notebook/browser/services/notebookEditorService","vs/workbench/contrib/scm/common/scm","vs/workbench/services/themes/common/workbenchThemeService","vs/editor/browser/config/domFontInfo","vs/editor/contrib/snippet/browser/snippetParser","vs/platform/remote/common/remoteHosts","vs/platform/request/common/request","vs/platform/tunnel/common/tunnel","vs/platform/window/common/window","vs/editor/contrib/suggest/browser/suggestController","vs/platform/workspaces/common/workspaces","vs/workbench/contrib/debug/common/debugUtils","vs/workbench/contrib/mergeEditor/browser/utils","vs/workbench/contrib/testing/common/testTypes","vs/workbench/contrib/notebook/common/notebookEditorInput","vs/workbench/services/history/common/history","vs/workbench/contrib/chat/browser/actions/chatActions","vs/workbench/contrib/search/browser/searchModel","vs/workbench/contrib/terminal/browser/terminalActions","vs/workbench/services/extensions/common/extensionManifestPropertiesService","vs/editor/common/cursorCommon","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length","vs/base/browser/canIUse","vs/base/browser/ui/highlightedlabel/highlightedLabel","vs/editor/common/services/languageFeatureDebounce","vs/platform/quickinput/browser/pickerQuickAccess","vs/platform/history/browser/contextScopedHistoryWidget","vs/editor/contrib/suggest/browser/suggest","vs/workbench/contrib/notebook/browser/notebookEditorExtensions","vs/workbench/contrib/terminal/browser/terminalExtensions","vs/workbench/contrib/testing/common/testResultService","vs/workbench/services/configurationResolver/common/configurationResolver","vs/workbench/contrib/accessibility/browser/accessibilityConfiguration","vs/workbench/services/workingCopy/common/workingCopyEditorService","vs/base/common/keybindings","vs/base/common/stream","vs/editor/common/core/cursorColumns","vs/editor/common/viewModel","vs/base/browser/ui/sash/sash","vs/editor/browser/widget/diffEditor/utils","vs/platform/opener/browser/link","vs/workbench/common/editor/editorModel","vs/workbench/contrib/preferences/common/preferences","vs/workbench/contrib/tasks/common/taskService","vs/workbench/contrib/testing/common/testingContextKeys","vs/workbench/contrib/testing/common/testProfileService","vs/workbench/services/editor/common/editorGroupColumn","vs/workbench/contrib/comments/browser/commentService","vs/workbench/contrib/files/browser/files","vs/workbench/contrib/extensions/browser/extensionsActions","vs/base/browser/ui/tree/tree","vs/base/common/ternarySearchTree","vs/editor/common/core/wordHelper","vs/editor/contrib/hover/browser/hoverTypes","vs/base/browser/ui/dropdown/dropdownActionViewItem","vs/editor/contrib/editorState/browser/editorState","vs/editor/contrib/codeAction/browser/codeAction","vs/platform/extensionResourceLoader/common/extensionResourceLoader","vs/workbench/contrib/notebook/common/notebookRange","vs/workbench/contrib/search/common/constants","vs/workbench/contrib/terminal/common/terminalStrings","vs/workbench/contrib/testing/common/testService","vs/workbench/services/authentication/common/authentication","vs/workbench/services/extensionRecommendations/common/extensionRecommendations","vs/workbench/services/remote/common/remoteExplorerService","vs/workbench/common/editor/textResourceEditorInput","vs/workbench/contrib/accessibility/browser/accessibleViewActions","vs/workbench/contrib/debug/browser/debugCommands","vs/workbench/contrib/inlineChat/browser/inlineChatController","vs/workbench/contrib/search/browser/searchActionsBase","vs/base/browser/trustedTypes","vs/base/common/jsonFormatter","vs/base/common/linkedText","vs/base/common/marked/marked","vs/base/common/dataTransfer","vs/editor/common/diff/rangeMapping","vs/base/browser/ui/countBadge/countBadge","vs/base/browser/ui/keybindingLabel/keybindingLabel","vs/base/browser/ui/progressbar/progressbar","vs/base/browser/ui/toolbar/toolbar","vs/base/browser/ui/tree/abstractTree","vs/editor/common/core/stringBuilder","vs/editor/common/config/fontInfo","vs/editor/browser/widget/diffEditor/diffEditorWidget","vs/platform/userDataSync/common/abstractSynchronizer","vs/workbench/browser/quickaccess","vs/workbench/contrib/chat/common/chatViewModel","vs/workbench/contrib/comments/common/commentContextKeys","vs/workbench/contrib/extensions/browser/extensionsIcons","vs/workbench/contrib/inlineChat/browser/inlineChatSessionService","vs/workbench/contrib/mergeEditor/browser/model/lineRange","vs/workbench/contrib/snippets/browser/snippets","vs/workbench/contrib/terminal/browser/terminalIcon","vs/workbench/contrib/testing/browser/icons","vs/workbench/contrib/testing/common/storedValue","vs/workbench/services/decorations/common/decorations","vs/workbench/contrib/tasks/common/tasks","vs/workbench/services/languageDetection/common/languageDetectionWorkerService","vs/workbench/browser/actions/widgetNavigationCommands","vs/workbench/services/search/common/queryBuilder","vs/workbench/services/userDataSync/common/userDataSync","vs/workbench/services/workspaces/common/workspaceEditing","vs/base/common/collections","vs/editor/browser/stableEditorScroll","vs/editor/common/core/eolCounter","vs/editor/common/languages/languageConfiguration","vs/editor/common/tokens/lineTokens","vs/base/common/comparers","vs/amdX","vs/base/browser/ui/list/listView","vs/platform/files/browser/webFileSystemAccess","vs/editor/contrib/documentSymbols/browser/outlineModel","vs/editor/contrib/message/browser/messageController","vs/editor/contrib/find/browser/findModel","vs/editor/contrib/folding/browser/folding","vs/editor/contrib/contextmenu/browser/contextmenu","vs/editor/contrib/hover/browser/hover","vs/platform/extensionManagement/common/extensionStorage","vs/workbench/browser/parts/editor/editor","vs/workbench/browser/part","vs/workbench/contrib/chat/browser/chatEditorInput","vs/workbench/contrib/codeEditor/browser/menuPreventer","vs/workbench/contrib/extensions/browser/extensionRecommendations","vs/workbench/contrib/search/browser/searchIcons","vs/workbench/contrib/speech/common/speechService","vs/workbench/contrib/terminal/common/terminalColorRegistry","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers","vs/workbench/contrib/testing/common/configuration","vs/workbench/contrib/webviewPanel/browser/webviewEditorInput","vs/workbench/services/configuration/common/jsonEditing","vs/workbench/contrib/search/common/search","vs/workbench/contrib/tasks/common/problemMatcher","vs/workbench/contrib/codeEditor/browser/simpleEditorOptions","vs/base/common/jsonEdit","vs/base/common/observableInternal/base","vs/editor/common/editorCommon","vs/editor/common/model/prefixSumComputer","vs/editor/common/model/textModelSearch","vs/editor/common/textModelEvents","vs/editor/browser/view/dynamicViewOverlay","vs/base/common/keybindingLabels","vs/base/browser/formattedTextRenderer","vs/editor/common/languages/textToHtmlTokenizer","vs/base/common/semver/semver","vs/platform/externalServices/common/serviceMachineId","vs/platform/product/common/product","vs/editor/common/config/editorConfigurationSchema","vs/editor/browser/coreCommands","vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController","vs/platform/secrets/common/secrets","vs/workbench/contrib/chat/common/chatModel","vs/workbench/contrib/files/browser/fileConstants","vs/workbench/contrib/markers/common/markers","vs/workbench/contrib/preferences/browser/preferencesIcons","vs/workbench/contrib/searchEditor/browser/constants","vs/workbench/contrib/testing/common/testingStates","vs/workbench/services/extensions/common/proxyIdentifier","vs/workbench/services/issue/common/issue","vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService","vs/workbench/services/log/common/logConstants","vs/workbench/contrib/bulkEdit/browser/bulkCellEdits","vs/workbench/contrib/debug/browser/baseDebugView","vs/workbench/services/timer/browser/timerService","vs/workbench/services/untitled/common/untitledTextEditorInput","vs/workbench/services/untitled/common/untitledTextEditorService","vs/base/common/idGenerator","vs/base/common/history","vs/base/common/scrollable","vs/base/browser/ui/mouseCursor/mouseCursor","vs/editor/common/core/characterClassifier","vs/editor/common/commands/replaceCommand","vs/editor/common/editorFeatures","vs/editor/common/encodedTokenAttributes","vs/editor/common/languages/supports","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet","vs/editor/common/viewLayout/lineDecorations","vs/editor/contrib/inlineCompletions/browser/utils","vs/base/browser/ui/selectBox/selectBox","vs/editor/common/viewLayout/viewLineRenderer","vs/platform/history/browser/historyWidgetKeybindingHint","vs/platform/languagePacks/common/languagePacks","vs/platform/severityIcon/browser/severityIcon","vs/editor/contrib/format/browser/format","vs/platform/terminal/common/capabilities/terminalCapabilityStore","vs/editor/contrib/codeAction/browser/codeActionController","vs/editor/contrib/zoneWidget/browser/zoneWidget","vs/platform/update/common/update","vs/platform/url/common/url","vs/platform/actions/browser/dropdownWithPrimaryActionViewItem","vs/workbench/common/editor/editorOptions","vs/workbench/browser/parts/notifications/notificationsCommands","vs/workbench/browser/style","vs/workbench/contrib/chat/common/chatContributionService","vs/workbench/contrib/chat/common/chatVariables","vs/workbench/contrib/codeEditor/browser/selectionClipboard","vs/workbench/contrib/editSessions/common/editSessions","vs/workbench/contrib/files/common/explorerModel","vs/workbench/contrib/mergeEditor/browser/model/mapping","vs/workbench/contrib/mergeEditor/common/mergeEditor","vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser","vs/workbench/contrib/notebook/common/notebookEditorModelResolverService","vs/workbench/contrib/notebook/common/notebookExecutionService","vs/workbench/contrib/preferences/common/settingsEditorColorRegistry","vs/workbench/contrib/terminal/browser/terminalContextMenu","vs/workbench/contrib/terminal/browser/terminalIcons","vs/workbench/contrib/terminal/browser/terminalUri","vs/workbench/contrib/testing/common/testResult","vs/workbench/contrib/tasks/common/taskDefinitionRegistry","vs/workbench/services/authentication/browser/authenticationService","vs/workbench/services/files/common/elevatedFileService","vs/workbench/browser/actions/windowActions","vs/workbench/services/language/common/languageService","vs/workbench/common/editor/textEditorModel","vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel","vs/workbench/contrib/notebook/browser/controller/cellOperations","vs/workbench/services/outline/browser/outline","vs/workbench/services/preferences/common/preferencesModels","vs/workbench/contrib/customEditor/common/customEditor","vs/workbench/services/remote/common/tunnelModel","vs/workbench/browser/actions/layoutActions","vs/workbench/contrib/testing/common/testCoverageService","vs/workbench/services/workingCopy/common/workingCopy","vs/workbench/services/textfile/common/textEditorService","vs/workbench/browser/actions/workspaceCommands","vs/workbench/browser/actions/workspaceActions","vs/workbench/contrib/chat/browser/chatWidget","vs/base/common/observableInternal/debugName","vs/base/common/observableInternal/logging","vs/base/common/observableInternal/derived","vs/base/common/diff/diff","vs/css!vs/workbench/contrib/scm/browser/media/scm","vs/editor/browser/config/tabFocus","vs/editor/browser/view/renderingContext","vs/editor/common/core/wordCharacterClassifier","vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm","vs/editor/common/languages/supports/tokenization","vs/editor/common/services/treeViewsDnd","vs/editor/common/viewEventHandler","vs/editor/contrib/folding/browser/foldingRanges","vs/base/common/fuzzyScorer","vs/base/browser/globalPointerMoveMonitor","vs/base/browser/ui/iconLabel/simpleIconLabel","vs/base/common/worker/simpleWorker","vs/editor/browser/config/fontMeasurements","vs/editor/common/model/editStack","vs/editor/contrib/gotoSymbol/browser/referencesModel","vs/editor/common/services/treeViewsDndService","vs/editor/common/services/languagesAssociations","vs/platform/configuration/common/configurationModels","vs/platform/remote/common/remoteSocketFactoryService","vs/platform/terminal/common/environmentVariableShared","vs/platform/terminal/common/terminalStrings","vs/editor/browser/editorDom","vs/platform/theme/common/tokenClassificationRegistry","vs/editor/contrib/clipboard/browser/clipboard","vs/platform/workspace/common/editSessions","vs/editor/contrib/find/browser/findController","vs/platform/userDataProfile/common/userDataProfileStorageService","vs/platform/userDataSync/common/userDataSyncMachines","vs/platform/userDataSync/common/userDataSyncStoreService","vs/workbench/contrib/chat/common/chatWordCounter","vs/workbench/contrib/comments/common/commentsConfiguration","vs/workbench/contrib/comments/browser/commentsTreeViewer","vs/workbench/contrib/debug/common/disassemblyViewInput","vs/workbench/contrib/inlineChat/browser/utils","vs/workbench/contrib/markers/browser/messages","vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView","vs/workbench/contrib/notebook/common/notebookLoggingService","vs/workbench/contrib/scm/common/quickDiff","vs/workbench/contrib/search/browser/replace","vs/workbench/contrib/testing/common/observableValue","vs/workbench/contrib/testing/browser/explorerProjections/index","vs/workbench/contrib/testing/common/testingPeekOpener","vs/workbench/contrib/timeline/common/timeline","vs/workbench/services/banner/browser/bannerService","vs/workbench/browser/codeeditor","vs/workbench/contrib/debug/common/debugSource","vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig","vs/workbench/api/browser/mainThreadWebviews","vs/workbench/contrib/terminal/browser/terminalEditorInput","vs/workbench/services/localization/common/locale","vs/workbench/contrib/notebook/browser/diff/diffElementViewModel","vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel","vs/workbench/services/assignment/common/assignmentService","vs/workbench/contrib/debug/browser/linkDetector","vs/workbench/services/textfile/common/encoding","vs/workbench/contrib/debug/common/replModel","vs/workbench/contrib/inlineChat/browser/inlineChatSession","vs/workbench/contrib/mergeEditor/browser/mergeEditorInput","vs/workbench/services/title/browser/titleService","vs/workbench/services/userData/browser/userDataInit","vs/workbench/contrib/snippets/browser/tabCompletion","vs/workbench/services/workingCopy/common/workingCopyHistory","vs/workbench/contrib/customEditor/browser/customEditorInput","vs/workbench/browser/parts/views/treeView","vs/workbench/contrib/notebook/browser/notebookEditorWidget","vs/base/browser/ui/list/list","vs/base/common/keybindingParser","vs/base/common/observableInternal/utils","vs/base/common/range","vs/base/browser/broadcast","vs/base/common/cache","vs/base/common/symbols","vs/base/common/uint","vs/css!vs/platform/quickinput/browser/media/quickInput","vs/css!vs/workbench/contrib/searchEditor/browser/media/searchEditor","vs/css!vs/workbench/contrib/terminalContrib/stickyScroll/browser/media/stickyScroll","vs/editor/common/config/editorZoom","vs/editor/common/core/textModelDefaults","vs/editor/common/cursor/cursorWordOperations","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/ast","vs/editor/contrib/inlineCompletions/browser/ghostText","vs/editor/contrib/inlineCompletions/browser/singleTextEdit","vs/base/common/jsonErrorMessages","vs/base/browser/ui/resizable/resizable","vs/base/browser/ui/tree/objectTreeModel","vs/base/browser/ui/hover/hoverWidget","vs/base/browser/ui/findinput/findInput","vs/base/browser/ui/tree/asyncDataTree","vs/base/browser/defaultWorkerFactory","vs/editor/common/languageSelector","vs/editor/common/languageFeatureRegistry","vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture","vs/editor/common/standaloneStrings","vs/platform/action/common/action","vs/editor/common/services/markerDecorations","vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys","vs/platform/debug/common/extensionHostDebug","vs/platform/download/common/download","vs/platform/encryption/common/encryptionService","vs/platform/extensionRecommendations/common/extensionRecommendations","vs/platform/keybinding/common/resolvedKeybindingItem","vs/platform/keyboardLayout/common/keyboardLayout","vs/editor/browser/controller/textAreaInput","vs/platform/markers/common/markerService","vs/editor/browser/services/editorWorkerService","vs/platform/remote/common/remoteExtensionsScanner","vs/platform/sign/common/sign","vs/platform/terminal/common/terminalProfiles","vs/editor/contrib/colorPicker/browser/colorDetector","vs/editor/contrib/find/browser/findState","vs/editor/contrib/find/browser/findWidget","vs/editor/contrib/wordHighlighter/browser/wordHighlighter","vs/platform/userDataSync/common/ignoredExtensions","vs/platform/userDataSync/common/userDataSyncAccount","vs/platform/extensionManagement/common/extensionEnablementService","vs/platform/userDataSync/common/globalStateSync","vs/workbench/common/activity","vs/workbench/common/resources","vs/workbench/contrib/debug/browser/debugColors","vs/workbench/contrib/debug/browser/callStackEditorContribution","vs/workbench/contrib/extensions/common/extensionsInput","vs/workbench/contrib/markers/browser/markersModel","vs/workbench/contrib/mergeEditor/browser/view/colors","vs/workbench/contrib/notebook/browser/controller/chat/notebookChatContext","vs/workbench/contrib/notebook/browser/notebookViewEvents","vs/workbench/contrib/notebook/common/notebookCellStatusBarService","vs/workbench/api/browser/mainThreadNotebookDto","vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions","vs/workbench/contrib/terminal/common/environmentVariable","vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix","vs/workbench/contrib/testing/common/constants","vs/workbench/contrib/testing/common/testExplorerFilterState","vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation","vs/workbench/contrib/chat/common/chatSlashCommands","vs/workbench/contrib/chat/common/chatRequestParser","vs/workbench/services/languageStatus/common/languageStatusService","vs/workbench/contrib/webviewPanel/browser/webviewEditor","vs/workbench/contrib/codeEditor/browser/toggleWordWrap","vs/workbench/services/notebook/common/notebookDocumentService","vs/workbench/api/browser/mainThreadBulkEdits","vs/workbench/contrib/notebook/common/model/notebookCellTextModel","vs/workbench/contrib/externalUriOpener/common/configuration","vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService","vs/workbench/contrib/debug/common/debugVisualizers","vs/workbench/contrib/files/browser/editors/fileEditorInput","vs/workbench/contrib/preferences/browser/settingsTreeModels","vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput","vs/workbench/contrib/comments/browser/simpleCommentEditor","vs/workbench/contrib/debug/browser/breakpointsView","vs/workbench/browser/parts/editor/textEditor","vs/workbench/browser/parts/editor/editorTabsControl","vs/workbench/contrib/files/browser/fileActions","vs/workbench/contrib/files/browser/explorerViewlet","vs/workbench/contrib/chat/browser/actions/chatQuickInputActions","vs/workbench/contrib/remote/browser/remoteExplorer","vs/workbench/contrib/searchEditor/browser/searchEditorSerialization","vs/workbench/services/workspaces/common/workspaceTrust","vs/workbench/contrib/search/browser/searchView","vs/base/browser/iframe","vs/base/browser/performance","vs/base/browser/ui/scrollbar/scrollbarState","vs/base/common/observableInternal/autorun","vs/base/common/prefixTree","vs/base/browser/ui/codicons/codiconStyles","vs/css!vs/editor/contrib/colorPicker/browser/colorPicker","vs/css!vs/workbench/contrib/comments/browser/media/review","vs/editor/common/core/indentation","vs/editor/common/commands/trimTrailingWhitespaceCommand","vs/editor/common/diff/defaultLinesDiffComputer/utils","vs/editor/common/diff/linesDiffComputer","vs/editor/common/cursor/cursorMoveOperations","vs/editor/common/cursor/cursorDeleteOperations","vs/editor/common/cursor/cursorMoveCommands","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer","vs/editor/common/model/utils","vs/editor/common/textModelGuides","vs/editor/common/tokens/contiguousMultilineTokensBuilder","vs/editor/browser/viewParts/glyphMargin/glyphMargin","vs/editor/common/viewEvents","vs/editor/common/viewModelEventDispatcher","vs/editor/contrib/folding/browser/syntaxRangeProvider","vs/editor/contrib/inlineCompletions/browser/commandIds","vs/editor/contrib/semanticTokens/common/semanticTokensConfig","vs/base/browser/indexedDB","vs/base/browser/dompurify/dompurify","vs/base/browser/ui/tree/indexTreeModel","vs/base/browser/ui/scrollbar/scrollbarArrow","vs/base/browser/ui/grid/grid","vs/base/browser/ui/menu/menu","vs/base/browser/ui/tree/objectTree","vs/base/common/resourceTree","vs/base/common/uriIpc","vs/base/parts/ipc/common/ipc.net","vs/base/parts/storage/common/storage","vs/editor/browser/view/viewLayer","vs/editor/common/languages/supports/richEditBrackets","vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer","vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder","vs/editor/contrib/hover/browser/hoverOperation","vs/editor/contrib/inlayHints/browser/inlayHints","vs/editor/common/languages/nullTokenize","vs/editor/common/services/semanticTokensStyling","vs/editor/contrib/dropOrPasteInto/browser/edit","vs/editor/contrib/parameterHints/browser/provideSignatureHelp","vs/platform/keybinding/common/baseResolvedKeybinding","vs/platform/log/browser/log","vs/platform/policy/common/policy","vs/editor/browser/dnd","vs/editor/common/languages/autoIndent","vs/editor/common/languages/enterAction","vs/editor/common/commands/shiftCommand","vs/editor/common/cursor/cursorTypeOperations","vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode","vs/platform/extensionManagement/common/implicitActivationEvents","vs/platform/remote/common/remoteAgentConnection","vs/editor/browser/widget/diffEditor/diffEditorViewModel","vs/editor/contrib/gotoSymbol/browser/goToSymbol","vs/editor/contrib/hover/browser/markdownHoverParticipant","vs/platform/terminal/common/terminalEnvironment","vs/platform/terminal/common/terminalPlatformConfiguration","vs/editor/contrib/symbolIcons/browser/symbolIcons","vs/editor/browser/viewParts/lines/viewLine","vs/editor/common/services/semanticTokensProviderStyling","vs/editor/browser/widget/diffEditor/registrations.contribution","vs/editor/browser/widget/diffEditor/diffEditor.contribution","vs/editor/contrib/folding/browser/foldingDecorations","vs/editor/contrib/inlineProgress/browser/inlineProgress","vs/editor/contrib/dropOrPasteInto/browser/copyPasteController","vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController","vs/platform/userDataSync/common/content","vs/platform/userDataSync/common/settingsMerge","vs/editor/contrib/gotoError/browser/gotoError","vs/editor/contrib/gotoSymbol/browser/peek/referencesController","vs/editor/contrib/gotoSymbol/browser/goToCommands","vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition","vs/editor/contrib/inlayHints/browser/inlayHintsController","vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget","vs/editor/contrib/inlineEdit/browser/inlineEditController","vs/platform/userDataSync/common/extensionsSync","vs/platform/userDataSync/common/keybindingsSync","vs/platform/userDataSync/common/settingsSync","vs/platform/userDataSync/common/snippetsSync","vs/platform/userDataSync/common/tasksSync","vs/workbench/browser/actions","vs/workbench/browser/parts/editor/breadcrumbs","vs/workbench/browser/parts/views/viewFilter","vs/workbench/common/editor/binaryEditorModel","vs/workbench/common/component","vs/workbench/common/notifications","vs/workbench/browser/parts/notifications/notificationsActions","vs/workbench/contrib/callHierarchy/common/callHierarchy","vs/workbench/contrib/chat/browser/chatFollowups","vs/workbench/contrib/chat/common/chatWidgetHistoryService","vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu","vs/workbench/contrib/comments/browser/commentColors","vs/workbench/contrib/comments/browser/commentFormActions","vs/workbench/contrib/comments/common/commentModel","vs/workbench/contrib/comments/browser/commentsModel","vs/workbench/contrib/extensions/common/extensionQuery","vs/workbench/contrib/inlineChat/browser/inlineChatSavingService","vs/workbench/contrib/interactive/browser/interactiveDocumentService","vs/workbench/contrib/markdown/browser/markdownDocumentRenderer","vs/workbench/contrib/markers/browser/markersFilterOptions","vs/workbench/contrib/markers/browser/markersViewActions","vs/workbench/contrib/mergeEditor/browser/model/editing","vs/workbench/contrib/mergeEditor/browser/view/editorGutter","vs/workbench/contrib/mergeEditor/browser/view/editors/codeEditorView","vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService","vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions","vs/workbench/contrib/notebook/common/notebookRendererMessagingService","vs/workbench/contrib/notebook/common/services/notebookWorkerService","vs/workbench/contrib/outline/browser/outline","vs/workbench/contrib/remote/browser/remoteIcons","vs/workbench/contrib/scm/browser/util","vs/workbench/contrib/search/common/searchHistoryService","vs/workbench/contrib/snippets/browser/snippetsFile","vs/workbench/contrib/codeEditor/browser/dictation/editorDictation","vs/workbench/contrib/terminal/browser/terminalStatusList","vs/workbench/contrib/terminal/browser/terminalTooltip","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing","vs/workbench/contrib/testing/browser/explorerProjections/testingViewState","vs/workbench/contrib/testing/common/testCoverage","vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay","vs/workbench/contrib/testing/common/testingContinuousRunService","vs/workbench/contrib/testing/common/testingUri","vs/workbench/contrib/typeHierarchy/common/typeHierarchy","vs/workbench/contrib/webview/browser/webviewWindowDragMonitor","vs/workbench/contrib/webview/common/webview","vs/workbench/contrib/webviewView/browser/webviewViewService","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput","vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput","vs/workbench/browser/parts/editor/editorQuickAccess","vs/workbench/browser/parts/editor/editorWithViewState","vs/workbench/browser/parts/editor/sideBySideEditor","vs/workbench/common/editor/editorGroupModel","vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets","vs/workbench/contrib/terminal/browser/terminalMenus","vs/workbench/services/editor/common/editorGroupFinder","vs/workbench/contrib/preferences/browser/preferencesWidgets","vs/workbench/services/extensions/common/extensionDevOptions","vs/workbench/services/extensions/common/extensionHostKind","vs/workbench/services/extensions/common/extensionRunningLocation","vs/workbench/contrib/interactive/browser/interactiveEditorInput","vs/workbench/contrib/terminal/browser/xterm/xtermTerminal","vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService","vs/workbench/api/common/extHostTypes","vs/workbench/contrib/notebook/browser/contrib/find/findModel","vs/workbench/contrib/notebook/browser/notebookOptions","vs/workbench/contrib/notebook/browser/controller/foldingController","vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions","vs/workbench/contrib/notebook/common/notebookEditorModel","vs/workbench/services/preferences/browser/keybindingsEditorInput","vs/workbench/services/preferences/common/preferencesEditorInput","vs/workbench/services/progress/browser/progressIndicator","vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess","vs/workbench/contrib/terminal/common/history","vs/workbench/services/extensions/common/workspaceContains","vs/workbench/services/terminal/common/embedderTerminalService","vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput","vs/workbench/contrib/url/browser/trustedDomains","vs/workbench/services/themes/common/colorThemeSchema","vs/workbench/services/themes/common/productIconThemeSchema","vs/workbench/services/userActivity/common/userActivityService","vs/workbench/contrib/accessibility/browser/accessibilityContributions","vs/workbench/contrib/comments/browser/commentReply","vs/workbench/services/userDataProfile/common/remoteUserDataProfiles","vs/workbench/browser/parts/titlebar/windowTitle","vs/workbench/contrib/debug/browser/breakpointEditorContribution","vs/workbench/contrib/debug/browser/debugActionViewItems","vs/workbench/contrib/debug/browser/debugToolBar","vs/workbench/contrib/debug/browser/variablesView","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService","vs/workbench/browser/parts/editor/binaryEditor","vs/workbench/browser/parts/editor/textCodeEditor","vs/workbench/contrib/mergeEditor/browser/view/mergeEditor","vs/workbench/services/untitled/common/untitledTextEditorModel","vs/workbench/browser/parts/editor/editorActions","vs/workbench/api/browser/mainThreadDocuments","vs/workbench/services/workspaces/browser/workspaces","vs/workbench/browser/parts/compositeBarActions","vs/workbench/browser/panecomposite","vs/workbench/browser/parts/paneCompositePart","vs/workbench/contrib/chat/browser/actions/chatExecuteActions","vs/workbench/contrib/chat/browser/chatInputPart","vs/workbench/contrib/chat/browser/contrib/chatDynamicVariables","vs/workbench/contrib/notebook/browser/controller/editActions","vs/workbench/contrib/search/browser/searchWidget","vs/workbench/contrib/searchEditor/browser/searchEditorInput","vs/workbench/contrib/terminal/browser/terminalInstance","vs/workbench/contrib/extensions/browser/extensionsList","vs/workbench/contrib/notebook/browser/notebookEditor","vs/base/common/amd","vs/base/common/parsers","vs/base/common/ime","vs/base/common/paging","vs/base/common/search","vs/base/common/tfIdf","vs/base/parts/request/common/request","vs/css!vs/base/browser/ui/actionbar/actionbar","vs/css!vs/base/browser/ui/dropdown/dropdown","vs/css!vs/base/browser/ui/findinput/findInput","vs/css!vs/base/browser/ui/grid/gridview","vs/css!vs/base/browser/ui/list/list","vs/css!vs/platform/actionWidget/browser/actionWidget","vs/css!vs/workbench/browser/parts/editor/media/breadcrumbscontrol","vs/css!vs/workbench/browser/parts/editor/media/singleeditortabscontrol","vs/css!vs/workbench/browser/parts/notifications/media/notificationsActions","vs/css!vs/workbench/browser/parts/panel/media/panelpart","vs/css!vs/workbench/browser/parts/sidebar/media/sidebarpart","vs/css!vs/workbench/browser/parts/views/media/paneviewlet","vs/css!vs/workbench/contrib/welcomeGettingStarted/browser/media/gettingStarted","vs/editor/browser/config/migrateOptions","vs/editor/browser/viewParts/minimap/minimapCharSheet","vs/editor/common/config/diffEditor","vs/editor/browser/view/viewUserInputEvents","vs/editor/browser/controller/textAreaState","vs/editor/common/core/rgba","vs/editor/common/cursor/cursorAtomicMoveOperations","vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm","vs/editor/common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations","vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence","vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer","vs/editor/common/diff/legacyLinesDiffComputer","vs/editor/common/languages/linkComputer","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets","vs/editor/common/model/intervalTree","vs/editor/common/model/textModelPart","vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase","vs/editor/common/modelLineProjectionData","vs/editor/common/services/unicodeTextModelHighlighter","vs/editor/common/model/guidesTextModelPart","vs/editor/common/tokens/contiguousTokensEditing","vs/editor/browser/viewParts/margin/margin","vs/editor/common/viewModel/overviewZoneManager","vs/editor/contrib/comment/browser/blockCommentCommand","vs/editor/contrib/find/browser/replacePattern","vs/editor/contrib/folding/browser/foldingModel","vs/editor/contrib/folding/browser/indentRangeProvider","vs/editor/contrib/format/browser/formattingEdit","vs/editor/contrib/indentation/browser/indentUtils","vs/editor/contrib/smartSelect/browser/bracketSelections","vs/editor/contrib/stickyScroll/browser/stickyScrollElement","vs/editor/contrib/suggest/browser/completionModel","vs/editor/contrib/suggest/browser/wordDistance","vs/base/common/console","vs/base/browser/ui/contextview/contextview","vs/base/browser/ui/scrollbar/abstractScrollbar","vs/base/browser/ui/list/listPaging","vs/base/browser/ui/grid/gridview","vs/base/browser/ui/splitview/paneview","vs/base/browser/ui/table/tableWidget","vs/base/browser/ui/findinput/findInputToggles","vs/base/browser/ui/tree/dataTree","vs/base/browser/ui/dialog/dialog","vs/base/parts/ipc/common/ipc","vs/editor/browser/config/elementSizeObserver","vs/editor/common/core/textChange","vs/editor/common/services/semanticTokensDto","vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature","vs/editor/browser/widget/diffEditor/diffEditorOptions","vs/editor/common/viewModel/viewModelDecorations","vs/editor/common/model/textModelTokens","vs/editor/common/viewModel/minimapTokensColorTracker","vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines","vs/platform/environment/common/environmentService","vs/platform/extensionManagement/common/extensionNls","vs/platform/extensions/common/extensionValidator","vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature","vs/editor/contrib/inlineCompletions/browser/ghostTextWidget","vs/editor/contrib/codelens/browser/codelens","vs/editor/contrib/semanticTokens/common/getSemanticTokens","vs/platform/diagnostics/common/diagnostics","vs/platform/files/browser/htmlFileSystemProvider","vs/platform/files/common/inMemoryFilesystemProvider","vs/platform/files/common/watcher","vs/platform/instantiation/common/instantiationService","vs/editor/contrib/dropOrPasteInto/browser/postEditWidget","vs/platform/keybinding/common/keybindingResolver","vs/platform/layout/browser/zIndexRegistry","vs/platform/log/common/bufferLog","vs/editor/contrib/gotoError/browser/markerNavigationService","vs/platform/quickinput/browser/quickInputUtils","vs/platform/quickinput/browser/quickPickPin","vs/editor/browser/services/webWorker","vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider","vs/editor/contrib/colorPicker/browser/color","vs/editor/contrib/suggest/browser/suggestWidgetDetails","vs/platform/configuration/common/configurations","vs/editor/browser/widget/multiDiffEditorWidget/multiDiffEditorViewModel","vs/editor/contrib/codeAction/browser/codeActionModel","vs/editor/contrib/codeAction/browser/lightBulbWidget","vs/editor/contrib/hover/browser/getHover","vs/editor/contrib/indentation/browser/indentation","vs/editor/contrib/linesOperations/browser/linesOperations","vs/editor/contrib/smartSelect/browser/smartSelect","vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators","vs/editor/contrib/wordOperations/browser/wordOperations","vs/editor/contrib/format/browser/formatActions","vs/platform/terminal/common/capabilities/commandDetectionCapability","vs/platform/terminal/common/environmentVariable","vs/platform/terminal/common/environmentVariableCollection","vs/platform/actionWidget/browser/actionWidget","vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer","vs/editor/contrib/parameterHints/browser/parameterHints","vs/editor/browser/controller/mouseTarget","vs/platform/quickinput/browser/quickInputList","vs/platform/quickinput/browser/quickInput","vs/editor/browser/widget/diffEditor/features/overviewRulerFeature","vs/editor/browser/viewParts/lineNumbers/lineNumbers","vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess","vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess","vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens","vs/editor/contrib/bracketMatching/browser/bracketMatching","vs/editor/contrib/colorPicker/browser/colorHoverParticipant","vs/editor/contrib/dnd/browser/dnd","vs/editor/contrib/find/browser/findDecorations","vs/editor/contrib/hover/browser/contentHover","vs/editor/contrib/links/browser/links","vs/editor/contrib/wordHighlighter/browser/highlightDecorations","vs/platform/workspace/common/canonicalUri","vs/editor/contrib/dropOrPasteInto/browser/defaultProviders","vs/editor/contrib/snippet/browser/snippetVariables","vs/editor/contrib/snippet/browser/snippetSession","vs/editor/contrib/suggest/browser/suggestModel","vs/editor/contrib/codelens/browser/codelensController","vs/editor/contrib/multicursor/browser/multicursor","vs/editor/contrib/suggest/browser/suggestMemory","vs/editor/contrib/inlayHints/browser/inlayHintsLocations","vs/editor/contrib/stickyScroll/browser/stickyScrollController","vs/editor/contrib/suggest/browser/suggestWidgetStatus","vs/editor/contrib/suggest/browser/suggestWidget","vs/platform/actions/browser/floatingMenu","vs/editor/browser/widget/multiDiffEditorWidget/diffEditorItemTemplate","vs/editor/contrib/inlineEdit/browser/inlineEditHintsWidget","vs/platform/quickinput/browser/commandsQuickAccess","vs/platform/userDataSync/common/userDataProfilesManifestSync","vs/workbench/api/common/shared/dataTransferCache","vs/workbench/browser/parts/notifications/notificationsTelemetry","vs/workbench/browser/web.api","vs/workbench/common/editor/diffEditorModel","vs/workbench/common/editor/filteredEditorGroupModel","vs/workbench/common/editor/textDiffEditorModel","vs/workbench/browser/composite","vs/workbench/browser/parts/notifications/notificationsList","vs/workbench/contrib/chat/browser/chatOptions","vs/workbench/contrib/chat/common/chatColors","vs/workbench/contrib/chat/common/chatProvider","vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget","vs/workbench/contrib/comments/browser/commentGlyphWidget","vs/workbench/contrib/comments/browser/comments","vs/workbench/contrib/comments/browser/commentsFilterOptions","vs/workbench/contrib/comments/browser/timestamp","vs/workbench/contrib/debug/common/debugContext","vs/workbench/contrib/extensions/common/extensionsFileTemplate","vs/workbench/contrib/extensions/common/runtimeExtensionsInput","vs/workbench/contrib/interactive/browser/interactiveCommon","vs/workbench/contrib/interactive/browser/interactiveHistoryService","vs/workbench/contrib/localHistory/browser/localHistory","vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider","vs/workbench/contrib/mergeEditor/browser/model/rangeUtils","vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange","vs/workbench/contrib/notebook/browser/contrib/find/findFilters","vs/workbench/contrib/notebook/browser/diff/eventDispatcher","vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll","vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver","vs/workbench/contrib/preferences/browser/settingsLayout","vs/workbench/contrib/scm/browser/scmRepositoryRenderer","vs/workbench/contrib/scm/browser/scmViewService","vs/workbench/contrib/search/browser/patternInputWidget","vs/workbench/contrib/search/common/notebookSearch","vs/workbench/contrib/share/common/share","vs/workbench/contrib/snippets/browser/snippetPicker","vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet","vs/workbench/contrib/snippets/browser/snippetCompletionProvider","vs/workbench/contrib/splash/browser/splash","vs/workbench/contrib/tags/common/workspaceTags","vs/workbench/contrib/tasks/common/taskSystem","vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy","vs/workbench/contrib/terminal/browser/widgets/widgetManager","vs/workbench/contrib/terminal/browser/detachedTerminal","vs/workbench/contrib/terminal/browser/xterm/decorationStyles","vs/workbench/contrib/terminal/common/terminalEnvironment","vs/workbench/contrib/terminalContrib/links/browser/links","vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollColorRegistry","vs/workbench/contrib/testing/browser/theme","vs/workbench/contrib/testing/common/testingDecorations","vs/workbench/contrib/testing/common/getComputedState","vs/workbench/contrib/testing/common/testResultStorage","vs/workbench/contrib/update/common/update","vs/workbench/contrib/url/common/urlGlob","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons","vs/workbench/contrib/welcomeViews/common/viewsWelcomeExtensionPoint","vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider","vs/workbench/contrib/workspace/common/workspace","vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService","vs/workbench/services/configuration/common/configurationModels","vs/workbench/services/configurationResolver/common/configurationResolverSchema","vs/workbench/services/configurationResolver/common/configurationResolverUtils","vs/workbench/services/configurationResolver/common/variableResolver","vs/workbench/services/editor/common/editorPaneService","vs/workbench/contrib/chat/browser/actions/chatClear","vs/workbench/contrib/debug/common/debugContentProvider","vs/workbench/contrib/search/browser/symbolsQuickAccess","vs/workbench/contrib/terminal/browser/terminalQuickAccess","vs/workbench/services/encryption/browser/encryptionService","vs/workbench/contrib/logs/common/defaultLogLevels","vs/workbench/contrib/preferences/browser/keybindingWidgets","vs/workbench/services/extensions/common/extensionHostProtocol","vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor","vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart","vs/workbench/services/extensions/common/extensionsApiProposals","vs/workbench/contrib/debug/common/debugSchemas","vs/workbench/contrib/tasks/common/jsonSchemaCommon","vs/workbench/contrib/tasks/common/problemCollectors","vs/workbench/contrib/tasks/browser/taskQuickPick","vs/workbench/contrib/tasks/common/taskConfiguration","vs/workbench/contrib/terminal/common/terminalExtensionPoints","vs/workbench/services/actions/common/menusExtensionPoint","vs/workbench/api/browser/mainThreadEditor","vs/workbench/services/extensions/common/extensionHostManager","vs/workbench/common/editor/resourceEditorInput","vs/workbench/services/keybinding/browser/unboundCommands","vs/workbench/services/keybinding/common/windowsKeyboardMapper","vs/workbench/common/editor/textResourceEditorModel","vs/workbench/contrib/notebook/common/notebookDiffEditorInput","vs/workbench/contrib/extensions/common/extensionsUtils","vs/workbench/contrib/webviewPanel/browser/webviewEditorInputSerializer","vs/workbench/browser/window","vs/workbench/services/extensionManagement/browser/extensionBisect","vs/workbench/services/extensions/browser/extensionUrlHandler","vs/workbench/api/common/extHostTypeConverters","vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard","vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget","vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview","vs/workbench/contrib/notebook/browser/contrib/find/findMatchDecorationModel","vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel","vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel","vs/workbench/contrib/notebook/browser/viewModel/foldingModel","vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider","vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel","vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd","vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget","vs/workbench/contrib/notebook/browser/controller/cellOutputActions","vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys","vs/workbench/contrib/notebook/browser/view/notebookCellList","vs/workbench/contrib/notebook/common/notebookProvider","vs/workbench/contrib/logs/common/logsActions","vs/workbench/contrib/output/common/outputChannelModelService","vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions","vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy","vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView","vs/workbench/services/preferences/browser/keybindingsEditorModel","vs/workbench/browser/parts/titlebar/menubarControl","vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignal.contribution","vs/workbench/services/preferences/common/preferencesValidation","vs/workbench/contrib/terminal/common/terminalConfiguration","vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView","vs/workbench/services/search/common/searchExtTypes","vs/workbench/contrib/search/browser/searchMessage","vs/workbench/contrib/search/common/searchNotebookHelpers","vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers","vs/workbench/services/search/common/searchHelpers","vs/workbench/services/secrets/browser/secretStorageService","vs/workbench/api/browser/statusBarExtensionPoint","vs/workbench/services/storage/browser/storageService","vs/workbench/services/textMate/browser/textMateTokenizationFeature","vs/workbench/services/textMate/common/TMGrammars","vs/workbench/browser/parts/editor/breadcrumbsControl","vs/workbench/contrib/debug/browser/disassemblyView","vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler","vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution","vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor","vs/workbench/contrib/scm/browser/dirtydiffDecorator","vs/workbench/contrib/format/browser/formatModified","vs/workbench/services/themes/common/hostColorSchemeService","vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent","vs/workbench/services/themes/browser/fileIconThemeData","vs/workbench/services/themes/browser/productIconThemeData","vs/workbench/services/userActivity/common/userActivityRegistry","vs/workbench/contrib/preferences/browser/settingsTree","vs/workbench/contrib/snippets/browser/snippetsService","vs/workbench/contrib/comments/browser/commentThreadWidget","vs/workbench/contrib/comments/browser/commentsAccessibility","vs/workbench/contrib/accessibility/browser/editorAccessibilityHelp","vs/workbench/services/keybinding/common/keybindingEditing","vs/workbench/services/userDataProfile/browser/extensionsResource","vs/workbench/services/userDataProfile/common/userDataProfileIcons","vs/workbench/services/views/browser/treeViewsService","vs/workbench/browser/parts/panel/panelActions","vs/workbench/contrib/comments/browser/commentsController","vs/workbench/contrib/comments/browser/commentsView","vs/workbench/contrib/debug/browser/repl","vs/workbench/contrib/debug/browser/debugEditorContribution","vs/workbench/contrib/tasks/browser/abstractTaskService","vs/workbench/contrib/testing/browser/testingProgressUiService","vs/workbench/contrib/testing/browser/testCoverageBars","vs/workbench/contrib/testing/browser/testExplorerActions","vs/workbench/services/workingCopy/common/resourceWorkingCopy","vs/workbench/contrib/welcomeGettingStarted/browser/startupPage","vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager","vs/workbench/api/browser/mainThreadEditors","vs/workbench/browser/parts/editor/editorPlaceholder","vs/workbench/browser/parts/editor/binaryDiffEditor","vs/workbench/browser/parts/editor/editorStatus","vs/workbench/browser/parts/editor/textDiffEditor","vs/workbench/browser/parts/editor/textResourceEditor","vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint","vs/workbench/contrib/files/browser/editors/textFileEditor","vs/workbench/contrib/output/browser/outputView","vs/workbench/services/textfile/common/textFileEditorModel","vs/workbench/contrib/localHistory/browser/localHistoryCommands","vs/workbench/services/userDataProfile/browser/globalStateResource","vs/workbench/services/userDataProfile/browser/keybindingsResource","vs/workbench/services/userDataProfile/browser/settingsResource","vs/workbench/services/userDataProfile/browser/snippetsResource","vs/workbench/services/userDataProfile/browser/tasksResource","vs/workbench/services/workingCopy/common/untitledFileWorkingCopy","vs/workbench/services/workingCopy/common/storedFileWorkingCopy","vs/workbench/browser/parts/editor/multiEditorTabsControl","vs/workbench/browser/parts/editor/editorGroupView","vs/workbench/browser/parts/editor/editorPart","vs/workbench/browser/parts/globalCompositeBar","vs/workbench/browser/parts/paneCompositeBar","vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart","vs/workbench/browser/parts/panel/panelPart","vs/workbench/browser/parts/sidebar/sidebarPart","vs/workbench/browser/parts/views/viewsViewlet","vs/workbench/contrib/debug/browser/welcomeView","vs/workbench/contrib/debug/browser/debugViewlet","vs/workbench/contrib/files/browser/fileImportExport","vs/workbench/contrib/files/browser/views/explorerViewer","vs/workbench/contrib/files/browser/views/explorerView","vs/workbench/contrib/chat/browser/chatListRenderer","vs/workbench/contrib/files/browser/views/openEditorsView","vs/workbench/contrib/inlineChat/browser/inlineChatWidget","vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp","vs/workbench/contrib/chat/browser/actions/chatClearActions","vs/workbench/contrib/chat/browser/actions/chatMoveActions","vs/workbench/contrib/notebook/browser/contrib/navigation/arrow","vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController","vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor","vs/workbench/contrib/search/browser/searchActionsFind","vs/workbench/contrib/searchEditor/browser/searchEditorActions","vs/workbench/contrib/terminal/browser/terminalView","vs/workbench/services/views/browser/viewsService","vs/workbench/services/workspaces/common/workspaceIdentityService","vs/workbench/browser/web.main","vs/workbench/contrib/extensions/browser/extensionsWidgets","vs/workbench/contrib/extensions/browser/extensionsViews","vs/workbench/contrib/extensions/browser/extensionsViewlet","vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess","vs/workbench/contrib/terminal/browser/terminalConfigHelper","vs/workbench/contrib/terminal/browser/terminalInstanceService","vs/workbench/services/extensions/common/extensionRunningLocationTracker","vs/base/browser/deviceAccess","vs/base/browser/ui/list/splice","vs/base/common/diff/diffChange","vs/base/common/naturalLanguage/korean","vs/base/common/navigator","vs/base/browser/ui/list/rangeMap","vs/base/common/skipList","vs/base/common/observableInternal/promise","vs/base/browser/hash","vs/base/common/verifier","vs/base/parts/request/browser/request","vs/css!vs/base/browser/ui/aria/aria","vs/css!vs/base/browser/ui/breadcrumbs/breadcrumbsWidget","vs/css!vs/base/browser/ui/button/button","vs/css!vs/base/browser/ui/codicons/codicon/codicon","vs/css!vs/base/browser/ui/codicons/codicon/codicon-modifiers","vs/css!vs/base/browser/ui/contextview/contextview","vs/css!vs/base/browser/ui/countBadge/countBadge","vs/css!vs/base/browser/ui/dialog/dialog","vs/css!vs/base/browser/ui/hover/hover","vs/css!vs/base/browser/ui/iconLabel/iconlabel","vs/css!vs/base/browser/ui/icons/iconSelectBox","vs/css!vs/base/browser/ui/inputbox/inputBox","vs/css!vs/base/browser/ui/keybindingLabel/keybindingLabel","vs/css!vs/base/browser/ui/menu/menubar","vs/css!vs/base/browser/ui/mouseCursor/mouseCursor","vs/css!vs/base/browser/ui/progressbar/progressbar","vs/css!vs/base/browser/ui/sash/sash","vs/css!vs/base/browser/ui/scrollbar/media/scrollbars","vs/css!vs/base/browser/ui/selectBox/selectBox","vs/css!vs/base/browser/ui/selectBox/selectBoxCustom","vs/css!vs/base/browser/ui/splitview/paneview","vs/css!vs/base/browser/ui/splitview/splitview","vs/css!vs/base/browser/ui/table/table","vs/css!vs/base/browser/ui/toggle/toggle","vs/css!vs/base/browser/ui/toolbar/toolbar","vs/css!vs/base/browser/ui/tree/media/tree","vs/css!vs/editor/browser/controller/textAreaHandler","vs/css!vs/editor/browser/viewParts/blockDecorations/blockDecorations","vs/css!vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight","vs/css!vs/editor/browser/viewParts/decorations/decorations","vs/css!vs/editor/browser/viewParts/glyphMargin/glyphMargin","vs/css!vs/editor/browser/viewParts/indentGuides/indentGuides","vs/css!vs/editor/browser/viewParts/lineNumbers/lineNumbers","vs/css!vs/editor/browser/viewParts/lines/viewLines","vs/css!vs/editor/browser/viewParts/linesDecorations/linesDecorations","vs/css!vs/editor/browser/viewParts/margin/margin","vs/css!vs/editor/browser/viewParts/marginDecorations/marginDecorations","vs/css!vs/editor/browser/viewParts/minimap/minimap","vs/css!vs/editor/browser/viewParts/overlayWidgets/overlayWidgets","vs/css!vs/editor/browser/viewParts/rulers/rulers","vs/css!vs/editor/browser/viewParts/scrollDecoration/scrollDecoration","vs/css!vs/editor/browser/viewParts/selections/selections","vs/css!vs/editor/browser/viewParts/viewCursors/viewCursors","vs/css!vs/editor/browser/viewParts/whitespace/whitespace","vs/css!vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer","vs/css!vs/editor/browser/widget/diffEditor/style","vs/css!vs/editor/browser/widget/hoverWidget/hover","vs/css!vs/editor/browser/widget/markdownRenderer/browser/renderedMarkdown","vs/css!vs/editor/browser/widget/media/editor","vs/css!vs/editor/browser/widget/multiDiffEditorWidget/style","vs/css!vs/editor/contrib/anchorSelect/browser/anchorSelect","vs/css!vs/editor/contrib/bracketMatching/browser/bracketMatching","vs/css!vs/editor/contrib/codeAction/browser/lightBulbWidget","vs/css!vs/editor/contrib/codelens/browser/codelensWidget","vs/css!vs/editor/contrib/dnd/browser/dnd","vs/css!vs/editor/contrib/dropOrPasteInto/browser/postEditWidget","vs/css!vs/editor/contrib/find/browser/findOptionsWidget","vs/css!vs/editor/contrib/find/browser/findWidget","vs/css!vs/editor/contrib/folding/browser/folding","vs/css!vs/editor/contrib/gotoError/browser/media/gotoErrorWidget","vs/css!vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition","vs/css!vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget","vs/css!vs/editor/contrib/hover/browser/hover","vs/css!vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace","vs/css!vs/editor/contrib/inlineCompletions/browser/ghostText","vs/css!vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget","vs/css!vs/editor/contrib/inlineEdit/browser/inlineEdit","vs/css!vs/editor/contrib/inlineEdit/browser/inlineEditHintsWidget","vs/css!vs/editor/contrib/inlineProgress/browser/inlineProgressWidget","vs/css!vs/editor/contrib/linkedEditing/browser/linkedEditing","vs/css!vs/editor/contrib/links/browser/links","vs/css!vs/editor/contrib/message/browser/messageController","vs/css!vs/editor/contrib/parameterHints/browser/parameterHints","vs/css!vs/editor/contrib/peekView/browser/media/peekViewWidget","vs/css!vs/editor/contrib/rename/browser/renameInputField","vs/css!vs/editor/contrib/snippet/browser/snippetSession","vs/css!vs/editor/contrib/stickyScroll/browser/stickyScroll","vs/css!vs/editor/contrib/suggest/browser/media/suggest","vs/css!vs/editor/contrib/symbolIcons/browser/symbolIcons","vs/css!vs/editor/contrib/unicodeHighlighter/browser/bannerController","vs/css!vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter","vs/css!vs/editor/contrib/wordHighlighter/browser/highlightDecorations","vs/css!vs/editor/contrib/zoneWidget/browser/zoneWidget","vs/css!vs/platform/actions/browser/menuEntryActionViewItem","vs/css!vs/platform/opener/browser/link","vs/css!vs/platform/severityIcon/browser/media/severityIcon","vs/css!vs/workbench/browser/actions/media/actions","vs/css!vs/workbench/browser/media/part","vs/css!vs/workbench/browser/media/style","vs/css!vs/workbench/browser/parts/activitybar/media/activityaction","vs/css!vs/workbench/browser/parts/activitybar/media/activitybarpart","vs/css!vs/workbench/browser/parts/auxiliarybar/media/auxiliaryBarPart","vs/css!vs/workbench/browser/parts/banner/media/bannerpart","vs/css!vs/workbench/browser/parts/editor/media/editordroptarget","vs/css!vs/workbench/browser/parts/editor/media/editorgroupview","vs/css!vs/workbench/browser/parts/editor/media/editorplaceholder","vs/css!vs/workbench/browser/parts/editor/media/editorquickaccess","vs/css!vs/workbench/browser/parts/editor/media/editorstatus","vs/css!vs/workbench/browser/parts/editor/media/editortabscontrol","vs/css!vs/workbench/browser/parts/editor/media/editortitlecontrol","vs/css!vs/workbench/browser/parts/editor/media/multieditortabscontrol","vs/css!vs/workbench/browser/parts/editor/media/sidebysideeditor","vs/css!vs/workbench/browser/parts/media/compositepart","vs/css!vs/workbench/browser/parts/media/paneCompositePart","vs/css!vs/workbench/browser/parts/notifications/media/notificationsCenter","vs/css!vs/workbench/browser/parts/notifications/media/notificationsList","vs/css!vs/workbench/browser/parts/notifications/media/notificationsToasts","vs/css!vs/workbench/browser/parts/statusbar/media/statusbarpart","vs/css!vs/workbench/browser/parts/titlebar/media/menubarControl","vs/css!vs/workbench/browser/parts/titlebar/media/titlebarpart","vs/css!vs/workbench/browser/parts/views/media/views","vs/css!vs/workbench/contrib/bulkEdit/browser/preview/bulkEdit","vs/css!vs/workbench/contrib/callHierarchy/browser/media/callHierarchy","vs/css!vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget","vs/css!vs/workbench/contrib/chat/browser/codeBlockPart","vs/css!vs/workbench/contrib/chat/browser/media/chat","vs/css!vs/workbench/contrib/codeEditor/browser/accessibility/accessibility","vs/css!vs/workbench/contrib/codeEditor/browser/dictation/editorDictation","vs/css!vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint","vs/css!vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget","vs/css!vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens","vs/css!vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree","vs/css!vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput","vs/css!vs/workbench/contrib/comments/browser/media/panel","vs/css!vs/workbench/contrib/customEditor/browser/media/customEditor","vs/css!vs/workbench/contrib/debug/browser/media/breakpointWidget","vs/css!vs/workbench/contrib/debug/browser/media/callStackEditorContribution","vs/css!vs/workbench/contrib/debug/browser/media/debug.contribution","vs/css!vs/workbench/contrib/debug/browser/media/debugHover","vs/css!vs/workbench/contrib/debug/browser/media/debugToolBar","vs/css!vs/workbench/contrib/debug/browser/media/debugViewlet","vs/css!vs/workbench/contrib/debug/browser/media/exceptionWidget","vs/css!vs/workbench/contrib/debug/browser/media/repl","vs/css!vs/workbench/contrib/extensions/browser/media/extension","vs/css!vs/workbench/contrib/extensions/browser/media/extensionActions","vs/css!vs/workbench/contrib/extensions/browser/media/extensionEditor","vs/css!vs/workbench/contrib/extensions/browser/media/extensionsViewlet","vs/css!vs/workbench/contrib/extensions/browser/media/extensionsWidgets","vs/css!vs/workbench/contrib/extensions/browser/media/runtimeExtensionsEditor","vs/css!vs/workbench/contrib/files/browser/media/explorerviewlet","vs/css!vs/workbench/contrib/files/browser/views/media/openeditors","vs/css!vs/workbench/contrib/inlineChat/browser/inlineChat","vs/css!vs/workbench/contrib/interactive/browser/interactiveEditor","vs/css!vs/workbench/contrib/interactive/browser/media/interactive","vs/css!vs/workbench/contrib/languageStatus/browser/media/languageStatus","vs/css!vs/workbench/contrib/markers/browser/markersViewActions","vs/css!vs/workbench/contrib/markers/browser/media/markers","vs/css!vs/workbench/contrib/mergeEditor/browser/view/media/mergeEditor","vs/css!vs/workbench/contrib/notebook/browser/contrib/find/media/notebookFind","vs/css!vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget","vs/css!vs/workbench/contrib/notebook/browser/diff/notebookDiff","vs/css!vs/workbench/contrib/notebook/browser/media/notebook","vs/css!vs/workbench/contrib/notebook/browser/media/notebookCellChat","vs/css!vs/workbench/contrib/notebook/browser/media/notebookCellEditorHint","vs/css!vs/workbench/contrib/notebook/browser/media/notebookCellInsertToolbar","vs/css!vs/workbench/contrib/notebook/browser/media/notebookCellOutput","vs/css!vs/workbench/contrib/notebook/browser/media/notebookCellStatusBar","vs/css!vs/workbench/contrib/notebook/browser/media/notebookCellTitleToolbar","vs/css!vs/workbench/contrib/notebook/browser/media/notebookDnd","vs/css!vs/workbench/contrib/notebook/browser/media/notebookEditorStickyScroll","vs/css!vs/workbench/contrib/notebook/browser/media/notebookFocusIndicator","vs/css!vs/workbench/contrib/notebook/browser/media/notebookFolding","vs/css!vs/workbench/contrib/notebook/browser/media/notebookKernelActionViewItem","vs/css!vs/workbench/contrib/notebook/browser/media/notebookOutline","vs/css!vs/workbench/contrib/notebook/browser/media/notebookToolbar","vs/css!vs/workbench/contrib/outline/browser/outlinePane","vs/css!vs/workbench/contrib/output/browser/output","vs/css!vs/workbench/contrib/preferences/browser/media/keybindings","vs/css!vs/workbench/contrib/preferences/browser/media/keybindingsEditor","vs/css!vs/workbench/contrib/preferences/browser/media/preferences","vs/css!vs/workbench/contrib/preferences/browser/media/settingsEditor2","vs/css!vs/workbench/contrib/preferences/browser/media/settingsWidgets","vs/css!vs/workbench/contrib/remote/browser/media/remoteViewlet","vs/css!vs/workbench/contrib/remote/browser/media/tunnelView","vs/css!vs/workbench/contrib/scm/browser/media/dirtydiffDecorator","vs/css!vs/workbench/contrib/search/browser/media/anythingQuickAccess","vs/css!vs/workbench/contrib/search/browser/media/searchview","vs/css!vs/workbench/contrib/share/browser/share","vs/css!vs/workbench/contrib/terminal/browser/media/scrollbar","vs/css!vs/workbench/contrib/terminal/browser/media/terminal","vs/css!vs/workbench/contrib/terminal/browser/media/terminalVoice","vs/css!vs/workbench/contrib/terminal/browser/media/widgets","vs/css!vs/workbench/contrib/terminal/browser/media/xterm","vs/css!vs/workbench/contrib/terminalContrib/developer/browser/media/developer","vs/css!vs/workbench/contrib/terminalContrib/quickFix/browser/media/terminalQuickFix","vs/css!vs/workbench/contrib/testing/browser/media/testing","vs/css!vs/workbench/contrib/testing/browser/testingOutputPeek","vs/css!vs/workbench/contrib/timeline/browser/media/timelinePane","vs/css!vs/workbench/contrib/typeHierarchy/browser/media/typeHierarchy","vs/css!vs/workbench/contrib/update/browser/media/releasenoteseditor","vs/css!vs/workbench/contrib/welcomeDialog/browser/media/welcomeWidget","vs/css!vs/workbench/contrib/welcomeWalkthrough/browser/media/walkThroughPart","vs/css!vs/workbench/contrib/workspace/browser/media/workspaceTrustEditor","vs/css!vs/workbench/services/progress/browser/media/progressService","vs/css!vs/workbench/services/suggest/browser/media/suggest","vs/css!vs/workbench/services/userDataProfile/browser/media/userDataProfileView","vs/editor/browser/config/charWidthReader","vs/editor/browser/viewParts/lines/domReadingContext","vs/editor/browser/viewParts/lines/rangeUtil","vs/editor/browser/viewParts/minimap/minimapCharRenderer","vs/editor/browser/viewParts/minimap/minimapPreBaked","vs/editor/browser/viewParts/minimap/minimapCharRendererFactory","vs/editor/browser/widget/diffEditor/delegatingEditorImpl","vs/editor/browser/widget/multiDiffEditorWidget/model","vs/editor/browser/widget/multiDiffEditorWidget/objectPool","vs/editor/common/commands/surroundSelectionCommand","vs/editor/common/cursor/cursorContext","vs/editor/common/diff/defaultLinesDiffComputer/lineSequence","vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing","vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines","vs/editor/common/diff/linesDiffComputers","vs/editor/common/editorAction","vs/editor/common/editorTheme","vs/editor/common/languages/defaultDocumentColorsComputer","vs/editor/common/cursor/cursorColumnSelection","vs/editor/common/cursor/oneCursor","vs/editor/common/cursor/cursorCollection","vs/editor/common/languages/supports/characterPair","vs/editor/common/languages/supports/indentRules","vs/editor/common/languages/supports/inplaceReplaceSupport","vs/editor/common/languages/supports/languageBracketsConfiguration","vs/editor/common/languages/supports/onEnter","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/nodeReader","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees","vs/editor/common/model/bracketPairsTextModelPart/fixBrackets","vs/editor/common/model/fixedArray","vs/editor/common/model/indentationGuesser","vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase","vs/editor/common/model/mirrorTextModel","vs/editor/common/standalone/standaloneEnums","vs/editor/common/textModelBracketPairs","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree","vs/editor/common/tokenizationRegistry","vs/editor/common/tokens/contiguousMultilineTokens","vs/editor/common/tokens/contiguousTokensStore","vs/editor/common/tokens/sparseMultilineTokens","vs/editor/common/tokens/sparseTokensStore","vs/editor/browser/viewParts/blockDecorations/blockDecorations","vs/editor/browser/viewParts/decorations/decorations","vs/editor/browser/viewParts/linesDecorations/linesDecorations","vs/editor/browser/viewParts/marginDecorations/marginDecorations","vs/editor/browser/viewParts/rulers/rulers","vs/editor/browser/viewParts/scrollDecoration/scrollDecoration","vs/editor/browser/viewParts/viewZones/viewZones","vs/editor/common/viewLayout/linePart","vs/editor/common/viewLayout/linesLayout","vs/editor/common/viewLayout/viewLinesViewportData","vs/editor/common/viewModel/glyphLanesModel","vs/editor/common/viewModel/modelLineProjection","vs/editor/common/viewModel/monospaceLineBreaksComputer","vs/editor/browser/viewParts/overviewRuler/overviewRuler","vs/editor/common/viewModel/viewContext","vs/editor/common/viewLayout/viewLayout","vs/editor/contrib/caretOperations/browser/moveCaretCommand","vs/editor/contrib/colorPicker/browser/colorPickerModel","vs/editor/contrib/comment/browser/lineCommentCommand","vs/editor/contrib/dnd/browser/dragAndDropCommand","vs/editor/contrib/find/browser/replaceAllCommand","vs/editor/contrib/folding/browser/hiddenRangeModel","vs/editor/contrib/inPlaceReplace/browser/inPlaceReplaceCommand","vs/editor/contrib/inlineEdit/browser/commandIds","vs/editor/contrib/linesOperations/browser/copyLinesCommand","vs/editor/contrib/linesOperations/browser/sortLinesCommand","vs/editor/contrib/smartSelect/browser/wordSelections","vs/editor/contrib/suggest/browser/suggestCommitCharacters","vs/editor/contrib/suggest/browser/suggestOvertypingCapturer","vs/nls!vs/base/browser/ui/actionbar/actionViewItems","vs/nls!vs/base/browser/ui/button/button","vs/nls!vs/base/browser/ui/dialog/dialog","vs/nls!vs/base/browser/ui/dropdown/dropdownActionViewItem","vs/nls!vs/base/browser/ui/findinput/findInput","vs/nls!vs/base/browser/ui/findinput/findInputToggles","vs/nls!vs/base/browser/ui/findinput/replaceInput","vs/nls!vs/base/browser/ui/hover/hoverWidget","vs/nls!vs/base/browser/ui/iconLabel/iconLabelHover","vs/nls!vs/base/browser/ui/icons/iconSelectBox","vs/nls!vs/base/browser/ui/inputbox/inputBox","vs/nls!vs/base/browser/ui/keybindingLabel/keybindingLabel","vs/nls!vs/base/browser/ui/menu/menubar","vs/nls!vs/base/browser/ui/selectBox/selectBoxCustom","vs/nls!vs/base/browser/ui/splitview/paneview","vs/nls!vs/base/browser/ui/toolbar/toolbar","vs/nls!vs/base/browser/ui/tree/abstractTree","vs/nls!vs/base/browser/ui/tree/treeDefaults","vs/nls!vs/base/common/actions","vs/base/browser/ui/tree/treeDefaults","vs/editor/browser/widget/multiDiffEditorWidget/utils","vs/nls!vs/base/common/date","vs/nls!vs/base/common/errorMessage","vs/nls!vs/base/common/jsonErrorMessages","vs/nls!vs/base/common/keybindingLabels","vs/nls!vs/base/common/platform","vs/base/common/hotReload","vs/base/common/processes","vs/base/browser/ui/list/rowCache","vs/base/browser/ui/scrollbar/scrollbarVisibilityController","vs/base/browser/ui/selectBox/selectBoxNative","vs/base/browser/ui/tree/compressedObjectTreeModel","vs/base/browser/ui/scrollbar/horizontalScrollbar","vs/base/browser/ui/scrollbar/verticalScrollbar","vs/base/browser/ui/breadcrumbs/breadcrumbsWidget","vs/base/browser/ui/centered/centeredViewLayout","vs/base/browser/ui/dropdown/dropdown","vs/base/browser/ui/selectBox/selectBoxCustom","vs/base/browser/ui/icons/iconSelectBox","vs/base/browser/ui/menu/menubar","vs/base/browser/ui/findinput/replaceInput","vs/editor/browser/viewParts/contentWidgets/contentWidgets","vs/editor/browser/viewParts/overlayWidgets/overlayWidgets","vs/editor/browser/widget/codeEditorContributions","vs/editor/browser/widget/diffEditor/components/diffEditorSash","vs/editor/browser/view/domLineBreaksComputer","vs/editor/browser/view/viewOverlays","vs/editor/common/languages/supports/electricCharacter","vs/editor/common/model/bracketPairsTextModelPart/bracketPairsImpl","vs/editor/contrib/hover/browser/resizableContentWidget","vs/editor/contrib/inlineCompletions/browser/provideInlineCompletions","vs/nls!vs/editor/browser/controller/textAreaHandler","vs/nls!vs/editor/browser/coreCommands","vs/nls!vs/editor/browser/editorExtensions","vs/nls!vs/editor/browser/widget/codeEditorWidget","vs/nls!vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer","vs/nls!vs/editor/browser/widget/diffEditor/components/diffEditorEditors","vs/nls!vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/inlineDiffDeletedCodeMargin","vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/inlineDiffDeletedCodeMargin","vs/nls!vs/editor/browser/widget/diffEditor/diffEditor.contribution","vs/nls!vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature","vs/nls!vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature","vs/nls!vs/editor/browser/widget/diffEditor/features/revertButtonsFeature","vs/editor/browser/widget/diffEditor/features/revertButtonsFeature","vs/nls!vs/editor/browser/widget/diffEditor/registrations.contribution","vs/nls!vs/editor/browser/widget/hoverWidget/hoverWidget","vs/nls!vs/editor/browser/widget/multiDiffEditorWidget/colors","vs/nls!vs/editor/common/config/editorConfigurationSchema","vs/nls!vs/editor/common/config/editorOptions","vs/editor/browser/viewParts/viewCursors/viewCursor","vs/nls!vs/editor/common/core/editorColorRegistry","vs/nls!vs/editor/common/editorContextKeys","vs/nls!vs/editor/common/languages","vs/editor/common/model/tokenizationTextModelPart","vs/editor/common/services/editorBaseApi","vs/editor/common/services/editorSimpleWorker","vs/nls!vs/editor/common/languages/modesRegistry","vs/nls!vs/editor/common/model/editStack","vs/nls!vs/editor/common/standaloneStrings","vs/nls!vs/editor/common/viewLayout/viewLineRenderer","vs/nls!vs/editor/contrib/anchorSelect/browser/anchorSelect","vs/nls!vs/editor/contrib/bracketMatching/browser/bracketMatching","vs/nls!vs/editor/contrib/caretOperations/browser/caretOperations","vs/nls!vs/editor/contrib/caretOperations/browser/transpose","vs/nls!vs/editor/contrib/clipboard/browser/clipboard","vs/nls!vs/editor/contrib/codeAction/browser/codeAction","vs/nls!vs/editor/contrib/codeAction/browser/codeActionCommands","vs/nls!vs/editor/contrib/codeAction/browser/codeActionContributions","vs/nls!vs/editor/contrib/codeAction/browser/codeActionController","vs/nls!vs/editor/contrib/codeAction/browser/codeActionMenu","vs/nls!vs/editor/contrib/codeAction/browser/lightBulbWidget","vs/nls!vs/editor/contrib/codelens/browser/codelensController","vs/nls!vs/editor/contrib/colorPicker/browser/colorPickerWidget","vs/nls!vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions","vs/nls!vs/editor/contrib/comment/browser/comment","vs/nls!vs/editor/contrib/contextmenu/browser/contextmenu","vs/nls!vs/editor/contrib/cursorUndo/browser/cursorUndo","vs/nls!vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution","vs/nls!vs/editor/contrib/dropOrPasteInto/browser/copyPasteController","vs/nls!vs/editor/contrib/dropOrPasteInto/browser/defaultProviders","vs/nls!vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution","vs/nls!vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController","vs/nls!vs/editor/contrib/editorState/browser/keybindingCancellation","vs/nls!vs/editor/contrib/find/browser/findController","vs/nls!vs/editor/contrib/find/browser/findWidget","vs/nls!vs/editor/contrib/folding/browser/folding","vs/nls!vs/editor/contrib/folding/browser/foldingDecorations","vs/nls!vs/editor/contrib/fontZoom/browser/fontZoom","vs/nls!vs/editor/contrib/format/browser/formatActions","vs/nls!vs/editor/contrib/gotoError/browser/gotoError","vs/nls!vs/editor/contrib/gotoError/browser/gotoErrorWidget","vs/nls!vs/editor/contrib/gotoSymbol/browser/goToCommands","vs/nls!vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition","vs/nls!vs/editor/contrib/gotoSymbol/browser/peek/referencesController","vs/nls!vs/editor/contrib/gotoSymbol/browser/peek/referencesTree","vs/nls!vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget","vs/nls!vs/editor/contrib/gotoSymbol/browser/referencesModel","vs/nls!vs/editor/contrib/gotoSymbol/browser/symbolNavigation","vs/nls!vs/editor/contrib/hover/browser/hover","vs/nls!vs/editor/contrib/hover/browser/markdownHoverParticipant","vs/nls!vs/editor/contrib/hover/browser/markerHoverParticipant","vs/nls!vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace","vs/nls!vs/editor/contrib/indentation/browser/indentation","vs/nls!vs/editor/contrib/inlayHints/browser/inlayHintsHover","vs/nls!vs/editor/contrib/inlineCompletions/browser/commands","vs/nls!vs/editor/contrib/inlineCompletions/browser/hoverParticipant","vs/nls!vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys","vs/nls!vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController","vs/nls!vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget","vs/nls!vs/editor/contrib/lineSelection/browser/lineSelection","vs/nls!vs/editor/contrib/linesOperations/browser/linesOperations","vs/nls!vs/editor/contrib/linkedEditing/browser/linkedEditing","vs/nls!vs/editor/contrib/links/browser/links","vs/nls!vs/editor/contrib/message/browser/messageController","vs/nls!vs/editor/contrib/multicursor/browser/multicursor","vs/nls!vs/editor/contrib/parameterHints/browser/parameterHints","vs/nls!vs/editor/contrib/parameterHints/browser/parameterHintsWidget","vs/nls!vs/editor/contrib/peekView/browser/peekView","vs/nls!vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess","vs/nls!vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess","vs/nls!vs/editor/contrib/readOnlyMessage/browser/contribution","vs/nls!vs/editor/contrib/rename/browser/rename","vs/nls!vs/editor/contrib/rename/browser/renameInputField","vs/nls!vs/editor/contrib/smartSelect/browser/smartSelect","vs/nls!vs/editor/contrib/snippet/browser/snippetController2","vs/nls!vs/editor/contrib/snippet/browser/snippetVariables","vs/nls!vs/editor/contrib/stickyScroll/browser/stickyScrollActions","vs/nls!vs/editor/contrib/suggest/browser/suggest","vs/nls!vs/editor/contrib/suggest/browser/suggestController","vs/nls!vs/editor/contrib/suggest/browser/suggestWidget","vs/nls!vs/editor/contrib/suggest/browser/suggestWidgetDetails","vs/nls!vs/editor/contrib/suggest/browser/suggestWidgetRenderer","vs/nls!vs/editor/contrib/suggest/browser/suggestWidgetStatus","vs/nls!vs/editor/contrib/symbolIcons/browser/symbolIcons","vs/nls!vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode","vs/nls!vs/editor/contrib/tokenization/browser/tokenization","vs/nls!vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter","vs/nls!vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators","vs/nls!vs/editor/contrib/wordHighlighter/browser/highlightDecorations","vs/nls!vs/editor/contrib/wordHighlighter/browser/wordHighlighter","vs/nls!vs/editor/contrib/wordOperations/browser/wordOperations","vs/nls!vs/platform/accessibilitySignal/browser/accessibilitySignalService","vs/nls!vs/platform/action/common/actionCommonCategories","vs/nls!vs/platform/actionWidget/browser/actionList","vs/nls!vs/platform/actionWidget/browser/actionWidget","vs/nls!vs/platform/actions/browser/buttonbar","vs/nls!vs/platform/actions/browser/menuEntryActionViewItem","vs/nls!vs/platform/actions/browser/toolbar","vs/nls!vs/platform/actions/common/menuResetAction","vs/nls!vs/platform/actions/common/menuService","vs/nls!vs/platform/configuration/common/configurationRegistry","vs/nls!vs/platform/contextkey/browser/contextKeyService","vs/nls!vs/platform/contextkey/common/contextkey","vs/nls!vs/platform/contextkey/common/contextkeys","vs/nls!vs/platform/contextkey/common/scanner","vs/nls!vs/platform/dialogs/common/dialogs","vs/nls!vs/platform/dnd/browser/dnd","vs/nls!vs/platform/extensionManagement/common/abstractExtensionManagementService","vs/nls!vs/platform/extensionManagement/common/extensionManagement","vs/nls!vs/platform/extensionManagement/common/extensionManagementCLI","vs/nls!vs/platform/extensionManagement/common/extensionNls","vs/nls!vs/platform/extensions/common/extensionValidator","vs/nls!vs/platform/files/browser/htmlFileSystemProvider","vs/nls!vs/platform/files/browser/indexedDBFileSystemProvider","vs/nls!vs/platform/files/common/fileService","vs/nls!vs/platform/files/common/files","vs/nls!vs/platform/files/common/io","vs/nls!vs/platform/history/browser/contextScopedHistoryWidget","vs/nls!vs/platform/keybinding/common/abstractKeybindingService","vs/nls!vs/platform/keyboardLayout/common/keyboardConfig","vs/nls!vs/platform/languagePacks/common/languagePacks","vs/nls!vs/platform/languagePacks/common/localizedStrings","vs/nls!vs/platform/list/browser/listService","vs/nls!vs/platform/markers/common/markers","vs/nls!vs/platform/quickinput/browser/commandsQuickAccess","vs/nls!vs/platform/quickinput/browser/helpQuickAccess","vs/nls!vs/platform/quickinput/browser/quickInput","vs/nls!vs/platform/quickinput/browser/quickInputController","vs/nls!vs/platform/quickinput/browser/quickInputList","vs/nls!vs/platform/quickinput/browser/quickInputUtils","vs/nls!vs/platform/quickinput/browser/quickPickPin","vs/nls!vs/platform/request/common/request","vs/nls!vs/platform/telemetry/common/telemetryLogAppender","vs/nls!vs/platform/telemetry/common/telemetryService","vs/nls!vs/platform/terminal/common/terminalLogService","vs/nls!vs/platform/terminal/common/terminalPlatformConfiguration","vs/nls!vs/platform/terminal/common/terminalProfiles","vs/nls!vs/platform/theme/common/colorRegistry","vs/nls!vs/platform/theme/common/iconRegistry","vs/nls!vs/platform/theme/common/tokenClassificationRegistry","vs/nls!vs/platform/undoRedo/common/undoRedoService","vs/nls!vs/platform/update/common/update.config.contribution","vs/nls!vs/platform/userDataProfile/common/userDataProfile","vs/nls!vs/platform/userDataSync/common/abstractSynchronizer","vs/nls!vs/platform/userDataSync/common/keybindingsSync","vs/nls!vs/platform/userDataSync/common/settingsSync","vs/nls!vs/platform/userDataSync/common/userDataAutoSyncService","vs/nls!vs/platform/userDataSync/common/userDataSync","vs/nls!vs/platform/userDataSync/common/userDataSyncLog","vs/nls!vs/platform/userDataSync/common/userDataSyncMachines","vs/nls!vs/platform/userDataSync/common/userDataSyncResourceProvider","vs/nls!vs/platform/workspace/common/workspace","vs/nls!vs/platform/workspace/common/workspaceTrust","vs/nls!vs/workbench/api/browser/mainThreadAuthentication","vs/nls!vs/workbench/api/browser/mainThreadCLICommands","vs/nls!vs/workbench/api/browser/mainThreadChatProvider","vs/nls!vs/workbench/api/browser/mainThreadComments","vs/nls!vs/workbench/api/browser/mainThreadCustomEditors","vs/nls!vs/workbench/api/browser/mainThreadEditSessionIdentityParticipant","vs/nls!vs/workbench/api/browser/mainThreadExtensionService","vs/nls!vs/workbench/api/browser/mainThreadFileSystemEventService","vs/nls!vs/workbench/api/browser/mainThreadMessageService","vs/nls!vs/workbench/api/browser/mainThreadNotebookSaveParticipant","vs/nls!vs/workbench/api/browser/mainThreadProgress","vs/nls!vs/workbench/api/browser/mainThreadSaveParticipant","vs/nls!vs/workbench/api/browser/mainThreadTask","vs/nls!vs/workbench/api/browser/mainThreadTunnelService","vs/nls!vs/workbench/api/browser/mainThreadUriOpeners","vs/nls!vs/workbench/api/browser/mainThreadWebviews","vs/nls!vs/workbench/api/browser/mainThreadWorkspace","vs/nls!vs/workbench/api/browser/statusBarExtensionPoint","vs/nls!vs/workbench/api/browser/viewsExtensionPoint","vs/nls!vs/workbench/api/common/configurationExtensionPoint","vs/nls!vs/workbench/api/common/extHostTunnelService","vs/nls!vs/workbench/api/common/jsonValidationExtensionPoint","vs/nls!vs/workbench/browser/actions/developerActions","vs/nls!vs/workbench/browser/actions/helpActions","vs/nls!vs/workbench/browser/actions/layoutActions","vs/nls!vs/workbench/browser/actions/listCommands","vs/nls!vs/workbench/browser/actions/navigationActions","vs/nls!vs/workbench/browser/actions/quickAccessActions","vs/nls!vs/workbench/browser/actions/textInputActions","vs/nls!vs/workbench/browser/actions/windowActions","vs/nls!vs/workbench/browser/actions/workspaceActions","vs/nls!vs/workbench/browser/actions/workspaceCommands","vs/nls!vs/workbench/browser/editor","vs/nls!vs/workbench/browser/labels","vs/nls!vs/workbench/browser/parts/activitybar/activitybarPart","vs/nls!vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions","vs/nls!vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart","vs/nls!vs/workbench/browser/parts/banner/bannerPart","vs/nls!vs/workbench/browser/parts/compositeBar","vs/nls!vs/workbench/browser/parts/compositeBarActions","vs/nls!vs/workbench/browser/parts/compositePart","vs/nls!vs/workbench/browser/parts/dialogs/dialogHandler","vs/nls!vs/workbench/browser/parts/editor/binaryDiffEditor","vs/nls!vs/workbench/browser/parts/editor/binaryEditor","vs/nls!vs/workbench/browser/parts/editor/breadcrumbs","vs/nls!vs/workbench/browser/parts/editor/breadcrumbsControl","vs/nls!vs/workbench/browser/parts/editor/breadcrumbsPicker","vs/nls!vs/workbench/browser/parts/editor/editor.contribution","vs/nls!vs/workbench/browser/parts/editor/editorActions","vs/nls!vs/workbench/browser/parts/editor/editorCommands","vs/nls!vs/workbench/browser/parts/editor/editorConfiguration","vs/nls!vs/workbench/browser/parts/editor/editorDropTarget","vs/nls!vs/workbench/browser/parts/editor/editorGroupView","vs/nls!vs/workbench/browser/parts/editor/editorGroupWatermark","vs/nls!vs/workbench/browser/parts/editor/editorPanes","vs/nls!vs/workbench/browser/parts/editor/editorParts","vs/nls!vs/workbench/browser/parts/editor/editorPlaceholder","vs/nls!vs/workbench/browser/parts/editor/editorQuickAccess","vs/nls!vs/workbench/browser/parts/editor/editorStatus","vs/nls!vs/workbench/browser/parts/editor/editorTabsControl","vs/nls!vs/workbench/browser/parts/editor/multiEditorTabsControl","vs/nls!vs/workbench/browser/parts/editor/sideBySideEditor","vs/nls!vs/workbench/browser/parts/editor/textCodeEditor","vs/nls!vs/workbench/browser/parts/editor/textDiffEditor","vs/nls!vs/workbench/browser/parts/editor/textEditor","vs/nls!vs/workbench/browser/parts/globalCompositeBar","vs/nls!vs/workbench/browser/parts/notifications/notificationsActions","vs/nls!vs/workbench/browser/parts/notifications/notificationsAlerts","vs/nls!vs/workbench/browser/parts/notifications/notificationsCenter","vs/nls!vs/workbench/browser/parts/notifications/notificationsCommands","vs/nls!vs/workbench/browser/parts/notifications/notificationsList","vs/nls!vs/workbench/browser/parts/notifications/notificationsStatus","vs/nls!vs/workbench/browser/parts/notifications/notificationsToasts","vs/nls!vs/workbench/browser/parts/notifications/notificationsViewer","vs/nls!vs/workbench/browser/parts/paneCompositeBar","vs/nls!vs/workbench/browser/parts/paneCompositePart","vs/nls!vs/workbench/browser/parts/panel/panelActions","vs/nls!vs/workbench/browser/parts/panel/panelPart","vs/nls!vs/workbench/browser/parts/sidebar/sidebarActions","vs/nls!vs/workbench/browser/parts/sidebar/sidebarPart","vs/nls!vs/workbench/browser/parts/statusbar/statusbarActions","vs/nls!vs/workbench/browser/parts/statusbar/statusbarPart","vs/nls!vs/workbench/browser/parts/titlebar/commandCenterControl","vs/nls!vs/workbench/browser/parts/titlebar/menubarControl","vs/nls!vs/workbench/browser/parts/titlebar/titlebarActions","vs/nls!vs/workbench/browser/parts/titlebar/titlebarPart","vs/nls!vs/workbench/browser/parts/titlebar/windowTitle","vs/nls!vs/workbench/browser/parts/views/checkbox","vs/nls!vs/workbench/browser/parts/views/treeView","vs/nls!vs/workbench/browser/parts/views/viewFilter","vs/nls!vs/workbench/browser/parts/views/viewPane","vs/nls!vs/workbench/browser/parts/views/viewPaneContainer","vs/nls!vs/workbench/browser/quickaccess","vs/nls!vs/workbench/browser/web.main","vs/nls!vs/workbench/browser/window","vs/nls!vs/workbench/browser/workbench","vs/nls!vs/workbench/browser/workbench.contribution","vs/nls!vs/workbench/common/configuration","vs/nls!vs/workbench/common/contextkeys","vs/nls!vs/workbench/common/editor","vs/nls!vs/workbench/common/editor/diffEditorInput","vs/nls!vs/workbench/common/editor/sideBySideEditorInput","vs/nls!vs/workbench/common/editor/textEditorModel","vs/nls!vs/workbench/common/theme","vs/nls!vs/workbench/common/views","vs/nls!vs/workbench/contrib/accessibility/browser/accessibilityConfiguration","vs/nls!vs/workbench/contrib/accessibility/browser/accessibilityContributions","vs/nls!vs/workbench/contrib/accessibility/browser/accessibilityStatus","vs/nls!vs/workbench/contrib/accessibility/browser/accessibleView","vs/nls!vs/workbench/contrib/accessibility/browser/accessibleViewActions","vs/nls!vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignal.contribution","vs/nls!vs/workbench/contrib/accessibilitySignals/browser/commands","vs/nls!vs/workbench/contrib/accountEntitlements/browser/accountsEntitlements.contribution","vs/nls!vs/workbench/contrib/bulkEdit/browser/bulkEditService","vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEdit.contribution","vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane","vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview","vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree","vs/nls!vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution","vs/nls!vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek","vs/nls!vs/workbench/contrib/callHierarchy/browser/callHierarchyTree","vs/nls!vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp","vs/nls!vs/workbench/contrib/chat/browser/actions/chatActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatClearActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatCodeblockActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatCopyActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatExecuteActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatFileTreeActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatImportExport","vs/nls!vs/workbench/contrib/chat/browser/actions/chatMoveActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatQuickInputActions","vs/nls!vs/workbench/contrib/chat/browser/actions/chatTitleActions","vs/nls!vs/workbench/contrib/chat/browser/chat.contribution","vs/nls!vs/workbench/contrib/chat/browser/chatContributionServiceImpl","vs/nls!vs/workbench/contrib/chat/browser/chatEditorInput","vs/nls!vs/workbench/contrib/chat/browser/chatFollowups","vs/nls!vs/workbench/contrib/chat/browser/chatInputPart","vs/nls!vs/workbench/contrib/chat/browser/chatListRenderer","vs/nls!vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget","vs/nls!vs/workbench/contrib/chat/browser/codeBlockPart","vs/nls!vs/workbench/contrib/chat/browser/contrib/chatInputEditorContrib","vs/nls!vs/workbench/contrib/chat/common/chatColors","vs/nls!vs/workbench/contrib/chat/common/chatContextKeys","vs/nls!vs/workbench/contrib/chat/common/chatServiceImpl","vs/nls!vs/workbench/contrib/codeActions/browser/codeActionsContribution","vs/nls!vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint","vs/nls!vs/workbench/contrib/codeActions/common/documentationExtensionPoint","vs/nls!vs/workbench/contrib/codeEditor/browser/accessibility/accessibility","vs/nls!vs/workbench/contrib/codeEditor/browser/dictation/editorDictation","vs/nls!vs/workbench/contrib/codeEditor/browser/diffEditorHelper","vs/nls!vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint","vs/nls!vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget","vs/nls!vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens","vs/nls!vs/workbench/contrib/codeEditor/browser/inspectKeybindings","vs/nls!vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint","vs/nls!vs/workbench/contrib/codeEditor/browser/largeFileOptimizations","vs/nls!vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsOutline","vs/nls!vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree","vs/nls!vs/workbench/contrib/codeEditor/browser/quickaccess/gotoLineQuickAccess","vs/nls!vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess","vs/nls!vs/workbench/contrib/codeEditor/browser/saveParticipants","vs/nls!vs/workbench/contrib/codeEditor/browser/toggleColumnSelection","vs/nls!vs/workbench/contrib/codeEditor/browser/toggleMinimap","vs/nls!vs/workbench/contrib/codeEditor/browser/toggleMultiCursorModifier","vs/nls!vs/workbench/contrib/codeEditor/browser/toggleRenderControlCharacter","vs/nls!vs/workbench/contrib/codeEditor/browser/toggleRenderWhitespace","vs/nls!vs/workbench/contrib/codeEditor/browser/toggleWordWrap","vs/nls!vs/workbench/contrib/commands/common/commands.contribution","vs/nls!vs/workbench/contrib/comments/browser/commentColors","vs/nls!vs/workbench/contrib/comments/browser/commentGlyphWidget","vs/nls!vs/workbench/contrib/comments/browser/commentNode","vs/nls!vs/workbench/contrib/comments/browser/commentReply","vs/nls!vs/workbench/contrib/comments/browser/commentThreadBody","vs/nls!vs/workbench/contrib/comments/browser/commentThreadHeader","vs/nls!vs/workbench/contrib/comments/browser/commentThreadWidget","vs/nls!vs/workbench/contrib/comments/browser/comments.contribution","vs/nls!vs/workbench/contrib/comments/browser/commentsAccessibility","vs/nls!vs/workbench/contrib/comments/browser/commentsController","vs/nls!vs/workbench/contrib/comments/browser/commentsEditorContribution","vs/nls!vs/workbench/contrib/comments/browser/commentsModel","vs/nls!vs/workbench/contrib/comments/browser/commentsTreeViewer","vs/nls!vs/workbench/contrib/comments/browser/commentsView","vs/nls!vs/workbench/contrib/comments/browser/commentsViewActions","vs/nls!vs/workbench/contrib/comments/browser/reactionsAction","vs/nls!vs/workbench/contrib/comments/common/commentContextKeys","vs/nls!vs/workbench/contrib/customEditor/common/contributedCustomEditors","vs/nls!vs/workbench/contrib/customEditor/common/customEditor","vs/nls!vs/workbench/contrib/customEditor/common/extensionPoint","vs/nls!vs/workbench/contrib/debug/browser/baseDebugView","vs/nls!vs/workbench/contrib/debug/browser/breakpointEditorContribution","vs/nls!vs/workbench/contrib/debug/browser/breakpointWidget","vs/nls!vs/workbench/contrib/debug/browser/breakpointsView","vs/nls!vs/workbench/contrib/debug/browser/callStackEditorContribution","vs/nls!vs/workbench/contrib/debug/browser/callStackView","vs/nls!vs/workbench/contrib/debug/browser/debug.contribution","vs/nls!vs/workbench/contrib/debug/browser/debugActionViewItems","vs/nls!vs/workbench/contrib/debug/browser/debugAdapterManager","vs/nls!vs/workbench/contrib/debug/browser/debugColors","vs/nls!vs/workbench/contrib/debug/browser/debugCommands","vs/nls!vs/workbench/contrib/debug/browser/debugConfigurationManager","vs/nls!vs/workbench/contrib/debug/browser/debugConsoleQuickAccess","vs/nls!vs/workbench/contrib/debug/browser/debugEditorActions","vs/nls!vs/workbench/contrib/debug/browser/debugEditorContribution","vs/nls!vs/workbench/contrib/debug/browser/debugHover","vs/nls!vs/workbench/contrib/debug/browser/debugIcons","vs/nls!vs/workbench/contrib/debug/browser/debugQuickAccess","vs/nls!vs/workbench/contrib/debug/browser/debugService","vs/nls!vs/workbench/contrib/debug/browser/debugSession","vs/nls!vs/workbench/contrib/debug/browser/debugSessionPicker","vs/nls!vs/workbench/contrib/debug/browser/debugStatus","vs/nls!vs/workbench/contrib/debug/browser/debugTaskRunner","vs/nls!vs/workbench/contrib/debug/browser/debugToolBar","vs/nls!vs/workbench/contrib/debug/browser/debugViewlet","vs/nls!vs/workbench/contrib/debug/browser/disassemblyView","vs/nls!vs/workbench/contrib/debug/browser/exceptionWidget","vs/nls!vs/workbench/contrib/debug/browser/linkDetector","vs/nls!vs/workbench/contrib/debug/browser/loadedScriptsView","vs/nls!vs/workbench/contrib/debug/browser/rawDebugSession","vs/nls!vs/workbench/contrib/debug/browser/repl","vs/nls!vs/workbench/contrib/debug/browser/replViewer","vs/nls!vs/workbench/contrib/debug/browser/statusbarColorProvider","vs/nls!vs/workbench/contrib/debug/browser/variablesView","vs/nls!vs/workbench/contrib/debug/browser/watchExpressionsView","vs/nls!vs/workbench/contrib/debug/browser/welcomeView","vs/nls!vs/workbench/contrib/debug/common/abstractDebugAdapter","vs/nls!vs/workbench/contrib/debug/common/debug","vs/nls!vs/workbench/contrib/debug/common/debugContentProvider","vs/nls!vs/workbench/contrib/debug/common/debugLifecycle","vs/nls!vs/workbench/contrib/debug/common/debugModel","vs/nls!vs/workbench/contrib/debug/common/debugSchemas","vs/nls!vs/workbench/contrib/debug/common/debugSource","vs/nls!vs/workbench/contrib/debug/common/debugger","vs/nls!vs/workbench/contrib/debug/common/disassemblyViewInput","vs/nls!vs/workbench/contrib/debug/common/loadedScriptsPicker","vs/nls!vs/workbench/contrib/debug/common/replModel","vs/nls!vs/workbench/contrib/deprecatedExtensionMigrator/browser/deprecatedExtensionMigrator.contribution","vs/nls!vs/workbench/contrib/editSessions/browser/editSessions.contribution","vs/nls!vs/workbench/contrib/editSessions/browser/editSessionsStorageService","vs/nls!vs/workbench/contrib/editSessions/browser/editSessionsViews","vs/nls!vs/workbench/contrib/editSessions/common/editSessions","vs/nls!vs/workbench/contrib/editSessions/common/editSessionsLogService","vs/nls!vs/workbench/contrib/emmet/browser/actions/expandAbbreviation","vs/nls!vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor","vs/nls!vs/workbench/contrib/extensions/browser/configBasedRecommendations","vs/nls!vs/workbench/contrib/extensions/browser/deprecatedExtensionsChecker","vs/nls!vs/workbench/contrib/extensions/browser/exeBasedRecommendations","vs/nls!vs/workbench/contrib/extensions/browser/extensionEditor","vs/nls!vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant","vs/nls!vs/workbench/contrib/extensions/browser/extensionFeaturesTab","vs/nls!vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService","vs/nls!vs/workbench/contrib/extensions/browser/extensions.contribution","vs/nls!vs/workbench/contrib/extensions/browser/extensions.web.contribution","vs/nls!vs/workbench/contrib/extensions/browser/extensionsActions","vs/nls!vs/workbench/contrib/extensions/browser/extensionsActivationProgress","vs/nls!vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider","vs/nls!vs/workbench/contrib/extensions/browser/extensionsDependencyChecker","vs/nls!vs/workbench/contrib/extensions/browser/extensionsIcons","vs/nls!vs/workbench/contrib/extensions/browser/extensionsQuickAccess","vs/nls!vs/workbench/contrib/extensions/browser/extensionsViewer","vs/nls!vs/workbench/contrib/extensions/browser/extensionsViewlet","vs/nls!vs/workbench/contrib/extensions/browser/extensionsViews","vs/nls!vs/workbench/contrib/extensions/browser/extensionsWidgets","vs/nls!vs/workbench/contrib/extensions/browser/extensionsWorkbenchService","vs/nls!vs/workbench/contrib/extensions/browser/fileBasedRecommendations","vs/nls!vs/workbench/contrib/extensions/browser/webRecommendations","vs/nls!vs/workbench/contrib/extensions/browser/workspaceRecommendations","vs/nls!vs/workbench/contrib/extensions/common/extensionsFileTemplate","vs/nls!vs/workbench/contrib/extensions/common/extensionsInput","vs/nls!vs/workbench/contrib/extensions/common/extensionsUtils","vs/nls!vs/workbench/contrib/extensions/common/reportExtensionIssueAction","vs/nls!vs/workbench/contrib/extensions/common/runtimeExtensionsInput","vs/nls!vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution","vs/nls!vs/workbench/contrib/externalUriOpener/common/configuration","vs/nls!vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService","vs/nls!vs/workbench/contrib/files/browser/editors/binaryFileEditor","vs/nls!vs/workbench/contrib/files/browser/editors/textFileEditor","vs/nls!vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler","vs/nls!vs/workbench/contrib/files/browser/explorerViewlet","vs/nls!vs/workbench/contrib/files/browser/fileActions","vs/nls!vs/workbench/contrib/files/browser/fileActions.contribution","vs/nls!vs/workbench/contrib/files/browser/fileCommands","vs/nls!vs/workbench/contrib/files/browser/fileConstants","vs/nls!vs/workbench/contrib/files/browser/fileImportExport","vs/nls!vs/workbench/contrib/files/browser/files.contribution","vs/nls!vs/workbench/contrib/files/browser/views/emptyView","vs/nls!vs/workbench/contrib/files/browser/views/explorerDecorationsProvider","vs/nls!vs/workbench/contrib/files/browser/views/explorerView","vs/nls!vs/workbench/contrib/files/browser/views/explorerViewer","vs/nls!vs/workbench/contrib/files/browser/views/openEditorsView","vs/nls!vs/workbench/contrib/files/browser/workspaceWatcher","vs/nls!vs/workbench/contrib/files/common/dirtyFilesIndicator","vs/nls!vs/workbench/contrib/files/common/files","vs/nls!vs/workbench/contrib/folding/browser/folding.contribution","vs/nls!vs/workbench/contrib/format/browser/formatActionsMultiple","vs/nls!vs/workbench/contrib/format/browser/formatActionsNone","vs/nls!vs/workbench/contrib/format/browser/formatModified","vs/nls!vs/workbench/contrib/inlayHints/browser/inlayHintsAccessibilty","vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatActions","vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatController","vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatLivePreviewWidget","vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatSavingServiceImpl","vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatStrategies","vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatWidget","vs/nls!vs/workbench/contrib/inlineChat/common/inlineChat","vs/nls!vs/workbench/contrib/interactive/browser/interactive.contribution","vs/nls!vs/workbench/contrib/interactive/browser/interactiveEditor","vs/nls!vs/workbench/contrib/issue/browser/issue.contribution","vs/nls!vs/workbench/contrib/issue/common/issue.contribution","vs/nls!vs/workbench/contrib/keybindings/browser/keybindings.contribution","vs/nls!vs/workbench/contrib/languageDetection/browser/languageDetection.contribution","vs/nls!vs/workbench/contrib/languageStatus/browser/languageStatus.contribution","vs/nls!vs/workbench/contrib/limitIndicator/browser/limitIndicator.contribution","vs/nls!vs/workbench/contrib/localHistory/browser/localHistory","vs/nls!vs/workbench/contrib/localHistory/browser/localHistoryCommands","vs/nls!vs/workbench/contrib/localHistory/browser/localHistoryTimeline","vs/nls!vs/workbench/contrib/localization/common/localization.contribution","vs/nls!vs/workbench/contrib/localization/common/localizationsActions","vs/nls!vs/workbench/contrib/logs/common/logs.contribution","vs/nls!vs/workbench/contrib/logs/common/logsActions","vs/nls!vs/workbench/contrib/markdown/browser/markdownSettingRenderer","vs/nls!vs/workbench/contrib/markers/browser/markers.contribution","vs/nls!vs/workbench/contrib/markers/browser/markersFileDecorations","vs/nls!vs/workbench/contrib/markers/browser/markersTable","vs/nls!vs/workbench/contrib/markers/browser/markersTreeViewer","vs/nls!vs/workbench/contrib/markers/browser/markersView","vs/nls!vs/workbench/contrib/markers/browser/messages","vs/nls!vs/workbench/contrib/mergeEditor/browser/commands/commands","vs/nls!vs/workbench/contrib/mergeEditor/browser/commands/devCommands","vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeEditor.contribution","vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeEditorInput","vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel","vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeMarkers/mergeMarkersController","vs/nls!vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/colors","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/conflictActions","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/editors/inputCodeEditorView","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/editors/resultCodeEditorView","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/mergeEditor","vs/nls!vs/workbench/contrib/mergeEditor/browser/view/viewModel","vs/nls!vs/workbench/contrib/mergeEditor/common/mergeEditor","vs/nls!vs/workbench/contrib/multiDiffEditor/browser/actions","vs/nls!vs/workbench/contrib/multiDiffEditor/browser/icons.contribution","vs/nls!vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.contribution","vs/nls!vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput","vs/nls!vs/workbench/contrib/multiDiffEditor/browser/scmMultiDiffSourceResolver","vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands","vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController","vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders","vs/nls!vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard","vs/nls!vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar","vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/notebookFind","vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget","vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget","vs/nls!vs/workbench/contrib/notebook/browser/contrib/format/formatting","vs/nls!vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted","vs/nls!vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions","vs/nls!vs/workbench/contrib/notebook/browser/contrib/navigation/arrow","vs/nls!vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariableCommands","vs/nls!vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariables","vs/nls!vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesDataSource","vs/nls!vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesTree","vs/nls!vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesView","vs/nls!vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline","vs/nls!vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile","vs/nls!vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants","vs/nls!vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout","vs/nls!vs/workbench/contrib/notebook/browser/controller/cellOperations","vs/nls!vs/workbench/contrib/notebook/browser/controller/cellOutputActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/chat/cellChatActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/chat/notebookChatContext","vs/nls!vs/workbench/contrib/notebook/browser/controller/chat/notebookChatController","vs/nls!vs/workbench/contrib/notebook/browser/controller/coreActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/editActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/executeActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/foldingController","vs/nls!vs/workbench/contrib/notebook/browser/controller/insertCellActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/layoutActions","vs/nls!vs/workbench/contrib/notebook/browser/controller/notebookIndentationActions","vs/nls!vs/workbench/contrib/notebook/browser/diff/diffElementOutputs","vs/nls!vs/workbench/contrib/notebook/browser/diff/notebookDiffActions","vs/nls!vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor","vs/nls!vs/workbench/contrib/notebook/browser/notebook.contribution","vs/nls!vs/workbench/contrib/notebook/browser/notebookAccessibility","vs/nls!vs/workbench/contrib/notebook/browser/notebookEditor","vs/nls!vs/workbench/contrib/notebook/browser/notebookEditorWidget","vs/nls!vs/workbench/contrib/notebook/browser/notebookExtensionPoint","vs/nls!vs/workbench/contrib/notebook/browser/notebookIcons","vs/nls!vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl","vs/nls!vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl","vs/nls!vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl","vs/nls!vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl","vs/nls!vs/workbench/contrib/notebook/browser/services/notebookServiceImpl","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/codeCell","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint","vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/markupCell","vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView","vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer","vs/nls!vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory","vs/nls!vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll","vs/nls!vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy","vs/nls!vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView","vs/nls!vs/workbench/contrib/notebook/common/notebookEditorInput","vs/nls!vs/workbench/contrib/outline/browser/outline.contribution","vs/nls!vs/workbench/contrib/outline/browser/outlineActions","vs/nls!vs/workbench/contrib/outline/browser/outlinePane","vs/nls!vs/workbench/contrib/output/browser/output.contribution","vs/nls!vs/workbench/contrib/output/browser/outputView","vs/nls!vs/workbench/contrib/performance/browser/performance.contribution","vs/nls!vs/workbench/contrib/performance/browser/perfviewEditor","vs/nls!vs/workbench/contrib/preferences/browser/keybindingWidgets","vs/nls!vs/workbench/contrib/preferences/browser/keybindingsEditor","vs/nls!vs/workbench/contrib/preferences/browser/keybindingsEditorContribution","vs/nls!vs/workbench/contrib/preferences/browser/keyboardLayoutPicker","vs/nls!vs/workbench/contrib/preferences/browser/preferences.contribution","vs/nls!vs/workbench/contrib/preferences/browser/preferencesActions","vs/nls!vs/workbench/contrib/preferences/browser/preferencesIcons","vs/nls!vs/workbench/contrib/preferences/browser/preferencesRenderers","vs/nls!vs/workbench/contrib/preferences/browser/preferencesWidgets","vs/nls!vs/workbench/contrib/preferences/browser/settingsEditor2","vs/nls!vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators","vs/nls!vs/workbench/contrib/preferences/browser/settingsLayout","vs/nls!vs/workbench/contrib/preferences/browser/settingsSearchMenu","vs/nls!vs/workbench/contrib/preferences/browser/settingsTree","vs/nls!vs/workbench/contrib/preferences/browser/settingsWidgets","vs/nls!vs/workbench/contrib/preferences/browser/tocTree","vs/nls!vs/workbench/contrib/preferences/common/preferencesContribution","vs/nls!vs/workbench/contrib/preferences/common/settingsEditorColorRegistry","vs/nls!vs/workbench/contrib/quickaccess/browser/commandsQuickAccess","vs/nls!vs/workbench/contrib/quickaccess/browser/quickAccess.contribution","vs/nls!vs/workbench/contrib/quickaccess/browser/viewQuickAccess","vs/nls!vs/workbench/contrib/relauncher/browser/relauncher.contribution","vs/nls!vs/workbench/contrib/remote/browser/explorerViewItems","vs/nls!vs/workbench/contrib/remote/browser/remote","vs/nls!vs/workbench/contrib/remote/browser/remoteConnectionHealth","vs/nls!vs/workbench/contrib/remote/browser/remoteExplorer","vs/nls!vs/workbench/contrib/remote/browser/remoteIcons","vs/nls!vs/workbench/contrib/remote/browser/remoteIndicator","vs/nls!vs/workbench/contrib/remote/browser/remoteStartEntry","vs/nls!vs/workbench/contrib/remote/browser/tunnelFactory","vs/nls!vs/workbench/contrib/remote/browser/tunnelView","vs/nls!vs/workbench/contrib/remote/common/remote.contribution","vs/nls!vs/workbench/contrib/sash/browser/sash.contribution","vs/nls!vs/workbench/contrib/scm/browser/activity","vs/nls!vs/workbench/contrib/scm/browser/dirtyDiffSwitcher","vs/nls!vs/workbench/contrib/scm/browser/dirtydiffDecorator","vs/nls!vs/workbench/contrib/scm/browser/menus","vs/nls!vs/workbench/contrib/scm/browser/scm.contribution","vs/nls!vs/workbench/contrib/scm/browser/scmRepositoriesViewPane","vs/nls!vs/workbench/contrib/scm/browser/scmViewPane","vs/nls!vs/workbench/contrib/scm/browser/scmViewPaneContainer","vs/nls!vs/workbench/contrib/search/browser/anythingQuickAccess","vs/nls!vs/workbench/contrib/search/browser/patternInputWidget","vs/nls!vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess","vs/nls!vs/workbench/contrib/search/browser/replaceService","vs/nls!vs/workbench/contrib/search/browser/search.contribution","vs/nls!vs/workbench/contrib/search/browser/searchActionsBase","vs/nls!vs/workbench/contrib/search/browser/searchActionsCopy","vs/nls!vs/workbench/contrib/search/browser/searchActionsFind","vs/nls!vs/workbench/contrib/search/browser/searchActionsNav","vs/nls!vs/workbench/contrib/search/browser/searchActionsRemoveReplace","vs/nls!vs/workbench/contrib/search/browser/searchActionsSymbol","vs/nls!vs/workbench/contrib/search/browser/searchActionsTextQuickAccess","vs/nls!vs/workbench/contrib/search/browser/searchActionsTopBar","vs/nls!vs/workbench/contrib/search/browser/searchFindInput","vs/nls!vs/workbench/contrib/search/browser/searchIcons","vs/nls!vs/workbench/contrib/search/browser/searchMessage","vs/nls!vs/workbench/contrib/search/browser/searchResultsView","vs/nls!vs/workbench/contrib/search/browser/searchView","vs/nls!vs/workbench/contrib/search/browser/searchWidget","vs/nls!vs/workbench/contrib/search/browser/symbolsQuickAccess","vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditor","vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditor.contribution","vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditorInput","vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditorSerialization","vs/nls!vs/workbench/contrib/share/browser/share.contribution","vs/nls!vs/workbench/contrib/share/browser/shareService","vs/nls!vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions","vs/nls!vs/workbench/contrib/snippets/browser/commands/configureSnippets","vs/nls!vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets","vs/nls!vs/workbench/contrib/snippets/browser/commands/insertSnippet","vs/nls!vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet","vs/nls!vs/workbench/contrib/snippets/browser/snippetCodeActionProvider","vs/nls!vs/workbench/contrib/snippets/browser/snippetCompletionProvider","vs/nls!vs/workbench/contrib/snippets/browser/snippetPicker","vs/nls!vs/workbench/contrib/snippets/browser/snippets.contribution","vs/nls!vs/workbench/contrib/snippets/browser/snippetsFile","vs/nls!vs/workbench/contrib/snippets/browser/snippetsService","vs/nls!vs/workbench/contrib/speech/common/speechService","vs/nls!vs/workbench/contrib/surveys/browser/ces.contribution","vs/nls!vs/workbench/contrib/surveys/browser/languageSurveys.contribution","vs/nls!vs/workbench/contrib/surveys/browser/nps.contribution","vs/nls!vs/workbench/contrib/tasks/browser/abstractTaskService","vs/nls!vs/workbench/contrib/tasks/browser/runAutomaticTasks","vs/nls!vs/workbench/contrib/tasks/browser/task.contribution","vs/nls!vs/workbench/contrib/tasks/browser/taskQuickPick","vs/nls!vs/workbench/contrib/tasks/browser/taskService","vs/nls!vs/workbench/contrib/tasks/browser/taskTerminalStatus","vs/nls!vs/workbench/contrib/tasks/browser/tasksQuickAccess","vs/nls!vs/workbench/contrib/tasks/browser/terminalTaskSystem","vs/nls!vs/workbench/contrib/tasks/common/jsonSchemaCommon","vs/nls!vs/workbench/contrib/tasks/common/jsonSchema_v1","vs/nls!vs/workbench/contrib/tasks/common/jsonSchema_v2","vs/nls!vs/workbench/contrib/tasks/common/problemMatcher","vs/nls!vs/workbench/contrib/tasks/common/taskConfiguration","vs/nls!vs/workbench/contrib/tasks/common/taskDefinitionRegistry","vs/nls!vs/workbench/contrib/tasks/common/taskService","vs/nls!vs/workbench/contrib/tasks/common/taskTemplates","vs/nls!vs/workbench/contrib/tasks/common/tasks","vs/nls!vs/workbench/contrib/terminal/browser/baseTerminalBackend","vs/nls!vs/workbench/contrib/terminal/browser/environmentVariableInfo","vs/nls!vs/workbench/contrib/terminal/browser/terminal.contribution","vs/nls!vs/workbench/contrib/terminal/browser/terminalActions","vs/nls!vs/workbench/contrib/terminal/browser/terminalConfigHelper","vs/nls!vs/workbench/contrib/terminal/browser/terminalEditorInput","vs/nls!vs/workbench/contrib/terminal/browser/terminalIcons","vs/nls!vs/workbench/contrib/terminal/browser/terminalInstance","vs/nls!vs/workbench/contrib/terminal/browser/terminalMenus","vs/nls!vs/workbench/contrib/terminal/browser/terminalProcessManager","vs/nls!vs/workbench/contrib/terminal/browser/terminalProfileQuickpick","vs/nls!vs/workbench/contrib/terminal/browser/terminalQuickAccess","vs/nls!vs/workbench/contrib/terminal/browser/terminalRunRecentQuickPick","vs/nls!vs/workbench/contrib/terminal/browser/terminalService","vs/nls!vs/workbench/contrib/terminal/browser/terminalTabbedView","vs/nls!vs/workbench/contrib/terminal/browser/terminalTabsList","vs/nls!vs/workbench/contrib/terminal/browser/terminalTooltip","vs/nls!vs/workbench/contrib/terminal/browser/terminalView","vs/nls!vs/workbench/contrib/terminal/browser/terminalVoice","vs/nls!vs/workbench/contrib/terminal/browser/xterm/decorationAddon","vs/nls!vs/workbench/contrib/terminal/browser/xterm/decorationStyles","vs/nls!vs/workbench/contrib/terminal/browser/xterm/xtermTerminal","vs/nls!vs/workbench/contrib/terminal/common/terminal","vs/nls!vs/workbench/contrib/terminal/common/terminalClipboard","vs/nls!vs/workbench/contrib/terminal/common/terminalColorRegistry","vs/nls!vs/workbench/contrib/terminal/common/terminalConfiguration","vs/nls!vs/workbench/contrib/terminal/common/terminalContextKey","vs/nls!vs/workbench/contrib/terminal/common/terminalStrings","vs/nls!vs/workbench/contrib/terminalContrib/accessibility/browser/terminal.accessibility.contribution","vs/nls!vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp","vs/nls!vs/workbench/contrib/terminalContrib/developer/browser/terminal.developer.contribution","vs/nls!vs/workbench/contrib/terminalContrib/environmentChanges/browser/terminal.environmentChanges.contribution","vs/nls!vs/workbench/contrib/terminalContrib/find/browser/terminal.find.contribution","vs/nls!vs/workbench/contrib/terminalContrib/find/browser/textInputContextMenu","vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminal.links.contribution","vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter","vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager","vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick","vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon","vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/terminal.quickFix.contribution","vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixBuiltinActions","vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixService","vs/nls!vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollColorRegistry","vs/nls!vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollOverlay","vs/nls!vs/workbench/contrib/terminalContrib/suggest/browser/terminal.suggest.contribution","vs/nls!vs/workbench/contrib/terminalContrib/zoom/browser/terminal.zoom.contribution","vs/nls!vs/workbench/contrib/testing/browser/codeCoverageDecorations","vs/nls!vs/workbench/contrib/testing/browser/icons","vs/nls!vs/workbench/contrib/testing/browser/testCoverageBars","vs/nls!vs/workbench/contrib/testing/browser/testCoverageView","vs/nls!vs/workbench/contrib/testing/browser/testExplorerActions","vs/nls!vs/workbench/contrib/testing/browser/testing.contribution","vs/nls!vs/workbench/contrib/testing/browser/testingConfigurationUi","vs/nls!vs/workbench/contrib/testing/browser/testingDecorations","vs/nls!vs/workbench/contrib/testing/browser/testingExplorerFilter","vs/nls!vs/workbench/contrib/testing/browser/testingExplorerView","vs/nls!vs/workbench/contrib/testing/browser/testingOutputPeek","vs/nls!vs/workbench/contrib/testing/browser/testingProgressUiService","vs/nls!vs/workbench/contrib/testing/browser/testingViewPaneContainer","vs/nls!vs/workbench/contrib/testing/browser/theme","vs/nls!vs/workbench/contrib/testing/common/configuration","vs/nls!vs/workbench/contrib/testing/common/constants","vs/nls!vs/workbench/contrib/testing/common/testCoverageService","vs/nls!vs/workbench/contrib/testing/common/testResult","vs/nls!vs/workbench/contrib/testing/common/testServiceImpl","vs/nls!vs/workbench/contrib/testing/common/testingContentProvider","vs/nls!vs/workbench/contrib/testing/common/testingContextKeys","vs/nls!vs/workbench/contrib/themes/browser/themes.contribution","vs/nls!vs/workbench/contrib/timeline/browser/timeline.contribution","vs/nls!vs/workbench/contrib/timeline/browser/timelinePane","vs/nls!vs/workbench/contrib/typeHierarchy/browser/typeHierarchy.contribution","vs/nls!vs/workbench/contrib/typeHierarchy/browser/typeHierarchyPeek","vs/nls!vs/workbench/contrib/typeHierarchy/browser/typeHierarchyTree","vs/nls!vs/workbench/contrib/update/browser/releaseNotesEditor","vs/nls!vs/workbench/contrib/update/browser/update","vs/nls!vs/workbench/contrib/update/browser/update.contribution","vs/nls!vs/workbench/contrib/url/browser/trustedDomains","vs/nls!vs/workbench/contrib/url/browser/trustedDomainsValidator","vs/nls!vs/workbench/contrib/url/browser/url.contribution","vs/nls!vs/workbench/contrib/userDataProfile/browser/userDataProfile","vs/nls!vs/workbench/contrib/userDataProfile/browser/userDataProfileActions","vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSync","vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSync.contribution","vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView","vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSyncViews","vs/nls!vs/workbench/contrib/webview/browser/webview.contribution","vs/nls!vs/workbench/contrib/webview/browser/webviewElement","vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewCommands","vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewEditor","vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewPanel.contribution","vs/nls!vs/workbench/contrib/welcomeDialog/browser/welcomeDialog.contribution","vs/nls!vs/workbench/contrib/welcomeDialog/browser/welcomeWidget","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.contribution","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService","vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/startupPage","vs/nls!vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent","vs/nls!vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile","vs/nls!vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker","vs/nls!vs/workbench/contrib/welcomeViews/common/newFile.contribution","vs/nls!vs/workbench/contrib/welcomeViews/common/viewsWelcomeContribution","vs/nls!vs/workbench/contrib/welcomeViews/common/viewsWelcomeExtensionPoint","vs/nls!vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough","vs/nls!vs/workbench/contrib/welcomeWalkthrough/browser/walkThrough.contribution","vs/nls!vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart","vs/nls!vs/workbench/contrib/welcomeWalkthrough/common/walkThroughUtils","vs/nls!vs/workbench/contrib/workspace/browser/workspace.contribution","vs/nls!vs/workbench/contrib/workspace/browser/workspaceTrustEditor","vs/nls!vs/workbench/contrib/workspace/common/workspace","vs/nls!vs/workbench/contrib/workspaces/browser/workspaces.contribution","vs/nls!vs/workbench/services/actions/common/menusExtensionPoint","vs/nls!vs/workbench/services/assignment/common/assignmentService","vs/nls!vs/workbench/services/authentication/browser/authenticationService","vs/nls!vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService","vs/nls!vs/workbench/services/clipboard/browser/clipboardService","vs/nls!vs/workbench/services/configuration/browser/configurationService","vs/nls!vs/workbench/services/configuration/common/configurationEditing","vs/nls!vs/workbench/services/configuration/common/jsonEditingService","vs/nls!vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService","vs/nls!vs/workbench/services/configurationResolver/common/configurationResolverSchema","vs/nls!vs/workbench/services/configurationResolver/common/configurationResolverUtils","vs/nls!vs/workbench/services/configurationResolver/common/variableResolver","vs/nls!vs/workbench/services/decorations/browser/decorationsService","vs/nls!vs/workbench/services/dialogs/browser/abstractFileDialogService","vs/nls!vs/workbench/services/dialogs/browser/fileDialogService","vs/nls!vs/workbench/services/dialogs/browser/simpleFileDialog","vs/nls!vs/workbench/services/editor/browser/editorResolverService","vs/nls!vs/workbench/services/editor/common/editorResolverService","vs/nls!vs/workbench/services/extensionManagement/browser/extensionBisect","vs/nls!vs/workbench/services/extensionManagement/browser/extensionEnablementService","vs/nls!vs/workbench/services/extensionManagement/browser/webExtensionsScannerService","vs/nls!vs/workbench/services/extensionManagement/common/extensionFeaturesManagemetService","vs/nls!vs/workbench/services/extensionManagement/common/extensionManagementServerService","vs/nls!vs/workbench/services/extensionManagement/common/extensionManagementService","vs/nls!vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig","vs/nls!vs/workbench/services/extensions/browser/extensionUrlHandler","vs/nls!vs/workbench/services/extensions/common/abstractExtensionService","vs/nls!vs/workbench/services/extensions/common/extensionHostManager","vs/nls!vs/workbench/services/extensions/common/extensionsRegistry","vs/nls!vs/workbench/services/extensions/common/extensionsUtil","vs/nls!vs/workbench/services/filesConfiguration/common/filesConfigurationService","vs/nls!vs/workbench/services/history/browser/historyService","vs/nls!vs/workbench/services/host/browser/browserHostService","vs/nls!vs/workbench/services/issue/browser/issueTroubleshoot","vs/nls!vs/workbench/services/keybinding/browser/keybindingService","vs/nls!vs/workbench/services/keybinding/browser/keyboardLayoutService","vs/nls!vs/workbench/services/keybinding/common/keybindingEditing","vs/nls!vs/workbench/services/label/common/labelService","vs/nls!vs/workbench/services/language/common/languageService","vs/nls!vs/workbench/services/lifecycle/browser/lifecycleService","vs/nls!vs/workbench/services/localization/browser/localeService","vs/nls!vs/workbench/services/notification/common/notificationService","vs/nls!vs/workbench/services/preferences/browser/keybindingsEditorInput","vs/nls!vs/workbench/services/preferences/browser/keybindingsEditorModel","vs/nls!vs/workbench/services/preferences/browser/preferencesService","vs/nls!vs/workbench/services/preferences/common/preferencesEditorInput","vs/nls!vs/workbench/services/preferences/common/preferencesModels","vs/nls!vs/workbench/services/preferences/common/preferencesValidation","vs/nls!vs/workbench/services/progress/browser/progressService","vs/nls!vs/workbench/services/remote/browser/remoteAgentService","vs/nls!vs/workbench/services/remote/common/remoteExplorerService","vs/nls!vs/workbench/services/remote/common/tunnelModel","vs/nls!vs/workbench/services/search/browser/searchService","vs/nls!vs/workbench/services/search/common/queryBuilder","vs/nls!vs/workbench/services/suggest/browser/simpleSuggestWidget","vs/nls!vs/workbench/services/textMate/browser/textMateTokenizationFeatureImpl","vs/nls!vs/workbench/services/textMate/common/TMGrammars","vs/nls!vs/workbench/services/textfile/browser/textFileService","vs/nls!vs/workbench/services/textfile/common/textFileEditorModel","vs/nls!vs/workbench/services/textfile/common/textFileEditorModelManager","vs/nls!vs/workbench/services/textfile/common/textFileSaveParticipant","vs/nls!vs/workbench/services/themes/browser/fileIconThemeData","vs/nls!vs/workbench/services/themes/browser/productIconThemeData","vs/nls!vs/workbench/services/themes/browser/workbenchThemeService","vs/nls!vs/workbench/services/themes/common/colorExtensionPoint","vs/nls!vs/workbench/services/themes/common/colorThemeData","vs/nls!vs/workbench/services/themes/common/colorThemeSchema","vs/nls!vs/workbench/services/themes/common/fileIconThemeSchema","vs/nls!vs/workbench/services/themes/common/iconExtensionPoint","vs/nls!vs/workbench/services/themes/common/productIconThemeSchema","vs/nls!vs/workbench/services/themes/common/themeConfiguration","vs/nls!vs/workbench/services/themes/common/themeExtensionPoints","vs/nls!vs/workbench/services/themes/common/tokenClassificationExtensionPoint","vs/nls!vs/workbench/services/userDataProfile/browser/extensionsResource","vs/nls!vs/workbench/services/userDataProfile/browser/globalStateResource","vs/nls!vs/workbench/services/userDataProfile/browser/keybindingsResource","vs/nls!vs/workbench/services/userDataProfile/browser/settingsResource","vs/nls!vs/workbench/services/userDataProfile/browser/snippetsResource","vs/nls!vs/workbench/services/userDataProfile/browser/tasksResource","vs/nls!vs/workbench/services/userDataProfile/browser/userDataProfileImportExportService","vs/nls!vs/workbench/services/userDataProfile/browser/userDataProfileManagement","vs/nls!vs/workbench/services/userDataProfile/common/userDataProfile","vs/nls!vs/workbench/services/userDataProfile/common/userDataProfileIcons","vs/nls!vs/workbench/services/userDataSync/browser/userDataSyncWorkbenchService","vs/nls!vs/workbench/services/userDataSync/common/userDataSync","vs/nls!vs/workbench/services/views/browser/viewDescriptorService","vs/nls!vs/workbench/services/views/browser/viewsService","vs/nls!vs/workbench/services/views/common/viewContainerModel","vs/nls!vs/workbench/services/workingCopy/common/fileWorkingCopyManager","vs/nls!vs/workbench/services/workingCopy/common/storedFileWorkingCopy","vs/nls!vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager","vs/nls!vs/workbench/services/workingCopy/common/storedFileWorkingCopySaveParticipant","vs/nls!vs/workbench/services/workingCopy/common/workingCopyHistoryService","vs/nls!vs/workbench/services/workingCopy/common/workingCopyHistoryTracker","vs/nls!vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService","vs/nls!vs/workbench/services/workspaces/browser/workspaceTrustEditorInput","vs/platform/assignment/common/assignment","vs/platform/backup/common/backup","vs/platform/contextkey/common/scanner","vs/platform/debug/common/extensionHostDebugIpc","vs/platform/download/common/downloadIpc","vs/platform/extensionManagement/common/configRemotes","vs/platform/instantiation/common/graph","vs/editor/common/services/languageFeaturesService","vs/editor/contrib/inlineEdit/browser/ghostTextWidget","vs/editor/contrib/links/browser/getLinks","vs/editor/common/services/textResourceConfigurationService","vs/editor/contrib/parameterHints/browser/parameterHintsModel","vs/editor/contrib/suggest/browser/suggestAlternatives","vs/editor/contrib/suggest/browser/wordContextKey","vs/editor/browser/config/editorConfiguration","vs/platform/contextkey/browser/contextKeyService","vs/platform/extensionManagement/common/extensionManagementIpc","vs/platform/externalTerminal/common/externalTerminal","vs/platform/files/browser/indexedDBFileSystemProvider","vs/platform/files/common/io","vs/platform/files/common/diskFileSystemProviderClient","vs/platform/issue/common/issueReporterUtil","vs/platform/keybinding/common/abstractKeybindingService","vs/platform/keybinding/common/usLayoutResolvedKeybinding","vs/platform/keyboardLayout/common/keyboardMapper","vs/platform/languagePacks/common/localizedStrings","vs/platform/accessibility/browser/accessibilityService","vs/platform/contextview/browser/contextViewService","vs/platform/lifecycle/common/lifecycle","vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution","vs/editor/contrib/documentSymbols/browser/documentSymbols","vs/platform/clipboard/browser/clipboardService","vs/platform/files/common/fileService","vs/platform/log/common/fileLog","vs/platform/log/common/logIpc","vs/platform/log/common/logService","vs/editor/browser/services/openerService","vs/platform/quickinput/browser/quickInputBox","vs/editor/browser/widget/hoverWidget/hoverWidget","vs/editor/common/cursor/cursor","vs/editor/common/services/languagesRegistry","vs/editor/common/services/languageService","vs/editor/contrib/hover/browser/marginHover","vs/editor/contrib/inlineCompletions/browser/inlineCompletionsSource","vs/editor/contrib/linesOperations/browser/moveLinesCommand","vs/platform/actions/common/menuResetAction","vs/platform/keyboardLayout/common/keyboardConfig","vs/platform/quickinput/browser/helpQuickAccess","vs/platform/quickinput/browser/quickAccess","vs/platform/remote/common/managedSocket","vs/platform/remote/browser/browserSocketFactory","vs/platform/remote/browser/remoteAuthorityResolverService","vs/platform/download/common/downloadService","vs/platform/request/browser/requestService","vs/platform/request/common/requestIpc","vs/platform/sign/common/abstractSignService","vs/platform/sign/browser/signService","vs/platform/storage/common/storageIpc","vs/platform/telemetry/common/commonProperties","vs/platform/telemetry/common/errorTelemetry","vs/platform/telemetry/browser/errorTelemetry","vs/editor/browser/services/markerDecorations","vs/editor/browser/view/viewController","vs/editor/browser/widget/diffEditor/diffProviderFactoryService","vs/editor/contrib/anchorSelect/browser/anchorSelect","vs/editor/contrib/caretOperations/browser/caretOperations","vs/editor/contrib/caretOperations/browser/transpose","vs/editor/contrib/comment/browser/comment","vs/editor/contrib/cursorUndo/browser/cursorUndo","vs/editor/contrib/editorState/browser/keybindingCancellation","vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver","vs/editor/contrib/fontZoom/browser/fontZoom","vs/editor/contrib/gotoSymbol/browser/symbolNavigation","vs/editor/contrib/lineSelection/browser/lineSelection","vs/editor/contrib/longLinesHelper/browser/longLinesHelper","vs/editor/contrib/readOnlyMessage/browser/contribution","vs/editor/contrib/tokenization/browser/tokenization","vs/editor/contrib/wordPartOperations/browser/wordPartOperations","vs/platform/actions/browser/buttonbar","vs/platform/assignment/common/assignmentService","vs/platform/extensionManagement/common/extensionManagementCLI","vs/platform/extensionManagement/common/extensionTipsService","vs/platform/extensionManagement/common/unsupportedExtensionsMigration","vs/platform/externalServices/common/marketplace","vs/platform/languagePacks/browser/languagePacks","vs/platform/telemetry/common/1dsAppender","vs/platform/telemetry/browser/1dsAppender","vs/platform/telemetry/common/telemetryLogAppender","vs/platform/telemetry/common/telemetryService","vs/platform/terminal/common/capabilities/bufferMarkCapability","vs/platform/terminal/common/capabilities/commandDetection/terminalCommand","vs/platform/terminal/common/capabilities/cwdDetectionCapability","vs/platform/terminal/common/capabilities/naiveCwdDetectionCapability","vs/platform/terminal/common/capabilities/partialCommandDetectionCapability","vs/platform/terminal/common/terminalDataBuffering","vs/platform/terminal/common/terminalRecorder","vs/platform/terminal/common/xterm/shellIntegrationAddon","vs/editor/browser/viewParts/minimap/minimap","vs/editor/browser/widget/multiDiffEditorWidget/colors","vs/editor/contrib/codeAction/browser/codeActionMenu","vs/editor/contrib/gotoSymbol/browser/peek/referencesTree","vs/platform/actionWidget/browser/actionList","vs/platform/contextview/browser/contextMenuHandler","vs/editor/contrib/colorPicker/browser/colorPickerWidget","vs/editor/contrib/parameterHints/browser/parameterHintsWidget","vs/editor/contrib/unicodeHighlighter/browser/bannerController","vs/platform/theme/browser/iconsStyleSheet","vs/editor/browser/controller/mouseHandler","vs/editor/browser/controller/pointerHandler","vs/editor/browser/viewParts/lines/viewLines","vs/platform/quickinput/browser/quickInputController","vs/editor/browser/services/abstractCodeEditorService","vs/editor/browser/services/hoverService","vs/editor/browser/viewParts/editorScrollbar/editorScrollbar","vs/editor/browser/viewParts/selections/selections","vs/editor/browser/widget/diffEditor/components/diffEditorEditors","vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight","vs/editor/browser/viewParts/indentGuides/indentGuides","vs/editor/browser/controller/textAreaHandler","vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler","vs/editor/browser/viewParts/viewCursors/viewCursors","vs/editor/browser/viewParts/whitespace/whitespace","vs/editor/browser/view","vs/editor/common/model/bracketPairsTextModelPart/colorizedBracketPairsDecorationProvider","vs/editor/common/services/markerDecorationsService","vs/editor/common/services/semanticTokensStylingService","vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess","vs/editor/contrib/rename/browser/renameInputField","vs/editor/contrib/rename/browser/rename","vs/editor/contrib/semanticTokens/browser/documentSemanticTokens","vs/editor/contrib/suggest/browser/suggestWidgetRenderer","vs/platform/quickinput/browser/quickInputService","vs/editor/browser/widget/diffEditor/components/diffEditorDecorations","vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/diffEditorViewZones","vs/editor/common/services/modelService","vs/editor/common/services/modelUndoRedoParticipant","vs/editor/common/viewModel/viewModelLines","vs/editor/common/viewModel/viewModelImpl","vs/editor/contrib/codeAction/browser/codeActionCommands","vs/editor/contrib/codeAction/browser/codeActionContributions","vs/editor/contrib/codelens/browser/codelensWidget","vs/editor/contrib/find/browser/findOptionsWidget","vs/editor/contrib/colorPicker/browser/standaloneColorPickerWidget","vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions","vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace","vs/editor/contrib/linkedEditing/browser/linkedEditing","vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider","vs/editor/contrib/stickyScroll/browser/stickyScrollProvider","vs/editor/contrib/stickyScroll/browser/stickyScrollWidget","vs/platform/undoRedo/common/undoRedoService","vs/platform/update/common/update.config.contribution","vs/platform/uriIdentity/common/uriIdentityService","vs/platform/url/common/urlService","vs/platform/userDataSync/common/extensionsMerge","vs/platform/userDataSync/common/keybindingsMerge","vs/platform/userDataSync/common/snippetsMerge","vs/platform/userDataSync/common/userDataProfilesManifestMerge","vs/platform/userDataSync/common/globalStateMerge","vs/platform/userDataSync/common/userDataSyncLog","vs/platform/webview/common/mimeTypes","vs/platform/webview/common/webviewPortMapping","vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution","vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution","vs/editor/contrib/inlineCompletions/browser/inlineCompletionsModel","vs/platform/terminal/common/terminalLogService","vs/platform/extensionManagement/common/abstractExtensionManagementService","vs/editor/contrib/codelens/browser/codeLensCache","vs/editor/contrib/suggest/browser/suggestInlineCompletions","vs/editor/contrib/gotoError/browser/gotoErrorWidget","vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget","vs/editor/contrib/hover/browser/markerHoverParticipant","vs/editor/contrib/inlayHints/browser/inlayHintsHover","vs/editor/contrib/inlayHints/browser/inlayHintsContribution","vs/editor/contrib/stickyScroll/browser/stickyScrollActions","vs/editor/contrib/stickyScroll/browser/stickyScrollContribution","vs/editor/contrib/inlineCompletions/browser/suggestWidgetInlineCompletionProvider","vs/editor/browser/widget/multiDiffEditorWidget/multiDiffEditorWidgetImpl","vs/editor/browser/widget/multiDiffEditorWidget/multiDiffEditorWidget","vs/editor/contrib/colorPicker/browser/colorContributions","vs/editor/contrib/inlineCompletions/browser/commands","vs/editor/contrib/inlineCompletions/browser/hoverParticipant","vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution","vs/editor/contrib/inlineEdit/browser/commands","vs/editor/contrib/inlineEdit/browser/hoverParticipant","vs/editor/contrib/inlineEdit/browser/inlineEdit.contribution","vs/platform/actions/common/menuService","vs/platform/actions/common/actions.contribution","vs/platform/contextview/browser/contextMenuService","vs/platform/extensionManagement/common/extensionGalleryService","vs/platform/extensionResourceLoader/browser/extensionResourceLoaderService","vs/editor/contrib/quickAccess/browser/commandsQuickAccess","vs/platform/userDataProfile/browser/userDataProfile","vs/platform/userDataProfile/common/userDataProfileIpc","vs/platform/userDataSync/common/userDataSyncEnablementService","vs/platform/userDataSync/common/userDataSyncLocalStoreService","vs/platform/userDataSync/common/userDataAutoSyncService","vs/platform/userDataSync/common/userDataSyncResourceProvider","vs/platform/userDataSync/common/userDataSyncService","vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter","vs/editor/editor.all","vs/workbench/api/common/extHostInitDataService","vs/workbench/api/common/extHostRpcService","vs/workbench/api/common/extHostWebviewMessaging","vs/workbench/browser/actions/helpActions","vs/workbench/browser/actions/listCommands","vs/workbench/browser/parts/dialogs/dialogHandler","vs/workbench/browser/parts/editor/editorGroupWatermark","vs/workbench/browser/parts/notifications/notificationsAlerts","vs/workbench/browser/parts/views/checkbox","vs/workbench/browser/actions/quickAccessActions","vs/workbench/common/dialogs","vs/workbench/browser/parts/titlebar/titlebarActions","vs/workbench/browser/parts/notifications/notificationsViewer","vs/workbench/contrib/accessibility/browser/unfocusedViewDimmingContribution","vs/workbench/contrib/bulkEdit/browser/bulkTextEdits","vs/workbench/contrib/callHierarchy/browser/callHierarchyTree","vs/workbench/contrib/chat/browser/chatAccessibilityService","vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget","vs/workbench/contrib/chat/browser/chatMarkdownDecorationsRenderer","vs/workbench/contrib/codeActions/browser/codeActionsContribution","vs/workbench/contrib/codeActions/browser/documentationContribution","vs/workbench/contrib/codeEditor/browser/largeFileOptimizations","vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree","vs/workbench/contrib/codeEditor/browser/toggleColumnSelection","vs/workbench/contrib/codeEditor/browser/toggleMinimap","vs/workbench/contrib/codeEditor/browser/toggleRenderControlCharacter","vs/workbench/contrib/codeEditor/browser/toggleRenderWhitespace","vs/workbench/contrib/codeEditor/browser/workbenchReferenceSearch","vs/workbench/contrib/commands/common/commands.contribution","vs/workbench/contrib/comments/browser/commentMenus","vs/workbench/contrib/comments/browser/commentThreadAdditionalActions","vs/workbench/contrib/comments/browser/commentThreadHeader","vs/workbench/contrib/comments/browser/commentThreadRangeDecorator","vs/workbench/contrib/comments/browser/reactionsAction","vs/workbench/contrib/customEditor/common/customEditorModelManager","vs/workbench/contrib/debug/common/abstractDebugAdapter","vs/workbench/contrib/debug/common/breakpoints","vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignalDebuggerContribution","vs/workbench/contrib/debug/browser/debugMemory","vs/workbench/contrib/debug/common/debugCompoundRoot","vs/workbench/contrib/debug/common/debugTelemetry","vs/workbench/contrib/debug/browser/rawDebugSession","vs/workbench/contrib/debug/common/debugViewModel","vs/workbench/contrib/editSessions/browser/editSessionsFileSystemProvider","vs/workbench/contrib/editSessions/common/editSessionsLogService","vs/workbench/contrib/editSessions/common/editSessionsStorageClient","vs/workbench/contrib/extensions/browser/configBasedRecommendations","vs/workbench/contrib/extensions/browser/exeBasedRecommendations","vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider","vs/workbench/contrib/extensions/browser/keymapRecommendations","vs/workbench/contrib/extensions/browser/languageRecommendations","vs/workbench/contrib/extensions/browser/remoteRecommendations","vs/workbench/contrib/files/browser/explorerFileContrib","vs/workbench/contrib/files/common/explorerFileNestingTrie","vs/workbench/contrib/inlayHints/browser/inlayHintsAccessibilty","vs/workbench/contrib/mappedEdits/common/mappedEdits.contribution","vs/workbench/contrib/markers/browser/markersTable","vs/workbench/contrib/mergeEditor/browser/mergeMarkers/mergeMarkersController","vs/workbench/contrib/mergeEditor/browser/telemetry","vs/workbench/contrib/mergeEditor/browser/model/diffComputer","vs/workbench/contrib/mergeEditor/browser/model/textModelDiffs","vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel","vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView","vs/workbench/contrib/mergeEditor/browser/view/editors/inputCodeEditorView","vs/workbench/contrib/mergeEditor/browser/view/fixedZoneWidget","vs/workbench/contrib/mergeEditor/browser/view/conflictActions","vs/workbench/contrib/mergeEditor/browser/view/lineAlignment","vs/workbench/contrib/mergeEditor/browser/view/scrollSynchronizer","vs/workbench/contrib/mergeEditor/browser/view/viewModel","vs/workbench/contrib/mergeEditor/browser/view/viewZones","vs/workbench/contrib/mergeEditor/browser/view/editors/resultCodeEditorView","vs/workbench/contrib/multiDiffEditor/browser/icons.contribution","vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariableContextKeys","vs/workbench/contrib/notebook/browser/diff/notebookDiffOverviewRuler","vs/workbench/contrib/notebook/browser/notebookLogger","vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl","vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl","vs/workbench/contrib/notebook/browser/view/cellParts/cellDecorations","vs/workbench/contrib/notebook/browser/view/cellParts/cellDragRenderer","vs/workbench/contrib/notebook/browser/view/cellParts/cellFocus","vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbars","vs/workbench/contrib/notebook/browser/view/cellParts/chat/cellChatPart","vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellInput","vs/workbench/contrib/notebook/browser/view/notebookCellListView","vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads","vs/workbench/contrib/notebook/browser/view/renderers/webviewThemeMapping","vs/workbench/contrib/notebook/browser/viewModel/cellEditorOptions","vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection","vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher","vs/workbench/contrib/notebook/browser/viewModel/viewContext","vs/workbench/contrib/notebook/browser/viewParts/notebookTopCellToolbar","vs/workbench/contrib/notebook/browser/viewParts/notebookViewZones","vs/workbench/contrib/notebook/common/model/cellEdit","vs/workbench/contrib/notebook/browser/view/cellParts/cellExecution","vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesDataSource","vs/workbench/contrib/notebook/common/notebookKeymapService","vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl","vs/workbench/contrib/notebook/common/notebookOutputRenderer","vs/workbench/contrib/notebook/common/notebookPerformance","vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController","vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariableCommands","vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl","vs/workbench/contrib/outline/browser/outlineViewState","vs/workbench/contrib/preferences/browser/settingsSearchMenu","vs/workbench/contrib/preferences/browser/settingsWidgets","vs/workbench/contrib/preferences/common/smartSnippetInserter","vs/workbench/contrib/remote/browser/urlFinder","vs/workbench/contrib/sash/browser/sash","vs/workbench/contrib/scm/browser/dirtyDiffSwitcher","vs/workbench/contrib/scm/common/quickDiffService","vs/workbench/contrib/scm/browser/menus","vs/workbench/contrib/scm/common/scmService","vs/workbench/contrib/search/browser/searchActionsSymbol","vs/workbench/contrib/search/common/cacheState","vs/workbench/contrib/search/common/cellSearchModel","vs/workbench/contrib/share/browser/shareService","vs/workbench/contrib/snippets/browser/commands/insertSnippet","vs/workbench/contrib/chat/common/voiceChat","vs/workbench/contrib/tags/browser/workspaceTagsService","vs/workbench/contrib/tasks/common/taskTemplates","vs/workbench/contrib/terminal/browser/baseTerminalBackend","vs/workbench/contrib/terminal/browser/terminalCommands","vs/workbench/contrib/terminal/browser/terminalEditorSerializer","vs/workbench/contrib/terminal/browser/terminalEscapeSequences","vs/workbench/contrib/terminal/browser/terminalEvents","vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget","vs/workbench/contrib/terminal/browser/xterm/lineDataEventAddon","vs/workbench/contrib/terminal/common/basePty","vs/workbench/contrib/terminal/common/terminalClipboard","vs/workbench/contrib/debug/browser/debugANSIHandling","vs/workbench/contrib/terminal/browser/terminalProfileQuickpick","vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon","vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker","vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibleBufferProvider","vs/workbench/contrib/terminalContrib/accessibility/browser/textAreaSyncAddon","vs/workbench/contrib/terminalContrib/find/browser/textInputContextMenu","vs/workbench/contrib/terminalContrib/find/browser/terminalFindWidget","vs/workbench/contrib/terminalContrib/highlight/browser/terminal.highlight.contribution","vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector","vs/workbench/contrib/terminalContrib/links/browser/terminalLink","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkProviderService","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver","vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector","vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector","vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector","vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector","vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixBuiltinActions","vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollOverlay","vs/workbench/contrib/terminalContrib/typeAhead/browser/terminalTypeAheadAddon","vs/workbench/contrib/terminalContrib/typeAhead/browser/terminal.typeAhead.contribution","vs/workbench/contrib/testing/browser/explorerProjections/display","vs/workbench/contrib/testing/common/testExclusions","vs/workbench/contrib/testing/browser/explorerProjections/testingObjectTree","vs/workbench/contrib/testing/common/mainThreadTestCollection","vs/workbench/contrib/testing/common/testItemCollection","vs/workbench/api/common/extHostTestingPrivateApi","vs/workbench/contrib/testing/browser/testingConfigurationUi","vs/workbench/contrib/testing/browser/explorerProjections/listProjection","vs/workbench/contrib/testing/browser/explorerProjections/treeProjection","vs/workbench/contrib/testing/browser/testingDecorations","vs/workbench/contrib/testing/common/testingContentProvider","vs/workbench/contrib/typeHierarchy/browser/typeHierarchyTree","vs/workbench/contrib/webview/browser/resourceLoading","vs/workbench/contrib/webview/browser/overlayWebview","vs/workbench/contrib/webview/browser/webviewFindWidget","vs/workbench/contrib/webviewView/browser/webviewView.contribution","vs/workbench/contrib/welcomeDialog/browser/welcomeWidget","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedList","vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile","vs/workbench/contrib/welcomeWalkthrough/common/walkThroughUtils","vs/workbench/services/activity/browser/activityService","vs/workbench/services/aiRelatedInformation/common/aiRelatedInformationService","vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators","vs/workbench/services/configuration/common/configurationCache","vs/workbench/services/configuration/browser/configuration","vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService","vs/workbench/services/decorations/browser/decorationsService","vs/workbench/browser/parts/titlebar/commandCenterControl","vs/workbench/browser/parts/editor/editorsObserver","vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignalLineFeatureContribution","vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek","vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution","vs/workbench/contrib/codeEditor/browser/inspectKeybindings","vs/workbench/contrib/codeEditor/browser/quickaccess/gotoLineQuickAccess","vs/workbench/contrib/debug/common/loadedScriptsPicker","vs/workbench/contrib/markers/browser/markersTreeViewer","vs/workbench/contrib/multiDiffEditor/browser/scmMultiDiffSourceResolver","vs/workbench/contrib/performance/browser/inputLatencyContrib","vs/workbench/contrib/snippets/browser/snippetCodeActionProvider","vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel","vs/workbench/contrib/testing/common/testServiceImpl","vs/workbench/contrib/typeHierarchy/browser/typeHierarchyPeek","vs/workbench/contrib/typeHierarchy/browser/typeHierarchy.contribution","vs/workbench/contrib/webview/browser/webview.contribution","vs/workbench/services/editor/browser/codeEditorService","vs/workbench/contrib/url/browser/externalUriResolver","vs/workbench/contrib/debug/common/debugger","vs/workbench/contrib/webview/browser/webviewElement","vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough","vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough","vs/workbench/services/clipboard/browser/clipboardService","vs/workbench/services/dialogs/common/dialogService","vs/workbench/services/extensionManagement/browser/builtinExtensionsScannerService","vs/workbench/contrib/extensions/browser/unsupportedExtensionsMigrationContribution","vs/workbench/contrib/extensions/browser/webRecommendations","vs/workbench/contrib/remote/browser/remoteStartEntry","vs/workbench/services/extensionManagement/common/extensionManagementChannelClient","vs/workbench/contrib/extensions/browser/workspaceRecommendations","vs/workbench/services/extensionRecommendations/common/extensionIgnoredRecommendationsService","vs/workbench/services/extensions/browser/webWorkerFileSystemProvider","vs/workbench/services/extensions/common/extensionDescriptionRegistry","vs/workbench/services/extensions/browser/webWorkerExtensionHost","vs/workbench/services/extensions/common/extensionStorageMigration","vs/workbench/contrib/chat/common/chatServiceImpl","vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint","vs/workbench/contrib/extensions/browser/extensionFeaturesTab","vs/workbench/contrib/extensions/browser/extensionsActivationProgress","vs/workbench/contrib/notebook/browser/services/notebookRendererMessagingServiceImpl","vs/workbench/contrib/terminal/browser/environmentVariableInfo","vs/workbench/contrib/terminal/common/environmentVariableService","vs/workbench/contrib/terminal/common/environmentVariable.contribution","vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer","vs/workbench/contrib/welcomeViews/common/viewsWelcomeContribution","vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions","vs/workbench/services/commands/common/commandService","vs/workbench/services/extensionManagement/common/extensionFeaturesManagemetService","vs/workbench/services/extensions/common/extensionsProposedApi","vs/workbench/api/common/configurationExtensionPoint","vs/workbench/api/common/jsonValidationExtensionPoint","vs/workbench/contrib/tasks/common/jsonSchema_v1","vs/workbench/contrib/tasks/browser/taskTerminalStatus","vs/workbench/contrib/tasks/common/jsonSchema_v2","vs/workbench/contrib/tasks/browser/runAutomaticTasks","vs/workbench/contrib/tasks/browser/tasksQuickAccess","vs/workbench/contrib/tasks/browser/terminalTaskSystem","vs/workbench/contrib/terminal/common/terminalExtensionPoints.contribution","vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixService","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint","vs/workbench/contrib/editSessions/browser/editSessionsStorageService","vs/workbench/services/extensions/common/extensionsUtil","vs/workbench/services/extensions/common/lazyPromise","vs/workbench/api/browser/mainThreadAiEmbeddingVector","vs/workbench/api/browser/mainThreadAiRelatedInformation","vs/workbench/api/browser/mainThreadAuthentication","vs/workbench/api/browser/mainThreadChat","vs/workbench/api/browser/mainThreadChatProvider","vs/workbench/api/browser/mainThreadChatVariables","vs/workbench/api/browser/mainThreadClipboard","vs/workbench/api/browser/mainThreadCommands","vs/workbench/api/browser/mainThreadConfiguration","vs/workbench/api/browser/mainThreadDecorations","vs/workbench/api/browser/mainThreadDiagnostics","vs/workbench/api/browser/mainThreadDialogs","vs/workbench/api/browser/mainThreadDocumentContentProviders","vs/workbench/api/browser/mainThreadDownloadService","vs/workbench/api/browser/mainThreadEditSessionIdentityParticipant","vs/workbench/api/browser/mainThreadErrors","vs/workbench/api/browser/mainThreadFileSystem","vs/workbench/api/browser/mainThreadInteractive","vs/workbench/api/browser/mainThreadLabelService","vs/workbench/api/browser/mainThreadLocalization","vs/workbench/api/browser/mainThreadLogService","vs/workbench/api/browser/mainThreadManagedSockets","vs/workbench/api/browser/mainThreadMessageService","vs/workbench/api/browser/mainThreadNotebook","vs/workbench/api/browser/mainThreadNotebookKernels","vs/workbench/api/browser/mainThreadNotebookRenderers","vs/workbench/api/browser/mainThreadProgress","vs/workbench/api/browser/mainThreadQuickDiff","vs/workbench/api/browser/mainThreadQuickOpen","vs/workbench/api/browser/mainThreadRemoteConnectionData","vs/workbench/api/browser/mainThreadSCM","vs/workbench/api/browser/mainThreadSecretState","vs/workbench/api/browser/mainThreadShare","vs/workbench/api/browser/mainThreadSpeech","vs/workbench/api/browser/mainThreadStorage","vs/workbench/api/browser/mainThreadTask","vs/workbench/api/browser/mainThreadTelemetry","vs/workbench/api/browser/mainThreadTesting","vs/workbench/api/browser/mainThreadTheming","vs/workbench/api/browser/mainThreadTimeline","vs/workbench/api/browser/mainThreadCodeInsets","vs/workbench/api/browser/mainThreadWebviewViews","vs/workbench/services/extensions/common/remoteConsoleUtil","vs/workbench/api/browser/mainThreadConsole","vs/workbench/services/extensions/common/remoteExtensionHost","vs/workbench/services/extensions/common/rpcProtocol","vs/workbench/services/extensions/common/lazyCreateExtensionHostManager","vs/workbench/services/files/browser/elevatedFileService","vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant","vs/workbench/contrib/extensions/browser/extensionsDependencyChecker","vs/workbench/contrib/files/browser/explorerService","vs/workbench/contrib/files/browser/workspaceWatcher","vs/workbench/contrib/speech/browser/speechService","vs/workbench/contrib/speech/browser/speech.contribution","vs/workbench/services/integrity/common/integrity","vs/workbench/services/integrity/browser/integrityService","vs/workbench/services/issue/browser/issueService","vs/workbench/api/browser/mainThreadIssueReporter","vs/workbench/contrib/extensions/common/reportExtensionIssueAction","vs/workbench/contrib/extensions/browser/browserRuntimeExtensionsEditor","vs/workbench/contrib/issue/common/issue.contribution","vs/workbench/services/keybinding/common/fallbackKeyboardMapper","vs/workbench/services/keybinding/common/keybindingIO","vs/workbench/services/keybinding/common/keymapInfo","vs/workbench/services/keybinding/common/macLinuxKeyboardMapper","vs/workbench/services/keybinding/browser/keyboardLayoutService","vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint","vs/workbench/contrib/codeActions/common/documentationExtensionPoint","vs/workbench/contrib/customEditor/common/extensionPoint","vs/workbench/services/languageDetection/browser/languageDetectionWorkerServiceImpl","vs/workbench/api/browser/mainThreadLanguages","vs/workbench/browser/parts/banner/bannerPart","vs/workbench/browser/parts/notifications/notificationsCenter","vs/workbench/contrib/terminal/browser/terminalEditor","vs/workbench/contrib/webviewPanel/browser/webviewCommands","vs/workbench/browser/parts/notifications/notificationsToasts","vs/workbench/browser/actions/textInputActions","vs/workbench/browser/parts/dialogs/dialog.web.contribution","vs/workbench/contrib/bracketPairColorizer2Telemetry/browser/bracketPairColorizer2Telemetry.contribution","vs/workbench/contrib/chat/browser/contrib/chatHistoryVariables","vs/workbench/contrib/codeActions/browser/codeActions.contribution","vs/workbench/contrib/codeEditor/browser/editorFeatures","vs/workbench/contrib/codeEditor/browser/toggleMultiCursorModifier","vs/workbench/contrib/contextmenu/browser/contextmenu.contribution","vs/workbench/contrib/debug/browser/debugAdapterManager","vs/workbench/contrib/debug/common/debugLifecycle","vs/workbench/contrib/deprecatedExtensionMigrator/browser/deprecatedExtensionMigrator.contribution","vs/workbench/contrib/folding/browser/folding.contribution","vs/workbench/contrib/format/browser/formatActionsMultiple","vs/workbench/contrib/issue/browser/issue.contribution","vs/workbench/contrib/limitIndicator/browser/limitIndicator.contribution","vs/workbench/contrib/list/browser/list.contribution","vs/workbench/contrib/logs/common/logsDataCleaner","vs/workbench/contrib/markers/browser/markersFileDecorations","vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection","vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl","vs/workbench/contrib/relauncher/browser/relauncher.contribution","vs/workbench/contrib/remote/browser/remoteStartEntry.contribution","vs/workbench/contrib/splash/browser/partsSplash","vs/workbench/contrib/splash/browser/splash.contribution","vs/workbench/contrib/surveys/browser/nps.contribution","vs/workbench/contrib/terminal/browser/terminalEditorService","vs/workbench/contrib/terminal/browser/xterm/decorationAddon","vs/workbench/contrib/webviewPanel/browser/webviewIconManager","vs/workbench/api/browser/mainThreadWebviewPanels","vs/workbench/contrib/welcomeBanner/browser/welcomeBanner.contribution","vs/workbench/contrib/welcomeViews/common/newFile.contribution","vs/workbench/contrib/welcomeViews/common/viewsWelcome.contribution","vs/workbench/services/driver/browser/driver","vs/workbench/api/browser/mainThreadUrls","vs/workbench/services/lifecycle/common/lifecycleService","vs/workbench/services/lifecycle/browser/lifecycleService","vs/workbench/contrib/localization/common/localizationsActions","vs/workbench/contrib/localization/common/localization.contribution","vs/workbench/contrib/localization/browser/localization.contribution","vs/workbench/services/localization/browser/localeService","vs/workbench/contrib/keybindings/browser/keybindings.contribution","vs/workbench/api/common/extHostTunnelService","vs/workbench/contrib/extensions/browser/fileBasedRecommendations","vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing","vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile","vs/workbench/contrib/notebook/browser/controller/apiActions","vs/workbench/contrib/notebook/browser/controller/notebookIndentationActions","vs/workbench/api/browser/mainThreadNotebookEditors","vs/workbench/api/browser/mainThreadLanguageFeatures","vs/workbench/contrib/bulkEdit/browser/conflicts","vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree","vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders","vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints","vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider","vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout","vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo","vs/workbench/contrib/notebook/browser/diff/diffElementOutputs","vs/workbench/contrib/notebook/browser/notebookExtensionPoint","vs/workbench/contrib/notebook/browser/services/notebookExecutionStateServiceImpl","vs/workbench/contrib/notebook/browser/services/notebookWorkerServiceImpl","vs/workbench/contrib/notebook/browser/view/cellParts/cellFocusIndicator","vs/workbench/contrib/notebook/browser/view/cellParts/cellProgressBar","vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon","vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput","vs/workbench/contrib/notebook/browser/view/notebookCellAnchor","vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry","vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel","vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup","vs/workbench/contrib/notebook/browser/view/cellParts/cellStatusPart","vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory","vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl","vs/workbench/contrib/notebook/browser/viewParts/notebookOverviewRuler","vs/workbench/contrib/notebook/common/model/notebookTextModel","vs/workbench/contrib/notebook/browser/contrib/find/notebookFind","vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted","vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands","vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard","vs/workbench/contrib/notebook/browser/contrib/format/formatting","vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions","vs/workbench/contrib/notebook/browser/controller/insertCellActions","vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar","vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint","vs/workbench/contrib/notebook/browser/view/cellParts/markupCell","vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll","vs/workbench/contrib/notebook/browser/viewParts/notebookEditorWidgetContextKeys","vs/workbench/contrib/search/browser/searchFindInput","vs/workbench/services/notification/common/notificationService","vs/workbench/browser/parts/editor/breadcrumbsModel","vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsOutline","vs/workbench/services/outline/browser/outlineService","vs/workbench/services/output/common/delayedLogChannel","vs/workbench/contrib/logs/browser/logs.contribution","vs/workbench/contrib/logs/common/logs.contribution","vs/workbench/contrib/output/browser/outputLinkProvider","vs/workbench/contrib/output/common/outputChannelModel","vs/workbench/browser/actions/navigationActions","vs/workbench/browser/parts/sidebar/sidebarActions","vs/workbench/contrib/extensions/browser/extensionsQuickAccess","vs/workbench/contrib/format/browser/formatActionsNone","vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl","vs/workbench/contrib/accessibilitySignals/browser/commands","vs/workbench/contrib/notebook/browser/controller/layoutActions","vs/workbench/contrib/preferences/browser/preferencesActions","vs/workbench/contrib/preferences/browser/preferencesSearch","vs/workbench/browser/parts/compositePart","vs/workbench/services/quickinput/browser/quickInputService","vs/workbench/services/remote/browser/browserRemoteResourceHandler","vs/workbench/services/remote/common/remoteAgentEnvironmentChannel","vs/workbench/api/browser/mainThreadTerminalService","vs/workbench/contrib/accountEntitlements/browser/accountsEntitlements.contribution","vs/workbench/contrib/codeEditor/browser/accessibility/accessibility","vs/workbench/contrib/codeEditor/browser/editorSettingsMigration","vs/workbench/contrib/debug/browser/extensionHostDebugService","vs/workbench/contrib/externalUriOpener/common/contributedOpeners","vs/workbench/api/browser/mainThreadUriOpeners","vs/workbench/contrib/externalUriOpener/common/externalUriOpener.contribution","vs/workbench/api/browser/mainThreadInlineChat","vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl","vs/workbench/contrib/remote/browser/remoteConnectionHealth","vs/workbench/contrib/remote/common/remote.contribution","vs/workbench/contrib/sash/browser/sash.contribution","vs/workbench/contrib/share/browser/share.contribution","vs/workbench/contrib/terminal/browser/remotePty","vs/workbench/contrib/terminal/browser/terminalProfileResolverService","vs/workbench/contrib/terminal/browser/terminal.web.contribution","vs/workbench/contrib/terminal/browser/terminalVoice","vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp","vs/workbench/contrib/welcomeDialog/browser/welcomeDialog.contribution","vs/workbench/contrib/notebook/browser/viewParts/notebookEditorToolbar","vs/workbench/contrib/surveys/browser/ces.contribution","vs/workbench/browser/parts/editor/editorConfiguration","vs/workbench/contrib/customEditor/common/contributedCustomEditors","vs/workbench/services/editor/browser/editorResolverService","vs/workbench/contrib/debug/browser/exceptionWidget","vs/workbench/contrib/terminal/browser/terminalProcessManager","vs/workbench/services/configurationResolver/browser/configurationResolverService","vs/workbench/services/dialogs/browser/simpleFileDialog","vs/workbench/services/dialogs/browser/abstractFileDialogService","vs/workbench/services/dialogs/browser/fileDialogService","vs/workbench/services/label/common/labelService","vs/workbench/services/model/common/modelService","vs/workbench/services/path/browser/pathService","vs/workbench/services/remote/common/remoteFileSystemProviderClient","vs/workbench/api/browser/mainThreadTunnelService","vs/workbench/contrib/remote/browser/showCandidate","vs/workbench/contrib/remote/browser/tunnelFactory","vs/workbench/services/request/browser/requestService","vs/workbench/services/search/common/ignoreFile","vs/workbench/services/search/common/replace","vs/workbench/api/browser/mainThreadSearch","vs/workbench/services/history/browser/historyService","vs/workbench/contrib/search/browser/notebookSearch/notebookSearchService","vs/workbench/contrib/search/browser/notebookSearch/notebookSearchContributions","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager","vs/workbench/services/search/common/searchService","vs/workbench/services/search/browser/searchService","vs/workbench/api/browser/mainThreadStatusBar","vs/workbench/browser/parts/notifications/notificationsStatus","vs/workbench/browser/parts/statusbar/statusbarActions","vs/workbench/browser/parts/statusbar/statusbarItem","vs/workbench/browser/parts/statusbar/statusbarModel","vs/workbench/contrib/accessibility/browser/accessibilityStatus","vs/workbench/contrib/debug/browser/debugStatus","vs/workbench/contrib/debug/browser/statusbarColorProvider","vs/workbench/contrib/languageDetection/browser/languageDetection.contribution","vs/workbench/contrib/languageStatus/browser/languageStatus.contribution","vs/workbench/contrib/preferences/browser/keyboardLayoutPicker","vs/workbench/contrib/remote/browser/remoteIndicator","vs/workbench/contrib/terminal/browser/remoteTerminalBackend","vs/workbench/services/suggest/browser/simpleCompletionItem","vs/workbench/services/suggest/browser/simpleCompletionModel","vs/workbench/services/suggest/browser/simpleSuggestWidgetRenderer","vs/workbench/services/suggest/browser/simpleSuggestWidget","vs/workbench/contrib/terminalContrib/suggest/browser/terminalSuggestAddon","vs/workbench/services/telemetry/browser/workbenchCommonProperties","vs/workbench/services/telemetry/browser/telemetryService","vs/workbench/contrib/terminal/browser/terminalMainContribution","vs/workbench/services/textMate/browser/arrayOperation","vs/workbench/services/textMate/browser/backgroundTokenization/textMateWorkerTokenizerController","vs/workbench/services/textMate/browser/backgroundTokenization/threadedBackgroundTokenizerFactory","vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport","vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit","vs/workbench/contrib/emmet/browser/emmetActions","vs/workbench/contrib/emmet/browser/actions/expandAbbreviation","vs/workbench/contrib/emmet/browser/emmet.contribution","vs/workbench/services/textMate/common/TMHelper","vs/workbench/services/textMate/common/TMScopeRegistry","vs/workbench/services/textMate/common/TMGrammarFactory","vs/workbench/services/textfile/common/textFileSaveParticipant","vs/workbench/api/browser/mainThreadSaveParticipant","vs/workbench/browser/parts/editor/breadcrumbsPicker","vs/workbench/contrib/customEditor/common/customTextEditorModel","vs/workbench/contrib/debug/browser/debugConfigurationManager","vs/workbench/contrib/debug/common/debugStorage","vs/workbench/api/browser/mainThreadDebugService","vs/workbench/contrib/debug/browser/debugSession","vs/workbench/contrib/debug/browser/replFilter","vs/workbench/contrib/debug/browser/replViewer","vs/workbench/contrib/inlineChat/browser/inlineChatLivePreviewWidget","vs/workbench/contrib/inlineChat/browser/inlineChatStrategies","vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel","vs/workbench/contrib/mergeEditor/browser/mergeEditorSerializer","vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesTree","vs/workbench/contrib/codeEditor/browser/saveParticipants","vs/workbench/contrib/format/browser/format.contribution","vs/workbench/contrib/surveys/browser/languageSurveys.contribution","vs/workbench/contrib/terminal/browser/terminalTabsList","vs/workbench/contrib/terminal/browser/terminalTabbedView","vs/workbench/contrib/url/browser/trustedDomainsFileSystemProvider","vs/workbench/contrib/url/browser/trustedDomainsValidator","vs/workbench/contrib/url/browser/url.contribution","vs/workbench/contrib/workspaces/browser/workspaces.contribution","vs/workbench/services/configuration/common/jsonEditingService","vs/workbench/services/textresourceProperties/common/textResourcePropertiesService","vs/workbench/services/themes/common/colorExtensionPoint","vs/workbench/services/themes/browser/browserHostColorSchemeService","vs/workbench/services/themes/common/iconExtensionPoint","vs/workbench/services/themes/common/plistParser","vs/workbench/services/themes/common/fileIconThemeSchema","vs/workbench/services/themes/common/textMateScopeMatcher","vs/workbench/services/themes/common/themeCompatibility","vs/workbench/services/themes/common/tokenClassificationExtensionPoint","vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens","vs/workbench/contrib/webview/browser/themeing","vs/workbench/contrib/webview/browser/webviewService","vs/workbench/contrib/webview/browser/webview.web.contribution","vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker","vs/workbench/services/textMate/browser/textMateTokenizationFeatureImpl","vs/workbench/services/textMate/browser/textMateTokenizationFeature.contribution","vs/workbench/contrib/themes/browser/themes.contribution","vs/workbench/services/themes/common/colorThemeData","vs/workbench/services/themes/common/themeConfiguration","vs/workbench/services/themes/common/themeExtensionPoints","vs/workbench/api/browser/mainThreadExtensionService","vs/workbench/contrib/performance/browser/perfviewEditor","vs/workbench/contrib/performance/browser/performance.contribution","vs/workbench/contrib/performance/browser/startupTimings","vs/workbench/contrib/performance/browser/performance.web.contribution","vs/workbench/contrib/debug/browser/debugTitle","vs/workbench/contrib/scm/browser/activity","vs/workbench/services/tunnel/browser/tunnelService","vs/workbench/contrib/inlineChat/browser/inlineChatSessionServiceImpl","vs/workbench/services/update/browser/updateService","vs/workbench/services/url/browser/urlService","vs/workbench/services/userActivity/browser/domActivityTracker","vs/workbench/services/userActivity/browser/userActivityBrowser","vs/workbench/api/browser/mainThreadWindow","vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress","vs/workbench/contrib/extensions/browser/extensionRecommendationsService","vs/workbench/services/themes/browser/workbenchThemeService","vs/workbench/services/userDataProfile/browser/iconSelectBox","vs/workbench/api/browser/mainThreadProfilContentHandlers","vs/workbench/contrib/preferences/browser/keybindingsEditorContribution","vs/workbench/contrib/preferences/browser/preferencesRenderers","vs/workbench/contrib/preferences/browser/preferencesEditor","vs/workbench/contrib/markdown/browser/markdownSettingRenderer","vs/workbench/contrib/preferences/browser/tocTree","vs/workbench/contrib/snippets/browser/commands/configureSnippets","vs/workbench/contrib/chat/browser/codeBlockPart","vs/workbench/contrib/comments/browser/commentNode","vs/workbench/contrib/comments/browser/commentThreadBody","vs/workbench/contrib/comments/browser/commentThreadZoneWidget","vs/workbench/contrib/codeEditor/browser/diffEditorHelper","vs/workbench/contrib/debug/browser/breakpointWidget","vs/workbench/contrib/notebook/browser/diff/diffComponents","vs/workbench/contrib/notebook/browser/diff/notebookDiffList","vs/workbench/contrib/notebook/browser/notebookAccessibility","vs/workbench/contrib/notebook/browser/view/cellParts/cellComments","vs/workbench/contrib/snippets/browser/snippets.contribution","vs/workbench/contrib/telemetry/browser/telemetry.contribution","vs/workbench/contrib/terminal/browser/terminalRunRecentQuickPick","vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick","vs/workbench/contrib/testing/browser/testingExplorerFilter","vs/workbench/contrib/update/browser/releaseNotesEditor","vs/workbench/contrib/userDataProfile/browser/userDataProfile","vs/workbench/contrib/userDataProfile/browser/userDataProfileActions","vs/workbench/contrib/userDataProfile/browser/userDataProfilePreview","vs/workbench/contrib/userDataProfile/browser/userDataProfile.contribution","vs/workbench/services/configuration/common/configurationEditing","vs/workbench/services/configuration/browser/configurationService","vs/workbench/services/issue/browser/issueTroubleshoot","vs/workbench/services/keybinding/browser/keybindingService","vs/workbench/contrib/preferences/browser/keybindingsEditor","vs/workbench/services/remote/common/abstractRemoteAgentService","vs/workbench/services/remote/browser/remoteAgentService","vs/workbench/services/userDataProfile/browser/userDataProfileManagement","vs/workbench/services/userDataProfile/browser/userDataProfileStorageService","vs/workbench/services/extensionManagement/common/remoteExtensionManagementService","vs/workbench/services/remote/common/remoteExtensionsScanner","vs/workbench/services/userDataProfile/common/userDataProfileService","vs/workbench/services/userDataSync/browser/userDataSyncEnablementService","vs/workbench/services/userDataSync/browser/webUserDataSyncEnablementService","vs/workbench/contrib/preferences/browser/settingsEditor2","vs/workbench/contrib/update/browser/update","vs/workbench/contrib/update/browser/update.contribution","vs/workbench/services/userDataSync/browser/userDataSyncInit","vs/workbench/services/userDataSync/common/userDataSyncUtil","vs/workbench/services/views/common/treeViewsService","vs/workbench/services/views/common/viewContainerModel","vs/workbench/api/browser/mainThreadOutputService","vs/workbench/api/browser/mainThreadTreeViews","vs/workbench/browser/parts/statusbar/statusbarPart","vs/workbench/browser/workbench.contribution","vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane","vs/workbench/contrib/comments/browser/commentsEditorContribution","vs/workbench/contrib/comments/browser/commentsViewActions","vs/workbench/contrib/comments/browser/comments.contribution","vs/workbench/contrib/debug/browser/debugEditorActions","vs/workbench/contrib/debug/browser/debugProgress","vs/workbench/contrib/debug/browser/debugSessionPicker","vs/workbench/contrib/debug/browser/debugConsoleQuickAccess","vs/workbench/contrib/debug/browser/debugQuickAccess","vs/workbench/contrib/debug/browser/debugTaskRunner","vs/workbench/contrib/debug/browser/debugService","vs/workbench/contrib/debug/browser/callStackView","vs/workbench/contrib/debug/browser/loadedScriptsView","vs/workbench/contrib/debug/browser/debugHover","vs/workbench/contrib/debug/browser/watchExpressionsView","vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesView","vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariables","vs/workbench/contrib/outline/browser/outlineActions","vs/workbench/contrib/outline/browser/outlinePane","vs/workbench/contrib/output/browser/outputServices","vs/workbench/contrib/quickaccess/browser/viewQuickAccess","vs/workbench/contrib/remote/browser/tunnelView","vs/workbench/contrib/scm/browser/scmRepositoriesViewPane","vs/workbench/contrib/tasks/browser/task.contribution","vs/workbench/contrib/tasks/browser/taskService","vs/workbench/contrib/testing/browser/codeCoverageDecorations","vs/workbench/contrib/testing/browser/testCoverageView","vs/workbench/contrib/testing/browser/testingExplorerView","vs/workbench/contrib/testing/browser/testingOutputPeek","vs/workbench/contrib/timeline/common/timelineService","vs/workbench/contrib/userDataSync/browser/userDataSyncTrigger","vs/workbench/contrib/webviewView/browser/webviewViewPane","vs/workbench/services/progress/browser/progressService","vs/workbench/services/userDataSync/browser/userDataSyncWorkbenchService","vs/workbench/services/workingCopy/common/storedFileWorkingCopySaveParticipant","vs/workbench/services/workingCopy/common/workingCopyBackupService","vs/workbench/services/workingCopy/common/workingCopyBackupTracker","vs/workbench/contrib/files/browser/editors/textFileEditorTracker","vs/workbench/services/workingCopy/common/workingCopyFileOperationParticipant","vs/workbench/browser/actions/developerActions","vs/workbench/browser/contextkeys","vs/workbench/browser/parts/editor/editorAutoSave","vs/workbench/browser/parts/editor/editorPanes","vs/workbench/contrib/accessibility/browser/saveAudioCue","vs/workbench/contrib/accessibility/browser/accessibility.contribution","vs/workbench/contrib/codeEditor/browser/codeEditor.contribution","vs/workbench/contrib/extensions/browser/extensions.web.contribution","vs/workbench/contrib/files/browser/editors/binaryFileEditor","vs/workbench/contrib/files/common/dirtyFilesIndicator","vs/workbench/contrib/mergeEditor/browser/commands/commands","vs/workbench/contrib/mergeEditor/browser/commands/devCommands","vs/workbench/contrib/mergeEditor/browser/mergeEditor.contribution","vs/workbench/contrib/multiDiffEditor/browser/actions","vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.contribution","vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint","vs/workbench/contrib/webviewPanel/browser/webviewPanel.contribution","vs/workbench/contrib/welcomeWalkthrough/browser/walkThrough.contribution","vs/workbench/services/editor/browser/editorPaneService","vs/workbench/services/textmodelResolver/common/textModelResolverService","vs/workbench/api/browser/mainThreadEditorTabs","vs/workbench/contrib/customEditor/browser/customEditorInputFactory","vs/workbench/contrib/customEditor/browser/customEditors","vs/workbench/contrib/customEditor/browser/customEditor.contribution","vs/workbench/contrib/localHistory/browser/localHistoryTimeline","vs/workbench/contrib/localHistory/browser/localHistory.contribution","vs/workbench/contrib/timeline/browser/timelinePane","vs/workbench/contrib/files/browser/editors/fileEditorHandler","vs/workbench/contrib/preferences/common/preferencesContribution","vs/workbench/services/editor/browser/editorService","vs/workbench/services/preferences/browser/preferencesService","vs/workbench/services/untitled/common/untitledTextEditorHandler","vs/workbench/browser/parts/editor/editor.contribution","vs/workbench/services/userDataProfile/browser/userDataProfileInit","vs/workbench/services/workingCopy/browser/workingCopyBackupTracker","vs/workbench/services/workingCopy/browser/workingCopyBackupService","vs/workbench/services/workingCopy/common/untitledFileWorkingCopyManager","vs/workbench/api/browser/mainThreadCustomEditors","vs/workbench/api/browser/mainThreadDocumentsAndEditors","vs/workbench/api/browser/mainThreadFileSystemEventService","vs/workbench/api/browser/mainThreadNotebookDocuments","vs/workbench/api/browser/mainThreadNotebookDocumentsAndEditors","vs/workbench/api/browser/mainThreadNotebookSaveParticipant","vs/workbench/api/browser/mainThreadWebviewManager","vs/workbench/contrib/bulkEdit/browser/bulkFileEdits","vs/workbench/contrib/bulkEdit/browser/bulkEditService","vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants","vs/workbench/services/textfile/common/textFileEditorModelManager","vs/workbench/services/textfile/browser/textFileService","vs/workbench/services/textfile/browser/browserTextFileService","vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager","vs/workbench/services/workingCopy/common/fileWorkingCopyManager","vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl","vs/workbench/services/workingCopy/common/workingCopyHistoryTracker","vs/workbench/services/workingCopy/common/workingCopyHistoryService","vs/workbench/services/workingCopy/browser/workingCopyHistoryService","vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService","vs/workbench/services/workspaces/browser/workspaceTrustEditorInput","vs/workbench/services/workspaces/browser/workspacesService","vs/workbench/services/workspaces/common/canonicalUriService","vs/workbench/services/workspaces/common/editSessionIdentityService","vs/workbench/api/browser/mainThreadWorkspace","vs/workbench/browser/parts/compositeBar","vs/workbench/browser/parts/editor/editorDropTarget","vs/workbench/browser/parts/editor/multiRowEditorTabsControl","vs/workbench/browser/parts/editor/noEditorTabsControl","vs/workbench/browser/parts/editor/singleEditorTabsControl","vs/workbench/browser/parts/editor/editorTitleControl","vs/workbench/browser/parts/editor/auxiliaryEditorPart","vs/workbench/browser/parts/editor/editorParts","vs/workbench/browser/parts/activitybar/activitybarPart","vs/workbench/browser/parts/titlebar/titlebarPart","vs/workbench/api/browser/mainThreadComments","vs/workbench/browser/layout","vs/workbench/browser/parts/paneCompositePartService","vs/workbench/browser/workbench","vs/workbench/contrib/bulkEdit/browser/preview/bulkEdit.contribution","vs/workbench/contrib/debug/browser/debug.contribution","vs/workbench/contrib/editSessions/browser/editSessionsViews","vs/workbench/contrib/files/browser/views/emptyView","vs/workbench/contrib/files/browser/views/explorerDecorationsProvider","vs/workbench/contrib/files/browser/fileCommands","vs/workbench/contrib/files/browser/fileActions.contribution","vs/workbench/contrib/files/browser/files.contribution","vs/workbench/contrib/chat/browser/actions/chatCodeblockActions","vs/workbench/contrib/chat/browser/actions/chatCopyActions","vs/workbench/contrib/chat/browser/actions/chatFileTreeActions","vs/workbench/contrib/chat/browser/actions/chatImportExport","vs/workbench/contrib/chat/browser/actions/chatTitleActions","vs/workbench/contrib/chat/browser/chatEditor","vs/workbench/contrib/chat/browser/chatQuick","vs/workbench/contrib/chat/browser/chatViewPane","vs/workbench/contrib/chat/browser/chatContributionServiceImpl","vs/workbench/api/browser/mainThreadChatAgents2","vs/workbench/contrib/chat/browser/chatVariables","vs/workbench/contrib/chat/browser/contrib/chatInputEditorContrib","vs/workbench/contrib/chat/browser/chat.contribution","vs/workbench/contrib/inlineChat/browser/inlineChatAccessibleView","vs/workbench/contrib/inlineChat/browser/inlineChatActions","vs/workbench/contrib/inlineChat/browser/inlineChatNotebook","vs/workbench/contrib/inlineChat/browser/inlineChatSavingServiceImpl","vs/workbench/contrib/inlineChat/browser/inlineChat.contribution","vs/workbench/contrib/markers/browser/markersView","vs/workbench/contrib/markers/browser/markers.contribution","vs/workbench/contrib/notebook/browser/controller/chat/notebookChatController","vs/workbench/contrib/notebook/browser/controller/chat/cellChatActions","vs/workbench/contrib/notebook/browser/controller/chat/notebook.chat.contribution","vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar","vs/workbench/contrib/notebook/browser/controller/executeActions","vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput","vs/workbench/contrib/notebook/browser/view/cellParts/codeCell","vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer","vs/workbench/contrib/interactive/browser/interactiveEditor","vs/workbench/contrib/interactive/browser/interactive.contribution","vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations","vs/workbench/contrib/notebook/browser/diff/notebookDiffActions","vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl","vs/workbench/contrib/outline/browser/outline.contribution","vs/workbench/contrib/output/browser/output.contribution","vs/workbench/contrib/preferences/browser/preferences.contribution","vs/workbench/contrib/quickaccess/browser/commandsQuickAccess","vs/workbench/contrib/quickaccess/browser/quickAccess.contribution","vs/workbench/api/browser/viewsExtensionPoint","vs/workbench/contrib/remote/browser/explorerViewItems","vs/workbench/contrib/remote/browser/remote","vs/workbench/contrib/remote/browser/remote.contribution","vs/workbench/contrib/scm/browser/scmViewPane","vs/workbench/contrib/scm/browser/scmViewPaneContainer","vs/workbench/contrib/scm/browser/scm.contribution","vs/workbench/contrib/search/browser/anythingQuickAccess","vs/workbench/contrib/search/browser/replaceService","vs/workbench/contrib/search/browser/replaceContributions","vs/workbench/contrib/search/browser/searchActionsCopy","vs/workbench/contrib/search/browser/searchActionsRemoveReplace","vs/workbench/contrib/search/browser/searchActionsTopBar","vs/workbench/contrib/search/browser/searchResultsView","vs/workbench/contrib/searchEditor/browser/searchEditor","vs/workbench/contrib/searchEditor/browser/searchEditorModel","vs/workbench/contrib/search/browser/searchActionsNav","vs/workbench/contrib/searchEditor/browser/searchEditor.contribution","vs/workbench/contrib/terminal/browser/terminalProfileService","vs/workbench/contrib/terminalContrib/accessibility/browser/terminal.accessibility.contribution","vs/workbench/contrib/terminalContrib/developer/browser/terminal.developer.contribution","vs/workbench/contrib/terminalContrib/environmentChanges/browser/terminal.environmentChanges.contribution","vs/workbench/contrib/terminalContrib/find/browser/terminal.find.contribution","vs/workbench/contrib/terminalContrib/links/browser/terminal.links.contribution","vs/workbench/contrib/terminalContrib/quickFix/browser/terminal.quickFix.contribution","vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollContribution","vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminal.stickyScroll.contribution","vs/workbench/contrib/terminalContrib/suggest/browser/terminal.suggest.contribution","vs/workbench/contrib/terminalContrib/zoom/browser/terminal.zoom.contribution","vs/workbench/contrib/testing/browser/testingViewPaneContainer","vs/workbench/contrib/testing/browser/testing.contribution","vs/workbench/contrib/timeline/browser/timeline.contribution","vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView","vs/workbench/contrib/userDataSync/browser/userDataSyncViews","vs/workbench/contrib/userDataSync/browser/userDataSync","vs/workbench/contrib/userDataSync/browser/userDataSync.contribution","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted","vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.contribution","vs/workbench/services/host/browser/browserHostService","vs/workbench/services/userDataProfile/browser/userDataProfileImportExportService","vs/workbench/services/views/browser/viewDescriptorService","vs/workbench/contrib/terminal/browser/terminalGroup","vs/workbench/contrib/terminal/browser/terminalGroupService","vs/workbench/services/workspaces/browser/workspaceEditingService","vs/workbench/contrib/editSessions/common/workspaceStateSync","vs/workbench/contrib/editSessions/browser/editSessions.contribution","vs/workbench/browser/web.factory","vs/workbench/api/browser/mainThreadCLICommands","vs/workbench/api/browser/extensionHost.contribution","vs/workbench/contrib/extensions/browser/deprecatedExtensionsChecker","vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService","vs/workbench/contrib/extensions/browser/extensionsViewer","vs/workbench/contrib/extensions/browser/extensionEditor","vs/workbench/contrib/extensions/browser/extensionsWorkbenchService","vs/workbench/contrib/extensions/browser/extensions.contribution","vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline","vs/workbench/contrib/notebook/browser/services/notebookServiceImpl","vs/workbench/contrib/notebook/browser/notebook.contribution","vs/workbench/contrib/search/browser/searchActionsTextQuickAccess","vs/workbench/contrib/search/browser/search.contribution","vs/workbench/contrib/terminal/browser/terminalService","vs/workbench/contrib/terminal/browser/terminal.contribution","vs/workbench/contrib/terminal/terminal.all","vs/workbench/contrib/workspace/browser/workspaceTrustEditor","vs/workbench/contrib/workspace/browser/workspace.contribution","vs/workbench/services/extensionManagement/browser/extensionEnablementService","vs/workbench/services/extensionManagement/browser/webExtensionsScannerService","vs/workbench/services/extensionManagement/common/extensionManagementService","vs/workbench/services/extensionManagement/common/webExtensionManagementService","vs/workbench/services/extensionManagement/common/extensionManagementServerService","vs/workbench/services/extensions/common/abstractExtensionService","vs/workbench/services/extensions/browser/extensionService","vs/workbench/workbench.common.main","vs/workbench/workbench.web.main"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[1188/*vs/base/browser/deviceAccess*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requestHidDevice = exports.requestSerialPort = exports.requestUsbDevice = void 0;
    async function requestUsbDevice(options) {
        const usb = navigator.usb;
        if (!usb) {
            return undefined;
        }
        const device = await usb.requestDevice({ filters: options?.filters ?? [] });
        if (!device) {
            return undefined;
        }
        return {
            deviceClass: device.deviceClass,
            deviceProtocol: device.deviceProtocol,
            deviceSubclass: device.deviceSubclass,
            deviceVersionMajor: device.deviceVersionMajor,
            deviceVersionMinor: device.deviceVersionMinor,
            deviceVersionSubminor: device.deviceVersionSubminor,
            manufacturerName: device.manufacturerName,
            productId: device.productId,
            productName: device.productName,
            serialNumber: device.serialNumber,
            usbVersionMajor: device.usbVersionMajor,
            usbVersionMinor: device.usbVersionMinor,
            usbVersionSubminor: device.usbVersionSubminor,
            vendorId: device.vendorId,
        };
    }
    exports.requestUsbDevice = requestUsbDevice;
    async function requestSerialPort(options) {
        const serial = navigator.serial;
        if (!serial) {
            return undefined;
        }
        const port = await serial.requestPort({ filters: options?.filters ?? [] });
        if (!port) {
            return undefined;
        }
        const info = port.getInfo();
        return {
            usbVendorId: info.usbVendorId,
            usbProductId: info.usbProductId
        };
    }
    exports.requestSerialPort = requestSerialPort;
    async function requestHidDevice(options) {
        const hid = navigator.hid;
        if (!hid) {
            return undefined;
        }
        const devices = await hid.requestDevice({ filters: options?.filters ?? [] });
        if (!devices.length) {
            return undefined;
        }
        const device = devices[0];
        return {
            opened: device.opened,
            vendorId: device.vendorId,
            productId: device.productId,
            productName: device.productName,
            collections: device.collections
        };
    }
    exports.requestHidDevice = requestHidDevice;
});

/*! @license DOMPurify 3.0.5 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.0.5/LICENSE */

const {
	entries,
	setPrototypeOf,
	isFrozen,
	getPrototypeOf,
	getOwnPropertyDescriptor
} = Object;
let {
	freeze,
	seal,
	create
} = Object; // eslint-disable-line import/no-mutable-exports

let {
	apply,
	construct
} = typeof Reflect !== 'undefined' && Reflect;

if (!apply) {
	apply = function apply(fun, thisValue, args) {
		return fun.apply(thisValue, args);
	};
}

if (!freeze) {
	freeze = function freeze(x) {
		return x;
	};
}

if (!seal) {
	seal = function seal(x) {
		return x;
	};
}

if (!construct) {
	construct = function construct(Func, args) {
		return new Func(...args);
	};
}

const arrayForEach = unapply(Array.prototype.forEach);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
	return function (thisArg) {
		for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		return apply(func, thisArg, args);
	};
}
function unconstruct(func) {
	return function () {
		for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		return construct(func, args);
	};
}
/* Add properties to a lookup table */

function addToSet(set, array, transformCaseFunc) {
	var _transformCaseFunc;

	transformCaseFunc = (_transformCaseFunc = transformCaseFunc) !== null && _transformCaseFunc !== void 0 ? _transformCaseFunc : stringToLowerCase;

	if (setPrototypeOf) {
		// Make 'in' and truthy checks like Boolean(set.constructor)
		// independent of any properties defined on Object.prototype.
		// Prevent prototype setters from intercepting set as a this value.
		setPrototypeOf(set, null);
	}

	let l = array.length;

	while (l--) {
		let element = array[l];

		if (typeof element === 'string') {
			const lcElement = transformCaseFunc(element);

			if (lcElement !== element) {
				// Config presets (e.g. tags.js, attrs.js) are immutable.
				if (!isFrozen(array)) {
					array[l] = lcElement;
				}

				element = lcElement;
			}
		}

		set[element] = true;
	}

	return set;
}
/* Shallow clone an object */

function clone(object) {
	const newObject = create(null);

	for (const [property, value] of entries(object)) {
		newObject[property] = value;
	}

	return newObject;
}
/* This method automatically checks if the prop is function
 * or getter and behaves accordingly. */

function lookupGetter(object, prop) {
	while (object !== null) {
		const desc = getOwnPropertyDescriptor(object, prop);

		if (desc) {
			if (desc.get) {
				return unapply(desc.get);
			}

			if (typeof desc.value === 'function') {
				return unapply(desc.value);
			}
		}

		object = getPrototypeOf(object);
	}

	function fallbackValue(element) {
		console.warn('fallback value for', element);
		return null;
	}

	return fallbackValue;
}

const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']); // SVG

const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']); // List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.

const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']); // Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.

const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
const text = freeze(['#text']);

const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);
const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode

const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape

const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape

const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);

var EXPRESSIONS = /*#__PURE__*/Object.freeze({
	__proto__: null,
	MUSTACHE_EXPR: MUSTACHE_EXPR,
	ERB_EXPR: ERB_EXPR,
	TMPLIT_EXPR: TMPLIT_EXPR,
	DATA_ATTR: DATA_ATTR,
	ARIA_ATTR: ARIA_ATTR,
	IS_ALLOWED_URI: IS_ALLOWED_URI,
	IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
	ATTR_WHITESPACE: ATTR_WHITESPACE,
	DOCTYPE_NAME: DOCTYPE_NAME
});

const getGlobal = () => typeof window === 'undefined' ? null : window;
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {HTMLScriptElement} purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */


const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
	if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
		return null;
	} // Allow the callers to control the unique policy name
	// by adding a data-tt-policy-suffix to the script element with the DOMPurify.
	// Policy creation with duplicate names throws in Trusted Types.


	let suffix = null;
	const ATTR_NAME = 'data-tt-policy-suffix';

	if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
		suffix = purifyHostElement.getAttribute(ATTR_NAME);
	}

	const policyName = 'dompurify' + (suffix ? '#' + suffix : '');

	try {
		return trustedTypes.createPolicy(policyName, {
			createHTML(html) {
				return html;
			},

			createScriptURL(scriptUrl) {
				return scriptUrl;
			}

		});
	} catch (_) {
		// Policy creation failed (most likely another DOMPurify script has
		// already run). Skip creating the policy, as this will only cause errors
		// if TT are enforced.
		console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
		return null;
	}
};

function createDOMPurify() {
	let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

	const DOMPurify = root => createDOMPurify(root);
	/**
	 * Version label, exposed for easier checks
	 * if DOMPurify is up to date or not
	 */


	DOMPurify.version = '3.0.5';
	/**
	 * Array of elements that DOMPurify removed during sanitation.
	 * Empty if nothing was removed.
	 */

	DOMPurify.removed = [];

	if (!window || !window.document || window.document.nodeType !== 9) {
		// Not running in a browser, provide a factory function
		// so that you can pass your own Window
		DOMPurify.isSupported = false;
		return DOMPurify;
	}

	const originalDocument = window.document;
	const currentScript = originalDocument.currentScript;
	let {
		document
	} = window;
	const {
		DocumentFragment,
		HTMLTemplateElement,
		Node,
		Element,
		NodeFilter,
		NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
		HTMLFormElement,
		DOMParser,
		trustedTypes
	} = window;
	const ElementPrototype = Element.prototype;
	const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
	const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
	const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
	const getParentNode = lookupGetter(ElementPrototype, 'parentNode'); // As per issue #47, the web-components registry is inherited by a
	// new document created via createHTMLDocument. As per the spec
	// (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
	// a new empty registry is used when creating a template contents owner
	// document, so we use that as our parent document to ensure nothing
	// is inherited.

	if (typeof HTMLTemplateElement === 'function') {
		const template = document.createElement('template');

		if (template.content && template.content.ownerDocument) {
			document = template.content.ownerDocument;
		}
	}

	let trustedTypesPolicy;
	let emptyHTML = '';
	const {
		implementation,
		createNodeIterator,
		createDocumentFragment,
		getElementsByTagName
	} = document;
	const {
		importNode
	} = originalDocument;
	let hooks = {};
	/**
	 * Expose whether this browser supports running the full DOMPurify.
	 */

	DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
	const {
		MUSTACHE_EXPR,
		ERB_EXPR,
		TMPLIT_EXPR,
		DATA_ATTR,
		ARIA_ATTR,
		IS_SCRIPT_OR_DATA,
		ATTR_WHITESPACE
	} = EXPRESSIONS;
	let {
		IS_ALLOWED_URI: IS_ALLOWED_URI$1
	} = EXPRESSIONS;
	/**
	 * We consider the elements and attributes below to be safe. Ideally
	 * don't add any new ones but feel free to remove unwanted ones.
	 */

	/* allowed element names */

	let ALLOWED_TAGS = null;
	const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
	/* Allowed attribute names */

	let ALLOWED_ATTR = null;
	const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
	/*
	 * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
	 * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
	 * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
	 * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
	 */

	let CUSTOM_ELEMENT_HANDLING = Object.seal(Object.create(null, {
		tagNameCheck: {
			writable: true,
			configurable: false,
			enumerable: true,
			value: null
		},
		attributeNameCheck: {
			writable: true,
			configurable: false,
			enumerable: true,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: true,
			configurable: false,
			enumerable: true,
			value: false
		}
	}));
	/* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */

	let FORBID_TAGS = null;
	/* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */

	let FORBID_ATTR = null;
	/* Decide if ARIA attributes are okay */

	let ALLOW_ARIA_ATTR = true;
	/* Decide if custom data attributes are okay */

	let ALLOW_DATA_ATTR = true;
	/* Decide if unknown protocols are okay */

	let ALLOW_UNKNOWN_PROTOCOLS = false;
	/* Decide if self-closing tags in attributes are allowed.
	 * Usually removed due to a mXSS issue in jQuery 3.0 */

	let ALLOW_SELF_CLOSE_IN_ATTR = true;
	/* Output should be safe for common template engines.
	 * This means, DOMPurify removes data attributes, mustaches and ERB
	 */

	let SAFE_FOR_TEMPLATES = false;
	/* Decide if document with <html>... should be returned */

	let WHOLE_DOCUMENT = false;
	/* Track whether config is already set on this instance of DOMPurify. */

	let SET_CONFIG = false;
	/* Decide if all elements (e.g. style, script) must be children of
	 * document.body. By default, browsers might move them to document.head */

	let FORCE_BODY = false;
	/* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
	 * string (or a TrustedHTML object if Trusted Types are supported).
	 * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
	 */

	let RETURN_DOM = false;
	/* Decide if a DOM `DocumentFragment` should be returned, instead of a html
	 * string  (or a TrustedHTML object if Trusted Types are supported) */

	let RETURN_DOM_FRAGMENT = false;
	/* Try to return a Trusted Type object instead of a string, return a string in
	 * case Trusted Types are not supported  */

	let RETURN_TRUSTED_TYPE = false;
	/* Output should be free from DOM clobbering attacks?
	 * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
	 */

	let SANITIZE_DOM = true;
	/* Achieve full DOM Clobbering protection by isolating the namespace of named
	 * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
	 *
	 * HTML/DOM spec rules that enable DOM Clobbering:
	 *   - Named Access on Window (§7.3.3)
	 *   - DOM Tree Accessors (§3.1.5)
	 *   - Form Element Parent-Child Relations (§4.10.3)
	 *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
	 *   - HTMLCollection (§4.2.10.2)
	 *
	 * Namespace isolation is implemented by prefixing `id` and `name` attributes
	 * with a constant string, i.e., `user-content-`
	 */

	let SANITIZE_NAMED_PROPS = false;
	const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
	/* Keep element content when removing element? */

	let KEEP_CONTENT = true;
	/* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
	 * of importing it into a new Document and returning a sanitized copy */

	let IN_PLACE = false;
	/* Allow usage of profiles like html, svg and mathMl */

	let USE_PROFILES = {};
	/* Tags to ignore content of when KEEP_CONTENT is true */

	let FORBID_CONTENTS = null;
	const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
	/* Tags that are safe for data: URIs */

	let DATA_URI_TAGS = null;
	const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
	/* Attributes safe for values like "javascript:" */

	let URI_SAFE_ATTRIBUTES = null;
	const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
	const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
	const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
	const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
	/* Document namespace */

	let NAMESPACE = HTML_NAMESPACE;
	let IS_EMPTY_INPUT = false;
	/* Allowed XHTML+XML namespaces */

	let ALLOWED_NAMESPACES = null;
	const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
	/* Parsing of strict XHTML documents */

	let PARSER_MEDIA_TYPE;
	const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
	const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
	let transformCaseFunc;
	/* Keep a reference to config to pass to hooks */

	let CONFIG = null;
	/* Ideally, do not touch anything below this line */

	/* ______________________________________________ */

	const formElement = document.createElement('form');

	const isRegexOrFunction = function isRegexOrFunction(testValue) {
		return testValue instanceof RegExp || testValue instanceof Function;
	};
	/**
	 * _parseConfig
	 *
	 * @param  {Object} cfg optional config literal
	 */
	// eslint-disable-next-line complexity


	const _parseConfig = function _parseConfig(cfg) {
		if (CONFIG && CONFIG === cfg) {
			return;
		}
		/* Shield configuration object from tampering */


		if (!cfg || typeof cfg !== 'object') {
			cfg = {};
		}
		/* Shield configuration object from prototype pollution */


		cfg = clone(cfg);
		PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
			SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE; // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.

		transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
		/* Set configuration parameters */

		ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
		ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
		ALLOWED_NAMESPACES = 'ALLOWED_NAMESPACES' in cfg ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
		URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), // eslint-disable-line indent
			cfg.ADD_URI_SAFE_ATTR, // eslint-disable-line indent
			transformCaseFunc // eslint-disable-line indent
		) // eslint-disable-line indent
			: DEFAULT_URI_SAFE_ATTRIBUTES;
		DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), // eslint-disable-line indent
			cfg.ADD_DATA_URI_TAGS, // eslint-disable-line indent
			transformCaseFunc // eslint-disable-line indent
		) // eslint-disable-line indent
			: DEFAULT_DATA_URI_TAGS;
		FORBID_CONTENTS = 'FORBID_CONTENTS' in cfg ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
		FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
		FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
		USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
		ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true

		ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true

		ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false

		ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true

		SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false

		WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false

		RETURN_DOM = cfg.RETURN_DOM || false; // Default false

		RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false

		RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false

		FORCE_BODY = cfg.FORCE_BODY || false; // Default false

		SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true

		SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false

		KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

		IN_PLACE = cfg.IN_PLACE || false; // Default false

		IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
		NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
		CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};

		if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
			CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
		}

		if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
			CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
		}

		if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
			CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
		}

		if (SAFE_FOR_TEMPLATES) {
			ALLOW_DATA_ATTR = false;
		}

		if (RETURN_DOM_FRAGMENT) {
			RETURN_DOM = true;
		}
		/* Parse profile info */


		if (USE_PROFILES) {
			ALLOWED_TAGS = addToSet({}, [...text]);
			ALLOWED_ATTR = [];

			if (USE_PROFILES.html === true) {
				addToSet(ALLOWED_TAGS, html$1);
				addToSet(ALLOWED_ATTR, html);
			}

			if (USE_PROFILES.svg === true) {
				addToSet(ALLOWED_TAGS, svg$1);
				addToSet(ALLOWED_ATTR, svg);
				addToSet(ALLOWED_ATTR, xml);
			}

			if (USE_PROFILES.svgFilters === true) {
				addToSet(ALLOWED_TAGS, svgFilters);
				addToSet(ALLOWED_ATTR, svg);
				addToSet(ALLOWED_ATTR, xml);
			}

			if (USE_PROFILES.mathMl === true) {
				addToSet(ALLOWED_TAGS, mathMl$1);
				addToSet(ALLOWED_ATTR, mathMl);
				addToSet(ALLOWED_ATTR, xml);
			}
		}
		/* Merge configuration parameters */


		if (cfg.ADD_TAGS) {
			if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
				ALLOWED_TAGS = clone(ALLOWED_TAGS);
			}

			addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
		}

		if (cfg.ADD_ATTR) {
			if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
				ALLOWED_ATTR = clone(ALLOWED_ATTR);
			}

			addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
		}

		if (cfg.ADD_URI_SAFE_ATTR) {
			addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
		}

		if (cfg.FORBID_CONTENTS) {
			if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
				FORBID_CONTENTS = clone(FORBID_CONTENTS);
			}

			addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
		}
		/* Add #text in case KEEP_CONTENT is set to true */


		if (KEEP_CONTENT) {
			ALLOWED_TAGS['#text'] = true;
		}
		/* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */


		if (WHOLE_DOCUMENT) {
			addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
		}
		/* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */


		if (ALLOWED_TAGS.table) {
			addToSet(ALLOWED_TAGS, ['tbody']);
			delete FORBID_TAGS.tbody;
		}

		if (cfg.TRUSTED_TYPES_POLICY) {
			if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
				throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
			}

			if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
				throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
			} // Overwrite existing TrustedTypes policy.


			trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY; // Sign local variables required by `sanitize`.

			emptyHTML = trustedTypesPolicy.createHTML('');
		} else {
			// Uninitialized policy, attempt to initialize the internal dompurify policy.
			if (trustedTypesPolicy === undefined) {
				trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
			} // If creating the internal policy succeeded sign internal variables.


			if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
				emptyHTML = trustedTypesPolicy.createHTML('');
			}
		} // Prevent further manipulation of configuration.
		// Not available in IE8, Safari 5, etc.


		if (freeze) {
			freeze(cfg);
		}

		CONFIG = cfg;
	};

	const MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
	const HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']); // Certain elements are allowed in both SVG and HTML
	// namespace. We need to specify them explicitly
	// so that they don't get erroneously deleted from
	// HTML namespace.

	const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
	/* Keep track of all possible SVG and MathML tags
	 * so that we can perform the namespace checks
	 * correctly. */

	const ALL_SVG_TAGS = addToSet({}, svg$1);
	addToSet(ALL_SVG_TAGS, svgFilters);
	addToSet(ALL_SVG_TAGS, svgDisallowed);
	const ALL_MATHML_TAGS = addToSet({}, mathMl$1);
	addToSet(ALL_MATHML_TAGS, mathMlDisallowed);
	/**
	 *
	 *
	 * @param  {Element} element a DOM element whose namespace is being checked
	 * @returns {boolean} Return false if the element has a
	 *  namespace that a spec-compliant parser would never
	 *  return. Return true otherwise.
	 */

	const _checkValidNamespace = function _checkValidNamespace(element) {
		let parent = getParentNode(element); // In JSDOM, if we're inside shadow DOM, then parentNode
		// can be null. We just simulate parent in this case.

		if (!parent || !parent.tagName) {
			parent = {
				namespaceURI: NAMESPACE,
				tagName: 'template'
			};
		}

		const tagName = stringToLowerCase(element.tagName);
		const parentTagName = stringToLowerCase(parent.tagName);

		if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
			return false;
		}

		if (element.namespaceURI === SVG_NAMESPACE) {
			// The only way to switch from HTML namespace to SVG
			// is via <svg>. If it happens via any other tag, then
			// it should be killed.
			if (parent.namespaceURI === HTML_NAMESPACE) {
				return tagName === 'svg';
			} // The only way to switch from MathML to SVG is via`
			// svg if parent is either <annotation-xml> or MathML
			// text integration points.


			if (parent.namespaceURI === MATHML_NAMESPACE) {
				return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
			} // We only allow elements that are defined in SVG
			// spec. All others are disallowed in SVG namespace.


			return Boolean(ALL_SVG_TAGS[tagName]);
		}

		if (element.namespaceURI === MATHML_NAMESPACE) {
			// The only way to switch from HTML namespace to MathML
			// is via <math>. If it happens via any other tag, then
			// it should be killed.
			if (parent.namespaceURI === HTML_NAMESPACE) {
				return tagName === 'math';
			} // The only way to switch from SVG to MathML is via
			// <math> and HTML integration points


			if (parent.namespaceURI === SVG_NAMESPACE) {
				return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
			} // We only allow elements that are defined in MathML
			// spec. All others are disallowed in MathML namespace.


			return Boolean(ALL_MATHML_TAGS[tagName]);
		}

		if (element.namespaceURI === HTML_NAMESPACE) {
			// The only way to switch from SVG to HTML is via
			// HTML integration points, and from MathML to HTML
			// is via MathML text integration points
			if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
				return false;
			}

			if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
				return false;
			} // We disallow tags that are specific for MathML
			// or SVG and should never appear in HTML namespace


			return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
		} // For XHTML and XML documents that support custom namespaces


		if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
			return true;
		} // The code should never reach this place (this means
		// that the element somehow got namespace that is not
		// HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
		// Return false just in case.


		return false;
	};
	/**
	 * _forceRemove
	 *
	 * @param  {Node} node a DOM node
	 */


	const _forceRemove = function _forceRemove(node) {
		arrayPush(DOMPurify.removed, {
			element: node
		});

		try {
			// eslint-disable-next-line unicorn/prefer-dom-node-remove
			node.parentNode.removeChild(node);
		} catch (_) {
			node.remove();
		}
	};
	/**
	 * _removeAttribute
	 *
	 * @param  {String} name an Attribute name
	 * @param  {Node} node a DOM node
	 */


	const _removeAttribute = function _removeAttribute(name, node) {
		try {
			arrayPush(DOMPurify.removed, {
				attribute: node.getAttributeNode(name),
				from: node
			});
		} catch (_) {
			arrayPush(DOMPurify.removed, {
				attribute: null,
				from: node
			});
		}

		node.removeAttribute(name); // We void attribute values for unremovable "is"" attributes

		if (name === 'is' && !ALLOWED_ATTR[name]) {
			if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
				try {
					_forceRemove(node);
				} catch (_) { }
			} else {
				try {
					node.setAttribute(name, '');
				} catch (_) { }
			}
		}
	};
	/**
	 * _initDocument
	 *
	 * @param  {String} dirty a string of dirty markup
	 * @return {Document} a DOM, filled with the dirty markup
	 */


	const _initDocument = function _initDocument(dirty) {
		/* Create a HTML document */
		let doc;
		let leadingWhitespace;

		if (FORCE_BODY) {
			dirty = '<remove></remove>' + dirty;
		} else {
			/* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
			const matches = stringMatch(dirty, /^[\r\n\t ]+/);
			leadingWhitespace = matches && matches[0];
		}

		if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
			// Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
			dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
		}

		const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
		/*
		 * Use the DOMParser API by default, fallback later if needs be
		 * DOMParser not work for svg when has multiple root element.
		 */

		if (NAMESPACE === HTML_NAMESPACE) {
			try {
				doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
			} catch (_) { }
		}
		/* Use createHTMLDocument in case DOMParser is not available */


		if (!doc || !doc.documentElement) {
			doc = implementation.createDocument(NAMESPACE, 'template', null);

			try {
				doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
			} catch (_) {// Syntax error if dirtyPayload is invalid xml
			}
		}

		const body = doc.body || doc.documentElement;

		if (dirty && leadingWhitespace) {
			body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
		}
		/* Work on whole document or just its body */


		if (NAMESPACE === HTML_NAMESPACE) {
			return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
		}

		return WHOLE_DOCUMENT ? doc.documentElement : body;
	};
	/**
	 * _createIterator
	 *
	 * @param  {Document} root document/fragment to create iterator for
	 * @return {Iterator} iterator instance
	 */


	const _createIterator = function _createIterator(root) {
		return createNodeIterator.call(root.ownerDocument || root, root, // eslint-disable-next-line no-bitwise
			NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null, false);
	};
	/**
	 * _isClobbered
	 *
	 * @param  {Node} elm element to check for clobbering attacks
	 * @return {Boolean} true if clobbered, false if safe
	 */


	const _isClobbered = function _isClobbered(elm) {
		return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
	};
	/**
	 * _isNode
	 *
	 * @param  {Node} obj object to check whether it's a DOM node
	 * @return {Boolean} true is object is a DOM node
	 */


	const _isNode = function _isNode(object) {
		return typeof Node === 'object' ? object instanceof Node : object && typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
	};
	/**
	 * _executeHook
	 * Execute user configurable hooks
	 *
	 * @param  {String} entryPoint  Name of the hook's entry point
	 * @param  {Node} currentNode node to work on with the hook
	 * @param  {Object} data additional hook parameters
	 */


	const _executeHook = function _executeHook(entryPoint, currentNode, data) {
		if (!hooks[entryPoint]) {
			return;
		}

		arrayForEach(hooks[entryPoint], hook => {
			hook.call(DOMPurify, currentNode, data, CONFIG);
		});
	};
	/**
	 * _sanitizeElements
	 *
	 * @protect nodeName
	 * @protect textContent
	 * @protect removeChild
	 *
	 * @param   {Node} currentNode to check for permission to exist
	 * @return  {Boolean} true if node was killed, false if left alive
	 */


	const _sanitizeElements = function _sanitizeElements(currentNode) {
		let content;
		/* Execute a hook if present */

		_executeHook('beforeSanitizeElements', currentNode, null);
		/* Check if element is clobbered or can clobber */


		if (_isClobbered(currentNode)) {
			_forceRemove(currentNode);

			return true;
		}
		/* Now let's check the element's type and name */


		const tagName = transformCaseFunc(currentNode.nodeName);
		/* Execute a hook if present */

		_executeHook('uponSanitizeElement', currentNode, {
			tagName,
			allowedTags: ALLOWED_TAGS
		});
		/* Detect mXSS attempts abusing namespace confusion */


		if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
			_forceRemove(currentNode);

			return true;
		}
		/* Remove element if anything forbids its presence */


		if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
			/* Check if we have a custom element to handle */
			if (!FORBID_TAGS[tagName] && _basicCustomElementTest(tagName)) {
				if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
				if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) return false;
			}
			/* Keep content except for bad-listed elements */


			if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
				const parentNode = getParentNode(currentNode) || currentNode.parentNode;
				const childNodes = getChildNodes(currentNode) || currentNode.childNodes;

				if (childNodes && parentNode) {
					const childCount = childNodes.length;

					for (let i = childCount - 1; i >= 0; --i) {
						parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
					}
				}
			}

			_forceRemove(currentNode);

			return true;
		}
		/* Check whether element has a valid namespace */


		if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
			_forceRemove(currentNode);

			return true;
		}
		/* Make sure that older browsers don't get fallback-tag mXSS */


		if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
			_forceRemove(currentNode);

			return true;
		}
		/* Sanitize element content to be template-safe */


		if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
			/* Get the element's text content */
			content = currentNode.textContent;
			content = stringReplace(content, MUSTACHE_EXPR, ' ');
			content = stringReplace(content, ERB_EXPR, ' ');
			content = stringReplace(content, TMPLIT_EXPR, ' ');

			if (currentNode.textContent !== content) {
				arrayPush(DOMPurify.removed, {
					element: currentNode.cloneNode()
				});
				currentNode.textContent = content;
			}
		}
		/* Execute a hook if present */


		_executeHook('afterSanitizeElements', currentNode, null);

		return false;
	};
	/**
	 * _isValidAttribute
	 *
	 * @param  {string} lcTag Lowercase tag name of containing element.
	 * @param  {string} lcName Lowercase attribute name.
	 * @param  {string} value Attribute value.
	 * @return {Boolean} Returns true if `value` is valid, otherwise false.
	 */
	// eslint-disable-next-line complexity


	const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
		/* Make sure attribute cannot clobber */
		if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
			return false;
		}
		/* Allow valid data-* attributes: At least one character after "-"
				(https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
				XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
				We don't need to check the value; it's always URI safe. */


		if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)); else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)); else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
			if ( // First condition does a very basic check if a) it's basically a valid custom element tagname AND
				// b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
				// and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
				_basicCustomElementTest(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) || // Alternative, second condition checks if it's an `is`-attribute, AND
				// the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
				lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))); else {
				return false;
			}
			/* Check value is safe. First, is attr inert? If so, is safe */

		} else if (URI_SAFE_ATTRIBUTES[lcName]); else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))); else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]); else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))); else if (value) {
			return false;
		} else;

		return true;
	};
	/**
	 * _basicCustomElementCheck
	 * checks if at least one dash is included in tagName, and it's not the first char
	 * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
	 * @param {string} tagName name of the tag of the node to sanitize
	 */


	const _basicCustomElementTest = function _basicCustomElementTest(tagName) {
		return tagName.indexOf('-') > 0;
	};
	/**
	 * _sanitizeAttributes
	 *
	 * @protect attributes
	 * @protect nodeName
	 * @protect removeAttribute
	 * @protect setAttribute
	 *
	 * @param  {Node} currentNode to sanitize
	 */


	const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
		let attr;
		let value;
		let lcName;
		let l;
		/* Execute a hook if present */

		_executeHook('beforeSanitizeAttributes', currentNode, null);

		const {
			attributes
		} = currentNode;
		/* Check if we have attributes; if not we might have a text node */

		if (!attributes) {
			return;
		}

		const hookEvent = {
			attrName: '',
			attrValue: '',
			keepAttr: true,
			allowedAttributes: ALLOWED_ATTR
		};
		l = attributes.length;
		/* Go backwards over all attributes; safely remove bad ones */

		while (l--) {
			attr = attributes[l];
			const {
				name,
				namespaceURI
			} = attr;
			value = name === 'value' ? attr.value : stringTrim(attr.value);
			lcName = transformCaseFunc(name);
			/* Execute a hook if present */

			hookEvent.attrName = lcName;
			hookEvent.attrValue = value;
			hookEvent.keepAttr = true;
			hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set

			_executeHook('uponSanitizeAttribute', currentNode, hookEvent);

			value = hookEvent.attrValue;
			/* Did the hooks approve of the attribute? */

			if (hookEvent.forceKeepAttr) {
				continue;
			}
			/* Remove attribute */


			_removeAttribute(name, currentNode);
			/* Did the hooks approve of the attribute? */


			if (!hookEvent.keepAttr) {
				continue;
			}
			/* Work around a security issue in jQuery 3.0 */


			if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
				_removeAttribute(name, currentNode);

				continue;
			}
			/* Sanitize attribute content to be template-safe */


			if (SAFE_FOR_TEMPLATES) {
				value = stringReplace(value, MUSTACHE_EXPR, ' ');
				value = stringReplace(value, ERB_EXPR, ' ');
				value = stringReplace(value, TMPLIT_EXPR, ' ');
			}
			/* Is `value` valid for this attribute? */


			const lcTag = transformCaseFunc(currentNode.nodeName);

			if (!_isValidAttribute(lcTag, lcName, value)) {
				continue;
			}
			/* Full DOM Clobbering protection via namespace isolation,
			 * Prefix id and name attributes with `user-content-`
			 */


			if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
				// Remove the attribute with this value
				_removeAttribute(name, currentNode); // Prefix the value and later re-create the attribute with the sanitized value


				value = SANITIZE_NAMED_PROPS_PREFIX + value;
			}
			/* Handle attributes that require Trusted Types */


			if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
				if (namespaceURI); else {
					switch (trustedTypes.getAttributeType(lcTag, lcName)) {
						case 'TrustedHTML':
							{
								value = trustedTypesPolicy.createHTML(value);
								break;
							}

						case 'TrustedScriptURL':
							{
								value = trustedTypesPolicy.createScriptURL(value);
								break;
							}
					}
				}
			}
			/* Handle invalid data-* attribute set by try-catching it */


			try {
				if (namespaceURI) {
					currentNode.setAttributeNS(namespaceURI, name, value);
				} else {
					/* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
					currentNode.setAttribute(name, value);
				}

				arrayPop(DOMPurify.removed);
			} catch (_) { }
		}
		/* Execute a hook if present */


		_executeHook('afterSanitizeAttributes', currentNode, null);
	};
	/**
	 * _sanitizeShadowDOM
	 *
	 * @param  {DocumentFragment} fragment to iterate over recursively
	 */


	const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
		let shadowNode;

		const shadowIterator = _createIterator(fragment);
		/* Execute a hook if present */


		_executeHook('beforeSanitizeShadowDOM', fragment, null);

		while (shadowNode = shadowIterator.nextNode()) {
			/* Execute a hook if present */
			_executeHook('uponSanitizeShadowNode', shadowNode, null);
			/* Sanitize tags and elements */


			if (_sanitizeElements(shadowNode)) {
				continue;
			}
			/* Deep shadow DOM detected */


			if (shadowNode.content instanceof DocumentFragment) {
				_sanitizeShadowDOM(shadowNode.content);
			}
			/* Check attributes, sanitize if necessary */


			_sanitizeAttributes(shadowNode);
		}
		/* Execute a hook if present */


		_executeHook('afterSanitizeShadowDOM', fragment, null);
	};
	/**
	 * Sanitize
	 * Public method providing core sanitation functionality
	 *
	 * @param {String|Node} dirty string or DOM node
	 * @param {Object} configuration object
	 */
	// eslint-disable-next-line complexity


	DOMPurify.sanitize = function (dirty) {
		let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		let body;
		let importedNode;
		let currentNode;
		let returnNode;
		/* Make sure we have a string to sanitize.
			DO NOT return early, as this will return the wrong type if
			the user has requested a DOM object rather than a string */

		IS_EMPTY_INPUT = !dirty;

		if (IS_EMPTY_INPUT) {
			dirty = '<!-->';
		}
		/* Stringify, in case dirty is an object */


		if (typeof dirty !== 'string' && !_isNode(dirty)) {
			if (typeof dirty.toString === 'function') {
				dirty = dirty.toString();

				if (typeof dirty !== 'string') {
					throw typeErrorCreate('dirty is not a string, aborting');
				}
			} else {
				throw typeErrorCreate('toString is not a function');
			}
		}
		/* Return dirty HTML if DOMPurify cannot run */


		if (!DOMPurify.isSupported) {
			return dirty;
		}
		/* Assign config vars */


		if (!SET_CONFIG) {
			_parseConfig(cfg);
		}
		/* Clean up removed elements */


		DOMPurify.removed = [];
		/* Check if dirty is correctly typed for IN_PLACE */

		if (typeof dirty === 'string') {
			IN_PLACE = false;
		}

		if (IN_PLACE) {
			/* Do some early pre-sanitization to avoid unsafe root nodes */
			if (dirty.nodeName) {
				const tagName = transformCaseFunc(dirty.nodeName);

				if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
					throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
				}
			}
		} else if (dirty instanceof Node) {
			/* If dirty is a DOM element, append to an empty document to avoid
				 elements being stripped by the parser */
			body = _initDocument('<!---->');
			importedNode = body.ownerDocument.importNode(dirty, true);

			if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
				/* Node is already a body, use as is */
				body = importedNode;
			} else if (importedNode.nodeName === 'HTML') {
				body = importedNode;
			} else {
				// eslint-disable-next-line unicorn/prefer-dom-node-append
				body.appendChild(importedNode);
			}
		} else {
			/* Exit directly if we have nothing to do */
			if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
				dirty.indexOf('<') === -1) {
				return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
			}
			/* Initialize the document to work on */


			body = _initDocument(dirty);
			/* Check we have a DOM node from the data */

			if (!body) {
				return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
			}
		}
		/* Remove first element node (ours) if FORCE_BODY is set */


		if (body && FORCE_BODY) {
			_forceRemove(body.firstChild);
		}
		/* Get node iterator */


		const nodeIterator = _createIterator(IN_PLACE ? dirty : body);
		/* Now start iterating over the created document */


		while (currentNode = nodeIterator.nextNode()) {
			/* Sanitize tags and elements */
			if (_sanitizeElements(currentNode)) {
				continue;
			}
			/* Shadow DOM detected, sanitize it */


			if (currentNode.content instanceof DocumentFragment) {
				_sanitizeShadowDOM(currentNode.content);
			}
			/* Check attributes, sanitize if necessary */


			_sanitizeAttributes(currentNode);
		}
		/* If we sanitized `dirty` in-place, return it. */


		if (IN_PLACE) {
			return dirty;
		}
		/* Return sanitized string or DOM */


		if (RETURN_DOM) {
			if (RETURN_DOM_FRAGMENT) {
				returnNode = createDocumentFragment.call(body.ownerDocument);

				while (body.firstChild) {
					// eslint-disable-next-line unicorn/prefer-dom-node-append
					returnNode.appendChild(body.firstChild);
				}
			} else {
				returnNode = body;
			}

			if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
				/*
					AdoptNode() is not used because internal state is not reset
					(e.g. the past names map of a HTMLFormElement), this is safe
					in theory but we would rather not risk another attack vector.
					The state that is cloned by importNode() is explicitly defined
					by the specs.
				*/
				returnNode = importNode.call(originalDocument, returnNode, true);
			}

			return returnNode;
		}

		let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
		/* Serialize doctype if allowed */

		if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
			serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
		}
		/* Sanitize final string template-safe */


		if (SAFE_FOR_TEMPLATES) {
			serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR, ' ');
			serializedHTML = stringReplace(serializedHTML, ERB_EXPR, ' ');
			serializedHTML = stringReplace(serializedHTML, TMPLIT_EXPR, ' ');
		}

		return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
	};
	/**
	 * Public method to set the configuration once
	 * setConfig
	 *
	 * @param {Object} cfg configuration object
	 */


	DOMPurify.setConfig = function (cfg) {
		_parseConfig(cfg);

		SET_CONFIG = true;
	};
	/**
	 * Public method to remove the configuration
	 * clearConfig
	 *
	 */


	DOMPurify.clearConfig = function () {
		CONFIG = null;
		SET_CONFIG = false;
	};
	/**
	 * Public method to check if an attribute value is valid.
	 * Uses last set config, if any. Otherwise, uses config defaults.
	 * isValidAttribute
	 *
	 * @param  {string} tag Tag name of containing element.
	 * @param  {string} attr Attribute name.
	 * @param  {string} value Attribute value.
	 * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
	 */


	DOMPurify.isValidAttribute = function (tag, attr, value) {
		/* Initialize shared config vars if necessary. */
		if (!CONFIG) {
			_parseConfig({});
		}

		const lcTag = transformCaseFunc(tag);
		const lcName = transformCaseFunc(attr);
		return _isValidAttribute(lcTag, lcName, value);
	};
	/**
	 * AddHook
	 * Public method to add DOMPurify hooks
	 *
	 * @param {String} entryPoint entry point for the hook to add
	 * @param {Function} hookFunction function to execute
	 */


	DOMPurify.addHook = function (entryPoint, hookFunction) {
		if (typeof hookFunction !== 'function') {
			return;
		}

		hooks[entryPoint] = hooks[entryPoint] || [];
		arrayPush(hooks[entryPoint], hookFunction);
	};
	/**
	 * RemoveHook
	 * Public method to remove a DOMPurify hook at a given entryPoint
	 * (pops it from the stack of hooks if more are present)
	 *
	 * @param {String} entryPoint entry point for the hook to remove
	 * @return {Function} removed(popped) hook
	 */


	DOMPurify.removeHook = function (entryPoint) {
		if (hooks[entryPoint]) {
			return arrayPop(hooks[entryPoint]);
		}
	};
	/**
	 * RemoveHooks
	 * Public method to remove all DOMPurify hooks at a given entryPoint
	 *
	 * @param  {String} entryPoint entry point for the hooks to remove
	 */


	DOMPurify.removeHooks = function (entryPoint) {
		if (hooks[entryPoint]) {
			hooks[entryPoint] = [];
		}
	};
	/**
	 * RemoveAllHooks
	 * Public method to remove all DOMPurify hooks
	 *
	 */


	DOMPurify.removeAllHooks = function () {
		hooks = {};
	};

	return DOMPurify;
}

var purify = createDOMPurify();

// ESM-comment-begin
define("vs/base/browser/dompurify/dompurify", function () { return purify; });
// ESM-comment-end

// ESM-uncomment-begin
// export default purify;
// export const version = purify.version;
// export const isSupported = purify.isSupported;
// export const sanitize = purify.sanitize;
// export const setConfig = purify.setConfig;
// export const clearConfig = purify.clearConfig;
// export const isValidAttribute = purify.isValidAttribute;
// export const addHook = purify.addHook;
// export const removeHook = purify.removeHook;
// export const removeHooks = purify.removeHooks;
// export const removeAllHooks = purify.removeAllHooks;
// ESM-uncomment-end

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[135/*vs/base/browser/fastDomNode*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFastDomNode = exports.FastDomNode = void 0;
    class FastDomNode {
        constructor(domNode) {
            this.domNode = domNode;
            this._maxWidth = '';
            this._width = '';
            this._height = '';
            this._top = '';
            this._left = '';
            this._bottom = '';
            this._right = '';
            this._paddingTop = '';
            this._paddingLeft = '';
            this._paddingBottom = '';
            this._paddingRight = '';
            this._fontFamily = '';
            this._fontWeight = '';
            this._fontSize = '';
            this._fontStyle = '';
            this._fontFeatureSettings = '';
            this._fontVariationSettings = '';
            this._textDecoration = '';
            this._lineHeight = '';
            this._letterSpacing = '';
            this._className = '';
            this._display = '';
            this._position = '';
            this._visibility = '';
            this._color = '';
            this._backgroundColor = '';
            this._layerHint = false;
            this._contain = 'none';
            this._boxShadow = '';
        }
        setMaxWidth(_maxWidth) {
            const maxWidth = numberAsPixels(_maxWidth);
            if (this._maxWidth === maxWidth) {
                return;
            }
            this._maxWidth = maxWidth;
            this.domNode.style.maxWidth = this._maxWidth;
        }
        setWidth(_width) {
            const width = numberAsPixels(_width);
            if (this._width === width) {
                return;
            }
            this._width = width;
            this.domNode.style.width = this._width;
        }
        setHeight(_height) {
            const height = numberAsPixels(_height);
            if (this._height === height) {
                return;
            }
            this._height = height;
            this.domNode.style.height = this._height;
        }
        setTop(_top) {
            const top = numberAsPixels(_top);
            if (this._top === top) {
                return;
            }
            this._top = top;
            this.domNode.style.top = this._top;
        }
        setLeft(_left) {
            const left = numberAsPixels(_left);
            if (this._left === left) {
                return;
            }
            this._left = left;
            this.domNode.style.left = this._left;
        }
        setBottom(_bottom) {
            const bottom = numberAsPixels(_bottom);
            if (this._bottom === bottom) {
                return;
            }
            this._bottom = bottom;
            this.domNode.style.bottom = this._bottom;
        }
        setRight(_right) {
            const right = numberAsPixels(_right);
            if (this._right === right) {
                return;
            }
            this._right = right;
            this.domNode.style.right = this._right;
        }
        setPaddingTop(_paddingTop) {
            const paddingTop = numberAsPixels(_paddingTop);
            if (this._paddingTop === paddingTop) {
                return;
            }
            this._paddingTop = paddingTop;
            this.domNode.style.paddingTop = this._paddingTop;
        }
        setPaddingLeft(_paddingLeft) {
            const paddingLeft = numberAsPixels(_paddingLeft);
            if (this._paddingLeft === paddingLeft) {
                return;
            }
            this._paddingLeft = paddingLeft;
            this.domNode.style.paddingLeft = this._paddingLeft;
        }
        setPaddingBottom(_paddingBottom) {
            const paddingBottom = numberAsPixels(_paddingBottom);
            if (this._paddingBottom === paddingBottom) {
                return;
            }
            this._paddingBottom = paddingBottom;
            this.domNode.style.paddingBottom = this._paddingBottom;
        }
        setPaddingRight(_paddingRight) {
            const paddingRight = numberAsPixels(_paddingRight);
            if (this._paddingRight === paddingRight) {
                return;
            }
            this._paddingRight = paddingRight;
            this.domNode.style.paddingRight = this._paddingRight;
        }
        setFontFamily(fontFamily) {
            if (this._fontFamily === fontFamily) {
                return;
            }
            this._fontFamily = fontFamily;
            this.domNode.style.fontFamily = this._fontFamily;
        }
        setFontWeight(fontWeight) {
            if (this._fontWeight === fontWeight) {
                return;
            }
            this._fontWeight = fontWeight;
            this.domNode.style.fontWeight = this._fontWeight;
        }
        setFontSize(_fontSize) {
            const fontSize = numberAsPixels(_fontSize);
            if (this._fontSize === fontSize) {
                return;
            }
            this._fontSize = fontSize;
            this.domNode.style.fontSize = this._fontSize;
        }
        setFontStyle(fontStyle) {
            if (this._fontStyle === fontStyle) {
                return;
            }
            this._fontStyle = fontStyle;
            this.domNode.style.fontStyle = this._fontStyle;
        }
        setFontFeatureSettings(fontFeatureSettings) {
            if (this._fontFeatureSettings === fontFeatureSettings) {
                return;
            }
            this._fontFeatureSettings = fontFeatureSettings;
            this.domNode.style.fontFeatureSettings = this._fontFeatureSettings;
        }
        setFontVariationSettings(fontVariationSettings) {
            if (this._fontVariationSettings === fontVariationSettings) {
                return;
            }
            this._fontVariationSettings = fontVariationSettings;
            this.domNode.style.fontVariationSettings = this._fontVariationSettings;
        }
        setTextDecoration(textDecoration) {
            if (this._textDecoration === textDecoration) {
                return;
            }
            this._textDecoration = textDecoration;
            this.domNode.style.textDecoration = this._textDecoration;
        }
        setLineHeight(_lineHeight) {
            const lineHeight = numberAsPixels(_lineHeight);
            if (this._lineHeight === lineHeight) {
                return;
            }
            this._lineHeight = lineHeight;
            this.domNode.style.lineHeight = this._lineHeight;
        }
        setLetterSpacing(_letterSpacing) {
            const letterSpacing = numberAsPixels(_letterSpacing);
            if (this._letterSpacing === letterSpacing) {
                return;
            }
            this._letterSpacing = letterSpacing;
            this.domNode.style.letterSpacing = this._letterSpacing;
        }
        setClassName(className) {
            if (this._className === className) {
                return;
            }
            this._className = className;
            this.domNode.className = this._className;
        }
        toggleClassName(className, shouldHaveIt) {
            this.domNode.classList.toggle(className, shouldHaveIt);
            this._className = this.domNode.className;
        }
        setDisplay(display) {
            if (this._display === display) {
                return;
            }
            this._display = display;
            this.domNode.style.display = this._display;
        }
        setPosition(position) {
            if (this._position === position) {
                return;
            }
            this._position = position;
            this.domNode.style.position = this._position;
        }
        setVisibility(visibility) {
            if (this._visibility === visibility) {
                return;
            }
            this._visibility = visibility;
            this.domNode.style.visibility = this._visibility;
        }
        setColor(color) {
            if (this._color === color) {
                return;
            }
            this._color = color;
            this.domNode.style.color = this._color;
        }
        setBackgroundColor(backgroundColor) {
            if (this._backgroundColor === backgroundColor) {
                return;
            }
            this._backgroundColor = backgroundColor;
            this.domNode.style.backgroundColor = this._backgroundColor;
        }
        setLayerHinting(layerHint) {
            if (this._layerHint === layerHint) {
                return;
            }
            this._layerHint = layerHint;
            this.domNode.style.transform = this._layerHint ? 'translate3d(0px, 0px, 0px)' : '';
        }
        setBoxShadow(boxShadow) {
            if (this._boxShadow === boxShadow) {
                return;
            }
            this._boxShadow = boxShadow;
            this.domNode.style.boxShadow = boxShadow;
        }
        setContain(contain) {
            if (this._contain === contain) {
                return;
            }
            this._contain = contain;
            this.domNode.style.contain = this._contain;
        }
        setAttribute(name, value) {
            this.domNode.setAttribute(name, value);
        }
        removeAttribute(name) {
            this.domNode.removeAttribute(name);
        }
        appendChild(child) {
            this.domNode.appendChild(child.domNode);
        }
        removeChild(child) {
            this.domNode.removeChild(child.domNode);
        }
    }
    exports.FastDomNode = FastDomNode;
    function numberAsPixels(value) {
        return (typeof value === 'number' ? `${value}px` : value);
    }
    function createFastDomNode(domNode) {
        return new FastDomNode(domNode);
    }
    exports.createFastDomNode = createFastDomNode;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[630/*vs/base/browser/iframe*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parentOriginHash = exports.IframeUtils = void 0;
    const sameOriginWindowChainCache = new WeakMap();
    function getParentWindowIfSameOrigin(w) {
        if (!w.parent || w.parent === w) {
            return null;
        }
        // Cannot really tell if we have access to the parent window unless we try to access something in it
        try {
            const location = w.location;
            const parentLocation = w.parent.location;
            if (location.origin !== 'null' && parentLocation.origin !== 'null' && location.origin !== parentLocation.origin) {
                return null;
            }
        }
        catch (e) {
            return null;
        }
        return w.parent;
    }
    class IframeUtils {
        /**
         * Returns a chain of embedded windows with the same origin (which can be accessed programmatically).
         * Having a chain of length 1 might mean that the current execution environment is running outside of an iframe or inside an iframe embedded in a window with a different origin.
         */
        static getSameOriginWindowChain(targetWindow) {
            let windowChainCache = sameOriginWindowChainCache.get(targetWindow);
            if (!windowChainCache) {
                windowChainCache = [];
                sameOriginWindowChainCache.set(targetWindow, windowChainCache);
                let w = targetWindow;
                let parent;
                do {
                    parent = getParentWindowIfSameOrigin(w);
                    if (parent) {
                        windowChainCache.push({
                            window: new WeakRef(w),
                            iframeElement: w.frameElement || null
                        });
                    }
                    else {
                        windowChainCache.push({
                            window: new WeakRef(w),
                            iframeElement: null
                        });
                    }
                    w = parent;
                } while (w);
            }
            return windowChainCache.slice(0);
        }
        /**
         * Returns the position of `childWindow` relative to `ancestorWindow`
         */
        static getPositionOfChildWindowRelativeToAncestorWindow(childWindow, ancestorWindow) {
            if (!ancestorWindow || childWindow === ancestorWindow) {
                return {
                    top: 0,
                    left: 0
                };
            }
            let top = 0, left = 0;
            const windowChain = this.getSameOriginWindowChain(childWindow);
            for (const windowChainEl of windowChain) {
                const windowInChain = windowChainEl.window.deref();
                top += windowInChain?.scrollY ?? 0;
                left += windowInChain?.scrollX ?? 0;
                if (windowInChain === ancestorWindow) {
                    break;
                }
                if (!windowChainEl.iframeElement) {
                    break;
                }
                const boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
                top += boundingRect.top;
                left += boundingRect.left;
            }
            return {
                top: top,
                left: left
            };
        }
    }
    exports.IframeUtils = IframeUtils;
    /**
     * Returns a sha-256 composed of `parentOrigin` and `salt` converted to base 32
     */
    async function parentOriginHash(parentOrigin, salt) {
        // This same code is also inlined at `src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html`
        if (!crypto.subtle) {
            throw new Error(`'crypto.subtle' is not available so webviews will not work. This is likely because the editor is not running in a secure context (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).`);
        }
        const strData = JSON.stringify({ parentOrigin, salt });
        const encoder = new TextEncoder();
        const arrData = encoder.encode(strData);
        const hash = await crypto.subtle.digest('sha-256', arrData);
        return sha256AsBase32(hash);
    }
    exports.parentOriginHash = parentOriginHash;
    function sha256AsBase32(bytes) {
        const array = Array.from(new Uint8Array(bytes));
        const hexArray = array.map(b => b.toString(16).padStart(2, '0')).join('');
        // sha256 has 256 bits, so we need at most ceil(lg(2^256-1)/lg(32)) = 52 chars to represent it in base 32
        return BigInt(`0x${hexArray}`).toString(32).padStart(52, '0');
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[631/*vs/base/browser/performance*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inputLatency = void 0;
    var inputLatency;
    (function (inputLatency) {
        const totalKeydownTime = { total: 0, min: Number.MAX_VALUE, max: 0 };
        const totalInputTime = { ...totalKeydownTime };
        const totalRenderTime = { ...totalKeydownTime };
        const totalInputLatencyTime = { ...totalKeydownTime };
        let measurementsCount = 0;
        // The state of each event, this helps ensure the integrity of the measurement and that
        // something unexpected didn't happen that could skew the measurement.
        let EventPhase;
        (function (EventPhase) {
            EventPhase[EventPhase["Before"] = 0] = "Before";
            EventPhase[EventPhase["InProgress"] = 1] = "InProgress";
            EventPhase[EventPhase["Finished"] = 2] = "Finished";
        })(EventPhase || (EventPhase = {}));
        const state = {
            keydown: 0 /* EventPhase.Before */,
            input: 0 /* EventPhase.Before */,
            render: 0 /* EventPhase.Before */,
        };
        /**
         * Record the start of the keydown event.
         */
        function onKeyDown() {
            /** Direct Check C. See explanation in {@link recordIfFinished} */
            recordIfFinished();
            performance.mark('inputlatency/start');
            performance.mark('keydown/start');
            state.keydown = 1 /* EventPhase.InProgress */;
            queueMicrotask(markKeyDownEnd);
        }
        inputLatency.onKeyDown = onKeyDown;
        /**
         * Mark the end of the keydown event.
         */
        function markKeyDownEnd() {
            if (state.keydown === 1 /* EventPhase.InProgress */) {
                performance.mark('keydown/end');
                state.keydown = 2 /* EventPhase.Finished */;
            }
        }
        /**
         * Record the start of the beforeinput event.
         */
        function onBeforeInput() {
            performance.mark('input/start');
            state.input = 1 /* EventPhase.InProgress */;
            /** Schedule Task A. See explanation in {@link recordIfFinished} */
            scheduleRecordIfFinishedTask();
        }
        inputLatency.onBeforeInput = onBeforeInput;
        /**
         * Record the start of the input event.
         */
        function onInput() {
            if (state.input === 0 /* EventPhase.Before */) {
                // it looks like we didn't receive a `beforeinput`
                onBeforeInput();
            }
            queueMicrotask(markInputEnd);
        }
        inputLatency.onInput = onInput;
        function markInputEnd() {
            if (state.input === 1 /* EventPhase.InProgress */) {
                performance.mark('input/end');
                state.input = 2 /* EventPhase.Finished */;
            }
        }
        /**
         * Record the start of the keyup event.
         */
        function onKeyUp() {
            /** Direct Check D. See explanation in {@link recordIfFinished} */
            recordIfFinished();
        }
        inputLatency.onKeyUp = onKeyUp;
        /**
         * Record the start of the selectionchange event.
         */
        function onSelectionChange() {
            /** Direct Check E. See explanation in {@link recordIfFinished} */
            recordIfFinished();
        }
        inputLatency.onSelectionChange = onSelectionChange;
        /**
         * Record the start of the animation frame performing the rendering.
         */
        function onRenderStart() {
            // Render may be triggered during input, but we only measure the following animation frame
            if (state.keydown === 2 /* EventPhase.Finished */ && state.input === 2 /* EventPhase.Finished */ && state.render === 0 /* EventPhase.Before */) {
                // Only measure the first render after keyboard input
                performance.mark('render/start');
                state.render = 1 /* EventPhase.InProgress */;
                queueMicrotask(markRenderEnd);
                /** Schedule Task B. See explanation in {@link recordIfFinished} */
                scheduleRecordIfFinishedTask();
            }
        }
        inputLatency.onRenderStart = onRenderStart;
        /**
         * Mark the end of the animation frame performing the rendering.
         */
        function markRenderEnd() {
            if (state.render === 1 /* EventPhase.InProgress */) {
                performance.mark('render/end');
                state.render = 2 /* EventPhase.Finished */;
            }
        }
        function scheduleRecordIfFinishedTask() {
            // Here we can safely assume that the `setTimeout` will not be
            // artificially delayed by 4ms because we schedule it from
            // event handlers
            setTimeout(recordIfFinished);
        }
        /**
         * Record the input latency sample if input handling and rendering are finished.
         *
         * The challenge here is that we want to record the latency in such a way that it includes
         * also the layout and painting work the browser does during the animation frame task.
         *
         * Simply scheduling a new task (via `setTimeout`) from the animation frame task would
         * schedule the new task at the end of the task queue (after other code that uses `setTimeout`),
         * so we need to use multiple strategies to make sure our task runs before others:
         *
         * We schedule tasks (A and B):
         *    - we schedule a task A (via a `setTimeout` call) when the input starts in `markInputStart`.
         *      If the animation frame task is scheduled quickly by the browser, then task A has a very good
         *      chance of being the very first task after the animation frame and thus will record the input latency.
         *    - however, if the animation frame task is scheduled a bit later, then task A might execute
         *      before the animation frame task. We therefore schedule another task B from `markRenderStart`.
         *
         * We do direct checks in browser event handlers (C, D, E):
         *    - if the browser has multiple keydown events queued up, they will be scheduled before the `setTimeout` tasks,
         *      so we do a direct check in the keydown event handler (C).
         *    - depending on timing, sometimes the animation frame is scheduled even before the `keyup` event, so we
         *      do a direct check there too (E).
         *    - the browser oftentimes emits a `selectionchange` event after an `input`, so we do a direct check there (D).
         */
        function recordIfFinished() {
            if (state.keydown === 2 /* EventPhase.Finished */ && state.input === 2 /* EventPhase.Finished */ && state.render === 2 /* EventPhase.Finished */) {
                performance.mark('inputlatency/end');
                performance.measure('keydown', 'keydown/start', 'keydown/end');
                performance.measure('input', 'input/start', 'input/end');
                performance.measure('render', 'render/start', 'render/end');
                performance.measure('inputlatency', 'inputlatency/start', 'inputlatency/end');
                addMeasure('keydown', totalKeydownTime);
                addMeasure('input', totalInputTime);
                addMeasure('render', totalRenderTime);
                addMeasure('inputlatency', totalInputLatencyTime);
                // console.info(
                // 	`input latency=${performance.getEntriesByName('inputlatency')[0].duration.toFixed(1)} [` +
                // 	`keydown=${performance.getEntriesByName('keydown')[0].duration.toFixed(1)}, ` +
                // 	`input=${performance.getEntriesByName('input')[0].duration.toFixed(1)}, ` +
                // 	`render=${performance.getEntriesByName('render')[0].duration.toFixed(1)}` +
                // 	`]`
                // );
                measurementsCount++;
                reset();
            }
        }
        function addMeasure(entryName, cumulativeMeasurement) {
            const duration = performance.getEntriesByName(entryName)[0].duration;
            cumulativeMeasurement.total += duration;
            cumulativeMeasurement.min = Math.min(cumulativeMeasurement.min, duration);
            cumulativeMeasurement.max = Math.max(cumulativeMeasurement.max, duration);
        }
        /**
         * Clear the current sample.
         */
        function reset() {
            performance.clearMarks('keydown/start');
            performance.clearMarks('keydown/end');
            performance.clearMarks('input/start');
            performance.clearMarks('input/end');
            performance.clearMarks('render/start');
            performance.clearMarks('render/end');
            performance.clearMarks('inputlatency/start');
            performance.clearMarks('inputlatency/end');
            performance.clearMeasures('keydown');
            performance.clearMeasures('input');
            performance.clearMeasures('render');
            performance.clearMeasures('inputlatency');
            state.keydown = 0 /* EventPhase.Before */;
            state.input = 0 /* EventPhase.Before */;
            state.render = 0 /* EventPhase.Before */;
        }
        /**
         * Gets all input latency samples and clears the internal buffers to start recording a new set
         * of samples.
         */
        function getAndClearMeasurements() {
            if (measurementsCount === 0) {
                return undefined;
            }
            // Assemble the result
            const result = {
                keydown: cumulativeToFinalMeasurement(totalKeydownTime),
                input: cumulativeToFinalMeasurement(totalInputTime),
                render: cumulativeToFinalMeasurement(totalRenderTime),
                total: cumulativeToFinalMeasurement(totalInputLatencyTime),
                sampleCount: measurementsCount
            };
            // Clear the cumulative measurements
            clearCumulativeMeasurement(totalKeydownTime);
            clearCumulativeMeasurement(totalInputTime);
            clearCumulativeMeasurement(totalRenderTime);
            clearCumulativeMeasurement(totalInputLatencyTime);
            measurementsCount = 0;
            return result;
        }
        inputLatency.getAndClearMeasurements = getAndClearMeasurements;
        function cumulativeToFinalMeasurement(cumulative) {
            return {
                average: cumulative.total / measurementsCount,
                max: cumulative.max,
                min: cumulative.min,
            };
        }
        function clearCumulativeMeasurement(cumulative) {
            cumulative.total = 0;
            cumulative.min = Number.MAX_VALUE;
            cumulative.max = 0;
        }
    })(inputLatency || (exports.inputLatency = inputLatency = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[536/*vs/base/browser/ui/list/list*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedListVirtualDelegate = exports.ListError = exports.ListDragOverReactions = exports.ListDragOverEffectPosition = exports.ListDragOverEffectType = void 0;
    var ListDragOverEffectType;
    (function (ListDragOverEffectType) {
        ListDragOverEffectType[ListDragOverEffectType["Copy"] = 0] = "Copy";
        ListDragOverEffectType[ListDragOverEffectType["Move"] = 1] = "Move";
    })(ListDragOverEffectType || (exports.ListDragOverEffectType = ListDragOverEffectType = {}));
    var ListDragOverEffectPosition;
    (function (ListDragOverEffectPosition) {
        ListDragOverEffectPosition["Over"] = "drop-target";
        ListDragOverEffectPosition["Before"] = "drop-target-before";
        ListDragOverEffectPosition["After"] = "drop-target-after";
    })(ListDragOverEffectPosition || (exports.ListDragOverEffectPosition = ListDragOverEffectPosition = {}));
    exports.ListDragOverReactions = {
        reject() { return { accept: false }; },
        accept() { return { accept: true }; },
    };
    class ListError extends Error {
        constructor(user, message) {
            super(`ListError [${user}] ${message}`);
        }
    }
    exports.ListError = ListError;
    class CachedListVirtualDelegate {
        constructor() {
            this.cache = new WeakMap();
        }
        getHeight(element) {
            return this.cache.get(element) ?? this.estimateHeight(element);
        }
        setDynamicHeight(element, height) {
            if (height > 0) {
                this.cache.set(element, height);
            }
        }
    }
    exports.CachedListVirtualDelegate = CachedListVirtualDelegate;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[1189/*vs/base/browser/ui/list/splice*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CombinedSpliceable = void 0;
    class CombinedSpliceable {
        constructor(spliceables) {
            this.spliceables = spliceables;
        }
        splice(start, deleteCount, elements) {
            this.spliceables.forEach(s => s.splice(start, deleteCount, elements));
        }
    }
    exports.CombinedSpliceable = CombinedSpliceable;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[632/*vs/base/browser/ui/scrollbar/scrollbarState*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScrollbarState = void 0;
    /**
     * The minimal size of the slider (such that it can still be clickable) -- it is artificially enlarged.
     */
    const MINIMUM_SLIDER_SIZE = 20;
    class ScrollbarState {
        constructor(arrowSize, scrollbarSize, oppositeScrollbarSize, visibleSize, scrollSize, scrollPosition) {
            this._scrollbarSize = Math.round(scrollbarSize);
            this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
            this._arrowSize = Math.round(arrowSize);
            this._visibleSize = visibleSize;
            this._scrollSize = scrollSize;
            this._scrollPosition = scrollPosition;
            this._computedAvailableSize = 0;
            this._computedIsNeeded = false;
            this._computedSliderSize = 0;
            this._computedSliderRatio = 0;
            this._computedSliderPosition = 0;
            this._refreshComputedValues();
        }
        clone() {
            return new ScrollbarState(this._arrowSize, this._scrollbarSize, this._oppositeScrollbarSize, this._visibleSize, this._scrollSize, this._scrollPosition);
        }
        setVisibleSize(visibleSize) {
            const iVisibleSize = Math.round(visibleSize);
            if (this._visibleSize !== iVisibleSize) {
                this._visibleSize = iVisibleSize;
                this._refreshComputedValues();
                return true;
            }
            return false;
        }
        setScrollSize(scrollSize) {
            const iScrollSize = Math.round(scrollSize);
            if (this._scrollSize !== iScrollSize) {
                this._scrollSize = iScrollSize;
                this._refreshComputedValues();
                return true;
            }
            return false;
        }
        setScrollPosition(scrollPosition) {
            const iScrollPosition = Math.round(scrollPosition);
            if (this._scrollPosition !== iScrollPosition) {
                this._scrollPosition = iScrollPosition;
                this._refreshComputedValues();
                return true;
            }
            return false;
        }
        setScrollbarSize(scrollbarSize) {
            this._scrollbarSize = Math.round(scrollbarSize);
        }
        setOppositeScrollbarSize(oppositeScrollbarSize) {
            this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
        }
        static _computeValues(oppositeScrollbarSize, arrowSize, visibleSize, scrollSize, scrollPosition) {
            const computedAvailableSize = Math.max(0, visibleSize - oppositeScrollbarSize);
            const computedRepresentableSize = Math.max(0, computedAvailableSize - 2 * arrowSize);
            const computedIsNeeded = (scrollSize > 0 && scrollSize > visibleSize);
            if (!computedIsNeeded) {
                // There is no need for a slider
                return {
                    computedAvailableSize: Math.round(computedAvailableSize),
                    computedIsNeeded: computedIsNeeded,
                    computedSliderSize: Math.round(computedRepresentableSize),
                    computedSliderRatio: 0,
                    computedSliderPosition: 0,
                };
            }
            // We must artificially increase the size of the slider if needed, since the slider would be too small to grab with the mouse otherwise
            const computedSliderSize = Math.round(Math.max(MINIMUM_SLIDER_SIZE, Math.floor(visibleSize * computedRepresentableSize / scrollSize)));
            // The slider can move from 0 to `computedRepresentableSize` - `computedSliderSize`
            // in the same way `scrollPosition` can move from 0 to `scrollSize` - `visibleSize`.
            const computedSliderRatio = (computedRepresentableSize - computedSliderSize) / (scrollSize - visibleSize);
            const computedSliderPosition = (scrollPosition * computedSliderRatio);
            return {
                computedAvailableSize: Math.round(computedAvailableSize),
                computedIsNeeded: computedIsNeeded,
                computedSliderSize: Math.round(computedSliderSize),
                computedSliderRatio: computedSliderRatio,
                computedSliderPosition: Math.round(computedSliderPosition),
            };
        }
        _refreshComputedValues() {
            const r = ScrollbarState._computeValues(this._oppositeScrollbarSize, this._arrowSize, this._visibleSize, this._scrollSize, this._scrollPosition);
            this._computedAvailableSize = r.computedAvailableSize;
            this._computedIsNeeded = r.computedIsNeeded;
            this._computedSliderSize = r.computedSliderSize;
            this._computedSliderRatio = r.computedSliderRatio;
            this._computedSliderPosition = r.computedSliderPosition;
        }
        getArrowSize() {
            return this._arrowSize;
        }
        getScrollPosition() {
            return this._scrollPosition;
        }
        getRectangleLargeSize() {
            return this._computedAvailableSize;
        }
        getRectangleSmallSize() {
            return this._scrollbarSize;
        }
        isNeeded() {
            return this._computedIsNeeded;
        }
        getSliderSize() {
            return this._computedSliderSize;
        }
        getSliderPosition() {
            return this._computedSliderPosition;
        }
        /**
         * Compute a desired `scrollPosition` such that `offset` ends up in the center of the slider.
         * `offset` is based on the same coordinate system as the `sliderPosition`.
         */
        getDesiredScrollPositionFromOffset(offset) {
            if (!this._computedIsNeeded) {
                // no need for a slider
                return 0;
            }
            const desiredSliderPosition = offset - this._arrowSize - this._computedSliderSize / 2;
            return Math.round(desiredSliderPosition / this._computedSliderRatio);
        }
        /**
         * Compute a desired `scrollPosition` from if offset is before or after the slider position.
         * If offset is before slider, treat as a page up (or left).  If after, page down (or right).
         * `offset` and `_computedSliderPosition` are based on the same coordinate system.
         * `_visibleSize` corresponds to a "page" of lines in the returned coordinate system.
         */
        getDesiredScrollPositionFromOffsetPaged(offset) {
            if (!this._computedIsNeeded) {
                // no need for a slider
                return 0;
            }
            const correctedOffset = offset - this._arrowSize; // compensate if has arrows
            let desiredScrollPosition = this._scrollPosition;
            if (correctedOffset < this._computedSliderPosition) {
                desiredScrollPosition -= this._visibleSize; // page up/left
            }
            else {
                desiredScrollPosition += this._visibleSize; // page down/right
            }
            return desiredScrollPosition;
        }
        /**
         * Compute a desired `scrollPosition` such that the slider moves by `delta`.
         */
        getDesiredScrollPositionFromDelta(delta) {
            if (!this._computedIsNeeded) {
                // no need for a slider
                return 0;
            }
            const desiredSliderPosition = this._computedSliderPosition + delta;
            return Math.round(desiredSliderPosition / this._computedSliderRatio);
        }
    }
    exports.ScrollbarState = ScrollbarState;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[290/*vs/base/browser/ui/tree/tree*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WeakMapper = exports.TreeError = exports.TreeDragOverReactions = exports.TreeDragOverBubble = exports.TreeMouseEventTarget = exports.ObjectTreeElementCollapseState = exports.TreeVisibility = void 0;
    var TreeVisibility;
    (function (TreeVisibility) {
        /**
         * The tree node should be hidden.
         */
        TreeVisibility[TreeVisibility["Hidden"] = 0] = "Hidden";
        /**
         * The tree node should be visible.
         */
        TreeVisibility[TreeVisibility["Visible"] = 1] = "Visible";
        /**
         * The tree node should be visible if any of its descendants is visible.
         */
        TreeVisibility[TreeVisibility["Recurse"] = 2] = "Recurse";
    })(TreeVisibility || (exports.TreeVisibility = TreeVisibility = {}));
    var ObjectTreeElementCollapseState;
    (function (ObjectTreeElementCollapseState) {
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Expanded"] = 0] = "Expanded";
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Collapsed"] = 1] = "Collapsed";
        /**
         * If the element is already in the tree, preserve its current state. Else, expand it.
         */
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrExpanded"] = 2] = "PreserveOrExpanded";
        /**
         * If the element is already in the tree, preserve its current state. Else, collapse it.
         */
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrCollapsed"] = 3] = "PreserveOrCollapsed";
    })(ObjectTreeElementCollapseState || (exports.ObjectTreeElementCollapseState = ObjectTreeElementCollapseState = {}));
    var TreeMouseEventTarget;
    (function (TreeMouseEventTarget) {
        TreeMouseEventTarget[TreeMouseEventTarget["Unknown"] = 0] = "Unknown";
        TreeMouseEventTarget[TreeMouseEventTarget["Twistie"] = 1] = "Twistie";
        TreeMouseEventTarget[TreeMouseEventTarget["Element"] = 2] = "Element";
        TreeMouseEventTarget[TreeMouseEventTarget["Filter"] = 3] = "Filter";
    })(TreeMouseEventTarget || (exports.TreeMouseEventTarget = TreeMouseEventTarget = {}));
    var TreeDragOverBubble;
    (function (TreeDragOverBubble) {
        TreeDragOverBubble[TreeDragOverBubble["Down"] = 0] = "Down";
        TreeDragOverBubble[TreeDragOverBubble["Up"] = 1] = "Up";
    })(TreeDragOverBubble || (exports.TreeDragOverBubble = TreeDragOverBubble = {}));
    exports.TreeDragOverReactions = {
        acceptBubbleUp() { return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */ }; },
        acceptBubbleDown(autoExpand = false) { return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, autoExpand }; },
        acceptCopyBubbleUp() { return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */, effect: { type: 0 /* ListDragOverEffectType.Copy */, position: "drop-target" /* ListDragOverEffectPosition.Over */ } }; },
        acceptCopyBubbleDown(autoExpand = false) { return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect: { type: 0 /* ListDragOverEffectType.Copy */, position: "drop-target" /* ListDragOverEffectPosition.Over */ }, autoExpand }; }
    };
    class TreeError extends Error {
        constructor(user, message) {
            super(`TreeError [${user}] ${message}`);
        }
    }
    exports.TreeError = TreeError;
    class WeakMapper {
        constructor(fn) {
            this.fn = fn;
            this._map = new WeakMap();
        }
        map(key) {
            let result = this._map.get(key);
            if (!result) {
                result = this.fn(key);
                this._map.set(key, result);
            }
            return result;
        }
    }
    exports.WeakMapper = WeakMapper;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[66/*vs/base/browser/window*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAuxiliaryWindow = exports.$window = exports.mainWindow = exports.ensureCodeWindow = void 0;
    function ensureCodeWindow(targetWindow, fallbackWindowId) {
        const codeWindow = targetWindow;
        if (typeof codeWindow.vscodeWindowId !== 'number') {
            Object.defineProperty(codeWindow, 'vscodeWindowId', {
                get: () => fallbackWindowId
            });
        }
    }
    exports.ensureCodeWindow = ensureCodeWindow;
    // eslint-disable-next-line no-restricted-globals
    exports.mainWindow = window;
    /**
     * @deprecated to support multi-window scenarios, use `DOM.mainWindow`
     * if you target the main global window or use helpers such as `DOM.getWindow()`
     * or `DOM.getActiveWindow()` to obtain the correct window for the context you are in.
     */
    exports.$window = exports.mainWindow;
    function isAuxiliaryWindow(obj) {
        if (obj === exports.mainWindow) {
            return false;
        }
        const candidate = obj;
        return typeof candidate?.vscodeWindowId === 'number';
    }
    exports.isAuxiliaryWindow = isAuxiliaryWindow;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[823/*vs/base/common/amd*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoaderStats = exports.isESM = void 0;
    // ESM-comment-begin
    exports.isESM = false;
    // ESM-comment-end
    // ESM-uncomment-begin
    // export const isESM = true;
    // ESM-uncomment-end
    class LoaderStats {
        static get() {
            const amdLoadScript = new Map();
            const amdInvokeFactory = new Map();
            const nodeRequire = new Map();
            const nodeEval = new Map();
            function mark(map, stat) {
                if (map.has(stat.detail)) {
                    // console.warn('BAD events, DOUBLE start', stat);
                    // map.delete(stat.detail);
                    return;
                }
                map.set(stat.detail, -stat.timestamp);
            }
            function diff(map, stat) {
                const duration = map.get(stat.detail);
                if (!duration) {
                    // console.warn('BAD events, end WITHOUT start', stat);
                    // map.delete(stat.detail);
                    return;
                }
                if (duration >= 0) {
                    // console.warn('BAD events, DOUBLE end', stat);
                    // map.delete(stat.detail);
                    return;
                }
                map.set(stat.detail, duration + stat.timestamp);
            }
            let stats = [];
            if (typeof require === 'function' && typeof require.getStats === 'function') {
                stats = require.getStats().slice(0).sort((a, b) => a.timestamp - b.timestamp);
            }
            for (const stat of stats) {
                switch (stat.type) {
                    case 10 /* LoaderEventType.BeginLoadingScript */:
                        mark(amdLoadScript, stat);
                        break;
                    case 11 /* LoaderEventType.EndLoadingScriptOK */:
                    case 12 /* LoaderEventType.EndLoadingScriptError */:
                        diff(amdLoadScript, stat);
                        break;
                    case 21 /* LoaderEventType.BeginInvokeFactory */:
                        mark(amdInvokeFactory, stat);
                        break;
                    case 22 /* LoaderEventType.EndInvokeFactory */:
                        diff(amdInvokeFactory, stat);
                        break;
                    case 33 /* LoaderEventType.NodeBeginNativeRequire */:
                        mark(nodeRequire, stat);
                        break;
                    case 34 /* LoaderEventType.NodeEndNativeRequire */:
                        diff(nodeRequire, stat);
                        break;
                    case 31 /* LoaderEventType.NodeBeginEvaluatingScript */:
                        mark(nodeEval, stat);
                        break;
                    case 32 /* LoaderEventType.NodeEndEvaluatingScript */:
                        diff(nodeEval, stat);
                        break;
                }
            }
            let nodeRequireTotal = 0;
            nodeRequire.forEach(value => nodeRequireTotal += value);
            function to2dArray(map) {
                const res = [];
                map.forEach((value, index) => res.push([index, value]));
                return res;
            }
            return {
                amdLoad: to2dArray(amdLoadScript),
                amdInvoke: to2dArray(amdInvokeFactory),
                nodeRequire: to2dArray(nodeRequire),
                nodeEval: to2dArray(nodeEval),
                nodeRequireTotal
            };
        }
        static toMarkdownTable(header, rows) {
            let result = '';
            const lengths = [];
            header.forEach((cell, ci) => {
                lengths[ci] = cell.length;
            });
            rows.forEach(row => {
                row.forEach((cell, ci) => {
                    if (typeof cell === 'undefined') {
                        cell = row[ci] = '-';
                    }
                    const len = cell.toString().length;
                    lengths[ci] = Math.max(len, lengths[ci]);
                });
            });
            // header
            header.forEach((cell, ci) => { result += `| ${cell + ' '.repeat(lengths[ci] - cell.toString().length)} `; });
            result += '|\n';
            header.forEach((_cell, ci) => { result += `| ${'-'.repeat(lengths[ci])} `; });
            result += '|\n';
            // cells
            rows.forEach(row => {
                row.forEach((cell, ci) => {
                    if (typeof cell !== 'undefined') {
                        result += `| ${cell + ' '.repeat(lengths[ci] - cell.toString().length)} `;
                    }
                });
                result += '|\n';
            });
            return result;
        }
    }
    exports.LoaderStats = LoaderStats;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[158/*vs/base/common/arraysFind*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapFindFirst = exports.findMaxIdxBy = exports.findFirstMinBy = exports.findLastMaxBy = exports.findFirstMaxBy = exports.MonotonousArray = exports.findFirstIdxMonotonous = exports.findFirstIdxMonotonousOrArrLen = exports.findFirstMonotonous = exports.findLastIdxMonotonous = exports.findLastMonotonous = exports.findLastIdx = exports.findLast = void 0;
    function findLast(array, predicate, fromIdx) {
        const idx = findLastIdx(array, predicate);
        if (idx === -1) {
            return undefined;
        }
        return array[idx];
    }
    exports.findLast = findLast;
    function findLastIdx(array, predicate, fromIndex = array.length - 1) {
        for (let i = fromIndex; i >= 0; i--) {
            const element = array[i];
            if (predicate(element)) {
                return i;
            }
        }
        return -1;
    }
    exports.findLastIdx = findLastIdx;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `undefined` if no item matches, otherwise the last item that matches the predicate.
     */
    function findLastMonotonous(array, predicate) {
        const idx = findLastIdxMonotonous(array, predicate);
        return idx === -1 ? undefined : array[idx];
    }
    exports.findLastMonotonous = findLastMonotonous;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `startIdx - 1` if predicate is false for all items, otherwise the index of the last item that matches the predicate.
     */
    function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                i = k + 1;
            }
            else {
                j = k;
            }
        }
        return i - 1;
    }
    exports.findLastIdxMonotonous = findLastIdxMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `undefined` if no item matches, otherwise the first item that matches the predicate.
     */
    function findFirstMonotonous(array, predicate) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
        return idx === array.length ? undefined : array[idx];
    }
    exports.findFirstMonotonous = findFirstMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `endIdxEx` if predicate is false for all items, otherwise the index of the first item that matches the predicate.
     */
    function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                j = k;
            }
            else {
                i = k + 1;
            }
        }
        return i;
    }
    exports.findFirstIdxMonotonousOrArrLen = findFirstIdxMonotonousOrArrLen;
    function findFirstIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
        return idx === array.length ? -1 : idx;
    }
    exports.findFirstIdxMonotonous = findFirstIdxMonotonous;
    /**
     * Use this when
     * * You have a sorted array
     * * You query this array with a monotonous predicate to find the last item that has a certain property.
     * * You query this array multiple times with monotonous predicates that get weaker and weaker.
     */
    class MonotonousArray {
        static { this.assertInvariants = false; }
        constructor(_array) {
            this._array = _array;
            this._findLastMonotonousLastIdx = 0;
        }
        /**
         * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
         * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
         */
        findLastMonotonous(predicate) {
            if (MonotonousArray.assertInvariants) {
                if (this._prevFindLastPredicate) {
                    for (const item of this._array) {
                        if (this._prevFindLastPredicate(item) && !predicate(item)) {
                            throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
                        }
                    }
                }
                this._prevFindLastPredicate = predicate;
            }
            const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
            this._findLastMonotonousLastIdx = idx + 1;
            return idx === -1 ? undefined : this._array[idx];
        }
    }
    exports.MonotonousArray = MonotonousArray;
    /**
     * Returns the first item that is equal to or greater than every other item.
    */
    function findFirstMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) > 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findFirstMaxBy = findFirstMaxBy;
    /**
     * Returns the last item that is equal to or greater than every other item.
    */
    function findLastMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) >= 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findLastMaxBy = findLastMaxBy;
    /**
     * Returns the first item that is equal to or less than every other item.
    */
    function findFirstMinBy(array, comparator) {
        return findFirstMaxBy(array, (a, b) => -comparator(a, b));
    }
    exports.findFirstMinBy = findFirstMinBy;
    function findMaxIdxBy(array, comparator) {
        if (array.length === 0) {
            return -1;
        }
        let maxIdx = 0;
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, array[maxIdx]) > 0) {
                maxIdx = i;
            }
        }
        return maxIdx;
    }
    exports.findMaxIdxBy = findMaxIdxBy;
    /**
     * Returns the first mapped value of the array which is not undefined.
     */
    function mapFindFirst(items, mapFn) {
        for (const value of items) {
            const mapped = mapFn(value);
            if (mapped !== undefined) {
                return mapped;
            }
        }
        return undefined;
    }
    exports.mapFindFirst = mapFindFirst;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[342/*vs/base/common/collections*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intersection = exports.diffMaps = exports.diffSets = exports.groupBy = void 0;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function groupBy(data, groupFn) {
        const result = Object.create(null);
        for (const element of data) {
            const key = groupFn(element);
            let target = result[key];
            if (!target) {
                target = result[key] = [];
            }
            target.push(element);
        }
        return result;
    }
    exports.groupBy = groupBy;
    function diffSets(before, after) {
        const removed = [];
        const added = [];
        for (const element of before) {
            if (!after.has(element)) {
                removed.push(element);
            }
        }
        for (const element of after) {
            if (!before.has(element)) {
                added.push(element);
            }
        }
        return { removed, added };
    }
    exports.diffSets = diffSets;
    function diffMaps(before, after) {
        const removed = [];
        const added = [];
        for (const [index, value] of before) {
            if (!after.has(index)) {
                removed.push(value);
            }
        }
        for (const [index, value] of after) {
            if (!before.has(index)) {
                added.push(value);
            }
        }
        return { removed, added };
    }
    exports.diffMaps = diffMaps;
    /**
     * Computes the intersection of two sets.
     *
     * @param setA - The first set.
     * @param setB - The second iterable.
     * @returns A new set containing the elements that are in both `setA` and `setB`.
     */
    function intersection(setA, setB) {
        const result = new Set();
        for (const elem of setB) {
            if (setA.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    }
    exports.intersection = intersection;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[82/*vs/base/common/color*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Color = exports.HSVA = exports.HSLA = exports.RGBA = void 0;
    function roundFloat(number, decimalPoints) {
        const decimal = Math.pow(10, decimalPoints);
        return Math.round(number * decimal) / decimal;
    }
    class RGBA {
        constructor(r, g, b, a = 1) {
            this._rgbaBrand = undefined;
            this.r = Math.min(255, Math.max(0, r)) | 0;
            this.g = Math.min(255, Math.max(0, g)) | 0;
            this.b = Math.min(255, Math.max(0, b)) | 0;
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
        }
    }
    exports.RGBA = RGBA;
    class HSLA {
        constructor(h, s, l, a) {
            this._hslaBrand = undefined;
            this.h = Math.max(Math.min(360, h), 0) | 0;
            this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
            this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
        }
        /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h in the set [0, 360], s, and l in the set [0, 1].
         */
        static fromRGBA(rgba) {
            const r = rgba.r / 255;
            const g = rgba.g / 255;
            const b = rgba.b / 255;
            const a = rgba.a;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (min + max) / 2;
            const chroma = max - min;
            if (chroma > 0) {
                s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
                switch (max) {
                    case r:
                        h = (g - b) / chroma + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / chroma + 2;
                        break;
                    case b:
                        h = (r - g) / chroma + 4;
                        break;
                }
                h *= 60;
                h = Math.round(h);
            }
            return new HSLA(h, s, l, a);
        }
        static _hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }
        /**
         * Converts an HSL color value to RGB. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
         * returns r, g, and b in the set [0, 255].
         */
        static toRGBA(hsla) {
            const h = hsla.h / 360;
            const { s, l, a } = hsla;
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = HSLA._hue2rgb(p, q, h + 1 / 3);
                g = HSLA._hue2rgb(p, q, h);
                b = HSLA._hue2rgb(p, q, h - 1 / 3);
            }
            return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
        }
    }
    exports.HSLA = HSLA;
    class HSVA {
        constructor(h, s, v, a) {
            this._hsvaBrand = undefined;
            this.h = Math.max(Math.min(360, h), 0) | 0;
            this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
            this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
        }
        // from http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
        static fromRGBA(rgba) {
            const r = rgba.r / 255;
            const g = rgba.g / 255;
            const b = rgba.b / 255;
            const cmax = Math.max(r, g, b);
            const cmin = Math.min(r, g, b);
            const delta = cmax - cmin;
            const s = cmax === 0 ? 0 : (delta / cmax);
            let m;
            if (delta === 0) {
                m = 0;
            }
            else if (cmax === r) {
                m = ((((g - b) / delta) % 6) + 6) % 6;
            }
            else if (cmax === g) {
                m = ((b - r) / delta) + 2;
            }
            else {
                m = ((r - g) / delta) + 4;
            }
            return new HSVA(Math.round(m * 60), s, cmax, rgba.a);
        }
        // from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
        static toRGBA(hsva) {
            const { h, s, v, a } = hsva;
            const c = v * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = v - c;
            let [r, g, b] = [0, 0, 0];
            if (h < 60) {
                r = c;
                g = x;
            }
            else if (h < 120) {
                r = x;
                g = c;
            }
            else if (h < 180) {
                g = c;
                b = x;
            }
            else if (h < 240) {
                g = x;
                b = c;
            }
            else if (h < 300) {
                r = x;
                b = c;
            }
            else if (h <= 360) {
                r = c;
                b = x;
            }
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            return new RGBA(r, g, b, a);
        }
    }
    exports.HSVA = HSVA;
    class Color {
        static fromHex(hex) {
            return Color.Format.CSS.parseHex(hex) || Color.red;
        }
        static equals(a, b) {
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.equals(b);
        }
        get hsla() {
            if (this._hsla) {
                return this._hsla;
            }
            else {
                return HSLA.fromRGBA(this.rgba);
            }
        }
        get hsva() {
            if (this._hsva) {
                return this._hsva;
            }
            return HSVA.fromRGBA(this.rgba);
        }
        constructor(arg) {
            if (!arg) {
                throw new Error('Color needs a value');
            }
            else if (arg instanceof RGBA) {
                this.rgba = arg;
            }
            else if (arg instanceof HSLA) {
                this._hsla = arg;
                this.rgba = HSLA.toRGBA(arg);
            }
            else if (arg instanceof HSVA) {
                this._hsva = arg;
                this.rgba = HSVA.toRGBA(arg);
            }
            else {
                throw new Error('Invalid color ctor argument');
            }
        }
        equals(other) {
            return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
        }
        /**
         * http://www.w3.org/TR/WCAG20/#relativeluminancedef
         * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
         */
        getRelativeLuminance() {
            const R = Color._relativeLuminanceForComponent(this.rgba.r);
            const G = Color._relativeLuminanceForComponent(this.rgba.g);
            const B = Color._relativeLuminanceForComponent(this.rgba.b);
            const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
            return roundFloat(luminance, 4);
        }
        static _relativeLuminanceForComponent(color) {
            const c = color / 255;
            return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
        }
        /**
         * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
         * Returns the contrast ration number in the set [1, 21].
         */
        getContrastRatio(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
        }
        /**
         *	http://24ways.org/2010/calculating-color-contrast
         *  Return 'true' if darker color otherwise 'false'
         */
        isDarker() {
            const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
            return yiq < 128;
        }
        /**
         *	http://24ways.org/2010/calculating-color-contrast
         *  Return 'true' if lighter color otherwise 'false'
         */
        isLighter() {
            const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
            return yiq >= 128;
        }
        isLighterThan(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 > lum2;
        }
        isDarkerThan(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 < lum2;
        }
        lighten(factor) {
            return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
        }
        darken(factor) {
            return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
        }
        transparent(factor) {
            const { r, g, b, a } = this.rgba;
            return new Color(new RGBA(r, g, b, a * factor));
        }
        isTransparent() {
            return this.rgba.a === 0;
        }
        isOpaque() {
            return this.rgba.a === 1;
        }
        opposite() {
            return new Color(new RGBA(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
        }
        blend(c) {
            const rgba = c.rgba;
            // Convert to 0..1 opacity
            const thisA = this.rgba.a;
            const colorA = rgba.a;
            const a = thisA + colorA * (1 - thisA);
            if (a < 1e-6) {
                return Color.transparent;
            }
            const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
            const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
            const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
            return new Color(new RGBA(r, g, b, a));
        }
        makeOpaque(opaqueBackground) {
            if (this.isOpaque() || opaqueBackground.rgba.a !== 1) {
                // only allow to blend onto a non-opaque color onto a opaque color
                return this;
            }
            const { r, g, b, a } = this.rgba;
            // https://stackoverflow.com/questions/12228548/finding-equivalent-color-with-opacity
            return new Color(new RGBA(opaqueBackground.rgba.r - a * (opaqueBackground.rgba.r - r), opaqueBackground.rgba.g - a * (opaqueBackground.rgba.g - g), opaqueBackground.rgba.b - a * (opaqueBackground.rgba.b - b), 1));
        }
        flatten(...backgrounds) {
            const background = backgrounds.reduceRight((accumulator, color) => {
                return Color._flatten(color, accumulator);
            });
            return Color._flatten(this, background);
        }
        static _flatten(foreground, background) {
            const backgroundAlpha = 1 - foreground.rgba.a;
            return new Color(new RGBA(backgroundAlpha * background.rgba.r + foreground.rgba.a * foreground.rgba.r, backgroundAlpha * background.rgba.g + foreground.rgba.a * foreground.rgba.g, backgroundAlpha * background.rgba.b + foreground.rgba.a * foreground.rgba.b));
        }
        toString() {
            if (!this._toString) {
                this._toString = Color.Format.CSS.format(this);
            }
            return this._toString;
        }
        static getLighterColor(of, relative, factor) {
            if (of.isLighterThan(relative)) {
                return of;
            }
            factor = factor ? factor : 0.5;
            const lum1 = of.getRelativeLuminance();
            const lum2 = relative.getRelativeLuminance();
            factor = factor * (lum2 - lum1) / lum2;
            return of.lighten(factor);
        }
        static getDarkerColor(of, relative, factor) {
            if (of.isDarkerThan(relative)) {
                return of;
            }
            factor = factor ? factor : 0.5;
            const lum1 = of.getRelativeLuminance();
            const lum2 = relative.getRelativeLuminance();
            factor = factor * (lum1 - lum2) / lum1;
            return of.darken(factor);
        }
        static { this.white = new Color(new RGBA(255, 255, 255, 1)); }
        static { this.black = new Color(new RGBA(0, 0, 0, 1)); }
        static { this.red = new Color(new RGBA(255, 0, 0, 1)); }
        static { this.blue = new Color(new RGBA(0, 0, 255, 1)); }
        static { this.green = new Color(new RGBA(0, 255, 0, 1)); }
        static { this.cyan = new Color(new RGBA(0, 255, 255, 1)); }
        static { this.lightgrey = new Color(new RGBA(211, 211, 211, 1)); }
        static { this.transparent = new Color(new RGBA(0, 0, 0, 0)); }
    }
    exports.Color = Color;
    (function (Color) {
        let Format;
        (function (Format) {
            let CSS;
            (function (CSS) {
                function formatRGB(color) {
                    if (color.rgba.a === 1) {
                        return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
                    }
                    return Color.Format.CSS.formatRGBA(color);
                }
                CSS.formatRGB = formatRGB;
                function formatRGBA(color) {
                    return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+(color.rgba.a).toFixed(2)})`;
                }
                CSS.formatRGBA = formatRGBA;
                function formatHSL(color) {
                    if (color.hsla.a === 1) {
                        return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
                    }
                    return Color.Format.CSS.formatHSLA(color);
                }
                CSS.formatHSL = formatHSL;
                function formatHSLA(color) {
                    return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
                }
                CSS.formatHSLA = formatHSLA;
                function _toTwoDigitHex(n) {
                    const r = n.toString(16);
                    return r.length !== 2 ? '0' + r : r;
                }
                /**
                 * Formats the color as #RRGGBB
                 */
                function formatHex(color) {
                    return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
                }
                CSS.formatHex = formatHex;
                /**
                 * Formats the color as #RRGGBBAA
                 * If 'compact' is set, colors without transparancy will be printed as #RRGGBB
                 */
                function formatHexA(color, compact = false) {
                    if (compact && color.rgba.a === 1) {
                        return Color.Format.CSS.formatHex(color);
                    }
                    return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
                }
                CSS.formatHexA = formatHexA;
                /**
                 * The default format will use HEX if opaque and RGBA otherwise.
                 */
                function format(color) {
                    if (color.isOpaque()) {
                        return Color.Format.CSS.formatHex(color);
                    }
                    return Color.Format.CSS.formatRGBA(color);
                }
                CSS.format = format;
                /**
                 * Converts an Hex color value to a Color.
                 * returns r, g, and b are contained in the set [0, 255]
                 * @param hex string (#RGB, #RGBA, #RRGGBB or #RRGGBBAA).
                 */
                function parseHex(hex) {
                    const length = hex.length;
                    if (length === 0) {
                        // Invalid color
                        return null;
                    }
                    if (hex.charCodeAt(0) !== 35 /* CharCode.Hash */) {
                        // Does not begin with a #
                        return null;
                    }
                    if (length === 7) {
                        // #RRGGBB format
                        const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                        const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                        const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                        return new Color(new RGBA(r, g, b, 1));
                    }
                    if (length === 9) {
                        // #RRGGBBAA format
                        const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                        const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                        const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                        const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
                        return new Color(new RGBA(r, g, b, a / 255));
                    }
                    if (length === 4) {
                        // #RGB format
                        const r = _parseHexDigit(hex.charCodeAt(1));
                        const g = _parseHexDigit(hex.charCodeAt(2));
                        const b = _parseHexDigit(hex.charCodeAt(3));
                        return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b));
                    }
                    if (length === 5) {
                        // #RGBA format
                        const r = _parseHexDigit(hex.charCodeAt(1));
                        const g = _parseHexDigit(hex.charCodeAt(2));
                        const b = _parseHexDigit(hex.charCodeAt(3));
                        const a = _parseHexDigit(hex.charCodeAt(4));
                        return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
                    }
                    // Invalid color
                    return null;
                }
                CSS.parseHex = parseHex;
                function _parseHexDigit(charCode) {
                    switch (charCode) {
                        case 48 /* CharCode.Digit0 */: return 0;
                        case 49 /* CharCode.Digit1 */: return 1;
                        case 50 /* CharCode.Digit2 */: return 2;
                        case 51 /* CharCode.Digit3 */: return 3;
                        case 52 /* CharCode.Digit4 */: return 4;
                        case 53 /* CharCode.Digit5 */: return 5;
                        case 54 /* CharCode.Digit6 */: return 6;
                        case 55 /* CharCode.Digit7 */: return 7;
                        case 56 /* CharCode.Digit8 */: return 8;
                        case 57 /* CharCode.Digit9 */: return 9;
                        case 97 /* CharCode.a */: return 10;
                        case 65 /* CharCode.A */: return 10;
                        case 98 /* CharCode.b */: return 11;
                        case 66 /* CharCode.B */: return 11;
                        case 99 /* CharCode.c */: return 12;
                        case 67 /* CharCode.C */: return 12;
                        case 100 /* CharCode.d */: return 13;
                        case 68 /* CharCode.D */: return 13;
                        case 101 /* CharCode.e */: return 14;
                        case 69 /* CharCode.E */: return 14;
                        case 102 /* CharCode.f */: return 15;
                        case 70 /* CharCode.F */: return 15;
                    }
                    return 0;
                }
            })(CSS = Format.CSS || (Format.CSS = {}));
        })(Format = Color.Format || (Color.Format = {}));
    })(Color || (exports.Color = Color = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[109/*vs/base/common/decorators*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.throttle = exports.debounce = exports.memoize = void 0;
    function createDecorator(mapFn) {
        return (target, key, descriptor) => {
            let fnKey = null;
            let fn = null;
            if (typeof descriptor.value === 'function') {
                fnKey = 'value';
                fn = descriptor.value;
            }
            else if (typeof descriptor.get === 'function') {
                fnKey = 'get';
                fn = descriptor.get;
            }
            if (!fn) {
                throw new Error('not supported');
            }
            descriptor[fnKey] = mapFn(fn, key);
        };
    }
    function memoize(_target, key, descriptor) {
        let fnKey = null;
        let fn = null;
        if (typeof descriptor.value === 'function') {
            fnKey = 'value';
            fn = descriptor.value;
            if (fn.length !== 0) {
                console.warn('Memoize should only be used in functions with zero parameters');
            }
        }
        else if (typeof descriptor.get === 'function') {
            fnKey = 'get';
            fn = descriptor.get;
        }
        if (!fn) {
            throw new Error('not supported');
        }
        const memoizeKey = `$memoize$${key}`;
        descriptor[fnKey] = function (...args) {
            if (!this.hasOwnProperty(memoizeKey)) {
                Object.defineProperty(this, memoizeKey, {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: fn.apply(this, args)
                });
            }
            return this[memoizeKey];
        };
    }
    exports.memoize = memoize;
    function debounce(delay, reducer, initialValueProvider) {
        return createDecorator((fn, key) => {
            const timerKey = `$debounce$${key}`;
            const resultKey = `$debounce$result$${key}`;
            return function (...args) {
                if (!this[resultKey]) {
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }
                clearTimeout(this[timerKey]);
                if (reducer) {
                    this[resultKey] = reducer(this[resultKey], ...args);
                    args = [this[resultKey]];
                }
                this[timerKey] = setTimeout(() => {
                    fn.apply(this, args);
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }, delay);
            };
        });
    }
    exports.debounce = debounce;
    function throttle(delay, reducer, initialValueProvider) {
        return createDecorator((fn, key) => {
            const timerKey = `$throttle$timer$${key}`;
            const resultKey = `$throttle$result$${key}`;
            const lastRunKey = `$throttle$lastRun$${key}`;
            const pendingKey = `$throttle$pending$${key}`;
            return function (...args) {
                if (!this[resultKey]) {
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }
                if (this[lastRunKey] === null || this[lastRunKey] === undefined) {
                    this[lastRunKey] = -Number.MAX_VALUE;
                }
                if (reducer) {
                    this[resultKey] = reducer(this[resultKey], ...args);
                }
                if (this[pendingKey]) {
                    return;
                }
                const nextTime = this[lastRunKey] + delay;
                if (nextTime <= Date.now()) {
                    this[lastRunKey] = Date.now();
                    fn.apply(this, [this[resultKey]]);
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }
                else {
                    this[pendingKey] = true;
                    this[timerKey] = setTimeout(() => {
                        this[pendingKey] = false;
                        this[lastRunKey] = Date.now();
                        fn.apply(this, [this[resultKey]]);
                        this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                    }, nextTime - Date.now());
                }
            };
        });
    }
    exports.throttle = throttle;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[1190/*vs/base/common/diff/diffChange*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffChange = void 0;
    /**
     * Represents information about a specific difference between two sequences.
     */
    class DiffChange {
        /**
         * Constructs a new DiffChange with the given sequence information
         * and content.
         */
        constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
            //Debug.Assert(originalLength > 0 || modifiedLength > 0, "originalLength and modifiedLength cannot both be <= 0");
            this.originalStart = originalStart;
            this.originalLength = originalLength;
            this.modifiedStart = modifiedStart;
            this.modifiedLength = modifiedLength;
        }
        /**
         * The end point (exclusive) of the change in the original sequence.
         */
        getOriginalEnd() {
            return this.originalStart + this.originalLength;
        }
        /**
         * The end point (exclusive) of the change in the modified sequence.
         */
        getModifiedEnd() {
            return this.modifiedStart + this.modifiedLength;
        }
    }
    exports.DiffChange = DiffChange;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[17/*vs/base/common/errors*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BugIndicatingError = exports.ErrorNoTelemetry = exports.ExpectedError = exports.NotSupportedError = exports.NotImplementedError = exports.getErrorMessage = exports.ReadonlyError = exports.illegalState = exports.illegalArgument = exports.canceled = exports.CancellationError = exports.isCancellationError = exports.transformErrorForSerialization = exports.onUnexpectedExternalError = exports.onUnexpectedError = exports.isSigPipeError = exports.setUnexpectedErrorHandler = exports.errorHandler = exports.ErrorHandler = void 0;
    // Avoid circular dependency on EventEmitter by implementing a subset of the interface.
    class ErrorHandler {
        constructor() {
            this.listeners = [];
            this.unexpectedErrorHandler = function (e) {
                setTimeout(() => {
                    if (e.stack) {
                        if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                            throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack);
                        }
                        throw new Error(e.message + '\n\n' + e.stack);
                    }
                    throw e;
                }, 0);
            };
        }
        addListener(listener) {
            this.listeners.push(listener);
            return () => {
                this._removeListener(listener);
            };
        }
        emit(e) {
            this.listeners.forEach((listener) => {
                listener(e);
            });
        }
        _removeListener(listener) {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
        setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
            this.unexpectedErrorHandler = newUnexpectedErrorHandler;
        }
        getUnexpectedErrorHandler() {
            return this.unexpectedErrorHandler;
        }
        onUnexpectedError(e) {
            this.unexpectedErrorHandler(e);
            this.emit(e);
        }
        // For external errors, we don't want the listeners to be called
        onUnexpectedExternalError(e) {
            this.unexpectedErrorHandler(e);
        }
    }
    exports.ErrorHandler = ErrorHandler;
    exports.errorHandler = new ErrorHandler();
    /** @skipMangle */
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        exports.errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
    /**
     * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
     * logged at most once, to avoid a loop.
     *
     * @see https://github.com/microsoft/vscode-remote-release/issues/6481
     */
    function isSigPipeError(e) {
        if (!e || typeof e !== 'object') {
            return false;
        }
        const cast = e;
        return cast.code === 'EPIPE' && cast.syscall?.toUpperCase() === 'WRITE';
    }
    exports.isSigPipeError = isSigPipeError;
    function onUnexpectedError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedError(e);
        }
        return undefined;
    }
    exports.onUnexpectedError = onUnexpectedError;
    function onUnexpectedExternalError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedExternalError(e);
        }
        return undefined;
    }
    exports.onUnexpectedExternalError = onUnexpectedExternalError;
    function transformErrorForSerialization(error) {
        if (error instanceof Error) {
            const { name, message } = error;
            const stack = error.stacktrace || error.stack;
            return {
                $isError: true,
                name,
                message,
                stack,
                noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error)
            };
        }
        // return as is
        return error;
    }
    exports.transformErrorForSerialization = transformErrorForSerialization;
    const canceledName = 'Canceled';
    /**
     * Checks if the given error is a promise in canceled state
     */
    function isCancellationError(error) {
        if (error instanceof CancellationError) {
            return true;
        }
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    exports.isCancellationError = isCancellationError;
    // !!!IMPORTANT!!!
    // Do NOT change this class because it is also used as an API-type.
    class CancellationError extends Error {
        constructor() {
            super(canceledName);
            this.name = this.message;
        }
    }
    exports.CancellationError = CancellationError;
    /**
     * @deprecated use {@link CancellationError `new CancellationError()`} instead
     */
    function canceled() {
        const error = new Error(canceledName);
        error.name = error.message;
        return error;
    }
    exports.canceled = canceled;
    function illegalArgument(name) {
        if (name) {
            return new Error(`Illegal argument: ${name}`);
        }
        else {
            return new Error('Illegal argument');
        }
    }
    exports.illegalArgument = illegalArgument;
    function illegalState(name) {
        if (name) {
            return new Error(`Illegal state: ${name}`);
        }
        else {
            return new Error('Illegal state');
        }
    }
    exports.illegalState = illegalState;
    class ReadonlyError extends TypeError {
        constructor(name) {
            super(name ? `${name} is read-only and cannot be changed` : 'Cannot change read-only property');
        }
    }
    exports.ReadonlyError = ReadonlyError;
    function getErrorMessage(err) {
        if (!err) {
            return 'Error';
        }
        if (err.message) {
            return err.message;
        }
        if (err.stack) {
            return err.stack.split('\n')[0];
        }
        return String(err);
    }
    exports.getErrorMessage = getErrorMessage;
    class NotImplementedError extends Error {
        constructor(message) {
            super('NotImplemented');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotImplementedError = NotImplementedError;
    class NotSupportedError extends Error {
        constructor(message) {
            super('NotSupported');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotSupportedError = NotSupportedError;
    class ExpectedError extends Error {
        constructor() {
            super(...arguments);
            this.isExpected = true;
        }
    }
    exports.ExpectedError = ExpectedError;
    /**
     * Error that when thrown won't be logged in telemetry as an unhandled error.
     */
    class ErrorNoTelemetry extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'CodeExpectedError';
        }
        static fromError(err) {
            if (err instanceof ErrorNoTelemetry) {
                return err;
            }
            const result = new ErrorNoTelemetry();
            result.message = err.message;
            result.stack = err.stack;
            return result;
        }
        static isErrorNoTelemetry(err) {
            return err.name === 'CodeExpectedError';
        }
    }
    exports.ErrorNoTelemetry = ErrorNoTelemetry;
    /**
     * This error indicates a bug.
     * Do not throw this for invalid user input.
     * Only catch this error to recover gracefully from bugs.
     */
    class BugIndicatingError extends Error {
        constructor(message) {
            super(message || 'An unexpected bug occurred.');
            Object.setPrototypeOf(this, BugIndicatingError.prototype);
            // Because we know for sure only buggy code throws this,
            // we definitely want to break here and fix the bug.
            // eslint-disable-next-line no-debugger
            // debugger;
        }
    }
    exports.BugIndicatingError = BugIndicatingError;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[310/*vs/base/browser/trustedTypes*/], __M([1/*require*/,0/*exports*/,66/*vs/base/browser/window*/,17/*vs/base/common/errors*/]), function (require, exports, window_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTrustedTypesPolicy = void 0;
    function createTrustedTypesPolicy(policyName, policyOptions) {
        const monacoEnvironment = globalThis.MonacoEnvironment;
        if (monacoEnvironment?.createTrustedTypesPolicy) {
            try {
                return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
                return undefined;
            }
        }
        try {
            return window_1.mainWindow.trustedTypes?.createPolicy(policyName, policyOptions);
        }
        catch (err) {
            (0, errors_1.onUnexpectedError)(err);
            return undefined;
        }
    }
    exports.createTrustedTypesPolicy = createTrustedTypesPolicy;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[13/*vs/base/common/arrays*/], __M([1/*require*/,0/*exports*/,17/*vs/base/common/errors*/,158/*vs/base/common/arraysFind*/]), function (require, exports, errors_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallbackIterable = exports.ArrayQueue = exports.reverseOrder = exports.booleanComparator = exports.numberComparator = exports.tieBreakComparators = exports.compareBy = exports.CompareResult = exports.splice = exports.insertInto = exports.getRandomElement = exports.asArray = exports.mapArrayOrNot = exports.pushMany = exports.pushToEnd = exports.pushToStart = exports.shuffle = exports.arrayInsert = exports.remove = exports.insert = exports.index = exports.range = exports.flatten = exports.commonPrefixLength = exports.lastOrDefault = exports.firstOrDefault = exports.uniqueFilter = exports.distinct = exports.isNonEmptyArray = exports.isFalsyOrEmpty = exports.move = exports.coalesceInPlace = exports.coalesce = exports.topAsync = exports.top = exports.delta = exports.sortedDiff = exports.forEachWithNeighbors = exports.forEachAdjacent = exports.groupAdjacentBy = exports.groupBy = exports.quickSelect = exports.binarySearch2 = exports.binarySearch = exports.removeFastWithoutKeepingOrder = exports.equals = exports.tail2 = exports.tail = void 0;
    /**
     * Returns the last element of an array.
     * @param array The array.
     * @param n Which element from the end (default is zero).
     */
    function tail(array, n = 0) {
        return array[array.length - (1 + n)];
    }
    exports.tail = tail;
    function tail2(arr) {
        if (arr.length === 0) {
            throw new Error('Invalid tail call');
        }
        return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
    }
    exports.tail2 = tail2;
    function equals(one, other, itemEquals = (a, b) => a === b) {
        if (one === other) {
            return true;
        }
        if (!one || !other) {
            return false;
        }
        if (one.length !== other.length) {
            return false;
        }
        for (let i = 0, len = one.length; i < len; i++) {
            if (!itemEquals(one[i], other[i])) {
                return false;
            }
        }
        return true;
    }
    exports.equals = equals;
    /**
     * Remove the element at `index` by replacing it with the last element. This is faster than `splice`
     * but changes the order of the array
     */
    function removeFastWithoutKeepingOrder(array, index) {
        const last = array.length - 1;
        if (index < last) {
            array[index] = array[last];
        }
        array.pop();
    }
    exports.removeFastWithoutKeepingOrder = removeFastWithoutKeepingOrder;
    /**
     * Performs a binary search algorithm over a sorted array.
     *
     * @param array The array being searched.
     * @param key The value we search for.
     * @param comparator A function that takes two array elements and returns zero
     *   if they are equal, a negative number if the first element precedes the
     *   second one in the sorting order, or a positive number if the second element
     *   precedes the first one.
     * @return See {@link binarySearch2}
     */
    function binarySearch(array, key, comparator) {
        return binarySearch2(array.length, i => comparator(array[i], key));
    }
    exports.binarySearch = binarySearch;
    /**
     * Performs a binary search algorithm over a sorted collection. Useful for cases
     * when we need to perform a binary search over something that isn't actually an
     * array, and converting data to an array would defeat the use of binary search
     * in the first place.
     *
     * @param length The collection length.
     * @param compareToKey A function that takes an index of an element in the
     *   collection and returns zero if the value at this index is equal to the
     *   search key, a negative number if the value precedes the search key in the
     *   sorting order, or a positive number if the search key precedes the value.
     * @return A non-negative index of an element, if found. If not found, the
     *   result is -(n+1) (or ~n, using bitwise notation), where n is the index
     *   where the key should be inserted to maintain the sorting order.
     */
    function binarySearch2(length, compareToKey) {
        let low = 0, high = length - 1;
        while (low <= high) {
            const mid = ((low + high) / 2) | 0;
            const comp = compareToKey(mid);
            if (comp < 0) {
                low = mid + 1;
            }
            else if (comp > 0) {
                high = mid - 1;
            }
            else {
                return mid;
            }
        }
        return -(low + 1);
    }
    exports.binarySearch2 = binarySearch2;
    function quickSelect(nth, data, compare) {
        nth = nth | 0;
        if (nth >= data.length) {
            throw new TypeError('invalid index');
        }
        const pivotValue = data[Math.floor(data.length * Math.random())];
        const lower = [];
        const higher = [];
        const pivots = [];
        for (const value of data) {
            const val = compare(value, pivotValue);
            if (val < 0) {
                lower.push(value);
            }
            else if (val > 0) {
                higher.push(value);
            }
            else {
                pivots.push(value);
            }
        }
        if (nth < lower.length) {
            return quickSelect(nth, lower, compare);
        }
        else if (nth < lower.length + pivots.length) {
            return pivots[0];
        }
        else {
            return quickSelect(nth - (lower.length + pivots.length), higher, compare);
        }
    }
    exports.quickSelect = quickSelect;
    function groupBy(data, compare) {
        const result = [];
        let currentGroup = undefined;
        for (const element of data.slice(0).sort(compare)) {
            if (!currentGroup || compare(currentGroup[0], element) !== 0) {
                currentGroup = [element];
                result.push(currentGroup);
            }
            else {
                currentGroup.push(element);
            }
        }
        return result;
    }
    exports.groupBy = groupBy;
    /**
     * Splits the given items into a list of (non-empty) groups.
     * `shouldBeGrouped` is used to decide if two consecutive items should be in the same group.
     * The order of the items is preserved.
     */
    function* groupAdjacentBy(items, shouldBeGrouped) {
        let currentGroup;
        let last;
        for (const item of items) {
            if (last !== undefined && shouldBeGrouped(last, item)) {
                currentGroup.push(item);
            }
            else {
                if (currentGroup) {
                    yield currentGroup;
                }
                currentGroup = [item];
            }
            last = item;
        }
        if (currentGroup) {
            yield currentGroup;
        }
    }
    exports.groupAdjacentBy = groupAdjacentBy;
    function forEachAdjacent(arr, f) {
        for (let i = 0; i <= arr.length; i++) {
            f(i === 0 ? undefined : arr[i - 1], i === arr.length ? undefined : arr[i]);
        }
    }
    exports.forEachAdjacent = forEachAdjacent;
    function forEachWithNeighbors(arr, f) {
        for (let i = 0; i < arr.length; i++) {
            f(i === 0 ? undefined : arr[i - 1], arr[i], i + 1 === arr.length ? undefined : arr[i + 1]);
        }
    }
    exports.forEachWithNeighbors = forEachWithNeighbors;
    /**
     * Diffs two *sorted* arrays and computes the splices which apply the diff.
     */
    function sortedDiff(before, after, compare) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            const n = compare(beforeElement, afterElement);
            if (n === 0) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
            }
            else if (n < 0) {
                // beforeElement is smaller -> before element removed
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else if (n > 0) {
                // beforeElement is greater -> after element added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.sortedDiff = sortedDiff;
    /**
     * Takes two *sorted* arrays and computes their delta (removed, added elements).
     * Finishes in `Math.min(before.length, after.length)` steps.
     */
    function delta(before, after, compare) {
        const splices = sortedDiff(before, after, compare);
        const removed = [];
        const added = [];
        for (const splice of splices) {
            removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
            added.push(...splice.toInsert);
        }
        return { removed, added };
    }
    exports.delta = delta;
    /**
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @return The first n elements from array when sorted with compare.
     */
    function top(array, compare, n) {
        if (n === 0) {
            return [];
        }
        const result = array.slice(0, n).sort(compare);
        topStep(array, compare, result, n, array.length);
        return result;
    }
    exports.top = top;
    /**
     * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
     *
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @param batch The number of elements to examine before yielding to the event loop.
     * @return The first n elements from array when sorted with compare.
     */
    function topAsync(array, compare, n, batch, token) {
        if (n === 0) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            (async () => {
                const o = array.length;
                const result = array.slice(0, n).sort(compare);
                for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
                    if (i > n) {
                        await new Promise(resolve => setTimeout(resolve)); // any other delay function would starve I/O
                    }
                    if (token && token.isCancellationRequested) {
                        throw new errors_1.CancellationError();
                    }
                    topStep(array, compare, result, i, m);
                }
                return result;
            })()
                .then(resolve, reject);
        });
    }
    exports.topAsync = topAsync;
    function topStep(array, compare, result, i, m) {
        for (const n = result.length; i < m; i++) {
            const element = array[i];
            if (compare(element, result[n - 1]) < 0) {
                result.pop();
                const j = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(result, e => compare(element, e) < 0);
                result.splice(j, 0, element);
            }
        }
    }
    /**
     * @returns New array with all falsy values removed. The original array IS NOT modified.
     */
    function coalesce(array) {
        return array.filter(e => !!e);
    }
    exports.coalesce = coalesce;
    /**
     * Remove all falsy values from `array`. The original array IS modified.
     */
    function coalesceInPlace(array) {
        let to = 0;
        for (let i = 0; i < array.length; i++) {
            if (!!array[i]) {
                array[to] = array[i];
                to += 1;
            }
        }
        array.length = to;
    }
    exports.coalesceInPlace = coalesceInPlace;
    /**
     * @deprecated Use `Array.copyWithin` instead
     */
    function move(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
    exports.move = move;
    /**
     * @returns false if the provided object is an array and not empty.
     */
    function isFalsyOrEmpty(obj) {
        return !Array.isArray(obj) || obj.length === 0;
    }
    exports.isFalsyOrEmpty = isFalsyOrEmpty;
    function isNonEmptyArray(obj) {
        return Array.isArray(obj) && obj.length > 0;
    }
    exports.isNonEmptyArray = isNonEmptyArray;
    /**
     * Removes duplicates from the given array. The optional keyFn allows to specify
     * how elements are checked for equality by returning an alternate value for each.
     */
    function distinct(array, keyFn = value => value) {
        const seen = new Set();
        return array.filter(element => {
            const key = keyFn(element);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    exports.distinct = distinct;
    function uniqueFilter(keyFn) {
        const seen = new Set();
        return element => {
            const key = keyFn(element);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        };
    }
    exports.uniqueFilter = uniqueFilter;
    function firstOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[0] : notFoundValue;
    }
    exports.firstOrDefault = firstOrDefault;
    function lastOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[array.length - 1] : notFoundValue;
    }
    exports.lastOrDefault = lastOrDefault;
    function commonPrefixLength(one, other, equals = (a, b) => a === b) {
        let result = 0;
        for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
            result++;
        }
        return result;
    }
    exports.commonPrefixLength = commonPrefixLength;
    /**
     * @deprecated Use `[].flat()`
     */
    function flatten(arr) {
        return [].concat(...arr);
    }
    exports.flatten = flatten;
    function range(arg, to) {
        let from = typeof to === 'number' ? arg : 0;
        if (typeof to === 'number') {
            from = arg;
        }
        else {
            from = 0;
            to = arg;
        }
        const result = [];
        if (from <= to) {
            for (let i = from; i < to; i++) {
                result.push(i);
            }
        }
        else {
            for (let i = from; i > to; i--) {
                result.push(i);
            }
        }
        return result;
    }
    exports.range = range;
    function index(array, indexer, mapper) {
        return array.reduce((r, t) => {
            r[indexer(t)] = mapper ? mapper(t) : t;
            return r;
        }, Object.create(null));
    }
    exports.index = index;
    /**
     * Inserts an element into an array. Returns a function which, when
     * called, will remove that element from the array.
     *
     * @deprecated In almost all cases, use a `Set<T>` instead.
     */
    function insert(array, element) {
        array.push(element);
        return () => remove(array, element);
    }
    exports.insert = insert;
    /**
     * Removes an element from an array if it can be found.
     *
     * @deprecated In almost all cases, use a `Set<T>` instead.
     */
    function remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
            return element;
        }
        return undefined;
    }
    exports.remove = remove;
    /**
     * Insert `insertArr` inside `target` at `insertIndex`.
     * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
     */
    function arrayInsert(target, insertIndex, insertArr) {
        const before = target.slice(0, insertIndex);
        const after = target.slice(insertIndex);
        return before.concat(insertArr, after);
    }
    exports.arrayInsert = arrayInsert;
    /**
     * Uses Fisher-Yates shuffle to shuffle the given array
     */
    function shuffle(array, _seed) {
        let rand;
        if (typeof _seed === 'number') {
            let seed = _seed;
            // Seeded random number generator in JS. Modified from:
            // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
            rand = () => {
                const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias
                return x - Math.floor(x);
            };
        }
        else {
            rand = Math.random;
        }
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(rand() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    exports.shuffle = shuffle;
    /**
     * Pushes an element to the start of the array, if found.
     */
    function pushToStart(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.unshift(value);
        }
    }
    exports.pushToStart = pushToStart;
    /**
     * Pushes an element to the end of the array, if found.
     */
    function pushToEnd(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.push(value);
        }
    }
    exports.pushToEnd = pushToEnd;
    function pushMany(arr, items) {
        for (const item of items) {
            arr.push(item);
        }
    }
    exports.pushMany = pushMany;
    function mapArrayOrNot(items, fn) {
        return Array.isArray(items) ?
            items.map(fn) :
            fn(items);
    }
    exports.mapArrayOrNot = mapArrayOrNot;
    function asArray(x) {
        return Array.isArray(x) ? x : [x];
    }
    exports.asArray = asArray;
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    exports.getRandomElement = getRandomElement;
    /**
     * Insert the new items in the array.
     * @param array The original array.
     * @param start The zero-based location in the array from which to start inserting elements.
     * @param newItems The items to be inserted
     */
    function insertInto(array, start, newItems) {
        const startIdx = getActualStartIndex(array, start);
        const originalLength = array.length;
        const newItemsLength = newItems.length;
        array.length = originalLength + newItemsLength;
        // Move the items after the start index, start from the end so that we don't overwrite any value.
        for (let i = originalLength - 1; i >= startIdx; i--) {
            array[i + newItemsLength] = array[i];
        }
        for (let i = 0; i < newItemsLength; i++) {
            array[i + startIdx] = newItems[i];
        }
    }
    exports.insertInto = insertInto;
    /**
     * Removes elements from an array and inserts new elements in their place, returning the deleted elements. Alternative to the native Array.splice method, it
     * can only support limited number of items due to the maximum call stack size limit.
     * @param array The original array.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    function splice(array, start, deleteCount, newItems) {
        const index = getActualStartIndex(array, start);
        let result = array.splice(index, deleteCount);
        if (result === undefined) {
            // see https://bugs.webkit.org/show_bug.cgi?id=261140
            result = [];
        }
        insertInto(array, index, newItems);
        return result;
    }
    exports.splice = splice;
    /**
     * Determine the actual start index (same logic as the native splice() or slice())
     * If greater than the length of the array, start will be set to the length of the array. In this case, no element will be deleted but the method will behave as an adding function, adding as many element as item[n*] provided.
     * If negative, it will begin that many elements from the end of the array. (In this case, the origin -1, meaning -n is the index of the nth last element, and is therefore equivalent to the index of array.length - n.) If array.length + start is less than 0, it will begin from index 0.
     * @param array The target array.
     * @param start The operation index.
     */
    function getActualStartIndex(array, start) {
        return start < 0 ? Math.max(start + array.length, 0) : Math.min(start, array.length);
    }
    var CompareResult;
    (function (CompareResult) {
        function isLessThan(result) {
            return result < 0;
        }
        CompareResult.isLessThan = isLessThan;
        function isLessThanOrEqual(result) {
            return result <= 0;
        }
        CompareResult.isLessThanOrEqual = isLessThanOrEqual;
        function isGreaterThan(result) {
            return result > 0;
        }
        CompareResult.isGreaterThan = isGreaterThan;
        function isNeitherLessOrGreaterThan(result) {
            return result === 0;
        }
        CompareResult.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
        CompareResult.greaterThan = 1;
        CompareResult.lessThan = -1;
        CompareResult.neitherLessOrGreaterThan = 0;
    })(CompareResult || (exports.CompareResult = CompareResult = {}));
    function compareBy(selector, comparator) {
        return (a, b) => comparator(selector(a), selector(b));
    }
    exports.compareBy = compareBy;
    function tieBreakComparators(...comparators) {
        return (item1, item2) => {
            for (const comparator of comparators) {
                const result = comparator(item1, item2);
                if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
                    return result;
                }
            }
            return CompareResult.neitherLessOrGreaterThan;
        };
    }
    exports.tieBreakComparators = tieBreakComparators;
    /**
     * The natural order on numbers.
    */
    const numberComparator = (a, b) => a - b;
    exports.numberComparator = numberComparator;
    const booleanComparator = (a, b) => (0, exports.numberComparator)(a ? 1 : 0, b ? 1 : 0);
    exports.booleanComparator = booleanComparator;
    function reverseOrder(comparator) {
        return (a, b) => -comparator(a, b);
    }
    exports.reverseOrder = reverseOrder;
    class ArrayQueue {
        /**
         * Constructs a queue that is backed by the given array. Runtime is O(1).
        */
        constructor(items) {
            this.items = items;
            this.firstIdx = 0;
            this.lastIdx = this.items.length - 1;
        }
        get length() {
            return this.lastIdx - this.firstIdx + 1;
        }
        /**
         * Consumes elements from the beginning of the queue as long as the predicate returns true.
         * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
        */
        takeWhile(predicate) {
            // P(k) := k <= this.lastIdx && predicate(this.items[k])
            // Find s := min { k | k >= this.firstIdx && !P(k) } and return this.data[this.firstIdx...s)
            let startIdx = this.firstIdx;
            while (startIdx < this.items.length && predicate(this.items[startIdx])) {
                startIdx++;
            }
            const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
            this.firstIdx = startIdx;
            return result;
        }
        /**
         * Consumes elements from the end of the queue as long as the predicate returns true.
         * If no elements were consumed, `null` is returned.
         * The result has the same order as the underlying array!
        */
        takeFromEndWhile(predicate) {
            // P(k) := this.firstIdx >= k && predicate(this.items[k])
            // Find s := max { k | k <= this.lastIdx && !P(k) } and return this.data(s...this.lastIdx]
            let endIdx = this.lastIdx;
            while (endIdx >= 0 && predicate(this.items[endIdx])) {
                endIdx--;
            }
            const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
            this.lastIdx = endIdx;
            return result;
        }
        peek() {
            if (this.length === 0) {
                return undefined;
            }
            return this.items[this.firstIdx];
        }
        peekLast() {
            if (this.length === 0) {
                return undefined;
            }
            return this.items[this.lastIdx];
        }
        dequeue() {
            const result = this.items[this.firstIdx];
            this.firstIdx++;
            return result;
        }
        removeLast() {
            const result = this.items[this.lastIdx];
            this.lastIdx--;
            return result;
        }
        takeCount(count) {
            const result = this.items.slice(this.firstIdx, this.firstIdx + count);
            this.firstIdx += count;
            return result;
        }
    }
    exports.ArrayQueue = ArrayQueue;
    /**
     * This class is faster than an iterator and array for lazy computed data.
    */
    class CallbackIterable {
        static { this.empty = new CallbackIterable(_callback => { }); }
        constructor(
        /**
         * Calls the callback for every item.
         * Stops when the callback returns false.
        */
        iterate) {
            this.iterate = iterate;
        }
        forEach(handler) {
            this.iterate(item => { handler(item); return true; });
        }
        toArray() {
            const result = [];
            this.iterate(item => { result.push(item); return true; });
            return result;
        }
        filter(predicate) {
            return new CallbackIterable(cb => this.iterate(item => predicate(item) ? cb(item) : true));
        }
        map(mapFn) {
            return new CallbackIterable(cb => this.iterate(item => cb(mapFn(item))));
        }
        some(predicate) {
            let result = false;
            this.iterate(item => { result = predicate(item); return !result; });
            return result;
        }
        findFirst(predicate) {
            let result;
            this.iterate(item => {
                if (predicate(item)) {
                    result = item;
                    return false;
                }
                return true;
            });
            return result;
        }
        findLast(predicate) {
            let result;
            this.iterate(item => {
                if (predicate(item)) {
                    result = item;
                }
                return true;
            });
            return result;
        }
        findLastMaxBy(comparator) {
            let result;
            let first = true;
            this.iterate(item => {
                if (first || CompareResult.isGreaterThan(comparator(item, result))) {
                    first = false;
                    result = item;
                }
                return true;
            });
            return result;
        }
    }
    exports.CallbackIterable = CallbackIterable;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[175/*vs/base/common/assert*/], __M([1/*require*/,0/*exports*/,17/*vs/base/common/errors*/]), function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkAdjacentItems = exports.assertFn = exports.softAssert = exports.assert = exports.assertNever = exports.ok = void 0;
    /**
     * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
     *
     * @deprecated Use `assert(...)` instead.
     * This method is usually used like this:
     * ```ts
     * import * as assert from 'vs/base/common/assert';
     * assert.ok(...);
     * ```
     *
     * However, `assert` in that example is a user chosen name.
     * There is no tooling for generating such an import statement.
     * Thus, the `assert(...)` function should be used instead.
     */
    function ok(value, message) {
        if (!value) {
            throw new Error(message ? `Assertion failed (${message})` : 'Assertion Failed');
        }
    }
    exports.ok = ok;
    function assertNever(value, message = 'Unreachable') {
        throw new Error(message);
    }
    exports.assertNever = assertNever;
    function assert(condition) {
        if (!condition) {
            throw new errors_1.BugIndicatingError('Assertion Failed');
        }
    }
    exports.assert = assert;
    /**
     * Like assert, but doesn't throw.
     */
    function softAssert(condition) {
        if (!condition) {
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Soft Assertion Failed'));
        }
    }
    exports.softAssert = softAssert;
    /**
     * condition must be side-effect free!
     */
    function assertFn(condition) {
        if (!condition()) {
            // eslint-disable-next-line no-debugger
            debugger;
            // Reevaluate `condition` again to make debugging easier
            condition();
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Assertion Failed'));
        }
    }
    exports.assertFn = assertFn;
    function checkAdjacentItems(items, predicate) {
        let i = 0;
        while (i < items.length - 1) {
            const a = items[i];
            const b = items[i + 1];
            if (!predicate(a, b)) {
                return false;
            }
            i++;
        }
        return true;
    }
    exports.checkAdjacentItems = checkAdjacentItems;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[220/*vs/base/common/functional*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSingleCallFunction = void 0;
    /**
     * Given a function, returns a function that is only calling that function once.
     */
    function createSingleCallFunction(fn, fnDidRunCallback) {
        const _this = this;
        let didCall = false;
        let result;
        return function () {
            if (didCall) {
                return result;
            }
            didCall = true;
            if (fnDidRunCallback) {
                try {
                    result = fn.apply(_this, arguments);
                }
                finally {
                    fnDidRunCallback();
                }
            }
            else {
                result = fn.apply(_this, arguments);
            }
            return result;
        };
    }
    exports.createSingleCallFunction = createSingleCallFunction;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[405/*vs/base/common/idGenerator*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultGenerator = exports.IdGenerator = void 0;
    class IdGenerator {
        constructor(prefix) {
            this._prefix = prefix;
            this._lastId = 0;
        }
        nextId() {
            return this._prefix + (++this._lastId);
        }
    }
    exports.IdGenerator = IdGenerator;
    exports.defaultGenerator = new IdGenerator('id#');
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[75/*vs/base/common/iterator*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Iterable = void 0;
    var Iterable;
    (function (Iterable) {
        function is(thing) {
            return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
        }
        Iterable.is = is;
        const _empty = Object.freeze([]);
        function empty() {
            return _empty;
        }
        Iterable.empty = empty;
        function* single(element) {
            yield element;
        }
        Iterable.single = single;
        function wrap(iterableOrElement) {
            if (is(iterableOrElement)) {
                return iterableOrElement;
            }
            else {
                return single(iterableOrElement);
            }
        }
        Iterable.wrap = wrap;
        function from(iterable) {
            return iterable || _empty;
        }
        Iterable.from = from;
        function* reverse(array) {
            for (let i = array.length - 1; i >= 0; i--) {
                yield array[i];
            }
        }
        Iterable.reverse = reverse;
        function isEmpty(iterable) {
            return !iterable || iterable[Symbol.iterator]().next().done === true;
        }
        Iterable.isEmpty = isEmpty;
        function first(iterable) {
            return iterable[Symbol.iterator]().next().value;
        }
        Iterable.first = first;
        function some(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return true;
                }
            }
            return false;
        }
        Iterable.some = some;
        function find(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return element;
                }
            }
            return undefined;
        }
        Iterable.find = find;
        function* filter(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    yield element;
                }
            }
        }
        Iterable.filter = filter;
        function* map(iterable, fn) {
            let index = 0;
            for (const element of iterable) {
                yield fn(element, index++);
            }
        }
        Iterable.map = map;
        function* concat(...iterables) {
            for (const iterable of iterables) {
                yield* iterable;
            }
        }
        Iterable.concat = concat;
        function reduce(iterable, reducer, initialValue) {
            let value = initialValue;
            for (const element of iterable) {
                value = reducer(value, element);
            }
            return value;
        }
        Iterable.reduce = reduce;
        /**
         * Returns an iterable slice of the array, with the same semantics as `array.slice()`.
         */
        function* slice(arr, from, to = arr.length) {
            if (from < 0) {
                from += arr.length;
            }
            if (to < 0) {
                to += arr.length;
            }
            else if (to > arr.length) {
                to = arr.length;
            }
            for (; from < to; from++) {
                yield arr[from];
            }
        }
        Iterable.slice = slice;
        /**
         * Consumes `atMost` elements from iterable and returns the consumed elements,
         * and an iterable for the rest of the elements.
         */
        function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
            const consumed = [];
            if (atMost === 0) {
                return [consumed, iterable];
            }
            const iterator = iterable[Symbol.iterator]();
            for (let i = 0; i < atMost; i++) {
                const next = iterator.next();
                if (next.done) {
                    return [consumed, Iterable.empty()];
                }
                consumed.push(next.value);
            }
            return [consumed, { [Symbol.iterator]() { return iterator; } }];
        }
        Iterable.consume = consume;
        async function asyncToArray(iterable) {
            const result = [];
            for await (const item of iterable) {
                result.push(item);
            }
            return Promise.resolve(result);
        }
        Iterable.asyncToArray = asyncToArray;
    })(Iterable || (exports.Iterable = Iterable = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[136/*vs/base/common/json*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNodeType = exports.stripComments = exports.visit = exports.findNodeAtOffset = exports.contains = exports.getNodeValue = exports.getNodePath = exports.findNodeAtLocation = exports.parseTree = exports.parse = exports.getLocation = exports.createScanner = exports.ParseOptions = exports.ParseErrorCode = exports.SyntaxKind = exports.ScanError = void 0;
    var ScanError;
    (function (ScanError) {
        ScanError[ScanError["None"] = 0] = "None";
        ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
        ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
        ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
        ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
        ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
        ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
    })(ScanError || (exports.ScanError = ScanError = {}));
    var SyntaxKind;
    (function (SyntaxKind) {
        SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
        SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
        SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
        SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
        SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
        SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
        SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
        SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
        SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
        SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
        SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
        SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
        SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
        SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
        SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
        SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
        SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
    })(SyntaxKind || (exports.SyntaxKind = SyntaxKind = {}));
    var ParseErrorCode;
    (function (ParseErrorCode) {
        ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
        ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
        ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
        ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
        ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
        ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
        ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
        ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
        ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
        ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
        ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
        ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
        ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
    })(ParseErrorCode || (exports.ParseErrorCode = ParseErrorCode = {}));
    var ParseOptions;
    (function (ParseOptions) {
        ParseOptions.DEFAULT = {
            allowTrailingComma: true
        };
    })(ParseOptions || (exports.ParseOptions = ParseOptions = {}));
    /**
     * Creates a JSON scanner on the given text.
     * If ignoreTrivia is set, whitespaces or comments are ignored.
     */
    function createScanner(text, ignoreTrivia = false) {
        let pos = 0;
        const len = text.length;
        let value = '';
        let tokenOffset = 0;
        let token = 16 /* SyntaxKind.Unknown */;
        let scanError = 0 /* ScanError.None */;
        function scanHexDigits(count) {
            let digits = 0;
            let hexValue = 0;
            while (digits < count) {
                const ch = text.charCodeAt(pos);
                if (ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */) {
                    hexValue = hexValue * 16 + ch - 48 /* CharacterCodes._0 */;
                }
                else if (ch >= 65 /* CharacterCodes.A */ && ch <= 70 /* CharacterCodes.F */) {
                    hexValue = hexValue * 16 + ch - 65 /* CharacterCodes.A */ + 10;
                }
                else if (ch >= 97 /* CharacterCodes.a */ && ch <= 102 /* CharacterCodes.f */) {
                    hexValue = hexValue * 16 + ch - 97 /* CharacterCodes.a */ + 10;
                }
                else {
                    break;
                }
                pos++;
                digits++;
            }
            if (digits < count) {
                hexValue = -1;
            }
            return hexValue;
        }
        function setPosition(newPosition) {
            pos = newPosition;
            value = '';
            tokenOffset = 0;
            token = 16 /* SyntaxKind.Unknown */;
            scanError = 0 /* ScanError.None */;
        }
        function scanNumber() {
            const start = pos;
            if (text.charCodeAt(pos) === 48 /* CharacterCodes._0 */) {
                pos++;
            }
            else {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            if (pos < text.length && text.charCodeAt(pos) === 46 /* CharacterCodes.dot */) {
                pos++;
                if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                        pos++;
                    }
                }
                else {
                    scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                    return text.substring(start, pos);
                }
            }
            let end = pos;
            if (pos < text.length && (text.charCodeAt(pos) === 69 /* CharacterCodes.E */ || text.charCodeAt(pos) === 101 /* CharacterCodes.e */)) {
                pos++;
                if (pos < text.length && text.charCodeAt(pos) === 43 /* CharacterCodes.plus */ || text.charCodeAt(pos) === 45 /* CharacterCodes.minus */) {
                    pos++;
                }
                if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                        pos++;
                    }
                    end = pos;
                }
                else {
                    scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                }
            }
            return text.substring(start, end);
        }
        function scanString() {
            let result = '', start = pos;
            while (true) {
                if (pos >= len) {
                    result += text.substring(start, pos);
                    scanError = 2 /* ScanError.UnexpectedEndOfString */;
                    break;
                }
                const ch = text.charCodeAt(pos);
                if (ch === 34 /* CharacterCodes.doubleQuote */) {
                    result += text.substring(start, pos);
                    pos++;
                    break;
                }
                if (ch === 92 /* CharacterCodes.backslash */) {
                    result += text.substring(start, pos);
                    pos++;
                    if (pos >= len) {
                        scanError = 2 /* ScanError.UnexpectedEndOfString */;
                        break;
                    }
                    const ch2 = text.charCodeAt(pos++);
                    switch (ch2) {
                        case 34 /* CharacterCodes.doubleQuote */:
                            result += '\"';
                            break;
                        case 92 /* CharacterCodes.backslash */:
                            result += '\\';
                            break;
                        case 47 /* CharacterCodes.slash */:
                            result += '/';
                            break;
                        case 98 /* CharacterCodes.b */:
                            result += '\b';
                            break;
                        case 102 /* CharacterCodes.f */:
                            result += '\f';
                            break;
                        case 110 /* CharacterCodes.n */:
                            result += '\n';
                            break;
                        case 114 /* CharacterCodes.r */:
                            result += '\r';
                            break;
                        case 116 /* CharacterCodes.t */:
                            result += '\t';
                            break;
                        case 117 /* CharacterCodes.u */: {
                            const ch3 = scanHexDigits(4);
                            if (ch3 >= 0) {
                                result += String.fromCharCode(ch3);
                            }
                            else {
                                scanError = 4 /* ScanError.InvalidUnicode */;
                            }
                            break;
                        }
                        default:
                            scanError = 5 /* ScanError.InvalidEscapeCharacter */;
                    }
                    start = pos;
                    continue;
                }
                if (ch >= 0 && ch <= 0x1F) {
                    if (isLineBreak(ch)) {
                        result += text.substring(start, pos);
                        scanError = 2 /* ScanError.UnexpectedEndOfString */;
                        break;
                    }
                    else {
                        scanError = 6 /* ScanError.InvalidCharacter */;
                        // mark as error but continue with string
                    }
                }
                pos++;
            }
            return result;
        }
        function scanNext() {
            value = '';
            scanError = 0 /* ScanError.None */;
            tokenOffset = pos;
            if (pos >= len) {
                // at the end
                tokenOffset = len;
                return token = 17 /* SyntaxKind.EOF */;
            }
            let code = text.charCodeAt(pos);
            // trivia: whitespace
            if (isWhitespace(code)) {
                do {
                    pos++;
                    value += String.fromCharCode(code);
                    code = text.charCodeAt(pos);
                } while (isWhitespace(code));
                return token = 15 /* SyntaxKind.Trivia */;
            }
            // trivia: newlines
            if (isLineBreak(code)) {
                pos++;
                value += String.fromCharCode(code);
                if (code === 13 /* CharacterCodes.carriageReturn */ && text.charCodeAt(pos) === 10 /* CharacterCodes.lineFeed */) {
                    pos++;
                    value += '\n';
                }
                return token = 14 /* SyntaxKind.LineBreakTrivia */;
            }
            switch (code) {
                // tokens: []{}:,
                case 123 /* CharacterCodes.openBrace */:
                    pos++;
                    return token = 1 /* SyntaxKind.OpenBraceToken */;
                case 125 /* CharacterCodes.closeBrace */:
                    pos++;
                    return token = 2 /* SyntaxKind.CloseBraceToken */;
                case 91 /* CharacterCodes.openBracket */:
                    pos++;
                    return token = 3 /* SyntaxKind.OpenBracketToken */;
                case 93 /* CharacterCodes.closeBracket */:
                    pos++;
                    return token = 4 /* SyntaxKind.CloseBracketToken */;
                case 58 /* CharacterCodes.colon */:
                    pos++;
                    return token = 6 /* SyntaxKind.ColonToken */;
                case 44 /* CharacterCodes.comma */:
                    pos++;
                    return token = 5 /* SyntaxKind.CommaToken */;
                // strings
                case 34 /* CharacterCodes.doubleQuote */:
                    pos++;
                    value = scanString();
                    return token = 10 /* SyntaxKind.StringLiteral */;
                // comments
                case 47 /* CharacterCodes.slash */: {
                    const start = pos - 1;
                    // Single-line comment
                    if (text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                        pos += 2;
                        while (pos < len) {
                            if (isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        value = text.substring(start, pos);
                        return token = 12 /* SyntaxKind.LineCommentTrivia */;
                    }
                    // Multi-line comment
                    if (text.charCodeAt(pos + 1) === 42 /* CharacterCodes.asterisk */) {
                        pos += 2;
                        const safeLength = len - 1; // For lookahead.
                        let commentClosed = false;
                        while (pos < safeLength) {
                            const ch = text.charCodeAt(pos);
                            if (ch === 42 /* CharacterCodes.asterisk */ && text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                                pos += 2;
                                commentClosed = true;
                                break;
                            }
                            pos++;
                        }
                        if (!commentClosed) {
                            pos++;
                            scanError = 1 /* ScanError.UnexpectedEndOfComment */;
                        }
                        value = text.substring(start, pos);
                        return token = 13 /* SyntaxKind.BlockCommentTrivia */;
                    }
                    // just a single slash
                    value += String.fromCharCode(code);
                    pos++;
                    return token = 16 /* SyntaxKind.Unknown */;
                }
                // numbers
                case 45 /* CharacterCodes.minus */:
                    value += String.fromCharCode(code);
                    pos++;
                    if (pos === len || !isDigit(text.charCodeAt(pos))) {
                        return token = 16 /* SyntaxKind.Unknown */;
                    }
                // found a minus, followed by a number so
                // we fall through to proceed with scanning
                // numbers
                case 48 /* CharacterCodes._0 */:
                case 49 /* CharacterCodes._1 */:
                case 50 /* CharacterCodes._2 */:
                case 51 /* CharacterCodes._3 */:
                case 52 /* CharacterCodes._4 */:
                case 53 /* CharacterCodes._5 */:
                case 54 /* CharacterCodes._6 */:
                case 55 /* CharacterCodes._7 */:
                case 56 /* CharacterCodes._8 */:
                case 57 /* CharacterCodes._9 */:
                    value += scanNumber();
                    return token = 11 /* SyntaxKind.NumericLiteral */;
                // literals and unknown symbols
                default:
                    // is a literal? Read the full word.
                    while (pos < len && isUnknownContentCharacter(code)) {
                        pos++;
                        code = text.charCodeAt(pos);
                    }
                    if (tokenOffset !== pos) {
                        value = text.substring(tokenOffset, pos);
                        // keywords: true, false, null
                        switch (value) {
                            case 'true': return token = 8 /* SyntaxKind.TrueKeyword */;
                            case 'false': return token = 9 /* SyntaxKind.FalseKeyword */;
                            case 'null': return token = 7 /* SyntaxKind.NullKeyword */;
                        }
                        return token = 16 /* SyntaxKind.Unknown */;
                    }
                    // some
                    value += String.fromCharCode(code);
                    pos++;
                    return token = 16 /* SyntaxKind.Unknown */;
            }
        }
        function isUnknownContentCharacter(code) {
            if (isWhitespace(code) || isLineBreak(code)) {
                return false;
            }
            switch (code) {
                case 125 /* CharacterCodes.closeBrace */:
                case 93 /* CharacterCodes.closeBracket */:
                case 123 /* CharacterCodes.openBrace */:
                case 91 /* CharacterCodes.openBracket */:
                case 34 /* CharacterCodes.doubleQuote */:
                case 58 /* CharacterCodes.colon */:
                case 44 /* CharacterCodes.comma */:
                case 47 /* CharacterCodes.slash */:
                    return false;
            }
            return true;
        }
        function scanNextNonTrivia() {
            let result;
            do {
                result = scanNext();
            } while (result >= 12 /* SyntaxKind.LineCommentTrivia */ && result <= 15 /* SyntaxKind.Trivia */);
            return result;
        }
        return {
            setPosition: setPosition,
            getPosition: () => pos,
            scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
            getToken: () => token,
            getTokenValue: () => value,
            getTokenOffset: () => tokenOffset,
            getTokenLength: () => pos - tokenOffset,
            getTokenError: () => scanError
        };
    }
    exports.createScanner = createScanner;
    function isWhitespace(ch) {
        return ch === 32 /* CharacterCodes.space */ || ch === 9 /* CharacterCodes.tab */ || ch === 11 /* CharacterCodes.verticalTab */ || ch === 12 /* CharacterCodes.formFeed */ ||
            ch === 160 /* CharacterCodes.nonBreakingSpace */ || ch === 5760 /* CharacterCodes.ogham */ || ch >= 8192 /* CharacterCodes.enQuad */ && ch <= 8203 /* CharacterCodes.zeroWidthSpace */ ||
            ch === 8239 /* CharacterCodes.narrowNoBreakSpace */ || ch === 8287 /* CharacterCodes.mathematicalSpace */ || ch === 12288 /* CharacterCodes.ideographicSpace */ || ch === 65279 /* CharacterCodes.byteOrderMark */;
    }
    function isLineBreak(ch) {
        return ch === 10 /* CharacterCodes.lineFeed */ || ch === 13 /* CharacterCodes.carriageReturn */ || ch === 8232 /* CharacterCodes.lineSeparator */ || ch === 8233 /* CharacterCodes.paragraphSeparator */;
    }
    function isDigit(ch) {
        return ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */;
    }
    var CharacterCodes;
    (function (CharacterCodes) {
        CharacterCodes[CharacterCodes["nullCharacter"] = 0] = "nullCharacter";
        CharacterCodes[CharacterCodes["maxAsciiCharacter"] = 127] = "maxAsciiCharacter";
        CharacterCodes[CharacterCodes["lineFeed"] = 10] = "lineFeed";
        CharacterCodes[CharacterCodes["carriageReturn"] = 13] = "carriageReturn";
        CharacterCodes[CharacterCodes["lineSeparator"] = 8232] = "lineSeparator";
        CharacterCodes[CharacterCodes["paragraphSeparator"] = 8233] = "paragraphSeparator";
        // REVIEW: do we need to support this?  The scanner doesn't, but our IText does.  This seems
        // like an odd disparity?  (Or maybe it's completely fine for them to be different).
        CharacterCodes[CharacterCodes["nextLine"] = 133] = "nextLine";
        // Unicode 3.0 space characters
        CharacterCodes[CharacterCodes["space"] = 32] = "space";
        CharacterCodes[CharacterCodes["nonBreakingSpace"] = 160] = "nonBreakingSpace";
        CharacterCodes[CharacterCodes["enQuad"] = 8192] = "enQuad";
        CharacterCodes[CharacterCodes["emQuad"] = 8193] = "emQuad";
        CharacterCodes[CharacterCodes["enSpace"] = 8194] = "enSpace";
        CharacterCodes[CharacterCodes["emSpace"] = 8195] = "emSpace";
        CharacterCodes[CharacterCodes["threePerEmSpace"] = 8196] = "threePerEmSpace";
        CharacterCodes[CharacterCodes["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
        CharacterCodes[CharacterCodes["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
        CharacterCodes[CharacterCodes["figureSpace"] = 8199] = "figureSpace";
        CharacterCodes[CharacterCodes["punctuationSpace"] = 8200] = "punctuationSpace";
        CharacterCodes[CharacterCodes["thinSpace"] = 8201] = "thinSpace";
        CharacterCodes[CharacterCodes["hairSpace"] = 8202] = "hairSpace";
        CharacterCodes[CharacterCodes["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
        CharacterCodes[CharacterCodes["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
        CharacterCodes[CharacterCodes["ideographicSpace"] = 12288] = "ideographicSpace";
        CharacterCodes[CharacterCodes["mathematicalSpace"] = 8287] = "mathematicalSpace";
        CharacterCodes[CharacterCodes["ogham"] = 5760] = "ogham";
        CharacterCodes[CharacterCodes["_"] = 95] = "_";
        CharacterCodes[CharacterCodes["$"] = 36] = "$";
        CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
        CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
        CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
        CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
        CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
        CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
        CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
        CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
        CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
        CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
        CharacterCodes[CharacterCodes["a"] = 97] = "a";
        CharacterCodes[CharacterCodes["b"] = 98] = "b";
        CharacterCodes[CharacterCodes["c"] = 99] = "c";
        CharacterCodes[CharacterCodes["d"] = 100] = "d";
        CharacterCodes[CharacterCodes["e"] = 101] = "e";
        CharacterCodes[CharacterCodes["f"] = 102] = "f";
        CharacterCodes[CharacterCodes["g"] = 103] = "g";
        CharacterCodes[CharacterCodes["h"] = 104] = "h";
        CharacterCodes[CharacterCodes["i"] = 105] = "i";
        CharacterCodes[CharacterCodes["j"] = 106] = "j";
        CharacterCodes[CharacterCodes["k"] = 107] = "k";
        CharacterCodes[CharacterCodes["l"] = 108] = "l";
        CharacterCodes[CharacterCodes["m"] = 109] = "m";
        CharacterCodes[CharacterCodes["n"] = 110] = "n";
        CharacterCodes[CharacterCodes["o"] = 111] = "o";
        CharacterCodes[CharacterCodes["p"] = 112] = "p";
        CharacterCodes[CharacterCodes["q"] = 113] = "q";
        CharacterCodes[CharacterCodes["r"] = 114] = "r";
        CharacterCodes[CharacterCodes["s"] = 115] = "s";
        CharacterCodes[CharacterCodes["t"] = 116] = "t";
        CharacterCodes[CharacterCodes["u"] = 117] = "u";
        CharacterCodes[CharacterCodes["v"] = 118] = "v";
        CharacterCodes[CharacterCodes["w"] = 119] = "w";
        CharacterCodes[CharacterCodes["x"] = 120] = "x";
        CharacterCodes[CharacterCodes["y"] = 121] = "y";
        CharacterCodes[CharacterCodes["z"] = 122] = "z";
        CharacterCodes[CharacterCodes["A"] = 65] = "A";
        CharacterCodes[CharacterCodes["B"] = 66] = "B";
        CharacterCodes[CharacterCodes["C"] = 67] = "C";
        CharacterCodes[CharacterCodes["D"] = 68] = "D";
        CharacterCodes[CharacterCodes["E"] = 69] = "E";
        CharacterCodes[CharacterCodes["F"] = 70] = "F";
        CharacterCodes[CharacterCodes["G"] = 71] = "G";
        CharacterCodes[CharacterCodes["H"] = 72] = "H";
        CharacterCodes[CharacterCodes["I"] = 73] = "I";
        CharacterCodes[CharacterCodes["J"] = 74] = "J";
        CharacterCodes[CharacterCodes["K"] = 75] = "K";
        CharacterCodes[CharacterCodes["L"] = 76] = "L";
        CharacterCodes[CharacterCodes["M"] = 77] = "M";
        CharacterCodes[CharacterCodes["N"] = 78] = "N";
        CharacterCodes[CharacterCodes["O"] = 79] = "O";
        CharacterCodes[CharacterCodes["P"] = 80] = "P";
        CharacterCodes[CharacterCodes["Q"] = 81] = "Q";
        CharacterCodes[CharacterCodes["R"] = 82] = "R";
        CharacterCodes[CharacterCodes["S"] = 83] = "S";
        CharacterCodes[CharacterCodes["T"] = 84] = "T";
        CharacterCodes[CharacterCodes["U"] = 85] = "U";
        CharacterCodes[CharacterCodes["V"] = 86] = "V";
        CharacterCodes[CharacterCodes["W"] = 87] = "W";
        CharacterCodes[CharacterCodes["X"] = 88] = "X";
        CharacterCodes[CharacterCodes["Y"] = 89] = "Y";
        CharacterCodes[CharacterCodes["Z"] = 90] = "Z";
        CharacterCodes[CharacterCodes["ampersand"] = 38] = "ampersand";
        CharacterCodes[CharacterCodes["asterisk"] = 42] = "asterisk";
        CharacterCodes[CharacterCodes["at"] = 64] = "at";
        CharacterCodes[CharacterCodes["backslash"] = 92] = "backslash";
        CharacterCodes[CharacterCodes["bar"] = 124] = "bar";
        CharacterCodes[CharacterCodes["caret"] = 94] = "caret";
        CharacterCodes[CharacterCodes["closeBrace"] = 125] = "closeBrace";
        CharacterCodes[CharacterCodes["closeBracket"] = 93] = "closeBracket";
        CharacterCodes[CharacterCodes["closeParen"] = 41] = "closeParen";
        CharacterCodes[CharacterCodes["colon"] = 58] = "colon";
        CharacterCodes[CharacterCodes["comma"] = 44] = "comma";
        CharacterCodes[CharacterCodes["dot"] = 46] = "dot";
        CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
        CharacterCodes[CharacterCodes["equals"] = 61] = "equals";
        CharacterCodes[CharacterCodes["exclamation"] = 33] = "exclamation";
        CharacterCodes[CharacterCodes["greaterThan"] = 62] = "greaterThan";
        CharacterCodes[CharacterCodes["lessThan"] = 60] = "lessThan";
        CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
        CharacterCodes[CharacterCodes["openBrace"] = 123] = "openBrace";
        CharacterCodes[CharacterCodes["openBracket"] = 91] = "openBracket";
        CharacterCodes[CharacterCodes["openParen"] = 40] = "openParen";
        CharacterCodes[CharacterCodes["percent"] = 37] = "percent";
        CharacterCodes[CharacterCodes["plus"] = 43] = "plus";
        CharacterCodes[CharacterCodes["question"] = 63] = "question";
        CharacterCodes[CharacterCodes["semicolon"] = 59] = "semicolon";
        CharacterCodes[CharacterCodes["singleQuote"] = 39] = "singleQuote";
        CharacterCodes[CharacterCodes["slash"] = 47] = "slash";
        CharacterCodes[CharacterCodes["tilde"] = 126] = "tilde";
        CharacterCodes[CharacterCodes["backspace"] = 8] = "backspace";
        CharacterCodes[CharacterCodes["formFeed"] = 12] = "formFeed";
        CharacterCodes[CharacterCodes["byteOrderMark"] = 65279] = "byteOrderMark";
        CharacterCodes[CharacterCodes["tab"] = 9] = "tab";
        CharacterCodes[CharacterCodes["verticalTab"] = 11] = "verticalTab";
    })(CharacterCodes || (CharacterCodes = {}));
    /**
     * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
     */
    function getLocation(text, position) {
        const segments = []; // strings or numbers
        const earlyReturnException = new Object();
        let previousNode = undefined;
        const previousNodeInst = {
            value: {},
            offset: 0,
            length: 0,
            type: 'object',
            parent: undefined
        };
        let isAtPropertyKey = false;
        function setPreviousNode(value, offset, length, type) {
            previousNodeInst.value = value;
            previousNodeInst.offset = offset;
            previousNodeInst.length = length;
            previousNodeInst.type = type;
            previousNodeInst.colonOffset = undefined;
            previousNode = previousNodeInst;
        }
        try {
            visit(text, {
                onObjectBegin: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    isAtPropertyKey = position > offset;
                    segments.push(''); // push a placeholder (will be replaced)
                },
                onObjectProperty: (name, offset, length) => {
                    if (position < offset) {
                        throw earlyReturnException;
                    }
                    setPreviousNode(name, offset, length, 'property');
                    segments[segments.length - 1] = name;
                    if (position <= offset + length) {
                        throw earlyReturnException;
                    }
                },
                onObjectEnd: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.pop();
                },
                onArrayBegin: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.push(0);
                },
                onArrayEnd: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.pop();
                },
                onLiteralValue: (value, offset, length) => {
                    if (position < offset) {
                        throw earlyReturnException;
                    }
                    setPreviousNode(value, offset, length, getNodeType(value));
                    if (position <= offset + length) {
                        throw earlyReturnException;
                    }
                },
                onSeparator: (sep, offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    if (sep === ':' && previousNode && previousNode.type === 'property') {
                        previousNode.colonOffset = offset;
                        isAtPropertyKey = false;
                        previousNode = undefined;
                    }
                    else if (sep === ',') {
                        const last = segments[segments.length - 1];
                        if (typeof last === 'number') {
                            segments[segments.length - 1] = last + 1;
                        }
                        else {
                            isAtPropertyKey = true;
                            segments[segments.length - 1] = '';
                        }
                        previousNode = undefined;
                    }
                }
            });
        }
        catch (e) {
            if (e !== earlyReturnException) {
                throw e;
            }
        }
        return {
            path: segments,
            previousNode,
            isAtPropertyKey,
            matches: (pattern) => {
                let k = 0;
                for (let i = 0; k < pattern.length && i < segments.length; i++) {
                    if (pattern[k] === segments[i] || pattern[k] === '*') {
                        k++;
                    }
                    else if (pattern[k] !== '**') {
                        return false;
                    }
                }
                return k === pattern.length;
            }
        };
    }
    exports.getLocation = getLocation;
    /**
     * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
     * Therefore always check the errors list to find out if the input was valid.
     */
    function parse(text, errors = [], options = ParseOptions.DEFAULT) {
        let currentProperty = null;
        let currentParent = [];
        const previousParents = [];
        function onValue(value) {
            if (Array.isArray(currentParent)) {
                currentParent.push(value);
            }
            else if (currentProperty !== null) {
                currentParent[currentProperty] = value;
            }
        }
        const visitor = {
            onObjectBegin: () => {
                const object = {};
                onValue(object);
                previousParents.push(currentParent);
                currentParent = object;
                currentProperty = null;
            },
            onObjectProperty: (name) => {
                currentProperty = name;
            },
            onObjectEnd: () => {
                currentParent = previousParents.pop();
            },
            onArrayBegin: () => {
                const array = [];
                onValue(array);
                previousParents.push(currentParent);
                currentParent = array;
                currentProperty = null;
            },
            onArrayEnd: () => {
                currentParent = previousParents.pop();
            },
            onLiteralValue: onValue,
            onError: (error, offset, length) => {
                errors.push({ error, offset, length });
            }
        };
        visit(text, visitor, options);
        return currentParent[0];
    }
    exports.parse = parse;
    /**
     * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
     */
    function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
        let currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: undefined }; // artificial root
        function ensurePropertyComplete(endOffset) {
            if (currentParent.type === 'property') {
                currentParent.length = endOffset - currentParent.offset;
                currentParent = currentParent.parent;
            }
        }
        function onValue(valueNode) {
            currentParent.children.push(valueNode);
            return valueNode;
        }
        const visitor = {
            onObjectBegin: (offset) => {
                currentParent = onValue({ type: 'object', offset, length: -1, parent: currentParent, children: [] });
            },
            onObjectProperty: (name, offset, length) => {
                currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
                currentParent.children.push({ type: 'string', value: name, offset, length, parent: currentParent });
            },
            onObjectEnd: (offset, length) => {
                currentParent.length = offset + length - currentParent.offset;
                currentParent = currentParent.parent;
                ensurePropertyComplete(offset + length);
            },
            onArrayBegin: (offset, length) => {
                currentParent = onValue({ type: 'array', offset, length: -1, parent: currentParent, children: [] });
            },
            onArrayEnd: (offset, length) => {
                currentParent.length = offset + length - currentParent.offset;
                currentParent = currentParent.parent;
                ensurePropertyComplete(offset + length);
            },
            onLiteralValue: (value, offset, length) => {
                onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
                ensurePropertyComplete(offset + length);
            },
            onSeparator: (sep, offset, length) => {
                if (currentParent.type === 'property') {
                    if (sep === ':') {
                        currentParent.colonOffset = offset;
                    }
                    else if (sep === ',') {
                        ensurePropertyComplete(offset);
                    }
                }
            },
            onError: (error, offset, length) => {
                errors.push({ error, offset, length });
            }
        };
        visit(text, visitor, options);
        const result = currentParent.children[0];
        if (result) {
            delete result.parent;
        }
        return result;
    }
    exports.parseTree = parseTree;
    /**
     * Finds the node at the given path in a JSON DOM.
     */
    function findNodeAtLocation(root, path) {
        if (!root) {
            return undefined;
        }
        let node = root;
        for (const segment of path) {
            if (typeof segment === 'string') {
                if (node.type !== 'object' || !Array.isArray(node.children)) {
                    return undefined;
                }
                let found = false;
                for (const propertyNode of node.children) {
                    if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                        node = propertyNode.children[1];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return undefined;
                }
            }
            else {
                const index = segment;
                if (node.type !== 'array' || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                    return undefined;
                }
                node = node.children[index];
            }
        }
        return node;
    }
    exports.findNodeAtLocation = findNodeAtLocation;
    /**
     * Gets the JSON path of the given JSON DOM node
     */
    function getNodePath(node) {
        if (!node.parent || !node.parent.children) {
            return [];
        }
        const path = getNodePath(node.parent);
        if (node.parent.type === 'property') {
            const key = node.parent.children[0].value;
            path.push(key);
        }
        else if (node.parent.type === 'array') {
            const index = node.parent.children.indexOf(node);
            if (index !== -1) {
                path.push(index);
            }
        }
        return path;
    }
    exports.getNodePath = getNodePath;
    /**
     * Evaluates the JavaScript object of the given JSON DOM node
     */
    function getNodeValue(node) {
        switch (node.type) {
            case 'array':
                return node.children.map(getNodeValue);
            case 'object': {
                const obj = Object.create(null);
                for (const prop of node.children) {
                    const valueNode = prop.children[1];
                    if (valueNode) {
                        obj[prop.children[0].value] = getNodeValue(valueNode);
                    }
                }
                return obj;
            }
            case 'null':
            case 'string':
            case 'number':
            case 'boolean':
                return node.value;
            default:
                return undefined;
        }
    }
    exports.getNodeValue = getNodeValue;
    function contains(node, offset, includeRightBound = false) {
        return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
    }
    exports.contains = contains;
    /**
     * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
     */
    function findNodeAtOffset(node, offset, includeRightBound = false) {
        if (contains(node, offset, includeRightBound)) {
            const children = node.children;
            if (Array.isArray(children)) {
                for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                    const item = findNodeAtOffset(children[i], offset, includeRightBound);
                    if (item) {
                        return item;
                    }
                }
            }
            return node;
        }
        return undefined;
    }
    exports.findNodeAtOffset = findNodeAtOffset;
    /**
     * Parses the given text and invokes the visitor functions for each object, array and literal reached.
     */
    function visit(text, visitor, options = ParseOptions.DEFAULT) {
        const _scanner = createScanner(text, false);
        function toNoArgVisit(visitFunction) {
            return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
        }
        function toOneArgVisit(visitFunction) {
            return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
        }
        const onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
        const disallowComments = options && options.disallowComments;
        const allowTrailingComma = options && options.allowTrailingComma;
        function scanNext() {
            while (true) {
                const token = _scanner.scan();
                switch (_scanner.getTokenError()) {
                    case 4 /* ScanError.InvalidUnicode */:
                        handleError(14 /* ParseErrorCode.InvalidUnicode */);
                        break;
                    case 5 /* ScanError.InvalidEscapeCharacter */:
                        handleError(15 /* ParseErrorCode.InvalidEscapeCharacter */);
                        break;
                    case 3 /* ScanError.UnexpectedEndOfNumber */:
                        handleError(13 /* ParseErrorCode.UnexpectedEndOfNumber */);
                        break;
                    case 1 /* ScanError.UnexpectedEndOfComment */:
                        if (!disallowComments) {
                            handleError(11 /* ParseErrorCode.UnexpectedEndOfComment */);
                        }
                        break;
                    case 2 /* ScanError.UnexpectedEndOfString */:
                        handleError(12 /* ParseErrorCode.UnexpectedEndOfString */);
                        break;
                    case 6 /* ScanError.InvalidCharacter */:
                        handleError(16 /* ParseErrorCode.InvalidCharacter */);
                        break;
                }
                switch (token) {
                    case 12 /* SyntaxKind.LineCommentTrivia */:
                    case 13 /* SyntaxKind.BlockCommentTrivia */:
                        if (disallowComments) {
                            handleError(10 /* ParseErrorCode.InvalidCommentToken */);
                        }
                        else {
                            onComment();
                        }
                        break;
                    case 16 /* SyntaxKind.Unknown */:
                        handleError(1 /* ParseErrorCode.InvalidSymbol */);
                        break;
                    case 15 /* SyntaxKind.Trivia */:
                    case 14 /* SyntaxKind.LineBreakTrivia */:
                        break;
                    default:
                        return token;
                }
            }
        }
        function handleError(error, skipUntilAfter = [], skipUntil = []) {
            onError(error);
            if (skipUntilAfter.length + skipUntil.length > 0) {
                let token = _scanner.getToken();
                while (token !== 17 /* SyntaxKind.EOF */) {
                    if (skipUntilAfter.indexOf(token) !== -1) {
                        scanNext();
                        break;
                    }
                    else if (skipUntil.indexOf(token) !== -1) {
                        break;
                    }
                    token = scanNext();
                }
            }
        }
        function parseString(isValue) {
            const value = _scanner.getTokenValue();
            if (isValue) {
                onLiteralValue(value);
            }
            else {
                onObjectProperty(value);
            }
            scanNext();
            return true;
        }
        function parseLiteral() {
            switch (_scanner.getToken()) {
                case 11 /* SyntaxKind.NumericLiteral */: {
                    let value = 0;
                    try {
                        value = JSON.parse(_scanner.getTokenValue());
                        if (typeof value !== 'number') {
                            handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                            value = 0;
                        }
                    }
                    catch (e) {
                        handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                    }
                    onLiteralValue(value);
                    break;
                }
                case 7 /* SyntaxKind.NullKeyword */:
                    onLiteralValue(null);
                    break;
                case 8 /* SyntaxKind.TrueKeyword */:
                    onLiteralValue(true);
                    break;
                case 9 /* SyntaxKind.FalseKeyword */:
                    onLiteralValue(false);
                    break;
                default:
                    return false;
            }
            scanNext();
            return true;
        }
        function parseProperty() {
            if (_scanner.getToken() !== 10 /* SyntaxKind.StringLiteral */) {
                handleError(3 /* ParseErrorCode.PropertyNameExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                return false;
            }
            parseString(false);
            if (_scanner.getToken() === 6 /* SyntaxKind.ColonToken */) {
                onSeparator(':');
                scanNext(); // consume colon
                if (!parseValue()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                }
            }
            else {
                handleError(5 /* ParseErrorCode.ColonExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
            }
            return true;
        }
        function parseObject() {
            onObjectBegin();
            scanNext(); // consume open brace
            let needsComma = false;
            while (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
                if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                    if (!needsComma) {
                        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                    }
                    onSeparator(',');
                    scanNext(); // consume comma
                    if (_scanner.getToken() === 2 /* SyntaxKind.CloseBraceToken */ && allowTrailingComma) {
                        break;
                    }
                }
                else if (needsComma) {
                    handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
                }
                if (!parseProperty()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                }
                needsComma = true;
            }
            onObjectEnd();
            if (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */) {
                handleError(7 /* ParseErrorCode.CloseBraceExpected */, [2 /* SyntaxKind.CloseBraceToken */], []);
            }
            else {
                scanNext(); // consume close brace
            }
            return true;
        }
        function parseArray() {
            onArrayBegin();
            scanNext(); // consume open bracket
            let needsComma = false;
            while (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
                if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                    if (!needsComma) {
                        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                    }
                    onSeparator(',');
                    scanNext(); // consume comma
                    if (_scanner.getToken() === 4 /* SyntaxKind.CloseBracketToken */ && allowTrailingComma) {
                        break;
                    }
                }
                else if (needsComma) {
                    handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
                }
                if (!parseValue()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [4 /* SyntaxKind.CloseBracketToken */, 5 /* SyntaxKind.CommaToken */]);
                }
                needsComma = true;
            }
            onArrayEnd();
            if (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */) {
                handleError(8 /* ParseErrorCode.CloseBracketExpected */, [4 /* SyntaxKind.CloseBracketToken */], []);
            }
            else {
                scanNext(); // consume close bracket
            }
            return true;
        }
        function parseValue() {
            switch (_scanner.getToken()) {
                case 3 /* SyntaxKind.OpenBracketToken */:
                    return parseArray();
                case 1 /* SyntaxKind.OpenBraceToken */:
                    return parseObject();
                case 10 /* SyntaxKind.StringLiteral */:
                    return parseString(true);
                default:
                    return parseLiteral();
            }
        }
        scanNext();
        if (_scanner.getToken() === 17 /* SyntaxKind.EOF */) {
            if (options.allowEmptyContent) {
                return true;
            }
            handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
            return false;
        }
        if (!parseValue()) {
            handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
            return false;
        }
        if (_scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
            handleError(9 /* ParseErrorCode.EndOfFileExpected */, [], []);
        }
        return true;
    }
    exports.visit = visit;
    /**
     * Takes JSON with JavaScript-style comments and remove
     * them. Optionally replaces every none-newline character
     * of comments with a replaceCharacter
     */
    function stripComments(text, replaceCh) {
        const _scanner = createScanner(text);
        const parts = [];
        let kind;
        let offset = 0;
        let pos;
        do {
            pos = _scanner.getPosition();
            kind = _scanner.scan();
            switch (kind) {
                case 12 /* SyntaxKind.LineCommentTrivia */:
                case 13 /* SyntaxKind.BlockCommentTrivia */:
                case 17 /* SyntaxKind.EOF */:
                    if (offset !== pos) {
                        parts.push(text.substring(offset, pos));
                    }
                    if (replaceCh !== undefined) {
                        parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
                    }
                    offset = _scanner.getPosition();
                    break;
            }
        } while (kind !== 17 /* SyntaxKind.EOF */);
        return parts.join('');
    }
    exports.stripComments = stripComments;
    function getNodeType(value) {
        switch (typeof value) {
            case 'boolean': return 'boolean';
            case 'number': return 'number';
            case 'string': return 'string';
            case 'object': {
                if (!value) {
                    return 'null';
                }
                else if (Array.isArray(value)) {
                    return 'array';
                }
                return 'object';
            }
            default: return 'null';
        }
    }
    exports.getNodeType = getNodeType;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[311/*vs/base/common/jsonFormatter*/], __M([1/*require*/,0/*exports*/,136/*vs/base/common/json*/]), function (require, exports, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEOL = exports.getEOL = exports.toFormattedString = exports.format = void 0;
    function format(documentText, range, options) {
        let initialIndentLevel;
        let formatText;
        let formatTextStart;
        let rangeStart;
        let rangeEnd;
        if (range) {
            rangeStart = range.offset;
            rangeEnd = rangeStart + range.length;
            formatTextStart = rangeStart;
            while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
                formatTextStart--;
            }
            let endOffset = rangeEnd;
            while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
                endOffset++;
            }
            formatText = documentText.substring(formatTextStart, endOffset);
            initialIndentLevel = computeIndentLevel(formatText, options);
        }
        else {
            formatText = documentText;
            initialIndentLevel = 0;
            formatTextStart = 0;
            rangeStart = 0;
            rangeEnd = documentText.length;
        }
        const eol = getEOL(options, documentText);
        let lineBreak = false;
        let indentLevel = 0;
        let indentValue;
        if (options.insertSpaces) {
            indentValue = repeat(' ', options.tabSize || 4);
        }
        else {
            indentValue = '\t';
        }
        const scanner = (0, json_1.createScanner)(formatText, false);
        let hasError = false;
        function newLineAndIndent() {
            return eol + repeat(indentValue, initialIndentLevel + indentLevel);
        }
        function scanNext() {
            let token = scanner.scan();
            lineBreak = false;
            while (token === 15 /* SyntaxKind.Trivia */ || token === 14 /* SyntaxKind.LineBreakTrivia */) {
                lineBreak = lineBreak || (token === 14 /* SyntaxKind.LineBreakTrivia */);
                token = scanner.scan();
            }
            hasError = token === 16 /* SyntaxKind.Unknown */ || scanner.getTokenError() !== 0 /* ScanError.None */;
            return token;
        }
        const editOperations = [];
        function addEdit(text, startOffset, endOffset) {
            if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
                editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
            }
        }
        let firstToken = scanNext();
        if (firstToken !== 17 /* SyntaxKind.EOF */) {
            const firstTokenStart = scanner.getTokenOffset() + formatTextStart;
            const initialIndent = repeat(indentValue, initialIndentLevel);
            addEdit(initialIndent, formatTextStart, firstTokenStart);
        }
        while (firstToken !== 17 /* SyntaxKind.EOF */) {
            let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            let secondToken = scanNext();
            let replaceContent = '';
            while (!lineBreak && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                // comments on the same line: keep them on the same line, but ignore them otherwise
                const commentTokenStart = scanner.getTokenOffset() + formatTextStart;
                addEdit(' ', firstTokenEnd, commentTokenStart);
                firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
                replaceContent = secondToken === 12 /* SyntaxKind.LineCommentTrivia */ ? newLineAndIndent() : '';
                secondToken = scanNext();
            }
            if (secondToken === 2 /* SyntaxKind.CloseBraceToken */) {
                if (firstToken !== 1 /* SyntaxKind.OpenBraceToken */) {
                    indentLevel--;
                    replaceContent = newLineAndIndent();
                }
            }
            else if (secondToken === 4 /* SyntaxKind.CloseBracketToken */) {
                if (firstToken !== 3 /* SyntaxKind.OpenBracketToken */) {
                    indentLevel--;
                    replaceContent = newLineAndIndent();
                }
            }
            else {
                switch (firstToken) {
                    case 3 /* SyntaxKind.OpenBracketToken */:
                    case 1 /* SyntaxKind.OpenBraceToken */:
                        indentLevel++;
                        replaceContent = newLineAndIndent();
                        break;
                    case 5 /* SyntaxKind.CommaToken */:
                    case 12 /* SyntaxKind.LineCommentTrivia */:
                        replaceContent = newLineAndIndent();
                        break;
                    case 13 /* SyntaxKind.BlockCommentTrivia */:
                        if (lineBreak) {
                            replaceContent = newLineAndIndent();
                        }
                        else {
                            // symbol following comment on the same line: keep on same line, separate with ' '
                            replaceContent = ' ';
                        }
                        break;
                    case 6 /* SyntaxKind.ColonToken */:
                        replaceContent = ' ';
                        break;
                    case 10 /* SyntaxKind.StringLiteral */:
                        if (secondToken === 6 /* SyntaxKind.ColonToken */) {
                            replaceContent = '';
                            break;
                        }
                    // fall through
                    case 7 /* SyntaxKind.NullKeyword */:
                    case 8 /* SyntaxKind.TrueKeyword */:
                    case 9 /* SyntaxKind.FalseKeyword */:
                    case 11 /* SyntaxKind.NumericLiteral */:
                    case 2 /* SyntaxKind.CloseBraceToken */:
                    case 4 /* SyntaxKind.CloseBracketToken */:
                        if (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */) {
                            replaceContent = ' ';
                        }
                        else if (secondToken !== 5 /* SyntaxKind.CommaToken */ && secondToken !== 17 /* SyntaxKind.EOF */) {
                            hasError = true;
                        }
                        break;
                    case 16 /* SyntaxKind.Unknown */:
                        hasError = true;
                        break;
                }
                if (lineBreak && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                    replaceContent = newLineAndIndent();
                }
            }
            const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(replaceContent, firstTokenEnd, secondTokenStart);
            firstToken = secondToken;
        }
        return editOperations;
    }
    exports.format = format;
    /**
     * Creates a formatted string out of the object passed as argument, using the given formatting options
     * @param any The object to stringify and format
     * @param options The formatting options to use
     */
    function toFormattedString(obj, options) {
        const content = JSON.stringify(obj, undefined, options.insertSpaces ? options.tabSize || 4 : '\t');
        if (options.eol !== undefined) {
            return content.replace(/\r\n|\r|\n/g, options.eol);
        }
        return content;
    }
    exports.toFormattedString = toFormattedString;
    function repeat(s, count) {
        let result = '';
        for (let i = 0; i < count; i++) {
            result += s;
        }
        return result;
    }
    function computeIndentLevel(content, options) {
        let i = 0;
        let nChars = 0;
        const tabSize = options.tabSize || 4;
        while (i < content.length) {
            const ch = content.charAt(i);
            if (ch === ' ') {
                nChars++;
            }
            else if (ch === '\t') {
                nChars += tabSize;
            }
            else {
                break;
            }
            i++;
        }
        return Math.floor(nChars / tabSize);
    }
    function getEOL(options, text) {
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (ch === '\r') {
                if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                    return '\r\n';
                }
                return '\r';
            }
            else if (ch === '\n') {
                return '\n';
            }
        }
        return (options && options.eol) || '\n';
    }
    exports.getEOL = getEOL;
    function isEOL(text, offset) {
        return '\r\n'.indexOf(text.charAt(offset)) !== -1;
    }
    exports.isEOL = isEOL;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[373/*vs/base/common/jsonEdit*/], __M([1/*require*/,0/*exports*/,136/*vs/base/common/json*/,311/*vs/base/common/jsonFormatter*/]), function (require, exports, json_1, jsonFormatter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyEdits = exports.applyEdit = exports.withFormatting = exports.setProperty = exports.removeProperty = void 0;
    function removeProperty(text, path, formattingOptions) {
        return setProperty(text, path, undefined, formattingOptions);
    }
    exports.removeProperty = removeProperty;
    function setProperty(text, originalPath, value, formattingOptions, getInsertionIndex) {
        const path = originalPath.slice();
        const errors = [];
        const root = (0, json_1.parseTree)(text, errors);
        let parent = undefined;
        let lastSegment = undefined;
        while (path.length > 0) {
            lastSegment = path.pop();
            parent = (0, json_1.findNodeAtLocation)(root, path);
            if (parent === undefined && value !== undefined) {
                if (typeof lastSegment === 'string') {
                    value = { [lastSegment]: value };
                }
                else {
                    value = [value];
                }
            }
            else {
                break;
            }
        }
        if (!parent) {
            // empty document
            if (value === undefined) { // delete
                throw new Error('Can not delete in empty document');
            }
            return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, formattingOptions);
        }
        else if (parent.type === 'object' && typeof lastSegment === 'string' && Array.isArray(parent.children)) {
            const existing = (0, json_1.findNodeAtLocation)(parent, [lastSegment]);
            if (existing !== undefined) {
                if (value === undefined) { // delete
                    if (!existing.parent) {
                        throw new Error('Malformed AST');
                    }
                    const propertyIndex = parent.children.indexOf(existing.parent);
                    let removeBegin;
                    let removeEnd = existing.parent.offset + existing.parent.length;
                    if (propertyIndex > 0) {
                        // remove the comma of the previous node
                        const previous = parent.children[propertyIndex - 1];
                        removeBegin = previous.offset + previous.length;
                    }
                    else {
                        removeBegin = parent.offset + 1;
                        if (parent.children.length > 1) {
                            // remove the comma of the next node
                            const next = parent.children[1];
                            removeEnd = next.offset;
                        }
                    }
                    return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: '' }, formattingOptions);
                }
                else {
                    // set value of existing property
                    return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, formattingOptions);
                }
            }
            else {
                if (value === undefined) { // delete
                    return []; // property does not exist, nothing to do
                }
                const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
                const index = getInsertionIndex ? getInsertionIndex(parent.children.map(p => p.children[0].value)) : parent.children.length;
                let edit;
                if (index > 0) {
                    const previous = parent.children[index - 1];
                    edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
                }
                else if (parent.children.length === 0) {
                    edit = { offset: parent.offset + 1, length: 0, content: newProperty };
                }
                else {
                    edit = { offset: parent.offset + 1, length: 0, content: newProperty + ',' };
                }
                return withFormatting(text, edit, formattingOptions);
            }
        }
        else if (parent.type === 'array' && typeof lastSegment === 'number' && Array.isArray(parent.children)) {
            if (value !== undefined) {
                // Insert
                const newProperty = `${JSON.stringify(value)}`;
                let edit;
                if (parent.children.length === 0 || lastSegment === 0) {
                    edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + ',' };
                }
                else {
                    const index = lastSegment === -1 || lastSegment > parent.children.length ? parent.children.length : lastSegment;
                    const previous = parent.children[index - 1];
                    edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
                }
                return withFormatting(text, edit, formattingOptions);
            }
            else {
                //Removal
                const removalIndex = lastSegment;
                const toRemove = parent.children[removalIndex];
                let edit;
                if (parent.children.length === 1) {
                    // only item
                    edit = { offset: parent.offset + 1, length: parent.length - 2, content: '' };
                }
                else if (parent.children.length - 1 === removalIndex) {
                    // last item
                    const previous = parent.children[removalIndex - 1];
                    const offset = previous.offset + previous.length;
                    const parentEndOffset = parent.offset + parent.length;
                    edit = { offset, length: parentEndOffset - 2 - offset, content: '' };
                }
                else {
                    edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: '' };
                }
                return withFormatting(text, edit, formattingOptions);
            }
        }
        else {
            throw new Error(`Can not add ${typeof lastSegment !== 'number' ? 'index' : 'property'} to parent of type ${parent.type}`);
        }
    }
    exports.setProperty = setProperty;
    function withFormatting(text, edit, formattingOptions) {
        // apply the edit
        let newText = applyEdit(text, edit);
        // format the new text
        let begin = edit.offset;
        let end = edit.offset + edit.content.length;
        if (edit.length === 0 || edit.content.length === 0) { // insert or remove
            while (begin > 0 && !(0, jsonFormatter_1.isEOL)(newText, begin - 1)) {
                begin--;
            }
            while (end < newText.length && !(0, jsonFormatter_1.isEOL)(newText, end)) {
                end++;
            }
        }
        const edits = (0, jsonFormatter_1.format)(newText, { offset: begin, length: end - begin }, formattingOptions);
        // apply the formatting edits and track the begin and end offsets of the changes
        for (let i = edits.length - 1; i >= 0; i--) {
            const curr = edits[i];
            newText = applyEdit(newText, curr);
            begin = Math.min(begin, curr.offset);
            end = Math.max(end, curr.offset + curr.length);
            end += curr.content.length - curr.length;
        }
        // create a single edit with all changes
        const editLength = text.length - (newText.length - end) - begin;
        return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
    }
    exports.withFormatting = withFormatting;
    function applyEdit(text, edit) {
        return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
    }
    exports.applyEdit = applyEdit;
    function applyEdits(text, edits) {
        const sortedEdits = edits.slice(0).sort((a, b) => {
            const diff = a.offset - b.offset;
            if (diff === 0) {
                return a.length - b.length;
            }
            return diff;
        });
        let lastModifiedOffset = text.length;
        for (let i = sortedEdits.length - 1; i >= 0; i--) {
            const e = sortedEdits[i];
            if (e.offset + e.length <= lastModifiedOffset) {
                text = applyEdit(text, e);
            }
            else {
                throw new Error('Overlapping edit');
            }
            lastModifiedOffset = e.offset;
        }
        return text;
    }
    exports.applyEdits = applyEdits;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[108/*vs/base/common/keyCodes*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeyChord = exports.KeyMod = exports.KeyCodeUtils = exports.IMMUTABLE_KEY_CODE_TO_CODE = exports.IMMUTABLE_CODE_TO_KEY_CODE = exports.ScanCodeUtils = exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = exports.EVENT_KEY_CODE_MAP = exports.ScanCode = exports.KeyCode = void 0;
    /**
     * Virtual Key Codes, the value does not hold any inherent meaning.
     * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
     * But these are "more general", as they should work across browsers & OS`s.
     */
    var KeyCode;
    (function (KeyCode) {
        KeyCode[KeyCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
        /**
         * Placed first to cover the 0 value of the enum.
         */
        KeyCode[KeyCode["Unknown"] = 0] = "Unknown";
        KeyCode[KeyCode["Backspace"] = 1] = "Backspace";
        KeyCode[KeyCode["Tab"] = 2] = "Tab";
        KeyCode[KeyCode["Enter"] = 3] = "Enter";
        KeyCode[KeyCode["Shift"] = 4] = "Shift";
        KeyCode[KeyCode["Ctrl"] = 5] = "Ctrl";
        KeyCode[KeyCode["Alt"] = 6] = "Alt";
        KeyCode[KeyCode["PauseBreak"] = 7] = "PauseBreak";
        KeyCode[KeyCode["CapsLock"] = 8] = "CapsLock";
        KeyCode[KeyCode["Escape"] = 9] = "Escape";
        KeyCode[KeyCode["Space"] = 10] = "Space";
        KeyCode[KeyCode["PageUp"] = 11] = "PageUp";
        KeyCode[KeyCode["PageDown"] = 12] = "PageDown";
        KeyCode[KeyCode["End"] = 13] = "End";
        KeyCode[KeyCode["Home"] = 14] = "Home";
        KeyCode[KeyCode["LeftArrow"] = 15] = "LeftArrow";
        KeyCode[KeyCode["UpArrow"] = 16] = "UpArrow";
        KeyCode[KeyCode["RightArrow"] = 17] = "RightArrow";
        KeyCode[KeyCode["DownArrow"] = 18] = "DownArrow";
        KeyCode[KeyCode["Insert"] = 19] = "Insert";
        KeyCode[KeyCode["Delete"] = 20] = "Delete";
        KeyCode[KeyCode["Digit0"] = 21] = "Digit0";
        KeyCode[KeyCode["Digit1"] = 22] = "Digit1";
        KeyCode[KeyCode["Digit2"] = 23] = "Digit2";
        KeyCode[KeyCode["Digit3"] = 24] = "Digit3";
        KeyCode[KeyCode["Digit4"] = 25] = "Digit4";
        KeyCode[KeyCode["Digit5"] = 26] = "Digit5";
        KeyCode[KeyCode["Digit6"] = 27] = "Digit6";
        KeyCode[KeyCode["Digit7"] = 28] = "Digit7";
        KeyCode[KeyCode["Digit8"] = 29] = "Digit8";
        KeyCode[KeyCode["Digit9"] = 30] = "Digit9";
        KeyCode[KeyCode["KeyA"] = 31] = "KeyA";
        KeyCode[KeyCode["KeyB"] = 32] = "KeyB";
        KeyCode[KeyCode["KeyC"] = 33] = "KeyC";
        KeyCode[KeyCode["KeyD"] = 34] = "KeyD";
        KeyCode[KeyCode["KeyE"] = 35] = "KeyE";
        KeyCode[KeyCode["KeyF"] = 36] = "KeyF";
        KeyCode[KeyCode["KeyG"] = 37] = "KeyG";
        KeyCode[KeyCode["KeyH"] = 38] = "KeyH";
        KeyCode[KeyCode["KeyI"] = 39] = "KeyI";
        KeyCode[KeyCode["KeyJ"] = 40] = "KeyJ";
        KeyCode[KeyCode["KeyK"] = 41] = "KeyK";
        KeyCode[KeyCode["KeyL"] = 42] = "KeyL";
        KeyCode[KeyCode["KeyM"] = 43] = "KeyM";
        KeyCode[KeyCode["KeyN"] = 44] = "KeyN";
        KeyCode[KeyCode["KeyO"] = 45] = "KeyO";
        KeyCode[KeyCode["KeyP"] = 46] = "KeyP";
        KeyCode[KeyCode["KeyQ"] = 47] = "KeyQ";
        KeyCode[KeyCode["KeyR"] = 48] = "KeyR";
        KeyCode[KeyCode["KeyS"] = 49] = "KeyS";
        KeyCode[KeyCode["KeyT"] = 50] = "KeyT";
        KeyCode[KeyCode["KeyU"] = 51] = "KeyU";
        KeyCode[KeyCode["KeyV"] = 52] = "KeyV";
        KeyCode[KeyCode["KeyW"] = 53] = "KeyW";
        KeyCode[KeyCode["KeyX"] = 54] = "KeyX";
        KeyCode[KeyCode["KeyY"] = 55] = "KeyY";
        KeyCode[KeyCode["KeyZ"] = 56] = "KeyZ";
        KeyCode[KeyCode["Meta"] = 57] = "Meta";
        KeyCode[KeyCode["ContextMenu"] = 58] = "ContextMenu";
        KeyCode[KeyCode["F1"] = 59] = "F1";
        KeyCode[KeyCode["F2"] = 60] = "F2";
        KeyCode[KeyCode["F3"] = 61] = "F3";
        KeyCode[KeyCode["F4"] = 62] = "F4";
        KeyCode[KeyCode["F5"] = 63] = "F5";
        KeyCode[KeyCode["F6"] = 64] = "F6";
        KeyCode[KeyCode["F7"] = 65] = "F7";
        KeyCode[KeyCode["F8"] = 66] = "F8";
        KeyCode[KeyCode["F9"] = 67] = "F9";
        KeyCode[KeyCode["F10"] = 68] = "F10";
        KeyCode[KeyCode["F11"] = 69] = "F11";
        KeyCode[KeyCode["F12"] = 70] = "F12";
        KeyCode[KeyCode["F13"] = 71] = "F13";
        KeyCode[KeyCode["F14"] = 72] = "F14";
        KeyCode[KeyCode["F15"] = 73] = "F15";
        KeyCode[KeyCode["F16"] = 74] = "F16";
        KeyCode[KeyCode["F17"] = 75] = "F17";
        KeyCode[KeyCode["F18"] = 76] = "F18";
        KeyCode[KeyCode["F19"] = 77] = "F19";
        KeyCode[KeyCode["F20"] = 78] = "F20";
        KeyCode[KeyCode["F21"] = 79] = "F21";
        KeyCode[KeyCode["F22"] = 80] = "F22";
        KeyCode[KeyCode["F23"] = 81] = "F23";
        KeyCode[KeyCode["F24"] = 82] = "F24";
        KeyCode[KeyCode["NumLock"] = 83] = "NumLock";
        KeyCode[KeyCode["ScrollLock"] = 84] = "ScrollLock";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ';:' key
         */
        KeyCode[KeyCode["Semicolon"] = 85] = "Semicolon";
        /**
         * For any country/region, the '+' key
         * For the US standard keyboard, the '=+' key
         */
        KeyCode[KeyCode["Equal"] = 86] = "Equal";
        /**
         * For any country/region, the ',' key
         * For the US standard keyboard, the ',<' key
         */
        KeyCode[KeyCode["Comma"] = 87] = "Comma";
        /**
         * For any country/region, the '-' key
         * For the US standard keyboard, the '-_' key
         */
        KeyCode[KeyCode["Minus"] = 88] = "Minus";
        /**
         * For any country/region, the '.' key
         * For the US standard keyboard, the '.>' key
         */
        KeyCode[KeyCode["Period"] = 89] = "Period";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '/?' key
         */
        KeyCode[KeyCode["Slash"] = 90] = "Slash";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '`~' key
         */
        KeyCode[KeyCode["Backquote"] = 91] = "Backquote";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '[{' key
         */
        KeyCode[KeyCode["BracketLeft"] = 92] = "BracketLeft";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '\|' key
         */
        KeyCode[KeyCode["Backslash"] = 93] = "Backslash";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ']}' key
         */
        KeyCode[KeyCode["BracketRight"] = 94] = "BracketRight";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ''"' key
         */
        KeyCode[KeyCode["Quote"] = 95] = "Quote";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         */
        KeyCode[KeyCode["OEM_8"] = 96] = "OEM_8";
        /**
         * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
         */
        KeyCode[KeyCode["IntlBackslash"] = 97] = "IntlBackslash";
        KeyCode[KeyCode["Numpad0"] = 98] = "Numpad0";
        KeyCode[KeyCode["Numpad1"] = 99] = "Numpad1";
        KeyCode[KeyCode["Numpad2"] = 100] = "Numpad2";
        KeyCode[KeyCode["Numpad3"] = 101] = "Numpad3";
        KeyCode[KeyCode["Numpad4"] = 102] = "Numpad4";
        KeyCode[KeyCode["Numpad5"] = 103] = "Numpad5";
        KeyCode[KeyCode["Numpad6"] = 104] = "Numpad6";
        KeyCode[KeyCode["Numpad7"] = 105] = "Numpad7";
        KeyCode[KeyCode["Numpad8"] = 106] = "Numpad8";
        KeyCode[KeyCode["Numpad9"] = 107] = "Numpad9";
        KeyCode[KeyCode["NumpadMultiply"] = 108] = "NumpadMultiply";
        KeyCode[KeyCode["NumpadAdd"] = 109] = "NumpadAdd";
        KeyCode[KeyCode["NUMPAD_SEPARATOR"] = 110] = "NUMPAD_SEPARATOR";
        KeyCode[KeyCode["NumpadSubtract"] = 111] = "NumpadSubtract";
        KeyCode[KeyCode["NumpadDecimal"] = 112] = "NumpadDecimal";
        KeyCode[KeyCode["NumpadDivide"] = 113] = "NumpadDivide";
        /**
         * Cover all key codes when IME is processing input.
         */
        KeyCode[KeyCode["KEY_IN_COMPOSITION"] = 114] = "KEY_IN_COMPOSITION";
        KeyCode[KeyCode["ABNT_C1"] = 115] = "ABNT_C1";
        KeyCode[KeyCode["ABNT_C2"] = 116] = "ABNT_C2";
        KeyCode[KeyCode["AudioVolumeMute"] = 117] = "AudioVolumeMute";
        KeyCode[KeyCode["AudioVolumeUp"] = 118] = "AudioVolumeUp";
        KeyCode[KeyCode["AudioVolumeDown"] = 119] = "AudioVolumeDown";
        KeyCode[KeyCode["BrowserSearch"] = 120] = "BrowserSearch";
        KeyCode[KeyCode["BrowserHome"] = 121] = "BrowserHome";
        KeyCode[KeyCode["BrowserBack"] = 122] = "BrowserBack";
        KeyCode[KeyCode["BrowserForward"] = 123] = "BrowserForward";
        KeyCode[KeyCode["MediaTrackNext"] = 124] = "MediaTrackNext";
        KeyCode[KeyCode["MediaTrackPrevious"] = 125] = "MediaTrackPrevious";
        KeyCode[KeyCode["MediaStop"] = 126] = "MediaStop";
        KeyCode[KeyCode["MediaPlayPause"] = 127] = "MediaPlayPause";
        KeyCode[KeyCode["LaunchMediaPlayer"] = 128] = "LaunchMediaPlayer";
        KeyCode[KeyCode["LaunchMail"] = 129] = "LaunchMail";
        KeyCode[KeyCode["LaunchApp2"] = 130] = "LaunchApp2";
        /**
         * VK_CLEAR, 0x0C, CLEAR key
         */
        KeyCode[KeyCode["Clear"] = 131] = "Clear";
        /**
         * Placed last to cover the length of the enum.
         * Please do not depend on this value!
         */
        KeyCode[KeyCode["MAX_VALUE"] = 132] = "MAX_VALUE";
    })(KeyCode || (exports.KeyCode = KeyCode = {}));
    /**
     * keyboardEvent.code
     */
    var ScanCode;
    (function (ScanCode) {
        ScanCode[ScanCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
        ScanCode[ScanCode["None"] = 0] = "None";
        ScanCode[ScanCode["Hyper"] = 1] = "Hyper";
        ScanCode[ScanCode["Super"] = 2] = "Super";
        ScanCode[ScanCode["Fn"] = 3] = "Fn";
        ScanCode[ScanCode["FnLock"] = 4] = "FnLock";
        ScanCode[ScanCode["Suspend"] = 5] = "Suspend";
        ScanCode[ScanCode["Resume"] = 6] = "Resume";
        ScanCode[ScanCode["Turbo"] = 7] = "Turbo";
        ScanCode[ScanCode["Sleep"] = 8] = "Sleep";
        ScanCode[ScanCode["WakeUp"] = 9] = "WakeUp";
        ScanCode[ScanCode["KeyA"] = 10] = "KeyA";
        ScanCode[ScanCode["KeyB"] = 11] = "KeyB";
        ScanCode[ScanCode["KeyC"] = 12] = "KeyC";
        ScanCode[ScanCode["KeyD"] = 13] = "KeyD";
        ScanCode[ScanCode["KeyE"] = 14] = "KeyE";
        ScanCode[ScanCode["KeyF"] = 15] = "KeyF";
        ScanCode[ScanCode["KeyG"] = 16] = "KeyG";
        ScanCode[ScanCode["KeyH"] = 17] = "KeyH";
        ScanCode[ScanCode["KeyI"] = 18] = "KeyI";
        ScanCode[ScanCode["KeyJ"] = 19] = "KeyJ";
        ScanCode[ScanCode["KeyK"] = 20] = "KeyK";
        ScanCode[ScanCode["KeyL"] = 21] = "KeyL";
        ScanCode[ScanCode["KeyM"] = 22] = "KeyM";
        ScanCode[ScanCode["KeyN"] = 23] = "KeyN";
        ScanCode[ScanCode["KeyO"] = 24] = "KeyO";
        ScanCode[ScanCode["KeyP"] = 25] = "KeyP";
        ScanCode[ScanCode["KeyQ"] = 26] = "KeyQ";
        ScanCode[ScanCode["KeyR"] = 27] = "KeyR";
        ScanCode[ScanCode["KeyS"] = 28] = "KeyS";
        ScanCode[ScanCode["KeyT"] = 29] = "KeyT";
        ScanCode[ScanCode["KeyU"] = 30] = "KeyU";
        ScanCode[ScanCode["KeyV"] = 31] = "KeyV";
        ScanCode[ScanCode["KeyW"] = 32] = "KeyW";
        ScanCode[ScanCode["KeyX"] = 33] = "KeyX";
        ScanCode[ScanCode["KeyY"] = 34] = "KeyY";
        ScanCode[ScanCode["KeyZ"] = 35] = "KeyZ";
        ScanCode[ScanCode["Digit1"] = 36] = "Digit1";
        ScanCode[ScanCode["Digit2"] = 37] = "Digit2";
        ScanCode[ScanCode["Digit3"] = 38] = "Digit3";
        ScanCode[ScanCode["Digit4"] = 39] = "Digit4";
        ScanCode[ScanCode["Digit5"] = 40] = "Digit5";
        ScanCode[ScanCode["Digit6"] = 41] = "Digit6";
        ScanCode[ScanCode["Digit7"] = 42] = "Digit7";
        ScanCode[ScanCode["Digit8"] = 43] = "Digit8";
        ScanCode[ScanCode["Digit9"] = 44] = "Digit9";
        ScanCode[ScanCode["Digit0"] = 45] = "Digit0";
        ScanCode[ScanCode["Enter"] = 46] = "Enter";
        ScanCode[ScanCode["Escape"] = 47] = "Escape";
        ScanCode[ScanCode["Backspace"] = 48] = "Backspace";
        ScanCode[ScanCode["Tab"] = 49] = "Tab";
        ScanCode[ScanCode["Space"] = 50] = "Space";
        ScanCode[ScanCode["Minus"] = 51] = "Minus";
        ScanCode[ScanCode["Equal"] = 52] = "Equal";
        ScanCode[ScanCode["BracketLeft"] = 53] = "BracketLeft";
        ScanCode[ScanCode["BracketRight"] = 54] = "BracketRight";
        ScanCode[ScanCode["Backslash"] = 55] = "Backslash";
        ScanCode[ScanCode["IntlHash"] = 56] = "IntlHash";
        ScanCode[ScanCode["Semicolon"] = 57] = "Semicolon";
        ScanCode[ScanCode["Quote"] = 58] = "Quote";
        ScanCode[ScanCode["Backquote"] = 59] = "Backquote";
        ScanCode[ScanCode["Comma"] = 60] = "Comma";
        ScanCode[ScanCode["Period"] = 61] = "Period";
        ScanCode[ScanCode["Slash"] = 62] = "Slash";
        ScanCode[ScanCode["CapsLock"] = 63] = "CapsLock";
        ScanCode[ScanCode["F1"] = 64] = "F1";
        ScanCode[ScanCode["F2"] = 65] = "F2";
        ScanCode[ScanCode["F3"] = 66] = "F3";
        ScanCode[ScanCode["F4"] = 67] = "F4";
        ScanCode[ScanCode["F5"] = 68] = "F5";
        ScanCode[ScanCode["F6"] = 69] = "F6";
        ScanCode[ScanCode["F7"] = 70] = "F7";
        ScanCode[ScanCode["F8"] = 71] = "F8";
        ScanCode[ScanCode["F9"] = 72] = "F9";
        ScanCode[ScanCode["F10"] = 73] = "F10";
        ScanCode[ScanCode["F11"] = 74] = "F11";
        ScanCode[ScanCode["F12"] = 75] = "F12";
        ScanCode[ScanCode["PrintScreen"] = 76] = "PrintScreen";
        ScanCode[ScanCode["ScrollLock"] = 77] = "ScrollLock";
        ScanCode[ScanCode["Pause"] = 78] = "Pause";
        ScanCode[ScanCode["Insert"] = 79] = "Insert";
        ScanCode[ScanCode["Home"] = 80] = "Home";
        ScanCode[ScanCode["PageUp"] = 81] = "PageUp";
        ScanCode[ScanCode["Delete"] = 82] = "Delete";
        ScanCode[ScanCode["End"] = 83] = "End";
        ScanCode[ScanCode["PageDown"] = 84] = "PageDown";
        ScanCode[ScanCode["ArrowRight"] = 85] = "ArrowRight";
        ScanCode[ScanCode["ArrowLeft"] = 86] = "ArrowLeft";
        ScanCode[ScanCode["ArrowDown"] = 87] = "ArrowDown";
        ScanCode[ScanCode["ArrowUp"] = 88] = "ArrowUp";
        ScanCode[ScanCode["NumLock"] = 89] = "NumLock";
        ScanCode[ScanCode["NumpadDivide"] = 90] = "NumpadDivide";
        ScanCode[ScanCode["NumpadMultiply"] = 91] = "NumpadMultiply";
        ScanCode[ScanCode["NumpadSubtract"] = 92] = "NumpadSubtract";
        ScanCode[ScanCode["NumpadAdd"] = 93] = "NumpadAdd";
        ScanCode[ScanCode["NumpadEnter"] = 94] = "NumpadEnter";
        ScanCode[ScanCode["Numpad1"] = 95] = "Numpad1";
        ScanCode[ScanCode["Numpad2"] = 96] = "Numpad2";
        ScanCode[ScanCode["Numpad3"] = 97] = "Numpad3";
        ScanCode[ScanCode["Numpad4"] = 98] = "Numpad4";
        ScanCode[ScanCode["Numpad5"] = 99] = "Numpad5";
        ScanCode[ScanCode["Numpad6"] = 100] = "Numpad6";
        ScanCode[ScanCode["Numpad7"] = 101] = "Numpad7";
        ScanCode[ScanCode["Numpad8"] = 102] = "Numpad8";
        ScanCode[ScanCode["Numpad9"] = 103] = "Numpad9";
        ScanCode[ScanCode["Numpad0"] = 104] = "Numpad0";
        ScanCode[ScanCode["NumpadDecimal"] = 105] = "NumpadDecimal";
        ScanCode[ScanCode["IntlBackslash"] = 106] = "IntlBackslash";
        ScanCode[ScanCode["ContextMenu"] = 107] = "ContextMenu";
        ScanCode[ScanCode["Power"] = 108] = "Power";
        ScanCode[ScanCode["NumpadEqual"] = 109] = "NumpadEqual";
        ScanCode[ScanCode["F13"] = 110] = "F13";
        ScanCode[ScanCode["F14"] = 111] = "F14";
        ScanCode[ScanCode["F15"] = 112] = "F15";
        ScanCode[ScanCode["F16"] = 113] = "F16";
        ScanCode[ScanCode["F17"] = 114] = "F17";
        ScanCode[ScanCode["F18"] = 115] = "F18";
        ScanCode[ScanCode["F19"] = 116] = "F19";
        ScanCode[ScanCode["F20"] = 117] = "F20";
        ScanCode[ScanCode["F21"] = 118] = "F21";
        ScanCode[ScanCode["F22"] = 119] = "F22";
        ScanCode[ScanCode["F23"] = 120] = "F23";
        ScanCode[ScanCode["F24"] = 121] = "F24";
        ScanCode[ScanCode["Open"] = 122] = "Open";
        ScanCode[ScanCode["Help"] = 123] = "Help";
        ScanCode[ScanCode["Select"] = 124] = "Select";
        ScanCode[ScanCode["Again"] = 125] = "Again";
        ScanCode[ScanCode["Undo"] = 126] = "Undo";
        ScanCode[ScanCode["Cut"] = 127] = "Cut";
        ScanCode[ScanCode["Copy"] = 128] = "Copy";
        ScanCode[ScanCode["Paste"] = 129] = "Paste";
        ScanCode[ScanCode["Find"] = 130] = "Find";
        ScanCode[ScanCode["AudioVolumeMute"] = 131] = "AudioVolumeMute";
        ScanCode[ScanCode["AudioVolumeUp"] = 132] = "AudioVolumeUp";
        ScanCode[ScanCode["AudioVolumeDown"] = 133] = "AudioVolumeDown";
        ScanCode[ScanCode["NumpadComma"] = 134] = "NumpadComma";
        ScanCode[ScanCode["IntlRo"] = 135] = "IntlRo";
        ScanCode[ScanCode["KanaMode"] = 136] = "KanaMode";
        ScanCode[ScanCode["IntlYen"] = 137] = "IntlYen";
        ScanCode[ScanCode["Convert"] = 138] = "Convert";
        ScanCode[ScanCode["NonConvert"] = 139] = "NonConvert";
        ScanCode[ScanCode["Lang1"] = 140] = "Lang1";
        ScanCode[ScanCode["Lang2"] = 141] = "Lang2";
        ScanCode[ScanCode["Lang3"] = 142] = "Lang3";
        ScanCode[ScanCode["Lang4"] = 143] = "Lang4";
        ScanCode[ScanCode["Lang5"] = 144] = "Lang5";
        ScanCode[ScanCode["Abort"] = 145] = "Abort";
        ScanCode[ScanCode["Props"] = 146] = "Props";
        ScanCode[ScanCode["NumpadParenLeft"] = 147] = "NumpadParenLeft";
        ScanCode[ScanCode["NumpadParenRight"] = 148] = "NumpadParenRight";
        ScanCode[ScanCode["NumpadBackspace"] = 149] = "NumpadBackspace";
        ScanCode[ScanCode["NumpadMemoryStore"] = 150] = "NumpadMemoryStore";
        ScanCode[ScanCode["NumpadMemoryRecall"] = 151] = "NumpadMemoryRecall";
        ScanCode[ScanCode["NumpadMemoryClear"] = 152] = "NumpadMemoryClear";
        ScanCode[ScanCode["NumpadMemoryAdd"] = 153] = "NumpadMemoryAdd";
        ScanCode[ScanCode["NumpadMemorySubtract"] = 154] = "NumpadMemorySubtract";
        ScanCode[ScanCode["NumpadClear"] = 155] = "NumpadClear";
        ScanCode[ScanCode["NumpadClearEntry"] = 156] = "NumpadClearEntry";
        ScanCode[ScanCode["ControlLeft"] = 157] = "ControlLeft";
        ScanCode[ScanCode["ShiftLeft"] = 158] = "ShiftLeft";
        ScanCode[ScanCode["AltLeft"] = 159] = "AltLeft";
        ScanCode[ScanCode["MetaLeft"] = 160] = "MetaLeft";
        ScanCode[ScanCode["ControlRight"] = 161] = "ControlRight";
        ScanCode[ScanCode["ShiftRight"] = 162] = "ShiftRight";
        ScanCode[ScanCode["AltRight"] = 163] = "AltRight";
        ScanCode[ScanCode["MetaRight"] = 164] = "MetaRight";
        ScanCode[ScanCode["BrightnessUp"] = 165] = "BrightnessUp";
        ScanCode[ScanCode["BrightnessDown"] = 166] = "BrightnessDown";
        ScanCode[ScanCode["MediaPlay"] = 167] = "MediaPlay";
        ScanCode[ScanCode["MediaRecord"] = 168] = "MediaRecord";
        ScanCode[ScanCode["MediaFastForward"] = 169] = "MediaFastForward";
        ScanCode[ScanCode["MediaRewind"] = 170] = "MediaRewind";
        ScanCode[ScanCode["MediaTrackNext"] = 171] = "MediaTrackNext";
        ScanCode[ScanCode["MediaTrackPrevious"] = 172] = "MediaTrackPrevious";
        ScanCode[ScanCode["MediaStop"] = 173] = "MediaStop";
        ScanCode[ScanCode["Eject"] = 174] = "Eject";
        ScanCode[ScanCode["MediaPlayPause"] = 175] = "MediaPlayPause";
        ScanCode[ScanCode["MediaSelect"] = 176] = "MediaSelect";
        ScanCode[ScanCode["LaunchMail"] = 177] = "LaunchMail";
        ScanCode[ScanCode["LaunchApp2"] = 178] = "LaunchApp2";
        ScanCode[ScanCode["LaunchApp1"] = 179] = "LaunchApp1";
        ScanCode[ScanCode["SelectTask"] = 180] = "SelectTask";
        ScanCode[ScanCode["LaunchScreenSaver"] = 181] = "LaunchScreenSaver";
        ScanCode[ScanCode["BrowserSearch"] = 182] = "BrowserSearch";
        ScanCode[ScanCode["BrowserHome"] = 183] = "BrowserHome";
        ScanCode[ScanCode["BrowserBack"] = 184] = "BrowserBack";
        ScanCode[ScanCode["BrowserForward"] = 185] = "BrowserForward";
        ScanCode[ScanCode["BrowserStop"] = 186] = "BrowserStop";
        ScanCode[ScanCode["BrowserRefresh"] = 187] = "BrowserRefresh";
        ScanCode[ScanCode["BrowserFavorites"] = 188] = "BrowserFavorites";
        ScanCode[ScanCode["ZoomToggle"] = 189] = "ZoomToggle";
        ScanCode[ScanCode["MailReply"] = 190] = "MailReply";
        ScanCode[ScanCode["MailForward"] = 191] = "MailForward";
        ScanCode[ScanCode["MailSend"] = 192] = "MailSend";
        ScanCode[ScanCode["MAX_VALUE"] = 193] = "MAX_VALUE";
    })(ScanCode || (exports.ScanCode = ScanCode = {}));
    class KeyCodeStrMap {
        constructor() {
            this._keyCodeToStr = [];
            this._strToKeyCode = Object.create(null);
        }
        define(keyCode, str) {
            this._keyCodeToStr[keyCode] = str;
            this._strToKeyCode[str.toLowerCase()] = keyCode;
        }
        keyCodeToStr(keyCode) {
            return this._keyCodeToStr[keyCode];
        }
        strToKeyCode(str) {
            return this._strToKeyCode[str.toLowerCase()] || 0 /* KeyCode.Unknown */;
        }
    }
    const uiMap = new KeyCodeStrMap();
    const userSettingsUSMap = new KeyCodeStrMap();
    const userSettingsGeneralMap = new KeyCodeStrMap();
    exports.EVENT_KEY_CODE_MAP = new Array(230);
    exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
    const scanCodeIntToStr = [];
    const scanCodeStrToInt = Object.create(null);
    const scanCodeLowerCaseStrToInt = Object.create(null);
    exports.ScanCodeUtils = {
        lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0 /* ScanCode.None */,
        toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0 /* ScanCode.None */,
        toString: (scanCode) => scanCodeIntToStr[scanCode] || 'None'
    };
    /**
     * -1 if a ScanCode => KeyCode mapping depends on kb layout.
     */
    exports.IMMUTABLE_CODE_TO_KEY_CODE = [];
    /**
     * -1 if a KeyCode => ScanCode mapping depends on kb layout.
     */
    exports.IMMUTABLE_KEY_CODE_TO_CODE = [];
    for (let i = 0; i <= 193 /* ScanCode.MAX_VALUE */; i++) {
        exports.IMMUTABLE_CODE_TO_KEY_CODE[i] = -1 /* KeyCode.DependsOnKbLayout */;
    }
    for (let i = 0; i <= 132 /* KeyCode.MAX_VALUE */; i++) {
        exports.IMMUTABLE_KEY_CODE_TO_CODE[i] = -1 /* ScanCode.DependsOnKbLayout */;
    }
    (function () {
        // See https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
        // See https://github.com/microsoft/node-native-keymap/blob/88c0b0e5/deps/chromium/keyboard_codes_win.h
        const empty = '';
        const mappings = [
            // immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel
            [1, 0 /* ScanCode.None */, 'None', 0 /* KeyCode.Unknown */, 'unknown', 0, 'VK_UNKNOWN', empty, empty],
            [1, 1 /* ScanCode.Hyper */, 'Hyper', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 2 /* ScanCode.Super */, 'Super', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 3 /* ScanCode.Fn */, 'Fn', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 4 /* ScanCode.FnLock */, 'FnLock', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 5 /* ScanCode.Suspend */, 'Suspend', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 6 /* ScanCode.Resume */, 'Resume', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 7 /* ScanCode.Turbo */, 'Turbo', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 8 /* ScanCode.Sleep */, 'Sleep', 0 /* KeyCode.Unknown */, empty, 0, 'VK_SLEEP', empty, empty],
            [1, 9 /* ScanCode.WakeUp */, 'WakeUp', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [0, 10 /* ScanCode.KeyA */, 'KeyA', 31 /* KeyCode.KeyA */, 'A', 65, 'VK_A', empty, empty],
            [0, 11 /* ScanCode.KeyB */, 'KeyB', 32 /* KeyCode.KeyB */, 'B', 66, 'VK_B', empty, empty],
            [0, 12 /* ScanCode.KeyC */, 'KeyC', 33 /* KeyCode.KeyC */, 'C', 67, 'VK_C', empty, empty],
            [0, 13 /* ScanCode.KeyD */, 'KeyD', 34 /* KeyCode.KeyD */, 'D', 68, 'VK_D', empty, empty],
            [0, 14 /* ScanCode.KeyE */, 'KeyE', 35 /* KeyCode.KeyE */, 'E', 69, 'VK_E', empty, empty],
            [0, 15 /* ScanCode.KeyF */, 'KeyF', 36 /* KeyCode.KeyF */, 'F', 70, 'VK_F', empty, empty],
            [0, 16 /* ScanCode.KeyG */, 'KeyG', 37 /* KeyCode.KeyG */, 'G', 71, 'VK_G', empty, empty],
            [0, 17 /* ScanCode.KeyH */, 'KeyH', 38 /* KeyCode.KeyH */, 'H', 72, 'VK_H', empty, empty],
            [0, 18 /* ScanCode.KeyI */, 'KeyI', 39 /* KeyCode.KeyI */, 'I', 73, 'VK_I', empty, empty],
            [0, 19 /* ScanCode.KeyJ */, 'KeyJ', 40 /* KeyCode.KeyJ */, 'J', 74, 'VK_J', empty, empty],
            [0, 20 /* ScanCode.KeyK */, 'KeyK', 41 /* KeyCode.KeyK */, 'K', 75, 'VK_K', empty, empty],
            [0, 21 /* ScanCode.KeyL */, 'KeyL', 42 /* KeyCode.KeyL */, 'L', 76, 'VK_L', empty, empty],
            [0, 22 /* ScanCode.KeyM */, 'KeyM', 43 /* KeyCode.KeyM */, 'M', 77, 'VK_M', empty, empty],
            [0, 23 /* ScanCode.KeyN */, 'KeyN', 44 /* KeyCode.KeyN */, 'N', 78, 'VK_N', empty, empty],
            [0, 24 /* ScanCode.KeyO */, 'KeyO', 45 /* KeyCode.KeyO */, 'O', 79, 'VK_O', empty, empty],
            [0, 25 /* ScanCode.KeyP */, 'KeyP', 46 /* KeyCode.KeyP */, 'P', 80, 'VK_P', empty, empty],
            [0, 26 /* ScanCode.KeyQ */, 'KeyQ', 47 /* KeyCode.KeyQ */, 'Q', 81, 'VK_Q', empty, empty],
            [0, 27 /* ScanCode.KeyR */, 'KeyR', 48 /* KeyCode.KeyR */, 'R', 82, 'VK_R', empty, empty],
            [0, 28 /* ScanCode.KeyS */, 'KeyS', 49 /* KeyCode.KeyS */, 'S', 83, 'VK_S', empty, empty],
            [0, 29 /* ScanCode.KeyT */, 'KeyT', 50 /* KeyCode.KeyT */, 'T', 84, 'VK_T', empty, empty],
            [0, 30 /* ScanCode.KeyU */, 'KeyU', 51 /* KeyCode.KeyU */, 'U', 85, 'VK_U', empty, empty],
            [0, 31 /* ScanCode.KeyV */, 'KeyV', 52 /* KeyCode.KeyV */, 'V', 86, 'VK_V', empty, empty],
            [0, 32 /* ScanCode.KeyW */, 'KeyW', 53 /* KeyCode.KeyW */, 'W', 87, 'VK_W', empty, empty],
            [0, 33 /* ScanCode.KeyX */, 'KeyX', 54 /* KeyCode.KeyX */, 'X', 88, 'VK_X', empty, empty],
            [0, 34 /* ScanCode.KeyY */, 'KeyY', 55 /* KeyCode.KeyY */, 'Y', 89, 'VK_Y', empty, empty],
            [0, 35 /* ScanCode.KeyZ */, 'KeyZ', 56 /* KeyCode.KeyZ */, 'Z', 90, 'VK_Z', empty, empty],
            [0, 36 /* ScanCode.Digit1 */, 'Digit1', 22 /* KeyCode.Digit1 */, '1', 49, 'VK_1', empty, empty],
            [0, 37 /* ScanCode.Digit2 */, 'Digit2', 23 /* KeyCode.Digit2 */, '2', 50, 'VK_2', empty, empty],
            [0, 38 /* ScanCode.Digit3 */, 'Digit3', 24 /* KeyCode.Digit3 */, '3', 51, 'VK_3', empty, empty],
            [0, 39 /* ScanCode.Digit4 */, 'Digit4', 25 /* KeyCode.Digit4 */, '4', 52, 'VK_4', empty, empty],
            [0, 40 /* ScanCode.Digit5 */, 'Digit5', 26 /* KeyCode.Digit5 */, '5', 53, 'VK_5', empty, empty],
            [0, 41 /* ScanCode.Digit6 */, 'Digit6', 27 /* KeyCode.Digit6 */, '6', 54, 'VK_6', empty, empty],
            [0, 42 /* ScanCode.Digit7 */, 'Digit7', 28 /* KeyCode.Digit7 */, '7', 55, 'VK_7', empty, empty],
            [0, 43 /* ScanCode.Digit8 */, 'Digit8', 29 /* KeyCode.Digit8 */, '8', 56, 'VK_8', empty, empty],
            [0, 44 /* ScanCode.Digit9 */, 'Digit9', 30 /* KeyCode.Digit9 */, '9', 57, 'VK_9', empty, empty],
            [0, 45 /* ScanCode.Digit0 */, 'Digit0', 21 /* KeyCode.Digit0 */, '0', 48, 'VK_0', empty, empty],
            [1, 46 /* ScanCode.Enter */, 'Enter', 3 /* KeyCode.Enter */, 'Enter', 13, 'VK_RETURN', empty, empty],
            [1, 47 /* ScanCode.Escape */, 'Escape', 9 /* KeyCode.Escape */, 'Escape', 27, 'VK_ESCAPE', empty, empty],
            [1, 48 /* ScanCode.Backspace */, 'Backspace', 1 /* KeyCode.Backspace */, 'Backspace', 8, 'VK_BACK', empty, empty],
            [1, 49 /* ScanCode.Tab */, 'Tab', 2 /* KeyCode.Tab */, 'Tab', 9, 'VK_TAB', empty, empty],
            [1, 50 /* ScanCode.Space */, 'Space', 10 /* KeyCode.Space */, 'Space', 32, 'VK_SPACE', empty, empty],
            [0, 51 /* ScanCode.Minus */, 'Minus', 88 /* KeyCode.Minus */, '-', 189, 'VK_OEM_MINUS', '-', 'OEM_MINUS'],
            [0, 52 /* ScanCode.Equal */, 'Equal', 86 /* KeyCode.Equal */, '=', 187, 'VK_OEM_PLUS', '=', 'OEM_PLUS'],
            [0, 53 /* ScanCode.BracketLeft */, 'BracketLeft', 92 /* KeyCode.BracketLeft */, '[', 219, 'VK_OEM_4', '[', 'OEM_4'],
            [0, 54 /* ScanCode.BracketRight */, 'BracketRight', 94 /* KeyCode.BracketRight */, ']', 221, 'VK_OEM_6', ']', 'OEM_6'],
            [0, 55 /* ScanCode.Backslash */, 'Backslash', 93 /* KeyCode.Backslash */, '\\', 220, 'VK_OEM_5', '\\', 'OEM_5'],
            [0, 56 /* ScanCode.IntlHash */, 'IntlHash', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty], // has been dropped from the w3c spec
            [0, 57 /* ScanCode.Semicolon */, 'Semicolon', 85 /* KeyCode.Semicolon */, ';', 186, 'VK_OEM_1', ';', 'OEM_1'],
            [0, 58 /* ScanCode.Quote */, 'Quote', 95 /* KeyCode.Quote */, '\'', 222, 'VK_OEM_7', '\'', 'OEM_7'],
            [0, 59 /* ScanCode.Backquote */, 'Backquote', 91 /* KeyCode.Backquote */, '`', 192, 'VK_OEM_3', '`', 'OEM_3'],
            [0, 60 /* ScanCode.Comma */, 'Comma', 87 /* KeyCode.Comma */, ',', 188, 'VK_OEM_COMMA', ',', 'OEM_COMMA'],
            [0, 61 /* ScanCode.Period */, 'Period', 89 /* KeyCode.Period */, '.', 190, 'VK_OEM_PERIOD', '.', 'OEM_PERIOD'],
            [0, 62 /* ScanCode.Slash */, 'Slash', 90 /* KeyCode.Slash */, '/', 191, 'VK_OEM_2', '/', 'OEM_2'],
            [1, 63 /* ScanCode.CapsLock */, 'CapsLock', 8 /* KeyCode.CapsLock */, 'CapsLock', 20, 'VK_CAPITAL', empty, empty],
            [1, 64 /* ScanCode.F1 */, 'F1', 59 /* KeyCode.F1 */, 'F1', 112, 'VK_F1', empty, empty],
            [1, 65 /* ScanCode.F2 */, 'F2', 60 /* KeyCode.F2 */, 'F2', 113, 'VK_F2', empty, empty],
            [1, 66 /* ScanCode.F3 */, 'F3', 61 /* KeyCode.F3 */, 'F3', 114, 'VK_F3', empty, empty],
            [1, 67 /* ScanCode.F4 */, 'F4', 62 /* KeyCode.F4 */, 'F4', 115, 'VK_F4', empty, empty],
            [1, 68 /* ScanCode.F5 */, 'F5', 63 /* KeyCode.F5 */, 'F5', 116, 'VK_F5', empty, empty],
            [1, 69 /* ScanCode.F6 */, 'F6', 64 /* KeyCode.F6 */, 'F6', 117, 'VK_F6', empty, empty],
            [1, 70 /* ScanCode.F7 */, 'F7', 65 /* KeyCode.F7 */, 'F7', 118, 'VK_F7', empty, empty],
            [1, 71 /* ScanCode.F8 */, 'F8', 66 /* KeyCode.F8 */, 'F8', 119, 'VK_F8', empty, empty],
            [1, 72 /* ScanCode.F9 */, 'F9', 67 /* KeyCode.F9 */, 'F9', 120, 'VK_F9', empty, empty],
            [1, 73 /* ScanCode.F10 */, 'F10', 68 /* KeyCode.F10 */, 'F10', 121, 'VK_F10', empty, empty],
            [1, 74 /* ScanCode.F11 */, 'F11', 69 /* KeyCode.F11 */, 'F11', 122, 'VK_F11', empty, empty],
            [1, 75 /* ScanCode.F12 */, 'F12', 70 /* KeyCode.F12 */, 'F12', 123, 'VK_F12', empty, empty],
            [1, 76 /* ScanCode.PrintScreen */, 'PrintScreen', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 77 /* ScanCode.ScrollLock */, 'ScrollLock', 84 /* KeyCode.ScrollLock */, 'ScrollLock', 145, 'VK_SCROLL', empty, empty],
            [1, 78 /* ScanCode.Pause */, 'Pause', 7 /* KeyCode.PauseBreak */, 'PauseBreak', 19, 'VK_PAUSE', empty, empty],
            [1, 79 /* ScanCode.Insert */, 'Insert', 19 /* KeyCode.Insert */, 'Insert', 45, 'VK_INSERT', empty, empty],
            [1, 80 /* ScanCode.Home */, 'Home', 14 /* KeyCode.Home */, 'Home', 36, 'VK_HOME', empty, empty],
            [1, 81 /* ScanCode.PageUp */, 'PageUp', 11 /* KeyCode.PageUp */, 'PageUp', 33, 'VK_PRIOR', empty, empty],
            [1, 82 /* ScanCode.Delete */, 'Delete', 20 /* KeyCode.Delete */, 'Delete', 46, 'VK_DELETE', empty, empty],
            [1, 83 /* ScanCode.End */, 'End', 13 /* KeyCode.End */, 'End', 35, 'VK_END', empty, empty],
            [1, 84 /* ScanCode.PageDown */, 'PageDown', 12 /* KeyCode.PageDown */, 'PageDown', 34, 'VK_NEXT', empty, empty],
            [1, 85 /* ScanCode.ArrowRight */, 'ArrowRight', 17 /* KeyCode.RightArrow */, 'RightArrow', 39, 'VK_RIGHT', 'Right', empty],
            [1, 86 /* ScanCode.ArrowLeft */, 'ArrowLeft', 15 /* KeyCode.LeftArrow */, 'LeftArrow', 37, 'VK_LEFT', 'Left', empty],
            [1, 87 /* ScanCode.ArrowDown */, 'ArrowDown', 18 /* KeyCode.DownArrow */, 'DownArrow', 40, 'VK_DOWN', 'Down', empty],
            [1, 88 /* ScanCode.ArrowUp */, 'ArrowUp', 16 /* KeyCode.UpArrow */, 'UpArrow', 38, 'VK_UP', 'Up', empty],
            [1, 89 /* ScanCode.NumLock */, 'NumLock', 83 /* KeyCode.NumLock */, 'NumLock', 144, 'VK_NUMLOCK', empty, empty],
            [1, 90 /* ScanCode.NumpadDivide */, 'NumpadDivide', 113 /* KeyCode.NumpadDivide */, 'NumPad_Divide', 111, 'VK_DIVIDE', empty, empty],
            [1, 91 /* ScanCode.NumpadMultiply */, 'NumpadMultiply', 108 /* KeyCode.NumpadMultiply */, 'NumPad_Multiply', 106, 'VK_MULTIPLY', empty, empty],
            [1, 92 /* ScanCode.NumpadSubtract */, 'NumpadSubtract', 111 /* KeyCode.NumpadSubtract */, 'NumPad_Subtract', 109, 'VK_SUBTRACT', empty, empty],
            [1, 93 /* ScanCode.NumpadAdd */, 'NumpadAdd', 109 /* KeyCode.NumpadAdd */, 'NumPad_Add', 107, 'VK_ADD', empty, empty],
            [1, 94 /* ScanCode.NumpadEnter */, 'NumpadEnter', 3 /* KeyCode.Enter */, empty, 0, empty, empty, empty],
            [1, 95 /* ScanCode.Numpad1 */, 'Numpad1', 99 /* KeyCode.Numpad1 */, 'NumPad1', 97, 'VK_NUMPAD1', empty, empty],
            [1, 96 /* ScanCode.Numpad2 */, 'Numpad2', 100 /* KeyCode.Numpad2 */, 'NumPad2', 98, 'VK_NUMPAD2', empty, empty],
            [1, 97 /* ScanCode.Numpad3 */, 'Numpad3', 101 /* KeyCode.Numpad3 */, 'NumPad3', 99, 'VK_NUMPAD3', empty, empty],
            [1, 98 /* ScanCode.Numpad4 */, 'Numpad4', 102 /* KeyCode.Numpad4 */, 'NumPad4', 100, 'VK_NUMPAD4', empty, empty],
            [1, 99 /* ScanCode.Numpad5 */, 'Numpad5', 103 /* KeyCode.Numpad5 */, 'NumPad5', 101, 'VK_NUMPAD5', empty, empty],
            [1, 100 /* ScanCode.Numpad6 */, 'Numpad6', 104 /* KeyCode.Numpad6 */, 'NumPad6', 102, 'VK_NUMPAD6', empty, empty],
            [1, 101 /* ScanCode.Numpad7 */, 'Numpad7', 105 /* KeyCode.Numpad7 */, 'NumPad7', 103, 'VK_NUMPAD7', empty, empty],
            [1, 102 /* ScanCode.Numpad8 */, 'Numpad8', 106 /* KeyCode.Numpad8 */, 'NumPad8', 104, 'VK_NUMPAD8', empty, empty],
            [1, 103 /* ScanCode.Numpad9 */, 'Numpad9', 107 /* KeyCode.Numpad9 */, 'NumPad9', 105, 'VK_NUMPAD9', empty, empty],
            [1, 104 /* ScanCode.Numpad0 */, 'Numpad0', 98 /* KeyCode.Numpad0 */, 'NumPad0', 96, 'VK_NUMPAD0', empty, empty],
            [1, 105 /* ScanCode.NumpadDecimal */, 'NumpadDecimal', 112 /* KeyCode.NumpadDecimal */, 'NumPad_Decimal', 110, 'VK_DECIMAL', empty, empty],
            [0, 106 /* ScanCode.IntlBackslash */, 'IntlBackslash', 97 /* KeyCode.IntlBackslash */, 'OEM_102', 226, 'VK_OEM_102', empty, empty],
            [1, 107 /* ScanCode.ContextMenu */, 'ContextMenu', 58 /* KeyCode.ContextMenu */, 'ContextMenu', 93, empty, empty, empty],
            [1, 108 /* ScanCode.Power */, 'Power', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 109 /* ScanCode.NumpadEqual */, 'NumpadEqual', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 110 /* ScanCode.F13 */, 'F13', 71 /* KeyCode.F13 */, 'F13', 124, 'VK_F13', empty, empty],
            [1, 111 /* ScanCode.F14 */, 'F14', 72 /* KeyCode.F14 */, 'F14', 125, 'VK_F14', empty, empty],
            [1, 112 /* ScanCode.F15 */, 'F15', 73 /* KeyCode.F15 */, 'F15', 126, 'VK_F15', empty, empty],
            [1, 113 /* ScanCode.F16 */, 'F16', 74 /* KeyCode.F16 */, 'F16', 127, 'VK_F16', empty, empty],
            [1, 114 /* ScanCode.F17 */, 'F17', 75 /* KeyCode.F17 */, 'F17', 128, 'VK_F17', empty, empty],
            [1, 115 /* ScanCode.F18 */, 'F18', 76 /* KeyCode.F18 */, 'F18', 129, 'VK_F18', empty, empty],
            [1, 116 /* ScanCode.F19 */, 'F19', 77 /* KeyCode.F19 */, 'F19', 130, 'VK_F19', empty, empty],
            [1, 117 /* ScanCode.F20 */, 'F20', 78 /* KeyCode.F20 */, 'F20', 131, 'VK_F20', empty, empty],
            [1, 118 /* ScanCode.F21 */, 'F21', 79 /* KeyCode.F21 */, 'F21', 132, 'VK_F21', empty, empty],
            [1, 119 /* ScanCode.F22 */, 'F22', 80 /* KeyCode.F22 */, 'F22', 133, 'VK_F22', empty, empty],
            [1, 120 /* ScanCode.F23 */, 'F23', 81 /* KeyCode.F23 */, 'F23', 134, 'VK_F23', empty, empty],
            [1, 121 /* ScanCode.F24 */, 'F24', 82 /* KeyCode.F24 */, 'F24', 135, 'VK_F24', empty, empty],
            [1, 122 /* ScanCode.Open */, 'Open', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 123 /* ScanCode.Help */, 'Help', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 124 /* ScanCode.Select */, 'Select', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 125 /* ScanCode.Again */, 'Again', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 126 /* ScanCode.Undo */, 'Undo', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 127 /* ScanCode.Cut */, 'Cut', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 128 /* ScanCode.Copy */, 'Copy', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 129 /* ScanCode.Paste */, 'Paste', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 130 /* ScanCode.Find */, 'Find', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 131 /* ScanCode.AudioVolumeMute */, 'AudioVolumeMute', 117 /* KeyCode.AudioVolumeMute */, 'AudioVolumeMute', 173, 'VK_VOLUME_MUTE', empty, empty],
            [1, 132 /* ScanCode.AudioVolumeUp */, 'AudioVolumeUp', 118 /* KeyCode.AudioVolumeUp */, 'AudioVolumeUp', 175, 'VK_VOLUME_UP', empty, empty],
            [1, 133 /* ScanCode.AudioVolumeDown */, 'AudioVolumeDown', 119 /* KeyCode.AudioVolumeDown */, 'AudioVolumeDown', 174, 'VK_VOLUME_DOWN', empty, empty],
            [1, 134 /* ScanCode.NumpadComma */, 'NumpadComma', 110 /* KeyCode.NUMPAD_SEPARATOR */, 'NumPad_Separator', 108, 'VK_SEPARATOR', empty, empty],
            [0, 135 /* ScanCode.IntlRo */, 'IntlRo', 115 /* KeyCode.ABNT_C1 */, 'ABNT_C1', 193, 'VK_ABNT_C1', empty, empty],
            [1, 136 /* ScanCode.KanaMode */, 'KanaMode', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [0, 137 /* ScanCode.IntlYen */, 'IntlYen', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 138 /* ScanCode.Convert */, 'Convert', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 139 /* ScanCode.NonConvert */, 'NonConvert', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 140 /* ScanCode.Lang1 */, 'Lang1', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 141 /* ScanCode.Lang2 */, 'Lang2', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 142 /* ScanCode.Lang3 */, 'Lang3', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 143 /* ScanCode.Lang4 */, 'Lang4', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 144 /* ScanCode.Lang5 */, 'Lang5', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 145 /* ScanCode.Abort */, 'Abort', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 146 /* ScanCode.Props */, 'Props', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 147 /* ScanCode.NumpadParenLeft */, 'NumpadParenLeft', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 148 /* ScanCode.NumpadParenRight */, 'NumpadParenRight', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 149 /* ScanCode.NumpadBackspace */, 'NumpadBackspace', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 150 /* ScanCode.NumpadMemoryStore */, 'NumpadMemoryStore', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 151 /* ScanCode.NumpadMemoryRecall */, 'NumpadMemoryRecall', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 152 /* ScanCode.NumpadMemoryClear */, 'NumpadMemoryClear', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 153 /* ScanCode.NumpadMemoryAdd */, 'NumpadMemoryAdd', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 154 /* ScanCode.NumpadMemorySubtract */, 'NumpadMemorySubtract', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 155 /* ScanCode.NumpadClear */, 'NumpadClear', 131 /* KeyCode.Clear */, 'Clear', 12, 'VK_CLEAR', empty, empty],
            [1, 156 /* ScanCode.NumpadClearEntry */, 'NumpadClearEntry', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 0 /* ScanCode.None */, empty, 5 /* KeyCode.Ctrl */, 'Ctrl', 17, 'VK_CONTROL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 4 /* KeyCode.Shift */, 'Shift', 16, 'VK_SHIFT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 6 /* KeyCode.Alt */, 'Alt', 18, 'VK_MENU', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 57 /* KeyCode.Meta */, 'Meta', 91, 'VK_COMMAND', empty, empty],
            [1, 157 /* ScanCode.ControlLeft */, 'ControlLeft', 5 /* KeyCode.Ctrl */, empty, 0, 'VK_LCONTROL', empty, empty],
            [1, 158 /* ScanCode.ShiftLeft */, 'ShiftLeft', 4 /* KeyCode.Shift */, empty, 0, 'VK_LSHIFT', empty, empty],
            [1, 159 /* ScanCode.AltLeft */, 'AltLeft', 6 /* KeyCode.Alt */, empty, 0, 'VK_LMENU', empty, empty],
            [1, 160 /* ScanCode.MetaLeft */, 'MetaLeft', 57 /* KeyCode.Meta */, empty, 0, 'VK_LWIN', empty, empty],
            [1, 161 /* ScanCode.ControlRight */, 'ControlRight', 5 /* KeyCode.Ctrl */, empty, 0, 'VK_RCONTROL', empty, empty],
            [1, 162 /* ScanCode.ShiftRight */, 'ShiftRight', 4 /* KeyCode.Shift */, empty, 0, 'VK_RSHIFT', empty, empty],
            [1, 163 /* ScanCode.AltRight */, 'AltRight', 6 /* KeyCode.Alt */, empty, 0, 'VK_RMENU', empty, empty],
            [1, 164 /* ScanCode.MetaRight */, 'MetaRight', 57 /* KeyCode.Meta */, empty, 0, 'VK_RWIN', empty, empty],
            [1, 165 /* ScanCode.BrightnessUp */, 'BrightnessUp', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 166 /* ScanCode.BrightnessDown */, 'BrightnessDown', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 167 /* ScanCode.MediaPlay */, 'MediaPlay', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 168 /* ScanCode.MediaRecord */, 'MediaRecord', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 169 /* ScanCode.MediaFastForward */, 'MediaFastForward', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 170 /* ScanCode.MediaRewind */, 'MediaRewind', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 171 /* ScanCode.MediaTrackNext */, 'MediaTrackNext', 124 /* KeyCode.MediaTrackNext */, 'MediaTrackNext', 176, 'VK_MEDIA_NEXT_TRACK', empty, empty],
            [1, 172 /* ScanCode.MediaTrackPrevious */, 'MediaTrackPrevious', 125 /* KeyCode.MediaTrackPrevious */, 'MediaTrackPrevious', 177, 'VK_MEDIA_PREV_TRACK', empty, empty],
            [1, 173 /* ScanCode.MediaStop */, 'MediaStop', 126 /* KeyCode.MediaStop */, 'MediaStop', 178, 'VK_MEDIA_STOP', empty, empty],
            [1, 174 /* ScanCode.Eject */, 'Eject', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 175 /* ScanCode.MediaPlayPause */, 'MediaPlayPause', 127 /* KeyCode.MediaPlayPause */, 'MediaPlayPause', 179, 'VK_MEDIA_PLAY_PAUSE', empty, empty],
            [1, 176 /* ScanCode.MediaSelect */, 'MediaSelect', 128 /* KeyCode.LaunchMediaPlayer */, 'LaunchMediaPlayer', 181, 'VK_MEDIA_LAUNCH_MEDIA_SELECT', empty, empty],
            [1, 177 /* ScanCode.LaunchMail */, 'LaunchMail', 129 /* KeyCode.LaunchMail */, 'LaunchMail', 180, 'VK_MEDIA_LAUNCH_MAIL', empty, empty],
            [1, 178 /* ScanCode.LaunchApp2 */, 'LaunchApp2', 130 /* KeyCode.LaunchApp2 */, 'LaunchApp2', 183, 'VK_MEDIA_LAUNCH_APP2', empty, empty],
            [1, 179 /* ScanCode.LaunchApp1 */, 'LaunchApp1', 0 /* KeyCode.Unknown */, empty, 0, 'VK_MEDIA_LAUNCH_APP1', empty, empty],
            [1, 180 /* ScanCode.SelectTask */, 'SelectTask', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 181 /* ScanCode.LaunchScreenSaver */, 'LaunchScreenSaver', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 182 /* ScanCode.BrowserSearch */, 'BrowserSearch', 120 /* KeyCode.BrowserSearch */, 'BrowserSearch', 170, 'VK_BROWSER_SEARCH', empty, empty],
            [1, 183 /* ScanCode.BrowserHome */, 'BrowserHome', 121 /* KeyCode.BrowserHome */, 'BrowserHome', 172, 'VK_BROWSER_HOME', empty, empty],
            [1, 184 /* ScanCode.BrowserBack */, 'BrowserBack', 122 /* KeyCode.BrowserBack */, 'BrowserBack', 166, 'VK_BROWSER_BACK', empty, empty],
            [1, 185 /* ScanCode.BrowserForward */, 'BrowserForward', 123 /* KeyCode.BrowserForward */, 'BrowserForward', 167, 'VK_BROWSER_FORWARD', empty, empty],
            [1, 186 /* ScanCode.BrowserStop */, 'BrowserStop', 0 /* KeyCode.Unknown */, empty, 0, 'VK_BROWSER_STOP', empty, empty],
            [1, 187 /* ScanCode.BrowserRefresh */, 'BrowserRefresh', 0 /* KeyCode.Unknown */, empty, 0, 'VK_BROWSER_REFRESH', empty, empty],
            [1, 188 /* ScanCode.BrowserFavorites */, 'BrowserFavorites', 0 /* KeyCode.Unknown */, empty, 0, 'VK_BROWSER_FAVORITES', empty, empty],
            [1, 189 /* ScanCode.ZoomToggle */, 'ZoomToggle', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 190 /* ScanCode.MailReply */, 'MailReply', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 191 /* ScanCode.MailForward */, 'MailForward', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 192 /* ScanCode.MailSend */, 'MailSend', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            // See https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
            // If an Input Method Editor is processing key input and the event is keydown, return 229.
            [1, 0 /* ScanCode.None */, empty, 114 /* KeyCode.KEY_IN_COMPOSITION */, 'KeyInComposition', 229, empty, empty, empty],
            [1, 0 /* ScanCode.None */, empty, 116 /* KeyCode.ABNT_C2 */, 'ABNT_C2', 194, 'VK_ABNT_C2', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 96 /* KeyCode.OEM_8 */, 'OEM_8', 223, 'VK_OEM_8', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_KANA', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_HANGUL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_JUNJA', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_FINAL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_HANJA', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_KANJI', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_CONVERT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_NONCONVERT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_ACCEPT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_MODECHANGE', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_SELECT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PRINT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_EXECUTE', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_SNAPSHOT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_HELP', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_APPS', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PROCESSKEY', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PACKET', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_DBE_SBCSCHAR', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_DBE_DBCSCHAR', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_ATTN', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_CRSEL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_EXSEL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_EREOF', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PLAY', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_ZOOM', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_NONAME', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PA1', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_OEM_CLEAR', empty, empty],
        ];
        const seenKeyCode = [];
        const seenScanCode = [];
        for (const mapping of mappings) {
            const [immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel] = mapping;
            if (!seenScanCode[scanCode]) {
                seenScanCode[scanCode] = true;
                scanCodeIntToStr[scanCode] = scanCodeStr;
                scanCodeStrToInt[scanCodeStr] = scanCode;
                scanCodeLowerCaseStrToInt[scanCodeStr.toLowerCase()] = scanCode;
                if (immutable) {
                    exports.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] = keyCode;
                    if ((keyCode !== 0 /* KeyCode.Unknown */)
                        && (keyCode !== 3 /* KeyCode.Enter */)
                        && (keyCode !== 5 /* KeyCode.Ctrl */)
                        && (keyCode !== 4 /* KeyCode.Shift */)
                        && (keyCode !== 6 /* KeyCode.Alt */)
                        && (keyCode !== 57 /* KeyCode.Meta */)) {
                        exports.IMMUTABLE_KEY_CODE_TO_CODE[keyCode] = scanCode;
                    }
                }
            }
            if (!seenKeyCode[keyCode]) {
                seenKeyCode[keyCode] = true;
                if (!keyCodeStr) {
                    throw new Error(`String representation missing for key code ${keyCode} around scan code ${scanCodeStr}`);
                }
                uiMap.define(keyCode, keyCodeStr);
                userSettingsUSMap.define(keyCode, usUserSettingsLabel || keyCodeStr);
                userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel || usUserSettingsLabel || keyCodeStr);
            }
            if (eventKeyCode) {
                exports.EVENT_KEY_CODE_MAP[eventKeyCode] = keyCode;
            }
            if (vkey) {
                exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[vkey] = keyCode;
            }
        }
        // Manually added due to the exclusion above (due to duplication with NumpadEnter)
        exports.IMMUTABLE_KEY_CODE_TO_CODE[3 /* KeyCode.Enter */] = 46 /* ScanCode.Enter */;
    })();
    var KeyCodeUtils;
    (function (KeyCodeUtils) {
        function toString(keyCode) {
            return uiMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toString = toString;
        function fromString(key) {
            return uiMap.strToKeyCode(key);
        }
        KeyCodeUtils.fromString = fromString;
        function toUserSettingsUS(keyCode) {
            return userSettingsUSMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
        function toUserSettingsGeneral(keyCode) {
            return userSettingsGeneralMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
        function fromUserSettings(key) {
            return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
        }
        KeyCodeUtils.fromUserSettings = fromUserSettings;
        function toElectronAccelerator(keyCode) {
            if (keyCode >= 98 /* KeyCode.Numpad0 */ && keyCode <= 113 /* KeyCode.NumpadDivide */) {
                // [Electron Accelerators] Electron is able to parse numpad keys, but unfortunately it
                // renders them just as regular keys in menus. For example, num0 is rendered as "0",
                // numdiv is rendered as "/", numsub is rendered as "-".
                //
                // This can lead to incredible confusion, as it makes numpad based keybindings indistinguishable
                // from keybindings based on regular keys.
                //
                // We therefore need to fall back to custom rendering for numpad keys.
                return null;
            }
            switch (keyCode) {
                case 16 /* KeyCode.UpArrow */:
                    return 'Up';
                case 18 /* KeyCode.DownArrow */:
                    return 'Down';
                case 15 /* KeyCode.LeftArrow */:
                    return 'Left';
                case 17 /* KeyCode.RightArrow */:
                    return 'Right';
            }
            return uiMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toElectronAccelerator = toElectronAccelerator;
    })(KeyCodeUtils || (exports.KeyCodeUtils = KeyCodeUtils = {}));
    var KeyMod;
    (function (KeyMod) {
        KeyMod[KeyMod["CtrlCmd"] = 2048] = "CtrlCmd";
        KeyMod[KeyMod["Shift"] = 1024] = "Shift";
        KeyMod[KeyMod["Alt"] = 512] = "Alt";
        KeyMod[KeyMod["WinCtrl"] = 256] = "WinCtrl";
    })(KeyMod || (exports.KeyMod = KeyMod = {}));
    function KeyChord(firstPart, secondPart) {
        const chordPart = ((secondPart & 0x0000FFFF) << 16) >>> 0;
        return (firstPart | chordPart) >>> 0;
    }
    exports.KeyChord = KeyChord;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[274/*vs/base/common/keybindings*/], __M([1/*require*/,0/*exports*/,17/*vs/base/common/errors*/]), function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResolvedKeybinding = exports.ResolvedChord = exports.Keybinding = exports.ScanCodeChord = exports.KeyCodeChord = exports.createSimpleKeybinding = exports.decodeKeybinding = void 0;
    /**
     * Binary encoding strategy:
     * ```
     *    1111 11
     *    5432 1098 7654 3210
     *    ---- CSAW KKKK KKKK
     *  C = bit 11 = ctrlCmd flag
     *  S = bit 10 = shift flag
     *  A = bit 9 = alt flag
     *  W = bit 8 = winCtrl flag
     *  K = bits 0-7 = key code
     * ```
     */
    var BinaryKeybindingsMask;
    (function (BinaryKeybindingsMask) {
        BinaryKeybindingsMask[BinaryKeybindingsMask["CtrlCmd"] = 2048] = "CtrlCmd";
        BinaryKeybindingsMask[BinaryKeybindingsMask["Shift"] = 1024] = "Shift";
        BinaryKeybindingsMask[BinaryKeybindingsMask["Alt"] = 512] = "Alt";
        BinaryKeybindingsMask[BinaryKeybindingsMask["WinCtrl"] = 256] = "WinCtrl";
        BinaryKeybindingsMask[BinaryKeybindingsMask["KeyCode"] = 255] = "KeyCode";
    })(BinaryKeybindingsMask || (BinaryKeybindingsMask = {}));
    function decodeKeybinding(keybinding, OS) {
        if (typeof keybinding === 'number') {
            if (keybinding === 0) {
                return null;
            }
            const firstChord = (keybinding & 0x0000FFFF) >>> 0;
            const secondChord = (keybinding & 0xFFFF0000) >>> 16;
            if (secondChord !== 0) {
                return new Keybinding([
                    createSimpleKeybinding(firstChord, OS),
                    createSimpleKeybinding(secondChord, OS)
                ]);
            }
            return new Keybinding([createSimpleKeybinding(firstChord, OS)]);
        }
        else {
            const chords = [];
            for (let i = 0; i < keybinding.length; i++) {
                chords.push(createSimpleKeybinding(keybinding[i], OS));
            }
            return new Keybinding(chords);
        }
    }
    exports.decodeKeybinding = decodeKeybinding;
    function createSimpleKeybinding(keybinding, OS) {
        const ctrlCmd = (keybinding & 2048 /* BinaryKeybindingsMask.CtrlCmd */ ? true : false);
        const winCtrl = (keybinding & 256 /* BinaryKeybindingsMask.WinCtrl */ ? true : false);
        const ctrlKey = (OS === 2 /* OperatingSystem.Macintosh */ ? winCtrl : ctrlCmd);
        const shiftKey = (keybinding & 1024 /* BinaryKeybindingsMask.Shift */ ? true : false);
        const altKey = (keybinding & 512 /* BinaryKeybindingsMask.Alt */ ? true : false);
        const metaKey = (OS === 2 /* OperatingSystem.Macintosh */ ? ctrlCmd : winCtrl);
        const keyCode = (keybinding & 255 /* BinaryKeybindingsMask.KeyCode */);
        return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
    }
    exports.createSimpleKeybinding = createSimpleKeybinding;
    /**
     * Represents a chord which uses the `keyCode` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class KeyCodeChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyCode = keyCode;
        }
        equals(other) {
            return (other instanceof KeyCodeChord
                && this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.metaKey === other.metaKey
                && this.keyCode === other.keyCode);
        }
        getHashCode() {
            const ctrl = this.ctrlKey ? '1' : '0';
            const shift = this.shiftKey ? '1' : '0';
            const alt = this.altKey ? '1' : '0';
            const meta = this.metaKey ? '1' : '0';
            return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
        }
        isModifierKey() {
            return (this.keyCode === 0 /* KeyCode.Unknown */
                || this.keyCode === 5 /* KeyCode.Ctrl */
                || this.keyCode === 57 /* KeyCode.Meta */
                || this.keyCode === 6 /* KeyCode.Alt */
                || this.keyCode === 4 /* KeyCode.Shift */);
        }
        toKeybinding() {
            return new Keybinding([this]);
        }
        /**
         * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
         */
        isDuplicateModifierCase() {
            return ((this.ctrlKey && this.keyCode === 5 /* KeyCode.Ctrl */)
                || (this.shiftKey && this.keyCode === 4 /* KeyCode.Shift */)
                || (this.altKey && this.keyCode === 6 /* KeyCode.Alt */)
                || (this.metaKey && this.keyCode === 57 /* KeyCode.Meta */));
        }
    }
    exports.KeyCodeChord = KeyCodeChord;
    /**
     * Represents a chord which uses the `code` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class ScanCodeChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.scanCode = scanCode;
        }
        equals(other) {
            return (other instanceof ScanCodeChord
                && this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.metaKey === other.metaKey
                && this.scanCode === other.scanCode);
        }
        getHashCode() {
            const ctrl = this.ctrlKey ? '1' : '0';
            const shift = this.shiftKey ? '1' : '0';
            const alt = this.altKey ? '1' : '0';
            const meta = this.metaKey ? '1' : '0';
            return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
        }
        /**
         * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
         */
        isDuplicateModifierCase() {
            return ((this.ctrlKey && (this.scanCode === 157 /* ScanCode.ControlLeft */ || this.scanCode === 161 /* ScanCode.ControlRight */))
                || (this.shiftKey && (this.scanCode === 158 /* ScanCode.ShiftLeft */ || this.scanCode === 162 /* ScanCode.ShiftRight */))
                || (this.altKey && (this.scanCode === 159 /* ScanCode.AltLeft */ || this.scanCode === 163 /* ScanCode.AltRight */))
                || (this.metaKey && (this.scanCode === 160 /* ScanCode.MetaLeft */ || this.scanCode === 164 /* ScanCode.MetaRight */)));
        }
    }
    exports.ScanCodeChord = ScanCodeChord;
    /**
     * A keybinding is a sequence of chords.
     */
    class Keybinding {
        constructor(chords) {
            if (chords.length === 0) {
                throw (0, errors_1.illegalArgument)(`chords`);
            }
            this.chords = chords;
        }
        getHashCode() {
            let result = '';
            for (let i = 0, len = this.chords.length; i < len; i++) {
                if (i !== 0) {
                    result += ';';
                }
                result += this.chords[i].getHashCode();
            }
            return result;
        }
        equals(other) {
            if (other === null) {
                return false;
            }
            if (this.chords.length !== other.chords.length) {
                return false;
            }
            for (let i = 0; i < this.chords.length; i++) {
                if (!this.chords[i].equals(other.chords[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.Keybinding = Keybinding;
    class ResolvedChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyLabel = keyLabel;
            this.keyAriaLabel = keyAriaLabel;
        }
    }
    exports.ResolvedChord = ResolvedChord;
    /**
     * A resolved keybinding. Consists of one or multiple chords.
     */
    class ResolvedKeybinding {
    }
    exports.ResolvedKeybinding = ResolvedKeybinding;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[537/*vs/base/common/keybindingParser*/], __M([1/*require*/,0/*exports*/,108/*vs/base/common/keyCodes*/,274/*vs/base/common/keybindings*/]), function (require, exports, keyCodes_1, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingParser = void 0;
    class KeybindingParser {
        static _readModifiers(input) {
            input = input.toLowerCase().trim();
            let ctrl = false;
            let shift = false;
            let alt = false;
            let meta = false;
            let matchedModifier;
            do {
                matchedModifier = false;
                if (/^ctrl(\+|\-)/.test(input)) {
                    ctrl = true;
                    input = input.substr('ctrl-'.length);
                    matchedModifier = true;
                }
                if (/^shift(\+|\-)/.test(input)) {
                    shift = true;
                    input = input.substr('shift-'.length);
                    matchedModifier = true;
                }
                if (/^alt(\+|\-)/.test(input)) {
                    alt = true;
                    input = input.substr('alt-'.length);
                    matchedModifier = true;
                }
                if (/^meta(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('meta-'.length);
                    matchedModifier = true;
                }
                if (/^win(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('win-'.length);
                    matchedModifier = true;
                }
                if (/^cmd(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('cmd-'.length);
                    matchedModifier = true;
                }
            } while (matchedModifier);
            let key;
            const firstSpaceIdx = input.indexOf(' ');
            if (firstSpaceIdx > 0) {
                key = input.substring(0, firstSpaceIdx);
                input = input.substring(firstSpaceIdx);
            }
            else {
                key = input;
                input = '';
            }
            return {
                remains: input,
                ctrl,
                shift,
                alt,
                meta,
                key
            };
        }
        static parseChord(input) {
            const mods = this._readModifiers(input);
            const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
            if (scanCodeMatch) {
                const strScanCode = scanCodeMatch[1];
                const scanCode = keyCodes_1.ScanCodeUtils.lowerCaseToEnum(strScanCode);
                return [new keybindings_1.ScanCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
            }
            const keyCode = keyCodes_1.KeyCodeUtils.fromUserSettings(mods.key);
            return [new keybindings_1.KeyCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
        }
        static parseKeybinding(input) {
            if (!input) {
                return null;
            }
            const chords = [];
            let chord;
            while (input.length > 0) {
                [chord, input] = this.parseChord(input);
                chords.push(chord);
            }
            return (chords.length > 0 ? new keybindings_1.Keybinding(chords) : null);
        }
    }
    exports.KeybindingParser = KeybindingParser;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[147/*vs/base/common/lazy*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lazy = void 0;
    class Lazy {
        constructor(executor) {
            this.executor = executor;
            this._didRun = false;
        }
        /**
         * True if the lazy value has been resolved.
         */
        get hasValue() { return this._didRun; }
        /**
         * Get the wrapped value.
         *
         * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
         * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
         */
        get value() {
            if (!this._didRun) {
                try {
                    this._value = this.executor();
                }
                catch (err) {
                    this._error = err;
                }
                finally {
                    this._didRun = true;
                }
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
        /**
         * Get the wrapped value without forcing evaluation.
         */
        get rawValue() { return this._value; }
    }
    exports.Lazy = Lazy;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[193/*vs/base/browser/ui/hover/hoverDelegate*/], __M([1/*require*/,0/*exports*/,147/*vs/base/common/lazy*/]), function (require, exports, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDefaultHoverDelegate = exports.setHoverDelegateFactory = void 0;
    const nullHoverDelegateFactory = () => ({
        get delay() { return -1; },
        dispose: () => { },
        showHover: () => { return undefined; },
    });
    let hoverDelegateFactory = nullHoverDelegateFactory;
    const defaultHoverDelegateMouse = new lazy_1.Lazy(() => hoverDelegateFactory('mouse', false));
    const defaultHoverDelegateElement = new lazy_1.Lazy(() => hoverDelegateFactory('element', false));
    function setHoverDelegateFactory(hoverDelegateProvider) {
        hoverDelegateFactory = hoverDelegateProvider;
    }
    exports.setHoverDelegateFactory = setHoverDelegateFactory;
    function getDefaultHoverDelegate(placement, enableInstantHover) {
        if (enableInstantHover) {
            // If instant hover is enabled, the consumer is responsible for disposing the hover delegate
            return hoverDelegateFactory(placement, true);
        }
        if (placement === 'element') {
            return defaultHoverDelegateElement.value;
        }
        return defaultHoverDelegateMouse.value;
    }
    exports.getDefaultHoverDelegate = getDefaultHoverDelegate;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[183/*vs/base/common/linkedList*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkedList = void 0;
    class Node {
        static { this.Undefined = new Node(undefined); }
        constructor(element) {
            this.element = element;
            this.next = Node.Undefined;
            this.prev = Node.Undefined;
        }
    }
    class LinkedList {
        constructor() {
            this._first = Node.Undefined;
            this._last = Node.Undefined;
            this._size = 0;
        }
        get size() {
            return this._size;
        }
        isEmpty() {
            return this._first === Node.Undefined;
        }
        clear() {
            let node = this._first;
            while (node !== Node.Undefined) {
                const next = node.next;
                node.prev = Node.Undefined;
                node.next = Node.Undefined;
                node = next;
            }
            this._first = Node.Undefined;
            this._last = Node.Undefined;
            this._size = 0;
        }
        unshift(element) {
            return this._insert(element, false);
        }
        push(element) {
            return this._insert(element, true);
        }
        _insert(element, atTheEnd) {
            const newNode = new Node(element);
            if (this._first === Node.Undefined) {
                this._first = newNode;
                this._last = newNode;
            }
            else if (atTheEnd) {
                // push
                const oldLast = this._last;
                this._last = newNode;
                newNode.prev = oldLast;
                oldLast.next = newNode;
            }
            else {
                // unshift
                const oldFirst = this._first;
                this._first = newNode;
                newNode.next = oldFirst;
                oldFirst.prev = newNode;
            }
            this._size += 1;
            let didRemove = false;
            return () => {
                if (!didRemove) {
                    didRemove = true;
                    this._remove(newNode);
                }
            };
        }
        shift() {
            if (this._first === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this._first.element;
                this._remove(this._first);
                return res;
            }
        }
        pop() {
            if (this._last === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this._last.element;
                this._remove(this._last);
                return res;
            }
        }
        _remove(node) {
            if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
                // middle
                const anchor = node.prev;
                anchor.next = node.next;
                node.next.prev = anchor;
            }
            else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
                // only node
                this._first = Node.Undefined;
                this._last = Node.Undefined;
            }
            else if (node.next === Node.Undefined) {
                // last
                this._last = this._last.prev;
                this._last.next = Node.Undefined;
            }
            else if (node.prev === Node.Undefined) {
                // first
                this._first = this._first.next;
                this._first.prev = Node.Undefined;
            }
            // done
            this._size -= 1;
        }
        *[Symbol.iterator]() {
            let node = this._first;
            while (node !== Node.Undefined) {
                yield node.element;
                node = node.next;
            }
        }
    }
    exports.LinkedList = LinkedList;
});

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
define(__m[312/*vs/base/common/linkedText*/], __M([1/*require*/,0/*exports*/,109/*vs/base/common/decorators*/]), function (require, exports, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseLinkedText = exports.LinkedText = void 0;
    class LinkedText {
        constructor(nodes) {
            this.nodes = nodes;
        }
        toString() {
            return this.nodes.map(node => typeof node === 'string' ? node : node.label).join('');
        }
    }
    exports.LinkedText = LinkedText;
    __decorate([
        decorators_1.memoize
    ], LinkedText.prototype, "toString", null);
    const LINK_REGEX = /\[([^\]]+)\]\(((?:https?:\/\/|command:|file:)[^\)\s]+)(?: (["'])(.+?)(\3))?\)/gi;
    function parseLinkedText(text) {
        const result = [];
        let index = 0;
        let match;
        while (match = LINK_REGEX.exec(text)) {
            if (match.index - index > 0) {
                result.push(text.substring(index, match.index));
            }
            const [, label, href, , title] = match;
            if (title) {
                result.push({ label, href, title });
            }
            else {
                result.push({ label, href });
            }
            index = match.index + match[0].length;
        }
        if (index < text.length) {
            result.push(text.substring(index));
        }
        return new LinkedText(result);
    }
    exports.parseLinkedText = parseLinkedText;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[50/*vs/base/common/map*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    var _a, _b, _c;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapsStrictEqualIgnoreOrder = exports.SetMap = exports.BidirectionalMap = exports.CounterSet = exports.LRUCache = exports.LinkedMap = exports.Touch = exports.ResourceSet = exports.ResourceMap = exports.setToString = exports.mapToString = exports.getOrSet = void 0;
    function getOrSet(map, key, value) {
        let result = map.get(key);
        if (result === undefined) {
            result = value;
            map.set(key, result);
        }
        return result;
    }
    exports.getOrSet = getOrSet;
    function mapToString(map) {
        const entries = [];
        map.forEach((value, key) => {
            entries.push(`${key} => ${value}`);
        });
        return `Map(${map.size}) {${entries.join(', ')}}`;
    }
    exports.mapToString = mapToString;
    function setToString(set) {
        const entries = [];
        set.forEach(value => {
            entries.push(value);
        });
        return `Set(${set.size}) {${entries.join(', ')}}`;
    }
    exports.setToString = setToString;
    class ResourceMapEntry {
        constructor(uri, value) {
            this.uri = uri;
            this.value = value;
        }
    }
    function isEntries(arg) {
        return Array.isArray(arg);
    }
    class ResourceMap {
        static { this.defaultToKey = (resource) => resource.toString(); }
        constructor(arg, toKey) {
            this[_a] = 'ResourceMap';
            if (arg instanceof ResourceMap) {
                this.map = new Map(arg.map);
                this.toKey = toKey ?? ResourceMap.defaultToKey;
            }
            else if (isEntries(arg)) {
                this.map = new Map();
                this.toKey = toKey ?? ResourceMap.defaultToKey;
                for (const [resource, value] of arg) {
                    this.set(resource, value);
                }
            }
            else {
                this.map = new Map();
                this.toKey = arg ?? ResourceMap.defaultToKey;
            }
        }
        set(resource, value) {
            this.map.set(this.toKey(resource), new ResourceMapEntry(resource, value));
            return this;
        }
        get(resource) {
            return this.map.get(this.toKey(resource))?.value;
        }
        has(resource) {
            return this.map.has(this.toKey(resource));
        }
        get size() {
            return this.map.size;
        }
        clear() {
            this.map.clear();
        }
        delete(resource) {
            return this.map.delete(this.toKey(resource));
        }
        forEach(clb, thisArg) {
            if (typeof thisArg !== 'undefined') {
                clb = clb.bind(thisArg);
            }
            for (const [_, entry] of this.map) {
                clb(entry.value, entry.uri, this);
            }
        }
        *values() {
            for (const entry of this.map.values()) {
                yield entry.value;
            }
        }
        *keys() {
            for (const entry of this.map.values()) {
                yield entry.uri;
            }
        }
        *entries() {
            for (const entry of this.map.values()) {
                yield [entry.uri, entry.value];
            }
        }
        *[(_a = Symbol.toStringTag, Symbol.iterator)]() {
            for (const [, entry] of this.map) {
                yield [entry.uri, entry.value];
            }
        }
    }
    exports.ResourceMap = ResourceMap;
    class ResourceSet {
        constructor(entriesOrKey, toKey) {
            this[_b] = 'ResourceSet';
            if (!entriesOrKey || typeof entriesOrKey === 'function') {
                this._map = new ResourceMap(entriesOrKey);
            }
            else {
                this._map = new ResourceMap(toKey);
                entriesOrKey.forEach(this.add, this);
            }
        }
        get size() {
            return this._map.size;
        }
        add(value) {
            this._map.set(value, value);
            return this;
        }
        clear() {
            this._map.clear();
        }
        delete(value) {
            return this._map.delete(value);
        }
        forEach(callbackfn, thisArg) {
            this._map.forEach((_value, key) => callbackfn.call(thisArg, key, key, this));
        }
        has(value) {
            return this._map.has(value);
        }
        entries() {
            return this._map.entries();
        }
        keys() {
            return this._map.keys();
        }
        values() {
            return this._map.keys();
        }
        [(_b = Symbol.toStringTag, Symbol.iterator)]() {
            return this.keys();
        }
    }
    exports.ResourceSet = ResourceSet;
    var Touch;
    (function (Touch) {
        Touch[Touch["None"] = 0] = "None";
        Touch[Touch["AsOld"] = 1] = "AsOld";
        Touch[Touch["AsNew"] = 2] = "AsNew";
    })(Touch || (exports.Touch = Touch = {}));
    class LinkedMap {
        constructor() {
            this[_c] = 'LinkedMap';
            this._map = new Map();
            this._head = undefined;
            this._tail = undefined;
            this._size = 0;
            this._state = 0;
        }
        clear() {
            this._map.clear();
            this._head = undefined;
            this._tail = undefined;
            this._size = 0;
            this._state++;
        }
        isEmpty() {
            return !this._head && !this._tail;
        }
        get size() {
            return this._size;
        }
        get first() {
            return this._head?.value;
        }
        get last() {
            return this._tail?.value;
        }
        has(key) {
            return this._map.has(key);
        }
        get(key, touch = 0 /* Touch.None */) {
            const item = this._map.get(key);
            if (!item) {
                return undefined;
            }
            if (touch !== 0 /* Touch.None */) {
                this.touch(item, touch);
            }
            return item.value;
        }
        set(key, value, touch = 0 /* Touch.None */) {
            let item = this._map.get(key);
            if (item) {
                item.value = value;
                if (touch !== 0 /* Touch.None */) {
                    this.touch(item, touch);
                }
            }
            else {
                item = { key, value, next: undefined, previous: undefined };
                switch (touch) {
                    case 0 /* Touch.None */:
                        this.addItemLast(item);
                        break;
                    case 1 /* Touch.AsOld */:
                        this.addItemFirst(item);
                        break;
                    case 2 /* Touch.AsNew */:
                        this.addItemLast(item);
                        break;
                    default:
                        this.addItemLast(item);
                        break;
                }
                this._map.set(key, item);
                this._size++;
            }
            return this;
        }
        delete(key) {
            return !!this.remove(key);
        }
        remove(key) {
            const item = this._map.get(key);
            if (!item) {
                return undefined;
            }
            this._map.delete(key);
            this.removeItem(item);
            this._size--;
            return item.value;
        }
        shift() {
            if (!this._head && !this._tail) {
                return undefined;
            }
            if (!this._head || !this._tail) {
                throw new Error('Invalid list');
            }
            const item = this._head;
            this._map.delete(item.key);
            this.removeItem(item);
            this._size--;
            return item.value;
        }
        forEach(callbackfn, thisArg) {
            const state = this._state;
            let current = this._head;
            while (current) {
                if (thisArg) {
                    callbackfn.bind(thisArg)(current.value, current.key, this);
                }
                else {
                    callbackfn(current.value, current.key, this);
                }
                if (this._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                current = current.next;
            }
        }
        keys() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.key, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        values() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.value, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        entries() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: [current.key, current.value], done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        [(_c = Symbol.toStringTag, Symbol.iterator)]() {
            return this.entries();
        }
        trimOld(newSize) {
            if (newSize >= this.size) {
                return;
            }
            if (newSize === 0) {
                this.clear();
                return;
            }
            let current = this._head;
            let currentSize = this.size;
            while (current && currentSize > newSize) {
                this._map.delete(current.key);
                current = current.next;
                currentSize--;
            }
            this._head = current;
            this._size = currentSize;
            if (current) {
                current.previous = undefined;
            }
            this._state++;
        }
        addItemFirst(item) {
            // First time Insert
            if (!this._head && !this._tail) {
                this._tail = item;
            }
            else if (!this._head) {
                throw new Error('Invalid list');
            }
            else {
                item.next = this._head;
                this._head.previous = item;
            }
            this._head = item;
            this._state++;
        }
        addItemLast(item) {
            // First time Insert
            if (!this._head && !this._tail) {
                this._head = item;
            }
            else if (!this._tail) {
                throw new Error('Invalid list');
            }
            else {
                item.previous = this._tail;
                this._tail.next = item;
            }
            this._tail = item;
            this._state++;
        }
        removeItem(item) {
            if (item === this._head && item === this._tail) {
                this._head = undefined;
                this._tail = undefined;
            }
            else if (item === this._head) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.next) {
                    throw new Error('Invalid list');
                }
                item.next.previous = undefined;
                this._head = item.next;
            }
            else if (item === this._tail) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.previous) {
                    throw new Error('Invalid list');
                }
                item.previous.next = undefined;
                this._tail = item.previous;
            }
            else {
                const next = item.next;
                const previous = item.previous;
                if (!next || !previous) {
                    throw new Error('Invalid list');
                }
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = undefined;
            this._state++;
        }
        touch(item, touch) {
            if (!this._head || !this._tail) {
                throw new Error('Invalid list');
            }
            if ((touch !== 1 /* Touch.AsOld */ && touch !== 2 /* Touch.AsNew */)) {
                return;
            }
            if (touch === 1 /* Touch.AsOld */) {
                if (item === this._head) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item
                if (item === this._tail) {
                    // previous must be defined since item was not head but is tail
                    // So there are more than on item in the map
                    previous.next = undefined;
                    this._tail = previous;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                // Insert the node at head
                item.previous = undefined;
                item.next = this._head;
                this._head.previous = item;
                this._head = item;
                this._state++;
            }
            else if (touch === 2 /* Touch.AsNew */) {
                if (item === this._tail) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item.
                if (item === this._head) {
                    // next must be defined since item was not tail but is head
                    // So there are more than on item in the map
                    next.previous = undefined;
                    this._head = next;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                item.next = undefined;
                item.previous = this._tail;
                this._tail.next = item;
                this._tail = item;
                this._state++;
            }
        }
        toJSON() {
            const data = [];
            this.forEach((value, key) => {
                data.push([key, value]);
            });
            return data;
        }
        fromJSON(data) {
            this.clear();
            for (const [key, value] of data) {
                this.set(key, value);
            }
        }
    }
    exports.LinkedMap = LinkedMap;
    class LRUCache extends LinkedMap {
        constructor(limit, ratio = 1) {
            super();
            this._limit = limit;
            this._ratio = Math.min(Math.max(0, ratio), 1);
        }
        get limit() {
            return this._limit;
        }
        set limit(limit) {
            this._limit = limit;
            this.checkTrim();
        }
        get ratio() {
            return this._ratio;
        }
        set ratio(ratio) {
            this._ratio = Math.min(Math.max(0, ratio), 1);
            this.checkTrim();
        }
        get(key, touch = 2 /* Touch.AsNew */) {
            return super.get(key, touch);
        }
        peek(key) {
            return super.get(key, 0 /* Touch.None */);
        }
        set(key, value) {
            super.set(key, value, 2 /* Touch.AsNew */);
            this.checkTrim();
            return this;
        }
        checkTrim() {
            if (this.size > this._limit) {
                this.trimOld(Math.round(this._limit * this._ratio));
            }
        }
    }
    exports.LRUCache = LRUCache;
    class CounterSet {
        constructor() {
            this.map = new Map();
        }
        add(value) {
            this.map.set(value, (this.map.get(value) || 0) + 1);
            return this;
        }
        delete(value) {
            let counter = this.map.get(value) || 0;
            if (counter === 0) {
                return false;
            }
            counter--;
            if (counter === 0) {
                this.map.delete(value);
            }
            else {
                this.map.set(value, counter);
            }
            return true;
        }
        has(value) {
            return this.map.has(value);
        }
    }
    exports.CounterSet = CounterSet;
    /**
     * A map that allows access both by keys and values.
     * **NOTE**: values need to be unique.
     */
    class BidirectionalMap {
        constructor(entries) {
            this._m1 = new Map();
            this._m2 = new Map();
            if (entries) {
                for (const [key, value] of entries) {
                    this.set(key, value);
                }
            }
        }
        clear() {
            this._m1.clear();
            this._m2.clear();
        }
        set(key, value) {
            this._m1.set(key, value);
            this._m2.set(value, key);
        }
        get(key) {
            return this._m1.get(key);
        }
        getKey(value) {
            return this._m2.get(value);
        }
        delete(key) {
            const value = this._m1.get(key);
            if (value === undefined) {
                return false;
            }
            this._m1.delete(key);
            this._m2.delete(value);
            return true;
        }
        forEach(callbackfn, thisArg) {
            this._m1.forEach((value, key) => {
                callbackfn.call(thisArg, value, key, this);
            });
        }
        keys() {
            return this._m1.keys();
        }
        values() {
            return this._m1.values();
        }
    }
    exports.BidirectionalMap = BidirectionalMap;
    class SetMap {
        constructor() {
            this.map = new Map();
        }
        add(key, value) {
            let values = this.map.get(key);
            if (!values) {
                values = new Set();
                this.map.set(key, values);
            }
            values.add(value);
        }
        delete(key, value) {
            const values = this.map.get(key);
            if (!values) {
                return;
            }
            values.delete(value);
            if (values.size === 0) {
                this.map.delete(key);
            }
        }
        forEach(key, fn) {
            const values = this.map.get(key);
            if (!values) {
                return;
            }
            values.forEach(fn);
        }
        get(key) {
            const values = this.map.get(key);
            if (!values) {
                return new Set();
            }
            return values;
        }
    }
    exports.SetMap = SetMap;
    function mapsStrictEqualIgnoreOrder(a, b) {
        if (a === b) {
            return true;
        }
        if (a.size !== b.size) {
            return false;
        }
        for (const [key, value] of a) {
            if (!b.has(key) || b.get(key) !== value) {
                return false;
            }
        }
        for (const [key] of b) {
            if (!a.has(key)) {
                return false;
            }
        }
        return true;
    }
    exports.mapsStrictEqualIgnoreOrder = mapsStrictEqualIgnoreOrder;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[2/*vs/base/common/lifecycle*/], __M([1/*require*/,0/*exports*/,13/*vs/base/common/arrays*/,342/*vs/base/common/collections*/,50/*vs/base/common/map*/,220/*vs/base/common/functional*/,75/*vs/base/common/iterator*/]), function (require, exports, arrays_1, collections_1, map_1, functional_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableMap = exports.disposeOnReturn = exports.ImmortalReference = exports.AsyncReferenceCollection = exports.ReferenceCollection = exports.SafeDisposable = exports.RefCountedDisposable = exports.MandatoryMutableDisposable = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.disposeIfDisposable = exports.dispose = exports.isDisposable = exports.markAsSingleton = exports.markAsDisposed = exports.trackDisposable = exports.setDisposableTracker = exports.DisposableTracker = void 0;
    // #region Disposable Tracking
    /**
     * Enables logging of potentially leaked disposables.
     *
     * A disposable is considered leaked if it is not disposed or not registered as the child of
     * another disposable. This tracking is very simple an only works for classes that either
     * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
     */
    const TRACK_DISPOSABLES = false;
    let disposableTracker = null;
    class DisposableTracker {
        constructor() {
            this.livingDisposables = new Map();
        }
        static { this.idx = 0; }
        getDisposableData(d) {
            let val = this.livingDisposables.get(d);
            if (!val) {
                val = { parent: null, source: null, isSingleton: false, value: d, idx: DisposableTracker.idx++ };
                this.livingDisposables.set(d, val);
            }
            return val;
        }
        trackDisposable(d) {
            const data = this.getDisposableData(d);
            if (!data.source) {
                data.source =
                    new Error().stack;
            }
        }
        setParent(child, parent) {
            const data = this.getDisposableData(child);
            data.parent = parent;
        }
        markAsDisposed(x) {
            this.livingDisposables.delete(x);
        }
        markAsSingleton(disposable) {
            this.getDisposableData(disposable).isSingleton = true;
        }
        getRootParent(data, cache) {
            const cacheValue = cache.get(data);
            if (cacheValue) {
                return cacheValue;
            }
            const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
            cache.set(data, result);
            return result;
        }
        getTrackedDisposables() {
            const rootParentCache = new Map();
            const leaking = [...this.livingDisposables.entries()]
                .filter(([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)
                .flatMap(([k]) => k);
            return leaking;
        }
        computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
            let uncoveredLeakingObjs;
            if (preComputedLeaks) {
                uncoveredLeakingObjs = preComputedLeaks;
            }
            else {
                const rootParentCache = new Map();
                const leakingObjects = [...this.livingDisposables.values()]
                    .filter((info) => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton);
                if (leakingObjects.length === 0) {
                    return;
                }
                const leakingObjsSet = new Set(leakingObjects.map(o => o.value));
                // Remove all objects that are a child of other leaking objects. Assumes there are no cycles.
                uncoveredLeakingObjs = leakingObjects.filter(l => {
                    return !(l.parent && leakingObjsSet.has(l.parent));
                });
                if (uncoveredLeakingObjs.length === 0) {
                    throw new Error('There are cyclic diposable chains!');
                }
            }
            if (!uncoveredLeakingObjs) {
                return undefined;
            }
            function getStackTracePath(leaking) {
                function removePrefix(array, linesToRemove) {
                    while (array.length > 0 && linesToRemove.some(regexp => typeof regexp === 'string' ? regexp === array[0] : array[0].match(regexp))) {
                        array.shift();
                    }
                }
                const lines = leaking.source.split('\n').map(p => p.trim().replace('at ', '')).filter(l => l !== '');
                removePrefix(lines, ['Error', /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]);
                return lines.reverse();
            }
            const stackTraceStarts = new map_1.SetMap();
            for (const leaking of uncoveredLeakingObjs) {
                const stackTracePath = getStackTracePath(leaking);
                for (let i = 0; i <= stackTracePath.length; i++) {
                    stackTraceStarts.add(stackTracePath.slice(0, i).join('\n'), leaking);
                }
            }
            // Put earlier leaks first
            uncoveredLeakingObjs.sort((0, arrays_1.compareBy)(l => l.idx, arrays_1.numberComparator));
            let message = '';
            let i = 0;
            for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
                i++;
                const stackTracePath = getStackTracePath(leaking);
                const stackTraceFormattedLines = [];
                for (let i = 0; i < stackTracePath.length; i++) {
                    let line = stackTracePath[i];
                    const starts = stackTraceStarts.get(stackTracePath.slice(0, i + 1).join('\n'));
                    line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
                    const prevStarts = stackTraceStarts.get(stackTracePath.slice(0, i).join('\n'));
                    const continuations = (0, collections_1.groupBy)([...prevStarts].map(d => getStackTracePath(d)[i]), v => v);
                    delete continuations[stackTracePath[i]];
                    for (const [cont, set] of Object.entries(continuations)) {
                        stackTraceFormattedLines.unshift(`    - stacktraces of ${set.length} other leaks continue with ${cont}`);
                    }
                    stackTraceFormattedLines.unshift(line);
                }
                message += `\n\n\n==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================\n${stackTraceFormattedLines.join('\n')}\n============================================================\n\n`;
            }
            if (uncoveredLeakingObjs.length > maxReported) {
                message += `\n\n\n... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables\n\n`;
            }
            return { leaks: uncoveredLeakingObjs, details: message };
        }
    }
    exports.DisposableTracker = DisposableTracker;
    function setDisposableTracker(tracker) {
        disposableTracker = tracker;
    }
    exports.setDisposableTracker = setDisposableTracker;
    if (TRACK_DISPOSABLES) {
        const __is_disposable_tracked__ = '__is_disposable_tracked__';
        setDisposableTracker(new class {
            trackDisposable(x) {
                const stack = new Error('Potentially leaked disposable').stack;
                setTimeout(() => {
                    if (!x[__is_disposable_tracked__]) {
                        console.log(stack);
                    }
                }, 3000);
            }
            setParent(child, parent) {
                if (child && child !== Disposable.None) {
                    try {
                        child[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsDisposed(disposable) {
                if (disposable && disposable !== Disposable.None) {
                    try {
                        disposable[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsSingleton(disposable) { }
        });
    }
    function trackDisposable(x) {
        disposableTracker?.trackDisposable(x);
        return x;
    }
    exports.trackDisposable = trackDisposable;
    function markAsDisposed(disposable) {
        disposableTracker?.markAsDisposed(disposable);
    }
    exports.markAsDisposed = markAsDisposed;
    function setParentOfDisposable(child, parent) {
        disposableTracker?.setParent(child, parent);
    }
    function setParentOfDisposables(children, parent) {
        if (!disposableTracker) {
            return;
        }
        for (const child of children) {
            disposableTracker.setParent(child, parent);
        }
    }
    /**
     * Indicates that the given object is a singleton which does not need to be disposed.
    */
    function markAsSingleton(singleton) {
        disposableTracker?.markAsSingleton(singleton);
        return singleton;
    }
    exports.markAsSingleton = markAsSingleton;
    /**
     * Check if `thing` is {@link IDisposable disposable}.
     */
    function isDisposable(thing) {
        return typeof thing.dispose === 'function' && thing.dispose.length === 0;
    }
    exports.isDisposable = isDisposable;
    function dispose(arg) {
        if (iterator_1.Iterable.is(arg)) {
            const errors = [];
            for (const d of arg) {
                if (d) {
                    try {
                        d.dispose();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }
            }
            if (errors.length === 1) {
                throw errors[0];
            }
            else if (errors.length > 1) {
                throw new AggregateError(errors, 'Encountered errors while disposing of store');
            }
            return Array.isArray(arg) ? [] : arg;
        }
        else if (arg) {
            arg.dispose();
            return arg;
        }
    }
    exports.dispose = dispose;
    function disposeIfDisposable(disposables) {
        for (const d of disposables) {
            if (isDisposable(d)) {
                d.dispose();
            }
        }
        return [];
    }
    exports.disposeIfDisposable = disposeIfDisposable;
    /**
     * Combine multiple disposable values into a single {@link IDisposable}.
     */
    function combinedDisposable(...disposables) {
        const parent = toDisposable(() => dispose(disposables));
        setParentOfDisposables(disposables, parent);
        return parent;
    }
    exports.combinedDisposable = combinedDisposable;
    /**
     * Turn a function that implements dispose into an {@link IDisposable}.
     *
     * @param fn Clean up function, guaranteed to be called only **once**.
     */
    function toDisposable(fn) {
        const self = trackDisposable({
            dispose: (0, functional_1.createSingleCallFunction)(() => {
                markAsDisposed(self);
                fn();
            })
        });
        return self;
    }
    exports.toDisposable = toDisposable;
    /**
     * Manages a collection of disposable values.
     *
     * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
     * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
     * store that has already been disposed of.
     */
    class DisposableStore {
        static { this.DISABLE_DISPOSED_WARNING = false; }
        constructor() {
            this._toDispose = new Set();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Dispose of all registered disposables and mark this object as disposed.
         *
         * Any future disposables added to this object will be disposed of on `add`.
         */
        dispose() {
            if (this._isDisposed) {
                return;
            }
            markAsDisposed(this);
            this._isDisposed = true;
            this.clear();
        }
        /**
         * @return `true` if this object has been disposed of.
         */
        get isDisposed() {
            return this._isDisposed;
        }
        /**
         * Dispose of all registered disposables but do not mark this object as disposed.
         */
        clear() {
            if (this._toDispose.size === 0) {
                return;
            }
            try {
                dispose(this._toDispose);
            }
            finally {
                this._toDispose.clear();
            }
        }
        /**
         * Add a new {@link IDisposable disposable} to the collection.
         */
        add(o) {
            if (!o) {
                return o;
            }
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            setParentOfDisposable(o, this);
            if (this._isDisposed) {
                if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                    console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
                }
            }
            else {
                this._toDispose.add(o);
            }
            return o;
        }
        /**
         * Deletes a disposable from store and disposes of it. This will not throw or warn and proceed to dispose the
         * disposable even when the disposable is not part in the store.
         */
        delete(o) {
            if (!o) {
                return;
            }
            if (o === this) {
                throw new Error('Cannot dispose a disposable on itself!');
            }
            this._toDispose.delete(o);
            o.dispose();
        }
        /**
         * Deletes the value from the store, but does not dispose it.
         */
        deleteAndLeak(o) {
            if (!o) {
                return;
            }
            if (this._toDispose.has(o)) {
                this._toDispose.delete(o);
                setParentOfDisposable(o, null);
            }
        }
    }
    exports.DisposableStore = DisposableStore;
    /**
     * Abstract base class for a {@link IDisposable disposable} object.
     *
     * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
     */
    class Disposable {
        /**
         * A disposable that does nothing when it is disposed of.
         *
         * TODO: This should not be a static property.
         */
        static { this.None = Object.freeze({ dispose() { } }); }
        constructor() {
            this._store = new DisposableStore();
            trackDisposable(this);
            setParentOfDisposable(this._store, this);
        }
        dispose() {
            markAsDisposed(this);
            this._store.dispose();
        }
        /**
         * Adds `o` to the collection of disposables managed by this object.
         */
        _register(o) {
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            return this._store.add(o);
        }
    }
    exports.Disposable = Disposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed.
     *
     * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
     * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
     */
    class MutableDisposable {
        constructor() {
            this._isDisposed = false;
            trackDisposable(this);
        }
        get value() {
            return this._isDisposed ? undefined : this._value;
        }
        set value(value) {
            if (this._isDisposed || value === this._value) {
                return;
            }
            this._value?.dispose();
            if (value) {
                setParentOfDisposable(value, this);
            }
            this._value = value;
        }
        /**
         * Resets the stored value and disposed of the previously stored value.
         */
        clear() {
            this.value = undefined;
        }
        dispose() {
            this._isDisposed = true;
            markAsDisposed(this);
            this._value?.dispose();
            this._value = undefined;
        }
        /**
         * Clears the value, but does not dispose it.
         * The old value is returned.
        */
        clearAndLeak() {
            const oldValue = this._value;
            this._value = undefined;
            if (oldValue) {
                setParentOfDisposable(oldValue, null);
            }
            return oldValue;
        }
    }
    exports.MutableDisposable = MutableDisposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed like {@link MutableDisposable}, but the value must
     * exist and cannot be undefined.
     */
    class MandatoryMutableDisposable {
        constructor(initialValue) {
            this._disposable = new MutableDisposable();
            this._isDisposed = false;
            this._disposable.value = initialValue;
        }
        get value() {
            return this._disposable.value;
        }
        set value(value) {
            if (this._isDisposed || value === this._disposable.value) {
                return;
            }
            this._disposable.value = value;
        }
        dispose() {
            this._isDisposed = true;
            this._disposable.dispose();
        }
    }
    exports.MandatoryMutableDisposable = MandatoryMutableDisposable;
    class RefCountedDisposable {
        constructor(_disposable) {
            this._disposable = _disposable;
            this._counter = 1;
        }
        acquire() {
            this._counter++;
            return this;
        }
        release() {
            if (--this._counter === 0) {
                this._disposable.dispose();
            }
            return this;
        }
    }
    exports.RefCountedDisposable = RefCountedDisposable;
    /**
     * A safe disposable can be `unset` so that a leaked reference (listener)
     * can be cut-off.
     */
    class SafeDisposable {
        constructor() {
            this.dispose = () => { };
            this.unset = () => { };
            this.isset = () => false;
            trackDisposable(this);
        }
        set(fn) {
            let callback = fn;
            this.unset = () => callback = undefined;
            this.isset = () => callback !== undefined;
            this.dispose = () => {
                if (callback) {
                    callback();
                    callback = undefined;
                    markAsDisposed(this);
                }
            };
            return this;
        }
    }
    exports.SafeDisposable = SafeDisposable;
    class ReferenceCollection {
        constructor() {
            this.references = new Map();
        }
        acquire(key, ...args) {
            let reference = this.references.get(key);
            if (!reference) {
                reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
                this.references.set(key, reference);
            }
            const { object } = reference;
            const dispose = (0, functional_1.createSingleCallFunction)(() => {
                if (--reference.counter === 0) {
                    this.destroyReferencedObject(key, reference.object);
                    this.references.delete(key);
                }
            });
            reference.counter++;
            return { object, dispose };
        }
    }
    exports.ReferenceCollection = ReferenceCollection;
    /**
     * Unwraps a reference collection of promised values. Makes sure
     * references are disposed whenever promises get rejected.
     */
    class AsyncReferenceCollection {
        constructor(referenceCollection) {
            this.referenceCollection = referenceCollection;
        }
        async acquire(key, ...args) {
            const ref = this.referenceCollection.acquire(key, ...args);
            try {
                const object = await ref.object;
                return {
                    object,
                    dispose: () => ref.dispose()
                };
            }
            catch (error) {
                ref.dispose();
                throw error;
            }
        }
    }
    exports.AsyncReferenceCollection = AsyncReferenceCollection;
    class ImmortalReference {
        constructor(object) {
            this.object = object;
        }
        dispose() { }
    }
    exports.ImmortalReference = ImmortalReference;
    function disposeOnReturn(fn) {
        const store = new DisposableStore();
        try {
            fn(store);
        }
        finally {
            store.dispose();
        }
    }
    exports.disposeOnReturn = disposeOnReturn;
    /**
     * A map the manages the lifecycle of the values that it stores.
     */
    class DisposableMap {
        constructor() {
            this._store = new Map();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Disposes of all stored values and mark this object as disposed.
         *
         * Trying to use this object after it has been disposed of is an error.
         */
        dispose() {
            markAsDisposed(this);
            this._isDisposed = true;
            this.clearAndDisposeAll();
        }
        /**
         * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
         */
        clearAndDisposeAll() {
            if (!this._store.size) {
                return;
            }
            try {
                dispose(this._store.values());
            }
            finally {
                this._store.clear();
            }
        }
        has(key) {
            return this._store.has(key);
        }
        get size() {
            return this._store.size;
        }
        get(key) {
            return this._store.get(key);
        }
        set(key, value, skipDisposeOnOverwrite = false) {
            if (this._isDisposed) {
                console.warn(new Error('Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!').stack);
            }
            if (!skipDisposeOnOverwrite) {
                this._store.get(key)?.dispose();
            }
            this._store.set(key, value);
        }
        /**
         * Delete the value stored for `key` from this map and also dispose of it.
         */
        deleteAndDispose(key) {
            this._store.get(key)?.dispose();
            this._store.delete(key);
        }
        keys() {
            return this._store.keys();
        }
        values() {
            return this._store.values();
        }
        [Symbol.iterator]() {
            return this._store[Symbol.iterator]();
        }
    }
    exports.DisposableMap = DisposableMap;
});

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2022, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

// ESM-uncomment-begin
// let __marked_exports = {};
// (function() {
//   function define(deps, factory) {
//     factory(__marked_exports);
//   }
//   define.amd = true;
// ESM-uncomment-end

 (function (global, factory) {
  typeof define === 'function' && define.amd ? define(__m[313/*vs/base/common/marked/marked*/], __M([0/*exports*/]), factory) :
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.marked = {}));
})(this, (function (exports) { 'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);

    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function getDefaults() {
    return {
      async: false,
      baseUrl: null,
      breaks: false,
      extensions: null,
      gfm: true,
      headerIds: true,
      headerPrefix: '',
      highlight: null,
      langPrefix: 'language-',
      mangle: true,
      pedantic: false,
      renderer: null,
      sanitize: false,
      sanitizer: null,
      silent: false,
      smartLists: false,
      smartypants: false,
      tokenizer: null,
      walkTokens: null,
      xhtml: false
    };
  }
  exports.defaults = getDefaults();
  function changeDefaults(newDefaults) {
    exports.defaults = newDefaults;
  }

  /**
   * Helpers
   */
  var escapeTest = /[&<>"']/;
  var escapeReplace = /[&<>"']/g;
  var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  var escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  var getEscapeReplacement = function getEscapeReplacement(ch) {
    return escapeReplacements[ch];
  };

  function escape(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }

    return html;
  }
  var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
  /**
   * @param {string} html
   */

  function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(unescapeTest, function (_, n) {
      n = n.toLowerCase();
      if (n === 'colon') return ':';

      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
      }

      return '';
    });
  }
  var caret = /(^|[^\[])\^/g;
  /**
   * @param {string | RegExp} regex
   * @param {string} opt
   */

  function edit(regex, opt) {
    regex = typeof regex === 'string' ? regex : regex.source;
    opt = opt || '';
    var obj = {
      replace: function replace(name, val) {
        val = val.source || val;
        val = val.replace(caret, '$1');
        regex = regex.replace(name, val);
        return obj;
      },
      getRegex: function getRegex() {
        return new RegExp(regex, opt);
      }
    };
    return obj;
  }
  var nonWordAndColonTest = /[^\w:]/g;
  var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
  /**
   * @param {boolean} sanitize
   * @param {string} base
   * @param {string} href
   */

  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      var prot;

      try {
        prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
      } catch (e) {
        return null;
      }

      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
        return null;
      }
    }

    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }

    try {
      href = encodeURI(href).replace(/%25/g, '%');
    } catch (e) {
      return null;
    }

    return href;
  }
  var baseUrls = {};
  var justDomain = /^[^:]+:\/*[^/]*$/;
  var protocol = /^([^:]+:)[\s\S]*$/;
  var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;
  /**
   * @param {string} base
   * @param {string} href
   */

  function resolveUrl(base, href) {
    if (!baseUrls[' ' + base]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (justDomain.test(base)) {
        baseUrls[' ' + base] = base + '/';
      } else {
        baseUrls[' ' + base] = rtrim(base, '/', true);
      }
    }

    base = baseUrls[' ' + base];
    var relativeBase = base.indexOf(':') === -1;

    if (href.substring(0, 2) === '//') {
      if (relativeBase) {
        return href;
      }

      return base.replace(protocol, '$1') + href;
    } else if (href.charAt(0) === '/') {
      if (relativeBase) {
        return href;
      }

      return base.replace(domain, '$1') + href;
    } else {
      return base + href;
    }
  }
  var noopTest = {
    exec: function noopTest() {}
  };
  function merge(obj) {
    var i = 1,
        target,
        key;

    for (; i < arguments.length; i++) {
      target = arguments[i];

      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }

    return obj;
  }
  function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    var row = tableRow.replace(/\|/g, function (match, offset, str) {
      var escaped = false,
          curr = offset;

      while (--curr >= 0 && str[curr] === '\\') {
        escaped = !escaped;
      }

      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return '|';
      } else {
        // add space before unescaped |
        return ' |';
      }
    }),
        cells = row.split(/ \|/);
    var i = 0; // First/last cell in a row cannot be empty if it has no leading/trailing pipe

    if (!cells[0].trim()) {
      cells.shift();
    }

    if (cells.length > 0 && !cells[cells.length - 1].trim()) {
      cells.pop();
    }

    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) {
        cells.push('');
      }
    }

    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }

    return cells;
  }
  /**
   * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
   * /c*$/ is vulnerable to REDOS.
   *
   * @param {string} str
   * @param {string} c
   * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
   */

  function rtrim(str, c, invert) {
    var l = str.length;

    if (l === 0) {
      return '';
    } // Length of suffix matching the invert condition.


    var suffLen = 0; // Step left until we fail to match the invert condition.

    while (suffLen < l) {
      var currChar = str.charAt(l - suffLen - 1);

      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }

    return str.slice(0, l - suffLen);
  }
  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }

    var l = str.length;
    var level = 0,
        i = 0;

    for (; i < l; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;

        if (level < 0) {
          return i;
        }
      }
    }

    return -1;
  }
  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
    }
  } // copied from https://stackoverflow.com/a/5450113/806777

  /**
   * @param {string} pattern
   * @param {number} count
   */

  function repeatString(pattern, count) {
    if (count < 1) {
      return '';
    }

    var result = '';

    while (count > 1) {
      if (count & 1) {
        result += pattern;
      }

      count >>= 1;
      pattern += pattern;
    }

    return result + pattern;
  }

  function outputLink(cap, link, raw, lexer) {
    var href = link.href;
    var title = link.title ? escape(link.title) : null;
    var text = cap[1].replace(/\\([\[\]])/g, '$1');

    if (cap[0].charAt(0) !== '!') {
      lexer.state.inLink = true;
      var token = {
        type: 'link',
        raw: raw,
        href: href,
        title: title,
        text: text,
        tokens: lexer.inlineTokens(text)
      };
      lexer.state.inLink = false;
      return token;
    }

    return {
      type: 'image',
      raw: raw,
      href: href,
      title: title,
      text: escape(text)
    };
  }

  function indentCodeCompensation(raw, text) {
    var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

    if (matchIndentToCode === null) {
      return text;
    }

    var indentToCode = matchIndentToCode[1];
    return text.split('\n').map(function (node) {
      var matchIndentInNode = node.match(/^\s+/);

      if (matchIndentInNode === null) {
        return node;
      }

      var indentInNode = matchIndentInNode[0];

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }

      return node;
    }).join('\n');
  }
  /**
   * Tokenizer
   */


  var Tokenizer = /*#__PURE__*/function () {
    function Tokenizer(options) {
      this.options = options || exports.defaults;
    }

    var _proto = Tokenizer.prototype;

    _proto.space = function space(src) {
      var cap = this.rules.block.newline.exec(src);

      if (cap && cap[0].length > 0) {
        return {
          type: 'space',
          raw: cap[0]
        };
      }
    };

    _proto.code = function code(src) {
      var cap = this.rules.block.code.exec(src);

      if (cap) {
        var text = cap[0].replace(/^ {1,4}/gm, '');
        return {
          type: 'code',
          raw: cap[0],
          codeBlockStyle: 'indented',
          text: !this.options.pedantic ? rtrim(text, '\n') : text
        };
      }
    };

    _proto.fences = function fences(src) {
      var cap = this.rules.block.fences.exec(src);

      if (cap) {
        var raw = cap[0];
        var text = indentCodeCompensation(raw, cap[3] || '');
        return {
          type: 'code',
          raw: raw,
          lang: cap[2] ? cap[2].trim() : cap[2],
          text: text
        };
      }
    };

    _proto.heading = function heading(src) {
      var cap = this.rules.block.heading.exec(src);

      if (cap) {
        var text = cap[2].trim(); // remove trailing #s

        if (/#$/.test(text)) {
          var trimmed = rtrim(text, '#');

          if (this.options.pedantic) {
            text = trimmed.trim();
          } else if (!trimmed || / $/.test(trimmed)) {
            // CommonMark requires space before trailing #s
            text = trimmed.trim();
          }
        }

        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[1].length,
          text: text,
          tokens: this.lexer.inline(text)
        };
      }
    };

    _proto.hr = function hr(src) {
      var cap = this.rules.block.hr.exec(src);

      if (cap) {
        return {
          type: 'hr',
          raw: cap[0]
        };
      }
    };

    _proto.blockquote = function blockquote(src) {
      var cap = this.rules.block.blockquote.exec(src);

      if (cap) {
        var text = cap[0].replace(/^ *>[ \t]?/gm, '');
        return {
          type: 'blockquote',
          raw: cap[0],
          tokens: this.lexer.blockTokens(text, []),
          text: text
        };
      }
    };

    _proto.list = function list(src) {
      var cap = this.rules.block.list.exec(src);

      if (cap) {
        var raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine, line, nextLine, rawLine, itemContents, endEarly;
        var bull = cap[1].trim();
        var isordered = bull.length > 1;
        var list = {
          type: 'list',
          raw: '',
          ordered: isordered,
          start: isordered ? +bull.slice(0, -1) : '',
          loose: false,
          items: []
        };
        bull = isordered ? "\\d{1,9}\\" + bull.slice(-1) : "\\" + bull;

        if (this.options.pedantic) {
          bull = isordered ? bull : '[*+-]';
        } // Get next list item


        var itemRegex = new RegExp("^( {0,3}" + bull + ")((?:[\t ][^\\n]*)?(?:\\n|$))"); // Check if current bullet point can start a new List Item

        while (src) {
          endEarly = false;

          if (!(cap = itemRegex.exec(src))) {
            break;
          }

          if (this.rules.block.hr.test(src)) {
            // End list if bullet was actually HR (possibly move into itemRegex?)
            break;
          }

          raw = cap[0];
          src = src.substring(raw.length);
          line = cap[2].split('\n', 1)[0];
          nextLine = src.split('\n', 1)[0];

          if (this.options.pedantic) {
            indent = 2;
            itemContents = line.trimLeft();
          } else {
            indent = cap[2].search(/[^ ]/); // Find first non-space char

            indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent

            itemContents = line.slice(indent);
            indent += cap[1].length;
          }

          blankLine = false;

          if (!line && /^ *$/.test(nextLine)) {
            // Items begin with at most one blank line
            raw += nextLine + '\n';
            src = src.substring(nextLine.length + 1);
            endEarly = true;
          }

          if (!endEarly) {
            var nextBulletRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))");
            var hrRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)");
            var fencesBeginRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}(?:```|~~~)");
            var headingBeginRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}#"); // Check if following lines should be included in List Item

            while (src) {
              rawLine = src.split('\n', 1)[0];
              line = rawLine; // Re-align to follow commonmark nesting rules

              if (this.options.pedantic) {
                line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
              } // End list item if found code fences


              if (fencesBeginRegex.test(line)) {
                break;
              } // End list item if found start of new heading


              if (headingBeginRegex.test(line)) {
                break;
              } // End list item if found start of new bullet


              if (nextBulletRegex.test(line)) {
                break;
              } // Horizontal rule found


              if (hrRegex.test(src)) {
                break;
              }

              if (line.search(/[^ ]/) >= indent || !line.trim()) {
                // Dedent if possible
                itemContents += '\n' + line.slice(indent);
              } else if (!blankLine) {
                // Until blank line, item doesn't need indentation
                itemContents += '\n' + line;
              } else {
                // Otherwise, improper indentation ends this item
                break;
              }

              if (!blankLine && !line.trim()) {
                // Check if current line is blank
                blankLine = true;
              }

              raw += rawLine + '\n';
              src = src.substring(rawLine.length + 1);
            }
          }

          if (!list.loose) {
            // If the previous item ended with a blank line, the list is loose
            if (endsWithBlankLine) {
              list.loose = true;
            } else if (/\n *\n *$/.test(raw)) {
              endsWithBlankLine = true;
            }
          } // Check for task list items


          if (this.options.gfm) {
            istask = /^\[[ xX]\] /.exec(itemContents);

            if (istask) {
              ischecked = istask[0] !== '[ ] ';
              itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
            }
          }

          list.items.push({
            type: 'list_item',
            raw: raw,
            task: !!istask,
            checked: ischecked,
            loose: false,
            text: itemContents
          });
          list.raw += raw;
        } // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic


        list.items[list.items.length - 1].raw = raw.trimRight();
        list.items[list.items.length - 1].text = itemContents.trimRight();
        list.raw = list.raw.trimRight();
        var l = list.items.length; // Item child tokens handled here at end because we needed to have the final item to trim it first

        for (i = 0; i < l; i++) {
          this.lexer.state.top = false;
          list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
          var spacers = list.items[i].tokens.filter(function (t) {
            return t.type === 'space';
          });
          var hasMultipleLineBreaks = spacers.every(function (t) {
            var chars = t.raw.split('');
            var lineBreaks = 0;

            for (var _iterator = _createForOfIteratorHelperLoose(chars), _step; !(_step = _iterator()).done;) {
              var _char = _step.value;

              if (_char === '\n') {
                lineBreaks += 1;
              }

              if (lineBreaks > 1) {
                return true;
              }
            }

            return false;
          });

          if (!list.loose && spacers.length && hasMultipleLineBreaks) {
            // Having a single line break doesn't mean a list is loose. A single line break is terminating the last list item
            list.loose = true;
            list.items[i].loose = true;
          }
        }

        return list;
      }
    };

    _proto.html = function html(src) {
      var cap = this.rules.block.html.exec(src);

      if (cap) {
        var token = {
          type: 'html',
          raw: cap[0],
          pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: cap[0]
        };

        if (this.options.sanitize) {
          var text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
          token.type = 'paragraph';
          token.text = text;
          token.tokens = this.lexer.inline(text);
        }

        return token;
      }
    };

    _proto.def = function def(src) {
      var cap = this.rules.block.def.exec(src);

      if (cap) {
        if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
        var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
        return {
          type: 'def',
          tag: tag,
          raw: cap[0],
          href: cap[2],
          title: cap[3]
        };
      }
    };

    _proto.table = function table(src) {
      var cap = this.rules.block.table.exec(src);

      if (cap) {
        var item = {
          type: 'table',
          header: splitCells(cap[1]).map(function (c) {
            return {
              text: c
            };
          }),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
        };

        if (item.header.length === item.align.length) {
          item.raw = cap[0];
          var l = item.align.length;
          var i, j, k, row;

          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          l = item.rows.length;

          for (i = 0; i < l; i++) {
            item.rows[i] = splitCells(item.rows[i], item.header.length).map(function (c) {
              return {
                text: c
              };
            });
          } // parse child tokens inside headers and cells
          // header child tokens


          l = item.header.length;

          for (j = 0; j < l; j++) {
            item.header[j].tokens = this.lexer.inline(item.header[j].text);
          } // cell child tokens


          l = item.rows.length;

          for (j = 0; j < l; j++) {
            row = item.rows[j];

            for (k = 0; k < row.length; k++) {
              row[k].tokens = this.lexer.inline(row[k].text);
            }
          }

          return item;
        }
      }
    };

    _proto.lheading = function lheading(src) {
      var cap = this.rules.block.lheading.exec(src);

      if (cap) {
        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[2].charAt(0) === '=' ? 1 : 2,
          text: cap[1],
          tokens: this.lexer.inline(cap[1])
        };
      }
    };

    _proto.paragraph = function paragraph(src) {
      var cap = this.rules.block.paragraph.exec(src);

      if (cap) {
        var text = cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1];
        return {
          type: 'paragraph',
          raw: cap[0],
          text: text,
          tokens: this.lexer.inline(text)
        };
      }
    };

    _proto.text = function text(src) {
      var cap = this.rules.block.text.exec(src);

      if (cap) {
        return {
          type: 'text',
          raw: cap[0],
          text: cap[0],
          tokens: this.lexer.inline(cap[0])
        };
      }
    };

    _proto.escape = function escape$1(src) {
      var cap = this.rules.inline.escape.exec(src);

      if (cap) {
        return {
          type: 'escape',
          raw: cap[0],
          text: escape(cap[1])
        };
      }
    };

    _proto.tag = function tag(src) {
      var cap = this.rules.inline.tag.exec(src);

      if (cap) {
        if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
          this.lexer.state.inLink = true;
        } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
          this.lexer.state.inLink = false;
        }

        if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = true;
        } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = false;
        }

        return {
          type: this.options.sanitize ? 'text' : 'html',
          raw: cap[0],
          inLink: this.lexer.state.inLink,
          inRawBlock: this.lexer.state.inRawBlock,
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0]
        };
      }
    };

    _proto.link = function link(src) {
      var cap = this.rules.inline.link.exec(src);

      if (cap) {
        var trimmedUrl = cap[2].trim();

        if (!this.options.pedantic && /^</.test(trimmedUrl)) {
          // commonmark requires matching angle brackets
          if (!/>$/.test(trimmedUrl)) {
            return;
          } // ending angle bracket cannot be escaped


          var rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');

          if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
            return;
          }
        } else {
          // find closing parenthesis
          var lastParenIndex = findClosingBracket(cap[2], '()');

          if (lastParenIndex > -1) {
            var start = cap[0].indexOf('!') === 0 ? 5 : 4;
            var linkLen = start + cap[1].length + lastParenIndex;
            cap[2] = cap[2].substring(0, lastParenIndex);
            cap[0] = cap[0].substring(0, linkLen).trim();
            cap[3] = '';
          }
        }

        var href = cap[2];
        var title = '';

        if (this.options.pedantic) {
          // split pedantic href and title
          var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : '';
        }

        href = href.trim();

        if (/^</.test(href)) {
          if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
            // pedantic allows starting angle bracket without ending angle bracket
            href = href.slice(1);
          } else {
            href = href.slice(1, -1);
          }
        }

        return outputLink(cap, {
          href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
          title: title ? title.replace(this.rules.inline._escapes, '$1') : title
        }, cap[0], this.lexer);
      }
    };

    _proto.reflink = function reflink(src, links) {
      var cap;

      if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
        var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = links[link.toLowerCase()];

        if (!link || !link.href) {
          var text = cap[0].charAt(0);
          return {
            type: 'text',
            raw: text,
            text: text
          };
        }

        return outputLink(cap, link, cap[0], this.lexer);
      }
    };

    _proto.emStrong = function emStrong(src, maskedSrc, prevChar) {
      if (prevChar === void 0) {
        prevChar = '';
      }

      var match = this.rules.inline.emStrong.lDelim.exec(src);
      if (!match) return; // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well

      if (match[3] && prevChar.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/)) return;
      var nextChar = match[1] || match[2] || '';

      if (!nextChar || nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar))) {
        var lLength = match[0].length - 1;
        var rDelim,
            rLength,
            delimTotal = lLength,
            midDelimTotal = 0;
        var endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
        endReg.lastIndex = 0; // Clip maskedSrc to same section of string as src (move to lexer?)

        maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

        while ((match = endReg.exec(maskedSrc)) != null) {
          rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
          if (!rDelim) continue; // skip single * in __abc*abc__

          rLength = rDelim.length;

          if (match[3] || match[4]) {
            // found another Left Delim
            delimTotal += rLength;
            continue;
          } else if (match[5] || match[6]) {
            // either Left or Right Delim
            if (lLength % 3 && !((lLength + rLength) % 3)) {
              midDelimTotal += rLength;
              continue; // CommonMark Emphasis Rules 9-10
            }
          }

          delimTotal -= rLength;
          if (delimTotal > 0) continue; // Haven't found enough closing delimiters
          // Remove extra characters. *a*** -> *a*

          rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal); // Create `em` if smallest delimiter has odd char count. *a***

          if (Math.min(lLength, rLength) % 2) {
            var _text = src.slice(1, lLength + match.index + rLength);

            return {
              type: 'em',
              raw: src.slice(0, lLength + match.index + rLength + 1),
              text: _text,
              tokens: this.lexer.inlineTokens(_text)
            };
          } // Create 'strong' if smallest delimiter has even char count. **a***


          var text = src.slice(2, lLength + match.index + rLength - 1);
          return {
            type: 'strong',
            raw: src.slice(0, lLength + match.index + rLength + 1),
            text: text,
            tokens: this.lexer.inlineTokens(text)
          };
        }
      }
    };

    _proto.codespan = function codespan(src) {
      var cap = this.rules.inline.code.exec(src);

      if (cap) {
        var text = cap[2].replace(/\n/g, ' ');
        var hasNonSpaceChars = /[^ ]/.test(text);
        var hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);

        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text = text.substring(1, text.length - 1);
        }

        text = escape(text, true);
        return {
          type: 'codespan',
          raw: cap[0],
          text: text
        };
      }
    };

    _proto.br = function br(src) {
      var cap = this.rules.inline.br.exec(src);

      if (cap) {
        return {
          type: 'br',
          raw: cap[0]
        };
      }
    };

    _proto.del = function del(src) {
      var cap = this.rules.inline.del.exec(src);

      if (cap) {
        return {
          type: 'del',
          raw: cap[0],
          text: cap[2],
          tokens: this.lexer.inlineTokens(cap[2])
        };
      }
    };

    _proto.autolink = function autolink(src, mangle) {
      var cap = this.rules.inline.autolink.exec(src);

      if (cap) {
        var text, href;

        if (cap[2] === '@') {
          text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
          href = 'mailto:' + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }

        return {
          type: 'link',
          raw: cap[0],
          text: text,
          href: href,
          tokens: [{
            type: 'text',
            raw: text,
            text: text
          }]
        };
      }
    };

    _proto.url = function url(src, mangle) {
      var cap;

      if (cap = this.rules.inline.url.exec(src)) {
        var text, href;

        if (cap[2] === '@') {
          text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          var prevCapZero;

          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);

          text = escape(cap[0]);

          if (cap[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }

        return {
          type: 'link',
          raw: cap[0],
          text: text,
          href: href,
          tokens: [{
            type: 'text',
            raw: text,
            text: text
          }]
        };
      }
    };

    _proto.inlineText = function inlineText(src, smartypants) {
      var cap = this.rules.inline.text.exec(src);

      if (cap) {
        var text;

        if (this.lexer.state.inRawBlock) {
          text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0];
        } else {
          text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
        }

        return {
          type: 'text',
          raw: cap[0],
          text: text
        };
      }
    };

    return Tokenizer;
  }();

  /**
   * Block-Level Grammar
   */

  var block = {
    newline: /^(?: *(?:\n|$))+/,
    code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
    hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
    html: '^ {0,3}(?:' // optional indentation
    + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
    + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
    + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
    + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
    + ')',
    def: /^ {0,3}\[(label)\]: *(?:\n *)?<?([^\s>]+)>?(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
    table: noopTest,
    lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
    // regex template, placeholders will be replaced according to different paragraph
    // interruption rules of commonmark and the original markdown spec:
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
    text: /^[^\n]+/
  };
  block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit(block.def).replace('label', block._label).replace('title', block._title).getRegex();
  block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
  block.listItemStart = edit(/^( *)(bull) */).replace('bull', block.bullet).getRegex();
  block.list = edit(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
  block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
  block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
  block.html = edit(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  block.paragraph = edit(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('|table', '').replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();
  block.blockquote = edit(block.blockquote).replace('paragraph', block.paragraph).getRegex();
  /**
   * Normal Block Grammar
   */

  block.normal = merge({}, block);
  /**
   * GFM Block Grammar
   */

  block.gfm = merge({}, block.normal, {
    table: '^ *([^\\n ].*\\|.*)\\n' // Header
    + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
    + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

  });
  block.gfm.table = edit(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
  .getRegex();
  block.gfm.paragraph = edit(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('table', block.gfm.table) // interrupt paragraphs with table
  .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();
  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */

  block.pedantic = merge({}, block.normal, {
    html: edit('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
    + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest,
    // fences not supported
    paragraph: edit(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
  });
  /**
   * Inline-Level Grammar
   */

  var inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noopTest,
    tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
    // CDATA section
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(ref)\]/,
    nolink: /^!?\[(ref)\](?:\[\])?/,
    reflinkSearch: 'reflink|nolink(?!\\()',
    emStrong: {
      lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
      //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
      //          () Skip orphan inside strong  () Consume to delim (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
      rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[^*]+(?=[^*])|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
      rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _

    },
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noopTest,
    text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
    punctuation: /^([\spunctuation])/
  }; // list of punctuation marks from CommonMark spec
  // without * and _ to handle the different emphasis markers * and _

  inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
  inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

  inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
  inline.escapedEmSt = /\\\*|\\_/g;
  inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();
  inline.emStrong.lDelim = edit(inline.emStrong.lDelim).replace(/punct/g, inline._punctuation).getRegex();
  inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g').replace(/punct/g, inline._punctuation).getRegex();
  inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g').replace(/punct/g, inline._punctuation).getRegex();
  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
  inline.tag = edit(inline.tag).replace('comment', inline._comment).replace('attribute', inline._attribute).getRegex();
  inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
  inline.link = edit(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
  inline.reflink = edit(inline.reflink).replace('label', inline._label).replace('ref', block._label).getRegex();
  inline.nolink = edit(inline.nolink).replace('ref', block._label).getRegex();
  inline.reflinkSearch = edit(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
  /**
   * Normal Inline Grammar
   */

  inline.normal = merge({}, inline);
  /**
   * Pedantic Inline Grammar
   */

  inline.pedantic = merge({}, inline.normal, {
    strong: {
      start: /^__|\*\*/,
      middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      endAst: /\*\*(?!\*)/g,
      endUnd: /__(?!_)/g
    },
    em: {
      start: /^_|\*/,
      middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
      endAst: /\*(?!\*)/g,
      endUnd: /_(?!_)/g
    },
    link: edit(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
  });
  /**
   * GFM Inline Grammar
   */

  inline.gfm = merge({}, inline.normal, {
    escape: edit(inline.escape).replace('])', '~|])').getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
  });
  inline.gfm.url = edit(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
  /**
   * GFM + Line Breaks Inline Grammar
   */

  inline.breaks = merge({}, inline.gfm, {
    br: edit(inline.br).replace('{2,}', '*').getRegex(),
    text: edit(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
  });

  /**
   * smartypants text replacement
   * @param {string} text
   */

  function smartypants(text) {
    return text // em-dashes
    .replace(/---/g, "\u2014") // en-dashes
    .replace(/--/g, "\u2013") // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
    .replace(/'/g, "\u2019") // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
    .replace(/"/g, "\u201D") // ellipses
    .replace(/\.{3}/g, "\u2026");
  }
  /**
   * mangle email addresses
   * @param {string} text
   */


  function mangle(text) {
    var out = '',
        i,
        ch;
    var l = text.length;

    for (i = 0; i < l; i++) {
      ch = text.charCodeAt(i);

      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }

      out += '&#' + ch + ';';
    }

    return out;
  }
  /**
   * Block Lexer
   */


  var Lexer = /*#__PURE__*/function () {
    function Lexer(options) {
      this.tokens = [];
      this.tokens.links = Object.create(null);
      this.options = options || exports.defaults;
      this.options.tokenizer = this.options.tokenizer || new Tokenizer();
      this.tokenizer = this.options.tokenizer;
      this.tokenizer.options = this.options;
      this.tokenizer.lexer = this;
      this.inlineQueue = [];
      this.state = {
        inLink: false,
        inRawBlock: false,
        top: true
      };
      var rules = {
        block: block.normal,
        inline: inline.normal
      };

      if (this.options.pedantic) {
        rules.block = block.pedantic;
        rules.inline = inline.pedantic;
      } else if (this.options.gfm) {
        rules.block = block.gfm;

        if (this.options.breaks) {
          rules.inline = inline.breaks;
        } else {
          rules.inline = inline.gfm;
        }
      }

      this.tokenizer.rules = rules;
    }
    /**
     * Expose Rules
     */


    /**
     * Static Lex Method
     */
    Lexer.lex = function lex(src, options) {
      var lexer = new Lexer(options);
      return lexer.lex(src);
    }
    /**
     * Static Lex Inline Method
     */
    ;

    Lexer.lexInline = function lexInline(src, options) {
      var lexer = new Lexer(options);
      return lexer.inlineTokens(src);
    }
    /**
     * Preprocessing
     */
    ;

    var _proto = Lexer.prototype;

    _proto.lex = function lex(src) {
      src = src.replace(/\r\n|\r/g, '\n');
      this.blockTokens(src, this.tokens);
      var next;

      while (next = this.inlineQueue.shift()) {
        this.inlineTokens(next.src, next.tokens);
      }

      return this.tokens;
    }
    /**
     * Lexing
     */
    ;

    _proto.blockTokens = function blockTokens(src, tokens) {
      var _this = this;

      if (tokens === void 0) {
        tokens = [];
      }

      if (this.options.pedantic) {
        src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
      } else {
        src = src.replace(/^( *)(\t+)/gm, function (_, leading, tabs) {
          return leading + '    '.repeat(tabs.length);
        });
      }

      var token, lastToken, cutSrc, lastParagraphClipped;

      while (src) {
        if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some(function (extTokenizer) {
          if (token = extTokenizer.call({
            lexer: _this
          }, src, tokens)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            return true;
          }

          return false;
        })) {
          continue;
        } // newline


        if (token = this.tokenizer.space(src)) {
          src = src.substring(token.raw.length);

          if (token.raw.length === 1 && tokens.length > 0) {
            // if there's a single \n as a spacer, it's terminating the last line,
            // so move it there so that we don't get unecessary paragraph tags
            tokens[tokens.length - 1].raw += '\n';
          } else {
            tokens.push(token);
          }

          continue;
        } // code


        if (token = this.tokenizer.code(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

          if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }

          continue;
        } // fences


        if (token = this.tokenizer.fences(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // heading


        if (token = this.tokenizer.heading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // hr


        if (token = this.tokenizer.hr(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // blockquote


        if (token = this.tokenizer.blockquote(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // list


        if (token = this.tokenizer.list(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // html


        if (token = this.tokenizer.html(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // def


        if (token = this.tokenizer.def(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];

          if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.raw;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else if (!this.tokens.links[token.tag]) {
            this.tokens.links[token.tag] = {
              href: token.href,
              title: token.title
            };
          }

          continue;
        } // table (gfm)


        if (token = this.tokenizer.table(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // lheading


        if (token = this.tokenizer.lheading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // top-level paragraph
        // prevent paragraph consuming extensions by clipping 'src' to extension start


        cutSrc = src;

        if (this.options.extensions && this.options.extensions.startBlock) {
          (function () {
            var startIndex = Infinity;
            var tempSrc = src.slice(1);
            var tempStart = void 0;

            _this.options.extensions.startBlock.forEach(function (getStartIndex) {
              tempStart = getStartIndex.call({
                lexer: this
              }, tempSrc);

              if (typeof tempStart === 'number' && tempStart >= 0) {
                startIndex = Math.min(startIndex, tempStart);
              }
            });

            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          })();
        }

        if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
          lastToken = tokens[tokens.length - 1];

          if (lastParagraphClipped && lastToken.type === 'paragraph') {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }

          lastParagraphClipped = cutSrc.length !== src.length;
          src = src.substring(token.raw.length);
          continue;
        } // text


        if (token = this.tokenizer.text(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];

          if (lastToken && lastToken.type === 'text') {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }

          continue;
        }

        if (src) {
          var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      this.state.top = true;
      return tokens;
    };

    _proto.inline = function inline(src, tokens) {
      if (tokens === void 0) {
        tokens = [];
      }

      this.inlineQueue.push({
        src: src,
        tokens: tokens
      });
      return tokens;
    }
    /**
     * Lexing/Compiling
     */
    ;

    _proto.inlineTokens = function inlineTokens(src, tokens) {
      var _this2 = this;

      if (tokens === void 0) {
        tokens = [];
      }

      var token, lastToken, cutSrc; // String with links masked to avoid interference with em and strong

      var maskedSrc = src;
      var match;
      var keepPrevChar, prevChar; // Mask out reflinks

      if (this.tokens.links) {
        var links = Object.keys(this.tokens.links);

        if (links.length > 0) {
          while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
            if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
              maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
            }
          }
        }
      } // Mask out other blocks


      while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      } // Mask out escaped em & strong delimiters


      while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
      }

      while (src) {
        if (!keepPrevChar) {
          prevChar = '';
        }

        keepPrevChar = false; // extensions

        if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some(function (extTokenizer) {
          if (token = extTokenizer.call({
            lexer: _this2
          }, src, tokens)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            return true;
          }

          return false;
        })) {
          continue;
        } // escape


        if (token = this.tokenizer.escape(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // tag


        if (token = this.tokenizer.tag(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];

          if (lastToken && token.type === 'text' && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }

          continue;
        } // link


        if (token = this.tokenizer.link(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // reflink, nolink


        if (token = this.tokenizer.reflink(src, this.tokens.links)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];

          if (lastToken && token.type === 'text' && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }

          continue;
        } // em & strong


        if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // code


        if (token = this.tokenizer.codespan(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // br


        if (token = this.tokenizer.br(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // del (gfm)


        if (token = this.tokenizer.del(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // autolink


        if (token = this.tokenizer.autolink(src, mangle)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // url (gfm)


        if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // text
        // prevent inlineText consuming extensions by clipping 'src' to extension start


        cutSrc = src;

        if (this.options.extensions && this.options.extensions.startInline) {
          (function () {
            var startIndex = Infinity;
            var tempSrc = src.slice(1);
            var tempStart = void 0;

            _this2.options.extensions.startInline.forEach(function (getStartIndex) {
              tempStart = getStartIndex.call({
                lexer: this
              }, tempSrc);

              if (typeof tempStart === 'number' && tempStart >= 0) {
                startIndex = Math.min(startIndex, tempStart);
              }
            });

            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          })();
        }

        if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
          src = src.substring(token.raw.length);

          if (token.raw.slice(-1) !== '_') {
            // Track prevChar before string of ____ started
            prevChar = token.raw.slice(-1);
          }

          keepPrevChar = true;
          lastToken = tokens[tokens.length - 1];

          if (lastToken && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }

          continue;
        }

        if (src) {
          var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      return tokens;
    };

    _createClass(Lexer, null, [{
      key: "rules",
      get: function get() {
        return {
          block: block,
          inline: inline
        };
      }
    }]);

    return Lexer;
  }();

  /**
   * Renderer
   */

  var Renderer = /*#__PURE__*/function () {
    function Renderer(options) {
      this.options = options || exports.defaults;
    }

    var _proto = Renderer.prototype;

    _proto.code = function code(_code, infostring, escaped) {
      var lang = (infostring || '').match(/\S*/)[0];

      if (this.options.highlight) {
        var out = this.options.highlight(_code, lang);

        if (out != null && out !== _code) {
          escaped = true;
          _code = out;
        }
      }

      _code = _code.replace(/\n$/, '') + '\n';

      if (!lang) {
        return '<pre><code>' + (escaped ? _code : escape(_code, true)) + '</code></pre>\n';
      }

      return '<pre><code class="' + this.options.langPrefix + escape(lang, true) + '">' + (escaped ? _code : escape(_code, true)) + '</code></pre>\n';
    }
    /**
     * @param {string} quote
     */
    ;

    _proto.blockquote = function blockquote(quote) {
      return "<blockquote>\n" + quote + "</blockquote>\n";
    };

    _proto.html = function html(_html) {
      return _html;
    }
    /**
     * @param {string} text
     * @param {string} level
     * @param {string} raw
     * @param {any} slugger
     */
    ;

    _proto.heading = function heading(text, level, raw, slugger) {
      if (this.options.headerIds) {
        var id = this.options.headerPrefix + slugger.slug(raw);
        return "<h" + level + " id=\"" + id + "\">" + text + "</h" + level + ">\n";
      } // ignore IDs


      return "<h" + level + ">" + text + "</h" + level + ">\n";
    };

    _proto.hr = function hr() {
      return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    _proto.list = function list(body, ordered, start) {
      var type = ordered ? 'ol' : 'ul',
          startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
      return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    }
    /**
     * @param {string} text
     */
    ;

    _proto.listitem = function listitem(text) {
      return "<li>" + text + "</li>\n";
    };

    _proto.checkbox = function checkbox(checked) {
      return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
    }
    /**
     * @param {string} text
     */
    ;

    _proto.paragraph = function paragraph(text) {
      return "<p>" + text + "</p>\n";
    }
    /**
     * @param {string} header
     * @param {string} body
     */
    ;

    _proto.table = function table(header, body) {
      if (body) body = "<tbody>" + body + "</tbody>";
      return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
    }
    /**
     * @param {string} content
     */
    ;

    _proto.tablerow = function tablerow(content) {
      return "<tr>\n" + content + "</tr>\n";
    };

    _proto.tablecell = function tablecell(content, flags) {
      var type = flags.header ? 'th' : 'td';
      var tag = flags.align ? "<" + type + " align=\"" + flags.align + "\">" : "<" + type + ">";
      return tag + content + ("</" + type + ">\n");
    }
    /**
     * span level renderer
     * @param {string} text
     */
    ;

    _proto.strong = function strong(text) {
      return "<strong>" + text + "</strong>";
    }
    /**
     * @param {string} text
     */
    ;

    _proto.em = function em(text) {
      return "<em>" + text + "</em>";
    }
    /**
     * @param {string} text
     */
    ;

    _proto.codespan = function codespan(text) {
      return "<code>" + text + "</code>";
    };

    _proto.br = function br() {
      return this.options.xhtml ? '<br/>' : '<br>';
    }
    /**
     * @param {string} text
     */
    ;

    _proto.del = function del(text) {
      return "<del>" + text + "</del>";
    }
    /**
     * @param {string} href
     * @param {string} title
     * @param {string} text
     */
    ;

    _proto.link = function link(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

      if (href === null) {
        return text;
      }

      var out = '<a href="' + escape(href) + '"';

      if (title) {
        out += ' title="' + title + '"';
      }

      out += '>' + text + '</a>';
      return out;
    }
    /**
     * @param {string} href
     * @param {string} title
     * @param {string} text
     */
    ;

    _proto.image = function image(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

      if (href === null) {
        return text;
      }

      var out = "<img src=\"" + href + "\" alt=\"" + text + "\"";

      if (title) {
        out += " title=\"" + title + "\"";
      }

      out += this.options.xhtml ? '/>' : '>';
      return out;
    };

    _proto.text = function text(_text) {
      return _text;
    };

    return Renderer;
  }();

  /**
   * TextRenderer
   * returns only the textual part of the token
   */
  var TextRenderer = /*#__PURE__*/function () {
    function TextRenderer() {}

    var _proto = TextRenderer.prototype;

    // no need for block level renderers
    _proto.strong = function strong(text) {
      return text;
    };

    _proto.em = function em(text) {
      return text;
    };

    _proto.codespan = function codespan(text) {
      return text;
    };

    _proto.del = function del(text) {
      return text;
    };

    _proto.html = function html(text) {
      return text;
    };

    _proto.text = function text(_text) {
      return _text;
    };

    _proto.link = function link(href, title, text) {
      return '' + text;
    };

    _proto.image = function image(href, title, text) {
      return '' + text;
    };

    _proto.br = function br() {
      return '';
    };

    return TextRenderer;
  }();

  /**
   * Slugger generates header id
   */
  var Slugger = /*#__PURE__*/function () {
    function Slugger() {
      this.seen = {};
    }
    /**
     * @param {string} value
     */


    var _proto = Slugger.prototype;

    _proto.serialize = function serialize(value) {
      return value.toLowerCase().trim() // remove html tags
      .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
    }
    /**
     * Finds the next safe (unique) slug to use
     * @param {string} originalSlug
     * @param {boolean} isDryRun
     */
    ;

    _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
      var slug = originalSlug;
      var occurenceAccumulator = 0;

      if (this.seen.hasOwnProperty(slug)) {
        occurenceAccumulator = this.seen[originalSlug];

        do {
          occurenceAccumulator++;
          slug = originalSlug + '-' + occurenceAccumulator;
        } while (this.seen.hasOwnProperty(slug));
      }

      if (!isDryRun) {
        this.seen[originalSlug] = occurenceAccumulator;
        this.seen[slug] = 0;
      }

      return slug;
    }
    /**
     * Convert string to unique id
     * @param {object} [options]
     * @param {boolean} [options.dryrun] Generates the next unique slug without
     * updating the internal accumulator.
     */
    ;

    _proto.slug = function slug(value, options) {
      if (options === void 0) {
        options = {};
      }

      var slug = this.serialize(value);
      return this.getNextSafeSlug(slug, options.dryrun);
    };

    return Slugger;
  }();

  /**
   * Parsing & Compiling
   */

  var Parser = /*#__PURE__*/function () {
    function Parser(options) {
      this.options = options || exports.defaults;
      this.options.renderer = this.options.renderer || new Renderer();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.textRenderer = new TextRenderer();
      this.slugger = new Slugger();
    }
    /**
     * Static Parse Method
     */


    Parser.parse = function parse(tokens, options) {
      var parser = new Parser(options);
      return parser.parse(tokens);
    }
    /**
     * Static Parse Inline Method
     */
    ;

    Parser.parseInline = function parseInline(tokens, options) {
      var parser = new Parser(options);
      return parser.parseInline(tokens);
    }
    /**
     * Parse Loop
     */
    ;

    var _proto = Parser.prototype;

    _proto.parse = function parse(tokens, top) {
      if (top === void 0) {
        top = true;
      }

      var out = '',
          i,
          j,
          k,
          l2,
          l3,
          row,
          cell,
          header,
          body,
          token,
          ordered,
          start,
          loose,
          itemBody,
          item,
          checked,
          task,
          checkbox,
          ret;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i]; // Run any renderer extensions

        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({
            parser: this
          }, token);

          if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
            out += ret || '';
            continue;
          }
        }

        switch (token.type) {
          case 'space':
            {
              continue;
            }

          case 'hr':
            {
              out += this.renderer.hr();
              continue;
            }

          case 'heading':
            {
              out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
              continue;
            }

          case 'code':
            {
              out += this.renderer.code(token.text, token.lang, token.escaped);
              continue;
            }

          case 'table':
            {
              header = ''; // header

              cell = '';
              l2 = token.header.length;

              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(this.parseInline(token.header[j].tokens), {
                  header: true,
                  align: token.align[j]
                });
              }

              header += this.renderer.tablerow(cell);
              body = '';
              l2 = token.rows.length;

              for (j = 0; j < l2; j++) {
                row = token.rows[j];
                cell = '';
                l3 = row.length;

                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(this.parseInline(row[k].tokens), {
                    header: false,
                    align: token.align[k]
                  });
                }

                body += this.renderer.tablerow(cell);
              }

              out += this.renderer.table(header, body);
              continue;
            }

          case 'blockquote':
            {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }

          case 'list':
            {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;
              body = '';

              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;
                itemBody = '';

                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);

                  if (loose) {
                    if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: 'text',
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }

                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }

              out += this.renderer.list(body, ordered, start);
              continue;
            }

          case 'html':
            {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }

          case 'paragraph':
            {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }

          case 'text':
            {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;

              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }

              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }

          default:
            {
              var errMsg = 'Token with "' + token.type + '" type was not found.';

              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
        }
      }

      return out;
    }
    /**
     * Parse Inline Tokens
     */
    ;

    _proto.parseInline = function parseInline(tokens, renderer) {
      renderer = renderer || this.renderer;
      var out = '',
          i,
          token,
          ret;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i]; // Run any renderer extensions

        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({
            parser: this
          }, token);

          if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
            out += ret || '';
            continue;
          }
        }

        switch (token.type) {
          case 'escape':
            {
              out += renderer.text(token.text);
              break;
            }

          case 'html':
            {
              out += renderer.html(token.text);
              break;
            }

          case 'link':
            {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }

          case 'image':
            {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }

          case 'strong':
            {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'em':
            {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'codespan':
            {
              out += renderer.codespan(token.text);
              break;
            }

          case 'br':
            {
              out += renderer.br();
              break;
            }

          case 'del':
            {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'text':
            {
              out += renderer.text(token.text);
              break;
            }

          default:
            {
              var errMsg = 'Token with "' + token.type + '" type was not found.';

              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
        }
      }

      return out;
    };

    return Parser;
  }();

  /**
   * Marked
   */

  function marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
    }

    if (typeof opt === 'function') {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);

    if (callback) {
      var highlight = opt.highlight;
      var tokens;

      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      var done = function done(err) {
        var out;

        if (!err) {
          try {
            if (opt.walkTokens) {
              marked.walkTokens(tokens, opt.walkTokens);
            }

            out = Parser.parse(tokens, opt);
          } catch (e) {
            err = e;
          }
        }

        opt.highlight = highlight;
        return err ? callback(err) : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;
      if (!tokens.length) return done();
      var pending = 0;
      marked.walkTokens(tokens, function (token) {
        if (token.type === 'code') {
          pending++;
          setTimeout(function () {
            highlight(token.text, token.lang, function (err, code) {
              if (err) {
                return done(err);
              }

              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }

              pending--;

              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });

      if (pending === 0) {
        done();
      }

      return;
    }

    function onError(e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';

      if (opt.silent) {
        return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
      }

      throw e;
    }

    try {
      var _tokens = Lexer.lex(src, opt);

      if (opt.walkTokens) {
        if (opt.async) {
          return Promise.all(marked.walkTokens(_tokens, opt.walkTokens)).then(function () {
            return Parser.parse(_tokens, opt);
          })["catch"](onError);
        }

        marked.walkTokens(_tokens, opt.walkTokens);
      }

      return Parser.parse(_tokens, opt);
    } catch (e) {
      onError(e);
    }
  }
  /**
   * Options
   */

  marked.options = marked.setOptions = function (opt) {
    merge(marked.defaults, opt);
    changeDefaults(marked.defaults);
    return marked;
  };

  marked.getDefaults = getDefaults;
  marked.defaults = exports.defaults;
  /**
   * Use Extension
   */

  marked.use = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var opts = merge.apply(void 0, [{}].concat(args));
    var extensions = marked.defaults.extensions || {
      renderers: {},
      childTokens: {}
    };
    var hasExtensions;
    args.forEach(function (pack) {
      // ==-- Parse "addon" extensions --== //
      if (pack.extensions) {
        hasExtensions = true;
        pack.extensions.forEach(function (ext) {
          if (!ext.name) {
            throw new Error('extension name required');
          }

          if (ext.renderer) {
            // Renderer extensions
            var prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;

            if (prevRenderer) {
              // Replace extension with func to run new extension but fall back if false
              extensions.renderers[ext.name] = function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                var ret = ext.renderer.apply(this, args);

                if (ret === false) {
                  ret = prevRenderer.apply(this, args);
                }

                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }

          if (ext.tokenizer) {
            // Tokenizer Extensions
            if (!ext.level || ext.level !== 'block' && ext.level !== 'inline') {
              throw new Error("extension level must be 'block' or 'inline'");
            }

            if (extensions[ext.level]) {
              extensions[ext.level].unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }

            if (ext.start) {
              // Function to check for start of token
              if (ext.level === 'block') {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === 'inline') {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }

          if (ext.childTokens) {
            // Child tokens to be visited by walkTokens
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
      } // ==-- Parse "overwrite" extensions --== //


      if (pack.renderer) {
        (function () {
          var renderer = marked.defaults.renderer || new Renderer();

          var _loop = function _loop(prop) {
            var prevRenderer = renderer[prop]; // Replace renderer with func to run extension, but fall back if false

            renderer[prop] = function () {
              for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
              }

              var ret = pack.renderer[prop].apply(renderer, args);

              if (ret === false) {
                ret = prevRenderer.apply(renderer, args);
              }

              return ret;
            };
          };

          for (var prop in pack.renderer) {
            _loop(prop);
          }

          opts.renderer = renderer;
        })();
      }

      if (pack.tokenizer) {
        (function () {
          var tokenizer = marked.defaults.tokenizer || new Tokenizer();

          var _loop2 = function _loop2(prop) {
            var prevTokenizer = tokenizer[prop]; // Replace tokenizer with func to run extension, but fall back if false

            tokenizer[prop] = function () {
              for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
              }

              var ret = pack.tokenizer[prop].apply(tokenizer, args);

              if (ret === false) {
                ret = prevTokenizer.apply(tokenizer, args);
              }

              return ret;
            };
          };

          for (var prop in pack.tokenizer) {
            _loop2(prop);
          }

          opts.tokenizer = tokenizer;
        })();
      } // ==-- Parse WalkTokens extensions --== //


      if (pack.walkTokens) {
        var _walkTokens = marked.defaults.walkTokens;

        opts.walkTokens = function (token) {
          var values = [];
          values.push(pack.walkTokens.call(this, token));

          if (_walkTokens) {
            values = values.concat(_walkTokens.call(this, token));
          }

          return values;
        };
      }

      if (hasExtensions) {
        opts.extensions = extensions;
      }

      marked.setOptions(opts);
    });
  };
  /**
   * Run callback for every token
   */


  marked.walkTokens = function (tokens, callback) {
    var values = [];

    var _loop3 = function _loop3() {
      var token = _step.value;
      values = values.concat(callback.call(marked, token));

      switch (token.type) {
        case 'table':
          {
            for (var _iterator2 = _createForOfIteratorHelperLoose(token.header), _step2; !(_step2 = _iterator2()).done;) {
              var cell = _step2.value;
              values = values.concat(marked.walkTokens(cell.tokens, callback));
            }

            for (var _iterator3 = _createForOfIteratorHelperLoose(token.rows), _step3; !(_step3 = _iterator3()).done;) {
              var row = _step3.value;

              for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                var _cell = _step4.value;
                values = values.concat(marked.walkTokens(_cell.tokens, callback));
              }
            }

            break;
          }

        case 'list':
          {
            values = values.concat(marked.walkTokens(token.items, callback));
            break;
          }

        default:
          {
            if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) {
              // Walk any extensions
              marked.defaults.extensions.childTokens[token.type].forEach(function (childTokens) {
                values = values.concat(marked.walkTokens(token[childTokens], callback));
              });
            } else if (token.tokens) {
              values = values.concat(marked.walkTokens(token.tokens, callback));
            }
          }
      }
    };

    for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
      _loop3();
    }

    return values;
  };
  /**
   * Parse Inline
   * @param {string} src
   */


  marked.parseInline = function (src, opt) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked.parseInline(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
    }

    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);

    try {
      var tokens = Lexer.lexInline(src, opt);

      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }

      return Parser.parseInline(tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';

      if (opt.silent) {
        return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
      }

      throw e;
    }
  };
  /**
   * Expose
   */


  marked.Parser = Parser;
  marked.parser = Parser.parse;
  marked.Renderer = Renderer;
  marked.TextRenderer = TextRenderer;
  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;
  marked.Tokenizer = Tokenizer;
  marked.Slugger = Slugger;
  marked.parse = marked;
  var options = marked.options;
  var setOptions = marked.setOptions;
  var use = marked.use;
  var walkTokens = marked.walkTokens;
  var parseInline = marked.parseInline;
  var parse = marked;
  var parser = Parser.parse;
  var lexer = Lexer.lex;

  exports.Lexer = Lexer;
  exports.Parser = Parser;
  exports.Renderer = Renderer;
  exports.Slugger = Slugger;
  exports.TextRenderer = TextRenderer;
  exports.Tokenizer = Tokenizer;
  exports.getDefaults = getDefaults;
  exports.lexer = lexer;
  exports.marked = marked;
  exports.options = options;
  exports.parse = parse;
  exports.parseInline = parseInline;
  exports.parser = parser;
  exports.setOptions = setOptions;
  exports.use = use;
  exports.walkTokens = walkTokens;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

// ESM-uncomment-begin
// })();
// export var Lexer = (__marked_exports.Lexer || exports.Lexer);
// export var Parser = (__marked_exports.Parser || exports.Parser);
// export var Renderer = (__marked_exports.Renderer || exports.Renderer);
// export var Slugger = (__marked_exports.Slugger || exports.Slugger);
// export var TextRenderer = (__marked_exports.TextRenderer || exports.TextRenderer);
// export var Tokenizer = (__marked_exports.Tokenizer || exports.Tokenizer);
// export var getDefaults = (__marked_exports.getDefaults || exports.getDefaults);
// export var lexer = (__marked_exports.lexer || exports.lexer);
// export var marked = (__marked_exports.marked || exports.marked);
// export var options = (__marked_exports.options || exports.options);
// export var parse = (__marked_exports.parse || exports.parse);
// export var parseInline = (__marked_exports.parseInline || exports.parseInline);
// export var parser = (__marked_exports.parser || exports.parser);
// export var setOptions = (__marked_exports.setOptions || exports.setOptions);
// export var use = (__marked_exports.use || exports.use);
// export var walkTokens = (__marked_exports.walkTokens || exports.walkTokens);
// ESM-uncomment-end

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[1191/*vs/base/common/naturalLanguage/korean*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getKoreanAltChars = void 0;
    // allow-any-unicode-comment-file
    /**
     * Gets alternative Korean characters for the character code. This will return the ascii
     * character code(s) that a Hangul character may have been input with using a qwerty layout.
     *
     * This only aims to cover modern (not archaic) Hangul syllables.
     *
     * @param code The character code to get alternate characters for
     */
    function getKoreanAltChars(code) {
        const result = disassembleKorean(code);
        if (result && result.length > 0) {
            return new Uint32Array(result);
        }
        return undefined;
    }
    exports.getKoreanAltChars = getKoreanAltChars;
    let codeBufferLength = 0;
    const codeBuffer = new Uint32Array(10);
    function disassembleKorean(code) {
        codeBufferLength = 0;
        // Initial consonants (초성)
        getCodesFromArray(code, modernConsonants, 4352 /* HangulRangeStartCode.InitialConsonant */);
        if (codeBufferLength > 0) {
            return codeBuffer.subarray(0, codeBufferLength);
        }
        // Vowels (중성)
        getCodesFromArray(code, modernVowels, 4449 /* HangulRangeStartCode.Vowel */);
        if (codeBufferLength > 0) {
            return codeBuffer.subarray(0, codeBufferLength);
        }
        // Final consonants (종성)
        getCodesFromArray(code, modernFinalConsonants, 4520 /* HangulRangeStartCode.FinalConsonant */);
        if (codeBufferLength > 0) {
            return codeBuffer.subarray(0, codeBufferLength);
        }
        // Hangul Compatibility Jamo
        getCodesFromArray(code, compatibilityJamo, 12593 /* HangulRangeStartCode.CompatibilityJamo */);
        if (codeBufferLength) {
            return codeBuffer.subarray(0, codeBufferLength);
        }
        // Hangul Syllables
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const hangulIndex = code - 0xAC00;
            const vowelAndFinalConsonantProduct = hangulIndex % 588;
            // 0-based starting at 0x1100
            const initialConsonantIndex = Math.floor(hangulIndex / 588);
            // 0-based starting at 0x1161
            const vowelIndex = Math.floor(vowelAndFinalConsonantProduct / 28);
            // 0-based starting at 0x11A8
            // Subtract 1 as the standard algorithm uses the 0 index to represent no
            // final consonant
            const finalConsonantIndex = vowelAndFinalConsonantProduct % 28 - 1;
            if (initialConsonantIndex < modernConsonants.length) {
                getCodesFromArray(initialConsonantIndex, modernConsonants, 0);
            }
            else if (4352 /* HangulRangeStartCode.InitialConsonant */ + initialConsonantIndex - 12593 /* HangulRangeStartCode.CompatibilityJamo */ < compatibilityJamo.length) {
                getCodesFromArray(4352 /* HangulRangeStartCode.InitialConsonant */ + initialConsonantIndex, compatibilityJamo, 12593 /* HangulRangeStartCode.CompatibilityJamo */);
            }
            if (vowelIndex < modernVowels.length) {
                getCodesFromArray(vowelIndex, modernVowels, 0);
            }
            else if (4449 /* HangulRangeStartCode.Vowel */ + vowelIndex - 12593 /* HangulRangeStartCode.CompatibilityJamo */ < compatibilityJamo.length) {
                getCodesFromArray(4449 /* HangulRangeStartCode.Vowel */ + vowelIndex - 12593 /* HangulRangeStartCode.CompatibilityJamo */, compatibilityJamo, 12593 /* HangulRangeStartCode.CompatibilityJamo */);
            }
            if (finalConsonantIndex >= 0) {
                if (finalConsonantIndex < modernFinalConsonants.length) {
                    getCodesFromArray(finalConsonantIndex, modernFinalConsonants, 0);
                }
                else if (4520 /* HangulRangeStartCode.FinalConsonant */ + finalConsonantIndex - 12593 /* HangulRangeStartCode.CompatibilityJamo */ < compatibilityJamo.length) {
                    getCodesFromArray(4520 /* HangulRangeStartCode.FinalConsonant */ + finalConsonantIndex - 12593 /* HangulRangeStartCode.CompatibilityJamo */, compatibilityJamo, 12593 /* HangulRangeStartCode.CompatibilityJamo */);
                }
            }
            if (codeBufferLength > 0) {
                return codeBuffer.subarray(0, codeBufferLength);
            }
        }
        return undefined;
    }
    function getCodesFromArray(code, array, arrayStartIndex) {
        // Verify the code is within the array's range
        if (code >= arrayStartIndex && code < arrayStartIndex + array.length) {
            addCodesToBuffer(array[code - arrayStartIndex]);
        }
    }
    function addCodesToBuffer(codes) {
        // NUL is ignored, this is used for archaic characters to avoid using a Map
        // for the data
        if (codes === 0 /* AsciiCode.NUL */) {
            return;
        }
        // Number stored in format: OptionalThirdCode << 16 | OptionalSecondCode << 8 | Code
        codeBuffer[codeBufferLength++] = codes & 0xFF;
        if (codes >> 8) {
            codeBuffer[codeBufferLength++] = (codes >> 8) & 0xFF;
        }
        if (codes >> 16) {
            codeBuffer[codeBufferLength++] = (codes >> 16) & 0xFF;
        }
    }
    var HangulRangeStartCode;
    (function (HangulRangeStartCode) {
        HangulRangeStartCode[HangulRangeStartCode["InitialConsonant"] = 4352] = "InitialConsonant";
        HangulRangeStartCode[HangulRangeStartCode["Vowel"] = 4449] = "Vowel";
        HangulRangeStartCode[HangulRangeStartCode["FinalConsonant"] = 4520] = "FinalConsonant";
        HangulRangeStartCode[HangulRangeStartCode["CompatibilityJamo"] = 12593] = "CompatibilityJamo";
    })(HangulRangeStartCode || (HangulRangeStartCode = {}));
    var AsciiCode;
    (function (AsciiCode) {
        AsciiCode[AsciiCode["NUL"] = 0] = "NUL";
        AsciiCode[AsciiCode["A"] = 65] = "A";
        AsciiCode[AsciiCode["B"] = 66] = "B";
        AsciiCode[AsciiCode["C"] = 67] = "C";
        AsciiCode[AsciiCode["D"] = 68] = "D";
        AsciiCode[AsciiCode["E"] = 69] = "E";
        AsciiCode[AsciiCode["F"] = 70] = "F";
        AsciiCode[AsciiCode["G"] = 71] = "G";
        AsciiCode[AsciiCode["H"] = 72] = "H";
        AsciiCode[AsciiCode["I"] = 73] = "I";
        AsciiCode[AsciiCode["J"] = 74] = "J";
        AsciiCode[AsciiCode["K"] = 75] = "K";
        AsciiCode[AsciiCode["L"] = 76] = "L";
        AsciiCode[AsciiCode["M"] = 77] = "M";
        AsciiCode[AsciiCode["N"] = 78] = "N";
        AsciiCode[AsciiCode["O"] = 79] = "O";
        AsciiCode[AsciiCode["P"] = 80] = "P";
        AsciiCode[AsciiCode["Q"] = 81] = "Q";
        AsciiCode[AsciiCode["R"] = 82] = "R";
        AsciiCode[AsciiCode["S"] = 83] = "S";
        AsciiCode[AsciiCode["T"] = 84] = "T";
        AsciiCode[AsciiCode["U"] = 85] = "U";
        AsciiCode[AsciiCode["V"] = 86] = "V";
        AsciiCode[AsciiCode["W"] = 87] = "W";
        AsciiCode[AsciiCode["X"] = 88] = "X";
        AsciiCode[AsciiCode["Y"] = 89] = "Y";
        AsciiCode[AsciiCode["Z"] = 90] = "Z";
        AsciiCode[AsciiCode["a"] = 97] = "a";
        AsciiCode[AsciiCode["b"] = 98] = "b";
        AsciiCode[AsciiCode["c"] = 99] = "c";
        AsciiCode[AsciiCode["d"] = 100] = "d";
        AsciiCode[AsciiCode["e"] = 101] = "e";
        AsciiCode[AsciiCode["f"] = 102] = "f";
        AsciiCode[AsciiCode["g"] = 103] = "g";
        AsciiCode[AsciiCode["h"] = 104] = "h";
        AsciiCode[AsciiCode["i"] = 105] = "i";
        AsciiCode[AsciiCode["j"] = 106] = "j";
        AsciiCode[AsciiCode["k"] = 107] = "k";
        AsciiCode[AsciiCode["l"] = 108] = "l";
        AsciiCode[AsciiCode["m"] = 109] = "m";
        AsciiCode[AsciiCode["n"] = 110] = "n";
        AsciiCode[AsciiCode["o"] = 111] = "o";
        AsciiCode[AsciiCode["p"] = 112] = "p";
        AsciiCode[AsciiCode["q"] = 113] = "q";
        AsciiCode[AsciiCode["r"] = 114] = "r";
        AsciiCode[AsciiCode["s"] = 115] = "s";
        AsciiCode[AsciiCode["t"] = 116] = "t";
        AsciiCode[AsciiCode["u"] = 117] = "u";
        AsciiCode[AsciiCode["v"] = 118] = "v";
        AsciiCode[AsciiCode["w"] = 119] = "w";
        AsciiCode[AsciiCode["x"] = 120] = "x";
        AsciiCode[AsciiCode["y"] = 121] = "y";
        AsciiCode[AsciiCode["z"] = 122] = "z";
    })(AsciiCode || (AsciiCode = {}));
    /**
     * Numbers that represent multiple ascii codes. These are precomputed at compile time to reduce
     * bundle and runtime overhead.
     */
    var AsciiCodeCombo;
    (function (AsciiCodeCombo) {
        AsciiCodeCombo[AsciiCodeCombo["fa"] = 24934] = "fa";
        AsciiCodeCombo[AsciiCodeCombo["fg"] = 26470] = "fg";
        AsciiCodeCombo[AsciiCodeCombo["fq"] = 29030] = "fq";
        AsciiCodeCombo[AsciiCodeCombo["fr"] = 29286] = "fr";
        AsciiCodeCombo[AsciiCodeCombo["ft"] = 29798] = "ft";
        AsciiCodeCombo[AsciiCodeCombo["fv"] = 30310] = "fv";
        AsciiCodeCombo[AsciiCodeCombo["fx"] = 30822] = "fx";
        AsciiCodeCombo[AsciiCodeCombo["hk"] = 27496] = "hk";
        AsciiCodeCombo[AsciiCodeCombo["hl"] = 27752] = "hl";
        AsciiCodeCombo[AsciiCodeCombo["ho"] = 28520] = "ho";
        AsciiCodeCombo[AsciiCodeCombo["ml"] = 27757] = "ml";
        AsciiCodeCombo[AsciiCodeCombo["nj"] = 27246] = "nj";
        AsciiCodeCombo[AsciiCodeCombo["nl"] = 27758] = "nl";
        AsciiCodeCombo[AsciiCodeCombo["np"] = 28782] = "np";
        AsciiCodeCombo[AsciiCodeCombo["qt"] = 29809] = "qt";
        AsciiCodeCombo[AsciiCodeCombo["rt"] = 29810] = "rt";
        AsciiCodeCombo[AsciiCodeCombo["sg"] = 26483] = "sg";
        AsciiCodeCombo[AsciiCodeCombo["sw"] = 30579] = "sw";
    })(AsciiCodeCombo || (AsciiCodeCombo = {}));
    /**
     * Hangul Jamo - Modern consonants #1
     *
     * Range U+1100..U+1112
     *
     * |        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |
     * |--------|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
     * | U+110x | ᄀ | ᄁ | ᄂ | ᄃ | ᄄ | ᄅ | ᄆ | ᄇ | ᄈ | ᄉ | ᄊ | ᄋ | ᄌ | ᄍ | ᄎ | ᄏ |
     * | U+111x | ᄐ | ᄑ | ᄒ |
     */
    const modernConsonants = new Uint8Array([
        114 /* AsciiCode.r */, // ㄱ
        82 /* AsciiCode.R */, // ㄲ
        115 /* AsciiCode.s */, // ㄴ
        101 /* AsciiCode.e */, // ㄷ
        69 /* AsciiCode.E */, // ㄸ
        102 /* AsciiCode.f */, // ㄹ
        97 /* AsciiCode.a */, // ㅁ
        113 /* AsciiCode.q */, // ㅂ
        81 /* AsciiCode.Q */, // ㅃ
        116 /* AsciiCode.t */, // ㅅ
        84 /* AsciiCode.T */, // ㅆ
        100 /* AsciiCode.d */, // ㅇ
        119 /* AsciiCode.w */, // ㅈ
        87 /* AsciiCode.W */, // ㅉ
        99 /* AsciiCode.c */, // ㅊ
        122 /* AsciiCode.z */, // ㅋ
        120 /* AsciiCode.x */, // ㅌ
        118 /* AsciiCode.v */, // ㅍ
        103 /* AsciiCode.g */, // ㅎ
    ]);
    /**
     * Hangul Jamo - Modern Vowels
     *
     * Range U+1161..U+1175
     *
     * |        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |
     * |--------|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
     * | U+116x |   | ᅡ | ᅢ | ᅣ | ᅤ | ᅥ | ᅦ | ᅧ | ᅨ | ᅩ | ᅪ | ᅫ | ᅬ | ᅭ | ᅮ | ᅯ |
     * | U+117x | ᅰ | ᅱ | ᅲ | ᅳ | ᅴ | ᅵ |
     */
    const modernVowels = new Uint16Array([
        107 /* AsciiCode.k */, //  -> ㅏ
        111 /* AsciiCode.o */, //  -> ㅐ
        105 /* AsciiCode.i */, //  -> ㅑ
        79 /* AsciiCode.O */, //  -> ㅒ
        106 /* AsciiCode.j */, //  -> ㅓ
        112 /* AsciiCode.p */, //  -> ㅔ
        117 /* AsciiCode.u */, //  -> ㅕ
        80 /* AsciiCode.P */, //  -> ㅖ
        104 /* AsciiCode.h */, //  -> ㅗ
        27496 /* AsciiCodeCombo.hk */, //  -> ㅘ
        28520 /* AsciiCodeCombo.ho */, //  -> ㅙ
        27752 /* AsciiCodeCombo.hl */, //  -> ㅚ
        121 /* AsciiCode.y */, //  -> ㅛ
        110 /* AsciiCode.n */, //  -> ㅜ
        27246 /* AsciiCodeCombo.nj */, //  -> ㅝ
        28782 /* AsciiCodeCombo.np */, //  -> ㅞ
        27758 /* AsciiCodeCombo.nl */, //  -> ㅟ
        98 /* AsciiCode.b */, //  -> ㅠ
        109 /* AsciiCode.m */, //  -> ㅡ
        27757 /* AsciiCodeCombo.ml */, //  -> ㅢ
        108 /* AsciiCode.l */, //  -> ㅣ
    ]);
    /**
     * Hangul Jamo - Modern Consonants #2
     *
     * Range U+11A8..U+11C2
     *
     * |        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |
     * |--------|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
     * | U+11Ax |   |   |   |   |   |   |   |   | ᆨ | ᆩ | ᆪ | ᆫ | ᆬ | ᆭ | ᆮ | ᆯ |
     * | U+11Bx | ᆰ | ᆱ | ᆲ | ᆳ | ᆴ | ᆵ | ᆶ | ᆷ | ᆸ | ᆹ | ᆺ | ᆻ | ᆼ | ᆽ | ᆾ | ᆿ |
     * | U+11Cx | ᇀ | ᇁ | ᇂ |
     */
    const modernFinalConsonants = new Uint16Array([
        114 /* AsciiCode.r */, // ㄱ
        82 /* AsciiCode.R */, // ㄲ
        29810 /* AsciiCodeCombo.rt */, // ㄳ
        115 /* AsciiCode.s */, // ㄴ
        30579 /* AsciiCodeCombo.sw */, // ㄵ
        26483 /* AsciiCodeCombo.sg */, // ㄶ
        101 /* AsciiCode.e */, // ㄷ
        102 /* AsciiCode.f */, // ㄹ
        29286 /* AsciiCodeCombo.fr */, // ㄺ
        24934 /* AsciiCodeCombo.fa */, // ㄻ
        29030 /* AsciiCodeCombo.fq */, // ㄼ
        29798 /* AsciiCodeCombo.ft */, // ㄽ
        30822 /* AsciiCodeCombo.fx */, // ㄾ
        30310 /* AsciiCodeCombo.fv */, // ㄿ
        26470 /* AsciiCodeCombo.fg */, // ㅀ
        97 /* AsciiCode.a */, // ㅁ
        113 /* AsciiCode.q */, // ㅂ
        29809 /* AsciiCodeCombo.qt */, // ㅄ
        116 /* AsciiCode.t */, // ㅅ
        84 /* AsciiCode.T */, // ㅆ
        100 /* AsciiCode.d */, // ㅇ
        119 /* AsciiCode.w */, // ㅈ
        99 /* AsciiCode.c */, // ㅊ
        122 /* AsciiCode.z */, // ㅋ
        120 /* AsciiCode.x */, // ㅌ
        118 /* AsciiCode.v */, // ㅍ
        103 /* AsciiCode.g */, // ㅎ
    ]);
    /**
     * Hangul Compatibility Jamo
     *
     * Range U+3131..U+318F
     *
     * This includes range includes archaic jamo which we don't consider, these are
     * given the NUL character code in order to be ignored.
     *
     * |        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |
     * |--------|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
     * | U+313x |   | ㄱ | ㄲ | ㄳ | ㄴ | ㄵ | ㄶ | ㄷ | ㄸ | ㄹ | ㄺ | ㄻ | ㄼ | ㄽ | ㄾ | ㄿ |
     * | U+314x | ㅀ | ㅁ | ㅂ | ㅃ | ㅄ | ㅅ | ㅆ | ㅇ | ㅈ | ㅉ | ㅊ | ㅋ | ㅌ | ㅍ | ㅎ | ㅏ |
     * | U+315x | ㅐ | ㅑ | ㅒ | ㅓ | ㅔ | ㅕ | ㅖ | ㅗ | ㅘ | ㅙ | ㅚ | ㅛ | ㅜ | ㅝ | ㅞ | ㅟ |
     * | U+316x | ㅠ | ㅡ | ㅢ | ㅣ | HF | ㅥ | ㅦ | ㅧ | ㅨ | ㅩ | ㅪ | ㅫ | ㅬ | ㅭ | ㅮ | ㅯ |
     * | U+317x | ㅰ | ㅱ | ㅲ | ㅳ | ㅴ | ㅵ | ㅶ | ㅷ | ㅸ | ㅹ | ㅺ | ㅻ | ㅼ | ㅽ | ㅾ | ㅿ |
     * | U+318x | ㆀ | ㆁ | ㆂ | ㆃ | ㆄ | ㆅ | ㆆ | ㆇ | ㆈ | ㆉ | ㆊ | ㆋ | ㆌ | ㆍ | ㆎ |
     */
    const compatibilityJamo = new Uint16Array([
        114 /* AsciiCode.r */, // ㄱ
        82 /* AsciiCode.R */, // ㄲ
        29810 /* AsciiCodeCombo.rt */, // ㄳ
        115 /* AsciiCode.s */, // ㄴ
        30579 /* AsciiCodeCombo.sw */, // ㄵ
        26483 /* AsciiCodeCombo.sg */, // ㄶ
        101 /* AsciiCode.e */, // ㄷ
        69 /* AsciiCode.E */, // ㄸ
        102 /* AsciiCode.f */, // ㄹ
        29286 /* AsciiCodeCombo.fr */, // ㄺ
        24934 /* AsciiCodeCombo.fa */, // ㄻ
        29030 /* AsciiCodeCombo.fq */, // ㄼ
        29798 /* AsciiCodeCombo.ft */, // ㄽ
        30822 /* AsciiCodeCombo.fx */, // ㄾ
        30310 /* AsciiCodeCombo.fv */, // ㄿ
        26470 /* AsciiCodeCombo.fg */, // ㅀ
        97 /* AsciiCode.a */, // ㅁ
        113 /* AsciiCode.q */, // ㅂ
        81 /* AsciiCode.Q */, // ㅃ
        29809 /* AsciiCodeCombo.qt */, // ㅄ
        116 /* AsciiCode.t */, // ㅅ
        84 /* AsciiCode.T */, // ㅆ
        100 /* AsciiCode.d */, // ㅇ
        119 /* AsciiCode.w */, // ㅈ
        87 /* AsciiCode.W */, // ㅉ
        99 /* AsciiCode.c */, // ㅊ
        122 /* AsciiCode.z */, // ㅋ
        120 /* AsciiCode.x */, // ㅌ
        118 /* AsciiCode.v */, // ㅍ
        103 /* AsciiCode.g */, // ㅎ
        107 /* AsciiCode.k */, // ㅏ
        111 /* AsciiCode.o */, // ㅐ
        105 /* AsciiCode.i */, // ㅑ
        79 /* AsciiCode.O */, // ㅒ
        106 /* AsciiCode.j */, // ㅓ
        112 /* AsciiCode.p */, // ㅔ
        117 /* AsciiCode.u */, // ㅕ
        80 /* AsciiCode.P */, // ㅖ
        104 /* AsciiCode.h */, // ㅗ
        27496 /* AsciiCodeCombo.hk */, // ㅘ
        28520 /* AsciiCodeCombo.ho */, // ㅙ
        27752 /* AsciiCodeCombo.hl */, // ㅚ
        121 /* AsciiCode.y */, // ㅛ
        110 /* AsciiCode.n */, // ㅜ
        27246 /* AsciiCodeCombo.nj */, // ㅝ
        28782 /* AsciiCodeCombo.np */, // ㅞ
        27758 /* AsciiCodeCombo.nl */, // ㅟ
        98 /* AsciiCode.b */, // ㅠ
        109 /* AsciiCode.m */, // ㅡ
        27757 /* AsciiCodeCombo.ml */, // ㅢ
        108 /* AsciiCode.l */, // ㅣ
        // HF: Hangul Filler (everything after this is archaic)
        // ㅥ
        // ㅦ
        // ㅧ
        // ㅨ
        // ㅩ
        // ㅪ
        // ㅫ
        // ㅬ
        // ㅮ
        // ㅯ
        // ㅰ
        // ㅱ
        // ㅲ
        // ㅳ
        // ㅴ
        // ㅵ
        // ㅶ
        // ㅷ
        // ㅸ
        // ㅹ
        // ㅺ
        // ㅻ
        // ㅼ
        // ㅽ
        // ㅾ
        // ㅿ
        // ㆀ
        // ㆁ
        // ㆂ
        // ㆃ
        // ㆄ
        // ㆅ
        // ㆆ
        // ㆇ
        // ㆈ
        // ㆉ
        // ㆊ
        // ㆋ
        // ㆌ
        // ㆍ
        // ㆎ
    ]);
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[1192/*vs/base/common/navigator*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ArrayNavigator = void 0;
    class ArrayNavigator {
        constructor(items, start = 0, end = items.length, index = start - 1) {
            this.items = items;
            this.start = start;
            this.end = end;
            this.index = index;
        }
        current() {
            if (this.index === this.start - 1 || this.index === this.end) {
                return null;
            }
            return this.items[this.index];
        }
        next() {
            this.index = Math.min(this.index + 1, this.end);
            return this.current();
        }
        previous() {
            this.index = Math.max(this.index - 1, this.start - 1);
            return this.current();
        }
        first() {
            this.index = this.start;
            return this.current();
        }
        last() {
            this.index = this.end - 1;
            return this.current();
        }
    }
    exports.ArrayNavigator = ArrayNavigator;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[406/*vs/base/common/history*/], __M([1/*require*/,0/*exports*/,1192/*vs/base/common/navigator*/]), function (require, exports, navigator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HistoryNavigator2 = exports.HistoryNavigator = void 0;
    class HistoryNavigator {
        constructor(history = [], limit = 10) {
            this._initialize(history);
            this._limit = limit;
            this._onChange();
        }
        getHistory() {
            return this._elements;
        }
        add(t) {
            this._history.delete(t);
            this._history.add(t);
            this._onChange();
        }
        next() {
            // This will navigate past the end of the last element, and in that case the input should be cleared
            return this._navigator.next();
        }
        previous() {
            if (this._currentPosition() !== 0) {
                return this._navigator.previous();
            }
            return null;
        }
        current() {
            return this._navigator.current();
        }
        first() {
            return this._navigator.first();
        }
        last() {
            return this._navigator.last();
        }
        isFirst() {
            return this._currentPosition() === 0;
        }
        isLast() {
            return this._currentPosition() >= this._elements.length - 1;
        }
        isNowhere() {
            return this._navigator.current() === null;
        }
        has(t) {
            return this._history.has(t);
        }
        clear() {
            this._initialize([]);
            this._onChange();
        }
        _onChange() {
            this._reduceToLimit();
            const elements = this._elements;
            this._navigator = new navigator_1.ArrayNavigator(elements, 0, elements.length, elements.length);
        }
        _reduceToLimit() {
            const data = this._elements;
            if (data.length > this._limit) {
                this._initialize(data.slice(data.length - this._limit));
            }
        }
        _currentPosition() {
            const currentElement = this._navigator.current();
            if (!currentElement) {
                return -1;
            }
            return this._elements.indexOf(currentElement);
        }
        _initialize(history) {
            this._history = new Set();
            for (const entry of history) {
                this._history.add(entry);
            }
        }
        get _elements() {
            const elements = [];
            this._history.forEach(e => elements.push(e));
            return elements;
        }
    }
    exports.HistoryNavigator = HistoryNavigator;
    class HistoryNavigator2 {
        get size() { return this._size; }
        constructor(history, capacity = 10) {
            this.capacity = capacity;
            if (history.length < 1) {
                throw new Error('not supported');
            }
            this._size = 1;
            this.head = this.tail = this.cursor = {
                value: history[0],
                previous: undefined,
                next: undefined
            };
            this.valueSet = new Set([history[0]]);
            for (let i = 1; i < history.length; i++) {
                this.add(history[i]);
            }
        }
        add(value) {
            const node = {
                value,
                previous: this.tail,
                next: undefined
            };
            this.tail.next = node;
            this.tail = node;
            this.cursor = this.tail;
            this._size++;
            if (this.valueSet.has(value)) {
                this._deleteFromList(value);
            }
            else {
                this.valueSet.add(value);
            }
            while (this._size > this.capacity) {
                this.valueSet.delete(this.head.value);
                this.head = this.head.next;
                this.head.previous = undefined;
                this._size--;
            }
        }
        /**
         * @returns old last value
         */
        replaceLast(value) {
            if (this.tail.value === value) {
                return value;
            }
            const oldValue = this.tail.value;
            this.valueSet.delete(oldValue);
            this.tail.value = value;
            if (this.valueSet.has(value)) {
                this._deleteFromList(value);
            }
            else {
                this.valueSet.add(value);
            }
            return oldValue;
        }
        prepend(value) {
            if (this._size === this.capacity || this.valueSet.has(value)) {
                return;
            }
            const node = {
                value,
                previous: undefined,
                next: this.head
            };
            this.head.previous = node;
            this.head = node;
            this._size++;
            this.valueSet.add(value);
        }
        isAtEnd() {
            return this.cursor === this.tail;
        }
        current() {
            return this.cursor.value;
        }
        previous() {
            if (this.cursor.previous) {
                this.cursor = this.cursor.previous;
            }
            return this.cursor.value;
        }
        next() {
            if (this.cursor.next) {
                this.cursor = this.cursor.next;
            }
            return this.cursor.value;
        }
        has(t) {
            return this.valueSet.has(t);
        }
        resetCursor() {
            this.cursor = this.tail;
            return this.cursor.value;
        }
        *[Symbol.iterator]() {
            let node = this.head;
            while (node) {
                yield node.value;
                node = node.next;
            }
        }
        _deleteFromList(value) {
            let temp = this.head;
            while (temp !== this.tail) {
                if (temp.value === value) {
                    if (temp === this.head) {
                        this.head = this.head.next;
                        this.head.previous = undefined;
                    }
                    else {
                        temp.previous.next = temp.next;
                        temp.next.previous = temp.previous;
                    }
                    this._size--;
                }
                temp = temp.next;
            }
        }
    }
    exports.HistoryNavigator2 = HistoryNavigator2;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[152/*vs/base/common/numbers*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlidingWindowAverage = exports.MovingAverage = exports.Counter = exports.rot = exports.clamp = void 0;
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    exports.clamp = clamp;
    function rot(index, modulo) {
        return (modulo + (index % modulo)) % modulo;
    }
    exports.rot = rot;
    class Counter {
        constructor() {
            this._next = 0;
        }
        getNext() {
            return this._next++;
        }
    }
    exports.Counter = Counter;
    class MovingAverage {
        constructor() {
            this._n = 1;
            this._val = 0;
        }
        update(value) {
            this._val = this._val + (value - this._val) / this._n;
            this._n += 1;
            return this._val;
        }
        get value() {
            return this._val;
        }
    }
    exports.MovingAverage = MovingAverage;
    class SlidingWindowAverage {
        constructor(size) {
            this._n = 0;
            this._val = 0;
            this._values = [];
            this._index = 0;
            this._sum = 0;
            this._values = new Array(size);
            this._values.fill(0, 0, size);
        }
        update(value) {
            const oldValue = this._values[this._index];
            this._values[this._index] = value;
            this._index = (this._index + 1) % this._values.length;
            this._sum -= oldValue;
            this._sum += value;
            if (this._n < this._values.length) {
                this._n += 1;
            }
            this._val = this._sum / this._n;
            return this._val;
        }
        get value() {
            return this._val;
        }
    }
    exports.SlidingWindowAverage = SlidingWindowAverage;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[466/*vs/base/common/observableInternal/debugName*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFunctionName = exports.getDebugName = exports.DebugNameData = void 0;
    class DebugNameData {
        constructor(owner, debugNameSource, referenceFn) {
            this.owner = owner;
            this.debugNameSource = debugNameSource;
            this.referenceFn = referenceFn;
        }
        getDebugName(target) {
            return getDebugName(target, this);
        }
    }
    exports.DebugNameData = DebugNameData;
    const countPerName = new Map();
    const cachedDebugName = new WeakMap();
    function getDebugName(target, data) {
        const cached = cachedDebugName.get(target);
        if (cached) {
            return cached;
        }
        const dbgName = computeDebugName(target, data);
        if (dbgName) {
            let count = countPerName.get(dbgName) ?? 0;
            count++;
            countPerName.set(dbgName, count);
            const result = count === 1 ? dbgName : `${dbgName}#${count}`;
            cachedDebugName.set(target, result);
            return result;
        }
        return undefined;
    }
    exports.getDebugName = getDebugName;
    function computeDebugName(self, data) {
        const cached = cachedDebugName.get(self);
        if (cached) {
            return cached;
        }
        const ownerStr = data.owner ? formatOwner(data.owner) + `.` : '';
        let result;
        const debugNameSource = data.debugNameSource;
        if (debugNameSource !== undefined) {
            if (typeof debugNameSource === 'function') {
                result = debugNameSource();
                if (result !== undefined) {
                    return ownerStr + result;
                }
            }
            else {
                return ownerStr + debugNameSource;
            }
        }
        const referenceFn = data.referenceFn;
        if (referenceFn !== undefined) {
            result = getFunctionName(referenceFn);
            if (result !== undefined) {
                return ownerStr + result;
            }
        }
        if (data.owner !== undefined) {
            const key = findKey(data.owner, self);
            if (key !== undefined) {
                return ownerStr + key;
            }
        }
        return undefined;
    }
    function findKey(obj, value) {
        for (const key in obj) {
            if (obj[key] === value) {
                return key;
            }
        }
        return undefined;
    }
    const countPerClassName = new Map();
    const ownerId = new WeakMap();
    function formatOwner(owner) {
        const id = ownerId.get(owner);
        if (id) {
            return id;
        }
        const className = getClassName(owner);
        let count = countPerClassName.get(className) ?? 0;
        count++;
        countPerClassName.set(className, count);
        const result = count === 1 ? className : `${className}#${count}`;
        ownerId.set(owner, result);
        return result;
    }
    function getClassName(obj) {
        const ctor = obj.constructor;
        if (ctor) {
            return ctor.name;
        }
        return 'Object';
    }
    function getFunctionName(fn) {
        const fnSrc = fn.toString();
        // Pattern: /** @description ... */
        const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
        const match = regexp.exec(fnSrc);
        const result = match ? match[1] : undefined;
        return result?.trim();
    }
    exports.getFunctionName = getFunctionName;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[467/*vs/base/common/observableInternal/logging*/], __M([1/*require*/,0/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsoleObservableLogger = exports.getLogger = exports.setLogger = void 0;
    let globalObservableLogger;
    function setLogger(logger) {
        globalObservableLogger = logger;
    }
    exports.setLogger = setLogger;
    function getLogger() {
        return globalObservableLogger;
    }
    exports.getLogger = getLogger;
    class ConsoleObservableLogger {
        constructor() {
            this.indentation = 0;
            this.changedObservablesSets = new WeakMap();
        }
        textToConsoleArgs(text) {
            return consoleTextToArgs([
                normalText(repeat('|  ', this.indentation)),
                text,
            ]);
        }
        formatInfo(info) {
            if (!info.hadValue) {
                return [
                    normalText(` `),
                    styled(formatValue(info.newValue, 60), {
                        color: 'green',
                    }),
                    normalText(` (initial)`),
                ];
            }
            return info.didChange
                ? [
                    normalText(` `),
                    styled(formatValue(info.oldValue, 70), {
                        color: 'red',
                        strikeThrough: true,
                    }),
                    normalText(` `),
                    styled(formatValue(info.newValue, 60), {
                        color: 'green',
                    }),
                ]
                : [normalText(` (unchanged)`)];
        }
        handleObservableChanged(observable, info) {
            console.log(...this.textToConsoleArgs([
                formatKind('observable value changed'),
                styled(observable.debugName, { color: 'BlueViolet' }),
                ...this.formatInfo(info),
            ]));
        }
        formatChanges(changes) {
            if (changes.size === 0) {
                return undefined;
            }
            return styled(' (changed deps: ' +
                [...changes].map((o) => o.debugName).join(', ') +
                ')', { color: 'gray' });
        }
        handleDerivedCreated(derived) {
            const existingHandleChange = derived.handleChange;
            this.changedObservablesSets.set(derived, new Set());
            derived.handleChange = (observable, change) => {
                this.changedObservablesSets.get(derived).add(observable);
                return existingHandleChange.apply(derived, [observable, change]);
            };
        }
        handleDerivedRecomputed(derived, info) {
            const changedObservables = this.changedObservablesSets.get(derived);
            console.log(...this.textToConsoleArgs([
                formatKind('derived recomputed'),
                styled(derived.debugName, { color: 'BlueViolet' }),
                ...this.formatInfo(info),
                this.formatChanges(changedObservables),
                { data: [{ fn: derived._computeFn }] }
            ]));
            changedObservables.clear();
        }
        handleFromEventObservableTriggered(observable, info) {
            console.log(...this.textToConsoleArgs([
                formatKind('observable from event triggered'),
                styled(observable.debugName, { color: 'BlueViolet' }),
                ...this.formatInfo(info),
                { data: [{ fn: observable._getValue }] }
            ]));
        }
        handleAutorunCreated(autorun) {
            const existingHandleChange = autorun.handleChange;
            this.changedObservablesSets.set(autorun, new Set());
            autorun.handleChange = (observable, change) => {
                this.changedObservablesSets.get(autorun).add(observable);
                return existingHandleChange.apply(autorun, [observable, change]);
            };
        }
        handleAutorunTriggered(autorun) {
            const changedObservables = this.changedObservablesSets.get(autorun);
            console.log(...this.textToConsoleArgs([
                formatKind('autorun'),
                styled(autorun.debugName, { color: 'BlueViolet' }),
                this.formatChanges(changedObservables),
                { data: [{ fn: autorun._runFn }] }
            ]));
            changedObservables.clear();
            this.indentation++;
        }
        handleAutorunFinished(autorun) {
            this.indentation--;
        }
        handleBeginTransaction(transaction) {
            let transactionName = transaction.getDebugName();
            if (transactionName === undefined) {
                transactionName = '';
            }
            console.log(...this.textToConsoleArgs([
                formatKind('transaction'),
                styled(transactionName, { color: 'BlueViolet' }),
                { data: [{ fn: transaction._fn }] }
            ]));
            this.indentation++;
        }
        handleEndTransaction() {
            this.indentation--;
        }
    }
    exports.ConsoleObservableLogger = ConsoleObservableLogger;
    function consoleTextToArgs(text) {
        const styles = new Array();
        const data = [];
        let firstArg = '';
        function process(t) {
            if ('length' in t) {
                for (const item of t) {
                    if (item) {
                        process(item);
                    }
                }
            }
            else if ('text' in t) {
                firstArg += `%c${t.text}`;
                styles.push(t.style);
                if (t.data) {
                    data.push(...t.data);
                }
            }
            else if ('data' in t) {
                data.push(...t.data);
            }
        }
        process(text);
        const result = [firstArg, ...styles];
        result.push(...data);
        return result;
    }
    function normalText(text) {
        return styled(text, { color: 'black' });
    }
    function formatKind(kind) {
        return styled(padStr(`${kind}: `, 10), { color: 'black', bold: true });
    }
    function styled(text, options = {
        color: 'black',
    }) {
        function objToCss(styleObj) {
            return Object.entries(styleObj).reduce((styleString, [propName, propValue]) => {
                return `${styleString}${propName}:${propValue};`;
            }, '');
        }
        const style = {
            color: options.color,
        };
        if (options.strikeThrough) {
            style['text-decoration'] = 'line-through';
        }
        if (options.bold) {
            style['font-weight'] = 'bold';
        }
        return {
            text,
            style: objToCss(style),
        };
    }
    function formatValue(value, availableLen) {
        switch (typeof value) {
            case 'number':
                return '' + value;
            case 'string':
                if (value.length + 2 <= availableLen) {
                    return `"${value}"`;
                }
                return `"${value.substr(0, availableLen - 7)}"+...`;
            case 'boolean':
                return value ? 'true' : 'false';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (value === null) {
                    return 'null';
                }
                if (Array.isArray(value)) {
                    return formatArray(value, availableLen);
                }
                return formatObject(value, availableLen);
            case 'symbol':
                return value.toString();
            case 'function':
                return `[[Function${value.name ? ' ' + value.name : ''}]]`;
            default:
                return '' + value;
        }
    }
    function formatArray(value, availableLen) {
        let result = '[ ';
        let first = true;
        for (const val of value) {
            if (!first) {
                result += ', ';
            }
            if (result.length - 5 > availableLen) {
                result += '...';
                break;
            }
            first = false;
            result += `${formatValue(val, availableLen - result.length)}`;
        }
        result += ' ]';
        return result;
    }
    function formatObject(value, availableLen) {
        let result = '{ ';
        let first = true;
        for (const [key, val] of Object.entries(value)) {
            if (!first) {
                result += ', ';
            }
            if (result.length - 5 > availableLen) {
                result += '...';
                break;
            }
            first = false;
            result += `${key}: ${formatValue(val, availableLen - result.length)}`;
        }
        result += ' }';
        return result;
    }
    function repeat(str, count) {
        let result = '';
        for (let i = 1; i <= count; i++) {
            result += str;
        }
        return result;
    }
    function padStr(str, length) {
        while (str.length < length) {
            str += ' ';
        }
        return str;
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[633/*vs/base/common/observableInternal/autorun*/], __M([1/*require*/,0/*exports*/,175/*vs/base/common/assert*/,2/*vs/base/common/lifecycle*/,466/*vs/base/common/observableInternal/debugName*/,467/*vs/base/common/observableInternal/logging*/]), function (require, exports, assert_1, lifecycle_1, debugName_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutorunObserver = exports.autorunDelta = exports.autorunWithStore = exports.autorunWithStoreHandleChanges = exports.autorunHandleChanges = exports.autorunOpts = exports.autorun = void 0;
    /**
     * Runs immediately and whenever a transaction ends and an observed observable changed.
     * {@link fn} should start with a JS Doc using `@description` to name the autorun.
     */
    function autorun(fn) {
        return new AutorunObserver(new debugName_1.DebugNameData(undefined, undefined, fn), fn, undefined, undefined);
    }
    exports.autorun = autorun;
    /**
     * Runs immediately and whenever a transaction ends and an observed observable changed.
     * {@link fn} should start with a JS Doc using `@description` to name the autorun.
     */
    function autorunOpts(options, fn) {
        return new AutorunObserver(new debugName_1.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, undefined, undefined);
    }
    exports.autorunOpts = autorunOpts;
    /**
     * Runs immediately and whenever a transaction ends and an observed observable changed.
     * {@link fn} should start with a JS Doc using `@description` to name the autorun.
     *
     * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
     * Use `handleChange` to add a reported change to the change summary.
     * The run function is given the last change summary.
     * The change summary is discarded after the run function was called.
     *
     * @see autorun
     */
    function autorunHandleChanges(options, fn) {
        return new AutorunObserver(new debugName_1.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, options.createEmptyChangeSummary, options.handleChange);
    }
    exports.autorunHandleChanges = autorunHandleChanges;
    /**
     * @see autorunHandleChanges (but with a disposable store that is cleared before the next run or on dispose)
     */
    function autorunWithStoreHandleChanges(options, fn) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorunHandleChanges({
            owner: options.owner,
            debugName: options.debugName,
            debugReferenceFn: options.debugReferenceFn,
            createEmptyChangeSummary: options.createEmptyChangeSummary,
            handleChange: options.handleChange,
        }, (reader, changeSummary) => {
            store.clear();
            fn(reader, changeSummary, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStoreHandleChanges = autorunWithStoreHandleChanges;
    /**
     * @see autorun (but with a disposable store that is cleared before the next run or on dispose)
     */
    function autorunWithStore(fn) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorunOpts({
            owner: undefined,
            debugName: undefined,
            debugReferenceFn: fn,
        }, reader => {
            store.clear();
            fn(reader, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStore = autorunWithStore;
    function autorunDelta(observable, handler) {
        let _lastValue;
        return autorunOpts({ debugReferenceFn: handler }, (reader) => {
            const newValue = observable.read(reader);
            const lastValue = _lastValue;
            _lastValue = newValue;
            handler({ lastValue, newValue });
        });
    }
    exports.autorunDelta = autorunDelta;
    var AutorunState;
    (function (AutorunState) {
        /**
         * A dependency could have changed.
         * We need to explicitly ask them if at least one dependency changed.
         */
        AutorunState[AutorunState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
        /**
         * A dependency changed and we need to recompute.
         */
        AutorunState[AutorunState["stale"] = 2] = "stale";
        AutorunState[AutorunState["upToDate"] = 3] = "upToDate";
    })(AutorunState || (AutorunState = {}));
    class AutorunObserver {
        get debugName() {
            return this._debugNameData.getDebugName(this) ?? '(anonymous)';
        }
        constructor(_debugNameData, _runFn, createChangeSummary, _handleChange) {
            this._debugNameData = _debugNameData;
            this._runFn = _runFn;
            this.createChangeSummary = createChangeSummary;
            this._handleChange = _handleChange;
            this.state = 2 /* AutorunState.stale */;
            this.updateCount = 0;
            this.disposed = false;
            this.dependencies = new Set();
            this.dependenciesToBeRemoved = new Set();
            this.changeSummary = this.createChangeSummary?.();
            (0, logging_1.getLogger)()?.handleAutorunCreated(this);
            this._runIfNeeded();
            (0, lifecycle_1.trackDisposable)(this);
        }
        dispose() {
            this.disposed = true;
            for (const o of this.dependencies) {
                o.removeObserver(this);
            }
            this.dependencies.clear();
            (0, lifecycle_1.markAsDisposed)(this);
        }
        _runIfNeeded() {
            if (this.state === 3 /* AutorunState.upToDate */) {
                return;
            }
            const emptySet = this.dependenciesToBeRemoved;
            this.dependenciesToBeRemoved = this.dependencies;
            this.dependencies = emptySet;
            this.state = 3 /* AutorunState.upToDate */;
            const isDisposed = this.disposed;
            try {
                if (!isDisposed) {
                    (0, logging_1.getLogger)()?.handleAutorunTriggered(this);
                    const changeSummary = this.changeSummary;
                    this.changeSummary = this.createChangeSummary?.();
                    this._runFn(this, changeSummary);
                }
            }
            finally {
                if (!isDisposed) {
                    (0, logging_1.getLogger)()?.handleAutorunFinished(this);
                }
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this.dependenciesToBeRemoved.clear();
            }
        }
        toString() {
            return `Autorun<${this.debugName}>`;
        }
        // IObserver implementation
        beginUpdate() {
            if (this.state === 3 /* AutorunState.upToDate */) {
                this.state = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
            this.updateCount++;
        }
        endUpdate() {
            if (this.updateCount === 1) {
                do {
                    if (this.state === 1 /* AutorunState.dependenciesMightHaveChanged */) {
                        this.state = 3 /* AutorunState.upToDate */;
                        for (const d of this.dependencies) {
                            d.reportChanges();
                            if (this.state === 2 /* AutorunState.stale */) {
                                // The other dependencies will refresh on demand
                                break;
                            }
                        }
                    }
                    this._runIfNeeded();
                } while (this.state !== 3 /* AutorunState.upToDate */);
            }
            this.updateCount--;
            (0, assert_1.assertFn)(() => this.updateCount >= 0);
        }
        handlePossibleChange(observable) {
            if (this.state === 3 /* AutorunState.upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                this.state = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
        }
        handleChange(observable, change) {
            if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                const shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.changeSummary) : true;
                if (shouldReact) {
                    this.state = 2 /* AutorunState.stale */;
                }
            }
        }
        // IReader implementation
        readObservable(observable) {
            // In case the run action disposes the autorun
            if (this.disposed) {
                return observable.get();
            }
            observable.addObserver(this);
            const value = observable.get();
            this.dependencies.add(observable);
            this.dependenciesToBeRemoved.delete(observable);
            return value;
        }
    }
    exports.AutorunObserver = AutorunObserver;
    (function (autorun) {
        autorun.Observer = AutorunObserver;
    })(autorun || (exports.autorun = autorun = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[374/*vs/base/common/observableInternal/base*/], __M([1/*require*/,0/*exports*/,466/*vs/base/common/observableInternal/debugName*/,467/*vs/base/common/observableInternal/logging*/]), function (require, exports, debugName_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableObservableValue = exports.disposableObservableValue = exports.ObservableValue = exports.observableValue = exports.TransactionImpl = exports.subtransaction = exports.asyncTransaction = exports.globalTransaction = exports.transaction = exports.BaseObservable = exports.ConvenientObservable = exports._setDerivedOpts = exports._setKeepObserved = exports._setRecomputeInitiallyAndOnChange = void 0;
    let _recomputeInitiallyAndOnChange;
    function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange) {
        _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange;
    }
    exports._setRecomputeInitiallyAndOnChange = _setRecomputeInitiallyAndOnChange;
    let _keepObserved;
    function _setKeepObserved(keepObserved) {
        _keepObserved = keepObserved;
    }
    exports._setKeepObserved = _setKeepObserved;
    let _derived;
    /**
     * @internal
     * This is to allow splitting files.
    */
    function _setDerivedOpts(derived) {
        _derived = derived;
    }
    exports._setDerivedOpts = _setDerivedOpts;
    class ConvenientObservable {
        get TChange() { return null; }
        reportChanges() {
            this.get();
        }
        /** @sealed */
        read(reader) {
            if (reader) {
                return reader.readObservable(this);
            }
            else {
                return this.get();
            }
        }
        map(fnOrOwner, fnOrUndefined) {
            const owner = fnOrUndefined === undefined ? undefined : fnOrOwner;
            const fn = fnOrUndefined === undefined ? fnOrOwner : fnOrUndefined;
            return _derived({
                owner,
                debugName: () => {
                    const name = (0, debugName_1.getFunctionName)(fn);
                    if (name !== undefined) {
                        return name;
                    }
                    // regexp to match `x => x.y` or `x => x?.y` where x and y can be arbitrary identifiers (uses backref):
                    const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
                    const match = regexp.exec(fn.toString());
                    if (match) {
                        return `${this.debugName}.${match[2]}`;
                    }
                    if (!owner) {
                        return `${this.debugName} (mapped)`;
                    }
                    return undefined;
                },
            }, (reader) => fn(this.read(reader), reader));
        }
        recomputeInitiallyAndOnChange(store, handleValue) {
            store.add(_recomputeInitiallyAndOnChange(this, handleValue));
            return this;
        }
        /**
         * Ensures that this observable is observed. This keeps the cache alive.
         * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
         * Use `recomputeInitiallyAndOnChange` for eager evaluation.
         */
        keepObserved(store) {
            store.add(_keepObserved(this));
            return this;
        }
    }
    exports.ConvenientObservable = ConvenientObservable;
    class BaseObservable extends ConvenientObservable {
        constructor() {
            super(...arguments);
            this.observers = new Set();
        }
        addObserver(observer) {
            const len = this.observers.size;
            this.observers.add(observer);
            if (len === 0) {
                this.onFirstObserverAdded();
            }
        }
        removeObserver(observer) {
            const deleted = this.observers.delete(observer);
            if (deleted && this.observers.size === 0) {
                this.onLastObserverRemoved();
            }
        }
        onFirstObserverAdded() { }
        onLastObserverRemoved() { }
    }
    exports.BaseObservable = BaseObservable;
    /**
     * Starts a transaction in which many observables can be changed at once.
     * {@link fn} should start with a JS Doc using `@description` to give the transaction a debug name.
     * Reaction run on demand or when the transaction ends.
     */
    function transaction(fn, getDebugName) {
        const tx = new TransactionImpl(fn, getDebugName);
        try {
            fn(tx);
        }
        finally {
            tx.finish();
        }
    }
    exports.transaction = transaction;
    let _globalTransaction = undefined;
    function globalTransaction(fn) {
        if (_globalTransaction) {
            fn(_globalTransaction);
        }
        else {
            const tx = new TransactionImpl(fn, undefined);
            _globalTransaction = tx;
            try {
                fn(tx);
            }
            finally {
                tx.finish(); // During finish, more actions might be added to the transaction.
                // Which is why we only clear the global transaction after finish.
                _globalTransaction = undefined;
            }
        }
    }
    exports.globalTransaction = globalTransaction;
    async function asyncTransaction(fn, getDebugName) {
        const tx = new TransactionImpl(fn, getDebugName);
        try {
            await fn(tx);
        }
        finally {
            tx.finish();
        }
    }
    exports.asyncTransaction = asyncTransaction;
    /**
     * Allows to chain transactions.
     */
    function subtransaction(tx, fn, getDebugName) {
        if (!tx) {
            transaction(fn, getDebugName);
        }
        else {
            fn(tx);
        }
    }
    exports.subtransaction = subtransaction;
    class TransactionImpl {
        constructor(_fn, _getDebugName) {
            this._fn = _fn;
            this._getDebugName = _getDebugName;
            this.updatingObservers = [];
            (0, logging_1.getLogger)()?.handleBeginTransaction(this);
        }
        getDebugName() {
            if (this._getDebugName) {
                return this._getDebugName();
            }
            return (0, debugName_1.getFunctionName)(this._fn);
        }
        updateObserver(observer, observable) {
            // When this gets called while finish is active, they will still get considered
            this.updatingObservers.push({ observer, observable });
            observer.beginUpdate(observable);
        }
        finish() {
            const updatingObservers = this.updatingObservers;
            for (let i = 0; i < updatingObservers.length; i++) {
                const { observer, observable } = updatingObservers[i];
                observer.endUpdate(observable);
            }
            // Prevent anyone from updating observers from now on.
            this.updatingObservers = null;
            (0, logging_1.getLogger)()?.handleEndTransaction();
        }
    }
    exports.TransactionImpl = TransactionImpl;
    function observableValue(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new ObservableValue(undefined, nameOrOwner, initialValue);
        }
        else {
            return new ObservableValue(nameOrOwner, undefined, initialValue);
        }
    }
    exports.observableValue = observableValue;
    class ObservableValue extends BaseObservable {
        get debugName() {
            return new debugName_1.DebugNameData(this._owner, this._debugName, undefined).getDebugName(this) ?? 'ObservableValue';
        }
        constructor(_owner, _debugName, initialValue) {
            super();
            this._owner = _owner;
            this._debugName = _debugName;
            this._value = initialValue;
        }
        get() {
            return this._value;
        }
        set(value, tx, change) {
            if (this._value === value) {
                return;
            }
            let _tx;
            if (!tx) {
                tx = _tx = new TransactionImpl(() => { }, () => `Setting ${this.debugName}`);
            }
            try {
                const oldValue = this._value;
                this._setValue(value);
                (0, logging_1.getLogger)()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
                for (const observer of this.observers) {
                    tx.updateObserver(observer, this);
                    observer.handleChange(this, change);
                }
            }
            finally {
                if (_tx) {
                    _tx.finish();
                }
            }
        }
        toString() {
            return `${this.debugName}: ${this._value}`;
        }
        _setValue(newValue) {
            this._value = newValue;
        }
    }
    exports.ObservableValue = ObservableValue;
    /**
     * A disposable observable. When disposed, its value is also disposed.
     * When a new value is set, the previous value is disposed.
     */
    function disposableObservableValue(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new DisposableObservableValue(undefined, nameOrOwner, initialValue);
        }
        else {
            return new DisposableObservableValue(nameOrOwner, undefined, initialValue);
        }
    }
    exports.disposableObservableValue = disposableObservableValue;
    class DisposableObservableValue extends ObservableValue {
        _setValue(newValue) {
            if (this._value === newValue) {
                return;
            }
            if (this._value) {
                this._value.dispose();
            }
            this._value = newValue;
        }
        dispose() {
            this._value?.dispose();
        }
    }
    exports.DisposableObservableValue = DisposableObservableValue;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[468/*vs/base/common/observableInternal/derived*/], __M([1/*require*/,0/*exports*/,175/*vs/base/common/assert*/,2/*vs/base/common/lifecycle*/,374/*vs/base/common/observableInternal/base*/,466/*vs/base/common/observableInternal/debugName*/,467/*vs/base/common/observableInternal/logging*/]), function (require, exports, assert_1, lifecycle_1, base_1, debugName_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Derived = exports.derivedDisposable = exports.derivedWithStore = exports.derivedHandleChanges = exports.derivedOpts = exports.derived = exports.defaultEqualityComparer = void 0;
    const defaultEqualityComparer = (a, b) => a === b;
    exports.defaultEqualityComparer = defaultEqualityComparer;
    function derived(computeFnOrOwner, computeFn) {
        if (computeFn !== undefined) {
            return new Derived(new debugName_1.DebugNameData(computeFnOrOwner, undefined, computeFn), computeFn, undefined, undefined, undefined, exports.defaultEqualityComparer);
        }
        return new Derived(new debugName_1.DebugNameData(undefined, undefined, computeFnOrOwner), computeFnOrOwner, undefined, undefined, undefined, exports.defaultEqualityComparer);
    }
    exports.derived = derived;
    function derivedOpts(options, computeFn) {
        return new Derived(new debugName_1.DebugNameData(options.owner, options.debugName, options.debugReferenceFn), computeFn, undefined, undefined, options.onLastObserverRemoved, options.equalityComparer ?? exports.defaultEqualityComparer);
    }
    exports.derivedOpts = derivedOpts;
    (0, base_1._setDerivedOpts)(derivedOpts);
    /**
     * Represents an observable that is derived from other observables.
     * The value is only recomputed when absolutely needed.
     *
     * {@link computeFn} should start with a JS Doc using `@description` to name the derived.
     *
     * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
     * Use `handleChange` to add a reported change to the change summary.
     * The compute function is given the last change summary.
     * The change summary is discarded after the compute function was called.
     *
     * @see derived
     */
    function derivedHandleChanges(options, computeFn) {
        return new Derived(new debugName_1.DebugNameData(options.owner, options.debugName, undefined), computeFn, options.createEmptyChangeSummary, options.handleChange, undefined, options.equalityComparer ?? exports.defaultEqualityComparer);
    }
    exports.derivedHandleChanges = derivedHandleChanges;
    function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
        let computeFn;
        let owner;
        if (computeFnOrUndefined === undefined) {
            computeFn = computeFnOrOwner;
            owner = undefined;
        }
        else {
            owner = computeFnOrOwner;
            computeFn = computeFnOrUndefined;
        }
        const store = new lifecycle_1.DisposableStore();
        return new Derived(new debugName_1.DebugNameData(owner, undefined, computeFn), r => {
            store.clear();
            return computeFn(r, store);
        }, undefined, undefined, () => store.dispose(), exports.defaultEqualityComparer);
    }
    exports.derivedWithStore = derivedWithStore;
    function derivedDisposable(computeFnOrOwner, computeFnOrUndefined) {
        let computeFn;
        let owner;
        if (computeFnOrUndefined === undefined) {
            computeFn = computeFnOrOwner;
            owner = undefined;
        }
        else {
            owner = computeFnOrOwner;
            computeFn = computeFnOrUndefined;
        }
        const store = new lifecycle_1.DisposableStore();
        return new Derived(new debugName_1.DebugNameData(owner, undefined, computeFn), r => {
            store.clear();
            const result = computeFn(r);
            if (result) {
                store.add(result);
            }
            return result;
        }, undefined, undefined, () => store.dispose(), exports.defaultEqualityComparer);
    }
    exports.derivedDisposable = derivedDisposable;
    var DerivedState;
    (function (DerivedState) {
        /** Initial state, no previous value, recomputation needed */
        DerivedState[DerivedState["initial"] = 0] = "initial";
        /**
         * A dependency could have changed.
         * We need to explicitly ask them if at least one dependency changed.
         */
        DerivedState[DerivedState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
        /**
         * A dependency changed and we need to recompute.
         * After recomputation, we need to check the previous value to see if we changed as well.
         */
        DerivedState[DerivedState["stale"] = 2] = "stale";
        /**
         * No change reported, our cached value is up to date.
         */
        DerivedState[DerivedState["upToDate"] = 3] = "upToDate";
    })(DerivedState || (DerivedState = {}));
    class Derived extends base_1.BaseObservable {
        get debugName() {
            return this._debugNameData.getDebugName(this) ?? '(anonymous)';
        }
        constructor(_debugNameData, _computeFn, createChangeSummary, _handleChange, _handleLastObserverRemoved = undefined, _equalityComparator) {
            super();
            this._debugNameData = _debugNameData;
            this._computeFn = _computeFn;
            this.createChangeSummary = createChangeSummary;
            this._handleChange = _handleChange;
            this._handleLastObserverRemoved = _handleLastObserverRemoved;
            this._equalityComparator = _equalityComparator;
            this.state = 0 /* DerivedState.initial */;
            this.value = undefined;
            this.updateCount = 0;
            this.dependencies = new Set();
            this.dependenciesToBeRemoved = new Set();
            this.changeSummary = undefined;
            this.changeSummary = this.createChangeSummary?.();
            (0, logging_1.getLogger)()?.handleDerivedCreated(this);
        }
        onLastObserverRemoved() {
            /**
             * We are not tracking changes anymore, thus we have to assume
             * that our cache is invalid.
             */
            this.state = 0 /* DerivedState.initial */;
            this.value = undefined;
            for (const d of this.dependencies) {
                d.removeObserver(this);
            }
            this.dependencies.clear();
            this._handleLastObserverRemoved?.();
        }
        get() {
            if (this.observers.size === 0) {
                // Without observers, we don't know when to clean up stuff.
                // Thus, we don't cache anything to prevent memory leaks.
                const result = this._computeFn(this, this.createChangeSummary?.());
                // Clear new dependencies
                this.onLastObserverRemoved();
                return result;
            }
            else {
                do {
                    // We might not get a notification for a dependency that changed while it is updating,
                    // thus we also have to ask all our depedencies if they changed in this case.
                    if (this.state === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                        for (const d of this.dependencies) {
                            /** might call {@link handleChange} indirectly, which could make us stale */
                            d.reportChanges();
                            if (this.state === 2 /* DerivedState.stale */) {
                                // The other dependencies will refresh on demand, so early break
                                break;
                            }
                        }
                    }
                    // We called report changes of all dependencies.
                    // If we are still not stale, we can assume to be up to date again.
                    if (this.state === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                        this.state = 3 /* DerivedState.upToDate */;
                    }
                    this._recomputeIfNeeded();
                    // In case recomputation changed one of our dependencies, we need to recompute again.
                } while (this.state !== 3 /* DerivedState.upToDate */);
                return this.value;
            }
        }
        _recomputeIfNeeded() {
            if (this.state === 3 /* DerivedState.upToDate */) {
                return;
            }
            const emptySet = this.dependenciesToBeRemoved;
            this.dependenciesToBeRemoved = this.dependencies;
            this.dependencies = emptySet;
            const hadValue = this.state !== 0 /* DerivedState.initial */;
            const oldValue = this.value;
            this.state = 3 /* DerivedState.upToDate */;
            const changeSummary = this.changeSummary;
            this.changeSummary = this.createChangeSummary?.();
            try {
                /** might call {@link handleChange} indirectly, which could invalidate us */
                this.value = this._computeFn(this, changeSummary);
            }
            finally {
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this.dependenciesToBeRemoved.clear();
            }
            const didChange = hadValue && !(this._equalityComparator(oldValue, this.value));
            (0, logging_1.getLogger)()?.handleDerivedRecomputed(this, {
                oldValue,
                newValue: this.value,
                change: undefined,
                didChange,
                hadValue,
            });
            if (didChange) {
                for (const r of this.observers) {
                    r.handleChange(this, undefined);
                }
            }
        }
        toString() {
            return `LazyDerived<${this.debugName}>`;
        }
        // IObserver Implementation
        beginUpdate(_observable) {
            this.updateCount++;
            const propagateBeginUpdate = this.updateCount === 1;
            if (this.state === 3 /* DerivedState.upToDate */) {
                this.state = 1 /* DerivedState.dependenciesMightHaveChanged */;
                // If we propagate begin update, that will already signal a possible change.
                if (!propagateBeginUpdate) {
                    for (const r of this.observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
            if (propagateBeginUpdate) {
                for (const r of this.observers) {
                    r.beginUpdate(this); // This signals a possible change
                }
            }
        }
        endUpdate(_observable) {
            this.updateCount--;
            if (this.updateCount === 0) {
                // End update could change the observer list.
                const observers = [...this.observers];
                for (const r of observers) {
                    r.endUpdate(this);
                }
            }
            (0, assert_1.assertFn)(() => this.updateCount >= 0);
        }
        handlePossibleChange(observable) {
            // In all other states, observers already know that we might have changed.
            if (this.state === 3 /* DerivedState.upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                this.state = 1 /* DerivedState.dependenciesMightHaveChanged */;
                for (const r of this.observers) {
                    r.handlePossibleChange(this);
                }
            }
        }
        handleChange(observable, change) {
            if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                const shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.changeSummary) : true;
                const wasUpToDate = this.state === 3 /* DerivedState.upToDate */;
                if (shouldReact && (this.state === 1 /* DerivedState.dependenciesMightHaveChanged */ || wasUpToDate)) {
                    this.state = 2 /* DerivedState.stale */;
                    if (wasUpToDate) {
                        for (const r of this.observers) {
                            r.handlePossibleChange(this);
                        }
                    }
                }
            }
        }
        // IReader Implementation
        readObservable(observable) {
            // Subscribe before getting the value to enable caching
            observable.addObserver(this);
            /** This might call {@link handleChange} indirectly, which could invalidate us */
            const value = observable.get();
            // Which is why we only add the observable to the dependencies now.
            this.dependencies.add(observable);
            this.dependenciesToBeRemoved.delete(observable);
            return value;
        }
        addObserver(observer) {
            const shouldCallBeginUpdate = !this.observers.has(observer) && this.updateCount > 0;
            super.addObserver(observer);
            if (shouldCallBeginUpdate) {
                observer.beginUpdate(this);
            }
        }
        removeObserver(observer) {
            const shouldCallEndUpdate = this.observers.has(observer) && this.updateCount > 0;
            super.removeObserver(observer);
            if (shouldCallEndUpdate) {
                // Calling end update after removing the observer makes sure endUpdate cannot be called twice here.
                observer.endUpdate(this);
            }
        }
    }
    exports.Derived = Derived;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[538/*vs/base/common/observableInternal/utils*/], __M([1/*require*/,0/*exports*/,2/*vs/base/common/lifecycle*/,633/*vs/base/common/observableInternal/autorun*/,374/*vs/base/common/observableInternal/base*/,466/*vs/base/common/observableInternal/debugName*/,468/*vs/base/common/observableInternal/derived*/,467/*vs/base/common/observableInternal/logging*/]), function (require, exports, lifecycle_1, autorun_1, base_1, debugName_1, derived_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapObservableArrayCached = exports.derivedObservableWithWritableCache = exports.derivedObservableWithCache = exports.KeepAliveObserver = exports.recomputeInitiallyAndOnChange = exports.keepObserved = exports.wasEventTriggeredRecently = exports.debouncedObservable = exports.observableSignal = exports.observableSignalFromEvent = exports.FromEventObservable = exports.observableFromEvent = exports.observableFromPromise = exports.constObservable = void 0;
    /**
     * Represents an efficient observable whose value never changes.
     */
    function constObservable(value) {
        return new ConstObservable(value);
    }
    exports.constObservable = constObservable;
    class ConstObservable extends base_1.ConvenientObservable {
        constructor(value) {
            super();
            this.value = value;
        }
        get debugName() {
            return this.toString();
        }
        get() {
            return this.value;
        }
        addObserver(observer) {
            // NO OP
        }
        removeObserver(observer) {
            // NO OP
        }
        toString() {
            return `Const: ${this.value}`;
        }
    }
    function observableFromPromise(promise) {
        const observable = (0, base_1.observableValue)('promiseValue', {});
        promise.then((value) => {
            observable.set({ value }, undefined);
        });
        return observable;
    }
    exports.observableFromPromise = observableFromPromise;
    function observableFromEvent(event, getValue) {
        return new FromEventObservable(event, getValue);
    }
    exports.observableFromEvent = observableFromEvent;
    class FromEventObservable extends base_1.BaseObservable {
        constructor(event, _getValue) {
            super();
            this.event = event;
            this._getValue = _getValue;
            this.hasValue = false;
            this.handleEvent = (args) => {
                const newValue = this._getValue(args);
                const oldValue = this.value;
                const didChange = !this.hasValue || oldValue !== newValue;
                let didRunTransaction = false;
                if (didChange) {
                    this.value = newValue;
                    if (this.hasValue) {
                        didRunTransaction = true;
                        (0, base_1.subtransaction)(FromEventObservable.globalTransaction, (tx) => {
                            (0, logging_1.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue, newValue, change: undefined, didChange, hadValue: this.hasValue });
                            for (const o of this.observers) {
                                tx.updateObserver(o, this);
                                o.handleChange(this, undefined);
                            }
                        }, () => {
                            const name = this.getDebugName();
                            return 'Event fired' + (name ? `: ${name}` : '');
                        });
                    }
                    this.hasValue = true;
                }
                if (!didRunTransaction) {
                    (0, logging_1.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue, newValue, change: undefined, didChange, hadValue: this.hasValue });
                }
            };
        }
        getDebugName() {
            return (0, debugName_1.getFunctionName)(this._getValue);
        }
        get debugName() {
            const name = this.getDebugName();
            return 'From Event' + (name ? `: ${name}` : '');
        }
        onFirstObserverAdded() {
            this.subscription = this.event(this.handleEvent);
        }
        onLastObserverRemoved() {
            this.subscription.dispose();
            this.subscription = undefined;
            this.hasValue = false;
            this.value = undefined;
        }
        get() {
            if (this.subscription) {
                if (!this.hasValue) {
                    this.handleEvent(undefined);
                }
                return this.value;
            }
            else {
                // no cache, as there are no subscribers to keep it updated
                return this._getValue(undefined);
            }
        }
    }
    exports.FromEventObservable = FromEventObservable;
    (function (observableFromEvent) {
        observableFromEvent.Observer = FromEventObservable;
        function batchEventsGlobally(tx, fn) {
            let didSet = false;
            if (FromEventObservable.globalTransaction === undefined) {
                FromEventObservable.globalTransaction = tx;
                didSet = true;
            }
            try {
                fn();
            }
            finally {
                if (didSet) {
                    FromEventObservable.globalTransaction = undefined;
                }
            }
        }
        observableFromEvent.batchEventsGlobally = batchEventsGlobally;
    })(observableFromEvent || (exports.observableFromEvent = observableFromEvent = {}));
    function observableSignalFromEvent(debugName, event) {
        return new FromEventObservableSignal(debugName, event);
    }
    exports.observableSignalFromEvent = observableSignalFromEvent;
    class FromEventObservableSignal extends base_1.BaseObservable {
        constructor(debugName, event) {
            super();
            this.debugName = debugName;
            this.event = event;
            this.handleEvent = () => {
                (0, base_1.transaction)((tx) => {
                    for (const o of this.observers) {
                        tx.updateObserver(o, this);
                        o.handleChange(this, undefined);
                    }
                }, () => this.debugName);
            };
        }
        onFirstObserverAdded() {
            this.subscription = this.event(this.handleEvent);
        }
        onLastObserverRemoved() {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        get() {
            // NO OP
        }
    }
    function observableSignal(debugNameOrOwner) {
        if (typeof debugNameOrOwner === 'string') {
            return new ObservableSignal(debugNameOrOwner);
        }
        else {
            return new ObservableSignal(undefined, debugNameOrOwner);
        }
    }
    exports.observableSignal = observableSignal;
    class ObservableSignal extends base_1.BaseObservable {
        get debugName() {
            return new debugName_1.DebugNameData(this._owner, this._debugName, undefined).getDebugName(this) ?? 'Observable Signal';
        }
        constructor(_debugName, _owner) {
            super();
            this._debugName = _debugName;
            this._