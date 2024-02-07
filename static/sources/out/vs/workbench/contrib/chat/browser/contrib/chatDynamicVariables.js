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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/platform/actions/common/actions", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/chat/browser/chatWidget"], function (require, exports, arrays_1, htmlContent_1, lifecycle_1, resources_1, uri_1, range_1, resolverService_1, actions_1, label_1, log_1, quickInput_1, chatWidget_1) {
    "use strict";
    var ChatDynamicVariableModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AddDynamicVariableAction = exports.SelectAndInsertFileAction = exports.ChatDynamicVariableModel = exports.dynamicVariableDecorationType = void 0;
    exports.dynamicVariableDecorationType = 'chat-dynamic-variable';
    let ChatDynamicVariableModel = class ChatDynamicVariableModel extends lifecycle_1.Disposable {
        static { ChatDynamicVariableModel_1 = this; }
        static { this.ID = 'chatDynamicVariableModel'; }
        get variables() {
            return [...this._variables];
        }
        get id() {
            return ChatDynamicVariableModel_1.ID;
        }
        constructor(widget, labelService, logService) {
            super();
            this.widget = widget;
            this.labelService = labelService;
            this.logService = logService;
            this._variables = [];
            this._register(widget.inputEditor.onDidChangeModelContent(e => {
                e.changes.forEach(c => {
                    // Don't mutate entries in _variables, since they will be returned from the getter
                    this._variables = (0, arrays_1.coalesce)(this._variables.map(ref => {
                        const intersection = range_1.Range.intersectRanges(ref.range, c.range);
                        if (intersection && !intersection.isEmpty()) {
                            // The reference text was changed, it's broken
                            const rangeToDelete = new range_1.Range(ref.range.startLineNumber, ref.range.startColumn, ref.range.endLineNumber, ref.range.endColumn - 1);
                            this.widget.inputEditor.executeEdits(this.id, [{
                                    range: rangeToDelete,
                                    text: '',
                                }]);
                            return null;
                        }
                        else if (range_1.Range.compareRangesUsingStarts(ref.range, c.range) > 0) {
                            const delta = c.text.length - c.rangeLength;
                            return {
                                ...ref,
                                range: {
                                    startLineNumber: ref.range.startLineNumber,
                                    startColumn: ref.range.startColumn + delta,
                                    endLineNumber: ref.range.endLineNumber,
                                    endColumn: ref.range.endColumn + delta
                                }
                            };
                        }
                        return ref;
                    }));
                });
                this.updateDecorations();
            }));
        }
        getInputState() {
            return this.variables;
        }
        setInputState(s) {
            if (!Array.isArray(s)) {
                // Something went wrong
                this.logService.warn('ChatDynamicVariableModel.setInputState called with invalid state: ' + JSON.stringify(s));
                return;
            }
            this._variables = s;
            this.updateDecorations();
        }
        addReference(ref) {
            this._variables.push(ref);
            this.updateDecorations();
        }
        updateDecorations() {
            this.widget.inputEditor.setDecorationsByType('chat', exports.dynamicVariableDecorationType, this._variables.map(r => ({
                range: r.range,
                hoverMessage: this.getHoverForReference(r)
            })));
        }
        getHoverForReference(ref) {
            const value = ref.data[0];
            if (uri_1.URI.isUri(value.value)) {
                return new htmlContent_1.MarkdownString(this.labelService.getUriLabel(value.value, { relative: true }));
            }
            else {
                return value.value.toString();
            }
        }
    };
    exports.ChatDynamicVariableModel = ChatDynamicVariableModel;
    exports.ChatDynamicVariableModel = ChatDynamicVariableModel = ChatDynamicVariableModel_1 = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, log_1.ILogService)
    ], ChatDynamicVariableModel);
    chatWidget_1.ChatWidget.CONTRIBS.push(ChatDynamicVariableModel);
    function isSelectAndInsertFileActionContext(context) {
        return 'widget' in context && 'range' in context;
    }
    class SelectAndInsertFileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.selectAndInsertFile'; }
        constructor() {
            super({
                id: SelectAndInsertFileAction.ID,
                title: '' // not displayed
            });
        }
        async run(accessor, ...args) {
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const logService = accessor.get(log_1.ILogService);
            const context = args[0];
            if (!isSelectAndInsertFileActionContext(context)) {
                return;
            }
            const doCleanup = () => {
                // Failed, remove the dangling `file`
                context.widget.inputEditor.executeEdits('chatInsertFile', [{ range: context.range, text: `` }]);
            };
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const picks = await quickInputService.quickAccess.pick('');
            if (!picks?.length) {
                logService.trace('SelectAndInsertFileAction: no file selected');
                doCleanup();
                return;
            }
            const resource = picks[0].resource;
            if (!textModelService.canHandleResource(resource)) {
                logService.trace('SelectAndInsertFileAction: non-text resource selected');
                doCleanup();
                return;
            }
            const fileName = (0, resources_1.basename)(resource);
            const editor = context.widget.inputEditor;
            const text = `#file:${fileName}`;
            const range = context.range;
            const success = editor.executeEdits('chatInsertFile', [{ range, text: text + ' ' }]);
            if (!success) {
                logService.trace(`SelectAndInsertFileAction: failed to insert "${text}"`);
                doCleanup();
                return;
            }
            context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
                range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
                data: [{ level: 'full', value: resource }]
            });
        }
    }
    exports.SelectAndInsertFileAction = SelectAndInsertFileAction;
    (0, actions_1.registerAction2)(SelectAndInsertFileAction);
    function isAddDynamicVariableContext(context) {
        return 'widget' in context &&
            'range' in context &&
            'variableData' in context;
    }
    class AddDynamicVariableAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.addDynamicVariable'; }
        constructor() {
            super({
                id: AddDynamicVariableAction.ID,
                title: '' // not displayed
            });
        }
        async run(accessor, ...args) {
            const context = args[0];
            if (!isAddDynamicVariableContext(context)) {
                return;
            }
            context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
                range: context.range,
                data: context.variableData
            });
        }
    }
    exports.AddDynamicVariableAction = AddDynamicVariableAction;
    (0, actions_1.registerAction2)(AddDynamicVariableAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdER5bmFtaWNWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jb250cmliL2NoYXREeW5hbWljVmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQm5GLFFBQUEsNkJBQTZCLEdBQUcsdUJBQXVCLENBQUM7SUFFOUQsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTs7aUJBQ2hDLE9BQUUsR0FBRywwQkFBMEIsQUFBN0IsQ0FBOEI7UUFHdkQsSUFBSSxTQUFTO1lBQ1osT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLEVBQUU7WUFDTCxPQUFPLDBCQUF3QixDQUFDLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRUQsWUFDa0IsTUFBbUIsRUFDckIsWUFBNEMsRUFDOUMsVUFBd0M7WUFFckQsS0FBSyxFQUFFLENBQUM7WUFKUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQ0osaUJBQVksR0FBWixZQUFZLENBQWU7WUFDN0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQVo5QyxlQUFVLEdBQXVCLEVBQUUsQ0FBQztZQWUzQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdELENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNyQixrRkFBa0Y7b0JBQ2xGLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBQSxpQkFBUSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNwRCxNQUFNLFlBQVksR0FBRyxh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