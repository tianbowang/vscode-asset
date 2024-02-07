/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/base/browser/ui/codicons/codiconStyles", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, codicons_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toMenuItems = void 0;
    const uncategorizedCodeActionGroup = Object.freeze({ kind: types_1.CodeActionKind.Empty, title: (0, nls_1.localize)('codeAction.widget.id.more', 'More Actions...') });
    const codeActionGroups = Object.freeze([
        { kind: types_1.CodeActionKind.QuickFix, title: (0, nls_1.localize)('codeAction.widget.id.quickfix', 'Quick Fix') },
        { kind: types_1.CodeActionKind.RefactorExtract, title: (0, nls_1.localize)('codeAction.widget.id.extract', 'Extract'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.RefactorInline, title: (0, nls_1.localize)('codeAction.widget.id.inline', 'Inline'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.RefactorRewrite, title: (0, nls_1.localize)('codeAction.widget.id.convert', 'Rewrite'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.RefactorMove, title: (0, nls_1.localize)('codeAction.widget.id.move', 'Move'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.SurroundWith, title: (0, nls_1.localize)('codeAction.widget.id.surround', 'Surround With'), icon: codicons_1.Codicon.surroundWith },
        { kind: types_1.CodeActionKind.Source, title: (0, nls_1.localize)('codeAction.widget.id.source', 'Source Action'), icon: codicons_1.Codicon.symbolFile },
        uncategorizedCodeActionGroup,
    ]);
    function toMenuItems(inputCodeActions, showHeaders, keybindingResolver) {
        if (!showHeaders) {
            return inputCodeActions.map((action) => {
                return {
                    kind: "action" /* ActionListItemKind.Action */,
                    item: action,
                    group: uncategorizedCodeActionGroup,
                    disabled: !!action.action.disabled,
                    label: action.action.disabled || action.action.title,
                    canPreview: !!action.action.edit?.edits.length,
                };
            });
        }
        // Group code actions
        const menuEntries = codeActionGroups.map(group => ({ group, actions: [] }));
        for (const action of inputCodeActions) {
            const kind = action.action.kind ? new types_1.CodeActionKind(action.action.kind) : types_1.CodeActionKind.None;
            for (const menuEntry of menuEntries) {
                if (menuEntry.group.kind.contains(kind)) {
                    menuEntry.actions.push(action);
                    break;
                }
            }
        }
        const allMenuItems = [];
        for (const menuEntry of menuEntries) {
            if (menuEntry.actions.length) {
                allMenuItems.push({ kind: "header" /* ActionListItemKind.Header */, group: menuEntry.group });
                for (const action of menuEntry.actions) {
                    const group = menuEntry.group;
                    allMenuItems.push({
                        kind: "action" /* ActionListItemKind.Action */,
                        item: action,
                        group: action.action.isAI ? { title: group.title, kind: group.kind, icon: codicons_1.Codicon.sparkle } : group,
                        label: action.action.title,
                        disabled: !!action.action.disabled,
                        keybinding: keybindingResolver(action.action),
                    });
                }
            }
        }
        return allMenuItems;
    }
    exports.toMenuItems = toMenuItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbk1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVBY3Rpb24vYnJvd3Nlci9jb2RlQWN0aW9uTWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQU0sNEJBQTRCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFakssTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFnQjtRQUNyRCxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsV0FBVyxDQUFDLEVBQUU7UUFDaEcsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRTtRQUMxSCxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFO1FBQ3ZILEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw4QkFBOEIsRUFBRSxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxNQUFNLEVBQUU7UUFDMUgsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxZQUFZ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