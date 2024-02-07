/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostCommands", "vs/base/common/async"], function (require, exports, lifecycle_1, uri_1, extHost_protocol_1, typeConvert, extHostTypes, extHostCommands_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostInteractiveEditor = void 0;
    class ProviderWrapper {
        static { this._pool = 0; }
        constructor(extension, provider) {
            this.extension = extension;
            this.provider = provider;
            this.handle = ProviderWrapper._pool++;
        }
    }
    class SessionWrapper {
        constructor(session) {
            this.session = session;
            this.responses = [];
        }
    }
    class ExtHostInteractiveEditor {
        static { this._nextId = 0; }
        constructor(mainContext, extHostCommands, _documents, _logService) {
            this._documents = _documents;
            this._logService = _logService;
            this._inputProvider = new Map();
            this._inputSessions = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadInlineChat);
            extHostCommands.registerApiCommand(new extHostCommands_1.ApiCommand('vscode.editorChat.start', 'inlineChat.start', 'Invoke a new editor chat session', [new extHostCommands_1.ApiCommandArgument('Run arguments', '', _v => true, v => {
                    if (!v) {
                        return undefined;
                    }
                    return {
                        initialRange: v.initialRange ? typeConvert.Range.from(v.initialRange) : undefined,
                        initialSelection: extHostTypes.Selection.isSelection(v.initialSelection) ? typeConvert.Selection.from(v.initialSelection) : undefined,
                        message: v.message,
                        autoSend: v.autoSend,
                        position: v.position ? typeConvert.Position.from(v.position) : undefined,
                    };
                })], extHostCommands_1.ApiCommandResult.Void));
        }
        registerProvider(extension, provider, metadata) {
            const wrapper = new ProviderWrapper(extension, provider);
            this._inputProvider.set(wrapper.handle, wrapper);
            this._proxy.$registerInteractiveEditorProvider(wrapper.handle, metadata?.label ?? extension.displayName ?? extension.name, extension.identifier.value, typeof provider.handleInteractiveEditorResponseFeedback === 'function', typeof provider.provideFollowups === 'function', metadata?.supportReportIssue ?? false);
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterInteractiveEditorProvider(wrapper.handle);
                this._inputProvider.delete(wrapper.handle);
            });
        }
        async $prepareSession(handle, uri, range, token) {
            const entry = this._inputProvider.get(handle);
            if (!entry) {
                this._logService.warn('CANNOT prepare session because the PROVIDER IS GONE');
                return undefined;
            }
            const document = this._documents.getDocument(uri_1.URI.revive(uri));
            const selection = typeConvert.Selection.to(range);
            const session = await entry.provider.prepareInteractiveEditorSession({ document, selection }, token);
            if (!session) {
                return undefined;
            }
            if (session.wholeRange && !session.wholeRange.contains(selection)) {
                throw new Error(`InteractiveEditorSessionProvider returned a wholeRange that does not contain the selection.`);
            }
            const id = ExtHostInteractiveEditor._nextId++;
            this._inputSessions.set(id, new SessionWrapper(session));
            return {
                id,
                placeholder: session.placeholder,
                input: session.input,
                slashCommands: session.slashCommands?.map(c => ({ command: c.command, detail: c.detail, refer: c.refer, executeImmediately: c.executeImmediately })),
                wholeRange: typeConvert.Range.from(session.wholeRange),
                message: session.message
            };
        }
        async $provideResponse(handle, item, request, token) {
            const entry = this._inputProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const sessionData = this._inputSessions.get(item.id);
            if (!sessionData) {
                return;
            }
            const apiRequest = {
                prompt: request.prompt,
                selection: typeConvert.Selection.to(request.selection),
                wholeRange: typeConvert.Range.to(request.wholeRange),
                attempt: request.attempt,
                live: request.live,
                withIntentDetection: request.withIntentDetection,
            };
            let done = false;
            const progress = {
                report: async (value) => {
                    if (!request.live && value.edits?.length) {
                        throw new Error('Progress reporting is only supported for live sessions');
                    }
                    if (done || token.isCancellationRequested) {
                        return;
                    }
                    await this._proxy.$handleProgressChunk(request.requestId, {
                        message: value.message,
                        edits: value.edits?.map(typeConvert.TextEdit.from),
                        editsShouldBeInstant: value.editsShouldBeInstant,
                        slashCommand: value.slashCommand?.command,
                        markdownFragment: extHostTypes.MarkdownString.isMarkdownString(value.content) ? value.content.value : value.content
                    });
                }
            };
            const task = Promise.resolve(entry.provider.provideInteractiveEditorResponse(sessionData.session, apiRequest, progress, token));
            let res;
            try {
                res = await (0, async_1.raceCancellation)(task, token);
            }
            finally {
                done = true;
            }
            if (!res) {
                return undefined;
            }
            const id = sessionData.responses.push(res) - 1;
            const stub = {
                wholeRange: typeConvert.Range.from(res.wholeRange),
                placeholder: res.placeholder,
            };
            if (!ExtHostInteractiveEditor._isEditResponse(res)) {
                return {
                    ...stub,
                    id,
                    type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                    message: typeConvert.MarkdownString.from(res.contents),
                    edits: []
                };
            }
            const { edits, contents } = res;
            const message = contents !== undefined ? typeConvert.MarkdownString.from(contents) : undefined;
            if (edits instanceof extHostTypes.WorkspaceEdit) {
                return {
                    ...stub,
                    id,
                    type: "bulkEdit" /* InlineChatResponseType.BulkEdit */,
                    edits: typeConvert.WorkspaceEdit.from(edits),
                    message
                };
            }
            else {
                return {
                    ...stub,
                    id,
                    type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                    edits: edits.map(typeConvert.TextEdit.from),
                    message
                };
            }
        }
        async $provideFollowups(handle, sessionId, responseId, token) {
            const entry = this._inputProvider.get(handle);
            const sessionData = this._inputSessions.get(sessionId);
            const response = sessionData?.responses[responseId];
            if (entry && response && entry.provider.provideFollowups) {
                const task = Promise.resolve(entry.provider.provideFollowups(sessionData.session, response, token));
                const followups = await (0, async_1.raceCancellation)(task, token);
                return followups?.map(typeConvert.ChatFollowup.from);
            }
            return undefined;
        }
        $handleFeedback(handle, sessionId, responseId, kind) {
            const entry = this._inputProvider.get(handle);
            const sessionData = this._inputSessions.get(sessionId);
            const response = sessionData?.responses[responseId];
            if (entry && response) {
                const apiKind = typeConvert.InteractiveEditorResponseFeedbackKind.to(kind);
                entry.provider.handleInteractiveEditorResponseFeedback?.(sessionData.session, response, apiKind);
            }
        }
        $releaseSession(handle, sessionId) {
            // TODO@jrieken remove this
        }
        static _isEditResponse(thing) {
            return typeof thing === 'object' && typeof thing.edits === 'object';
        }
    }
    exports.ExtHostInteractiveEditor = ExtHostInteractiveEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdElubGluZUNoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RJbmxpbmVDaGF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsTUFBTSxlQUFlO2lCQUVMLFVBQUssR0FBRyxDQUFDLEFBQUosQ0FBSztRQUl6QixZQUNVLFNBQWlELEVBQ2pELFFBQWlEO1lBRGpELGNBQVMsR0FBVCxTQUFTLENBQXdDO1lBQ2pELGFBQVEsR0FBUixRQUFRLENBQXlDO1lBSmxELFdBQU0sR0FBVyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFLOUMsQ0FBQzs7SUFHTixNQUFNLGNBQWM7UUFJbkIsWUFDVSxPQUF3QztZQUF4QyxZQUFPLEdBQVAsT0FBTyxDQUFpQztZQUh6QyxjQUFTLEdBQW1GLEVBQUUsQ0FBQztRQUlwRyxDQUFDO0tBQ0w7SUFFRCxNQUFhLHdCQUF3QjtpQkFFckIsWUFBTyxHQUFHLENBQUMsQUFBSixDQUFLO1FBTTNCLFlBQ0MsV0FBeUIsRUFDekIsZUFBZ0MsRUFDZixVQUE0QixFQUM1QixXQUF3QjtZQUR4QixlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQVJ6QixtQkFBYyxHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO1lBQ3BELG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFTbkUsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQWtCckUsZUFBZSxDQUFDLGtCQUFrQixDQUFDLElBQUksNEJBQVUsQ0FDaEQseUJBQXlCLEVBQUUsa0JBQWtCLEVBQUUsa0NBQWtDLEVBQ2pGLENBQUMsSUFBSSxvQ0FBa0IsQ0FBd0UsZUFB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