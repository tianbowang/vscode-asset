/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/remote/browser/showCandidate", "vs/workbench/contrib/remote/browser/tunnelFactory", "vs/workbench/contrib/remote/browser/remote", "vs/workbench/contrib/remote/browser/remoteIndicator", "vs/workbench/contrib/remote/browser/remoteExplorer"], function (require, exports, contributions_1, platform_1, showCandidate_1, tunnelFactory_1, remote_1, remoteIndicator_1, remoteExplorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(showCandidate_1.ShowCandidateContribution, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(tunnelFactory_1.TunnelFactoryContribution, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(remote_1.RemoteAgentConnectionStatusListener, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(remoteIndicator_1.RemoteStatusIndicator, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(remoteExplorer_1.ForwardedPortsView, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(remoteExplorer_1.PortRestore, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(remoteExplorer_1.AutomaticPortForwarding, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(remote_1.RemoteMarkers, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcmVtb3RlL2Jyb3dzZXIvcmVtb3RlLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxNQUFNLDhCQUE4QixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuSCw4QkFBOEIsQ0FBQyw2QkFBNkIsQ0FBQyx5Q0FBeUIsK0JBQXVCLENBQUM7SUFDOUcsOEJBQThCLENBQUMsNkJBQTZCLENBQUMseUNBQXlCLCtCQUF1QixDQUFDO0lBQzlHLDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLDRDQUFtQyxvQ0FBNEIsQ0FBQztJQUM3SCw4QkFBOEIsQ0FBQyw2QkFBNkIsQ0FBQyx1Q0FBcUIsa0NBQTBCLENBQUM7SUFDN0csOEJBQThCLENBQUMsNkJBQTZCLENBQUMsbUNBQWtCLGtDQUEwQixDQUFDO0lBQzFHLDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLDRCQUFXLG9DQUE0QixDQUFDO0lBQ3JHLDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLHdDQUF1QixvQ0FBNEIsQ0FBQztJQUNqSCw4QkFBOEIsQ0FBQyw2QkFBNkIsQ0FBQyxzQkFBYSxvQ0FBNEIsQ0FBQyJ9