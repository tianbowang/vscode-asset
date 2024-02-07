/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/theme"], function (require, exports, codicons_1, event_1, lifecycle_1, instantiation_1, platform, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Themable = exports.registerThemingParticipant = exports.Extensions = exports.getThemeTypeSelector = exports.FolderThemeIcon = exports.FileThemeIcon = exports.themeColorFromId = exports.IThemeService = void 0;
    exports.IThemeService = (0, instantiation_1.createDecorator)('themeService');
    function themeColorFromId(id) {
        return { id };
    }
    exports.themeColorFromId = themeColorFromId;
    exports.FileThemeIcon = codicons_1.Codicon.file;
    exports.FolderThemeIcon = codicons_1.Codicon.folder;
    function getThemeTypeSelector(type) {
        switch (type) {
            case theme_1.ColorScheme.DARK: return 'vs-dark';
            case theme_1.ColorScheme.HIGH_CONTRAST_DARK: return 'hc-black';
            case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT: return 'hc-light';
            default: return 'vs';
        }
    }
    exports.getThemeTypeSelector = getThemeTypeSelector;
    // static theming participant
    exports.Extensions = {
        ThemingContribution: 'base.contributions.theming'
    };
    class ThemingRegistry {
        constructor() {
            this.themingParticipants = [];
            this.themingParticipants = [];
            this.onThemingParticipantAddedEmitter = new event_1.Emitter();
        }
        onColorThemeChange(participant) {
            this.themingParticipants.push(participant);
            this.onThemingParticipantAddedEmitter.fire(participant);
            return (0, lifecycle_1.toDisposable)(() => {
                const idx = this.themingParticipants.indexOf(participant);
                this.themingParticipants.splice(idx, 1);
            });
        }
        get onThemingParticipantAdded() {
            return this.onThemingParticipantAddedEmitter.event;
        }
        getThemingParticipants() {
            return this.themingParticipants;
        }
    }
    const themingRegistry = new ThemingRegistry();
    platform.Registry.add(exports.Extensions.ThemingContribution, themingRegistry);
    function registerThemingParticipant(participant) {
        return themingRegistry.onColorThemeChange(participant);
    }
    exports.registerThemingParticipant = registerThemingParticipant;
    /**
     * Utility base class for all themable components.
     */
    class Themable extends lifecycle_1.Disposable {
        constructor(themeService) {
            super();
            this.themeService = themeService;
            this.theme = themeService.getColorTheme();
            // Hook up to theme changes
            this._register(this.themeService.onDidColorThemeChange(theme => this.onThemeChange(theme)));
        }
        onThemeChange(theme) {
            this.theme = theme;
            this.updateStyles();
        }
        updateStyles() {
            // Subclasses to override
        }
        getColor(id, modify) {
            let color = this.theme.getColor(id);
            if (color && modify) {
                color = modify(color, this.theme);
            }
            return color ? color.toString() : null;
        }
    }
    exports.Themable = Themable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90aGVtZS9jb21tb24vdGhlbWVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFuRixRQUFBLGFBQWEsR0FBRyxJQUFBLCtCQUFlLEVBQWdCLGNBQWMsQ0FBQyxDQUFDO0lBRTVFLFNBQWdCLGdCQUFnQixDQUFDLEVBQW1CO1FBQ25ELE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFGRCw0Q0FFQztJQUVZLFFBQUEsYUFBYSxHQUFHLGtCQUFPLENBQUMsSUFBSSxDQUFDO0lBQzdCLFFBQUEsZUFBZSxHQUFHLGtCQUFPLENBQUMsTUFBTSxDQUFDO0lBRTlDLFNBQWdCLG9CQUFvQixDQUFDLElBQWlCO1FBQ3JELFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDZCxLQUFLLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxTQUFTLENBQUM7WUFDeEMsS0FBSyxtQkFBVyxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxVQUFVLENBQUM7WUFDdkQsS0FBSyxtQkFBVyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxVQUFVLENBQUM7WUFDeEQsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUM7UUFDdEIsQ0FBQztJQUNGLENBQUM7SUFQRCxvREFPQztJQXVGRCw2QkFBNkI7SUFDaEIsUUFBQSxVQUFVLEdBQUc7UUFDekIsbUJBQW1CLEVBQUUsNEJBQTRCO0tBQ2pELENBQUM7SUFjRixNQUFNLGVBQWU7UUFJcEI7WUFIUSx3QkFBbUIsR0FBMEIsRUFBRSxDQUFDO1lBSXZELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLElBQUksZUFBTyxFQUF1QixDQUFDO1FBQzVFLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxXQUFnQztZQUN6RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEQsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFXLHlCQUF5QjtZQUNuQyxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUM7UUFDcEQsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0lBQzlDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFVLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFdkUsU0FBZ0IsMEJBQTBCLENBQUMsV0FBZ0M7UUFDMUUsT0FBTyxlQUFlLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUZELGdFQUVDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLFFBQVMsU0FBUSxzQkFBVTtRQUd2QyxZQUNXLFlBQTJCO1lBRXJDLEtBQUssRUFBRSxDQUFDO1lBRkUsaUJBQVksR0FBWixZQUFZLENBQWU7WUFJckMsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFMUMsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFFUyxhQUFhLENBQUMsS0FBa0I7WUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFbkIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxZQUFZO1lBQ1gseUJBQXlCO1FBQzFCLENBQUM7UUFFUyxRQUFRLENBQUMsRUFBVSxFQUFFLE1BQW9EO1lBQ2xGLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXBDLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNyQixLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN4QyxDQUFDO0tBQ0Q7SUFqQ0QsNEJBaUNDIn0=