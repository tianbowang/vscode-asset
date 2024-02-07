/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions"], function (require, exports, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.determineExtensionHostKinds = exports.extensionRunningPreferenceToString = exports.ExtensionRunningPreference = exports.extensionHostKindToString = exports.ExtensionHostKind = void 0;
    var ExtensionHostKind;
    (function (ExtensionHostKind) {
        ExtensionHostKind[ExtensionHostKind["LocalProcess"] = 1] = "LocalProcess";
        ExtensionHostKind[ExtensionHostKind["LocalWebWorker"] = 2] = "LocalWebWorker";
        ExtensionHostKind[ExtensionHostKind["Remote"] = 3] = "Remote";
    })(ExtensionHostKind || (exports.ExtensionHostKind = ExtensionHostKind = {}));
    function extensionHostKindToString(kind) {
        if (kind === null) {
            return 'None';
        }
        switch (kind) {
            case 1 /* ExtensionHostKind.LocalProcess */: return 'LocalProcess';
            case 2 /* ExtensionHostKind.LocalWebWorker */: return 'LocalWebWorker';
            case 3 /* ExtensionHostKind.Remote */: return 'Remote';
        }
    }
    exports.extensionHostKindToString = extensionHostKindToString;
    var ExtensionRunningPreference;
    (function (ExtensionRunningPreference) {
        ExtensionRunningPreference[ExtensionRunningPreference["None"] = 0] = "None";
        ExtensionRunningPreference[ExtensionRunningPreference["Local"] = 1] = "Local";
        ExtensionRunningPreference[ExtensionRunningPreference["Remote"] = 2] = "Remote";
    })(ExtensionRunningPreference || (exports.ExtensionRunningPreference = ExtensionRunningPreference = {}));
    function extensionRunningPreferenceToString(preference) {
        switch (preference) {
            case 0 /* ExtensionRunningPreference.None */:
                return 'None';
            case 1 /* ExtensionRunningPreference.Local */:
                return 'Local';
            case 2 /* ExtensionRunningPreference.Remote */:
                return 'Remote';
        }
    }
    exports.extensionRunningPreferenceToString = extensionRunningPreferenceToString;
    function determineExtensionHostKinds(_localExtensions, _remoteExtensions, getExtensionKind, pickExtensionHostKind) {
        const localExtensions = toExtensionWithKind(_localExtensions, getExtensionKind);
        const remoteExtensions = toExtensionWithKind(_remoteExtensions, getExtensionKind);
        const allExtensions = new Map();
        const collectExtension = (ext) => {
            if (allExtensions.has(ext.key)) {
                return;
            }
            const local = localExtensions.get(ext.key) || null;
            const remote = remoteExtensions.get(ext.key) || null;
            const info = new ExtensionInfo(local, remote);
            allExtensions.set(info.key, info);
        };
        localExtensions.forEach((ext) => collectExtension(ext));
        remoteExtensions.forEach((ext) => collectExtension(ext));
        const extensionHostKinds = new Map();
        allExtensions.forEach((ext) => {
            const isInstalledLocally = Boolean(ext.local);
            const isInstalledRemotely = Boolean(ext.remote);
            const isLocallyUnderDevelopment = Boolean(ext.local && ext.local.isUnderDevelopment);
            const isRemotelyUnderDevelopment = Boolean(ext.remote && ext.remote.isUnderDevelopment);
            let preference = 0 /* ExtensionRunningPreference.None */;
            if (isLocallyUnderDevelopment && !isRemotelyUnderDevelopment) {
                preference = 1 /* ExtensionRunningPreference.Local */;
            }
            else if (isRemotelyUnderDevelopment && !isLocallyUnderDevelopment) {
                preference = 2 /* ExtensionRunningPreference.Remote */;
            }
            extensionHostKinds.set(ext.key, pickExtensionHostKind(ext.identifier, ext.kind, isInstalledLocally, isInstalledRemotely, preference));
        });
        return extensionHostKinds;
    }
    exports.determineExtensionHostKinds = determineExtensionHostKinds;
    function toExtensionWithKind(extensions, getExtensionKind) {
        const result = new Map();
        extensions.forEach((desc) => {
            const ext = new ExtensionWithKind(desc, getExtensionKind(desc));
            result.set(ext.key, ext);
        });
        return result;
    }
    class ExtensionWithKind {
        constructor(desc, kind) {
            this.desc = desc;
            this.kind = kind;
        }
        get key() {
            return extensions_1.ExtensionIdentifier.toKey(this.desc.identifier);
        }
        get isUnderDevelopment() {
            return this.desc.isUnderDevelopment;
        }
    }
    class ExtensionInfo {
        constructor(local, remote) {
            this.local = local;
            this.remote = remote;
        }
        get key() {
            if (this.local) {
                return this.local.key;
            }
            return this.remote.key;
        }
        get identifier() {
            if (this.local) {
                return this.local.desc.identifier;
            }
            return this.remote.desc.identifier;
        }
        get kind() {
            // in case of disagreements between extension kinds, it is always
            // better to pick the local extension because it has a much higher
            // chance of being up-to-date
            if (this.local) {
                return this.local.kind;
            }
            return this.remote.kind;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdEtpbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25Ib3N0S2luZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBa0IsaUJBSWpCO0lBSkQsV0FBa0IsaUJBQWlCO1FBQ2xDLHlFQUFnQixDQUFBO1FBQ2hCLDZFQUFrQixDQUFBO1FBQ2xCLDZEQUFVLENBQUE7SUFDWCxDQUFDLEVBSmlCLGlCQUFpQixpQ0FBakIsaUJBQWlCLFFBSWxDO0lBRUQsU0FBZ0IseUJBQXlCLENBQUMsSUFBOEI7UUFDdkUsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDbkIsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUNkLDJDQUFtQyxDQUFDLENBQUMsT0FBTyxjQUFjLENBQUM7WUFDM0QsNkNBQXFDLENBQUMsQ0FBQyxPQUFPLGdCQUFnQixDQUFDO1lBQy9ELHFDQUE2QixDQUFDLENBQUMsT0FBTyxRQUFRLENBQUM7UUFDaEQsQ0FBQztJQUNGLENBQUM7SUFURCw4REFTQztJQUVELElBQWtCLDBCQUlqQjtJQUpELFdBQWtCLDBCQUEwQjtRQUMzQywyRUFBSSxDQUFBO1FBQ0osNkVBQUssQ0FBQTtRQUNMLCtFQUFNLENBQUE7SUFDUCxDQUFDLEVBSmlCLDBCQUEwQiwwQ0FBMUIsMEJBQTBCLFFBSTNDO0lBRUQsU0FBZ0Isa0NBQWtDLENBQUMsVUFBc0M7UUFDeEYsUUFBUSxVQUFVLEVBQUUsQ0FBQztZQUNwQjtnQkFDQyxPQUFPLE1BQU0sQ0FBQztZQUNmO2dCQUNDLE9BQU8sT0FBTyxDQUFDO1lBQ2hCO2dCQUNDLE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7SUFDRixDQUFD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