/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/snapshot", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatServiceImpl", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/test/common/mockChatVariables", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, snapshot_1, utils_1, range_1, contextkey_1, serviceCollection_1, instantiationServiceMock_1, mockKeybindingService_1, log_1, storage_1, telemetry_1, telemetryUtils_1, workspace_1, viewsService_1, chatAgents_1, chatContributionService_1, chatServiceImpl_1, chatSlashCommands_1, chatVariables_1, mockChatVariables_1, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleTestProvider extends lifecycle_1.Disposable {
        static { this.sessionId = 0; }
        constructor(id) {
            super();
            this.id = id;
            this.displayName = 'Test';
        }
        async prepareSession() {
            return {
                id: SimpleTestProvider.sessionId++,
                responderUsername: 'test',
                requesterUsername: 'test',
            };
        }
        async provideReply(request, progress) {
            return { session: request.session, followups: [] };
        }
    }
    const chatAgentWithUsedContextId = 'ChatProviderWithUsedContext';
    const chatAgentWithUsedContext = {
        id: chatAgentWithUsedContextId,
        metadata: {},
        async provideSlashCommands(token) {
            return [];
        },
        async invoke(request, progress, history, token) {
            progress({
                documents: [
                    {
                        uri: uri_1.URI.file('/test/path/to/file'),
                        version: 3,
                        ranges: [
                            new range_1.Range(1, 1, 2, 2)
                        ]
                    }
                ],
                kind: 'usedContext'
            });
            return {};
        },
    };
    suite('Chat', () => {
        const testDisposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let storageService;
        let instantiationService;
        let chatAgentService;
        setup(async () => {
            instantiationService = testDisposables.add(new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection([chatVariables_1.IChatVariablesService, new mockChatVariables_1.MockChatVariablesService()])));
            instantiationService.stub(storage_1.IStorageService, storageService = testDisposables.add(new workbenchTestServices_1.TestStorageService()));
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(viewsService_1.IViewsService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(chatContributionService_1.IChatContributionService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            instantiationService.stub(chatSlashCommands_1.IChatSlashCommandService, testDisposables.add(instantiationService.createInstance(chatSlashCommands_1.ChatSlashCommandService)));
            chatAgentService = testDisposables.add(instantiationService.createInstance(chatAgents_1.ChatAgentService));
            instantiationService.stub(chatAgents_1.IChatAgentService, chatAgentService);
            const agent = {
                id: 'testAgent',
                metadata: { isDefault: true },
                async invoke(request, progress, history, token) {
                    return {};
                },
            };
            testDisposables.add(chatAgentService.registerAgent(agent));
        });
        test('retrieveSession', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            const provider1 = testDisposables.add(new SimpleTestProvider('provider1'));
            const provider2 = testDisposables.add(new SimpleTestProvider('provider2'));
            testDisposables.add(testService.registerProvider(provider1));
            testDisposables.add(testService.registerProvider(provider2));
            const session1 = testDisposables.add(testService.startSession('provider1', cancellation_1.CancellationToken.None));
            await session1.waitForInitialization();
            session1.addRequest({ parts: [], text: 'request 1' }, { message: 'request 1', variables: {} });
            const session2 = testDisposables.add(testService.startSession('provider2', cancellation_1.CancellationToken.None));
            await session2.waitForInitialization();
            session2.addRequest({ parts: [], text: 'request 2' }, { message: 'request 2', variables: {} });
            storageService.flush();
            const testService2 = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            testDisposables.add(testService2.registerProvider(provider1));
            testDisposables.add(testService2.registerProvider(provider2));
            const retrieved1 = testDisposables.add(testService2.getOrRestoreSession(session1.sessionId));
            await retrieved1.waitForInitialization();
            const retrieved2 = testDisposables.add(testService2.getOrRestoreSession(session2.sessionId));
            await retrieved2.waitForInitialization();
            assert.deepStrictEqual(retrieved1.getRequests()[0]?.message.text, 'request 1');
            assert.deepStrictEqual(retrieved2.getRequests()[0]?.message.text, 'request 2');
        });
        test('Handles failed session startup', async () => {
            function getFailProvider(providerId) {
                return new class {
                    constructor() {
                        this.id = providerId;
                        this.displayName = 'Test';
                        this.lastInitialState = undefined;
                    }
                    prepareSession(initialState) {
                        throw new Error('Failed to start session');
                    }
                    async provideReply(request) {
                        return { session: request.session, followups: [] };
                    }
                };
            }
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            const provider1 = getFailProvider('provider1');
            testDisposables.add(testService.registerProvider(provider1));
            const session1 = testDisposables.add(testService.startSession('provider1', cancellation_1.CancellationToken.None));
            await assert.rejects(() => session1.waitForInitialization());
        });
        test('Can\'t register same provider id twice', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            const id = 'testProvider';
            testDisposables.add(testService.registerProvider({
                id,
                displayName: 'Test',
                prepareSession: function (token) {
                    throw new Error('Function not implemented.');
                }
            }));
            assert.throws(() => {
                testDisposables.add(testService.registerProvider({
                    id,
                    displayName: 'Test',
                    prepareSession: function (token) {
                        throw new Error('Function not implemented.');
                    }
                }));
            }, 'Expected to throw for dupe provider');
        });
        test('sendRequestToProvider', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            assert.strictEqual(model.getRequests().length, 0);
            const response = await testService.sendRequestToProvider(model.sessionId, { message: 'test request' });
            await response?.responseCompletePromise;
            assert.strictEqual(model.getRequests().length, 1);
        });
        test('addCompleteRequest', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            assert.strictEqual(model.getRequests().length, 0);
            await testService.addCompleteRequest(model.sessionId, 'test request', undefined, { message: 'test response' });
            assert.strictEqual(model.getRequests().length, 1);
            assert.ok(model.getRequests()[0].response);
            assert.strictEqual(model.getRequests()[0].response?.response.asString(), 'test response');
        });
        test('can serialize', async () => {
            testDisposables.add(chatAgentService.registerAgent(chatAgentWithUsedContext));
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            assert.strictEqual(model.getRequests().length, 0);
            await (0, snapshot_1.assertSnapshot)(model.toExport());
            const response = await testService.sendRequest(model.sessionId, `@${chatAgentWithUsedContextId} test request`);
            assert(response);
            await response.responseCompletePromise;
            assert.strictEqual(model.getRequests().length, 1);
            await (0, snapshot_1.assertSnapshot)(model.toExport());
        });
        test('can deserialize', async () => {
            let serializedChatData;
            testDisposables.add(chatAgentService.registerAgent(chatAgentWithUsedContext));
            // create the first service, send request, get response, and serialize the state
            { // serapate block to not leak variables in outer scope
                const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
                testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
                const chatModel1 = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
                assert.strictEqual(chatModel1.getRequests().length, 0);
                const response = await testService.sendRequest(chatModel1.sessionId, `@${chatAgentWithUsedContextId} test request`);
                assert(response);
                await response.responseCompletePromise;
                serializedChatData = chatModel1.toJSON();
            }
            // try deserializing the state into a new service
            const testService2 = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            testDisposables.add(testService2.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const chatModel2 = testService2.loadSessionFromContent(serializedChatData);
            assert(chatModel2);
            await (0, snapshot_1.assertSnapshot)(chatModel2.toExport());
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC90ZXN0L2NvbW1vbi9jaGF0U2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBK0JoRyxNQUFNLGtCQUFtQixTQUFRLHNCQUFVO2lCQUMzQixjQUFTLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFJN0IsWUFBcUIsRUFBVTtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQURZLE9BQUUsR0FBRixFQUFFLENBQVE7WUFGdEIsZ0JBQVcsR0FBRyxNQUFNLENBQUM7UUFJOUIsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjO1lBQ25CLE9BQU87Z0JBQ04sRUFBRSxFQUFFLGtCQUFrQixDQUFDLFNBQVMsRUFBRTtnQkFDbEMsaUJBQWlCLEVBQUUsTUFBTTtnQkFDekIsaUJBQWlCLEVBQUUsTUFBTTthQUN6QixDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBcUIsRUFBRSxRQUEyQztZQUNwRixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3BELENBQUM7O0lBR0YsTUFBTSwwQkFBMEIsR0FBRyw2QkFBNkIsQ0FBQztJQUNqRSxNQUFNLHdCQUF3QixHQUFlO1FBQzVDLEVBQUUsRUFBRSwwQkFBMEI7UUFDOUIsUUFBUSxFQUFFLEVBQUU7UUFDWixLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSztZQUMvQixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUs7WUFDN0MsUUFBUSxDQUFDO2dCQUNSLFNBQVMsRUFBRTtvQkFDVjt3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