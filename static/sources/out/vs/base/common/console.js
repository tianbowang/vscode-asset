/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.log = exports.getFirstFrame = exports.parse = exports.isRemoteConsoleLog = void 0;
    function isRemoteConsoleLog(obj) {
        const entry = obj;
        return entry && typeof entry.type === 'string' && typeof entry.severity === 'string';
    }
    exports.isRemoteConsoleLog = isRemoteConsoleLog;
    function parse(entry) {
        const args = [];
        let stack;
        // Parse Entry
        try {
            const parsedArguments = JSON.parse(entry.arguments);
            // Check for special stack entry as last entry
            const stackArgument = parsedArguments[parsedArguments.length - 1];
            if (stackArgument && stackArgument.__$stack) {
                parsedArguments.pop(); // stack is handled specially
                stack = stackArgument.__$stack;
            }
            args.push(...parsedArguments);
        }
        catch (error) {
            args.push('Unable to log remote console arguments', entry.arguments);
        }
        return { args, stack };
    }
    exports.parse = parse;
    function getFirstFrame(arg0) {
        if (typeof arg0 !== 'string') {
            return getFirstFrame(parse(arg0).stack);
        }
        // Parse a source information out of the stack if we have one. Format can be:
        // at vscode.commands.registerCommand (/Users/someone/Desktop/test-ts/out/src/extension.js:18:17)
        // or
        // at /Users/someone/Desktop/test-ts/out/src/extension.js:18:17
        // or
        // at c:\Users\someone\Desktop\end-js\extension.js:19:17
        // or
        // at e.$executeContributedCommand(c:\Users\someone\Desktop\end-js\extension.js:19:17)
        const stack = arg0;
        if (stack) {
            const topFrame = findFirstFrame(stack);
            // at [^\/]* => line starts with "at" followed by any character except '/' (to not capture unix paths too late)
            // (?:(?:[a-zA-Z]+:)|(?:[\/])|(?:\\\\) => windows drive letter OR unix root OR unc root
            // (?:.+) => simple pattern for the path, only works because of the line/col pattern after
            // :(?:\d+):(?:\d+) => :line:column data
            const matches = /at [^\/]*((?:(?:[a-zA-Z]+:)|(?:[\/])|(?:\\\\))(?:.+)):(\d+):(\d+)/.exec(topFrame || '');
            if (matches && matches.length === 4) {
                return {
                    uri: uri_1.URI.file(matches[1]),
                    line: Number(matches[2]),
                    column: Number(matches[3])
                };
            }
        }
        return undefined;
    }
    exports.getFirstFrame = getFirstFrame;
    function findFirstFrame(stack) {
        if (!stack) {
            return stack;
        }
        const newlineIndex = stack.indexOf('\n');
        if (newlineIndex === -1) {
            return stack;
        }
        return stack.substring(0, newlineIndex);
    }
    function log(entry, label) {
        const { args, stack } = parse(entry);
        const isOneStringArg = typeof args[0] === 'string' && args.length === 1;
        let topFrame = findFirstFrame(stack);
        if (topFrame) {
            topFrame = `(${topFrame.trim()})`;
        }
        let consoleArgs = [];
        // First arg is a string
        if (typeof args[0] === 'string') {
            if (topFrame && isOneStringArg) {
                consoleArgs = [`%c[${label}] %c${args[0]} %c${topFrame}`, color('blue'), color(''), color('grey')];
            }
            else {
                consoleArgs = [`%c[${label}] %c${args[0]}`, color('blue'), color(''), ...args.slice(1)];
            }
        }
        // First arg is something else, just apply all
        else {
            consoleArgs = [`%c[${label}]%`, color('blue'), ...args];
        }
        // Stack: add to args unless already added
        if (topFrame && !isOneStringArg) {
            consoleArgs.push(topFrame);
        }
        // Log it
        if (typeof console[entry.severity] !== 'function') {
            throw new Error('Unknown console method');
        }
        console[entry.severity].apply(console, consoleArgs);
    }
    exports.log = log;
    function color(color) {
        return `color: ${color}`;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vY29uc29sZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHLFNBQWdCLGtCQUFrQixDQUFDLEdBQVE7UUFDMUMsTUFBTSxLQUFLLEdBQUcsR0FBd0IsQ0FBQztRQUV2QyxPQUFPLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7SUFDdEYsQ0FBQztJQUpELGdEQUlDO0lBRUQsU0FBZ0IsS0FBSyxDQUFDLEtBQXdCO1FBQzdDLE1BQU0sSUFBSSxHQUFVLEVBQUUsQ0FBQztRQUN2QixJQUFJLEtBQXlCLENBQUM7UUFFOUIsY0FBYztRQUNkLElBQUksQ0FBQztZQUNKLE1BQU0sZUFBZSxHQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTNELDhDQUE4QztZQUM5QyxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQW1CLENBQUM7WUFDcEYsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM3QyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyw2QkFBNkI7Z0JBQ3BELEtBQUssR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELE9BQU8s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