define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/keybinding/test/common/keybindingsTestUtils", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, keyCodes_1, keybindings_1, lifecycle_1, platform_1, severity_1, contextkey_1, abstractKeybindingService_1, keybindingResolver_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, keybindingsTestUtils_1, log_1, notification_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: (key) => {
                return ctx[key];
            }
        };
    }
    suite('AbstractKeybindingService', () => {
        class TestKeybindingService extends abstractKeybindingService_1.AbstractKeybindingService {
            constructor(resolver, contextKeyService, commandService, notificationService) {
                super(contextKeyService, commandService, telemetryUtils_1.NullTelemetryService, notificationService, new log_1.NullLogService());
                this._resolver = resolver;
            }
            _getResolver() {
                return this._resolver;
            }
            _documentHasFocus() {
                return true;
            }
            resolveKeybinding(kb) {
                return usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(kb, platform_1.OS);
            }
            resolveKeyboardEvent(keyboardEvent) {
                const chord = new keybindings_1.KeyCodeChord(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode).toKeybinding();
                return this.resolveKeybinding(chord)[0];
            }
            resolveUserBinding(userBinding) {
                return [];
            }
            testDispatch(kb) {
                const keybinding = (0, keybindings_1.createSimpleKeybinding)(kb, platform_1.OS);
                return this._dispatch({
                    _standardKeyboardEventBrand: true,
                    ctrlKey: keybinding.ctrlKey,
                    shiftKey: keybinding.shiftKey,
                    altKey: keybinding.altKey,
                    metaKey: keybinding.metaKey,
                    altGraphKey: false,
                    keyCode: keybinding.keyCode,
                    code: null
                }, null);
            }
            _dumpDebugInfo() {
                return '';
            }
            _dumpDebugInfoJSON() {
                return '';
            }
            registerSchemaContribution() {
                // noop
            }
            enableKeybindingHoldMode() {
                return undefined;
            }
        }
        let createTestKeybindingService = null;
        let currentContextValue = null;
        let executeCommandCalls = null;
        let showMessageCalls = null;
        let statusMessageCalls = null;
        let statusMessageCallsDisposed = null;
        setup(() => {
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            createTestKeybindingService = (items) => {
                const contextKeyService = {
                    _serviceBrand: undefined,
                    onDidChangeContext: undefined,
                    bufferChangeEvents() { },
                    createKey: undefined,
                    contextMatchesRules: undefined,
                    getContextKeyValue: undefined,
                    createScoped: undefined,
                    createOverlay: undefined,
                    getContext: (target) => {
                        return currentContextValue;
                    },
                    updateParent: () => { }
                };
                const commandService = {
                    _serviceBrand: undefined,
                    onWillExecuteCommand: () => lifecycle_1.Disposable.None,
                    onDidExecuteCommand: () => lifecycle_1.Disposable.None,
                    executeCommand: (commandId, ...args) => {
                        executeCommandCalls.push({
                            commandId: commandId,
                            args: args
                        });
                        return Promise.resolve(undefined);
                    }
                };
                const notificationService = {
                    _serviceBrand: undefined,
                    onDidAddNotification: undefined,
                    onDidRemoveNotification: undefined,
                    onDidChangeFilter: undefined,
                    notify: (notification) => {
                        showMessageCalls.push({ sev: notification.severity, message: notification.message });
                        return new notification_1.NoOpNotification();
                    },
                    info: (message) => {
                        showMessageCalls.push({ sev: severity_1.default.Info, message });
                        return new notification_1.NoOpNotification();
                    },
                    warn: (message) => {
                        showMessageCalls.push({ sev: severity_1.default.Warning, message });
                        return new notification_1.NoOpNotification();
                    },
                    error: (message) => {
                        showMessageCalls.push({ sev: severity_1.default.Error, message });
                        return new notification_1.NoOpNotification();
                    },
                    prompt(severity, message, choices, options) {
                        throw new Error('not implemented');
                    },
                    status(message, options) {
                        statusMessageCalls.push(message);
                        return {
                            dispose: () => {
                                statusMessageCallsDisposed.push(message);
                            }
                        };
                    },
                    setFilter() {
                        throw new Error('not implemented');
                    },
                    getFilter() {
                        throw new Error('not implemented');
                    },
                    getFilters() {
                        throw new Error('not implemented');
                    },
                    removeFilter() {
                        throw new Error('not implemented');
                    }
                };
                const resolver = new keybindingResolver_1.KeybindingResolver(items, [], () => { });
                return new TestKeybindingService(resolver, contextKeyService, commandService, notificationService);
            };
        });
        teardown(() => {
            currentContextValue = null;
            executeCommandCalls = null;
            showMessageCalls = null;
            createTestKeybindingService = null;
            statusMessageCalls = null;
            statusMessageCallsDisposed = null;
        });
        function kbItem(keybinding, command, when) {
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem((0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, platform_1.OS), command, null, when, true, null, false);
        }
        function toUsLabel(keybinding) {
            return (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, platform_1.OS).getLabel();
        }
        suite('simple tests: single- and multi-chord keybindings are dispatched', () => {
            test('a single-chord keybinding is dispatched correctly; this test makes sure the dispatch in general works before we test empty-string/null command ID', () => {
                const key = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                ]);
                currentContextValue = createContext({});
                const shouldPreventDefault = kbService.testDispatch(key);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, ([{ commandId: "myCommand", args: [null] }]));
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                kbService.dispose();
            });
            test('a multi-chord keybinding is dispatched correctly', () => {
                const chord0 = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const chord1 = 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */;
                const key = [chord0, chord1];
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                ]);
                currentContextValue = createContext({});
                let shouldPreventDefault = kbService.testDispatch(chord0);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                shouldPreventDefault = kbService.testDispatch(chord1);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, ([{ commandId: "myCommand", args: [null] }]));
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                kbService.dispose();
            });
        });
        suite('keybindings with empty-string/null command ID', () => {
            test('a single-chord keybinding with an empty string command ID unbinds the keybinding (shouldPreventDefault = false)', () => {
                const kbService = createTestKeybindingService([
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'myCommand'),
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, ''),
                ]);
                // send Ctrl/Cmd + K
                currentContextValue = createContext({});
                const shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, false);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                kbService.dispose();
            });
            test('a single-chord keybinding with a null command ID unbinds the keybinding (shouldPreventDefault = false)', () => {
                const kbService = createTestKeybindingService([
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'myCommand'),
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, null),
                ]);
                // send Ctrl/Cmd + K
                currentContextValue = createContext({});
                const shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, false);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                kbService.dispose();
            });
            test('a multi-chord keybinding with an empty-string command ID keeps the keybinding (shouldPreventDefault = true)', () => {
                const chord0 = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const chord1 = 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */;
                const key = [chord0, chord1];
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                    kbItem(key, ''),
                ]);
                currentContextValue = createContext({});
                let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`, `The key combination (${toUsLabel(chord0)}, ${toUsLabel(chord1)}) is not a command.`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                kbService.dispose();
            });
            test('a multi-chord keybinding with a null command ID keeps the keybinding (shouldPreventDefault = true)', () => {
                const chord0 = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const chord1 = 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */;
                const key = [chord0, chord1];
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                    kbItem(key, null),
                ]);
                currentContextValue = createContext({});
                let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`, `The key combination (${toUsLabel(chord0)}, ${toUsLabel(chord1)}) is not a command.`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                kbService.dispose();
            });
        });
        test('issue #16498: chord mode is quit for invalid chords', () => {
            const kbService = createTestKeybindingService([
                kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */), 'chordCommand'),
                kbItem(1 /* KeyCode.Backspace */, 'simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send backspace
            shouldPreventDefault = kbService.testDispatch(1 /* KeyCode.Backspace */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, [
                `The key combination (${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}, ${toUsLabel(1 /* KeyCode.Backspace */)}) is not a command.`
            ]);
            assert.deepStrictEqual(statusMessageCallsDisposed, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send backspace
            shouldPreventDefault = kbService.testDispatch(1 /* KeyCode.Backspace */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('issue #16833: Keybinding service should not testDispatch on modifier keys', () => {
            const kbService = createTestKeybindingService([
                kbItem(5 /* KeyCode.Ctrl */, 'nope'),
                kbItem(57 /* KeyCode.Meta */, 'nope'),
                kbItem(6 /* KeyCode.Alt */, 'nope'),
                kbItem(4 /* KeyCode.Shift */, 'nope'),
                kbItem(2048 /* KeyMod.CtrlCmd */, 'nope'),
                kbItem(256 /* KeyMod.WinCtrl */, 'nope'),
                kbItem(512 /* KeyMod.Alt */, 'nope'),
                kbItem(1024 /* KeyMod.Shift */, 'nope'),
            ]);
            function assertIsIgnored(keybinding) {
                const shouldPreventDefault = kbService.testDispatch(keybinding);
                assert.strictEqual(shouldPreventDefault, false);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                executeCommandCalls = [];
                showMessageCalls = [];
                statusMessageCalls = [];
                statusMessageCallsDisposed = [];
            }
            assertIsIgnored(5 /* KeyCode.Ctrl */);
            assertIsIgnored(57 /* KeyCode.Meta */);
            assertIsIgnored(6 /* KeyCode.Alt */);
            assertIsIgnored(4 /* KeyCode.Shift */);
            assertIsIgnored(2048 /* KeyMod.CtrlCmd */);
            assertIsIgnored(256 /* KeyMod.WinCtrl */);
            assertIsIgnored(512 /* KeyMod.Alt */);
            assertIsIgnored(1024 /* KeyMod.Shift */);
            kbService.dispose();
        });
        test('can trigger command that is sharing keybinding with chord', () => {
            const kbService = createTestKeybindingService([
                kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */), 'chordCommand'),
                kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'simpleCommand', contextkey_1.ContextKeyExpr.has('key1')),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({
                key1: true
            });
            let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + X
            currentContextValue = createContext({});
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'chordCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('cannot trigger chord if command is overwriting', () => {
            const kbService = createTestKeybindingService([
                kbItem((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */), 'chordCommand', contextkey_1.ContextKeyExpr.has('key1')),
                kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + K
            currentContextValue = createContext({
                key1: true
            });
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + X
            currentContextValue = createContext({
                key1: true
            });
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */);
            assert.strictEqual(shouldPreventDefault, false);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('can have spying command', () => {
            const kbService = createTestKeybindingService([
                kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, '^simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            const shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, false);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RLZXliaW5kaW5nU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9rZXliaW5kaW5nL3Rlc3QvY29tbW9uL2Fic3RyYWN0S2V5YmluZGluZ1NlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFzQkEsU0FBUyxhQUFhLENBQUMsR0FBUTtRQUM5QixPQUFPO1lBQ04sUUFBUSxFQUFFLENBQUMsR0FBVyxFQUFFLEVBQUU7Z0JBQ3pCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7UUFFdkMsTUFBTSxxQkFBc0IsU0FBUSxxREFBeUI7WUFHNUQsWUFDQyxRQUE0QixFQUM1QixpQkFBcUMsRUFDckMsY0FBK0IsRUFDL0IsbUJBQXlDO2dCQUV6QyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLHFDQUFvQixFQUFFLG1CQUFtQixFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQzFHLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzNCLENBQUM7WUFFUyxZQUFZO2dCQUNyQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDdkIsQ0FBQztZQUVTLGlCQUFpQjtnQkFDMUIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRU0saUJBQWlCLENBQUMsRUFBYztnQkFDdEMsT0FBTyx1REFBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsYUFBRSxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUVNLG9CQUFvQixDQUFDLGFBQTZCO2dCQUN4RCxNQUFNLEtBQUssR0FBRyxJQUFJLDBCQUFZLENBQzdCLGFBQWEsQ0FBQyxPQUFPLEVBQ3JCLGFBQWEs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