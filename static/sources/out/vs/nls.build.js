/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.finishBuild = exports.writeFile = exports.write = exports.load = exports.getConfiguredDefaultLocale = exports.localize2 = exports.localize = void 0;
    const buildMap = {};
    const buildMapKeys = {};
    const entryPoints = {};
    function localize(data, message, ...args) {
        throw new Error(`Not supported at build time!`);
    }
    exports.localize = localize;
    function localize2(data, message, ...args) {
        throw new Error(`Not supported at build time!`);
    }
    exports.localize2 = localize2;
    function getConfiguredDefaultLocale() {
        throw new Error(`Not supported at build time!`);
    }
    exports.getConfiguredDefaultLocale = getConfiguredDefaultLocale;
    /**
     * Invoked by the loader at build-time
     */
    function load(name, req, load, config) {
        if (!name || name.length === 0) {
            load({ localize, localize2, getConfiguredDefaultLocale });
        }
        else {
            req([name + '.nls', name + '.nls.keys'], function (messages, keys) {
                buildMap[name] = messages;
                buildMapKeys[name] = keys;
                load(messages);
            });
        }
    }
    exports.load = load;
    /**
     * Invoked by the loader at build-time
     */
    function write(pluginName, moduleName, write) {
        const entryPoint = write.getEntryPoint();
        entryPoints[entryPoint] = entryPoints[entryPoint] || [];
        entryPoints[entryPoint].push(moduleName);
        if (moduleName !== entryPoint) {
            write.asModule(pluginName + '!' + moduleName, 'define([\'vs/nls\', \'vs/nls!' + entryPoint + '\'], function(nls, data) { return nls.create("' + moduleName + '", data); });');
        }
    }
    exports.write = write;
    /**
     * Invoked by the loader at build-time
     */
    function writeFile(pluginName, moduleName, req, write, config) {
        if (entryPoints.hasOwnProperty(moduleName)) {
            const fileName = req.toUrl(moduleName + '.nls.js');
            const contents = [
                '/*---------------------------------------------------------',
                ' * Copyright (c) Microsoft Corporation. All rights reserved.',
                ' *--------------------------------------------------------*/'
            ], entries = entryPoints[moduleName];
            const data = {};
            for (let i = 0; i < entries.length; i++) {
                data[entries[i]] = buildMap[entries[i]];
            }
            contents.push('define("' + moduleName + '.nls", ' + JSON.stringify(data, null, '\t') + ');');
            write(fileName, contents.join('\r\n'));
        }
    }
    exports.writeFile = writeFile;
    /**
     * Invoked by the loader at build-time
     */
    function finishBuild(write) {
        write('nls.metadata.json', JSON.stringify({
            keys: buildMapKeys,
            messages: buildMap,
            bundles: entryPoints
        }, null, '\t'));
    }
    exports.finishBuild = finishBuild;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmxzLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9ubHMuYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLE1BQU0sUUFBUSxHQUFpQyxFQUFFLENBQUM7SUFDbEQsTUFBTSxZQUFZLEdBQWlDLEVBQUUsQ0FBQztJQUN0RCxNQUFNLFdBQVcsR0FBdUMsRUFBRSxDQUFDO0lBTzNELFNBQWdCLFFBQVEsQ0FBQyxJQUE0QixFQUFFLE9BQWUsRUFBRSxHQUFHLElBQXNEO1FBQ2hJLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRkQsNEJBRUM7SUFFRCxTQUFnQixTQUFTLENBQUMsSUFBNEIsRUFBRSxPQUFlLEVBQUUsR0FBRyxJQUFzRDtRQUNqSSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUZELDhCQUVDO0lBRUQsU0FBZ0IsMEJBQTBCO1FBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRkQsZ0VBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLElBQUksQ0FBQyxJQUFZLEVBQUUsR0FBK0IsRUFBRSxJQUFtQyxFQUFFLE1BQXVDO1FBQy9JLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLDBCQUEwQixFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO2FBQU0sQ0FBQztZQUNQLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLEVBQUUsSUFBSSxHQUFHLFdBQVcsQ0FBQyxFQUFFLFVBQVUsUUFBa0IsRUFBRSxJQUFjO2dCQUNwRixRQUFRLENBQUMsSUFB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