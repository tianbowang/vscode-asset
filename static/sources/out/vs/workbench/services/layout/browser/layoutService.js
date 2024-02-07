/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/layout/browser/layoutService"], function (require, exports, instantiation_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.panelOpensMaximizedFromString = exports.positionFromString = exports.positionToString = exports.PanelOpensMaximizedOptions = exports.Position = exports.EditorActionsLocation = exports.EditorTabsMode = exports.ActivityBarPosition = exports.LayoutSettings = exports.ZenModeSettings = exports.Parts = exports.IWorkbenchLayoutService = void 0;
    exports.IWorkbenchLayoutService = (0, instantiation_1.refineServiceDecorator)(layoutService_1.ILayoutService);
    var Parts;
    (function (Parts) {
        Parts["TITLEBAR_PART"] = "workbench.parts.titlebar";
        Parts["BANNER_PART"] = "workbench.parts.banner";
        Parts["ACTIVITYBAR_PART"] = "workbench.parts.activitybar";
        Parts["SIDEBAR_PART"] = "workbench.parts.sidebar";
        Parts["PANEL_PART"] = "workbench.parts.panel";
        Parts["AUXILIARYBAR_PART"] = "workbench.parts.auxiliarybar";
        Parts["EDITOR_PART"] = "workbench.parts.editor";
        Parts["STATUSBAR_PART"] = "workbench.parts.statusbar";
    })(Parts || (exports.Parts = Parts = {}));
    var ZenModeSettings;
    (function (ZenModeSettings) {
        ZenModeSettings["SHOW_TABS"] = "zenMode.showTabs";
        ZenModeSettings["HIDE_LINENUMBERS"] = "zenMode.hideLineNumbers";
        ZenModeSettings["HIDE_STATUSBAR"] = "zenMode.hideStatusBar";
        ZenModeSettings["HIDE_ACTIVITYBAR"] = "zenMode.hideActivityBar";
        ZenModeSettings["CENTER_LAYOUT"] = "zenMode.centerLayout";
        ZenModeSettings["FULLSCREEN"] = "zenMode.fullScreen";
        ZenModeSettings["RESTORE"] = "zenMode.restore";
        ZenModeSettings["SILENT_NOTIFICATIONS"] = "zenMode.silentNotifications";
    })(ZenModeSettings || (exports.ZenModeSettings = ZenModeSettings = {}));
    var LayoutSettings;
    (function (LayoutSettings) {
        LayoutSettings["ACTIVITY_BAR_LOCATION"] = "workbench.activityBar.location";
        LayoutSettings["EDITOR_TABS_MODE"] = "workbench.editor.showTabs";
        LayoutSettings["EDITOR_ACTIONS_LOCATION"] = "workbench.editor.editorActionsLocation";
        LayoutSettings["COMMAND_CENTER"] = "window.commandCenter";
        LayoutSettings["LAYOUT_ACTIONS"] = "workbench.layoutControl.enabled";
    })(LayoutSettings || (exports.LayoutSettings = LayoutSettings = {}));
    var ActivityBarPosition;
    (function (ActivityBarPosition) {
        ActivityBarPosition["SIDE"] = "side";
        ActivityBarPosition["TOP"] = "top";
        ActivityBarPosition["HIDDEN"] = "hidden";
    })(ActivityBarPosition || (exports.ActivityBarPosition = ActivityBarPosition = {}));
    var EditorTabsMode;
    (function (EditorTabsMode) {
        EditorTabsMode["MULTIPLE"] = "multiple";
        EditorTabsMode["SINGLE"] = "single";
        EditorTabsMode["NONE"] = "none";
    })(EditorTabsMode || (exports.EditorTabsMode = EditorTabsMode = {}));
    var EditorActionsLocation;
    (function (EditorActionsLocation) {
        EditorActionsLocation["DEFAULT"] = "default";
        EditorActionsLocation["TITLEBAR"] = "titleBar";
        EditorActionsLocation["HIDDEN"] = "hidden";
    })(EditorActionsLocation || (exports.EditorActionsLocation = EditorActionsLocation = {}));
    var Position;
    (function (Position) {
        Position[Position["LEFT"] = 0] = "LEFT";
        Position[Position["RIGHT"] = 1] = "RIGHT";
        Position[Position["BOTTOM"] = 2] = "BOTTOM";
    })(Position || (exports.Position = Position = {}));
    var PanelOpensMaximizedOptions;
    (function (PanelOpensMaximizedOptions) {
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["ALWAYS"] = 0] = "ALWAYS";
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["NEVER"] = 1] = "NEVER";
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["REMEMBER_LAST"] = 2] = "REMEMBER_LAST";
    })(PanelOpensMaximizedOptions || (exports.PanelOpensMaximizedOptions = PanelOpensMaximizedOptions = {}));
    function positionToString(position) {
        switch (position) {
            case 0 /* Position.LEFT */: return 'left';
            case 1 /* Position.RIGHT */: return 'right';
            case 2 /* Position.BOTTOM */: return 'bottom';
            default: return 'bottom';
        }
    }
    exports.positionToString = positionToString;
    const positionsByString = {
        [positionToString(0 /* Position.LEFT */)]: 0 /* Position.LEFT */,
        [positionToString(1 /* Position.RIGHT */)]: 1 /* Position.RIGHT */,
        [positionToString(2 /* Position.BOTTOM */)]: 2 /* Position.BOTTOM */
    };
    function positionFromString(str) {
        return positionsByString[str];
    }
    exports.positionFromString = positionFromString;
    function panelOpensMaximizedSettingToString(setting) {
        switch (setting) {
            case 0 /* PanelOpensMaximizedOptions.ALWAYS */: return 'always';
            case 1 /* PanelOpensMaximizedOptions.NEVER */: return 'never';
            case 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */: return 'preserve';
            default: return 'preserve';
        }
    }
    const panelOpensMaximizedByString = {
        [panelOpensMaximizedSettingToString(0 /* PanelOpensMaximizedOptions.ALWAYS */)]: 0 /* PanelOpensMaximizedOptions.ALWAYS */,
        [panelOpensMaximizedSettingToString(1 /* PanelOpensMaximizedOptions.NEVER */)]: 1 /* PanelOpensMaximizedOptions.NEVER */,
        [panelOpensMaximizedSettingToString(2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */)]: 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */
    };
    function panelOpensMaximizedFromString(str) {
        return panelOpensMaximizedByString[str];
    }
    exports.panelOpensMaximizedFromString = panelOpensMaximizedFromString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xheW91dC9icm93c2VyL2xheW91dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEsdUJBQXVCLEdBQUcsSUFBQSxzQ0FBc0IsRUFBMEMsOEJBQWMsQ0FBQyxDQUFDO0lBRXZILElBQWtCLEtBU2pCO0lBVEQsV0FBa0IsS0FBSztRQUN0QixtREFBMEMsQ0FBQTtRQUMxQywrQ0FBc0MsQ0FBQTtRQUN0Qyx5REFBZ0QsQ0FBQTtRQUNoRCxpREFBd0MsQ0FBQTtRQUN4Qyw2Q0FBb0MsQ0FBQTtRQUNwQywyREFBa0QsQ0FBQTtRQUNsRCwrQ0FBc0MsQ0FBQTtRQUN0QyxxREFBNEMsQ0FBQTtJQUM3QyxDQUFDLEVBVGlCLEtBQUsscUJBQUwsS0FBSyxRQVN0QjtJQUVELElBQWtCLGVBU2pCO0lBVEQsV0FBa0IsZUFBZTtRQUNoQyxpREFBOEIsQ0FBQTtRQUM5QiwrREFBNEMsQ0FBQTtRQUM1QywyREFBd0MsQ0FBQTtRQUN4QywrREFBNEMsQ0FBQTtRQUM1Qyx5REFBc0MsQ0FBQTtRQUN0QyxvREFBaUMsQ0FBQTtRQUNqQyw4Q0FBMkIsQ0FBQTtRQUMzQix1RUFBb0QsQ0FBQTtJQUNyRCxDQUFDLEVBVGlCLGVBQWUsK0JBQWYsZUFBZSxRQVNoQztJQUVELElBQWtCLGNBTWpCO0lBTkQsV0FBa0IsY0FBYztRQUMvQiwwRUFBd0QsQ0FBQTtRQUN4RCxnRUFBOEMsQ0FBQTtRQUM5QyxvRkFBa0UsQ0FBQTtRQUNsRSx5REFBdUMsQ0FBQTtRQUN2QyxvRUFBa0QsQ0FBQTtJQUNuRCxDQUFDLEVBTmlCLGNBQWMsOEJBQWQsY0FBYyxRQU0vQjtJQUVELElBQWtCLG1CQUlqQjtJQUpELFdBQWtCLG1CQUFtQjtRQUNwQyxv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