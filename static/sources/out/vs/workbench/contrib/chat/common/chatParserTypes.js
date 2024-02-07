/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/marshalling", "vs/editor/common/core/offsetRange"], function (require, exports, marshalling_1, offsetRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveParsedChatRequest = exports.ChatRequestDynamicVariablePart = exports.ChatRequestSlashCommandPart = exports.ChatRequestAgentSubcommandPart = exports.ChatRequestAgentPart = exports.ChatRequestVariablePart = exports.chatSubcommandLeader = exports.chatAgentLeader = exports.chatVariableLeader = exports.ChatRequestTextPart = void 0;
    class ChatRequestTextPart {
        static { this.Kind = 'text'; }
        constructor(range, editorRange, text) {
            this.range = range;
            this.editorRange = editorRange;
            this.text = text;
            this.kind = ChatRequestTextPart.Kind;
        }
        get promptText() {
            return this.text;
        }
    }
    exports.ChatRequestTextPart = ChatRequestTextPart;
    // warning, these also show up in a regex in the parser
    exports.chatVariableLeader = '#';
    exports.chatAgentLeader = '@';
    exports.chatSubcommandLeader = '/';
    /**
     * An invocation of a static variable that can be resolved by the variable service
     */
    class ChatRequestVariablePart {
        static { this.Kind = 'var'; }
        constructor(range, editorRange, variableName, variableArg) {
            this.range = range;
            this.editorRange = editorRange;
            this.variableName = variableName;
            this.variableArg = variableArg;
            this.kind = ChatRequestVariablePart.Kind;
        }
        get text() {
            const argPart = this.variableArg ? `:${this.variableArg}` : '';
            return `${exports.chatVariableLeader}${this.variableName}${argPart}`;
        }
        get promptText() {
            return this.text;
        }
    }
    exports.ChatRequestVariablePart = ChatRequestVariablePart;
    /**
     * An invocation of an agent that can be resolved by the agent service
     */
    class ChatRequestAgentPart {
        static { this.Kind = 'agent'; }
        constructor(range, editorRange, agent) {
            this.range = range;
            this.editorRange = editorRange;
            this.agent = agent;
            this.kind = ChatRequestAgentPart.Kind;
        }
        get text() {
            return `${exports.chatAgentLeader}${this.agent.id}`;
        }
        get promptText() {
            return '';
        }
    }
    exports.ChatRequestAgentPart = ChatRequestAgentPart;
    /**
     * An invocation of an agent's subcommand
     */
    class ChatRequestAgentSubcommandPart {
        static { this.Kind = 'subcommand'; }
        constructor(range, editorRange, command) {
            this.range = range;
            this.editorRange = editorRange;
            this.command = command;
            this.kind = ChatRequestAgentSubcommandPart.Kind;
        }
        get text() {
            return `${exports.chatSubcommandLeader}${this.command.name}`;
        }
        get promptText() {
            return '';
        }
    }
    exports.ChatRequestAgentSubcommandPart = ChatRequestAgentSubcommandPart;
    /**
     * An invocation of a standalone slash command
     */
    class ChatRequestSlashCommandPart {
        static { this.Kind = 'slash'; }
        constructor(range, editorRange, slashCommand) {
            this.range = range;
            this.editorRange = editorRange;
            this.slashCommand = slashCommand;
            this.kind = ChatRequestSlashCommandPart.Kind;
        }
        get text() {
            return `${exports.chatSubcommandLeader}${this.slashCommand.command}`;
        }
        get promptText() {
            return `${exports.chatSubcommandLeader}${this.slashCommand.command}`;
        }
    }
    exports.ChatRequestSlashCommandPart = ChatRequestSlashCommandPart;
    /**
     * An invocation of a dynamic reference like '#file:'
     */
    class ChatRequestDynamicVariablePart {
        static { this.Kind = 'dynamic'; }
        constructor(range, editorRange, text, data) {
            this.range = range;
            this.editorRange = editorRange;
            this.text = text;
            this.data = data;
            this.kind = ChatRequestDynamicVariablePart.Kind;
        }
        get referenceText() {
            return this.text;
        }
        get promptText() {
            // This needs to be dynamically generated for de-duping
            return ``;
        }
    }
    exports.ChatRequestDynamicVariablePart = ChatRequestDynamicVariablePart;
    function reviveParsedChatRequest(serialized) {
        return {
            text: serialized.text,
            parts: serialized.parts.map(part => {
                if (part.kind === ChatRequestTextPart.Kind) {
                    return new ChatRequestTextPart(new offsetRange_1.OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.text);
                }
                else if (part.kind === ChatRequestVariablePart.Kind) {
                    return new ChatRequestVariablePart(new offsetRange_1.OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.variableName, part.variableArg);
                }
                else if (part.kind === ChatRequestAgentPart.Kind) {
                    return new ChatRequestAgentPart(new offsetRange_1.OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.agent);
                }
                else if (part.kind === ChatRequestAgentSubcommandPart.Kind) {
                    return new ChatRequestAgentSubcommandPart(new offsetRange_1.OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.command);
                }
                else if (part.kind === ChatRequestSlashCommandPart.Kind) {
                    return new ChatRequestSlashCommandPart(new offsetRange_1.OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.slashCommand);
                }
                else if (part.kind === ChatRequestDynamicVariablePart.Kind) {
                    return new ChatRequestDynamicVariablePart(new offsetRange_1.OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.text, (0, marshalling_1.revive)(part.data));
                }
                else {
                    throw new Error(`Unknown chat request part: ${part.kind}`);
                }
            })
        };
    }
    exports.reviveParsedChatRequest = reviveParsedChatRequest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFBhcnNlclR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0UGFyc2VyVHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JoRyxNQUFhLG1CQUFtQjtpQkFDZixTQUFJLEdBQUcsTUFBTSxBQUFULENBQVU7UUFFOUIsWUFBcUIsS0FBa0IsRUFBVyxXQUFtQixFQUFXLElBQVk7WUFBdkUsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQUFXLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVcsU0FBSSxHQUFKLElBQUksQ0FBUTtZQURuRixTQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1FBQ3VELENBQUM7UUFFakcsSUFBSSxVQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUM7O0lBUEYsa0RBUUM7SUFFRCx1REFBdUQ7SUFDMUMsUUFBQSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7SUFDekIsUUFBQSxlQUFlLEdBQUcsR0FBRyxDQUFDO0lBQ3RCLFFBQUEsb0JBQW9CLEdBQUcsR0FBRyxDQUFDO0lBRXhDOztPQUVHO0lBQ0gsTUFBYSx1QkFBdUI7aUJBQ25CLFNBQUksR0FBRyxLQUFLLEFBQVIsQ0FBUztRQUU3QixZQUFxQixLQUFrQixFQUFXLFdBQW1CLEVBQVcsWUFBb0IsRUFBVyxXQUFtQjtZQUE3RyxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBQVcsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBVyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUFXLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBRHpILFNBQUksR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUM7UUFDeUYsQ0FBQztRQUV2SSxJQUFJLElBQUk7WUFDUCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQy9ELE9BQU8sR0FBRywwQkFBa0IsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJLFVBQVU7WUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQzs7SUFaRiwwREFhQztJQUVEOztPQUVHO0lBQ0gsTUFBYSxvQkFBb0I7aUJBQ2hCLFNBQUksR0FBRyxPQUFPLEFBQVYsQ0FBVztRQUUvQixZQUFxQixLQUFrQixFQUFXLFdBQW1CLEVBQVcsS0FBaUI7WUFBNUUsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQUFXLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVcsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUR4RixTQUFJLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1FBQzJELENBQUM7UUFFdEcsSUFBSSxJQUFJO1lBQ1AsT0FBTyxHQUFHLHVCQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDOztJQVhGLG9EQVlDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLDhCQUE4QjtpQkFDMUIsU0FBSSxHQUFHLFlBQVksQUFBZixDQUFnQjtRQUVwQyxZQUFxQixLQUFrQixFQUFXLFdBQW1CLEVBQVcsT0FBMEI7WUFBckYsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQUFXLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVcsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7WUFEakcsU0FBSSxHQUFHLDhCQUE4QixDQUFDLElBQUksQ0FBQztRQUMwRCxDQUFDO1FBRS9HLElBQUksSUFBSTtZQUNQLE9BQU8sR0FBRyw0QkFBb0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFRCxJQUFJLFVBQVU7WUFDYixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7O0lBWEYsd0VBWUM7SUFFRDs7T0FFRztJQUNILE1BQWEsMkJBQTJCO2lCQUN2QixTQUFJLEdBQUcsT0FBTyxBQUFWLENBQVc7UUFFL0IsWUFBcUIsS0FBa0IsRUFBVyxXQUFtQixFQUFXLFlBQTRCO1lBQXZGLFVBQUssR0FBTCxLQUFLLENBQWE7WUFBVyxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUFXLGlCQUFZLEdBQVosWUFBWSxDQUFnQjtZQURuRyxTQUFJLEdBQUcsMkJBQTJCLENBQUMsSUFBSSxDQUFDO1FBQytELENBQUM7UUFFakgsSUFBSSxJQUFJO1lBQ1AsT0FBTyxHQUFHLDRCQUFvQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUQsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLE9BQU8sR0FBRyw0QkFBb0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlELENBQUM7O0lBWEYsa0VBWUM7SUFFRDs7T0FFRztJQUNILE1BQWEsOEJBQThCO2lCQUMxQixTQUFJLEdBQUcsU0FBUyxBQUFaLENBQWE7UUFFakMsWUFBcUIsS0FBa0IsRUFBVyxXQUFtQixFQUFXLElBQVksRUFBVyxJQUFpQztZQUFuSCxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBQVcsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBVyxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQVcsU0FBSSxHQUFKLElBQUksQ0FBNkI7WUFEL0gsU0FBSSxHQUFHLDhCQUE4QixDQUFDLElBQUksQ0FBQztRQUN3RixDQUFDO1FBRTdJLElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLHVEQUF1RDtZQUN2RCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7O0lBWkYsd0VBYUM7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxVQUE4QjtRQUNyRSxPQUFPO1lBQ04sSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQ3JCLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO29CQUM1QyxPQUFPLElBQUksbUJBQW1CLENBQzdCLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMxRCxJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsSUFBSSxDQUNULENBQUM7Z0JBQ0gsQ0FBQztxQkFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3ZELE9BQU8sSUFBSSx1QkFBdUIsQ0FDakMsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQzFELElBQUksQ0FBQyxXQUFXLEVBQ2YsSUFBZ0MsQ0FBQyxZQUFZLEVBQzdDLElBQWdDLENBQUMsV0FBVyxDQUM3QyxDQUFDO2dCQUNILENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDO29CQUNwRCxPQUFPLElBQUksb0JBQW9CLENBQzlCLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMxRCxJQUFJLENBQUMsV0FBVyxFQUNmLElBQTZCLENBQUMsS0FBSyxDQUNwQyxDQUFDO2dCQUNILENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLDhCQUE4QixDQUFDLElBQUksRUFBRSxDQUFDO29CQUM5RCxPQUFPLElBQUksOEJBQThCLENBQ3hDLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMxRCxJQUFJLENBQUMsV0FBVyxFQUNmLElBQXVDLENBQUMsT0FBTyxDQUNoRCxDQUFDO2dCQUNILENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLDJCQUEyQixDQUFDLElBQUksRUFBRSxDQUFDO29CQUMzRCxPQUFPLElBQUksMkJBQTJCLENBQ3JDLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMxRCxJQUFJLENBQUMsV0FBVyxFQUNmLElBQW9DLENBQUMsWUFBWSxDQUNsRCxDQUFDO2dCQUNILENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLDhCQUE4QixDQUFDLElBQUksRUFBRSxDQUFDO29CQUM5RCxPQUFPLElBQUksOEJBQThCLENBQ3hDLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMxRCxJQUFJLENBQUMsV0FBVyxFQUNmLElBQXVDLENBQUMsSUFBSSxFQUM3QyxJQUFBLG9CQUFNLEVBQUUsSUFBdUMsQ0FBQyxJQUFJLENBQUMsQ0FDckQsQ0FBQztnQkFDSCxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzVELENBQUM7WUFDRixDQUFDLENBQUM7U0FDRixDQUFDO0lBQ0gsQ0FBQztJQS9DRCwwREErQ0MifQ==