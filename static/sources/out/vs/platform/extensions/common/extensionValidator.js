/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/severity", "vs/nls", "vs/base/common/semver/semver"], function (require, exports, resources_1, severity_1, nls, semver) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEngineValid = exports.isValidExtensionVersion = exports.validateExtensionManifest = exports.isValidVersion = exports.normalizeVersion = exports.parseVersion = exports.isValidVersionStr = void 0;
    const VERSION_REGEXP = /^(\^|>=)?((\d+)|x)\.((\d+)|x)\.((\d+)|x)(\-.*)?$/;
    const NOT_BEFORE_REGEXP = /^-(\d{4})(\d{2})(\d{2})$/;
    function isValidVersionStr(version) {
        version = version.trim();
        return (version === '*' || VERSION_REGEXP.test(version));
    }
    exports.isValidVersionStr = isValidVersionStr;
    function parseVersion(version) {
        if (!isValidVersionStr(version)) {
            return null;
        }
        version = version.trim();
        if (version === '*') {
            return {
                hasCaret: false,
                hasGreaterEquals: false,
                majorBase: 0,
                majorMustEqual: false,
                minorBase: 0,
                minorMustEqual: false,
                patchBase: 0,
                patchMustEqual: false,
                preRelease: null
            };
        }
        const m = version.match(VERSION_REGEXP);
        if (!m) {
            return null;
        }
        return {
            hasCaret: m[1] === '^',
            hasGreaterEquals: m[1] === '>=',
            majorBase: m[2] === 'x' ? 0 : parseInt(m[2], 10),
            majorMustEqual: (m[2] === 'x' ? false : true),
            minorBase: m[4] === 'x' ? 0 : parseInt(m[4], 10),
            minorMustEqual: (m[4] === 'x' ? false : true),
            patchBase: m[6] === 'x' ? 0 : parseInt(m[6], 10),
            patchMustEqual: (m[6] === 'x' ? false : true),
            preRelease: m[8] || null
        };
    }
    exports.parseVersion = parseVersion;
    function normalizeVersion(version) {
        if (!version) {
            return null;
        }
        const majorBase = version.majorBase;
        const majorMustEqual = version.majorMustEqual;
        const minorBase = version.minorBase;
        let minorMustEqual = version.minorMustEqual;
        const patchBase = version.patchBase;
        let patchMustEqual = version.patchMustEqual;
        if (version.hasCaret) {
            if (majorBase === 0) {
                patchMustEqual = false;
            }
            else {
                minorMustEqual = false;
                patchMustEqual = false;
            }
        }
        let notBefore = 0;
        if (version.preRelease) {
            const match = NOT_BEFORE_REGEXP.exec(version.preRelease);
            if (match) {
                const [, year, month, day] = match;
                notBefore = Date.UTC(Number(year), Number(month) - 1, Number(day));
            }
        }
        return {
            majorBase: majorBase,
            majorMustEqual: majorMustEqual,
            minorBase: minorBase,
            minorMustEqual: minorMustEqual,
            patchBase: patchBase,
            patchMustEqual: patchMustEqual,
            isMinimum: version.hasGreaterEquals,
            notBefore,
        };
    }
    exports.normalizeVersion = normalizeVersion;
    function isValidVersion(_inputVersion, _inputDate, _desiredVersion) {
        let version;
        if (typeof _inputVersion === 'string') {
            version = normalizeVersion(parseVersion(_inputVersion));
        }
        else {
            version = _inputVersion;
        }
        let productTs;
        if (_inputDate instanceof Date) {
            productTs = _inputDate.getTime();
        }
        else if (typeof _inputDate === 'string') {
            productTs = new Date(_inputDate).getTime();
        }
        let desiredVersion;
        if (typeof _desiredVersion === 'string') {
            desiredVersion = normalizeVersion(parseVersion(_desiredVersion));
        }
        else {
            desiredVersion = _desiredVersion;
        }
        if (!version || !desiredVersion) {
            return false;
        }
        const majorBase = version.majorBase;
        const minorBase = version.minorBase;
        const patchBase = version.patchBase;
        let desiredMajorBase = desiredVersion.majorBase;
        let desiredMinorBase = desiredVersion.minorBase;
        let desiredPatchBase = desiredVersion.patchBase;
        const desiredNotBefore = desiredVersion.notBefore;
        let majorMustEqual = desiredVersion.majorMustEqual;
        let minorMustEqual = desiredVersion.minorMustEqual;
        let patchMustEqual = desiredVersion.patchMustEqual;
        if (desiredVersion.isMinimum) {
            if (majorBase > desiredMajorBase) {
                return true;
            }
            if (majorBase < desiredMajorBase) {
                return false;
            }
            if (minorBase > desiredMinorBase) {
                return true;
            }
            if (minorBase < desiredMinorBase) {
                return false;
            }
            if (productTs && productTs < desiredNotBefore) {
                return false;
            }
            return patchBase >= desiredPatchBase;
        }
        // Anything < 1.0.0 is compatible with >= 1.0.0, except exact matches
        if (majorBase === 1 && desiredMajorBase === 0 && (!majorMustEqual || !minorMustEqual || !patchMustEqual)) {
            desiredMajorBase = 1;
            desiredMinorBase = 0;
            desiredPatchBase = 0;
            majorMustEqual = true;
            minorMustEqual = false;
            patchMustEqual = false;
        }
        if (majorBase < desiredMajorBase) {
            // smaller major version
            return false;
        }
        if (majorBase > desiredMajorBase) {
            // higher major version
            return (!majorMustEqual);
        }
        // at this point, majorBase are equal
        if (minorBase < desiredMinorBase) {
            // smaller minor version
            return false;
        }
        if (minorBase > desiredMinorBase) {
            // higher minor version
            return (!minorMustEqual);
        }
        // at this point, minorBase are equal
        if (patchBase < desiredPatchBase) {
            // smaller patch version
            return false;
        }
        if (patchBase > desiredPatchBase) {
            // higher patch version
            return (!patchMustEqual);
        }
        // at this point, patchBase are equal
        if (productTs && productTs < desiredNotBefore) {
            return false;
        }
        return true;
    }
    exports.isValidVersion = isValidVersion;
    function validateExtensionManifest(productVersion, productDate, extensionLocation, extensionManifest, extensionIsBuiltin) {
        const validations = [];
        if (typeof extensionManifest.publisher !== 'undefined' && typeof extensionManifest.publisher !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.publisher', "property publisher must be of type `string`.")]);
            return validations;
        }
        if (typeof extensionManifest.name !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.name', "property `{0}` is mandatory and must be of type `string`", 'name')]);
            return validations;
        }
        if (typeof extensionManifest.version !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.version', "property `{0}` is mandatory and must be of type `string`", 'version')]);
            return validations;
        }
        if (!extensionManifest.engines) {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.engines', "property `{0}` is mandatory and must be of type `object`", 'engines')]);
            return validations;
        }
        if (typeof extensionManifest.engines.vscode !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.engines.vscode', "property `{0}` is mandatory and must be of type `string`", 'engines.vscode')]);
            return validations;
        }
        if (typeof extensionManifest.extensionDependencies !== 'undefined') {
            if (!isStringArray(extensionManifest.extensionDependencies)) {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.extensionDependencies', "property `{0}` can be omitted or must be of type `string[]`", 'extensionDependencies')]);
                return validations;
            }
        }
        if (typeof extensionManifest.activationEvents !== 'undefined') {
            if (!isStringArray(extensionManifest.activationEvents)) {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.activationEvents1', "property `{0}` can be omitted or must be of type `string[]`", 'activationEvents')]);
                return validations;
            }
            if (typeof extensionManifest.main === 'undefined' && typeof extensionManifest.browser === 'undefined') {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.activationEvents2', "property `{0}` should be omitted if the extension doesn't have a `{1}` or `{2}` property.", 'activationEvents', 'main', 'browser')]);
                return validations;
            }
        }
        if (typeof extensionManifest.extensionKind !== 'undefined') {
            if (typeof extensionManifest.main === 'undefined') {
                validations.push([severity_1.default.Warning, nls.localize('extensionDescription.extensionKind', "property `{0}` can be defined only if property `main` is also defined.", 'extensionKind')]);
                // not a failure case
            }
        }
        if (typeof extensionManifest.main !== 'undefined') {
            if (typeof extensionManifest.main !== 'string') {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.main1', "property `{0}` can be omitted or must be of type `string`", 'main')]);
                return validations;
            }
            else {
                const mainLocation = (0, resources_1.joinPath)(extensionLocation, extensionManifest.main);
                if (!(0, resources_1.isEqualOrParent)(mainLocation, extensionLocation)) {
                    validations.push([severity_1.default.Warning, nls.localize('extensionDescription.main2', "Expected `main` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.", mainLocation.path, extensionLocation.path)]);
                    // not a failure case
                }
            }
        }
        if (typeof extensionManifest.browser !== 'undefined') {
            if (typeof extensionManifest.browser !== 'string') {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.browser1', "property `{0}` can be omitted or must be of type `string`", 'browser')]);
                return validations;
            }
            else {
                const browserLocation = (0, resources_1.joinPath)(extensionLocation, extensionManifest.browser);
                if (!(0, resources_1.isEqualOrParent)(browserLocation, extensionLocation)) {
                    validations.push([severity_1.default.Warning, nls.localize('extensionDescription.browser2', "Expected `browser` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.", browserLocation.path, extensionLocation.path)]);
                    // not a failure case
                }
            }
        }
        if (!semver.valid(extensionManifest.version)) {
            validations.push([severity_1.default.Error, nls.localize('notSemver', "Extension version is not semver compatible.")]);
            return validations;
        }
        const notices = [];
        const isValid = isValidExtensionVersion(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices);
        if (!isValid) {
            for (const notice of notices) {
                validations.push([severity_1.default.Error, notice]);
            }
        }
        return validations;
    }
    exports.validateExtensionManifest = validateExtensionManifest;
    function isValidExtensionVersion(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices) {
        if (extensionIsBuiltin || (typeof extensionManifest.main === 'undefined' && typeof extensionManifest.browser === 'undefined')) {
            // No version check for builtin or declarative extensions
            return true;
        }
        return isVersionValid(productVersion, productDate, extensionManifest.engines.vscode, notices);
    }
    exports.isValidExtensionVersion = isValidExtensionVersion;
    function isEngineValid(engine, version, date) {
        // TODO@joao: discuss with alex '*' doesn't seem to be a valid engine version
        return engine === '*' || isVersionValid(version, date, engine);
    }
    exports.isEngineValid = isEngineValid;
    function isVersionValid(currentVersion, date, requestedVersion, notices = []) {
        const desiredVersion = normalizeVersion(parseVersion(requestedVersion));
        if (!desiredVersion) {
            notices.push(nls.localize('versionSyntax', "Could not parse `engines.vscode` value {0}. Please use, for example: ^1.22.0, ^1.22.x, etc.", requestedVersion));
            return false;
        }
        // enforce that a breaking API version is specified.
        // for 0.X.Y, that means up to 0.X must be specified
        // otherwise for Z.X.Y, that means Z must be specified
        if (desiredVersion.majorBase === 0) {
            // force that major and minor must be specific
            if (!desiredVersion.majorMustEqual || !desiredVersion.minorMustEqual) {
                notices.push(nls.localize('versionSpecificity1', "Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions before 1.0.0, please define at a minimum the major and minor desired version. E.g. ^0.10.0, 0.10.x, 0.11.0, etc.", requestedVersion));
                return false;
            }
        }
        else {
            // force that major must be specific
            if (!desiredVersion.majorMustEqual) {
                notices.push(nls.localize('versionSpecificity2', "Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions after 1.0.0, please define at a minimum the major desired version. E.g. ^1.10.0, 1.10.x, 1.x.x, 2.x.x, etc.", requestedVersion));
                return false;
            }
        }
        if (!isValidVersion(currentVersion, date, desiredVersion)) {
            notices.push(nls.localize('versionMismatch', "Extension is not compatible with Code {0}. Extension requires: {1}.", currentVersion, requestedVersion));
            return false;
        }
        return true;
    }
    function isStringArray(arr) {
        if (!Array.isArray(arr)) {
            return false;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            if (typeof arr[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NoRyxNQUFNLGNBQWMsR0FBRyxrREFBa0QsQ0FBQztJQUMxRSxNQUFNLGlCQUFpQixHQUFHLDBCQUEwQixDQUFDO0lBRXJELFNBQWdCLGlCQUFpQixDQUFDLE9BQWU7UUFDaEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsT0FBTyxLQUFLLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUhELDhDQUdDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLE9BQWU7UUFDM0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV6QixJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNyQixPQUFPO2dCQUNOLFFBQVEsRUFBRSxLQUFLO2dCQUNmLGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLFNBQVMsRUFBRSxDQUFDO2dCQUNaLGNBQWMsRUFBRSxLQUFLO2dCQUNyQixTQUFTLEVBQUUsQ0FBQztnQkFDWixjQUFjLEVBQUUsS0FBSztnQkFDckIsU0FBUyxFQUFFLENBQUM7Z0JBQ1osY0FBYyxFQUFFLEtBQUs7Z0JBQ3JCLFVBQVUsRUFBRSxJQUFJO2FBQ2hCLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDUixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDRCxPQUFPO1lBQ04sUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO1lBQ3RCLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJO1lBQy9CLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hELGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hELGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hELGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSTtTQUN4QixDQUFDO0lBQ0gs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