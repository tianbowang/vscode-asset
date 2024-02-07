/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/languages/modesRegistry"], function (require, exports, glob_1, mime_1, network_1, path_1, resources_1, strings_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLanguageIds = exports.getMimeTypes = exports.clearConfiguredLanguageAssociations = exports.clearPlatformLanguageAssociations = exports.registerConfiguredLanguageAssociation = exports.registerPlatformLanguageAssociation = void 0;
    let registeredAssociations = [];
    let nonUserRegisteredAssociations = [];
    let userRegisteredAssociations = [];
    /**
     * Associate a language to the registry (platform).
     * * **NOTE**: This association will lose over associations registered using `registerConfiguredLanguageAssociation`.
     * * **NOTE**: Use `clearPlatformLanguageAssociations` to remove all associations registered using this function.
     */
    function registerPlatformLanguageAssociation(association, warnOnOverwrite = false) {
        _registerLanguageAssociation(association, false, warnOnOverwrite);
    }
    exports.registerPlatformLanguageAssociation = registerPlatformLanguageAssociation;
    /**
     * Associate a language to the registry (configured).
     * * **NOTE**: This association will win over associations registered using `registerPlatformLanguageAssociation`.
     * * **NOTE**: Use `clearConfiguredLanguageAssociations` to remove all associations registered using this function.
     */
    function registerConfiguredLanguageAssociation(association) {
        _registerLanguageAssociation(association, true, false);
    }
    exports.registerConfiguredLanguageAssociation = registerConfiguredLanguageAssociation;
    function _registerLanguageAssociation(association, userConfigured, warnOnOverwrite) {
        // Register
        const associationItem = toLanguageAssociationItem(association, userConfigured);
        registeredAssociations.push(associationItem);
        if (!associationItem.userConfigured) {
            nonUserRegisteredAssociations.push(associationItem);
        }
        else {
            userRegisteredAssociations.push(associationItem);
        }
        // Check for conflicts unless this is a user configured association
        if (warnOnOverwrite && !associationItem.userConfigured) {
            registeredAssociations.forEach(a => {
                if (a.mime === associationItem.mime || a.userConfigured) {
                    return; // same mime or userConfigured is ok
                }
                if (associationItem.extension && a.extension === associationItem.extension) {
                    console.warn(`Overwriting extension <<${associationItem.extension}>> to now point to mime <<${associationItem.mime}>>`);
                }
                if (associationItem.filename && a.filename === associationItem.filename) {
                    console.warn(`Overwriting filename <<${associationItem.filename}>> to now point to mime <<${associationItem.mime}>>`);
                }
                if (associationItem.filepattern && a.filepattern === associationItem.filepattern) {
                    console.warn(`Overwriting filepattern <<${associationItem.filepattern}>> to now point to mime <<${associationItem.mime}>>`);
                }
                if (associationItem.firstline && a.firstline === associationItem.firstline) {
                    console.warn(`Overwriting firstline <<${associationItem.firstline}>> to now point to mime <<${associationItem.mime}>>`);
                }
            });
        }
    }
    function toLanguageAssociationItem(association, userConfigured) {
        return {
            id: association.id,
            mime: association.mime,
            filename: association.filename,
            extension: association.extension,
            filepattern: association.filepattern,
            firstline: association.firstline,
            userConfigured: userConfigured,
            filenameLowercase: association.filename ? association.filename.toLowerCase() : undefined,
            extensionLowercase: association.extension ? association.extension.toLowerCase() : undefined,
            filepatternLowercase: association.filepattern ? (0, glob_1.parse)(association.filepattern.toLowerCase()) : undefined,
            filepatternOnPath: association.filepattern ? association.filepattern.indexOf(path_1.posix.sep) >= 0 : false
        };
    }
    /**
     * Clear language associations from the registry (platform).
     */
    function clearPlatformLanguageAssociations() {
        registeredAssociations = registeredAssociations.filter(a => a.userConfigured);
        nonUserRegisteredAssociations = [];
    }
    exports.clearPlatformLanguageAssociations = clearPlatformLanguageAssociations;
    /**
     * Clear language associations from the registry (configured).
     */
    function clearConfiguredLanguageAssociations() {
        registeredAssociations = registeredAssociations.filter(a => !a.userConfigured);
        userRegisteredAssociations = [];
    }
    exports.clearConfiguredLanguageAssociations = clearConfiguredLanguageAssociations;
    /**
     * Given a file, return the best matching mime types for it
     * based on the registered language associations.
     */
    function getMimeTypes(resource, firstLine) {
        return getAssociations(resource, firstLine).map(item => item.mime);
    }
    exports.getMimeTypes = getMimeTypes;
    /**
     * @see `getMimeTypes`
     */
    function getLanguageIds(resource, firstLine) {
        return getAssociations(resource, firstLine).map(item => item.id);
    }
    exports.getLanguageIds = getLanguageIds;
    function getAssociations(resource, firstLine) {
        let path;
        if (resource) {
            switch (resource.scheme) {
                case network_1.Schemas.file:
                    path = resource.fsPath;
                    break;
                case network_1.Schemas.data: {
                    const metadata = resources_1.DataUri.parseMetaData(resource);
                    path = metadata.get(resources_1.DataUri.META_DATA_LABEL);
                    break;
                }
                case network_1.Schemas.vscodeNotebookCell:
                    // File path not relevant for language detection of cell
                    path = undefined;
                    break;
                default:
                    path = resource.path;
            }
        }
        if (!path) {
            return [{ id: 'unknown', mime: mime_1.Mimes.unknown }];
        }
        path = path.toLowerCase();
        const filename = (0, path_1.basename)(path);
        // 1.) User configured mappings have highest priority
        const configuredLanguage = getAssociationByPath(path, filename, userRegisteredAssociations);
        if (configuredLanguage) {
            return [configuredLanguage, { id: modesRegistry_1.PLAINTEXT_LANGUAGE_ID, mime: mime_1.Mimes.text }];
        }
        // 2.) Registered mappings have middle priority
        const registeredLanguage = getAssociationByPath(path, filename, nonUserRegisteredAssociations);
        if (registeredLanguage) {
            return [registeredLanguage, { id: modesRegistry_1.PLAINTEXT_LANGUAGE_ID, mime: mime_1.Mimes.text }];
        }
        // 3.) Firstline has lowest priority
        if (firstLine) {
            const firstlineLanguage = getAssociationByFirstline(firstLine);
            if (firstlineLanguage) {
                return [firstlineLanguage, { id: modesRegistry_1.PLAINTEXT_LANGUAGE_ID, mime: mime_1.Mimes.text }];
            }
        }
        return [{ id: 'unknown', mime: mime_1.Mimes.unknown }];
    }
    function getAssociationByPath(path, filename, associations) {
        let filenameMatch = undefined;
        let patternMatch = undefined;
        let extensionMatch = undefined;
        // We want to prioritize associations based on the order they are registered so that the last registered
        // association wins over all other. This is for https://github.com/microsoft/vscode/issues/20074
        for (let i = associations.length - 1; i >= 0; i--) {
            const association = associations[i];
            // First exact name match
            if (filename === association.filenameLowercase) {
                filenameMatch = association;
                break; // take it!
            }
            // Longest pattern match
            if (association.filepattern) {
                if (!patternMatch || association.filepattern.length > patternMatch.filepattern.length) {
                    const target = association.filepatternOnPath ? path : filename; // match on full path if pattern contains path separator
                    if (association.filepatternLowercase?.(target)) {
                        patternMatch = association;
                    }
                }
            }
            // Longest extension match
            if (association.extension) {
                if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
                    if (filename.endsWith(association.extensionLowercase)) {
                        extensionMatch = association;
                    }
                }
            }
        }
        // 1.) Exact name match has second highest priority
        if (filenameMatch) {
            return filenameMatch;
        }
        // 2.) Match on pattern
        if (patternMatch) {
            return patternMatch;
        }
        // 3.) Match on extension comes next
        if (extensionMatch) {
            return extensionMatch;
        }
        return undefined;
    }
    function getAssociationByFirstline(firstLine) {
        if ((0, strings_1.startsWithUTF8BOM)(firstLine)) {
            firstLine = firstLine.substr(1);
        }
        if (firstLine.length > 0) {
            // We want to prioritize associations based on the order they are registered so that the last registered
            // association wins over all other. This is for https://github.com/microsoft/vscode/issues/20074
            for (let i = registeredAssociations.length - 1; i >= 0; i--) {
                const association = registeredAssociations[i];
                if (!association.firstline) {
                    continue;
                }
                const matches = firstLine.match(association.firstline);
                if (matches && matches.length > 0) {
                    return association;
                }
            }
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzQXNzb2NpYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL2xhbmd1YWdlc0Fzc29jaWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0QmhHLElBQUksc0JBQXNCLEdBQStCLEVBQUUsQ0FBQztJQUM1RCxJQUFJLDZCQUE2QixHQUErQixFQUFFLENBQUM7SUFDbkUsSUFBSSwwQkFBMEIsR0FBK0IsRUFBRSxDQUFDO0lBRWhFOzs7O09BSUc7SUFDSCxTQUFnQixtQ0FBbUMsQ0FBQyxXQUFpQyxFQUFFLGVBQWUsR0FBRyxLQUFLO1FBQzdHLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUZELGtGQUVDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLHFDQUFxQyxDQUFDLFdBQWlDO1FBQ3RGLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUZELHNGQUVDO0lBRUQsU0FBUyw0QkFBNEIsQ0FBQyxXQUFpQyxFQUFFLGNBQXVCLEVBQUUsZUFBd0I7UUFFekgsV0FBVztRQUNYLE1BQU0sZUFBZSxHQUFHLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUMvRSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNyQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckQsQ0FBQzthQUFNLENBQUM7WUFDUCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELG1FQUFtRTtR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