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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/keybinding/common/keymapInfo", "vs/platform/instantiation/common/extensions", "vs/platform/keyboardLayout/common/keyboardConfig", "vs/platform/keyboardLayout/common/keyboardMapper", "vs/base/common/platform", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/common/fallbackKeyboardMapper", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/json", "vs/base/common/objects", "vs/platform/environment/common/environment", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/platform/commands/common/commands", "vs/platform/storage/common/storage", "vs/platform/keyboardLayout/common/keyboardLayout"], function (require, exports, nls, event_1, lifecycle_1, keymapInfo_1, extensions_1, keyboardConfig_1, keyboardMapper_1, platform_1, windowsKeyboardMapper_1, fallbackKeyboardMapper_1, macLinuxKeyboardMapper_1, files_1, async_1, json_1, objects, environment_1, platform_2, configurationRegistry_1, configuration_1, notification_1, commands_1, storage_1, keyboardLayout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserKeyboardLayoutService = exports.BrowserKeyboardMapperFactory = exports.BrowserKeyboardMapperFactoryBase = void 0;
    class BrowserKeyboardMapperFactoryBase extends lifecycle_1.Disposable {
        get activeKeymap() {
            return this._activeKeymapInfo;
        }
        get keymapInfos() {
            return this._keymapInfos;
        }
        get activeKeyboardLayout() {
            if (!this._initialized) {
                return null;
            }
            return this._activeKeymapInfo?.layout ?? null;
        }
        get activeKeyMapping() {
            if (!this._initialized) {
                return null;
            }
            return this._activeKeymapInfo?.mapping ?? null;
        }
        get keyboardLayouts() {
            return this._keymapInfos.map(keymapInfo => keymapInfo.layout);
        }
        constructor(_configurationService) {
            super();
            this._configurationService = _configurationService;
            this._onDidChangeKeyboardMapper = new event_1.Emitter();
            this.onDidChangeKeyboardMapper = this._onDidChangeKeyboardMapper.event;
            this._keyboardMapper = null;
            this._initialized = false;
            this._keymapInfos = [];
            this._mru = [];
            this._activeKeymapInfo = null;
            if (navigator.keyboard && navigator.keyboard.addEventListener) {
                navigator.keyboard.addEventListener('layoutchange', () => {
                    // Update user keyboard map settings
                    this._getBrowserKeyMapping().then((mapping) => {
                        if (this.isKeyMappingActive(mapping)) {
                            return;
                        }
                        this.setLayoutFromBrowserAPI();
                    });
                });
            }
            this._register(this._configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('keyboard')) {
                    this._keyboardMapper = null;
                    this._onDidChangeKeyboardMapper.fire();
                }
            }));
        }
        registerKeyboardLayout(layout) {
            this._keymapInfos.push(layout);
            this._mru = this._keymapInfos;
        }
        removeKeyboardLayout(layout) {
            let index = this._mru.indexOf(layout);
            this._mru.splice(index, 1);
            index = this._keymapInfos.indexOf(layout);
            this._keymapInfos.splice(index, 1);
        }
        getMatchedKeymapInfo(keyMapping) {
            if (!keyMapping) {
                return null;
            }
            const usStandard = this.getUSStandardLayout();
            if (usStandard) {
                let maxScore = usStandard.getScore(keyMapping);
                if (maxScore === 0) {
                    return {
                        result: usStandard,
                        score: 0
                    };
                }
                let result = usStandard;
                for (let i = 0; i < this._mru.length; i++) {
                    const score = this._mru[i].getScore(keyMapping);
                    if (score > maxScore) {
                        if (score === 0) {
                            return {
                                result: this._mru[i],
                                score: 0
                            };
                        }
                        maxScore = score;
                        result = this._mru[i];
                    }
                }
                return {
                    result,
                    score: maxScore
                };
            }
            for (let i = 0; i < this._mru.length; i++) {
                if (this._mru[i].fuzzyEqual(keyMapping)) {
                    return {
                        result: this._mru[i],
                        score: 0
                    };
                }
            }
            return null;
        }
        getUSStandardLayout() {
            const usStandardLayouts = this._mru.filter(layout => layout.layout.isUSStandard);
            if (usStandardLayouts.length) {
                return usStandardLayouts[0];
            }
            return null;
        }
        isKeyMappingActive(keymap) {
            return this._activeKeymapInfo && keymap && this._activeKeymapInfo.fuzzyEqual(keymap);
        }
        setUSKeyboardLayout() {
            this._activeKeymapInfo = this.getUSStandardLayout();
        }
        setActiveKeyMapping(keymap) {
            let keymapUpdated = false;
            const matchedKeyboardLayout = this.getMatchedKeymapInfo(keymap);
            if (matchedKeyboardLayout) {
                // let score = matchedKeyboardLayout.score;
                // Due to https://bugs.chromium.org/p/chromium/issues/detail?id=977609, any key after a dead key will generate a wrong mapping,
                // we shoud avoid yielding the false error.
                // if (keymap && score < 0) {
                // const donotAskUpdateKey = 'missing.keyboardlayout.donotask';
                // if (this._storageService.getBoolean(donotAskUpdateKey, StorageScope.APPLICATION)) {
                // 	return;
                // }
                // the keyboard layout doesn't actually match the key event or the keymap from chromium
                // this._notificationService.prompt(
                // 	Severity.Info,
                // 	nls.localize('missing.keyboardlayout', 'Fail to find matching keyboard layout'),
                // 	[{
                // 		label: nls.localize('keyboardLayoutMissing.configure', "Configure"),
                // 		run: () => this._commandService.executeCommand('workbench.action.openKeyboardLayoutPicker')
                // 	}, {
                // 		label: nls.localize('neverAgain', "Don't Show Again"),
                // 		isSecondary: true,
                // 		run: () => this._storageService.store(donotAskUpdateKey, true, StorageScope.APPLICATION)
                // 	}]
                // );
                // console.warn('Active keymap/keyevent does not match current keyboard layout', JSON.stringify(keymap), this._activeKeymapInfo ? JSON.stringify(this._activeKeymapInfo.layout) : '');
                // return;
                // }
                if (!this._activeKeymapInfo) {
                    this._activeKeymapInfo = matchedKeyboardLayout.result;
                    keymapUpdated = true;
                }
                else if (keymap) {
                    if (matchedKeyboardLayout.result.getScore(keymap) > this._activeKeymapInfo.getScore(keymap)) {
                        this._activeKeymapInfo = matchedKeyboardLayout.result;
                        keymapUpdated = true;
                    }
                }
            }
            if (!this._activeKeymapInfo) {
                this._activeKeymapInfo = this.getUSStandardLayout();
                keymapUpdated = true;
            }
            if (!this._activeKeymapInfo || !keymapUpdated) {
                return;
            }
            const index = this._mru.indexOf(this._activeKeymapInfo);
            this._mru.splice(index, 1);
            this._mru.unshift(this._activeKeymapInfo);
            this._setKeyboardData(this._activeKeymapInfo);
        }
        setActiveKeymapInfo(keymapInfo) {
            this._activeKeymapInfo = keymapInfo;
            const index = this._mru.indexOf(this._activeKeymapInfo);
            if (index === 0) {
                return;
            }
            this._mru.splice(index, 1);
            this._mru.unshift(this._activeKeymapInfo);
            this._setKeyboardData(this._activeKeymapInfo);
        }
        setLayoutFromBrowserAPI() {
            this._updateKeyboardLayoutAsync(this._initialized);
        }
        _updateKeyboardLayoutAsync(initialized, keyboardEvent) {
            if (!initialized) {
                return;
            }
            this._getBrowserKeyMapping(keyboardEvent).then(keyMap => {
                // might be false positive
                if (this.isKeyMappingActive(keyMap)) {
                    return;
                }
                this.setActiveKeyMapping(keyMap);
            });
        }
        getKeyboardMapper() {
            const config = (0, keyboardConfig_1.readKeyboardConfig)(this._configurationService);
            if (config.dispatch === 1 /* DispatchConfig.KeyCode */ || !this._initialized || !this._activeKeymapInfo) {
                // Forcefully set to use keyCode
                return new fallbackKeyboardMapper_1.FallbackKeyboardMapper(config.mapAltGrToCtrlAlt, platform_1.OS);
            }
            if (!this._keyboardMapper) {
                this._keyboardMapper = new keyboardMapper_1.CachedKeyboardMapper(BrowserKeyboardMapperFactory._createKeyboardMapper(this._activeKeymapInfo, config.mapAltGrToCtrlAlt));
            }
            return this._keyboardMapper;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            if (!this._initialized) {
                return;
            }
            const isCurrentKeyboard = this._validateCurrentKeyboardMapping(keyboardEvent);
            if (isCurrentKeyboard) {
                return;
            }
            this._updateKeyboardLayoutAsync(true, keyboardEvent);
        }
        setKeyboardLayout(layoutName) {
            const matchedLayouts = this.keymapInfos.filter(keymapInfo => (0, keyboardLayout_1.getKeyboardLayoutId)(keymapInfo.layout) === layoutName);
            if (matchedLayouts.length > 0) {
                this.setActiveKeymapInfo(matchedLayouts[0]);
            }
        }
        _setKeyboardData(keymapInfo) {
            this._initialized = true;
            this._keyboardMapper = null;
            this._onDidChangeKeyboardMapper.fire();
        }
        static _createKeyboardMapper(keymapInfo, mapAltGrToCtrlAlt) {
            const rawMapping = keymapInfo.mapping;
            const isUSStandard = !!keymapInfo.layout.isUSStandard;
            if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
                return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMapping, mapAltGrToCtrlAlt);
            }
            if (Object.keys(rawMapping).length === 0) {
                // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
                return new fallbackKeyboardMapper_1.FallbackKeyboardMapper(mapAltGrToCtrlAlt, platform_1.OS);
            }
            return new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(isUSStandard, rawMapping, mapAltGrToCtrlAlt, platform_1.OS);
        }
        //#region Browser API
        _validateCurrentKeyboardMapping(keyboardEvent) {
            if (!this._initialized) {
                return true;
            }
            const standardKeyboardEvent = keyboardEvent;
            const currentKeymap = this._activeKeymapInfo;
            if (!currentKeymap) {
                return true;
            }
            if (standardKeyboardEvent.browserEvent.key === 'Dead' || standardKeyboardEvent.browserEvent.isComposing) {
                return true;
            }
            const mapping = currentKeymap.mapping[standardKeyboardEvent.code];
            if (!mapping) {
                return false;
            }
            if (mapping.value === '') {
                // The value is empty when the key is not a printable character, we skip validation.
                if (keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
                    setTimeout(() => {
                        this._getBrowserKeyMapping().then((keymap) => {
                            if (this.isKeyMappingActive(keymap)) {
                                return;
                            }
                            this.setLayoutFromBrowserAPI();
                        });
                    }, 350);
                }
                return true;
            }
            const expectedValue = standardKeyboardEvent.altKey && standardKeyboardEvent.shiftKey ? mapping.withShiftAltGr :
                standardKeyboardEvent.altKey ? mapping.withAltGr :
                    standardKeyboardEvent.shiftKey ? mapping.withShift : mapping.value;
            const isDead = (standardKeyboardEvent.altKey && standardKeyboardEvent.shiftKey && mapping.withShiftAltGrIsDeadKey) ||
                (standardKeyboardEvent.altKey && mapping.withAltGrIsDeadKey) ||
                (standardKeyboardEvent.shiftKey && mapping.withShiftIsDeadKey) ||
                mapping.valueIsDeadKey;
            if (isDead && standardKeyboardEvent.browserEvent.key !== 'Dead') {
                return false;
            }
            // TODO, this assumption is wrong as `browserEvent.key` doesn't necessarily equal expectedValue from real keymap
            if (!isDead && standardKeyboardEvent.browserEvent.key !== expectedValue) {
                return false;
            }
            return true;
        }
        async _getBrowserKeyMapping(keyboardEvent) {
            if (navigator.keyboard) {
                try {
                    return navigator.keyboard.getLayoutMap().then((e) => {
                        const ret = {};
                        for (const key of e) {
                            ret[key[0]] = {
                                'value': key[1],
                                'withShift': '',
                                'withAltGr': '',
                                'withShiftAltGr': ''
                            };
                        }
                        return ret;
                        // const matchedKeyboardLayout = this.getMatchedKeymapInfo(ret);
                        // if (matchedKeyboardLayout) {
                        // 	return matchedKeyboardLayout.result.mapping;
                        // }
                        // return null;
                    });
                }
                catch {
                    // getLayoutMap can throw if invoked from a nested browsing context
                }
            }
            else if (keyboardEvent && !keyboardEvent.shiftKey && !keyboardEvent.altKey && !keyboardEvent.metaKey && !keyboardEvent.metaKey) {
                const ret = {};
                const standardKeyboardEvent = keyboardEvent;
                ret[standardKeyboardEvent.browserEvent.code] = {
                    'value': standardKeyboardEvent.browserEvent.key,
                    'withShift': '',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                };
                const matchedKeyboardLayout = this.getMatchedKeymapInfo(ret);
                if (matchedKeyboardLayout) {
                    return ret;
                }
                return null;
            }
            return null;
        }
    }
    exports.BrowserKeyboardMapperFactoryBase = BrowserKeyboardMapperFactoryBase;
    class BrowserKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
        constructor(configurationService, notificationService, storageService, commandService) {
            // super(notificationService, storageService, commandService);
            super(configurationService);
            const platform = platform_1.isWindows ? 'win' : platform_1.isMacintosh ? 'darwin' : 'linux';
            new Promise((resolve_1, reject_1) => { require(['vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.' + platform], resolve_1, reject_1); }).then((m) => {
                const keymapInfos = m.KeyboardLayoutContribution.INSTANCE.layoutInfos;
                this._keymapInfos.push(...keymapInfos.map(info => (new keymapInfo_1.KeymapInfo(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
                this._mru = this._keymapInfos;
                this._initialized = true;
                this.setLayoutFromBrowserAPI();
            });
        }
    }
    exports.BrowserKeyboardMapperFactory = BrowserKeyboardMapperFactory;
    class UserKeyboardLayout extends lifecycle_1.Disposable {
        get keyboardLayout() { return this._keyboardLayout; }
        constructor(keyboardLayoutResource, fileService) {
            super();
            this.keyboardLayoutResource = keyboardLayoutResource;
            this.fileService = fileService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._keyboardLayout = null;
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(changed => {
                if (changed) {
                    this._onDidChange.fire();
                }
            }), 50));
            this._register(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.keyboardLayoutResource))(() => this.reloadConfigurationScheduler.schedule()));
        }
        async initialize() {
            await this.reload();
        }
        async reload() {
            const existing = this._keyboardLayout;
            try {
                const content = await this.fileService.readFile(this.keyboardLayoutResource);
                const value = (0, json_1.parse)(content.value.toString());
                if ((0, json_1.getNodeType)(value) === 'object') {
                    const layoutInfo = value.layout;
                    const mappings = value.rawMapping;
                    this._keyboardLayout = keymapInfo_1.KeymapInfo.createKeyboardLayoutFromDebugInfo(layoutInfo, mappings, true);
                }
                else {
                    this._keyboardLayout = null;
                }
            }
            catch (e) {
                this._keyboardLayout = null;
            }
            return existing ? !objects.equals(existing, this._keyboardLayout) : true;
        }
    }
    let BrowserKeyboardLayoutService = class BrowserKeyboardLayoutService extends lifecycle_1.Disposable {
        constructor(environmentService, fileService, notificationService, storageService, commandService, configurationService) {
            super();
            this.configurationService = configurationService;
            this._onDidChangeKeyboardLayout = new event_1.Emitter();
            this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
            const keyboardConfig = configurationService.getValue('keyboard');
            const layout = keyboardConfig.layout;
            this._keyboardLayoutMode = layout ?? 'autodetect';
            this._factory = new BrowserKeyboardMapperFactory(configurationService, notificationService, storageService, commandService);
            this._register(this._factory.onDidChangeKeyboardMapper(() => {
                this._onDidChangeKeyboardLayout.fire();
            }));
            if (layout && layout !== 'autodetect') {
                // set keyboard layout
                this._factory.setKeyboardLayout(layout);
            }
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('keyboard.layout')) {
                    const keyboardConfig = configurationService.getValue('keyboard');
                    const layout = keyboardConfig.layout;
                    this._keyboardLayoutMode = layout;
                    if (layout === 'autodetect') {
                        this._factory.setLayoutFromBrowserAPI();
                    }
                    else {
                        this._factory.setKeyboardLayout(layout);
                    }
                }
            }));
            this._userKeyboardLayout = new UserKeyboardLayout(environmentService.keyboardLayoutResource, fileService);
            this._userKeyboardLayout.initialize().then(() => {
                if (this._userKeyboardLayout.keyboardLayout) {
                    this._factory.registerKeyboardLayout(this._userKeyboardLayout.keyboardLayout);
                    this.setUserKeyboardLayoutIfMatched();
                }
            });
            this._register(this._userKeyboardLayout.onDidChange(() => {
                const userKeyboardLayouts = this._factory.keymapInfos.filter(layout => layout.isUserKeyboardLayout);
                if (userKeyboardLayouts.length) {
                    if (this._userKeyboardLayout.keyboardLayout) {
                        userKeyboardLayouts[0].update(this._userKeyboardLayout.keyboardLayout);
                    }
                    else {
                        this._factory.removeKeyboardLayout(userKeyboardLayouts[0]);
                    }
                }
                else {
                    if (this._userKeyboardLayout.keyboardLayout) {
                        this._factory.registerKeyboardLayout(this._userKeyboardLayout.keyboardLayout);
                    }
                }
                this.setUserKeyboardLayoutIfMatched();
            }));
        }
        setUserKeyboardLayoutIfMatched() {
            const keyboardConfig = this.configurationService.getValue('keyboard');
            const layout = keyboardConfig.layout;
            if (layout && this._userKeyboardLayout.keyboardLayout) {
                if ((0, keyboardLayout_1.getKeyboardLayoutId)(this._userKeyboardLayout.keyboardLayout.layout) === layout && this._factory.activeKeymap) {
                    if (!this._userKeyboardLayout.keyboardLayout.equal(this._factory.activeKeymap)) {
                        this._factory.setActiveKeymapInfo(this._userKeyboardLayout.keyboardLayout);
                    }
                }
            }
        }
        getKeyboardMapper() {
            return this._factory.getKeyboardMapper();
        }
        getCurrentKeyboardLayout() {
            return this._factory.activeKeyboardLayout;
        }
        getAllKeyboardLayouts() {
            return this._factory.keyboardLayouts;
        }
        getRawKeyboardMapping() {
            return this._factory.activeKeyMapping;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            if (this._keyboardLayoutMode !== 'autodetect') {
                return;
            }
            this._factory.validateCurrentKeyboardMapping(keyboardEvent);
        }
    };
    exports.BrowserKeyboardLayoutService = BrowserKeyboardLayoutService;
    exports.BrowserKeyboardLayoutService = BrowserKeyboardLayoutService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, notification_1.INotificationService),
        __param(3, storage_1.IStorageService),
        __param(4, commands_1.ICommandService),
        __param(5, configuration_1.IConfigurationService)
    ], BrowserKeyboardLayoutService);
    (0, extensions_1.registerSingleton)(keyboardLayout_1.IKeyboardLayoutService, BrowserKeyboardLayoutService, 1 /* InstantiationType.Delayed */);
    // Configuration
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const keyboardConfiguration = {
        'id': 'keyboard',
        'order': 15,
        'type': 'object',
        'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
        'properties': {
            'keyboard.layout': {
                'type': 'string',
                'default': 'autodetect',
                'description': nls.localize('keyboard.layout.config', "Control the keyboard layout used in web.")
            }
        }
    };
    configurationRegistry.registerConfiguration(keyboardConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRMYXlvdXRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy9icm93c2VyL2tleWJvYXJkTGF5b3V0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLE1BQWEsZ0NBQWlDLFNBQVEsc0JBQVU7UUFZL0QsSUFBSSxZQUFZO1lBQ2YsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBSSxvQkFBb0I7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQztRQUMvQyxDQUFDO1FBRUQsSUFBSSxnQkFBZ0I7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSSxlQUFlO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELFlBQ2tCLHFCQUE0QztZQUs3RCxLQUFLLEVBQUUsQ0FBQztZQUxTLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFyQzdDLCtCQUEwQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDbEQsOEJBQXlCLEdBQWdCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUEwQzlGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUU5QixJQUE2QixTQUFVLENBQUMsUUFBUSxJQUE2QixTQUFVLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzFGLFNBQVUsQ0FBQyxRQUFRLENBQUMsZ0JBQWlCLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtvQkFDbkYsb0NBQW9DO29CQUNwQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFnQyxFQUFFLEVBQUU7d0JBQ3RFLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7NEJBQ3RDLE9BQU87d0JBQ1IsQ0FBQzt3QkFFRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDeEUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDeEMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsc0JBQXNCLENBQUMsTUFBa0I7WUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQy9CLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxNQUFrQjtZQUN0QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsb0JBQW9CLENBQUMsVUFBbUM7WUFDdkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNqQixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUU5QyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQixJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDcEIsT0FBTzt3QkFDTixNQUFNLEVBQUUsVUFBVTt3QkFDbEIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQztnQkFDSCxDQUFDO2dCQUVELElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNoRCxJQUFJLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQzt3QkFDdEIsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7NEJBQ2pCLE9BQU87Z0NBQ04sTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUNwQixLQUFLLEVBQUUsQ0FBQzs2QkFDUixDQUFDO3dCQUNILENBQUM7d0JBRUQsUUFBUSxHQUFHLEtBQUssQ0FBQzt3QkFDakIsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxPQUFPO29CQUNOLE1BQU07b0JBQ04sS0FBSyxFQUFFLFFBQVE7aUJBQ2YsQ0FBQztZQUNILENBQUM7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUN6QyxPQUFPO3dCQUNOLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDcEIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQztnQkFDSCxDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELG1CQUFtQjtZQUNsQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVqRixJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM5QixPQUFPLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxNQUErQjtZQUNqRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsbUJBQW1CO1lBQ2xCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNyRCxDQUFDO1FBRUQsbUJBQW1CLENBQUMsTUFBK0I7WUFDbEQsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLElBQUkscUJBQXFCLEVBQUUsQ0FBQztnQkFDM0IsMkNBQTJDO2dCQUUzQywrSEFBK0g7Z0JBQy9ILDJDQUEyQztnQkFDM0MsNkJBQTZCO2dCQUM3QiwrREFBK0Q7Z0JBQy9ELHNGQUFzRjtnQkFDdEYsV0FBVztnQkFDWCxJQUFJO2dCQUVKLHVGQUF1RjtnQkFDdkYsb0NBQW9DO2dCQUNwQyxrQkFBa0I7Z0JBQ2xCLG9GQUFvRjtnQkFDcEYsTUFBTTtnQkFDTix5RUFBeUU7Z0JBQ3pFLGdHQUFnRztnQkFDaEcsUUFBUTtnQkFDUiwyREFBMkQ7Z0JBQzNELHVCQUF1QjtnQkFDdkIsNkZBQTZGO2dCQUM3RixNQUFNO2dCQUNOLEtBQUs7Z0JBRUwsc0xBQXNMO2dCQUV0TCxVQUFVO2dCQUNWLElBQUk7Z0JBRUosSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO29CQUM3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDO29CQUN0RCxhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixDQUFDO3FCQUFNLElBQUksTUFBTSxFQUFFLENBQUM7b0JBQ25CLElBQUkscUJBQXFCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7d0JBQzdGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUM7d0JBQ3RELGFBQWEsR0FBRyxJQUFJLENBQUM7b0JBQ3RCLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDcEQsYUFBYSxHQUFHLElBQUksQ0FBQztZQUN0QixDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUMvQyxPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXhELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELG1CQUFtQixDQUFDLFVBQXNCO1lBQ3pDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUM7WUFFcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFeEQsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2pCLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sdUJBQXVCO1lBQzdCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVPLDBCQUEwQixDQUFDLFdBQW9CLEVBQUUsYUFBOEI7WUFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNsQixPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZELDBCQUEwQjtnQkFDMUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDckMsT0FBTztnQkFDUixDQUFDO2dCQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBQSxtQ0FBa0IsRUFBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUM5RCxJQUFJLE1BQU0sQ0FBQyxRQUFRLG1DQUEyQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNqRyxnQ0FBZ0M7Z0JBQ2hDLE9BQU8sSUFBSSwrQ0FBc0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsYUFBRSxDQUFDLENBQUM7WUFDakUsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxxQ0FBb0IsQ0FBQyw0QkFBNEIsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUN2SixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFTSw4QkFBOEIsQ0FBQyxhQUE2QjtZQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTlFLElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDdkIsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxVQUFrQjtZQUMxQyxNQUFNLGNBQWMsR0FBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFBLG9DQUFtQixFQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxVQUFVLENBQUMsQ0FBQztZQUVsSSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLFVBQXNCO1lBQzlDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBRXpCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzVCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRU8sTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQXNCLEVBQUUsaUJBQTBCO1lBQ3RGLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7WUFDdEMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ3RELElBQUksYUFBRSxvQ0FBNEIsRUFBRSxDQUFDO2dCQUNwQyxPQUFPLElBQUksNkNBQXFCLENBQUMsWUFBWSxFQUEyQixVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUN4RyxDQUFDO1lBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsK0ZBQStGO2dCQUMvRixPQUFPLElBQUksK0NBQXNCLENBQUMsaUJBQWlCLEVBQUUsYUFBRSxDQUFDLENBQUM7WUFDMUQsQ0FBQztZQUVELE9BQU8sSUFBSSwrQ0FBc0IsQ0FBQyxZQUFZLEVBQTRCLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxhQUFFLENBQUMsQ0FBQztRQUM5RyxDQUFDO1FBRUQscUJBQXFCO1FBQ2IsK0JBQStCLENBQUMsYUFBNkI7WUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxhQUFzQyxDQUFDO1lBQ3JFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUM3QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUVELElBQUkscUJBQXFCLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxNQUFNLElBQUkscUJBQXFCLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN6RyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFLENBQUM7Z0JBQzFCLG9GQUFvRjtnQkFDcEYsSUFBSSxhQUFhLENBQUMsT0FBTyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDcEQsVUFBVSxDQUFDLEdBQUcsRUFBRTt3QkFDZixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUF1QyxFQUFFLEVBQUU7NEJBQzdFLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0NBQ3JDLE9BQU87NEJBQ1IsQ0FBQzs0QkFFRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzt3QkFDaEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNULENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsTUFBTSxhQUFhLEdBQUcscUJBQXFCLENBQUMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM5RyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDakQscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBRXJFLE1BQU0sTUFBTSxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsdUJBQXVCLENBQUM7Z0JBQ2pILENBQUMscUJBQXFCLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztnQkFDNUQsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDO2dCQUM5RCxPQUFPLENBQUMsY0FBYyxDQUFDO1lBRXhCLElBQUksTUFBTSxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQ2pFLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELGdIQUFnSDtZQUNoSCxJQUFJLENBQUMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssYUFBYSxFQUFFLENBQUM7Z0JBQ3pFLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVPLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxhQUE4QjtZQUNqRSxJQUFLLFNBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQztvQkFDSixPQUFRLFNBQWlCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO3dCQUNqRSxNQUFNLEdBQUcsR0FBcUIsRUFBRSxDQUFDO3dCQUNqQyxLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUNyQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7Z0NBQ2IsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ2YsV0FBVyxFQUFFLEVBQUU7Z0NBQ2YsV0FBVyxFQUFFLEVBQUU7Z0NBQ2YsZ0JBQWdCLEVBQUUsRUFBRTs2QkFDcEIsQ0FBQzt3QkFDSCxDQUFDO3dCQUVELE9BQU8sR0FBRyxDQUFDO3dCQUVYLGdFQUFnRTt3QkFFaEUsK0JBQStCO3dCQUMvQixnREFBZ0Q7d0JBQ2hELElBQUk7d0JBRUosZUFBZTtvQkFDaEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFBQyxNQUFNLENBQUM7b0JBQ1IsbUVBQW1FO2dCQUNwRSxDQUFDO1lBQ0YsQ0FBQztpQkFBTSxJQUFJLGFBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEksTUFBTSxHQUFHLEdBQXFCLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxxQkFBcUIsR0FBRyxhQUFzQyxDQUFDO2dCQUNyRSxHQUFHLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHO29CQUM5QyxPQUFPLEVBQUUscUJBQXFCLENBQUMsWUFBWSxDQUFDLEdBQUc7b0JBQy9DLFdBQVcsRUFBRSxFQUFFO29CQUNmLFdBQVcsRUFBRSxFQUFFO29CQUNmLGdCQUFnQixFQUFFLEVBQUU7aUJBQ3BCLENBQUM7Z0JBRUYsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTdELElBQUkscUJBQXFCLEVBQUUsQ0FBQztvQkFDM0IsT0FBTyxHQUFHLENBQUM7Z0JBQ1osQ0FBQztnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FHRDtJQTVaRCw0RUE0WkM7SUFFRCxNQUFhLDRCQUE2QixTQUFRLGdDQUFnQztRQUNqRixZQUFZLG9CQUEyQyxFQUFFLG1CQUF5QyxFQUFFLGNBQStCLEVBQUUsY0FBK0I7WUFDbkssOERBQThEO1lBQzlELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTVCLE1BQU0sUUFBUSxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFFdEUsZ0RBQU8sK0VBQStFLEdBQUcsUUFBUSw0QkFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDN0csTUFBTSxXQUFXLEdBQWtCLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUNyRixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksdUJBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsSixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQWZELG9FQWVDO0lBRUQsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQU8xQyxJQUFJLGNBQWMsS0FBd0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUV4RSxZQUNrQixzQkFBMkIsRUFDM0IsV0FBeUI7WUFFMUMsS0FBSyxFQUFFLENBQUM7WUFIUywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQUs7WUFDM0IsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFSeEIsaUJBQVksR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDNUUsZ0JBQVcsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFXM0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFFNUIsSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxRyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNiLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzFCLENBQUM7WUFDRixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRVQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuSyxDQUFDO1FBRUQsS0FBSyxDQUFDLFVBQVU7WUFDZixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRU8sS0FBSyxDQUFDLE1BQU07WUFDbkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUN0QyxJQUFJLENBQUM7Z0JBQ0osTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxLQUFLLEdBQUcsSUFBQSxZQUFLLEVBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLElBQUEsa0JBQVcsRUFBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDckMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFDaEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLGVBQWUsR0FBRyx1QkFBVSxDQUFDLGlDQUFpQyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pHLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztnQkFDN0IsQ0FBQztZQUNGLENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNaLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzdCLENBQUM7WUFFRCxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRSxDQUFDO0tBRUQ7SUFFTSxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLHNCQUFVO1FBVzNELFlBQ3NCLGtCQUF1QyxFQUM5QyxXQUF5QixFQUNqQixtQkFBeUMsRUFDOUMsY0FBK0IsRUFDL0IsY0FBK0IsRUFDekIsb0JBQW1EO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBRnVCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFkMUQsK0JBQTBCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNsRCw4QkFBeUIsR0FBZ0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQWdCOUYsTUFBTSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFxQixVQUFVLENBQUMsQ0FBQztZQUNyRixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLElBQUksWUFBWSxDQUFDO1lBQ2xELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFNUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLE1BQU0sSUFBSSxNQUFNLEtBQUssWUFBWSxFQUFFLENBQUM7Z0JBQ3ZDLHNCQUFzQjtnQkFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO29CQUMvQyxNQUFNLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQXFCLFVBQVUsQ0FBQyxDQUFDO29CQUNyRixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO29CQUVsQyxJQUFJLE1BQU0sS0FBSyxZQUFZLEVBQUUsQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO29CQUN6QyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDekMsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUMvQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBRTlFLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO2dCQUN2QyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUN4RCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUVwRyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNoQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDN0MsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDeEUsQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUQsQ0FBQztnQkFDRixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMvRSxDQUFDO2dCQUNGLENBQUM7Z0JBRUQsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCw4QkFBOEI7WUFDN0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBcUIsVUFBVSxDQUFDLENBQUM7WUFDMUYsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUVyQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZELElBQUksSUFBQSxvQ0FBbUIsRUFBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUVsSCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO3dCQUNoRixJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDNUUsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFRCxpQkFBaUI7WUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUMsQ0FBQztRQUVNLHdCQUF3QjtZQUM5QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUM7UUFDM0MsQ0FBQztRQUVNLHFCQUFxQjtZQUMzQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO1FBQ3RDLENBQUM7UUFFTSxxQkFBcUI7WUFDM0IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO1FBQ3ZDLENBQUM7UUFFTSw4QkFBOEIsQ0FBQyxhQUE2QjtZQUNsRSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxZQUFZLEVBQUUsQ0FBQztnQkFDL0MsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLDhCQUE4QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FDRCxDQUFBO0lBakhZLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBWXRDLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLDBCQUFlLENBQUE7UUFDZixXQUFBLHFDQUFxQixDQUFBO09BakJYLDRCQUE0QixDQWlIeEM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLHVDQUFzQixFQUFFLDRCQUE0QixvQ0FBNEIsQ0FBQztJQUVuRyxnQkFBZ0I7SUFDaEIsTUFBTSxxQkFBcUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbEcsTUFBTSxxQkFBcUIsR0FBdUI7UUFDakQsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLEVBQUU7UUFDWCxNQUFNLEVBQUUsUUFBUTtRQUNoQixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUM7UUFDL0QsWUFBWSxFQUFFO1lBQ2IsaUJBQWlCLEVBQUU7Z0JBQ2xCLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixTQUFTLEVBQUUsWUFBWTtnQkFDdkIsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsMENBQTBDLENBQUM7YUFDakc7U0FDRDtLQUNELENBQUM7SUFFRixxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDIn0=