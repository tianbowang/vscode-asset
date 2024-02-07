/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/test/node/keyboardMapperTestUtils"], function (require, exports, keyCodes_1, keybindings_1, windowsKeyboardMapper_1, keyboardMapperTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WRITE_FILE_IF_DIFFERENT = false;
    async function createKeyboardMapper(isUSStandard, file, mapAltGrToCtrlAlt) {
        const rawMappings = await (0, keyboardMapperTestUtils_1.readRawMapping)(file);
        return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMappings, mapAltGrToCtrlAlt);
    }
    function _assertResolveKeybinding(mapper, k, expected) {
        const keyBinding = (0, keybindings_1.decodeKeybinding)(k, 1 /* OperatingSystem.Windows */);
        (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, keyBinding, expected);
    }
    suite('keyboardMapper - WINDOWS de_ch', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(false, 'win_de_ch', false);
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_de_ch.txt');
        });
        test('resolveKeybinding Ctrl+A', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+A'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+Z'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Z', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 56 /* KeyCode.KeyZ */,
                code: null
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+Z'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+]', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Ctrl+^',
                    ariaLabel: 'Control+^',
                    electronAccelerator: 'Ctrl+]',
                    userSettingsLabel: 'ctrl+oem_6',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 94 /* KeyCode.BracketRight */,
                code: null
            }, {
                label: 'Ctrl+^',
                ariaLabel: 'Control+^',
                electronAccelerator: 'Ctrl+]',
                userSettingsLabel: 'ctrl+oem_6',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(mapper, 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Shift+^',
                    ariaLabel: 'Shift+^',
                    electronAccelerator: 'Shift+]',
                    userSettingsLabel: 'shift+oem_6',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['shift+]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+§',
                    ariaLabel: 'Control+§',
                    electronAccelerator: 'Ctrl+/',
                    userSettingsLabel: 'ctrl+oem_2',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+/'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+§',
                    ariaLabel: 'Control+Shift+§',
                    electronAccelerator: 'Ctrl+Shift+/',
                    userSettingsLabel: 'ctrl+shift+oem_2',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+/'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                    label: 'Ctrl+K Ctrl+ä',
                    ariaLabel: 'Control+K Control+ä',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+oem_5',
                    isWYSIWYG: false,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+\\'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), []);
        });
        test('resolveKeybinding Ctrl+DownArrow', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+DownArrow'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+NumPad0'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+Home'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Home', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 14 /* KeyCode.Home */,
                code: null
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+Home'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */),
            ]), [{
                    label: 'Ctrl+, Ctrl+§',
                    ariaLabel: 'Control+, Control+§',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+oem_comma ctrl+oem_2',
                    isWYSIWYG: false,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier Ctrl+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 5 /* KeyCode.Ctrl */,
                code: null
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
    suite('keyboardMapper - WINDOWS en_us', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(true, 'win_en_us', false);
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_en_us.txt');
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                    label: 'Ctrl+K Ctrl+\\',
                    ariaLabel: 'Control+K Control+\\',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+\\',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+\\'],
                    singleModifierDispatchParts: [null, null],
                }]);
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
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
            ]), [{
                    label: 'Ctrl+,',
                    ariaLabel: 'Control+,',
                    electronAccelerator: 'Ctrl+,',
                    userSettingsLabel: 'ctrl+,',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+,'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier Ctrl+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 5 /* KeyCode.Ctrl */,
                code: null
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
        test('resolveKeyboardEvent Single Modifier Shift+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 4 /* KeyCode.Shift */,
                code: null
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
        test('resolveKeyboardEvent Single Modifier Alt+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: 6 /* KeyCode.Alt */,
                code: null
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
        test('resolveKeyboardEvent Single Modifier Meta+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: 57 /* KeyCode.Meta */,
                code: null
            }, {
                label: 'Windows',
                ariaLabel: 'Windows',
                electronAccelerator: null,
                userSettingsLabel: 'win',
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
                keyCode: 4 /* KeyCode.Shift */,
                code: null
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
            const mapper = await createKeyboardMapper(true, 'win_en_us', true);
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: 56 /* KeyCode.KeyZ */,
                code: null
            }, {
                label: 'Ctrl+Alt+Z',
                ariaLabel: 'Control+Alt+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+Z'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - WINDOWS por_ptb', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(false, 'win_por_ptb', false);
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_por_ptb.txt');
        });
        test('resolveKeyboardEvent Ctrl+[IntlRo]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 115 /* KeyCode.ABNT_C1 */,
                code: null
            }, {
                label: 'Ctrl+/',
                ariaLabel: 'Control+/',
                electronAccelerator: 'Ctrl+ABNT_C1',
                userSettingsLabel: 'ctrl+abnt_c1',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+ABNT_C1'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent Ctrl+[NumpadComma]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 116 /* KeyCode.ABNT_C2 */,
                code: null
            }, {
                label: 'Ctrl+.',
                ariaLabel: 'Control+.',
                electronAccelerator: 'Ctrl+ABNT_C2',
                userSettingsLabel: 'ctrl+abnt_c2',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+ABNT_C2'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - WINDOWS ru', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(false, 'win_ru', false);
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_ru.txt');
        });
        test('issue ##24361: resolveKeybinding Ctrl+K Ctrl+K', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), [{
                    label: 'Ctrl+K Ctrl+K',
                    ariaLabel: 'Control+K Control+K',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+k',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+K'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
    });
    suite('keyboardMapper - misc', () => {
        test('issue #23513: Toggle Sidebar Visibility and Go to Line display same key mapping in Arabic keyboard', () => {
            const mapper = new windowsKeyboardMapper_1.WindowsKeyboardMapper(false, {
                'KeyB': {
                    'vkey': 'VK_B',
                    'value': 'لا',
                    'withShift': 'لآ',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                },
                'KeyG': {
                    'vkey': 'VK_G',
                    'value': 'ل',
                    'withShift': 'لأ',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                }
            }, false);
            _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, [{
                    label: 'Ctrl+B',
                    ariaLabel: 'Control+B',
                    electronAccelerator: 'Ctrl+B',
                    userSettingsLabel: 'ctrl+b',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+B'],
                    singleModifierDispatchParts: [null],
                }]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c0tleWJvYXJkTWFwcGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL3Rlc3Qvbm9kZS93aW5kb3dzS2V5Ym9hcmRNYXBwZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVNoRyxNQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQztJQUV0QyxLQUFLLFVBQVUsb0JBQW9CLENBQUMsWUFBcUIsRUFBRSxJQUFZLEVBQUUsaUJBQTBCO1FBQ2xHLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBQSx3Q0FBYyxFQUEwQixJQUFJLENBQUMsQ0FBQztRQUN4RSxPQUFPLElBQUksNkNBQXFCLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCxTQUFTLHdCQUF3QixDQUFDLE1BQTZCLEVBQUUsQ0FBUyxFQUFFLFFBQStCO1FBQzFHLE1BQU0sVUFBVSxHQUFHLElBQUEsOEJBQWdCLEVBQUMsQ0FBQyxrQ0FBMEIsQ0FBQztRQUNoRSxJQUFBLGlEQUF1QixFQUFDLE1BQU0sRUFBRSxVQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFFNUMsSUFBSSxNQUE2QixDQUFDO1FBRWxDLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNyQixNQUFNLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7WUFDcEIsT0FBTyxJQUFBLHVDQUFhLEVBQUMsdUJBQXVCLEVBQUUsTUFBTSxFQUFFLGVBQWUs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