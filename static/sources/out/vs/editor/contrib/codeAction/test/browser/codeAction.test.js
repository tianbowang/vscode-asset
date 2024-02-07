define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/languageFeatureRegistry", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/test/common/testTextModel", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, utils_1, range_1, languageFeatureRegistry_1, codeAction_1, types_1, testTextModel_1, markers_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function staticCodeActionProvider(...actions) {
        return new class {
            provideCodeActions() {
                return {
                    actions: actions,
                    dispose: () => { }
                };
            }
        };
    }
    suite('CodeAction', () => {
        const langId = 'fooLang';
        const uri = uri_1.URI.parse('untitled:path');
        let model;
        let registry;
        const disposables = new lifecycle_1.DisposableStore();
        const testData = {
            diagnostics: {
                abc: {
                    title: 'bTitle',
                    diagnostics: [{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 2,
                            endColumn: 1,
                            severity: markers_1.MarkerSeverity.Error,
                            message: 'abc'
                        }]
                },
                bcd: {
                    title: 'aTitle',
                    diagnostics: [{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 2,
                            endColumn: 1,
                            severity: markers_1.MarkerSeverity.Error,
                            message: 'bcd'
                        }]
                }
            },
            command: {
                abc: {
                    command: new class {
                    },
                    title: 'Extract to inner function in function "test"'
                }
            },
            spelling: {
                bcd: {
                    diagnostics: [],
                    edit: new class {
                    },
                    title: 'abc'
                }
            },
            tsLint: {
                abc: {
                    $ident: 'funny' + 57,
                    arguments: [],
                    id: '_internal_command_delegation',
                    title: 'abc'
                },
                bcd: {
                    $ident: 'funny' + 47,
                    arguments: [],
                    id: '_internal_command_delegation',
                    title: 'bcd'
                }
            }
        };
        setup(() => {
            registry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
            disposables.clear();
            model = (0, testTextModel_1.createTextModel)('test1\ntest2\ntest3', langId, undefined, uri);
            disposables.add(model);
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('CodeActions are sorted by type, #38623', async () => {
            const provider = staticCodeActionProvider(testData.command.abc, testData.diagnostics.bcd, testData.spelling.bcd, testData.tsLint.bcd, testData.tsLint.abc, testData.diagnostics.abc);
            disposables.add(registry.register('fooLang', provider));
            const expected = [
                // CodeActions with a diagnostics array are shown first without further sorting
                new types_1.CodeActionItem(testData.diagnostics.bcd, provider),
                new types_1.CodeActionItem(testData.diagnostics.abc, provider),
                // CodeActions without diagnostics are shown in the given order without any further sorting
                new types_1.CodeActionItem(testData.command.abc, provider),
                new types_1.CodeActionItem(testData.spelling.bcd, provider),
                new types_1.CodeActionItem(testData.tsLint.bcd, provider),
                new types_1.CodeActionItem(testData.tsLint.abc, provider)
            ];
            const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 1 /* languages.CodeActionTriggerType.Invoke */, triggerAction: types_1.CodeActionTriggerSource.Default }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
            assert.strictEqual(actions.length, 6);
            assert.deepStrictEqual(actions, expected);
        });
        test('getCodeActions should filter by scope', async () => {
            const provider = staticCodeActionProvider({ title: 'a', kind: 'a' }, { title: 'b', kind: 'b' }, { title: 'a.b', kind: 'a.b' });
            disposables.add(registry.register('fooLang', provider));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 2);
                assert.strictEqual(actions[0].action.title, 'a');
                assert.strictEqual(actions[1].action.title, 'a.b');
            }
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a.b') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'a.b');
            }
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a.b.c') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 0);
            }
        });
        test('getCodeActions should forward requested scope to providers', async () => {
            const provider = new class {
                provideCodeActions(_model, _range, context, _token) {
                    return {
                        actions: [
                            { title: context.only || '', kind: context.only }
                        ],
                        dispose: () => { }
                    };
                }
            };
            disposables.add(registry.register('fooLang', provider));
            const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'a');
        });
        test('getCodeActions should not return source code action by default', async () => {
            const provider = staticCodeActionProvider({ title: 'a', kind: types_1.CodeActionKind.Source.value }, { title: 'b', kind: 'b' });
            disposables.add(registry.register('fooLang', provider));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.SourceAction }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'b');
            }
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: types_1.CodeActionKind.Source, includeSourceActions: true } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'a');
            }
        });
        test('getCodeActions should support filtering out some requested source code actions #84602', async () => {
            const provider = staticCodeActionProvider({ title: 'a', kind: types_1.CodeActionKind.Source.value }, { title: 'b', kind: types_1.CodeActionKind.Source.append('test').value }, { title: 'c', kind: 'c' });
            disposables.add(registry.register('fooLang', provider));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), {
                    type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.SourceAction, filter: {
                        include: types_1.CodeActionKind.Source.append('test'),
                        excludes: [types_1.CodeActionKind.Source],
                        includeSourceActions: true,
                    }
                }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'b');
            }
        });
        test('getCodeActions no invoke a provider that has been excluded #84602', async () => {
            const baseType = types_1.CodeActionKind.Refactor;
            const subType = types_1.CodeActionKind.Refactor.append('sub');
            disposables.add(registry.register('fooLang', staticCodeActionProvider({ title: 'a', kind: baseType.value })));
            let didInvoke = false;
            disposables.add(registry.register('fooLang', new class {
                constructor() {
                    this.providedCodeActionKinds = [subType.value];
                }
                provideCodeActions() {
                    didInvoke = true;
                    return {
                        actions: [
                            { title: 'x', kind: subType.value }
                        ],
                        dispose: () => { }
                    };
                }
            }));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), {
                    type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Refactor, filter: {
                        include: baseType,
                        excludes: [subType],
                    }
                }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(didInvoke, false);
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'a');
            }
        });
        test('getCodeActions should not invoke code action providers filtered out by providedCodeActionKinds', async () => {
            let wasInvoked = false;
            const provider = new class {
                constructor() {
                    this.providedCodeActionKinds = [types_1.CodeActionKind.Refactor.value];
                }
                provideCodeActions() {
                    wasInvoked = true;
                    return { actions: [], dispose: () => { } };
                }
            };
            disposables.add(registry.register('fooLang', provider));
            const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), {
                type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Refactor,
                filter: {
                    include: types_1.CodeActionKind.QuickFix
                }
            }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
            assert.strictEqual(actions.length, 0);
            assert.strictEqual(wasInvoked, false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL3Rlc3QvYnJvd3Nlci9jb2RlQWN0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBbUJBLFNBQVMsd0JBQXdCLENBQUMsR0FBRyxPQUErQjtRQUNuRSxPQUFPLElBQUk7WUFDVixrQkFBa0I7Z0JBQ2pCLE9BQU87b0JBQ04sT0FBTyxFQUFFLE9BQU87b0JBQ2hCLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2lCQUNsQixDQUFDO1lBQ0gsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBR0QsS0FBSyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7UUFFeEIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdkMsSUFBSSxLQUFnQixDQUFDO1FBQ3JCLElBQUksUUFBK0QsQ0FBQztRQUNwRSxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBRztZQUNoQixXQUFXLEVBQUU7Z0JBQ1osR0FBRyxFQUFFO29CQUNKLEtBQUssRUFBRSxRQUFRO29CQUNmLFdBQVcsRUFBRSxDQUFDOzRCQUNiLGVBQWUsRUFBRSxDQUFDOzRCQUNsQixXQUFXLEVBQUUsQ0FBQzs0QkFDZCxhQUFhLEVBQUUsQ0FBQzs0QkFDaEIsU0FBUyxFQUFFLENBQUM7NEJBQ1osUUFBUSxFQUFFLHdCQUFjLENBQUMsS0FBSzs0QkFDOUIsT0FBTyxFQUFFLEtBQUs7eUJBQ2QsQ0FBQztpQkFDRjtnQkFDRCxHQUFHLEVBQUU7b0JBQ0osS0FBSyxFQUFFLFFBQVE7b0JBQ2YsV0FBVyxFQUFFLENBQUM7NEJBQ2IsZUFBZSxFQUFFLENBQUM7NEJBQ2xCLFdBQVcsRUFBRSxDQUFDOzRCQUNkLGFBQWEsRUFBRSxDQUFDOzRCQUNoQixTQUFTLEVBQUUsQ0FBQzs0QkFDWixRQUFRLEVBQUUsd0JBQWMsQ0FBQyxLQUFLOzRCQUM5QixPQUFPLEVBQUUsS0FBSzt5QkFDZCxDQUFDO2lCQUNGO2FBQ0Q7WUFDRCxPQUFPLEVBQUU7Z0JBQ1IsR0FBRyxFQUFFO29CQUNKLE9BQU8sRUFBRSxJQUFJO3FCQUdaO29CQUNELEtBQUssRUFBRSw4Q0FBOEM7aUJBQ3JEO2FBQ0Q7WUFDRCxRQUFRLEVBQUU7Z0JBQ1QsR0FBRyxFQUFFO29CQUNKLFdBQVcsRUFBaUIsRUFBRTtvQkFDOUIsSUFBSSxFQUFFLElBQUk7cUJBRVQ7b0JBQ0QsS0FBSyxFQUFFLEtBQUs7aUJBQ1o7YUFDRDtZQUNELE1BQU0sRUFBRTtnQkFDUCxHQUFHLEVBQUU7b0JBQ0osTUFBTSxFQUFFLE9BQU8sR0FBRyxFQUFFO29CQUNwQixTQUFTLEVBQWlCLEVBQUU7b0JBQzVCLEVBQUUsRUFBRSw4QkFBOEI7b0JBQ2xDLEtBQUssRUFBRSxLQUFLO2lCQUNaO2dCQUNELEdBQUcsRUFBRTtvQkFDSixNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUU7b0JBQ3BCLFNBQVMsRUFBaUIsRUFBRTtvQkFDNUIsRUFBRSxFQUFFLDhCQUE4QjtvQkFDbEMsS0FBSyxFQUFFLEtBQUs7aUJBQ1o7YUFDRDtTQUNELENBQUM7UUFFRixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsUUFBUSxHQUFHLElBQUksaURBQXVCLEVBQUUsQ0FBQztZQUN6QyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsS0FBSyxHQUFHLElBQUEsK0JBQWUsRUFBQyxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZFLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUV6RCxNQUFNLFFBQVEsR0FBRyx3QkFBd0IsQ0FDeEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQ3BCLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUN4QixRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFDckIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQ25CLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUNuQixRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDeEIsQ0FBQztZQUVGLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUV4RCxNQUFNLFFBQVEsR0FBRztnQkFDaEIsK0VBQStFO2dCQUMvRSxJQUFJLHNCQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDO2dCQUN0RCxJQUFJLHNCQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDO2dCQUV0RCwyRkFBMkY7Z0JBQzNGLElBQUksc0JBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7Z0JBQ2xELElBQUksc0JBQWMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7Z0JBQ25ELElBQUksc0JBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7Z0JBQ2pELElBQUksc0JBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7YUFDakQsQ0FBQztZQUVGLE1BQU0sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUEsMkJBQWMsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxnREFBd0MsRUFBRSxhQUFhLEVBQUUsK0JBQXVCLENBQUMsT0FBTyxFQUFFLEVBQUUsbUJBQVEsQ0FBQyxJQUFJLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6UCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDeEQsTUFBTSxRQUFRLEdBQUcsd0JBQXdCLENBQ3hDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQ3pCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQ3pCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQzdCLENBQUM7WUFFRixXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFeEQsQ0FBQztnQkFDQSxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFBLDJCQUFjLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksOENBQXNDLEVBQUUsYUFBYSxFQUFFLCtCQUF1QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxzQkFBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxtQkFBUSxDQUFDLElBQUksRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyUyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUVELENBQUM7Z0JBQ0EsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBQSwyQkFBYyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLDhDQUFzQyxFQUFFLGFBQWEsRUFBRSwrQkFBdUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksc0JBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsbUJBQVEsQ0FBQyxJQUFJLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdlMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFFRCxDQUFDO2dCQUNBLE1BQU0sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUEsMkJBQWMsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSw4Q0FBc0MsRUFBRSxhQUFhLEVBQUUsK0JBQXVCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLHNCQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLG1CQUFRLENBQUMsSUFBSSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pTLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNERBQTRELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0UsTUFBTSxRQUFRLEdBQUcsSUFBSTtnQkFDcEIsa0JBQWtCLENBQUMsTUFBVyxFQUFFLE1BQWEsRUFBRSxPQUFvQyxFQUFFLE1BQVc7b0JBQy9GLE9BQU87d0JBQ04sT0FBTyxFQUFFOzRCQUNSLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFO3lCQUNqRDt3QkFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztxQkFDbEIsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQztZQUVGLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUV4RCxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFBLDJCQUFjLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksOENBQXNDLEVBQUUsYUFBYSxFQUFFLCtCQUF1QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxzQkFBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxtQkFBUSxDQUFDLElBQUksRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JTLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdFQUFnRSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2pGLE1BQU0sUUFBUSxHQUFHLHdCQUF3QixDQUN4QyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUNqRCxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUN6QixDQUFDO1lBRUYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRXhELENBQUM7Z0JBQ0EsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBQSwyQkFBYyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLDhDQUFzQyxFQUFFLGFBQWEsRUFBRSwrQkFBdUIsQ0FBQyxZQUFZLEVBQUUsRUFBRSxtQkFBUSxDQUFDLElBQUksRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM1UCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUVELENBQUM7Z0JBQ0EsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBQSwyQkFBYyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLDhDQUFzQyxFQUFFLGFBQWEsRUFBRSwrQkFBdUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLHNCQUFjLENBQUMsTUFBTSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsbUJBQVEsQ0FBQyxJQUFJLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL1QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1RkFBdUYsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN4RyxNQUFNLFFBQVEsR0FBRyx3QkFBd0IsQ0FDeEMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFDakQsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQ2hFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQ3pCLENBQUM7WUFFRixXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFeEQsQ0FBQztnQkFDQSxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFBLDJCQUFjLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDOUcsSUFBSSw4Q0FBc0MsRUFBRSxhQUFhLEVBQUUsK0JBQXVCLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRTt3QkFDeEcsT0FBTyxFQUFFLHNCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7d0JBQzdDLFFBQVEsRUFBRSxDQUFDLHNCQUFjLENBQUMsTUFBTSxDQUFDO3dCQUNqQyxvQkFBb0IsRUFBRSxJQUFJO3FCQUMxQjtpQkFDRCxFQUFFLG1CQUFRLENBQUMsSUFBSSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNsRCxDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUVBQW1FLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEYsTUFBTSxRQUFRLEdBQUcsc0JBQWMsQ0FBQyxRQUFRLENBQUM7WUFDekMsTUFBTSxPQUFPLEdBQUcsc0JBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXRELFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsd0JBQXdCLENBQ3BFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUNwQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN0QixXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUk7Z0JBQUE7b0JBRWhELDRCQUF1QixHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQVczQyxDQUFDO2dCQVRBLGtCQUFrQjtvQkFDakIsU0FBUyxHQUFHLElBQUksQ0FBQztvQkFDakIsT0FBTzt3QkFDTixPQUFPLEVBQUU7NEJBQ1IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFO3lCQUNuQzt3QkFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztxQkFDbEIsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQyxDQUFDLENBQUM7WUFFSixDQUFDO2dCQUNBLE1BQU0sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUEsMkJBQWMsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUM5RyxJQUFJLDhDQUFzQyxFQUFFLGFBQWEsRUFBRSwrQkFBdUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO3dCQUNwRyxPQUFPLEVBQUUsUUFBUTt3QkFDakIsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDO3FCQUNuQjtpQkFDRCxFQUFFLG1CQUFRLENBQUMsSUFBSSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdHQUFnRyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2pILElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN2QixNQUFNLFFBQVEsR0FBRyxJQUFJO2dCQUFBO29CQU1wQiw0QkFBdUIsR0FBRyxDQUFDLHNCQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO2dCQU5BLGtCQUFrQjtvQkFDakIsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDbEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxDQUFDO2FBR0QsQ0FBQztZQUVGLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUV4RCxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFBLDJCQUFjLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDOUcsSUFBSSw4Q0FBc0MsRUFBRSxhQUFhLEVBQUUsK0JBQXVCLENBQUMsUUFBUTtnQkFDM0YsTUFBTSxFQUFFO29CQUNQLE9BQU8sRUFBRSxzQkFBYyxDQUFDLFFBQVE7aUJBQ2hDO2FBQ0QsRUFBRSxtQkFBUSxDQUFDLElBQUksRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=