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
define(["require", "exports", "vs/nls", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/common/async", "vs/base/common/event", "vs/base/common/json", "vs/base/common/keybindingLabels", "vs/base/common/keybindingParser", "vs/base/common/keybindings", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/base/browser/window", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/action/common/action", "vs/workbench/services/actions/common/menusExtensionPoint", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/host/browser/host", "vs/workbench/services/keybinding/browser/unboundCommands", "vs/workbench/services/keybinding/common/keybindingIO", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls, browser, canIUse_1, dom, keyboardEvent_1, async_1, event_1, json_1, keybindingLabels_1, keybindingParser_1, keybindings_1, keyCodes_1, lifecycle_1, objects, platform_1, resources_1, window_1, actions_1, commands_1, contextkey_1, files_1, extensions_1, jsonContributionRegistry_1, abstractKeybindingService_1, keybinding_1, keybindingResolver_1, keybindingsRegistry_1, resolvedKeybindingItem_1, keyboardLayout_1, log_1, notification_1, platform_2, telemetry_1, uriIdentity_1, action_1, menusExtensionPoint_1, extensions_2, extensionsRegistry_1, host_1, unboundCommands_1, keybindingIO_1, userDataProfile_1) {
    "use strict";
    var WorkbenchKeybindingService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchKeybindingService = void 0;
    function isValidContributedKeyBinding(keyBinding, rejects) {
        if (!keyBinding) {
            rejects.push(nls.localize('nonempty', "expected non-empty value."));
            return false;
        }
        if (typeof keyBinding.command !== 'string') {
            rejects.push(nls.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
            return false;
        }
        if (keyBinding.key && typeof keyBinding.key !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'key'));
            return false;
        }
        if (keyBinding.when && typeof keyBinding.when !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
            return false;
        }
        if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'mac'));
            return false;
        }
        if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'linux'));
            return false;
        }
        if (keyBinding.win && typeof keyBinding.win !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'win'));
            return false;
        }
        return true;
    }
    const keybindingType = {
        type: 'object',
        default: { command: '', key: '' },
        properties: {
            command: {
                description: nls.localize('vscode.extension.contributes.keybindings.command', 'Identifier of the command to run when keybinding is triggered.'),
                type: 'string'
            },
            args: {
                description: nls.localize('vscode.extension.contributes.keybindings.args', "Arguments to pass to the command to execute.")
            },
            key: {
                description: nls.localize('vscode.extension.contributes.keybindings.key', 'Key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord).'),
                type: 'string'
            },
            mac: {
                description: nls.localize('vscode.extension.contributes.keybindings.mac', 'Mac specific key or key sequence.'),
                type: 'string'
            },
            linux: {
                description: nls.localize('vscode.extension.contributes.keybindings.linux', 'Linux specific key or key sequence.'),
                type: 'string'
            },
            win: {
                description: nls.localize('vscode.extension.contributes.keybindings.win', 'Windows specific key or key sequence.'),
                type: 'string'
            },
            when: {
                description: nls.localize('vscode.extension.contributes.keybindings.when', 'Condition when the key is active.'),
                type: 'string'
            },
        }
    };
    const keybindingsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'keybindings',
        deps: [menusExtensionPoint_1.commandsExtensionPoint],
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.keybindings', "Contributes keybindings."),
            oneOf: [
                keybindingType,
                {
                    type: 'array',
                    items: keybindingType
                }
            ]
        }
    });
    const NUMPAD_PRINTABLE_SCANCODES = [
        90 /* ScanCode.NumpadDivide */,
        91 /* ScanCode.NumpadMultiply */,
        92 /* ScanCode.NumpadSubtract */,
        93 /* ScanCode.NumpadAdd */,
        95 /* ScanCode.Numpad1 */,
        96 /* ScanCode.Numpad2 */,
        97 /* ScanCode.Numpad3 */,
        98 /* ScanCode.Numpad4 */,
        99 /* ScanCode.Numpad5 */,
        100 /* ScanCode.Numpad6 */,
        101 /* ScanCode.Numpad7 */,
        102 /* ScanCode.Numpad8 */,
        103 /* ScanCode.Numpad9 */,
        104 /* ScanCode.Numpad0 */,
        105 /* ScanCode.NumpadDecimal */
    ];
    const otherMacNumpadMapping = new Map();
    otherMacNumpadMapping.set(95 /* ScanCode.Numpad1 */, 22 /* KeyCode.Digit1 */);
    otherMacNumpadMapping.set(96 /* ScanCode.Numpad2 */, 23 /* KeyCode.Digit2 */);
    otherMacNumpadMapping.set(97 /* ScanCode.Numpad3 */, 24 /* KeyCode.Digit3 */);
    otherMacNumpadMapping.set(98 /* ScanCode.Numpad4 */, 25 /* KeyCode.Digit4 */);
    otherMacNumpadMapping.set(99 /* ScanCode.Numpad5 */, 26 /* KeyCode.Digit5 */);
    otherMacNumpadMapping.set(100 /* ScanCode.Numpad6 */, 27 /* KeyCode.Digit6 */);
    otherMacNumpadMapping.set(101 /* ScanCode.Numpad7 */, 28 /* KeyCode.Digit7 */);
    otherMacNumpadMapping.set(102 /* ScanCode.Numpad8 */, 29 /* KeyCode.Digit8 */);
    otherMacNumpadMapping.set(103 /* ScanCode.Numpad9 */, 30 /* KeyCode.Digit9 */);
    otherMacNumpadMapping.set(104 /* ScanCode.Numpad0 */, 21 /* KeyCode.Digit0 */);
    let WorkbenchKeybindingService = WorkbenchKeybindingService_1 = class WorkbenchKeybindingService extends abstractKeybindingService_1.AbstractKeybindingService {
        constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, hostService, extensionService, fileService, uriIdentityService, logService, keyboardLayoutService) {
            super(contextKeyService, commandService, telemetryService, notificationService, logService);
            this.hostService = hostService;
            this.keyboardLayoutService = keyboardLayoutService;
            this._contributions = [];
            this.isComposingGlobalContextKey = contextKeyService.createKey('isComposing', false);
            this.kbsJsonSchema = new KeybindingsJsonSchema();
            this.updateKeybindingsJsonSchema();
            this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
            this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
                this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
                this.updateResolver();
            });
            this._keybindingHoldMode = null;
            this._cachedResolver = null;
            this.userKeybindings = this._register(new UserKeybindings(userDataProfileService, uriIdentityService, fileService, logService));
            this.userKeybindings.initialize().then(() => {
                if (this.userKeybindings.keybindings.length) {
                    this.updateResolver();
                }
            });
            this._register(this.userKeybindings.onDidChange(() => {
                logService.debug('User keybindings changed');
                this.updateResolver();
            }));
            keybindingsExtPoint.setHandler((extensions) => {
                const keybindings = [];
                for (const extension of extensions) {
                    this._handleKeybindingsExtensionPointUser(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
                }
                keybindingsRegistry_1.KeybindingsRegistry.setExtensionKeybindings(keybindings);
                this.updateResolver();
            });
            this.updateKeybindingsJsonSchema();
            this._register(extensionService.onDidRegisterExtensions(() => this.updateKeybindingsJsonSchema()));
            this._register(event_1.Event.runAndSubscribe(dom.onDidRegisterWindow, ({ window, disposables }) => disposables.add(this._registerKeyListeners(window)), { window: window_1.mainWindow, disposables: this._store }));
            this._register(browser.onDidChangeFullscreen(windowId => {
                if (windowId !== window_1.mainWindow.vscodeWindowId) {
                    return;
                }
                const keyboard = navigator.keyboard;
                if (canIUse_1.BrowserFeatures.keyboard === 2 /* KeyboardSupport.None */) {
                    return;
                }
                if (browser.isFullscreen(window_1.mainWindow)) {
                    keyboard?.lock(['Escape']);
                }
                else {
                    keyboard?.unlock();
                }
                // update resolver which will bring back all unbound keyboard shortcuts
                this._cachedResolver = null;
                this._onDidUpdateKeybindings.fire();
            }));
        }
        _registerKeyListeners(window) {
            const disposables = new lifecycle_1.DisposableStore();
            // for standard keybindings
            disposables.add(dom.addDisposableListener(window, dom.EventType.KEY_DOWN, (e) => {
                if (this._keybindingHoldMode) {
                    return;
                }
                this.isComposingGlobalContextKey.set(e.isComposing);
                const keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                this._log(`/ Received  keydown event - ${(0, keyboardEvent_1.printKeyboardEvent)(e)}`);
                this._log(`| Converted keydown event - ${(0, keyboardEvent_1.printStandardKeyboardEvent)(keyEvent)}`);
                const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
                this.isComposingGlobalContextKey.set(false);
            }));
            // for single modifier chord keybindings (e.g. shift shift)
            disposables.add(dom.addDisposableListener(window, dom.EventType.KEY_UP, (e) => {
                this._resetKeybindingHoldMode();
                this.isComposingGlobalContextKey.set(e.isComposing);
                const keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
                this.isComposingGlobalContextKey.set(false);
            }));
            return disposables;
        }
        registerSchemaContribution(contribution) {
            this._contributions.push(contribution);
            if (contribution.onDidChange) {
                this._register(contribution.onDidChange(() => this.updateKeybindingsJsonSchema()));
            }
            this.updateKeybindingsJsonSchema();
        }
        updateKeybindingsJsonSchema() {
            this.kbsJsonSchema.updateSchema(this._contributions.flatMap(x => x.getSchemaAdditions()));
        }
        _printKeybinding(keybinding) {
            return keybindingLabels_1.UserSettingsLabelProvider.toLabel(platform_1.OS, keybinding.chords, (chord) => {
                if (chord instanceof keybindings_1.KeyCodeChord) {
                    return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
                }
                return keyCodes_1.ScanCodeUtils.toString(chord.scanCode);
            }) || '[null]';
        }
        _printResolvedKeybinding(resolvedKeybinding) {
            return resolvedKeybinding.getDispatchChords().map(x => x || '[null]').join(' ');
        }
        _printResolvedKeybindings(output, input, resolvedKeybindings) {
            const padLength = 35;
            const firstRow = `${input.padStart(padLength, ' ')} => `;
            if (resolvedKeybindings.length === 0) {
                // no binding found
                output.push(`${firstRow}${'[NO BINDING]'.padStart(padLength, ' ')}`);
                return;
            }
            const firstRowIndentation = firstRow.length;
            const isFirst = true;
            for (const resolvedKeybinding of resolvedKeybindings) {
                if (isFirst) {
                    output.push(`${firstRow}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
                }
                else {
                    output.push(`${' '.repeat(firstRowIndentation)}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
                }
            }
        }
        _dumpResolveKeybindingDebugInfo() {
            const seenBindings = new Set();
            const result = [];
            result.push(`Default Resolved Keybindings (unique only):`);
            for (const item of keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings()) {
                if (!item.keybinding) {
                    continue;
                }
                const input = this._printKeybinding(item.keybinding);
                if (seenBindings.has(input)) {
                    continue;
                }
                seenBindings.add(input);
                const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                this._printResolvedKeybindings(result, input, resolvedKeybindings);
            }
            result.push(`User Resolved Keybindings (unique only):`);
            for (const item of this.userKeybindings.keybindings) {
                if (!item.keybinding) {
                    continue;
                }
                const input = item._sourceKey ?? 'Impossible: missing source key, but has keybinding';
                if (seenBindings.has(input)) {
                    continue;
                }
                seenBindings.add(input);
                const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                this._printResolvedKeybindings(result, input, resolvedKeybindings);
            }
            return result.join('\n');
        }
        _dumpDebugInfo() {
            const layoutInfo = JSON.stringify(this.keyboardLayoutService.getCurrentKeyboardLayout(), null, '\t');
            const mapperInfo = this._keyboardMapper.dumpDebugInfo();
            const resolvedKeybindings = this._dumpResolveKeybindingDebugInfo();
            const rawMapping = JSON.stringify(this.keyboardLayoutService.getRawKeyboardMapping(), null, '\t');
            return `Layout info:\n${layoutInfo}\n\n${resolvedKeybindings}\n\n${mapperInfo}\n\nRaw mapping:\n${rawMapping}`;
        }
        _dumpDebugInfoJSON() {
            const info = {
                layout: this.keyboardLayoutService.getCurrentKeyboardLayout(),
                rawMapping: this.keyboardLayoutService.getRawKeyboardMapping()
            };
            return JSON.stringify(info, null, '\t');
        }
        enableKeybindingHoldMode(commandId) {
            if (this._currentlyDispatchingCommandId !== commandId) {
                return undefined;
            }
            this._keybindingHoldMode = new async_1.DeferredPromise();
            const focusTracker = dom.trackFocus(dom.getWindow(undefined));
            const listener = focusTracker.onDidBlur(() => this._resetKeybindingHoldMode());
            this._keybindingHoldMode.p.finally(() => {
                listener.dispose();
                focusTracker.dispose();
            });
            this._log(`+ Enabled hold-mode for ${commandId}.`);
            return this._keybindingHoldMode.p;
        }
        _resetKeybindingHoldMode() {
            if (this._keybindingHoldMode) {
                this._keybindingHoldMode?.complete();
                this._keybindingHoldMode = null;
            }
        }
        customKeybindingsCount() {
            return this.userKeybindings.keybindings.length;
        }
        updateResolver() {
            this._cachedResolver = null;
            this._onDidUpdateKeybindings.fire();
        }
        _getResolver() {
            if (!this._cachedResolver) {
                const defaults = this._resolveKeybindingItems(keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings(), true);
                const overrides = this._resolveUserKeybindingItems(this.userKeybindings.keybindings, false);
                this._cachedResolver = new keybindingResolver_1.KeybindingResolver(defaults, overrides, (str) => this._log(str));
            }
            return this._cachedResolver;
        }
        _documentHasFocus() {
            // it is possible that the document has lost focus, but the
            // window is still focused, e.g. when a <webview> element
            // has focus
            return this.hostService.hasFocus;
        }
        _resolveKeybindingItems(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                const keybinding = item.keybinding;
                if (!keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                }
                else {
                    if (this._assertBrowserConflicts(keybinding)) {
                        continue;
                    }
                    const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(keybinding);
                    for (let i = resolvedKeybindings.length - 1; i >= 0; i--) {
                        const resolvedKeybinding = resolvedKeybindings[i];
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                    }
                }
            }
            return result;
        }
        _resolveUserKeybindingItems(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                if (!item.keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, null, false);
                }
                else {
                    const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                    for (const resolvedKeybinding of resolvedKeybindings) {
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                    }
                }
            }
            return result;
        }
        _assertBrowserConflicts(keybinding) {
            if (canIUse_1.BrowserFeatures.keyboard === 0 /* KeyboardSupport.Always */) {
                return false;
            }
            if (canIUse_1.BrowserFeatures.keyboard === 1 /* KeyboardSupport.FullScreen */ && browser.isFullscreen(window_1.mainWindow)) {
                return false;
            }
            for (const chord of keybinding.chords) {
                if (!chord.metaKey && !chord.altKey && !chord.ctrlKey && !chord.shiftKey) {
                    continue;
                }
                const modifiersMask = 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */;
                let partModifiersMask = 0;
                if (chord.metaKey) {
                    partModifiersMask |= 2048 /* KeyMod.CtrlCmd */;
                }
                if (chord.shiftKey) {
                    partModifiersMask |= 1024 /* KeyMod.Shift */;
                }
                if (chord.altKey) {
                    partModifiersMask |= 512 /* KeyMod.Alt */;
                }
                if (chord.ctrlKey && platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
                    partModifiersMask |= 256 /* KeyMod.WinCtrl */;
                }
                if ((partModifiersMask & modifiersMask) === (2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */)) {
                    if (chord instanceof keybindings_1.ScanCodeChord && (chord.scanCode === 86 /* ScanCode.ArrowLeft */ || chord.scanCode === 85 /* ScanCode.ArrowRight */)) {
                        // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                    if (chord instanceof keybindings_1.KeyCodeChord && (chord.keyCode === 15 /* KeyCode.LeftArrow */ || chord.keyCode === 17 /* KeyCode.RightArrow */)) {
                        // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                }
                if ((partModifiersMask & modifiersMask) === 2048 /* KeyMod.CtrlCmd */) {
                    if (chord instanceof keybindings_1.ScanCodeChord && (chord.scanCode >= 36 /* ScanCode.Digit1 */ && chord.scanCode <= 45 /* ScanCode.Digit0 */)) {
                        // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                    if (chord instanceof keybindings_1.KeyCodeChord && (chord.keyCode >= 21 /* KeyCode.Digit0 */ && chord.keyCode <= 30 /* KeyCode.Digit9 */)) {
                        // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                }
            }
            return false;
        }
        resolveKeybinding(kb) {
            return this._keyboardMapper.resolveKeybinding(kb);
        }
        resolveKeyboardEvent(keyboardEvent) {
            this.keyboardLayoutService.validateCurrentKeyboardMapping(keyboardEvent);
            return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
        }
        resolveUserBinding(userBinding) {
            const keybinding = keybindingParser_1.KeybindingParser.parseKeybinding(userBinding);
            return (keybinding ? this._keyboardMapper.resolveKeybinding(keybinding) : []);
        }
        _handleKeybindingsExtensionPointUser(extensionId, isBuiltin, keybindings, collector, result) {
            if (Array.isArray(keybindings)) {
                for (let i = 0, len = keybindings.length; i < len; i++) {
                    this._handleKeybinding(extensionId, isBuiltin, i + 1, keybindings[i], collector, result);
                }
            }
            else {
                this._handleKeybinding(extensionId, isBuiltin, 1, keybindings, collector, result);
            }
        }
        _handleKeybinding(extensionId, isBuiltin, idx, keybindings, collector, result) {
            const rejects = [];
            if (isValidContributedKeyBinding(keybindings, rejects)) {
                const rule = this._asCommandRule(extensionId, isBuiltin, idx++, keybindings);
                if (rule) {
                    result.push(rule);
                }
            }
            if (rejects.length > 0) {
                collector.error(nls.localize('invalid.keybindings', "Invalid `contributes.{0}`: {1}", keybindingsExtPoint.name, rejects.join('\n')));
            }
        }
        static bindToCurrentPlatform(key, mac, linux, win) {
            if (platform_1.OS === 1 /* OperatingSystem.Windows */ && win) {
                if (win) {
                    return win;
                }
            }
            else if (platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
                if (mac) {
                    return mac;
                }
            }
            else {
                if (linux) {
                    return linux;
                }
            }
            return key;
        }
        _asCommandRule(extensionId, isBuiltin, idx, binding) {
            const { command, args, when, key, mac, linux, win } = binding;
            const keybinding = WorkbenchKeybindingService_1.bindToCurrentPlatform(key, mac, linux, win);
            if (!keybinding) {
                return undefined;
            }
            let weight;
            if (isBuiltin) {
                weight = 300 /* KeybindingWeight.BuiltinExtension */ + idx;
            }
            else {
                weight = 400 /* KeybindingWeight.ExternalExtension */ + idx;
            }
            const commandAction = actions_1.MenuRegistry.getCommand(command);
            const precondition = commandAction && commandAction.precondition;
            let fullWhen;
            if (when && precondition) {
                fullWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(when));
            }
            else if (when) {
                fullWhen = contextkey_1.ContextKeyExpr.deserialize(when);
            }
            else if (precondition) {
                fullWhen = precondition;
            }
            const desc = {
                id: command,
                args,
                when: fullWhen,
                weight: weight,
                keybinding: keybindingParser_1.KeybindingParser.parseKeybinding(keybinding),
                extensionId: extensionId.value,
                isBuiltinExtension: isBuiltin
            };
            return desc;
        }
        getDefaultKeybindingsContent() {
            const resolver = this._getResolver();
            const defaultKeybindings = resolver.getDefaultKeybindings();
            const boundCommands = resolver.getDefaultBoundCommands();
            return (WorkbenchKeybindingService_1._getDefaultKeybindings(defaultKeybindings)
                + '\n\n'
                + WorkbenchKeybindingService_1._getAllCommandsAsComment(boundCommands));
        }
        static _getDefaultKeybindings(defaultKeybindings) {
            const out = new keybindingIO_1.OutputBuilder();
            out.writeLine('[');
            const lastIndex = defaultKeybindings.length - 1;
            defaultKeybindings.forEach((k, index) => {
                keybindingIO_1.KeybindingIO.writeKeybindingItem(out, k);
                if (index !== lastIndex) {
                    out.writeLine(',');
                }
                else {
                    out.writeLine();
                }
            });
            out.writeLine(']');
            return out.toString();
        }
        static _getAllCommandsAsComment(boundCommands) {
            const unboundCommands = (0, unboundCommands_1.getAllUnboundCommands)(boundCommands);
            const pretty = unboundCommands.sort().join('\n// - ');
            return '// ' + nls.localize('unboundCommands', "Here are other available commands: ") + '\n// - ' + pretty;
        }
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                // ignore ctrl/cmd/alt-combination but not shift-combinatios
                return false;
            }
            const code = keyCodes_1.ScanCodeUtils.toEnum(event.code);
            if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
                // This is a numpad key that might produce a printable character based on NumLock.
                // Let's check if NumLock is on or off based on the event's keyCode.
                // e.g.
                // - when NumLock is off, ScanCode.Numpad4 produces KeyCode.LeftArrow
                // - when NumLock is on, ScanCode.Numpad4 produces KeyCode.NUMPAD_4
                // However, ScanCode.NumpadAdd always produces KeyCode.NUMPAD_ADD
                if (event.keyCode === keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[code]) {
                    // NumLock is on or this is /, *, -, + on the numpad
                    return true;
                }
                if (platform_1.isMacintosh && event.keyCode === otherMacNumpadMapping.get(code)) {
                    // on macOS, the numpad keys can also map to keys 1 - 0.
                    return true;
                }
                return false;
            }
            const keycode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[code];
            if (keycode !== -1) {
                // https://github.com/microsoft/vscode/issues/74934
                return false;
            }
            // consult the KeyboardMapperFactory to check the given event for
            // a printable value.
            const mapping = this.keyboardLayoutService.getRawKeyboardMapping();
            if (!mapping) {
                return false;
            }
            const keyInfo = mapping[event.code];
            if (!keyInfo) {
                return false;
            }
            if (!keyInfo.value || /\s/.test(keyInfo.value)) {
                return false;
            }
            return true;
        }
    };
    exports.WorkbenchKeybindingService = WorkbenchKeybindingService;
    exports.WorkbenchKeybindingService = WorkbenchKeybindingService = WorkbenchKeybindingService_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, commands_1.ICommandService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, notification_1.INotificationService),
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, host_1.IHostService),
        __param(6, extensions_2.IExtensionService),
        __param(7, files_1.IFileService),
        __param(8, uriIdentity_1.IUriIdentityService),
        __param(9, log_1.ILogService),
        __param(10, keyboardLayout_1.IKeyboardLayoutService)
    ], WorkbenchKeybindingService);
    class UserKeybindings extends lifecycle_1.Disposable {
        get keybindings() { return this._keybindings; }
        constructor(userDataProfileService, uriIdentityService, fileService, logService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this._rawKeybindings = [];
            this._keybindings = [];
            this.watchDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.watch();
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(changed => {
                if (changed) {
                    this._onDidChange.fire();
                }
            }), 50));
            this._register(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.userDataProfileService.currentProfile.keybindingsResource))(() => {
                logService.debug('Keybindings file changed');
                this.reloadConfigurationScheduler.schedule();
            }));
            this._register(this.fileService.onDidRunOperation((e) => {
                if (e.operation === 4 /* FileOperation.WRITE */ && e.resource.toString() === this.userDataProfileService.currentProfile.keybindingsResource.toString()) {
                    logService.debug('Keybindings file written');
                    this.reloadConfigurationScheduler.schedule();
                }
            }));
            this._register(userDataProfileService.onDidChangeCurrentProfile(e => {
                if (!this.uriIdentityService.extUri.isEqual(e.previous.keybindingsResource, e.profile.keybindingsResource)) {
                    e.join(this.whenCurrentProfileChanged());
                }
            }));
        }
        async whenCurrentProfileChanged() {
            this.watch();
            this.reloadConfigurationScheduler.schedule();
        }
        watch() {
            this.watchDisposables.clear();
            this.watchDisposables.add(this.fileService.watch((0, resources_1.dirname)(this.userDataProfileService.currentProfile.keybindingsResource)));
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.watchDisposables.add(this.fileService.watch(this.userDataProfileService.currentProfile.keybindingsResource));
        }
        async initialize() {
            await this.reload();
        }
        async reload() {
            const newKeybindings = await this.readUserKeybindings();
            if (objects.equals(this._rawKeybindings, newKeybindings)) {
                // no change
                return false;
            }
            this._rawKeybindings = newKeybindings;
            this._keybindings = this._rawKeybindings.map((k) => keybindingIO_1.KeybindingIO.readUserKeybindingItem(k));
            return true;
        }
        async readUserKeybindings() {
            try {
                const content = await this.fileService.readFile(this.userDataProfileService.currentProfile.keybindingsResource);
                const value = (0, json_1.parse)(content.value.toString());
                return Array.isArray(value)
                    ? value.filter(v => v && typeof v === 'object' /* just typeof === object doesn't catch `null` */)
                    : [];
            }
            catch (e) {
                return [];
            }
        }
    }
    /**
     * Registers the `keybindings.json`'s schema with the JSON schema registry. Allows updating the schema, e.g., when new commands are registered (e.g., by extensions).
     *
     * Lifecycle owned by `WorkbenchKeybindingService`. Must be instantiated only once.
     */
    class KeybindingsJsonSchema {
        static { this.schemaId = 'vscode://schemas/keybindings'; }
        constructor() {
            this.commandsSchemas = [];
            this.commandsEnum = [];
            this.removalCommandsEnum = [];
            this.commandsEnumDescriptions = [];
            this.schema = {
                id: KeybindingsJsonSchema.schemaId,
                type: 'array',
                title: nls.localize('keybindings.json.title', "Keybindings configuration"),
                allowTrailingCommas: true,
                allowComments: true,
                definitions: {
                    'editorGroupsSchema': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'groups': {
                                    '$ref': '#/definitions/editorGroupsSchema',
                                    'default': [{}, {}]
                                },
                                'size': {
                                    'type': 'number',
                                    'default': 0.5
                                }
                            }
                        }
                    },
                    'commandNames': {
                        'type': 'string',
                        'enum': this.commandsEnum,
                        'enumDescriptions': this.commandsEnumDescriptions,
                        'description': nls.localize('keybindings.json.command', "Name of the command to execute"),
                    },
                    'commandType': {
                        'anyOf': [
                            {
                                $ref: '#/definitions/commandNames'
                            },
                            {
                                'type': 'string',
                                'enum': this.removalCommandsEnum,
                                'enumDescriptions': this.commandsEnumDescriptions,
                                'description': nls.localize('keybindings.json.removalCommand', "Name of the command to remove keyboard shortcut for"),
                            },
                            {
                                'type': 'string'
                            },
                        ]
                    },
                    'commandsSchemas': {
                        'allOf': this.commandsSchemas
                    }
                },
                items: {
                    'required': ['key'],
                    'type': 'object',
                    'defaultSnippets': [{ 'body': { 'key': '$1', 'command': '$2', 'when': '$3' } }],
                    'properties': {
                        'key': {
                            'type': 'string',
                            'description': nls.localize('keybindings.json.key', "Key or key sequence (separated by space)"),
                        },
                        'command': {
                            'anyOf': [
                                {
                                    'if': {
                                        'type': 'array'
                                    },
                                    'then': {
                                        'not': {
                                            'type': 'array'
                                        },
                                        'errorMessage': nls.localize('keybindings.commandsIsArray', "Incorrect type. Expected \"{0}\". The field 'command' does not support running multiple commands. Use command 'runCommands' to pass it multiple commands to run.", 'string')
                                    },
                                    'else': {
                                        '$ref': '#/definitions/commandType'
                                    }
                                },
                                {
                                    '$ref': '#/definitions/commandType'
                                }
                            ]
                        },
                        'when': {
                            'type': 'string',
                            'description': nls.localize('keybindings.json.when', "Condition when the key is active.")
                        },
                        'args': {
                            'description': nls.localize('keybindings.json.args', "Arguments to pass to the command to execute.")
                        }
                    },
                    '$ref': '#/definitions/commandsSchemas'
                }
            };
            this.schemaRegistry = platform_2.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            this.schemaRegistry.registerSchema(KeybindingsJsonSchema.schemaId, this.schema);
        }
        // TODO@ulugbekna: can updates happen incrementally rather than rebuilding; concerns:
        // - is just appending additional schemas enough for the registry to pick them up?
        // - can `CommandsRegistry.getCommands` and `MenuRegistry.getCommands` return different values at different times? ie would just pushing new schemas from `additionalContributions` not be enough?
        updateSchema(additionalContributions) {
            this.commandsSchemas.length = 0;
            this.commandsEnum.length = 0;
            this.removalCommandsEnum.length = 0;
            this.commandsEnumDescriptions.length = 0;
            const knownCommands = new Set();
            const addKnownCommand = (commandId, description) => {
                if (!/^_/.test(commandId)) {
                    if (!knownCommands.has(commandId)) {
                        knownCommands.add(commandId);
                        this.commandsEnum.push(commandId);
                        this.commandsEnumDescriptions.push((0, action_1.isLocalizedString)(description) ? description.value : description);
                        // Also add the negative form for keybinding removal
                        this.removalCommandsEnum.push(`-${commandId}`);
                    }
                }
            };
            const allCommands = commands_1.CommandsRegistry.getCommands();
            for (const [commandId, command] of allCommands) {
                const commandMetadata = command.metadata;
                addKnownCommand(commandId, commandMetadata?.description);
                if (!commandMetadata || !commandMetadata.args || commandMetadata.args.length !== 1 || !commandMetadata.args[0].schema) {
                    continue;
                }
                const argsSchema = commandMetadata.args[0].schema;
                const argsRequired = ((typeof commandMetadata.args[0].isOptional !== 'undefined')
                    ? (!commandMetadata.args[0].isOptional)
                    : (Array.isArray(argsSchema.required) && argsSchema.required.length > 0));
                const addition = {
                    'if': {
                        'required': ['command'],
                        'properties': {
                            'command': { 'const': commandId }
                        }
                    },
                    'then': {
                        'required': [].concat(argsRequired ? ['args'] : []),
                        'properties': {
                            'args': argsSchema
                        }
                    }
                };
                this.commandsSchemas.push(addition);
            }
            const menuCommands = actions_1.MenuRegistry.getCommands();
            for (const commandId of menuCommands.keys()) {
                addKnownCommand(commandId);
            }
            this.commandsSchemas.push(...additionalContributions);
            this.schemaRegistry.notifySchemaChanged(KeybindingsJsonSchema.schemaId);
        }
    }
    (0, extensions_1.registerSingleton)(keybinding_1.IKeybindingService, WorkbenchKeybindingService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL2Jyb3dzZXIva2V5YmluZGluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWlFaEcsU0FBUyw0QkFBNEIsQ0FBQyxVQUFpQyxFQUFFLE9BQWlCO1FBQ3pGLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLDJCQUEyQixDQUFDLENBQUMsQ0FBQztZQUNwRSxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLDBEQUEwRCxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkgsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxVQUFVLENBQUMsR0FBRyxJQUFJLE9BQU8sVUFBVSxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMxRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDJEQUEyRCxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUcsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxVQUFVLENBQUMsSUFBSSxJQUFJLE9BQU8sVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDJEQUEyRCxF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