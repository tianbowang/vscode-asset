/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/objects", "vs/base/common/network", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/base/common/arrays"], function (require, exports, strings_1, uri_1, path_1, objects_1, network_1, range_1, cancellation_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sourcesEqual = exports.saveAllBeforeDebugStart = exports.getVisibleAndSorted = exports.convertToVSCPaths = exports.convertToDAPaths = exports.isUri = exports.getEvaluatableExpressionAtPosition = exports.getExactExpressionStartAndEnd = exports.isDebuggerMainContribution = exports.getExtensionHostDebugSession = exports.isSessionAttach = exports.filterExceptionsFromTelemetry = exports.formatPII = void 0;
    const _formatPIIRegexp = /{([^}]+)}/g;
    function formatPII(value, excludePII, args) {
        return value.replace(_formatPIIRegexp, function (match, group) {
            if (excludePII && group.length > 0 && group[0] !== '_') {
                return match;
            }
            return args && args.hasOwnProperty(group) ?
                args[group] :
                match;
        });
    }
    exports.formatPII = formatPII;
    /**
     * Filters exceptions (keys marked with "!") from the given object. Used to
     * ensure exception data is not sent on web remotes, see #97628.
     */
    function filterExceptionsFromTelemetry(data) {
        const output = {};
        for (const key of Object.keys(data)) {
            if (!key.startsWith('!')) {
                output[key] = data[key];
            }
        }
        return output;
    }
    exports.filterExceptionsFromTelemetry = filterExceptionsFromTelemetry;
    function isSessionAttach(session) {
        return session.configuration.request === 'attach' && !getExtensionHostDebugSession(session) && (!session.parentSession || isSessionAttach(session.parentSession));
    }
    exports.isSessionAttach = isSessionAttach;
    /**
     * Returns the session or any parent which is an extension host debug session.
     * Returns undefined if there's none.
     */
    function getExtensionHostDebugSession(session) {
        let type = session.configuration.type;
        if (!type) {
            return;
        }
        if (type === 'vslsShare') {
            type = session.configuration.adapterProxy.configuration.type;
        }
        if ((0, strings_1.equalsIgnoreCase)(type, 'extensionhost') || (0, strings_1.equalsIgnoreCase)(type, 'pwa-extensionhost')) {
            return session;
        }
        return session.parentSession ? getExtensionHostDebugSession(session.parentSession) : undefined;
    }
    exports.getExtensionHostDebugSession = getExtensionHostDebugSession;
    // only a debugger contributions with a label, program, or runtime attribute is considered a "defining" or "main" debugger contribution
    function isDebuggerMainContribution(dbg) {
        return dbg.type && (dbg.label || dbg.program || dbg.runtime);
    }
    exports.isDebuggerMainContribution = isDebuggerMainContribution;
    function getExactExpressionStartAndEnd(lineContent, looseStart, looseEnd) {
        let matchingExpression = undefined;
        let startOffset = 0;
        // Some example supported expressions: myVar.prop, a.b.c.d, myVar?.prop, myVar->prop, MyClass::StaticProp, *myVar
        // Match any character except a set of characters which often break interesting sub-expressions
        const expression = /([^()\[\]{}<>\s+\-/%~#^;=|,`!]|\->)+/g;
        let result = null;
        // First find the full expression under the cursor
        while (result = expression.exec(lineContent)) {
            const start = result.index + 1;
            const end = start + result[0].length;
            if (start <= looseStart && end >= looseEnd) {
                matchingExpression = result[0];
                startOffset = start;
                break;
            }
        }
        // If there are non-word characters after the cursor, we want to truncate the expression then.
        // For example in expression 'a.b.c.d', if the focus was under 'b', 'a.b' would be evaluated.
        if (matchingExpression) {
            const subExpression = /\w+/g;
            let subExpressionResult = null;
            while (subExpressionResult = subExpression.exec(matchingExpression)) {
                const subEnd = subExpressionResult.index + 1 + startOffset + subExpressionResult[0].length;
                if (subEnd >= looseEnd) {
                    break;
                }
            }
            if (subExpressionResult) {
                matchingExpression = matchingExpression.substring(0, subExpression.lastIndex);
            }
        }
        return matchingExpression ?
            { start: startOffset, end: startOffset + matchingExpression.length - 1 } :
            { start: 0, end: 0 };
    }
    exports.getExactExpressionStartAndEnd = getExactExpressionStartAndEnd;
    async function getEvaluatableExpressionAtPosition(languageFeaturesService, model, position, token) {
        if (languageFeaturesService.evaluatableExpressionProvider.has(model)) {
            const supports = languageFeaturesService.evaluatableExpressionProvider.ordered(model);
            const results = (0, arrays_1.coalesce)(await Promise.all(supports.map(async (support) => {
                try {
                    return await support.provideEvaluatableExpression(model, position, token ?? cancellation_1.CancellationToken.None);
                }
                catch (err) {
                    return undefined;
                }
            })));
            if (results.length > 0) {
                let matchingExpression = results[0].expression;
                const range = results[0].range;
                if (!matchingExpression) {
                    const lineContent = model.getLineContent(position.lineNumber);
                    matchingExpression = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
                }
                return { range, matchingExpression };
            }
        }
        else { // old one-size-fits-all strategy
            const lineContent = model.getLineContent(position.lineNumber);
            const { start, end } = getExactExpressionStartAndEnd(lineContent, position.column, position.column);
            // use regex to extract the sub-expression #9821
            const matchingExpression = lineContent.substring(start - 1, end);
            return {
                matchingExpression,
                range: new range_1.Range(position.lineNumber, start, position.lineNumber, start + matchingExpression.length)
            };
        }
        return null;
    }
    exports.getEvaluatableExpressionAtPosition = getEvaluatableExpressionAtPosition;
    // RFC 2396, Appendix A: https://www.ietf.org/rfc/rfc2396.txt
    const _schemePattern = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
    function isUri(s) {
        // heuristics: a valid uri starts with a scheme and
        // the scheme has at least 2 characters so that it doesn't look like a drive letter.
        return !!(s && s.match(_schemePattern));
    }
    exports.isUri = isUri;
    function stringToUri(source) {
        if (typeof source.path === 'string') {
            if (typeof source.sourceReference === 'number' && source.sourceReference > 0) {
                // if there is a source reference, don't touch path
            }
            else {
                if (isUri(source.path)) {
                    return uri_1.URI.parse(source.path);
                }
                else {
                    // assume path
                    if ((0, path_1.isAbsolute)(source.path)) {
                        return uri_1.URI.file(source.path);
                    }
                    else {
                        // leave relative path as is
                    }
                }
            }
        }
        return source.path;
    }
    function uriToString(source) {
        if (typeof source.path === 'object') {
            const u = uri_1.URI.revive(source.path);
            if (u) {
                if (u.scheme === network_1.Schemas.file) {
                    return u.fsPath;
                }
                else {
                    return u.toString();
                }
            }
        }
        return source.path;
    }
    function convertToDAPaths(message, toUri) {
        const fixPath = toUri ? stringToUri : uriToString;
        // since we modify Source.paths in the message in place, we need to make a copy of it (see #61129)
        const msg = (0, objects_1.deepClone)(message);
        convertPaths(msg, (toDA, source) => {
            if (toDA && source) {
                source.path = fixPath(source);
            }
        });
        return msg;
    }
    exports.convertToDAPaths = convertToDAPaths;
    function convertToVSCPaths(message, toUri) {
        const fixPath = toUri ? stringToUri : uriToString;
        // since we modify Source.paths in the message in place, we need to make a copy of it (see #61129)
        const msg = (0, objects_1.deepClone)(message);
        convertPaths(msg, (toDA, source) => {
            if (!toDA && source) {
                source.path = fixPath(source);
            }
        });
        return msg;
    }
    exports.convertToVSCPaths = convertToVSCPaths;
    function convertPaths(msg, fixSourcePath) {
        switch (msg.type) {
            case 'event': {
                const event = msg;
                switch (event.event) {
                    case 'output':
                        fixSourcePath(false, event.body.source);
                        break;
                    case 'loadedSource':
                        fixSourcePath(false, event.body.source);
                        break;
                    case 'breakpoint':
                        fixSourcePath(false, event.body.breakpoint.source);
                        break;
                    default:
                        break;
                }
                break;
            }
            case 'request': {
                const request = msg;
                switch (request.command) {
                    case 'setBreakpoints':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'breakpointLocations':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'source':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'gotoTargets':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'launchVSCode':
                        request.arguments.args.forEach((arg) => fixSourcePath(false, arg));
                        break;
                    default:
                        break;
                }
                break;
            }
            case 'response': {
                const response = msg;
                if (response.success && response.body) {
                    switch (response.command) {
                        case 'stackTrace':
                            response.body.stackFrames.forEach(frame => fixSourcePath(false, frame.source));
                            break;
                        case 'loadedSources':
                            response.body.sources.forEach(source => fixSourcePath(false, source));
                            break;
                        case 'scopes':
                            response.body.scopes.forEach(scope => fixSourcePath(false, scope.source));
                            break;
                        case 'setFunctionBreakpoints':
                            response.body.breakpoints.forEach(bp => fixSourcePath(false, bp.source));
                            break;
                        case 'setBreakpoints':
                            response.body.breakpoints.forEach(bp => fixSourcePath(false, bp.source));
                            break;
                        case 'disassemble':
                            {
                                const di = response;
                                di.body?.instructions.forEach(di => fixSourcePath(false, di.location));
                            }
                            break;
                        default:
                            break;
                    }
                }
                break;
            }
        }
    }
    function getVisibleAndSorted(array) {
        return array.filter(config => !config.presentation?.hidden).sort((first, second) => {
            if (!first.presentation) {
                if (!second.presentation) {
                    return 0;
                }
                return 1;
            }
            if (!second.presentation) {
                return -1;
            }
            if (!first.presentation.group) {
                if (!second.presentation.group) {
                    return compareOrders(first.presentation.order, second.presentation.order);
                }
                return 1;
            }
            if (!second.presentation.group) {
                return -1;
            }
            if (first.presentation.group !== second.presentation.group) {
                return first.presentation.group.localeCompare(second.presentation.group);
            }
            return compareOrders(first.presentation.order, second.presentation.order);
        });
    }
    exports.getVisibleAndSorted = getVisibleAndSorted;
    function compareOrders(first, second) {
        if (typeof first !== 'number') {
            if (typeof second !== 'number') {
                return 0;
            }
            return 1;
        }
        if (typeof second !== 'number') {
            return -1;
        }
        return first - second;
    }
    async function saveAllBeforeDebugStart(configurationService, editorService) {
        const saveBeforeStartConfig = configurationService.getValue('debug.saveBeforeStart', { overrideIdentifier: editorService.activeTextEditorLanguageId });
        if (saveBeforeStartConfig !== 'none') {
            await editorService.saveAll();
            if (saveBeforeStartConfig === 'allEditorsInActiveGroup') {
                const activeEditor = editorService.activeEditorPane;
                if (activeEditor && activeEditor.input.resource?.scheme === network_1.Schemas.untitled) {
                    // Make sure to save the active editor in case it is in untitled file it wont be saved as part of saveAll #111850
                    await editorService.save({ editor: activeEditor.input, groupId: activeEditor.group.id });
                }
            }
        }
        await configurationService.reloadConfiguration();
    }
    exports.saveAllBeforeDebugStart = saveAllBeforeDebugStart;
    const sourcesEqual = (a, b) => !a || !b ? a === b : a.name === b.name && a.path === b.path && a.sourceReference === b.sourceReference;
    exports.sourcesEqual = sourcesEqual;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdVdGlscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL2RlYnVnVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQztJQUV0QyxTQUFnQixTQUFTLENBQUMsS0FBYSxFQUFFLFVBQW1CLEVBQUUsSUFBMkM7UUFDeEcsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsS0FBSyxFQUFFLEtBQUs7WUFDNUQsSUFBSSxVQUFVLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUN4RCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNiLEtBQUssQ0FBQztRQUNSLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVZELDhCQVVDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsNkJBQTZCLENBQXVDLElBQU87UUFDMUYsTUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1FBQzlCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQXlCLEVBQUUsQ0FBQztZQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDRixDQUFDO1FBRUQsT0FB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QUFDLENBQUM7WUFDVixDQUFDO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO1FBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVELE9BQU8sS0FBSyxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sS0FBSyxVQUFVLHVCQUF1QixDQUFDLG9CQUEyQyxFQUFFLGFBQTZCO1FBQ3ZILE1BQU0scUJBQXFCLEdBQVcsb0JBQW9CLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQztRQUMvSixJQUFJLHFCQUFxQixLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3RDLE1BQU0sYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzlCLElBQUkscUJBQXFCLEtBQUsseUJBQXlCLEVBQUUsQ0FBQztnQkFDekQsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDO2dCQUNwRCxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDOUUsaUhBQWlIO29CQUNqSCxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFDRCxNQUFNLG9CQUFvQixDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDbEQsQ0FBQztJQWJELDBEQWFDO0lBRU0sTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFtQyxFQUFFLENBQW1DLEVBQVcsRUFBRSxDQUNqSCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsZUFBZSxLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUM7SUFEM0YsUUFBQSxZQUFZLGdCQUMrRSJ9