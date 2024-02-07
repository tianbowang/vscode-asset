/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays, event_1, json, lifecycle_1, map_1, objects, types, uri_1, configuration_1, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationChangeEvent = exports.mergeChanges = exports.Configuration = exports.UserSettings = exports.ConfigurationModelParser = exports.ConfigurationModel = void 0;
    function freeze(data) {
        return Object.isFrozen(data) ? data : objects.deepFreeze(data);
    }
    class ConfigurationModel {
        constructor(_contents = {}, _keys = [], _overrides = [], raw) {
            this._contents = _contents;
            this._keys = _keys;
            this._overrides = _overrides;
            this.raw = raw;
            this.overrideConfigurations = new Map();
        }
        get rawConfiguration() {
            if (!this._rawConfiguration) {
                if (this.raw?.length) {
                    const rawConfigurationModels = this.raw.map(raw => {
                        if (raw instanceof ConfigurationModel) {
                            return raw;
                        }
                        const parser = new ConfigurationModelParser('');
                        parser.parseRaw(raw);
                        return parser.configurationModel;
                    });
                    this._rawConfiguration = rawConfigurationModels.reduce((previous, current) => current === previous ? current : previous.merge(current), rawConfigurationModels[0]);
                }
                else {
                    // raw is same as current
                    this._rawConfiguration = this;
                }
            }
            return this._rawConfiguration;
        }
        get contents() {
            return this._contents;
        }
        get overrides() {
            return this._overrides;
        }
        get keys() {
            return this._keys;
        }
        isEmpty() {
            return this._keys.length === 0 && Object.keys(this._contents).length === 0 && this._overrides.length === 0;
        }
        getValue(section) {
            return section ? (0, configuration_1.getConfigurationValue)(this.contents, section) : this.contents;
        }
        inspect(section, overrideIdentifier) {
            const value = this.rawConfiguration.getValue(section);
            const override = overrideIdentifier ? this.rawConfiguration.getOverrideValue(section, overrideIdentifier) : undefined;
            const merged = overrideIdentifier ? this.rawConfiguration.override(overrideIdentifier).getValue(section) : value;
            return { value, override, merged };
        }
        getOverrideValue(section, overrideIdentifier) {
            const overrideContents = this.getContentsForOverrideIdentifer(overrideIdentifier);
            return overrideContents
                ? section ? (0, configuration_1.getConfigurationValue)(overrideContents, section) : overrideContents
                : undefined;
        }
        getKeysForOverrideIdentifier(identifier) {
            const keys = [];
            for (const override of this.overrides) {
                if (override.identifiers.includes(identifier)) {
                    keys.push(...override.keys);
                }
            }
            return arrays.distinct(keys);
        }
        getAllOverrideIdentifiers() {
            const result = [];
            for (const override of this.overrides) {
                result.push(...override.identifiers);
            }
            return arrays.distinct(result);
        }
        override(identifier) {
            let overrideConfigurationModel = this.overrideConfigurations.get(identifier);
            if (!overrideConfigurationModel) {
                overrideConfigurationModel = this.createOverrideConfigurationModel(identifier);
                this.overrideConfigurations.set(identifier, overrideConfigurationModel);
            }
            return overrideConfigurationModel;
        }
        merge(...others) {
            const contents = objects.deepClone(this.contents);
            const overrides = objects.deepClone(this.overrides);
            const keys = [...this.keys];
            const raws = this.raw?.length ? [...this.raw] : [this];
            for (const other of others) {
                raws.push(...(other.raw?.length ? other.raw : [other]));
                if (other.isEmpty()) {
                    continue;
                }
                this.mergeContents(contents, other.contents);
                for (const otherOverride of other.overrides) {
                    const [override] = overrides.filter(o => arrays.equals(o.identifiers, otherOverride.identifiers));
                    if (override) {
                        this.mergeContents(override.contents, otherOverride.contents);
                        override.keys.push(...otherOverride.keys);
                        override.keys = arrays.distinct(override.keys);
                    }
                    else {
                        overrides.push(objects.deepClone(otherOverride));
                    }
                }
                for (const key of other.keys) {
                    if (keys.indexOf(key) === -1) {
                        keys.push(key);
                    }
                }
            }
            return new ConfigurationModel(contents, keys, overrides, raws.every(raw => raw instanceof ConfigurationModel) ? undefined : raws);
        }
        createOverrideConfigurationModel(identifier) {
            const overrideContents = this.getContentsForOverrideIdentifer(identifier);
            if (!overrideContents || typeof overrideContents !== 'object' || !Object.keys(overrideContents).length) {
                // If there are no valid overrides, return self
                return this;
            }
            const contents = {};
            for (const key of arrays.distinct([...Object.keys(this.contents), ...Object.keys(overrideContents)])) {
                let contentsForKey = this.contents[key];
                const overrideContentsForKey = overrideContents[key];
                // If there are override contents for the key, clone and merge otherwise use base contents
                if (overrideContentsForKey) {
                    // Clone and merge only if base contents and override contents are of type object otherwise just override
                    if (typeof contentsForKey === 'object' && typeof overrideContentsForKey === 'object') {
                        contentsForKey = objects.deepClone(contentsForKey);
                        this.mergeContents(contentsForKey, overrideContentsForKey);
                    }
                    else {
                        contentsForKey = overrideContentsForKey;
                    }
                }
                contents[key] = contentsForKey;
            }
            return new ConfigurationModel(contents, this.keys, this.overrides);
        }
        mergeContents(source, target) {
            for (const key of Object.keys(target)) {
                if (key in source) {
                    if (types.isObject(source[key]) && types.isObject(target[key])) {
                        this.mergeContents(source[key], target[key]);
                        continue;
                    }
                }
                source[key] = objects.deepClone(target[key]);
            }
        }
        getContentsForOverrideIdentifer(identifier) {
            let contentsForIdentifierOnly = null;
            let contents = null;
            const mergeContents = (contentsToMerge) => {
                if (contentsToMerge) {
                    if (contents) {
                        this.mergeContents(contents, contentsToMerge);
                    }
                    else {
                        contents = objects.deepClone(contentsToMerge);
                    }
                }
            };
            for (const override of this.overrides) {
                if (override.identifiers.length === 1 && override.identifiers[0] === identifier) {
                    contentsForIdentifierOnly = override.contents;
                }
                else if (override.identifiers.includes(identifier)) {
                    mergeContents(override.contents);
                }
            }
            // Merge contents of the identifier only at the end to take precedence.
            mergeContents(contentsForIdentifierOnly);
            return contents;
        }
        toJSON() {
            return {
                contents: this.contents,
                overrides: this.overrides,
                keys: this.keys
            };
        }
        // Update methods
        addValue(key, value) {
            this.updateValue(key, value, true);
        }
        setValue(key, value) {
            this.updateValue(key, value, false);
        }
        removeValue(key) {
            const index = this.keys.indexOf(key);
            if (index === -1) {
                return;
            }
            this.keys.splice(index, 1);
            (0, configuration_1.removeFromValueTree)(this.contents, key);
            if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                this.overrides.splice(this.overrides.findIndex(o => arrays.equals(o.identifiers, (0, configurationRegistry_1.overrideIdentifiersFromKey)(key))), 1);
            }
        }
        updateValue(key, value, add) {
            (0, configuration_1.addToValueTree)(this.contents, key, value, e => console.error(e));
            add = add || this.keys.indexOf(key) === -1;
            if (add) {
                this.keys.push(key);
            }
            if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                this.overrides.push({
                    identifiers: (0, configurationRegistry_1.overrideIdentifiersFromKey)(key),
                    keys: Object.keys(this.contents[key]),
                    contents: (0, configuration_1.toValuesTree)(this.contents[key], message => console.error(message)),
                });
            }
        }
    }
    exports.ConfigurationModel = ConfigurationModel;
    class ConfigurationModelParser {
        constructor(_name) {
            this._name = _name;
            this._raw = null;
            this._configurationModel = null;
            this._restrictedConfigurations = [];
            this._parseErrors = [];
        }
        get configurationModel() {
            return this._configurationModel || new ConfigurationModel();
        }
        get restrictedConfigurations() {
            return this._restrictedConfigurations;
        }
        get errors() {
            return this._parseErrors;
        }
        parse(content, options) {
            if (!types.isUndefinedOrNull(content)) {
                const raw = this.doParseContent(content);
                this.parseRaw(raw, options);
            }
        }
        reparse(options) {
            if (this._raw) {
                this.parseRaw(this._raw, options);
            }
        }
        parseRaw(raw, options) {
            this._raw = raw;
            const { contents, keys, overrides, restricted, hasExcludedProperties } = this.doParseRaw(raw, options);
            this._configurationModel = new ConfigurationModel(contents, keys, overrides, hasExcludedProperties ? [raw] : undefined /* raw has not changed */);
            this._restrictedConfigurations = restricted || [];
        }
        doParseContent(content) {
            let raw = {};
            let currentProperty = null;
            let currentParent = [];
            const previousParents = [];
            const parseErrors = [];
            function onValue(value) {
                if (Array.isArray(currentParent)) {
                    currentParent.push(value);
                }
                else if (currentProperty !== null) {
                    currentParent[currentProperty] = value;
                }
            }
            const visitor = {
                onObjectBegin: () => {
                    const object = {};
                    onValue(object);
                    previousParents.push(currentParent);
                    currentParent = object;
                    currentProperty = null;
                },
                onObjectProperty: (name) => {
                    currentProperty = name;
                },
                onObjectEnd: () => {
                    currentParent = previousParents.pop();
                },
                onArrayBegin: () => {
                    const array = [];
                    onValue(array);
                    previousParents.push(currentParent);
                    currentParent = array;
                    currentProperty = null;
                },
                onArrayEnd: () => {
                    currentParent = previousParents.pop();
                },
                onLiteralValue: onValue,
                onError: (error, offset, length) => {
                    parseErrors.push({ error, offset, length });
                }
            };
            if (content) {
                try {
                    json.visit(content, visitor);
                    raw = currentParent[0] || {};
                }
                catch (e) {
                    console.error(`Error while parsing settings file ${this._name}: ${e}`);
                    this._parseErrors = [e];
                }
            }
            return raw;
        }
        doParseRaw(raw, options) {
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const filtered = this.filter(raw, configurationProperties, true, options);
            raw = filtered.raw;
            const contents = (0, configuration_1.toValuesTree)(raw, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
            const keys = Object.keys(raw);
            const overrides = this.toOverrides(raw, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
            return { contents, keys, overrides, restricted: filtered.restricted, hasExcludedProperties: filtered.hasExcludedProperties };
        }
        filter(properties, configurationProperties, filterOverriddenProperties, options) {
            let hasExcludedProperties = false;
            if (!options?.scopes && !options?.skipRestricted && !options?.exclude?.length) {
                return { raw: properties, restricted: [], hasExcludedProperties };
            }
            const raw = {};
            const restricted = [];
            for (const key in properties) {
                if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key) && filterOverriddenProperties) {
                    const result = this.filter(properties[key], configurationProperties, false, options);
                    raw[key] = result.raw;
                    hasExcludedProperties = hasExcludedProperties || result.hasExcludedProperties;
                    restricted.push(...result.restricted);
                }
                else {
                    const propertySchema = configurationProperties[key];
                    const scope = propertySchema ? typeof propertySchema.scope !== 'undefined' ? propertySchema.scope : 3 /* ConfigurationScope.WINDOW */ : undefined;
                    if (propertySchema?.restricted) {
                        restricted.push(key);
                    }
                    if (!options.exclude?.includes(key) /* Check exclude */
                        && (options.include?.includes(key) /* Check include */
                            || ((scope === undefined || options.scopes === undefined || options.scopes.includes(scope)) /* Check scopes */
                                && !(options.skipRestricted && propertySchema?.restricted)))) /* Check restricted */ {
                        raw[key] = properties[key];
                    }
                    else {
                        hasExcludedProperties = true;
                    }
                }
            }
            return { raw, restricted, hasExcludedProperties };
        }
        toOverrides(raw, conflictReporter) {
            const overrides = [];
            for (const key of Object.keys(raw)) {
                if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                    const overrideRaw = {};
                    for (const keyInOverrideRaw in raw[key]) {
                        overrideRaw[keyInOverrideRaw] = raw[key][keyInOverrideRaw];
                    }
                    overrides.push({
                        identifiers: (0, configurationRegistry_1.overrideIdentifiersFromKey)(key),
                        keys: Object.keys(overrideRaw),
                        contents: (0, configuration_1.toValuesTree)(overrideRaw, conflictReporter)
                    });
                }
            }
            return overrides;
        }
    }
    exports.ConfigurationModelParser = ConfigurationModelParser;
    class UserSettings extends lifecycle_1.Disposable {
        constructor(userSettingsResource, parseOptions, extUri, fileService) {
            super();
            this.userSettingsResource = userSettingsResource;
            this.parseOptions = parseOptions;
            this.fileService = fileService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.parser = new ConfigurationModelParser(this.userSettingsResource.toString());
            this._register(this.fileService.watch(extUri.dirname(this.userSettingsResource)));
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this._register(this.fileService.watch(this.userSettingsResource));
            this._register(event_1.Event.any(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.userSettingsResource)), event_1.Event.filter(this.fileService.onDidRunOperation, e => (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */) || e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(4 /* FileOperation.WRITE */)) && extUri.isEqual(e.resource, userSettingsResource)))(() => this._onDidChange.fire()));
        }
        async loadConfiguration() {
            try {
                const content = await this.fileService.readFile(this.userSettingsResource);
                this.parser.parse(content.value.toString() || '{}', this.parseOptions);
                return this.parser.configurationModel;
            }
            catch (e) {
                return new ConfigurationModel();
            }
        }
        reparse(parseOptions) {
            if (parseOptions) {
                this.parseOptions = parseOptions;
            }
            this.parser.reparse(this.parseOptions);
            return this.parser.configurationModel;
        }
        getRestrictedSettings() {
            return this.parser.restrictedConfigurations;
        }
    }
    exports.UserSettings = UserSettings;
    class ConfigurationInspectValue {
        constructor(key, overrides, _value, overrideIdentifiers, defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, localUserConfiguration, remoteUserConfiguration, workspaceConfiguration, folderConfigurationModel, memoryConfigurationModel) {
            this.key = key;
            this.overrides = overrides;
            this._value = _value;
            this.overrideIdentifiers = overrideIdentifiers;
            this.defaultConfiguration = defaultConfiguration;
            this.policyConfiguration = policyConfiguration;
            this.applicationConfiguration = applicationConfiguration;
            this.userConfiguration = userConfiguration;
            this.localUserConfiguration = localUserConfiguration;
            this.remoteUserConfiguration = remoteUserConfiguration;
            this.workspaceConfiguration = workspaceConfiguration;
            this.folderConfigurationModel = folderConfigurationModel;
            this.memoryConfigurationModel = memoryConfigurationModel;
        }
        get value() {
            return freeze(this._value);
        }
        inspect(model, section, overrideIdentifier) {
            const inspectValue = model.inspect(section, overrideIdentifier);
            return {
                get value() { return freeze(inspectValue.value); },
                get override() { return freeze(inspectValue.override); },
                get merged() { return freeze(inspectValue.merged); }
            };
        }
        get defaultInspectValue() {
            if (!this._defaultInspectValue) {
                this._defaultInspectValue = this.inspect(this.defaultConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._defaultInspectValue;
        }
        get defaultValue() {
            return this.defaultInspectValue.merged;
        }
        get default() {
            return this.defaultInspectValue.value !== undefined || this.defaultInspectValue.override !== undefined ? { value: this.defaultInspectValue.value, override: this.defaultInspectValue.override } : undefined;
        }
        get policyInspectValue() {
            if (this._policyInspectValue === undefined) {
                this._policyInspectValue = this.policyConfiguration ? this.inspect(this.policyConfiguration, this.key) : null;
            }
            return this._policyInspectValue;
        }
        get policyValue() {
            return this.policyInspectValue?.merged;
        }
        get policy() {
            return this.policyInspectValue?.value !== undefined ? { value: this.policyInspectValue.value } : undefined;
        }
        get applicationInspectValue() {
            if (this._applicationInspectValue === undefined) {
                this._applicationInspectValue = this.applicationConfiguration ? this.inspect(this.applicationConfiguration, this.key) : null;
            }
            return this._applicationInspectValue;
        }
        get applicationValue() {
            return this.applicationInspectValue?.merged;
        }
        get application() {
            return this.applicationInspectValue?.value !== undefined || this.applicationInspectValue?.override !== undefined ? { value: this.applicationInspectValue.value, override: this.applicationInspectValue.override } : undefined;
        }
        get userInspectValue() {
            if (!this._userInspectValue) {
                this._userInspectValue = this.inspect(this.userConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._userInspectValue;
        }
        get userValue() {
            return this.userInspectValue.merged;
        }
        get user() {
            return this.userInspectValue.value !== undefined || this.userInspectValue.override !== undefined ? { value: this.userInspectValue.value, override: this.userInspectValue.override } : undefined;
        }
        get userLocalInspectValue() {
            if (!this._userLocalInspectValue) {
                this._userLocalInspectValue = this.inspect(this.localUserConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._userLocalInspectValue;
        }
        get userLocalValue() {
            return this.userLocalInspectValue.merged;
        }
        get userLocal() {
            return this.userLocalInspectValue.value !== undefined || this.userLocalInspectValue.override !== undefined ? { value: this.userLocalInspectValue.value, override: this.userLocalInspectValue.override } : undefined;
        }
        get userRemoteInspectValue() {
            if (!this._userRemoteInspectValue) {
                this._userRemoteInspectValue = this.inspect(this.remoteUserConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._userRemoteInspectValue;
        }
        get userRemoteValue() {
            return this.userRemoteInspectValue.merged;
        }
        get userRemote() {
            return this.userRemoteInspectValue.value !== undefined || this.userRemoteInspectValue.override !== undefined ? { value: this.userRemoteInspectValue.value, override: this.userRemoteInspectValue.override } : undefined;
        }
        get workspaceInspectValue() {
            if (this._workspaceInspectValue === undefined) {
                this._workspaceInspectValue = this.workspaceConfiguration ? this.inspect(this.workspaceConfiguration, this.key, this.overrides.overrideIdentifier) : null;
            }
            return this._workspaceInspectValue;
        }
        get workspaceValue() {
            return this.workspaceInspectValue?.merged;
        }
        get workspace() {
            return this.workspaceInspectValue?.value !== undefined || this.workspaceInspectValue?.override !== undefined ? { value: this.workspaceInspectValue.value, override: this.workspaceInspectValue.override } : undefined;
        }
        get workspaceFolderInspectValue() {
            if (this._workspaceFolderInspectValue === undefined) {
                this._workspaceFolderInspectValue = this.folderConfigurationModel ? this.inspect(this.folderConfigurationModel, this.key, this.overrides.overrideIdentifier) : null;
            }
            return this._workspaceFolderInspectValue;
        }
        get workspaceFolderValue() {
            return this.workspaceFolderInspectValue?.merged;
        }
        get workspaceFolder() {
            return this.workspaceFolderInspectValue?.value !== undefined || this.workspaceFolderInspectValue?.override !== undefined ? { value: this.workspaceFolderInspectValue.value, override: this.workspaceFolderInspectValue.override } : undefined;
        }
        get memoryInspectValue() {
            if (this._memoryInspectValue === undefined) {
                this._memoryInspectValue = this.inspect(this.memoryConfigurationModel, this.key, this.overrides.overrideIdentifier);
            }
            return this._memoryInspectValue;
        }
        get memoryValue() {
            return this.memoryInspectValue.merged;
        }
        get memory() {
            return this.memoryInspectValue.value !== undefined || this.memoryInspectValue.override !== undefined ? { value: this.memoryInspectValue.value, override: this.memoryInspectValue.override } : undefined;
        }
    }
    class Configuration {
        constructor(_defaultConfiguration, _policyConfiguration, _applicationConfiguration, _localUserConfiguration, _remoteUserConfiguration = new ConfigurationModel(), _workspaceConfiguration = new ConfigurationModel(), _folderConfigurations = new map_1.ResourceMap(), _memoryConfiguration = new ConfigurationModel(), _memoryConfigurationByResource = new map_1.ResourceMap()) {
            this._defaultConfiguration = _defaultConfiguration;
            this._policyConfiguration = _policyConfiguration;
            this._applicationConfiguration = _applicationConfiguration;
            this._localUserConfiguration = _localUserConfiguration;
            this._remoteUserConfiguration = _remoteUserConfiguration;
            this._workspaceConfiguration = _workspaceConfiguration;
            this._folderConfigurations = _folderConfigurations;
            this._memoryConfiguration = _memoryConfiguration;
            this._memoryConfigurationByResource = _memoryConfigurationByResource;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations = new map_1.ResourceMap();
            this._userConfiguration = null;
        }
        getValue(section, overrides, workspace) {
            const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(section, overrides, workspace);
            return consolidateConfigurationModel.getValue(section);
        }
        updateValue(key, value, overrides = {}) {
            let memoryConfiguration;
            if (overrides.resource) {
                memoryConfiguration = this._memoryConfigurationByResource.get(overrides.resource);
                if (!memoryConfiguration) {
                    memoryConfiguration = new ConfigurationModel();
                    this._memoryConfigurationByResource.set(overrides.resource, memoryConfiguration);
                }
            }
            else {
                memoryConfiguration = this._memoryConfiguration;
            }
            if (value === undefined) {
                memoryConfiguration.removeValue(key);
            }
            else {
                memoryConfiguration.setValue(key, value);
            }
            if (!overrides.resource) {
                this._workspaceConsolidatedConfiguration = null;
            }
        }
        inspect(key, overrides, workspace) {
            const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(key, overrides, workspace);
            const folderConfigurationModel = this.getFolderConfigurationModelForResource(overrides.resource, workspace);
            const memoryConfigurationModel = overrides.resource ? this._memoryConfigurationByResource.get(overrides.resource) || this._memoryConfiguration : this._memoryConfiguration;
            const overrideIdentifiers = new Set();
            for (const override of consolidateConfigurationModel.overrides) {
                for (const overrideIdentifier of override.identifiers) {
                    if (consolidateConfigurationModel.getOverrideValue(key, overrideIdentifier) !== undefined) {
                        overrideIdentifiers.add(overrideIdentifier);
                    }
                }
            }
            return new ConfigurationInspectValue(key, overrides, consolidateConfigurationModel.getValue(key), overrideIdentifiers.size ? [...overrideIdentifiers] : undefined, this._defaultConfiguration, this._policyConfiguration.isEmpty() ? undefined : this._policyConfiguration, this.applicationConfiguration.isEmpty() ? undefined : this.applicationConfiguration, this.userConfiguration, this.localUserConfiguration, this.remoteUserConfiguration, workspace ? this._workspaceConfiguration : undefined, folderConfigurationModel ? folderConfigurationModel : undefined, memoryConfigurationModel);
        }
        keys(workspace) {
            const folderConfigurationModel = this.getFolderConfigurationModelForResource(undefined, workspace);
            return {
                default: this._defaultConfiguration.keys.slice(0),
                user: this.userConfiguration.keys.slice(0),
                workspace: this._workspaceConfiguration.keys.slice(0),
                workspaceFolder: folderConfigurationModel ? folderConfigurationModel.keys.slice(0) : []
            };
        }
        updateDefaultConfiguration(defaultConfiguration) {
            this._defaultConfiguration = defaultConfiguration;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updatePolicyConfiguration(policyConfiguration) {
            this._policyConfiguration = policyConfiguration;
        }
        updateApplicationConfiguration(applicationConfiguration) {
            this._applicationConfiguration = applicationConfiguration;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateLocalUserConfiguration(localUserConfiguration) {
            this._localUserConfiguration = localUserConfiguration;
            this._userConfiguration = null;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateRemoteUserConfiguration(remoteUserConfiguration) {
            this._remoteUserConfiguration = remoteUserConfiguration;
            this._userConfiguration = null;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateWorkspaceConfiguration(workspaceConfiguration) {
            this._workspaceConfiguration = workspaceConfiguration;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateFolderConfiguration(resource, configuration) {
            this._folderConfigurations.set(resource, configuration);
            this._foldersConsolidatedConfigurations.delete(resource);
        }
        deleteFolderConfiguration(resource) {
            this.folderConfigurations.delete(resource);
            this._foldersConsolidatedConfigurations.delete(resource);
        }
        compareAndUpdateDefaultConfiguration(defaults, keys) {
            const overrides = [];
            if (!keys) {
                const { added, updated, removed } = compare(this._defaultConfiguration, defaults);
                keys = [...added, ...updated, ...removed];
            }
            for (const key of keys) {
                for (const overrideIdentifier of (0, configurationRegistry_1.overrideIdentifiersFromKey)(key)) {
                    const fromKeys = this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier);
                    const toKeys = defaults.getKeysForOverrideIdentifier(overrideIdentifier);
                    const keys = [
                        ...toKeys.filter(key => fromKeys.indexOf(key) === -1),
                        ...fromKeys.filter(key => toKeys.indexOf(key) === -1),
                        ...fromKeys.filter(key => !objects.equals(this._defaultConfiguration.override(overrideIdentifier).getValue(key), defaults.override(overrideIdentifier).getValue(key)))
                    ];
                    overrides.push([overrideIdentifier, keys]);
                }
            }
            this.updateDefaultConfiguration(defaults);
            return { keys, overrides };
        }
        compareAndUpdatePolicyConfiguration(policyConfiguration) {
            const { added, updated, removed } = compare(this._policyConfiguration, policyConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updatePolicyConfiguration(policyConfiguration);
            }
            return { keys, overrides: [] };
        }
        compareAndUpdateApplicationConfiguration(application) {
            const { added, updated, removed, overrides } = compare(this.applicationConfiguration, application);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateApplicationConfiguration(application);
            }
            return { keys, overrides };
        }
        compareAndUpdateLocalUserConfiguration(user) {
            const { added, updated, removed, overrides } = compare(this.localUserConfiguration, user);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateLocalUserConfiguration(user);
            }
            return { keys, overrides };
        }
        compareAndUpdateRemoteUserConfiguration(user) {
            const { added, updated, removed, overrides } = compare(this.remoteUserConfiguration, user);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateRemoteUserConfiguration(user);
            }
            return { keys, overrides };
        }
        compareAndUpdateWorkspaceConfiguration(workspaceConfiguration) {
            const { added, updated, removed, overrides } = compare(this.workspaceConfiguration, workspaceConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateWorkspaceConfiguration(workspaceConfiguration);
            }
            return { keys, overrides };
        }
        compareAndUpdateFolderConfiguration(resource, folderConfiguration) {
            const currentFolderConfiguration = this.folderConfigurations.get(resource);
            const { added, updated, removed, overrides } = compare(currentFolderConfiguration, folderConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length || !currentFolderConfiguration) {
                this.updateFolderConfiguration(resource, folderConfiguration);
            }
            return { keys, overrides };
        }
        compareAndDeleteFolderConfiguration(folder) {
            const folderConfig = this.folderConfigurations.get(folder);
            if (!folderConfig) {
                throw new Error('Unknown folder');
            }
            this.deleteFolderConfiguration(folder);
            const { added, updated, removed, overrides } = compare(folderConfig, undefined);
            return { keys: [...added, ...updated, ...removed], overrides };
        }
        get defaults() {
            return this._defaultConfiguration;
        }
        get applicationConfiguration() {
            return this._applicationConfiguration;
        }
        get userConfiguration() {
            if (!this._userConfiguration) {
                this._userConfiguration = this._remoteUserConfiguration.isEmpty() ? this._localUserConfiguration : this._localUserConfiguration.merge(this._remoteUserConfiguration);
            }
            return this._userConfiguration;
        }
        get localUserConfiguration() {
            return this._localUserConfiguration;
        }
        get remoteUserConfiguration() {
            return this._remoteUserConfiguration;
        }
        get workspaceConfiguration() {
            return this._workspaceConfiguration;
        }
        get folderConfigurations() {
            return this._folderConfigurations;
        }
        getConsolidatedConfigurationModel(section, overrides, workspace) {
            let configurationModel = this.getConsolidatedConfigurationModelForResource(overrides, workspace);
            if (overrides.overrideIdentifier) {
                configurationModel = configurationModel.override(overrides.overrideIdentifier);
            }
            if (!this._policyConfiguration.isEmpty() && this._policyConfiguration.getValue(section) !== undefined) {
                configurationModel = configurationModel.merge(this._policyConfiguration);
            }
            return configurationModel;
        }
        getConsolidatedConfigurationModelForResource({ resource }, workspace) {
            let consolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
            if (workspace && resource) {
                const root = workspace.getFolder(resource);
                if (root) {
                    consolidateConfiguration = this.getFolderConsolidatedConfiguration(root.uri) || consolidateConfiguration;
                }
                const memoryConfigurationForResource = this._memoryConfigurationByResource.get(resource);
                if (memoryConfigurationForResource) {
                    consolidateConfiguration = consolidateConfiguration.merge(memoryConfigurationForResource);
                }
            }
            return consolidateConfiguration;
        }
        getWorkspaceConsolidatedConfiguration() {
            if (!this._workspaceConsolidatedConfiguration) {
                this._workspaceConsolidatedConfiguration = this._defaultConfiguration.merge(this.applicationConfiguration, this.userConfiguration, this._workspaceConfiguration, this._memoryConfiguration);
            }
            return this._workspaceConsolidatedConfiguration;
        }
        getFolderConsolidatedConfiguration(folder) {
            let folderConsolidatedConfiguration = this._foldersConsolidatedConfigurations.get(folder);
            if (!folderConsolidatedConfiguration) {
                const workspaceConsolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
                const folderConfiguration = this._folderConfigurations.get(folder);
                if (folderConfiguration) {
                    folderConsolidatedConfiguration = workspaceConsolidateConfiguration.merge(folderConfiguration);
                    this._foldersConsolidatedConfigurations.set(folder, folderConsolidatedConfiguration);
                }
                else {
                    folderConsolidatedConfiguration = workspaceConsolidateConfiguration;
                }
            }
            return folderConsolidatedConfiguration;
        }
        getFolderConfigurationModelForResource(resource, workspace) {
            if (workspace && resource) {
                const root = workspace.getFolder(resource);
                if (root) {
                    return this._folderConfigurations.get(root.uri);
                }
            }
            return undefined;
        }
        toData() {
            return {
                defaults: {
                    contents: this._defaultConfiguration.contents,
                    overrides: this._defaultConfiguration.overrides,
                    keys: this._defaultConfiguration.keys
                },
                policy: {
                    contents: this._policyConfiguration.contents,
                    overrides: this._policyConfiguration.overrides,
                    keys: this._policyConfiguration.keys
                },
                application: {
                    contents: this.applicationConfiguration.contents,
                    overrides: this.applicationConfiguration.overrides,
                    keys: this.applicationConfiguration.keys
                },
                user: {
                    contents: this.userConfiguration.contents,
                    overrides: this.userConfiguration.overrides,
                    keys: this.userConfiguration.keys
                },
                workspace: {
                    contents: this._workspaceConfiguration.contents,
                    overrides: this._workspaceConfiguration.overrides,
                    keys: this._workspaceConfiguration.keys
                },
                folders: [...this._folderConfigurations.keys()].reduce((result, folder) => {
                    const { contents, overrides, keys } = this._folderConfigurations.get(folder);
                    result.push([folder, { contents, overrides, keys }]);
                    return result;
                }, [])
            };
        }
        allKeys() {
            const keys = new Set();
            this._defaultConfiguration.keys.forEach(key => keys.add(key));
            this.userConfiguration.keys.forEach(key => keys.add(key));
            this._workspaceConfiguration.keys.forEach(key => keys.add(key));
            this._folderConfigurations.forEach(folderConfiguration => folderConfiguration.keys.forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        allOverrideIdentifiers() {
            const keys = new Set();
            this._defaultConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this.userConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this._workspaceConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this._folderConfigurations.forEach(folderConfiguration => folderConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        getAllKeysForOverrideIdentifier(overrideIdentifier) {
            const keys = new Set();
            this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this.userConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this._workspaceConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this._folderConfigurations.forEach(folderConfiguration => folderConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        static parse(data) {
            const defaultConfiguration = this.parseConfigurationModel(data.defaults);
            const policyConfiguration = this.parseConfigurationModel(data.policy);
            const applicationConfiguration = this.parseConfigurationModel(data.application);
            const userConfiguration = this.parseConfigurationModel(data.user);
            const workspaceConfiguration = this.parseConfigurationModel(data.workspace);
            const folders = data.folders.reduce((result, value) => {
                result.set(uri_1.URI.revive(value[0]), this.parseConfigurationModel(value[1]));
                return result;
            }, new map_1.ResourceMap());
            return new Configuration(defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, new ConfigurationModel(), workspaceConfiguration, folders, new ConfigurationModel(), new map_1.ResourceMap());
        }
        static parseConfigurationModel(model) {
            return new ConfigurationModel(model.contents, model.keys, model.overrides);
        }
    }
    exports.Configuration = Configuration;
    function mergeChanges(...changes) {
        if (changes.length === 0) {
            return { keys: [], overrides: [] };
        }
        if (changes.length === 1) {
            return changes[0];
        }
        const keysSet = new Set();
        const overridesMap = new Map();
        for (const change of changes) {
            change.keys.forEach(key => keysSet.add(key));
            change.overrides.forEach(([identifier, keys]) => {
                const result = (0, map_1.getOrSet)(overridesMap, identifier, new Set());
                keys.forEach(key => result.add(key));
            });
        }
        const overrides = [];
        overridesMap.forEach((keys, identifier) => overrides.push([identifier, [...keys.values()]]));
        return { keys: [...keysSet.values()], overrides };
    }
    exports.mergeChanges = mergeChanges;
    class ConfigurationChangeEvent {
        constructor(change, previous, currentConfiguraiton, currentWorkspace) {
            this.change = change;
            this.previous = previous;
            this.currentConfiguraiton = currentConfiguraiton;
            this.currentWorkspace = currentWorkspace;
            this._marker = '\n';
            this._markerCode1 = this._marker.charCodeAt(0);
            this._markerCode2 = '.'.charCodeAt(0);
            this.affectedKeys = new Set();
            this._previousConfiguration = undefined;
            for (const key of change.keys) {
                this.affectedKeys.add(key);
            }
            for (const [, keys] of change.overrides) {
                for (const key of keys) {
                    this.affectedKeys.add(key);
                }
            }
            // Example: '\nfoo.bar\nabc.def\n'
            this._affectsConfigStr = this._marker;
            for (const key of this.affectedKeys) {
                this._affectsConfigStr += key + this._marker;
            }
        }
        get previousConfiguration() {
            if (!this._previousConfiguration && this.previous) {
                this._previousConfiguration = Configuration.parse(this.previous.data);
            }
            return this._previousConfiguration;
        }
        affectsConfiguration(section, overrides) {
            // we have one large string with all keys that have changed. we pad (marker) the section
            // and check that either find it padded or before a segment character
            const needle = this._marker + section;
            const idx = this._affectsConfigStr.indexOf(needle);
            if (idx < 0) {
                // NOT: (marker + section)
                return false;
            }
            const pos = idx + needle.length;
            if (pos >= this._affectsConfigStr.length) {
                return false;
            }
            const code = this._affectsConfigStr.charCodeAt(pos);
            if (code !== this._markerCode1 && code !== this._markerCode2) {
                // NOT: section + (marker | segment)
                return false;
            }
            if (overrides) {
                const value1 = this.previousConfiguration ? this.previousConfiguration.getValue(section, overrides, this.previous?.workspace) : undefined;
                const value2 = this.currentConfiguraiton.getValue(section, overrides, this.currentWorkspace);
                return !objects.equals(value1, value2);
            }
            return true;
        }
    }
    exports.ConfigurationChangeEvent = ConfigurationChangeEvent;
    function compare(from, to) {
        const { added, removed, updated } = compareConfigurationContents(to?.rawConfiguration, from?.rawConfiguration);
        const overrides = [];
        const fromOverrideIdentifiers = from?.getAllOverrideIdentifiers() || [];
        const toOverrideIdentifiers = to?.getAllOverrideIdentifiers() || [];
        if (to) {
            const addedOverrideIdentifiers = toOverrideIdentifiers.filter(key => !fromOverrideIdentifiers.includes(key));
            for (const identifier of addedOverrideIdentifiers) {
                overrides.push([identifier, to.getKeysForOverrideIdentifier(identifier)]);
            }
        }
        if (from) {
            const removedOverrideIdentifiers = fromOverrideIdentifiers.filter(key => !toOverrideIdentifiers.includes(key));
            for (const identifier of removedOverrideIdentifiers) {
                overrides.push([identifier, from.getKeysForOverrideIdentifier(identifier)]);
            }
        }
        if (to && from) {
            for (const identifier of fromOverrideIdentifiers) {
                if (toOverrideIdentifiers.includes(identifier)) {
                    const result = compareConfigurationContents({ contents: from.getOverrideValue(undefined, identifier) || {}, keys: from.getKeysForOverrideIdentifier(identifier) }, { contents: to.getOverrideValue(undefined, identifier) || {}, keys: to.getKeysForOverrideIdentifier(identifier) });
                    overrides.push([identifier, [...result.added, ...result.removed, ...result.updated]]);
                }
            }
        }
        return { added, removed, updated, overrides };
    }
    function compareConfigurationContents(to, from) {
        const added = to
            ? from ? to.keys.filter(key => from.keys.indexOf(key) === -1) : [...to.keys]
            : [];
        const removed = from
            ? to ? from.keys.filter(key => to.keys.indexOf(key) === -1) : [...from.keys]
            : [];
        const updated = [];
        if (to && from) {
            for (const key of from.keys) {
                if (to.keys.indexOf(key) !== -1) {
                    const value1 = (0, configuration_1.getConfigurationValue)(from.contents, key);
                    const value2 = (0, configuration_1.getConfigurationValue)(to.contents, key);
                    if (!objects.equals(value1, value2)) {
                        updated.push(key);
                    }
                }
            }
        }
        return { added, removed, updated };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbk1vZGVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29uZmlndXJhdGlvbi9jb21tb24vY29uZmlndXJhdGlvbk1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLFNBQVMsTUFBTSxDQUFJLElBQU87UUFDekIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQVFELE1BQWEsa0JBQWtCO1FBSTlCLFlBQ2tCLFlBQWlCLEVBQUUsRUFDbkIsUUFBa0IsRUFBRSxFQUNwQixhQUEyQixFQUFFLEVBQ3JDLEdBQWdFO1lBSHhELGNBQVMsR0FBVCxTQUFTLENBQVU7WUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBZTtZQUNwQixlQUFVLEdBQVYsVUFBVSxDQUFtQjtZQUNyQyxRQUFHLEdBQUgsR0FBRyxDQUE2RDtZQU56RCwyQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQVFoRixDQUFDO1FBR0QsSUFBSSxnQkFBZ0I7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUM3QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUM7b0JBQ3RCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2pELElBQUksR0FBRyxZQUFZLGtCQUFrQixFQUFFLENBQUM7NEJBQ3ZDLE9BQU8sR0FBRyxDQUFDO3dCQUNaLENBQUM7d0JBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxFQUFFLENBQUMs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