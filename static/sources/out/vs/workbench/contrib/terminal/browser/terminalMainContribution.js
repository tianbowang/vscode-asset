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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/label/common/label", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/terminal/common/embedderTerminalService"], function (require, exports, lifecycle_1, network_1, label_1, terminal_1, terminal_2, terminalUri_1, terminalStrings_1, editorResolverService_1, embedderTerminalService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalMainContribution = void 0;
    /**
     * The main contribution for the terminal contrib. This contains calls to other components necessary
     * to set up the terminal but don't need to be tracked in the long term (where TerminalService would
     * be more relevant).
     */
    let TerminalMainContribution = class TerminalMainContribution extends lifecycle_1.Disposable {
        constructor(editorResolverService, embedderTerminalService, labelService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
            super();
            // Register terminal editors
            editorResolverService.registerEditor(`${network_1.Schemas.vscodeTerminal}:/**`, {
                id: terminal_2.terminalEditorId,
                label: terminalStrings_1.terminalStrings.terminal,
                priority: editorResolverService_1.RegisteredEditorPriority.exclusive
            }, {
                canSupportResource: uri => uri.scheme === network_1.Schemas.vscodeTerminal,
                singlePerResource: true
            }, {
                createEditorInput: async ({ resource, options }) => {
                    let instance = terminalService.getInstanceFromResource(resource);
                    if (instance) {
                        const sourceGroup = terminalGroupService.getGroupForInstance(instance);
                        sourceGroup?.removeInstance(instance);
                    }
                    else { // Terminal from a different window
                        const terminalIdentifier = (0, terminalUri_1.parseTerminalUri)(resource);
                        if (!terminalIdentifier.instanceId) {
                            throw new Error('Terminal identifier without instanceId');
                        }
                        const primaryBackend = terminalService.getPrimaryBackend();
                        if (!primaryBackend) {
                            throw new Error('No terminal primary backend');
                        }
                        const attachPersistentProcess = await primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
                        if (!attachPersistentProcess) {
                            throw new Error('No terminal persistent process to attach');
                        }
                        instance = terminalInstanceService.createInstance({ attachPersistentProcess }, terminal_1.TerminalLocation.Editor);
                    }
                    const resolvedResource = terminalEditorService.resolveResource(instance);
                    const editor = terminalEditorService.getInputFromResource(resolvedResource);
                    return {
                        editor,
                        options: {
                            ...options,
                            pinned: true,
                            forceReload: true,
                            override: terminal_2.terminalEditorId
                        }
                    };
                }
            });
            // Register a resource formatter for terminal URIs
            labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeTerminal,
                formatting: {
                    label: '${path}',
                    separator: ''
                }
            });
            embedderTerminalService.onDidCreateTerminal(async (embedderTerminal) => {
                const terminal = await terminalService.createTerminal({
                    config: embedderTerminal,
                    location: terminal_1.TerminalLocation.Panel
                });
                terminalService.setActiveInstance(terminal);
                await terminalService.revealActiveTerminal();
            });
        }
    };
    exports.TerminalMainContribution = TerminalMainContribution;
    exports.TerminalMainContribution = TerminalMainContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, embedderTerminalService_1.IEmbedderTerminalService),
        __param(2, label_1.ILabelService),
        __param(3, terminal_2.ITerminalService),
        __param(4, terminal_2.ITerminalEditorService),
        __param(5, terminal_2.ITerminalGroupService),
        __param(6, terminal_2.ITerminalInstanceService)
    ], TerminalMainContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxNYWluQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsTWFpbkNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEc7Ozs7T0FJRztJQUNJLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7UUFDdkQsWUFDeUIscUJBQTZDLEVBQzNDLHVCQUFpRCxFQUM1RCxZQUEyQixFQUN4QixlQUFpQyxFQUMzQixxQkFBNkMsRUFDOUMsb0JBQTJDLEVBQ3hDLHVCQUFpRDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQUVSLDRCQUE0QjtZQUM1QixxQkFBcUIsQ0FBQyxjQUFjLENBQ25DLEdBQUcsaUJBQU8sQ0FBQyxjQUFjLE1BQU0sRUFDL0I7Z0JBQ0MsRUFBRSxFQUFFLDJCQUFnQjtnQkFDcEIsS0FBSyxFQUFFLGlDQUFlLENBQUMsUUFBUTtnQkFDL0IsUUFBUSxFQUFFLGdEQUF3QixDQUFDLFNBQVM7YUFDNUMsRUFDRDtnQkFDQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxjQUFjO2dCQUNoRSxpQkFBaUIsRUFBRSxJQUFJO2FBQ3ZCLEVBQ0Q7Z0JBQ0MsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7b0JBQ2xELElBQUksUUFBUSxHQUFHLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDakUsSUFBSSxRQUFRLEVBQUUsQ0FBQzt3QkFDZCxNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMs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