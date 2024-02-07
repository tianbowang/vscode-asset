/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor"], function (require, exports, instantiation_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.USE_SPLIT_JSON_SETTING = exports.DEFAULT_SETTINGS_EDITOR_SETTING = exports.FOLDER_SETTINGS_PATH = exports.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = exports.IPreferencesService = exports.validateSettingsEditorOptions = exports.SettingMatchType = exports.SettingValueType = void 0;
    var SettingValueType;
    (function (SettingValueType) {
        SettingValueType["Null"] = "null";
        SettingValueType["Enum"] = "enum";
        SettingValueType["String"] = "string";
        SettingValueType["MultilineString"] = "multiline-string";
        SettingValueType["Integer"] = "integer";
        SettingValueType["Number"] = "number";
        SettingValueType["Boolean"] = "boolean";
        SettingValueType["Array"] = "array";
        SettingValueType["Exclude"] = "exclude";
        SettingValueType["Include"] = "include";
        SettingValueType["Complex"] = "complex";
        SettingValueType["NullableInteger"] = "nullable-integer";
        SettingValueType["NullableNumber"] = "nullable-number";
        SettingValueType["Object"] = "object";
        SettingValueType["BooleanObject"] = "boolean-object";
        SettingValueType["LanguageTag"] = "language-tag";
        SettingValueType["ExtensionToggle"] = "extension-toggle";
    })(SettingValueType || (exports.SettingValueType = SettingValueType = {}));
    /**
     * The ways a setting could match a query,
     * sorted in increasing order of relevance.
     */
    var SettingMatchType;
    (function (SettingMatchType) {
        SettingMatchType[SettingMatchType["None"] = 0] = "None";
        SettingMatchType[SettingMatchType["LanguageTagSettingMatch"] = 1] = "LanguageTagSettingMatch";
        SettingMatchType[SettingMatchType["RemoteMatch"] = 2] = "RemoteMatch";
        SettingMatchType[SettingMatchType["DescriptionOrValueMatch"] = 4] = "DescriptionOrValueMatch";
        SettingMatchType[SettingMatchType["KeyMatch"] = 8] = "KeyMatch";
    })(SettingMatchType || (exports.SettingMatchType = SettingMatchType = {}));
    function validateSettingsEditorOptions(options) {
        return {
            // Inherit provided options
            ...options,
            // Enforce some options for settings specifically
            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
            pinned: true
        };
    }
    exports.validateSettingsEditorOptions = validateSettingsEditorOptions;
    exports.IPreferencesService = (0, instantiation_1.createDecorator)('preferencesService');
    exports.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = 'editor.contrib.defineKeybinding';
    exports.FOLDER_SETTINGS_PATH = '.vscode/settings.json';
    exports.DEFAULT_SETTINGS_EDITOR_SETTING = 'workbench.settings.openDefaultSettings';
    exports.USE_SPLIT_JSON_SETTING = 'workbench.settings.useSplitJSON';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9wcmVmZXJlbmNlcy9jb21tb24vcHJlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxJQUFZLGdCQWtCWDtJQWxCRCxXQUFZLGdCQUFnQjtRQUMzQixpQ0FBYSxDQUFBO1FBQ2IsaUNBQWEsQ0FBQTtRQUNiLHFDQUFpQixDQUFBO1FBQ2pCLHdEQUFvQyxDQUFBO1FBQ3BDLHVDQUFtQixDQUFBO1FBQ25CLHFDQUFpQixDQUFBO1FBQ2pCLHVDQUFtQixDQUFBO1FBQ25CLG1DQUFlLENBQUE7UUFDZix1Q0FBbUIsQ0FBQTtRQUNuQix1Q0FBbUIsQ0FBQTtRQUNuQix1Q0FBbUIsQ0FBQTtRQUNuQix3REFBb0MsQ0FBQTtRQUNwQyxzREFBa0MsQ0FBQTtRQUNsQyxxQ0FBaUIsQ0FBQTtRQUNqQixvREFBZ0MsQ0FBQTtRQUNoQyxnREFBNEIsQ0FBQTtRQUM1Qix3REFBb0MsQ0FBQTtJQUNyQyxDQUFDLEVBbEJXLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBa0IzQjtJQTJGRDs7O09BR0c7SUFDSCxJQUFZLGdCQU1YO0lBTkQsV0FBWSxnQkFBZ0I7UUFDM0IsdURBQVEsQ0FBQTtRQUNSLDZGQUFnQyxDQUFBO1FBQ2hDLHFFQUFvQixDQUFBO1FBQ3BCLDZGQUFnQyxDQUFBO1FBQ2hDLCtEQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFOVyxnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQU0zQjtJQTBFRCxTQUFnQiw2QkFBNkIsQ0FBQyxPQUErQjtRQUM1RSxPQUFPO1lBQ04sMkJBQTJCO1lBQzNCLEdBQUcsT0FBTztZQUVWLGlEQUFpRDtZQUNqRCxRQUFRLEVBQUUsbUNBQTBCLENBQUMsRUFBRTtZQUN2QyxNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7SUFDSCxDQUFDO0lBVEQsc0VBU0M7SUFTWSxRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQXdGakYsUUFBQSxtQ0FBbUMsR0FBRyxpQ0FBaUMsQ0FBQztJQUt4RSxRQUFBLG9CQUFvQixHQUFHLHVCQUF1QixDQUFDO0lBQy9DLFFBQUEsK0JBQStCLEdBQUcsd0NBQXdDLENBQUM7SUFDM0UsUUFBQSxzQkFBc0IsR0FBRyxpQ0FBaUMsQ0FBQyJ9