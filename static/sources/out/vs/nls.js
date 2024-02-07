/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9ubHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLElBQUksUUFBUSxHQUFHLENBQUMsT0FBTyxRQUFRLEtBQUssV0FBVyxJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVILE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQztJQXVEaEMsU0FBUyxPQUFPLENBQUMsT0FBZSxFQUFFLElBQXNEO1FBQ3ZGLElBQUksTUFBYyxDQUFDO1FBRW5CLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ2xCLENBQUM7YUFBTSxDQUFDO1lBQ1AsTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUNuQixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUM3QixNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUNkLENBQUM7cUJBQU0sSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ2xHLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxD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