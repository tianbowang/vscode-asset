/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/keybindingLabels", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/workbench/services/keybinding/test/node/keyboardMapperTestUtils"], function (require, exports, assert, keyCodes_1, keybindings_1, keybindingLabels_1, usLayoutResolvedKeybinding_1, macLinuxKeyboardMapper_1, keyboardMapperTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WRITE_FILE_IF_DIFFERENT = false;
    async function createKeyboardMapper(isUSStandard, file, mapAltGrToCtrlAlt, OS) {
        const rawMappings = await (0, keyboardMapperTestUtils_1.readRawMapping)(file);
        return new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(isUSStandard, rawMappings, mapAltGrToCtrlAlt, OS);
    }
    suite('keyboardMapper - MAC de_ch', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'mac_de_ch', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_de_ch.txt');
        });
        function assertKeybindingTranslation(kb, expected) {
            _assertKeybindingTranslation(mapper, 2 /* OperatingSystem.Macintosh */, kb, expected);
        }
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 2 /* OperatingSystem.Macintosh */), expected);
        }
        test('kb => hw', () => {
            // unchanged
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */, 'cmd+Digit1');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 'cmd+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */, 'shift+cmd+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 32 /* KeyCode.KeyB */, 'ctrl+shift+alt+cmd+KeyB');
            // flips Y and Z
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, 'cmd+KeyY');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'cmd+KeyZ');
            // Ctrl+/
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, 'shift+cmd+Digit7');
        });
        test('resolveKeybinding Cmd+A', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: '⌘A',
                    ariaLabel: 'Command+A',
                    electronAccelerator: 'Cmd+A',
                    userSettingsLabel: 'cmd+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyA]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+B', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, [{
                    label: '⌘B',
                    ariaLabel: 'Command+B',
                    electronAccelerator: 'Cmd+B',
                    userSettingsLabel: 'cmd+b',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyB]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: '⌘Z',
                    ariaLabel: 'Command+Z',
                    electronAccelerator: 'Cmd+Z',
                    userSettingsLabel: 'cmd+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyY]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+[KeyY]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyY'
            }, {
                label: '⌘Z',
                ariaLabel: 'Command+Z',
                electronAccelerator: 'Cmd+Z',
                userSettingsLabel: 'cmd+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['meta+[KeyY]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Cmd+]', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, [{
                    label: '⌃⌥⌘6',
                    ariaLabel: 'Control+Option+Command+6',
                    electronAccelerator: 'Ctrl+Alt+Cmd+6',
                    userSettingsLabel: 'ctrl+alt+cmd+6',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+meta+[Digit6]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+[BracketRight]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: '⌘¨',
                ariaLabel: 'Command+¨',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+[BracketRight]',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['meta+[BracketRight]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: '⌃⌥9',
                    ariaLabel: 'Control+Option+9',
                    electronAccelerator: 'Ctrl+Alt+9',
                    userSettingsLabel: 'ctrl+alt+9',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+[Digit9]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: '⇧⌘7',
                    ariaLabel: 'Shift+Command+7',
                    electronAccelerator: 'Shift+Cmd+7',
                    userSettingsLabel: 'shift+cmd+7',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['shift+meta+[Digit7]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+Shift+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: '⇧⌘\'',
                    ariaLabel: 'Shift+Command+\'',
                    electronAccelerator: null,
                    userSettingsLabel: 'shift+cmd+[Minus]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['shift+meta+[Minus]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+\\', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                    label: '⌘K ⌃⇧⌥⌘7',
                    ariaLabel: 'Command+K Control+Shift+Option+Command+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k ctrl+shift+alt+cmd+7',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+[KeyK]', 'ctrl+shift+alt+meta+[Digit7]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: '⌘K ⇧⌘0',
                    ariaLabel: 'Command+K Shift+Command+0',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k shift+cmd+0',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+[KeyK]', 'shift+meta+[Digit0]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Cmd+DownArrow', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: '⌘↓',
                    ariaLabel: 'Command+DownArrow',
                    electronAccelerator: 'Cmd+Down',
                    userSettingsLabel: 'cmd+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[ArrowDown]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+NUMPAD_0', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: '⌘NumPad0',
                    ariaLabel: 'Command+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[Numpad0]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: '⌘Home',
                    ariaLabel: 'Command+Home',
                    electronAccelerator: 'Cmd+Home',
                    userSettingsLabel: 'cmd+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[Home]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: '⌘Home',
                ariaLabel: 'Command+Home',
                electronAccelerator: 'Cmd+Home',
                userSettingsLabel: 'cmd+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['meta+[Home]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(false, false, false, true, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(false, false, false, true, 90 /* KeyCode.Slash */),
            ]), [{
                    label: '⌘, ⇧⌘7',
                    ariaLabel: 'Command+, Shift+Command+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+[Comma] shift+cmd+7',
                    isWYSIWYG: false,
                    isMultiChord: true,
                    dispatchParts: ['meta+[Comma]', 'shift+meta+[Digit7]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier MetaLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
    });
    suite('keyboardMapper - MAC en_us', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(true, 'mac_en_us', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_en_us.txt');
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(false, false, false, true, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(false, false, false, true, 90 /* KeyCode.Slash */),
            ]), [{
                    label: '⌘, ⌘/',
                    ariaLabel: 'Command+, Command+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+, cmd+/',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+[Comma]', 'meta+[Slash]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier MetaLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', async () => {
            const mapper = await createKeyboardMapper(true, 'mac_en_us', true, 2 /* OperatingSystem.Macintosh */);
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: '⌃⌥Z',
                ariaLabel: 'Control+Option+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+[KeyZ]'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - LINUX de_ch', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'linux_de_ch', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_de_ch.txt');
        });
        function assertKeybindingTranslation(kb, expected) {
            _assertKeybindingTranslation(mapper, 3 /* OperatingSystem.Linux */, kb, expected);
        }
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('kb => hw', () => {
            // unchanged
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */, 'ctrl+Digit1');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 'ctrl+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */, 'ctrl+shift+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 32 /* KeyCode.KeyB */, 'ctrl+shift+alt+meta+KeyB');
            // flips Y and Z
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, 'ctrl+KeyY');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'ctrl+KeyZ');
            // Ctrl+/
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, 'ctrl+shift+Digit7');
        });
        test('resolveKeybinding Ctrl+A', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyA]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyY]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[KeyY]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyY'
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[KeyY]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+]', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, []);
        });
        test('resolveKeyboardEvent Ctrl+[BracketRight]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: 'Ctrl+¨',
                ariaLabel: 'Control+¨',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+[BracketRight]',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+[BracketRight]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Ctrl+Alt+0',
                    ariaLabel: 'Control+Alt+0',
                    electronAccelerator: 'Ctrl+Alt+0',
                    userSettingsLabel: 'ctrl+alt+0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+[Digit0]'],
                    singleModifierDispatchParts: [null],
                }, {
                    label: 'Ctrl+Alt+$',
                    ariaLabel: 'Control+Alt+$',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+alt+[Backslash]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+[Backslash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+7',
                    ariaLabel: 'Control+Shift+7',
                    electronAccelerator: 'Ctrl+Shift+7',
                    userSettingsLabel: 'ctrl+shift+7',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Digit7]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+\'',
                    ariaLabel: 'Control+Shift+\'',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+shift+[Minus]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Minus]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), []);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: 'Ctrl+K Ctrl+Shift+0',
                    ariaLabel: 'Control+K Control+Shift+0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+shift+0',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+shift+[Digit0]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+DownArrow', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[ArrowDown]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Numpad0]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Home]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Home]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent Ctrl+[KeyX]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyX'
            }, {
                label: 'Ctrl+X',
                ariaLabel: 'Control+X',
                electronAccelerator: 'Ctrl+X',
                userSettingsLabel: 'ctrl+x',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[KeyX]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */),
            ]), [{
                    label: 'Ctrl+, Ctrl+Shift+7',
                    ariaLabel: 'Control+, Control+Shift+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+[Comma] ctrl+shift+7',
                    isWYSIWYG: false,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[Comma]', 'ctrl+shift+[Digit7]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier ControlLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlLeft'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ControlRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlRight'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
    });
    suite('keyboardMapper - LINUX en_us', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(true, 'linux_en_us', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_en_us.txt');
        });
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('resolveKeybinding Ctrl+A', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyA]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyZ]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[KeyZ]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[KeyZ]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+]', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Ctrl+]',
                    ariaLabel: 'Control+]',
                    electronAccelerator: 'Ctrl+]',
                    userSettingsLabel: 'ctrl+]',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[BracketRight]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[BracketRight]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: 'Ctrl+]',
                ariaLabel: 'Control+]',
                electronAccelerator: 'Ctrl+]',
                userSettingsLabel: 'ctrl+]',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[BracketRight]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Shift+]',
                    ariaLabel: 'Shift+]',
                    electronAccelerator: 'Shift+]',
                    userSettingsLabel: 'shift+]',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['shift+[BracketRight]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+/',
                    ariaLabel: 'Control+/',
                    electronAccelerator: 'Ctrl+/',
                    userSettingsLabel: 'ctrl+/',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Slash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+/',
                    ariaLabel: 'Control+Shift+/',
                    electronAccelerator: 'Ctrl+Shift+/',
                    userSettingsLabel: 'ctrl+shift+/',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Slash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                    label: 'Ctrl+K Ctrl+\\',
                    ariaLabel: 'Control+K Control+\\',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+\\',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Backslash]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: 'Ctrl+K Ctrl+=',
                    ariaLabel: 'Control+K Control+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+=',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Equal]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+DownArrow', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[ArrowDown]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Numpad0]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Home]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Home]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+Shift+,', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 87 /* KeyCode.Comma */, [{
                    label: 'Ctrl+Shift+,',
                    ariaLabel: 'Control+Shift+,',
                    electronAccelerator: 'Ctrl+Shift+,',
                    userSettingsLabel: 'ctrl+shift+,',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Comma]'],
                    singleModifierDispatchParts: [null],
                }, {
                    label: 'Ctrl+<',
                    ariaLabel: 'Control+<',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+[IntlBackslash]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[IntlBackslash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('issue #23393: resolveKeybinding Ctrl+Enter', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */, [{
                    label: 'Ctrl+Enter',
                    ariaLabel: 'Control+Enter',
                    electronAccelerator: 'Ctrl+Enter',
                    userSettingsLabel: 'ctrl+enter',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Enter]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('issue #23393: resolveKeyboardEvent Ctrl+[NumpadEnter]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'NumpadEnter'
            }, {
                label: 'Ctrl+Enter',
                ariaLabel: 'Control+Enter',
                electronAccelerator: 'Ctrl+Enter',
                userSettingsLabel: 'ctrl+enter',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Enter]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */),
            ]), [{
                    label: 'Ctrl+, Ctrl+/',
                    ariaLabel: 'Control+, Control+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+, ctrl+/',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[Comma]', 'ctrl+[Slash]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */)
            ]), [{
                    label: 'Ctrl+,',
                    ariaLabel: 'Control+,',
                    electronAccelerator: 'Ctrl+,',
                    userSettingsLabel: 'ctrl+,',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Comma]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier ControlLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlLeft'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ControlRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlRight'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ShiftLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ShiftLeft'
            }, {
                label: 'Shift',
                ariaLabel: 'Shift',
                electronAccelerator: null,
                userSettingsLabel: 'shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['shift'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ShiftRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ShiftRight'
            }, {
                label: 'Shift',
                ariaLabel: 'Shift',
                electronAccelerator: null,
                userSettingsLabel: 'shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['shift'],
            });
        });
        test('resolveKeyboardEvent Single Modifier AltLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'AltLeft'
            }, {
                label: 'Alt',
                ariaLabel: 'Alt',
                electronAccelerator: null,
                userSettingsLabel: 'alt',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['alt'],
            });
        });
        test('resolveKeyboardEvent Single Modifier AltRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'AltRight'
            }, {
                label: 'Alt',
                ariaLabel: 'Alt',
                electronAccelerator: null,
                userSettingsLabel: 'alt',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['alt'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaLeft+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: 'Super',
                ariaLabel: 'Super',
                electronAccelerator: null,
                userSettingsLabel: 'meta',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaRight+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: 'Super',
                ariaLabel: 'Super',
                electronAccelerator: null,
                userSettingsLabel: 'meta',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Only Modifiers Ctrl+Shift+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ShiftLeft'
            }, {
                label: 'Ctrl+Shift',
                ariaLabel: 'Control+Shift',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', async () => {
            const mapper = await createKeyboardMapper(true, 'linux_en_us', true, 3 /* OperatingSystem.Linux */);
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: 'Ctrl+Alt+Z',
                ariaLabel: 'Control+Alt+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+[KeyZ]'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper', () => {
        test('issue #23706: Linux UK layout: Ctrl + Apostrophe also toggles terminal', () => {
            const mapper = new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(false, {
                'Backquote': {
                    'value': '`',
                    'withShift': '¬',
                    'withAltGr': '|',
                    'withShiftAltGr': '|'
                }
            }, false, 3 /* OperatingSystem.Linux */);
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Backquote'
            }, {
                label: 'Ctrl+`',
                ariaLabel: 'Control+`',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+`',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Backquote]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('issue #24064: NumLock/NumPad keys stopped working in 1.11 on Linux', () => {
            const mapper = new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(false, {}, false, 3 /* OperatingSystem.Linux */);
            function assertNumpadKeyboardEvent(keyCode, code, label, electronAccelerator, userSettingsLabel, dispatch) {
                (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                    _standardKeyboardEventBrand: true,
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    altGraphKey: false,
                    keyCode: keyCode,
                    code: code
                }, {
                    label: label,
                    ariaLabel: label,
                    electronAccelerator: electronAccelerator,
                    userSettingsLabel: userSettingsLabel,
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: [dispatch],
                    singleModifierDispatchParts: [null],
                });
            }
            assertNumpadKeyboardEvent(13 /* KeyCode.End */, 'Numpad1', 'End', 'End', 'end', '[End]');
            assertNumpadKeyboardEvent(18 /* KeyCode.DownArrow */, 'Numpad2', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertNumpadKeyboardEvent(12 /* KeyCode.PageDown */, 'Numpad3', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertNumpadKeyboardEvent(15 /* KeyCode.LeftArrow */, 'Numpad4', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertNumpadKeyboardEvent(0 /* KeyCode.Unknown */, 'Numpad5', 'NumPad5', null, 'numpad5', '[Numpad5]');
            assertNumpadKeyboardEvent(17 /* KeyCode.RightArrow */, 'Numpad6', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertNumpadKeyboardEvent(14 /* KeyCode.Home */, 'Numpad7', 'Home', 'Home', 'home', '[Home]');
            assertNumpadKeyboardEvent(16 /* KeyCode.UpArrow */, 'Numpad8', 'UpArrow', 'Up', 'up', '[ArrowUp]');
            assertNumpadKeyboardEvent(11 /* KeyCode.PageUp */, 'Numpad9', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            assertNumpadKeyboardEvent(19 /* KeyCode.Insert */, 'Numpad0', 'Insert', 'Insert', 'insert', '[Insert]');
            assertNumpadKeyboardEvent(20 /* KeyCode.Delete */, 'NumpadDecimal', 'Delete', 'Delete', 'delete', '[Delete]');
        });
        test('issue #24107: Delete, Insert, Home, End, PgUp, PgDn, and arrow keys no longer work editor in 1.11', () => {
            const mapper = new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(false, {}, false, 3 /* OperatingSystem.Linux */);
            function assertKeyboardEvent(keyCode, code, label, electronAccelerator, userSettingsLabel, dispatch) {
                (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                    _standardKeyboardEventBrand: true,
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    altGraphKey: false,
                    keyCode: keyCode,
                    code: code
                }, {
                    label: label,
                    ariaLabel: label,
                    electronAccelerator: electronAccelerator,
                    userSettingsLabel: userSettingsLabel,
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: [dispatch],
                    singleModifierDispatchParts: [null],
                });
            }
            // https://github.com/microsoft/vscode/issues/24107#issuecomment-292318497
            assertKeyboardEvent(16 /* KeyCode.UpArrow */, 'Lang3', 'UpArrow', 'Up', 'up', '[ArrowUp]');
            assertKeyboardEvent(18 /* KeyCode.DownArrow */, 'NumpadEnter', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertKeyboardEvent(15 /* KeyCode.LeftArrow */, 'Convert', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertKeyboardEvent(17 /* KeyCode.RightArrow */, 'NonConvert', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertKeyboardEvent(20 /* KeyCode.Delete */, 'PrintScreen', 'Delete', 'Delete', 'delete', '[Delete]');
            assertKeyboardEvent(19 /* KeyCode.Insert */, 'NumpadDivide', 'Insert', 'Insert', 'insert', '[Insert]');
            assertKeyboardEvent(13 /* KeyCode.End */, 'Unknown', 'End', 'End', 'end', '[End]');
            assertKeyboardEvent(14 /* KeyCode.Home */, 'IntlRo', 'Home', 'Home', 'home', '[Home]');
            assertKeyboardEvent(12 /* KeyCode.PageDown */, 'ControlRight', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertKeyboardEvent(11 /* KeyCode.PageUp */, 'Lang4', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            // https://github.com/microsoft/vscode/issues/24107#issuecomment-292323924
            assertKeyboardEvent(12 /* KeyCode.PageDown */, 'ControlRight', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertKeyboardEvent(11 /* KeyCode.PageUp */, 'Lang4', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            assertKeyboardEvent(13 /* KeyCode.End */, '', 'End', 'End', 'end', '[End]');
            assertKeyboardEvent(14 /* KeyCode.Home */, 'IntlRo', 'Home', 'Home', 'home', '[Home]');
            assertKeyboardEvent(20 /* KeyCode.Delete */, 'PrintScreen', 'Delete', 'Delete', 'delete', '[Delete]');
            assertKeyboardEvent(19 /* KeyCode.Insert */, 'NumpadDivide', 'Insert', 'Insert', 'insert', '[Insert]');
            assertKeyboardEvent(17 /* KeyCode.RightArrow */, 'NonConvert', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertKeyboardEvent(15 /* KeyCode.LeftArrow */, 'Convert', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertKeyboardEvent(18 /* KeyCode.DownArrow */, 'NumpadEnter', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertKeyboardEvent(16 /* KeyCode.UpArrow */, 'Lang3', 'UpArrow', 'Up', 'up', '[ArrowUp]');
        });
    });
    suite('keyboardMapper - LINUX ru', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'linux_ru', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_ru.txt');
        });
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('resolveKeybinding Ctrl+S', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */, [{
                    label: 'Ctrl+S',
                    ariaLabel: 'Control+S',
                    electronAccelerator: 'Ctrl+S',
                    userSettingsLabel: 'ctrl+s',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyS]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
    });
    suite('keyboardMapper - LINUX en_uk', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'linux_en_uk', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_en_uk.txt');
        });
        test('issue #24522: resolveKeyboardEvent Ctrl+Alt+[Minus]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Minus'
            }, {
                label: 'Ctrl+Alt+-',
                ariaLabel: 'Control+Alt+-',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+alt+[Minus]',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+[Minus]'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - MAC zh_hant', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'mac_zh_hant', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_zh_hant.txt');
        });
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 2 /* OperatingSystem.Macintosh */), expected);
        }
        test('issue #28237 resolveKeybinding Cmd+C', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, [{
                    label: '⌘C',
                    ariaLabel: 'Command+C',
                    electronAccelerator: 'Cmd+C',
                    userSettingsLabel: 'cmd+c',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyC]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
    });
    suite('keyboardMapper - MAC zh_hant2', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'mac_zh_hant2', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_zh_hant2.txt');
        });
    });
    function _assertKeybindingTranslation(mapper, OS, kb, _expected) {
        let expected;
        if (typeof _expected === 'string') {
            expected = [_expected];
        }
        else if (Array.isArray(_expected)) {
            expected = _expected;
        }
        else {
            expected = [];
        }
        const runtimeKeybinding = (0, keybindings_1.createSimpleKeybinding)(kb, OS);
        const keybindingLabel = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding([runtimeKeybinding], OS).getUserSettingsLabel();
        const actualHardwareKeypresses = mapper.keyCodeChordToScanCodeChord(runtimeKeybinding);
        if (actualHardwareKeypresses.length === 0) {
            assert.deepStrictEqual([], expected, `simpleKeybindingToHardwareKeypress -- "${keybindingLabel}" -- actual: "[]" -- expected: "${expected}"`);
            return;
        }
        const actual = actualHardwareKeypresses
            .map(k => keybindingLabels_1.UserSettingsLabelProvider.toLabel(OS, [k], (keybinding) => keyCodes_1.ScanCodeUtils.toString(keybinding.scanCode)));
        assert.deepStrictEqual(actual, expected, `simpleKeybindingToHardwareKeypress -- "${keybindingLabel}" -- actual: "${actual}" -- expected: "${expected}"`);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjTGludXhLZXlib2FyZE1hcHBlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy90ZXN0L25vZGUvbWFjTGludXhLZXlib2FyZE1hcHBlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLE1BQU0sdUJBQXVCLEdBQUcsS0FBSyxDQUFDO0lBRXRDLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxZQUFxQixFQUFFLElBQVksRUFBRSxpQkFBMEIsRUFBRSxFQUFtQjtRQUN2SCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsd0NBQWMsRUFBMkIsSUFBSSxDQUFDLENBQUM7UUFDekUsT0FBTyxJQUFJLCtDQUFzQixDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7UUFFeEMsSUFBSSxNQUE4QixDQUFDO1FBRW5DLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNyQixNQUFNLE9BQU8sR0FBRyxNQUFNLG9CQUFvQixDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxvQ0FBNEIsQ0FBQztZQUNqRyxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7WUFDcEIsT0FBTyxJQUFBLHVDQUFhLEVBQUMsdUJBQXVCLEVBQUUsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUywyQkFBMkIsQ0FBQyxFQUFVLEVBQUUsUUFBMkI7WUFDM0UsNEJBQTRCLENBQUMsTUFBTSxxQ0FBNkIsRUFBRSxFQUFFLFFBQVEsQ0FB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