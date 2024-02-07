/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, platform_1, nls_1, actions_1, configuration_1, notebookCommon_1, assignmentService_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookProfileContribution = exports.NotebookProfileType = void 0;
    var NotebookProfileType;
    (function (NotebookProfileType) {
        NotebookProfileType["default"] = "default";
        NotebookProfileType["jupyter"] = "jupyter";
        NotebookProfileType["colab"] = "colab";
    })(NotebookProfileType || (exports.NotebookProfileType = NotebookProfileType = {}));
    const profiles = {
        [NotebookProfileType.default]: {
            [notebookCommon_1.NotebookSetting.focusIndicator]: 'gutter',
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: 'both',
            [notebookCommon_1.NotebookSetting.globalToolbar]: true,
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: { default: 'right' },
            [notebookCommon_1.NotebookSetting.compactView]: true,
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: 'visible',
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: true,
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: false
        },
        [NotebookProfileType.jupyter]: {
            [notebookCommon_1.NotebookSetting.focusIndicator]: 'gutter',
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: 'notebookToolbar',
            [notebookCommon_1.NotebookSetting.globalToolbar]: true,
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: { default: 'left' },
            [notebookCommon_1.NotebookSetting.compactView]: true,
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: 'visible',
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: false,
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: true
        },
        [NotebookProfileType.colab]: {
            [notebookCommon_1.NotebookSetting.focusIndicator]: 'border',
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: 'betweenCells',
            [notebookCommon_1.NotebookSetting.globalToolbar]: false,
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: { default: 'right' },
            [notebookCommon_1.NotebookSetting.compactView]: false,
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: 'hidden',
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: true,
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: false
        }
    };
    async function applyProfile(configService, profile) {
        const promises = [];
        for (const settingKey in profile) {
            promises.push(configService.updateValue(settingKey, profile[settingKey]));
        }
        await Promise.all(promises);
    }
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.setProfile',
                title: (0, nls_1.localize)('setProfileTitle', "Set Profile")
            });
        }
        async run(accessor, args) {
            if (!isSetProfileArgs(args)) {
                return;
            }
            const configService = accessor.get(configuration_1.IConfigurationService);
            return applyProfile(configService, profiles[args.profile]);
        }
    });
    function isSetProfileArgs(args) {
        const setProfileArgs = args;
        return setProfileArgs.profile === NotebookProfileType.colab ||
            setProfileArgs.profile === NotebookProfileType.default ||
            setProfileArgs.profile === NotebookProfileType.jupyter;
    }
    let NotebookProfileContribution = class NotebookProfileContribution extends lifecycle_1.Disposable {
        constructor(configService, experimentService) {
            super();
            this.experimentService = experimentService;
            if (this.experimentService) {
                this.experimentService.getTreatment('notebookprofile').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    else {
                        // check if settings are already modified
                        const focusIndicator = configService.getValue(notebookCommon_1.NotebookSetting.focusIndicator);
                        const insertToolbarPosition = configService.getValue(notebookCommon_1.NotebookSetting.insertToolbarLocation);
                        const globalToolbar = configService.getValue(notebookCommon_1.NotebookSetting.globalToolbar);
                        // const cellToolbarLocation = configService.getValue(NotebookSetting.cellToolbarLocation);
                        const compactView = configService.getValue(notebookCommon_1.NotebookSetting.compactView);
                        const showCellStatusBar = configService.getValue(notebookCommon_1.NotebookSetting.showCellStatusBar);
                        const consolidatedRunButton = configService.getValue(notebookCommon_1.NotebookSetting.consolidatedRunButton);
                        if (focusIndicator === 'border'
                            && insertToolbarPosition === 'both'
                            && globalToolbar === false
                            // && cellToolbarLocation === undefined
                            && compactView === true
                            && showCellStatusBar === 'visible'
                            && consolidatedRunButton === true) {
                            applyProfile(configService, profiles[treatment] ?? profiles[NotebookProfileType.default]);
                        }
                    }
                });
            }
        }
    };
    exports.NotebookProfileContribution = NotebookProfileContribution;
    exports.NotebookProfileContribution = NotebookProfileContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, assignmentService_1.IWorkbenchAssignmentService)
    ], NotebookProfileContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookProfileContribution, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvcHJvZmlsZS9ub3RlYm9va1Byb2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYWhHLElBQVksbUJBSVg7SUFKRCxXQUFZLG1CQUFtQjtRQUM5QiwwQ0FBbUIsQ0FBQTtRQUNuQiwwQ0FBbUIsQ0FBQTtRQUNuQixzQ0FBZSxDQUFBO0lBQ2hCLENBQUMsRUFKVyxtQkFBbUIsbUNBQW5CLG1CQUFtQixRQUk5QjtJQUVELE1BQU0sUUFBUSxHQUFHO1FBQ2hCLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDOUIsQ0FBQyxnQ0FBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFFBQVE7WUFDMUMsQ0FBQyxnQ0FBZSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsTUFBTTtZQUMvQyxDQUFDLGdDQUFlLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSTtZQUNyQyxDQUFDLGdDQUFlLENBQUMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7WUFDM0QsQ0FBQyxnQ0FBZSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUk7WUFDbkMsQ0FBQyxnQ0FBZSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsU0FBUztZQUM5QyxDQUFDLGdDQUFlLENBQUMscUJBQXFCLENBQUMsRUFBRSxJQUFJO1lBQzdDLENBQUMsZ0NBQWUsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLO1NBQ3hDO1FBQ0QsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5QixDQUFDLGdDQUFlLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUTtZQUMxQyxDQUFDLGdDQUFlLENBQUMscUJBQXFC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