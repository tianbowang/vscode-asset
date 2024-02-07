/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/keybinding/test/common/keybindingsTestUtils"], function (require, exports, assert, keybindings_1, keyCodes_1, platform_1, contextkey_1, keybindingResolver_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, keybindingsTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: (key) => {
                return ctx[key];
            }
        };
    }
    suite('KeybindingResolver', () => {
        function kbItem(keybinding, command, commandArgs, when, isDefault) {
            const resolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, platform_1.OS);
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, command, commandArgs, when, isDefault, null, false);
        }
        function getDispatchStr(chord) {
            return usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.getDispatchStr(chord);
        }
        test('resolve key', () => {
            const keybinding = 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */;
            const runtimeKeybinding = (0, keybindings_1.createSimpleKeybinding)(keybinding, platform_1.OS);
            const contextRules = contextkey_1.ContextKeyExpr.equals('bar', 'baz');
            const keybindingItem = kbItem(keybinding, 'yes', null, contextRules, true);
            assert.strictEqual(contextRules.evaluate(createContext({ bar: 'baz' })), true);
            assert.strictEqual(contextRules.evaluate(createContext({ bar: 'bz' })), false);
            const resolver = new keybindingResolver_1.KeybindingResolver([keybindingItem], [], () => { });
            const r1 = resolver.resolve(createContext({ bar: 'baz' }), [], getDispatchStr(runtimeKeybinding));
            assert.ok(r1.kind === 2 /* ResultKind.KbFound */);
            assert.strictEqual(r1.commandId, 'yes');
            const r2 = resolver.resolve(createContext({ bar: 'bz' }), [], getDispatchStr(runtimeKeybinding));
            assert.strictEqual(r2.kind, 0 /* ResultKind.NoMatchingKb */);
        });
        test('resolve key with arguments', () => {
            const commandArgs = { text: 'no' };
            const keybinding = 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */;
            const runtimeKeybinding = (0, keybindings_1.createSimpleKeybinding)(keybinding, platform_1.OS);
            const contextRules = contextkey_1.ContextKeyExpr.equals('bar', 'baz');
            const keybindingItem = kbItem(keybinding, 'yes', commandArgs, contextRules, true);
            const resolver = new keybindingResolver_1.KeybindingResolver([keybindingItem], [], () => { });
            const r = resolver.resolve(createContext({ bar: 'baz' }), [], getDispatchStr(runtimeKeybinding));
            assert.ok(r.kind === 2 /* ResultKind.KbFound */);
            assert.strictEqual(r.commandArgs, commandArgs);
        });
        suite('handle keybinding removals', () => {
            test('simple 1', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true)
                ];
                const overrides = [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), false),
                ]);
            });
            test('simple 2', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(33 /* KeyCode.KeyC */, 'yes3', null, contextkey_1.ContextKeyExpr.equals('3', 'c'), false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true),
                    kbItem(33 /* KeyCode.KeyC */, 'yes3', null, contextkey_1.ContextKeyExpr.equals('3', 'c'), false),
                ]);
            });
            test('removal with not matching when', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'b'), false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('removal with not matching keybinding', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(32 /* KeyCode.KeyB */, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('removal with matching keybinding and when', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('removal with unspecified keybinding', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(0, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('removal with unspecified when', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, undefined, false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('removal with unspecified when and unspecified keybinding', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(0, '-yes1', null, undefined, false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('issue #138997 - removal in default list', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, undefined, true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, undefined, true),
                    kbItem(0, '-yes1', null, undefined, false)
                ];
                const overrides = [];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, undefined, true)
                ]);
            });
            test('issue #612#issuecomment-222109084 cannot remove keybindings for commands with ^', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, '^yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, undefined, false)
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
                ]);
            });
            test('issue #140884 Unable to reassign F1 as keybinding for Show All Commands', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, undefined, false),
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, false),
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, false)
                ]);
            });
            test('issue #141638: Keyboard Shortcuts: Change When Expression might actually remove keybinding in Insiders', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, contextkey_1.ContextKeyExpr.equals('a', '1'), false),
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, undefined, false),
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, contextkey_1.ContextKeyExpr.equals('a', '1'), false)
                ]);
            });
            test('issue #157751: Auto-quoting of context keys prevents removal of keybindings via UI', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, contextkey_1.ContextKeyExpr.deserialize(`editorTextFocus && activeEditor != workbench.editor.notebook && editorLangId in julia.supportedLanguageIds`), true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, contextkey_1.ContextKeyExpr.deserialize(`editorTextFocus && activeEditor != 'workbench.editor.notebook' && editorLangId in 'julia.supportedLanguageIds'`), false),
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, []);
            });
            test('issue #160604: Remove keybindings with when clause does not work', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, contextkey_1.ContextKeyExpr.true(), false),
                ];
                const actual = keybindingResolver_1.KeybindingResolver.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, []);
            });
            test('contextIsEntirelyIncluded', () => {
                const toContextKeyExpression = (expr) => {
                    if (typeof expr === 'string' || !expr) {
                        return contextkey_1.ContextKeyExpr.deserialize(expr);
                    }
                    return expr;
                };
                const assertIsIncluded = (a, b) => {
                    assert.strictEqual(keybindingResolver_1.KeybindingResolver.whenIsEntirelyIncluded(toContextKeyExpression(a), toContextKeyExpression(b)), true);
                };
                const assertIsNotIncluded = (a, b) => {
                    assert.strictEqual(keybindingResolver_1.KeybindingResolver.whenIsEntirelyIncluded(toContextKeyExpression(a), toContextKeyExpression(b)), false);
                };
                assertIsIncluded(null, null);
                assertIsIncluded(null, contextkey_1.ContextKeyExpr.true());
                assertIsIncluded(contextkey_1.ContextKeyExpr.true(), null);
                assertIsIncluded(contextkey_1.ContextKeyExpr.true(), contextkey_1.ContextKeyExpr.true());
                assertIsIncluded('key1', null);
                assertIsIncluded('key1', '');
                assertIsIncluded('key1', 'key1');
                assertIsIncluded('key1', contextkey_1.ContextKeyExpr.true());
                assertIsIncluded('!key1', '');
                assertIsIncluded('!key1', '!key1');
                assertIsIncluded('key2', '');
                assertIsIncluded('key2', 'key2');
                assertIsIncluded('key1 && key1 && key2 && key2', 'key2');
                assertIsIncluded('key1 && key2', 'key2');
                assertIsIncluded('key1 && key2', 'key1');
                assertIsIncluded('key1 && key2', '');
                assertIsIncluded('key1', 'key1 || key2');
                assertIsIncluded('key1 || !key1', 'key2 || !key2');
                assertIsIncluded('key1', 'key1 || key2 && key3');
                assertIsNotIncluded('key1', '!key1');
                assertIsNotIncluded('!key1', 'key1');
                assertIsNotIncluded('key1 && key2', 'key3');
                assertIsNotIncluded('key1 && key2', 'key4');
                assertIsNotIncluded('key1', 'key2');
                assertIsNotIncluded('key1 || key2', 'key2');
                assertIsNotIncluded('', 'key2');
                assertIsNotIncluded(null, 'key2');
            });
        });
        suite('resolve command', () => {
            function _kbItem(keybinding, command, when) {
                return kbItem(keybinding, command, null, when, true);
            }
            const items = [
                // This one will never match because its "when" is always overwritten by another one
                _kbItem(54 /* KeyCode.KeyX */, 'first', contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('key1', true), contextkey_1.ContextKeyExpr.notEquals('key2', false))),
                // This one always overwrites first
                _kbItem(54 /* KeyCode.KeyX */, 'second', contextkey_1.ContextKeyExpr.equals('key2', true)),
                // This one is a secondary mapping for `second`
                _kbItem(56 /* KeyCode.KeyZ */, 'second', undefined),
                // This one sometimes overwrites first
                _kbItem(54 /* KeyCode.KeyX */, 'third', contextkey_1.ContextKeyExpr.equals('key3', true)),
                // This one is always overwritten by another one
                _kbItem(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'fourth', contextkey_1.ContextKeyExpr.equals('key4', true)),
                // This one overwrites with a chord the previous one
                _kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */), 'fifth', undefined),
                // This one has no keybinding
                _kbItem(0, 'sixth', undefined),
                _kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'seventh', undefined),
                _kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), 'seventh', undefined),
                _kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'uncomment lines', undefined),
                _kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), // cmd+k cmd+c
                'comment lines', undefined),
                _kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), // cmd+g cmd+c
                'unreachablechord', undefined),
                _kbItem(2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, // cmd+g
                'eleven', undefined),
                _kbItem([2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 31 /* KeyCode.KeyA */, 32 /* KeyCode.KeyB */], // cmd+k a b
                'long multi chord', undefined),
                _kbItem([2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */], // cmd+b cmd+c
                'shadowed by long-multi-chord-2', undefined),
                _kbItem([2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, 39 /* KeyCode.KeyI */], // cmd+b cmd+c i
                'long-multi-chord-2', undefined)
            ];
            const resolver = new keybindingResolver_1.KeybindingResolver(items, [], () => { });
            const testKbLookupByCommand = (commandId, expectedKeys) => {
                // Test lookup
                const lookupResult = resolver.lookupKeybindings(commandId);
                assert.strictEqual(lookupResult.length, expectedKeys.length, 'Length mismatch @ commandId ' + commandId);
                for (let i = 0, len = lookupResult.length; i < len; i++) {
                    const expected = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(expectedKeys[i], platform_1.OS);
                    assert.strictEqual(lookupResult[i].resolvedKeybinding.getUserSettingsLabel(), expected.getUserSettingsLabel(), 'value mismatch @ commandId ' + commandId);
                }
            };
            const testResolve = (ctx, _expectedKey, commandId) => {
                const expectedKeybinding = (0, keybindings_1.decodeKeybinding)(_expectedKey, platform_1.OS);
                const previousChord = [];
                for (let i = 0, len = expectedKeybinding.chords.length; i < len; i++) {
                    const chord = getDispatchStr(expectedKeybinding.chords[i]);
                    const result = resolver.resolve(ctx, previousChord, chord);
                    if (i === len - 1) {
                        // if it's the final chord, then we should find a valid command,
                        // and there should not be a chord.
                        assert.ok(result.kind === 2 /* ResultKind.KbFound */, `Enters multi chord for ${commandId} at chord ${i}`);
                        assert.strictEqual(result.commandId, commandId, `Enters multi chord for ${commandId} at chord ${i}`);
                    }
                    else if (i > 0) {
                        // if this is an intermediate chord, we should not find a valid command,
                        // and there should be an open chord we continue.
                        assert.ok(result.kind === 1 /* ResultKind.MoreChordsNeeded */, `Continues multi chord for ${commandId} at chord ${i}`);
                    }
                    else {
                        // if it's not the final chord and not an intermediate, then we should not
                        // find a valid command, and we should enter a chord.
                        assert.ok(result.kind === 1 /* ResultKind.MoreChordsNeeded */, `Enters multi chord for ${commandId} at chord ${i}`);
                    }
                    previousChord.push(chord);
                }
            };
            test('resolve command - 1', () => {
                testKbLookupByCommand('first', []);
            });
            test('resolve command - 2', () => {
                testKbLookupByCommand('second', [56 /* KeyCode.KeyZ */, 54 /* KeyCode.KeyX */]);
                testResolve(createContext({ key2: true }), 54 /* KeyCode.KeyX */, 'second');
                testResolve(createContext({}), 56 /* KeyCode.KeyZ */, 'second');
            });
            test('resolve command - 3', () => {
                testKbLookupByCommand('third', [54 /* KeyCode.KeyX */]);
                testResolve(createContext({ key3: true }), 54 /* KeyCode.KeyX */, 'third');
            });
            test('resolve command - 4', () => {
                testKbLookupByCommand('fourth', []);
            });
            test('resolve command - 5', () => {
                testKbLookupByCommand('fifth', [(0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */)]);
                testResolve(createContext({}), (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */), 'fifth');
            });
            test('resolve command - 6', () => {
                testKbLookupByCommand('seventh', [(0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)]);
                testResolve(createContext({}), (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), 'seventh');
            });
            test('resolve command - 7', () => {
                testKbLookupByCommand('uncomment lines', [(0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */)]);
                testResolve(createContext({}), (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'uncomment lines');
            });
            test('resolve command - 8', () => {
                testKbLookupByCommand('comment lines', [(0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */)]);
                testResolve(createContext({}), (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), 'comment lines');
            });
            test('resolve command - 9', () => {
                testKbLookupByCommand('unreachablechord', []);
            });
            test('resolve command - 10', () => {
                testKbLookupByCommand('eleven', [2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */]);
                testResolve(createContext({}), 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 'eleven');
            });
            test('resolve command - 11', () => {
                testKbLookupByCommand('sixth', []);
            });
            test('resolve command - 12', () => {
                testKbLookupByCommand('long multi chord', [[2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 31 /* KeyCode.KeyA */, 32 /* KeyCode.KeyB */]]);
                testResolve(createContext({}), [2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 31 /* KeyCode.KeyA */, 32 /* KeyCode.KeyB */], 'long multi chord');
            });
            const emptyContext = createContext({});
            test('KBs having common prefix - the one defined later is returned', () => {
                testResolve(emptyContext, [2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, 39 /* KeyCode.KeyI */], 'long-multi-chord-2');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ1Jlc29sdmVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJpbmRpbmcvdGVzdC9jb21tb24va2V5YmluZGluZ1Jlc29sdmVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsU0FBUyxhQUFhLENBQUMsR0FBUTtRQUM5QixPQUFPO1lBQ04sUUFBUSxFQUFFLENBQUMsR0FBVyxFQUFFLEVBQUU7Z0JBQ3pCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFFaEMsU0FBUyxNQUFNLENBQUMsVUFBNkIsRUFBRSxPQUFlLEVBQUUsV0FBZ0IsRUFBRSxJQUFzQyxFQUFFLFNBQWtCO1lBQzNJLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx1REFBZ0MsRUFBQyxVQUFVLEVBQUUsYUFBRSxDQUFDLENBQUM7WUFDNUUsT0FBTyxJQUFJLCtDQUFzQixDQUNoQyxrQkFBa0IsRUFDbEIsT0FBTyxFQUNQLFdBQVcsRUFDWCxJQUFJLEVBQ0osU0FBUyxFQUNULElBQUksRUFDSixLQUFLLENBQ0wsQ0FBQztRQUNILENBQUM7UUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFtQjtZQUMxQyxPQUFPLHVEQUEwQixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7WUFDeEIsTUFBTSxVQUFVLEdBQUcsbURBQTZCLHdCQUFlLENBQUM7WUFDaEUsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLG9DQUFzQixFQUFDLFVBQVUsRUFBRSxhQUFFLENBQUMsQ0FBQztZQUNqRSxNQUFNLFlBQVksR0FBRywyQkFB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