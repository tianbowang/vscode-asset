/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver", "vs/editor/contrib/codeAction/common/types", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, assert, keybindings_1, codeAction_1, codeActionKeybindingResolver_1, types_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CodeActionKeybindingResolver', () => {
        const refactorKeybinding = createCodeActionKeybinding(31 /* KeyCode.KeyA */, codeAction_1.refactorCommandId, { kind: types_1.CodeActionKind.Refactor.value });
        const refactorExtractKeybinding = createCodeActionKeybinding(32 /* KeyCode.KeyB */, codeAction_1.refactorCommandId, { kind: types_1.CodeActionKind.Refactor.append('extract').value });
        const organizeImportsKeybinding = createCodeActionKeybinding(33 /* KeyCode.KeyC */, codeAction_1.organizeImportsCommandId, undefined);
        test('Should match refactor keybindings', async function () {
            const resolver = new codeActionKeybindingResolver_1.CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '' }), undefined);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.append('extract').value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.QuickFix.value }), undefined);
        });
        test('Should prefer most specific keybinding', async function () {
            const resolver = new codeActionKeybindingResolver_1.CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.append('extract').value }), refactorExtractKeybinding.resolvedKeybinding);
        });
        test('Organize imports should still return a keybinding even though it does not have args', async function () {
            const resolver = new codeActionKeybindingResolver_1.CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.SourceOrganizeImports.value }), organizeImportsKeybinding.resolvedKeybinding);
        });
    });
    function createMockKeyBindingService(items) {
        return {
            getKeybindings: () => {
                return items;
            },
        };
    }
    function createCodeActionKeybinding(keycode, command, commandArgs) {
        return new resolvedKeybindingItem_1.ResolvedKeybindingItem(new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding([new keybindings_1.KeyCodeChord(false, true, false, false, keycode)], 3 /* OperatingSystem.Linux */), command, commandArgs, undefined, false, null, false);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbktleWJpbmRpbmdSZXNvbHZlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL3Rlc3QvYnJvd3Nlci9jb2RlQWN0aW9uS2V5YmluZGluZ1Jlc29sdmVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtRQUMxQyxNQUFNLGtCQUFrQixHQUFHLDBCQUEwQix3QkFFcEQsOEJBQWlCLEVBQ2pCLEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFMUMsTUFBTSx5QkFBeUIsR0FBRywwQkFBMEIsd0JBRTNELDhCQUFpQixFQUNqQixFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUU1RCxNQUFNLHlCQUF5QixHQUFHLDBCQUEwQix3QkFFM0QscUNBQXdCLEVBQ3hCLFNBQVMsQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLG1DQUFtQyxFQUFFLEtBQUs7WUFDOUMsTUFBTSxRQUFRLEdBQUcsSUFBSSwyREFBNEIsQ0FDaEQsMkJBQTJCLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQ2pELENBQUMsV0FBVyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLFdBQVcsQ0FDakIsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLFNBQVMsQ0FBQyxDQUFDO1lBRVosTUFBTSxDQUFDLFdBQVcsQ0FDakIsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxRQUFRLENBQUMs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