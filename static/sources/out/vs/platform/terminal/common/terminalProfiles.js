/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/nls", "vs/base/common/themables"], function (require, exports, codicons_1, uri_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isUriComponents = exports.terminalIconsEqual = exports.terminalProfileArgsMatch = exports.createProfileSchemaEnums = void 0;
    function createProfileSchemaEnums(detectedProfiles, extensionProfiles) {
        const result = [{
                name: null,
                description: (0, nls_1.localize)('terminalAutomaticProfile', 'Automatically detect the default')
            }];
        result.push(...detectedProfiles.map(e => {
            return {
                name: e.profileName,
                description: createProfileDescription(e)
            };
        }));
        if (extensionProfiles) {
            result.push(...extensionProfiles.map(extensionProfile => {
                return {
                    name: extensionProfile.title,
                    description: createExtensionProfileDescription(extensionProfile)
                };
            }));
        }
        return {
            values: result.map(e => e.name),
            markdownDescriptions: result.map(e => e.description)
        };
    }
    exports.createProfileSchemaEnums = createProfileSchemaEnums;
    function createProfileDescription(profile) {
        let description = `$(${themables_1.ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : codicons_1.Codicon.terminal.id}) ${profile.profileName}\n- path: ${profile.path}`;
        if (profile.args) {
            if (typeof profile.args === 'string') {
                description += `\n- args: "${profile.args}"`;
            }
            else {
                description += `\n- args: [${profile.args.length === 0 ? '' : `'${profile.args.join(`','`)}'`}]`;
            }
        }
        if (profile.overrideName !== undefined) {
            description += `\n- overrideName: ${profile.overrideName}`;
        }
        if (profile.color) {
            description += `\n- color: ${profile.color}`;
        }
        if (profile.env) {
            description += `\n- env: ${JSON.stringify(profile.env)}`;
        }
        return description;
    }
    function createExtensionProfileDescription(profile) {
        const description = `$(${themables_1.ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : codicons_1.Codicon.terminal.id}) ${profile.title}\n- extensionIdentifier: ${profile.extensionIdentifier}`;
        return description;
    }
    function terminalProfileArgsMatch(args1, args2) {
        if (!args1 && !args2) {
            return true;
        }
        else if (typeof args1 === 'string' && typeof args2 === 'string') {
            return args1 === args2;
        }
        else if (Array.isArray(args1) && Array.isArray(args2)) {
            if (args1.length !== args2.length) {
                return false;
            }
            for (let i = 0; i < args1.length; i++) {
                if (args1[i] !== args2[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    exports.terminalProfileArgsMatch = terminalProfileArgsMatch;
    function terminalIconsEqual(a, b) {
        if (!a && !b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        if (themables_1.ThemeIcon.isThemeIcon(a) && themables_1.ThemeIcon.isThemeIcon(b)) {
            return a.id === b.id && a.color === b.color;
        }
        if (typeof a === 'object' && 'light' in a && 'dark' in a
            && typeof b === 'object' && 'light' in b && 'dark' in b) {
            const castedA = a;
            const castedB = b;
            if ((uri_1.URI.isUri(castedA.light) || isUriComponents(castedA.light)) && (uri_1.URI.isUri(castedA.dark) || isUriComponents(castedA.dark))
                && (uri_1.URI.isUri(castedB.light) || isUriComponents(castedB.light)) && (uri_1.URI.isUri(castedB.dark) || isUriComponents(castedB.dark))) {
                return castedA.light.path === castedB.light.path && castedA.dark.path === castedB.dark.path;
            }
        }
        if ((uri_1.URI.isUri(a) && uri_1.URI.isUri(b)) || (isUriComponents(a) || isUriComponents(b))) {
            const castedA = a;
            const castedB = b;
            return castedA.path === castedB.path && castedA.scheme === castedB.scheme;
        }
        return false;
    }
    exports.terminalIconsEqual = terminalIconsEqual;
    function isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return typeof thing.path === 'string' &&
            typeof thing.scheme === 'string';
    }
    exports.isUriComponents = isUriComponents;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsUHJvZmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLFNBQWdCLHdCQUF3QixDQUFDLGdCQUFvQyxFQUFFLGlCQUF3RDtRQUl0SSxNQUFNLE1BQU0sR0FBbUQsQ0FBQztnQkFDL0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLGtDQUFrQyxDQUFDO2FBQ3JGLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkMsT0FBTztnQkFDTixJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVc7Z0JBQ25CLFdBQVcsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7YUFDeEMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUN2RCxPQUFPO29CQUNOLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLO29CQUM1QixXQUFXLEVBQUUsaUNBQWlDLENBQUMsZ0JBQWdCLENBQUM7aUJBQ2hFLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU87WUFDTixNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDL0Isb0JBQW9CLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FB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