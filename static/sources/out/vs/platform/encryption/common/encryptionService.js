/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isGnome = exports.isKwallet = exports.KnownStorageProvider = exports.PasswordStoreCLIOption = exports.IEncryptionMainService = exports.IEncryptionService = void 0;
    exports.IEncryptionService = (0, instantiation_1.createDecorator)('encryptionService');
    exports.IEncryptionMainService = (0, instantiation_1.createDecorator)('encryptionMainService');
    // The values provided to the `password-store` command line switch.
    // Notice that they are not the same as the values returned by
    // `getSelectedStorageBackend` in the `safeStorage` API.
    var PasswordStoreCLIOption;
    (function (PasswordStoreCLIOption) {
        PasswordStoreCLIOption["kwallet"] = "kwallet";
        PasswordStoreCLIOption["kwallet5"] = "kwallet5";
        PasswordStoreCLIOption["gnome"] = "gnome";
        PasswordStoreCLIOption["gnomeKeyring"] = "gnome-keyring";
        PasswordStoreCLIOption["gnomeLibsecret"] = "gnome-libsecret";
        PasswordStoreCLIOption["basic"] = "basic";
    })(PasswordStoreCLIOption || (exports.PasswordStoreCLIOption = PasswordStoreCLIOption = {}));
    // The values returned by `getSelectedStorageBackend` in the `safeStorage` API.
    var KnownStorageProvider;
    (function (KnownStorageProvider) {
        KnownStorageProvider["unknown"] = "unknown";
        KnownStorageProvider["basicText"] = "basic_text";
        // Linux
        KnownStorageProvider["gnomeAny"] = "gnome_any";
        KnownStorageProvider["gnomeLibsecret"] = "gnome_libsecret";
        KnownStorageProvider["gnomeKeyring"] = "gnome_keyring";
        KnownStorageProvider["kwallet"] = "kwallet";
        KnownStorageProvider["kwallet5"] = "kwallet5";
        KnownStorageProvider["kwallet6"] = "kwallet6";
        // The rest of these are not returned by `getSelectedStorageBackend`
        // but these were added for platform completeness.
        // Windows
        KnownStorageProvider["dplib"] = "dpapi";
        // macOS
        KnownStorageProvider["keychainAccess"] = "keychain_access";
    })(KnownStorageProvider || (exports.KnownStorageProvider = KnownStorageProvider = {}));
    function isKwallet(backend) {
        return backend === "kwallet" /* KnownStorageProvider.kwallet */
            || backend === "kwallet5" /* KnownStorageProvider.kwallet5 */
            || backend === "kwallet6" /* KnownStorageProvider.kwallet6 */;
    }
    exports.isKwallet = isKwallet;
    function isGnome(backend) {
        return backend === "gnome_any" /* KnownStorageProvider.gnomeAny */
            || backend === "gnome_libsecret" /* KnownStorageProvider.gnomeLibsecret */
            || backend === "gnome_keyring" /* KnownStorageProvider.gnomeKeyring */;
    }
    exports.isGnome = isGnome;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jcnlwdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2VuY3J5cHRpb24vY29tbW9uL2VuY3J5cHRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUluRixRQUFBLGtCQUFrQixHQUFHLElBQUEsK0JBQWUsRUFBcUIsbUJBQW1CLENBQUMsQ0FBQztJQU05RSxRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsdUJBQXVCLENBQUMsQ0FBQztJQWN2RyxtRUFBbUU7SUFDbkUsOERBQThEO0lBQzlELHdEQUF3RDtJQUN4RCxJQUFrQixzQkFPakI7SUFQRCxXQUFrQixzQkFBc0I7UUFDdkMsNkNBQW1CLENBQUE7UUFDbkIsK0NBQXFCLENBQUE7UUFDckIseUNBQWUsQ0FBQTtRQUNmLHdEQUE4QixDQUFBO1FBQzlCLDREQUFrQyxDQUFBO1FBQ2xDLHlDQUFlLENBQUE7SUFDaEIsQ0FBQyxFQVBpQixzQkFBc0Isc0NBQXRCLHNCQUFzQixRQU92QztJQUVELCtFQUErRTtJQUMvRSxJQUFrQixvQkFvQmpCO0lBcEJELFdBQWtCLG9CQUFvQjtRQUNyQywyQ0FBbUIsQ0FBQTtRQUNuQixnREFBd0IsQ0FBQTtRQUV4QixRQUFRO1FBQ1IsOENBQXNCLENBQUE7UUFDdEIsMERBQWtDLENBQUE7UUFDbEMsc0RBQThCLENBQUE7UUFDOUIsMkNBQW1CLENBQUE7UUFDbkIsNkNBQXFCLENBQUE7UUFDckIsNkNBQXFCLENBQUE7UUFFckIsb0VBQW9FO1FBQ3BFLGtEQUFrRDtRQUVsRCxVQUFVO1FBQ1YsdUNBQWUsQ0FBQTtRQUVmLFFBQVE7UUFDUiwwREFBa0MsQ0FBQTtJQUNuQyxDQUFDLEVBcEJpQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQW9CckM7SUFFRCxTQUFnQixTQUFTLENBQUMsT0FBZTtRQUN4QyxPQUFPLE9BQU8saURBQWlDO2VBQzNDLE9BQU8sbURBQWtDO2VBQ3pDLE9BQU8sbURBQWtDLENBQUM7SUFDL0MsQ0FBQztJQUpELDhCQUlDO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLE9BQWU7UUFDdEMsT0FBTyxPQUFPLG9EQUFrQztlQUM1QyxPQUFPLGdFQUF3QztlQUMvQyxPQUFPLDREQUFzQyxDQUFDO0lBQ25ELENBQUM7SUFKRCwwQkFJQyJ9