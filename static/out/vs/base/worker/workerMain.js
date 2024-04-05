/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["require","exports","vs/editor/common/core/range","vs/base/common/errors","vs/editor/common/core/offsetRange","vs/editor/common/core/position","vs/base/common/arrays","vs/base/common/strings","vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm","vs/base/common/arraysFind","vs/base/common/lifecycle","vs/base/common/event","vs/editor/common/core/lineRange","vs/base/common/assert","vs/base/common/objects","vs/editor/common/diff/defaultLinesDiffComputer/utils","vs/editor/common/diff/rangeMapping","vs/base/common/platform","vs/base/common/uri","vs/base/common/functional","vs/base/common/iterator","vs/base/common/linkedList","vs/base/common/map","vs/base/common/stopwatch","vs/base/common/cancellation","vs/base/common/diff/diff","vs/base/common/types","vs/base/common/uint","vs/editor/common/core/characterClassifier","vs/editor/common/core/wordHelper","vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm","vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence","vs/editor/common/diff/linesDiffComputer","vs/editor/common/diff/legacyLinesDiffComputer","vs/base/common/collections","vs/base/common/color","vs/base/common/diff/diffChange","vs/base/common/keyCodes","vs/base/common/lazy","vs/base/common/cache","vs/base/common/hash","vs/base/common/codicons","vs/editor/common/core/editOperation","vs/editor/common/core/selection","vs/editor/common/core/wordCharacterClassifier","vs/editor/common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations","vs/editor/common/diff/defaultLinesDiffComputer/lineSequence","vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing","vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines","vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer","vs/editor/common/diff/linesDiffComputers","vs/editor/common/languages/defaultDocumentColorsComputer","vs/editor/common/languages/linkComputer","vs/editor/common/languages/supports/inplaceReplaceSupport","vs/editor/common/model","vs/editor/common/model/prefixSumComputer","vs/editor/common/model/mirrorTextModel","vs/editor/common/model/textModelSearch","vs/editor/common/services/unicodeTextModelHighlighter","vs/editor/common/standalone/standaloneEnums","vs/editor/common/tokenizationRegistry","vs/nls!vs/base/common/platform","vs/nls","vs/nls!vs/editor/common/services/editorSimpleWorker","vs/base/common/process","vs/base/common/path","vs/nls!vs/editor/common/languages","vs/editor/common/languages","vs/editor/common/services/editorBaseApi","vs/css","vs/base/common/worker/simpleWorker","vs/editor/common/services/editorSimpleWorker"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 * Please make sure to make edits in the .ts file at https://github.com/microsoft/vscode-loader/
 *---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 *---------------------------------------------------------------------------------------------
 *--------------------------------------------------------------------------------------------*/
const _amdLoaderGlobal = this;
const _commonjsGlobal = typeof global === 'object' ? global : {};
var AMDLoader;
(function (AMDLoader) {
	AMDLoader.global = _amdLoaderGlobal;
	class Environment {
		get isWindows() {
			this._detect();
			return this._isWindows;
		}
		get isNode() {
			this._detect();
			return this._isNode;
		}
		get isElectronRenderer() {
			this._detect();
			return this._isElectronRenderer;
		}
		get isWebWorker() {
			this._detect();
			return this._isWebWorker;
		}
		get isElectronNodeIntegrationWebWorker() {
			this._detect();
			return this._isElectronNodeIntegrationWebWorker;
		}
		constructor() {
			this._detected = false;
			this._isWindows = false;
			this._isNode = false;
			this._isElectronRenderer = false;
			this._isWebWorker = false;
			this._isElectronNodeIntegrationWebWorker = false;
		}
		_detect() {
			if (this._detected) {
				return;
			}
			this._detected = true;
			this._isWindows = Environment._isWindows();
			this._isNode = (typeof module !== 'undefined' && !!module.exports);
			this._isElectronRenderer = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer');
			this._isWebWorker = (typeof AMDLoader.global.importScripts === 'function');
			this._isElectronNodeIntegrationWebWorker = this._isWebWorker && (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'worker');
		}
		static _isWindows() {
			if (typeof navigator !== 'undefined') {
				if (navigator.userAgent && navigator.userAgent.indexOf('Windows') >= 0) {
					return true;
				}
			}
			if (typeof process !== 'undefined') {
				return (process.platform === 'win32');
			}
			return false;
		}
	}
	AMDLoader.Environment = Environment;
})(AMDLoader || (AMDLoader = {}));
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var AMDLoader;
(function (AMDLoader) {
	class LoaderEvent {
		constructor(type, detail, timestamp) {
			this.type = type;
			this.detail = detail;
			this.timestamp = timestamp;
		}
	}
	AMDLoader.LoaderEvent = LoaderEvent;
	class LoaderEventRecorder {
		constructor(loaderAvailableTimestamp) {
			this._events = [new LoaderEvent(1 /* LoaderEventType.LoaderAvailable */, '', loaderAvailableTimestamp)];
		}
		record(type, detail) {
			this._events.push(new LoaderEvent(type, detail, AMDLoader.Utilities.getHighPerformanceTimestamp()));
		}
		getEvents() {
			return this._events;
		}
	}
	AMDLoader.LoaderEventRecorder = LoaderEventRecorder;
	class NullLoaderEventRecorder {
		record(type, detail) {
			// Nothing to do
		}
		getEvents() {
			return [];
		}
	}
	NullLoaderEventRecorder.INSTANCE = new NullLoaderEventRecorder();
	AMDLoader.NullLoaderEventRecorder = NullLoaderEventRecorder;
})(AMDLoader || (AMDLoader = {}));
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var AMDLoader;
(function (AMDLoader) {
	class Utilities {
		/**
		 * This method does not take care of / vs \
		 */
		static fileUriToFilePath(isWindows, uri) {
			uri = decodeURI(uri).replace(/%23/g, '#');
			if (isWindows) {
				if (/^file:\/\/\//.test(uri)) {
					// This is a URI without a hostname => return only the path segment
					return uri.substr(8);
				}
				if (/^file:\/\//.test(uri)) {
					return uri.substr(5);
				}
			}
			else {
				if (/^file:\/\//.test(uri)) {
					return uri.substr(7);
				}
			}
			// Not sure...
			return uri;
		}
		static startsWith(haystack, needle) {
			return haystack.length >= needle.length && haystack.substr(0, needle.length) === needle;
		}
		static endsWith(haystack, needle) {
			return haystack.length >= needle.length && haystack.substr(haystack.length - needle.length) === needle;
		}
		// only check for "?" before "#" to ensure that there is a real Query-String
		static containsQueryString(url) {
			return /^[^\#]*\?/gi.test(url);
		}
		/**
		 * Does `url` start with http:// or https:// or file:// or / ?
		 */
		static isAbsolutePath(url) {
			return /^((http:\/\/)|(https:\/\/)|(file:\/\/)|(\/))/.test(url);
		}
		static forEachProperty(obj, callback) {
			if (obj) {
				let key;
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						callback(key, obj[key]);
					}
				}
			}
		}
		static isEmpty(obj) {
			let isEmpty = true;
			Utilities.forEachProperty(obj, () => {
				isEmpty = false;
			});
			return isEmpty;
		}
		static recursiveClone(obj) {
			if (!obj || typeof obj !== 'object' || obj instanceof RegExp) {
				return obj;
			}
			if (!Array.isArray(obj) && Object.getPrototypeOf(obj) !== Object.prototype) {
				// only clone "simple" objects
				return obj;
			}
			let result = Array.isArray(obj) ? [] : {};
			Utilities.forEachProperty(obj, (key, value) => {
				if (value && typeof value === 'object') {
					result[key] = Utilities.recursiveClone(value);
				}
				else {
					result[key] = value;
				}
			});
			return result;
		}
		static generateAnonymousModule() {
			return '===anonymous' + (Utilities.NEXT_ANONYMOUS_ID++) + '===';
		}
		static isAnonymousModule(id) {
			return Utilities.startsWith(id, '===anonymous');
		}
		static getHighPerformanceTimestamp() {
			if (!this.PERFORMANCE_NOW_PROBED) {
				this.PERFORMANCE_NOW_PROBED = true;
				this.HAS_PERFORMANCE_NOW = (AMDLoader.global.performance && typeof AMDLoader.global.performance.now === 'function');
			}
			return (this.HAS_PERFORMANCE_NOW ? AMDLoader.global.performance.now() : Date.now());
		}
	}
	Utilities.NEXT_ANONYMOUS_ID = 1;
	Utilities.PERFORMANCE_NOW_PROBED = false;
	Utilities.HAS_PERFORMANCE_NOW = false;
	AMDLoader.Utilities = Utilities;
})(AMDLoader || (AMDLoader = {}));
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var AMDLoader;
(function (AMDLoader) {
	function ensureError(err) {
		if (err instanceof Error) {
			return err;
		}
		const result = new Error(err.message || String(err) || 'Unknown Error');
		if (err.stack) {
			result.stack = err.stack;
		}
		return result;
	}
	AMDLoader.ensureError = ensureError;
	;
	class ConfigurationOptionsUtil {
		/**
		 * Ensure configuration options make sense
		 */
		static validateConfigurationOptions(options) {
			function defaultOnError(err) {
				if (err.phase === 'loading') {
					console.error('Loading "' + err.moduleId + '" failed');
					console.error(err);
					console.error('Here are the modules that depend on it:');
					console.error(err.neededBy);
					return;
				}
				if (err.phase === 'factory') {
					console.error('The factory function of "' + err.moduleId + '" has thrown an exception');
					console.error(err);
					console.error('Here are the modules that depend on it:');
					console.error(err.neededBy);
					return;
				}
			}
			options = options || {};
			if (typeof options.baseUrl !== 'string') {
				options.baseUrl = '';
			}
			if (typeof options.isBuild !== 'boolean') {
				options.isBuild = false;
			}
			if (typeof options.paths !== 'object') {
				options.paths = {};
			}
			if (typeof options.config !== 'object') {
				options.config = {};
			}
			if (typeof options.catchError === 'undefined') {
				options.catchError = false;
			}
			if (typeof options.recordStats === 'undefined') {
				options.recordStats = false;
			}
			if (typeof options.urlArgs !== 'string') {
				options.urlArgs = '';
			}
			if (typeof options.onError !== 'function') {
				options.onError = defaultOnError;
			}
			if (!Array.isArray(options.ignoreDuplicateModules)) {
				options.ignoreDuplicateModules = [];
			}
			if (options.baseUrl.length > 0) {
				if (!AMDLoader.Utilities.endsWith(options.baseUrl, '/')) {
					options.baseUrl += '/';
				}
			}
			if (typeof options.cspNonce !== 'string') {
				options.cspNonce = '';
			}
			if (typeof options.preferScriptTags === 'undefined') {
				options.preferScriptTags = false;
			}
			if (options.nodeCachedData && typeof options.nodeCachedData === 'object') {
				if (typeof options.nodeCachedData.seed !== 'string') {
					options.nodeCachedData.seed = 'seed';
				}
				if (typeof options.nodeCachedData.writeDelay !== 'number' || options.nodeCachedData.writeDelay < 0) {
					options.nodeCachedData.writeDelay = 1000 * 7;
				}
				if (!options.nodeCachedData.path || typeof options.nodeCachedData.path !== 'string') {
					const err = ensureError(new Error('INVALID cached data configuration, \'path\' MUST be set'));
					err.phase = 'configuration';
					options.onError(err);
					options.nodeCachedData = undefined;
				}
			}
			return options;
		}
		static mergeConfigurationOptions(overwrite = null, base = null) {
			let result = AMDLoader.Utilities.recursiveClone(base || {});
			// Merge known properties and overwrite the unknown ones
			AMDLoader.Utilities.forEachProperty(overwrite, (key, value) => {
				if (key === 'ignoreDuplicateModules' && typeof result.ignoreDuplicateModules !== 'undefined') {
					result.ignoreDuplicateModules = result.ignoreDuplicateModules.concat(value);
				}
				else if (key === 'paths' && typeof result.paths !== 'undefined') {
					AMDLoader.Utilities.forEachProperty(value, (key2, value2) => result.paths[key2] = value2);
				}
				else if (key === 'config' && typeof result.config !== 'undefined') {
					AMDLoader.Utilities.forEachProperty(value, (key2, value2) => result.config[key2] = value2);
				}
				else {
					result[key] = AMDLoader.Utilities.recursiveClone(value);
				}
			});
			return ConfigurationOptionsUtil.validateConfigurationOptions(result);
		}
	}
	AMDLoader.ConfigurationOptionsUtil = ConfigurationOptionsUtil;
	class Configuration {
		constructor(env, options) {
			this._env = env;
			this.options = ConfigurationOptionsUtil.mergeConfigurationOptions(options);
			this._createIgnoreDuplicateModulesMap();
			this._createSortedPathsRules();
			if (this.options.baseUrl === '') {
				if (this.options.nodeRequire && this.options.nodeRequire.main && this.options.nodeRequire.main.filename && this._env.isNode) {
					let nodeMain = this.options.nodeRequire.main.filename;
					let dirnameIndex = Math.max(nodeMain.lastIndexOf('/'), nodeMain.lastIndexOf('\\'));
					this.options.baseUrl = nodeMain.substring(0, dirnameIndex + 1);
				}
			}
		}
		_createIgnoreDuplicateModulesMap() {
			// Build a map out of the ignoreDuplicateModules array
			this.ignoreDuplicateModulesMap = {};
			for (let i = 0; i < this.options.ignoreDuplicateModules.length; i++) {
				this.ignoreDuplicateModulesMap[this.options.ignoreDuplicateModules[i]] = true;
			}
		}
		_createSortedPathsRules() {
			// Create an array our of the paths rules, sorted descending by length to
			// result in a more specific -> less specific order
			this.sortedPathsRules = [];
			AMDLoader.Utilities.forEachProperty(this.options.paths, (from, to) => {
				if (!Array.isArray(to)) {
					this.sortedPathsRules.push({
						from: from,
						to: [to]
					});
				}
				else {
					this.sortedPathsRules.push({
						from: from,
						to: to
					});
				}
			});
			this.sortedPathsRules.sort((a, b) => {
				return b.from.length - a.from.length;
			});
		}
		/**
		 * Clone current configuration and overwrite options selectively.
		 * @param options The selective options to overwrite with.
		 * @result A new configuration
		 */
		cloneAndMerge(options) {
			return new Configuration(this._env, ConfigurationOptionsUtil.mergeConfigurationOptions(options, this.options));
		}
		/**
		 * Get current options bag. Useful for passing it forward to plugins.
		 */
		getOptionsLiteral() {
			return this.options;
		}
		_applyPaths(moduleId) {
			let pathRule;
			for (let i = 0, len = this.sortedPathsRules.length; i < len; i++) {
				pathRule = this.sortedPathsRules[i];
				if (AMDLoader.Utilities.startsWith(moduleId, pathRule.from)) {
					let result = [];
					for (let j = 0, lenJ = pathRule.to.length; j < lenJ; j++) {
						result.push(pathRule.to[j] + moduleId.substr(pathRule.from.length));
					}
					return result;
				}
			}
			return [moduleId];
		}
		_addUrlArgsToUrl(url) {
			if (AMDLoader.Utilities.containsQueryString(url)) {
				return url + '&' + this.options.urlArgs;
			}
			else {
				return url + '?' + this.options.urlArgs;
			}
		}
		_addUrlArgsIfNecessaryToUrl(url) {
			if (this.options.urlArgs) {
				return this._addUrlArgsToUrl(url);
			}
			return url;
		}
		_addUrlArgsIfNecessaryToUrls(urls) {
			if (this.options.urlArgs) {
				for (let i = 0, len = urls.length; i < len; i++) {
					urls[i] = this._addUrlArgsToUrl(urls[i]);
				}
			}
			return urls;
		}
		/**
		 * Transform a module id to a location. Appends .js to module ids
		 */
		moduleIdToPaths(moduleId) {
			if (this._env.isNode) {
				const isNodeModule = (this.options.amdModulesPattern instanceof RegExp
					&& !this.options.amdModulesPattern.test(moduleId));
				if (isNodeModule) {
					// This is a node module...
					if (this.isBuild()) {
						// ...and we are at build time, drop it
						return ['empty:'];
					}
					else {
						// ...and at runtime we create a `shortcut`-path
						return ['node|' + moduleId];
					}
				}
			}
			let result = moduleId;
			let results;
			if (!AMDLoader.Utilities.endsWith(result, '.js') && !AMDLoader.Utilities.isAbsolutePath(result)) {
				results = this._applyPaths(result);
				for (let i = 0, len = results.length; i < len; i++) {
					if (this.isBuild() && results[i] === 'empty:') {
						continue;
					}
					if (!AMDLoader.Utilities.isAbsolutePath(results[i])) {
						results[i] = this.options.baseUrl + results[i];
					}
					if (!AMDLoader.Utilities.endsWith(results[i], '.js') && !AMDLoader.Utilities.containsQueryString(results[i])) {
						results[i] = results[i] + '.js';
					}
				}
			}
			else {
				if (!AMDLoader.Utilities.endsWith(result, '.js') && !AMDLoader.Utilities.containsQueryString(result)) {
					result = result + '.js';
				}
				results = [result];
			}
			return this._addUrlArgsIfNecessaryToUrls(results);
		}
		/**
		 * Transform a module id or url to a location.
		 */
		requireToUrl(url) {
			let result = url;
			if (!AMDLoader.Utilities.isAbsolutePath(result)) {
				result = this._applyPaths(result)[0];
				if (!AMDLoader.Utilities.isAbsolutePath(result)) {
					result = this.options.baseUrl + result;
				}
			}
			return this._addUrlArgsIfNecessaryToUrl(result);
		}
		/**
		 * Flag to indicate if current execution is as part of a build.
		 */
		isBuild() {
			return this.options.isBuild;
		}
		shouldInvokeFactory(strModuleId) {
			if (!this.options.isBuild) {
				// outside of a build, all factories should be invoked
				return true;
			}
			// during a build, only explicitly marked or anonymous modules get their factories invoked
			if (AMDLoader.Utilities.isAnonymousModule(strModuleId)) {
				return true;
			}
			if (this.options.buildForceInvokeFactory && this.options.buildForceInvokeFactory[strModuleId]) {
				return true;
			}
			return false;
		}
		/**
		 * Test if module `moduleId` is expected to be defined multiple times
		 */
		isDuplicateMessageIgnoredFor(moduleId) {
			return this.ignoreDuplicateModulesMap.hasOwnProperty(moduleId);
		}
		/**
		 * Get the configuration settings for the provided module id
		 */
		getConfigForModule(moduleId) {
			if (this.options.config) {
				return this.options.config[moduleId];
			}
		}
		/**
		 * Should errors be caught when executing module factories?
		 */
		shouldCatchError() {
			return this.options.catchError;
		}
		/**
		 * Should statistics be recorded?
		 */
		shouldRecordStats() {
			return this.options.recordStats;
		}
		/**
		 * Forward an error to the error handler.
		 */
		onError(err) {
			this.options.onError(err);
		}
	}
	AMDLoader.Configuration = Configuration;
})(AMDLoader || (AMDLoader = {}));
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var AMDLoader;
(function (AMDLoader) {
	/**
	 * Load `scriptSrc` only once (avoid multiple <script> tags)
	 */
	class OnlyOnceScriptLoader {
		constructor(env) {
			this._env = env;
			this._scriptLoader = null;
			this._callbackMap = {};
		}
		load(moduleManager, scriptSrc, callback, errorback) {
			if (!this._scriptLoader) {
				if (this._env.isWebWorker) {
					this._scriptLoader = new WorkerScriptLoader();
				}
				else if (this._env.isElectronRenderer) {
					const { preferScriptTags } = moduleManager.getConfig().getOptionsLiteral();
					if (preferScriptTags) {
						this._scriptLoader = new BrowserScriptLoader();
					}
					else {
						this._scriptLoader = new NodeScriptLoader(this._env);
					}
				}
				else if (this._env.isNode) {
					this._scriptLoader = new NodeScriptLoader(this._env);
				}
				else {
					this._scriptLoader = new BrowserScriptLoader();
				}
			}
			let scriptCallbacks = {
				callback: callback,
				errorback: errorback
			};
			if (this._callbackMap.hasOwnProperty(scriptSrc)) {
				this._callbackMap[scriptSrc].push(scriptCallbacks);
				return;
			}
			this._callbackMap[scriptSrc] = [scriptCallbacks];
			this._scriptLoader.load(moduleManager, scriptSrc, () => this.triggerCallback(scriptSrc), (err) => this.triggerErrorback(scriptSrc, err));
		}
		triggerCallback(scriptSrc) {
			let scriptCallbacks = this._callbackMap[scriptSrc];
			delete this._callbackMap[scriptSrc];
			for (let i = 0; i < scriptCallbacks.length; i++) {
				scriptCallbacks[i].callback();
			}
		}
		triggerErrorback(scriptSrc, err) {
			let scriptCallbacks = this._callbackMap[scriptSrc];
			delete this._callbackMap[scriptSrc];
			for (let i = 0; i < scriptCallbacks.length; i++) {
				scriptCallbacks[i].errorback(err);
			}
		}
	}
	class BrowserScriptLoader {
		/**
		 * Attach load / error listeners to a script element and remove them when either one has fired.
		 * Implemented for browsers supporting HTML5 standard 'load' and 'error' events.
		 */
		attachListeners(script, callback, errorback) {
			let unbind = () => {
				script.removeEventListener('load', loadEventListener);
				script.removeEventListener('error', errorEventListener);
			};
			let loadEventListener = (e) => {
				unbind();
				callback();
			};
			let errorEventListener = (e) => {
				unbind();
				errorback(e);
			};
			script.addEventListener('load', loadEventListener);
			script.addEventListener('error', errorEventListener);
		}
		load(moduleManager, scriptSrc, callback, errorback) {
			if (/^node\|/.test(scriptSrc)) {
				let opts = moduleManager.getConfig().getOptionsLiteral();
				let nodeRequire = ensureRecordedNodeRequire(moduleManager.getRecorder(), (opts.nodeRequire || AMDLoader.global.nodeRequire));
				let pieces = scriptSrc.split('|');
				let moduleExports = null;
				try {
					moduleExports = nodeRequire(pieces[1]);
				}
				catch (err) {
					errorback(err);
					return;
				}
				moduleManager.enqueueDefineAnonymousModule([], () => moduleExports);
				callback();
			}
			else {
				let script = document.createElement('script');
				script.setAttribute('async', 'async');
				script.setAttribute('type', 'text/javascript');
				this.attachListeners(script, callback, errorback);
				const { trustedTypesPolicy } = moduleManager.getConfig().getOptionsLiteral();
				if (trustedTypesPolicy) {
					scriptSrc = trustedTypesPolicy.createScriptURL(scriptSrc);
				}
				script.setAttribute('src', scriptSrc);
				// Propagate CSP nonce to dynamically created script tag.
				const { cspNonce } = moduleManager.getConfig().getOptionsLiteral();
				if (cspNonce) {
					script.setAttribute('nonce', cspNonce);
				}
				document.getElementsByTagName('head')[0].appendChild(script);
			}
		}
	}
	function canUseEval(moduleManager) {
		const { trustedTypesPolicy } = moduleManager.getConfig().getOptionsLiteral();
		try {
			const func = (trustedTypesPolicy
				? self.eval(trustedTypesPolicy.createScript('', 'true')) // CodeQL [SM01632] the loader is responsible with loading code, fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
				: new Function('true') // CodeQL [SM01632] the loader is responsible with loading code, fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
			);
			func.call(self);
			return true;
		}
		catch (err) {
			return false;
		}
	}
	class WorkerScriptLoader {
		constructor() {
			this._cachedCanUseEval = null;
		}
		_canUseEval(moduleManager) {
			if (this._cachedCanUseEval === null) {
				this._cachedCanUseEval = canUseEval(moduleManager);
			}
			return this._cachedCanUseEval;
		}
		load(moduleManager, scriptSrc, callback, errorback) {
			if (/^node\|/.test(scriptSrc)) {
				const opts = moduleManager.getConfig().getOptionsLiteral();
				const nodeRequire = ensureRecordedNodeRequire(moduleManager.getRecorder(), (opts.nodeRequire || AMDLoader.global.nodeRequire));
				const pieces = scriptSrc.split('|');
				let moduleExports = null;
				try {
					moduleExports = nodeRequire(pieces[1]);
				}
				catch (err) {
					errorback(err);
					return;
				}
				moduleManager.enqueueDefineAnonymousModule([], function () { return moduleExports; });
				callback();
			}
			else {
				const { trustedTypesPolicy } = moduleManager.getConfig().getOptionsLiteral();
				const isCrossOrigin = (/^((http:)|(https:)|(file:))/.test(scriptSrc) && scriptSrc.substring(0, self.origin.length) !== self.origin);
				if (!isCrossOrigin && this._canUseEval(moduleManager)) {
					// use `fetch` if possible because `importScripts`
					// is synchronous and can lead to deadlocks on Safari
					fetch(scriptSrc).then((response) => {
						if (response.status !== 200) {
							throw new Error(response.statusText);
						}
						return response.text();
					}).then((text) => {
						text = `${text}\n//# sourceURL=${scriptSrc}`;
						const func = (trustedTypesPolicy
							? self.eval(trustedTypesPolicy.createScript('', text)) // CodeQL [SM01632] the loader is responsible with loading code, fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
							: new Function(text) // CodeQL [SM01632] the loader is responsible with loading code, fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
						);
						func.call(self);
						callback();
					}).then(undefined, errorback);
					return;
				}
				try {
					if (trustedTypesPolicy) {
						scriptSrc = trustedTypesPolicy.createScriptURL(scriptSrc);
					}
					importScripts(scriptSrc);
					callback();
				}
				catch (e) {
					errorback(e);
				}
			}
		}
	}
	class NodeScriptLoader {
		constructor(env) {
			this._env = env;
			this._didInitialize = false;
			this._didPatchNodeRequire = false;
		}
		_init(nodeRequire) {
			if (this._didInitialize) {
				return;
			}
			this._didInitialize = true;
			// capture node modules
			this._fs = nodeRequire('fs');
			this._vm = nodeRequire('vm');
			this._path = nodeRequire('path');
			this._crypto = nodeRequire('crypto');
		}
		// patch require-function of nodejs such that we can manually create a script
		// from cached data. this is done by overriding the `Module._compile` function
		_initNodeRequire(nodeRequire, moduleManager) {
			// It is important to check for `nodeCachedData` first and then set `_didPatchNodeRequire`.
			// That's because `nodeCachedData` is set _after_ calling this for the first time...
			const { nodeCachedData } = moduleManager.getConfig().getOptionsLiteral();
			if (!nodeCachedData) {
				return;
			}
			if (this._didPatchNodeRequire) {
				return;
			}
			this._didPatchNodeRequire = true;
			const that = this;
			const Module = nodeRequire('module');
			function makeRequireFunction(mod) {
				const Module = mod.constructor;
				let require = function require(path) {
					try {
						return mod.require(path);
					}
					finally {
						// nothing
					}
				};
				require.resolve = function resolve(request, options) {
					return Module._resolveFilename(request, mod, false, options);
				};
				require.resolve.paths = function paths(request) {
					return Module._resolveLookupPaths(request, mod);
				};
				require.main = process.mainModule;
				require.extensions = Module._extensions;
				require.cache = Module._cache;
				return require;
			}
			Module.prototype._compile = function (content, filename) {
				// remove shebang and create wrapper function
				const scriptSource = Module.wrap(content.replace(/^#!.*/, ''));
				// create script
				const recorder = moduleManager.getRecorder();
				const cachedDataPath = that._getCachedDataPath(nodeCachedData, filename);
				const options = { filename };
				let hashData;
				try {
					const data = that._fs.readFileSync(cachedDataPath);
					hashData = data.slice(0, 16);
					options.cachedData = data.slice(16);
					recorder.record(60 /* LoaderEventType.CachedDataFound */, cachedDataPath);
				}
				catch (_e) {
					recorder.record(61 /* LoaderEventType.CachedDataMissed */, cachedDataPath);
				}
				const script = new that._vm.Script(scriptSource, options);
				const compileWrapper = script.runInThisContext(options);
				// run script
				const dirname = that._path.dirname(filename);
				const require = makeRequireFunction(this);
				const args = [this.exports, require, this, filename, dirname, process, _commonjsGlobal, Buffer];
				const result = compileWrapper.apply(this.exports, args);
				// cached data aftermath
				that._handleCachedData(script, scriptSource, cachedDataPath, !options.cachedData, moduleManager);
				that._verifyCachedData(script, scriptSource, cachedDataPath, hashData, moduleManager);
				return result;
			};
		}
		load(moduleManager, scriptSrc, callback, errorback) {
			const opts = moduleManager.getConfig().getOptionsLiteral();
			const nodeRequire = ensureRecordedNodeRequire(moduleManager.getRecorder(), (opts.nodeRequire || AMDLoader.global.nodeRequire));
			const nodeInstrumenter = (opts.nodeInstrumenter || function (c) { return c; });
			this._init(nodeRequire);
			this._initNodeRequire(nodeRequire, moduleManager);
			let recorder = moduleManager.getRecorder();
			if (/^node\|/.test(scriptSrc)) {
				let pieces = scriptSrc.split('|');
				let moduleExports = null;
				try {
					moduleExports = nodeRequire(pieces[1]);
				}
				catch (err) {
					errorback(err);
					return;
				}
				moduleManager.enqueueDefineAnonymousModule([], () => moduleExports);
				callback();
			}
			else {
				scriptSrc = AMDLoader.Utilities.fileUriToFilePath(this._env.isWindows, scriptSrc);
				const normalizedScriptSrc = this._path.normalize(scriptSrc);
				const vmScriptPathOrUri = this._getElectronRendererScriptPathOrUri(normalizedScriptSrc);
				const wantsCachedData = Boolean(opts.nodeCachedData);
				const cachedDataPath = wantsCachedData ? this._getCachedDataPath(opts.nodeCachedData, scriptSrc) : undefined;
				this._readSourceAndCachedData(normalizedScriptSrc, cachedDataPath, recorder, (err, data, cachedData, hashData) => {
					if (err) {
						errorback(err);
						return;
					}
					let scriptSource;
					if (data.charCodeAt(0) === NodeScriptLoader._BOM) {
						scriptSource = NodeScriptLoader._PREFIX + data.substring(1) + NodeScriptLoader._SUFFIX;
					}
					else {
						scriptSource = NodeScriptLoader._PREFIX + data + NodeScriptLoader._SUFFIX;
					}
					scriptSource = nodeInstrumenter(scriptSource, normalizedScriptSrc);
					const scriptOpts = { filename: vmScriptPathOrUri, cachedData };
					const script = this._createAndEvalScript(moduleManager, scriptSource, scriptOpts, callback, errorback);
					this._handleCachedData(script, scriptSource, cachedDataPath, wantsCachedData && !cachedData, moduleManager);
					this._verifyCachedData(script, scriptSource, cachedDataPath, hashData, moduleManager);
				});
			}
		}
		_createAndEvalScript(moduleManager, contents, options, callback, errorback) {
			const recorder = moduleManager.getRecorder();
			recorder.record(31 /* LoaderEventType.NodeBeginEvaluatingScript */, options.filename);
			const script = new this._vm.Script(contents, options);
			const ret = script.runInThisContext(options);
			const globalDefineFunc = moduleManager.getGlobalAMDDefineFunc();
			let receivedDefineCall = false;
			const localDefineFunc = function () {
				receivedDefineCall = true;
				return globalDefineFunc.apply(null, arguments);
			};
			localDefineFunc.amd = globalDefineFunc.amd;
			ret.call(AMDLoader.global, moduleManager.getGlobalAMDRequireFunc(), localDefineFunc, options.filename, this._path.dirname(options.filename));
			recorder.record(32 /* LoaderEventType.NodeEndEvaluatingScript */, options.filename);
			if (receivedDefineCall) {
				callback();
			}
			else {
				errorback(new Error(`Didn't receive define call in ${options.filename}!`));
			}
			return script;
		}
		_getElectronRendererScriptPathOrUri(path) {
			if (!this._env.isElectronRenderer) {
				return path;
			}
			let driveLetterMatch = path.match(/^([a-z])\:(.*)/i);
			if (driveLetterMatch) {
				// windows
				return `file:///${(driveLetterMatch[1].toUpperCase() + ':' + driveLetterMatch[2]).replace(/\\/g, '/')}`;
			}
			else {
				// nix
				return `file://${path}`;
			}
		}
		_getCachedDataPath(config, filename) {
			const hash = this._crypto.createHash('md5').update(filename, 'utf8').update(config.seed, 'utf8').update(process.arch, '').digest('hex');
			const basename = this._path.basename(filename).replace(/\.js$/, '');
			return this._path.join(config.path, `${basename}-${hash}.code`);
		}
		_handleCachedData(script, scriptSource, cachedDataPath, createCachedData, moduleManager) {
			if (script.cachedDataRejected) {
				// cached data got rejected -> delete and re-create
				this._fs.unlink(cachedDataPath, err => {
					moduleManager.getRecorder().record(62 /* LoaderEventType.CachedDataRejected */, cachedDataPath);
					this._createAndWriteCachedData(script, scriptSource, cachedDataPath, moduleManager);
					if (err) {
						moduleManager.getConfig().onError(err);
					}
				});
			}
			else if (createCachedData) {
				// no cached data, but wanted
				this._createAndWriteCachedData(script, scriptSource, cachedDataPath, moduleManager);
			}
		}
		// Cached data format: | SOURCE_HASH | V8_CACHED_DATA |
		// -SOURCE_HASH is the md5 hash of the JS source (always 16 bytes)
		// -V8_CACHED_DATA is what v8 produces
		_createAndWriteCachedData(script, scriptSource, cachedDataPath, moduleManager) {
			let timeout = Math.ceil(moduleManager.getConfig().getOptionsLiteral().nodeCachedData.writeDelay * (1 + Math.random()));
			let lastSize = -1;
			let iteration = 0;
			let hashData = undefined;
			const createLoop = () => {
				setTimeout(() => {
					if (!hashData) {
						hashData = this._crypto.createHash('md5').update(scriptSource, 'utf8').digest();
					}
					const cachedData = script.createCachedData();
					if (cachedData.length === 0 || cachedData.length === lastSize || iteration >= 5) {
						// done
						return;
					}
					if (cachedData.length < lastSize) {
						// less data than before: skip, try again next round
						createLoop();
						return;
					}
					lastSize = cachedData.length;
					this._fs.writeFile(cachedDataPath, Buffer.concat([hashData, cachedData]), err => {
						if (err) {
							moduleManager.getConfig().onError(err);
						}
						moduleManager.getRecorder().record(63 /* LoaderEventType.CachedDataCreated */, cachedDataPath);
						createLoop();
					});
				}, timeout * (Math.pow(4, iteration++)));
			};
			// with some delay (`timeout`) create cached data
			// and repeat that (with backoff delay) until the
			// data seems to be not changing anymore
			createLoop();
		}
		_readSourceAndCachedData(sourcePath, cachedDataPath, recorder, callback) {
			if (!cachedDataPath) {
				// no cached data case
				this._fs.readFile(sourcePath, { encoding: 'utf8' }, callback);
			}
			else {
				// cached data case: read both files in parallel
				let source = undefined;
				let cachedData = undefined;
				let hashData = undefined;
				let steps = 2;
				const step = (err) => {
					if (err) {
						callback(err);
					}
					else if (--steps === 0) {
						callback(undefined, source, cachedData, hashData);
					}
				};
				this._fs.readFile(sourcePath, { encoding: 'utf8' }, (err, data) => {
					source = data;
					step(err);
				});
				this._fs.readFile(cachedDataPath, (err, data) => {
					if (!err && data && data.length > 0) {
						hashData = data.slice(0, 16);
						cachedData = data.slice(16);
						recorder.record(60 /* LoaderEventType.CachedDataFound */, cachedDataPath);
					}
					else {
						recorder.record(61 /* LoaderEventType.CachedDataMissed */, cachedDataPath);
					}
					step(); // ignored: cached data is optional
				});
			}
		}
		_verifyCachedData(script, scriptSource, cachedDataPath, hashData, moduleManager) {
			if (!hashData) {
				// nothing to do
				return;
			}
			if (script.cachedDataRejected) {
				// invalid anyways
				return;
			}
			setTimeout(() => {
				// check source hash - the contract is that file paths change when file content
				// change (e.g use the commit or version id as cache path). this check is
				// for violations of this contract.
				const hashDataNow = this._crypto.createHash('md5').update(scriptSource, 'utf8').digest();
				if (!hashData.equals(hashDataNow)) {
					moduleManager.getConfig().onError(new Error(`FAILED TO VERIFY CACHED DATA, deleting stale '${cachedDataPath}' now, but a RESTART IS REQUIRED`));
					this._fs.unlink(cachedDataPath, err => {
						if (err) {
							moduleManager.getConfig().onError(err);
						}
					});
				}
			}, Math.ceil(5000 * (1 + Math.random())));
		}
	}
	NodeScriptLoader._BOM = 0xFEFF;
	NodeScriptLoader._PREFIX = '(function (require, define, __filename, __dirname) { ';
	NodeScriptLoader._SUFFIX = '\n});';
	function ensureRecordedNodeRequire(recorder, _nodeRequire) {
		if (_nodeRequire.__$__isRecorded) {
			// it is already recorded
			return _nodeRequire;
		}
		const nodeRequire = function nodeRequire(what) {
			recorder.record(33 /* LoaderEventType.NodeBeginNativeRequire */, what);
			try {
				return _nodeRequire(what);
			}
			finally {
				recorder.record(34 /* LoaderEventType.NodeEndNativeRequire */, what);
			}
		};
		nodeRequire.__$__isRecorded = true;
		return nodeRequire;
	}
	AMDLoader.ensureRecordedNodeRequire = ensureRecordedNodeRequire;
	function createScriptLoader(env) {
		return new OnlyOnceScriptLoader(env);
	}
	AMDLoader.createScriptLoader = createScriptLoader;
})(AMDLoader || (AMDLoader = {}));
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var AMDLoader;
(function (AMDLoader) {
	// ------------------------------------------------------------------------
	// ModuleIdResolver
	class ModuleIdResolver {
		constructor(fromModuleId) {
			let lastSlash = fromModuleId.lastIndexOf('/');
			if (lastSlash !== -1) {
				this.fromModulePath = fromModuleId.substr(0, lastSlash + 1);
			}
			else {
				this.fromModulePath = '';
			}
		}
		/**
		 * Normalize 'a/../name' to 'name', etc.
		 */
		static _normalizeModuleId(moduleId) {
			let r = moduleId, pattern;
			// replace /./ => /
			pattern = /\/\.\//;
			while (pattern.test(r)) {
				r = r.replace(pattern, '/');
			}
			// replace ^./ => nothing
			r = r.replace(/^\.\//g, '');
			// replace /aa/../ => / (BUT IGNORE /../../)
			pattern = /\/(([^\/])|([^\/][^\/\.])|([^\/\.][^\/])|([^\/][^\/][^\/]+))\/\.\.\//;
			while (pattern.test(r)) {
				r = r.replace(pattern, '/');
			}
			// replace ^aa/../ => nothing (BUT IGNORE ../../)
			r = r.replace(/^(([^\/])|([^\/][^\/\.])|([^\/\.][^\/])|([^\/][^\/][^\/]+))\/\.\.\//, '');
			return r;
		}
		/**
		 * Resolve relative module ids
		 */
		resolveModule(moduleId) {
			let result = moduleId;
			if (!AMDLoader.Utilities.isAbsolutePath(result)) {
				if (AMDLoader.Utilities.startsWith(result, './') || AMDLoader.Utilities.startsWith(result, '../')) {
					result = ModuleIdResolver._normalizeModuleId(this.fromModulePath + result);
				}
			}
			return result;
		}
	}
	ModuleIdResolver.ROOT = new ModuleIdResolver('');
	AMDLoader.ModuleIdResolver = ModuleIdResolver;
	// ------------------------------------------------------------------------
	// Module
	class Module {
		constructor(id, strId, dependencies, callback, errorback, moduleIdResolver) {
			this.id = id;
			this.strId = strId;
			this.dependencies = dependencies;
			this._callback = callback;
			this._errorback = errorback;
			this.moduleIdResolver = moduleIdResolver;
			this.exports = {};
			this.error = null;
			this.exportsPassedIn = false;
			this.unresolvedDependenciesCount = this.dependencies.length;
			this._isComplete = false;
		}
		static _safeInvokeFunction(callback, args) {
			try {
				return {
					returnedValue: callback.apply(AMDLoader.global, args),
					producedError: null
				};
			}
			catch (e) {
				return {
					returnedValue: null,
					producedError: e
				};
			}
		}
		static _invokeFactory(config, strModuleId, callback, dependenciesValues) {
			if (!config.shouldInvokeFactory(strModuleId)) {
				return {
					returnedValue: null,
					producedError: null
				};
			}
			if (config.shouldCatchError()) {
				return this._safeInvokeFunction(callback, dependenciesValues);
			}
			return {
				returnedValue: callback.apply(AMDLoader.global, dependenciesValues),
				producedError: null
			};
		}
		complete(recorder, config, dependenciesValues, inversedependenciesProvider) {
			this._isComplete = true;
			let producedError = null;
			if (this._callback) {
				if (typeof this._callback === 'function') {
					recorder.record(21 /* LoaderEventType.BeginInvokeFactory */, this.strId);
					let r = Module._invokeFactory(config, this.strId, this._callback, dependenciesValues);
					producedError = r.producedError;
					recorder.record(22 /* LoaderEventType.EndInvokeFactory */, this.strId);
					if (!producedError && typeof r.returnedValue !== 'undefined' && (!this.exportsPassedIn || AMDLoader.Utilities.isEmpty(this.exports))) {
						this.exports = r.returnedValue;
					}
				}
				else {
					this.exports = this._callback;
				}
			}
			if (producedError) {
				let err = AMDLoader.ensureError(producedError);
				err.phase = 'factory';
				err.moduleId = this.strId;
				err.neededBy = inversedependenciesProvider(this.id);
				this.error = err;
				config.onError(err);
			}
			this.dependencies = null;
			this._callback = null;
			this._errorback = null;
			this.moduleIdResolver = null;
		}
		/**
		 * One of the direct dependencies or a transitive dependency has failed to load.
		 */
		onDependencyError(err) {
			this._isComplete = true;
			this.error = err;
			if (this._errorback) {
				this._errorback(err);
				return true;
			}
			return false;
		}
		/**
		 * Is the current module complete?
		 */
		isComplete() {
			return this._isComplete;
		}
	}
	AMDLoader.Module = Module;
	class ModuleIdProvider {
		constructor() {
			this._nextId = 0;
			this._strModuleIdToIntModuleId = new Map();
			this._intModuleIdToStrModuleId = [];
			// Ensure values 0, 1, 2 are assigned accordingly with ModuleId
			this.getModuleId('exports');
			this.getModuleId('module');
			this.getModuleId('require');
		}
		getMaxModuleId() {
			return this._nextId;
		}
		getModuleId(strModuleId) {
			let id = this._strModuleIdToIntModuleId.get(strModuleId);
			if (typeof id === 'undefined') {
				id = this._nextId++;
				this._strModuleIdToIntModuleId.set(strModuleId, id);
				this._intModuleIdToStrModuleId[id] = strModuleId;
			}
			return id;
		}
		getStrModuleId(moduleId) {
			return this._intModuleIdToStrModuleId[moduleId];
		}
	}
	class RegularDependency {
		constructor(id) {
			this.id = id;
		}
	}
	RegularDependency.EXPORTS = new RegularDependency(0 /* ModuleId.EXPORTS */);
	RegularDependency.MODULE = new RegularDependency(1 /* ModuleId.MODULE */);
	RegularDependency.REQUIRE = new RegularDependency(2 /* ModuleId.REQUIRE */);
	AMDLoader.RegularDependency = RegularDependency;
	class PluginDependency {
		constructor(id, pluginId, pluginParam) {
			this.id = id;
			this.pluginId = pluginId;
			this.pluginParam = pluginParam;
		}
	}
	AMDLoader.PluginDependency = PluginDependency;
	class ModuleManager {
		constructor(env, scriptLoader, defineFunc, requireFunc, loaderAvailableTimestamp = 0) {
			this._env = env;
			this._scriptLoader = scriptLoader;
			this._loaderAvailableTimestamp = loaderAvailableTimestamp;
			this._defineFunc = defineFunc;
			this._requireFunc = requireFunc;
			this._moduleIdProvider = new ModuleIdProvider();
			this._config = new AMDLoader.Configuration(this._env);
			this._hasDependencyCycle = false;
			this._modules2 = [];
			this._knownModules2 = [];
			this._inverseDependencies2 = [];
			this._inversePluginDependencies2 = new Map();
			this._currentAnonymousDefineCall = null;
			this._recorder = null;
			this._buildInfoPath = [];
			this._buildInfoDefineStack = [];
			this._buildInfoDependencies = [];
			this._requireFunc.moduleManager = this;
		}
		reset() {
			return new ModuleManager(this._env, this._scriptLoader, this._defineFunc, this._requireFunc, this._loaderAvailableTimestamp);
		}
		getGlobalAMDDefineFunc() {
			return this._defineFunc;
		}
		getGlobalAMDRequireFunc() {
			return this._requireFunc;
		}
		static _findRelevantLocationInStack(needle, stack) {
			let normalize = (str) => str.replace(/\\/g, '/');
			let normalizedPath = normalize(needle);
			let stackPieces = stack.split(/\n/);
			for (let i = 0; i < stackPieces.length; i++) {
				let m = stackPieces[i].match(/(.*):(\d+):(\d+)\)?$/);
				if (m) {
					let stackPath = m[1];
					let stackLine = m[2];
					let stackColumn = m[3];
					let trimPathOffset = Math.max(stackPath.lastIndexOf(' ') + 1, stackPath.lastIndexOf('(') + 1);
					stackPath = stackPath.substr(trimPathOffset);
					stackPath = normalize(stackPath);
					if (stackPath === normalizedPath) {
						let r = {
							line: parseInt(stackLine, 10),
							col: parseInt(stackColumn, 10)
						};
						if (r.line === 1) {
							r.col -= '(function (require, define, __filename, __dirname) { '.length;
						}
						return r;
					}
				}
			}
			throw new Error('Could not correlate define call site for needle ' + needle);
		}
		getBuildInfo() {
			if (!this._config.isBuild()) {
				return null;
			}
			let result = [], resultLen = 0;
			for (let i = 0, len = this._modules2.length; i < len; i++) {
				let m = this._modules2[i];
				if (!m) {
					continue;
				}
				let location = this._buildInfoPath[m.id] || null;
				let defineStack = this._buildInfoDefineStack[m.id] || null;
				let dependencies = this._buildInfoDependencies[m.id];
				result[resultLen++] = {
					id: m.strId,
					path: location,
					defineLocation: (location && defineStack ? ModuleManager._findRelevantLocationInStack(location, defineStack) : null),
					dependencies: dependencies,
					shim: null,
					exports: m.exports
				};
			}
			return result;
		}
		getRecorder() {
			if (!this._recorder) {
				if (this._config.shouldRecordStats()) {
					this._recorder = new AMDLoader.LoaderEventRecorder(this._loaderAvailableTimestamp);
				}
				else {
					this._recorder = AMDLoader.NullLoaderEventRecorder.INSTANCE;
				}
			}
			return this._recorder;
		}
		getLoaderEvents() {
			return this.getRecorder().getEvents();
		}
		/**
		 * Defines an anonymous module (without an id). Its name will be resolved as we receive a callback from the scriptLoader.
		 * @param dependencies @see defineModule
		 * @param callback @see defineModule
		 */
		enqueueDefineAnonymousModule(dependencies, callback) {
			if (this._currentAnonymousDefineCall !== null) {
				throw new Error('Can only have one anonymous define call per script file');
			}
			let stack = null;
			if (this._config.isBuild()) {
				stack = new Error('StackLocation').stack || null;
			}
			this._currentAnonymousDefineCall = {
				stack: stack,
				dependencies: dependencies,
				callback: callback
			};
		}
		/**
		 * Creates a module and stores it in _modules. The manager will immediately begin resolving its dependencies.
		 * @param strModuleId An unique and absolute id of the module. This must not collide with another module's id
		 * @param dependencies An array with the dependencies of the module. Special keys are: "require", "exports" and "module"
		 * @param callback if callback is a function, it will be called with the resolved dependencies. if callback is an object, it will be considered as the exports of the module.
		 */
		defineModule(strModuleId, dependencies, callback, errorback, stack, moduleIdResolver = new ModuleIdResolver(strModuleId)) {
			let moduleId = this._moduleIdProvider.getModuleId(strModuleId);
			if (this._modules2[moduleId]) {
				if (!this._config.isDuplicateMessageIgnoredFor(strModuleId)) {
					console.warn('Duplicate definition of module \'' + strModuleId + '\'');
				}
				// Super important! Completely ignore duplicate module definition
				return;
			}
			let m = new Module(moduleId, strModuleId, this._normalizeDependencies(dependencies, moduleIdResolver), callback, errorback, moduleIdResolver);
			this._modules2[moduleId] = m;
			if (this._config.isBuild()) {
				this._buildInfoDefineStack[moduleId] = stack;
				this._buildInfoDependencies[moduleId] = (m.dependencies || []).map(dep => this._moduleIdProvider.getStrModuleId(dep.id));
			}
			// Resolving of dependencies is immediate (not in a timeout). If there's a need to support a packer that concatenates in an
			// unordered manner, in order to finish processing the file, execute the following method in a timeout
			this._resolve(m);
		}
		_normalizeDependency(dependency, moduleIdResolver) {
			if (dependency === 'exports') {
				return RegularDependency.EXPORTS;
			}
			if (dependency === 'module') {
				return RegularDependency.MODULE;
			}
			if (dependency === 'require') {
				return RegularDependency.REQUIRE;
			}
			// Normalize dependency and then request it from the manager
			let bangIndex = dependency.indexOf('!');
			if (bangIndex >= 0) {
				let strPluginId = moduleIdResolver.resolveModule(dependency.substr(0, bangIndex));
				let pluginParam = moduleIdResolver.resolveModule(dependency.substr(bangIndex + 1));
				let dependencyId = this._moduleIdProvider.getModuleId(strPluginId + '!' + pluginParam);
				let pluginId = this._moduleIdProvider.getModuleId(strPluginId);
				return new PluginDependency(dependencyId, pluginId, pluginParam);
			}
			return new RegularDependency(this._moduleIdProvider.getModuleId(moduleIdResolver.resolveModule(dependency)));
		}
		_normalizeDependencies(dependencies, moduleIdResolver) {
			let result = [], resultLen = 0;
			for (let i = 0, len = dependencies.length; i < len; i++) {
				result[resultLen++] = this._normalizeDependency(dependencies[i], moduleIdResolver);
			}
			return result;
		}
		_relativeRequire(moduleIdResolver, dependencies, callback, errorback) {
			if (typeof dependencies === 'string') {
				return this.synchronousRequire(dependencies, moduleIdResolver);
			}
			this.defineModule(AMDLoader.Utilities.generateAnonymousModule(), dependencies, callback, errorback, null, moduleIdResolver);
		}
		/**
		 * Require synchronously a module by its absolute id. If the module is not loaded, an exception will be thrown.
		 * @param id The unique and absolute id of the required module
		 * @return The exports of module 'id'
		 */
		synchronousRequire(_strModuleId, moduleIdResolver = new ModuleIdResolver(_strModuleId)) {
			let dependency = this._normalizeDependency(_strModuleId, moduleIdResolver);
			let m = this._modules2[dependency.id];
			if (!m) {
				throw new Error('Check dependency list! Synchronous require cannot resolve module \'' + _strModuleId + '\'. This is the first mention of this module!');
			}
			if (!m.isComplete()) {
				throw new Error('Check dependency list! Synchronous require cannot resolve module \'' + _strModuleId + '\'. This module has not been resolved completely yet.');
			}
			if (m.error) {
				throw m.error;
			}
			return m.exports;
		}
		configure(params, shouldOverwrite) {
			let oldShouldRecordStats = this._config.shouldRecordStats();
			if (shouldOverwrite) {
				this._config = new AMDLoader.Configuration(this._env, params);
			}
			else {
				this._config = this._config.cloneAndMerge(params);
			}
			if (this._config.shouldRecordStats() && !oldShouldRecordStats) {
				this._recorder = null;
			}
		}
		getConfig() {
			return this._config;
		}
		/**
		 * Callback from the scriptLoader when a module has been loaded.
		 * This means its code is available and has been executed.
		 */
		_onLoad(moduleId) {
			if (this._currentAnonymousDefineCall !== null) {
				let defineCall = this._currentAnonymousDefineCall;
				this._currentAnonymousDefineCall = null;
				// Hit an anonymous define call
				this.defineModule(this._moduleIdProvider.getStrModuleId(moduleId), defineCall.dependencies, defineCall.callback, null, defineCall.stack);
			}
		}
		_createLoadError(moduleId, _err) {
			let strModuleId = this._moduleIdProvider.getStrModuleId(moduleId);
			let neededBy = (this._inverseDependencies2[moduleId] || []).map((intModuleId) => this._moduleIdProvider.getStrModuleId(intModuleId));
			const err = AMDLoader.ensureError(_err);
			err.phase = 'loading';
			err.moduleId = strModuleId;
			err.neededBy = neededBy;
			return err;
		}
		/**
		 * Callback from the scriptLoader when a module hasn't been loaded.
		 * This means that the script was not found (e.g. 404) or there was an error in the script.
		 */
		_onLoadError(moduleId, err) {
			const error = this._createLoadError(moduleId, err);
			if (!this._modules2[moduleId]) {
				this._modules2[moduleId] = new Module(moduleId, this._moduleIdProvider.getStrModuleId(moduleId), [], () => { }, null, null);
			}
			// Find any 'local' error handlers, walk the entire chain of inverse dependencies if necessary.
			let seenModuleId = [];
			for (let i = 0, len = this._moduleIdProvider.getMaxModuleId(); i < len; i++) {
				seenModuleId[i] = false;
			}
			let someoneNotified = false;
			let queue = [];
			queue.push(moduleId);
			seenModuleId[moduleId] = true;
			while (queue.length > 0) {
				let queueElement = queue.shift();
				let m = this._modules2[queueElement];
				if (m) {
					someoneNotified = m.onDependencyError(error) || someoneNotified;
				}
				let inverseDeps = this._inverseDependencies2[queueElement];
				if (inverseDeps) {
					for (let i = 0, len = inverseDeps.length; i < len; i++) {
						let inverseDep = inverseDeps[i];
						if (!seenModuleId[inverseDep]) {
							queue.push(inverseDep);
							seenModuleId[inverseDep] = true;
						}
					}
				}
			}
			if (!someoneNotified) {
				this._config.onError(error);
			}
		}
		/**
		 * Walks (recursively) the dependencies of 'from' in search of 'to'.
		 * Returns true if there is such a path or false otherwise.
		 * @param from Module id to start at
		 * @param to Module id to look for
		 */
		_hasDependencyPath(fromId, toId) {
			let from = this._modules2[fromId];
			if (!from) {
				return false;
			}
			let inQueue = [];
			for (let i = 0, len = this._moduleIdProvider.getMaxModuleId(); i < len; i++) {
				inQueue[i] = false;
			}
			let queue = [];
			// Insert 'from' in queue
			queue.push(from);
			inQueue[fromId] = true;
			while (queue.length > 0) {
				// Pop first inserted element of queue
				let element = queue.shift();
				let dependencies = element.dependencies;
				if (dependencies) {
					// Walk the element's dependencies
					for (let i = 0, len = dependencies.length; i < len; i++) {
						let dependency = dependencies[i];
						if (dependency.id === toId) {
							// There is a path to 'to'
							return true;
						}
						let dependencyModule = this._modules2[dependency.id];
						if (dependencyModule && !inQueue[dependency.id]) {
							// Insert 'dependency' in queue
							inQueue[dependency.id] = true;
							queue.push(dependencyModule);
						}
					}
				}
			}
			// There is no path to 'to'
			return false;
		}
		/**
		 * Walks (recursively) the dependencies of 'from' in search of 'to'.
		 * Returns cycle as array.
		 * @param from Module id to start at
		 * @param to Module id to look for
		 */
		_findCyclePath(fromId, toId, depth) {
			if (fromId === toId || depth === 50) {
				return [fromId];
			}
			let from = this._modules2[fromId];
			if (!from) {
				return null;
			}
			// Walk the element's dependencies
			let dependencies = from.dependencies;
			if (dependencies) {
				for (let i = 0, len = dependencies.length; i < len; i++) {
					let path = this._findCyclePath(dependencies[i].id, toId, depth + 1);
					if (path !== null) {
						path.push(fromId);
						return path;
					}
				}
			}
			return null;
		}
		/**
		 * Create the local 'require' that is passed into modules
		 */
		_createRequire(moduleIdResolver) {
			let result = ((dependencies, callback, errorback) => {
				return this._relativeRequire(moduleIdResolver, dependencies, callback, errorback);
			});
			result.toUrl = (id) => {
				return this._config.requireToUrl(moduleIdResolver.resolveModule(id));
			};
			result.getStats = () => {
				return this.getLoaderEvents();
			};
			result.hasDependencyCycle = () => {
				return this._hasDependencyCycle;
			};
			result.config = (params, shouldOverwrite = false) => {
				this.configure(params, shouldOverwrite);
			};
			result.__$__nodeRequire = AMDLoader.global.nodeRequire;
			return result;
		}
		_loadModule(moduleId) {
			if (this._modules2[moduleId] || this._knownModules2[moduleId]) {
				// known module
				return;
			}
			this._knownModules2[moduleId] = true;
			let strModuleId = this._moduleIdProvider.getStrModuleId(moduleId);
			let paths = this._config.moduleIdToPaths(strModuleId);
			let scopedPackageRegex = /^@[^\/]+\/[^\/]+$/; // matches @scope/package-name
			if (this._env.isNode && (strModuleId.indexOf('/') === -1 || scopedPackageRegex.test(strModuleId))) {
				paths.push('node|' + strModuleId);
			}
			let lastPathIndex = -1;
			let loadNextPath = (err) => {
				lastPathIndex++;
				if (lastPathIndex >= paths.length) {
					// No more paths to try
					this._onLoadError(moduleId, err);
				}
				else {
					let currentPath = paths[lastPathIndex];
					let recorder = this.getRecorder();
					if (this._config.isBuild() && currentPath === 'empty:') {
						this._buildInfoPath[moduleId] = currentPath;
						this.defineModule(this._moduleIdProvider.getStrModuleId(moduleId), [], null, null, null);
						this._onLoad(moduleId);
						return;
					}
					recorder.record(10 /* LoaderEventType.BeginLoadingScript */, currentPath);
					this._scriptLoader.load(this, currentPath, () => {
						if (this._config.isBuild()) {
							this._buildInfoPath[moduleId] = currentPath;
						}
						recorder.record(11 /* LoaderEventType.EndLoadingScriptOK */, currentPath);
						this._onLoad(moduleId);
					}, (err) => {
						recorder.record(12 /* LoaderEventType.EndLoadingScriptError */, currentPath);
						loadNextPath(err);
					});
				}
			};
			loadNextPath(null);
		}
		/**
		 * Resolve a plugin dependency with the plugin loaded & complete
		 * @param module The module that has this dependency
		 * @param pluginDependency The semi-normalized dependency that appears in the module. e.g. 'vs/css!./mycssfile'. Only the plugin part (before !) is normalized
		 * @param plugin The plugin (what the plugin exports)
		 */
		_loadPluginDependency(plugin, pluginDependency) {
			if (this._modules2[pluginDependency.id] || this._knownModules2[pluginDependency.id]) {
				// known module
				return;
			}
			this._knownModules2[pluginDependency.id] = true;
			// Delegate the loading of the resource to the plugin
			let load = ((value) => {
				this.defineModule(this._moduleIdProvider.getStrModuleId(pluginDependency.id), [], value, null, null);
			});
			load.error = (err) => {
				this._config.onError(this._createLoadError(pluginDependency.id, err));
			};
			plugin.load(pluginDependency.pluginParam, this._createRequire(ModuleIdResolver.ROOT), load, this._config.getOptionsLiteral());
		}
		/**
		 * Examine the dependencies of module 'module' and resolve them as needed.
		 */
		_resolve(module) {
			let dependencies = module.dependencies;
			if (dependencies) {
				for (let i = 0, len = dependencies.length; i < len; i++) {
					let dependency = dependencies[i];
					if (dependency === RegularDependency.EXPORTS) {
						module.exportsPassedIn = true;
						module.unresolvedDependenciesCount--;
						continue;
					}
					if (dependency === RegularDependency.MODULE) {
						module.unresolvedDependenciesCount--;
						continue;
					}
					if (dependency === RegularDependency.REQUIRE) {
						module.unresolvedDependenciesCount--;
						continue;
					}
					let dependencyModule = this._modules2[dependency.id];
					if (dependencyModule && dependencyModule.isComplete()) {
						if (dependencyModule.error) {
							module.onDependencyError(dependencyModule.error);
							return;
						}
						module.unresolvedDependenciesCount--;
						continue;
					}
					if (this._hasDependencyPath(dependency.id, module.id)) {
						this._hasDependencyCycle = true;
						console.warn('There is a dependency cycle between \'' + this._moduleIdProvider.getStrModuleId(dependency.id) + '\' and \'' + this._moduleIdProvider.getStrModuleId(module.id) + '\'. The cyclic path follows:');
						let cyclePath = this._findCyclePath(dependency.id, module.id, 0) || [];
						cyclePath.reverse();
						cyclePath.push(dependency.id);
						console.warn(cyclePath.map(id => this._moduleIdProvider.getStrModuleId(id)).join(' => \n'));
						// Break the cycle
						module.unresolvedDependenciesCount--;
						continue;
					}
					// record inverse dependency
					this._inverseDependencies2[dependency.id] = this._inverseDependencies2[dependency.id] || [];
					this._inverseDependencies2[dependency.id].push(module.id);
					if (dependency instanceof PluginDependency) {
						let plugin = this._modules2[dependency.pluginId];
						if (plugin && plugin.isComplete()) {
							this._loadPluginDependency(plugin.exports, dependency);
							continue;
						}
						// Record dependency for when the plugin gets loaded
						let inversePluginDeps = this._inversePluginDependencies2.get(dependency.pluginId);
						if (!inversePluginDeps) {
							inversePluginDeps = [];
							this._inversePluginDependencies2.set(dependency.pluginId, inversePluginDeps);
						}
						inversePluginDeps.push(dependency);
						this._loadModule(dependency.pluginId);
						continue;
					}
					this._loadModule(dependency.id);
				}
			}
			if (module.unresolvedDependenciesCount === 0) {
				this._onModuleComplete(module);
			}
		}
		_onModuleComplete(module) {
			let recorder = this.getRecorder();
			if (module.isComplete()) {
				// already done
				return;
			}
			let dependencies = module.dependencies;
			let dependenciesValues = [];
			if (dependencies) {
				for (let i = 0, len = dependencies.length; i < len; i++) {
					let dependency = dependencies[i];
					if (dependency === RegularDependency.EXPORTS) {
						dependenciesValues[i] = module.exports;
						continue;
					}
					if (dependency === RegularDependency.MODULE) {
						dependenciesValues[i] = {
							id: module.strId,
							config: () => {
								return this._config.getConfigForModule(module.strId);
							}
						};
						continue;
					}
					if (dependency === RegularDependency.REQUIRE) {
						dependenciesValues[i] = this._createRequire(module.moduleIdResolver);
						continue;
					}
					let dependencyModule = this._modules2[dependency.id];
					if (dependencyModule) {
						dependenciesValues[i] = dependencyModule.exports;
						continue;
					}
					dependenciesValues[i] = null;
				}
			}
			const inversedependenciesProvider = (moduleId) => {
				return (this._inverseDependencies2[moduleId] || []).map((intModuleId) => this._moduleIdProvider.getStrModuleId(intModuleId));
			};
			module.complete(recorder, this._config, dependenciesValues, inversedependenciesProvider);
			// Fetch and clear inverse dependencies
			let inverseDeps = this._inverseDependencies2[module.id];
			this._inverseDependencies2[module.id] = null;
			if (inverseDeps) {
				// Resolve one inverse dependency at a time, always
				// on the lookout for a completed module.
				for (let i = 0, len = inverseDeps.length; i < len; i++) {
					let inverseDependencyId = inverseDeps[i];
					let inverseDependency = this._modules2[inverseDependencyId];
					inverseDependency.unresolvedDependenciesCount--;
					if (inverseDependency.unresolvedDependenciesCount === 0) {
						this._onModuleComplete(inverseDependency);
					}
				}
			}
			let inversePluginDeps = this._inversePluginDependencies2.get(module.id);
			if (inversePluginDeps) {
				// This module is used as a plugin at least once
				// Fetch and clear these inverse plugin dependencies
				this._inversePluginDependencies2.delete(module.id);
				// Resolve plugin dependencies one at a time
				for (let i = 0, len = inversePluginDeps.length; i < len; i++) {
					this._loadPluginDependency(module.exports, inversePluginDeps[i]);
				}
			}
		}
	}
	AMDLoader.ModuleManager = ModuleManager;
})(AMDLoader || (AMDLoader = {}));
var define;
var AMDLoader;
(function (AMDLoader) {
	const env = new AMDLoader.Environment();
	let moduleManager = null;
	const DefineFunc = function (id, dependencies, callback) {
		if (typeof id !== 'string') {
			callback = dependencies;
			dependencies = id;
			id = null;
		}
		if (typeof dependencies !== 'object' || !Array.isArray(dependencies)) {
			callback = dependencies;
			dependencies = null;
		}
		if (!dependencies) {
			dependencies = ['require', 'exports', 'module'];
		}
		if (id) {
			moduleManager.defineModule(id, dependencies, callback, null, null);
		}
		else {
			moduleManager.enqueueDefineAnonymousModule(dependencies, callback);
		}
	};
	DefineFunc.amd = {
		jQuery: true
	};
	const _requireFunc_config = function (params, shouldOverwrite = false) {
		moduleManager.configure(params, shouldOverwrite);
	};
	const RequireFunc = function () {
		if (arguments.length === 1) {
			if ((arguments[0] instanceof Object) && !Array.isArray(arguments[0])) {
				_requireFunc_config(arguments[0]);
				return;
			}
			if (typeof arguments[0] === 'string') {
				return moduleManager.synchronousRequire(arguments[0]);
			}
		}
		if (arguments.length === 2 || arguments.length === 3) {
			if (Array.isArray(arguments[0])) {
				moduleManager.defineModule(AMDLoader.Utilities.generateAnonymousModule(), arguments[0], arguments[1], arguments[2], null);
				return;
			}
		}
		throw new Error('Unrecognized require call');
	};
	RequireFunc.config = _requireFunc_config;
	RequireFunc.getConfig = function () {
		return moduleManager.getConfig().getOptionsLiteral();
	};
	RequireFunc.reset = function () {
		moduleManager = moduleManager.reset();
	};
	RequireFunc.getBuildInfo = function () {
		return moduleManager.getBuildInfo();
	};
	RequireFunc.getStats = function () {
		return moduleManager.getLoaderEvents();
	};
	RequireFunc.define = DefineFunc;
	function init() {
		if (typeof AMDLoader.global.require !== 'undefined' || typeof require !== 'undefined') {
			const _nodeRequire = (AMDLoader.global.require || require);
			if (typeof _nodeRequire === 'function' && typeof _nodeRequire.resolve === 'function') {
				// re-expose node's require function
				const nodeRequire = AMDLoader.ensureRecordedNodeRequire(moduleManager.getRecorder(), _nodeRequire);
				AMDLoader.global.nodeRequire = nodeRequire;
				RequireFunc.nodeRequire = nodeRequire;
				RequireFunc.__$__nodeRequire = nodeRequire;
			}
		}
		if (env.isNode && !env.isElectronRenderer && !env.isElectronNodeIntegrationWebWorker) {
			module.exports = RequireFunc;
		}
		else {
			if (!env.isElectronRenderer) {
				AMDLoader.global.define = DefineFunc;
			}
			AMDLoader.global.require = RequireFunc;
		}
	}
	AMDLoader.init = init;
	if (typeof AMDLoader.global.define !== 'function' || !AMDLoader.global.define.amd) {
		moduleManager = new AMDLoader.ModuleManager(env, AMDLoader.createScriptLoader(env), DefineFunc, RequireFunc, AMDLoader.Utilities.getHighPerformanceTimestamp());
		// The global variable require can configure the loader
		if (typeof AMDLoader.global.require !== 'undefined' && typeof AMDLoader.global.require !== 'function') {
			RequireFunc.config(AMDLoader.global.require);
		}
		// This define is for the local closure defined in node in the case that the loader is concatenated
		define = function () {
			return DefineFunc.apply(null, arguments);
		};
		define.amd = DefineFunc.amd;
		if (typeof doNotInitLoader === 'undefined') {
			init();
		}
	}
})(AMDLoader || (AMDLoader = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[69/*vs/css*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = void 0;
    /**
     * Invoked by the loader at run-time
     *
     * @skipMangle
     */
    function load(name, req, load, config) {
        config = config || {};
        const cssConfig = (config['vs/css'] || {});
        if (cssConfig.disabled) {
            // the plugin is asked to not create any style sheets
            load({});
            return;
        }
        const cssUrl = req.toUrl(name + '.css');
        loadCSS(name, cssUrl, () => {
            load({});
        }, (err) => {
            if (typeof load.error === 'function') {
                load.error('Could not find ' + cssUrl + '.');
            }
        });
    }
    exports.load = load;
    function loadCSS(name, cssUrl, callback, errorback) {
        if (linkTagExists(name, cssUrl)) {
            callback();
            return;
        }
        createLinkTag(name, cssUrl, callback, errorback);
    }
    function linkTagExists(name, cssUrl) {
        // eslint-disable-next-line no-restricted-globals
        const links = window.document.getElementsByTagName('link');
        for (let i = 0, len = links.length; i < len; i++) {
            const nameAttr = links[i].getAttribute('data-name');
            const hrefAttr = links[i].getAttribute('href');
            if (nameAttr === name || hrefAttr === cssUrl) {
                return true;
            }
        }
        return false;
    }
    function createLinkTag(name, cssUrl, callback, errorback) {
        const linkNode = document.createElement('link');
        linkNode.setAttribute('rel', 'stylesheet');
        linkNode.setAttribute('type', 'text/css');
        linkNode.setAttribute('data-name', name);
        attachListeners(name, linkNode, callback, errorback);
        linkNode.setAttribute('href', cssUrl);
        // eslint-disable-next-line no-restricted-globals
        const head = window.document.head || window.document.getElementsByTagName('head')[0];
        head.appendChild(linkNode);
    }
    function attachListeners(name, linkNode, callback, errorback) {
        const unbind = () => {
            linkNode.removeEventListener('load', loadEventListener);
            linkNode.removeEventListener('error', errorEventListener);
        };
        const loadEventListener = (e) => {
            unbind();
            callback();
        };
        const errorEventListener = (e) => {
            unbind();
            errorback(e);
        };
        linkNode.addEventListener('load', loadEventListener);
        linkNode.addEventListener('error', errorEventListener);
    }
});
//# sourceMappingURL=css.js.map
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define("vs/nls",["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = exports.create = exports.setPseudoTranslation = exports.getConfiguredDefaultLocale = exports.localize2 = exports.localize = void 0;
    let isPseudo = (typeof document !== 'undefined' && document.location && document.location.hash.indexOf('pseudo=true') >= 0);
    const DEFAULT_TAG = 'i-default';
    function _format(message, args) {
        let result;
        if (args.length === 0) {
            result = message;
        }
        else {
            result = message.replace(/\{(\d+)\}/g, (match, rest) => {
                const index = rest[0];
                const arg = args[index];
                let result = match;
                if (typeof arg === 'string') {
                    result = arg;
                }
                else if (typeof arg === 'number' || typeof arg === 'boolean' || arg === void 0 || arg === null) {
                    result = String(arg);
                }
                return result;
            });
        }
        if (isPseudo) {
            // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
            result = '\uFF3B' + result.replace(/[aouei]/g, '$&$&') + '\uFF3D';
        }
        return result;
    }
    function findLanguageForModule(config, name) {
        let result = config[name];
        if (result) {
            return result;
        }
        result = config['*'];
        if (result) {
            return result;
        }
        return null;
    }
    function endWithSlash(path) {
        if (path.charAt(path.length - 1) === '/') {
            return path;
        }
        return path + '/';
    }
    async function getMessagesFromTranslationsService(translationServiceUrl, language, name) {
        const url = endWithSlash(translationServiceUrl) + endWithSlash(language) + 'vscode/' + endWithSlash(name);
        const res = await fetch(url);
        if (res.ok) {
            const messages = await res.json();
            return messages;
        }
        throw new Error(`${res.status} - ${res.statusText}`);
    }
    function createScopedLocalize(scope) {
        return function (idx, defaultValue) {
            const restArgs = Array.prototype.slice.call(arguments, 2);
            return _format(scope[idx], restArgs);
        };
    }
    function createScopedLocalize2(scope) {
        return (idx, defaultValue, ...args) => ({
            value: _format(scope[idx], args),
            original: _format(defaultValue, args)
        });
    }
    /**
     * @skipMangle
     */
    function localize(data, message, ...args) {
        return _format(message, args);
    }
    exports.localize = localize;
    /**
     * @skipMangle
     */
    function localize2(data, message, ...args) {
        const original = _format(message, args);
        return {
            value: original,
            original
        };
    }
    exports.localize2 = localize2;
    /**
     * @skipMangle
     */
    function getConfiguredDefaultLocale(_) {
        // This returns undefined because this implementation isn't used and is overwritten by the loader
        // when loaded.
        return undefined;
    }
    exports.getConfiguredDefaultLocale = getConfiguredDefaultLocale;
    /**
     * @skipMangle
     */
    function setPseudoTranslation(value) {
        isPseudo = value;
    }
    exports.setPseudoTranslation = setPseudoTranslation;
    /**
     * Invoked in a built product at run-time
     * @skipMangle
     */
    function create(key, data) {
        return {
            localize: createScopedLocalize(data[key]),
            localize2: createScopedLocalize2(data[key]),
            getConfiguredDefaultLocale: data.getConfiguredDefaultLocale ?? ((_) => undefined)
        };
    }
    exports.create = create;
    /**
     * Invoked by the loader at run-time
     * @skipMangle
     */
    function load(name, req, load, config) {
        const pluginConfig = config['vs/nls'] ?? {};
        if (!name || name.length === 0) {
            // TODO: We need to give back the mangled names here
            return load({
                localize: localize,
                localize2: localize2,
                getConfiguredDefaultLocale: () => pluginConfig.availableLanguages?.['*']
            });
        }
        const language = pluginConfig.availableLanguages ? findLanguageForModule(pluginConfig.availableLanguages, name) : null;
        const useDefaultLanguage = language === null || language === DEFAULT_TAG;
        let suffix = '.nls';
        if (!useDefaultLanguage) {
            suffix = suffix + '.' + language;
        }
        const messagesLoaded = (messages) => {
            if (Array.isArray(messages)) {
                messages.localize = createScopedLocalize(messages);
                messages.localize2 = createScopedLocalize2(messages);
            }
            else {
                messages.localize = createScopedLocalize(messages[name]);
                messages.localize2 = createScopedLocalize2(messages[name]);
            }
            messages.getConfiguredDefaultLocale = () => pluginConfig.availableLanguages?.['*'];
            load(messages);
        };
        if (typeof pluginConfig.loadBundle === 'function') {
            pluginConfig.loadBundle(name, language, (err, messages) => {
                // We have an error. Load the English default strings to not fail
                if (err) {
                    req([name + '.nls'], messagesLoaded);
                }
                else {
                    messagesLoaded(messages);
                }
            });
        }
        else if (pluginConfig.translationServiceUrl && !useDefaultLanguage) {
            (async () => {
                try {
                    const messages = await getMessagesFromTranslationsService(pluginConfig.translationServiceUrl, language, name);
                    return messagesLoaded(messages);
                }
                catch (err) {
                    // Language is already as generic as it gets, so require default messages
                    if (!language.includes('-')) {
                        console.error(err);
                        return req([name + '.nls'], messagesLoaded);
                    }
                    try {
                        // Since there is a dash, the language configured is a specific sub-language of the same generic language.
                        // Since we were unable to load the specific language, try to load the generic language. Ex. we failed to find a
                        // Swiss German (de-CH), so try to load the generic German (de) messages instead.
                        const genericLanguage = language.split('-')[0];
                        const messages = await getMessagesFromTranslationsService(pluginConfig.translationServiceUrl, genericLanguage, name);
                        // We got some messages, so we configure the configuration to use the generic language for this session.
                        pluginConfig.availableLanguages ??= {};
                        pluginConfig.availableLanguages['*'] = genericLanguage;
                        return messagesLoaded(messages);
                    }
                    catch (err) {
                        console.error(err);
                        return req([name + '.nls'], messagesLoaded);
                    }
                }
            })();
        }
        else {
            req([name + suffix], messagesLoaded, (err) => {
                if (suffix === '.nls') {
                    console.error('Failed trying to load default language strings', err);
                    return;
                }
                console.error(`Failed to load message bundle for language ${language}. Falling back to the default language:`, err);
                req([name + '.nls'], messagesLoaded);
            });
        }
    }
    exports.load = load;
});

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function () {
    const monacoEnvironment = globalThis.MonacoEnvironment;
    const monacoBaseUrl = monacoEnvironment && monacoEnvironment.baseUrl ? monacoEnvironment.baseUrl : '../../../';
    function createTrustedTypesPolicy(policyName, policyOptions) {
        if (monacoEnvironment?.createTrustedTypesPolicy) {
            try {
                return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
            }
            catch (err) {
                console.warn(err);
                return undefined;
            }
        }
        try {
            return self.trustedTypes?.createPolicy(policyName, policyOptions);
        }
        catch (err) {
            console.warn(err);
            return undefined;
        }
    }
    const trustedTypesPolicy = createTrustedTypesPolicy('amdLoader', {
        createScriptURL: value => value,
        createScript: (_, ...args) => {
            // workaround a chrome issue not allowing to create new functions
            // see https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
            const fnArgs = args.slice(0, -1).join(',');
            const fnBody = args.pop().toString();
            // Do not add a new line to fnBody, as this will confuse source maps.
            const body = `(function anonymous(${fnArgs}) { ${fnBody}\n})`;
            return body;
        }
    });
    function canUseEval() {
        try {
            const func = (trustedTypesPolicy
                ? globalThis.eval(trustedTypesPolicy.createScript('', 'true')) // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
                : new Function('true') // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
            );
            func.call(globalThis);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    function loadAMDLoader() {
        return new Promise((resolve, reject) => {
            if (typeof globalThis.define === 'function' && globalThis.define.amd) {
                return resolve();
            }
            const loaderSrc = monacoBaseUrl + 'vs/loader.js';
            const isCrossOrigin = (/^((http:)|(https:)|(file:))/.test(loaderSrc) && loaderSrc.substring(0, globalThis.origin.length) !== globalThis.origin);
            if (!isCrossOrigin && canUseEval()) {
                // use `fetch` if possible because `importScripts`
                // is synchronous and can lead to deadlocks on Safari
                fetch(loaderSrc).then((response) => {
                    if (response.status !== 200) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                }).then((text) => {
                    text = `${text}\n//# sourceURL=${loaderSrc}`;
                    const func = (trustedTypesPolicy
                        ? globalThis.eval(trustedTypesPolicy.createScript('', text)) // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
                        : new Function(text) // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
                    );
                    func.call(globalThis);
                    resolve();
                }).then(undefined, reject);
                return;
            }
            if (trustedTypesPolicy) {
                importScripts(trustedTypesPolicy.createScriptURL(loaderSrc));
            }
            else {
                importScripts(loaderSrc);
            }
            resolve();
        });
    }
    function configureAMDLoader() {
        require.config({
            baseUrl: monacoBaseUrl,
            catchError: true,
            trustedTypesPolicy,
            amdModulesPattern: /^vs\//
        });
    }
    function loadCode(moduleId) {
        loadAMDLoader().then(() => {
            configureAMDLoader();
            require([moduleId], function (ws) {
                setTimeout(function () {
                    const messageHandler = ws.create((msg, transfer) => {
                        globalThis.postMessage(msg, transfer);
                    }, null);
                    globalThis.onmessage = (e) => messageHandler.onmessage(e.data, e.ports);
                    while (beforeReadyMessages.length > 0) {
                        const e = beforeReadyMessages.shift();
                        messageHandler.onmessage(e.data, e.ports);
                    }
                }, 0);
            });
        });
    }
    // If the loader is already defined, configure it immediately
    // This helps in the bundled case, where we must load nls files
    // and they need a correct baseUrl to be loaded.
    if (typeof globalThis.define === 'function' && globalThis.define.amd) {
        configureAMDLoader();
    }
    let isFirstMessage = true;
    const beforeReadyMessages = [];
    globalThis.onmessage = (message) => {
        if (!isFirstMessage) {
            beforeReadyMessages.push(message);
            return;
        }
        isFirstMessage = false;
        loadCode(message.data);
    };
})();

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[9/*vs/base/common/arraysFind*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapFindFirst = exports.findMaxIdxBy = exports.findFirstMinBy = exports.findLastMaxBy = exports.findFirstMaxBy = exports.MonotonousArray = exports.findFirstIdxMonotonous = exports.findFirstIdxMonotonousOrArrLen = exports.findFirstMonotonous = exports.findLastIdxMonotonous = exports.findLastMonotonous = exports.findLastIdx = exports.findLast = void 0;
    function findLast(array, predicate, fromIdx) {
        const idx = findLastIdx(array, predicate);
        if (idx === -1) {
            return undefined;
        }
        return array[idx];
    }
    exports.findLast = findLast;
    function findLastIdx(array, predicate, fromIndex = array.length - 1) {
        for (let i = fromIndex; i >= 0; i--) {
            const element = array[i];
            if (predicate(element)) {
                return i;
            }
        }
        return -1;
    }
    exports.findLastIdx = findLastIdx;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `undefined` if no item matches, otherwise the last item that matches the predicate.
     */
    function findLastMonotonous(array, predicate) {
        const idx = findLastIdxMonotonous(array, predicate);
        return idx === -1 ? undefined : array[idx];
    }
    exports.findLastMonotonous = findLastMonotonous;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `startIdx - 1` if predicate is false for all items, otherwise the index of the last item that matches the predicate.
     */
    function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                i = k + 1;
            }
            else {
                j = k;
            }
        }
        return i - 1;
    }
    exports.findLastIdxMonotonous = findLastIdxMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `undefined` if no item matches, otherwise the first item that matches the predicate.
     */
    function findFirstMonotonous(array, predicate) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
        return idx === array.length ? undefined : array[idx];
    }
    exports.findFirstMonotonous = findFirstMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `endIdxEx` if predicate is false for all items, otherwise the index of the first item that matches the predicate.
     */
    function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                j = k;
            }
            else {
                i = k + 1;
            }
        }
        return i;
    }
    exports.findFirstIdxMonotonousOrArrLen = findFirstIdxMonotonousOrArrLen;
    function findFirstIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
        return idx === array.length ? -1 : idx;
    }
    exports.findFirstIdxMonotonous = findFirstIdxMonotonous;
    /**
     * Use this when
     * * You have a sorted array
     * * You query this array with a monotonous predicate to find the last item that has a certain property.
     * * You query this array multiple times with monotonous predicates that get weaker and weaker.
     */
    class MonotonousArray {
        static { this.assertInvariants = false; }
        constructor(_array) {
            this._array = _array;
            this._findLastMonotonousLastIdx = 0;
        }
        /**
         * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
         * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
         */
        findLastMonotonous(predicate) {
            if (MonotonousArray.assertInvariants) {
                if (this._prevFindLastPredicate) {
                    for (const item of this._array) {
                        if (this._prevFindLastPredicate(item) && !predicate(item)) {
                            throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
                        }
                    }
                }
                this._prevFindLastPredicate = predicate;
            }
            const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
            this._findLastMonotonousLastIdx = idx + 1;
            return idx === -1 ? undefined : this._array[idx];
        }
    }
    exports.MonotonousArray = MonotonousArray;
    /**
     * Returns the first item that is equal to or greater than every other item.
    */
    function findFirstMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) > 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findFirstMaxBy = findFirstMaxBy;
    /**
     * Returns the last item that is equal to or greater than every other item.
    */
    function findLastMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) >= 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findLastMaxBy = findLastMaxBy;
    /**
     * Returns the first item that is equal to or less than every other item.
    */
    function findFirstMinBy(array, comparator) {
        return findFirstMaxBy(array, (a, b) => -comparator(a, b));
    }
    exports.findFirstMinBy = findFirstMinBy;
    function findMaxIdxBy(array, comparator) {
        if (array.length === 0) {
            return -1;
        }
        let maxIdx = 0;
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, array[maxIdx]) > 0) {
                maxIdx = i;
            }
        }
        return maxIdx;
    }
    exports.findMaxIdxBy = findMaxIdxBy;
    /**
     * Returns the first mapped value of the array which is not undefined.
     */
    function mapFindFirst(items, mapFn) {
        for (const value of items) {
            const mapped = mapFn(value);
            if (mapped !== undefined) {
                return mapped;
            }
        }
        return undefined;
    }
    exports.mapFindFirst = mapFindFirst;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[34/*vs/base/common/collections*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intersection = exports.diffMaps = exports.diffSets = exports.groupBy = void 0;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function groupBy(data, groupFn) {
        const result = Object.create(null);
        for (const element of data) {
            const key = groupFn(element);
            let target = result[key];
            if (!target) {
                target = result[key] = [];
            }
            target.push(element);
        }
        return result;
    }
    exports.groupBy = groupBy;
    function diffSets(before, after) {
        const removed = [];
        const added = [];
        for (const element of before) {
            if (!after.has(element)) {
                removed.push(element);
            }
        }
        for (const element of after) {
            if (!before.has(element)) {
                added.push(element);
            }
        }
        return { removed, added };
    }
    exports.diffSets = diffSets;
    function diffMaps(before, after) {
        const removed = [];
        const added = [];
        for (const [index, value] of before) {
            if (!after.has(index)) {
                removed.push(value);
            }
        }
        for (const [index, value] of after) {
            if (!before.has(index)) {
                added.push(value);
            }
        }
        return { removed, added };
    }
    exports.diffMaps = diffMaps;
    /**
     * Computes the intersection of two sets.
     *
     * @param setA - The first set.
     * @param setB - The second iterable.
     * @returns A new set containing the elements that are in both `setA` and `setB`.
     */
    function intersection(setA, setB) {
        const result = new Set();
        for (const elem of setB) {
            if (setA.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    }
    exports.intersection = intersection;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[35/*vs/base/common/color*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Color = exports.HSVA = exports.HSLA = exports.RGBA = void 0;
    function roundFloat(number, decimalPoints) {
        const decimal = Math.pow(10, decimalPoints);
        return Math.round(number * decimal) / decimal;
    }
    class RGBA {
        constructor(r, g, b, a = 1) {
            this._rgbaBrand = undefined;
            this.r = Math.min(255, Math.max(0, r)) | 0;
            this.g = Math.min(255, Math.max(0, g)) | 0;
            this.b = Math.min(255, Math.max(0, b)) | 0;
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
        }
    }
    exports.RGBA = RGBA;
    class HSLA {
        constructor(h, s, l, a) {
            this._hslaBrand = undefined;
            this.h = Math.max(Math.min(360, h), 0) | 0;
            this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
            this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
        }
        /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h in the set [0, 360], s, and l in the set [0, 1].
         */
        static fromRGBA(rgba) {
            const r = rgba.r / 255;
            const g = rgba.g / 255;
            const b = rgba.b / 255;
            const a = rgba.a;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (min + max) / 2;
            const chroma = max - min;
            if (chroma > 0) {
                s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
                switch (max) {
                    case r:
                        h = (g - b) / chroma + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / chroma + 2;
                        break;
                    case b:
                        h = (r - g) / chroma + 4;
                        break;
                }
                h *= 60;
                h = Math.round(h);
            }
            return new HSLA(h, s, l, a);
        }
        static _hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }
        /**
         * Converts an HSL color value to RGB. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
         * returns r, g, and b in the set [0, 255].
         */
        static toRGBA(hsla) {
            const h = hsla.h / 360;
            const { s, l, a } = hsla;
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = HSLA._hue2rgb(p, q, h + 1 / 3);
                g = HSLA._hue2rgb(p, q, h);
                b = HSLA._hue2rgb(p, q, h - 1 / 3);
            }
            return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
        }
    }
    exports.HSLA = HSLA;
    class HSVA {
        constructor(h, s, v, a) {
            this._hsvaBrand = undefined;
            this.h = Math.max(Math.min(360, h), 0) | 0;
            this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
            this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
        }
        // from http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
        static fromRGBA(rgba) {
            const r = rgba.r / 255;
            const g = rgba.g / 255;
            const b = rgba.b / 255;
            const cmax = Math.max(r, g, b);
            const cmin = Math.min(r, g, b);
            const delta = cmax - cmin;
            const s = cmax === 0 ? 0 : (delta / cmax);
            let m;
            if (delta === 0) {
                m = 0;
            }
            else if (cmax === r) {
                m = ((((g - b) / delta) % 6) + 6) % 6;
            }
            else if (cmax === g) {
                m = ((b - r) / delta) + 2;
            }
            else {
                m = ((r - g) / delta) + 4;
            }
            return new HSVA(Math.round(m * 60), s, cmax, rgba.a);
        }
        // from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
        static toRGBA(hsva) {
            const { h, s, v, a } = hsva;
            const c = v * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = v - c;
            let [r, g, b] = [0, 0, 0];
            if (h < 60) {
                r = c;
                g = x;
            }
            else if (h < 120) {
                r = x;
                g = c;
            }
            else if (h < 180) {
                g = c;
                b = x;
            }
            else if (h < 240) {
                g = x;
                b = c;
            }
            else if (h < 300) {
                r = x;
                b = c;
            }
            else if (h <= 360) {
                r = c;
                b = x;
            }
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            return new RGBA(r, g, b, a);
        }
    }
    exports.HSVA = HSVA;
    class Color {
        static fromHex(hex) {
            return Color.Format.CSS.parseHex(hex) || Color.red;
        }
        static equals(a, b) {
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.equals(b);
        }
        get hsla() {
            if (this._hsla) {
                return this._hsla;
            }
            else {
                return HSLA.fromRGBA(this.rgba);
            }
        }
        get hsva() {
            if (this._hsva) {
                return this._hsva;
            }
            return HSVA.fromRGBA(this.rgba);
        }
        constructor(arg) {
            if (!arg) {
                throw new Error('Color needs a value');
            }
            else if (arg instanceof RGBA) {
                this.rgba = arg;
            }
            else if (arg instanceof HSLA) {
                this._hsla = arg;
                this.rgba = HSLA.toRGBA(arg);
            }
            else if (arg instanceof HSVA) {
                this._hsva = arg;
                this.rgba = HSVA.toRGBA(arg);
            }
            else {
                throw new Error('Invalid color ctor argument');
            }
        }
        equals(other) {
            return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
        }
        /**
         * http://www.w3.org/TR/WCAG20/#relativeluminancedef
         * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
         */
        getRelativeLuminance() {
            const R = Color._relativeLuminanceForComponent(this.rgba.r);
            const G = Color._relativeLuminanceForComponent(this.rgba.g);
            const B = Color._relativeLuminanceForComponent(this.rgba.b);
            const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
            return roundFloat(luminance, 4);
        }
        static _relativeLuminanceForComponent(color) {
            const c = color / 255;
            return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
        }
        /**
         * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
         * Returns the contrast ration number in the set [1, 21].
         */
        getContrastRatio(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
        }
        /**
         *	http://24ways.org/2010/calculating-color-contrast
         *  Return 'true' if darker color otherwise 'false'
         */
        isDarker() {
            const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
            return yiq < 128;
        }
        /**
         *	http://24ways.org/2010/calculating-color-contrast
         *  Return 'true' if lighter color otherwise 'false'
         */
        isLighter() {
            const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
            return yiq >= 128;
        }
        isLighterThan(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 > lum2;
        }
        isDarkerThan(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 < lum2;
        }
        lighten(factor) {
            return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
        }
        darken(factor) {
            return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
        }
        transparent(factor) {
            const { r, g, b, a } = this.rgba;
            return new Color(new RGBA(r, g, b, a * factor));
        }
        isTransparent() {
            return this.rgba.a === 0;
        }
        isOpaque() {
            return this.rgba.a === 1;
        }
        opposite() {
            return new Color(new RGBA(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
        }
        blend(c) {
            const rgba = c.rgba;
            // Convert to 0..1 opacity
            const thisA = this.rgba.a;
            const colorA = rgba.a;
            const a = thisA + colorA * (1 - thisA);
            if (a < 1e-6) {
                return Color.transparent;
            }
            const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
            const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
            const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
            return new Color(new RGBA(r, g, b, a));
        }
        makeOpaque(opaqueBackground) {
            if (this.isOpaque() || opaqueBackground.rgba.a !== 1) {
                // only allow to blend onto a non-opaque color onto a opaque color
                return this;
            }
            const { r, g, b, a } = this.rgba;
            // https://stackoverflow.com/questions/12228548/finding-equivalent-color-with-opacity
            return new Color(new RGBA(opaqueBackground.rgba.r - a * (opaqueBackground.rgba.r - r), opaqueBackground.rgba.g - a * (opaqueBackground.rgba.g - g), opaqueBackground.rgba.b - a * (opaqueBackground.rgba.b - b), 1));
        }
        flatten(...backgrounds) {
            const background = backgrounds.reduceRight((accumulator, color) => {
                return Color._flatten(color, accumulator);
            });
            return Color._flatten(this, background);
        }
        static _flatten(foreground, background) {
            const backgroundAlpha = 1 - foreground.rgba.a;
            return new Color(new RGBA(backgroundAlpha * background.rgba.r + foreground.rgba.a * foreground.rgba.r, backgroundAlpha * background.rgba.g + foreground.rgba.a * foreground.rgba.g, backgroundAlpha * background.rgba.b + foreground.rgba.a * foreground.rgba.b));
        }
        toString() {
            if (!this._toString) {
                this._toString = Color.Format.CSS.format(this);
            }
            return this._toString;
        }
        static getLighterColor(of, relative, factor) {
            if (of.isLighterThan(relative)) {
                return of;
            }
            factor = factor ? factor : 0.5;
            const lum1 = of.getRelativeLuminance();
            const lum2 = relative.getRelativeLuminance();
            factor = factor * (lum2 - lum1) / lum2;
            return of.lighten(factor);
        }
        static getDarkerColor(of, relative, factor) {
            if (of.isDarkerThan(relative)) {
                return of;
            }
            factor = factor ? factor : 0.5;
            const lum1 = of.getRelativeLuminance();
            const lum2 = relative.getRelativeLuminance();
            factor = factor * (lum1 - lum2) / lum1;
            return of.darken(factor);
        }
        static { this.white = new Color(new RGBA(255, 255, 255, 1)); }
        static { this.black = new Color(new RGBA(0, 0, 0, 1)); }
        static { this.red = new Color(new RGBA(255, 0, 0, 1)); }
        static { this.blue = new Color(new RGBA(0, 0, 255, 1)); }
        static { this.green = new Color(new RGBA(0, 255, 0, 1)); }
        static { this.cyan = new Color(new RGBA(0, 255, 255, 1)); }
        static { this.lightgrey = new Color(new RGBA(211, 211, 211, 1)); }
        static { this.transparent = new Color(new RGBA(0, 0, 0, 0)); }
    }
    exports.Color = Color;
    (function (Color) {
        let Format;
        (function (Format) {
            let CSS;
            (function (CSS) {
                function formatRGB(color) {
                    if (color.rgba.a === 1) {
                        return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
                    }
                    return Color.Format.CSS.formatRGBA(color);
                }
                CSS.formatRGB = formatRGB;
                function formatRGBA(color) {
                    return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+(color.rgba.a).toFixed(2)})`;
                }
                CSS.formatRGBA = formatRGBA;
                function formatHSL(color) {
                    if (color.hsla.a === 1) {
                        return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
                    }
                    return Color.Format.CSS.formatHSLA(color);
                }
                CSS.formatHSL = formatHSL;
                function formatHSLA(color) {
                    return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
                }
                CSS.formatHSLA = formatHSLA;
                function _toTwoDigitHex(n) {
                    const r = n.toString(16);
                    return r.length !== 2 ? '0' + r : r;
                }
                /**
                 * Formats the color as #RRGGBB
                 */
                function formatHex(color) {
                    return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
                }
                CSS.formatHex = formatHex;
                /**
                 * Formats the color as #RRGGBBAA
                 * If 'compact' is set, colors without transparancy will be printed as #RRGGBB
                 */
                function formatHexA(color, compact = false) {
                    if (compact && color.rgba.a === 1) {
                        return Color.Format.CSS.formatHex(color);
                    }
                    return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
                }
                CSS.formatHexA = formatHexA;
                /**
                 * The default format will use HEX if opaque and RGBA otherwise.
                 */
                function format(color) {
                    if (color.isOpaque()) {
                        return Color.Format.CSS.formatHex(color);
                    }
                    return Color.Format.CSS.formatRGBA(color);
                }
                CSS.format = format;
                /**
                 * Converts an Hex color value to a Color.
                 * returns r, g, and b are contained in the set [0, 255]
                 * @param hex string (#RGB, #RGBA, #RRGGBB or #RRGGBBAA).
                 */
                function parseHex(hex) {
                    const length = hex.length;
                    if (length === 0) {
                        // Invalid color
                        return null;
                    }
                    if (hex.charCodeAt(0) !== 35 /* CharCode.Hash */) {
                        // Does not begin with a #
                        return null;
                    }
                    if (length === 7) {
                        // #RRGGBB format
                        const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                        const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                        const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                        return new Color(new RGBA(r, g, b, 1));
                    }
                    if (length === 9) {
                        // #RRGGBBAA format
                        const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                        const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                        const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                        const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
                        return new Color(new RGBA(r, g, b, a / 255));
                    }
                    if (length === 4) {
                        // #RGB format
                        const r = _parseHexDigit(hex.charCodeAt(1));
                        const g = _parseHexDigit(hex.charCodeAt(2));
                        const b = _parseHexDigit(hex.charCodeAt(3));
                        return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b));
                    }
                    if (length === 5) {
                        // #RGBA format
                        const r = _parseHexDigit(hex.charCodeAt(1));
                        const g = _parseHexDigit(hex.charCodeAt(2));
                        const b = _parseHexDigit(hex.charCodeAt(3));
                        const a = _parseHexDigit(hex.charCodeAt(4));
                        return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
                    }
                    // Invalid color
                    return null;
                }
                CSS.parseHex = parseHex;
                function _parseHexDigit(charCode) {
                    switch (charCode) {
                        case 48 /* CharCode.Digit0 */: return 0;
                        case 49 /* CharCode.Digit1 */: return 1;
                        case 50 /* CharCode.Digit2 */: return 2;
                        case 51 /* CharCode.Digit3 */: return 3;
                        case 52 /* CharCode.Digit4 */: return 4;
                        case 53 /* CharCode.Digit5 */: return 5;
                        case 54 /* CharCode.Digit6 */: return 6;
                        case 55 /* CharCode.Digit7 */: return 7;
                        case 56 /* CharCode.Digit8 */: return 8;
                        case 57 /* CharCode.Digit9 */: return 9;
                        case 97 /* CharCode.a */: return 10;
                        case 65 /* CharCode.A */: return 10;
                        case 98 /* CharCode.b */: return 11;
                        case 66 /* CharCode.B */: return 11;
                        case 99 /* CharCode.c */: return 12;
                        case 67 /* CharCode.C */: return 12;
                        case 100 /* CharCode.d */: return 13;
                        case 68 /* CharCode.D */: return 13;
                        case 101 /* CharCode.e */: return 14;
                        case 69 /* CharCode.E */: return 14;
                        case 102 /* CharCode.f */: return 15;
                        case 70 /* CharCode.F */: return 15;
                    }
                    return 0;
                }
            })(CSS = Format.CSS || (Format.CSS = {}));
        })(Format = Color.Format || (Color.Format = {}));
    })(Color || (exports.Color = Color = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[36/*vs/base/common/diff/diffChange*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffChange = void 0;
    /**
     * Represents information about a specific difference between two sequences.
     */
    class DiffChange {
        /**
         * Constructs a new DiffChange with the given sequence information
         * and content.
         */
        constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
            //Debug.Assert(originalLength > 0 || modifiedLength > 0, "originalLength and modifiedLength cannot both be <= 0");
            this.originalStart = originalStart;
            this.originalLength = originalLength;
            this.modifiedStart = modifiedStart;
            this.modifiedLength = modifiedLength;
        }
        /**
         * The end point (exclusive) of the change in the original sequence.
         */
        getOriginalEnd() {
            return this.originalStart + this.originalLength;
        }
        /**
         * The end point (exclusive) of the change in the modified sequence.
         */
        getModifiedEnd() {
            return this.modifiedStart + this.modifiedLength;
        }
    }
    exports.DiffChange = DiffChange;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[3/*vs/base/common/errors*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BugIndicatingError = exports.ErrorNoTelemetry = exports.ExpectedError = exports.NotSupportedError = exports.NotImplementedError = exports.getErrorMessage = exports.ReadonlyError = exports.illegalState = exports.illegalArgument = exports.canceled = exports.CancellationError = exports.isCancellationError = exports.transformErrorForSerialization = exports.onUnexpectedExternalError = exports.onUnexpectedError = exports.isSigPipeError = exports.setUnexpectedErrorHandler = exports.errorHandler = exports.ErrorHandler = void 0;
    // Avoid circular dependency on EventEmitter by implementing a subset of the interface.
    class ErrorHandler {
        constructor() {
            this.listeners = [];
            this.unexpectedErrorHandler = function (e) {
                setTimeout(() => {
                    if (e.stack) {
                        if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                            throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack);
                        }
                        throw new Error(e.message + '\n\n' + e.stack);
                    }
                    throw e;
                }, 0);
            };
        }
        addListener(listener) {
            this.listeners.push(listener);
            return () => {
                this._removeListener(listener);
            };
        }
        emit(e) {
            this.listeners.forEach((listener) => {
                listener(e);
            });
        }
        _removeListener(listener) {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
        setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
            this.unexpectedErrorHandler = newUnexpectedErrorHandler;
        }
        getUnexpectedErrorHandler() {
            return this.unexpectedErrorHandler;
        }
        onUnexpectedError(e) {
            this.unexpectedErrorHandler(e);
            this.emit(e);
        }
        // For external errors, we don't want the listeners to be called
        onUnexpectedExternalError(e) {
            this.unexpectedErrorHandler(e);
        }
    }
    exports.ErrorHandler = ErrorHandler;
    exports.errorHandler = new ErrorHandler();
    /** @skipMangle */
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        exports.errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
    /**
     * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
     * logged at most once, to avoid a loop.
     *
     * @see https://github.com/microsoft/vscode-remote-release/issues/6481
     */
    function isSigPipeError(e) {
        if (!e || typeof e !== 'object') {
            return false;
        }
        const cast = e;
        return cast.code === 'EPIPE' && cast.syscall?.toUpperCase() === 'WRITE';
    }
    exports.isSigPipeError = isSigPipeError;
    function onUnexpectedError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedError(e);
        }
        return undefined;
    }
    exports.onUnexpectedError = onUnexpectedError;
    function onUnexpectedExternalError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedExternalError(e);
        }
        return undefined;
    }
    exports.onUnexpectedExternalError = onUnexpectedExternalError;
    function transformErrorForSerialization(error) {
        if (error instanceof Error) {
            const { name, message } = error;
            const stack = error.stacktrace || error.stack;
            return {
                $isError: true,
                name,
                message,
                stack,
                noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error)
            };
        }
        // return as is
        return error;
    }
    exports.transformErrorForSerialization = transformErrorForSerialization;
    const canceledName = 'Canceled';
    /**
     * Checks if the given error is a promise in canceled state
     */
    function isCancellationError(error) {
        if (error instanceof CancellationError) {
            return true;
        }
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    exports.isCancellationError = isCancellationError;
    // !!!IMPORTANT!!!
    // Do NOT change this class because it is also used as an API-type.
    class CancellationError extends Error {
        constructor() {
            super(canceledName);
            this.name = this.message;
        }
    }
    exports.CancellationError = CancellationError;
    /**
     * @deprecated use {@link CancellationError `new CancellationError()`} instead
     */
    function canceled() {
        const error = new Error(canceledName);
        error.name = error.message;
        return error;
    }
    exports.canceled = canceled;
    function illegalArgument(name) {
        if (name) {
            return new Error(`Illegal argument: ${name}`);
        }
        else {
            return new Error('Illegal argument');
        }
    }
    exports.illegalArgument = illegalArgument;
    function illegalState(name) {
        if (name) {
            return new Error(`Illegal state: ${name}`);
        }
        else {
            return new Error('Illegal state');
        }
    }
    exports.illegalState = illegalState;
    class ReadonlyError extends TypeError {
        constructor(name) {
            super(name ? `${name} is read-only and cannot be changed` : 'Cannot change read-only property');
        }
    }
    exports.ReadonlyError = ReadonlyError;
    function getErrorMessage(err) {
        if (!err) {
            return 'Error';
        }
        if (err.message) {
            return err.message;
        }
        if (err.stack) {
            return err.stack.split('\n')[0];
        }
        return String(err);
    }
    exports.getErrorMessage = getErrorMessage;
    class NotImplementedError extends Error {
        constructor(message) {
            super('NotImplemented');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotImplementedError = NotImplementedError;
    class NotSupportedError extends Error {
        constructor(message) {
            super('NotSupported');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotSupportedError = NotSupportedError;
    class ExpectedError extends Error {
        constructor() {
            super(...arguments);
            this.isExpected = true;
        }
    }
    exports.ExpectedError = ExpectedError;
    /**
     * Error that when thrown won't be logged in telemetry as an unhandled error.
     */
    class ErrorNoTelemetry extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'CodeExpectedError';
        }
        static fromError(err) {
            if (err instanceof ErrorNoTelemetry) {
                return err;
            }
            const result = new ErrorNoTelemetry();
            result.message = err.message;
            result.stack = err.stack;
            return result;
        }
        static isErrorNoTelemetry(err) {
            return err.name === 'CodeExpectedError';
        }
    }
    exports.ErrorNoTelemetry = ErrorNoTelemetry;
    /**
     * This error indicates a bug.
     * Do not throw this for invalid user input.
     * Only catch this error to recover gracefully from bugs.
     */
    class BugIndicatingError extends Error {
        constructor(message) {
            super(message || 'An unexpected bug occurred.');
            Object.setPrototypeOf(this, BugIndicatingError.prototype);
            // Because we know for sure only buggy code throws this,
            // we definitely want to break here and fix the bug.
            // eslint-disable-next-line no-debugger
            // debugger;
        }
    }
    exports.BugIndicatingError = BugIndicatingError;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[6/*vs/base/common/arrays*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/errors*/,9/*vs/base/common/arraysFind*/]), function (require, exports, errors_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallbackIterable = exports.ArrayQueue = exports.reverseOrder = exports.booleanComparator = exports.numberComparator = exports.tieBreakComparators = exports.compareBy = exports.CompareResult = exports.splice = exports.insertInto = exports.getRandomElement = exports.asArray = exports.mapArrayOrNot = exports.pushMany = exports.pushToEnd = exports.pushToStart = exports.shuffle = exports.arrayInsert = exports.remove = exports.insert = exports.index = exports.range = exports.flatten = exports.commonPrefixLength = exports.lastOrDefault = exports.firstOrDefault = exports.uniqueFilter = exports.distinct = exports.isNonEmptyArray = exports.isFalsyOrEmpty = exports.move = exports.coalesceInPlace = exports.coalesce = exports.topAsync = exports.top = exports.delta = exports.sortedDiff = exports.forEachWithNeighbors = exports.forEachAdjacent = exports.groupAdjacentBy = exports.groupBy = exports.quickSelect = exports.binarySearch2 = exports.binarySearch = exports.removeFastWithoutKeepingOrder = exports.equals = exports.tail2 = exports.tail = void 0;
    /**
     * Returns the last element of an array.
     * @param array The array.
     * @param n Which element from the end (default is zero).
     */
    function tail(array, n = 0) {
        return array[array.length - (1 + n)];
    }
    exports.tail = tail;
    function tail2(arr) {
        if (arr.length === 0) {
            throw new Error('Invalid tail call');
        }
        return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
    }
    exports.tail2 = tail2;
    function equals(one, other, itemEquals = (a, b) => a === b) {
        if (one === other) {
            return true;
        }
        if (!one || !other) {
            return false;
        }
        if (one.length !== other.length) {
            return false;
        }
        for (let i = 0, len = one.length; i < len; i++) {
            if (!itemEquals(one[i], other[i])) {
                return false;
            }
        }
        return true;
    }
    exports.equals = equals;
    /**
     * Remove the element at `index` by replacing it with the last element. This is faster than `splice`
     * but changes the order of the array
     */
    function removeFastWithoutKeepingOrder(array, index) {
        const last = array.length - 1;
        if (index < last) {
            array[index] = array[last];
        }
        array.pop();
    }
    exports.removeFastWithoutKeepingOrder = removeFastWithoutKeepingOrder;
    /**
     * Performs a binary search algorithm over a sorted array.
     *
     * @param array The array being searched.
     * @param key The value we search for.
     * @param comparator A function that takes two array elements and returns zero
     *   if they are equal, a negative number if the first element precedes the
     *   second one in the sorting order, or a positive number if the second element
     *   precedes the first one.
     * @return See {@link binarySearch2}
     */
    function binarySearch(array, key, comparator) {
        return binarySearch2(array.length, i => comparator(array[i], key));
    }
    exports.binarySearch = binarySearch;
    /**
     * Performs a binary search algorithm over a sorted collection. Useful for cases
     * when we need to perform a binary search over something that isn't actually an
     * array, and converting data to an array would defeat the use of binary search
     * in the first place.
     *
     * @param length The collection length.
     * @param compareToKey A function that takes an index of an element in the
     *   collection and returns zero if the value at this index is equal to the
     *   search key, a negative number if the value precedes the search key in the
     *   sorting order, or a positive number if the search key precedes the value.
     * @return A non-negative index of an element, if found. If not found, the
     *   result is -(n+1) (or ~n, using bitwise notation), where n is the index
     *   where the key should be inserted to maintain the sorting order.
     */
    function binarySearch2(length, compareToKey) {
        let low = 0, high = length - 1;
        while (low <= high) {
            const mid = ((low + high) / 2) | 0;
            const comp = compareToKey(mid);
            if (comp < 0) {
                low = mid + 1;
            }
            else if (comp > 0) {
                high = mid - 1;
            }
            else {
                return mid;
            }
        }
        return -(low + 1);
    }
    exports.binarySearch2 = binarySearch2;
    function quickSelect(nth, data, compare) {
        nth = nth | 0;
        if (nth >= data.length) {
            throw new TypeError('invalid index');
        }
        const pivotValue = data[Math.floor(data.length * Math.random())];
        const lower = [];
        const higher = [];
        const pivots = [];
        for (const value of data) {
            const val = compare(value, pivotValue);
            if (val < 0) {
                lower.push(value);
            }
            else if (val > 0) {
                higher.push(value);
            }
            else {
                pivots.push(value);
            }
        }
        if (nth < lower.length) {
            return quickSelect(nth, lower, compare);
        }
        else if (nth < lower.length + pivots.length) {
            return pivots[0];
        }
        else {
            return quickSelect(nth - (lower.length + pivots.length), higher, compare);
        }
    }
    exports.quickSelect = quickSelect;
    function groupBy(data, compare) {
        const result = [];
        let currentGroup = undefined;
        for (const element of data.slice(0).sort(compare)) {
            if (!currentGroup || compare(currentGroup[0], element) !== 0) {
                currentGroup = [element];
                result.push(currentGroup);
            }
            else {
                currentGroup.push(element);
            }
        }
        return result;
    }
    exports.groupBy = groupBy;
    /**
     * Splits the given items into a list of (non-empty) groups.
     * `shouldBeGrouped` is used to decide if two consecutive items should be in the same group.
     * The order of the items is preserved.
     */
    function* groupAdjacentBy(items, shouldBeGrouped) {
        let currentGroup;
        let last;
        for (const item of items) {
            if (last !== undefined && shouldBeGrouped(last, item)) {
                currentGroup.push(item);
            }
            else {
                if (currentGroup) {
                    yield currentGroup;
                }
                currentGroup = [item];
            }
            last = item;
        }
        if (currentGroup) {
            yield currentGroup;
        }
    }
    exports.groupAdjacentBy = groupAdjacentBy;
    function forEachAdjacent(arr, f) {
        for (let i = 0; i <= arr.length; i++) {
            f(i === 0 ? undefined : arr[i - 1], i === arr.length ? undefined : arr[i]);
        }
    }
    exports.forEachAdjacent = forEachAdjacent;
    function forEachWithNeighbors(arr, f) {
        for (let i = 0; i < arr.length; i++) {
            f(i === 0 ? undefined : arr[i - 1], arr[i], i + 1 === arr.length ? undefined : arr[i + 1]);
        }
    }
    exports.forEachWithNeighbors = forEachWithNeighbors;
    /**
     * Diffs two *sorted* arrays and computes the splices which apply the diff.
     */
    function sortedDiff(before, after, compare) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            const n = compare(beforeElement, afterElement);
            if (n === 0) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
            }
            else if (n < 0) {
                // beforeElement is smaller -> before element removed
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else if (n > 0) {
                // beforeElement is greater -> after element added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.sortedDiff = sortedDiff;
    /**
     * Takes two *sorted* arrays and computes their delta (removed, added elements).
     * Finishes in `Math.min(before.length, after.length)` steps.
     */
    function delta(before, after, compare) {
        const splices = sortedDiff(before, after, compare);
        const removed = [];
        const added = [];
        for (const splice of splices) {
            removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
            added.push(...splice.toInsert);
        }
        return { removed, added };
    }
    exports.delta = delta;
    /**
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @return The first n elements from array when sorted with compare.
     */
    function top(array, compare, n) {
        if (n === 0) {
            return [];
        }
        const result = array.slice(0, n).sort(compare);
        topStep(array, compare, result, n, array.length);
        return result;
    }
    exports.top = top;
    /**
     * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
     *
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @param batch The number of elements to examine before yielding to the event loop.
     * @return The first n elements from array when sorted with compare.
     */
    function topAsync(array, compare, n, batch, token) {
        if (n === 0) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            (async () => {
                const o = array.length;
                const result = array.slice(0, n).sort(compare);
                for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
                    if (i > n) {
                        await new Promise(resolve => setTimeout(resolve)); // any other delay function would starve I/O
                    }
                    if (token && token.isCancellationRequested) {
                        throw new errors_1.CancellationError();
                    }
                    topStep(array, compare, result, i, m);
                }
                return result;
            })()
                .then(resolve, reject);
        });
    }
    exports.topAsync = topAsync;
    function topStep(array, compare, result, i, m) {
        for (const n = result.length; i < m; i++) {
            const element = array[i];
            if (compare(element, result[n - 1]) < 0) {
                result.pop();
                const j = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(result, e => compare(element, e) < 0);
                result.splice(j, 0, element);
            }
        }
    }
    /**
     * @returns New array with all falsy values removed. The original array IS NOT modified.
     */
    function coalesce(array) {
        return array.filter(e => !!e);
    }
    exports.coalesce = coalesce;
    /**
     * Remove all falsy values from `array`. The original array IS modified.
     */
    function coalesceInPlace(array) {
        let to = 0;
        for (let i = 0; i < array.length; i++) {
            if (!!array[i]) {
                array[to] = array[i];
                to += 1;
            }
        }
        array.length = to;
    }
    exports.coalesceInPlace = coalesceInPlace;
    /**
     * @deprecated Use `Array.copyWithin` instead
     */
    function move(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
    exports.move = move;
    /**
     * @returns false if the provided object is an array and not empty.
     */
    function isFalsyOrEmpty(obj) {
        return !Array.isArray(obj) || obj.length === 0;
    }
    exports.isFalsyOrEmpty = isFalsyOrEmpty;
    function isNonEmptyArray(obj) {
        return Array.isArray(obj) && obj.length > 0;
    }
    exports.isNonEmptyArray = isNonEmptyArray;
    /**
     * Removes duplicates from the given array. The optional keyFn allows to specify
     * how elements are checked for equality by returning an alternate value for each.
     */
    function distinct(array, keyFn = value => value) {
        const seen = new Set();
        return array.filter(element => {
            const key = keyFn(element);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    exports.distinct = distinct;
    function uniqueFilter(keyFn) {
        const seen = new Set();
        return element => {
            const key = keyFn(element);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        };
    }
    exports.uniqueFilter = uniqueFilter;
    function firstOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[0] : notFoundValue;
    }
    exports.firstOrDefault = firstOrDefault;
    function lastOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[array.length - 1] : notFoundValue;
    }
    exports.lastOrDefault = lastOrDefault;
    function commonPrefixLength(one, other, equals = (a, b) => a === b) {
        let result = 0;
        for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
            result++;
        }
        return result;
    }
    exports.commonPrefixLength = commonPrefixLength;
    /**
     * @deprecated Use `[].flat()`
     */
    function flatten(arr) {
        return [].concat(...arr);
    }
    exports.flatten = flatten;
    function range(arg, to) {
        let from = typeof to === 'number' ? arg : 0;
        if (typeof to === 'number') {
            from = arg;
        }
        else {
            from = 0;
            to = arg;
        }
        const result = [];
        if (from <= to) {
            for (let i = from; i < to; i++) {
                result.push(i);
            }
        }
        else {
            for (let i = from; i > to; i--) {
                result.push(i);
            }
        }
        return result;
    }
    exports.range = range;
    function index(array, indexer, mapper) {
        return array.reduce((r, t) => {
            r[indexer(t)] = mapper ? mapper(t) : t;
            return r;
        }, Object.create(null));
    }
    exports.index = index;
    /**
     * Inserts an element into an array. Returns a function which, when
     * called, will remove that element from the array.
     *
     * @deprecated In almost all cases, use a `Set<T>` instead.
     */
    function insert(array, element) {
        array.push(element);
        return () => remove(array, element);
    }
    exports.insert = insert;
    /**
     * Removes an element from an array if it can be found.
     *
     * @deprecated In almost all cases, use a `Set<T>` instead.
     */
    function remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
            return element;
        }
        return undefined;
    }
    exports.remove = remove;
    /**
     * Insert `insertArr` inside `target` at `insertIndex`.
     * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
     */
    function arrayInsert(target, insertIndex, insertArr) {
        const before = target.slice(0, insertIndex);
        const after = target.slice(insertIndex);
        return before.concat(insertArr, after);
    }
    exports.arrayInsert = arrayInsert;
    /**
     * Uses Fisher-Yates shuffle to shuffle the given array
     */
    function shuffle(array, _seed) {
        let rand;
        if (typeof _seed === 'number') {
            let seed = _seed;
            // Seeded random number generator in JS. Modified from:
            // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
            rand = () => {
                const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias
                return x - Math.floor(x);
            };
        }
        else {
            rand = Math.random;
        }
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(rand() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    exports.shuffle = shuffle;
    /**
     * Pushes an element to the start of the array, if found.
     */
    function pushToStart(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.unshift(value);
        }
    }
    exports.pushToStart = pushToStart;
    /**
     * Pushes an element to the end of the array, if found.
     */
    function pushToEnd(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.push(value);
        }
    }
    exports.pushToEnd = pushToEnd;
    function pushMany(arr, items) {
        for (const item of items) {
            arr.push(item);
        }
    }
    exports.pushMany = pushMany;
    function mapArrayOrNot(items, fn) {
        return Array.isArray(items) ?
            items.map(fn) :
            fn(items);
    }
    exports.mapArrayOrNot = mapArrayOrNot;
    function asArray(x) {
        return Array.isArray(x) ? x : [x];
    }
    exports.asArray = asArray;
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    exports.getRandomElement = getRandomElement;
    /**
     * Insert the new items in the array.
     * @param array The original array.
     * @param start The zero-based location in the array from which to start inserting elements.
     * @param newItems The items to be inserted
     */
    function insertInto(array, start, newItems) {
        const startIdx = getActualStartIndex(array, start);
        const originalLength = array.length;
        const newItemsLength = newItems.length;
        array.length = originalLength + newItemsLength;
        // Move the items after the start index, start from the end so that we don't overwrite any value.
        for (let i = originalLength - 1; i >= startIdx; i--) {
            array[i + newItemsLength] = array[i];
        }
        for (let i = 0; i < newItemsLength; i++) {
            array[i + startIdx] = newItems[i];
        }
    }
    exports.insertInto = insertInto;
    /**
     * Removes elements from an array and inserts new elements in their place, returning the deleted elements. Alternative to the native Array.splice method, it
     * can only support limited number of items due to the maximum call stack size limit.
     * @param array The original array.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    function splice(array, start, deleteCount, newItems) {
        const index = getActualStartIndex(array, start);
        let result = array.splice(index, deleteCount);
        if (result === undefined) {
            // see https://bugs.webkit.org/show_bug.cgi?id=261140
            result = [];
        }
        insertInto(array, index, newItems);
        return result;
    }
    exports.splice = splice;
    /**
     * Determine the actual start index (same logic as the native splice() or slice())
     * If greater than the length of the array, start will be set to the length of the array. In this case, no element will be deleted but the method will behave as an adding function, adding as many element as item[n*] provided.
     * If negative, it will begin that many elements from the end of the array. (In this case, the origin -1, meaning -n is the index of the nth last element, and is therefore equivalent to the index of array.length - n.) If array.length + start is less than 0, it will begin from index 0.
     * @param array The target array.
     * @param start The operation index.
     */
    function getActualStartIndex(array, start) {
        return start < 0 ? Math.max(start + array.length, 0) : Math.min(start, array.length);
    }
    var CompareResult;
    (function (CompareResult) {
        function isLessThan(result) {
            return result < 0;
        }
        CompareResult.isLessThan = isLessThan;
        function isLessThanOrEqual(result) {
            return result <= 0;
        }
        CompareResult.isLessThanOrEqual = isLessThanOrEqual;
        function isGreaterThan(result) {
            return result > 0;
        }
        CompareResult.isGreaterThan = isGreaterThan;
        function isNeitherLessOrGreaterThan(result) {
            return result === 0;
        }
        CompareResult.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
        CompareResult.greaterThan = 1;
        CompareResult.lessThan = -1;
        CompareResult.neitherLessOrGreaterThan = 0;
    })(CompareResult || (exports.CompareResult = CompareResult = {}));
    function compareBy(selector, comparator) {
        return (a, b) => comparator(selector(a), selector(b));
    }
    exports.compareBy = compareBy;
    function tieBreakComparators(...comparators) {
        return (item1, item2) => {
            for (const comparator of comparators) {
                const result = comparator(item1, item2);
                if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
                    return result;
                }
            }
            return CompareResult.neitherLessOrGreaterThan;
        };
    }
    exports.tieBreakComparators = tieBreakComparators;
    /**
     * The natural order on numbers.
    */
    const numberComparator = (a, b) => a - b;
    exports.numberComparator = numberComparator;
    const booleanComparator = (a, b) => (0, exports.numberComparator)(a ? 1 : 0, b ? 1 : 0);
    exports.booleanComparator = booleanComparator;
    function reverseOrder(comparator) {
        return (a, b) => -comparator(a, b);
    }
    exports.reverseOrder = reverseOrder;
    class ArrayQueue {
        /**
         * Constructs a queue that is backed by the given array. Runtime is O(1).
        */
        constructor(items) {
            this.items = items;
            this.firstIdx = 0;
            this.lastIdx = this.items.length - 1;
        }
        get length() {
            return this.lastIdx - this.firstIdx + 1;
        }
        /**
         * Consumes elements from the beginning of the queue as long as the predicate returns true.
         * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
        */
        takeWhile(predicate) {
            // P(k) := k <= this.lastIdx && predicate(this.items[k])
            // Find s := min { k | k >= this.firstIdx && !P(k) } and return this.data[this.firstIdx...s)
            let startIdx = this.firstIdx;
            while (startIdx < this.items.length && predicate(this.items[startIdx])) {
                startIdx++;
            }
            const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
            this.firstIdx = startIdx;
            return result;
        }
        /**
         * Consumes elements from the end of the queue as long as the predicate returns true.
         * If no elements were consumed, `null` is returned.
         * The result has the same order as the underlying array!
        */
        takeFromEndWhile(predicate) {
            // P(k) := this.firstIdx >= k && predicate(this.items[k])
            // Find s := max { k | k <= this.lastIdx && !P(k) } and return this.data(s...this.lastIdx]
            let endIdx = this.lastIdx;
            while (endIdx >= 0 && predicate(this.items[endIdx])) {
                endIdx--;
            }
            const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
            this.lastIdx = endIdx;
            return result;
        }
        peek() {
            if (this.length === 0) {
                return undefined;
            }
            return this.items[this.firstIdx];
        }
        peekLast() {
            if (this.length === 0) {
                return undefined;
            }
            return this.items[this.lastIdx];
        }
        dequeue() {
            const result = this.items[this.firstIdx];
            this.firstIdx++;
            return result;
        }
        removeLast() {
            const result = this.items[this.lastIdx];
            this.lastIdx--;
            return result;
        }
        takeCount(count) {
            const result = this.items.slice(this.firstIdx, this.firstIdx + count);
            this.firstIdx += count;
            return result;
        }
    }
    exports.ArrayQueue = ArrayQueue;
    /**
     * This class is faster than an iterator and array for lazy computed data.
    */
    class CallbackIterable {
        static { this.empty = new CallbackIterable(_callback => { }); }
        constructor(
        /**
         * Calls the callback for every item.
         * Stops when the callback returns false.
        */
        iterate) {
            this.iterate = iterate;
        }
        forEach(handler) {
            this.iterate(item => { handler(item); return true; });
        }
        toArray() {
            const result = [];
            this.iterate(item => { result.push(item); return true; });
            return result;
        }
        filter(predicate) {
            return new CallbackIterable(cb => this.iterate(item => predicate(item) ? cb(item) : true));
        }
        map(mapFn) {
            return new CallbackIterable(cb => this.iterate(item => cb(mapFn(item))));
        }
        some(predicate) {
            let result = false;
            this.iterate(item => { result = predicate(item); return !result; });
            return result;
        }
        findFirst(predicate) {
            let result;
            this.iterate(item => {
                if (predicate(item)) {
                    result = item;
                    return false;
                }
                return true;
            });
            return result;
        }
        findLast(predicate) {
            let result;
            this.iterate(item => {
                if (predicate(item)) {
                    result = item;
                }
                return true;
            });
            return result;
        }
        findLastMaxBy(comparator) {
            let result;
            let first = true;
            this.iterate(item => {
                if (first || CompareResult.isGreaterThan(comparator(item, result))) {
                    first = false;
                    result = item;
                }
                return true;
            });
            return result;
        }
    }
    exports.CallbackIterable = CallbackIterable;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[13/*vs/base/common/assert*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/errors*/]), function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkAdjacentItems = exports.assertFn = exports.softAssert = exports.assert = exports.assertNever = exports.ok = void 0;
    /**
     * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
     *
     * @deprecated Use `assert(...)` instead.
     * This method is usually used like this:
     * ```ts
     * import * as assert from 'vs/base/common/assert';
     * assert.ok(...);
     * ```
     *
     * However, `assert` in that example is a user chosen name.
     * There is no tooling for generating such an import statement.
     * Thus, the `assert(...)` function should be used instead.
     */
    function ok(value, message) {
        if (!value) {
            throw new Error(message ? `Assertion failed (${message})` : 'Assertion Failed');
        }
    }
    exports.ok = ok;
    function assertNever(value, message = 'Unreachable') {
        throw new Error(message);
    }
    exports.assertNever = assertNever;
    function assert(condition) {
        if (!condition) {
            throw new errors_1.BugIndicatingError('Assertion Failed');
        }
    }
    exports.assert = assert;
    /**
     * Like assert, but doesn't throw.
     */
    function softAssert(condition) {
        if (!condition) {
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Soft Assertion Failed'));
        }
    }
    exports.softAssert = softAssert;
    /**
     * condition must be side-effect free!
     */
    function assertFn(condition) {
        if (!condition()) {
            // eslint-disable-next-line no-debugger
            debugger;
            // Reevaluate `condition` again to make debugging easier
            condition();
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Assertion Failed'));
        }
    }
    exports.assertFn = assertFn;
    function checkAdjacentItems(items, predicate) {
        let i = 0;
        while (i < items.length - 1) {
            const a = items[i];
            const b = items[i + 1];
            if (!predicate(a, b)) {
                return false;
            }
            i++;
        }
        return true;
    }
    exports.checkAdjacentItems = checkAdjacentItems;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[19/*vs/base/common/functional*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSingleCallFunction = void 0;
    /**
     * Given a function, returns a function that is only calling that function once.
     */
    function createSingleCallFunction(fn, fnDidRunCallback) {
        const _this = this;
        let didCall = false;
        let result;
        return function () {
            if (didCall) {
                return result;
            }
            didCall = true;
            if (fnDidRunCallback) {
                try {
                    result = fn.apply(_this, arguments);
                }
                finally {
                    fnDidRunCallback();
                }
            }
            else {
                result = fn.apply(_this, arguments);
            }
            return result;
        };
    }
    exports.createSingleCallFunction = createSingleCallFunction;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[20/*vs/base/common/iterator*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Iterable = void 0;
    var Iterable;
    (function (Iterable) {
        function is(thing) {
            return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
        }
        Iterable.is = is;
        const _empty = Object.freeze([]);
        function empty() {
            return _empty;
        }
        Iterable.empty = empty;
        function* single(element) {
            yield element;
        }
        Iterable.single = single;
        function wrap(iterableOrElement) {
            if (is(iterableOrElement)) {
                return iterableOrElement;
            }
            else {
                return single(iterableOrElement);
            }
        }
        Iterable.wrap = wrap;
        function from(iterable) {
            return iterable || _empty;
        }
        Iterable.from = from;
        function* reverse(array) {
            for (let i = array.length - 1; i >= 0; i--) {
                yield array[i];
            }
        }
        Iterable.reverse = reverse;
        function isEmpty(iterable) {
            return !iterable || iterable[Symbol.iterator]().next().done === true;
        }
        Iterable.isEmpty = isEmpty;
        function first(iterable) {
            return iterable[Symbol.iterator]().next().value;
        }
        Iterable.first = first;
        function some(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return true;
                }
            }
            return false;
        }
        Iterable.some = some;
        function find(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return element;
                }
            }
            return undefined;
        }
        Iterable.find = find;
        function* filter(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    yield element;
                }
            }
        }
        Iterable.filter = filter;
        function* map(iterable, fn) {
            let index = 0;
            for (const element of iterable) {
                yield fn(element, index++);
            }
        }
        Iterable.map = map;
        function* concat(...iterables) {
            for (const iterable of iterables) {
                yield* iterable;
            }
        }
        Iterable.concat = concat;
        function reduce(iterable, reducer, initialValue) {
            let value = initialValue;
            for (const element of iterable) {
                value = reducer(value, element);
            }
            return value;
        }
        Iterable.reduce = reduce;
        /**
         * Returns an iterable slice of the array, with the same semantics as `array.slice()`.
         */
        function* slice(arr, from, to = arr.length) {
            if (from < 0) {
                from += arr.length;
            }
            if (to < 0) {
                to += arr.length;
            }
            else if (to > arr.length) {
                to = arr.length;
            }
            for (; from < to; from++) {
                yield arr[from];
            }
        }
        Iterable.slice = slice;
        /**
         * Consumes `atMost` elements from iterable and returns the consumed elements,
         * and an iterable for the rest of the elements.
         */
        function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
            const consumed = [];
            if (atMost === 0) {
                return [consumed, iterable];
            }
            const iterator = iterable[Symbol.iterator]();
            for (let i = 0; i < atMost; i++) {
                const next = iterator.next();
                if (next.done) {
                    return [consumed, Iterable.empty()];
                }
                consumed.push(next.value);
            }
            return [consumed, { [Symbol.iterator]() { return iterator; } }];
        }
        Iterable.consume = consume;
        async function asyncToArray(iterable) {
            const result = [];
            for await (const item of iterable) {
                result.push(item);
            }
            return Promise.resolve(result);
        }
        Iterable.asyncToArray = asyncToArray;
    })(Iterable || (exports.Iterable = Iterable = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[37/*vs/base/common/keyCodes*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeyChord = exports.KeyMod = exports.KeyCodeUtils = exports.IMMUTABLE_KEY_CODE_TO_CODE = exports.IMMUTABLE_CODE_TO_KEY_CODE = exports.ScanCodeUtils = exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = exports.EVENT_KEY_CODE_MAP = exports.ScanCode = exports.KeyCode = void 0;
    /**
     * Virtual Key Codes, the value does not hold any inherent meaning.
     * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
     * But these are "more general", as they should work across browsers & OS`s.
     */
    var KeyCode;
    (function (KeyCode) {
        KeyCode[KeyCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
        /**
         * Placed first to cover the 0 value of the enum.
         */
        KeyCode[KeyCode["Unknown"] = 0] = "Unknown";
        KeyCode[KeyCode["Backspace"] = 1] = "Backspace";
        KeyCode[KeyCode["Tab"] = 2] = "Tab";
        KeyCode[KeyCode["Enter"] = 3] = "Enter";
        KeyCode[KeyCode["Shift"] = 4] = "Shift";
        KeyCode[KeyCode["Ctrl"] = 5] = "Ctrl";
        KeyCode[KeyCode["Alt"] = 6] = "Alt";
        KeyCode[KeyCode["PauseBreak"] = 7] = "PauseBreak";
        KeyCode[KeyCode["CapsLock"] = 8] = "CapsLock";
        KeyCode[KeyCode["Escape"] = 9] = "Escape";
        KeyCode[KeyCode["Space"] = 10] = "Space";
        KeyCode[KeyCode["PageUp"] = 11] = "PageUp";
        KeyCode[KeyCode["PageDown"] = 12] = "PageDown";
        KeyCode[KeyCode["End"] = 13] = "End";
        KeyCode[KeyCode["Home"] = 14] = "Home";
        KeyCode[KeyCode["LeftArrow"] = 15] = "LeftArrow";
        KeyCode[KeyCode["UpArrow"] = 16] = "UpArrow";
        KeyCode[KeyCode["RightArrow"] = 17] = "RightArrow";
        KeyCode[KeyCode["DownArrow"] = 18] = "DownArrow";
        KeyCode[KeyCode["Insert"] = 19] = "Insert";
        KeyCode[KeyCode["Delete"] = 20] = "Delete";
        KeyCode[KeyCode["Digit0"] = 21] = "Digit0";
        KeyCode[KeyCode["Digit1"] = 22] = "Digit1";
        KeyCode[KeyCode["Digit2"] = 23] = "Digit2";
        KeyCode[KeyCode["Digit3"] = 24] = "Digit3";
        KeyCode[KeyCode["Digit4"] = 25] = "Digit4";
        KeyCode[KeyCode["Digit5"] = 26] = "Digit5";
        KeyCode[KeyCode["Digit6"] = 27] = "Digit6";
        KeyCode[KeyCode["Digit7"] = 28] = "Digit7";
        KeyCode[KeyCode["Digit8"] = 29] = "Digit8";
        KeyCode[KeyCode["Digit9"] = 30] = "Digit9";
        KeyCode[KeyCode["KeyA"] = 31] = "KeyA";
        KeyCode[KeyCode["KeyB"] = 32] = "KeyB";
        KeyCode[KeyCode["KeyC"] = 33] = "KeyC";
        KeyCode[KeyCode["KeyD"] = 34] = "KeyD";
        KeyCode[KeyCode["KeyE"] = 35] = "KeyE";
        KeyCode[KeyCode["KeyF"] = 36] = "KeyF";
        KeyCode[KeyCode["KeyG"] = 37] = "KeyG";
        KeyCode[KeyCode["KeyH"] = 38] = "KeyH";
        KeyCode[KeyCode["KeyI"] = 39] = "KeyI";
        KeyCode[KeyCode["KeyJ"] = 40] = "KeyJ";
        KeyCode[KeyCode["KeyK"] = 41] = "KeyK";
        KeyCode[KeyCode["KeyL"] = 42] = "KeyL";
        KeyCode[KeyCode["KeyM"] = 43] = "KeyM";
        KeyCode[KeyCode["KeyN"] = 44] = "KeyN";
        KeyCode[KeyCode["KeyO"] = 45] = "KeyO";
        KeyCode[KeyCode["KeyP"] = 46] = "KeyP";
        KeyCode[KeyCode["KeyQ"] = 47] = "KeyQ";
        KeyCode[KeyCode["KeyR"] = 48] = "KeyR";
        KeyCode[KeyCode["KeyS"] = 49] = "KeyS";
        KeyCode[KeyCode["KeyT"] = 50] = "KeyT";
        KeyCode[KeyCode["KeyU"] = 51] = "KeyU";
        KeyCode[KeyCode["KeyV"] = 52] = "KeyV";
        KeyCode[KeyCode["KeyW"] = 53] = "KeyW";
        KeyCode[KeyCode["KeyX"] = 54] = "KeyX";
        KeyCode[KeyCode["KeyY"] = 55] = "KeyY";
        KeyCode[KeyCode["KeyZ"] = 56] = "KeyZ";
        KeyCode[KeyCode["Meta"] = 57] = "Meta";
        KeyCode[KeyCode["ContextMenu"] = 58] = "ContextMenu";
        KeyCode[KeyCode["F1"] = 59] = "F1";
        KeyCode[KeyCode["F2"] = 60] = "F2";
        KeyCode[KeyCode["F3"] = 61] = "F3";
        KeyCode[KeyCode["F4"] = 62] = "F4";
        KeyCode[KeyCode["F5"] = 63] = "F5";
        KeyCode[KeyCode["F6"] = 64] = "F6";
        KeyCode[KeyCode["F7"] = 65] = "F7";
        KeyCode[KeyCode["F8"] = 66] = "F8";
        KeyCode[KeyCode["F9"] = 67] = "F9";
        KeyCode[KeyCode["F10"] = 68] = "F10";
        KeyCode[KeyCode["F11"] = 69] = "F11";
        KeyCode[KeyCode["F12"] = 70] = "F12";
        KeyCode[KeyCode["F13"] = 71] = "F13";
        KeyCode[KeyCode["F14"] = 72] = "F14";
        KeyCode[KeyCode["F15"] = 73] = "F15";
        KeyCode[KeyCode["F16"] = 74] = "F16";
        KeyCode[KeyCode["F17"] = 75] = "F17";
        KeyCode[KeyCode["F18"] = 76] = "F18";
        KeyCode[KeyCode["F19"] = 77] = "F19";
        KeyCode[KeyCode["F20"] = 78] = "F20";
        KeyCode[KeyCode["F21"] = 79] = "F21";
        KeyCode[KeyCode["F22"] = 80] = "F22";
        KeyCode[KeyCode["F23"] = 81] = "F23";
        KeyCode[KeyCode["F24"] = 82] = "F24";
        KeyCode[KeyCode["NumLock"] = 83] = "NumLock";
        KeyCode[KeyCode["ScrollLock"] = 84] = "ScrollLock";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ';:' key
         */
        KeyCode[KeyCode["Semicolon"] = 85] = "Semicolon";
        /**
         * For any country/region, the '+' key
         * For the US standard keyboard, the '=+' key
         */
        KeyCode[KeyCode["Equal"] = 86] = "Equal";
        /**
         * For any country/region, the ',' key
         * For the US standard keyboard, the ',<' key
         */
        KeyCode[KeyCode["Comma"] = 87] = "Comma";
        /**
         * For any country/region, the '-' key
         * For the US standard keyboard, the '-_' key
         */
        KeyCode[KeyCode["Minus"] = 88] = "Minus";
        /**
         * For any country/region, the '.' key
         * For the US standard keyboard, the '.>' key
         */
        KeyCode[KeyCode["Period"] = 89] = "Period";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '/?' key
         */
        KeyCode[KeyCode["Slash"] = 90] = "Slash";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '`~' key
         */
        KeyCode[KeyCode["Backquote"] = 91] = "Backquote";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '[{' key
         */
        KeyCode[KeyCode["BracketLeft"] = 92] = "BracketLeft";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '\|' key
         */
        KeyCode[KeyCode["Backslash"] = 93] = "Backslash";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ']}' key
         */
        KeyCode[KeyCode["BracketRight"] = 94] = "BracketRight";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ''"' key
         */
        KeyCode[KeyCode["Quote"] = 95] = "Quote";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         */
        KeyCode[KeyCode["OEM_8"] = 96] = "OEM_8";
        /**
         * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
         */
        KeyCode[KeyCode["IntlBackslash"] = 97] = "IntlBackslash";
        KeyCode[KeyCode["Numpad0"] = 98] = "Numpad0";
        KeyCode[KeyCode["Numpad1"] = 99] = "Numpad1";
        KeyCode[KeyCode["Numpad2"] = 100] = "Numpad2";
        KeyCode[KeyCode["Numpad3"] = 101] = "Numpad3";
        KeyCode[KeyCode["Numpad4"] = 102] = "Numpad4";
        KeyCode[KeyCode["Numpad5"] = 103] = "Numpad5";
        KeyCode[KeyCode["Numpad6"] = 104] = "Numpad6";
        KeyCode[KeyCode["Numpad7"] = 105] = "Numpad7";
        KeyCode[KeyCode["Numpad8"] = 106] = "Numpad8";
        KeyCode[KeyCode["Numpad9"] = 107] = "Numpad9";
        KeyCode[KeyCode["NumpadMultiply"] = 108] = "NumpadMultiply";
        KeyCode[KeyCode["NumpadAdd"] = 109] = "NumpadAdd";
        KeyCode[KeyCode["NUMPAD_SEPARATOR"] = 110] = "NUMPAD_SEPARATOR";
        KeyCode[KeyCode["NumpadSubtract"] = 111] = "NumpadSubtract";
        KeyCode[KeyCode["NumpadDecimal"] = 112] = "NumpadDecimal";
        KeyCode[KeyCode["NumpadDivide"] = 113] = "NumpadDivide";
        /**
         * Cover all key codes when IME is processing input.
         */
        KeyCode[KeyCode["KEY_IN_COMPOSITION"] = 114] = "KEY_IN_COMPOSITION";
        KeyCode[KeyCode["ABNT_C1"] = 115] = "ABNT_C1";
        KeyCode[KeyCode["ABNT_C2"] = 116] = "ABNT_C2";
        KeyCode[KeyCode["AudioVolumeMute"] = 117] = "AudioVolumeMute";
        KeyCode[KeyCode["AudioVolumeUp"] = 118] = "AudioVolumeUp";
        KeyCode[KeyCode["AudioVolumeDown"] = 119] = "AudioVolumeDown";
        KeyCode[KeyCode["BrowserSearch"] = 120] = "BrowserSearch";
        KeyCode[KeyCode["BrowserHome"] = 121] = "BrowserHome";
        KeyCode[KeyCode["BrowserBack"] = 122] = "BrowserBack";
        KeyCode[KeyCode["BrowserForward"] = 123] = "BrowserForward";
        KeyCode[KeyCode["MediaTrackNext"] = 124] = "MediaTrackNext";
        KeyCode[KeyCode["MediaTrackPrevious"] = 125] = "MediaTrackPrevious";
        KeyCode[KeyCode["MediaStop"] = 126] = "MediaStop";
        KeyCode[KeyCode["MediaPlayPause"] = 127] = "MediaPlayPause";
        KeyCode[KeyCode["LaunchMediaPlayer"] = 128] = "LaunchMediaPlayer";
        KeyCode[KeyCode["LaunchMail"] = 129] = "LaunchMail";
        KeyCode[KeyCode["LaunchApp2"] = 130] = "LaunchApp2";
        /**
         * VK_CLEAR, 0x0C, CLEAR key
         */
        KeyCode[KeyCode["Clear"] = 131] = "Clear";
        /**
         * Placed last to cover the length of the enum.
         * Please do not depend on this value!
         */
        KeyCode[KeyCode["MAX_VALUE"] = 132] = "MAX_VALUE";
    })(KeyCode || (exports.KeyCode = KeyCode = {}));
    /**
     * keyboardEvent.code
     */
    var ScanCode;
    (function (ScanCode) {
        ScanCode[ScanCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
        ScanCode[ScanCode["None"] = 0] = "None";
        ScanCode[ScanCode["Hyper"] = 1] = "Hyper";
        ScanCode[ScanCode["Super"] = 2] = "Super";
        ScanCode[ScanCode["Fn"] = 3] = "Fn";
        ScanCode[ScanCode["FnLock"] = 4] = "FnLock";
        ScanCode[ScanCode["Suspend"] = 5] = "Suspend";
        ScanCode[ScanCode["Resume"] = 6] = "Resume";
        ScanCode[ScanCode["Turbo"] = 7] = "Turbo";
        ScanCode[ScanCode["Sleep"] = 8] = "Sleep";
        ScanCode[ScanCode["WakeUp"] = 9] = "WakeUp";
        ScanCode[ScanCode["KeyA"] = 10] = "KeyA";
        ScanCode[ScanCode["KeyB"] = 11] = "KeyB";
        ScanCode[ScanCode["KeyC"] = 12] = "KeyC";
        ScanCode[ScanCode["KeyD"] = 13] = "KeyD";
        ScanCode[ScanCode["KeyE"] = 14] = "KeyE";
        ScanCode[ScanCode["KeyF"] = 15] = "KeyF";
        ScanCode[ScanCode["KeyG"] = 16] = "KeyG";
        ScanCode[ScanCode["KeyH"] = 17] = "KeyH";
        ScanCode[ScanCode["KeyI"] = 18] = "KeyI";
        ScanCode[ScanCode["KeyJ"] = 19] = "KeyJ";
        ScanCode[ScanCode["KeyK"] = 20] = "KeyK";
        ScanCode[ScanCode["KeyL"] = 21] = "KeyL";
        ScanCode[ScanCode["KeyM"] = 22] = "KeyM";
        ScanCode[ScanCode["KeyN"] = 23] = "KeyN";
        ScanCode[ScanCode["KeyO"] = 24] = "KeyO";
        ScanCode[ScanCode["KeyP"] = 25] = "KeyP";
        ScanCode[ScanCode["KeyQ"] = 26] = "KeyQ";
        ScanCode[ScanCode["KeyR"] = 27] = "KeyR";
        ScanCode[ScanCode["KeyS"] = 28] = "KeyS";
        ScanCode[ScanCode["KeyT"] = 29] = "KeyT";
        ScanCode[ScanCode["KeyU"] = 30] = "KeyU";
        ScanCode[ScanCode["KeyV"] = 31] = "KeyV";
        ScanCode[ScanCode["KeyW"] = 32] = "KeyW";
        ScanCode[ScanCode["KeyX"] = 33] = "KeyX";
        ScanCode[ScanCode["KeyY"] = 34] = "KeyY";
        ScanCode[ScanCode["KeyZ"] = 35] = "KeyZ";
        ScanCode[ScanCode["Digit1"] = 36] = "Digit1";
        ScanCode[ScanCode["Digit2"] = 37] = "Digit2";
        ScanCode[ScanCode["Digit3"] = 38] = "Digit3";
        ScanCode[ScanCode["Digit4"] = 39] = "Digit4";
        ScanCode[ScanCode["Digit5"] = 40] = "Digit5";
        ScanCode[ScanCode["Digit6"] = 41] = "Digit6";
        ScanCode[ScanCode["Digit7"] = 42] = "Digit7";
        ScanCode[ScanCode["Digit8"] = 43] = "Digit8";
        ScanCode[ScanCode["Digit9"] = 44] = "Digit9";
        ScanCode[ScanCode["Digit0"] = 45] = "Digit0";
        ScanCode[ScanCode["Enter"] = 46] = "Enter";
        ScanCode[ScanCode["Escape"] = 47] = "Escape";
        ScanCode[ScanCode["Backspace"] = 48] = "Backspace";
        ScanCode[ScanCode["Tab"] = 49] = "Tab";
        ScanCode[ScanCode["Space"] = 50] = "Space";
        ScanCode[ScanCode["Minus"] = 51] = "Minus";
        ScanCode[ScanCode["Equal"] = 52] = "Equal";
        ScanCode[ScanCode["BracketLeft"] = 53] = "BracketLeft";
        ScanCode[ScanCode["BracketRight"] = 54] = "BracketRight";
        ScanCode[ScanCode["Backslash"] = 55] = "Backslash";
        ScanCode[ScanCode["IntlHash"] = 56] = "IntlHash";
        ScanCode[ScanCode["Semicolon"] = 57] = "Semicolon";
        ScanCode[ScanCode["Quote"] = 58] = "Quote";
        ScanCode[ScanCode["Backquote"] = 59] = "Backquote";
        ScanCode[ScanCode["Comma"] = 60] = "Comma";
        ScanCode[ScanCode["Period"] = 61] = "Period";
        ScanCode[ScanCode["Slash"] = 62] = "Slash";
        ScanCode[ScanCode["CapsLock"] = 63] = "CapsLock";
        ScanCode[ScanCode["F1"] = 64] = "F1";
        ScanCode[ScanCode["F2"] = 65] = "F2";
        ScanCode[ScanCode["F3"] = 66] = "F3";
        ScanCode[ScanCode["F4"] = 67] = "F4";
        ScanCode[ScanCode["F5"] = 68] = "F5";
        ScanCode[ScanCode["F6"] = 69] = "F6";
        ScanCode[ScanCode["F7"] = 70] = "F7";
        ScanCode[ScanCode["F8"] = 71] = "F8";
        ScanCode[ScanCode["F9"] = 72] = "F9";
        ScanCode[ScanCode["F10"] = 73] = "F10";
        ScanCode[ScanCode["F11"] = 74] = "F11";
        ScanCode[ScanCode["F12"] = 75] = "F12";
        ScanCode[ScanCode["PrintScreen"] = 76] = "PrintScreen";
        ScanCode[ScanCode["ScrollLock"] = 77] = "ScrollLock";
        ScanCode[ScanCode["Pause"] = 78] = "Pause";
        ScanCode[ScanCode["Insert"] = 79] = "Insert";
        ScanCode[ScanCode["Home"] = 80] = "Home";
        ScanCode[ScanCode["PageUp"] = 81] = "PageUp";
        ScanCode[ScanCode["Delete"] = 82] = "Delete";
        ScanCode[ScanCode["End"] = 83] = "End";
        ScanCode[ScanCode["PageDown"] = 84] = "PageDown";
        ScanCode[ScanCode["ArrowRight"] = 85] = "ArrowRight";
        ScanCode[ScanCode["ArrowLeft"] = 86] = "ArrowLeft";
        ScanCode[ScanCode["ArrowDown"] = 87] = "ArrowDown";
        ScanCode[ScanCode["ArrowUp"] = 88] = "ArrowUp";
        ScanCode[ScanCode["NumLock"] = 89] = "NumLock";
        ScanCode[ScanCode["NumpadDivide"] = 90] = "NumpadDivide";
        ScanCode[ScanCode["NumpadMultiply"] = 91] = "NumpadMultiply";
        ScanCode[ScanCode["NumpadSubtract"] = 92] = "NumpadSubtract";
        ScanCode[ScanCode["NumpadAdd"] = 93] = "NumpadAdd";
        ScanCode[ScanCode["NumpadEnter"] = 94] = "NumpadEnter";
        ScanCode[ScanCode["Numpad1"] = 95] = "Numpad1";
        ScanCode[ScanCode["Numpad2"] = 96] = "Numpad2";
        ScanCode[ScanCode["Numpad3"] = 97] = "Numpad3";
        ScanCode[ScanCode["Numpad4"] = 98] = "Numpad4";
        ScanCode[ScanCode["Numpad5"] = 99] = "Numpad5";
        ScanCode[ScanCode["Numpad6"] = 100] = "Numpad6";
        ScanCode[ScanCode["Numpad7"] = 101] = "Numpad7";
        ScanCode[ScanCode["Numpad8"] = 102] = "Numpad8";
        ScanCode[ScanCode["Numpad9"] = 103] = "Numpad9";
        ScanCode[ScanCode["Numpad0"] = 104] = "Numpad0";
        ScanCode[ScanCode["NumpadDecimal"] = 105] = "NumpadDecimal";
        ScanCode[ScanCode["IntlBackslash"] = 106] = "IntlBackslash";
        ScanCode[ScanCode["ContextMenu"] = 107] = "ContextMenu";
        ScanCode[ScanCode["Power"] = 108] = "Power";
        ScanCode[ScanCode["NumpadEqual"] = 109] = "NumpadEqual";
        ScanCode[ScanCode["F13"] = 110] = "F13";
        ScanCode[ScanCode["F14"] = 111] = "F14";
        ScanCode[ScanCode["F15"] = 112] = "F15";
        ScanCode[ScanCode["F16"] = 113] = "F16";
        ScanCode[ScanCode["F17"] = 114] = "F17";
        ScanCode[ScanCode["F18"] = 115] = "F18";
        ScanCode[ScanCode["F19"] = 116] = "F19";
        ScanCode[ScanCode["F20"] = 117] = "F20";
        ScanCode[ScanCode["F21"] = 118] = "F21";
        ScanCode[ScanCode["F22"] = 119] = "F22";
        ScanCode[ScanCode["F23"] = 120] = "F23";
        ScanCode[ScanCode["F24"] = 121] = "F24";
        ScanCode[ScanCode["Open"] = 122] = "Open";
        ScanCode[ScanCode["Help"] = 123] = "Help";
        ScanCode[ScanCode["Select"] = 124] = "Select";
        ScanCode[ScanCode["Again"] = 125] = "Again";
        ScanCode[ScanCode["Undo"] = 126] = "Undo";
        ScanCode[ScanCode["Cut"] = 127] = "Cut";
        ScanCode[ScanCode["Copy"] = 128] = "Copy";
        ScanCode[ScanCode["Paste"] = 129] = "Paste";
        ScanCode[ScanCode["Find"] = 130] = "Find";
        ScanCode[ScanCode["AudioVolumeMute"] = 131] = "AudioVolumeMute";
        ScanCode[ScanCode["AudioVolumeUp"] = 132] = "AudioVolumeUp";
        ScanCode[ScanCode["AudioVolumeDown"] = 133] = "AudioVolumeDown";
        ScanCode[ScanCode["NumpadComma"] = 134] = "NumpadComma";
        ScanCode[ScanCode["IntlRo"] = 135] = "IntlRo";
        ScanCode[ScanCode["KanaMode"] = 136] = "KanaMode";
        ScanCode[ScanCode["IntlYen"] = 137] = "IntlYen";
        ScanCode[ScanCode["Convert"] = 138] = "Convert";
        ScanCode[ScanCode["NonConvert"] = 139] = "NonConvert";
        ScanCode[ScanCode["Lang1"] = 140] = "Lang1";
        ScanCode[ScanCode["Lang2"] = 141] = "Lang2";
        ScanCode[ScanCode["Lang3"] = 142] = "Lang3";
        ScanCode[ScanCode["Lang4"] = 143] = "Lang4";
        ScanCode[ScanCode["Lang5"] = 144] = "Lang5";
        ScanCode[ScanCode["Abort"] = 145] = "Abort";
        ScanCode[ScanCode["Props"] = 146] = "Props";
        ScanCode[ScanCode["NumpadParenLeft"] = 147] = "NumpadParenLeft";
        ScanCode[ScanCode["NumpadParenRight"] = 148] = "NumpadParenRight";
        ScanCode[ScanCode["NumpadBackspace"] = 149] = "NumpadBackspace";
        ScanCode[ScanCode["NumpadMemoryStore"] = 150] = "NumpadMemoryStore";
        ScanCode[ScanCode["NumpadMemoryRecall"] = 151] = "NumpadMemoryRecall";
        ScanCode[ScanCode["NumpadMemoryClear"] = 152] = "NumpadMemoryClear";
        ScanCode[ScanCode["NumpadMemoryAdd"] = 153] = "NumpadMemoryAdd";
        ScanCode[ScanCode["NumpadMemorySubtract"] = 154] = "NumpadMemorySubtract";
        ScanCode[ScanCode["NumpadClear"] = 155] = "NumpadClear";
        ScanCode[ScanCode["NumpadClearEntry"] = 156] = "NumpadClearEntry";
        ScanCode[ScanCode["ControlLeft"] = 157] = "ControlLeft";
        ScanCode[ScanCode["ShiftLeft"] = 158] = "ShiftLeft";
        ScanCode[ScanCode["AltLeft"] = 159] = "AltLeft";
        ScanCode[ScanCode["MetaLeft"] = 160] = "MetaLeft";
        ScanCode[ScanCode["ControlRight"] = 161] = "ControlRight";
        ScanCode[ScanCode["ShiftRight"] = 162] = "ShiftRight";
        ScanCode[ScanCode["AltRight"] = 163] = "AltRight";
        ScanCode[ScanCode["MetaRight"] = 164] = "MetaRight";
        ScanCode[ScanCode["BrightnessUp"] = 165] = "BrightnessUp";
        ScanCode[ScanCode["BrightnessDown"] = 166] = "BrightnessDown";
        ScanCode[ScanCode["MediaPlay"] = 167] = "MediaPlay";
        ScanCode[ScanCode["MediaRecord"] = 168] = "MediaRecord";
        ScanCode[ScanCode["MediaFastForward"] = 169] = "MediaFastForward";
        ScanCode[ScanCode["MediaRewind"] = 170] = "MediaRewind";
        ScanCode[ScanCode["MediaTrackNext"] = 171] = "MediaTrackNext";
        ScanCode[ScanCode["MediaTrackPrevious"] = 172] = "MediaTrackPrevious";
        ScanCode[ScanCode["MediaStop"] = 173] = "MediaStop";
        ScanCode[ScanCode["Eject"] = 174] = "Eject";
        ScanCode[ScanCode["MediaPlayPause"] = 175] = "MediaPlayPause";
        ScanCode[ScanCode["MediaSelect"] = 176] = "MediaSelect";
        ScanCode[ScanCode["LaunchMail"] = 177] = "LaunchMail";
        ScanCode[ScanCode["LaunchApp2"] = 178] = "LaunchApp2";
        ScanCode[ScanCode["LaunchApp1"] = 179] = "LaunchApp1";
        ScanCode[ScanCode["SelectTask"] = 180] = "SelectTask";
        ScanCode[ScanCode["LaunchScreenSaver"] = 181] = "LaunchScreenSaver";
        ScanCode[ScanCode["BrowserSearch"] = 182] = "BrowserSearch";
        ScanCode[ScanCode["BrowserHome"] = 183] = "BrowserHome";
        ScanCode[ScanCode["BrowserBack"] = 184] = "BrowserBack";
        ScanCode[ScanCode["BrowserForward"] = 185] = "BrowserForward";
        ScanCode[ScanCode["BrowserStop"] = 186] = "BrowserStop";
        ScanCode[ScanCode["BrowserRefresh"] = 187] = "BrowserRefresh";
        ScanCode[ScanCode["BrowserFavorites"] = 188] = "BrowserFavorites";
        ScanCode[ScanCode["ZoomToggle"] = 189] = "ZoomToggle";
        ScanCode[ScanCode["MailReply"] = 190] = "MailReply";
        ScanCode[ScanCode["MailForward"] = 191] = "MailForward";
        ScanCode[ScanCode["MailSend"] = 192] = "MailSend";
        ScanCode[ScanCode["MAX_VALUE"] = 193] = "MAX_VALUE";
    })(ScanCode || (exports.ScanCode = ScanCode = {}));
    class KeyCodeStrMap {
        constructor() {
            this._keyCodeToStr = [];
            this._strToKeyCode = Object.create(null);
        }
        define(keyCode, str) {
            this._keyCodeToStr[keyCode] = str;
            this._strToKeyCode[str.toLowerCase()] = keyCode;
        }
        keyCodeToStr(keyCode) {
            return this._keyCodeToStr[keyCode];
        }
        strToKeyCode(str) {
            return this._strToKeyCode[str.toLowerCase()] || 0 /* KeyCode.Unknown */;
        }
    }
    const uiMap = new KeyCodeStrMap();
    const userSettingsUSMap = new KeyCodeStrMap();
    const userSettingsGeneralMap = new KeyCodeStrMap();
    exports.EVENT_KEY_CODE_MAP = new Array(230);
    exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
    const scanCodeIntToStr = [];
    const scanCodeStrToInt = Object.create(null);
    const scanCodeLowerCaseStrToInt = Object.create(null);
    exports.ScanCodeUtils = {
        lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0 /* ScanCode.None */,
        toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0 /* ScanCode.None */,
        toString: (scanCode) => scanCodeIntToStr[scanCode] || 'None'
    };
    /**
     * -1 if a ScanCode => KeyCode mapping depends on kb layout.
     */
    exports.IMMUTABLE_CODE_TO_KEY_CODE = [];
    /**
     * -1 if a KeyCode => ScanCode mapping depends on kb layout.
     */
    exports.IMMUTABLE_KEY_CODE_TO_CODE = [];
    for (let i = 0; i <= 193 /* ScanCode.MAX_VALUE */; i++) {
        exports.IMMUTABLE_CODE_TO_KEY_CODE[i] = -1 /* KeyCode.DependsOnKbLayout */;
    }
    for (let i = 0; i <= 132 /* KeyCode.MAX_VALUE */; i++) {
        exports.IMMUTABLE_KEY_CODE_TO_CODE[i] = -1 /* ScanCode.DependsOnKbLayout */;
    }
    (function () {
        // See https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
        // See https://github.com/microsoft/node-native-keymap/blob/88c0b0e5/deps/chromium/keyboard_codes_win.h
        const empty = '';
        const mappings = [
            // immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel
            [1, 0 /* ScanCode.None */, 'None', 0 /* KeyCode.Unknown */, 'unknown', 0, 'VK_UNKNOWN', empty, empty],
            [1, 1 /* ScanCode.Hyper */, 'Hyper', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 2 /* ScanCode.Super */, 'Super', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 3 /* ScanCode.Fn */, 'Fn', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 4 /* ScanCode.FnLock */, 'FnLock', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 5 /* ScanCode.Suspend */, 'Suspend', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 6 /* ScanCode.Resume */, 'Resume', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 7 /* ScanCode.Turbo */, 'Turbo', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 8 /* ScanCode.Sleep */, 'Sleep', 0 /* KeyCode.Unknown */, empty, 0, 'VK_SLEEP', empty, empty],
            [1, 9 /* ScanCode.WakeUp */, 'WakeUp', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [0, 10 /* ScanCode.KeyA */, 'KeyA', 31 /* KeyCode.KeyA */, 'A', 65, 'VK_A', empty, empty],
            [0, 11 /* ScanCode.KeyB */, 'KeyB', 32 /* KeyCode.KeyB */, 'B', 66, 'VK_B', empty, empty],
            [0, 12 /* ScanCode.KeyC */, 'KeyC', 33 /* KeyCode.KeyC */, 'C', 67, 'VK_C', empty, empty],
            [0, 13 /* ScanCode.KeyD */, 'KeyD', 34 /* KeyCode.KeyD */, 'D', 68, 'VK_D', empty, empty],
            [0, 14 /* ScanCode.KeyE */, 'KeyE', 35 /* KeyCode.KeyE */, 'E', 69, 'VK_E', empty, empty],
            [0, 15 /* ScanCode.KeyF */, 'KeyF', 36 /* KeyCode.KeyF */, 'F', 70, 'VK_F', empty, empty],
            [0, 16 /* ScanCode.KeyG */, 'KeyG', 37 /* KeyCode.KeyG */, 'G', 71, 'VK_G', empty, empty],
            [0, 17 /* ScanCode.KeyH */, 'KeyH', 38 /* KeyCode.KeyH */, 'H', 72, 'VK_H', empty, empty],
            [0, 18 /* ScanCode.KeyI */, 'KeyI', 39 /* KeyCode.KeyI */, 'I', 73, 'VK_I', empty, empty],
            [0, 19 /* ScanCode.KeyJ */, 'KeyJ', 40 /* KeyCode.KeyJ */, 'J', 74, 'VK_J', empty, empty],
            [0, 20 /* ScanCode.KeyK */, 'KeyK', 41 /* KeyCode.KeyK */, 'K', 75, 'VK_K', empty, empty],
            [0, 21 /* ScanCode.KeyL */, 'KeyL', 42 /* KeyCode.KeyL */, 'L', 76, 'VK_L', empty, empty],
            [0, 22 /* ScanCode.KeyM */, 'KeyM', 43 /* KeyCode.KeyM */, 'M', 77, 'VK_M', empty, empty],
            [0, 23 /* ScanCode.KeyN */, 'KeyN', 44 /* KeyCode.KeyN */, 'N', 78, 'VK_N', empty, empty],
            [0, 24 /* ScanCode.KeyO */, 'KeyO', 45 /* KeyCode.KeyO */, 'O', 79, 'VK_O', empty, empty],
            [0, 25 /* ScanCode.KeyP */, 'KeyP', 46 /* KeyCode.KeyP */, 'P', 80, 'VK_P', empty, empty],
            [0, 26 /* ScanCode.KeyQ */, 'KeyQ', 47 /* KeyCode.KeyQ */, 'Q', 81, 'VK_Q', empty, empty],
            [0, 27 /* ScanCode.KeyR */, 'KeyR', 48 /* KeyCode.KeyR */, 'R', 82, 'VK_R', empty, empty],
            [0, 28 /* ScanCode.KeyS */, 'KeyS', 49 /* KeyCode.KeyS */, 'S', 83, 'VK_S', empty, empty],
            [0, 29 /* ScanCode.KeyT */, 'KeyT', 50 /* KeyCode.KeyT */, 'T', 84, 'VK_T', empty, empty],
            [0, 30 /* ScanCode.KeyU */, 'KeyU', 51 /* KeyCode.KeyU */, 'U', 85, 'VK_U', empty, empty],
            [0, 31 /* ScanCode.KeyV */, 'KeyV', 52 /* KeyCode.KeyV */, 'V', 86, 'VK_V', empty, empty],
            [0, 32 /* ScanCode.KeyW */, 'KeyW', 53 /* KeyCode.KeyW */, 'W', 87, 'VK_W', empty, empty],
            [0, 33 /* ScanCode.KeyX */, 'KeyX', 54 /* KeyCode.KeyX */, 'X', 88, 'VK_X', empty, empty],
            [0, 34 /* ScanCode.KeyY */, 'KeyY', 55 /* KeyCode.KeyY */, 'Y', 89, 'VK_Y', empty, empty],
            [0, 35 /* ScanCode.KeyZ */, 'KeyZ', 56 /* KeyCode.KeyZ */, 'Z', 90, 'VK_Z', empty, empty],
            [0, 36 /* ScanCode.Digit1 */, 'Digit1', 22 /* KeyCode.Digit1 */, '1', 49, 'VK_1', empty, empty],
            [0, 37 /* ScanCode.Digit2 */, 'Digit2', 23 /* KeyCode.Digit2 */, '2', 50, 'VK_2', empty, empty],
            [0, 38 /* ScanCode.Digit3 */, 'Digit3', 24 /* KeyCode.Digit3 */, '3', 51, 'VK_3', empty, empty],
            [0, 39 /* ScanCode.Digit4 */, 'Digit4', 25 /* KeyCode.Digit4 */, '4', 52, 'VK_4', empty, empty],
            [0, 40 /* ScanCode.Digit5 */, 'Digit5', 26 /* KeyCode.Digit5 */, '5', 53, 'VK_5', empty, empty],
            [0, 41 /* ScanCode.Digit6 */, 'Digit6', 27 /* KeyCode.Digit6 */, '6', 54, 'VK_6', empty, empty],
            [0, 42 /* ScanCode.Digit7 */, 'Digit7', 28 /* KeyCode.Digit7 */, '7', 55, 'VK_7', empty, empty],
            [0, 43 /* ScanCode.Digit8 */, 'Digit8', 29 /* KeyCode.Digit8 */, '8', 56, 'VK_8', empty, empty],
            [0, 44 /* ScanCode.Digit9 */, 'Digit9', 30 /* KeyCode.Digit9 */, '9', 57, 'VK_9', empty, empty],
            [0, 45 /* ScanCode.Digit0 */, 'Digit0', 21 /* KeyCode.Digit0 */, '0', 48, 'VK_0', empty, empty],
            [1, 46 /* ScanCode.Enter */, 'Enter', 3 /* KeyCode.Enter */, 'Enter', 13, 'VK_RETURN', empty, empty],
            [1, 47 /* ScanCode.Escape */, 'Escape', 9 /* KeyCode.Escape */, 'Escape', 27, 'VK_ESCAPE', empty, empty],
            [1, 48 /* ScanCode.Backspace */, 'Backspace', 1 /* KeyCode.Backspace */, 'Backspace', 8, 'VK_BACK', empty, empty],
            [1, 49 /* ScanCode.Tab */, 'Tab', 2 /* KeyCode.Tab */, 'Tab', 9, 'VK_TAB', empty, empty],
            [1, 50 /* ScanCode.Space */, 'Space', 10 /* KeyCode.Space */, 'Space', 32, 'VK_SPACE', empty, empty],
            [0, 51 /* ScanCode.Minus */, 'Minus', 88 /* KeyCode.Minus */, '-', 189, 'VK_OEM_MINUS', '-', 'OEM_MINUS'],
            [0, 52 /* ScanCode.Equal */, 'Equal', 86 /* KeyCode.Equal */, '=', 187, 'VK_OEM_PLUS', '=', 'OEM_PLUS'],
            [0, 53 /* ScanCode.BracketLeft */, 'BracketLeft', 92 /* KeyCode.BracketLeft */, '[', 219, 'VK_OEM_4', '[', 'OEM_4'],
            [0, 54 /* ScanCode.BracketRight */, 'BracketRight', 94 /* KeyCode.BracketRight */, ']', 221, 'VK_OEM_6', ']', 'OEM_6'],
            [0, 55 /* ScanCode.Backslash */, 'Backslash', 93 /* KeyCode.Backslash */, '\\', 220, 'VK_OEM_5', '\\', 'OEM_5'],
            [0, 56 /* ScanCode.IntlHash */, 'IntlHash', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty], // has been dropped from the w3c spec
            [0, 57 /* ScanCode.Semicolon */, 'Semicolon', 85 /* KeyCode.Semicolon */, ';', 186, 'VK_OEM_1', ';', 'OEM_1'],
            [0, 58 /* ScanCode.Quote */, 'Quote', 95 /* KeyCode.Quote */, '\'', 222, 'VK_OEM_7', '\'', 'OEM_7'],
            [0, 59 /* ScanCode.Backquote */, 'Backquote', 91 /* KeyCode.Backquote */, '`', 192, 'VK_OEM_3', '`', 'OEM_3'],
            [0, 60 /* ScanCode.Comma */, 'Comma', 87 /* KeyCode.Comma */, ',', 188, 'VK_OEM_COMMA', ',', 'OEM_COMMA'],
            [0, 61 /* ScanCode.Period */, 'Period', 89 /* KeyCode.Period */, '.', 190, 'VK_OEM_PERIOD', '.', 'OEM_PERIOD'],
            [0, 62 /* ScanCode.Slash */, 'Slash', 90 /* KeyCode.Slash */, '/', 191, 'VK_OEM_2', '/', 'OEM_2'],
            [1, 63 /* ScanCode.CapsLock */, 'CapsLock', 8 /* KeyCode.CapsLock */, 'CapsLock', 20, 'VK_CAPITAL', empty, empty],
            [1, 64 /* ScanCode.F1 */, 'F1', 59 /* KeyCode.F1 */, 'F1', 112, 'VK_F1', empty, empty],
            [1, 65 /* ScanCode.F2 */, 'F2', 60 /* KeyCode.F2 */, 'F2', 113, 'VK_F2', empty, empty],
            [1, 66 /* ScanCode.F3 */, 'F3', 61 /* KeyCode.F3 */, 'F3', 114, 'VK_F3', empty, empty],
            [1, 67 /* ScanCode.F4 */, 'F4', 62 /* KeyCode.F4 */, 'F4', 115, 'VK_F4', empty, empty],
            [1, 68 /* ScanCode.F5 */, 'F5', 63 /* KeyCode.F5 */, 'F5', 116, 'VK_F5', empty, empty],
            [1, 69 /* ScanCode.F6 */, 'F6', 64 /* KeyCode.F6 */, 'F6', 117, 'VK_F6', empty, empty],
            [1, 70 /* ScanCode.F7 */, 'F7', 65 /* KeyCode.F7 */, 'F7', 118, 'VK_F7', empty, empty],
            [1, 71 /* ScanCode.F8 */, 'F8', 66 /* KeyCode.F8 */, 'F8', 119, 'VK_F8', empty, empty],
            [1, 72 /* ScanCode.F9 */, 'F9', 67 /* KeyCode.F9 */, 'F9', 120, 'VK_F9', empty, empty],
            [1, 73 /* ScanCode.F10 */, 'F10', 68 /* KeyCode.F10 */, 'F10', 121, 'VK_F10', empty, empty],
            [1, 74 /* ScanCode.F11 */, 'F11', 69 /* KeyCode.F11 */, 'F11', 122, 'VK_F11', empty, empty],
            [1, 75 /* ScanCode.F12 */, 'F12', 70 /* KeyCode.F12 */, 'F12', 123, 'VK_F12', empty, empty],
            [1, 76 /* ScanCode.PrintScreen */, 'PrintScreen', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 77 /* ScanCode.ScrollLock */, 'ScrollLock', 84 /* KeyCode.ScrollLock */, 'ScrollLock', 145, 'VK_SCROLL', empty, empty],
            [1, 78 /* ScanCode.Pause */, 'Pause', 7 /* KeyCode.PauseBreak */, 'PauseBreak', 19, 'VK_PAUSE', empty, empty],
            [1, 79 /* ScanCode.Insert */, 'Insert', 19 /* KeyCode.Insert */, 'Insert', 45, 'VK_INSERT', empty, empty],
            [1, 80 /* ScanCode.Home */, 'Home', 14 /* KeyCode.Home */, 'Home', 36, 'VK_HOME', empty, empty],
            [1, 81 /* ScanCode.PageUp */, 'PageUp', 11 /* KeyCode.PageUp */, 'PageUp', 33, 'VK_PRIOR', empty, empty],
            [1, 82 /* ScanCode.Delete */, 'Delete', 20 /* KeyCode.Delete */, 'Delete', 46, 'VK_DELETE', empty, empty],
            [1, 83 /* ScanCode.End */, 'End', 13 /* KeyCode.End */, 'End', 35, 'VK_END', empty, empty],
            [1, 84 /* ScanCode.PageDown */, 'PageDown', 12 /* KeyCode.PageDown */, 'PageDown', 34, 'VK_NEXT', empty, empty],
            [1, 85 /* ScanCode.ArrowRight */, 'ArrowRight', 17 /* KeyCode.RightArrow */, 'RightArrow', 39, 'VK_RIGHT', 'Right', empty],
            [1, 86 /* ScanCode.ArrowLeft */, 'ArrowLeft', 15 /* KeyCode.LeftArrow */, 'LeftArrow', 37, 'VK_LEFT', 'Left', empty],
            [1, 87 /* ScanCode.ArrowDown */, 'ArrowDown', 18 /* KeyCode.DownArrow */, 'DownArrow', 40, 'VK_DOWN', 'Down', empty],
            [1, 88 /* ScanCode.ArrowUp */, 'ArrowUp', 16 /* KeyCode.UpArrow */, 'UpArrow', 38, 'VK_UP', 'Up', empty],
            [1, 89 /* ScanCode.NumLock */, 'NumLock', 83 /* KeyCode.NumLock */, 'NumLock', 144, 'VK_NUMLOCK', empty, empty],
            [1, 90 /* ScanCode.NumpadDivide */, 'NumpadDivide', 113 /* KeyCode.NumpadDivide */, 'NumPad_Divide', 111, 'VK_DIVIDE', empty, empty],
            [1, 91 /* ScanCode.NumpadMultiply */, 'NumpadMultiply', 108 /* KeyCode.NumpadMultiply */, 'NumPad_Multiply', 106, 'VK_MULTIPLY', empty, empty],
            [1, 92 /* ScanCode.NumpadSubtract */, 'NumpadSubtract', 111 /* KeyCode.NumpadSubtract */, 'NumPad_Subtract', 109, 'VK_SUBTRACT', empty, empty],
            [1, 93 /* ScanCode.NumpadAdd */, 'NumpadAdd', 109 /* KeyCode.NumpadAdd */, 'NumPad_Add', 107, 'VK_ADD', empty, empty],
            [1, 94 /* ScanCode.NumpadEnter */, 'NumpadEnter', 3 /* KeyCode.Enter */, empty, 0, empty, empty, empty],
            [1, 95 /* ScanCode.Numpad1 */, 'Numpad1', 99 /* KeyCode.Numpad1 */, 'NumPad1', 97, 'VK_NUMPAD1', empty, empty],
            [1, 96 /* ScanCode.Numpad2 */, 'Numpad2', 100 /* KeyCode.Numpad2 */, 'NumPad2', 98, 'VK_NUMPAD2', empty, empty],
            [1, 97 /* ScanCode.Numpad3 */, 'Numpad3', 101 /* KeyCode.Numpad3 */, 'NumPad3', 99, 'VK_NUMPAD3', empty, empty],
            [1, 98 /* ScanCode.Numpad4 */, 'Numpad4', 102 /* KeyCode.Numpad4 */, 'NumPad4', 100, 'VK_NUMPAD4', empty, empty],
            [1, 99 /* ScanCode.Numpad5 */, 'Numpad5', 103 /* KeyCode.Numpad5 */, 'NumPad5', 101, 'VK_NUMPAD5', empty, empty],
            [1, 100 /* ScanCode.Numpad6 */, 'Numpad6', 104 /* KeyCode.Numpad6 */, 'NumPad6', 102, 'VK_NUMPAD6', empty, empty],
            [1, 101 /* ScanCode.Numpad7 */, 'Numpad7', 105 /* KeyCode.Numpad7 */, 'NumPad7', 103, 'VK_NUMPAD7', empty, empty],
            [1, 102 /* ScanCode.Numpad8 */, 'Numpad8', 106 /* KeyCode.Numpad8 */, 'NumPad8', 104, 'VK_NUMPAD8', empty, empty],
            [1, 103 /* ScanCode.Numpad9 */, 'Numpad9', 107 /* KeyCode.Numpad9 */, 'NumPad9', 105, 'VK_NUMPAD9', empty, empty],
            [1, 104 /* ScanCode.Numpad0 */, 'Numpad0', 98 /* KeyCode.Numpad0 */, 'NumPad0', 96, 'VK_NUMPAD0', empty, empty],
            [1, 105 /* ScanCode.NumpadDecimal */, 'NumpadDecimal', 112 /* KeyCode.NumpadDecimal */, 'NumPad_Decimal', 110, 'VK_DECIMAL', empty, empty],
            [0, 106 /* ScanCode.IntlBackslash */, 'IntlBackslash', 97 /* KeyCode.IntlBackslash */, 'OEM_102', 226, 'VK_OEM_102', empty, empty],
            [1, 107 /* ScanCode.ContextMenu */, 'ContextMenu', 58 /* KeyCode.ContextMenu */, 'ContextMenu', 93, empty, empty, empty],
            [1, 108 /* ScanCode.Power */, 'Power', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 109 /* ScanCode.NumpadEqual */, 'NumpadEqual', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 110 /* ScanCode.F13 */, 'F13', 71 /* KeyCode.F13 */, 'F13', 124, 'VK_F13', empty, empty],
            [1, 111 /* ScanCode.F14 */, 'F14', 72 /* KeyCode.F14 */, 'F14', 125, 'VK_F14', empty, empty],
            [1, 112 /* ScanCode.F15 */, 'F15', 73 /* KeyCode.F15 */, 'F15', 126, 'VK_F15', empty, empty],
            [1, 113 /* ScanCode.F16 */, 'F16', 74 /* KeyCode.F16 */, 'F16', 127, 'VK_F16', empty, empty],
            [1, 114 /* ScanCode.F17 */, 'F17', 75 /* KeyCode.F17 */, 'F17', 128, 'VK_F17', empty, empty],
            [1, 115 /* ScanCode.F18 */, 'F18', 76 /* KeyCode.F18 */, 'F18', 129, 'VK_F18', empty, empty],
            [1, 116 /* ScanCode.F19 */, 'F19', 77 /* KeyCode.F19 */, 'F19', 130, 'VK_F19', empty, empty],
            [1, 117 /* ScanCode.F20 */, 'F20', 78 /* KeyCode.F20 */, 'F20', 131, 'VK_F20', empty, empty],
            [1, 118 /* ScanCode.F21 */, 'F21', 79 /* KeyCode.F21 */, 'F21', 132, 'VK_F21', empty, empty],
            [1, 119 /* ScanCode.F22 */, 'F22', 80 /* KeyCode.F22 */, 'F22', 133, 'VK_F22', empty, empty],
            [1, 120 /* ScanCode.F23 */, 'F23', 81 /* KeyCode.F23 */, 'F23', 134, 'VK_F23', empty, empty],
            [1, 121 /* ScanCode.F24 */, 'F24', 82 /* KeyCode.F24 */, 'F24', 135, 'VK_F24', empty, empty],
            [1, 122 /* ScanCode.Open */, 'Open', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 123 /* ScanCode.Help */, 'Help', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 124 /* ScanCode.Select */, 'Select', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 125 /* ScanCode.Again */, 'Again', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 126 /* ScanCode.Undo */, 'Undo', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 127 /* ScanCode.Cut */, 'Cut', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 128 /* ScanCode.Copy */, 'Copy', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 129 /* ScanCode.Paste */, 'Paste', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 130 /* ScanCode.Find */, 'Find', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 131 /* ScanCode.AudioVolumeMute */, 'AudioVolumeMute', 117 /* KeyCode.AudioVolumeMute */, 'AudioVolumeMute', 173, 'VK_VOLUME_MUTE', empty, empty],
            [1, 132 /* ScanCode.AudioVolumeUp */, 'AudioVolumeUp', 118 /* KeyCode.AudioVolumeUp */, 'AudioVolumeUp', 175, 'VK_VOLUME_UP', empty, empty],
            [1, 133 /* ScanCode.AudioVolumeDown */, 'AudioVolumeDown', 119 /* KeyCode.AudioVolumeDown */, 'AudioVolumeDown', 174, 'VK_VOLUME_DOWN', empty, empty],
            [1, 134 /* ScanCode.NumpadComma */, 'NumpadComma', 110 /* KeyCode.NUMPAD_SEPARATOR */, 'NumPad_Separator', 108, 'VK_SEPARATOR', empty, empty],
            [0, 135 /* ScanCode.IntlRo */, 'IntlRo', 115 /* KeyCode.ABNT_C1 */, 'ABNT_C1', 193, 'VK_ABNT_C1', empty, empty],
            [1, 136 /* ScanCode.KanaMode */, 'KanaMode', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [0, 137 /* ScanCode.IntlYen */, 'IntlYen', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 138 /* ScanCode.Convert */, 'Convert', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 139 /* ScanCode.NonConvert */, 'NonConvert', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 140 /* ScanCode.Lang1 */, 'Lang1', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 141 /* ScanCode.Lang2 */, 'Lang2', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 142 /* ScanCode.Lang3 */, 'Lang3', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 143 /* ScanCode.Lang4 */, 'Lang4', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 144 /* ScanCode.Lang5 */, 'Lang5', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 145 /* ScanCode.Abort */, 'Abort', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 146 /* ScanCode.Props */, 'Props', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 147 /* ScanCode.NumpadParenLeft */, 'NumpadParenLeft', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 148 /* ScanCode.NumpadParenRight */, 'NumpadParenRight', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 149 /* ScanCode.NumpadBackspace */, 'NumpadBackspace', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 150 /* ScanCode.NumpadMemoryStore */, 'NumpadMemoryStore', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 151 /* ScanCode.NumpadMemoryRecall */, 'NumpadMemoryRecall', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 152 /* ScanCode.NumpadMemoryClear */, 'NumpadMemoryClear', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 153 /* ScanCode.NumpadMemoryAdd */, 'NumpadMemoryAdd', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 154 /* ScanCode.NumpadMemorySubtract */, 'NumpadMemorySubtract', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 155 /* ScanCode.NumpadClear */, 'NumpadClear', 131 /* KeyCode.Clear */, 'Clear', 12, 'VK_CLEAR', empty, empty],
            [1, 156 /* ScanCode.NumpadClearEntry */, 'NumpadClearEntry', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 0 /* ScanCode.None */, empty, 5 /* KeyCode.Ctrl */, 'Ctrl', 17, 'VK_CONTROL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 4 /* KeyCode.Shift */, 'Shift', 16, 'VK_SHIFT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 6 /* KeyCode.Alt */, 'Alt', 18, 'VK_MENU', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 57 /* KeyCode.Meta */, 'Meta', 91, 'VK_COMMAND', empty, empty],
            [1, 157 /* ScanCode.ControlLeft */, 'ControlLeft', 5 /* KeyCode.Ctrl */, empty, 0, 'VK_LCONTROL', empty, empty],
            [1, 158 /* ScanCode.ShiftLeft */, 'ShiftLeft', 4 /* KeyCode.Shift */, empty, 0, 'VK_LSHIFT', empty, empty],
            [1, 159 /* ScanCode.AltLeft */, 'AltLeft', 6 /* KeyCode.Alt */, empty, 0, 'VK_LMENU', empty, empty],
            [1, 160 /* ScanCode.MetaLeft */, 'MetaLeft', 57 /* KeyCode.Meta */, empty, 0, 'VK_LWIN', empty, empty],
            [1, 161 /* ScanCode.ControlRight */, 'ControlRight', 5 /* KeyCode.Ctrl */, empty, 0, 'VK_RCONTROL', empty, empty],
            [1, 162 /* ScanCode.ShiftRight */, 'ShiftRight', 4 /* KeyCode.Shift */, empty, 0, 'VK_RSHIFT', empty, empty],
            [1, 163 /* ScanCode.AltRight */, 'AltRight', 6 /* KeyCode.Alt */, empty, 0, 'VK_RMENU', empty, empty],
            [1, 164 /* ScanCode.MetaRight */, 'MetaRight', 57 /* KeyCode.Meta */, empty, 0, 'VK_RWIN', empty, empty],
            [1, 165 /* ScanCode.BrightnessUp */, 'BrightnessUp', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 166 /* ScanCode.BrightnessDown */, 'BrightnessDown', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 167 /* ScanCode.MediaPlay */, 'MediaPlay', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 168 /* ScanCode.MediaRecord */, 'MediaRecord', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 169 /* ScanCode.MediaFastForward */, 'MediaFastForward', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 170 /* ScanCode.MediaRewind */, 'MediaRewind', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 171 /* ScanCode.MediaTrackNext */, 'MediaTrackNext', 124 /* KeyCode.MediaTrackNext */, 'MediaTrackNext', 176, 'VK_MEDIA_NEXT_TRACK', empty, empty],
            [1, 172 /* ScanCode.MediaTrackPrevious */, 'MediaTrackPrevious', 125 /* KeyCode.MediaTrackPrevious */, 'MediaTrackPrevious', 177, 'VK_MEDIA_PREV_TRACK', empty, empty],
            [1, 173 /* ScanCode.MediaStop */, 'MediaStop', 126 /* KeyCode.MediaStop */, 'MediaStop', 178, 'VK_MEDIA_STOP', empty, empty],
            [1, 174 /* ScanCode.Eject */, 'Eject', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 175 /* ScanCode.MediaPlayPause */, 'MediaPlayPause', 127 /* KeyCode.MediaPlayPause */, 'MediaPlayPause', 179, 'VK_MEDIA_PLAY_PAUSE', empty, empty],
            [1, 176 /* ScanCode.MediaSelect */, 'MediaSelect', 128 /* KeyCode.LaunchMediaPlayer */, 'LaunchMediaPlayer', 181, 'VK_MEDIA_LAUNCH_MEDIA_SELECT', empty, empty],
            [1, 177 /* ScanCode.LaunchMail */, 'LaunchMail', 129 /* KeyCode.LaunchMail */, 'LaunchMail', 180, 'VK_MEDIA_LAUNCH_MAIL', empty, empty],
            [1, 178 /* ScanCode.LaunchApp2 */, 'LaunchApp2', 130 /* KeyCode.LaunchApp2 */, 'LaunchApp2', 183, 'VK_MEDIA_LAUNCH_APP2', empty, empty],
            [1, 179 /* ScanCode.LaunchApp1 */, 'LaunchApp1', 0 /* KeyCode.Unknown */, empty, 0, 'VK_MEDIA_LAUNCH_APP1', empty, empty],
            [1, 180 /* ScanCode.SelectTask */, 'SelectTask', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 181 /* ScanCode.LaunchScreenSaver */, 'LaunchScreenSaver', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 182 /* ScanCode.BrowserSearch */, 'BrowserSearch', 120 /* KeyCode.BrowserSearch */, 'BrowserSearch', 170, 'VK_BROWSER_SEARCH', empty, empty],
            [1, 183 /* ScanCode.BrowserHome */, 'BrowserHome', 121 /* KeyCode.BrowserHome */, 'BrowserHome', 172, 'VK_BROWSER_HOME', empty, empty],
            [1, 184 /* ScanCode.BrowserBack */, 'BrowserBack', 122 /* KeyCode.BrowserBack */, 'BrowserBack', 166, 'VK_BROWSER_BACK', empty, empty],
            [1, 185 /* ScanCode.BrowserForward */, 'BrowserForward', 123 /* KeyCode.BrowserForward */, 'BrowserForward', 167, 'VK_BROWSER_FORWARD', empty, empty],
            [1, 186 /* ScanCode.BrowserStop */, 'BrowserStop', 0 /* KeyCode.Unknown */, empty, 0, 'VK_BROWSER_STOP', empty, empty],
            [1, 187 /* ScanCode.BrowserRefresh */, 'BrowserRefresh', 0 /* KeyCode.Unknown */, empty, 0, 'VK_BROWSER_REFRESH', empty, empty],
            [1, 188 /* ScanCode.BrowserFavorites */, 'BrowserFavorites', 0 /* KeyCode.Unknown */, empty, 0, 'VK_BROWSER_FAVORITES', empty, empty],
            [1, 189 /* ScanCode.ZoomToggle */, 'ZoomToggle', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 190 /* ScanCode.MailReply */, 'MailReply', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 191 /* ScanCode.MailForward */, 'MailForward', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            [1, 192 /* ScanCode.MailSend */, 'MailSend', 0 /* KeyCode.Unknown */, empty, 0, empty, empty, empty],
            // See https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
            // If an Input Method Editor is processing key input and the event is keydown, return 229.
            [1, 0 /* ScanCode.None */, empty, 114 /* KeyCode.KEY_IN_COMPOSITION */, 'KeyInComposition', 229, empty, empty, empty],
            [1, 0 /* ScanCode.None */, empty, 116 /* KeyCode.ABNT_C2 */, 'ABNT_C2', 194, 'VK_ABNT_C2', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 96 /* KeyCode.OEM_8 */, 'OEM_8', 223, 'VK_OEM_8', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_KANA', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_HANGUL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_JUNJA', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_FINAL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_HANJA', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_KANJI', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_CONVERT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_NONCONVERT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_ACCEPT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_MODECHANGE', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_SELECT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PRINT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_EXECUTE', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_SNAPSHOT', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_HELP', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_APPS', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PROCESSKEY', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PACKET', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_DBE_SBCSCHAR', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_DBE_DBCSCHAR', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_ATTN', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_CRSEL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_EXSEL', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_EREOF', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PLAY', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_ZOOM', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_NONAME', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_PA1', empty, empty],
            [1, 0 /* ScanCode.None */, empty, 0 /* KeyCode.Unknown */, empty, 0, 'VK_OEM_CLEAR', empty, empty],
        ];
        const seenKeyCode = [];
        const seenScanCode = [];
        for (const mapping of mappings) {
            const [immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel] = mapping;
            if (!seenScanCode[scanCode]) {
                seenScanCode[scanCode] = true;
                scanCodeIntToStr[scanCode] = scanCodeStr;
                scanCodeStrToInt[scanCodeStr] = scanCode;
                scanCodeLowerCaseStrToInt[scanCodeStr.toLowerCase()] = scanCode;
                if (immutable) {
                    exports.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] = keyCode;
                    if ((keyCode !== 0 /* KeyCode.Unknown */)
                        && (keyCode !== 3 /* KeyCode.Enter */)
                        && (keyCode !== 5 /* KeyCode.Ctrl */)
                        && (keyCode !== 4 /* KeyCode.Shift */)
                        && (keyCode !== 6 /* KeyCode.Alt */)
                        && (keyCode !== 57 /* KeyCode.Meta */)) {
                        exports.IMMUTABLE_KEY_CODE_TO_CODE[keyCode] = scanCode;
                    }
                }
            }
            if (!seenKeyCode[keyCode]) {
                seenKeyCode[keyCode] = true;
                if (!keyCodeStr) {
                    throw new Error(`String representation missing for key code ${keyCode} around scan code ${scanCodeStr}`);
                }
                uiMap.define(keyCode, keyCodeStr);
                userSettingsUSMap.define(keyCode, usUserSettingsLabel || keyCodeStr);
                userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel || usUserSettingsLabel || keyCodeStr);
            }
            if (eventKeyCode) {
                exports.EVENT_KEY_CODE_MAP[eventKeyCode] = keyCode;
            }
            if (vkey) {
                exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[vkey] = keyCode;
            }
        }
        // Manually added due to the exclusion above (due to duplication with NumpadEnter)
        exports.IMMUTABLE_KEY_CODE_TO_CODE[3 /* KeyCode.Enter */] = 46 /* ScanCode.Enter */;
    })();
    var KeyCodeUtils;
    (function (KeyCodeUtils) {
        function toString(keyCode) {
            return uiMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toString = toString;
        function fromString(key) {
            return uiMap.strToKeyCode(key);
        }
        KeyCodeUtils.fromString = fromString;
        function toUserSettingsUS(keyCode) {
            return userSettingsUSMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
        function toUserSettingsGeneral(keyCode) {
            return userSettingsGeneralMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
        function fromUserSettings(key) {
            return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
        }
        KeyCodeUtils.fromUserSettings = fromUserSettings;
        function toElectronAccelerator(keyCode) {
            if (keyCode >= 98 /* KeyCode.Numpad0 */ && keyCode <= 113 /* KeyCode.NumpadDivide */) {
                // [Electron Accelerators] Electron is able to parse numpad keys, but unfortunately it
                // renders them just as regular keys in menus. For example, num0 is rendered as "0",
                // numdiv is rendered as "/", numsub is rendered as "-".
                //
                // This can lead to incredible confusion, as it makes numpad based keybindings indistinguishable
                // from keybindings based on regular keys.
                //
                // We therefore need to fall back to custom rendering for numpad keys.
                return null;
            }
            switch (keyCode) {
                case 16 /* KeyCode.UpArrow */:
                    return 'Up';
                case 18 /* KeyCode.DownArrow */:
                    return 'Down';
                case 15 /* KeyCode.LeftArrow */:
                    return 'Left';
                case 17 /* KeyCode.RightArrow */:
                    return 'Right';
            }
            return uiMap.keyCodeToStr(keyCode);
        }
        KeyCodeUtils.toElectronAccelerator = toElectronAccelerator;
    })(KeyCodeUtils || (exports.KeyCodeUtils = KeyCodeUtils = {}));
    var KeyMod;
    (function (KeyMod) {
        KeyMod[KeyMod["CtrlCmd"] = 2048] = "CtrlCmd";
        KeyMod[KeyMod["Shift"] = 1024] = "Shift";
        KeyMod[KeyMod["Alt"] = 512] = "Alt";
        KeyMod[KeyMod["WinCtrl"] = 256] = "WinCtrl";
    })(KeyMod || (exports.KeyMod = KeyMod = {}));
    function KeyChord(firstPart, secondPart) {
        const chordPart = ((secondPart & 0x0000FFFF) << 16) >>> 0;
        return (firstPart | chordPart) >>> 0;
    }
    exports.KeyChord = KeyChord;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[38/*vs/base/common/lazy*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lazy = void 0;
    class Lazy {
        constructor(executor) {
            this.executor = executor;
            this._didRun = false;
        }
        /**
         * True if the lazy value has been resolved.
         */
        get hasValue() { return this._didRun; }
        /**
         * Get the wrapped value.
         *
         * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
         * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
         */
        get value() {
            if (!this._didRun) {
                try {
                    this._value = this.executor();
                }
                catch (err) {
                    this._error = err;
                }
                finally {
                    this._didRun = true;
                }
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
        /**
         * Get the wrapped value without forcing evaluation.
         */
        get rawValue() { return this._value; }
    }
    exports.Lazy = Lazy;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[21/*vs/base/common/linkedList*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkedList = void 0;
    class Node {
        static { this.Undefined = new Node(undefined); }
        constructor(element) {
            this.element = element;
            this.next = Node.Undefined;
            this.prev = Node.Undefined;
        }
    }
    class LinkedList {
        constructor() {
            this._first = Node.Undefined;
            this._last = Node.Undefined;
            this._size = 0;
        }
        get size() {
            return this._size;
        }
        isEmpty() {
            return this._first === Node.Undefined;
        }
        clear() {
            let node = this._first;
            while (node !== Node.Undefined) {
                const next = node.next;
                node.prev = Node.Undefined;
                node.next = Node.Undefined;
                node = next;
            }
            this._first = Node.Undefined;
            this._last = Node.Undefined;
            this._size = 0;
        }
        unshift(element) {
            return this._insert(element, false);
        }
        push(element) {
            return this._insert(element, true);
        }
        _insert(element, atTheEnd) {
            const newNode = new Node(element);
            if (this._first === Node.Undefined) {
                this._first = newNode;
                this._last = newNode;
            }
            else if (atTheEnd) {
                // push
                const oldLast = this._last;
                this._last = newNode;
                newNode.prev = oldLast;
                oldLast.next = newNode;
            }
            else {
                // unshift
                const oldFirst = this._first;
                this._first = newNode;
                newNode.next = oldFirst;
                oldFirst.prev = newNode;
            }
            this._size += 1;
            let didRemove = false;
            return () => {
                if (!didRemove) {
                    didRemove = true;
                    this._remove(newNode);
                }
            };
        }
        shift() {
            if (this._first === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this._first.element;
                this._remove(this._first);
                return res;
            }
        }
        pop() {
            if (this._last === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this._last.element;
                this._remove(this._last);
                return res;
            }
        }
        _remove(node) {
            if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
                // middle
                const anchor = node.prev;
                anchor.next = node.next;
                node.next.prev = anchor;
            }
            else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
                // only node
                this._first = Node.Undefined;
                this._last = Node.Undefined;
            }
            else if (node.next === Node.Undefined) {
                // last
                this._last = this._last.prev;
                this._last.next = Node.Undefined;
            }
            else if (node.prev === Node.Undefined) {
                // first
                this._first = this._first.next;
                this._first.prev = Node.Undefined;
            }
            // done
            this._size -= 1;
        }
        *[Symbol.iterator]() {
            let node = this._first;
            while (node !== Node.Undefined) {
                yield node.element;
                node = node.next;
            }
        }
    }
    exports.LinkedList = LinkedList;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[22/*vs/base/common/map*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    var _a, _b, _c;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapsStrictEqualIgnoreOrder = exports.SetMap = exports.BidirectionalMap = exports.CounterSet = exports.LRUCache = exports.LinkedMap = exports.Touch = exports.ResourceSet = exports.ResourceMap = exports.setToString = exports.mapToString = exports.getOrSet = void 0;
    function getOrSet(map, key, value) {
        let result = map.get(key);
        if (result === undefined) {
            result = value;
            map.set(key, result);
        }
        return result;
    }
    exports.getOrSet = getOrSet;
    function mapToString(map) {
        const entries = [];
        map.forEach((value, key) => {
            entries.push(`${key} => ${value}`);
        });
        return `Map(${map.size}) {${entries.join(', ')}}`;
    }
    exports.mapToString = mapToString;
    function setToString(set) {
        const entries = [];
        set.forEach(value => {
            entries.push(value);
        });
        return `Set(${set.size}) {${entries.join(', ')}}`;
    }
    exports.setToString = setToString;
    class ResourceMapEntry {
        constructor(uri, value) {
            this.uri = uri;
            this.value = value;
        }
    }
    function isEntries(arg) {
        return Array.isArray(arg);
    }
    class ResourceMap {
        static { this.defaultToKey = (resource) => resource.toString(); }
        constructor(arg, toKey) {
            this[_a] = 'ResourceMap';
            if (arg instanceof ResourceMap) {
                this.map = new Map(arg.map);
                this.toKey = toKey ?? ResourceMap.defaultToKey;
            }
            else if (isEntries(arg)) {
                this.map = new Map();
                this.toKey = toKey ?? ResourceMap.defaultToKey;
                for (const [resource, value] of arg) {
                    this.set(resource, value);
                }
            }
            else {
                this.map = new Map();
                this.toKey = arg ?? ResourceMap.defaultToKey;
            }
        }
        set(resource, value) {
            this.map.set(this.toKey(resource), new ResourceMapEntry(resource, value));
            return this;
        }
        get(resource) {
            return this.map.get(this.toKey(resource))?.value;
        }
        has(resource) {
            return this.map.has(this.toKey(resource));
        }
        get size() {
            return this.map.size;
        }
        clear() {
            this.map.clear();
        }
        delete(resource) {
            return this.map.delete(this.toKey(resource));
        }
        forEach(clb, thisArg) {
            if (typeof thisArg !== 'undefined') {
                clb = clb.bind(thisArg);
            }
            for (const [_, entry] of this.map) {
                clb(entry.value, entry.uri, this);
            }
        }
        *values() {
            for (const entry of this.map.values()) {
                yield entry.value;
            }
        }
        *keys() {
            for (const entry of this.map.values()) {
                yield entry.uri;
            }
        }
        *entries() {
            for (const entry of this.map.values()) {
                yield [entry.uri, entry.value];
            }
        }
        *[(_a = Symbol.toStringTag, Symbol.iterator)]() {
            for (const [, entry] of this.map) {
                yield [entry.uri, entry.value];
            }
        }
    }
    exports.ResourceMap = ResourceMap;
    class ResourceSet {
        constructor(entriesOrKey, toKey) {
            this[_b] = 'ResourceSet';
            if (!entriesOrKey || typeof entriesOrKey === 'function') {
                this._map = new ResourceMap(entriesOrKey);
            }
            else {
                this._map = new ResourceMap(toKey);
                entriesOrKey.forEach(this.add, this);
            }
        }
        get size() {
            return this._map.size;
        }
        add(value) {
            this._map.set(value, value);
            return this;
        }
        clear() {
            this._map.clear();
        }
        delete(value) {
            return this._map.delete(value);
        }
        forEach(callbackfn, thisArg) {
            this._map.forEach((_value, key) => callbackfn.call(thisArg, key, key, this));
        }
        has(value) {
            return this._map.has(value);
        }
        entries() {
            return this._map.entries();
        }
        keys() {
            return this._map.keys();
        }
        values() {
            return this._map.keys();
        }
        [(_b = Symbol.toStringTag, Symbol.iterator)]() {
            return this.keys();
        }
    }
    exports.ResourceSet = ResourceSet;
    var Touch;
    (function (Touch) {
        Touch[Touch["None"] = 0] = "None";
        Touch[Touch["AsOld"] = 1] = "AsOld";
        Touch[Touch["AsNew"] = 2] = "AsNew";
    })(Touch || (exports.Touch = Touch = {}));
    class LinkedMap {
        constructor() {
            this[_c] = 'LinkedMap';
            this._map = new Map();
            this._head = undefined;
            this._tail = undefined;
            this._size = 0;
            this._state = 0;
        }
        clear() {
            this._map.clear();
            this._head = undefined;
            this._tail = undefined;
            this._size = 0;
            this._state++;
        }
        isEmpty() {
            return !this._head && !this._tail;
        }
        get size() {
            return this._size;
        }
        get first() {
            return this._head?.value;
        }
        get last() {
            return this._tail?.value;
        }
        has(key) {
            return this._map.has(key);
        }
        get(key, touch = 0 /* Touch.None */) {
            const item = this._map.get(key);
            if (!item) {
                return undefined;
            }
            if (touch !== 0 /* Touch.None */) {
                this.touch(item, touch);
            }
            return item.value;
        }
        set(key, value, touch = 0 /* Touch.None */) {
            let item = this._map.get(key);
            if (item) {
                item.value = value;
                if (touch !== 0 /* Touch.None */) {
                    this.touch(item, touch);
                }
            }
            else {
                item = { key, value, next: undefined, previous: undefined };
                switch (touch) {
                    case 0 /* Touch.None */:
                        this.addItemLast(item);
                        break;
                    case 1 /* Touch.AsOld */:
                        this.addItemFirst(item);
                        break;
                    case 2 /* Touch.AsNew */:
                        this.addItemLast(item);
                        break;
                    default:
                        this.addItemLast(item);
                        break;
                }
                this._map.set(key, item);
                this._size++;
            }
            return this;
        }
        delete(key) {
            return !!this.remove(key);
        }
        remove(key) {
            const item = this._map.get(key);
            if (!item) {
                return undefined;
            }
            this._map.delete(key);
            this.removeItem(item);
            this._size--;
            return item.value;
        }
        shift() {
            if (!this._head && !this._tail) {
                return undefined;
            }
            if (!this._head || !this._tail) {
                throw new Error('Invalid list');
            }
            const item = this._head;
            this._map.delete(item.key);
            this.removeItem(item);
            this._size--;
            return item.value;
        }
        forEach(callbackfn, thisArg) {
            const state = this._state;
            let current = this._head;
            while (current) {
                if (thisArg) {
                    callbackfn.bind(thisArg)(current.value, current.key, this);
                }
                else {
                    callbackfn(current.value, current.key, this);
                }
                if (this._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                current = current.next;
            }
        }
        keys() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.key, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        values() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.value, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        entries() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: [current.key, current.value], done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        [(_c = Symbol.toStringTag, Symbol.iterator)]() {
            return this.entries();
        }
        trimOld(newSize) {
            if (newSize >= this.size) {
                return;
            }
            if (newSize === 0) {
                this.clear();
                return;
            }
            let current = this._head;
            let currentSize = this.size;
            while (current && currentSize > newSize) {
                this._map.delete(current.key);
                current = current.next;
                currentSize--;
            }
            this._head = current;
            this._size = currentSize;
            if (current) {
                current.previous = undefined;
            }
            this._state++;
        }
        addItemFirst(item) {
            // First time Insert
            if (!this._head && !this._tail) {
                this._tail = item;
            }
            else if (!this._head) {
                throw new Error('Invalid list');
            }
            else {
                item.next = this._head;
                this._head.previous = item;
            }
            this._head = item;
            this._state++;
        }
        addItemLast(item) {
            // First time Insert
            if (!this._head && !this._tail) {
                this._head = item;
            }
            else if (!this._tail) {
                throw new Error('Invalid list');
            }
            else {
                item.previous = this._tail;
                this._tail.next = item;
            }
            this._tail = item;
            this._state++;
        }
        removeItem(item) {
            if (item === this._head && item === this._tail) {
                this._head = undefined;
                this._tail = undefined;
            }
            else if (item === this._head) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.next) {
                    throw new Error('Invalid list');
                }
                item.next.previous = undefined;
                this._head = item.next;
            }
            else if (item === this._tail) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.previous) {
                    throw new Error('Invalid list');
                }
                item.previous.next = undefined;
                this._tail = item.previous;
            }
            else {
                const next = item.next;
                const previous = item.previous;
                if (!next || !previous) {
                    throw new Error('Invalid list');
                }
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = undefined;
            this._state++;
        }
        touch(item, touch) {
            if (!this._head || !this._tail) {
                throw new Error('Invalid list');
            }
            if ((touch !== 1 /* Touch.AsOld */ && touch !== 2 /* Touch.AsNew */)) {
                return;
            }
            if (touch === 1 /* Touch.AsOld */) {
                if (item === this._head) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item
                if (item === this._tail) {
                    // previous must be defined since item was not head but is tail
                    // So there are more than on item in the map
                    previous.next = undefined;
                    this._tail = previous;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                // Insert the node at head
                item.previous = undefined;
                item.next = this._head;
                this._head.previous = item;
                this._head = item;
                this._state++;
            }
            else if (touch === 2 /* Touch.AsNew */) {
                if (item === this._tail) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item.
                if (item === this._head) {
                    // next must be defined since item was not tail but is head
                    // So there are more than on item in the map
                    next.previous = undefined;
                    this._head = next;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                item.next = undefined;
                item.previous = this._tail;
                this._tail.next = item;
                this._tail = item;
                this._state++;
            }
        }
        toJSON() {
            const data = [];
            this.forEach((value, key) => {
                data.push([key, value]);
            });
            return data;
        }
        fromJSON(data) {
            this.clear();
            for (const [key, value] of data) {
                this.set(key, value);
            }
        }
    }
    exports.LinkedMap = LinkedMap;
    class LRUCache extends LinkedMap {
        constructor(limit, ratio = 1) {
            super();
            this._limit = limit;
            this._ratio = Math.min(Math.max(0, ratio), 1);
        }
        get limit() {
            return this._limit;
        }
        set limit(limit) {
            this._limit = limit;
            this.checkTrim();
        }
        get ratio() {
            return this._ratio;
        }
        set ratio(ratio) {
            this._ratio = Math.min(Math.max(0, ratio), 1);
            this.checkTrim();
        }
        get(key, touch = 2 /* Touch.AsNew */) {
            return super.get(key, touch);
        }
        peek(key) {
            return super.get(key, 0 /* Touch.None */);
        }
        set(key, value) {
            super.set(key, value, 2 /* Touch.AsNew */);
            this.checkTrim();
            return this;
        }
        checkTrim() {
            if (this.size > this._limit) {
                this.trimOld(Math.round(this._limit * this._ratio));
            }
        }
    }
    exports.LRUCache = LRUCache;
    class CounterSet {
        constructor() {
            this.map = new Map();
        }
        add(value) {
            this.map.set(value, (this.map.get(value) || 0) + 1);
            return this;
        }
        delete(value) {
            let counter = this.map.get(value) || 0;
            if (counter === 0) {
                return false;
            }
            counter--;
            if (counter === 0) {
                this.map.delete(value);
            }
            else {
                this.map.set(value, counter);
            }
            return true;
        }
        has(value) {
            return this.map.has(value);
        }
    }
    exports.CounterSet = CounterSet;
    /**
     * A map that allows access both by keys and values.
     * **NOTE**: values need to be unique.
     */
    class BidirectionalMap {
        constructor(entries) {
            this._m1 = new Map();
            this._m2 = new Map();
            if (entries) {
                for (const [key, value] of entries) {
                    this.set(key, value);
                }
            }
        }
        clear() {
            this._m1.clear();
            this._m2.clear();
        }
        set(key, value) {
            this._m1.set(key, value);
            this._m2.set(value, key);
        }
        get(key) {
            return this._m1.get(key);
        }
        getKey(value) {
            return this._m2.get(value);
        }
        delete(key) {
            const value = this._m1.get(key);
            if (value === undefined) {
                return false;
            }
            this._m1.delete(key);
            this._m2.delete(value);
            return true;
        }
        forEach(callbackfn, thisArg) {
            this._m1.forEach((value, key) => {
                callbackfn.call(thisArg, value, key, this);
            });
        }
        keys() {
            return this._m1.keys();
        }
        values() {
            return this._m1.values();
        }
    }
    exports.BidirectionalMap = BidirectionalMap;
    class SetMap {
        constructor() {
            this.map = new Map();
        }
        add(key, value) {
            let values = this.map.get(key);
            if (!values) {
                values = new Set();
                this.map.set(key, values);
            }
            values.add(value);
        }
        delete(key, value) {
            const values = this.map.get(key);
            if (!values) {
                return;
            }
            values.delete(value);
            if (values.size === 0) {
                this.map.delete(key);
            }
        }
        forEach(key, fn) {
            const values = this.map.get(key);
            if (!values) {
                return;
            }
            values.forEach(fn);
        }
        get(key) {
            const values = this.map.get(key);
            if (!values) {
                return new Set();
            }
            return values;
        }
    }
    exports.SetMap = SetMap;
    function mapsStrictEqualIgnoreOrder(a, b) {
        if (a === b) {
            return true;
        }
        if (a.size !== b.size) {
            return false;
        }
        for (const [key, value] of a) {
            if (!b.has(key) || b.get(key) !== value) {
                return false;
            }
        }
        for (const [key] of b) {
            if (!a.has(key)) {
                return false;
            }
        }
        return true;
    }
    exports.mapsStrictEqualIgnoreOrder = mapsStrictEqualIgnoreOrder;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[10/*vs/base/common/lifecycle*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/arrays*/,34/*vs/base/common/collections*/,22/*vs/base/common/map*/,19/*vs/base/common/functional*/,20/*vs/base/common/iterator*/]), function (require, exports, arrays_1, collections_1, map_1, functional_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableMap = exports.disposeOnReturn = exports.ImmortalReference = exports.AsyncReferenceCollection = exports.ReferenceCollection = exports.SafeDisposable = exports.RefCountedDisposable = exports.MandatoryMutableDisposable = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.disposeIfDisposable = exports.dispose = exports.isDisposable = exports.markAsSingleton = exports.markAsDisposed = exports.trackDisposable = exports.setDisposableTracker = exports.DisposableTracker = void 0;
    // #region Disposable Tracking
    /**
     * Enables logging of potentially leaked disposables.
     *
     * A disposable is considered leaked if it is not disposed or not registered as the child of
     * another disposable. This tracking is very simple an only works for classes that either
     * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
     */
    const TRACK_DISPOSABLES = false;
    let disposableTracker = null;
    class DisposableTracker {
        constructor() {
            this.livingDisposables = new Map();
        }
        static { this.idx = 0; }
        getDisposableData(d) {
            let val = this.livingDisposables.get(d);
            if (!val) {
                val = { parent: null, source: null, isSingleton: false, value: d, idx: DisposableTracker.idx++ };
                this.livingDisposables.set(d, val);
            }
            return val;
        }
        trackDisposable(d) {
            const data = this.getDisposableData(d);
            if (!data.source) {
                data.source =
                    new Error().stack;
            }
        }
        setParent(child, parent) {
            const data = this.getDisposableData(child);
            data.parent = parent;
        }
        markAsDisposed(x) {
            this.livingDisposables.delete(x);
        }
        markAsSingleton(disposable) {
            this.getDisposableData(disposable).isSingleton = true;
        }
        getRootParent(data, cache) {
            const cacheValue = cache.get(data);
            if (cacheValue) {
                return cacheValue;
            }
            const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
            cache.set(data, result);
            return result;
        }
        getTrackedDisposables() {
            const rootParentCache = new Map();
            const leaking = [...this.livingDisposables.entries()]
                .filter(([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)
                .flatMap(([k]) => k);
            return leaking;
        }
        computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
            let uncoveredLeakingObjs;
            if (preComputedLeaks) {
                uncoveredLeakingObjs = preComputedLeaks;
            }
            else {
                const rootParentCache = new Map();
                const leakingObjects = [...this.livingDisposables.values()]
                    .filter((info) => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton);
                if (leakingObjects.length === 0) {
                    return;
                }
                const leakingObjsSet = new Set(leakingObjects.map(o => o.value));
                // Remove all objects that are a child of other leaking objects. Assumes there are no cycles.
                uncoveredLeakingObjs = leakingObjects.filter(l => {
                    return !(l.parent && leakingObjsSet.has(l.parent));
                });
                if (uncoveredLeakingObjs.length === 0) {
                    throw new Error('There are cyclic diposable chains!');
                }
            }
            if (!uncoveredLeakingObjs) {
                return undefined;
            }
            function getStackTracePath(leaking) {
                function removePrefix(array, linesToRemove) {
                    while (array.length > 0 && linesToRemove.some(regexp => typeof regexp === 'string' ? regexp === array[0] : array[0].match(regexp))) {
                        array.shift();
                    }
                }
                const lines = leaking.source.split('\n').map(p => p.trim().replace('at ', '')).filter(l => l !== '');
                removePrefix(lines, ['Error', /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]);
                return lines.reverse();
            }
            const stackTraceStarts = new map_1.SetMap();
            for (const leaking of uncoveredLeakingObjs) {
                const stackTracePath = getStackTracePath(leaking);
                for (let i = 0; i <= stackTracePath.length; i++) {
                    stackTraceStarts.add(stackTracePath.slice(0, i).join('\n'), leaking);
                }
            }
            // Put earlier leaks first
            uncoveredLeakingObjs.sort((0, arrays_1.compareBy)(l => l.idx, arrays_1.numberComparator));
            let message = '';
            let i = 0;
            for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
                i++;
                const stackTracePath = getStackTracePath(leaking);
                const stackTraceFormattedLines = [];
                for (let i = 0; i < stackTracePath.length; i++) {
                    let line = stackTracePath[i];
                    const starts = stackTraceStarts.get(stackTracePath.slice(0, i + 1).join('\n'));
                    line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
                    const prevStarts = stackTraceStarts.get(stackTracePath.slice(0, i).join('\n'));
                    const continuations = (0, collections_1.groupBy)([...prevStarts].map(d => getStackTracePath(d)[i]), v => v);
                    delete continuations[stackTracePath[i]];
                    for (const [cont, set] of Object.entries(continuations)) {
                        stackTraceFormattedLines.unshift(`    - stacktraces of ${set.length} other leaks continue with ${cont}`);
                    }
                    stackTraceFormattedLines.unshift(line);
                }
                message += `\n\n\n==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================\n${stackTraceFormattedLines.join('\n')}\n============================================================\n\n`;
            }
            if (uncoveredLeakingObjs.length > maxReported) {
                message += `\n\n\n... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables\n\n`;
            }
            return { leaks: uncoveredLeakingObjs, details: message };
        }
    }
    exports.DisposableTracker = DisposableTracker;
    function setDisposableTracker(tracker) {
        disposableTracker = tracker;
    }
    exports.setDisposableTracker = setDisposableTracker;
    if (TRACK_DISPOSABLES) {
        const __is_disposable_tracked__ = '__is_disposable_tracked__';
        setDisposableTracker(new class {
            trackDisposable(x) {
                const stack = new Error('Potentially leaked disposable').stack;
                setTimeout(() => {
                    if (!x[__is_disposable_tracked__]) {
                        console.log(stack);
                    }
                }, 3000);
            }
            setParent(child, parent) {
                if (child && child !== Disposable.None) {
                    try {
                        child[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsDisposed(disposable) {
                if (disposable && disposable !== Disposable.None) {
                    try {
                        disposable[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsSingleton(disposable) { }
        });
    }
    function trackDisposable(x) {
        disposableTracker?.trackDisposable(x);
        return x;
    }
    exports.trackDisposable = trackDisposable;
    function markAsDisposed(disposable) {
        disposableTracker?.markAsDisposed(disposable);
    }
    exports.markAsDisposed = markAsDisposed;
    function setParentOfDisposable(child, parent) {
        disposableTracker?.setParent(child, parent);
    }
    function setParentOfDisposables(children, parent) {
        if (!disposableTracker) {
            return;
        }
        for (const child of children) {
            disposableTracker.setParent(child, parent);
        }
    }
    /**
     * Indicates that the given object is a singleton which does not need to be disposed.
    */
    function markAsSingleton(singleton) {
        disposableTracker?.markAsSingleton(singleton);
        return singleton;
    }
    exports.markAsSingleton = markAsSingleton;
    /**
     * Check if `thing` is {@link IDisposable disposable}.
     */
    function isDisposable(thing) {
        return typeof thing.dispose === 'function' && thing.dispose.length === 0;
    }
    exports.isDisposable = isDisposable;
    function dispose(arg) {
        if (iterator_1.Iterable.is(arg)) {
            const errors = [];
            for (const d of arg) {
                if (d) {
                    try {
                        d.dispose();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }
            }
            if (errors.length === 1) {
                throw errors[0];
            }
            else if (errors.length > 1) {
                throw new AggregateError(errors, 'Encountered errors while disposing of store');
            }
            return Array.isArray(arg) ? [] : arg;
        }
        else if (arg) {
            arg.dispose();
            return arg;
        }
    }
    exports.dispose = dispose;
    function disposeIfDisposable(disposables) {
        for (const d of disposables) {
            if (isDisposable(d)) {
                d.dispose();
            }
        }
        return [];
    }
    exports.disposeIfDisposable = disposeIfDisposable;
    /**
     * Combine multiple disposable values into a single {@link IDisposable}.
     */
    function combinedDisposable(...disposables) {
        const parent = toDisposable(() => dispose(disposables));
        setParentOfDisposables(disposables, parent);
        return parent;
    }
    exports.combinedDisposable = combinedDisposable;
    /**
     * Turn a function that implements dispose into an {@link IDisposable}.
     *
     * @param fn Clean up function, guaranteed to be called only **once**.
     */
    function toDisposable(fn) {
        const self = trackDisposable({
            dispose: (0, functional_1.createSingleCallFunction)(() => {
                markAsDisposed(self);
                fn();
            })
        });
        return self;
    }
    exports.toDisposable = toDisposable;
    /**
     * Manages a collection of disposable values.
     *
     * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
     * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
     * store that has already been disposed of.
     */
    class DisposableStore {
        static { this.DISABLE_DISPOSED_WARNING = false; }
        constructor() {
            this._toDispose = new Set();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Dispose of all registered disposables and mark this object as disposed.
         *
         * Any future disposables added to this object will be disposed of on `add`.
         */
        dispose() {
            if (this._isDisposed) {
                return;
            }
            markAsDisposed(this);
            this._isDisposed = true;
            this.clear();
        }
        /**
         * @return `true` if this object has been disposed of.
         */
        get isDisposed() {
            return this._isDisposed;
        }
        /**
         * Dispose of all registered disposables but do not mark this object as disposed.
         */
        clear() {
            if (this._toDispose.size === 0) {
                return;
            }
            try {
                dispose(this._toDispose);
            }
            finally {
                this._toDispose.clear();
            }
        }
        /**
         * Add a new {@link IDisposable disposable} to the collection.
         */
        add(o) {
            if (!o) {
                return o;
            }
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            setParentOfDisposable(o, this);
            if (this._isDisposed) {
                if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                    console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
                }
            }
            else {
                this._toDispose.add(o);
            }
            return o;
        }
        /**
         * Deletes a disposable from store and disposes of it. This will not throw or warn and proceed to dispose the
         * disposable even when the disposable is not part in the store.
         */
        delete(o) {
            if (!o) {
                return;
            }
            if (o === this) {
                throw new Error('Cannot dispose a disposable on itself!');
            }
            this._toDispose.delete(o);
            o.dispose();
        }
        /**
         * Deletes the value from the store, but does not dispose it.
         */
        deleteAndLeak(o) {
            if (!o) {
                return;
            }
            if (this._toDispose.has(o)) {
                this._toDispose.delete(o);
                setParentOfDisposable(o, null);
            }
        }
    }
    exports.DisposableStore = DisposableStore;
    /**
     * Abstract base class for a {@link IDisposable disposable} object.
     *
     * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
     */
    class Disposable {
        /**
         * A disposable that does nothing when it is disposed of.
         *
         * TODO: This should not be a static property.
         */
        static { this.None = Object.freeze({ dispose() { } }); }
        constructor() {
            this._store = new DisposableStore();
            trackDisposable(this);
            setParentOfDisposable(this._store, this);
        }
        dispose() {
            markAsDisposed(this);
            this._store.dispose();
        }
        /**
         * Adds `o` to the collection of disposables managed by this object.
         */
        _register(o) {
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            return this._store.add(o);
        }
    }
    exports.Disposable = Disposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed.
     *
     * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
     * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
     */
    class MutableDisposable {
        constructor() {
            this._isDisposed = false;
            trackDisposable(this);
        }
        get value() {
            return this._isDisposed ? undefined : this._value;
        }
        set value(value) {
            if (this._isDisposed || value === this._value) {
                return;
            }
            this._value?.dispose();
            if (value) {
                setParentOfDisposable(value, this);
            }
            this._value = value;
        }
        /**
         * Resets the stored value and disposed of the previously stored value.
         */
        clear() {
            this.value = undefined;
        }
        dispose() {
            this._isDisposed = true;
            markAsDisposed(this);
            this._value?.dispose();
            this._value = undefined;
        }
        /**
         * Clears the value, but does not dispose it.
         * The old value is returned.
        */
        clearAndLeak() {
            const oldValue = this._value;
            this._value = undefined;
            if (oldValue) {
                setParentOfDisposable(oldValue, null);
            }
            return oldValue;
        }
    }
    exports.MutableDisposable = MutableDisposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed like {@link MutableDisposable}, but the value must
     * exist and cannot be undefined.
     */
    class MandatoryMutableDisposable {
        constructor(initialValue) {
            this._disposable = new MutableDisposable();
            this._isDisposed = false;
            this._disposable.value = initialValue;
        }
        get value() {
            return this._disposable.value;
        }
        set value(value) {
            if (this._isDisposed || value === this._disposable.value) {
                return;
            }
            this._disposable.value = value;
        }
        dispose() {
            this._isDisposed = true;
            this._disposable.dispose();
        }
    }
    exports.MandatoryMutableDisposable = MandatoryMutableDisposable;
    class RefCountedDisposable {
        constructor(_disposable) {
            this._disposable = _disposable;
            this._counter = 1;
        }
        acquire() {
            this._counter++;
            return this;
        }
        release() {
            if (--this._counter === 0) {
                this._disposable.dispose();
            }
            return this;
        }
    }
    exports.RefCountedDisposable = RefCountedDisposable;
    /**
     * A safe disposable can be `unset` so that a leaked reference (listener)
     * can be cut-off.
     */
    class SafeDisposable {
        constructor() {
            this.dispose = () => { };
            this.unset = () => { };
            this.isset = () => false;
            trackDisposable(this);
        }
        set(fn) {
            let callback = fn;
            this.unset = () => callback = undefined;
            this.isset = () => callback !== undefined;
            this.dispose = () => {
                if (callback) {
                    callback();
                    callback = undefined;
                    markAsDisposed(this);
                }
            };
            return this;
        }
    }
    exports.SafeDisposable = SafeDisposable;
    class ReferenceCollection {
        constructor() {
            this.references = new Map();
        }
        acquire(key, ...args) {
            let reference = this.references.get(key);
            if (!reference) {
                reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
                this.references.set(key, reference);
            }
            const { object } = reference;
            const dispose = (0, functional_1.createSingleCallFunction)(() => {
                if (--reference.counter === 0) {
                    this.destroyReferencedObject(key, reference.object);
                    this.references.delete(key);
                }
            });
            reference.counter++;
            return { object, dispose };
        }
    }
    exports.ReferenceCollection = ReferenceCollection;
    /**
     * Unwraps a reference collection of promised values. Makes sure
     * references are disposed whenever promises get rejected.
     */
    class AsyncReferenceCollection {
        constructor(referenceCollection) {
            this.referenceCollection = referenceCollection;
        }
        async acquire(key, ...args) {
            const ref = this.referenceCollection.acquire(key, ...args);
            try {
                const object = await ref.object;
                return {
                    object,
                    dispose: () => ref.dispose()
                };
            }
            catch (error) {
                ref.dispose();
                throw error;
            }
        }
    }
    exports.AsyncReferenceCollection = AsyncReferenceCollection;
    class ImmortalReference {
        constructor(object) {
            this.object = object;
        }
        dispose() { }
    }
    exports.ImmortalReference = ImmortalReference;
    function disposeOnReturn(fn) {
        const store = new DisposableStore();
        try {
            fn(store);
        }
        finally {
            store.dispose();
        }
    }
    exports.disposeOnReturn = disposeOnReturn;
    /**
     * A map the manages the lifecycle of the values that it stores.
     */
    class DisposableMap {
        constructor() {
            this._store = new Map();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Disposes of all stored values and mark this object as disposed.
         *
         * Trying to use this object after it has been disposed of is an error.
         */
        dispose() {
            markAsDisposed(this);
            this._isDisposed = true;
            this.clearAndDisposeAll();
        }
        /**
         * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
         */
        clearAndDisposeAll() {
            if (!this._store.size) {
                return;
            }
            try {
                dispose(this._store.values());
            }
            finally {
                this._store.clear();
            }
        }
        has(key) {
            return this._store.has(key);
        }
        get size() {
            return this._store.size;
        }
        get(key) {
            return this._store.get(key);
        }
        set(key, value, skipDisposeOnOverwrite = false) {
            if (this._isDisposed) {
                console.warn(new Error('Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!').stack);
            }
            if (!skipDisposeOnOverwrite) {
                this._store.get(key)?.dispose();
            }
            this._store.set(key, value);
        }
        /**
         * Delete the value stored for `key` from this map and also dispose of it.
         */
        deleteAndDispose(key) {
            this._store.get(key)?.dispose();
            this._store.delete(key);
        }
        keys() {
            return this._store.keys();
        }
        values() {
            return this._store.values();
        }
        [Symbol.iterator]() {
            return this._store[Symbol.iterator]();
        }
    }
    exports.DisposableMap = DisposableMap;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[23/*vs/base/common/stopwatch*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StopWatch = void 0;
    const hasPerformanceNow = (globalThis.performance && typeof globalThis.performance.now === 'function');
    class StopWatch {
        static create(highResolution) {
            return new StopWatch(highResolution);
        }
        constructor(highResolution) {
            this._now = hasPerformanceNow && highResolution === false ? Date.now : globalThis.performance.now.bind(globalThis.performance);
            this._startTime = this._now();
            this._stopTime = -1;
        }
        stop() {
            this._stopTime = this._now();
        }
        reset() {
            this._startTime = this._now();
            this._stopTime = -1;
        }
        elapsed() {
            if (this._stopTime !== -1) {
                return this._stopTime - this._startTime;
            }
            return this._now() - this._startTime;
        }
    }
    exports.StopWatch = StopWatch;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[11/*vs/base/common/event*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/errors*/,19/*vs/base/common/functional*/,10/*vs/base/common/lifecycle*/,21/*vs/base/common/linkedList*/,23/*vs/base/common/stopwatch*/]), function (require, exports, errors_1, functional_1, lifecycle_1, linkedList_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Relay = exports.EventBufferer = exports.DynamicListEventMultiplexer = exports.EventMultiplexer = exports.MicrotaskEmitter = exports.DebounceEmitter = exports.PauseableEmitter = exports.AsyncEmitter = exports.createEventDeliveryQueue = exports.Emitter = exports.setGlobalLeakWarningThreshold = exports.EventProfiling = exports.Event = void 0;
    // -----------------------------------------------------------------------------------------------------------------------
    // Uncomment the next line to print warnings whenever an emitter with listeners is disposed. That is a sign of code smell.
    // -----------------------------------------------------------------------------------------------------------------------
    const _enableDisposeWithListenerWarning = false;
    // _enableDisposeWithListenerWarning = Boolean("TRUE"); // causes a linter warning so that it cannot be pushed
    // -----------------------------------------------------------------------------------------------------------------------
    // Uncomment the next line to print warnings whenever a snapshotted event is used repeatedly without cleanup.
    // See https://github.com/microsoft/vscode/issues/142851
    // -----------------------------------------------------------------------------------------------------------------------
    const _enableSnapshotPotentialLeakWarning = false;
    var Event;
    (function (Event) {
        Event.None = () => lifecycle_1.Disposable.None;
        function _addLeakageTraceLogic(options) {
            if (_enableSnapshotPotentialLeakWarning) {
                const { onDidAddListener: origListenerDidAdd } = options;
                const stack = Stacktrace.create();
                let count = 0;
                options.onDidAddListener = () => {
                    if (++count === 2) {
                        console.warn('snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here');
                        stack.print();
                    }
                    origListenerDidAdd?.();
                };
            }
        }
        /**
         * Given an event, returns another event which debounces calls and defers the listeners to a later task via a shared
         * `setTimeout`. The event is converted into a signal (`Event<void>`) to avoid additional object creation as a
         * result of merging events and to try prevent race conditions that could arise when using related deferred and
         * non-deferred events.
         *
         * This is useful for deferring non-critical work (eg. general UI updates) to ensure it does not block critical work
         * (eg. latency of keypress to text rendered).
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function defer(event, disposable) {
            return debounce(event, () => void 0, 0, undefined, true, undefined, disposable);
        }
        Event.defer = defer;
        /**
         * Given an event, returns another event which only fires once.
         *
         * @param event The event source for the new event.
         */
        function once(event) {
            return (listener, thisArgs = null, disposables) => {
                // we need this, in case the event fires during the listener call
                let didFire = false;
                let result = undefined;
                result = event(e => {
                    if (didFire) {
                        return;
                    }
                    else if (result) {
                        result.dispose();
                    }
                    else {
                        didFire = true;
                    }
                    return listener.call(thisArgs, e);
                }, null, disposables);
                if (didFire) {
                    result.dispose();
                }
                return result;
            };
        }
        Event.once = once;
        /**
         * Maps an event of one type into an event of another type using a mapping function, similar to how
         * `Array.prototype.map` works.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param map The mapping function.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function map(event, map, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables), disposable);
        }
        Event.map = map;
        /**
         * Wraps an event in another event that performs some function on the event object before firing.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param each The function to perform on the event object.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function forEach(event, each, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables), disposable);
        }
        Event.forEach = forEach;
        function filter(event, filter, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables), disposable);
        }
        Event.filter = filter;
        /**
         * Given an event, returns the same event but typed as `Event<void>`.
         */
        function signal(event) {
            return event;
        }
        Event.signal = signal;
        function any(...events) {
            return (listener, thisArgs = null, disposables) => {
                const disposable = (0, lifecycle_1.combinedDisposable)(...events.map(event => event(e => listener.call(thisArgs, e))));
                return addAndReturnDisposable(disposable, disposables);
            };
        }
        Event.any = any;
        /**
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         */
        function reduce(event, merge, initial, disposable) {
            let output = initial;
            return map(event, e => {
                output = merge(output, e);
                return output;
            }, disposable);
        }
        Event.reduce = reduce;
        function snapshot(event, disposable) {
            let listener;
            const options = {
                onWillAddFirstListener() {
                    listener = event(emitter.fire, emitter);
                },
                onDidRemoveLastListener() {
                    listener?.dispose();
                }
            };
            if (!disposable) {
                _addLeakageTraceLogic(options);
            }
            const emitter = new Emitter(options);
            disposable?.add(emitter);
            return emitter.event;
        }
        /**
         * Adds the IDisposable to the store if it's set, and returns it. Useful to
         * Event function implementation.
         */
        function addAndReturnDisposable(d, store) {
            if (store instanceof Array) {
                store.push(d);
            }
            else if (store) {
                store.add(d);
            }
            return d;
        }
        function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
            let subscription;
            let output = undefined;
            let handle = undefined;
            let numDebouncedCalls = 0;
            let doFire;
            const options = {
                leakWarningThreshold,
                onWillAddFirstListener() {
                    subscription = event(cur => {
                        numDebouncedCalls++;
                        output = merge(output, cur);
                        if (leading && !handle) {
                            emitter.fire(output);
                            output = undefined;
                        }
                        doFire = () => {
                            const _output = output;
                            output = undefined;
                            handle = undefined;
                            if (!leading || numDebouncedCalls > 1) {
                                emitter.fire(_output);
                            }
                            numDebouncedCalls = 0;
                        };
                        if (typeof delay === 'number') {
                            clearTimeout(handle);
                            handle = setTimeout(doFire, delay);
                        }
                        else {
                            if (handle === undefined) {
                                handle = 0;
                                queueMicrotask(doFire);
                            }
                        }
                    });
                },
                onWillRemoveListener() {
                    if (flushOnListenerRemove && numDebouncedCalls > 0) {
                        doFire?.();
                    }
                },
                onDidRemoveLastListener() {
                    doFire = undefined;
                    subscription.dispose();
                }
            };
            if (!disposable) {
                _addLeakageTraceLogic(options);
            }
            const emitter = new Emitter(options);
            disposable?.add(emitter);
            return emitter.event;
        }
        Event.debounce = debounce;
        /**
         * Debounces an event, firing after some delay (default=0) with an array of all event original objects.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         */
        function accumulate(event, delay = 0, disposable) {
            return Event.debounce(event, (last, e) => {
                if (!last) {
                    return [e];
                }
                last.push(e);
                return last;
            }, delay, undefined, true, undefined, disposable);
        }
        Event.accumulate = accumulate;
        /**
         * Filters an event such that some condition is _not_ met more than once in a row, effectively ensuring duplicate
         * event objects from different sources do not fire the same event object.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param equals The equality condition.
         * @param disposable A disposable store to add the new EventEmitter to.
         *
         * @example
         * ```
         * // Fire only one time when a single window is opened or focused
         * Event.latch(Event.any(onDidOpenWindow, onDidFocusWindow))
         * ```
         */
        function latch(event, equals = (a, b) => a === b, disposable) {
            let firstCall = true;
            let cache;
            return filter(event, value => {
                const shouldEmit = firstCall || !equals(value, cache);
                firstCall = false;
                cache = value;
                return shouldEmit;
            }, disposable);
        }
        Event.latch = latch;
        /**
         * Splits an event whose parameter is a union type into 2 separate events for each type in the union.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @example
         * ```
         * const event = new EventEmitter<number | undefined>().event;
         * const [numberEvent, undefinedEvent] = Event.split(event, isUndefined);
         * ```
         *
         * @param event The event source for the new event.
         * @param isT A function that determines what event is of the first type.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function split(event, isT, disposable) {
            return [
                Event.filter(event, isT, disposable),
                Event.filter(event, e => !isT(e), disposable),
            ];
        }
        Event.split = split;
        /**
         * Buffers an event until it has a listener attached.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param flushAfterTimeout Determines whether to flush the buffer after a timeout immediately or after a
         * `setTimeout` when the first event listener is added.
         * @param _buffer Internal: A source event array used for tests.
         *
         * @example
         * ```
         * // Start accumulating events, when the first listener is attached, flush
         * // the event after a timeout such that multiple listeners attached before
         * // the timeout would receive the event
         * this.onInstallExtension = Event.buffer(service.onInstallExtension, true);
         * ```
         */
        function buffer(event, flushAfterTimeout = false, _buffer = [], disposable) {
            let buffer = _buffer.slice();
            let listener = event(e => {
                if (buffer) {
                    buffer.push(e);
                }
                else {
                    emitter.fire(e);
                }
            });
            if (disposable) {
                disposable.add(listener);
            }
            const flush = () => {
                buffer?.forEach(e => emitter.fire(e));
                buffer = null;
            };
            const emitter = new Emitter({
                onWillAddFirstListener() {
                    if (!listener) {
                        listener = event(e => emitter.fire(e));
                        if (disposable) {
                            disposable.add(listener);
                        }
                    }
                },
                onDidAddFirstListener() {
                    if (buffer) {
                        if (flushAfterTimeout) {
                            setTimeout(flush);
                        }
                        else {
                            flush();
                        }
                    }
                },
                onDidRemoveLastListener() {
                    if (listener) {
                        listener.dispose();
                    }
                    listener = null;
                }
            });
            if (disposable) {
                disposable.add(emitter);
            }
            return emitter.event;
        }
        Event.buffer = buffer;
        /**
         * Wraps the event in an {@link IChainableEvent}, allowing a more functional programming style.
         *
         * @example
         * ```
         * // Normal
         * const onEnterPressNormal = Event.filter(
         *   Event.map(onKeyPress.event, e => new StandardKeyboardEvent(e)),
         *   e.keyCode === KeyCode.Enter
         * ).event;
         *
         * // Using chain
         * const onEnterPressChain = Event.chain(onKeyPress.event, $ => $
         *   .map(e => new StandardKeyboardEvent(e))
         *   .filter(e => e.keyCode === KeyCode.Enter)
         * );
         * ```
         */
        function chain(event, sythensize) {
            const fn = (listener, thisArgs, disposables) => {
                const cs = sythensize(new ChainableSynthesis());
                return event(function (value) {
                    const result = cs.evaluate(value);
                    if (result !== HaltChainable) {
                        listener.call(thisArgs, result);
                    }
                }, undefined, disposables);
            };
            return fn;
        }
        Event.chain = chain;
        const HaltChainable = Symbol('HaltChainable');
        class ChainableSynthesis {
            constructor() {
                this.steps = [];
            }
            map(fn) {
                this.steps.push(fn);
                return this;
            }
            forEach(fn) {
                this.steps.push(v => {
                    fn(v);
                    return v;
                });
                return this;
            }
            filter(fn) {
                this.steps.push(v => fn(v) ? v : HaltChainable);
                return this;
            }
            reduce(merge, initial) {
                let last = initial;
                this.steps.push(v => {
                    last = merge(last, v);
                    return last;
                });
                return this;
            }
            latch(equals = (a, b) => a === b) {
                let firstCall = true;
                let cache;
                this.steps.push(value => {
                    const shouldEmit = firstCall || !equals(value, cache);
                    firstCall = false;
                    cache = value;
                    return shouldEmit ? value : HaltChainable;
                });
                return this;
            }
            evaluate(value) {
                for (const step of this.steps) {
                    value = step(value);
                    if (value === HaltChainable) {
                        break;
                    }
                }
                return value;
            }
        }
        /**
         * Creates an {@link Event} from a node event emitter.
         */
        function fromNodeEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.on(eventName, fn);
            const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
            const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
            return result.event;
        }
        Event.fromNodeEventEmitter = fromNodeEventEmitter;
        /**
         * Creates an {@link Event} from a DOM event emitter.
         */
        function fromDOMEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
            const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
            const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
            return result.event;
        }
        Event.fromDOMEventEmitter = fromDOMEventEmitter;
        /**
         * Creates a promise out of an event, using the {@link Event.once} helper.
         */
        function toPromise(event) {
            return new Promise(resolve => once(event)(resolve));
        }
        Event.toPromise = toPromise;
        /**
         * Creates an event out of a promise that fires once when the promise is
         * resolved with the result of the promise or `undefined`.
         */
        function fromPromise(promise) {
            const result = new Emitter();
            promise.then(res => {
                result.fire(res);
            }, () => {
                result.fire(undefined);
            }).finally(() => {
                result.dispose();
            });
            return result.event;
        }
        Event.fromPromise = fromPromise;
        function runAndSubscribe(event, handler, initial) {
            handler(initial);
            return event(e => handler(e));
        }
        Event.runAndSubscribe = runAndSubscribe;
        class EmitterObserver {
            constructor(_observable, store) {
                this._observable = _observable;
                this._counter = 0;
                this._hasChanged = false;
                const options = {
                    onWillAddFirstListener: () => {
                        _observable.addObserver(this);
                    },
                    onDidRemoveLastListener: () => {
                        _observable.removeObserver(this);
                    }
                };
                if (!store) {
                    _addLeakageTraceLogic(options);
                }
                this.emitter = new Emitter(options);
                if (store) {
                    store.add(this.emitter);
                }
            }
            beginUpdate(_observable) {
                // assert(_observable === this.obs);
                this._counter++;
            }
            handlePossibleChange(_observable) {
                // assert(_observable === this.obs);
            }
            handleChange(_observable, _change) {
                // assert(_observable === this.obs);
                this._hasChanged = true;
            }
            endUpdate(_observable) {
                // assert(_observable === this.obs);
                this._counter--;
                if (this._counter === 0) {
                    this._observable.reportChanges();
                    if (this._hasChanged) {
                        this._hasChanged = false;
                        this.emitter.fire(this._observable.get());
                    }
                }
            }
        }
        /**
         * Creates an event emitter that is fired when the observable changes.
         * Each listeners subscribes to the emitter.
         */
        function fromObservable(obs, store) {
            const observer = new EmitterObserver(obs, store);
            return observer.emitter.event;
        }
        Event.fromObservable = fromObservable;
        /**
         * Each listener is attached to the observable directly.
         */
        function fromObservableLight(observable) {
            return (listener, thisArgs, disposables) => {
                let count = 0;
                let didChange = false;
                const observer = {
                    beginUpdate() {
                        count++;
                    },
                    endUpdate() {
                        count--;
                        if (count === 0) {
                            observable.reportChanges();
                            if (didChange) {
                                didChange = false;
                                listener.call(thisArgs);
                            }
                        }
                    },
                    handlePossibleChange() {
                        // noop
                    },
                    handleChange() {
                        didChange = true;
                    }
                };
                observable.addObserver(observer);
                observable.reportChanges();
                const disposable = {
                    dispose() {
                        observable.removeObserver(observer);
                    }
                };
                if (disposables instanceof lifecycle_1.DisposableStore) {
                    disposables.add(disposable);
                }
                else if (Array.isArray(disposables)) {
                    disposables.push(disposable);
                }
                return disposable;
            };
        }
        Event.fromObservableLight = fromObservableLight;
    })(Event || (exports.Event = Event = {}));
    class EventProfiling {
        static { this.all = new Set(); }
        static { this._idPool = 0; }
        constructor(name) {
            this.listenerCount = 0;
            this.invocationCount = 0;
            this.elapsedOverall = 0;
            this.durations = [];
            this.name = `${name}_${EventProfiling._idPool++}`;
            EventProfiling.all.add(this);
        }
        start(listenerCount) {
            this._stopWatch = new stopwatch_1.StopWatch();
            this.listenerCount = listenerCount;
        }
        stop() {
            if (this._stopWatch) {
                const elapsed = this._stopWatch.elapsed();
                this.durations.push(elapsed);
                this.elapsedOverall += elapsed;
                this.invocationCount += 1;
                this._stopWatch = undefined;
            }
        }
    }
    exports.EventProfiling = EventProfiling;
    let _globalLeakWarningThreshold = -1;
    function setGlobalLeakWarningThreshold(n) {
        const oldValue = _globalLeakWarningThreshold;
        _globalLeakWarningThreshold = n;
        return {
            dispose() {
                _globalLeakWarningThreshold = oldValue;
            }
        };
    }
    exports.setGlobalLeakWarningThreshold = setGlobalLeakWarningThreshold;
    class LeakageMonitor {
        constructor(threshold, name = Math.random().toString(18).slice(2, 5)) {
            this.threshold = threshold;
            this.name = name;
            this._warnCountdown = 0;
        }
        dispose() {
            this._stacks?.clear();
        }
        check(stack, listenerCount) {
            const threshold = this.threshold;
            if (threshold <= 0 || listenerCount < threshold) {
                return undefined;
            }
            if (!this._stacks) {
                this._stacks = new Map();
            }
            const count = (this._stacks.get(stack.value) || 0);
            this._stacks.set(stack.value, count + 1);
            this._warnCountdown -= 1;
            if (this._warnCountdown <= 0) {
                // only warn on first exceed and then every time the limit
                // is exceeded by 50% again
                this._warnCountdown = threshold * 0.5;
                // find most frequent listener and print warning
                let topStack;
                let topCount = 0;
                for (const [stack, count] of this._stacks) {
                    if (!topStack || topCount < count) {
                        topStack = stack;
                        topCount = count;
                    }
                }
                console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
                console.warn(topStack);
            }
            return () => {
                const count = (this._stacks.get(stack.value) || 0);
                this._stacks.set(stack.value, count - 1);
            };
        }
    }
    class Stacktrace {
        static create() {
            return new Stacktrace(new Error().stack ?? '');
        }
        constructor(value) {
            this.value = value;
        }
        print() {
            console.warn(this.value.split('\n').slice(2).join('\n'));
        }
    }
    let id = 0;
    class UniqueContainer {
        constructor(value) {
            this.value = value;
            this.id = id++;
        }
    }
    const compactionThreshold = 2;
    const forEachListener = (listeners, fn) => {
        if (listeners instanceof UniqueContainer) {
            fn(listeners);
        }
        else {
            for (let i = 0; i < listeners.length; i++) {
                const l = listeners[i];
                if (l) {
                    fn(l);
                }
            }
        }
    };
    /**
     * The Emitter can be used to expose an Event to the public
     * to fire it from the insides.
     * Sample:
        class Document {
    
            private readonly _onDidChange = new Emitter<(value:string)=>any>();
    
            public onDidChange = this._onDidChange.event;
    
            // getter-style
            // get onDidChange(): Event<(value:string)=>any> {
            // 	return this._onDidChange.event;
            // }
    
            private _doIt() {
                //...
                this._onDidChange.fire(value);
            }
        }
     */
    class Emitter {
        constructor(options) {
            this._size = 0;
            this._options = options;
            this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : undefined;
            this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : undefined;
            this._deliveryQueue = this._options?.deliveryQueue;
        }
        dispose() {
            if (!this._disposed) {
                this._disposed = true;
                // It is bad to have listeners at the time of disposing an emitter, it is worst to have listeners keep the emitter
                // alive via the reference that's embedded in their disposables. Therefore we loop over all remaining listeners and
                // unset their subscriptions/disposables. Looping and blaming remaining listeners is done on next tick because the
                // the following programming pattern is very popular:
                //
                // const someModel = this._disposables.add(new ModelObject()); // (1) create and register model
                // this._disposables.add(someModel.onDidChange(() => { ... }); // (2) subscribe and register model-event listener
                // ...later...
                // this._disposables.dispose(); disposes (1) then (2): don't warn after (1) but after the "overall dispose" is done
                if (this._deliveryQueue?.current === this) {
                    this._deliveryQueue.reset();
                }
                if (this._listeners) {
                    if (_enableDisposeWithListenerWarning) {
                        const listeners = this._listeners;
                        queueMicrotask(() => {
                            forEachListener(listeners, l => l.stack?.print());
                        });
                    }
                    this._listeners = undefined;
                    this._size = 0;
                }
                this._options?.onDidRemoveLastListener?.();
                this._leakageMon?.dispose();
            }
        }
        /**
         * For the public to allow to subscribe
         * to events from this Emitter
         */
        get event() {
            this._event ??= (callback, thisArgs, disposables) => {
                if (this._leakageMon && this._size > this._leakageMon.threshold * 3) {
                    console.warn(`[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`);
                    return lifecycle_1.Disposable.None;
                }
                if (this._disposed) {
                    // todo: should we warn if a listener is added to a disposed emitter? This happens often
                    return lifecycle_1.Disposable.None;
                }
                if (thisArgs) {
                    callback = callback.bind(thisArgs);
                }
                const contained = new UniqueContainer(callback);
                let removeMonitor;
                let stack;
                if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
                    // check and record this emitter for potential leakage
                    contained.stack = Stacktrace.create();
                    removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
                }
                if (_enableDisposeWithListenerWarning) {
                    contained.stack = stack ?? Stacktrace.create();
                }
                if (!this._listeners) {
                    this._options?.onWillAddFirstListener?.(this);
                    this._listeners = contained;
                    this._options?.onDidAddFirstListener?.(this);
                }
                else if (this._listeners instanceof UniqueContainer) {
                    this._deliveryQueue ??= new EventDeliveryQueuePrivate();
                    this._listeners = [this._listeners, contained];
                }
                else {
                    this._listeners.push(contained);
                }
                this._size++;
                const result = (0, lifecycle_1.toDisposable)(() => { removeMonitor?.(); this._removeListener(contained); });
                if (disposables instanceof lifecycle_1.DisposableStore) {
                    disposables.add(result);
                }
                else if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
            return this._event;
        }
        _removeListener(listener) {
            this._options?.onWillRemoveListener?.(this);
            if (!this._listeners) {
                return; // expected if a listener gets disposed
            }
            if (this._size === 1) {
                this._listeners = undefined;
                this._options?.onDidRemoveLastListener?.(this);
                this._size = 0;
                return;
            }
            // size > 1 which requires that listeners be a list:
            const listeners = this._listeners;
            const index = listeners.indexOf(listener);
            if (index === -1) {
                console.log('disposed?', this._disposed);
                console.log('size?', this._size);
                console.log('arr?', JSON.stringify(this._listeners));
                throw new Error('Attempted to dispose unknown listener');
            }
            this._size--;
            listeners[index] = undefined;
            const adjustDeliveryQueue = this._deliveryQueue.current === this;
            if (this._size * compactionThreshold <= listeners.length) {
                let n = 0;
                for (let i = 0; i < listeners.length; i++) {
                    if (listeners[i]) {
                        listeners[n++] = listeners[i];
                    }
                    else if (adjustDeliveryQueue) {
                        this._deliveryQueue.end--;
                        if (n < this._deliveryQueue.i) {
                            this._deliveryQueue.i--;
                        }
                    }
                }
                listeners.length = n;
            }
        }
        _deliver(listener, value) {
            if (!listener) {
                return;
            }
            const errorHandler = this._options?.onListenerError || errors_1.onUnexpectedError;
            if (!errorHandler) {
                listener.value(value);
                return;
            }
            try {
                listener.value(value);
            }
            catch (e) {
                errorHandler(e);
            }
        }
        /** Delivers items in the queue. Assumes the queue is ready to go. */
        _deliverQueue(dq) {
            const listeners = dq.current._listeners;
            while (dq.i < dq.end) {
                // important: dq.i is incremented before calling deliver() because it might reenter deliverQueue()
                this._deliver(listeners[dq.i++], dq.value);
            }
            dq.reset();
        }
        /**
         * To be kept private to fire an event to
         * subscribers
         */
        fire(event) {
            if (this._deliveryQueue?.current) {
                this._deliverQueue(this._deliveryQueue);
                this._perfMon?.stop(); // last fire() will have starting perfmon, stop it before starting the next dispatch
            }
            this._perfMon?.start(this._size);
            if (!this._listeners) {
                // no-op
            }
            else if (this._listeners instanceof UniqueContainer) {
                this._deliver(this._listeners, event);
            }
            else {
                const dq = this._deliveryQueue;
                dq.enqueue(this, event, this._listeners.length);
                this._deliverQueue(dq);
            }
            this._perfMon?.stop();
        }
        hasListeners() {
            return this._size > 0;
        }
    }
    exports.Emitter = Emitter;
    const createEventDeliveryQueue = () => new EventDeliveryQueuePrivate();
    exports.createEventDeliveryQueue = createEventDeliveryQueue;
    class EventDeliveryQueuePrivate {
        constructor() {
            /**
             * Index in current's listener list.
             */
            this.i = -1;
            /**
             * The last index in the listener's list to deliver.
             */
            this.end = 0;
        }
        enqueue(emitter, value, end) {
            this.i = 0;
            this.end = end;
            this.current = emitter;
            this.value = value;
        }
        reset() {
            this.i = this.end; // force any current emission loop to stop, mainly for during dispose
            this.current = undefined;
            this.value = undefined;
        }
    }
    class AsyncEmitter extends Emitter {
        async fireAsync(data, token, promiseJoin) {
            if (!this._listeners) {
                return;
            }
            if (!this._asyncDeliveryQueue) {
                this._asyncDeliveryQueue = new linkedList_1.LinkedList();
            }
            forEachListener(this._listeners, listener => this._asyncDeliveryQueue.push([listener.value, data]));
            while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
                const [listener, data] = this._asyncDeliveryQueue.shift();
                const thenables = [];
                const event = {
                    ...data,
                    token,
                    waitUntil: (p) => {
                        if (Object.isFrozen(thenables)) {
                            throw new Error('waitUntil can NOT be called asynchronous');
                        }
                        if (promiseJoin) {
                            p = promiseJoin(p, listener);
                        }
                        thenables.push(p);
                    }
                };
                try {
                    listener(event);
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                    continue;
                }
                // freeze thenables-collection to enforce sync-calls to
                // wait until and then wait for all thenables to resolve
                Object.freeze(thenables);
                await Promise.allSettled(thenables).then(values => {
                    for (const value of values) {
                        if (value.status === 'rejected') {
                            (0, errors_1.onUnexpectedError)(value.reason);
                        }
                    }
                });
            }
        }
    }
    exports.AsyncEmitter = AsyncEmitter;
    class PauseableEmitter extends Emitter {
        get isPaused() {
            return this._isPaused !== 0;
        }
        constructor(options) {
            super(options);
            this._isPaused = 0;
            this._eventQueue = new linkedList_1.LinkedList();
            this._mergeFn = options?.merge;
        }
        pause() {
            this._isPaused++;
        }
        resume() {
            if (this._isPaused !== 0 && --this._isPaused === 0) {
                if (this._mergeFn) {
                    // use the merge function to create a single composite
                    // event. make a copy in case firing pauses this emitter
                    if (this._eventQueue.size > 0) {
                        const events = Array.from(this._eventQueue);
                        this._eventQueue.clear();
                        super.fire(this._mergeFn(events));
                    }
                }
                else {
                    // no merging, fire each event individually and test
                    // that this emitter isn't paused halfway through
                    while (!this._isPaused && this._eventQueue.size !== 0) {
                        super.fire(this._eventQueue.shift());
                    }
                }
            }
        }
        fire(event) {
            if (this._size) {
                if (this._isPaused !== 0) {
                    this._eventQueue.push(event);
                }
                else {
                    super.fire(event);
                }
            }
        }
    }
    exports.PauseableEmitter = PauseableEmitter;
    class DebounceEmitter extends PauseableEmitter {
        constructor(options) {
            super(options);
            this._delay = options.delay ?? 100;
        }
        fire(event) {
            if (!this._handle) {
                this.pause();
                this._handle = setTimeout(() => {
                    this._handle = undefined;
                    this.resume();
                }, this._delay);
            }
            super.fire(event);
        }
    }
    exports.DebounceEmitter = DebounceEmitter;
    /**
     * An emitter which queue all events and then process them at the
     * end of the event loop.
     */
    class MicrotaskEmitter extends Emitter {
        constructor(options) {
            super(options);
            this._queuedEvents = [];
            this._mergeFn = options?.merge;
        }
        fire(event) {
            if (!this.hasListeners()) {
                return;
            }
            this._queuedEvents.push(event);
            if (this._queuedEvents.length === 1) {
                queueMicrotask(() => {
                    if (this._mergeFn) {
                        super.fire(this._mergeFn(this._queuedEvents));
                    }
                    else {
                        this._queuedEvents.forEach(e => super.fire(e));
                    }
                    this._queuedEvents = [];
                });
            }
        }
    }
    exports.MicrotaskEmitter = MicrotaskEmitter;
    /**
     * An event emitter that multiplexes many events into a single event.
     *
     * @example Listen to the `onData` event of all `Thing`s, dynamically adding and removing `Thing`s
     * to the multiplexer as needed.
     *
     * ```typescript
     * const anythingDataMultiplexer = new EventMultiplexer<{ data: string }>();
     *
     * const thingListeners = DisposableMap<Thing, IDisposable>();
     *
     * thingService.onDidAddThing(thing => {
     *   thingListeners.set(thing, anythingDataMultiplexer.add(thing.onData);
     * });
     * thingService.onDidRemoveThing(thing => {
     *   thingListeners.deleteAndDispose(thing);
     * });
     *
     * anythingDataMultiplexer.event(e => {
     *   console.log('Something fired data ' + e.data)
     * });
     * ```
     */
    class EventMultiplexer {
        constructor() {
            this.hasListeners = false;
            this.events = [];
            this.emitter = new Emitter({
                onWillAddFirstListener: () => this.onFirstListenerAdd(),
                onDidRemoveLastListener: () => this.onLastListenerRemove()
            });
        }
        get event() {
            return this.emitter.event;
        }
        add(event) {
            const e = { event: event, listener: null };
            this.events.push(e);
            if (this.hasListeners) {
                this.hook(e);
            }
            const dispose = () => {
                if (this.hasListeners) {
                    this.unhook(e);
                }
                const idx = this.events.indexOf(e);
                this.events.splice(idx, 1);
            };
            return (0, lifecycle_1.toDisposable)((0, functional_1.createSingleCallFunction)(dispose));
        }
        onFirstListenerAdd() {
            this.hasListeners = true;
            this.events.forEach(e => this.hook(e));
        }
        onLastListenerRemove() {
            this.hasListeners = false;
            this.events.forEach(e => this.unhook(e));
        }
        hook(e) {
            e.listener = e.event(r => this.emitter.fire(r));
        }
        unhook(e) {
            e.listener?.dispose();
            e.listener = null;
        }
        dispose() {
            this.emitter.dispose();
            for (const e of this.events) {
                e.listener?.dispose();
            }
            this.events = [];
        }
    }
    exports.EventMultiplexer = EventMultiplexer;
    class DynamicListEventMultiplexer {
        constructor(items, onAddItem, onRemoveItem, getEvent) {
            this._store = new lifecycle_1.DisposableStore();
            const multiplexer = this._store.add(new EventMultiplexer());
            const itemListeners = this._store.add(new lifecycle_1.DisposableMap());
            function addItem(instance) {
                itemListeners.set(instance, multiplexer.add(getEvent(instance)));
            }
            // Existing items
            for (const instance of items) {
                addItem(instance);
            }
            // Added items
            this._store.add(onAddItem(instance => {
                addItem(instance);
            }));
            // Removed items
            this._store.add(onRemoveItem(instance => {
                itemListeners.deleteAndDispose(instance);
            }));
            this.event = multiplexer.event;
        }
        dispose() {
            this._store.dispose();
        }
    }
    exports.DynamicListEventMultiplexer = DynamicListEventMultiplexer;
    /**
     * The EventBufferer is useful in situations in which you want
     * to delay firing your events during some code.
     * You can wrap that code and be sure that the event will not
     * be fired during that wrap.
     *
     * ```
     * const emitter: Emitter;
     * const delayer = new EventDelayer();
     * const delayedEvent = delayer.wrapEvent(emitter.event);
     *
     * delayedEvent(console.log);
     *
     * delayer.bufferEvents(() => {
     *   emitter.fire(); // event will not be fired yet
     * });
     *
     * // event will only be fired at this point
     * ```
     */
    class EventBufferer {
        constructor() {
            this.buffers = [];
        }
        wrapEvent(event) {
            return (listener, thisArgs, disposables) => {
                return event(i => {
                    const buffer = this.buffers[this.buffers.length - 1];
                    if (buffer) {
                        buffer.push(() => listener.call(thisArgs, i));
                    }
                    else {
                        listener.call(thisArgs, i);
                    }
                }, undefined, disposables);
            };
        }
        bufferEvents(fn) {
            const buffer = [];
            this.buffers.push(buffer);
            const r = fn();
            this.buffers.pop();
            buffer.forEach(flush => flush());
            return r;
        }
    }
    exports.EventBufferer = EventBufferer;
    /**
     * A Relay is an event forwarder which functions as a replugabble event pipe.
     * Once created, you can connect an input event to it and it will simply forward
     * events from that input event through its own `event` property. The `input`
     * can be changed at any point in time.
     */
    class Relay {
        constructor() {
            this.listening = false;
            this.inputEvent = Event.None;
            this.inputEventListener = lifecycle_1.Disposable.None;
            this.emitter = new Emitter({
                onDidAddFirstListener: () => {
                    this.listening = true;
                    this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
                },
                onDidRemoveLastListener: () => {
                    this.listening = false;
                    this.inputEventListener.dispose();
                }
            });
            this.event = this.emitter.event;
        }
        set input(event) {
            this.inputEvent = event;
            if (this.listening) {
                this.inputEventListener.dispose();
                this.inputEventListener = event(this.emitter.fire, this.emitter);
            }
        }
        dispose() {
            this.inputEventListener.dispose();
            this.emitter.dispose();
        }
    }
    exports.Relay = Relay;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[24/*vs/base/common/cancellation*/], __M([0/*require*/,1/*exports*/,11/*vs/base/common/event*/]), function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CancellationTokenSource = exports.CancellationToken = void 0;
    const shortcutEvent = Object.freeze(function (callback, context) {
        const handle = setTimeout(callback.bind(context), 0);
        return { dispose() { clearTimeout(handle); } };
    });
    var CancellationToken;
    (function (CancellationToken) {
        function isCancellationToken(thing) {
            if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
                return true;
            }
            if (thing instanceof MutableToken) {
                return true;
            }
            if (!thing || typeof thing !== 'object') {
                return false;
            }
            return typeof thing.isCancellationRequested === 'boolean'
                && typeof thing.onCancellationRequested === 'function';
        }
        CancellationToken.isCancellationToken = isCancellationToken;
        CancellationToken.None = Object.freeze({
            isCancellationRequested: false,
            onCancellationRequested: event_1.Event.None
        });
        CancellationToken.Cancelled = Object.freeze({
            isCancellationRequested: true,
            onCancellationRequested: shortcutEvent
        });
    })(CancellationToken || (exports.CancellationToken = CancellationToken = {}));
    class MutableToken {
        constructor() {
            this._isCancelled = false;
            this._emitter = null;
        }
        cancel() {
            if (!this._isCancelled) {
                this._isCancelled = true;
                if (this._emitter) {
                    this._emitter.fire(undefined);
                    this.dispose();
                }
            }
        }
        get isCancellationRequested() {
            return this._isCancelled;
        }
        get onCancellationRequested() {
            if (this._isCancelled) {
                return shortcutEvent;
            }
            if (!this._emitter) {
                this._emitter = new event_1.Emitter();
            }
            return this._emitter.event;
        }
        dispose() {
            if (this._emitter) {
                this._emitter.dispose();
                this._emitter = null;
            }
        }
    }
    class CancellationTokenSource {
        constructor(parent) {
            this._token = undefined;
            this._parentListener = undefined;
            this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
        }
        get token() {
            if (!this._token) {
                // be lazy and create the token only when
                // actually needed
                this._token = new MutableToken();
            }
            return this._token;
        }
        cancel() {
            if (!this._token) {
                // save an object by returning the default
                // cancelled token when cancellation happens
                // before someone asks for the token
                this._token = CancellationToken.Cancelled;
            }
            else if (this._token instanceof MutableToken) {
                // actually cancel
                this._token.cancel();
            }
        }
        dispose(cancel = false) {
            if (cancel) {
                this.cancel();
            }
            this._parentListener?.dispose();
            if (!this._token) {
                // ensure to initialize with an empty token if we had none
                this._token = CancellationToken.None;
            }
            else if (this._token instanceof MutableToken) {
                // actually dispose
                this._token.dispose();
            }
        }
    }
    exports.CancellationTokenSource = CancellationTokenSource;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[39/*vs/base/common/cache*/], __M([0/*require*/,1/*exports*/,24/*vs/base/common/cancellation*/]), function (require, exports, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedFunction = exports.LRUCachedFunction = exports.Cache = void 0;
    class Cache {
        constructor(task) {
            this.task = task;
            this.result = null;
        }
        get() {
            if (this.result) {
                return this.result;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const promise = this.task(cts.token);
            this.result = {
                promise,
                dispose: () => {
                    this.result = null;
                    cts.cancel();
                    cts.dispose();
                }
            };
            return this.result;
        }
    }
    exports.Cache = Cache;
    /**
     * Uses a LRU cache to make a given parametrized function cached.
     * Caches just the last value.
     * The key must be JSON serializable.
    */
    class LRUCachedFunction {
        constructor(fn) {
            this.fn = fn;
            this.lastCache = undefined;
            this.lastArgKey = undefined;
        }
        get(arg) {
            const key = JSON.stringify(arg);
            if (this.lastArgKey !== key) {
                this.lastArgKey = key;
                this.lastCache = this.fn(arg);
            }
            return this.lastCache;
        }
    }
    exports.LRUCachedFunction = LRUCachedFunction;
    /**
     * Uses an unbounded cache (referential equality) to memoize the results of the given function.
    */
    class CachedFunction {
        get cachedValues() {
            return this._map;
        }
        constructor(fn) {
            this.fn = fn;
            this._map = new Map();
        }
        get(arg) {
            if (this._map.has(arg)) {
                return this._map.get(arg);
            }
            const value = this.fn(arg);
            this._map.set(arg, value);
            return value;
        }
    }
    exports.CachedFunction = CachedFunction;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[7/*vs/base/common/strings*/], __M([0/*require*/,1/*exports*/,39/*vs/base/common/cache*/,38/*vs/base/common/lazy*/]), function (require, exports, cache_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvisibleCharacters = exports.AmbiguousCharacters = exports.noBreakWhitespace = exports.getLeftDeleteOffset = exports.GraphemeBreakType = exports.getGraphemeBreakType = exports.singleLetterHash = exports.getNLines = exports.uppercaseFirstLetter = exports.containsUppercaseCharacter = exports.fuzzyContains = exports.stripUTF8BOM = exports.startsWithUTF8BOM = exports.UTF8_BOM_CHARACTER = exports.removeAnsiEscapeCodes = exports.lcut = exports.isEmojiImprecise = exports.isFullWidthCharacter = exports.containsUnusualLineTerminators = exports.UNUSUAL_LINE_TERMINATORS = exports.isBasicASCII = exports.containsRTL = exports.charCount = exports.getCharContainingOffset = exports.prevCharLength = exports.nextCharLength = exports.GraphemeIterator = exports.CodePointIterator = exports.getNextCodePoint = exports.computeCodePoint = exports.isLowSurrogate = exports.isHighSurrogate = exports.commonSuffixLength = exports.commonPrefixLength = exports.startsWithIgnoreCase = exports.equalsIgnoreCase = exports.isUpperAsciiLetter = exports.isLowerAsciiLetter = exports.isAsciiDigit = exports.compareSubstringIgnoreCase = exports.compareIgnoreCase = exports.compareSubstring = exports.compare = exports.replaceAsync = exports.lastNonWhitespaceIndex = exports.getLeadingWhitespace = exports.firstNonWhitespaceIndex = exports.splitLinesIncludeSeparators = exports.splitLines = exports.regExpLeadsToEndlessLoop = exports.createRegExp = exports.stripWildcards = exports.convertSimple2RegExpPattern = exports.rtrim = exports.ltrim = exports.trim = exports.truncateMiddle = exports.truncate = exports.count = exports.escapeRegExpCharacters = exports.escape = exports.htmlAttributeEncodeValue = exports.format2 = exports.format = exports.isFalsyOrWhitespace = void 0;
    function isFalsyOrWhitespace(str) {
        if (!str || typeof str !== 'string') {
            return true;
        }
        return str.trim().length === 0;
    }
    exports.isFalsyOrWhitespace = isFalsyOrWhitespace;
    const _formatRegexp = /{(\d+)}/g;
    /**
     * Helper to produce a string with a variable number of arguments. Insert variable segments
     * into the string using the {n} notation where N is the index of the argument following the string.
     * @param value string to which formatting is applied
     * @param args replacements for {n}-entries
     */
    function format(value, ...args) {
        if (args.length === 0) {
            return value;
        }
        return value.replace(_formatRegexp, function (match, group) {
            const idx = parseInt(group, 10);
            return isNaN(idx) || idx < 0 || idx >= args.length ?
                match :
                args[idx];
        });
    }
    exports.format = format;
    const _format2Regexp = /{([^}]+)}/g;
    /**
     * Helper to create a string from a template and a string record.
     * Similar to `format` but with objects instead of positional arguments.
     */
    function format2(template, values) {
        if (Object.keys(values).length === 0) {
            return template;
        }
        return template.replace(_format2Regexp, (match, group) => (values[group] ?? match));
    }
    exports.format2 = format2;
    /**
     * Encodes the given value so that it can be used as literal value in html attributes.
     *
     * In other words, computes `$val`, such that `attr` in `<div attr="$val" />` has the runtime value `value`.
     * This prevents XSS injection.
     */
    function htmlAttributeEncodeValue(value) {
        return value.replace(/[<>"'&]/g, ch => {
            switch (ch) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case '\'': return '&apos;';
                case '&': return '&amp;';
            }
            return ch;
        });
    }
    exports.htmlAttributeEncodeValue = htmlAttributeEncodeValue;
    /**
     * Converts HTML characters inside the string to use entities instead. Makes the string safe from
     * being used e.g. in HTMLElement.innerHTML.
     */
    function escape(html) {
        return html.replace(/[<>&]/g, function (match) {
            switch (match) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                default: return match;
            }
        });
    }
    exports.escape = escape;
    /**
     * Escapes regular expression characters in a given string
     */
    function escapeRegExpCharacters(value) {
        return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
    }
    exports.escapeRegExpCharacters = escapeRegExpCharacters;
    /**
     * Counts how often `character` occurs inside `value`.
     */
    function count(value, character) {
        let result = 0;
        const ch = character.charCodeAt(0);
        for (let i = value.length - 1; i >= 0; i--) {
            if (value.charCodeAt(i) === ch) {
                result++;
            }
        }
        return result;
    }
    exports.count = count;
    function truncate(value, maxLength, suffix = '…') {
        if (value.length <= maxLength) {
            return value;
        }
        return `${value.substr(0, maxLength)}${suffix}`;
    }
    exports.truncate = truncate;
    function truncateMiddle(value, maxLength, suffix = '…') {
        if (value.length <= maxLength) {
            return value;
        }
        const prefixLength = Math.ceil(maxLength / 2) - suffix.length / 2;
        const suffixLength = Math.floor(maxLength / 2) - suffix.length / 2;
        return `${value.substr(0, prefixLength)}${suffix}${value.substr(value.length - suffixLength)}`;
    }
    exports.truncateMiddle = truncateMiddle;
    /**
     * Removes all occurrences of needle from the beginning and end of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim (default is a blank)
     */
    function trim(haystack, needle = ' ') {
        const trimmed = ltrim(haystack, needle);
        return rtrim(trimmed, needle);
    }
    exports.trim = trim;
    /**
     * Removes all occurrences of needle from the beginning of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim
     */
    function ltrim(haystack, needle) {
        if (!haystack || !needle) {
            return haystack;
        }
        const needleLen = needle.length;
        if (needleLen === 0 || haystack.length === 0) {
            return haystack;
        }
        let offset = 0;
        while (haystack.indexOf(needle, offset) === offset) {
            offset = offset + needleLen;
        }
        return haystack.substring(offset);
    }
    exports.ltrim = ltrim;
    /**
     * Removes all occurrences of needle from the end of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim
     */
    function rtrim(haystack, needle) {
        if (!haystack || !needle) {
            return haystack;
        }
        const needleLen = needle.length, haystackLen = haystack.length;
        if (needleLen === 0 || haystackLen === 0) {
            return haystack;
        }
        let offset = haystackLen, idx = -1;
        while (true) {
            idx = haystack.lastIndexOf(needle, offset - 1);
            if (idx === -1 || idx + needleLen !== offset) {
                break;
            }
            if (idx === 0) {
                return '';
            }
            offset = idx;
        }
        return haystack.substring(0, offset);
    }
    exports.rtrim = rtrim;
    function convertSimple2RegExpPattern(pattern) {
        return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
    }
    exports.convertSimple2RegExpPattern = convertSimple2RegExpPattern;
    function stripWildcards(pattern) {
        return pattern.replace(/\*/g, '');
    }
    exports.stripWildcards = stripWildcards;
    function createRegExp(searchString, isRegex, options = {}) {
        if (!searchString) {
            throw new Error('Cannot create regex from empty string');
        }
        if (!isRegex) {
            searchString = escapeRegExpCharacters(searchString);
        }
        if (options.wholeWord) {
            if (!/\B/.test(searchString.charAt(0))) {
                searchString = '\\b' + searchString;
            }
            if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
                searchString = searchString + '\\b';
            }
        }
        let modifiers = '';
        if (options.global) {
            modifiers += 'g';
        }
        if (!options.matchCase) {
            modifiers += 'i';
        }
        if (options.multiline) {
            modifiers += 'm';
        }
        if (options.unicode) {
            modifiers += 'u';
        }
        return new RegExp(searchString, modifiers);
    }
    exports.createRegExp = createRegExp;
    function regExpLeadsToEndlessLoop(regexp) {
        // Exit early if it's one of these special cases which are meant to match
        // against an empty string
        if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
            return false;
        }
        // We check against an empty string. If the regular expression doesn't advance
        // (e.g. ends in an endless loop) it will match an empty string.
        const match = regexp.exec('');
        return !!(match && regexp.lastIndex === 0);
    }
    exports.regExpLeadsToEndlessLoop = regExpLeadsToEndlessLoop;
    function splitLines(str) {
        return str.split(/\r\n|\r|\n/);
    }
    exports.splitLines = splitLines;
    function splitLinesIncludeSeparators(str) {
        const linesWithSeparators = [];
        const splitLinesAndSeparators = str.split(/(\r\n|\r|\n)/);
        for (let i = 0; i < Math.ceil(splitLinesAndSeparators.length / 2); i++) {
            linesWithSeparators.push(splitLinesAndSeparators[2 * i] + (splitLinesAndSeparators[2 * i + 1] ?? ''));
        }
        return linesWithSeparators;
    }
    exports.splitLinesIncludeSeparators = splitLinesIncludeSeparators;
    /**
     * Returns first index of the string that is not whitespace.
     * If string is empty or contains only whitespaces, returns -1
     */
    function firstNonWhitespaceIndex(str) {
        for (let i = 0, len = str.length; i < len; i++) {
            const chCode = str.charCodeAt(i);
            if (chCode !== 32 /* CharCode.Space */ && chCode !== 9 /* CharCode.Tab */) {
                return i;
            }
        }
        return -1;
    }
    exports.firstNonWhitespaceIndex = firstNonWhitespaceIndex;
    /**
     * Returns the leading whitespace of the string.
     * If the string contains only whitespaces, returns entire string
     */
    function getLeadingWhitespace(str, start = 0, end = str.length) {
        for (let i = start; i < end; i++) {
            const chCode = str.charCodeAt(i);
            if (chCode !== 32 /* CharCode.Space */ && chCode !== 9 /* CharCode.Tab */) {
                return str.substring(start, i);
            }
        }
        return str.substring(start, end);
    }
    exports.getLeadingWhitespace = getLeadingWhitespace;
    /**
     * Returns last index of the string that is not whitespace.
     * If string is empty or contains only whitespaces, returns -1
     */
    function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
        for (let i = startIndex; i >= 0; i--) {
            const chCode = str.charCodeAt(i);
            if (chCode !== 32 /* CharCode.Space */ && chCode !== 9 /* CharCode.Tab */) {
                return i;
            }
        }
        return -1;
    }
    exports.lastNonWhitespaceIndex = lastNonWhitespaceIndex;
    /**
     * Function that works identically to String.prototype.replace, except, the
     * replace function is allowed to be async and return a Promise.
     */
    function replaceAsync(str, search, replacer) {
        const parts = [];
        let last = 0;
        for (const match of str.matchAll(search)) {
            parts.push(str.slice(last, match.index));
            if (match.index === undefined) {
                throw new Error('match.index should be defined');
            }
            last = match.index + match[0].length;
            parts.push(replacer(match[0], ...match.slice(1), match.index, str, match.groups));
        }
        parts.push(str.slice(last));
        return Promise.all(parts).then(p => p.join(''));
    }
    exports.replaceAsync = replaceAsync;
    function compare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    }
    exports.compare = compare;
    function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
            const codeA = a.charCodeAt(aStart);
            const codeB = b.charCodeAt(bStart);
            if (codeA < codeB) {
                return -1;
            }
            else if (codeA > codeB) {
                return 1;
            }
        }
        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;
        if (aLen < bLen) {
            return -1;
        }
        else if (aLen > bLen) {
            return 1;
        }
        return 0;
    }
    exports.compareSubstring = compareSubstring;
    function compareIgnoreCase(a, b) {
        return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
    }
    exports.compareIgnoreCase = compareIgnoreCase;
    function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
            let codeA = a.charCodeAt(aStart);
            let codeB = b.charCodeAt(bStart);
            if (codeA === codeB) {
                // equal
                continue;
            }
            if (codeA >= 128 || codeB >= 128) {
                // not ASCII letters -> fallback to lower-casing strings
                return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
            }
            // mapper lower-case ascii letter onto upper-case varinats
            // [97-122] (lower ascii) --> [65-90] (upper ascii)
            if (isLowerAsciiLetter(codeA)) {
                codeA -= 32;
            }
            if (isLowerAsciiLetter(codeB)) {
                codeB -= 32;
            }
            // compare both code points
            const diff = codeA - codeB;
            if (diff === 0) {
                continue;
            }
            return diff;
        }
        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;
        if (aLen < bLen) {
            return -1;
        }
        else if (aLen > bLen) {
            return 1;
        }
        return 0;
    }
    exports.compareSubstringIgnoreCase = compareSubstringIgnoreCase;
    function isAsciiDigit(code) {
        return code >= 48 /* CharCode.Digit0 */ && code <= 57 /* CharCode.Digit9 */;
    }
    exports.isAsciiDigit = isAsciiDigit;
    function isLowerAsciiLetter(code) {
        return code >= 97 /* CharCode.a */ && code <= 122 /* CharCode.z */;
    }
    exports.isLowerAsciiLetter = isLowerAsciiLetter;
    function isUpperAsciiLetter(code) {
        return code >= 65 /* CharCode.A */ && code <= 90 /* CharCode.Z */;
    }
    exports.isUpperAsciiLetter = isUpperAsciiLetter;
    function equalsIgnoreCase(a, b) {
        return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
    }
    exports.equalsIgnoreCase = equalsIgnoreCase;
    function startsWithIgnoreCase(str, candidate) {
        const candidateLength = candidate.length;
        if (candidate.length > str.length) {
            return false;
        }
        return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
    }
    exports.startsWithIgnoreCase = startsWithIgnoreCase;
    /**
     * @returns the length of the common prefix of the two strings.
     */
    function commonPrefixLength(a, b) {
        const len = Math.min(a.length, b.length);
        let i;
        for (i = 0; i < len; i++) {
            if (a.charCodeAt(i) !== b.charCodeAt(i)) {
                return i;
            }
        }
        return len;
    }
    exports.commonPrefixLength = commonPrefixLength;
    /**
     * @returns the length of the common suffix of the two strings.
     */
    function commonSuffixLength(a, b) {
        const len = Math.min(a.length, b.length);
        let i;
        const aLastIndex = a.length - 1;
        const bLastIndex = b.length - 1;
        for (i = 0; i < len; i++) {
            if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
                return i;
            }
        }
        return len;
    }
    exports.commonSuffixLength = commonSuffixLength;
    /**
     * See http://en.wikipedia.org/wiki/Surrogate_pair
     */
    function isHighSurrogate(charCode) {
        return (0xD800 <= charCode && charCode <= 0xDBFF);
    }
    exports.isHighSurrogate = isHighSurrogate;
    /**
     * See http://en.wikipedia.org/wiki/Surrogate_pair
     */
    function isLowSurrogate(charCode) {
        return (0xDC00 <= charCode && charCode <= 0xDFFF);
    }
    exports.isLowSurrogate = isLowSurrogate;
    /**
     * See http://en.wikipedia.org/wiki/Surrogate_pair
     */
    function computeCodePoint(highSurrogate, lowSurrogate) {
        return ((highSurrogate - 0xD800) << 10) + (lowSurrogate - 0xDC00) + 0x10000;
    }
    exports.computeCodePoint = computeCodePoint;
    /**
     * get the code point that begins at offset `offset`
     */
    function getNextCodePoint(str, len, offset) {
        const charCode = str.charCodeAt(offset);
        if (isHighSurrogate(charCode) && offset + 1 < len) {
            const nextCharCode = str.charCodeAt(offset + 1);
            if (isLowSurrogate(nextCharCode)) {
                return computeCodePoint(charCode, nextCharCode);
            }
        }
        return charCode;
    }
    exports.getNextCodePoint = getNextCodePoint;
    /**
     * get the code point that ends right before offset `offset`
     */
    function getPrevCodePoint(str, offset) {
        const charCode = str.charCodeAt(offset - 1);
        if (isLowSurrogate(charCode) && offset > 1) {
            const prevCharCode = str.charCodeAt(offset - 2);
            if (isHighSurrogate(prevCharCode)) {
                return computeCodePoint(prevCharCode, charCode);
            }
        }
        return charCode;
    }
    class CodePointIterator {
        get offset() {
            return this._offset;
        }
        constructor(str, offset = 0) {
            this._str = str;
            this._len = str.length;
            this._offset = offset;
        }
        setOffset(offset) {
            this._offset = offset;
        }
        prevCodePoint() {
            const codePoint = getPrevCodePoint(this._str, this._offset);
            this._offset -= (codePoint >= 65536 /* Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            return codePoint;
        }
        nextCodePoint() {
            const codePoint = getNextCodePoint(this._str, this._len, this._offset);
            this._offset += (codePoint >= 65536 /* Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            return codePoint;
        }
        eol() {
            return (this._offset >= this._len);
        }
    }
    exports.CodePointIterator = CodePointIterator;
    class GraphemeIterator {
        get offset() {
            return this._iterator.offset;
        }
        constructor(str, offset = 0) {
            this._iterator = new CodePointIterator(str, offset);
        }
        nextGraphemeLength() {
            const graphemeBreakTree = GraphemeBreakTree.getInstance();
            const iterator = this._iterator;
            const initialOffset = iterator.offset;
            let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.nextCodePoint());
            while (!iterator.eol()) {
                const offset = iterator.offset;
                const nextGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.nextCodePoint());
                if (breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                    // move iterator back
                    iterator.setOffset(offset);
                    break;
                }
                graphemeBreakType = nextGraphemeBreakType;
            }
            return (iterator.offset - initialOffset);
        }
        prevGraphemeLength() {
            const graphemeBreakTree = GraphemeBreakTree.getInstance();
            const iterator = this._iterator;
            const initialOffset = iterator.offset;
            let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.prevCodePoint());
            while (iterator.offset > 0) {
                const offset = iterator.offset;
                const prevGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.prevCodePoint());
                if (breakBetweenGraphemeBreakType(prevGraphemeBreakType, graphemeBreakType)) {
                    // move iterator back
                    iterator.setOffset(offset);
                    break;
                }
                graphemeBreakType = prevGraphemeBreakType;
            }
            return (initialOffset - iterator.offset);
        }
        eol() {
            return this._iterator.eol();
        }
    }
    exports.GraphemeIterator = GraphemeIterator;
    function nextCharLength(str, initialOffset) {
        const iterator = new GraphemeIterator(str, initialOffset);
        return iterator.nextGraphemeLength();
    }
    exports.nextCharLength = nextCharLength;
    function prevCharLength(str, initialOffset) {
        const iterator = new GraphemeIterator(str, initialOffset);
        return iterator.prevGraphemeLength();
    }
    exports.prevCharLength = prevCharLength;
    function getCharContainingOffset(str, offset) {
        if (offset > 0 && isLowSurrogate(str.charCodeAt(offset))) {
            offset--;
        }
        const endOffset = offset + nextCharLength(str, offset);
        const startOffset = endOffset - prevCharLength(str, endOffset);
        return [startOffset, endOffset];
    }
    exports.getCharContainingOffset = getCharContainingOffset;
    function charCount(str) {
        const iterator = new GraphemeIterator(str);
        let length = 0;
        while (!iterator.eol()) {
            length++;
            iterator.nextGraphemeLength();
        }
        return length;
    }
    exports.charCount = charCount;
    let CONTAINS_RTL = undefined;
    function makeContainsRtl() {
        // Generated using https://github.com/alexdima/unicode-utils/blob/main/rtl-test.js
        return /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA\u07FE-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u088E\u08A0-\u08C9\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDC7\uFDF0-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE35\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDD23\uDE80-\uDEA9\uDEAD-\uDF45\uDF51-\uDF81\uDF86-\uDFF6]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD4B-\uDFFF]|\uD83B[\uDC00-\uDEBB])/;
    }
    /**
     * Returns true if `str` contains any Unicode character that is classified as "R" or "AL".
     */
    function containsRTL(str) {
        if (!CONTAINS_RTL) {
            CONTAINS_RTL = makeContainsRtl();
        }
        return CONTAINS_RTL.test(str);
    }
    exports.containsRTL = containsRTL;
    const IS_BASIC_ASCII = /^[\t\n\r\x20-\x7E]*$/;
    /**
     * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t
     */
    function isBasicASCII(str) {
        return IS_BASIC_ASCII.test(str);
    }
    exports.isBasicASCII = isBasicASCII;
    exports.UNUSUAL_LINE_TERMINATORS = /[\u2028\u2029]/; // LINE SEPARATOR (LS) or PARAGRAPH SEPARATOR (PS)
    /**
     * Returns true if `str` contains unusual line terminators, like LS or PS
     */
    function containsUnusualLineTerminators(str) {
        return exports.UNUSUAL_LINE_TERMINATORS.test(str);
    }
    exports.containsUnusualLineTerminators = containsUnusualLineTerminators;
    function isFullWidthCharacter(charCode) {
        // Do a cheap trick to better support wrapping of wide characters, treat them as 2 columns
        // http://jrgraphix.net/research/unicode_blocks.php
        //          2E80 - 2EFF   CJK Radicals Supplement
        //          2F00 - 2FDF   Kangxi Radicals
        //          2FF0 - 2FFF   Ideographic Description Characters
        //          3000 - 303F   CJK Symbols and Punctuation
        //          3040 - 309F   Hiragana
        //          30A0 - 30FF   Katakana
        //          3100 - 312F   Bopomofo
        //          3130 - 318F   Hangul Compatibility Jamo
        //          3190 - 319F   Kanbun
        //          31A0 - 31BF   Bopomofo Extended
        //          31F0 - 31FF   Katakana Phonetic Extensions
        //          3200 - 32FF   Enclosed CJK Letters and Months
        //          3300 - 33FF   CJK Compatibility
        //          3400 - 4DBF   CJK Unified Ideographs Extension A
        //          4DC0 - 4DFF   Yijing Hexagram Symbols
        //          4E00 - 9FFF   CJK Unified Ideographs
        //          A000 - A48F   Yi Syllables
        //          A490 - A4CF   Yi Radicals
        //          AC00 - D7AF   Hangul Syllables
        // [IGNORE] D800 - DB7F   High Surrogates
        // [IGNORE] DB80 - DBFF   High Private Use Surrogates
        // [IGNORE] DC00 - DFFF   Low Surrogates
        // [IGNORE] E000 - F8FF   Private Use Area
        //          F900 - FAFF   CJK Compatibility Ideographs
        // [IGNORE] FB00 - FB4F   Alphabetic Presentation Forms
        // [IGNORE] FB50 - FDFF   Arabic Presentation Forms-A
        // [IGNORE] FE00 - FE0F   Variation Selectors
        // [IGNORE] FE20 - FE2F   Combining Half Marks
        // [IGNORE] FE30 - FE4F   CJK Compatibility Forms
        // [IGNORE] FE50 - FE6F   Small Form Variants
        // [IGNORE] FE70 - FEFF   Arabic Presentation Forms-B
        //          FF00 - FFEF   Halfwidth and Fullwidth Forms
        //               [https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms]
        //               of which FF01 - FF5E fullwidth ASCII of 21 to 7E
        // [IGNORE]    and FF65 - FFDC halfwidth of Katakana and Hangul
        // [IGNORE] FFF0 - FFFF   Specials
        return ((charCode >= 0x2E80 && charCode <= 0xD7AF)
            || (charCode >= 0xF900 && charCode <= 0xFAFF)
            || (charCode >= 0xFF01 && charCode <= 0xFF5E));
    }
    exports.isFullWidthCharacter = isFullWidthCharacter;
    /**
     * A fast function (therefore imprecise) to check if code points are emojis.
     * Generated using https://github.com/alexdima/unicode-utils/blob/main/emoji-test.js
     */
    function isEmojiImprecise(x) {
        return ((x >= 0x1F1E6 && x <= 0x1F1FF) || (x === 8986) || (x === 8987) || (x === 9200)
            || (x === 9203) || (x >= 9728 && x <= 10175) || (x === 11088) || (x === 11093)
            || (x >= 127744 && x <= 128591) || (x >= 128640 && x <= 128764)
            || (x >= 128992 && x <= 129008) || (x >= 129280 && x <= 129535)
            || (x >= 129648 && x <= 129782));
    }
    exports.isEmojiImprecise = isEmojiImprecise;
    /**
     * Given a string and a max length returns a shorted version. Shorting
     * happens at favorable positions - such as whitespace or punctuation characters.
     * The return value can be longer than the given value of `n`. Leading whitespace is always trimmed.
     */
    function lcut(text, n, prefix = '') {
        const trimmed = text.trimStart();
        if (trimmed.length < n) {
            return trimmed;
        }
        const re = /\b/g;
        let i = 0;
        while (re.test(trimmed)) {
            if (trimmed.length - re.lastIndex < n) {
                break;
            }
            i = re.lastIndex;
            re.lastIndex += 1;
        }
        if (i === 0) {
            return trimmed;
        }
        return prefix + trimmed.substring(i).trimStart();
    }
    exports.lcut = lcut;
    // Escape codes, compiled from https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Functions-using-CSI-_-ordered-by-the-final-character_s_
    const CSI_SEQUENCE = /(:?\x1b\[|\x9B)[=?>!]?[\d;:]*["$#'* ]?[a-zA-Z@^`{}|~]/g;
    // Plus additional markers for custom `\x1b]...\x07` instructions.
    const CSI_CUSTOM_SEQUENCE = /\x1b\].*?\x07/g;
    function removeAnsiEscapeCodes(str) {
        if (str) {
            str = str.replace(CSI_SEQUENCE, '').replace(CSI_CUSTOM_SEQUENCE, '');
        }
        return str;
    }
    exports.removeAnsiEscapeCodes = removeAnsiEscapeCodes;
    // -- UTF-8 BOM
    exports.UTF8_BOM_CHARACTER = String.fromCharCode(65279 /* CharCode.UTF8_BOM */);
    function startsWithUTF8BOM(str) {
        return !!(str && str.length > 0 && str.charCodeAt(0) === 65279 /* CharCode.UTF8_BOM */);
    }
    exports.startsWithUTF8BOM = startsWithUTF8BOM;
    function stripUTF8BOM(str) {
        return startsWithUTF8BOM(str) ? str.substr(1) : str;
    }
    exports.stripUTF8BOM = stripUTF8BOM;
    /**
     * Checks if the characters of the provided query string are included in the
     * target string. The characters do not have to be contiguous within the string.
     */
    function fuzzyContains(target, query) {
        if (!target || !query) {
            return false; // return early if target or query are undefined
        }
        if (target.length < query.length) {
            return false; // impossible for query to be contained in target
        }
        const queryLen = query.length;
        const targetLower = target.toLowerCase();
        let index = 0;
        let lastIndexOf = -1;
        while (index < queryLen) {
            const indexOf = targetLower.indexOf(query[index], lastIndexOf + 1);
            if (indexOf < 0) {
                return false;
            }
            lastIndexOf = indexOf;
            index++;
        }
        return true;
    }
    exports.fuzzyContains = fuzzyContains;
    function containsUppercaseCharacter(target, ignoreEscapedChars = false) {
        if (!target) {
            return false;
        }
        if (ignoreEscapedChars) {
            target = target.replace(/\\./g, '');
        }
        return target.toLowerCase() !== target;
    }
    exports.containsUppercaseCharacter = containsUppercaseCharacter;
    function uppercaseFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    exports.uppercaseFirstLetter = uppercaseFirstLetter;
    function getNLines(str, n = 1) {
        if (n === 0) {
            return '';
        }
        let idx = -1;
        do {
            idx = str.indexOf('\n', idx + 1);
            n--;
        } while (n > 0 && idx >= 0);
        if (idx === -1) {
            return str;
        }
        if (str[idx - 1] === '\r') {
            idx--;
        }
        return str.substr(0, idx);
    }
    exports.getNLines = getNLines;
    /**
     * Produces 'a'-'z', followed by 'A'-'Z'... followed by 'a'-'z', etc.
     */
    function singleLetterHash(n) {
        const LETTERS_CNT = (90 /* CharCode.Z */ - 65 /* CharCode.A */ + 1);
        n = n % (2 * LETTERS_CNT);
        if (n < LETTERS_CNT) {
            return String.fromCharCode(97 /* CharCode.a */ + n);
        }
        return String.fromCharCode(65 /* CharCode.A */ + n - LETTERS_CNT);
    }
    exports.singleLetterHash = singleLetterHash;
    //#region Unicode Grapheme Break
    function getGraphemeBreakType(codePoint) {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        return graphemeBreakTree.getGraphemeBreakType(codePoint);
    }
    exports.getGraphemeBreakType = getGraphemeBreakType;
    function breakBetweenGraphemeBreakType(breakTypeA, breakTypeB) {
        // http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundary_Rules
        // !!! Let's make the common case a bit faster
        if (breakTypeA === 0 /* GraphemeBreakType.Other */) {
            // see https://www.unicode.org/Public/13.0.0/ucd/auxiliary/GraphemeBreakTest-13.0.0d10.html#table
            return (breakTypeB !== 5 /* GraphemeBreakType.Extend */ && breakTypeB !== 7 /* GraphemeBreakType.SpacingMark */);
        }
        // Do not break between a CR and LF. Otherwise, break before and after controls.
        // GB3                                        CR × LF
        // GB4                       (Control | CR | LF) ÷
        // GB5                                           ÷ (Control | CR | LF)
        if (breakTypeA === 2 /* GraphemeBreakType.CR */) {
            if (breakTypeB === 3 /* GraphemeBreakType.LF */) {
                return false; // GB3
            }
        }
        if (breakTypeA === 4 /* GraphemeBreakType.Control */ || breakTypeA === 2 /* GraphemeBreakType.CR */ || breakTypeA === 3 /* GraphemeBreakType.LF */) {
            return true; // GB4
        }
        if (breakTypeB === 4 /* GraphemeBreakType.Control */ || breakTypeB === 2 /* GraphemeBreakType.CR */ || breakTypeB === 3 /* GraphemeBreakType.LF */) {
            return true; // GB5
        }
        // Do not break Hangul syllable sequences.
        // GB6                                         L × (L | V | LV | LVT)
        // GB7                                  (LV | V) × (V | T)
        // GB8                                 (LVT | T) × T
        if (breakTypeA === 8 /* GraphemeBreakType.L */) {
            if (breakTypeB === 8 /* GraphemeBreakType.L */ || breakTypeB === 9 /* GraphemeBreakType.V */ || breakTypeB === 11 /* GraphemeBreakType.LV */ || breakTypeB === 12 /* GraphemeBreakType.LVT */) {
                return false; // GB6
            }
        }
        if (breakTypeA === 11 /* GraphemeBreakType.LV */ || breakTypeA === 9 /* GraphemeBreakType.V */) {
            if (breakTypeB === 9 /* GraphemeBreakType.V */ || breakTypeB === 10 /* GraphemeBreakType.T */) {
                return false; // GB7
            }
        }
        if (breakTypeA === 12 /* GraphemeBreakType.LVT */ || breakTypeA === 10 /* GraphemeBreakType.T */) {
            if (breakTypeB === 10 /* GraphemeBreakType.T */) {
                return false; // GB8
            }
        }
        // Do not break before extending characters or ZWJ.
        // GB9                                           × (Extend | ZWJ)
        if (breakTypeB === 5 /* GraphemeBreakType.Extend */ || breakTypeB === 13 /* GraphemeBreakType.ZWJ */) {
            return false; // GB9
        }
        // The GB9a and GB9b rules only apply to extended grapheme clusters:
        // Do not break before SpacingMarks, or after Prepend characters.
        // GB9a                                          × SpacingMark
        // GB9b                                  Prepend ×
        if (breakTypeB === 7 /* GraphemeBreakType.SpacingMark */) {
            return false; // GB9a
        }
        if (breakTypeA === 1 /* GraphemeBreakType.Prepend */) {
            return false; // GB9b
        }
        // Do not break within emoji modifier sequences or emoji zwj sequences.
        // GB11    \p{Extended_Pictographic} Extend* ZWJ × \p{Extended_Pictographic}
        if (breakTypeA === 13 /* GraphemeBreakType.ZWJ */ && breakTypeB === 14 /* GraphemeBreakType.Extended_Pictographic */) {
            // Note: we are not implementing the rule entirely here to avoid introducing states
            return false; // GB11
        }
        // GB12                          sot (RI RI)* RI × RI
        // GB13                        [^RI] (RI RI)* RI × RI
        if (breakTypeA === 6 /* GraphemeBreakType.Regional_Indicator */ && breakTypeB === 6 /* GraphemeBreakType.Regional_Indicator */) {
            // Note: we are not implementing the rule entirely here to avoid introducing states
            return false; // GB12 & GB13
        }
        // GB999                                     Any ÷ Any
        return true;
    }
    var GraphemeBreakType;
    (function (GraphemeBreakType) {
        GraphemeBreakType[GraphemeBreakType["Other"] = 0] = "Other";
        GraphemeBreakType[GraphemeBreakType["Prepend"] = 1] = "Prepend";
        GraphemeBreakType[GraphemeBreakType["CR"] = 2] = "CR";
        GraphemeBreakType[GraphemeBreakType["LF"] = 3] = "LF";
        GraphemeBreakType[GraphemeBreakType["Control"] = 4] = "Control";
        GraphemeBreakType[GraphemeBreakType["Extend"] = 5] = "Extend";
        GraphemeBreakType[GraphemeBreakType["Regional_Indicator"] = 6] = "Regional_Indicator";
        GraphemeBreakType[GraphemeBreakType["SpacingMark"] = 7] = "SpacingMark";
        GraphemeBreakType[GraphemeBreakType["L"] = 8] = "L";
        GraphemeBreakType[GraphemeBreakType["V"] = 9] = "V";
        GraphemeBreakType[GraphemeBreakType["T"] = 10] = "T";
        GraphemeBreakType[GraphemeBreakType["LV"] = 11] = "LV";
        GraphemeBreakType[GraphemeBreakType["LVT"] = 12] = "LVT";
        GraphemeBreakType[GraphemeBreakType["ZWJ"] = 13] = "ZWJ";
        GraphemeBreakType[GraphemeBreakType["Extended_Pictographic"] = 14] = "Extended_Pictographic";
    })(GraphemeBreakType || (exports.GraphemeBreakType = GraphemeBreakType = {}));
    class GraphemeBreakTree {
        static { this._INSTANCE = null; }
        static getInstance() {
            if (!GraphemeBreakTree._INSTANCE) {
                GraphemeBreakTree._INSTANCE = new GraphemeBreakTree();
            }
            return GraphemeBreakTree._INSTANCE;
        }
        constructor() {
            this._data = getGraphemeBreakRawData();
        }
        getGraphemeBreakType(codePoint) {
            // !!! Let's make 7bit ASCII a bit faster: 0..31
            if (codePoint < 32) {
                if (codePoint === 10 /* CharCode.LineFeed */) {
                    return 3 /* GraphemeBreakType.LF */;
                }
                if (codePoint === 13 /* CharCode.CarriageReturn */) {
                    return 2 /* GraphemeBreakType.CR */;
                }
                return 4 /* GraphemeBreakType.Control */;
            }
            // !!! Let's make 7bit ASCII a bit faster: 32..126
            if (codePoint < 127) {
                return 0 /* GraphemeBreakType.Other */;
            }
            const data = this._data;
            const nodeCount = data.length / 3;
            let nodeIndex = 1;
            while (nodeIndex <= nodeCount) {
                if (codePoint < data[3 * nodeIndex]) {
                    // go left
                    nodeIndex = 2 * nodeIndex;
                }
                else if (codePoint > data[3 * nodeIndex + 1]) {
                    // go right
                    nodeIndex = 2 * nodeIndex + 1;
                }
                else {
                    // hit
                    return data[3 * nodeIndex + 2];
                }
            }
            return 0 /* GraphemeBreakType.Other */;
        }
    }
    function getGraphemeBreakRawData() {
        // generated using https://github.com/alexdima/unicode-utils/blob/main/grapheme-break.js
        return JSON.parse('[0,0,0,51229,51255,12,44061,44087,12,127462,127487,6,7083,7085,5,47645,47671,12,54813,54839,12,128678,128678,14,3270,3270,5,9919,9923,14,45853,45879,12,49437,49463,12,53021,53047,12,71216,71218,7,128398,128399,14,129360,129374,14,2519,2519,5,4448,4519,9,9742,9742,14,12336,12336,14,44957,44983,12,46749,46775,12,48541,48567,12,50333,50359,12,52125,52151,12,53917,53943,12,69888,69890,5,73018,73018,5,127990,127990,14,128558,128559,14,128759,128760,14,129653,129655,14,2027,2035,5,2891,2892,7,3761,3761,5,6683,6683,5,8293,8293,4,9825,9826,14,9999,9999,14,43452,43453,5,44509,44535,12,45405,45431,12,46301,46327,12,47197,47223,12,48093,48119,12,48989,49015,12,49885,49911,12,50781,50807,12,51677,51703,12,52573,52599,12,53469,53495,12,54365,54391,12,65279,65279,4,70471,70472,7,72145,72147,7,119173,119179,5,127799,127818,14,128240,128244,14,128512,128512,14,128652,128652,14,128721,128722,14,129292,129292,14,129445,129450,14,129734,129743,14,1476,1477,5,2366,2368,7,2750,2752,7,3076,3076,5,3415,3415,5,4141,4144,5,6109,6109,5,6964,6964,5,7394,7400,5,9197,9198,14,9770,9770,14,9877,9877,14,9968,9969,14,10084,10084,14,43052,43052,5,43713,43713,5,44285,44311,12,44733,44759,12,45181,45207,12,45629,45655,12,46077,46103,12,46525,46551,12,46973,46999,12,47421,47447,12,47869,47895,12,48317,48343,12,48765,48791,12,49213,49239,12,49661,49687,12,50109,50135,12,50557,50583,12,51005,51031,12,51453,51479,12,51901,51927,12,52349,52375,12,52797,52823,12,53245,53271,12,53693,53719,12,54141,54167,12,54589,54615,12,55037,55063,12,69506,69509,5,70191,70193,5,70841,70841,7,71463,71467,5,72330,72342,5,94031,94031,5,123628,123631,5,127763,127765,14,127941,127941,14,128043,128062,14,128302,128317,14,128465,128467,14,128539,128539,14,128640,128640,14,128662,128662,14,128703,128703,14,128745,128745,14,129004,129007,14,129329,129330,14,129402,129402,14,129483,129483,14,129686,129704,14,130048,131069,14,173,173,4,1757,1757,1,2200,2207,5,2434,2435,7,2631,2632,5,2817,2817,5,3008,3008,5,3201,3201,5,3387,3388,5,3542,3542,5,3902,3903,7,4190,4192,5,6002,6003,5,6439,6440,5,6765,6770,7,7019,7027,5,7154,7155,7,8205,8205,13,8505,8505,14,9654,9654,14,9757,9757,14,9792,9792,14,9852,9853,14,9890,9894,14,9937,9937,14,9981,9981,14,10035,10036,14,11035,11036,14,42654,42655,5,43346,43347,7,43587,43587,5,44006,44007,7,44173,44199,12,44397,44423,12,44621,44647,12,44845,44871,12,45069,45095,12,45293,45319,12,45517,45543,12,45741,45767,12,45965,45991,12,46189,46215,12,46413,46439,12,46637,46663,12,46861,46887,12,47085,47111,12,47309,47335,12,47533,47559,12,47757,47783,12,47981,48007,12,48205,48231,12,48429,48455,12,48653,48679,12,48877,48903,12,49101,49127,12,49325,49351,12,49549,49575,12,49773,49799,12,49997,50023,12,50221,50247,12,50445,50471,12,50669,50695,12,50893,50919,12,51117,51143,12,51341,51367,12,51565,51591,12,51789,51815,12,52013,52039,12,52237,52263,12,52461,52487,12,52685,52711,12,52909,52935,12,53133,53159,12,53357,53383,12,53581,53607,12,53805,53831,12,54029,54055,12,54253,54279,12,54477,54503,12,54701,54727,12,54925,54951,12,55149,55175,12,68101,68102,5,69762,69762,7,70067,70069,7,70371,70378,5,70720,70721,7,71087,71087,5,71341,71341,5,71995,71996,5,72249,72249,7,72850,72871,5,73109,73109,5,118576,118598,5,121505,121519,5,127245,127247,14,127568,127569,14,127777,127777,14,127872,127891,14,127956,127967,14,128015,128016,14,128110,128172,14,128259,128259,14,128367,128368,14,128424,128424,14,128488,128488,14,128530,128532,14,128550,128551,14,128566,128566,14,128647,128647,14,128656,128656,14,128667,128673,14,128691,128693,14,128715,128715,14,128728,128732,14,128752,128752,14,128765,128767,14,129096,129103,14,129311,129311,14,129344,129349,14,129394,129394,14,129413,129425,14,129466,129471,14,129511,129535,14,129664,129666,14,129719,129722,14,129760,129767,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2307,2307,7,2382,2383,7,2497,2500,5,2563,2563,7,2677,2677,5,2763,2764,7,2879,2879,5,2914,2915,5,3021,3021,5,3142,3144,5,3263,3263,5,3285,3286,5,3398,3400,7,3530,3530,5,3633,3633,5,3864,3865,5,3974,3975,5,4155,4156,7,4229,4230,5,5909,5909,7,6078,6085,7,6277,6278,5,6451,6456,7,6744,6750,5,6846,6846,5,6972,6972,5,7074,7077,5,7146,7148,7,7222,7223,5,7416,7417,5,8234,8238,4,8417,8417,5,9000,9000,14,9203,9203,14,9730,9731,14,9748,9749,14,9762,9763,14,9776,9783,14,9800,9811,14,9831,9831,14,9872,9873,14,9882,9882,14,9900,9903,14,9929,9933,14,9941,9960,14,9974,9974,14,9989,9989,14,10006,10006,14,10062,10062,14,10160,10160,14,11647,11647,5,12953,12953,14,43019,43019,5,43232,43249,5,43443,43443,5,43567,43568,7,43696,43696,5,43765,43765,7,44013,44013,5,44117,44143,12,44229,44255,12,44341,44367,12,44453,44479,12,44565,44591,12,44677,44703,12,44789,44815,12,44901,44927,12,45013,45039,12,45125,45151,12,45237,45263,12,45349,45375,12,45461,45487,12,45573,45599,12,45685,45711,12,45797,45823,12,45909,45935,12,46021,46047,12,46133,46159,12,46245,46271,12,46357,46383,12,46469,46495,12,46581,46607,12,46693,46719,12,46805,46831,12,46917,46943,12,47029,47055,12,47141,47167,12,47253,47279,12,47365,47391,12,47477,47503,12,47589,47615,12,47701,47727,12,47813,47839,12,47925,47951,12,48037,48063,12,48149,48175,12,48261,48287,12,48373,48399,12,48485,48511,12,48597,48623,12,48709,48735,12,48821,48847,12,48933,48959,12,49045,49071,12,49157,49183,12,49269,49295,12,49381,49407,12,49493,49519,12,49605,49631,12,49717,49743,12,49829,49855,12,49941,49967,12,50053,50079,12,50165,50191,12,50277,50303,12,50389,50415,12,50501,50527,12,50613,50639,12,50725,50751,12,50837,50863,12,50949,50975,12,51061,51087,12,51173,51199,12,51285,51311,12,51397,51423,12,51509,51535,12,51621,51647,12,51733,51759,12,51845,51871,12,51957,51983,12,52069,52095,12,52181,52207,12,52293,52319,12,52405,52431,12,52517,52543,12,52629,52655,12,52741,52767,12,52853,52879,12,52965,52991,12,53077,53103,12,53189,53215,12,53301,53327,12,53413,53439,12,53525,53551,12,53637,53663,12,53749,53775,12,53861,53887,12,53973,53999,12,54085,54111,12,54197,54223,12,54309,54335,12,54421,54447,12,54533,54559,12,54645,54671,12,54757,54783,12,54869,54895,12,54981,55007,12,55093,55119,12,55243,55291,10,66045,66045,5,68325,68326,5,69688,69702,5,69817,69818,5,69957,69958,7,70089,70092,5,70198,70199,5,70462,70462,5,70502,70508,5,70750,70750,5,70846,70846,7,71100,71101,5,71230,71230,7,71351,71351,5,71737,71738,5,72000,72000,7,72160,72160,5,72273,72278,5,72752,72758,5,72882,72883,5,73031,73031,5,73461,73462,7,94192,94193,7,119149,119149,7,121403,121452,5,122915,122916,5,126980,126980,14,127358,127359,14,127535,127535,14,127759,127759,14,127771,127771,14,127792,127793,14,127825,127867,14,127897,127899,14,127945,127945,14,127985,127986,14,128000,128007,14,128021,128021,14,128066,128100,14,128184,128235,14,128249,128252,14,128266,128276,14,128335,128335,14,128379,128390,14,128407,128419,14,128444,128444,14,128481,128481,14,128499,128499,14,128526,128526,14,128536,128536,14,128543,128543,14,128556,128556,14,128564,128564,14,128577,128580,14,128643,128645,14,128649,128649,14,128654,128654,14,128660,128660,14,128664,128664,14,128675,128675,14,128686,128689,14,128695,128696,14,128705,128709,14,128717,128719,14,128725,128725,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129009,129023,14,129160,129167,14,129296,129304,14,129320,129327,14,129340,129342,14,129356,129356,14,129388,129392,14,129399,129400,14,129404,129407,14,129432,129442,14,129454,129455,14,129473,129474,14,129485,129487,14,129648,129651,14,129659,129660,14,129671,129679,14,129709,129711,14,129728,129730,14,129751,129753,14,129776,129782,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2274,2274,1,2363,2363,7,2377,2380,7,2402,2403,5,2494,2494,5,2507,2508,7,2558,2558,5,2622,2624,7,2641,2641,5,2691,2691,7,2759,2760,5,2786,2787,5,2876,2876,5,2881,2884,5,2901,2902,5,3006,3006,5,3014,3016,7,3072,3072,5,3134,3136,5,3157,3158,5,3260,3260,5,3266,3266,5,3274,3275,7,3328,3329,5,3391,3392,7,3405,3405,5,3457,3457,5,3536,3537,7,3551,3551,5,3636,3642,5,3764,3772,5,3895,3895,5,3967,3967,7,3993,4028,5,4146,4151,5,4182,4183,7,4226,4226,5,4253,4253,5,4957,4959,5,5940,5940,7,6070,6070,7,6087,6088,7,6158,6158,4,6432,6434,5,6448,6449,7,6679,6680,5,6742,6742,5,6754,6754,5,6783,6783,5,6912,6915,5,6966,6970,5,6978,6978,5,7042,7042,7,7080,7081,5,7143,7143,7,7150,7150,7,7212,7219,5,7380,7392,5,7412,7412,5,8203,8203,4,8232,8232,4,8265,8265,14,8400,8412,5,8421,8432,5,8617,8618,14,9167,9167,14,9200,9200,14,9410,9410,14,9723,9726,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9774,14,9786,9786,14,9794,9794,14,9823,9823,14,9828,9828,14,9833,9850,14,9855,9855,14,9875,9875,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9935,9935,14,9939,9939,14,9962,9962,14,9972,9972,14,9978,9978,14,9986,9986,14,9997,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10133,10135,14,10548,10549,14,11093,11093,14,12330,12333,5,12441,12442,5,42608,42610,5,43010,43010,5,43045,43046,5,43188,43203,7,43302,43309,5,43392,43394,5,43446,43449,5,43493,43493,5,43571,43572,7,43597,43597,7,43703,43704,5,43756,43757,5,44003,44004,7,44009,44010,7,44033,44059,12,44089,44115,12,44145,44171,12,44201,44227,12,44257,44283,12,44313,44339,12,44369,44395,12,44425,44451,12,44481,44507,12,44537,44563,12,44593,44619,12,44649,44675,12,44705,44731,12,44761,44787,12,44817,44843,12,44873,44899,12,44929,44955,12,44985,45011,12,45041,45067,12,45097,45123,12,45153,45179,12,45209,45235,12,45265,45291,12,45321,45347,12,45377,45403,12,45433,45459,12,45489,45515,12,45545,45571,12,45601,45627,12,45657,45683,12,45713,45739,12,45769,45795,12,45825,45851,12,45881,45907,12,45937,45963,12,45993,46019,12,46049,46075,12,46105,46131,12,46161,46187,12,46217,46243,12,46273,46299,12,46329,46355,12,46385,46411,12,46441,46467,12,46497,46523,12,46553,46579,12,46609,46635,12,46665,46691,12,46721,46747,12,46777,46803,12,46833,46859,12,46889,46915,12,46945,46971,12,47001,47027,12,47057,47083,12,47113,47139,12,47169,47195,12,47225,47251,12,47281,47307,12,47337,47363,12,47393,47419,12,47449,47475,12,47505,47531,12,47561,47587,12,47617,47643,12,47673,47699,12,47729,47755,12,47785,47811,12,47841,47867,12,47897,47923,12,47953,47979,12,48009,48035,12,48065,48091,12,48121,48147,12,48177,48203,12,48233,48259,12,48289,48315,12,48345,48371,12,48401,48427,12,48457,48483,12,48513,48539,12,48569,48595,12,48625,48651,12,48681,48707,12,48737,48763,12,48793,48819,12,48849,48875,12,48905,48931,12,48961,48987,12,49017,49043,12,49073,49099,12,49129,49155,12,49185,49211,12,49241,49267,12,49297,49323,12,49353,49379,12,49409,49435,12,49465,49491,12,49521,49547,12,49577,49603,12,49633,49659,12,49689,49715,12,49745,49771,12,49801,49827,12,49857,49883,12,49913,49939,12,49969,49995,12,50025,50051,12,50081,50107,12,50137,50163,12,50193,50219,12,50249,50275,12,50305,50331,12,50361,50387,12,50417,50443,12,50473,50499,12,50529,50555,12,50585,50611,12,50641,50667,12,50697,50723,12,50753,50779,12,50809,50835,12,50865,50891,12,50921,50947,12,50977,51003,12,51033,51059,12,51089,51115,12,51145,51171,12,51201,51227,12,51257,51283,12,51313,51339,12,51369,51395,12,51425,51451,12,51481,51507,12,51537,51563,12,51593,51619,12,51649,51675,12,51705,51731,12,51761,51787,12,51817,51843,12,51873,51899,12,51929,51955,12,51985,52011,12,52041,52067,12,52097,52123,12,52153,52179,12,52209,52235,12,52265,52291,12,52321,52347,12,52377,52403,12,52433,52459,12,52489,52515,12,52545,52571,12,52601,52627,12,52657,52683,12,52713,52739,12,52769,52795,12,52825,52851,12,52881,52907,12,52937,52963,12,52993,53019,12,53049,53075,12,53105,53131,12,53161,53187,12,53217,53243,12,53273,53299,12,53329,53355,12,53385,53411,12,53441,53467,12,53497,53523,12,53553,53579,12,53609,53635,12,53665,53691,12,53721,53747,12,53777,53803,12,53833,53859,12,53889,53915,12,53945,53971,12,54001,54027,12,54057,54083,12,54113,54139,12,54169,54195,12,54225,54251,12,54281,54307,12,54337,54363,12,54393,54419,12,54449,54475,12,54505,54531,12,54561,54587,12,54617,54643,12,54673,54699,12,54729,54755,12,54785,54811,12,54841,54867,12,54897,54923,12,54953,54979,12,55009,55035,12,55065,55091,12,55121,55147,12,55177,55203,12,65024,65039,5,65520,65528,4,66422,66426,5,68152,68154,5,69291,69292,5,69633,69633,5,69747,69748,5,69811,69814,5,69826,69826,5,69932,69932,7,70016,70017,5,70079,70080,7,70095,70095,5,70196,70196,5,70367,70367,5,70402,70403,7,70464,70464,5,70487,70487,5,70709,70711,7,70725,70725,7,70833,70834,7,70843,70844,7,70849,70849,7,71090,71093,5,71103,71104,5,71227,71228,7,71339,71339,5,71344,71349,5,71458,71461,5,71727,71735,5,71985,71989,7,71998,71998,5,72002,72002,7,72154,72155,5,72193,72202,5,72251,72254,5,72281,72283,5,72344,72345,5,72766,72766,7,72874,72880,5,72885,72886,5,73023,73029,5,73104,73105,5,73111,73111,5,92912,92916,5,94095,94098,5,113824,113827,4,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,125252,125258,5,127183,127183,14,127340,127343,14,127377,127386,14,127491,127503,14,127548,127551,14,127744,127756,14,127761,127761,14,127769,127769,14,127773,127774,14,127780,127788,14,127796,127797,14,127820,127823,14,127869,127869,14,127894,127895,14,127902,127903,14,127943,127943,14,127947,127950,14,127972,127972,14,127988,127988,14,127992,127994,14,128009,128011,14,128019,128019,14,128023,128041,14,128064,128064,14,128102,128107,14,128174,128181,14,128238,128238,14,128246,128247,14,128254,128254,14,128264,128264,14,128278,128299,14,128329,128330,14,128348,128359,14,128371,128377,14,128392,128393,14,128401,128404,14,128421,128421,14,128433,128434,14,128450,128452,14,128476,128478,14,128483,128483,14,128495,128495,14,128506,128506,14,128519,128520,14,128528,128528,14,128534,128534,14,128538,128538,14,128540,128542,14,128544,128549,14,128552,128555,14,128557,128557,14,128560,128563,14,128565,128565,14,128567,128576,14,128581,128591,14,128641,128642,14,128646,128646,14,128648,128648,14,128650,128651,14,128653,128653,14,128655,128655,14,128657,128659,14,128661,128661,14,128663,128663,14,128665,128666,14,128674,128674,14,128676,128677,14,128679,128685,14,128690,128690,14,128694,128694,14,128697,128702,14,128704,128704,14,128710,128714,14,128716,128716,14,128720,128720,14,128723,128724,14,128726,128727,14,128733,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129008,129008,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129661,129663,14,129667,129670,14,129680,129685,14,129705,129708,14,129712,129718,14,129723,129727,14,129731,129733,14,129744,129750,14,129754,129759,14,129768,129775,14,129783,129791,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2192,2193,1,2250,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3132,3132,5,3137,3140,7,3146,3149,5,3170,3171,5,3202,3203,7,3262,3262,7,3264,3265,7,3267,3268,7,3271,3272,7,3276,3277,5,3298,3299,5,3330,3331,7,3390,3390,5,3393,3396,5,3402,3404,7,3406,3406,1,3426,3427,5,3458,3459,7,3535,3535,5,3538,3540,5,3544,3550,7,3570,3571,7,3635,3635,7,3655,3662,5,3763,3763,7,3784,3789,5,3893,3893,5,3897,3897,5,3953,3966,5,3968,3972,5,3981,3991,5,4038,4038,5,4145,4145,7,4153,4154,5,4157,4158,5,4184,4185,5,4209,4212,5,4228,4228,7,4237,4237,5,4352,4447,8,4520,4607,10,5906,5908,5,5938,5939,5,5970,5971,5,6068,6069,5,6071,6077,5,6086,6086,5,6089,6099,5,6155,6157,5,6159,6159,5,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6862,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7679,5,8204,8204,5,8206,8207,4,8233,8233,4,8252,8252,14,8288,8292,4,8294,8303,4,8413,8416,5,8418,8420,5,8482,8482,14,8596,8601,14,8986,8987,14,9096,9096,14,9193,9196,14,9199,9199,14,9201,9202,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9729,14,9732,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9775,9775,14,9784,9785,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9874,14,9876,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9934,14,9936,9936,14,9938,9938,14,9940,9940,14,9961,9961,14,9963,9967,14,9970,9971,14,9973,9973,14,9975,9977,14,9979,9980,14,9982,9985,14,9987,9988,14,9992,9996,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10083,14,10085,10087,14,10145,10145,14,10175,10175,14,11013,11015,14,11088,11088,14,11503,11505,5,11744,11775,5,12334,12335,5,12349,12349,14,12951,12951,14,42607,42607,5,42612,42621,5,42736,42737,5,43014,43014,5,43043,43044,7,43047,43047,7,43136,43137,7,43204,43205,5,43263,43263,5,43335,43345,5,43360,43388,8,43395,43395,7,43444,43445,7,43450,43451,7,43454,43456,7,43561,43566,5,43569,43570,5,43573,43574,5,43596,43596,5,43644,43644,5,43698,43700,5,43710,43711,5,43755,43755,7,43758,43759,7,43766,43766,5,44005,44005,5,44008,44008,5,44012,44012,7,44032,44032,11,44060,44060,11,44088,44088,11,44116,44116,11,44144,44144,11,44172,44172,11,44200,44200,11,44228,44228,11,44256,44256,11,44284,44284,11,44312,44312,11,44340,44340,11,44368,44368,11,44396,44396,11,44424,44424,11,44452,44452,11,44480,44480,11,44508,44508,11,44536,44536,11,44564,44564,11,44592,44592,11,44620,44620,11,44648,44648,11,44676,44676,11,44704,44704,11,44732,44732,11,44760,44760,11,44788,44788,11,44816,44816,11,44844,44844,11,44872,44872,11,44900,44900,11,44928,44928,11,44956,44956,11,44984,44984,11,45012,45012,11,45040,45040,11,45068,45068,11,45096,45096,11,45124,45124,11,45152,45152,11,45180,45180,11,45208,45208,11,45236,45236,11,45264,45264,11,45292,45292,11,45320,45320,11,45348,45348,11,45376,45376,11,45404,45404,11,45432,45432,11,45460,45460,11,45488,45488,11,45516,45516,11,45544,45544,11,45572,45572,11,45600,45600,11,45628,45628,11,45656,45656,11,45684,45684,11,45712,45712,11,45740,45740,11,45768,45768,11,45796,45796,11,45824,45824,11,45852,45852,11,45880,45880,11,45908,45908,11,45936,45936,11,45964,45964,11,45992,45992,11,46020,46020,11,46048,46048,11,46076,46076,11,46104,46104,11,46132,46132,11,46160,46160,11,46188,46188,11,46216,46216,11,46244,46244,11,46272,46272,11,46300,46300,11,46328,46328,11,46356,46356,11,46384,46384,11,46412,46412,11,46440,46440,11,46468,46468,11,46496,46496,11,46524,46524,11,46552,46552,11,46580,46580,11,46608,46608,11,46636,46636,11,46664,46664,11,46692,46692,11,46720,46720,11,46748,46748,11,46776,46776,11,46804,46804,11,46832,46832,11,46860,46860,11,46888,46888,11,46916,46916,11,46944,46944,11,46972,46972,11,47000,47000,11,47028,47028,11,47056,47056,11,47084,47084,11,47112,47112,11,47140,47140,11,47168,47168,11,47196,47196,11,47224,47224,11,47252,47252,11,47280,47280,11,47308,47308,11,47336,47336,11,47364,47364,11,47392,47392,11,47420,47420,11,47448,47448,11,47476,47476,11,47504,47504,11,47532,47532,11,47560,47560,11,47588,47588,11,47616,47616,11,47644,47644,11,47672,47672,11,47700,47700,11,47728,47728,11,47756,47756,11,47784,47784,11,47812,47812,11,47840,47840,11,47868,47868,11,47896,47896,11,47924,47924,11,47952,47952,11,47980,47980,11,48008,48008,11,48036,48036,11,48064,48064,11,48092,48092,11,48120,48120,11,48148,48148,11,48176,48176,11,48204,48204,11,48232,48232,11,48260,48260,11,48288,48288,11,48316,48316,11,48344,48344,11,48372,48372,11,48400,48400,11,48428,48428,11,48456,48456,11,48484,48484,11,48512,48512,11,48540,48540,11,48568,48568,11,48596,48596,11,48624,48624,11,48652,48652,11,48680,48680,11,48708,48708,11,48736,48736,11,48764,48764,11,48792,48792,11,48820,48820,11,48848,48848,11,48876,48876,11,48904,48904,11,48932,48932,11,48960,48960,11,48988,48988,11,49016,49016,11,49044,49044,11,49072,49072,11,49100,49100,11,49128,49128,11,49156,49156,11,49184,49184,11,49212,49212,11,49240,49240,11,49268,49268,11,49296,49296,11,49324,49324,11,49352,49352,11,49380,49380,11,49408,49408,11,49436,49436,11,49464,49464,11,49492,49492,11,49520,49520,11,49548,49548,11,49576,49576,11,49604,49604,11,49632,49632,11,49660,49660,11,49688,49688,11,49716,49716,11,49744,49744,11,49772,49772,11,49800,49800,11,49828,49828,11,49856,49856,11,49884,49884,11,49912,49912,11,49940,49940,11,49968,49968,11,49996,49996,11,50024,50024,11,50052,50052,11,50080,50080,11,50108,50108,11,50136,50136,11,50164,50164,11,50192,50192,11,50220,50220,11,50248,50248,11,50276,50276,11,50304,50304,11,50332,50332,11,50360,50360,11,50388,50388,11,50416,50416,11,50444,50444,11,50472,50472,11,50500,50500,11,50528,50528,11,50556,50556,11,50584,50584,11,50612,50612,11,50640,50640,11,50668,50668,11,50696,50696,11,50724,50724,11,50752,50752,11,50780,50780,11,50808,50808,11,50836,50836,11,50864,50864,11,50892,50892,11,50920,50920,11,50948,50948,11,50976,50976,11,51004,51004,11,51032,51032,11,51060,51060,11,51088,51088,11,51116,51116,11,51144,51144,11,51172,51172,11,51200,51200,11,51228,51228,11,51256,51256,11,51284,51284,11,51312,51312,11,51340,51340,11,51368,51368,11,51396,51396,11,51424,51424,11,51452,51452,11,51480,51480,11,51508,51508,11,51536,51536,11,51564,51564,11,51592,51592,11,51620,51620,11,51648,51648,11,51676,51676,11,51704,51704,11,51732,51732,11,51760,51760,11,51788,51788,11,51816,51816,11,51844,51844,11,51872,51872,11,51900,51900,11,51928,51928,11,51956,51956,11,51984,51984,11,52012,52012,11,52040,52040,11,52068,52068,11,52096,52096,11,52124,52124,11,52152,52152,11,52180,52180,11,52208,52208,11,52236,52236,11,52264,52264,11,52292,52292,11,52320,52320,11,52348,52348,11,52376,52376,11,52404,52404,11,52432,52432,11,52460,52460,11,52488,52488,11,52516,52516,11,52544,52544,11,52572,52572,11,52600,52600,11,52628,52628,11,52656,52656,11,52684,52684,11,52712,52712,11,52740,52740,11,52768,52768,11,52796,52796,11,52824,52824,11,52852,52852,11,52880,52880,11,52908,52908,11,52936,52936,11,52964,52964,11,52992,52992,11,53020,53020,11,53048,53048,11,53076,53076,11,53104,53104,11,53132,53132,11,53160,53160,11,53188,53188,11,53216,53216,11,53244,53244,11,53272,53272,11,53300,53300,11,53328,53328,11,53356,53356,11,53384,53384,11,53412,53412,11,53440,53440,11,53468,53468,11,53496,53496,11,53524,53524,11,53552,53552,11,53580,53580,11,53608,53608,11,53636,53636,11,53664,53664,11,53692,53692,11,53720,53720,11,53748,53748,11,53776,53776,11,53804,53804,11,53832,53832,11,53860,53860,11,53888,53888,11,53916,53916,11,53944,53944,11,53972,53972,11,54000,54000,11,54028,54028,11,54056,54056,11,54084,54084,11,54112,54112,11,54140,54140,11,54168,54168,11,54196,54196,11,54224,54224,11,54252,54252,11,54280,54280,11,54308,54308,11,54336,54336,11,54364,54364,11,54392,54392,11,54420,54420,11,54448,54448,11,54476,54476,11,54504,54504,11,54532,54532,11,54560,54560,11,54588,54588,11,54616,54616,11,54644,54644,11,54672,54672,11,54700,54700,11,54728,54728,11,54756,54756,11,54784,54784,11,54812,54812,11,54840,54840,11,54868,54868,11,54896,54896,11,54924,54924,11,54952,54952,11,54980,54980,11,55008,55008,11,55036,55036,11,55064,55064,11,55092,55092,11,55120,55120,11,55148,55148,11,55176,55176,11,55216,55238,9,64286,64286,5,65056,65071,5,65438,65439,5,65529,65531,4,66272,66272,5,68097,68099,5,68108,68111,5,68159,68159,5,68900,68903,5,69446,69456,5,69632,69632,7,69634,69634,7,69744,69744,5,69759,69761,5,69808,69810,7,69815,69816,7,69821,69821,1,69837,69837,1,69927,69931,5,69933,69940,5,70003,70003,5,70018,70018,7,70070,70078,5,70082,70083,1,70094,70094,7,70188,70190,7,70194,70195,7,70197,70197,7,70206,70206,5,70368,70370,7,70400,70401,5,70459,70460,5,70463,70463,7,70465,70468,7,70475,70477,7,70498,70499,7,70512,70516,5,70712,70719,5,70722,70724,5,70726,70726,5,70832,70832,5,70835,70840,5,70842,70842,5,70845,70845,5,70847,70848,5,70850,70851,5,71088,71089,7,71096,71099,7,71102,71102,7,71132,71133,5,71219,71226,5,71229,71229,5,71231,71232,5,71340,71340,7,71342,71343,7,71350,71350,7,71453,71455,5,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,118528,118573,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123566,123566,5,125136,125142,5,126976,126979,14,126981,127182,14,127184,127231,14,127279,127279,14,127344,127345,14,127374,127374,14,127405,127461,14,127489,127490,14,127514,127514,14,127538,127546,14,127561,127567,14,127570,127743,14,127757,127758,14,127760,127760,14,127762,127762,14,127766,127768,14,127770,127770,14,127772,127772,14,127775,127776,14,127778,127779,14,127789,127791,14,127794,127795,14,127798,127798,14,127819,127819,14,127824,127824,14,127868,127868,14,127870,127871,14,127892,127893,14,127896,127896,14,127900,127901,14,127904,127940,14,127942,127942,14,127944,127944,14,127946,127946,14,127951,127955,14,127968,127971,14,127973,127984,14,127987,127987,14,127989,127989,14,127991,127991,14,127995,127999,5,128008,128008,14,128012,128014,14,128017,128018,14,128020,128020,14,128022,128022,14,128042,128042,14,128063,128063,14,128065,128065,14,128101,128101,14,128108,128109,14,128173,128173,14,128182,128183,14,128236,128237,14,128239,128239,14,128245,128245,14,128248,128248,14,128253,128253,14,128255,128258,14,128260,128263,14,128265,128265,14,128277,128277,14,128300,128301,14,128326,128328,14,128331,128334,14,128336,128347,14,128360,128366,14,128369,128370,14,128378,128378,14,128391,128391,14,128394,128397,14,128400,128400,14,128405,128406,14,128420,128420,14,128422,128423,14,128425,128432,14,128435,128443,14,128445,128449,14,128453,128464,14,128468,128475,14,128479,128480,14,128482,128482,14,128484,128487,14,128489,128494,14,128496,128498,14,128500,128505,14,128507,128511,14,128513,128518,14,128521,128525,14,128527,128527,14,128529,128529,14,128533,128533,14,128535,128535,14,128537,128537,14]');
    }
    //#endregion
    /**
     * Computes the offset after performing a left delete on the given string,
     * while considering unicode grapheme/emoji rules.
    */
    function getLeftDeleteOffset(offset, str) {
        if (offset === 0) {
            return 0;
        }
        // Try to delete emoji part.
        const emojiOffset = getOffsetBeforeLastEmojiComponent(offset, str);
        if (emojiOffset !== undefined) {
            return emojiOffset;
        }
        // Otherwise, just skip a single code point.
        const iterator = new CodePointIterator(str, offset);
        iterator.prevCodePoint();
        return iterator.offset;
    }
    exports.getLeftDeleteOffset = getLeftDeleteOffset;
    function getOffsetBeforeLastEmojiComponent(initialOffset, str) {
        // See https://www.unicode.org/reports/tr51/tr51-14.html#EBNF_and_Regex for the
        // structure of emojis.
        const iterator = new CodePointIterator(str, initialOffset);
        let codePoint = iterator.prevCodePoint();
        // Skip modifiers
        while ((isEmojiModifier(codePoint) || codePoint === 65039 /* CodePoint.emojiVariantSelector */ || codePoint === 8419 /* CodePoint.enclosingKeyCap */)) {
            if (iterator.offset === 0) {
                // Cannot skip modifier, no preceding emoji base.
                return undefined;
            }
            codePoint = iterator.prevCodePoint();
        }
        // Expect base emoji
        if (!isEmojiImprecise(codePoint)) {
            // Unexpected code point, not a valid emoji.
            return undefined;
        }
        let resultOffset = iterator.offset;
        if (resultOffset > 0) {
            // Skip optional ZWJ code points that combine multiple emojis.
            // In theory, we should check if that ZWJ actually combines multiple emojis
            // to prevent deleting ZWJs in situations we didn't account for.
            const optionalZwjCodePoint = iterator.prevCodePoint();
            if (optionalZwjCodePoint === 8205 /* CodePoint.zwj */) {
                resultOffset = iterator.offset;
            }
        }
        return resultOffset;
    }
    function isEmojiModifier(codePoint) {
        return 0x1F3FB <= codePoint && codePoint <= 0x1F3FF;
    }
    var CodePoint;
    (function (CodePoint) {
        CodePoint[CodePoint["zwj"] = 8205] = "zwj";
        /**
         * Variation Selector-16 (VS16)
        */
        CodePoint[CodePoint["emojiVariantSelector"] = 65039] = "emojiVariantSelector";
        /**
         * Combining Enclosing Keycap
         */
        CodePoint[CodePoint["enclosingKeyCap"] = 8419] = "enclosingKeyCap";
    })(CodePoint || (CodePoint = {}));
    exports.noBreakWhitespace = '\xa0';
    class AmbiguousCharacters {
        static { this.ambiguousCharacterData = new lazy_1.Lazy(() => {
            // Generated using https://github.com/hediet/vscode-unicode-data
            // Stored as key1, value1, key2, value2, ...
            return JSON.parse('{\"_common\":[8232,32,8233,32,5760,32,8192,32,8193,32,8194,32,8195,32,8196,32,8197,32,8198,32,8200,32,8201,32,8202,32,8287,32,8199,32,8239,32,2042,95,65101,95,65102,95,65103,95,8208,45,8209,45,8210,45,65112,45,1748,45,8259,45,727,45,8722,45,10134,45,11450,45,1549,44,1643,44,8218,44,184,44,42233,44,894,59,2307,58,2691,58,1417,58,1795,58,1796,58,5868,58,65072,58,6147,58,6153,58,8282,58,1475,58,760,58,42889,58,8758,58,720,58,42237,58,451,33,11601,33,660,63,577,63,2429,63,5038,63,42731,63,119149,46,8228,46,1793,46,1794,46,42510,46,68176,46,1632,46,1776,46,42232,46,1373,96,65287,96,8219,96,8242,96,1370,96,1523,96,8175,96,65344,96,900,96,8189,96,8125,96,8127,96,8190,96,697,96,884,96,712,96,714,96,715,96,756,96,699,96,701,96,700,96,702,96,42892,96,1497,96,2036,96,2037,96,5194,96,5836,96,94033,96,94034,96,65339,91,10088,40,10098,40,12308,40,64830,40,65341,93,10089,41,10099,41,12309,41,64831,41,10100,123,119060,123,10101,125,65342,94,8270,42,1645,42,8727,42,66335,42,5941,47,8257,47,8725,47,8260,47,9585,47,10187,47,10744,47,119354,47,12755,47,12339,47,11462,47,20031,47,12035,47,65340,92,65128,92,8726,92,10189,92,10741,92,10745,92,119311,92,119355,92,12756,92,20022,92,12034,92,42872,38,708,94,710,94,5869,43,10133,43,66203,43,8249,60,10094,60,706,60,119350,60,5176,60,5810,60,5120,61,11840,61,12448,61,42239,61,8250,62,10095,62,707,62,119351,62,5171,62,94015,62,8275,126,732,126,8128,126,8764,126,65372,124,65293,45,120784,50,120794,50,120804,50,120814,50,120824,50,130034,50,42842,50,423,50,1000,50,42564,50,5311,50,42735,50,119302,51,120785,51,120795,51,120805,51,120815,51,120825,51,130035,51,42923,51,540,51,439,51,42858,51,11468,51,1248,51,94011,51,71882,51,120786,52,120796,52,120806,52,120816,52,120826,52,130036,52,5070,52,71855,52,120787,53,120797,53,120807,53,120817,53,120827,53,130037,53,444,53,71867,53,120788,54,120798,54,120808,54,120818,54,120828,54,130038,54,11474,54,5102,54,71893,54,119314,55,120789,55,120799,55,120809,55,120819,55,120829,55,130039,55,66770,55,71878,55,2819,56,2538,56,2666,56,125131,56,120790,56,120800,56,120810,56,120820,56,120830,56,130040,56,547,56,546,56,66330,56,2663,57,2920,57,2541,57,3437,57,120791,57,120801,57,120811,57,120821,57,120831,57,130041,57,42862,57,11466,57,71884,57,71852,57,71894,57,9082,97,65345,97,119834,97,119886,97,119938,97,119990,97,120042,97,120094,97,120146,97,120198,97,120250,97,120302,97,120354,97,120406,97,120458,97,593,97,945,97,120514,97,120572,97,120630,97,120688,97,120746,97,65313,65,119808,65,119860,65,119912,65,119964,65,120016,65,120068,65,120120,65,120172,65,120224,65,120276,65,120328,65,120380,65,120432,65,913,65,120488,65,120546,65,120604,65,120662,65,120720,65,5034,65,5573,65,42222,65,94016,65,66208,65,119835,98,119887,98,119939,98,119991,98,120043,98,120095,98,120147,98,120199,98,120251,98,120303,98,120355,98,120407,98,120459,98,388,98,5071,98,5234,98,5551,98,65314,66,8492,66,119809,66,119861,66,119913,66,120017,66,120069,66,120121,66,120173,66,120225,66,120277,66,120329,66,120381,66,120433,66,42932,66,914,66,120489,66,120547,66,120605,66,120663,66,120721,66,5108,66,5623,66,42192,66,66178,66,66209,66,66305,66,65347,99,8573,99,119836,99,119888,99,119940,99,119992,99,120044,99,120096,99,120148,99,120200,99,120252,99,120304,99,120356,99,120408,99,120460,99,7428,99,1010,99,11429,99,43951,99,66621,99,128844,67,71922,67,71913,67,65315,67,8557,67,8450,67,8493,67,119810,67,119862,67,119914,67,119966,67,120018,67,120174,67,120226,67,120278,67,120330,67,120382,67,120434,67,1017,67,11428,67,5087,67,42202,67,66210,67,66306,67,66581,67,66844,67,8574,100,8518,100,119837,100,119889,100,119941,100,119993,100,120045,100,120097,100,120149,100,120201,100,120253,100,120305,100,120357,100,120409,100,120461,100,1281,100,5095,100,5231,100,42194,100,8558,68,8517,68,119811,68,119863,68,119915,68,119967,68,120019,68,120071,68,120123,68,120175,68,120227,68,120279,68,120331,68,120383,68,120435,68,5024,68,5598,68,5610,68,42195,68,8494,101,65349,101,8495,101,8519,101,119838,101,119890,101,119942,101,120046,101,120098,101,120150,101,120202,101,120254,101,120306,101,120358,101,120410,101,120462,101,43826,101,1213,101,8959,69,65317,69,8496,69,119812,69,119864,69,119916,69,120020,69,120072,69,120124,69,120176,69,120228,69,120280,69,120332,69,120384,69,120436,69,917,69,120492,69,120550,69,120608,69,120666,69,120724,69,11577,69,5036,69,42224,69,71846,69,71854,69,66182,69,119839,102,119891,102,119943,102,119995,102,120047,102,120099,102,120151,102,120203,102,120255,102,120307,102,120359,102,120411,102,120463,102,43829,102,42905,102,383,102,7837,102,1412,102,119315,70,8497,70,119813,70,119865,70,119917,70,120021,70,120073,70,120125,70,120177,70,120229,70,120281,70,120333,70,120385,70,120437,70,42904,70,988,70,120778,70,5556,70,42205,70,71874,70,71842,70,66183,70,66213,70,66853,70,65351,103,8458,103,119840,103,119892,103,119944,103,120048,103,120100,103,120152,103,120204,103,120256,103,120308,103,120360,103,120412,103,120464,103,609,103,7555,103,397,103,1409,103,119814,71,119866,71,119918,71,119970,71,120022,71,120074,71,120126,71,120178,71,120230,71,120282,71,120334,71,120386,71,120438,71,1292,71,5056,71,5107,71,42198,71,65352,104,8462,104,119841,104,119945,104,119997,104,120049,104,120101,104,120153,104,120205,104,120257,104,120309,104,120361,104,120413,104,120465,104,1211,104,1392,104,5058,104,65320,72,8459,72,8460,72,8461,72,119815,72,119867,72,119919,72,120023,72,120179,72,120231,72,120283,72,120335,72,120387,72,120439,72,919,72,120494,72,120552,72,120610,72,120668,72,120726,72,11406,72,5051,72,5500,72,42215,72,66255,72,731,105,9075,105,65353,105,8560,105,8505,105,8520,105,119842,105,119894,105,119946,105,119998,105,120050,105,120102,105,120154,105,120206,105,120258,105,120310,105,120362,105,120414,105,120466,105,120484,105,618,105,617,105,953,105,8126,105,890,105,120522,105,120580,105,120638,105,120696,105,120754,105,1110,105,42567,105,1231,105,43893,105,5029,105,71875,105,65354,106,8521,106,119843,106,119895,106,119947,106,119999,106,120051,106,120103,106,120155,106,120207,106,120259,106,120311,106,120363,106,120415,106,120467,106,1011,106,1112,106,65322,74,119817,74,119869,74,119921,74,119973,74,120025,74,120077,74,120129,74,120181,74,120233,74,120285,74,120337,74,120389,74,120441,74,42930,74,895,74,1032,74,5035,74,5261,74,42201,74,119844,107,119896,107,119948,107,120000,107,120052,107,120104,107,120156,107,120208,107,120260,107,120312,107,120364,107,120416,107,120468,107,8490,75,65323,75,119818,75,119870,75,119922,75,119974,75,120026,75,120078,75,120130,75,120182,75,120234,75,120286,75,120338,75,120390,75,120442,75,922,75,120497,75,120555,75,120613,75,120671,75,120729,75,11412,75,5094,75,5845,75,42199,75,66840,75,1472,108,8739,73,9213,73,65512,73,1633,108,1777,73,66336,108,125127,108,120783,73,120793,73,120803,73,120813,73,120823,73,130033,73,65321,73,8544,73,8464,73,8465,73,119816,73,119868,73,119920,73,120024,73,120128,73,120180,73,120232,73,120284,73,120336,73,120388,73,120440,73,65356,108,8572,73,8467,108,119845,108,119897,108,119949,108,120001,108,120053,108,120105,73,120157,73,120209,73,120261,73,120313,73,120365,73,120417,73,120469,73,448,73,120496,73,120554,73,120612,73,120670,73,120728,73,11410,73,1030,73,1216,73,1493,108,1503,108,1575,108,126464,108,126592,108,65166,108,65165,108,1994,108,11599,73,5825,73,42226,73,93992,73,66186,124,66313,124,119338,76,8556,76,8466,76,119819,76,119871,76,119923,76,120027,76,120079,76,120131,76,120183,76,120235,76,120287,76,120339,76,120391,76,120443,76,11472,76,5086,76,5290,76,42209,76,93974,76,71843,76,71858,76,66587,76,66854,76,65325,77,8559,77,8499,77,119820,77,119872,77,119924,77,120028,77,120080,77,120132,77,120184,77,120236,77,120288,77,120340,77,120392,77,120444,77,924,77,120499,77,120557,77,120615,77,120673,77,120731,77,1018,77,11416,77,5047,77,5616,77,5846,77,42207,77,66224,77,66321,77,119847,110,119899,110,119951,110,120003,110,120055,110,120107,110,120159,110,120211,110,120263,110,120315,110,120367,110,120419,110,120471,110,1400,110,1404,110,65326,78,8469,78,119821,78,119873,78,119925,78,119977,78,120029,78,120081,78,120185,78,120237,78,120289,78,120341,78,120393,78,120445,78,925,78,120500,78,120558,78,120616,78,120674,78,120732,78,11418,78,42208,78,66835,78,3074,111,3202,111,3330,111,3458,111,2406,111,2662,111,2790,111,3046,111,3174,111,3302,111,3430,111,3664,111,3792,111,4160,111,1637,111,1781,111,65359,111,8500,111,119848,111,119900,111,119952,111,120056,111,120108,111,120160,111,120212,111,120264,111,120316,111,120368,111,120420,111,120472,111,7439,111,7441,111,43837,111,959,111,120528,111,120586,111,120644,111,120702,111,120760,111,963,111,120532,111,120590,111,120648,111,120706,111,120764,111,11423,111,4351,111,1413,111,1505,111,1607,111,126500,111,126564,111,126596,111,65259,111,65260,111,65258,111,65257,111,1726,111,64428,111,64429,111,64427,111,64426,111,1729,111,64424,111,64425,111,64423,111,64422,111,1749,111,3360,111,4125,111,66794,111,71880,111,71895,111,66604,111,1984,79,2534,79,2918,79,12295,79,70864,79,71904,79,120782,79,120792,79,120802,79,120812,79,120822,79,130032,79,65327,79,119822,79,119874,79,119926,79,119978,79,120030,79,120082,79,120134,79,120186,79,120238,79,120290,79,120342,79,120394,79,120446,79,927,79,120502,79,120560,79,120618,79,120676,79,120734,79,11422,79,1365,79,11604,79,4816,79,2848,79,66754,79,42227,79,71861,79,66194,79,66219,79,66564,79,66838,79,9076,112,65360,112,119849,112,119901,112,119953,112,120005,112,120057,112,120109,112,120161,112,120213,112,120265,112,120317,112,120369,112,120421,112,120473,112,961,112,120530,112,120544,112,120588,112,120602,112,120646,112,120660,112,120704,112,120718,112,120762,112,120776,112,11427,112,65328,80,8473,80,119823,80,119875,80,119927,80,119979,80,120031,80,120083,80,120187,80,120239,80,120291,80,120343,80,120395,80,120447,80,929,80,120504,80,120562,80,120620,80,120678,80,120736,80,11426,80,5090,80,5229,80,42193,80,66197,80,119850,113,119902,113,119954,113,120006,113,120058,113,120110,113,120162,113,120214,113,120266,113,120318,113,120370,113,120422,113,120474,113,1307,113,1379,113,1382,113,8474,81,119824,81,119876,81,119928,81,119980,81,120032,81,120084,81,120188,81,120240,81,120292,81,120344,81,120396,81,120448,81,11605,81,119851,114,119903,114,119955,114,120007,114,120059,114,120111,114,120163,114,120215,114,120267,114,120319,114,120371,114,120423,114,120475,114,43847,114,43848,114,7462,114,11397,114,43905,114,119318,82,8475,82,8476,82,8477,82,119825,82,119877,82,119929,82,120033,82,120189,82,120241,82,120293,82,120345,82,120397,82,120449,82,422,82,5025,82,5074,82,66740,82,5511,82,42211,82,94005,82,65363,115,119852,115,119904,115,119956,115,120008,115,120060,115,120112,115,120164,115,120216,115,120268,115,120320,115,120372,115,120424,115,120476,115,42801,115,445,115,1109,115,43946,115,71873,115,66632,115,65331,83,119826,83,119878,83,119930,83,119982,83,120034,83,120086,83,120138,83,120190,83,120242,83,120294,83,120346,83,120398,83,120450,83,1029,83,1359,83,5077,83,5082,83,42210,83,94010,83,66198,83,66592,83,119853,116,119905,116,119957,116,120009,116,120061,116,120113,116,120165,116,120217,116,120269,116,120321,116,120373,116,120425,116,120477,116,8868,84,10201,84,128872,84,65332,84,119827,84,119879,84,119931,84,119983,84,120035,84,120087,84,120139,84,120191,84,120243,84,120295,84,120347,84,120399,84,120451,84,932,84,120507,84,120565,84,120623,84,120681,84,120739,84,11430,84,5026,84,42196,84,93962,84,71868,84,66199,84,66225,84,66325,84,119854,117,119906,117,119958,117,120010,117,120062,117,120114,117,120166,117,120218,117,120270,117,120322,117,120374,117,120426,117,120478,117,42911,117,7452,117,43854,117,43858,117,651,117,965,117,120534,117,120592,117,120650,117,120708,117,120766,117,1405,117,66806,117,71896,117,8746,85,8899,85,119828,85,119880,85,119932,85,119984,85,120036,85,120088,85,120140,85,120192,85,120244,85,120296,85,120348,85,120400,85,120452,85,1357,85,4608,85,66766,85,5196,85,42228,85,94018,85,71864,85,8744,118,8897,118,65366,118,8564,118,119855,118,119907,118,119959,118,120011,118,120063,118,120115,118,120167,118,120219,118,120271,118,120323,118,120375,118,120427,118,120479,118,7456,118,957,118,120526,118,120584,118,120642,118,120700,118,120758,118,1141,118,1496,118,71430,118,43945,118,71872,118,119309,86,1639,86,1783,86,8548,86,119829,86,119881,86,119933,86,119985,86,120037,86,120089,86,120141,86,120193,86,120245,86,120297,86,120349,86,120401,86,120453,86,1140,86,11576,86,5081,86,5167,86,42719,86,42214,86,93960,86,71840,86,66845,86,623,119,119856,119,119908,119,119960,119,120012,119,120064,119,120116,119,120168,119,120220,119,120272,119,120324,119,120376,119,120428,119,120480,119,7457,119,1121,119,1309,119,1377,119,71434,119,71438,119,71439,119,43907,119,71919,87,71910,87,119830,87,119882,87,119934,87,119986,87,120038,87,120090,87,120142,87,120194,87,120246,87,120298,87,120350,87,120402,87,120454,87,1308,87,5043,87,5076,87,42218,87,5742,120,10539,120,10540,120,10799,120,65368,120,8569,120,119857,120,119909,120,119961,120,120013,120,120065,120,120117,120,120169,120,120221,120,120273,120,120325,120,120377,120,120429,120,120481,120,5441,120,5501,120,5741,88,9587,88,66338,88,71916,88,65336,88,8553,88,119831,88,119883,88,119935,88,119987,88,120039,88,120091,88,120143,88,120195,88,120247,88,120299,88,120351,88,120403,88,120455,88,42931,88,935,88,120510,88,120568,88,120626,88,120684,88,120742,88,11436,88,11613,88,5815,88,42219,88,66192,88,66228,88,66327,88,66855,88,611,121,7564,121,65369,121,119858,121,119910,121,119962,121,120014,121,120066,121,120118,121,120170,121,120222,121,120274,121,120326,121,120378,121,120430,121,120482,121,655,121,7935,121,43866,121,947,121,8509,121,120516,121,120574,121,120632,121,120690,121,120748,121,1199,121,4327,121,71900,121,65337,89,119832,89,119884,89,119936,89,119988,89,120040,89,120092,89,120144,89,120196,89,120248,89,120300,89,120352,89,120404,89,120456,89,933,89,978,89,120508,89,120566,89,120624,89,120682,89,120740,89,11432,89,1198,89,5033,89,5053,89,42220,89,94019,89,71844,89,66226,89,119859,122,119911,122,119963,122,120015,122,120067,122,120119,122,120171,122,120223,122,120275,122,120327,122,120379,122,120431,122,120483,122,7458,122,43923,122,71876,122,66293,90,71909,90,65338,90,8484,90,8488,90,119833,90,119885,90,119937,90,119989,90,120041,90,120197,90,120249,90,120301,90,120353,90,120405,90,120457,90,918,90,120493,90,120551,90,120609,90,120667,90,120725,90,5059,90,42204,90,71849,90,65282,34,65284,36,65285,37,65286,38,65290,42,65291,43,65294,46,65295,47,65296,48,65297,49,65298,50,65299,51,65300,52,65301,53,65302,54,65303,55,65304,56,65305,57,65308,60,65309,61,65310,62,65312,64,65316,68,65318,70,65319,71,65324,76,65329,81,65330,82,65333,85,65334,86,65335,87,65343,95,65346,98,65348,100,65350,102,65355,107,65357,109,65358,110,65361,113,65362,114,65364,116,65365,117,65367,119,65370,122,65371,123,65373,125,119846,109],\"_default\":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"cs\":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"de\":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"es\":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"fr\":[65374,126,65306,58,65281,33,8216,96,8245,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"it\":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"ja\":[8211,45,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65292,44,65307,59],\"ko\":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"pl\":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"pt-BR\":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"qps-ploc\":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"ru\":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,305,105,921,73,1009,112,215,120,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"tr\":[160,32,8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],\"zh-hans\":[65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41],\"zh-hant\":[8211,45,65374,126,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65307,59]}');
        }); }
        static { this.cache = new cache_1.LRUCachedFunction((locales) => {
            function arrayToMap(arr) {
                const result = new Map();
                for (let i = 0; i < arr.length; i += 2) {
                    result.set(arr[i], arr[i + 1]);
                }
                return result;
            }
            function mergeMaps(map1, map2) {
                const result = new Map(map1);
                for (const [key, value] of map2) {
                    result.set(key, value);
                }
                return result;
            }
            function intersectMaps(map1, map2) {
                if (!map1) {
                    return map2;
                }
                const result = new Map();
                for (const [key, value] of map1) {
                    if (map2.has(key)) {
                        result.set(key, value);
                    }
                }
                return result;
            }
            const data = this.ambiguousCharacterData.value;
            let filteredLocales = locales.filter((l) => !l.startsWith('_') && l in data);
            if (filteredLocales.length === 0) {
                filteredLocales = ['_default'];
            }
            let languageSpecificMap = undefined;
            for (const locale of filteredLocales) {
                const map = arrayToMap(data[locale]);
                languageSpecificMap = intersectMaps(languageSpecificMap, map);
            }
            const commonMap = arrayToMap(data['_common']);
            const map = mergeMaps(commonMap, languageSpecificMap);
            return new AmbiguousCharacters(map);
        }); }
        static getInstance(locales) {
            return AmbiguousCharacters.cache.get(Array.from(locales));
        }
        static { this._locales = new lazy_1.Lazy(() => Object.keys(AmbiguousCharacters.ambiguousCharacterData.value).filter((k) => !k.startsWith('_'))); }
        static getLocales() {
            return AmbiguousCharacters._locales.value;
        }
        constructor(confusableDictionary) {
            this.confusableDictionary = confusableDictionary;
        }
        isAmbiguous(codePoint) {
            return this.confusableDictionary.has(codePoint);
        }
        /**
         * Returns the non basic ASCII code point that the given code point can be confused,
         * or undefined if such code point does note exist.
         */
        getPrimaryConfusable(codePoint) {
            return this.confusableDictionary.get(codePoint);
        }
        getConfusableCodePoints() {
            return new Set(this.confusableDictionary.keys());
        }
    }
    exports.AmbiguousCharacters = AmbiguousCharacters;
    class InvisibleCharacters {
        static getRawData() {
            // Generated using https://github.com/hediet/vscode-unicode-data
            return JSON.parse('[9,10,11,12,13,32,127,160,173,847,1564,4447,4448,6068,6069,6155,6156,6157,6158,7355,7356,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8203,8204,8205,8206,8207,8234,8235,8236,8237,8238,8239,8287,8288,8289,8290,8291,8292,8293,8294,8295,8296,8297,8298,8299,8300,8301,8302,8303,10240,12288,12644,65024,65025,65026,65027,65028,65029,65030,65031,65032,65033,65034,65035,65036,65037,65038,65039,65279,65440,65520,65521,65522,65523,65524,65525,65526,65527,65528,65532,78844,119155,119156,119157,119158,119159,119160,119161,119162,917504,917505,917506,917507,917508,917509,917510,917511,917512,917513,917514,917515,917516,917517,917518,917519,917520,917521,917522,917523,917524,917525,917526,917527,917528,917529,917530,917531,917532,917533,917534,917535,917536,917537,917538,917539,917540,917541,917542,917543,917544,917545,917546,917547,917548,917549,917550,917551,917552,917553,917554,917555,917556,917557,917558,917559,917560,917561,917562,917563,917564,917565,917566,917567,917568,917569,917570,917571,917572,917573,917574,917575,917576,917577,917578,917579,917580,917581,917582,917583,917584,917585,917586,917587,917588,917589,917590,917591,917592,917593,917594,917595,917596,917597,917598,917599,917600,917601,917602,917603,917604,917605,917606,917607,917608,917609,917610,917611,917612,917613,917614,917615,917616,917617,917618,917619,917620,917621,917622,917623,917624,917625,917626,917627,917628,917629,917630,917631,917760,917761,917762,917763,917764,917765,917766,917767,917768,917769,917770,917771,917772,917773,917774,917775,917776,917777,917778,917779,917780,917781,917782,917783,917784,917785,917786,917787,917788,917789,917790,917791,917792,917793,917794,917795,917796,917797,917798,917799,917800,917801,917802,917803,917804,917805,917806,917807,917808,917809,917810,917811,917812,917813,917814,917815,917816,917817,917818,917819,917820,917821,917822,917823,917824,917825,917826,917827,917828,917829,917830,917831,917832,917833,917834,917835,917836,917837,917838,917839,917840,917841,917842,917843,917844,917845,917846,917847,917848,917849,917850,917851,917852,917853,917854,917855,917856,917857,917858,917859,917860,917861,917862,917863,917864,917865,917866,917867,917868,917869,917870,917871,917872,917873,917874,917875,917876,917877,917878,917879,917880,917881,917882,917883,917884,917885,917886,917887,917888,917889,917890,917891,917892,917893,917894,917895,917896,917897,917898,917899,917900,917901,917902,917903,917904,917905,917906,917907,917908,917909,917910,917911,917912,917913,917914,917915,917916,917917,917918,917919,917920,917921,917922,917923,917924,917925,917926,917927,917928,917929,917930,917931,917932,917933,917934,917935,917936,917937,917938,917939,917940,917941,917942,917943,917944,917945,917946,917947,917948,917949,917950,917951,917952,917953,917954,917955,917956,917957,917958,917959,917960,917961,917962,917963,917964,917965,917966,917967,917968,917969,917970,917971,917972,917973,917974,917975,917976,917977,917978,917979,917980,917981,917982,917983,917984,917985,917986,917987,917988,917989,917990,917991,917992,917993,917994,917995,917996,917997,917998,917999]');
        }
        static { this._data = undefined; }
        static getData() {
            if (!this._data) {
                this._data = new Set(InvisibleCharacters.getRawData());
            }
            return this._data;
        }
        static isInvisibleCharacter(codePoint) {
            return InvisibleCharacters.getData().has(codePoint);
        }
        static get codePoints() {
            return InvisibleCharacters.getData();
        }
    }
    exports.InvisibleCharacters = InvisibleCharacters;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[40/*vs/base/common/hash*/], __M([0/*require*/,1/*exports*/,7/*vs/base/common/strings*/]), function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringSHA1 = exports.toHexString = exports.Hasher = exports.stringHash = exports.numberHash = exports.doHash = exports.hash = void 0;
    /**
     * Return a hash value for an object.
     */
    function hash(obj) {
        return doHash(obj, 0);
    }
    exports.hash = hash;
    function doHash(obj, hashVal) {
        switch (typeof obj) {
            case 'object':
                if (obj === null) {
                    return numberHash(349, hashVal);
                }
                else if (Array.isArray(obj)) {
                    return arrayHash(obj, hashVal);
                }
                return objectHash(obj, hashVal);
            case 'string':
                return stringHash(obj, hashVal);
            case 'boolean':
                return booleanHash(obj, hashVal);
            case 'number':
                return numberHash(obj, hashVal);
            case 'undefined':
                return numberHash(937, hashVal);
            default:
                return numberHash(617, hashVal);
        }
    }
    exports.doHash = doHash;
    function numberHash(val, initialHashVal) {
        return (((initialHashVal << 5) - initialHashVal) + val) | 0; // hashVal * 31 + ch, keep as int32
    }
    exports.numberHash = numberHash;
    function booleanHash(b, initialHashVal) {
        return numberHash(b ? 433 : 863, initialHashVal);
    }
    function stringHash(s, hashVal) {
        hashVal = numberHash(149417, hashVal);
        for (let i = 0, length = s.length; i < length; i++) {
            hashVal = numberHash(s.charCodeAt(i), hashVal);
        }
        return hashVal;
    }
    exports.stringHash = stringHash;
    function arrayHash(arr, initialHashVal) {
        initialHashVal = numberHash(104579, initialHashVal);
        return arr.reduce((hashVal, item) => doHash(item, hashVal), initialHashVal);
    }
    function objectHash(obj, initialHashVal) {
        initialHashVal = numberHash(181387, initialHashVal);
        return Object.keys(obj).sort().reduce((hashVal, key) => {
            hashVal = stringHash(key, hashVal);
            return doHash(obj[key], hashVal);
        }, initialHashVal);
    }
    class Hasher {
        constructor() {
            this._value = 0;
        }
        get value() {
            return this._value;
        }
        hash(obj) {
            this._value = doHash(obj, this._value);
            return this._value;
        }
    }
    exports.Hasher = Hasher;
    var SHA1Constant;
    (function (SHA1Constant) {
        SHA1Constant[SHA1Constant["BLOCK_SIZE"] = 64] = "BLOCK_SIZE";
        SHA1Constant[SHA1Constant["UNICODE_REPLACEMENT"] = 65533] = "UNICODE_REPLACEMENT";
    })(SHA1Constant || (SHA1Constant = {}));
    function leftRotate(value, bits, totalBits = 32) {
        // delta + bits = totalBits
        const delta = totalBits - bits;
        // All ones, expect `delta` zeros aligned to the right
        const mask = ~((1 << delta) - 1);
        // Join (value left-shifted `bits` bits) with (masked value right-shifted `delta` bits)
        return ((value << bits) | ((mask & value) >>> delta)) >>> 0;
    }
    function fill(dest, index = 0, count = dest.byteLength, value = 0) {
        for (let i = 0; i < count; i++) {
            dest[index + i] = value;
        }
    }
    function leftPad(value, length, char = '0') {
        while (value.length < length) {
            value = char + value;
        }
        return value;
    }
    function toHexString(bufferOrValue, bitsize = 32) {
        if (bufferOrValue instanceof ArrayBuffer) {
            return Array.from(new Uint8Array(bufferOrValue)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return leftPad((bufferOrValue >>> 0).toString(16), bitsize / 4);
    }
    exports.toHexString = toHexString;
    /**
     * A SHA1 implementation that works with strings and does not allocate.
     */
    class StringSHA1 {
        static { this._bigBlock32 = new DataView(new ArrayBuffer(320)); } // 80 * 4 = 320
        constructor() {
            this._h0 = 0x67452301;
            this._h1 = 0xEFCDAB89;
            this._h2 = 0x98BADCFE;
            this._h3 = 0x10325476;
            this._h4 = 0xC3D2E1F0;
            this._buff = new Uint8Array(64 /* SHA1Constant.BLOCK_SIZE */ + 3 /* to fit any utf-8 */);
            this._buffDV = new DataView(this._buff.buffer);
            this._buffLen = 0;
            this._totalLen = 0;
            this._leftoverHighSurrogate = 0;
            this._finished = false;
        }
        update(str) {
            const strLen = str.length;
            if (strLen === 0) {
                return;
            }
            const buff = this._buff;
            let buffLen = this._buffLen;
            let leftoverHighSurrogate = this._leftoverHighSurrogate;
            let charCode;
            let offset;
            if (leftoverHighSurrogate !== 0) {
                charCode = leftoverHighSurrogate;
                offset = -1;
                leftoverHighSurrogate = 0;
            }
            else {
                charCode = str.charCodeAt(0);
                offset = 0;
            }
            while (true) {
                let codePoint = charCode;
                if (strings.isHighSurrogate(charCode)) {
                    if (offset + 1 < strLen) {
                        const nextCharCode = str.charCodeAt(offset + 1);
                        if (strings.isLowSurrogate(nextCharCode)) {
                            offset++;
                            codePoint = strings.computeCodePoint(charCode, nextCharCode);
                        }
                        else {
                            // illegal => unicode replacement character
                            codePoint = 65533 /* SHA1Constant.UNICODE_REPLACEMENT */;
                        }
                    }
                    else {
                        // last character is a surrogate pair
                        leftoverHighSurrogate = charCode;
                        break;
                    }
                }
                else if (strings.isLowSurrogate(charCode)) {
                    // illegal => unicode replacement character
                    codePoint = 65533 /* SHA1Constant.UNICODE_REPLACEMENT */;
                }
                buffLen = this._push(buff, buffLen, codePoint);
                offset++;
                if (offset < strLen) {
                    charCode = str.charCodeAt(offset);
                }
                else {
                    break;
                }
            }
            this._buffLen = buffLen;
            this._leftoverHighSurrogate = leftoverHighSurrogate;
        }
        _push(buff, buffLen, codePoint) {
            if (codePoint < 0x0080) {
                buff[buffLen++] = codePoint;
            }
            else if (codePoint < 0x0800) {
                buff[buffLen++] = 0b11000000 | ((codePoint & 0b00000000000000000000011111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else if (codePoint < 0x10000) {
                buff[buffLen++] = 0b11100000 | ((codePoint & 0b00000000000000001111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else {
                buff[buffLen++] = 0b11110000 | ((codePoint & 0b00000000000111000000000000000000) >>> 18);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000111111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            if (buffLen >= 64 /* SHA1Constant.BLOCK_SIZE */) {
                this._step();
                buffLen -= 64 /* SHA1Constant.BLOCK_SIZE */;
                this._totalLen += 64 /* SHA1Constant.BLOCK_SIZE */;
                // take last 3 in case of UTF8 overflow
                buff[0] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 0];
                buff[1] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 1];
                buff[2] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 2];
            }
            return buffLen;
        }
        digest() {
            if (!this._finished) {
                this._finished = true;
                if (this._leftoverHighSurrogate) {
                    // illegal => unicode replacement character
                    this._leftoverHighSurrogate = 0;
                    this._buffLen = this._push(this._buff, this._buffLen, 65533 /* SHA1Constant.UNICODE_REPLACEMENT */);
                }
                this._totalLen += this._buffLen;
                this._wrapUp();
            }
            return toHexString(this._h0) + toHexString(this._h1) + toHexString(this._h2) + toHexString(this._h3) + toHexString(this._h4);
        }
        _wrapUp() {
            this._buff[this._buffLen++] = 0x80;
            fill(this._buff, this._buffLen);
            if (this._buffLen > 56) {
                this._step();
                fill(this._buff);
            }
            // this will fit because the mantissa can cover up to 52 bits
            const ml = 8 * this._totalLen;
            this._buffDV.setUint32(56, Math.floor(ml / 4294967296), false);
            this._buffDV.setUint32(60, ml % 4294967296, false);
            this._step();
        }
        _step() {
            const bigBlock32 = StringSHA1._bigBlock32;
            const data = this._buffDV;
            for (let j = 0; j < 64 /* 16*4 */; j += 4) {
                bigBlock32.setUint32(j, data.getUint32(j, false), false);
            }
            for (let j = 64; j < 320 /* 80*4 */; j += 4) {
                bigBlock32.setUint32(j, leftRotate((bigBlock32.getUint32(j - 12, false) ^ bigBlock32.getUint32(j - 32, false) ^ bigBlock32.getUint32(j - 56, false) ^ bigBlock32.getUint32(j - 64, false)), 1), false);
            }
            let a = this._h0;
            let b = this._h1;
            let c = this._h2;
            let d = this._h3;
            let e = this._h4;
            let f, k;
            let temp;
            for (let j = 0; j < 80; j++) {
                if (j < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                }
                else if (j < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                }
                else if (j < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                }
                else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                temp = (leftRotate(a, 5) + f + e + k + bigBlock32.getUint32(j * 4, false)) & 0xffffffff;
                e = d;
                d = c;
                c = leftRotate(b, 30);
                b = a;
                a = temp;
            }
            this._h0 = (this._h0 + a) & 0xffffffff;
            this._h1 = (this._h1 + b) & 0xffffffff;
            this._h2 = (this._h2 + c) & 0xffffffff;
            this._h3 = (this._h3 + d) & 0xffffffff;
            this._h4 = (this._h4 + e) & 0xffffffff;
        }
    }
    exports.StringSHA1 = StringSHA1;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[25/*vs/base/common/diff/diff*/], __M([0/*require*/,1/*exports*/,36/*vs/base/common/diff/diffChange*/,40/*vs/base/common/hash*/]), function (require, exports, diffChange_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LcsDiff = exports.stringDiff = exports.StringDiffSequence = void 0;
    class StringDiffSequence {
        constructor(source) {
            this.source = source;
        }
        getElements() {
            const source = this.source;
            const characters = new Int32Array(source.length);
            for (let i = 0, len = source.length; i < len; i++) {
                characters[i] = source.charCodeAt(i);
            }
            return characters;
        }
    }
    exports.StringDiffSequence = StringDiffSequence;
    function stringDiff(original, modified, pretty) {
        return new LcsDiff(new StringDiffSequence(original), new StringDiffSequence(modified)).ComputeDiff(pretty).changes;
    }
    exports.stringDiff = stringDiff;
    //
    // The code below has been ported from a C# implementation in VS
    //
    class Debug {
        static Assert(condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        }
    }
    class MyArray {
        /**
         * Copies a range of elements from an Array starting at the specified source index and pastes
         * them to another Array starting at the specified destination index. The length and the indexes
         * are specified as 64-bit integers.
         * sourceArray:
         *		The Array that contains the data to copy.
         * sourceIndex:
         *		A 64-bit integer that represents the index in the sourceArray at which copying begins.
         * destinationArray:
         *		The Array that receives the data.
         * destinationIndex:
         *		A 64-bit integer that represents the index in the destinationArray at which storing begins.
         * length:
         *		A 64-bit integer that represents the number of elements to copy.
         */
        static Copy(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
            for (let i = 0; i < length; i++) {
                destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
            }
        }
        static Copy2(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
            for (let i = 0; i < length; i++) {
                destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
            }
        }
    }
    //*****************************************************************************
    // LcsDiff.cs
    //
    // An implementation of the difference algorithm described in
    // "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
    //
    // Copyright (C) 2008 Microsoft Corporation @minifier_do_not_preserve
    //*****************************************************************************
    // Our total memory usage for storing history is (worst-case):
    // 2 * [(MaxDifferencesHistory + 1) * (MaxDifferencesHistory + 1) - 1] * sizeof(int)
    // 2 * [1448*1448 - 1] * 4 = 16773624 = 16MB
    var LocalConstants;
    (function (LocalConstants) {
        LocalConstants[LocalConstants["MaxDifferencesHistory"] = 1447] = "MaxDifferencesHistory";
    })(LocalConstants || (LocalConstants = {}));
    /**
     * A utility class which helps to create the set of DiffChanges from
     * a difference operation. This class accepts original DiffElements and
     * modified DiffElements that are involved in a particular change. The
     * MarkNextChange() method can be called to mark the separation between
     * distinct changes. At the end, the Changes property can be called to retrieve
     * the constructed changes.
     */
    class DiffChangeHelper {
        /**
         * Constructs a new DiffChangeHelper for the given DiffSequences.
         */
        constructor() {
            this.m_changes = [];
            this.m_originalStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            this.m_modifiedStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            this.m_originalCount = 0;
            this.m_modifiedCount = 0;
        }
        /**
         * Marks the beginning of the next change in the set of differences.
         */
        MarkNextChange() {
            // Only add to the list if there is something to add
            if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
                // Add the new change to our list
                this.m_changes.push(new diffChange_1.DiffChange(this.m_originalStart, this.m_originalCount, this.m_modifiedStart, this.m_modifiedCount));
            }
            // Reset for the next change
            this.m_originalCount = 0;
            this.m_modifiedCount = 0;
            this.m_originalStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            this.m_modifiedStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
        }
        /**
         * Adds the original element at the given position to the elements
         * affected by the current change. The modified index gives context
         * to the change position with respect to the original sequence.
         * @param originalIndex The index of the original element to add.
         * @param modifiedIndex The index of the modified element that provides corresponding position in the modified sequence.
         */
        AddOriginalElement(originalIndex, modifiedIndex) {
            // The 'true' start index is the smallest of the ones we've seen
            this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
            this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
            this.m_originalCount++;
        }
        /**
         * Adds the modified element at the given position to the elements
         * affected by the current change. The original index gives context
         * to the change position with respect to the modified sequence.
         * @param originalIndex The index of the original element that provides corresponding position in the original sequence.
         * @param modifiedIndex The index of the modified element to add.
         */
        AddModifiedElement(originalIndex, modifiedIndex) {
            // The 'true' start index is the smallest of the ones we've seen
            this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
            this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
            this.m_modifiedCount++;
        }
        /**
         * Retrieves all of the changes marked by the class.
         */
        getChanges() {
            if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
                // Finish up on whatever is left
                this.MarkNextChange();
            }
            return this.m_changes;
        }
        /**
         * Retrieves all of the changes marked by the class in the reverse order
         */
        getReverseChanges() {
            if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
                // Finish up on whatever is left
                this.MarkNextChange();
            }
            this.m_changes.reverse();
            return this.m_changes;
        }
    }
    /**
     * An implementation of the difference algorithm described in
     * "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
     */
    class LcsDiff {
        /**
         * Constructs the DiffFinder
         */
        constructor(originalSequence, modifiedSequence, continueProcessingPredicate = null) {
            this.ContinueProcessingPredicate = continueProcessingPredicate;
            this._originalSequence = originalSequence;
            this._modifiedSequence = modifiedSequence;
            const [originalStringElements, originalElementsOrHash, originalHasStrings] = LcsDiff._getElements(originalSequence);
            const [modifiedStringElements, modifiedElementsOrHash, modifiedHasStrings] = LcsDiff._getElements(modifiedSequence);
            this._hasStrings = (originalHasStrings && modifiedHasStrings);
            this._originalStringElements = originalStringElements;
            this._originalElementsOrHash = originalElementsOrHash;
            this._modifiedStringElements = modifiedStringElements;
            this._modifiedElementsOrHash = modifiedElementsOrHash;
            this.m_forwardHistory = [];
            this.m_reverseHistory = [];
        }
        static _isStringArray(arr) {
            return (arr.length > 0 && typeof arr[0] === 'string');
        }
        static _getElements(sequence) {
            const elements = sequence.getElements();
            if (LcsDiff._isStringArray(elements)) {
                const hashes = new Int32Array(elements.length);
                for (let i = 0, len = elements.length; i < len; i++) {
                    hashes[i] = (0, hash_1.stringHash)(elements[i], 0);
                }
                return [elements, hashes, true];
            }
            if (elements instanceof Int32Array) {
                return [[], elements, false];
            }
            return [[], new Int32Array(elements), false];
        }
        ElementsAreEqual(originalIndex, newIndex) {
            if (this._originalElementsOrHash[originalIndex] !== this._modifiedElementsOrHash[newIndex]) {
                return false;
            }
            return (this._hasStrings ? this._originalStringElements[originalIndex] === this._modifiedStringElements[newIndex] : true);
        }
        ElementsAreStrictEqual(originalIndex, newIndex) {
            if (!this.ElementsAreEqual(originalIndex, newIndex)) {
                return false;
            }
            const originalElement = LcsDiff._getStrictElement(this._originalSequence, originalIndex);
            const modifiedElement = LcsDiff._getStrictElement(this._modifiedSequence, newIndex);
            return (originalElement === modifiedElement);
        }
        static _getStrictElement(sequence, index) {
            if (typeof sequence.getStrictElement === 'function') {
                return sequence.getStrictElement(index);
            }
            return null;
        }
        OriginalElementsAreEqual(index1, index2) {
            if (this._originalElementsOrHash[index1] !== this._originalElementsOrHash[index2]) {
                return false;
            }
            return (this._hasStrings ? this._originalStringElements[index1] === this._originalStringElements[index2] : true);
        }
        ModifiedElementsAreEqual(index1, index2) {
            if (this._modifiedElementsOrHash[index1] !== this._modifiedElementsOrHash[index2]) {
                return false;
            }
            return (this._hasStrings ? this._modifiedStringElements[index1] === this._modifiedStringElements[index2] : true);
        }
        ComputeDiff(pretty) {
            return this._ComputeDiff(0, this._originalElementsOrHash.length - 1, 0, this._modifiedElementsOrHash.length - 1, pretty);
        }
        /**
         * Computes the differences between the original and modified input
         * sequences on the bounded range.
         * @returns An array of the differences between the two input sequences.
         */
        _ComputeDiff(originalStart, originalEnd, modifiedStart, modifiedEnd, pretty) {
            const quitEarlyArr = [false];
            let changes = this.ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr);
            if (pretty) {
                // We have to clean up the computed diff to be more intuitive
                // but it turns out this cannot be done correctly until the entire set
                // of diffs have been computed
                changes = this.PrettifyChanges(changes);
            }
            return {
                quitEarly: quitEarlyArr[0],
                changes: changes
            };
        }
        /**
         * Private helper method which computes the differences on the bounded range
         * recursively.
         * @returns An array of the differences between the two input sequences.
         */
        ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr) {
            quitEarlyArr[0] = false;
            // Find the start of the differences
            while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.ElementsAreEqual(originalStart, modifiedStart)) {
                originalStart++;
                modifiedStart++;
            }
            // Find the end of the differences
            while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.ElementsAreEqual(originalEnd, modifiedEnd)) {
                originalEnd--;
                modifiedEnd--;
            }
            // In the special case where we either have all insertions or all deletions or the sequences are identical
            if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
                let changes;
                if (modifiedStart <= modifiedEnd) {
                    Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                    // All insertions
                    changes = [
                        new diffChange_1.DiffChange(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)
                    ];
                }
                else if (originalStart <= originalEnd) {
                    Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                    // All deletions
                    changes = [
                        new diffChange_1.DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)
                    ];
                }
                else {
                    Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                    Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                    // Identical sequences - No differences
                    changes = [];
                }
                return changes;
            }
            // This problem can be solved using the Divide-And-Conquer technique.
            const midOriginalArr = [0];
            const midModifiedArr = [0];
            const result = this.ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr);
            const midOriginal = midOriginalArr[0];
            const midModified = midModifiedArr[0];
            if (result !== null) {
                // Result is not-null when there was enough memory to compute the changes while
                // searching for the recursion point
                return result;
            }
            else if (!quitEarlyArr[0]) {
                // We can break the problem down recursively by finding the changes in the
                // First Half:   (originalStart, modifiedStart) to (midOriginal, midModified)
                // Second Half:  (midOriginal + 1, minModified + 1) to (originalEnd, modifiedEnd)
                // NOTE: ComputeDiff() is inclusive, therefore the second range starts on the next point
                const leftChanges = this.ComputeDiffRecursive(originalStart, midOriginal, modifiedStart, midModified, quitEarlyArr);
                let rightChanges = [];
                if (!quitEarlyArr[0]) {
                    rightChanges = this.ComputeDiffRecursive(midOriginal + 1, originalEnd, midModified + 1, modifiedEnd, quitEarlyArr);
                }
                else {
                    // We didn't have time to finish the first half, so we don't have time to compute this half.
                    // Consider the entire rest of the sequence different.
                    rightChanges = [
                        new diffChange_1.DiffChange(midOriginal + 1, originalEnd - (midOriginal + 1) + 1, midModified + 1, modifiedEnd - (midModified + 1) + 1)
                    ];
                }
                return this.ConcatenateChanges(leftChanges, rightChanges);
            }
            // If we hit here, we quit early, and so can't return anything meaningful
            return [
                new diffChange_1.DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
            ];
        }
        WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr) {
            let forwardChanges = null;
            let reverseChanges = null;
            // First, walk backward through the forward diagonals history
            let changeHelper = new DiffChangeHelper();
            let diagonalMin = diagonalForwardStart;
            let diagonalMax = diagonalForwardEnd;
            let diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalForwardOffset;
            let lastOriginalIndex = -1073741824 /* Constants.MIN_SAFE_SMALL_INTEGER */;
            let historyIndex = this.m_forwardHistory.length - 1;
            do {
                // Get the diagonal index from the relative diagonal number
                const diagonal = diagonalRelative + diagonalForwardBase;
                // Figure out where we came from
                if (diagonal === diagonalMin || (diagonal < diagonalMax && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                    // Vertical line (the element is an insert)
                    originalIndex = forwardPoints[diagonal + 1];
                    modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                    if (originalIndex < lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex;
                    changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex);
                    diagonalRelative = (diagonal + 1) - diagonalForwardBase; //Setup for the next iteration
                }
                else {
                    // Horizontal line (the element is a deletion)
                    originalIndex = forwardPoints[diagonal - 1] + 1;
                    modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                    if (originalIndex < lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex - 1;
                    changeHelper.AddOriginalElement(originalIndex, modifiedIndex + 1);
                    diagonalRelative = (diagonal - 1) - diagonalForwardBase; //Setup for the next iteration
                }
                if (historyIndex >= 0) {
                    forwardPoints = this.m_forwardHistory[historyIndex];
                    diagonalForwardBase = forwardPoints[0]; //We stored this in the first spot
                    diagonalMin = 1;
                    diagonalMax = forwardPoints.length - 1;
                }
            } while (--historyIndex >= -1);
            // Ironically, we get the forward changes as the reverse of the
            // order we added them since we technically added them backwards
            forwardChanges = changeHelper.getReverseChanges();
            if (quitEarlyArr[0]) {
                // TODO: Calculate a partial from the reverse diagonals.
                //       For now, just assume everything after the midOriginal/midModified point is a diff
                let originalStartPoint = midOriginalArr[0] + 1;
                let modifiedStartPoint = midModifiedArr[0] + 1;
                if (forwardChanges !== null && forwardChanges.length > 0) {
                    const lastForwardChange = forwardChanges[forwardChanges.length - 1];
                    originalStartPoint = Math.max(originalStartPoint, lastForwardChange.getOriginalEnd());
                    modifiedStartPoint = Math.max(modifiedStartPoint, lastForwardChange.getModifiedEnd());
                }
                reverseChanges = [
                    new diffChange_1.DiffChange(originalStartPoint, originalEnd - originalStartPoint + 1, modifiedStartPoint, modifiedEnd - modifiedStartPoint + 1)
                ];
            }
            else {
                // Now walk backward through the reverse diagonals history
                changeHelper = new DiffChangeHelper();
                diagonalMin = diagonalReverseStart;
                diagonalMax = diagonalReverseEnd;
                diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalReverseOffset;
                lastOriginalIndex = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
                historyIndex = (deltaIsEven) ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2;
                do {
                    // Get the diagonal index from the relative diagonal number
                    const diagonal = diagonalRelative + diagonalReverseBase;
                    // Figure out where we came from
                    if (diagonal === diagonalMin || (diagonal < diagonalMax && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                        // Horizontal line (the element is a deletion))
                        originalIndex = reversePoints[diagonal + 1] - 1;
                        modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                        if (originalIndex > lastOriginalIndex) {
                            changeHelper.MarkNextChange();
                        }
                        lastOriginalIndex = originalIndex + 1;
                        changeHelper.AddOriginalElement(originalIndex + 1, modifiedIndex + 1);
                        diagonalRelative = (diagonal + 1) - diagonalReverseBase; //Setup for the next iteration
                    }
                    else {
                        // Vertical line (the element is an insertion)
                        originalIndex = reversePoints[diagonal - 1];
                        modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                        if (originalIndex > lastOriginalIndex) {
                            changeHelper.MarkNextChange();
                        }
                        lastOriginalIndex = originalIndex;
                        changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex + 1);
                        diagonalRelative = (diagonal - 1) - diagonalReverseBase; //Setup for the next iteration
                    }
                    if (historyIndex >= 0) {
                        reversePoints = this.m_reverseHistory[historyIndex];
                        diagonalReverseBase = reversePoints[0]; //We stored this in the first spot
                        diagonalMin = 1;
                        diagonalMax = reversePoints.length - 1;
                    }
                } while (--historyIndex >= -1);
                // There are cases where the reverse history will find diffs that
                // are correct, but not intuitive, so we need shift them.
                reverseChanges = changeHelper.getChanges();
            }
            return this.ConcatenateChanges(forwardChanges, reverseChanges);
        }
        /**
         * Given the range to compute the diff on, this method finds the point:
         * (midOriginal, midModified)
         * that exists in the middle of the LCS of the two sequences and
         * is the point at which the LCS problem may be broken down recursively.
         * This method will try to keep the LCS trace in memory. If the LCS recursion
         * point is calculated and the full trace is available in memory, then this method
         * will return the change list.
         * @param originalStart The start bound of the original sequence range
         * @param originalEnd The end bound of the original sequence range
         * @param modifiedStart The start bound of the modified sequence range
         * @param modifiedEnd The end bound of the modified sequence range
         * @param midOriginal The middle point of the original sequence range
         * @param midModified The middle point of the modified sequence range
         * @returns The diff changes, if available, otherwise null
         */
        ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr) {
            let originalIndex = 0, modifiedIndex = 0;
            let diagonalForwardStart = 0, diagonalForwardEnd = 0;
            let diagonalReverseStart = 0, diagonalReverseEnd = 0;
            // To traverse the edit graph and produce the proper LCS, our actual
            // start position is just outside the given boundary
            originalStart--;
            modifiedStart--;
            // We set these up to make the compiler happy, but they will
            // be replaced before we return with the actual recursion point
            midOriginalArr[0] = 0;
            midModifiedArr[0] = 0;
            // Clear out the history
            this.m_forwardHistory = [];
            this.m_reverseHistory = [];
            // Each cell in the two arrays corresponds to a diagonal in the edit graph.
            // The integer value in the cell represents the originalIndex of the furthest
            // reaching point found so far that ends in that diagonal.
            // The modifiedIndex can be computed mathematically from the originalIndex and the diagonal number.
            const maxDifferences = (originalEnd - originalStart) + (modifiedEnd - modifiedStart);
            const numDiagonals = maxDifferences + 1;
            const forwardPoints = new Int32Array(numDiagonals);
            const reversePoints = new Int32Array(numDiagonals);
            // diagonalForwardBase: Index into forwardPoints of the diagonal which passes through (originalStart, modifiedStart)
            // diagonalReverseBase: Index into reversePoints of the diagonal which passes through (originalEnd, modifiedEnd)
            const diagonalForwardBase = (modifiedEnd - modifiedStart);
            const diagonalReverseBase = (originalEnd - originalStart);
            // diagonalForwardOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
            //    diagonal number (relative to diagonalForwardBase)
            // diagonalReverseOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
            //    diagonal number (relative to diagonalReverseBase)
            const diagonalForwardOffset = (originalStart - modifiedStart);
            const diagonalReverseOffset = (originalEnd - modifiedEnd);
            // delta: The difference between the end diagonal and the start diagonal. This is used to relate diagonal numbers
            //   relative to the start diagonal with diagonal numbers relative to the end diagonal.
            // The Even/Oddn-ness of this delta is important for determining when we should check for overlap
            const delta = diagonalReverseBase - diagonalForwardBase;
            const deltaIsEven = (delta % 2 === 0);
            // Here we set up the start and end points as the furthest points found so far
            // in both the forward and reverse directions, respectively
            forwardPoints[diagonalForwardBase] = originalStart;
            reversePoints[diagonalReverseBase] = originalEnd;
            // Remember if we quit early, and thus need to do a best-effort result instead of a real result.
            quitEarlyArr[0] = false;
            // A couple of points:
            // --With this method, we iterate on the number of differences between the two sequences.
            //   The more differences there actually are, the longer this will take.
            // --Also, as the number of differences increases, we have to search on diagonals further
            //   away from the reference diagonal (which is diagonalForwardBase for forward, diagonalReverseBase for reverse).
            // --We extend on even diagonals (relative to the reference diagonal) only when numDifferences
            //   is even and odd diagonals only when numDifferences is odd.
            for (let numDifferences = 1; numDifferences <= (maxDifferences / 2) + 1; numDifferences++) {
                let furthestOriginalIndex = 0;
                let furthestModifiedIndex = 0;
                // Run the algorithm in the forward direction
                diagonalForwardStart = this.ClipDiagonalBound(diagonalForwardBase - numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
                diagonalForwardEnd = this.ClipDiagonalBound(diagonalForwardBase + numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
                for (let diagonal = diagonalForwardStart; diagonal <= diagonalForwardEnd; diagonal += 2) {
                    // STEP 1: We extend the furthest reaching point in the present diagonal
                    // by looking at the diagonals above and below and picking the one whose point
                    // is further away from the start point (originalStart, modifiedStart)
                    if (diagonal === diagonalForwardStart || (diagonal < diagonalForwardEnd && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                        originalIndex = forwardPoints[diagonal + 1];
                    }
                    else {
                        originalIndex = forwardPoints[diagonal - 1] + 1;
                    }
                    modifiedIndex = originalIndex - (diagonal - diagonalForwardBase) - diagonalForwardOffset;
                    // Save the current originalIndex so we can test for false overlap in step 3
                    const tempOriginalIndex = originalIndex;
                    // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                    // so long as the elements are equal.
                    while (originalIndex < originalEnd && modifiedIndex < modifiedEnd && this.ElementsAreEqual(originalIndex + 1, modifiedIndex + 1)) {
                        originalIndex++;
                        modifiedIndex++;
                    }
                    forwardPoints[diagonal] = originalIndex;
                    if (originalIndex + modifiedIndex > furthestOriginalIndex + furthestModifiedIndex) {
                        furthestOriginalIndex = originalIndex;
                        furthestModifiedIndex = modifiedIndex;
                    }
                    // STEP 3: If delta is odd (overlap first happens on forward when delta is odd)
                    // and diagonal is in the range of reverse diagonals computed for numDifferences-1
                    // (the previous iteration; we haven't computed reverse diagonals for numDifferences yet)
                    // then check for overlap.
                    if (!deltaIsEven && Math.abs(diagonal - diagonalReverseBase) <= (numDifferences - 1)) {
                        if (originalIndex >= reversePoints[diagonal]) {
                            midOriginalArr[0] = originalIndex;
                            midModifiedArr[0] = modifiedIndex;
                            if (tempOriginalIndex <= reversePoints[diagonal] && 1447 /* LocalConstants.MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* LocalConstants.MaxDifferencesHistory */ + 1)) {
                                // BINGO! We overlapped, and we have the full trace in memory!
                                return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                            }
                            else {
                                // Either false overlap, or we didn't have enough memory for the full trace
                                // Just return the recursion point
                                return null;
                            }
                        }
                    }
                }
                // Check to see if we should be quitting early, before moving on to the next iteration.
                const matchLengthOfLongest = ((furthestOriginalIndex - originalStart) + (furthestModifiedIndex - modifiedStart) - numDifferences) / 2;
                if (this.ContinueProcessingPredicate !== null && !this.ContinueProcessingPredicate(furthestOriginalIndex, matchLengthOfLongest)) {
                    // We can't finish, so skip ahead to generating a result from what we have.
                    quitEarlyArr[0] = true;
                    // Use the furthest distance we got in the forward direction.
                    midOriginalArr[0] = furthestOriginalIndex;
                    midModifiedArr[0] = furthestModifiedIndex;
                    if (matchLengthOfLongest > 0 && 1447 /* LocalConstants.MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* LocalConstants.MaxDifferencesHistory */ + 1)) {
                        // Enough of the history is in memory to walk it backwards
                        return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                    }
                    else {
                        // We didn't actually remember enough of the history.
                        //Since we are quitting the diff early, we need to shift back the originalStart and modified start
                        //back into the boundary limits since we decremented their value above beyond the boundary limit.
                        originalStart++;
                        modifiedStart++;
                        return [
                            new diffChange_1.DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
                        ];
                    }
                }
                // Run the algorithm in the reverse direction
                diagonalReverseStart = this.ClipDiagonalBound(diagonalReverseBase - numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
                diagonalReverseEnd = this.ClipDiagonalBound(diagonalReverseBase + numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
                for (let diagonal = diagonalReverseStart; diagonal <= diagonalReverseEnd; diagonal += 2) {
                    // STEP 1: We extend the furthest reaching point in the present diagonal
                    // by looking at the diagonals above and below and picking the one whose point
                    // is further away from the start point (originalEnd, modifiedEnd)
                    if (diagonal === diagonalReverseStart || (diagonal < diagonalReverseEnd && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                        originalIndex = reversePoints[diagonal + 1] - 1;
                    }
                    else {
                        originalIndex = reversePoints[diagonal - 1];
                    }
                    modifiedIndex = originalIndex - (diagonal - diagonalReverseBase) - diagonalReverseOffset;
                    // Save the current originalIndex so we can test for false overlap
                    const tempOriginalIndex = originalIndex;
                    // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                    // as long as the elements are equal.
                    while (originalIndex > originalStart && modifiedIndex > modifiedStart && this.ElementsAreEqual(originalIndex, modifiedIndex)) {
                        originalIndex--;
                        modifiedIndex--;
                    }
                    reversePoints[diagonal] = originalIndex;
                    // STEP 4: If delta is even (overlap first happens on reverse when delta is even)
                    // and diagonal is in the range of forward diagonals computed for numDifferences
                    // then check for overlap.
                    if (deltaIsEven && Math.abs(diagonal - diagonalForwardBase) <= numDifferences) {
                        if (originalIndex <= forwardPoints[diagonal]) {
                            midOriginalArr[0] = originalIndex;
                            midModifiedArr[0] = modifiedIndex;
                            if (tempOriginalIndex >= forwardPoints[diagonal] && 1447 /* LocalConstants.MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* LocalConstants.MaxDifferencesHistory */ + 1)) {
                                // BINGO! We overlapped, and we have the full trace in memory!
                                return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                            }
                            else {
                                // Either false overlap, or we didn't have enough memory for the full trace
                                // Just return the recursion point
                                return null;
                            }
                        }
                    }
                }
                // Save current vectors to history before the next iteration
                if (numDifferences <= 1447 /* LocalConstants.MaxDifferencesHistory */) {
                    // We are allocating space for one extra int, which we fill with
                    // the index of the diagonal base index
                    let temp = new Int32Array(diagonalForwardEnd - diagonalForwardStart + 2);
                    temp[0] = diagonalForwardBase - diagonalForwardStart + 1;
                    MyArray.Copy2(forwardPoints, diagonalForwardStart, temp, 1, diagonalForwardEnd - diagonalForwardStart + 1);
                    this.m_forwardHistory.push(temp);
                    temp = new Int32Array(diagonalReverseEnd - diagonalReverseStart + 2);
                    temp[0] = diagonalReverseBase - diagonalReverseStart + 1;
                    MyArray.Copy2(reversePoints, diagonalReverseStart, temp, 1, diagonalReverseEnd - diagonalReverseStart + 1);
                    this.m_reverseHistory.push(temp);
                }
            }
            // If we got here, then we have the full trace in history. We just have to convert it to a change list
            // NOTE: This part is a bit messy
            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
        }
        /**
         * Shifts the given changes to provide a more intuitive diff.
         * While the first element in a diff matches the first element after the diff,
         * we shift the diff down.
         *
         * @param changes The list of changes to shift
         * @returns The shifted changes
         */
        PrettifyChanges(changes) {
            // Shift all the changes down first
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                const originalStop = (i < changes.length - 1) ? changes[i + 1].originalStart : this._originalElementsOrHash.length;
                const modifiedStop = (i < changes.length - 1) ? changes[i + 1].modifiedStart : this._modifiedElementsOrHash.length;
                const checkOriginal = change.originalLength > 0;
                const checkModified = change.modifiedLength > 0;
                while (change.originalStart + change.originalLength < originalStop
                    && change.modifiedStart + change.modifiedLength < modifiedStop
                    && (!checkOriginal || this.OriginalElementsAreEqual(change.originalStart, change.originalStart + change.originalLength))
                    && (!checkModified || this.ModifiedElementsAreEqual(change.modifiedStart, change.modifiedStart + change.modifiedLength))) {
                    const startStrictEqual = this.ElementsAreStrictEqual(change.originalStart, change.modifiedStart);
                    const endStrictEqual = this.ElementsAreStrictEqual(change.originalStart + change.originalLength, change.modifiedStart + change.modifiedLength);
                    if (endStrictEqual && !startStrictEqual) {
                        // moving the change down would create an equal change, but the elements are not strict equal
                        break;
                    }
                    change.originalStart++;
                    change.modifiedStart++;
                }
                const mergedChangeArr = [null];
                if (i < changes.length - 1 && this.ChangesOverlap(changes[i], changes[i + 1], mergedChangeArr)) {
                    changes[i] = mergedChangeArr[0];
                    changes.splice(i + 1, 1);
                    i--;
                    continue;
                }
            }
            // Shift changes back up until we hit empty or whitespace-only lines
            for (let i = changes.length - 1; i >= 0; i--) {
                const change = changes[i];
                let originalStop = 0;
                let modifiedStop = 0;
                if (i > 0) {
                    const prevChange = changes[i - 1];
                    originalStop = prevChange.originalStart + prevChange.originalLength;
                    modifiedStop = prevChange.modifiedStart + prevChange.modifiedLength;
                }
                const checkOriginal = change.originalLength > 0;
                const checkModified = change.modifiedLength > 0;
                let bestDelta = 0;
                let bestScore = this._boundaryScore(change.originalStart, change.originalLength, change.modifiedStart, change.modifiedLength);
                for (let delta = 1;; delta++) {
                    const originalStart = change.originalStart - delta;
                    const modifiedStart = change.modifiedStart - delta;
                    if (originalStart < originalStop || modifiedStart < modifiedStop) {
                        break;
                    }
                    if (checkOriginal && !this.OriginalElementsAreEqual(originalStart, originalStart + change.originalLength)) {
                        break;
                    }
                    if (checkModified && !this.ModifiedElementsAreEqual(modifiedStart, modifiedStart + change.modifiedLength)) {
                        break;
                    }
                    const touchingPreviousChange = (originalStart === originalStop && modifiedStart === modifiedStop);
                    const score = ((touchingPreviousChange ? 5 : 0)
                        + this._boundaryScore(originalStart, change.originalLength, modifiedStart, change.modifiedLength));
                    if (score > bestScore) {
                        bestScore = score;
                        bestDelta = delta;
                    }
                }
                change.originalStart -= bestDelta;
                change.modifiedStart -= bestDelta;
                const mergedChangeArr = [null];
                if (i > 0 && this.ChangesOverlap(changes[i - 1], changes[i], mergedChangeArr)) {
                    changes[i - 1] = mergedChangeArr[0];
                    changes.splice(i, 1);
                    i++;
                    continue;
                }
            }
            // There could be multiple longest common substrings.
            // Give preference to the ones containing longer lines
            if (this._hasStrings) {
                for (let i = 1, len = changes.length; i < len; i++) {
                    const aChange = changes[i - 1];
                    const bChange = changes[i];
                    const matchedLength = bChange.originalStart - aChange.originalStart - aChange.originalLength;
                    const aOriginalStart = aChange.originalStart;
                    const bOriginalEnd = bChange.originalStart + bChange.originalLength;
                    const abOriginalLength = bOriginalEnd - aOriginalStart;
                    const aModifiedStart = aChange.modifiedStart;
                    const bModifiedEnd = bChange.modifiedStart + bChange.modifiedLength;
                    const abModifiedLength = bModifiedEnd - aModifiedStart;
                    // Avoid wasting a lot of time with these searches
                    if (matchedLength < 5 && abOriginalLength < 20 && abModifiedLength < 20) {
                        const t = this._findBetterContiguousSequence(aOriginalStart, abOriginalLength, aModifiedStart, abModifiedLength, matchedLength);
                        if (t) {
                            const [originalMatchStart, modifiedMatchStart] = t;
                            if (originalMatchStart !== aChange.originalStart + aChange.originalLength || modifiedMatchStart !== aChange.modifiedStart + aChange.modifiedLength) {
                                // switch to another sequence that has a better score
                                aChange.originalLength = originalMatchStart - aChange.originalStart;
                                aChange.modifiedLength = modifiedMatchStart - aChange.modifiedStart;
                                bChange.originalStart = originalMatchStart + matchedLength;
                                bChange.modifiedStart = modifiedMatchStart + matchedLength;
                                bChange.originalLength = bOriginalEnd - bChange.originalStart;
                                bChange.modifiedLength = bModifiedEnd - bChange.modifiedStart;
                            }
                        }
                    }
                }
            }
            return changes;
        }
        _findBetterContiguousSequence(originalStart, originalLength, modifiedStart, modifiedLength, desiredLength) {
            if (originalLength < desiredLength || modifiedLength < desiredLength) {
                return null;
            }
            const originalMax = originalStart + originalLength - desiredLength + 1;
            const modifiedMax = modifiedStart + modifiedLength - desiredLength + 1;
            let bestScore = 0;
            let bestOriginalStart = 0;
            let bestModifiedStart = 0;
            for (let i = originalStart; i < originalMax; i++) {
                for (let j = modifiedStart; j < modifiedMax; j++) {
                    const score = this._contiguousSequenceScore(i, j, desiredLength);
                    if (score > 0 && score > bestScore) {
                        bestScore = score;
                        bestOriginalStart = i;
                        bestModifiedStart = j;
                    }
                }
            }
            if (bestScore > 0) {
                return [bestOriginalStart, bestModifiedStart];
            }
            return null;
        }
        _contiguousSequenceScore(originalStart, modifiedStart, length) {
            let score = 0;
            for (let l = 0; l < length; l++) {
                if (!this.ElementsAreEqual(originalStart + l, modifiedStart + l)) {
                    return 0;
                }
                score += this._originalStringElements[originalStart + l].length;
            }
            return score;
        }
        _OriginalIsBoundary(index) {
            if (index <= 0 || index >= this._originalElementsOrHash.length - 1) {
                return true;
            }
            return (this._hasStrings && /^\s*$/.test(this._originalStringElements[index]));
        }
        _OriginalRegionIsBoundary(originalStart, originalLength) {
            if (this._OriginalIsBoundary(originalStart) || this._OriginalIsBoundary(originalStart - 1)) {
                return true;
            }
            if (originalLength > 0) {
                const originalEnd = originalStart + originalLength;
                if (this._OriginalIsBoundary(originalEnd - 1) || this._OriginalIsBoundary(originalEnd)) {
                    return true;
                }
            }
            return false;
        }
        _ModifiedIsBoundary(index) {
            if (index <= 0 || index >= this._modifiedElementsOrHash.length - 1) {
                return true;
            }
            return (this._hasStrings && /^\s*$/.test(this._modifiedStringElements[index]));
        }
        _ModifiedRegionIsBoundary(modifiedStart, modifiedLength) {
            if (this._ModifiedIsBoundary(modifiedStart) || this._ModifiedIsBoundary(modifiedStart - 1)) {
                return true;
            }
            if (modifiedLength > 0) {
                const modifiedEnd = modifiedStart + modifiedLength;
                if (this._ModifiedIsBoundary(modifiedEnd - 1) || this._ModifiedIsBoundary(modifiedEnd)) {
                    return true;
                }
            }
            return false;
        }
        _boundaryScore(originalStart, originalLength, modifiedStart, modifiedLength) {
            const originalScore = (this._OriginalRegionIsBoundary(originalStart, originalLength) ? 1 : 0);
            const modifiedScore = (this._ModifiedRegionIsBoundary(modifiedStart, modifiedLength) ? 1 : 0);
            return (originalScore + modifiedScore);
        }
        /**
         * Concatenates the two input DiffChange lists and returns the resulting
         * list.
         * @param The left changes
         * @param The right changes
         * @returns The concatenated list
         */
        ConcatenateChanges(left, right) {
            const mergedChangeArr = [];
            if (left.length === 0 || right.length === 0) {
                return (right.length > 0) ? right : left;
            }
            else if (this.ChangesOverlap(left[left.length - 1], right[0], mergedChangeArr)) {
                // Since we break the problem down recursively, it is possible that we
                // might recurse in the middle of a change thereby splitting it into
                // two changes. Here in the combining stage, we detect and fuse those
                // changes back together
                const result = new Array(left.length + right.length - 1);
                MyArray.Copy(left, 0, result, 0, left.length - 1);
                result[left.length - 1] = mergedChangeArr[0];
                MyArray.Copy(right, 1, result, left.length, right.length - 1);
                return result;
            }
            else {
                const result = new Array(left.length + right.length);
                MyArray.Copy(left, 0, result, 0, left.length);
                MyArray.Copy(right, 0, result, left.length, right.length);
                return result;
            }
        }
        /**
         * Returns true if the two changes overlap and can be merged into a single
         * change
         * @param left The left change
         * @param right The right change
         * @param mergedChange The merged change if the two overlap, null otherwise
         * @returns True if the two changes overlap
         */
        ChangesOverlap(left, right, mergedChangeArr) {
            Debug.Assert(left.originalStart <= right.originalStart, 'Left change is not less than or equal to right change');
            Debug.Assert(left.modifiedStart <= right.modifiedStart, 'Left change is not less than or equal to right change');
            if (left.originalStart + left.originalLength >= right.originalStart || left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
                const originalStart = left.originalStart;
                let originalLength = left.originalLength;
                const modifiedStart = left.modifiedStart;
                let modifiedLength = left.modifiedLength;
                if (left.originalStart + left.originalLength >= right.originalStart) {
                    originalLength = right.originalStart + right.originalLength - left.originalStart;
                }
                if (left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
                    modifiedLength = right.modifiedStart + right.modifiedLength - left.modifiedStart;
                }
                mergedChangeArr[0] = new diffChange_1.DiffChange(originalStart, originalLength, modifiedStart, modifiedLength);
                return true;
            }
            else {
                mergedChangeArr[0] = null;
                return false;
            }
        }
        /**
         * Helper method used to clip a diagonal index to the range of valid
         * diagonals. This also decides whether or not the diagonal index,
         * if it exceeds the boundary, should be clipped to the boundary or clipped
         * one inside the boundary depending on the Even/Odd status of the boundary
         * and numDifferences.
         * @param diagonal The index of the diagonal to clip.
         * @param numDifferences The current number of differences being iterated upon.
         * @param diagonalBaseIndex The base reference diagonal.
         * @param numDiagonals The total number of diagonals.
         * @returns The clipped diagonal index.
         */
        ClipDiagonalBound(diagonal, numDifferences, diagonalBaseIndex, numDiagonals) {
            if (diagonal >= 0 && diagonal < numDiagonals) {
                // Nothing to clip, its in range
                return diagonal;
            }
            // diagonalsBelow: The number of diagonals below the reference diagonal
            // diagonalsAbove: The number of diagonals above the reference diagonal
            const diagonalsBelow = diagonalBaseIndex;
            const diagonalsAbove = numDiagonals - diagonalBaseIndex - 1;
            const diffEven = (numDifferences % 2 === 0);
            if (diagonal < 0) {
                const lowerBoundEven = (diagonalsBelow % 2 === 0);
                return (diffEven === lowerBoundEven) ? 0 : 1;
            }
            else {
                const upperBoundEven = (diagonalsAbove % 2 === 0);
                return (diffEven === upperBoundEven) ? numDiagonals - 1 : numDiagonals - 2;
            }
        }
    }
    exports.LcsDiff = LcsDiff;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[26/*vs/base/common/types*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateConstraint = exports.validateConstraints = exports.areFunctions = exports.isFunction = exports.isEmptyObject = exports.assertAllDefined = exports.assertIsDefined = exports.assertType = exports.isUndefinedOrNull = exports.isDefined = exports.isUndefined = exports.isBoolean = exports.isIterable = exports.isNumber = exports.isTypedArray = exports.isObject = exports.isStringArray = exports.isString = void 0;
    /**
     * @returns whether the provided parameter is a JavaScript String or not.
     */
    function isString(str) {
        return (typeof str === 'string');
    }
    exports.isString = isString;
    /**
     * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
     */
    function isStringArray(value) {
        return Array.isArray(value) && value.every(elem => isString(elem));
    }
    exports.isStringArray = isStringArray;
    /**
     * @returns whether the provided parameter is of type `object` but **not**
     *	`null`, an `array`, a `regexp`, nor a `date`.
     */
    function isObject(obj) {
        // The method can't do a type cast since there are type (like strings) which
        // are subclasses of any put not positvely matched by the function. Hence type
        // narrowing results in wrong results.
        return typeof obj === 'object'
            && obj !== null
            && !Array.isArray(obj)
            && !(obj instanceof RegExp)
            && !(obj instanceof Date);
    }
    exports.isObject = isObject;
    /**
     * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
     */
    function isTypedArray(obj) {
        const TypedArray = Object.getPrototypeOf(Uint8Array);
        return typeof obj === 'object'
            && obj instanceof TypedArray;
    }
    exports.isTypedArray = isTypedArray;
    /**
     * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
     * @returns whether the provided parameter is a JavaScript Number or not.
     */
    function isNumber(obj) {
        return (typeof obj === 'number' && !isNaN(obj));
    }
    exports.isNumber = isNumber;
    /**
     * @returns whether the provided parameter is an Iterable, casting to the given generic
     */
    function isIterable(obj) {
        return !!obj && typeof obj[Symbol.iterator] === 'function';
    }
    exports.isIterable = isIterable;
    /**
     * @returns whether the provided parameter is a JavaScript Boolean or not.
     */
    function isBoolean(obj) {
        return (obj === true || obj === false);
    }
    exports.isBoolean = isBoolean;
    /**
     * @returns whether the provided parameter is undefined.
     */
    function isUndefined(obj) {
        return (typeof obj === 'undefined');
    }
    exports.isUndefined = isUndefined;
    /**
     * @returns whether the provided parameter is defined.
     */
    function isDefined(arg) {
        return !isUndefinedOrNull(arg);
    }
    exports.isDefined = isDefined;
    /**
     * @returns whether the provided parameter is undefined or null.
     */
    function isUndefinedOrNull(obj) {
        return (isUndefined(obj) || obj === null);
    }
    exports.isUndefinedOrNull = isUndefinedOrNull;
    function assertType(condition, type) {
        if (!condition) {
            throw new Error(type ? `Unexpected type, expected '${type}'` : 'Unexpected type');
        }
    }
    exports.assertType = assertType;
    /**
     * Asserts that the argument passed in is neither undefined nor null.
     */
    function assertIsDefined(arg) {
        if (isUndefinedOrNull(arg)) {
            throw new Error('Assertion Failed: argument is undefined or null');
        }
        return arg;
    }
    exports.assertIsDefined = assertIsDefined;
    function assertAllDefined(...args) {
        const result = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (isUndefinedOrNull(arg)) {
                throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
            }
            result.push(arg);
        }
        return result;
    }
    exports.assertAllDefined = assertAllDefined;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * @returns whether the provided parameter is an empty JavaScript Object or not.
     */
    function isEmptyObject(obj) {
        if (!isObject(obj)) {
            return false;
        }
        for (const key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    exports.isEmptyObject = isEmptyObject;
    /**
     * @returns whether the provided parameter is a JavaScript Function or not.
     */
    function isFunction(obj) {
        return (typeof obj === 'function');
    }
    exports.isFunction = isFunction;
    /**
     * @returns whether the provided parameters is are JavaScript Function or not.
     */
    function areFunctions(...objects) {
        return objects.length > 0 && objects.every(isFunction);
    }
    exports.areFunctions = areFunctions;
    function validateConstraints(args, constraints) {
        const len = Math.min(args.length, constraints.length);
        for (let i = 0; i < len; i++) {
            validateConstraint(args[i], constraints[i]);
        }
    }
    exports.validateConstraints = validateConstraints;
    function validateConstraint(arg, constraint) {
        if (isString(constraint)) {
            if (typeof arg !== constraint) {
                throw new Error(`argument does not match constraint: typeof ${constraint}`);
            }
        }
        else if (isFunction(constraint)) {
            try {
                if (arg instanceof constraint) {
                    return;
                }
            }
            catch {
                // ignore
            }
            if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
                return;
            }
            if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
                return;
            }
            throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
        }
    }
    exports.validateConstraint = validateConstraint;
});

define(__m[41/*vs/base/common/codicons*/], __M([0/*require*/,1/*exports*/,26/*vs/base/common/types*/]), function (require, exports, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Codicon = exports.getAllCodicons = exports.getCodiconFontCharacters = void 0;
    const _codiconFontCharacters = Object.create(null);
    function register(id, fontCharacter) {
        if ((0, types_1.isString)(fontCharacter)) {
            const val = _codiconFontCharacters[fontCharacter];
            if (val === undefined) {
                throw new Error(`${id} references an unknown codicon: ${fontCharacter}`);
            }
            fontCharacter = val;
        }
        _codiconFontCharacters[id] = fontCharacter;
        return { id };
    }
    /**
     * Only to be used by the iconRegistry.
     */
    function getCodiconFontCharacters() {
        return _codiconFontCharacters;
    }
    exports.getCodiconFontCharacters = getCodiconFontCharacters;
    /**
     * Only to be used by the iconRegistry.
     */
    function getAllCodicons() {
        return Object.values(exports.Codicon);
    }
    exports.getAllCodicons = getAllCodicons;
    /**
     * The Codicon library is a set of default icons that are built-in in VS Code.
     *
     * In the product (outside of base) Codicons should only be used as defaults. In order to have all icons in VS Code
     * themeable, component should define new, UI component specific icons using `iconRegistry.registerIcon`.
     * In that call a Codicon can be named as default.
     */
    exports.Codicon = {
        // built-in icons, with image name
        add: register('add', 0xea60),
        plus: register('plus', 0xea60),
        gistNew: register('gist-new', 0xea60),
        repoCreate: register('repo-create', 0xea60),
        lightbulb: register('lightbulb', 0xea61),
        lightBulb: register('light-bulb', 0xea61),
        repo: register('repo', 0xea62),
        repoDelete: register('repo-delete', 0xea62),
        gistFork: register('gist-fork', 0xea63),
        repoForked: register('repo-forked', 0xea63),
        gitPullRequest: register('git-pull-request', 0xea64),
        gitPullRequestAbandoned: register('git-pull-request-abandoned', 0xea64),
        recordKeys: register('record-keys', 0xea65),
        keyboard: register('keyboard', 0xea65),
        tag: register('tag', 0xea66),
        tagAdd: register('tag-add', 0xea66),
        tagRemove: register('tag-remove', 0xea66),
        gitPullRequestLabel: register('git-pull-request-label', 0xea66),
        person: register('person', 0xea67),
        personFollow: register('person-follow', 0xea67),
        personOutline: register('person-outline', 0xea67),
        personFilled: register('person-filled', 0xea67),
        gitBranch: register('git-branch', 0xea68),
        gitBranchCreate: register('git-branch-create', 0xea68),
        gitBranchDelete: register('git-branch-delete', 0xea68),
        sourceControl: register('source-control', 0xea68),
        mirror: register('mirror', 0xea69),
        mirrorPublic: register('mirror-public', 0xea69),
        star: register('star', 0xea6a),
        starAdd: register('star-add', 0xea6a),
        starDelete: register('star-delete', 0xea6a),
        starEmpty: register('star-empty', 0xea6a),
        comment: register('comment', 0xea6b),
        commentAdd: register('comment-add', 0xea6b),
        alert: register('alert', 0xea6c),
        warning: register('warning', 0xea6c),
        search: register('search', 0xea6d),
        searchSave: register('search-save', 0xea6d),
        logOut: register('log-out', 0xea6e),
        signOut: register('sign-out', 0xea6e),
        logIn: register('log-in', 0xea6f),
        signIn: register('sign-in', 0xea6f),
        eye: register('eye', 0xea70),
        eyeUnwatch: register('eye-unwatch', 0xea70),
        eyeWatch: register('eye-watch', 0xea70),
        circleFilled: register('circle-filled', 0xea71),
        primitiveDot: register('primitive-dot', 0xea71),
        closeDirty: register('close-dirty', 0xea71),
        debugBreakpoint: register('debug-breakpoint', 0xea71),
        debugBreakpointDisabled: register('debug-breakpoint-disabled', 0xea71),
        debugBreakpointPending: register('debug-breakpoint-pending', 0xebd9),
        debugHint: register('debug-hint', 0xea71),
        primitiveSquare: register('primitive-square', 0xea72),
        edit: register('edit', 0xea73),
        pencil: register('pencil', 0xea73),
        info: register('info', 0xea74),
        issueOpened: register('issue-opened', 0xea74),
        gistPrivate: register('gist-private', 0xea75),
        gitForkPrivate: register('git-fork-private', 0xea75),
        lock: register('lock', 0xea75),
        mirrorPrivate: register('mirror-private', 0xea75),
        close: register('close', 0xea76),
        removeClose: register('remove-close', 0xea76),
        x: register('x', 0xea76),
        repoSync: register('repo-sync', 0xea77),
        sync: register('sync', 0xea77),
        clone: register('clone', 0xea78),
        desktopDownload: register('desktop-download', 0xea78),
        beaker: register('beaker', 0xea79),
        microscope: register('microscope', 0xea79),
        vm: register('vm', 0xea7a),
        deviceDesktop: register('device-desktop', 0xea7a),
        file: register('file', 0xea7b),
        fileText: register('file-text', 0xea7b),
        more: register('more', 0xea7c),
        ellipsis: register('ellipsis', 0xea7c),
        kebabHorizontal: register('kebab-horizontal', 0xea7c),
        mailReply: register('mail-reply', 0xea7d),
        reply: register('reply', 0xea7d),
        organization: register('organization', 0xea7e),
        organizationFilled: register('organization-filled', 0xea7e),
        organizationOutline: register('organization-outline', 0xea7e),
        newFile: register('new-file', 0xea7f),
        fileAdd: register('file-add', 0xea7f),
        newFolder: register('new-folder', 0xea80),
        fileDirectoryCreate: register('file-directory-create', 0xea80),
        trash: register('trash', 0xea81),
        trashcan: register('trashcan', 0xea81),
        history: register('history', 0xea82),
        clock: register('clock', 0xea82),
        folder: register('folder', 0xea83),
        fileDirectory: register('file-directory', 0xea83),
        symbolFolder: register('symbol-folder', 0xea83),
        logoGithub: register('logo-github', 0xea84),
        markGithub: register('mark-github', 0xea84),
        github: register('github', 0xea84),
        terminal: register('terminal', 0xea85),
        console: register('console', 0xea85),
        repl: register('repl', 0xea85),
        zap: register('zap', 0xea86),
        symbolEvent: register('symbol-event', 0xea86),
        error: register('error', 0xea87),
        stop: register('stop', 0xea87),
        variable: register('variable', 0xea88),
        symbolVariable: register('symbol-variable', 0xea88),
        array: register('array', 0xea8a),
        symbolArray: register('symbol-array', 0xea8a),
        symbolModule: register('symbol-module', 0xea8b),
        symbolPackage: register('symbol-package', 0xea8b),
        symbolNamespace: register('symbol-namespace', 0xea8b),
        symbolObject: register('symbol-object', 0xea8b),
        symbolMethod: register('symbol-method', 0xea8c),
        symbolFunction: register('symbol-function', 0xea8c),
        symbolConstructor: register('symbol-constructor', 0xea8c),
        symbolBoolean: register('symbol-boolean', 0xea8f),
        symbolNull: register('symbol-null', 0xea8f),
        symbolNumeric: register('symbol-numeric', 0xea90),
        symbolNumber: register('symbol-number', 0xea90),
        symbolStructure: register('symbol-structure', 0xea91),
        symbolStruct: register('symbol-struct', 0xea91),
        symbolParameter: register('symbol-parameter', 0xea92),
        symbolTypeParameter: register('symbol-type-parameter', 0xea92),
        symbolKey: register('symbol-key', 0xea93),
        symbolText: register('symbol-text', 0xea93),
        symbolReference: register('symbol-reference', 0xea94),
        goToFile: register('go-to-file', 0xea94),
        symbolEnum: register('symbol-enum', 0xea95),
        symbolValue: register('symbol-value', 0xea95),
        symbolRuler: register('symbol-ruler', 0xea96),
        symbolUnit: register('symbol-unit', 0xea96),
        activateBreakpoints: register('activate-breakpoints', 0xea97),
        archive: register('archive', 0xea98),
        arrowBoth: register('arrow-both', 0xea99),
        arrowDown: register('arrow-down', 0xea9a),
        arrowLeft: register('arrow-left', 0xea9b),
        arrowRight: register('arrow-right', 0xea9c),
        arrowSmallDown: register('arrow-small-down', 0xea9d),
        arrowSmallLeft: register('arrow-small-left', 0xea9e),
        arrowSmallRight: register('arrow-small-right', 0xea9f),
        arrowSmallUp: register('arrow-small-up', 0xeaa0),
        arrowUp: register('arrow-up', 0xeaa1),
        bell: register('bell', 0xeaa2),
        bold: register('bold', 0xeaa3),
        book: register('book', 0xeaa4),
        bookmark: register('bookmark', 0xeaa5),
        debugBreakpointConditionalUnverified: register('debug-breakpoint-conditional-unverified', 0xeaa6),
        debugBreakpointConditional: register('debug-breakpoint-conditional', 0xeaa7),
        debugBreakpointConditionalDisabled: register('debug-breakpoint-conditional-disabled', 0xeaa7),
        debugBreakpointDataUnverified: register('debug-breakpoint-data-unverified', 0xeaa8),
        debugBreakpointData: register('debug-breakpoint-data', 0xeaa9),
        debugBreakpointDataDisabled: register('debug-breakpoint-data-disabled', 0xeaa9),
        debugBreakpointLogUnverified: register('debug-breakpoint-log-unverified', 0xeaaa),
        debugBreakpointLog: register('debug-breakpoint-log', 0xeaab),
        debugBreakpointLogDisabled: register('debug-breakpoint-log-disabled', 0xeaab),
        briefcase: register('briefcase', 0xeaac),
        broadcast: register('broadcast', 0xeaad),
        browser: register('browser', 0xeaae),
        bug: register('bug', 0xeaaf),
        calendar: register('calendar', 0xeab0),
        caseSensitive: register('case-sensitive', 0xeab1),
        check: register('check', 0xeab2),
        checklist: register('checklist', 0xeab3),
        chevronDown: register('chevron-down', 0xeab4),
        dropDownButton: register('drop-down-button', 0xeab4),
        chevronLeft: register('chevron-left', 0xeab5),
        chevronRight: register('chevron-right', 0xeab6),
        chevronUp: register('chevron-up', 0xeab7),
        chromeClose: register('chrome-close', 0xeab8),
        chromeMaximize: register('chrome-maximize', 0xeab9),
        chromeMinimize: register('chrome-minimize', 0xeaba),
        chromeRestore: register('chrome-restore', 0xeabb),
        circle: register('circle', 0xeabc),
        circleOutline: register('circle-outline', 0xeabc),
        debugBreakpointUnverified: register('debug-breakpoint-unverified', 0xeabc),
        circleSlash: register('circle-slash', 0xeabd),
        circuitBoard: register('circuit-board', 0xeabe),
        clearAll: register('clear-all', 0xeabf),
        clippy: register('clippy', 0xeac0),
        closeAll: register('close-all', 0xeac1),
        cloudDownload: register('cloud-download', 0xeac2),
        cloudUpload: register('cloud-upload', 0xeac3),
        code: register('code', 0xeac4),
        collapseAll: register('collapse-all', 0xeac5),
        colorMode: register('color-mode', 0xeac6),
        commentDiscussion: register('comment-discussion', 0xeac7),
        compareChanges: register('compare-changes', 0xeafd),
        creditCard: register('credit-card', 0xeac9),
        dash: register('dash', 0xeacc),
        dashboard: register('dashboard', 0xeacd),
        database: register('database', 0xeace),
        debugContinue: register('debug-continue', 0xeacf),
        debugDisconnect: register('debug-disconnect', 0xead0),
        debugPause: register('debug-pause', 0xead1),
        debugRestart: register('debug-restart', 0xead2),
        debugStart: register('debug-start', 0xead3),
        debugStepInto: register('debug-step-into', 0xead4),
        debugStepOut: register('debug-step-out', 0xead5),
        debugStepOver: register('debug-step-over', 0xead6),
        debugStop: register('debug-stop', 0xead7),
        debug: register('debug', 0xead8),
        deviceCameraVideo: register('device-camera-video', 0xead9),
        deviceCamera: register('device-camera', 0xeada),
        deviceMobile: register('device-mobile', 0xeadb),
        diffAdded: register('diff-added', 0xeadc),
        diffIgnored: register('diff-ignored', 0xeadd),
        diffModified: register('diff-modified', 0xeade),
        diffRemoved: register('diff-removed', 0xeadf),
        diffRenamed: register('diff-renamed', 0xeae0),
        diff: register('diff', 0xeae1),
        discard: register('discard', 0xeae2),
        editorLayout: register('editor-layout', 0xeae3),
        emptyWindow: register('empty-window', 0xeae4),
        exclude: register('exclude', 0xeae5),
        extensions: register('extensions', 0xeae6),
        eyeClosed: register('eye-closed', 0xeae7),
        fileBinary: register('file-binary', 0xeae8),
        fileCode: register('file-code', 0xeae9),
        fileMedia: register('file-media', 0xeaea),
        filePdf: register('file-pdf', 0xeaeb),
        fileSubmodule: register('file-submodule', 0xeaec),
        fileSymlinkDirectory: register('file-symlink-directory', 0xeaed),
        fileSymlinkFile: register('file-symlink-file', 0xeaee),
        fileZip: register('file-zip', 0xeaef),
        files: register('files', 0xeaf0),
        filter: register('filter', 0xeaf1),
        flame: register('flame', 0xeaf2),
        foldDown: register('fold-down', 0xeaf3),
        foldUp: register('fold-up', 0xeaf4),
        fold: register('fold', 0xeaf5),
        folderActive: register('folder-active', 0xeaf6),
        folderOpened: register('folder-opened', 0xeaf7),
        gear: register('gear', 0xeaf8),
        gift: register('gift', 0xeaf9),
        gistSecret: register('gist-secret', 0xeafa),
        gist: register('gist', 0xeafb),
        gitCommit: register('git-commit', 0xeafc),
        gitCompare: register('git-compare', 0xeafd),
        gitMerge: register('git-merge', 0xeafe),
        githubAction: register('github-action', 0xeaff),
        githubAlt: register('github-alt', 0xeb00),
        globe: register('globe', 0xeb01),
        grabber: register('grabber', 0xeb02),
        graph: register('graph', 0xeb03),
        gripper: register('gripper', 0xeb04),
        heart: register('heart', 0xeb05),
        home: register('home', 0xeb06),
        horizontalRule: register('horizontal-rule', 0xeb07),
        hubot: register('hubot', 0xeb08),
        inbox: register('inbox', 0xeb09),
        issueClosed: register('issue-closed', 0xeba4),
      