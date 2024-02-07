/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, browser_1, event_1, lifecycle_1, fontMeasurements_1, fontInfo_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOptions = exports.OutputInnerContainerTopPadding = exports.getEditorTopPadding = exports.updateEditorTopPadding = void 0;
    const SCROLLABLE_ELEMENT_PADDING_TOP = 18;
    let EDITOR_TOP_PADDING = 12;
    const editorTopPaddingChangeEmitter = new event_1.Emitter();
    const EditorTopPaddingChangeEvent = editorTopPaddingChangeEmitter.event;
    function updateEditorTopPadding(top) {
        EDITOR_TOP_PADDING = top;
        editorTopPaddingChangeEmitter.fire();
    }
    exports.updateEditorTopPadding = updateEditorTopPadding;
    function getEditorTopPadding() {
        return EDITOR_TOP_PADDING;
    }
    exports.getEditorTopPadding = getEditorTopPadding;
    exports.OutputInnerContainerTopPadding = 4;
    const defaultConfigConstants = Object.freeze({
        codeCellLeftMargin: 28,
        cellRunGutter: 32,
        markdownCellTopMargin: 8,
        markdownCellBottomMargin: 8,
        markdownCellLeftMargin: 0,
        markdownCellGutter: 32,
        focusIndicatorLeftMargin: 4
    });
    const compactConfigConstants = Object.freeze({
        codeCellLeftMargin: 8,
        cellRunGutter: 36,
        markdownCellTopMargin: 6,
        markdownCellBottomMargin: 6,
        markdownCellLeftMargin: 8,
        markdownCellGutter: 36,
        focusIndicatorLeftMargin: 4
    });
    class NotebookOptions extends lifecycle_1.Disposable {
        constructor(configurationService, notebookExecutionStateService, isReadonly, overrides) {
            super();
            this.configurationService = configurationService;
            this.notebookExecutionStateService = notebookExecutionStateService;
            this.isReadonly = isReadonly;
            this.overrides = overrides;
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this.onDidChangeOptions = this._onDidChangeOptions.event;
            const showCellStatusBar = this.configurationService.getValue(notebookCommon_1.NotebookSetting.showCellStatusBar);
            const globalToolbar = overrides?.globalToolbar ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbar) ?? true;
            const stickyScrollEnabled = overrides?.stickyScrollEnabled ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.stickyScrollEnabled) ?? false;
            const stickyScrollMode = this._computeStickyScrollModeOption();
            const consolidatedOutputButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedOutputButton) ?? true;
            const consolidatedRunButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedRunButton) ?? false;
            const dragAndDropEnabled = overrides?.dragAndDropEnabled ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.dragAndDropEnabled) ?? true;
            const cellToolbarLocation = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarLocation) ?? { 'default': 'right' };
            const cellToolbarInteraction = overrides?.cellToolbarInteraction ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarVisibility);
            const compactView = this.configurationService.getValue(notebookCommon_1.NotebookSetting.compactView) ?? true;
            const focusIndicator = this._computeFocusIndicatorOption();
            const insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
            const insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
            const showFoldingControls = this._computeShowFoldingControlsOption();
            // const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment);
            const fontSize = this.configurationService.getValue('editor.fontSize');
            const markupFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.markupFontSize);
            const editorOptionsCustomizations = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations);
            const interactiveWindowCollapseCodeCells = this.configurationService.getValue(notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells);
            // TOOD @rebornix remove after a few iterations of deprecated setting
            let outputLineHeightSettingValue;
            const deprecatedOutputLineHeightSetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputLineHeightDeprecated);
            if (deprecatedOutputLineHeightSetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputLineHeightDeprecated, notebookCommon_1.NotebookSetting.outputLineHeight);
                outputLineHeightSettingValue = deprecatedOutputLineHeightSetting;
            }
            else {
                outputLineHeightSettingValue = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputLineHeight);
            }
            let outputFontSize;
            const deprecatedOutputFontSizeSetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontSizeDeprecated);
            if (deprecatedOutputFontSizeSetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputFontSizeDeprecated, notebookCommon_1.NotebookSetting.outputFontSize);
                outputFontSize = deprecatedOutputFontSizeSetting;
            }
            else {
                outputFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontSize) || fontSize;
            }
            let outputFontFamily;
            const deprecatedOutputFontFamilySetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontFamilyDeprecated);
            if (deprecatedOutputFontFamilySetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputFontFamilyDeprecated, notebookCommon_1.NotebookSetting.outputFontFamily);
                outputFontFamily = deprecatedOutputFontFamilySetting;
            }
            else {
                outputFontFamily = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontFamily);
            }
            let outputScrolling;
            const deprecatedOutputScrollingSetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputScrollingDeprecated);
            if (deprecatedOutputScrollingSetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputScrollingDeprecated, notebookCommon_1.NotebookSetting.outputScrolling);
                outputScrolling = deprecatedOutputScrollingSetting;
            }
            else {
                outputScrolling = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputScrolling);
            }
            const outputLineHeight = this._computeOutputLineHeight(outputLineHeightSettingValue, outputFontSize);
            const outputWordWrap = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputWordWrap);
            const outputLineLimit = this.configurationService.getValue(notebookCommon_1.NotebookSetting.textOutputLineLimit) ?? 30;
            const linkifyFilePaths = this.configurationService.getValue(notebookCommon_1.NotebookSetting.LinkifyOutputFilePaths) ?? true;
            this._layoutConfiguration = {
                ...(compactView ? compactConfigConstants : defaultConfigConstants),
                cellTopMargin: 6,
                cellBottomMargin: 6,
                cellRightMargin: 16,
                cellStatusBarHeight: 22,
                cellOutputPadding: 8,
                markdownPreviewPadding: 8,
                // bottomToolbarHeight: bottomToolbarHeight,
                // bottomToolbarGap: bottomToolbarGap,
                editorToolbarHeight: 0,
                editorTopPadding: EDITOR_TOP_PADDING,
                editorBottomPadding: 4,
                editorBottomPaddingWithoutStatusBar: 12,
                collapsedIndicatorHeight: 28,
                showCellStatusBar,
                globalToolbar,
                stickyScrollEnabled,
                stickyScrollMode,
                consolidatedOutputButton,
                consolidatedRunButton,
                dragAndDropEnabled,
                cellToolbarLocation,
                cellToolbarInteraction,
                compactView,
                focusIndicator,
                insertToolbarPosition,
                insertToolbarAlignment,
                showFoldingControls,
                fontSize,
                outputFontSize,
                outputFontFamily,
                outputLineHeight,
                markupFontSize,
                editorOptionsCustomizations,
                focusIndicatorGap: 3,
                interactiveWindowCollapseCodeCells,
                markdownFoldHintHeight: 22,
                outputScrolling: outputScrolling,
                outputWordWrap: outputWordWrap,
                outputLineLimit: outputLineLimit,
                outputLinkifyFilePaths: linkifyFilePaths
            };
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                this._updateConfiguration(e);
            }));
            this._register(EditorTopPaddingChangeEvent(() => {
                const configuration = Object.assign({}, this._layoutConfiguration);
                configuration.editorTopPadding = getEditorTopPadding();
                this._layoutConfiguration = configuration;
                this._onDidChangeOptions.fire({ editorTopPadding: true });
            }));
        }
        updateOptions(isReadonly) {
            if (this.isReadonly !== isReadonly) {
                this.isReadonly = isReadonly;
                this._updateConfiguration({
                    affectsConfiguration(configuration) {
                        return configuration === notebookCommon_1.NotebookSetting.insertToolbarLocation;
                    },
                    source: 7 /* ConfigurationTarget.DEFAULT */,
                    affectedKeys: new Set([notebookCommon_1.NotebookSetting.insertToolbarLocation]),
                    change: { keys: [notebookCommon_1.NotebookSetting.insertToolbarLocation], overrides: [] },
                });
            }
        }
        _migrateDeprecatedSetting(deprecatedKey, key) {
            const deprecatedSetting = this.configurationService.inspect(deprecatedKey);
            if (deprecatedSetting.application !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 1 /* ConfigurationTarget.APPLICATION */);
                this.configurationService.updateValue(key, deprecatedSetting.application.value, 1 /* ConfigurationTarget.APPLICATION */);
            }
            if (deprecatedSetting.user !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 2 /* ConfigurationTarget.USER */);
                this.configurationService.updateValue(key, deprecatedSetting.user.value, 2 /* ConfigurationTarget.USER */);
            }
            if (deprecatedSetting.userLocal !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
                this.configurationService.updateValue(key, deprecatedSetting.userLocal.value, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
            if (deprecatedSetting.userRemote !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 4 /* ConfigurationTarget.USER_REMOTE */);
                this.configurationService.updateValue(key, deprecatedSetting.userRemote.value, 4 /* ConfigurationTarget.USER_REMOTE */);
            }
            if (deprecatedSetting.workspace !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 5 /* ConfigurationTarget.WORKSPACE */);
                this.configurationService.updateValue(key, deprecatedSetting.workspace.value, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            if (deprecatedSetting.workspaceFolder !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
                this.configurationService.updateValue(key, deprecatedSetting.workspaceFolder.value, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            }
        }
        _computeOutputLineHeight(lineHeight, outputFontSize) {
            const minimumLineHeight = 9;
            if (lineHeight === 0) {
                // use editor line height
                const editorOptions = this.configurationService.getValue('editor');
                const fontInfo = fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value));
                lineHeight = fontInfo.lineHeight;
            }
            else if (lineHeight < minimumLineHeight) {
                // Values too small to be line heights in pixels are in ems.
                let fontSize = outputFontSize;
                if (fontSize === 0) {
                    fontSize = this.configurationService.getValue('editor.fontSize');
                }
                lineHeight = lineHeight * fontSize;
            }
            // Enforce integer, minimum constraints
            lineHeight = Math.round(lineHeight);
            if (lineHeight < minimumLineHeight) {
                lineHeight = minimumLineHeight;
            }
            return lineHeight;
        }
        _updateConfiguration(e) {
            const cellStatusBarVisibility = e.affectsConfiguration(notebookCommon_1.NotebookSetting.showCellStatusBar);
            const cellToolbarLocation = e.affectsConfiguration(notebookCommon_1.NotebookSetting.cellToolbarLocation);
            const cellToolbarInteraction = e.affectsConfiguration(notebookCommon_1.NotebookSetting.cellToolbarVisibility);
            const compactView = e.affectsConfiguration(notebookCommon_1.NotebookSetting.compactView);
            const focusIndicator = e.affectsConfiguration(notebookCommon_1.NotebookSetting.focusIndicator);
            const insertToolbarPosition = e.affectsConfiguration(notebookCommon_1.NotebookSetting.insertToolbarLocation);
            const insertToolbarAlignment = e.affectsConfiguration(notebookCommon_1.NotebookSetting.experimentalInsertToolbarAlignment);
            const globalToolbar = e.affectsConfiguration(notebookCommon_1.NotebookSetting.globalToolbar);
            const stickyScrollEnabled = e.affectsConfiguration(notebookCommon_1.NotebookSetting.stickyScrollEnabled);
            const stickyScrollMode = e.affectsConfiguration(notebookCommon_1.NotebookSetting.stickyScrollMode);
            const consolidatedOutputButton = e.affectsConfiguration(notebookCommon_1.NotebookSetting.consolidatedOutputButton);
            const consolidatedRunButton = e.affectsConfiguration(notebookCommon_1.NotebookSetting.consolidatedRunButton);
            const showFoldingControls = e.affectsConfiguration(notebookCommon_1.NotebookSetting.showFoldingControls);
            const dragAndDropEnabled = e.affectsConfiguration(notebookCommon_1.NotebookSetting.dragAndDropEnabled);
            const fontSize = e.affectsConfiguration('editor.fontSize');
            const outputFontSize = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputFontSize);
            const markupFontSize = e.affectsConfiguration(notebookCommon_1.NotebookSetting.markupFontSize);
            const fontFamily = e.affectsConfiguration('editor.fontFamily');
            const outputFontFamily = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputFontFamily);
            const editorOptionsCustomizations = e.affectsConfiguration(notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations);
            const interactiveWindowCollapseCodeCells = e.affectsConfiguration(notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells);
            const outputLineHeight = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputLineHeight);
            const outputScrolling = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputScrolling);
            const outputWordWrap = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputWordWrap);
            const outputLinkifyFilePaths = e.affectsConfiguration(notebookCommon_1.NotebookSetting.LinkifyOutputFilePaths);
            if (!cellStatusBarVisibility
                && !cellToolbarLocation
                && !cellToolbarInteraction
                && !compactView
                && !focusIndicator
                && !insertToolbarPosition
                && !insertToolbarAlignment
                && !globalToolbar
                && !stickyScrollEnabled
                && !stickyScrollMode
                && !consolidatedOutputButton
                && !consolidatedRunButton
                && !showFoldingControls
                && !dragAndDropEnabled
                && !fontSize
                && !outputFontSize
                && !markupFontSize
                && !fontFamily
                && !outputFontFamily
                && !editorOptionsCustomizations
                && !interactiveWindowCollapseCodeCells
                && !outputLineHeight
                && !outputScrolling
                && !outputWordWrap
                && !outputLinkifyFilePaths) {
                return;
            }
            let configuration = Object.assign({}, this._layoutConfiguration);
            if (cellStatusBarVisibility) {
                configuration.showCellStatusBar = this.configurationService.getValue(notebookCommon_1.NotebookSetting.showCellStatusBar);
            }
            if (cellToolbarLocation) {
                configuration.cellToolbarLocation = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarLocation) ?? { 'default': 'right' };
            }
            if (cellToolbarInteraction && !this.overrides?.cellToolbarInteraction) {
                configuration.cellToolbarInteraction = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarVisibility);
            }
            if (focusIndicator) {
                configuration.focusIndicator = this._computeFocusIndicatorOption();
            }
            if (compactView) {
                const compactViewValue = this.configurationService.getValue(notebookCommon_1.NotebookSetting.compactView) ?? true;
                configuration = Object.assign(configuration, {
                    ...(compactViewValue ? compactConfigConstants : defaultConfigConstants),
                });
                configuration.compactView = compactViewValue;
            }
            if (insertToolbarAlignment) {
                configuration.insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
            }
            if (insertToolbarPosition) {
                configuration.insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
            }
            if (globalToolbar && this.overrides?.globalToolbar === undefined) {
                configuration.globalToolbar = this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbar) ?? true;
            }
            if (stickyScrollEnabled && this.overrides?.stickyScrollEnabled === undefined) {
                configuration.stickyScrollEnabled = this.configurationService.getValue(notebookCommon_1.NotebookSetting.stickyScrollEnabled) ?? false;
            }
            if (stickyScrollMode) {
                configuration.stickyScrollMode = this.configurationService.getValue(notebookCommon_1.NotebookSetting.stickyScrollMode) ?? 'flat';
            }
            if (consolidatedOutputButton) {
                configuration.consolidatedOutputButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedOutputButton) ?? true;
            }
            if (consolidatedRunButton) {
                configuration.consolidatedRunButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedRunButton) ?? true;
            }
            if (showFoldingControls) {
                configuration.showFoldingControls = this._computeShowFoldingControlsOption();
            }
            if (dragAndDropEnabled) {
                configuration.dragAndDropEnabled = this.configurationService.getValue(notebookCommon_1.NotebookSetting.dragAndDropEnabled) ?? true;
            }
            if (fontSize) {
                configuration.fontSize = this.configurationService.getValue('editor.fontSize');
            }
            if (outputFontSize || fontSize) {
                configuration.outputFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontSize) || configuration.fontSize;
            }
            if (markupFontSize) {
                configuration.markupFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.markupFontSize);
            }
            if (outputFontFamily) {
                configuration.outputFontFamily = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontFamily);
            }
            if (editorOptionsCustomizations) {
                configuration.editorOptionsCustomizations = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations);
            }
            if (interactiveWindowCollapseCodeCells) {
                configuration.interactiveWindowCollapseCodeCells = this.configurationService.getValue(notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells);
            }
            if (outputLineHeight || fontSize || outputFontSize) {
                const lineHeight = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputLineHeight);
                configuration.outputLineHeight = this._computeOutputLineHeight(lineHeight, configuration.outputFontSize);
            }
            if (outputWordWrap) {
                configuration.outputWordWrap = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputWordWrap);
            }
            if (outputScrolling) {
                configuration.outputScrolling = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputScrolling);
            }
            if (outputLinkifyFilePaths) {
                configuration.outputLinkifyFilePaths = this.configurationService.getValue(notebookCommon_1.NotebookSetting.LinkifyOutputFilePaths);
            }
            this._layoutConfiguration = Object.freeze(configuration);
            // trigger event
            this._onDidChangeOptions.fire({
                cellStatusBarVisibility,
                cellToolbarLocation,
                cellToolbarInteraction,
                compactView,
                focusIndicator,
                insertToolbarPosition,
                insertToolbarAlignment,
                globalToolbar,
                stickyScrollEnabled,
                stickyScrollMode,
                showFoldingControls,
                consolidatedOutputButton,
                consolidatedRunButton,
                dragAndDropEnabled,
                fontSize,
                outputFontSize,
                markupFontSize,
                fontFamily,
                outputFontFamily,
                editorOptionsCustomizations,
                interactiveWindowCollapseCodeCells,
                outputLineHeight,
                outputScrolling,
                outputWordWrap,
                outputLinkifyFilePaths: outputLinkifyFilePaths
            });
        }
        _computeInsertToolbarPositionOption(isReadOnly) {
            return isReadOnly ? 'hidden' : this.configurationService.getValue(notebookCommon_1.NotebookSetting.insertToolbarLocation) ?? 'both';
        }
        _computeInsertToolbarAlignmentOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.experimentalInsertToolbarAlignment) ?? 'center';
        }
        _computeShowFoldingControlsOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.showFoldingControls) ?? 'mouseover';
        }
        _computeFocusIndicatorOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.focusIndicator) ?? 'gutter';
        }
        _computeStickyScrollModeOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.stickyScrollMode) ?? 'flat';
        }
        getCellCollapseDefault() {
            return this._layoutConfiguration.interactiveWindowCollapseCodeCells === 'never' ?
                {
                    codeCell: {
                        inputCollapsed: false
                    }
                } : {
                codeCell: {
                    inputCollapsed: true
                }
            };
        }
        getLayoutConfiguration() {
            return this._layoutConfiguration;
        }
        getDisplayOptions() {
            return this._layoutConfiguration;
        }
        getCellEditorContainerLeftMargin() {
            const { codeCellLeftMargin, cellRunGutter } = this._layoutConfiguration;
            return codeCellLeftMargin + cellRunGutter;
        }
        computeCollapsedMarkdownCellHeight(viewType) {
            const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
            return this._layoutConfiguration.markdownCellTopMargin
                + this._layoutConfiguration.collapsedIndicatorHeight
                + bottomToolbarGap
                + this._layoutConfiguration.markdownCellBottomMargin;
        }
        computeBottomToolbarOffset(totalHeight, viewType) {
            const { bottomToolbarGap, bottomToolbarHeight } = this.computeBottomToolbarDimensions(viewType);
            return totalHeight
                - bottomToolbarGap
                - bottomToolbarHeight / 2;
        }
        computeCodeCellEditorWidth(outerWidth) {
            return outerWidth - (this._layoutConfiguration.codeCellLeftMargin
                + this._layoutConfiguration.cellRunGutter
                + this._layoutConfiguration.cellRightMargin);
        }
        computeMarkdownCellEditorWidth(outerWidth) {
            return outerWidth
                - this._layoutConfiguration.markdownCellGutter
                - this._layoutConfiguration.markdownCellLeftMargin
                - this._layoutConfiguration.cellRightMargin;
        }
        computeStatusBarHeight() {
            return this._layoutConfiguration.cellStatusBarHeight;
        }
        _computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment, cellToolbar) {
            if (insertToolbarAlignment === 'left' || cellToolbar !== 'hidden') {
                return {
                    bottomToolbarGap: 18,
                    bottomToolbarHeight: 18
                };
            }
            if (insertToolbarPosition === 'betweenCells' || insertToolbarPosition === 'both') {
                return compactView ? {
                    bottomToolbarGap: 12,
                    bottomToolbarHeight: 20
                } : {
                    bottomToolbarGap: 20,
                    bottomToolbarHeight: 20
                };
            }
            else {
                return {
                    bottomToolbarGap: 0,
                    bottomToolbarHeight: 0
                };
            }
        }
        computeBottomToolbarDimensions(viewType) {
            const configuration = this._layoutConfiguration;
            const cellToolbarPosition = this.computeCellToolbarLocation(viewType);
            const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(configuration.compactView, configuration.insertToolbarPosition, configuration.insertToolbarAlignment, cellToolbarPosition);
            return {
                bottomToolbarGap,
                bottomToolbarHeight
            };
        }
        computeCellToolbarLocation(viewType) {
            const cellToolbarLocation = this._layoutConfiguration.cellToolbarLocation;
            if (typeof cellToolbarLocation === 'string') {
                if (cellToolbarLocation === 'left' || cellToolbarLocation === 'right' || cellToolbarLocation === 'hidden') {
                    return cellToolbarLocation;
                }
            }
            else {
                if (viewType) {
                    const notebookSpecificSetting = cellToolbarLocation[viewType] ?? cellToolbarLocation['default'];
                    let cellToolbarLocationForCurrentView = 'right';
                    switch (notebookSpecificSetting) {
                        case 'left':
                            cellToolbarLocationForCurrentView = 'left';
                            break;
                        case 'right':
                            cellToolbarLocationForCurrentView = 'right';
                            break;
                        case 'hidden':
                            cellToolbarLocationForCurrentView = 'hidden';
                            break;
                        default:
                            cellToolbarLocationForCurrentView = 'right';
                            break;
                    }
                    return cellToolbarLocationForCurrentView;
                }
            }
            return 'right';
        }
        computeTopInsertToolbarHeight(viewType) {
            if (this._layoutConfiguration.insertToolbarPosition === 'betweenCells' || this._layoutConfiguration.insertToolbarPosition === 'both') {
                return SCROLLABLE_ELEMENT_PADDING_TOP;
            }
            const cellToolbarLocation = this.computeCellToolbarLocation(viewType);
            if (cellToolbarLocation === 'left' || cellToolbarLocation === 'right') {
                return SCROLLABLE_ELEMENT_PADDING_TOP;
            }
            return 0;
        }
        computeEditorPadding(internalMetadata, cellUri) {
            return {
                top: getEditorTopPadding(),
                bottom: this.statusBarIsVisible(internalMetadata, cellUri)
                    ? this._layoutConfiguration.editorBottomPadding
                    : this._layoutConfiguration.editorBottomPaddingWithoutStatusBar
            };
        }
        computeEditorStatusbarHeight(internalMetadata, cellUri) {
            return this.statusBarIsVisible(internalMetadata, cellUri) ? this.computeStatusBarHeight() : 0;
        }
        statusBarIsVisible(internalMetadata, cellUri) {
            const exe = this.notebookExecutionStateService.getCellExecution(cellUri);
            if (this._layoutConfiguration.showCellStatusBar === 'visible') {
                return true;
            }
            else if (this._layoutConfiguration.showCellStatusBar === 'visibleAfterExecute') {
                return typeof internalMetadata.lastRunSuccess === 'boolean' || exe !== undefined;
            }
            else {
                return false;
            }
        }
        computeWebviewOptions() {
            return {
                outputNodePadding: this._layoutConfiguration.cellOutputPadding,
                outputNodeLeftPadding: this._layoutConfiguration.cellOutputPadding,
                previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
                markdownLeftMargin: this._layoutConfiguration.markdownCellGutter + this._layoutConfiguration.markdownCellLeftMargin,
                leftMargin: this._layoutConfiguration.codeCellLeftMargin,
                rightMargin: this._layoutConfiguration.cellRightMargin,
                runGutter: this._layoutConfiguration.cellRunGutter,
                dragAndDropEnabled: this._layoutConfiguration.dragAndDropEnabled,
                fontSize: this._layoutConfiguration.fontSize,
                outputFontSize: this._layoutConfiguration.outputFontSize,
                outputFontFamily: this._layoutConfiguration.outputFontFamily,
                markupFontSize: this._layoutConfiguration.markupFontSize,
                outputLineHeight: this._layoutConfiguration.outputLineHeight,
                outputScrolling: this._layoutConfiguration.outputScrolling,
                outputWordWrap: this._layoutConfiguration.outputWordWrap,
                outputLineLimit: this._layoutConfiguration.outputLineLimit,
                outputLinkifyFilePaths: this._layoutConfiguration.outputLinkifyFilePaths,
            };
        }
        computeDiffWebviewOptions() {
            return {
                outputNodePadding: this._layoutConfiguration.cellOutputPadding,
                outputNodeLeftPadding: 0,
                previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
                markdownLeftMargin: 0,
                leftMargin: 32,
                rightMargin: 0,
                runGutter: 0,
                dragAndDropEnabled: false,
                fontSize: this._layoutConfiguration.fontSize,
                outputFontSize: this._layoutConfiguration.outputFontSize,
                outputFontFamily: this._layoutConfiguration.outputFontFamily,
                markupFontSize: this._layoutConfiguration.markupFontSize,
                outputLineHeight: this._layoutConfiguration.outputLineHeight,
                outputScrolling: this._layoutConfiguration.outputScrolling,
                outputWordWrap: this._layoutConfiguration.outputWordWrap,
                outputLineLimit: this._layoutConfiguration.outputLineLimit,
                outputLinkifyFilePaths: false
            };
        }
        computeIndicatorPosition(totalHeight, foldHintHeight, viewType) {
            const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
            return {
                bottomIndicatorTop: totalHeight - bottomToolbarGap - this._layoutConfiguration.cellBottomMargin - foldHintHeight,
                verticalIndicatorHeight: totalHeight - bottomToolbarGap - foldHintHeight
            };
        }
    }
    exports.NotebookOptions = NotebookOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPcHRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7SUFFMUMsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO0lBRTFELE1BQU0sMkJBQTJCLEdBQUcsNkJBQTZCLENBQUMsS0FBSyxDQUFDO0lBRXhFLFNBQWdCLHNCQUFzQixDQUFDLEdBQVc7UUFDakQsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLDZCQUE2QixDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFIRCx3REFHQztJQUVELFNBQWdCLG1CQUFtQjtRQUNsQyxPQUFPLGtCQUFrQixDQUFDO0lBQzNCLENBQUM7SUFGRCxrREFFQztJQUVZLFFBQUEsOEJBQThCLEdBQUcsQ0FBQyxDQUFDO0lBa0ZoRCxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUMsa0JBQWtCLEVBQUUsRUFBRTtRQUN0QixhQUFhLEVBQUUsRUFBRTtRQUNqQixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLHdCQUF3QixFQUFFLENBQUM7UUFDM0Isc0JBQXNCLEVBQUUsQ0FBQztRQUN6QixrQkFBa0IsRUFBRSxFQUFFO1FBQ3RCLHdCQUF3QixFQUFFLENBQUM7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVDLGtCQUFrQixFQUFFLENBQUM7UUFDckIsYUFBYSxFQUFFLEVBQUU7UUFDakIscUJBQXFCLEVBQUUsQ0FBQztR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