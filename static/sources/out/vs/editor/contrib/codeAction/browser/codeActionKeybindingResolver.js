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
define(["require", "exports", "vs/base/common/lazy", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/platform/keybinding/common/keybinding"], function (require, exports, lazy_1, codeAction_1, types_1, keybinding_1) {
    "use strict";
    var CodeActionKeybindingResolver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionKeybindingResolver = void 0;
    let CodeActionKeybindingResolver = class CodeActionKeybindingResolver {
        static { CodeActionKeybindingResolver_1 = this; }
        static { this.codeActionCommands = [
            codeAction_1.refactorCommandId,
            codeAction_1.codeActionCommandId,
            codeAction_1.sourceActionCommandId,
            codeAction_1.organizeImportsCommandId,
            codeAction_1.fixAllCommandId
        ]; }
        constructor(keybindingService) {
            this.keybindingService = keybindingService;
        }
        getResolver() {
            // Lazy since we may not actually ever read the value
            const allCodeActionBindings = new lazy_1.Lazy(() => this.keybindingService.getKeybindings()
                .filter(item => CodeActionKeybindingResolver_1.codeActionCommands.indexOf(item.command) >= 0)
                .filter(item => item.resolvedKeybinding)
                .map((item) => {
                // Special case these commands since they come built-in with VS Code and don't use 'commandArgs'
                let commandArgs = item.commandArgs;
                if (item.command === codeAction_1.organizeImportsCommandId) {
                    commandArgs = { kind: types_1.CodeActionKind.SourceOrganizeImports.value };
                }
                else if (item.command === codeAction_1.fixAllCommandId) {
                    commandArgs = { kind: types_1.CodeActionKind.SourceFixAll.value };
                }
                return {
                    resolvedKeybinding: item.resolvedKeybinding,
                    ...types_1.CodeActionCommandArgs.fromUser(commandArgs, {
                        kind: types_1.CodeActionKind.None,
                        apply: "never" /* CodeActionAutoApply.Never */
                    })
                };
            }));
            return (action) => {
                if (action.kind) {
                    const binding = this.bestKeybindingForCodeAction(action, allCodeActionBindings.value);
                    return binding?.resolvedKeybinding;
                }
                return undefined;
            };
        }
        bestKeybindingForCodeAction(action, candidates) {
            if (!action.kind) {
                return undefined;
            }
            const kind = new types_1.CodeActionKind(action.kind);
            return candidates
                .filter(candidate => candidate.kind.contains(kind))
                .filter(candidate => {
                if (candidate.preferred) {
                    // If the candidate keybinding only applies to preferred actions, the this action must also be preferred
                    return action.isPreferred;
                }
                return true;
            })
                .reduceRight((currentBest, candidate) => {
                if (!currentBest) {
                    return candidate;
                }
                // Select the more specific binding
                return currentBest.kind.contains(candidate.kind) ? candidate : currentBest;
            }, undefined);
        }
    };
    exports.CodeActionKeybindingResolver = CodeActionKeybindingResolver;
    exports.CodeActionKeybindingResolver = CodeActionKeybindingResolver = CodeActionKeybindingResolver_1 = __decorate([
        __param(0, keybinding_1.IKeybindingService)
    ], CodeActionKeybindingResolver);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbktleWJpbmRpbmdSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi9icm93c2VyL2NvZGVBY3Rpb25LZXliaW5kaW5nUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE0Qjs7aUJBQ2hCLHVCQUFrQixHQUFzQjtZQUMvRCw4QkFBaUI7WUFDakIsZ0NBQW1CO1lBQ25CLGtDQUFxQjtZQUNyQixxQ0FBd0I7WUFDeEIsNEJBQWU7U0FDZixBQU55QyxDQU14QztRQUVGLFlBQ3NDLGlCQUFxQztZQUFyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1FBQ3ZFLENBQUM7UUFFRSxXQUFXO1lBQ2pCLHFEQUFxRDtZQUNyRCxNQUFNLHFCQUFxQixHQUFHLElBQUksV0FBSSxDQUF5QyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFO2lCQUMxSCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyw4QkFBNEIsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0YsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO2lCQUN2QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQStCLEVBQUU7Z0JBQzFDLGdHQUFnRztnQkFDaEcsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLHFDQUF3QixFQUFFLENBQUM7b0JBQy9DLFdBQVcsR0FBRyxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwRSxDQUFDO3FCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyw0QkFBZSxFQUFFLENBQUM7b0JBQzdDLFdBQVcsR0FBRyxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDM0QsQ0FBQztnQkFFRCxPQUFPO29CQUNOLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBbUI7b0JBQzVDLEdBQUcsNkJBQXFCLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTt3QkFDOUMsSUFBSSxFQUFFLHNCQUFjLENBQUMsSUFBSTt3QkFDekIsS0FBSyx5Q0FBMkI7cUJBQ2hDLENBQUM7aUJBQ0YsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFTCxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ2pCLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN0RixPQUFPLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztnQkFDcEMsQ0FBQztnQkFDRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUM7UUFDSCxDQUFDO1FBRU8sMkJBQTJCLENBQ2xDLE1BQWtCLEVBQ2xCLFVBQWtEO1lBRWxELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLHNCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdDLE9BQU8sVUFBVTtpQkFDZixNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNuQixJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDekIsd0dBQXdHO29CQUN4RyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQzNCLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUM7aUJBQ0QsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ2xCLE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDO2dCQUNELG1DQUFtQztnQkFDbkMsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQzVFLENBQUMsRUFBRSxTQUFvRCxDQUFDLENBQUM7UUFDM0QsQ0FBQzs7SUF0RVcsb0VBQTRCOzJDQUE1Qiw0QkFBNEI7UUFVdEMsV0FBQSwrQkFBa0IsQ0FBQTtPQVZSLDRCQUE0QixDQXVFeEMifQ==