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
define(["require", "exports", "vs/base/common/cancellation", "vs/editor/common/core/offsetRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables"], function (require, exports, cancellation_1, offsetRange_1, position_1, range_1, chatAgents_1, chatParserTypes_1, chatSlashCommands_1, chatVariables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatRequestParser = void 0;
    const agentReg = /^@([\w_\-]+)(?=(\s|$|\b))/i; // An @-agent
    const variableReg = /^#([\w_\-]+)(:\d+)?(?=(\s|$|\b))/i; // A #-variable with an optional numeric : arg (@response:2)
    const slashReg = /\/([\w_\-]+)(?=(\s|$|\b))/i; // A / command
    let ChatRequestParser = class ChatRequestParser {
        constructor(agentService, variableService, slashCommandService) {
            this.agentService = agentService;
            this.variableService = variableService;
            this.slashCommandService = slashCommandService;
        }
        async parseChatRequest(sessionId, message) {
            const parts = [];
            const references = this.variableService.getDynamicVariables(sessionId); // must access this list before any async calls
            let lineNumber = 1;
            let column = 1;
            for (let i = 0; i < message.length; i++) {
                const previousChar = message.charAt(i - 1);
                const char = message.charAt(i);
                let newPart;
                if (previousChar.match(/\s/) || i === 0) {
                    if (char === chatParserTypes_1.chatVariableLeader) {
                        newPart = this.tryToParseVariable(message.slice(i), i, new position_1.Position(lineNumber, column), parts);
                    }
                    else if (char === chatParserTypes_1.chatAgentLeader) {
                        newPart = this.tryToParseAgent(message.slice(i), message, i, new position_1.Position(lineNumber, column), parts);
                    }
                    else if (char === chatParserTypes_1.chatSubcommandLeader) {
                        // TODO try to make this sync
                        newPart = await this.tryToParseSlashCommand(sessionId, message.slice(i), message, i, new position_1.Position(lineNumber, column), parts);
                    }
                    if (!newPart) {
                        newPart = this.tryToParseDynamicVariable(message.slice(i), i, new position_1.Position(lineNumber, column), references);
                    }
                }
                if (newPart) {
                    if (i !== 0) {
                        // Insert a part for all the text we passed over, then insert the new parsed part
                        const previousPart = parts.at(-1);
                        const previousPartEnd = previousPart?.range.endExclusive ?? 0;
                        const previousPartEditorRangeEndLine = previousPart?.editorRange.endLineNumber ?? 1;
                        const previousPartEditorRangeEndCol = previousPart?.editorRange.endColumn ?? 1;
                        parts.push(new chatParserTypes_1.ChatRequestTextPart(new offsetRange_1.OffsetRange(previousPartEnd, i), new range_1.Range(previousPartEditorRangeEndLine, previousPartEditorRangeEndCol, lineNumber, column), message.slice(previousPartEnd, i)));
                    }
                    parts.push(newPart);
                }
                if (char === '\n') {
                    lineNumber++;
                    column = 1;
                }
                else {
                    column++;
                }
            }
            const lastPart = parts.at(-1);
            const lastPartEnd = lastPart?.range.endExclusive ?? 0;
            if (lastPartEnd < message.length) {
                parts.push(new chatParserTypes_1.ChatRequestTextPart(new offsetRange_1.OffsetRange(lastPartEnd, message.length), new range_1.Range(lastPart?.editorRange.endLineNumber ?? 1, lastPart?.editorRange.endColumn ?? 1, lineNumber, column), message.slice(lastPartEnd, message.length)));
            }
            return {
                parts,
                text: message,
            };
        }
        tryToParseAgent(message, fullMessage, offset, position, parts) {
            const nextVariableMatch = message.match(agentReg);
            if (!nextVariableMatch) {
                return;
            }
            const [full, name] = nextVariableMatch;
            const varRange = new offsetRange_1.OffsetRange(offset, offset + full.length);
            const varEditorRange = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + full.length);
            const agent = this.agentService.getAgent(name);
            if (!agent) {
                return;
            }
            if (parts.some(p => p instanceof chatParserTypes_1.ChatRequestAgentPart)) {
                // Only one agent allowed
                return;
            }
            // The agent must come first
            if (parts.some(p => (p instanceof chatParserTypes_1.ChatRequestTextPart && p.text.trim() !== '') || !(p instanceof chatParserTypes_1.ChatRequestAgentPart))) {
                return;
            }
            const previousPart = parts.at(-1);
            const previousPartEnd = previousPart?.range.endExclusive ?? 0;
            const textSincePreviousPart = fullMessage.slice(previousPartEnd, offset);
            if (textSincePreviousPart.trim() !== '') {
                return;
            }
            return new chatParserTypes_1.ChatRequestAgentPart(varRange, varEditorRange, agent);
        }
        tryToParseVariable(message, offset, position, parts) {
            const nextVariableMatch = message.match(variableReg);
            if (!nextVariableMatch) {
                return;
            }
            const [full, name] = nextVariableMatch;
            const variableArg = nextVariableMatch[2] ?? '';
            const varRange = new offsetRange_1.OffsetRange(offset, offset + full.length);
            const varEditorRange = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + full.length);
            if (this.variableService.hasVariable(name)) {
                return new chatParserTypes_1.ChatRequestVariablePart(varRange, varEditorRange, name, variableArg);
            }
            return;
        }
        async tryToParseSlashCommand(sessionId, remainingMessage, fullMessage, offset, position, parts) {
            const nextSlashMatch = remainingMessage.match(slashReg);
            if (!nextSlashMatch) {
                return;
            }
            if (parts.some(p => p instanceof chatParserTypes_1.ChatRequestSlashCommandPart)) {
                // Only one slash command allowed
                return;
            }
            const [full, command] = nextSlashMatch;
            const slashRange = new offsetRange_1.OffsetRange(offset, offset + full.length);
            const slashEditorRange = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + full.length);
            const usedAgent = parts.find((p) => p instanceof chatParserTypes_1.ChatRequestAgentPart);
            if (usedAgent) {
                // The slash command must come immediately after the agent
                if (parts.some(p => (p instanceof chatParserTypes_1.ChatRequestTextPart && p.text.trim() !== '') || !(p instanceof chatParserTypes_1.ChatRequestAgentPart) && !(p instanceof chatParserTypes_1.ChatRequestTextPart))) {
                    return;
                }
                const previousPart = parts.at(-1);
                const previousPartEnd = previousPart?.range.endExclusive ?? 0;
                const textSincePreviousPart = fullMessage.slice(previousPartEnd, offset);
                if (textSincePreviousPart.trim() !== '') {
                    return;
                }
                const subCommands = await usedAgent.agent.provideSlashCommands(cancellation_1.CancellationToken.None);
                const subCommand = subCommands.find(c => c.name === command);
                if (subCommand) {
                    // Valid agent subcommand
                    return new chatParserTypes_1.ChatRequestAgentSubcommandPart(slashRange, slashEditorRange, subCommand);
                }
            }
            else {
                const slashCommands = this.slashCommandService.getCommands();
                const slashCommand = slashCommands.find(c => c.command === command);
                if (slashCommand) {
                    // Valid standalone slash command
                    return new chatParserTypes_1.ChatRequestSlashCommandPart(slashRange, slashEditorRange, slashCommand);
                }
            }
            return;
        }
        tryToParseDynamicVariable(message, offset, position, references) {
            const refAtThisPosition = references.find(r => r.range.startLineNumber === position.lineNumber &&
                r.range.startColumn === position.column);
            if (refAtThisPosition) {
                const length = refAtThisPosition.range.endColumn - refAtThisPosition.range.startColumn;
                const text = message.substring(0, length);
                const range = new offsetRange_1.OffsetRange(offset, offset + length);
                return new chatParserTypes_1.ChatRequestDynamicVariablePart(range, refAtThisPosition.range, text, refAtThisPosition.data);
            }
            return;
        }
    };
    exports.ChatRequestParser = ChatRequestParser;
    exports.ChatRequestParser = ChatRequestParser = __decorate([
        __param(0, chatAgents_1.IChatAgentService),
        __param(1, chatVariables_1.IChatVariablesService),
        __param(2, chatSlashCommands_1.IChatSlashCommandService)
    ], ChatRequestParser);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFJlcXVlc3RQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvY29tbW9uL2NoYXRSZXF1ZXN0UGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVdoRyxNQUFNLFFBQVEsR0FBRyw0QkFBNEIsQ0FBQyxDQUFDLGFBQWE7SUFDNUQsTUFBTSxXQUFXLEdBQUcsbUNBQW1DLENBQUMsQ0FBQyw0REFBNEQ7SUFDckgsTUFBTSxRQUFRLEdBQUcsNEJBQTRCLENBQUMsQ0FBQyxjQUFjO0lBRXRELElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO1FBQzdCLFlBQ3FDLFlBQStCLEVBQzNCLGVBQXNDLEVBQ25DLG1CQUE2QztZQUZwRCxpQkFBWSxHQUFaLFlBQVksQ0FBbUI7WUFDM0Isb0JBQWUsR0FBZixlQUFlLENBQXVCO1lBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMEI7UUFDckYsQ0FBQztRQUVMLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLE9BQWU7WUFDeEQsTUFBTSxLQUFLLEdBQTZCLEVBQUUsQ0FBQztZQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsK0NBQStDO1lBRXZILElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN6QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFD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