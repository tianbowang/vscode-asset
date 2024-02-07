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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/contrib/chatDynamicVariables", "vs/workbench/contrib/chat/common/chatParserTypes"], function (require, exports, errors_1, iterator_1, lifecycle_1, chat_1, chatDynamicVariables_1, chatParserTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatVariablesService = void 0;
    let ChatVariablesService = class ChatVariablesService {
        constructor(chatWidgetService) {
            this.chatWidgetService = chatWidgetService;
            this._resolver = new Map();
        }
        async resolveVariables(prompt, model, token) {
            const resolvedVariables = {};
            const jobs = [];
            const parsedPrompt = [];
            prompt.parts
                .forEach((part, i) => {
                if (part instanceof chatParserTypes_1.ChatRequestVariablePart) {
                    const data = this._resolver.get(part.variableName.toLowerCase());
                    if (data) {
                        jobs.push(data.resolver(prompt.text, part.variableArg, model, token).then(value => {
                            if (value) {
                                resolvedVariables[part.variableName] = value;
                                parsedPrompt[i] = `[${part.text}](values:${part.variableName})`;
                            }
                            else {
                                parsedPrompt[i] = part.promptText;
                            }
                        }).catch(errors_1.onUnexpectedExternalError));
                    }
                }
                else if (part instanceof chatParserTypes_1.ChatRequestDynamicVariablePart) {
                    const referenceName = this.getUniqueReferenceName(part.referenceText, resolvedVariables);
                    resolvedVariables[referenceName] = part.data;
                    const safeText = part.text.replace(/[\[\]]/g, '_');
                    const safeTarget = referenceName.replace(/[\(\)]/g, '_');
                    parsedPrompt[i] = `[${safeText}](values:${safeTarget})`;
                }
                else {
                    parsedPrompt[i] = part.promptText;
                }
            });
            await Promise.allSettled(jobs);
            return {
                variables: resolvedVariables,
                message: parsedPrompt.join('').trim()
            };
        }
        getUniqueReferenceName(name, vars) {
            let i = 1;
            while (vars[name]) {
                name = `${name}_${i++}`;
            }
            return name;
        }
        hasVariable(name) {
            return this._resolver.has(name.toLowerCase());
        }
        getVariables() {
            const all = iterator_1.Iterable.map(this._resolver.values(), data => data.data);
            return iterator_1.Iterable.filter(all, data => !data.hidden);
        }
        getDynamicVariables(sessionId) {
            // This is slightly wrong... the parser pulls dynamic references from the input widget, but there is no guarantee that message came from the input here.
            // Need to ...
            // - Parser takes list of dynamic references (annoying)
            // - Or the parser is known to implicitly act on the input widget, and we need to call it before calling the chat service (maybe incompatible with the future, but easy)
            const widget = this.chatWidgetService.getWidgetBySessionId(sessionId);
            if (!widget || !widget.viewModel || !widget.supportsFileReferences) {
                return [];
            }
            const model = widget.getContrib(chatDynamicVariables_1.ChatDynamicVariableModel.ID);
            if (!model) {
                return [];
            }
            return model.variables;
        }
        registerVariable(data, resolver) {
            const key = data.name.toLowerCase();
            if (this._resolver.has(key)) {
                throw new Error(`A chat variable with the name '${data.name}' already exists.`);
            }
            this._resolver.set(key, { data, resolver });
            return (0, lifecycle_1.toDisposable)(() => {
                this._resolver.delete(key);
            });
        }
    };
    exports.ChatVariablesService = ChatVariablesService;
    exports.ChatVariablesService = ChatVariablesService = __decorate([
        __param(0, chat_1.IChatWidgetService)
    ], ChatVariablesService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRWYXJpYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJ6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtRQUtoQyxZQUNxQixpQkFBc0Q7WUFBckMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUhuRSxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFLakQsQ0FBQztRQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUEwQixFQUFFLEtBQWlCLEVBQUUsS0FBd0I7WUFDN0YsTUFBTSxpQkFBaUIsR0FBZ0QsRUFBRSxDQUFDO1lBQzFFLE1BQU0sSUFBSSxHQUFtQixFQUFFLENBQUM7WUFFaEMsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxLQUFLO2lCQUNWLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDcEIsSUFBSSxJQUFJLFlBQVkseUNBQXVCLEVBQUUsQ0FBQztvQkFDN0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUNqRSxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDakYsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDWCxpQkFBaUIs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