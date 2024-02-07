/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/supports", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, strings, languageConfiguration_1, supports_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIndentMetadata = exports.getIndentActionForType = exports.getIndentForEnter = exports.getGoodIndentForLine = exports.getInheritIndentForLine = void 0;
    /**
     * Get nearest preceding line which doesn't match unIndentPattern or contains all whitespace.
     * Result:
     * -1: run into the boundary of embedded languages
     * 0: every line above are invalid
     * else: nearest preceding line of the same language
     */
    function getPrecedingValidLine(model, lineNumber, indentRulesSupport) {
        const languageId = model.tokenization.getLanguageIdAtPosition(lineNumber, 0);
        if (lineNumber > 1) {
            let lastLineNumber;
            let resultLineNumber = -1;
            for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                if (model.tokenization.getLanguageIdAtPosition(lastLineNumber, 0) !== languageId) {
                    return resultLineNumber;
                }
                const text = model.getLineContent(lastLineNumber);
                if (indentRulesSupport.shouldIgnore(text) || /^\s+$/.test(text) || text === '') {
                    resultLineNumber = lastLineNumber;
                    continue;
                }
                return lastLineNumber;
            }
        }
        return -1;
    }
    /**
     * Get inherited indentation from above lines.
     * 1. Find the nearest preceding line which doesn't match unIndentedLinePattern.
     * 2. If this line matches indentNextLinePattern or increaseIndentPattern, it means that the indent level of `lineNumber` should be 1 greater than this line.
     * 3. If this line doesn't match any indent rules
     *   a. check whether the line above it matches indentNextLinePattern
     *   b. If not, the indent level of this line is the result
     *   c. If so, it means the indent of this line is *temporary*, go upward utill we find a line whose indent is not temporary (the same workflow a -> b -> c).
     * 4. Otherwise, we fail to get an inherited indent from aboves. Return null and we should not touch the indent of `lineNumber`
     *
     * This function only return the inherited indent based on above lines, it doesn't check whether current line should decrease or not.
     */
    function getInheritIndentForLine(autoIndent, model, lineNumber, honorIntentialIndent = true, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.tokenization.getLanguageId()).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        if (lineNumber <= 1) {
            return {
                indentation: '',
                action: null
            };
        }
        // Use no indent if this is the first non-blank line
        for (let priorLineNumber = lineNumber - 1; priorLineNumber > 0; priorLineNumber--) {
            if (model.getLineContent(priorLineNumber) !== '') {
                break;
            }
            if (priorLineNumber === 1) {
                return {
                    indentation: '',
                    action: null
                };
            }
        }
        const precedingUnIgnoredLine = getPrecedingValidLine(model, lineNumber, indentRulesSupport);
        if (precedingUnIgnoredLine < 0) {
            return null;
        }
        else if (precedingUnIgnoredLine < 1) {
            return {
                indentation: '',
                action: null
            };
        }
        const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
        if (indentRulesSupport.shouldIncrease(precedingUnIgnoredLineContent) || indentRulesSupport.shouldIndentNextLine(precedingUnIgnoredLineContent)) {
            return {
                indentation: strings.getLeadingWhitespace(precedingUnIgnoredLineContent),
                action: languageConfiguration_1.IndentAction.Indent,
                line: precedingUnIgnoredLine
            };
        }
        else if (indentRulesSupport.shouldDecrease(precedingUnIgnoredLineContent)) {
            return {
                indentation: strings.getLeadingWhitespace(precedingUnIgnoredLineContent),
                action: null,
                line: precedingUnIgnoredLine
            };
        }
        else {
            // precedingUnIgnoredLine can not be ignored.
            // it doesn't increase indent of following lines
            // it doesn't increase just next line
            // so current line is not affect by precedingUnIgnoredLine
            // and then we should get a correct inheritted indentation from above lines
            if (precedingUnIgnoredLine === 1) {
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                    action: null,
                    line: precedingUnIgnoredLine
                };
            }
            const previousLine = precedingUnIgnoredLine - 1;
            const previousLineIndentMetadata = indentRulesSupport.getIndentMetadata(model.getLineContent(previousLine));
            if (!(previousLineIndentMetadata & (1 /* IndentConsts.INCREASE_MASK */ | 2 /* IndentConsts.DECREASE_MASK */)) &&
                (previousLineIndentMetadata & 4 /* IndentConsts.INDENT_NEXTLINE_MASK */)) {
                let stopLine = 0;
                for (let i = previousLine - 1; i > 0; i--) {
                    if (indentRulesSupport.shouldIndentNextLine(model.getLineContent(i))) {
                        continue;
                    }
                    stopLine = i;
                    break;
                }
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                    action: null,
                    line: stopLine + 1
                };
            }
            if (honorIntentialIndent) {
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                    action: null,
                    line: precedingUnIgnoredLine
                };
            }
            else {
                // search from precedingUnIgnoredLine until we find one whose indent is not temporary
                for (let i = precedingUnIgnoredLine; i > 0; i--) {
                    const lineContent = model.getLineContent(i);
                    if (indentRulesSupport.shouldIncrease(lineContent)) {
                        return {
                            indentation: strings.getLeadingWhitespace(lineContent),
                            action: languageConfiguration_1.IndentAction.Indent,
                            line: i
                        };
                    }
                    else if (indentRulesSupport.shouldIndentNextLine(lineContent)) {
                        let stopLine = 0;
                        for (let j = i - 1; j > 0; j--) {
                            if (indentRulesSupport.shouldIndentNextLine(model.getLineContent(i))) {
                                continue;
                            }
                            stopLine = j;
                            break;
                        }
                        return {
                            indentation: strings.getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                            action: null,
                            line: stopLine + 1
                        };
                    }
                    else if (indentRulesSupport.shouldDecrease(lineContent)) {
                        return {
                            indentation: strings.getLeadingWhitespace(lineContent),
                            action: null,
                            line: i
                        };
                    }
                }
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(1)),
                    action: null,
                    line: 1
                };
            }
        }
    }
    exports.getInheritIndentForLine = getInheritIndentForLine;
    function getGoodIndentForLine(autoIndent, virtualModel, languageId, lineNumber, indentConverter, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        const richEditSupport = languageConfigurationService.getLanguageConfiguration(languageId);
        if (!richEditSupport) {
            return null;
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        const indent = getInheritIndentForLine(autoIndent, virtualModel, lineNumber, undefined, languageConfigurationService);
        const lineContent = virtualModel.getLineContent(lineNumber);
        if (indent) {
            const inheritLine = indent.line;
            if (inheritLine !== undefined) {
                // Apply enter action as long as there are only whitespace lines between inherited line and this line.
                let shouldApplyEnterRules = true;
                for (let inBetweenLine = inheritLine; inBetweenLine < lineNumber - 1; inBetweenLine++) {
                    if (!/^\s*$/.test(virtualModel.getLineContent(inBetweenLine))) {
                        shouldApplyEnterRules = false;
                        break;
                    }
                }
                if (shouldApplyEnterRules) {
                    const enterResult = richEditSupport.onEnter(autoIndent, '', virtualModel.getLineContent(inheritLine), '');
                    if (enterResult) {
                        let indentation = strings.getLeadingWhitespace(virtualModel.getLineContent(inheritLine));
                        if (enterResult.removeText) {
                            indentation = indentation.substring(0, indentation.length - enterResult.removeText);
                        }
                        if ((enterResult.indentAction === languageConfiguration_1.IndentAction.Indent) ||
                            (enterResult.indentAction === languageConfiguration_1.IndentAction.IndentOutdent)) {
                            indentation = indentConverter.shiftIndent(indentation);
                        }
                        else if (enterResult.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                            indentation = indentConverter.unshiftIndent(indentation);
                        }
                        if (indentRulesSupport.shouldDecrease(lineContent)) {
                            indentation = indentConverter.unshiftIndent(indentation);
                        }
                        if (enterResult.appendText) {
                            indentation += enterResult.appendText;
                        }
                        return strings.getLeadingWhitespace(indentation);
                    }
                }
            }
            if (indentRulesSupport.shouldDecrease(lineContent)) {
                if (indent.action === languageConfiguration_1.IndentAction.Indent) {
                    return indent.indentation;
                }
                else {
                    return indentConverter.unshiftIndent(indent.indentation);
                }
            }
            else {
                if (indent.action === languageConfiguration_1.IndentAction.Indent) {
                    return indentConverter.shiftIndent(indent.indentation);
                }
                else {
                    return indent.indentation;
                }
            }
        }
        return null;
    }
    exports.getGoodIndentForLine = getGoodIndentForLine;
    function getIndentForEnter(autoIndent, model, range, indentConverter, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        model.tokenization.forceTokenization(range.startLineNumber);
        const lineTokens = model.tokenization.getLineTokens(range.startLineNumber);
        const scopedLineTokens = (0, supports_1.createScopedLineTokens)(lineTokens, range.startColumn - 1);
        const scopedLineText = scopedLineTokens.getLineContent();
        let embeddedLanguage = false;
        let beforeEnterText;
        if (scopedLineTokens.firstCharOffset > 0 && lineTokens.getLanguageId(0) !== scopedLineTokens.languageId) {
            // we are in the embeded language content
            embeddedLanguage = true; // if embeddedLanguage is true, then we don't touch the indentation of current line
            beforeEnterText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            beforeEnterText = lineTokens.getLineContent().substring(0, range.startColumn - 1);
        }
        let afterEnterText;
        if (range.isEmpty()) {
            afterEnterText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.endLineNumber, range.endColumn);
            afterEnterText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        const beforeEnterResult = beforeEnterText;
        const beforeEnterIndent = strings.getLeadingWhitespace(beforeEnterText);
        const virtualModel = {
            tokenization: {
                getLineTokens: (lineNumber) => {
                    return model.tokenization.getLineTokens(lineNumber);
                },
                getLanguageId: () => {
                    return model.getLanguageId();
                },
                getLanguageIdAtPosition: (lineNumber, column) => {
                    return model.getLanguageIdAtPosition(lineNumber, column);
                },
            },
            getLineContent: (lineNumber) => {
                if (lineNumber === range.startLineNumber) {
                    return beforeEnterResult;
                }
                else {
                    return model.getLineContent(lineNumber);
                }
            }
        };
        const currentLineIndent = strings.getLeadingWhitespace(lineTokens.getLineContent());
        const afterEnterAction = getInheritIndentForLine(autoIndent, virtualModel, range.startLineNumber + 1, undefined, languageConfigurationService);
        if (!afterEnterAction) {
            const beforeEnter = embeddedLanguage ? currentLineIndent : beforeEnterIndent;
            return {
                beforeEnter: beforeEnter,
                afterEnter: beforeEnter
            };
        }
        let afterEnterIndent = embeddedLanguage ? currentLineIndent : afterEnterAction.indentation;
        if (afterEnterAction.action === languageConfiguration_1.IndentAction.Indent) {
            afterEnterIndent = indentConverter.shiftIndent(afterEnterIndent);
        }
        if (indentRulesSupport.shouldDecrease(afterEnterText)) {
            afterEnterIndent = indentConverter.unshiftIndent(afterEnterIndent);
        }
        return {
            beforeEnter: embeddedLanguage ? currentLineIndent : beforeEnterIndent,
            afterEnter: afterEnterIndent
        };
    }
    exports.getIndentForEnter = getIndentForEnter;
    /**
     * We should always allow intentional indentation. It means, if users change the indentation of `lineNumber` and the content of
     * this line doesn't match decreaseIndentPattern, we should not adjust the indentation.
     */
    function getIndentActionForType(autoIndent, model, range, ch, indentConverter, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        const scopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.startLineNumber, range.startColumn);
        if (scopedLineTokens.firstCharOffset) {
            // this line has mixed languages and indentation rules will not work
            return null;
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        const scopedLineText = scopedLineTokens.getLineContent();
        const beforeTypeText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        // selection support
        let afterTypeText;
        if (range.isEmpty()) {
            afterTypeText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.endLineNumber, range.endColumn);
            afterTypeText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        // If previous content already matches decreaseIndentPattern, it means indentation of this line should already be adjusted
        // Users might change the indentation by purpose and we should honor that instead of readjusting.
        if (!indentRulesSupport.shouldDecrease(beforeTypeText + afterTypeText) && indentRulesSupport.shouldDecrease(beforeTypeText + ch + afterTypeText)) {
            // after typing `ch`, the content matches decreaseIndentPattern, we should adjust the indent to a good manner.
            // 1. Get inherited indent action
            const r = getInheritIndentForLine(autoIndent, model, range.startLineNumber, false, languageConfigurationService);
            if (!r) {
                return null;
            }
            let indentation = r.indentation;
            if (r.action !== languageConfiguration_1.IndentAction.Indent) {
                indentation = indentConverter.unshiftIndent(indentation);
            }
            return indentation;
        }
        return null;
    }
    exports.getIndentActionForType = getIndentActionForType;
    function getIndentMetadata(model, lineNumber, languageConfigurationService) {
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        if (lineNumber < 1 || lineNumber > model.getLineCount()) {
            return null;
        }
        return indentRulesSupport.getIndentMetadata(model.getLineContent(lineNumber));
    }
    exports.getIndentMetadata = getIndentMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b0luZGVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMvYXV0b0luZGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyQmhHOzs7Ozs7T0FNRztJQUNILFNBQVMscUJBQXFCLENBQUMsS0FBb0IsRUFBRSxVQUFrQixFQUFFLGtCQUFzQztRQUM5RyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwQixJQUFJLGNBQXNCLENBQUM7WUFDM0IsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUxQixLQUFLLGNBQWMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLGNBQWMsSUFBSSxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQztnQkFDN0UsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUUsQ0FBQztvQkFDbEYsT0FBTyxnQkFBZ0IsQ0FBQztnQkFDekIsQ0FBQztnQkFDRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQztvQkFDaEYsZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO29CQUNsQyxTQUFTO2dCQUNWLENBQUM7Z0JBRUQsT0FBTyxjQUFjLENBQUM7WUFDdkIsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFP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