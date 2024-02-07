/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/utils", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/workbench/contrib/chat/browser/chatVariables", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatRequestParser", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/test/browser/mockChatWidget", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, cancellation_1, utils_1, instantiationServiceMock_1, log_1, storage_1, chatVariables_1, chatAgents_1, chatRequestParser_1, chatVariables_2, mockChatWidget_1, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ChatVariables', function () {
        let service;
        let instantiationService;
        const testDisposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(function () {
            service = new chatVariables_1.ChatVariablesService(new mockChatWidget_1.MockChatWidgetService());
            instantiationService = testDisposables.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(storage_1.IStorageService, testDisposables.add(new workbenchTestServices_1.TestStorageService()));
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(chatVariables_2.IChatVariablesService, service);
            instantiationService.stub(chatAgents_1.IChatAgentService, testDisposables.add(instantiationService.createInstance(chatAgents_1.ChatAgentService)));
        });
        test('ChatVariables - resolveVariables', async function () {
            const v1 = service.registerVariable({ name: 'foo', description: 'bar' }, async () => ([{ level: 'full', value: 'farboo' }]));
            const v2 = service.registerVariable({ name: 'far', description: 'boo' }, async () => ([{ level: 'full', value: 'farboo' }]));
            const parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const resolveVariables = async (text) => {
                const result = await parser.parseChatRequest('1', text);
                return await service.resolveVariables(result, null, cancellation_1.CancellationToken.None);
            };
            {
                const data = await resolveVariables('Hello #foo and#far');
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
                assert.strictEqual(data.message, 'Hello [#foo](values:foo) and#far');
            }
            {
                const data = await resolveVariables('#foo Hello');
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
                assert.strictEqual(data.message, '[#foo](values:foo) Hello');
            }
            {
                const data = await resolveVariables('Hello #foo');
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
            }
            {
                const data = await resolveVariables('Hello #foo?');
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
                assert.strictEqual(data.message, 'Hello [#foo](values:foo)?');
            }
            {
                const data = await resolveVariables('Hello #foo and#far #foo');
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
            }
            {
                const data = await resolveVariables('Hello #foo and #far #foo');
                assert.strictEqual(Object.keys(data.variables).length, 2);
                assert.deepEqual(Object.keys(data.variables).sort(), ['far', 'foo']);
            }
            {
                const data = await resolveVariables('Hello #foo and #far #foo #unknown');
                assert.strictEqual(Object.keys(data.variables).length, 2);
                assert.deepEqual(Object.keys(data.variables).sort(), ['far', 'foo']);
                assert.strictEqual(data.message, 'Hello [#foo](values:foo) and [#far](values:far) [#foo](values:foo) #unknown');
            }
            v1.dispose();
            v2.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZhcmlhYmxlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L3Rlc3QvYnJvd3Nlci9jaGF0VmFyaWFibGVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLEtBQUssQ0FBQyxlQUFlLEVBQUU7UUFFdEIsSUFBSSxPQUE2QixDQUFDO1FBQ2xDLElBQUksb0JBQThDLENBQUM7UUFDbkQsTUFBTSxlQUFlLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRWxFLEtBQUssQ0FBQztZQUNMLE9BQU8sR0FBRyxJQUFJLG9DQUFvQixDQUFDLElBQUksc0NBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLG9CQUFvQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxtREFBd0IsRUFBRSxDQUFDLENBQUM7WUFDM0Usb0JBQW9CLENBQUMsSUFBSSxDQUFDLHlCQUFlLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDBDQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFGLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBVyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7WUFDN0Qsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFpQixFQUFFLElBQUksNENBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQ0FBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQWlCLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNkJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUgsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0NBQWtD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