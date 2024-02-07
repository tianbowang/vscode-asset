/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/commands/replaceCommand", "vs/editor/common/commands/shiftCommand", "vs/editor/common/commands/surroundSelectionCommand", "vs/editor/common/cursorCommon", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/supports", "vs/editor/common/languages/autoIndent", "vs/editor/common/languages/enterAction"], function (require, exports, errors_1, strings, replaceCommand_1, shiftCommand_1, surroundSelectionCommand_1, cursorCommon_1, wordCharacterClassifier_1, range_1, position_1, languageConfiguration_1, languageConfigurationRegistry_1, supports_1, autoIndent_1, enterAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositionOutcome = exports.TypeWithAutoClosingCommand = exports.TypeOperations = void 0;
    class TypeOperations {
        static indent(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.ShiftCommand(selections[i], {
                    isUnshift: false,
                    tabSize: config.tabSize,
                    indentSize: config.indentSize,
                    insertSpaces: config.insertSpaces,
                    useTabStops: config.useTabStops,
                    autoIndent: config.autoIndent
                }, config.languageConfigurationService);
            }
            return commands;
        }
        static outdent(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.ShiftCommand(selections[i], {
                    isUnshift: true,
                    tabSize: config.tabSize,
                    indentSize: config.indentSize,
                    insertSpaces: config.insertSpaces,
                    useTabStops: config.useTabStops,
                    autoIndent: config.autoIndent
                }, config.languageConfigurationService);
            }
            return commands;
        }
        static shiftIndent(config, indentation, count) {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + count, config.tabSize, config.indentSize, config.insertSpaces);
        }
        static unshiftIndent(config, indentation, count) {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + count, config.tabSize, config.indentSize, config.insertSpaces);
        }
        static _distributedPaste(config, model, selections, text) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], text[i]);
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static _simplePaste(config, model, selections, text, pasteOnNewLine) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const position = selection.getPosition();
                if (pasteOnNewLine && !selection.isEmpty()) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine && text.indexOf('\n') !== text.length - 1) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine) {
                    // Paste entire line at the beginning of line
                    const typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, 1);
                    commands[i] = new replaceCommand_1.ReplaceCommandThatPreservesSelection(typeSelection, text, selection, true);
                }
                else {
                    commands[i] = new replaceCommand_1.ReplaceCommand(selection, text);
                }
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static _distributePasteToCursors(config, selections, text, pasteOnNewLine, multicursorText) {
            if (pasteOnNewLine) {
                return null;
            }
            if (selections.length === 1) {
                return null;
            }
            if (multicursorText && multicursorText.length === selections.length) {
                return multicursorText;
            }
            if (config.multiCursorPaste === 'spread') {
                // Try to spread the pasted text in case the line count matches the cursor count
                // Remove trailing \n if present
                if (text.charCodeAt(text.length - 1) === 10 /* CharCode.LineFeed */) {
                    text = text.substr(0, text.length - 1);
                }
                // Remove trailing \r if present
                if (text.charCodeAt(text.length - 1) === 13 /* CharCode.CarriageReturn */) {
                    text = text.substr(0, text.length - 1);
                }
                const lines = strings.splitLines(text);
                if (lines.length === selections.length) {
                    return lines;
                }
            }
            return null;
        }
        static paste(config, model, selections, text, pasteOnNewLine, multicursorText) {
            const distributedPaste = this._distributePasteToCursors(config, selections, text, pasteOnNewLine, multicursorText);
            if (distributedPaste) {
                selections = selections.sort(range_1.Range.compareRangesUsingStarts);
                return this._distributedPaste(config, model, selections, distributedPaste);
            }
            else {
                return this._simplePaste(config, model, selections, text, pasteOnNewLine);
            }
        }
        static _goodIndentForLine(config, model, lineNumber) {
            let action = null;
            let indentation = '';
            const expectedIndentAction = (0, autoIndent_1.getInheritIndentForLine)(config.autoIndent, model, lineNumber, false, config.languageConfigurationService);
            if (expectedIndentAction) {
                action = expectedIndentAction.action;
                indentation = expectedIndentAction.indentation;
            }
            else if (lineNumber > 1) {
                let lastLineNumber;
                for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                    const lineText = model.getLineContent(lastLineNumber);
                    const nonWhitespaceIdx = strings.lastNonWhitespaceIndex(lineText);
                    if (nonWhitespaceIdx >= 0) {
                        break;
                    }
                }
                if (lastLineNumber < 1) {
                    // No previous line with content found
                    return null;
                }
                const maxColumn = model.getLineMaxColumn(lastLineNumber);
                const expectedEnterAction = (0, enterAction_1.getEnterAction)(config.autoIndent, model, new range_1.Range(lastLineNumber, maxColumn, lastLineNumber, maxColumn), config.languageConfigurationService);
                if (expectedEnterAction) {
                    indentation = expectedEnterAction.indentation + expectedEnterAction.appendText;
                }
            }
            if (action) {
                if (action === languageConfiguration_1.IndentAction.Indent) {
                    indentation = TypeOperations.shiftIndent(config, indentation);
                }
                if (action === languageConfiguration_1.IndentAction.Outdent) {
                    indentation = TypeOperations.unshiftIndent(config, indentation);
                }
                indentation = config.normalizeIndentation(indentation);
            }
            if (!indentation) {
                return null;
            }
            return indentation;
        }
        static _replaceJumpToNextIndent(config, model, selection, insertsAutoWhitespace) {
            let typeText = '';
            const position = selection.getStartPosition();
            if (config.insertSpaces) {
                const visibleColumnFromColumn = config.visibleColumnFromColumn(model, position);
                const indentSize = config.indentSize;
                const spacesCnt = indentSize - (visibleColumnFromColumn % indentSize);
                for (let i = 0; i < spacesCnt; i++) {
                    typeText += ' ';
                }
            }
            else {
                typeText = '\t';
            }
            return new replaceCommand_1.ReplaceCommand(selection, typeText, insertsAutoWhitespace);
        }
        static tab(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (selection.isEmpty()) {
                    const lineText = model.getLineContent(selection.startLineNumber);
                    if (/^\s*$/.test(lineText) && model.tokenization.isCheapToTokenize(selection.startLineNumber)) {
                        let goodIndent = this._goodIndentForLine(config, model, selection.startLineNumber);
                        goodIndent = goodIndent || '\t';
                        const possibleTypeText = config.normalizeIndentation(goodIndent);
                        if (!lineText.startsWith(possibleTypeText)) {
                            commands[i] = new replaceCommand_1.ReplaceCommand(new range_1.Range(selection.startLineNumber, 1, selection.startLineNumber, lineText.length + 1), possibleTypeText, true);
                            continue;
                        }
                    }
                    commands[i] = this._replaceJumpToNextIndent(config, model, selection, true);
                }
                else {
                    if (selection.startLineNumber === selection.endLineNumber) {
                        const lineMaxColumn = model.getLineMaxColumn(selection.startLineNumber);
                        if (selection.startColumn !== 1 || selection.endColumn !== lineMaxColumn) {
                            // This is a single line selection that is not the entire line
                            commands[i] = this._replaceJumpToNextIndent(config, model, selection, false);
                            continue;
                        }
                    }
                    commands[i] = new shiftCommand_1.ShiftCommand(selection, {
                        isUnshift: false,
                        tabSize: config.tabSize,
                        indentSize: config.indentSize,
                        insertSpaces: config.insertSpaces,
                        useTabStops: config.useTabStops,
                        autoIndent: config.autoIndent
                    }, config.languageConfigurationService);
                }
            }
            return commands;
        }
        static compositionType(prevEditOperationType, config, model, selections, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            const commands = selections.map(selection => this._compositionType(model, selection, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta));
            return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* EditOperationType.TypingOther */),
                shouldPushStackElementAfter: false
            });
        }
        static _compositionType(model, selection, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            if (!selection.isEmpty()) {
                // looks like https://github.com/microsoft/vscode/issues/2773
                // where a cursor operation occurred before a canceled composition
                // => ignore composition
                return null;
            }
            const pos = selection.getPosition();
            const startColumn = Math.max(1, pos.column - replacePrevCharCnt);
            const endColumn = Math.min(model.getLineMaxColumn(pos.lineNumber), pos.column + replaceNextCharCnt);
            const range = new range_1.Range(pos.lineNumber, startColumn, pos.lineNumber, endColumn);
            const oldText = model.getValueInRange(range);
            if (oldText === text && positionDelta === 0) {
                // => ignore composition that doesn't do anything
                return null;
            }
            return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, text, 0, positionDelta);
        }
        static _typeCommand(range, text, keepPosition) {
            if (keepPosition) {
                return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, text, true);
            }
            else {
                return new replaceCommand_1.ReplaceCommand(range, text, true);
            }
        }
        static _enter(config, model, keepPosition, range) {
            if (config.autoIndent === 0 /* EditorAutoIndentStrategy.None */) {
                return TypeOperations._typeCommand(range, '\n', keepPosition);
            }
            if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber) || config.autoIndent === 1 /* EditorAutoIndentStrategy.Keep */) {
                const lineText = model.getLineContent(range.startLineNumber);
                const indentation = strings.getLeadingWhitespace(lineText).substring(0, range.startColumn - 1);
                return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
            }
            const r = (0, enterAction_1.getEnterAction)(config.autoIndent, model, range, config.languageConfigurationService);
            if (r) {
                if (r.indentAction === languageConfiguration_1.IndentAction.None) {
                    // Nothing special
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(r.indentation + r.appendText), keepPosition);
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.Indent) {
                    // Indent once
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(r.indentation + r.appendText), keepPosition);
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.IndentOutdent) {
                    // Ultra special
                    const normalIndent = config.normalizeIndentation(r.indentation);
                    const increasedIndent = config.normalizeIndentation(r.indentation + r.appendText);
                    const typeText = '\n' + increasedIndent + '\n' + normalIndent;
                    if (keepPosition) {
                        return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, typeText, true);
                    }
                    else {
                        return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, typeText, -1, increasedIndent.length - normalIndent.length, true);
                    }
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                    const actualIndentation = TypeOperations.unshiftIndent(config, r.indentation);
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(actualIndentation + r.appendText), keepPosition);
                }
            }
            const lineText = model.getLineContent(range.startLineNumber);
            const indentation = strings.getLeadingWhitespace(lineText).substring(0, range.startColumn - 1);
            if (config.autoIndent >= 4 /* EditorAutoIndentStrategy.Full */) {
                const ir = (0, autoIndent_1.getIndentForEnter)(config.autoIndent, model, range, {
                    unshiftIndent: (indent) => {
                        return TypeOperations.unshiftIndent(config, indent);
                    },
                    shiftIndent: (indent) => {
                        return TypeOperations.shiftIndent(config, indent);
                    },
                    normalizeIndentation: (indent) => {
                        return config.normalizeIndentation(indent);
                    }
                }, config.languageConfigurationService);
                if (ir) {
                    let oldEndViewColumn = config.visibleColumnFromColumn(model, range.getEndPosition());
                    const oldEndColumn = range.endColumn;
                    const newLineContent = model.getLineContent(range.endLineNumber);
                    const firstNonWhitespace = strings.firstNonWhitespaceIndex(newLineContent);
                    if (firstNonWhitespace >= 0) {
                        range = range.setEndPosition(range.endLineNumber, Math.max(range.endColumn, firstNonWhitespace + 1));
                    }
                    else {
                        range = range.setEndPosition(range.endLineNumber, model.getLineMaxColumn(range.endLineNumber));
                    }
                    if (keepPosition) {
                        return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, '\n' + config.normalizeIndentation(ir.afterEnter), true);
                    }
                    else {
                        let offset = 0;
                        if (oldEndColumn <= firstNonWhitespace + 1) {
                            if (!config.insertSpaces) {
                                oldEndViewColumn = Math.ceil(oldEndViewColumn / config.indentSize);
                            }
                            offset = Math.min(oldEndViewColumn + 1 - config.normalizeIndentation(ir.afterEnter).length - 1, 0);
                        }
                        return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, '\n' + config.normalizeIndentation(ir.afterEnter), 0, offset, true);
                    }
                }
            }
            return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
        }
        static _isAutoIndentType(config, model, selections) {
            if (config.autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
                return false;
            }
            for (let i = 0, len = selections.length; i < len; i++) {
                if (!model.tokenization.isCheapToTokenize(selections[i].getEndPosition().lineNumber)) {
                    return false;
                }
            }
            return true;
        }
        static _runAutoIndentType(config, model, range, ch) {
            const currentIndentation = (0, languageConfigurationRegistry_1.getIndentationAtPosition)(model, range.startLineNumber, range.startColumn);
            const actualIndentation = (0, autoIndent_1.getIndentActionForType)(config.autoIndent, model, range, ch, {
                shiftIndent: (indentation) => {
                    return TypeOperations.shiftIndent(config, indentation);
                },
                unshiftIndent: (indentation) => {
                    return TypeOperations.unshiftIndent(config, indentation);
                },
            }, config.languageConfigurationService);
            if (actualIndentation === null) {
                return null;
            }
            if (actualIndentation !== config.normalizeIndentation(currentIndentation)) {
                const firstNonWhitespace = model.getLineFirstNonWhitespaceColumn(range.startLineNumber);
                if (firstNonWhitespace === 0) {
                    return TypeOperations._typeCommand(new range_1.Range(range.startLineNumber, 1, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) + ch, false);
                }
                else {
                    return TypeOperations._typeCommand(new range_1.Range(range.startLineNumber, 1, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) +
                        model.getLineContent(range.startLineNumber).substring(firstNonWhitespace - 1, range.startColumn - 1) + ch, false);
                }
            }
            return null;
        }
        static _isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch) {
            if (config.autoClosingOvertype === 'never') {
                return false;
            }
            if (!config.autoClosingPairs.autoClosingPairsCloseSingleChar.has(ch)) {
                return false;
            }
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (!selection.isEmpty()) {
                    return false;
                }
                const position = selection.getPosition();
                const lineText = model.getLineContent(position.lineNumber);
                const afterCharacter = lineText.charAt(position.column - 1);
                if (afterCharacter !== ch) {
                    return false;
                }
                // Do not over-type quotes after a backslash
                const chIsQuote = (0, cursorCommon_1.isQuote)(ch);
                const beforeCharacter = position.column > 2 ? lineText.charCodeAt(position.column - 2) : 0 /* CharCode.Null */;
                if (beforeCharacter === 92 /* CharCode.Backslash */ && chIsQuote) {
                    return false;
                }
                // Must over-type a closing character typed by the editor
                if (config.autoClosingOvertype === 'auto') {
                    let found = false;
                    for (let j = 0, lenJ = autoClosedCharacters.length; j < lenJ; j++) {
                        const autoClosedCharacter = autoClosedCharacters[j];
                        if (position.lineNumber === autoClosedCharacter.startLineNumber && position.column === autoClosedCharacter.startColumn) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        return false;
                    }
                }
            }
            return true;
        }
        static _runAutoClosingOvertype(prevEditOperationType, config, model, selections, ch) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const position = selection.getPosition();
                const typeSelection = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1);
                commands[i] = new replaceCommand_1.ReplaceCommand(typeSelection, ch);
            }
            return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* EditOperationType.TypingOther */),
                shouldPushStackElementAfter: false
            });
        }
        static _isBeforeClosingBrace(config, lineAfter) {
            // If the start of lineAfter can be interpretted as both a starting or ending brace, default to returning false
            const nextChar = lineAfter.charAt(0);
            const potentialStartingBraces = config.autoClosingPairs.autoClosingPairsOpenByStart.get(nextChar) || [];
            const potentialClosingBraces = config.autoClosingPairs.autoClosingPairsCloseByStart.get(nextChar) || [];
            const isBeforeStartingBrace = potentialStartingBraces.some(x => lineAfter.startsWith(x.open));
            const isBeforeClosingBrace = potentialClosingBraces.some(x => lineAfter.startsWith(x.close));
            return !isBeforeStartingBrace && isBeforeClosingBrace;
        }
        /**
         * Determine if typing `ch` at all `positions` in the `model` results in an
         * auto closing open sequence being typed.
         *
         * Auto closing open sequences can consist of multiple characters, which
         * can lead to ambiguities. In such a case, the longest auto-closing open
         * sequence is returned.
         */
        static _findAutoClosingPairOpen(config, model, positions, ch) {
            const candidates = config.autoClosingPairs.autoClosingPairsOpenByEnd.get(ch);
            if (!candidates) {
                return null;
            }
            // Determine which auto-closing pair it is
            let result = null;
            for (const candidate of candidates) {
                if (result === null || candidate.open.length > result.open.length) {
                    let candidateIsMatch = true;
                    for (const position of positions) {
                        const relevantText = model.getValueInRange(new range_1.Range(position.lineNumber, position.column - candidate.open.length + 1, position.lineNumber, position.column));
                        if (relevantText + ch !== candidate.open) {
                            candidateIsMatch = false;
                            break;
                        }
                    }
                    if (candidateIsMatch) {
                        result = candidate;
                    }
                }
            }
            return result;
        }
        /**
         * Find another auto-closing pair that is contained by the one passed in.
         *
         * e.g. when having [(,)] and [(*,*)] as auto-closing pairs
         * this method will find [(,)] as a containment pair for [(*,*)]
         */
        static _findContainedAutoClosingPair(config, pair) {
            if (pair.open.length <= 1) {
                return null;
            }
            const lastChar = pair.close.charAt(pair.close.length - 1);
            // get candidates with the same last character as close
            const candidates = config.autoClosingPairs.autoClosingPairsCloseByEnd.get(lastChar) || [];
            let result = null;
            for (const candidate of candidates) {
                if (candidate.open !== pair.open && pair.open.includes(candidate.open) && pair.close.endsWith(candidate.close)) {
                    if (!result || candidate.open.length > result.open.length) {
                        result = candidate;
                    }
                }
            }
            return result;
        }
        static _getAutoClosingPairClose(config, model, selections, ch, chIsAlreadyTyped) {
            for (const selection of selections) {
                if (!selection.isEmpty()) {
                    return null;
                }
            }
            // This method is called both when typing (regularly) and when composition ends
            // This means that we need to work with a text buffer where sometimes `ch` is not
            // there (it is being typed right now) or with a text buffer where `ch` has already been typed
            //
            // In order to avoid adding checks for `chIsAlreadyTyped` in all places, we will work
            // with two conceptual positions, the position before `ch` and the position after `ch`
            //
            const positions = selections.map((s) => {
                const position = s.getPosition();
                if (chIsAlreadyTyped) {
                    return { lineNumber: position.lineNumber, beforeColumn: position.column - ch.length, afterColumn: position.column };
                }
                else {
                    return { lineNumber: position.lineNumber, beforeColumn: position.column, afterColumn: position.column };
                }
            });
            // Find the longest auto-closing open pair in case of multiple ending in `ch`
            // e.g. when having [f","] and [","], it picks [f","] if the character before is f
            const pair = this._findAutoClosingPairOpen(config, model, positions.map(p => new position_1.Position(p.lineNumber, p.beforeColumn)), ch);
            if (!pair) {
                return null;
            }
            let autoCloseConfig;
            let shouldAutoCloseBefore;
            const chIsQuote = (0, cursorCommon_1.isQuote)(ch);
            if (chIsQuote) {
                autoCloseConfig = config.autoClosingQuotes;
                shouldAutoCloseBefore = config.shouldAutoCloseBefore.quote;
            }
            else {
                const pairIsForComments = config.blockCommentStartToken ? pair.open.includes(config.blockCommentStartToken) : false;
                if (pairIsForComments) {
                    autoCloseConfig = config.autoClosingComments;
                    shouldAutoCloseBefore = config.shouldAutoCloseBefore.comment;
                }
                else {
                    autoCloseConfig = config.autoClosingBrackets;
                    shouldAutoCloseBefore = config.shouldAutoCloseBefore.bracket;
                }
            }
            if (autoCloseConfig === 'never') {
                return null;
            }
            // Sometimes, it is possible to have two auto-closing pairs that have a containment relationship
            // e.g. when having [(,)] and [(*,*)]
            // - when typing (, the resulting state is (|)
            // - when typing *, the desired resulting state is (*|*), not (*|*))
            const containedPair = this._findContainedAutoClosingPair(config, pair);
            const containedPairClose = containedPair ? containedPair.close : '';
            let isContainedPairPresent = true;
            for (const position of positions) {
                const { lineNumber, beforeColumn, afterColumn } = position;
                const lineText = model.getLineContent(lineNumber);
                const lineBefore = lineText.substring(0, beforeColumn - 1);
                const lineAfter = lineText.substring(afterColumn - 1);
                if (!lineAfter.startsWith(containedPairClose)) {
                    isContainedPairPresent = false;
                }
                // Only consider auto closing the pair if an allowed character follows or if another autoclosed pair closing brace follows
                if (lineAfter.length > 0) {
                    const characterAfter = lineAfter.charAt(0);
                    const isBeforeCloseBrace = TypeOperations._isBeforeClosingBrace(config, lineAfter);
                    if (!isBeforeCloseBrace && !shouldAutoCloseBefore(characterAfter)) {
                        return null;
                    }
                }
                // Do not auto-close ' or " after a word character
                if (pair.open.length === 1 && (ch === '\'' || ch === '"') && autoCloseConfig !== 'always') {
                    const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(config.wordSeparators);
                    if (lineBefore.length > 0) {
                        const characterBefore = lineBefore.charCodeAt(lineBefore.length - 1);
                        if (wordSeparators.get(characterBefore) === 0 /* WordCharacterClass.Regular */) {
                            return null;
                        }
                    }
                }
                if (!model.tokenization.isCheapToTokenize(lineNumber)) {
                    // Do not force tokenization
                    return null;
                }
                model.tokenization.forceTokenization(lineNumber);
                const lineTokens = model.tokenization.getLineTokens(lineNumber);
                const scopedLineTokens = (0, supports_1.createScopedLineTokens)(lineTokens, beforeColumn - 1);
                if (!pair.shouldAutoClose(scopedLineTokens, beforeColumn - scopedLineTokens.firstCharOffset)) {
                    return null;
                }
                // Typing for example a quote could either start a new string, in which case auto-closing is desirable
                // or it could end a previously started string, in which case auto-closing is not desirable
                //
                // In certain cases, it is really not possible to look at the previous token to determine
                // what would happen. That's why we do something really unusual, we pretend to type a different
                // character and ask the tokenizer what the outcome of doing that is: after typing a neutral
                // character, are we in a string (i.e. the quote would most likely end a string) or not?
                //
                const neutralCharacter = pair.findNeutralCharacter();
                if (neutralCharacter) {
                    const tokenType = model.tokenization.getTokenTypeIfInsertingCharacter(lineNumber, beforeColumn, neutralCharacter);
                    if (!pair.isOK(tokenType)) {
                        return null;
                    }
                }
            }
            if (isContainedPairPresent) {
                return pair.close.substring(0, pair.close.length - containedPairClose.length);
            }
            else {
                return pair.close;
            }
        }
        static _runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch, chIsAlreadyTyped, autoClosingPairClose) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                commands[i] = new TypeWithAutoClosingCommand(selection, ch, !chIsAlreadyTyped, autoClosingPairClose);
            }
            return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: false
            });
        }
        static _shouldSurroundChar(config, ch) {
            if ((0, cursorCommon_1.isQuote)(ch)) {
                return (config.autoSurround === 'quotes' || config.autoSurround === 'languageDefined');
            }
            else {
                // Character is a bracket
                return (config.autoSurround === 'brackets' || config.autoSurround === 'languageDefined');
            }
        }
        static _isSurroundSelectionType(config, model, selections, ch) {
            if (!TypeOperations._shouldSurroundChar(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
                return false;
            }
            const isTypingAQuoteCharacter = (0, cursorCommon_1.isQuote)(ch);
            for (const selection of selections) {
                if (selection.isEmpty()) {
                    return false;
                }
                let selectionContainsOnlyWhitespace = true;
                for (let lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
                    const lineText = model.getLineContent(lineNumber);
                    const startIndex = (lineNumber === selection.startLineNumber ? selection.startColumn - 1 : 0);
                    const endIndex = (lineNumber === selection.endLineNumber ? selection.endColumn - 1 : lineText.length);
                    const selectedText = lineText.substring(startIndex, endIndex);
                    if (/[^ \t]/.test(selectedText)) {
                        // this selected text contains something other than whitespace
                        selectionContainsOnlyWhitespace = false;
                        break;
                    }
                }
                if (selectionContainsOnlyWhitespace) {
                    return false;
                }
                if (isTypingAQuoteCharacter && selection.startLineNumber === selection.endLineNumber && selection.startColumn + 1 === selection.endColumn) {
                    const selectionText = model.getValueInRange(selection);
                    if ((0, cursorCommon_1.isQuote)(selectionText)) {
                        // Typing a quote character on top of another quote character
                        // => disable surround selection type
                        return false;
                    }
                }
            }
            return true;
        }
        static _runSurroundSelectionType(prevEditOperationType, config, model, selections, ch) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const closeCharacter = config.surroundingPairs[ch];
                commands[i] = new surroundSelectionCommand_1.SurroundSelectionCommand(selection, ch, closeCharacter);
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static _isTypeInterceptorElectricChar(config, model, selections) {
            if (selections.length === 1 && model.tokenization.isCheapToTokenize(selections[0].getEndPosition().lineNumber)) {
                return true;
            }
            return false;
        }
        static _typeInterceptorElectricChar(prevEditOperationType, config, model, selection, ch) {
            if (!config.electricChars.hasOwnProperty(ch) || !selection.isEmpty()) {
                return null;
            }
            const position = selection.getPosition();
            model.tokenization.forceTokenization(position.lineNumber);
            const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
            let electricAction;
            try {
                electricAction = config.onElectricCharacter(ch, lineTokens, position.column);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                return null;
            }
            if (!electricAction) {
                return null;
            }
            if (electricAction.matchOpenBracket) {
                const endColumn = (lineTokens.getLineContent() + ch).lastIndexOf(electricAction.matchOpenBracket) + 1;
                const match = model.bracketPairs.findMatchingBracketUp(electricAction.matchOpenBracket, {
                    lineNumber: position.lineNumber,
                    column: endColumn
                }, 500 /* give at most 500ms to compute */);
                if (match) {
                    if (match.startLineNumber === position.lineNumber) {
                        // matched something on the same line => no change in indentation
                        return null;
                    }
                    const matchLine = model.getLineContent(match.startLineNumber);
                    const matchLineIndentation = strings.getLeadingWhitespace(matchLine);
                    const newIndentation = config.normalizeIndentation(matchLineIndentation);
                    const lineText = model.getLineContent(position.lineNumber);
                    const lineFirstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(position.lineNumber) || position.column;
                    const prefix = lineText.substring(lineFirstNonBlankColumn - 1, position.column - 1);
                    const typeText = newIndentation + prefix + ch;
                    const typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, position.column);
                    const command = new replaceCommand_1.ReplaceCommand(typeSelection, typeText);
                    return new cursorCommon_1.EditOperationResult(getTypingOperation(typeText, prevEditOperationType), [command], {
                        shouldPushStackElementBefore: false,
                        shouldPushStackElementAfter: true
                    });
                }
            }
            return null;
        }
        /**
         * This is very similar with typing, but the character is already in the text buffer!
         */
        static compositionEndWithInterceptors(prevEditOperationType, config, model, compositions, selections, autoClosedCharacters) {
            if (!compositions) {
                // could not deduce what the composition did
                return null;
            }
            let insertedText = null;
            for (const composition of compositions) {
                if (insertedText === null) {
                    insertedText = composition.insertedText;
                }
                else if (insertedText !== composition.insertedText) {
                    // not all selections agree on what was typed
                    return null;
                }
            }
            if (!insertedText || insertedText.length !== 1) {
                // we're only interested in the case where a single character was inserted
                return null;
            }
            const ch = insertedText;
            let hasDeletion = false;
            for (const composition of compositions) {
                if (composition.deletedText.length !== 0) {
                    hasDeletion = true;
                    break;
                }
            }
            if (hasDeletion) {
                // Check if this could have been a surround selection
                if (!TypeOperations._shouldSurroundChar(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
                    return null;
                }
                const isTypingAQuoteCharacter = (0, cursorCommon_1.isQuote)(ch);
                for (const composition of compositions) {
                    if (composition.deletedSelectionStart !== 0 || composition.deletedSelectionEnd !== composition.deletedText.length) {
                        // more text was deleted than was selected, so this could not have been a surround selection
                        return null;
                    }
                    if (/^[ \t]+$/.test(composition.deletedText)) {
                        // deleted text was only whitespace
                        return null;
                    }
                    if (isTypingAQuoteCharacter && (0, cursorCommon_1.isQuote)(composition.deletedText)) {
                        // deleted text was a quote
                        return null;
                    }
                }
                const positions = [];
                for (const selection of selections) {
                    if (!selection.isEmpty()) {
                        return null;
                    }
                    positions.push(selection.getPosition());
                }
                if (positions.length !== compositions.length) {
                    return null;
                }
                const commands = [];
                for (let i = 0, len = positions.length; i < len; i++) {
                    commands.push(new surroundSelectionCommand_1.CompositionSurroundSelectionCommand(positions[i], compositions[i].deletedText, config.surroundingPairs[ch]));
                }
                return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false
                });
            }
            if (this._isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch)) {
                // Unfortunately, the close character is at this point "doubled", so we need to delete it...
                const commands = selections.map(s => new replaceCommand_1.ReplaceCommand(new range_1.Range(s.positionLineNumber, s.positionColumn, s.positionLineNumber, s.positionColumn + 1), '', false));
                return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false
                });
            }
            const autoClosingPairClose = this._getAutoClosingPairClose(config, model, selections, ch, true);
            if (autoClosingPairClose !== null) {
                return this._runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch, true, autoClosingPairClose);
            }
            return null;
        }
        static typeWithInterceptors(isDoingComposition, prevEditOperationType, config, model, selections, autoClosedCharacters, ch) {
            if (!isDoingComposition && ch === '\n') {
                const commands = [];
                for (let i = 0, len = selections.length; i < len; i++) {
                    commands[i] = TypeOperations._enter(config, model, false, selections[i]);
                }
                return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false,
                });
            }
            if (!isDoingComposition && this._isAutoIndentType(config, model, selections)) {
                const commands = [];
                let autoIndentFails = false;
                for (let i = 0, len = selections.length; i < len; i++) {
                    commands[i] = this._runAutoIndentType(config, model, selections[i], ch);
                    if (!commands[i]) {
                        autoIndentFails = true;
                        break;
                    }
                }
                if (!autoIndentFails) {
                    return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                        shouldPushStackElementBefore: true,
                        shouldPushStackElementAfter: false,
                    });
                }
            }
            if (this._isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch)) {
                return this._runAutoClosingOvertype(prevEditOperationType, config, model, selections, ch);
            }
            if (!isDoingComposition) {
                const autoClosingPairClose = this._getAutoClosingPairClose(config, model, selections, ch, false);
                if (autoClosingPairClose) {
                    return this._runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch, false, autoClosingPairClose);
                }
            }
            if (!isDoingComposition && this._isSurroundSelectionType(config, model, selections, ch)) {
                return this._runSurroundSelectionType(prevEditOperationType, config, model, selections, ch);
            }
            // Electric characters make sense only when dealing with a single cursor,
            // as multiple cursors typing brackets for example would interfer with bracket matching
            if (!isDoingComposition && this._isTypeInterceptorElectricChar(config, model, selections)) {
                const r = this._typeInterceptorElectricChar(prevEditOperationType, config, model, selections[0], ch);
                if (r) {
                    return r;
                }
            }
            // A simple character type
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], ch);
            }
            const opType = getTypingOperation(ch, prevEditOperationType);
            return new cursorCommon_1.EditOperationResult(opType, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
                shouldPushStackElementAfter: false
            });
        }
        static typeWithoutInterceptors(prevEditOperationType, config, model, selections, str) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], str);
            }
            const opType = getTypingOperation(str, prevEditOperationType);
            return new cursorCommon_1.EditOperationResult(opType, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
                shouldPushStackElementAfter: false
            });
        }
        static lineInsertBefore(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                let lineNumber = selections[i].positionLineNumber;
                if (lineNumber === 1) {
                    commands[i] = new replaceCommand_1.ReplaceCommandWithoutChangingPosition(new range_1.Range(1, 1, 1, 1), '\n');
                }
                else {
                    lineNumber--;
                    const column = model.getLineMaxColumn(lineNumber);
                    commands[i] = this._enter(config, model, false, new range_1.Range(lineNumber, column, lineNumber, column));
                }
            }
            return commands;
        }
        static lineInsertAfter(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const lineNumber = selections[i].positionLineNumber;
                const column = model.getLineMaxColumn(lineNumber);
                commands[i] = this._enter(config, model, false, new range_1.Range(lineNumber, column, lineNumber, column));
            }
            return commands;
        }
        static lineBreakInsert(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = this._enter(config, model, true, selections[i]);
            }
            return commands;
        }
    }
    exports.TypeOperations = TypeOperations;
    class TypeWithAutoClosingCommand extends replaceCommand_1.ReplaceCommandWithOffsetCursorState {
        constructor(selection, openCharacter, insertOpenCharacter, closeCharacter) {
            super(selection, (insertOpenCharacter ? openCharacter : '') + closeCharacter, 0, -closeCharacter.length);
            this._openCharacter = openCharacter;
            this._closeCharacter = closeCharacter;
            this.closeCharacterRange = null;
            this.enclosingRange = null;
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const range = inverseEditOperations[0].range;
            this.closeCharacterRange = new range_1.Range(range.startLineNumber, range.endColumn - this._closeCharacter.length, range.endLineNumber, range.endColumn);
            this.enclosingRange = new range_1.Range(range.startLineNumber, range.endColumn - this._openCharacter.length - this._closeCharacter.length, range.endLineNumber, range.endColumn);
            return super.computeCursorState(model, helper);
        }
    }
    exports.TypeWithAutoClosingCommand = TypeWithAutoClosingCommand;
    class CompositionOutcome {
        constructor(deletedText, deletedSelectionStart, deletedSelectionEnd, insertedText, insertedSelectionStart, insertedSelectionEnd) {
            this.deletedText = deletedText;
            this.deletedSelectionStart = deletedSelectionStart;
            this.deletedSelectionEnd = deletedSelectionEnd;
            this.insertedText = insertedText;
            this.insertedSelectionStart = insertedSelectionStart;
            this.insertedSelectionEnd = insertedSelectionEnd;
        }
    }
    exports.CompositionOutcome = CompositionOutcome;
    function getTypingOperation(typedText, previousTypingOperation) {
        if (typedText === ' ') {
            return previousTypingOperation === 5 /* EditOperationType.TypingFirstSpace */
                || previousTypingOperation === 6 /* EditOperationType.TypingConsecutiveSpace */
                ? 6 /* EditOperationType.TypingConsecutiveSpace */
                : 5 /* EditOperationType.TypingFirstSpace */;
        }
        return 4 /* EditOperationType.TypingOther */;
    }
    function shouldPushStackElementBetween(previousTypingOperation, typingOperation) {
        if (isTypingOperation(previousTypingOperation) && !isTypingOperation(typingOperation)) {
            // Always set an undo stop before non-type operations
            return true;
        }
        if (previousTypingOperation === 5 /* EditOperationType.TypingFirstSpace */) {
            // `abc |d`: No undo stop
            // `abc  |d`: Undo stop
            return false;
        }
        // Insert undo stop between different operation types
        return normalizeOperationType(previousTypingOperation) !== normalizeOperationType(typingOperation);
    }
    function normalizeOperationType(type) {
        return (type === 6 /* EditOperationType.TypingConsecutiveSpace */ || type === 5 /* EditOperationType.TypingFirstSpace */)
            ? 'space'
            : type;
    }
    function isTypingOperation(type) {
        return type === 4 /* EditOperationType.TypingOther */
            || type === 5 /* EditOperationType.TypingFirstSpace */
            || type === 6 /* EditOperationType.TypingConsecutiveSpace */;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yVHlwZU9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY3Vyc29yL2N1cnNvclR5cGVPcGVyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXVCaEcsTUFBYSxjQUFjO1FBRW5CLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBMkIsRUFBRSxLQUFnQyxFQUFFLFVBQThCO1lBQ2pILElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzNDLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFlLEVBQUUsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZELFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLDJCQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUM3QyxTQUFTLEVBQUUsS0FBSztvQkFDaEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO29CQUN2QixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVU7b0JBQzdCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtvQkFDakMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO29CQUMvQixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVU7aUJBQzdCLEVBQUUsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTJCLEVBQUUsS0FBeUIsRUFBRSxVQUF1QjtZQUNwRyxNQUFN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