/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/test/common/mock", "vs/base/test/common/snapshot", "vs/base/test/common/utils", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatRequestParser", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, mock_1, snapshot_1, utils_1, instantiationServiceMock_1, log_1, storage_1, chatAgents_1, chatRequestParser_1, chatSlashCommands_1, chatVariables_1, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ChatRequestParser', () => {
        const testDisposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let parser;
        let varService;
        setup(async () => {
            instantiationService = testDisposables.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(storage_1.IStorageService, testDisposables.add(new workbenchTestServices_1.TestStorageService()));
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(chatAgents_1.IChatAgentService, testDisposables.add(instantiationService.createInstance(chatAgents_1.ChatAgentService)));
            varService = (0, mock_1.mockObject)()({});
            varService.getDynamicVariables.returns([]);
            instantiationService.stub(chatVariables_1.IChatVariablesService, varService);
        });
        test('plain text', async () => {
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', 'test');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('plain text with newlines', async () => {
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = 'line 1\nline 2\r\nline 3';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('slash command', async () => {
            const slashCommandService = (0, mock_1.mockObject)()({});
            slashCommandService.getCommands.returns([{ command: 'fix' }]);
            instantiationService.stub(chatSlashCommands_1.IChatSlashCommandService, slashCommandService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = '/fix this';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('invalid slash command', async () => {
            const slashCommandService = (0, mock_1.mockObject)()({});
            slashCommandService.getCommands.returns([{ command: 'fix' }]);
            instantiationService.stub(chatSlashCommands_1.IChatSlashCommandService, slashCommandService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = '/explain this';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('multiple slash commands', async () => {
            const slashCommandService = (0, mock_1.mockObject)()({});
            slashCommandService.getCommands.returns([{ command: 'fix' }]);
            instantiationService.stub(chatSlashCommands_1.IChatSlashCommandService, slashCommandService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = '/fix /fix';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('variables', async () => {
            varService.hasVariable.returns(true);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = 'What does #selection mean?';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('variable with question mark', async () => {
            varService.hasVariable.returns(true);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = 'What is #selection?';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('invalid variables', async () => {
            varService.hasVariable.returns(false);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const text = 'What does #selection mean?';
            const result = await parser.parseChatRequest('1', text);
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agent with subcommand after text', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '@agent Please do /subCommand thanks');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agents, subCommand', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '@agent /subCommand Please do thanks');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agent with question mark', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '@agent? Are you there');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agent and subcommand with leading whitespace', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '    \r\n\t   @agent \r\n\t   /subCommand Thanks');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agent and subcommand after newline', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '    \n@agent\n/subCommand Thanks');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agent not first', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', 'Hello Mr. @agent');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agents and variables and multiline', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            varService.hasVariable.returns(true);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '@agent /subCommand \nPlease do with #selection\nand #debugConsole');
            await (0, snapshot_1.assertSnapshot)(result);
        });
        test('agents and variables and multiline, part2', async () => {
            const agentsService = (0, mock_1.mockObject)()({});
            agentsService.getAgent.returns({ id: 'agent', metadata: { description: '' }, provideSlashCommands: async () => { return [{ name: 'subCommand', description: '' }]; } });
            instantiationService.stub(chatAgents_1.IChatAgentService, agentsService);
            varService.hasVariable.returns(true);
            parser = instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const result = await parser.parseChatRequest('1', '@agent Please \ndo /subCommand with #selection\nand #debugConsole');
            await (0, snapshot_1.assertSnapshot)(result);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFJlcXVlc3RQYXJzZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC90ZXN0L2NvbW1vbi9jaGF0UmVxdWVzdFBhcnNlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZWhHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDL0IsTUFBTSxlQUFlLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRWxFLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxNQUF5QixDQUFDO1FBRTlCLElBQUksVUFBNkMsQ0FBQztRQUNsRCxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEIsb0JBQW9CLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztZQUMzRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMseUJBQWUsRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFXLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUM3RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQWlCLEVBQUUsSUFBSSw0Q0FBb0IsRUFBRSxDQUFDLENBQUM7WUFDekUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFpQixFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpILFVBQVUsR0FBRyxJQUFBLGlCQUFVLEdBQXlCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckQsVUFBVSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMs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