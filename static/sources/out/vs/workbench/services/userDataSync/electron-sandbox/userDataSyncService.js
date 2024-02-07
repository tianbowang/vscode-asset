/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/ipc/electron-sandbox/services", "vs/platform/userDataSync/common/userDataSyncServiceIpc", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataSyncIpc", "vs/platform/userDataSync/common/userDataSyncAccount"], function (require, exports, userDataSync_1, services_1, userDataSyncServiceIpc_1, userDataSyncMachines_1, userDataSyncIpc_1, userDataSyncAccount_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerSharedProcessRemoteService)(userDataSync_1.IUserDataSyncService, 'userDataSync', { channelClientCtor: userDataSyncServiceIpc_1.UserDataSyncServiceChannelClient });
    (0, services_1.registerSharedProcessRemoteService)(userDataSync_1.IUserDataSyncResourceProviderService, 'IUserDataSyncResourceProviderService');
    (0, services_1.registerSharedProcessRemoteService)(userDataSyncMachines_1.IUserDataSyncMachinesService, 'userDataSyncMachines');
    (0, services_1.registerSharedProcessRemoteService)(userDataSyncAccount_1.IUserDataSyncAccountService, 'userDataSyncAccount', { channelClientCtor: userDataSyncIpc_1.UserDataSyncAccountServiceChannelClient });
    (0, services_1.registerSharedProcessRemoteService)(userDataSync_1.IUserDataSyncStoreManagementService, 'userDataSyncStoreManagement', { channelClientCtor: userDataSyncIpc_1.UserDataSyncStoreManagementServiceChannelClient });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3VzZXJEYXRhU3luYy9lbGVjdHJvbi1zYW5kYm94L3VzZXJEYXRhU3luY1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsSUFBQSw2Q0FBa0MsRUFBQyxtQ0FBb0IsRUFBRSxjQUFjLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5REFBZ0MsRUFBRSxDQUFDLENBQUM7SUFDbEksSUFBQSw2Q0FBa0MsRUFBQyxtREFBb0MsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ2pILElBQUEsNkNBQWtDLEVBQUMsbURBQTRCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUN6RixJQUFBLDZDQUFrQyxFQUFDLGlEQUEyQixFQUFFLHFCQUFxQixFQUFFLEVBQUUsaUJBQWlCLEVBQUUseURBQXVDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZKLElBQUEsNkNBQWtDLEVBQUMsa0RBQW1DLEVBQUUsNkJBQTZCLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxpRUFBK0MsRUFBRSxDQUFDLENBQUMifQ==