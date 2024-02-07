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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/list", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/selectBox/selectBox", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/toolbar/toolbar", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/languages/language", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesValidation"], function (require, exports, canIUse_1, DOM, keyboardEvent_1, markdownRenderer_1, aria, button_1, simpleIconLabel_1, inputBox_1, list_1, listWidget_1, selectBox_1, toggle_1, toolbar_1, abstractTree_1, objectTreeModel_1, actions_1, arrays_1, codicons_1, errors_1, event_1, lifecycle_1, platform_1, strings_1, types_1, language_1, markdownRenderer_2, nls_1, clipboardService_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, productService_1, telemetry_1, defaultStyles_1, colorRegistry_1, themeService_1, userDataProfile_1, settingsMerge_1, userDataSync_1, extensions_1, preferencesIcons_1, settingsEditorSettingIndicators_1, settingsTreeModels_1, settingsWidgets_1, preferences_1, settingsEditorColorRegistry_1, configuration_2, environmentService_1, extensions_2, preferences_2, preferencesValidation_1) {
    "use strict";
    var AbstractSettingRenderer_1, CopySettingIdAction_1, CopySettingAsJSONAction_1, SyncSettingAction_1, ApplySettingToAllProfilesAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsTree = exports.NonCollapsibleObjectTreeModel = exports.SettingsTreeFilter = exports.SettingTreeRenderers = exports.SettingsExtensionToggleRenderer = exports.SettingBoolRenderer = exports.SettingNumberRenderer = exports.SettingEnumRenderer = exports.SettingIncludeRenderer = exports.SettingExcludeRenderer = exports.SettingComplexRenderer = exports.SettingNewExtensionsRenderer = exports.SettingGroupRenderer = exports.AbstractSettingRenderer = exports.createSettingMatchRegExp = exports.createTocTreeForExtensionSettings = exports.resolveConfiguredUntrustedSettings = exports.resolveSettingsTree = void 0;
    const $ = DOM.$;
    function getIncludeExcludeDisplayValue(element) {
        const data = element.isConfigured ?
            { ...element.defaultValue, ...element.scopeValue } :
            element.defaultValue;
        return Object.keys(data)
            .filter(key => !!data[key])
            .map(key => {
            const value = data[key];
            const sibling = typeof value === 'boolean' ? undefined : value.when;
            return {
                value: {
                    type: 'string',
                    data: key
                },
                sibling,
                elementType: element.valueType
            };
        });
    }
    function areAllPropertiesDefined(properties, itemsToDisplay) {
        const staticProperties = new Set(properties);
        itemsToDisplay.forEach(({ key }) => staticProperties.delete(key.data));
        return staticProperties.size === 0;
    }
    function getEnumOptionsFromSchema(schema) {
        if (schema.anyOf) {
            return schema.anyOf.map(getEnumOptionsFromSchema).flat();
        }
        const enumDescriptions = schema.enumDescriptions ?? [];
        return (schema.enum ?? []).map((value, idx) => {
            const description = idx < enumDescriptions.length
                ? enumDescriptions[idx]
                : undefined;
            return { value, description };
        });
    }
    function getObjectValueType(schema) {
        if (schema.anyOf) {
            const subTypes = schema.anyOf.map(getObjectValueType);
            if (subTypes.some(type => type === 'enum')) {
                return 'enum';
            }
            return 'string';
        }
        if (schema.type === 'boolean') {
            return 'boolean';
        }
        else if (schema.type === 'string' && (0, types_1.isDefined)(schema.enum) && schema.enum.length > 0) {
            return 'enum';
        }
        else {
            return 'string';
        }
    }
    function getObjectDisplayValue(element) {
        const elementDefaultValue = typeof element.defaultValue === 'object'
            ? element.defaultValue ?? {}
            : {};
        const elementScopeValue = typeof element.scopeValue === 'object'
            ? element.scopeValue ?? {}
            : {};
        const data = element.isConfigured ?
            { ...elementDefaultValue, ...elementScopeValue } :
            elementDefaultValue;
        const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
        const patternsAndSchemas = Object
            .entries(objectPatternProperties ?? {})
            .map(([pattern, schema]) => ({
            pattern: new RegExp(pattern),
            schema
        }));
        const wellDefinedKeyEnumOptions = Object.entries(objectProperties ?? {}).map(([key, schema]) => ({ value: key, description: schema.description }));
        return Object.keys(data).map(key => {
            const defaultValue = elementDefaultValue[key];
            if ((0, types_1.isDefined)(objectProperties) && key in objectProperties) {
                if (element.setting.allKeysAreBoolean) {
                    return {
                        key: {
                            type: 'string',
                            data: key
                        },
                        value: {
                            type: 'boolean',
                            data: data[key]
                        },
                        keyDescription: objectProperties[key].description,
                        removable: false
                    };
                }
                const valueEnumOptions = getEnumOptionsFromSchema(objectProperties[key]);
                return {
                    key: {
                        type: 'enum',
                        data: key,
                        options: wellDefinedKeyEnumOptions,
                    },
                    value: {
                        type: getObjectValueType(objectProperties[key]),
                        data: data[key],
                        options: valueEnumOptions,
                    },
                    keyDescription: objectProperties[key].description,
                    removable: (0, types_1.isUndefinedOrNull)(defaultValue),
                };
            }
            // The row is removable if it doesn't have a default value assigned.
            // Otherwise, it is not removable, but its value can be reset to the default.
            const removable = !defaultValue;
            const schema = patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
            if (schema) {
                const valueEnumOptions = getEnumOptionsFromSchema(schema);
                return {
                    key: { type: 'string', data: key },
                    value: {
                        type: getObjectValueType(schema),
                        data: data[key],
                        options: valueEnumOptions,
                    },
                    keyDescription: schema.description,
                    removable,
                };
            }
            const additionalValueEnums = getEnumOptionsFromSchema(typeof objectAdditionalProperties === 'boolean'
                ? {}
                : objectAdditionalProperties ?? {});
            return {
                key: { type: 'string', data: key },
                value: {
                    type: typeof objectAdditionalProperties === 'object' ? getObjectValueType(objectAdditionalProperties) : 'string',
                    data: data[key],
                    options: additionalValueEnums,
                },
                keyDescription: typeof objectAdditionalProperties === 'object' ? objectAdditionalProperties.description : undefined,
                removable,
            };
        }).filter(item => !(0, types_1.isUndefinedOrNull)(item.value.data));
    }
    function createArraySuggester(element) {
        return (keys, idx) => {
            const enumOptions = [];
            if (element.setting.enum) {
                element.setting.enum.forEach((key, i) => {
                    // include the currently selected value, even if uniqueItems is true
                    if (!element.setting.uniqueItems || (idx !== undefined && key === keys[idx]) || !keys.includes(key)) {
                        const description = element.setting.enumDescriptions?.[i];
                        enumOptions.push({ value: key, description });
                    }
                });
            }
            return enumOptions.length > 0
                ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
                : undefined;
        };
    }
    function createObjectKeySuggester(element) {
        const { objectProperties } = element.setting;
        const allStaticKeys = Object.keys(objectProperties ?? {});
        return keys => {
            const existingKeys = new Set(keys);
            const enumOptions = [];
            allStaticKeys.forEach(staticKey => {
                if (!existingKeys.has(staticKey)) {
                    enumOptions.push({ value: staticKey, description: objectProperties[staticKey].description });
                }
            });
            return enumOptions.length > 0
                ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
                : undefined;
        };
    }
    function createObjectValueSuggester(element) {
        const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
        const patternsAndSchemas = Object
            .entries(objectPatternProperties ?? {})
            .map(([pattern, schema]) => ({
            pattern: new RegExp(pattern),
            schema
        }));
        return (key) => {
            let suggestedSchema;
            if ((0, types_1.isDefined)(objectProperties) && key in objectProperties) {
                suggestedSchema = objectProperties[key];
            }
            const patternSchema = suggestedSchema ?? patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
            if ((0, types_1.isDefined)(patternSchema)) {
                suggestedSchema = patternSchema;
            }
            else if ((0, types_1.isDefined)(objectAdditionalProperties) && typeof objectAdditionalProperties === 'object') {
                suggestedSchema = objectAdditionalProperties;
            }
            if ((0, types_1.isDefined)(suggestedSchema)) {
                const type = getObjectValueType(suggestedSchema);
                if (type === 'boolean') {
                    return { type, data: suggestedSchema.default ?? true };
                }
                else if (type === 'enum') {
                    const options = getEnumOptionsFromSchema(suggestedSchema);
                    return { type, data: suggestedSchema.default ?? options[0].value, options };
                }
                else {
                    return { type, data: suggestedSchema.default ?? '' };
                }
            }
            return;
        };
    }
    function isNonNullableNumericType(type) {
        return type === 'number' || type === 'integer';
    }
    function parseNumericObjectValues(dataElement, v) {
        const newRecord = {};
        for (const key in v) {
            // Set to true/false once we're sure of the answer
            let keyMatchesNumericProperty;
            const patternProperties = dataElement.setting.objectPatternProperties;
            const properties = dataElement.setting.objectProperties;
            const additionalProperties = dataElement.setting.objectAdditionalProperties;
            // Match the current record key against the properties of the object
            if (properties) {
                for (const propKey in properties) {
                    if (propKey === key) {
                        keyMatchesNumericProperty = isNonNullableNumericType(properties[propKey].type);
                        break;
                    }
                }
            }
            if (keyMatchesNumericProperty === undefined && patternProperties) {
                for (const patternKey in patternProperties) {
                    if (key.match(patternKey)) {
                        keyMatchesNumericProperty = isNonNullableNumericType(patternProperties[patternKey].type);
                        break;
                    }
                }
            }
            if (keyMatchesNumericProperty === undefined && additionalProperties && typeof additionalProperties !== 'boolean') {
                if (isNonNullableNumericType(additionalProperties.type)) {
                    keyMatchesNumericProperty = true;
                }
            }
            newRecord[key] = keyMatchesNumericProperty ? Number(v[key]) : v[key];
        }
        return newRecord;
    }
    function getListDisplayValue(element) {
        if (!element.value || !Array.isArray(element.value)) {
            return [];
        }
        if (element.setting.arrayItemType === 'enum') {
            let enumOptions = [];
            if (element.setting.enum) {
                enumOptions = element.setting.enum.map((setting, i) => {
                    return {
                        value: setting,
                        description: element.setting.enumDescriptions?.[i]
                    };
                });
            }
            return element.value.map((key) => {
                return {
                    value: {
                        type: 'enum',
                        data: key,
                        options: enumOptions
                    }
                };
            });
        }
        else {
            return element.value.map((key) => {
                return {
                    value: {
                        type: 'string',
                        data: key
                    }
                };
            });
        }
    }
    function getShowAddButtonList(dataElement, listDisplayValue) {
        if (dataElement.setting.enum && dataElement.setting.uniqueItems) {
            return dataElement.setting.enum.length - listDisplayValue.length > 0;
        }
        else {
            return true;
        }
    }
    function resolveSettingsTree(tocData, coreSettingsGroups, logService) {
        const allSettings = getFlatSettings(coreSettingsGroups);
        return {
            tree: _resolveSettingsTree(tocData, allSettings, logService),
            leftoverSettings: allSettings
        };
    }
    exports.resolveSettingsTree = resolveSettingsTree;
    function resolveConfiguredUntrustedSettings(groups, target, languageFilter, configurationService) {
        const allSettings = getFlatSettings(groups);
        return [...allSettings].filter(setting => setting.restricted && (0, settingsTreeModels_1.inspectSetting)(setting.key, target, languageFilter, configurationService).isConfigured);
    }
    exports.resolveConfiguredUntrustedSettings = resolveConfiguredUntrustedSettings;
    async function createTocTreeForExtensionSettings(extensionService, groups) {
        const extGroupTree = new Map();
        const addEntryToTree = (extensionId, extensionName, childEntry) => {
            if (!extGroupTree.has(extensionId)) {
                const rootEntry = {
                    id: extensionId,
                    label: extensionName,
                    children: []
                };
                extGroupTree.set(extensionId, rootEntry);
            }
            extGroupTree.get(extensionId).children.push(childEntry);
        };
        const processGroupEntry = async (group) => {
            const flatSettings = group.sections.map(section => section.settings).flat();
            const extensionId = group.extensionInfo.id;
            const extension = await extensionService.getExtension(extensionId);
            const extensionName = extension?.displayName ?? extension?.name ?? extensionId;
            // Each group represents a single category of settings.
            // If the extension author forgets to specify an id for the group,
            // fall back to the title given to the group.
            const childEntry = {
                id: group.id || group.title,
                label: group.title,
                order: group.order,
                settings: flatSettings
            };
            addEntryToTree(extensionId, extensionName, childEntry);
        };
        const processPromises = groups.map(g => processGroupEntry(g));
        return Promise.all(processPromises).then(() => {
            const extGroups = [];
            for (const extensionRootEntry of extGroupTree.values()) {
                for (const child of extensionRootEntry.children) {
                    // Sort the individual settings of the child by order.
                    // Leave the undefined order settings untouched.
                    child.settings?.sort((a, b) => {
                        return (0, preferences_1.compareTwoNullableNumbers)(a.order, b.order);
                    });
                }
                if (extensionRootEntry.children.length === 1) {
                    // There is a single category for this extension.
                    // Push a flattened setting.
                    extGroups.push({
                        id: extensionRootEntry.id,
                        label: extensionRootEntry.children[0].label,
                        settings: extensionRootEntry.children[0].settings
                    });
                }
                else {
                    // Sort the categories.
                    // Leave the undefined order categories untouched.
                    extensionRootEntry.children.sort((a, b) => {
                        return (0, preferences_1.compareTwoNullableNumbers)(a.order, b.order);
                    });
                    // If there is a category that matches the setting name,
                    // add the settings in manually as "ungrouped" settings.
                    // https://github.com/microsoft/vscode/issues/137259
                    const ungroupedChild = extensionRootEntry.children.find(child => child.label === extensionRootEntry.label);
                    if (ungroupedChild && !ungroupedChild.children) {
                        const groupedChildren = extensionRootEntry.children.filter(child => child !== ungroupedChild);
                        extGroups.push({
                            id: extensionRootEntry.id,
                            label: extensionRootEntry.label,
                            settings: ungroupedChild.settings,
                            children: groupedChildren
                        });
                    }
                    else {
                        // Push all the groups as-is.
                        extGroups.push(extensionRootEntry);
                    }
                }
            }
            // Sort the outermost settings.
            extGroups.sort((a, b) => a.label.localeCompare(b.label));
            return {
                id: 'extensions',
                label: (0, nls_1.localize)('extensions', "Extensions"),
                children: extGroups
            };
        });
    }
    exports.createTocTreeForExtensionSettings = createTocTreeForExtensionSettings;
    function _resolveSettingsTree(tocData, allSettings, logService) {
        let children;
        if (tocData.children) {
            children = tocData.children
                .map(child => _resolveSettingsTree(child, allSettings, logService))
                .filter(child => child.children?.length || child.settings?.length);
        }
        let settings;
        if (tocData.settings) {
            settings = tocData.settings.map(pattern => getMatchingSettings(allSettings, pattern, logService)).flat();
        }
        if (!children && !settings) {
            throw new Error(`TOC node has no child groups or settings: ${tocData.id}`);
        }
        return {
            id: tocData.id,
            label: tocData.label,
            children,
            settings
        };
    }
    const knownDynamicSettingGroups = [
        /^settingsSync\..*/,
        /^sync\..*/,
        /^workbench.fontAliasing$/,
    ];
    function getMatchingSettings(allSettings, pattern, logService) {
        const result = [];
        allSettings.forEach(s => {
            if (settingMatches(s, pattern)) {
                result.push(s);
                allSettings.delete(s);
            }
        });
        if (!result.length && !knownDynamicSettingGroups.some(r => r.test(pattern))) {
            logService.warn(`Settings pattern "${pattern}" doesn't match any settings`);
        }
        return result.sort((a, b) => a.key.localeCompare(b.key));
    }
    const settingPatternCache = new Map();
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.escapeRegExpCharacters)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    exports.createSettingMatchRegExp = createSettingMatchRegExp;
    function settingMatches(s, pattern) {
        let regExp = settingPatternCache.get(pattern);
        if (!regExp) {
            regExp = createSettingMatchRegExp(pattern);
            settingPatternCache.set(pattern, regExp);
        }
        return regExp.test(s.key);
    }
    function getFlatSettings(settingsGroups) {
        const result = new Set();
        for (const group of settingsGroups) {
            for (const section of group.sections) {
                for (const s of section.settings) {
                    if (!s.overrides || !s.overrides.length) {
                        result.add(s);
                    }
                }
            }
        }
        return result;
    }
    const SETTINGS_TEXT_TEMPLATE_ID = 'settings.text.template';
    const SETTINGS_MULTILINE_TEXT_TEMPLATE_ID = 'settings.multilineText.template';
    const SETTINGS_NUMBER_TEMPLATE_ID = 'settings.number.template';
    const SETTINGS_ENUM_TEMPLATE_ID = 'settings.enum.template';
    const SETTINGS_BOOL_TEMPLATE_ID = 'settings.bool.template';
    const SETTINGS_ARRAY_TEMPLATE_ID = 'settings.array.template';
    const SETTINGS_EXCLUDE_TEMPLATE_ID = 'settings.exclude.template';
    const SETTINGS_INCLUDE_TEMPLATE_ID = 'settings.include.template';
    const SETTINGS_OBJECT_TEMPLATE_ID = 'settings.object.template';
    const SETTINGS_BOOL_OBJECT_TEMPLATE_ID = 'settings.boolObject.template';
    const SETTINGS_COMPLEX_TEMPLATE_ID = 'settings.complex.template';
    const SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID = 'settings.newExtensions.template';
    const SETTINGS_ELEMENT_TEMPLATE_ID = 'settings.group.template';
    const SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID = 'settings.extensionToggle.template';
    function removeChildrenFromTabOrder(node) {
        const focusableElements = node.querySelectorAll(`
		[tabindex="0"],
		input:not([tabindex="-1"]),
		select:not([tabindex="-1"]),
		textarea:not([tabindex="-1"]),
		a:not([tabindex="-1"]),
		button:not([tabindex="-1"]),
		area:not([tabindex="-1"])
	`);
        focusableElements.forEach(element => {
            element.setAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR, 'true');
            element.setAttribute('tabindex', '-1');
        });
    }
    function addChildrenToTabOrder(node) {
        const focusableElements = node.querySelectorAll(`[${AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR}="true"]`);
        focusableElements.forEach(element => {
            element.removeAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR);
            element.setAttribute('tabindex', '0');
        });
    }
    let AbstractSettingRenderer = class AbstractSettingRenderer extends lifecycle_1.Disposable {
        static { AbstractSettingRenderer_1 = this; }
        static { this.CONTROL_CLASS = 'setting-control-focus-target'; }
        static { this.CONTROL_SELECTOR = '.' + AbstractSettingRenderer_1.CONTROL_CLASS; }
        static { this.CONTENTS_CLASS = 'setting-item-contents'; }
        static { this.CONTENTS_SELECTOR = '.' + AbstractSettingRenderer_1.CONTENTS_CLASS; }
        static { this.ALL_ROWS_SELECTOR = '.monaco-list-row'; }
        static { this.SETTING_KEY_ATTR = 'data-key'; }
        static { this.SETTING_ID_ATTR = 'data-id'; }
        static { this.ELEMENT_FOCUSABLE_ATTR = 'data-focusable'; }
        constructor(settingActions, disposableActionFactory, _themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService, _extensionsService, _extensionsWorkbenchService, _productService, _telemetryService) {
            super();
            this.settingActions = settingActions;
            this.disposableActionFactory = disposableActionFactory;
            this._themeService = _themeService;
            this._contextViewService = _contextViewService;
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this._configService = _configService;
            this._extensionsService = _extensionsService;
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._productService = _productService;
            this._telemetryService = _telemetryService;
            this._onDidClickOverrideElement = this._register(new event_1.Emitter());
            this.onDidClickOverrideElement = this._onDidClickOverrideElement.event;
            this._onDidChangeSetting = this._register(new event_1.Emitter());
            this.onDidChangeSetting = this._onDidChangeSetting.event;
            this._onDidOpenSettings = this._register(new event_1.Emitter());
            this.onDidOpenSettings = this._onDidOpenSettings.event;
            this._onDidClickSettingLink = this._register(new event_1.Emitter());
            this.onDidClickSettingLink = this._onDidClickSettingLink.event;
            this._onDidFocusSetting = this._register(new event_1.Emitter());
            this.onDidFocusSetting = this._onDidFocusSetting.event;
            this._onDidChangeIgnoredSettings = this._register(new event_1.Emitter());
            this.onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
            this._onDidChangeSettingHeight = this._register(new event_1.Emitter());
            this.onDidChangeSettingHeight = this._onDidChangeSettingHeight.event;
            this._onApplyFilter = this._register(new event_1.Emitter());
            this.onApplyFilter = this._onApplyFilter.event;
            this.markdownRenderer = this._register(_instantiationService.createInstance(markdownRenderer_2.MarkdownRenderer, {}));
            this.ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this._configService);
            this._register(this._configService.onDidChangeConfiguration(e => {
                this.ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this._configService);
                this._onDidChangeIgnoredSettings.fire();
            }));
        }
        renderCommonTemplate(tree, _container, typeClass) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-' + typeClass);
            const toDispose = new lifecycle_1.DisposableStore();
            const container = DOM.append(_container, $(AbstractSettingRenderer_1.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.append(container, $('.setting-item-title'));
            const labelCategoryContainer = DOM.append(titleElement, $('.setting-item-cat-label-container'));
            const categoryElement = DOM.append(labelCategoryContainer, $('span.setting-item-category'));
            const labelElementContainer = DOM.append(labelCategoryContainer, $('span.setting-item-label'));
            const labelElement = new simpleIconLabel_1.SimpleIconLabel(labelElementContainer);
            const indicatorsLabel = this._instantiationService.createInstance(settingsEditorSettingIndicators_1.SettingsTreeIndicatorsLabel, titleElement);
            toDispose.add(indicatorsLabel);
            const descriptionElement = DOM.append(container, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)('modified', "The setting has been configured in the current scope.");
            const valueElement = DOM.append(container, $('.setting-item-value'));
            const controlElement = DOM.append(valueElement, $('div.setting-item-control'));
            const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
            const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
            const toolbar = this.renderSettingToolbar(toolbarContainer);
            const template = {
                toDispose,
                elementDisposables: toDispose.add(new lifecycle_1.DisposableStore()),
                containerElement: container,
                categoryElement,
                labelElement,
                descriptionElement,
                controlElement,
                deprecationWarningElement,
                indicatorsLabel,
                toolbar
            };
            // Prevent clicks from being handled by list
            toDispose.add(DOM.addDisposableListener(controlElement, DOM.EventType.MOUSE_DOWN, e => e.stopPropagation()));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        addSettingElementFocusHandler(template) {
            const focusTracker = DOM.trackFocus(template.containerElement);
            template.toDispose.add(focusTracker);
            focusTracker.onDidBlur(() => {
                if (template.containerElement.classList.contains('focused')) {
                    template.containerElement.classList.remove('focused');
                }
            });
            focusTracker.onDidFocus(() => {
                template.containerElement.classList.add('focused');
                if (template.context) {
                    this._onDidFocusSetting.fire(template.context);
                }
            });
        }
        renderSettingToolbar(container) {
            const toggleMenuKeybinding = this._keybindingService.lookupKeybinding(preferences_1.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU);
            let toggleMenuTitle = (0, nls_1.localize)('settingsContextMenuTitle', "More Actions... ");
            if (toggleMenuKeybinding) {
                toggleMenuTitle += ` (${toggleMenuKeybinding && toggleMenuKeybinding.getLabel()})`;
            }
            const toolbar = new toolbar_1.ToolBar(container, this._contextMenuService, {
                toggleMenuTitle,
                renderDropdownAsChildElement: !platform_1.isIOS,
                moreIcon: preferencesIcons_1.settingsMoreActionIcon
            });
            return toolbar;
        }
        renderSettingElement(node, index, template) {
            const element = node.element;
            // The element must inspect itself to get information for
            // the modified indicator and the overridden Settings indicators.
            element.inspectSelf();
            template.context = element;
            template.toolbar.context = element;
            const actions = this.disposableActionFactory(element.setting, element.settingsTarget);
            actions.forEach(a => (0, lifecycle_1.isDisposable)(a) && template.elementDisposables.add(a));
            template.toolbar.setActions([], [...this.settingActions, ...actions]);
            const setting = element.setting;
            template.containerElement.classList.toggle('is-configured', element.isConfigured);
            template.containerElement.setAttribute(AbstractSettingRenderer_1.SETTING_KEY_ATTR, element.setting.key);
            template.containerElement.setAttribute(AbstractSettingRenderer_1.SETTING_ID_ATTR, element.id);
            const titleTooltip = setting.key + (element.isConfigured ? ' - Modified' : '');
            template.categoryElement.textContent = element.displayCategory ? (element.displayCategory + ': ') : '';
            template.categoryElement.title = titleTooltip;
            template.labelElement.text = element.displayLabel;
            template.labelElement.title = titleTooltip;
            template.descriptionElement.innerText = '';
            if (element.setting.descriptionIsMarkdown) {
                const renderedDescription = this.renderSettingMarkdown(element, template.containerElement, element.description, template.elementDisposables);
                template.descriptionElement.appendChild(renderedDescription);
            }
            else {
                template.descriptionElement.innerText = element.description;
            }
            template.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
            template.elementDisposables.add(this._configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(configuration_2.APPLY_ALL_PROFILES_SETTING)) {
                    template.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
                }
            }));
            const onChange = (value) => this._onDidChangeSetting.fire({
                key: element.setting.key,
                value,
                type: template.context.valueType,
                manualReset: false,
                scope: element.setting.scope
            });
            const deprecationText = element.setting.deprecationMessage || '';
            if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
                template.deprecationWarningElement.innerText = '';
                template.deprecationWarningElement.appendChild(this.renderSettingMarkdown(element, template.containerElement, element.setting.deprecationMessage, template.elementDisposables));
            }
            else {
                template.deprecationWarningElement.innerText = deprecationText;
            }
            template.deprecationWarningElement.prepend($('.codicon.codicon-error'));
            template.containerElement.classList.toggle('is-deprecated', !!deprecationText);
            this.renderValue(element, template, onChange);
            template.indicatorsLabel.updateWorkspaceTrust(element);
            template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
            template.indicatorsLabel.updateDefaultOverrideIndicator(element);
            template.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
                template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
            }));
            this.updateSettingTabbable(element, template);
            template.elementDisposables.add(element.onDidChangeTabbable(() => {
                this.updateSettingTabbable(element, template);
            }));
        }
        updateSettingTabbable(element, template) {
            if (element.tabbable) {
                addChildrenToTabOrder(template.containerElement);
            }
            else {
                removeChildrenFromTabOrder(template.containerElement);
            }
        }
        renderSettingMarkdown(element, container, text, disposables) {
            // Rewrite `#editor.fontSize#` to link format
            text = fixSettingLinks(text);
            const renderedMarkdown = this.markdownRenderer.render({ value: text, isTrusted: true }, {
                actionHandler: {
                    callback: (content) => {
                        if (content.startsWith('#')) {
                            const e = {
                                source: element,
                                targetKey: content.substring(1)
                            };
                            this._onDidClickSettingLink.fire(e);
                        }
                        else {
                            this._openerService.open(content, { allowCommands: true }).catch(errors_1.onUnexpectedError);
                        }
                    },
                    disposables
                },
                asyncRenderCallback: () => {
                    const height = container.clientHeight;
                    if (height) {
                        this._onDidChangeSettingHeight.fire({ element, height });
                    }
                },
            });
            disposables.add(renderedMarkdown);
            renderedMarkdown.element.classList.add('setting-item-markdown');
            cleanRenderedMarkdown(renderedMarkdown.element);
            return renderedMarkdown.element;
        }
        disposeTemplate(template) {
            template.toDispose.dispose();
        }
        disposeElement(_element, _index, template, _height) {
            template.elementDisposables?.clear();
        }
    };
    exports.AbstractSettingRenderer = AbstractSettingRenderer;
    exports.AbstractSettingRenderer = AbstractSettingRenderer = AbstractSettingRenderer_1 = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, contextView_1.IContextViewService),
        __param(4, opener_1.IOpenerService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, commands_1.ICommandService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, extensions_2.IExtensionService),
        __param(11, extensions_1.IExtensionsWorkbenchService),
        __param(12, productService_1.IProductService),
        __param(13, telemetry_1.ITelemetryService)
    ], AbstractSettingRenderer);
    class SettingGroupRenderer {
        constructor() {
            this.templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('group-title');
            const template = {
                parent: container,
                toDispose: new lifecycle_1.DisposableStore()
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.parent.innerText = '';
            const labelElement = DOM.append(templateData.parent, $('div.settings-group-title-label.settings-row-inner-container'));
            labelElement.classList.add(`settings-group-level-${element.element.level}`);
            labelElement.textContent = element.element.label;
            if (element.element.isFirstGroup) {
                labelElement.classList.add('settings-group-first');
            }
        }
        disposeTemplate(templateData) {
        }
    }
    exports.SettingGroupRenderer = SettingGroupRenderer;
    let SettingNewExtensionsRenderer = class SettingNewExtensionsRenderer {
        constructor(_commandService) {
            this._commandService = _commandService;
            this.templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const toDispose = new lifecycle_1.DisposableStore();
            container.classList.add('setting-item-new-extensions');
            const button = new button_1.Button(container, { title: true, ...defaultStyles_1.defaultButtonStyles });
            toDispose.add(button);
            toDispose.add(button.onDidClick(() => {
                if (template.context) {
                    this._commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', template.context.extensionIds);
                }
            }));
            button.label = (0, nls_1.localize)('newExtensionsButtonLabel', "Show matching extensions");
            button.element.classList.add('settings-new-extensions-button');
            const template = {
                button,
                toDispose
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.context = element.element;
        }
        disposeTemplate(template) {
            (0, lifecycle_1.dispose)(template.toDispose);
        }
    };
    exports.SettingNewExtensionsRenderer = SettingNewExtensionsRenderer;
    exports.SettingNewExtensionsRenderer = SettingNewExtensionsRenderer = __decorate([
        __param(0, commands_1.ICommandService)
    ], SettingNewExtensionsRenderer);
    class SettingComplexRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
        }
        static { this.EDIT_IN_JSON_LABEL = (0, nls_1.localize)('editInSettingsJson', "Edit in settings.json"); }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'complex');
            const openSettingsButton = DOM.append(common.controlElement, $('a.edit-in-settings-button'));
            openSettingsButton.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            openSettingsButton.role = 'button';
            const validationErrorMessageElement = $('.setting-item-validation-message');
            common.containerElement.appendChild(validationErrorMessageElement);
            const template = {
                ...common,
                button: openSettingsButton,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const plainKey = (0, configuration_1.getLanguageTagSettingPlainKey)(dataElement.setting.key);
            const editLanguageSettingLabel = (0, nls_1.localize)('editLanguageSettingLabel', "Edit settings for {0}", plainKey);
            const isLanguageTagSetting = dataElement.setting.isLanguageTagSetting;
            template.button.textContent = isLanguageTagSetting
                ? editLanguageSettingLabel
                : SettingComplexRenderer.EDIT_IN_JSON_LABEL;
            const onClickOrKeydown = (e) => {
                if (isLanguageTagSetting) {
                    this._onApplyFilter.fire(`@${preferences_1.LANGUAGE_SETTING_TAG}${plainKey}`);
                }
                else {
                    this._onDidOpenSettings.fire(dataElement.setting.key);
                }
                e.preventDefault();
                e.stopPropagation();
            };
            template.elementDisposables.add(DOM.addDisposableListener(template.button, DOM.EventType.CLICK, (e) => {
                onClickOrKeydown(e);
            }));
            template.elementDisposables.add(DOM.addDisposableListener(template.button, DOM.EventType.KEY_DOWN, (e) => {
                const ev = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (ev.equals(10 /* KeyCode.Space */) || ev.equals(3 /* KeyCode.Enter */)) {
                    onClickOrKeydown(e);
                }
            }));
            this.renderValidations(dataElement, template);
            if (isLanguageTagSetting) {
                template.button.setAttribute('aria-label', editLanguageSettingLabel);
            }
            else {
                template.button.setAttribute('aria-label', `${SettingComplexRenderer.EDIT_IN_JSON_LABEL}: ${dataElement.setting.key}`);
            }
        }
        renderValidations(dataElement, template) {
            const errMsg = dataElement.isConfigured && (0, preferencesValidation_1.getInvalidTypeError)(dataElement.value, dataElement.setting.type);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                return;
            }
            template.containerElement.classList.remove('invalid-input');
        }
    }
    exports.SettingComplexRenderer = SettingComplexRenderer;
    class SettingArrayRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ARRAY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const listWidget = this._instantiationService.createInstance(settingsWidgets_1.ListSettingWidget, common.controlElement);
            listWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(listWidget);
            const template = {
                ...common,
                listWidget,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(listWidget.onDidChangeList(e => {
                const newList = this.computeNewList(template, e);
                template.onChange?.(newList);
            }));
            return template;
        }
        computeNewList(template, e) {
            if (template.context) {
                let newValue = [];
                if (Array.isArray(template.context.scopeValue)) {
                    newValue = [...template.context.scopeValue];
                }
                else if (Array.isArray(template.context.value)) {
                    newValue = [...template.context.value];
                }
                if (e.sourceIndex !== undefined) {
                    // A drag and drop occurred
                    const sourceIndex = e.sourceIndex;
                    const targetIndex = e.targetIndex;
                    const splicedElem = newValue.splice(sourceIndex, 1)[0];
                    newValue.splice(targetIndex, 0, splicedElem);
                }
                else if (e.targetIndex !== undefined) {
                    const itemValueData = e.item?.value.data.toString() ?? '';
                    // Delete value
                    if (!e.item?.value.data && e.originalItem.value.data && e.targetIndex > -1) {
                        newValue.splice(e.targetIndex, 1);
                    }
                    // Update value
                    else if (e.item?.value.data && e.originalItem.value.data) {
                        if (e.targetIndex > -1) {
                            newValue[e.targetIndex] = itemValueData;
                        }
                        // For some reason, we are updating and cannot find original value
                        // Just append the value in this case
                        else {
                            newValue.push(itemValueData);
                        }
                    }
                    // Add value
                    else if (e.item?.value.data && !e.originalItem.value.data && e.targetIndex >= newValue.length) {
                        newValue.push(itemValueData);
                    }
                }
                if (template.context.defaultValue &&
                    Array.isArray(template.context.defaultValue) &&
                    template.context.defaultValue.length === newValue.length &&
                    template.context.defaultValue.join() === newValue.join()) {
                    return undefined;
                }
                return newValue;
            }
            return undefined;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const value = getListDisplayValue(dataElement);
            const keySuggester = dataElement.setting.enum ? createArraySuggester(dataElement) : undefined;
            template.listWidget.setValue(value, {
                showAddButton: getShowAddButtonList(dataElement, value),
                keySuggester
            });
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                template.listWidget.cancelEdit();
            }));
            template.onChange = (v) => {
                if (v && !renderArrayValidations(dataElement, template, v, false)) {
                    const itemType = dataElement.setting.arrayItemType;
                    const arrToSave = isNonNullableNumericType(itemType) ? v.map(a => +a) : v;
                    onChange(arrToSave);
                }
                else {
                    // Save the setting unparsed and containing the errors.
                    // renderArrayValidations will render relevant error messages.
                    onChange(v);
                }
            };
            renderArrayValidations(dataElement, template, value.map(v => v.value.data.toString()), true);
        }
    }
    class AbstractSettingObjectRenderer extends AbstractSettingRenderer {
        renderTemplateWithWidget(common, widget) {
            widget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(widget);
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const template = {
                ...common,
                validationErrorMessageElement
            };
            if (widget instanceof settingsWidgets_1.ObjectSettingCheckboxWidget) {
                template.objectCheckboxWidget = widget;
            }
            else {
                template.objectDropdownWidget = widget;
            }
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(widget.onDidChangeList(e => {
                this.onDidChangeObject(template, e);
            }));
            return template;
        }
        onDidChangeObject(template, e) {
            const widget = (template.objectCheckboxWidget ?? template.objectDropdownWidget);
            if (template.context) {
                const defaultValue = typeof template.context.defaultValue === 'object'
                    ? template.context.defaultValue ?? {}
                    : {};
                const scopeValue = typeof template.context.scopeValue === 'object'
                    ? template.context.scopeValue ?? {}
                    : {};
                const newValue = {};
                const newItems = [];
                widget.items.forEach((item, idx) => {
                    // Item was updated
                    if ((0, types_1.isDefined)(e.item) && e.targetIndex === idx) {
                        newValue[e.item.key.data] = e.item.value.data;
                        newItems.push(e.item);
                    }
                    // All remaining items, but skip the one that we just updated
                    else if ((0, types_1.isUndefinedOrNull)(e.item) || e.item.key.data !== item.key.data) {
                        newValue[item.key.data] = item.value.data;
                        newItems.push(item);
                    }
                });
                // Item was deleted
                if ((0, types_1.isUndefinedOrNull)(e.item)) {
                    delete newValue[e.originalItem.key.data];
                    const itemToDelete = newItems.findIndex(item => item.key.data === e.originalItem.key.data);
                    const defaultItemValue = defaultValue[e.originalItem.key.data];
                    // Item does not have a default
                    if ((0, types_1.isUndefinedOrNull)(defaultValue[e.originalItem.key.data]) && itemToDelete > -1) {
                        newItems.splice(itemToDelete, 1);
                    }
                    else if (itemToDelete > -1) {
                        newItems[itemToDelete].value.data = defaultItemValue;
                    }
                }
                // New item was added
                else if (widget.isItemNew(e.originalItem) && e.item.key.data !== '') {
                    newValue[e.item.key.data] = e.item.value.data;
                    newItems.push(e.item);
                }
                Object.entries(newValue).forEach(([key, value]) => {
                    // value from the scope has changed back to the default
                    if (scopeValue[key] !== value && defaultValue[key] === value) {
                        delete newValue[key];
                    }
                });
                const newObject = Object.keys(newValue).length === 0 ? undefined : newValue;
                if (template.objectCheckboxWidget) {
                    template.objectCheckboxWidget.setValue(newItems);
                }
                else {
                    template.objectDropdownWidget.setValue(newItems);
                }
                template.onChange?.(newObject);
            }
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
    }
    class SettingObjectRenderer extends AbstractSettingObjectRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_OBJECT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const widget = this._instantiationService.createInstance(settingsWidgets_1.ObjectSettingDropdownWidget, common.controlElement);
            return this.renderTemplateWithWidget(common, widget);
        }
        renderValue(dataElement, template, onChange) {
            const items = getObjectDisplayValue(dataElement);
            const { key, objectProperties, objectPatternProperties, objectAdditionalProperties } = dataElement.setting;
            template.objectDropdownWidget.setValue(items, {
                settingKey: key,
                showAddButton: objectAdditionalProperties === false
                    ? (!areAllPropertiesDefined(Object.keys(objectProperties ?? {}), items) ||
                        (0, types_1.isDefined)(objectPatternProperties))
                    : true,
                keySuggester: createObjectKeySuggester(dataElement),
                valueSuggester: createObjectValueSuggester(dataElement)
            });
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                template.objectDropdownWidget.cancelEdit();
            }));
            template.onChange = (v) => {
                if (v && !renderArrayValidations(dataElement, template, v, false)) {
                    const parsedRecord = parseNumericObjectValues(dataElement, v);
                    onChange(parsedRecord);
                }
                else {
                    // Save the setting unparsed and containing the errors.
                    // renderArrayValidations will render relevant error messages.
                    onChange(v);
                }
            };
            renderArrayValidations(dataElement, template, dataElement.value, true);
        }
    }
    class SettingBoolObjectRenderer extends AbstractSettingObjectRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const widget = this._instantiationService.createInstance(settingsWidgets_1.ObjectSettingCheckboxWidget, common.controlElement);
            return this.renderTemplateWithWidget(common, widget);
        }
        onDidChangeObject(template, e) {
            if (template.context) {
                super.onDidChangeObject(template, e);
                // Focus this setting explicitly, in case we were previously
                // focused on another setting and clicked a checkbox/value container
                // for this setting.
                this._onDidFocusSetting.fire(template.context);
            }
        }
        renderValue(dataElement, template, onChange) {
            const items = getObjectDisplayValue(dataElement);
            const { key } = dataElement.setting;
            template.objectCheckboxWidget.setValue(items, {
                settingKey: key
            });
            template.context = dataElement;
            template.onChange = (v) => {
                onChange(v);
            };
        }
    }
    class SettingIncludeExcludeRenderer extends AbstractSettingRenderer {
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const includeExcludeWidget = this._instantiationService.createInstance(this.isExclude() ? settingsWidgets_1.ExcludeSettingWidget : settingsWidgets_1.IncludeSettingWidget, common.controlElement);
            includeExcludeWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(includeExcludeWidget);
            const template = {
                ...common,
                includeExcludeWidget
            };
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(includeExcludeWidget.onDidChangeList(e => this.onDidChangeIncludeExclude(template, e)));
            return template;
        }
        onDidChangeIncludeExclude(template, e) {
            if (template.context) {
                const newValue = { ...template.context.scopeValue };
                // first delete the existing entry, if present
                if (e.originalItem.value.data.toString() in template.context.defaultValue) {
                    // delete a default by overriding it
                    newValue[e.originalItem.value.data.toString()] = false;
                }
                else {
                    delete newValue[e.originalItem.value.data.toString()];
                }
                // then add the new or updated entry, if present
                if (e.item?.value) {
                    if (e.item.value.data.toString() in template.context.defaultValue && !e.item.sibling) {
                        // add a default by deleting its override
                        delete newValue[e.item.value.data.toString()];
                    }
                    else {
                        newValue[e.item.value.data.toString()] = e.item.sibling ? { when: e.item.sibling } : true;
                    }
                }
                function sortKeys(obj) {
                    const sortedKeys = Object.keys(obj)
                        .sort((a, b) => a.localeCompare(b));
                    const retVal = {};
                    for (const key of sortedKeys) {
                        retVal[key] = obj[key];
                    }
                    return retVal;
                }
                this._onDidChangeSetting.fire({
                    key: template.context.setting.key,
                    value: Object.keys(newValue).length === 0 ? undefined : sortKeys(newValue),
                    type: template.context.valueType,
                    manualReset: false,
                    scope: template.context.setting.scope
                });
            }
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const value = getIncludeExcludeDisplayValue(dataElement);
            template.includeExcludeWidget.setValue(value);
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                template.includeExcludeWidget.cancelEdit();
            }));
        }
    }
    class SettingExcludeRenderer extends SettingIncludeExcludeRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
        }
        isExclude() {
            return true;
        }
    }
    exports.SettingExcludeRenderer = SettingExcludeRenderer;
    class SettingIncludeRenderer extends SettingIncludeExcludeRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_INCLUDE_TEMPLATE_ID;
        }
        isExclude() {
            return false;
        }
    }
    exports.SettingIncludeRenderer = SettingIncludeRenderer;
    const settingsInputBoxStyles = (0, defaultStyles_1.getInputBoxStyle)({
        inputBackground: settingsEditorColorRegistry_1.settingsTextInputBackground,
        inputForeground: settingsEditorColorRegistry_1.settingsTextInputForeground,
        inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
    });
    class AbstractSettingTextRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.MULTILINE_MAX_HEIGHT = 150;
        }
        renderTemplate(_container, useMultiline) {
            const common = this.renderCommonTemplate(null, _container, 'text');
            const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
            const inputBoxOptions = {
                flexibleHeight: useMultiline,
                flexibleWidth: false,
                flexibleMaxHeight: this.MULTILINE_MAX_HEIGHT,
                inputBoxStyles: settingsInputBoxStyles
            };
            const inputBox = new inputBox_1.InputBox(common.controlElement, this._contextViewService, inputBoxOptions);
            common.toDispose.add(inputBox);
            common.toDispose.add(inputBox.onDidChange(e => {
                template.onChange?.(e);
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = {
                ...common,
                inputBox,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = undefined;
            template.inputBox.value = dataElement.value;
            template.inputBox.setAriaLabel(dataElement.setting.key);
            template.onChange = value => {
                if (!renderValidations(dataElement, template, false)) {
                    onChange(value);
                }
            };
            renderValidations(dataElement, template, true);
        }
    }
    class SettingTextRenderer extends AbstractSettingTextRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_TEXT_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const template = super.renderTemplate(_container, false);
            // TODO@9at8: listWidget filters out all key events from input boxes, so we need to come up with a better way
            // Disable ArrowUp and ArrowDown behaviour in favor of list navigation
            template.toDispose.add(DOM.addStandardDisposableListener(template.inputBox.inputElement, DOM.EventType.KEY_DOWN, e => {
                if (e.equals(16 /* KeyCode.UpArrow */) || e.equals(18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                }
            }));
            return template;
        }
    }
    class SettingMultilineTextRenderer extends AbstractSettingTextRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            return super.renderTemplate(_container, true);
        }
        renderValue(dataElement, template, onChange) {
            const onChangeOverride = (value) => {
                // Ensure the model is up to date since a different value will be rendered as different height when probing the height.
                dataElement.value = value;
                onChange(value);
            };
            super.renderValue(dataElement, template, onChangeOverride);
            template.elementDisposables.add(template.inputBox.onDidHeightChange(e => {
                const height = template.containerElement.clientHeight;
                // Don't fire event if height is reported as 0,
                // which sometimes happens when clicking onto a new setting.
                if (height) {
                    this._onDidChangeSettingHeight.fire({
                        element: dataElement,
                        height: template.containerElement.clientHeight
                    });
                }
            }));
            template.inputBox.layout();
        }
    }
    class SettingEnumRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ENUM_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'enum');
            const styles = (0, defaultStyles_1.getSelectBoxStyles)({
                selectBackground: settingsEditorColorRegistry_1.settingsSelectBackground,
                selectForeground: settingsEditorColorRegistry_1.settingsSelectForeground,
                selectBorder: settingsEditorColorRegistry_1.settingsSelectBorder,
                selectListBorder: settingsEditorColorRegistry_1.settingsSelectListBorder
            });
            const selectBox = new selectBox_1.SelectBox([], 0, this._contextViewService, styles, {
                useCustomDrawn: !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)
            });
            common.toDispose.add(selectBox);
            selectBox.render(common.controlElement);
            const selectElement = common.controlElement.querySelector('select');
            if (selectElement) {
                selectElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
                selectElement.tabIndex = 0;
            }
            common.toDispose.add(selectBox.onDidSelect(e => {
                template.onChange?.(e.index);
            }));
            const enumDescriptionElement = common.containerElement.insertBefore($('.setting-item-enumDescription'), common.descriptionElement.nextSibling);
            const template = {
                ...common,
                selectBox,
                selectElement,
                enumDescriptionElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            // Make shallow copies here so that we don't modify the actual dataElement later
            const enumItemLabels = dataElement.setting.enumItemLabels ? [...dataElement.setting.enumItemLabels] : [];
            const enumDescriptions = dataElement.setting.enumDescriptions ? [...dataElement.setting.enumDescriptions] : [];
            const settingEnum = [...dataElement.setting.enum];
            const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
            const disposables = new lifecycle_1.DisposableStore();
            template.toDispose.add(disposables);
            let createdDefault = false;
            if (!settingEnum.includes(dataElement.defaultValue)) {
                // Add a new potentially blank default setting
                settingEnum.unshift(dataElement.defaultValue);
                enumDescriptions.unshift('');
                enumItemLabels.unshift('');
                createdDefault = true;
            }
            // Use String constructor in case of null or undefined values
            const stringifiedDefaultValue = escapeInvisibleChars(String(dataElement.defaultValue));
            const displayOptions = settingEnum
                .map(String)
                .map(escapeInvisibleChars)
                .map((data, index) => {
                const description = (enumDescriptions[index] && (enumDescriptionsAreMarkdown ? fixSettingLinks(enumDescriptions[index], false) : enumDescriptions[index]));
                return {
                    text: enumItemLabels[index] ? enumItemLabels[index] : data,
                    detail: enumItemLabels[index] ? data : '',
                    description,
                    descriptionIsMarkdown: enumDescriptionsAreMarkdown,
                    descriptionMarkdownActionHandler: {
                        callback: (content) => {
                            this._openerService.open(content).catch(errors_1.onUnexpectedError);
                        },
                        disposables: disposables
                    },
                    decoratorRight: (((data === stringifiedDefaultValue) || (createdDefault && index === 0)) ? (0, nls_1.localize)('settings.Default', "default") : '')
                };
            });
            template.selectBox.setOptions(displayOptions);
            template.selectBox.setAriaLabel(dataElement.setting.key);
            let idx = settingEnum.indexOf(dataElement.value);
            if (idx === -1) {
                idx = 0;
            }
            template.onChange = undefined;
            template.selectBox.select(idx);
            template.onChange = (idx) => {
                if (createdDefault && idx === 0) {
                    onChange(dataElement.defaultValue);
                }
                else {
                    onChange(settingEnum[idx]);
                }
            };
            template.enumDescriptionElement.innerText = '';
        }
    }
    exports.SettingEnumRenderer = SettingEnumRenderer;
    const settingsNumberInputBoxStyles = (0, defaultStyles_1.getInputBoxStyle)({
        inputBackground: settingsEditorColorRegistry_1.settingsNumberInputBackground,
        inputForeground: settingsEditorColorRegistry_1.settingsNumberInputForeground,
        inputBorder: settingsEditorColorRegistry_1.settingsNumberInputBorder
    });
    class SettingNumberRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_NUMBER_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.renderCommonTemplate(null, _container, 'number');
            const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
            const inputBox = new inputBox_1.InputBox(common.controlElement, this._contextViewService, { type: 'number', inputBoxStyles: settingsNumberInputBoxStyles });
            common.toDispose.add(inputBox);
            common.toDispose.add(inputBox.onDidChange(e => {
                template.onChange?.(e);
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = {
                ...common,
                inputBox,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const numParseFn = (dataElement.valueType === 'integer' || dataElement.valueType === 'nullable-integer')
                ? parseInt : parseFloat;
            const nullNumParseFn = (dataElement.valueType === 'nullable-integer' || dataElement.valueType === 'nullable-number')
                ? ((v) => v === '' ? null : numParseFn(v)) : numParseFn;
            template.onChange = undefined;
            template.inputBox.value = typeof dataElement.value === 'number' ?
                dataElement.value.toString() : '';
            template.inputBox.step = dataElement.valueType.includes('integer') ? '1' : 'any';
            template.inputBox.setAriaLabel(dataElement.setting.key);
            template.onChange = value => {
                if (!renderValidations(dataElement, template, false)) {
                    onChange(nullNumParseFn(value));
                }
            };
            renderValidations(dataElement, template, true);
        }
    }
    exports.SettingNumberRenderer = SettingNumberRenderer;
    class SettingBoolRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_BOOL_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-bool');
            const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.append(container, $('.setting-item-title'));
            const categoryElement = DOM.append(titleElement, $('span.setting-item-category'));
            const labelElementContainer = DOM.append(titleElement, $('span.setting-item-label'));
            const labelElement = new simpleIconLabel_1.SimpleIconLabel(labelElementContainer);
            const indicatorsLabel = this._instantiationService.createInstance(settingsEditorSettingIndicators_1.SettingsTreeIndicatorsLabel, titleElement);
            const descriptionAndValueElement = DOM.append(container, $('.setting-item-value-description'));
            const controlElement = DOM.append(descriptionAndValueElement, $('.setting-item-bool-control'));
            const descriptionElement = DOM.append(descriptionAndValueElement, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)('modified', "The setting has been configured in the current scope.");
            const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
            const toDispose = new lifecycle_1.DisposableStore();
            const checkbox = new toggle_1.Toggle({ icon: codicons_1.Codicon.check, actionClassName: 'setting-value-checkbox', isChecked: true, title: '', ...toggle_1.unthemedToggleStyles });
            controlElement.appendChild(checkbox.domNode);
            toDispose.add(checkbox);
            toDispose.add(checkbox.onChange(() => {
                template.onChange(checkbox.checked);
            }));
            // Need to listen for mouse clicks on description and toggle checkbox - use target ID for safety
            // Also have to ignore embedded links - too buried to stop propagation
            toDispose.add(DOM.addDisposableListener(descriptionElement, DOM.EventType.MOUSE_DOWN, (e) => {
                const targetElement = e.target;
                // Toggle target checkbox
                if (targetElement.tagName.toLowerCase() !== 'a') {
                    template.checkbox.checked = !template.checkbox.checked;
                    template.onChange(checkbox.checked);
                }
                DOM.EventHelper.stop(e);
            }));
            checkbox.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
            const toolbar = this.renderSettingToolbar(toolbarContainer);
            toDispose.add(toolbar);
            const template = {
                toDispose,
                elementDisposables: toDispose.add(new lifecycle_1.DisposableStore()),
                containerElement: container,
                categoryElement,
                labelElement,
                controlElement,
                checkbox,
                descriptionElement,
                deprecationWarningElement,
                indicatorsLabel,
                toolbar
            };
            this.addSettingElementFocusHandler(template);
            // Prevent clicks from being handled by list
            toDispose.add(DOM.addDisposableListener(controlElement, 'mousedown', (e) => e.stopPropagation()));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = undefined;
            template.checkbox.checked = dataElement.value;
            template.checkbox.setTitle(dataElement.setting.key);
            template.onChange = onChange;
        }
    }
    exports.SettingBoolRenderer = SettingBoolRenderer;
    class SettingsExtensionToggleRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.renderCommonTemplate(null, _container, 'extension-toggle');
            const actionButton = new button_1.Button(common.containerElement, {
                title: false,
                ...defaultStyles_1.defaultButtonStyles
            });
            actionButton.element.classList.add('setting-item-extension-toggle-button');
            actionButton.label = (0, nls_1.localize)('showExtension', "Show Extension");
            const template = {
                ...common,
                actionButton
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.elementDisposables.clear();
            const extensionId = dataElement.setting.displayExtensionId;
            template.elementDisposables.add(template.actionButton.onDidClick(async () => {
                this._telemetryService.publicLog2('ManageExtensionClick', { extensionId });
                this._commandService.executeCommand('extension.open', extensionId);
            }));
        }
    }
    exports.SettingsExtensionToggleRenderer = SettingsExtensionToggleRenderer;
    let SettingTreeRenderers = class SettingTreeRenderers {
        constructor(_instantiationService, _contextMenuService, _contextViewService, _userDataProfilesService, _userDataSyncEnablementService) {
            this._instantiationService = _instantiationService;
            this._contextMenuService = _contextMenuService;
            this._contextViewService = _contextViewService;
            this._userDataProfilesService = _userDataProfilesService;
            this._userDataSyncEnablementService = _userDataSyncEnablementService;
            this._onDidChangeSetting = new event_1.Emitter();
            this.settingActions = [
                new actions_1.Action('settings.resetSetting', (0, nls_1.localize)('resetSettingLabel', "Reset Setting"), undefined, undefined, async (context) => {
                    if (context instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                        if (!context.isUntrusted) {
                            this._onDidChangeSetting.fire({
                                key: context.setting.key,
                                value: undefined,
                                type: context.setting.type,
                                manualReset: true,
                                scope: context.setting.scope
                            });
                        }
                    }
                }),
                new actions_1.Separator(),
                this._instantiationService.createInstance(CopySettingIdAction),
                this._instantiationService.createInstance(CopySettingAsJSONAction),
            ];
            const actionFactory = (setting, settingTarget) => this.getActionsForSetting(setting, settingTarget);
            const emptyActionFactory = (_) => [];
            const settingRenderers = [
                this._instantiationService.createInstance(SettingBoolRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingNumberRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingArrayRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingComplexRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingTextRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingMultilineTextRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingExcludeRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingIncludeRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingEnumRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingObjectRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingBoolObjectRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingsExtensionToggleRenderer, [], emptyActionFactory)
            ];
            this.onDidClickOverrideElement = event_1.Event.any(...settingRenderers.map(r => r.onDidClickOverrideElement));
            this.onDidChangeSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSetting), this._onDidChangeSetting.event);
            this.onDidOpenSettings = event_1.Event.any(...settingRenderers.map(r => r.onDidOpenSettings));
            this.onDidClickSettingLink = event_1.Event.any(...settingRenderers.map(r => r.onDidClickSettingLink));
            this.onDidFocusSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidFocusSetting));
            this.onDidChangeSettingHeight = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSettingHeight));
            this.onApplyFilter = event_1.Event.any(...settingRenderers.map(r => r.onApplyFilter));
            this.allRenderers = [
                ...settingRenderers,
                this._instantiationService.createInstance(SettingGroupRenderer),
                this._instantiationService.createInstance(SettingNewExtensionsRenderer),
            ];
        }
        getActionsForSetting(setting, settingTarget) {
            const actions = [];
            if (this._userDataProfilesService.isEnabled() && setting.scope !== 1 /* ConfigurationScope.APPLICATION */ && settingTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                actions.push(this._instantiationService.createInstance(ApplySettingToAllProfilesAction, setting));
            }
            if (this._userDataSyncEnablementService.isEnabled() && !setting.disallowSyncIgnore) {
                actions.push(this._instantiationService.createInstance(SyncSettingAction, setting));
            }
            if (actions.length) {
                actions.splice(0, 0, new actions_1.Separator());
            }
            return actions;
        }
        cancelSuggesters() {
            this._contextViewService.hideContextView();
        }
        showContextMenu(element, settingDOMElement) {
            const toolbarElement = settingDOMElement.querySelector('.monaco-toolbar');
            if (toolbarElement) {
                this._contextMenuService.showContextMenu({
                    getActions: () => this.settingActions,
                    getAnchor: () => toolbarElement,
                    getActionsContext: () => element
                });
            }
        }
        getSettingDOMElementForDOMElement(domElement) {
            const parent = DOM.findParentWithClass(domElement, AbstractSettingRenderer.CONTENTS_CLASS);
            if (parent) {
                return parent;
            }
            return null;
        }
        getDOMElementsForSettingKey(treeContainer, key) {
            return treeContainer.querySelectorAll(`[${AbstractSettingRenderer.SETTING_KEY_ATTR}="${key}"]`);
        }
        getKeyForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
        }
        getIdForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_ID_ATTR);
        }
    };
    exports.SettingTreeRenderers = SettingTreeRenderers;
    exports.SettingTreeRenderers = SettingTreeRenderers = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, contextView_1.IContextViewService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, userDataSync_1.IUserDataSyncEnablementService)
    ], SettingTreeRenderers);
    /**
     * Validate and render any error message. Returns true if the value is invalid.
     */
    function renderValidations(dataElement, template, calledOnStartup) {
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(template.inputBox.value);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)('validationError', "Validation Error.");
                template.inputBox.inputElement.parentElement.setAttribute('aria-label', [validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    aria.status(validationError + ' ' + errMsg);
                }
                return true;
            }
            else {
                template.inputBox.inputElement.parentElement.removeAttribute('aria-label');
            }
        }
        template.containerElement.classList.remove('invalid-input');
        return false;
    }
    /**
     * Validate and render any error message for arrays. Returns true if the value is invalid.
     */
    function renderArrayValidations(dataElement, template, value, calledOnStartup) {
        template.containerElement.classList.add('invalid-input');
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(value);
            if (errMsg && errMsg !== '') {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)('validationError', "Validation Error.");
                template.containerElement.setAttribute('aria-label', [dataElement.setting.key, validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    aria.status(validationError + ' ' + errMsg);
                }
                return true;
            }
            else {
                template.containerElement.setAttribute('aria-label', dataElement.setting.key);
                template.containerElement.classList.remove('invalid-input');
            }
        }
        return false;
    }
    function cleanRenderedMarkdown(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes.item(i);
            const tagName = child.tagName && child.tagName.toLowerCase();
            if (tagName === 'img') {
                element.removeChild(child);
            }
            else {
                cleanRenderedMarkdown(child);
            }
        }
    }
    function fixSettingLinks(text, linkify = true) {
        return text.replace(/`#([^#\s`]+)#`|'#([^#\s']+)#'/g, (match, backticksGroup, quotesGroup) => {
            const settingKey = backticksGroup ?? quotesGroup;
            const targetDisplayFormat = (0, settingsTreeModels_1.settingKeyToDisplayFormat)(settingKey);
            const targetName = `${targetDisplayFormat.category}: ${targetDisplayFormat.label}`;
            return linkify ?
                `[${targetName}](#${settingKey} "${settingKey}")` :
                `"${targetName}"`;
        });
    }
    function escapeInvisibleChars(enumValue) {
        return enumValue && enumValue
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }
    let SettingsTreeFilter = class SettingsTreeFilter {
        constructor(viewState, environmentService) {
            this.viewState = viewState;
            this.environmentService = environmentService;
        }
        filter(element, parentVisibility) {
            // Filter during search
            if (this.viewState.filterToCategory && element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                if (!this.settingContainedInGroup(element.setting, this.viewState.filterToCategory)) {
                    return false;
                }
            }
            // Non-user scope selected
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement && this.viewState.settingsTarget !== 3 /* ConfigurationTarget.USER_LOCAL */) {
                const isRemote = !!this.environmentService.remoteAuthority;
                if (!element.matchesScope(this.viewState.settingsTarget, isRemote)) {
                    return false;
                }
            }
            // Group with no visible children
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                if (typeof element.count === 'number') {
                    return element.count > 0;
                }
                return 2 /* TreeVisibility.Recurse */;
            }
            // Filtered "new extensions" button
            if (element instanceof settingsTreeModels_1.SettingsTreeNewExtensionsElement) {
                if (this.viewState.tagFilters?.size || this.viewState.filterToCategory) {
                    return false;
                }
            }
            return true;
        }
        settingContainedInGroup(setting, group) {
            return group.children.some(child => {
                if (child instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                    return this.settingContainedInGroup(setting, child);
                }
                else if (child instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                    return child.setting.key === setting.key;
                }
                else {
                    return false;
                }
            });
        }
    };
    exports.SettingsTreeFilter = SettingsTreeFilter;
    exports.SettingsTreeFilter = SettingsTreeFilter = __decorate([
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], SettingsTreeFilter);
    class SettingsTreeDelegate extends list_1.CachedListVirtualDelegate {
        getTemplateId(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return SETTINGS_ELEMENT_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                if (element.valueType === preferences_2.SettingValueType.ExtensionToggle) {
                    return SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
                }
                const invalidTypeError = element.isConfigured && (0, preferencesValidation_1.getInvalidTypeError)(element.value, element.setting.type);
                if (invalidTypeError) {
                    return SETTINGS_COMPLEX_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Boolean) {
                    return SETTINGS_BOOL_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Integer ||
                    element.valueType === preferences_2.SettingValueType.Number ||
                    element.valueType === preferences_2.SettingValueType.NullableInteger ||
                    element.valueType === preferences_2.SettingValueType.NullableNumber) {
                    return SETTINGS_NUMBER_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.MultilineString) {
                    return SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.String) {
                    return SETTINGS_TEXT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Enum) {
                    return SETTINGS_ENUM_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Array) {
                    return SETTINGS_ARRAY_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Exclude) {
                    return SETTINGS_EXCLUDE_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Include) {
                    return SETTINGS_INCLUDE_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Object) {
                    return SETTINGS_OBJECT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.BooleanObject) {
                    return SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.LanguageTag) {
                    return SETTINGS_COMPLEX_TEMPLATE_ID;
                }
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeNewExtensionsElement) {
                return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
        hasDynamicHeight(element) {
            return !(element instanceof settingsTreeModels_1.SettingsTreeGroupElement);
        }
        estimateHeight(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return 42;
            }
            return element instanceof settingsTreeModels_1.SettingsTreeSettingElement && element.valueType === preferences_2.SettingValueType.Boolean ? 78 : 104;
        }
    }
    class NonCollapsibleObjectTreeModel extends objectTreeModel_1.ObjectTreeModel {
        isCollapsible(element) {
            return false;
        }
        setCollapsed(element, collapsed, recursive) {
            return false;
        }
    }
    exports.NonCollapsibleObjectTreeModel = NonCollapsibleObjectTreeModel;
    class SettingsTreeAccessibilityProvider {
        constructor(configurationService, languageService, userDataProfilesService) {
            this.configurationService = configurationService;
            this.languageService = languageService;
            this.userDataProfilesService = userDataProfilesService;
        }
        getAriaLabel(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                const ariaLabelSections = [];
                ariaLabelSections.push(`${element.displayCategory} ${element.displayLabel}.`);
                if (element.isConfigured) {
                    const modifiedText = (0, nls_1.localize)('settings.Modified', 'Modified.');
                    ariaLabelSections.push(modifiedText);
                }
                const indicatorsLabelAriaLabel = (0, settingsEditorSettingIndicators_1.getIndicatorsLabelAriaLabel)(element, this.configurationService, this.userDataProfilesService, this.languageService);
                if (indicatorsLabelAriaLabel.length) {
                    ariaLabelSections.push(`${indicatorsLabelAriaLabel}.`);
                }
                const descriptionWithoutSettingLinks = (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: fixSettingLinks(element.description, false) });
                if (descriptionWithoutSettingLinks.length) {
                    ariaLabelSections.push(descriptionWithoutSettingLinks);
                }
                return ariaLabelSections.join(' ');
            }
            else if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return element.label;
            }
            else {
                return element.id;
            }
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('settings', "Settings");
        }
    }
    let SettingsTree = class SettingsTree extends listService_1.WorkbenchObjectTree {
        constructor(container, viewState, renderers, contextKeyService, listService, configurationService, instantiationService, languageService, userDataProfilesService) {
            super('SettingsTree', container, new SettingsTreeDelegate(), renderers, {
                horizontalScrolling: false,
                supportDynamicHeights: true,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                accessibilityProvider: new SettingsTreeAccessibilityProvider(configurationService, languageService, userDataProfilesService),
                styleController: id => new listWidget_1.DefaultStyleController(DOM.createStyleSheet(container), id),
                filter: instantiationService.createInstance(SettingsTreeFilter, viewState),
                smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: false,
                findWidgetEnabled: false,
                renderIndentGuides: abstractTree_1.RenderIndentGuides.None,
                transformOptimization: false // Disable transform optimization #177470
            }, instantiationService, contextKeyService, listService, configurationService);
            this.getHTMLElement().classList.add('settings-editor-tree');
            this.style((0, defaultStyles_1.getListStyles)({
                listBackground: colorRegistry_1.editorBackground,
                listActiveSelectionBackground: colorRegistry_1.editorBackground,
                listActiveSelectionForeground: colorRegistry_1.foreground,
                listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                listFocusAndSelectionForeground: colorRegistry_1.foreground,
                listFocusBackground: colorRegistry_1.editorBackground,
                listFocusForeground: colorRegistry_1.foreground,
                listHoverForeground: colorRegistry_1.foreground,
                listHoverBackground: colorRegistry_1.editorBackground,
                listHoverOutline: colorRegistry_1.editorBackground,
                listFocusOutline: colorRegistry_1.editorBackground,
                listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionForeground: colorRegistry_1.foreground,
                listInactiveFocusBackground: colorRegistry_1.editorBackground,
                listInactiveFocusOutline: colorRegistry_1.editorBackground,
                treeIndentGuidesStroke: undefined,
                treeInactiveIndentGuidesStroke: undefined,
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.list.smoothScrolling')) {
                    this.updateOptions({
                        smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling')
                    });
                }
            }));
        }
        createModel(user, view, options) {
            return new NonCollapsibleObjectTreeModel(user, view, options);
        }
    };
    exports.SettingsTree = SettingsTree;
    exports.SettingsTree = SettingsTree = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, configuration_2.IWorkbenchConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, language_1.ILanguageService),
        __param(8, userDataProfile_1.IUserDataProfilesService)
    ], SettingsTree);
    let CopySettingIdAction = class CopySettingIdAction extends actions_1.Action {
        static { CopySettingIdAction_1 = this; }
        static { this.ID = 'settings.copySettingId'; }
        static { this.LABEL = (0, nls_1.localize)('copySettingIdLabel', "Copy Setting ID"); }
        constructor(clipboardService) {
            super(CopySettingIdAction_1.ID, CopySettingIdAction_1.LABEL);
            this.clipboardService = clipboardService;
        }
        async run(context) {
            if (context) {
                await this.clipboardService.writeText(context.setting.key);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingIdAction = CopySettingIdAction_1 = __decorate([
        __param(0, clipboardService_1.IClipboardService)
    ], CopySettingIdAction);
    let CopySettingAsJSONAction = class CopySettingAsJSONAction extends actions_1.Action {
        static { CopySettingAsJSONAction_1 = this; }
        static { this.ID = 'settings.copySettingAsJSON'; }
        static { this.LABEL = (0, nls_1.localize)('copySettingAsJSONLabel', "Copy Setting as JSON"); }
        constructor(clipboardService) {
            super(CopySettingAsJSONAction_1.ID, CopySettingAsJSONAction_1.LABEL);
            this.clipboardService = clipboardService;
        }
        async run(context) {
            if (context) {
                const jsonResult = `"${context.setting.key}": ${JSON.stringify(context.value, undefined, '  ')}`;
                await this.clipboardService.writeText(jsonResult);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingAsJSONAction = CopySettingAsJSONAction_1 = __decorate([
        __param(0, clipboardService_1.IClipboardService)
    ], CopySettingAsJSONAction);
    let SyncSettingAction = class SyncSettingAction extends actions_1.Action {
        static { SyncSettingAction_1 = this; }
        static { this.ID = 'settings.stopSyncingSetting'; }
        static { this.LABEL = (0, nls_1.localize)('stopSyncingSetting', "Sync This Setting"); }
        constructor(setting, configService) {
            super(SyncSettingAction_1.ID, SyncSettingAction_1.LABEL);
            this.setting = setting;
            this.configService = configService;
            this._register(event_1.Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredSettings'))(() => this.update()));
            this.update();
        }
        async update() {
            const ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this.configService);
            this.checked = !ignoredSettings.includes(this.setting.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            let currentValue = [...this.configService.getValue('settingsSync.ignoredSettings')];
            currentValue = currentValue.filter(v => v !== this.setting.key && v !== `-${this.setting.key}`);
            const defaultIgnoredSettings = (0, userDataSync_1.getDefaultIgnoredSettings)();
            const isDefaultIgnored = defaultIgnoredSettings.includes(this.setting.key);
            const askedToSync = !this.checked;
            // If asked to sync, then add only if it is ignored by default
            if (askedToSync && isDefaultIgnored) {
                currentValue.push(`-${this.setting.key}`);
            }
            // If asked not to sync, then add only if it is not ignored by default
            if (!askedToSync && !isDefaultIgnored) {
                currentValue.push(this.setting.key);
            }
            this.configService.updateValue('settingsSync.ignoredSettings', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
            return Promise.resolve(undefined);
        }
    };
    SyncSettingAction = SyncSettingAction_1 = __decorate([
        __param(1, configuration_1.IConfigurationService)
    ], SyncSettingAction);
    let ApplySettingToAllProfilesAction = class ApplySettingToAllProfilesAction extends actions_1.Action {
        static { ApplySettingToAllProfilesAction_1 = this; }
        static { this.ID = 'settings.applyToAllProfiles'; }
        static { this.LABEL = (0, nls_1.localize)('applyToAllProfiles', "Apply Setting to all Profiles"); }
        constructor(setting, configService) {
            super(ApplySettingToAllProfilesAction_1.ID, ApplySettingToAllProfilesAction_1.LABEL);
            this.setting = setting;
            this.configService = configService;
            this._register(event_1.Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration(configuration_2.APPLY_ALL_PROFILES_SETTING))(() => this.update()));
            this.update();
        }
        update() {
            const allProfilesSettings = this.configService.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING);
            this.checked = allProfilesSettings.includes(this.setting.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            const value = this.configService.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) ?? [];
            if (this.checked) {
                value.splice(value.indexOf(this.setting.key), 1);
            }
            else {
                value.push(this.setting.key);
            }
            const newValue = (0, arrays_1.distinct)(value);
            if (this.checked) {
                await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).application?.value, 3 /* ConfigurationTarget.USER_LOCAL */);
                await this.configService.updateValue(configuration_2.APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
            else {
                await this.configService.updateValue(configuration_2.APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
                await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).userLocal?.value, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
        }
    };
    ApplySettingToAllProfilesAction = ApplySettingToAllProfilesAction_1 = __decorate([
        __param(1, configuration_2.IWorkbenchConfigurationService)
    ], ApplySettingToAllProfilesAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3NldHRpbmdzVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUVoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLFNBQVMsNkJBQTZCLENBQUMsT0FBbUM7UUFDekUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUV0QixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDMUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLE9BQU8sS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3BFLE9BQU87Z0JBQ04sS0FBSyxFQUFFO29CQUNOLElBQUksRUFBRSxRQUFRO29CQUNkLElBQUksRUFBRSxHQUFHO2lCQUNUO2dCQUNELE9BQU87Z0JBQ1AsV0FBVyxFQUFFLE9BQU8sQ0FBQyxTQUFTO2FBQzlCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxTQUFTLHVCQUF1QixDQUFDLFVBQW9C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