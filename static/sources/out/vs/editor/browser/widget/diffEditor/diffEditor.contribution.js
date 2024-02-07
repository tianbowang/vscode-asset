/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "./registrations.contribution"], function (require, exports, dom_1, codicons_1, editorExtensions_1, codeEditorService_1, diffEditorWidget_1, editorContextKeys_1, nls_1, actions_1, commands_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findFocusedDiffEditor = exports.AccessibleDiffViewerPrev = exports.AccessibleDiffViewerNext = exports.ShowAllUnchangedRegions = exports.CollapseAllUnchangedRegions = exports.ExitCompareMove = exports.SwitchSide = exports.ToggleUseInlineViewWhenSpaceIsLimited = exports.ToggleShowMovedCodeBlocks = exports.ToggleCollapseUnchangedRegions = void 0;
    class ToggleCollapseUnchangedRegions extends actions_1.Action2 {
        constructor() {
            super({
                id: 'diffEditor.toggleCollapseUnchangedRegions',
                title: (0, nls_1.localize2)('toggleCollapseUnchangedRegions', 'Toggle Collapse Unchanged Regions'),
                icon: codicons_1.Codicon.map,
                toggled: contextkey_1.ContextKeyExpr.has('config.diffEditor.hideUnchangedRegions.enabled'),
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                menu: {
                    when: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                    id: actions_1.MenuId.EditorTitle,
                    order: 22,
                    group: 'navigation',
                },
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.hideUnchangedRegions.enabled');
            configurationService.updateValue('diffEditor.hideUnchangedRegions.enabled', newValue);
        }
    }
    exports.ToggleCollapseUnchangedRegions = ToggleCollapseUnchangedRegions;
    (0, actions_1.registerAction2)(ToggleCollapseUnchangedRegions);
    class ToggleShowMovedCodeBlocks extends actions_1.Action2 {
        constructor() {
            super({
                id: 'diffEditor.toggleShowMovedCodeBlocks',
                title: (0, nls_1.localize2)('toggleShowMovedCodeBlocks', 'Toggle Show Moved Code Blocks'),
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.experimental.showMoves');
            configurationService.updateValue('diffEditor.experimental.showMoves', newValue);
        }
    }
    exports.ToggleShowMovedCodeBlocks = ToggleShowMovedCodeBlocks;
    (0, actions_1.registerAction2)(ToggleShowMovedCodeBlocks);
    class ToggleUseInlineViewWhenSpaceIsLimited extends actions_1.Action2 {
        constructor() {
            super({
                id: 'diffEditor.toggleUseInlineViewWhenSpaceIsLimited',
                title: (0, nls_1.localize2)('toggleUseInlineViewWhenSpaceIsLimited', 'Toggle Use Inline View When Space Is Limited'),
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.useInlineViewWhenSpaceIsLimited');
            configurationService.updateValue('diffEditor.useInlineViewWhenSpaceIsLimited', newValue);
        }
    }
    exports.ToggleUseInlineViewWhenSpaceIsLimited = ToggleUseInlineViewWhenSpaceIsLimited;
    (0, actions_1.registerAction2)(ToggleUseInlineViewWhenSpaceIsLimited);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: new ToggleUseInlineViewWhenSpaceIsLimited().desc.id,
            title: (0, nls_1.localize)('useInlineViewWhenSpaceIsLimited', "Use Inline View When Space Is Limited"),
            toggled: contextkey_1.ContextKeyExpr.has('config.diffEditor.useInlineViewWhenSpaceIsLimited'),
            precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
        },
        order: 11,
        group: '1_diff',
        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached, contextkey_1.ContextKeyExpr.has('isInDiffEditor')),
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: new ToggleShowMovedCodeBlocks().desc.id,
            title: (0, nls_1.localize)('showMoves', "Show Moved Code Blocks"),
            icon: codicons_1.Codicon.move,
            toggled: contextkey_1.ContextKeyEqualsExpr.create('config.diffEditor.experimental.showMoves', true),
            precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
        },
        order: 10,
        group: '1_diff',
        when: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
    });
    const diffEditorCategory = {
        value: (0, nls_1.localize)('diffEditor', 'Diff Editor'),
        original: 'Diff Editor',
    };
    class SwitchSide extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.switchSide',
                title: (0, nls_1.localize2)('switchSide', 'Switch Side'),
                icon: codicons_1.Codicon.arrowSwap,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, arg) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                if (arg && arg.dryRun) {
                    return { destinationSelection: diffEditor.mapToOtherSide().destinationSelection };
                }
                else {
                    diffEditor.switchSide();
                }
            }
            return undefined;
        }
    }
    exports.SwitchSide = SwitchSide;
    (0, actions_1.registerAction2)(SwitchSide);
    class ExitCompareMove extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.exitCompareMove',
                title: (0, nls_1.localize2)('exitCompareMove', 'Exit Compare Move'),
                icon: codicons_1.Codicon.close,
                precondition: editorContextKeys_1.EditorContextKeys.comparingMovedCode,
                f1: false,
                category: diffEditorCategory,
                keybinding: {
                    weight: 10000,
                    primary: 9 /* KeyCode.Escape */,
                }
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                diffEditor.exitCompareMove();
            }
        }
    }
    exports.ExitCompareMove = ExitCompareMove;
    (0, actions_1.registerAction2)(ExitCompareMove);
    class CollapseAllUnchangedRegions extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.collapseAllUnchangedRegions',
                title: (0, nls_1.localize2)('collapseAllUnchangedRegions', 'Collapse All Unchanged Regions'),
                icon: codicons_1.Codicon.fold,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                diffEditor.collapseAllUnchangedRegions();
            }
        }
    }
    exports.CollapseAllUnchangedRegions = CollapseAllUnchangedRegions;
    (0, actions_1.registerAction2)(CollapseAllUnchangedRegions);
    class ShowAllUnchangedRegions extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.showAllUnchangedRegions',
                title: (0, nls_1.localize2)('showAllUnchangedRegions', 'Show All Unchanged Regions'),
                icon: codicons_1.Codicon.unfold,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                diffEditor.showAllUnchangedRegions();
            }
        }
    }
    exports.ShowAllUnchangedRegions = ShowAllUnchangedRegions;
    (0, actions_1.registerAction2)(ShowAllUnchangedRegions);
    const accessibleDiffViewerCategory = {
        value: (0, nls_1.localize)('accessibleDiffViewer', 'Accessible Diff Viewer'),
        original: 'Accessible Diff Viewer',
    };
    class AccessibleDiffViewerNext extends actions_1.Action2 {
        static { this.id = 'editor.action.accessibleDiffViewer.next'; }
        constructor() {
            super({
                id: AccessibleDiffViewerNext.id,
                title: (0, nls_1.localize2)('editor.action.accessibleDiffViewer.next', 'Go to Next Difference'),
                category: accessibleDiffViewerCategory,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                keybinding: {
                    primary: 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true,
            });
        }
        run(accessor) {
            const diffEditor = findFocusedDiffEditor(accessor);
            diffEditor?.accessibleDiffViewerNext();
        }
    }
    exports.AccessibleDiffViewerNext = AccessibleDiffViewerNext;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: AccessibleDiffViewerNext.id,
            title: (0, nls_1.localize)('Open Accessible Diff Viewer', "Open Accessible Diff Viewer"),
            precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
        },
        order: 10,
        group: '2_diff',
        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.accessibleDiffViewerVisible.negate(), contextkey_1.ContextKeyExpr.has('isInDiffEditor')),
    });
    class AccessibleDiffViewerPrev extends actions_1.Action2 {
        static { this.id = 'editor.action.accessibleDiffViewer.prev'; }
        constructor() {
            super({
                id: AccessibleDiffViewerPrev.id,
                title: (0, nls_1.localize2)('editor.action.accessibleDiffViewer.prev', 'Go to Previous Difference'),
                category: accessibleDiffViewerCategory,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true,
            });
        }
        run(accessor) {
            const diffEditor = findFocusedDiffEditor(accessor);
            diffEditor?.accessibleDiffViewerPrev();
        }
    }
    exports.AccessibleDiffViewerPrev = AccessibleDiffViewerPrev;
    function findFocusedDiffEditor(accessor) {
        const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
        const diffEditors = codeEditorService.listDiffEditors();
        const activeElement = (0, dom_1.getActiveElement)();
        if (activeElement) {
            for (const d of diffEditors) {
                const container = d.getContainerDomNode();
                if (isElementOrParentOf(container, activeElement)) {
                    return d;
                }
            }
        }
        return null;
    }
    exports.findFocusedDiffEditor = findFocusedDiffEditor;
    function isElementOrParentOf(elementOrParent, element) {
        let e = element;
        while (e) {
            if (e === elementOrParent) {
                return true;
            }
            e = e.parentElement;
        }
        return false;
    }
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.diffReview.next', AccessibleDiffViewerNext.id);
    (0, actions_1.registerAction2)(AccessibleDiffViewerNext);
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.diffReview.prev', AccessibleDiffViewerPrev.id);
    (0, actions_1.registerAction2)(AccessibleDiffViewerPrev);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvci5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2RpZmZFZGl0b3IuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1CaEcsTUFBYSw4QkFBK0IsU0FBUSxpQkFBTztRQUMxRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMkNBQTJDO2dCQUMvQyxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsZ0NBQWdDLEVBQUUsbUNBQW1DLENBQUM7Z0JBQ3ZGLElBQUksRUFBRSxrQkFBTyxDQUFDLEdBQUc7Z0JBQ2pCLE9BQU8sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsQ0FBQztnQkFDN0UsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO2dCQUNsRCxJQUFJLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO29CQUMxQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO29CQUN0QixLQUFLLEVBQUUsRUFBRTtvQkFDVCxLQUFLLEVBQUUsWUFBWTtpQkFDbkI7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFlO1lBQ2pELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sUUFBUSxHQUFHLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFVLHlDQUF5QyxDQUFDLENBQUM7WUFDcEcsb0JBQW9CLENBQUMsV0FBVyxDQUFDLHlDQUF5QyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7S0FDRDtJQXRCRCx3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