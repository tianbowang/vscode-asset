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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/configuration/common/configurationRegistry", "vs/editor/common/languages/language", "vs/platform/registry/common/platform", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/product/common/productService"], function (require, exports, arrays, strings_1, types_1, uri_1, settingsLayout_1, preferences_1, preferences_2, environmentService_1, configuration_1, lifecycle_1, event_1, configurationRegistry_1, language_1, platform_1, userDataProfile_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseQuery = exports.SearchResultModel = exports.SearchResultIdx = exports.settingKeyToDisplayFormat = exports.inspectSetting = exports.SettingsTreeModel = exports.SettingsTreeSettingElement = exports.SettingsTreeNewExtensionsElement = exports.SettingsTreeGroupElement = exports.SettingsTreeElement = exports.ONLINE_SERVICES_SETTING_TAG = void 0;
    exports.ONLINE_SERVICES_SETTING_TAG = 'usesOnlineServices';
    class SettingsTreeElement extends lifecycle_1.Disposable {
        constructor(_id) {
            super();
            this._tabbable = false;
            this._onDidChangeTabbable = new event_1.Emitter();
            this.onDidChangeTabbable = this._onDidChangeTabbable.event;
            this.id = _id;
        }
        get tabbable() {
            return this._tabbable;
        }
        set tabbable(value) {
            this._tabbable = value;
            this._onDidChangeTabbable.fire();
        }
    }
    exports.SettingsTreeElement = SettingsTreeElement;
    class SettingsTreeGroupElement extends SettingsTreeElement {
        get children() {
            return this._children;
        }
        set children(newChildren) {
            this._children = newChildren;
            this._childSettingKeys = new Set();
            this._children.forEach(child => {
                if (child instanceof SettingsTreeSettingElement) {
                    this._childSettingKeys.add(child.setting.key);
                }
            });
        }
        constructor(_id, count, label, level, isFirstGroup) {
            super(_id);
            this._childSettingKeys = new Set();
            this._children = [];
            this.count = count;
            this.label = label;
            this.level = level;
            this.isFirstGroup = isFirstGroup;
        }
        /**
         * Returns whether this group contains the given child key (to a depth of 1 only)
         */
        containsSetting(key) {
            return this._childSettingKeys.has(key);
        }
    }
    exports.SettingsTreeGroupElement = SettingsTreeGroupElement;
    class SettingsTreeNewExtensionsElement extends SettingsTreeElement {
        constructor(_id, extensionIds) {
            super(_id);
            this.extensionIds = extensionIds;
        }
    }
    exports.SettingsTreeNewExtensionsElement = SettingsTreeNewExtensionsElement;
    class SettingsTreeSettingElement extends SettingsTreeElement {
        static { this.MAX_DESC_LINES = 20; }
        constructor(setting, parent, settingsTarget, isWorkspaceTrusted, languageFilter, languageService, productService, userDataProfileService, configurationService) {
            super(sanitizeId(parent.id + '_' + setting.key));
            this.settingsTarget = settingsTarget;
            this.isWorkspaceTrusted = isWorkspaceTrusted;
            this.languageFilter = languageFilter;
            this.languageService = languageService;
            this.productService = productService;
            this.userDataProfileService = userDataProfileService;
            this.configurationService = configurationService;
            this._displayCategory = null;
            this._displayLabel = null;
            /**
             * Whether the setting is configured in the selected scope.
             */
            this.isConfigured = false;
            /**
             * Whether the setting requires trusted target
             */
            this.isUntrusted = false;
            /**
             * Whether the setting is under a policy that blocks all changes.
             */
            this.hasPolicyValue = false;
            this.overriddenScopeList = [];
            this.overriddenDefaultsLanguageList = [];
            /**
             * For each language that contributes setting values or default overrides, we can see those values here.
             */
            this.languageOverrideValues = new Map();
            this.setting = setting;
            this.parent = parent;
            // Make sure description and valueType are initialized
            this.initSettingDescription();
            this.initSettingValueType();
        }
        get displayCategory() {
            if (!this._displayCategory) {
                this.initLabels();
            }
            return this._displayCategory;
        }
        get displayLabel() {
            if (!this._displayLabel) {
                this.initLabels();
            }
            return this._displayLabel;
        }
        initLabels() {
            if (this.setting.title) {
                this._displayLabel = this.setting.title;
                this._displayCategory = '';
                return;
            }
            const displayKeyFormat = settingKeyToDisplayFormat(this.setting.key, this.parent.id, this.setting.isLanguageTagSetting);
            this._displayLabel = displayKeyFormat.label;
            this._displayCategory = displayKeyFormat.category;
        }
        initSettingDescription() {
            if (this.setting.description.length > SettingsTreeSettingElement.MAX_DESC_LINES) {
                const truncatedDescLines = this.setting.description.slice(0, SettingsTreeSettingElement.MAX_DESC_LINES);
                truncatedDescLines.push('[...]');
                this.description = truncatedDescLines.join('\n');
            }
            else {
                this.description = this.setting.description.join('\n');
            }
        }
        initSettingValueType() {
            if (isExtensionToggleSetting(this.setting, this.productService)) {
                this.valueType = preferences_2.SettingValueType.ExtensionToggle;
            }
            else if (this.setting.enum && (!this.setting.type || settingTypeEnumRenderable(this.setting.type))) {
                this.valueType = preferences_2.SettingValueType.Enum;
            }
            else if (this.setting.type === 'string') {
                if (this.setting.editPresentation === configurationRegistry_1.EditPresentationTypes.Multiline) {
                    this.valueType = preferences_2.SettingValueType.MultilineString;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.String;
                }
            }
            else if (isExcludeSetting(this.setting)) {
                this.valueType = preferences_2.SettingValueType.Exclude;
            }
            else if (isIncludeSetting(this.setting)) {
                this.valueType = preferences_2.SettingValueType.Include;
            }
            else if (this.setting.type === 'integer') {
                this.valueType = preferences_2.SettingValueType.Integer;
            }
            else if (this.setting.type === 'number') {
                this.valueType = preferences_2.SettingValueType.Number;
            }
            else if (this.setting.type === 'boolean') {
                this.valueType = preferences_2.SettingValueType.Boolean;
            }
            else if (this.setting.type === 'array' && this.setting.arrayItemType &&
                ['string', 'enum', 'number', 'integer'].includes(this.setting.arrayItemType)) {
                this.valueType = preferences_2.SettingValueType.Array;
            }
            else if (Array.isArray(this.setting.type) && this.setting.type.includes(preferences_2.SettingValueType.Null) && this.setting.type.length === 2) {
                if (this.setting.type.includes(preferences_2.SettingValueType.Integer)) {
                    this.valueType = preferences_2.SettingValueType.NullableInteger;
                }
                else if (this.setting.type.includes(preferences_2.SettingValueType.Number)) {
                    this.valueType = preferences_2.SettingValueType.NullableNumber;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.Complex;
                }
            }
            else if (isObjectSetting(this.setting)) {
                if (this.setting.allKeysAreBoolean) {
                    this.valueType = preferences_2.SettingValueType.BooleanObject;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.Object;
                }
            }
            else if (this.setting.isLanguageTagSetting) {
                this.valueType = preferences_2.SettingValueType.LanguageTag;
            }
            else {
                this.valueType = preferences_2.SettingValueType.Complex;
            }
        }
        inspectSelf() {
            const targetToInspect = this.getTargetToInspect(this.setting);
            const inspectResult = inspectSetting(this.setting.key, targetToInspect, this.languageFilter, this.configurationService);
            this.update(inspectResult, this.isWorkspaceTrusted);
        }
        getTargetToInspect(setting) {
            if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
                if (setting.scope === 1 /* ConfigurationScope.APPLICATION */) {
                    return 1 /* ConfigurationTarget.APPLICATION */;
                }
                if (this.configurationService.isSettingAppliedForAllProfiles(setting.key) && this.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                    return 1 /* ConfigurationTarget.APPLICATION */;
                }
            }
            return this.settingsTarget;
        }
        update(inspectResult, isWorkspaceTrusted) {
            let { isConfigured, inspected, targetSelector, inspectedLanguageOverrides, languageSelector } = inspectResult;
            switch (targetSelector) {
                case 'workspaceFolderValue':
                case 'workspaceValue':
                    this.isUntrusted = !!this.setting.restricted && !isWorkspaceTrusted;
                    break;
            }
            let displayValue = isConfigured ? inspected[targetSelector] : inspected.defaultValue;
            const overriddenScopeList = [];
            const overriddenDefaultsLanguageList = [];
            if ((languageSelector || targetSelector !== 'workspaceValue') && typeof inspected.workspaceValue !== 'undefined') {
                overriddenScopeList.push('workspace:');
            }
            if ((languageSelector || targetSelector !== 'userRemoteValue') && typeof inspected.userRemoteValue !== 'undefined') {
                overriddenScopeList.push('remote:');
            }
            if ((languageSelector || targetSelector !== 'userLocalValue') && typeof inspected.userLocalValue !== 'undefined') {
                overriddenScopeList.push('user:');
            }
            if (inspected.overrideIdentifiers) {
                for (const overrideIdentifier of inspected.overrideIdentifiers) {
                    const inspectedOverride = inspectedLanguageOverrides.get(overrideIdentifier);
                    if (inspectedOverride) {
                        if (this.languageService.isRegisteredLanguageId(overrideIdentifier)) {
                            if (languageSelector !== overrideIdentifier && typeof inspectedOverride.default?.override !== 'undefined') {
                                overriddenDefaultsLanguageList.push(overrideIdentifier);
                            }
                            if ((languageSelector !== overrideIdentifier || targetSelector !== 'workspaceValue') && typeof inspectedOverride.workspace?.override !== 'undefined') {
                                overriddenScopeList.push(`workspace:${overrideIdentifier}`);
                            }
                            if ((languageSelector !== overrideIdentifier || targetSelector !== 'userRemoteValue') && typeof inspectedOverride.userRemote?.override !== 'undefined') {
                                overriddenScopeList.push(`remote:${overrideIdentifier}`);
                            }
                            if ((languageSelector !== overrideIdentifier || targetSelector !== 'userLocalValue') && typeof inspectedOverride.userLocal?.override !== 'undefined') {
                                overriddenScopeList.push(`user:${overrideIdentifier}`);
                            }
                        }
                        this.languageOverrideValues.set(overrideIdentifier, inspectedOverride);
                    }
                }
            }
            this.overriddenScopeList = overriddenScopeList;
            this.overriddenDefaultsLanguageList = overriddenDefaultsLanguageList;
            // The user might have added, removed, or modified a language filter,
            // so we reset the default value source to the non-language-specific default value source for now.
            this.defaultValueSource = this.setting.nonLanguageSpecificDefaultValueSource;
            if (inspected.policyValue) {
                this.hasPolicyValue = true;
                isConfigured = false; // The user did not manually configure the setting themselves.
                displayValue = inspected.policyValue;
                this.scopeValue = inspected.policyValue;
                this.defaultValue = inspected.defaultValue;
            }
            else if (languageSelector && this.languageOverrideValues.has(languageSelector)) {
                const overrideValues = this.languageOverrideValues.get(languageSelector);
                // In the worst case, go back to using the previous display value.
                // Also, sometimes the override is in the form of a default value override, so consider that second.
                displayValue = (isConfigured ? overrideValues[targetSelector] : overrideValues.defaultValue) ?? displayValue;
                this.scopeValue = isConfigured && overrideValues[targetSelector];
                this.defaultValue = overrideValues.defaultValue ?? inspected.defaultValue;
                const registryValues = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationDefaultsOverrides();
                const overrideValueSource = registryValues.get(`[${languageSelector}]`)?.valuesSources?.get(this.setting.key);
                if (overrideValueSource) {
                    this.defaultValueSource = overrideValueSource;
                }
            }
            else {
                this.scopeValue = isConfigured && inspected[targetSelector];
                this.defaultValue = inspected.defaultValue;
            }
            this.value = displayValue;
            this.isConfigured = isConfigured;
            if (isConfigured || this.setting.tags || this.tags || this.setting.restricted || this.hasPolicyValue) {
                // Don't create an empty Set for all 1000 settings, only if needed
                this.tags = new Set();
                if (isConfigured) {
                    this.tags.add(preferences_1.MODIFIED_SETTING_TAG);
                }
                this.setting.tags?.forEach(tag => this.tags.add(tag));
                if (this.setting.restricted) {
                    this.tags.add(preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG);
                }
                if (this.hasPolicyValue) {
                    this.tags.add(preferences_1.POLICY_SETTING_TAG);
                }
            }
        }
        matchesAllTags(tagFilters) {
            if (!tagFilters?.size) {
                // This setting, which may have tags,
                // matches against a query with no tags.
                return true;
            }
            if (!this.tags) {
                // The setting must inspect itself to get tag information
                // including for the hasPolicy tag.
                this.inspectSelf();
            }
            // Check that the filter tags are a subset of this setting's tags
            return !!this.tags?.size &&
                Array.from(tagFilters).every(tag => this.tags.has(tag));
        }
        matchesScope(scope, isRemote) {
            const configTarget = uri_1.URI.isUri(scope) ? 6 /* ConfigurationTarget.WORKSPACE_FOLDER */ : scope;
            if (!this.setting.scope) {
                return true;
            }
            if (configTarget === 1 /* ConfigurationTarget.APPLICATION */) {
                return configuration_1.APPLICATION_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                return configuration_1.FOLDER_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                return configuration_1.WORKSPACE_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return configuration_1.REMOTE_MACHINE_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                if (isRemote) {
                    return configuration_1.LOCAL_MACHINE_SCOPES.includes(this.setting.scope);
                }
            }
            return true;
        }
        matchesAnyExtension(extensionFilters) {
            if (!extensionFilters || !extensionFilters.size) {
                return true;
            }
            if (!this.setting.extensionInfo) {
                return false;
            }
            return Array.from(extensionFilters).some(extensionId => extensionId.toLowerCase() === this.setting.extensionInfo.id.toLowerCase());
        }
        matchesAnyFeature(featureFilters) {
            if (!featureFilters || !featureFilters.size) {
                return true;
            }
            const features = settingsLayout_1.tocData.children.find(child => child.id === 'features');
            return Array.from(featureFilters).some(filter => {
                if (features && features.children) {
                    const feature = features.children.find(feature => 'features/' + filter === feature.id);
                    if (feature) {
                        const patterns = feature.settings?.map(setting => createSettingMatchRegExp(setting));
                        return patterns && !this.setting.extensionInfo && patterns.some(pattern => pattern.test(this.setting.key.toLowerCase()));
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        }
        matchesAnyId(idFilters) {
            if (!idFilters || !idFilters.size) {
                return true;
            }
            return idFilters.has(this.setting.key);
        }
        matchesAllLanguages(languageFilter) {
            if (!languageFilter) {
                // We're not filtering by language.
                return true;
            }
            if (!this.languageService.isRegisteredLanguageId(languageFilter)) {
                // We're trying to filter by an invalid language.
                return false;
            }
            // We have a language filter in the search widget at this point.
            // We decide to show all language overridable settings to make the
            // lang filter act more like a scope filter,
            // rather than adding on an implicit @modified as well.
            if (this.setting.scope === 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                return true;
            }
            return false;
        }
    }
    exports.SettingsTreeSettingElement = SettingsTreeSettingElement;
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.escapeRegExpCharacters)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    let SettingsTreeModel = class SettingsTreeModel {
        constructor(_viewState, _isWorkspaceTrusted, _configurationService, _languageService, _userDataProfileService, _productService) {
            this._viewState = _viewState;
            this._isWorkspaceTrusted = _isWorkspaceTrusted;
            this._configurationService = _configurationService;
            this._languageService = _languageService;
            this._userDataProfileService = _userDataProfileService;
            this._productService = _productService;
            this._treeElementsBySettingName = new Map();
        }
        get root() {
            return this._root;
        }
        update(newTocRoot = this._tocRoot) {
            this._treeElementsBySettingName.clear();
            const newRoot = this.createSettingsTreeGroupElement(newTocRoot);
            if (newRoot.children[0] instanceof SettingsTreeGroupElement) {
                newRoot.children[0].isFirstGroup = true;
            }
            if (this._root) {
                this.disposeChildren(this._root.children);
                this._root.children = newRoot.children;
            }
            else {
                this._root = newRoot;
            }
        }
        updateWorkspaceTrust(workspaceTrusted) {
            this._isWorkspaceTrusted = workspaceTrusted;
            this.updateRequireTrustedTargetElements();
        }
        disposeChildren(children) {
            for (const child of children) {
                this.recursiveDispose(child);
            }
        }
        recursiveDispose(element) {
            if (element instanceof SettingsTreeGroupElement) {
                this.disposeChildren(element.children);
            }
            element.dispose();
        }
        getElementsByName(name) {
            return this._treeElementsBySettingName.get(name) ?? null;
        }
        updateElementsByName(name) {
            if (!this._treeElementsBySettingName.has(name)) {
                return;
            }
            this.reinspectSettings(this._treeElementsBySettingName.get(name));
        }
        updateRequireTrustedTargetElements() {
            this.reinspectSettings([...this._treeElementsBySettingName.values()].flat().filter(s => s.isUntrusted));
        }
        reinspectSettings(settings) {
            for (const element of settings) {
                element.inspectSelf();
            }
        }
        createSettingsTreeGroupElement(tocEntry, parent) {
            const depth = parent ? this.getDepth(parent) + 1 : 0;
            const element = new SettingsTreeGroupElement(tocEntry.id, undefined, tocEntry.label, depth, false);
            element.parent = parent;
            const children = [];
            if (tocEntry.settings) {
                const settingChildren = tocEntry.settings.map(s => this.createSettingsTreeSettingElement(s, element))
                    .filter(el => el.setting.deprecationMessage ? el.isConfigured : true);
                children.push(...settingChildren);
            }
            if (tocEntry.children) {
                const groupChildren = tocEntry.children.map(child => this.createSettingsTreeGroupElement(child, element));
                children.push(...groupChildren);
            }
            element.children = children;
            return element;
        }
        getDepth(element) {
            if (element.parent) {
                return 1 + this.getDepth(element.parent);
            }
            else {
                return 0;
            }
        }
        createSettingsTreeSettingElement(setting, parent) {
            const element = new SettingsTreeSettingElement(setting, parent, this._viewState.settingsTarget, this._isWorkspaceTrusted, this._viewState.languageFilter, this._languageService, this._productService, this._userDataProfileService, this._configurationService);
            const nameElements = this._treeElementsBySettingName.get(setting.key) || [];
            nameElements.push(element);
            this._treeElementsBySettingName.set(setting.key, nameElements);
            return element;
        }
    };
    exports.SettingsTreeModel = SettingsTreeModel;
    exports.SettingsTreeModel = SettingsTreeModel = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, language_1.ILanguageService),
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, productService_1.IProductService)
    ], SettingsTreeModel);
    function inspectSetting(key, target, languageFilter, configurationService) {
        const inspectOverrides = uri_1.URI.isUri(target) ? { resource: target } : undefined;
        const inspected = configurationService.inspect(key, inspectOverrides);
        const targetSelector = target === 1 /* ConfigurationTarget.APPLICATION */ ? 'applicationValue' :
            target === 3 /* ConfigurationTarget.USER_LOCAL */ ? 'userLocalValue' :
                target === 4 /* ConfigurationTarget.USER_REMOTE */ ? 'userRemoteValue' :
                    target === 5 /* ConfigurationTarget.WORKSPACE */ ? 'workspaceValue' :
                        'workspaceFolderValue';
        const targetOverrideSelector = target === 1 /* ConfigurationTarget.APPLICATION */ ? 'application' :
            target === 3 /* ConfigurationTarget.USER_LOCAL */ ? 'userLocal' :
                target === 4 /* ConfigurationTarget.USER_REMOTE */ ? 'userRemote' :
                    target === 5 /* ConfigurationTarget.WORKSPACE */ ? 'workspace' :
                        'workspaceFolder';
        let isConfigured = typeof inspected[targetSelector] !== 'undefined';
        const overrideIdentifiers = inspected.overrideIdentifiers;
        const inspectedLanguageOverrides = new Map();
        // We must reset isConfigured to be false if languageFilter is set, and manually
        // determine whether it can be set to true later.
        if (languageFilter) {
            isConfigured = false;
        }
        if (overrideIdentifiers) {
            // The setting we're looking at has language overrides.
            for (const overrideIdentifier of overrideIdentifiers) {
                inspectedLanguageOverrides.set(overrideIdentifier, configurationService.inspect(key, { overrideIdentifier }));
            }
            // For all language filters, see if there's an override for that filter.
            if (languageFilter) {
                if (inspectedLanguageOverrides.has(languageFilter)) {
                    const overrideValue = inspectedLanguageOverrides.get(languageFilter)[targetOverrideSelector]?.override;
                    if (typeof overrideValue !== 'undefined') {
                        isConfigured = true;
                    }
                }
            }
        }
        return { isConfigured, inspected, targetSelector, inspectedLanguageOverrides, languageSelector: languageFilter };
    }
    exports.inspectSetting = inspectSetting;
    function sanitizeId(id) {
        return id.replace(/[\.\/]/, '_');
    }
    function settingKeyToDisplayFormat(key, groupId = '', isLanguageTagSetting = false) {
        const lastDotIdx = key.lastIndexOf('.');
        let category = '';
        if (lastDotIdx >= 0) {
            category = key.substring(0, lastDotIdx);
            key = key.substring(lastDotIdx + 1);
        }
        groupId = groupId.replace(/\//g, '.');
        category = trimCategoryForGroup(category, groupId);
        category = wordifyKey(category);
        if (isLanguageTagSetting) {
            key = key.replace(/[\[\]]/g, '');
            key = '$(bracket) ' + key;
        }
        const label = wordifyKey(key);
        return { category, label };
    }
    exports.settingKeyToDisplayFormat = settingKeyToDisplayFormat;
    function wordifyKey(key) {
        key = key
            .replace(/\.([a-z0-9])/g, (_, p1) => ` \u203A ${p1.toUpperCase()}`) // Replace dot with spaced '>'
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Camel case to spacing, fooBar => foo Bar
            .replace(/^[a-z]/g, match => match.toUpperCase()) // Upper casing all first letters, foo => Foo
            .replace(/\b\w+\b/g, match => {
            return settingsLayout_1.knownAcronyms.has(match.toLowerCase()) ?
                match.toUpperCase() :
                match;
        });
        for (const [k, v] of settingsLayout_1.knownTermMappings) {
            key = key.replace(new RegExp(`\\b${k}\\b`, 'gi'), v);
        }
        return key;
    }
    /**
     * Removes redundant sections of the category label.
     * A redundant section is a section already reflected in the groupId.
     *
     * @param category The category of the specific setting.
     * @param groupId The author + extension ID.
     * @returns The new category label to use.
     */
    function trimCategoryForGroup(category, groupId) {
        const doTrim = (forward) => {
            // Remove the Insiders portion if the category doesn't use it.
            if (!/insiders$/i.test(category)) {
                groupId = groupId.replace(/-?insiders$/i, '');
            }
            const parts = groupId.split('.')
                .map(part => {
                // Remove hyphens, but only if that results in a match with the category.
                if (part.replace(/-/g, '').toLowerCase() === category.toLowerCase()) {
                    return part.replace(/-/g, '');
                }
                else {
                    return part;
                }
            });
            while (parts.length) {
                const reg = new RegExp(`^${parts.join('\\.')}(\\.|$)`, 'i');
                if (reg.test(category)) {
                    return category.replace(reg, '');
                }
                if (forward) {
                    parts.pop();
                }
                else {
                    parts.shift();
                }
            }
            return null;
        };
        let trimmed = doTrim(true);
        if (trimmed === null) {
            trimmed = doTrim(false);
        }
        if (trimmed === null) {
            trimmed = category;
        }
        return trimmed;
    }
    function isExtensionToggleSetting(setting, productService) {
        return preferences_1.ENABLE_EXTENSION_TOGGLE_SETTINGS &&
            !!productService.extensionRecommendations &&
            !!setting.displayExtensionId;
    }
    function isExcludeSetting(setting) {
        return setting.key === 'files.exclude' ||
            setting.key === 'search.exclude' ||
            setting.key === 'workbench.localHistory.exclude' ||
            setting.key === 'explorer.autoRevealExclude' ||
            setting.key === 'files.readonlyExclude' ||
            setting.key === 'files.watcherExclude';
    }
    function isIncludeSetting(setting) {
        return setting.key === 'files.readonlyInclude';
    }
    function isObjectRenderableSchema({ type }) {
        return type === 'string' || type === 'boolean' || type === 'integer' || type === 'number';
    }
    function isObjectSetting({ type, objectProperties, objectPatternProperties, objectAdditionalProperties }) {
        if (type !== 'object') {
            return false;
        }
        // object can have any shape
        if ((0, types_1.isUndefinedOrNull)(objectProperties) &&
            (0, types_1.isUndefinedOrNull)(objectPatternProperties) &&
            (0, types_1.isUndefinedOrNull)(objectAdditionalProperties)) {
            return false;
        }
        // objectAdditionalProperties allow the setting to have any shape,
        // but if there's a pattern property that handles everything, then every
        // property will match that patternProperty, so we don't need to look at
        // the value of objectAdditionalProperties in that case.
        if ((objectAdditionalProperties === true || objectAdditionalProperties === undefined)
            && !Object.keys(objectPatternProperties ?? {}).includes('.*')) {
            return false;
        }
        const schemas = [...Object.values(objectProperties ?? {}), ...Object.values(objectPatternProperties ?? {})];
        if (objectAdditionalProperties && typeof objectAdditionalProperties === 'object') {
            schemas.push(objectAdditionalProperties);
        }
        // Flatten anyof schemas
        const flatSchemas = schemas.map((schema) => {
            if (Array.isArray(schema.anyOf)) {
                return schema.anyOf;
            }
            return [schema];
        }).flat();
        return flatSchemas.every(isObjectRenderableSchema);
    }
    function settingTypeEnumRenderable(_type) {
        const enumRenderableSettingTypes = ['string', 'boolean', 'null', 'integer', 'number'];
        const type = Array.isArray(_type) ? _type : [_type];
        return type.every(type => enumRenderableSettingTypes.includes(type));
    }
    var SearchResultIdx;
    (function (SearchResultIdx) {
        SearchResultIdx[SearchResultIdx["Local"] = 0] = "Local";
        SearchResultIdx[SearchResultIdx["Remote"] = 1] = "Remote";
        SearchResultIdx[SearchResultIdx["NewExtensions"] = 2] = "NewExtensions";
    })(SearchResultIdx || (exports.SearchResultIdx = SearchResultIdx = {}));
    let SearchResultModel = class SearchResultModel extends SettingsTreeModel {
        constructor(viewState, settingsOrderByTocIndex, isWorkspaceTrusted, configurationService, environmentService, languageService, userDataProfileService, productService) {
            super(viewState, isWorkspaceTrusted, configurationService, languageService, userDataProfileService, productService);
            this.environmentService = environmentService;
            this.rawSearchResults = null;
            this.cachedUniqueSearchResults = null;
            this.newExtensionSearchResults = null;
            this.searchResultCount = null;
            this.id = 'searchResultModel';
            this.settingsOrderByTocIndex = settingsOrderByTocIndex;
            this.update({ id: 'searchResultModel', label: '' });
        }
        sortResults(filterMatches) {
            if (this.settingsOrderByTocIndex) {
                for (const match of filterMatches) {
                    match.setting.internalOrder = this.settingsOrderByTocIndex.get(match.setting.key);
                }
            }
            // The search only has filters, so we can sort by the order in the TOC.
            if (!this._viewState.query) {
                return filterMatches.sort((a, b) => (0, preferences_1.compareTwoNullableNumbers)(a.setting.internalOrder, b.setting.internalOrder));
            }
            // Sort the settings according to their relevancy.
            // https://github.com/microsoft/vscode/issues/197773
            filterMatches.sort((a, b) => {
                if (a.matchType !== b.matchType) {
                    // Sort by match type if the match types are not the same.
                    // The priority of the match type is given by the SettingMatchType enum.
                    return b.matchType - a.matchType;
                }
                else if (a.matchType === preferences_2.SettingMatchType.RemoteMatch) {
                    // The match types are the same and are RemoteMatch.
                    // Sort by score.
                    return b.score - a.score;
                }
                else {
                    // The match types are the same but are not RemoteMatch.
                    // Sort by their order in the table of contents.
                    return (0, preferences_1.compareTwoNullableNumbers)(a.setting.internalOrder, b.setting.internalOrder);
                }
            });
            // Remove duplicates, which sometimes occur with settings
            // such as the experimental toggle setting.
            return arrays.distinct(filterMatches, (match) => match.setting.key);
        }
        getUniqueResults() {
            if (this.cachedUniqueSearchResults) {
                return this.cachedUniqueSearchResults;
            }
            if (!this.rawSearchResults) {
                return null;
            }
            let combinedFilterMatches = [];
            const localMatchKeys = new Set();
            const localResult = this.rawSearchResults[0 /* SearchResultIdx.Local */];
            if (localResult) {
                localResult.filterMatches.forEach(m => localMatchKeys.add(m.setting.key));
                combinedFilterMatches = localResult.filterMatches;
            }
            const remoteResult = this.rawSearchResults[1 /* SearchResultIdx.Remote */];
            if (remoteResult) {
                remoteResult.filterMatches = remoteResult.filterMatches.filter(m => !localMatchKeys.has(m.setting.key));
                combinedFilterMatches = combinedFilterMatches.concat(remoteResult.filterMatches);
                this.newExtensionSearchResults = this.rawSearchResults[2 /* SearchResultIdx.NewExtensions */];
            }
            combinedFilterMatches = this.sortResults(combinedFilterMatches);
            this.cachedUniqueSearchResults = {
                filterMatches: combinedFilterMatches,
                exactMatch: localResult?.exactMatch || remoteResult?.exactMatch
            };
            return this.cachedUniqueSearchResults;
        }
        getRawResults() {
            return this.rawSearchResults || [];
        }
        setResult(order, result) {
            this.cachedUniqueSearchResults = null;
            this.newExtensionSearchResults = null;
            this.rawSearchResults = this.rawSearchResults || [];
            if (!result) {
                delete this.rawSearchResults[order];
                return;
            }
            if (result.exactMatch) {
                this.rawSearchResults = [];
            }
            this.rawSearchResults[order] = result;
            this.updateChildren();
        }
        updateChildren() {
            this.update({
                id: 'searchResultModel',
                label: 'searchResultModel',
                settings: this.getFlatSettings()
            });
            // Save time, filter children in the search model instead of relying on the tree filter, which still requires heights to be calculated.
            const isRemote = !!this.environmentService.remoteAuthority;
            this.root.children = this.root.children
                .filter(child => child instanceof SettingsTreeSettingElement && child.matchesAllTags(this._viewState.tagFilters) && child.matchesScope(this._viewState.settingsTarget, isRemote) && child.matchesAnyExtension(this._viewState.extensionFilters) && child.matchesAnyId(this._viewState.idFilters) && child.matchesAnyFeature(this._viewState.featureFilters) && child.matchesAllLanguages(this._viewState.languageFilter));
            this.searchResultCount = this.root.children.length;
            if (this.newExtensionSearchResults?.filterMatches.length) {
                let resultExtensionIds = this.newExtensionSearchResults.filterMatches
                    .map(result => result.setting)
                    .filter(setting => setting.extensionName && setting.extensionPublisher)
                    .map(setting => `${setting.extensionPublisher}.${setting.extensionName}`);
                resultExtensionIds = arrays.distinct(resultExtensionIds);
                if (resultExtensionIds.length) {
                    const newExtElement = new SettingsTreeNewExtensionsElement('newExtensions', resultExtensionIds);
                    newExtElement.parent = this._root;
                    this._root.children.push(newExtElement);
                }
            }
        }
        getUniqueResultsCount() {
            return this.searchResultCount ?? 0;
        }
        getFlatSettings() {
            return this.getUniqueResults()?.filterMatches.map(m => m.setting) ?? [];
        }
    };
    exports.SearchResultModel = SearchResultModel;
    exports.SearchResultModel = SearchResultModel = __decorate([
        __param(3, configuration_1.IWorkbenchConfigurationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, language_1.ILanguageService),
        __param(6, userDataProfile_1.IUserDataProfileService),
        __param(7, productService_1.IProductService)
    ], SearchResultModel);
    const tagRegex = /(^|\s)@tag:("([^"]*)"|[^"]\S*)/g;
    const extensionRegex = /(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g;
    const featureRegex = /(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g;
    const idRegex = /(^|\s)@id:("([^"]*)"|[^"]\S*)?/g;
    const languageRegex = /(^|\s)@lang:("([^"]*)"|[^"]\S*)?/g;
    function parseQuery(query) {
        /**
         * A helper function to parse the query on one type of regex.
         *
         * @param query The search query
         * @param filterRegex The regex to use on the query
         * @param parsedParts The parts that the regex parses out will be appended to the array passed in here.
         * @returns The query with the parsed parts removed
         */
        function getTagsForType(query, filterRegex, parsedParts) {
            return query.replace(filterRegex, (_, __, quotedParsedElement, unquotedParsedElement) => {
                const parsedElement = unquotedParsedElement || quotedParsedElement;
                if (parsedElement) {
                    parsedParts.push(...parsedElement.split(',').map(s => s.trim()).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s)));
                }
                return '';
            });
        }
        const tags = [];
        query = query.replace(tagRegex, (_, __, quotedTag, tag) => {
            tags.push(tag || quotedTag);
            return '';
        });
        query = query.replace(`@${preferences_1.MODIFIED_SETTING_TAG}`, () => {
            tags.push(preferences_1.MODIFIED_SETTING_TAG);
            return '';
        });
        query = query.replace(`@${preferences_1.POLICY_SETTING_TAG}`, () => {
            tags.push(preferences_1.POLICY_SETTING_TAG);
            return '';
        });
        const extensions = [];
        const features = [];
        const ids = [];
        const langs = [];
        query = getTagsForType(query, extensionRegex, extensions);
        query = getTagsForType(query, featureRegex, features);
        query = getTagsForType(query, idRegex, ids);
        if (preferences_1.ENABLE_LANGUAGE_FILTER) {
            query = getTagsForType(query, languageRegex, langs);
        }
        query = query.trim();
        // For now, only return the first found language filter
        return {
            tags,
            extensionFilters: extensions,
            featureFilters: features,
            idFilters: ids,
            languageFilter: langs.length ? langs[0] : undefined,
            query,
        };
    }
    exports.parseQuery = parseQuery;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NUcmVlTW9kZWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3NldHRpbmdzVHJlZU1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQm5GLFFBQUEsMkJBQTJCLEdBQUcsb0JBQW9CLENBQUM7SUFhaEUsTUFBc0IsbUJBQW9CLFNBQVEsc0JBQVU7UUFRM0QsWUFBWSxHQUFXO1lBQ3RCLEtBQUssRUFBRSxDQUFDO1lBTEQsY0FBUyxHQUFHLEtBQUssQ0FBQztZQUNQLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDckQsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUk5RCxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLEtBQWM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQXJCRCxrREFxQkM7SUFJRCxNQUFhLHdCQUF5QixTQUFRLG1CQUFtQjtRQVNoRSxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLFdBQXFDO1lBQ2pELElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO1lBRTdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMs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