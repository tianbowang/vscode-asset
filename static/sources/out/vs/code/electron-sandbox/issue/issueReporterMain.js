/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/code/electron-sandbox/issue/issueReporterPage", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/ipc/common/mainProcessService", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/ipc/electron-sandbox/services", "vs/platform/issue/common/issue", "vs/platform/native/common/native", "vs/platform/native/common/nativeHostService", "./issueReporterService", "vs/base/browser/window", "vs/base/browser/ui/codicons/codiconStyles", "vs/css!./media/issueReporter"], function (require, exports, dom_1, platform_1, issueReporterPage_1, descriptors_1, extensions_1, instantiationService_1, serviceCollection_1, mainProcessService_1, mainProcessService_2, services_1, issue_1, native_1, nativeHostService_1, issueReporterService_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startup = void 0;
    function startup(configuration) {
        const platformClass = platform_1.isWindows ? 'windows' : platform_1.isLinux ? 'linux' : 'mac';
        window_1.mainWindow.document.body.classList.add(platformClass); // used by our fonts
        (0, dom_1.safeInnerHtml)(window_1.mainWindow.document.body, (0, issueReporterPage_1.default)());
        const instantiationService = initServices(configuration.windowId);
        const issueReporter = instantiationService.createInstance(issueReporterService_1.IssueReporter, configuration);
        issueReporter.render();
        window_1.mainWindow.document.body.style.display = 'block';
        issueReporter.setInitialFocus();
    }
    exports.startup = startup;
    function initServices(windowId) {
        const services = new serviceCollection_1.ServiceCollection();
        const contributedServices = (0, extensions_1.getSingletonServiceDescriptors)();
        for (const [id, descriptor] of contributedServices) {
            services.set(id, descriptor);
        }
        services.set(mainProcessService_1.IMainProcessService, new descriptors_1.SyncDescriptor(mainProcessService_2.ElectronIPCMainProcessService, [windowId]));
        services.set(native_1.INativeHostService, new descriptors_1.SyncDescriptor(nativeHostService_1.NativeHostService, [windowId]));
        return new instantiationService_1.InstantiationService(services, true);
    }
    (0, services_1.registerMainProcessRemoteService)(issue_1.IIssueMainService, 'issue');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVSZXBvcnRlck1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvZWxlY3Ryb24tc2FuZGJveC9pc3N1ZS9pc3N1ZVJlcG9ydGVyTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHLFNBQWdCLE9BQU8sQ0FBQyxhQUErQztRQUN0RSxNQUFNLGFBQWEsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3hFLG1CQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsb0JBQW9CO1FBRTNFLElBQUEsbUJBQWEsRUFBQyxtQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBQSwyQkFBUSxHQUFFLENBQUMsQ0FBQztRQUVwRCxNQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEUsTUFBTSxhQUFhLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG9DQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDeEYsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLG1CQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNqRCxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQVpELDBCQVlDO0lBRUQsU0FBUyxZQUFZLENBQUMsUUFBZ0I7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQ0FBaUIsRUFBRSxDQUFDO1FBRXpDLE1BQU0sbUJBQW1CLEdBQUcsSUFBQSwyQ0FBOEIsR0FBRSxDQUFDO1FBQzdELEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1lBQ3BELFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCxRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixFQUFFLElBQUksNEJBQWMsQ0FBQyxrREFBNkIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFrQixFQUFFLElBQUksNEJBQWMsQ0FBQyxxQ0FBaUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwRixPQUFPLElBQUksMkNBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxJQUFBLDJDQUFnQyxFQUFDLHlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDIn0=