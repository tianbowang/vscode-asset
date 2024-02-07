/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/amdX", "vs/base/common/platform", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextMenuService", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminal", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, assert, amdX_1, platform_1, utils_1, configuration_1, testConfigurationService_1, contextkey_1, contextMenuService_1, contextView_1, instantiationServiceMock_1, mockKeybindingService_1, layoutService_1, log_1, terminalCapabilityStore_1, terminal_1, themeService_1, testThemeService_1, terminalConfigHelper_1, terminalTestHelpers_1, xtermTerminal_1, bufferContentTracker_1, lifecycle_1, workbenchTestServices_1, workbenchTestServices_2, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const defaultTerminalConfig = {
        fontFamily: 'monospace',
        fontWeight: 'normal',
        fontWeightBold: 'normal',
        gpuAcceleration: 'off',
        scrollback: 1000,
        fastScrollSensitivity: 2,
        mouseWheelScrollSensitivity: 1,
        unicodeVersion: '6'
    };
    suite('Buffer Content Tracker', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let configurationService;
        let themeService;
        let xterm;
        let capabilities;
        let configHelper;
        let bufferTracker;
        const prompt = 'vscode-git:(prompt/more-tests)';
        const promptPlusData = 'vscode-git:(prompt/more-tests) ' + 'some data';
        setup(async () => {
            configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: defaultTerminalConfig } });
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            themeService = new testThemeService_1.TestThemeService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(themeService_1.IThemeService, themeService);
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            instantiationService.stub(log_1.ILoggerService, store.add(new workbenchTestServices_2.TestLoggerService()));
            instantiationService.stub(contextView_1.IContextMenuService, store.add(instantiationService.createInstance(contextMenuService_1.ContextMenuService)));
            instantiationService.stub(lifecycle_1.ILifecycleService, store.add(new workbenchTestServices_1.TestLifecycleService()));
            instantiationService.stub(contextkey_1.IContextKeyService, store.add(new mockKeybindingService_1.MockContextKeyService()));
            instantiationService.stub(audioCueService_1.IAudioCueService, { playAudioCue: async () => { }, isEnabled(cue) { return false; } });
            instantiationService.stub(layoutService_1.ILayoutService, new workbenchTestServices_1.TestLayoutService());
            configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper));
            capabilities = store.add(new terminalCapabilityStore_1.TerminalCapabilityStore());
            if (!platform_1.isWindows) {
                capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
            }
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('@xterm/xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(instantiationService.createInstance(xtermTerminal_1.XtermTerminal, TerminalCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, capabilities, '', true));
            const container = document.createElement('div');
            xterm.raw.open(container);
            configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: { tabs: { separator: ' - ', title: '${cwd}', description: '${cwd}' } } } });
            bufferTracker = store.add(instantiationService.createInstance(bufferContentTracker_1.BufferContentTracker, xterm));
        });
        test('should not clear the prompt line', async () => {
            assert.strictEqual(bufferTracker.lines.length, 0);
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, prompt);
            xterm.clearBuffer();
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
        });
        test('repeated updates should not change the content', async () => {
            assert.strictEqual(bufferTracker.lines.length, 0);
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, prompt);
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
        });
        test('should add lines in the viewport and scrollback', async () => {
            await writeAndAssertBufferState(promptPlusData, 38, xterm.raw, bufferTracker);
        });
        test('should add lines in the viewport and full scrollback', async () => {
            await writeAndAssertBufferState(promptPlusData, 1030, xterm.raw, bufferTracker);
        });
        test('should refresh viewport', async () => {
            await writeAndAssertBufferState(promptPlusData, 6, xterm.raw, bufferTracker);
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, '\x1b[3Ainserteddata');
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [promptPlusData, promptPlusData, `${promptPlusData}inserteddata`, promptPlusData, promptPlusData, promptPlusData]);
        });
        test('should refresh viewport with full scrollback', async () => {
            const content = `${prompt}\r\n`.repeat(1030).trimEnd();
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, content);
            bufferTracker.update();
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, '\x1b[4Ainsertion');
            bufferTracker.update();
            const expected = content.split('\r\n');
            expected[1025] = `${prompt}insertion`;
            assert.deepStrictEqual(bufferTracker.lines[1025], `${prompt}insertion`);
        });
        test('should cap the size of the cached lines, removing old lines in favor of new lines', async () => {
            const content = `${prompt}\r\n`.repeat(1036).trimEnd();
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, content);
            bufferTracker.update();
            const expected = content.split('\r\n');
            // delete the 6 lines that should be trimmed
            for (let i = 0; i < 6; i++) {
                expected.pop();
            }
            // insert a new character
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, '\x1b[2Ainsertion');
            bufferTracker.update();
            expected[1027] = `${prompt}insertion`;
            assert.strictEqual(bufferTracker.lines.length, expected.length);
            assert.deepStrictEqual(bufferTracker.lines, expected);
        });
    });
    async function writeAndAssertBufferState(data, rows, terminal, bufferTracker) {
        const content = `${data}\r\n`.repeat(rows).trimEnd();
        await (0, terminalTestHelpers_1.writeP)(terminal, content);
        bufferTracker.update();
        assert.strictEqual(bufferTracker.lines.length, rows);
        assert.deepStrictEqual(bufferTracker.lines, content.split('\r\n'));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyQ29udGVudFRyYWNrZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2FjY2Vzc2liaWxpdHkvdGVzdC9icm93c2VyL2J1ZmZlckNvbnRlbnRUcmFja2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUErQmhHLE1BQU0scUJBQXFCLEdBQW9DO1FBQzlELFVBQVUsRUFBRSxXQUFXO1FBQ3ZCLFVBQVUsRUFBRSxRQUFRO1FBQ3BCLGNBQWMsRUFBRSxRQUFRO1FBQ3hCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLHFCQUFxQixFQUFFLENBQUM7UUFDeEIsMkJBQTJCLEVBQUUsQ0FBQztRQUM5QixjQUFjLEVBQUUsR0FBRztLQUNuQixDQUFDO0lBRUYsS0FBSyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFeEQsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksWUFBOEIsQ0FBQztRQUNuQyxJQUFJLEtBQW9CLENBQUM7UUFDekIsSUFBSSxZQUFxQyxDQUFDO1FBQzFDLElBQUksWUFBa0MsQ0FBQztRQUN2QyxJQUFJLGFBQW1DLENBQUM7UUFDeEMsTUFBTSxNQUFNLEdBQUcsZ0NBQWdDLENBQUM7UUFDaEQsTUFBTSxjQUFjLEdBQUcsaUNBQWlDLEdBQUcsV0FBVyxDQUFDO1FBRXZFLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pHLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxtREFBd0IsRUFBRSxDQUFDLENBQUM7WUFDakUsWUFBWSxHQUFHLElBQUksbUNBQWdCLEVBQUUsQ0FBQztZQUN0QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUNBQXFCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNEJBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN2RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQW1CLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUNyRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsb0JBQWMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUkseUNBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlDQUFtQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVDQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ILG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksNENBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLCtCQUFrQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSw2Q0FBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsa0NBQWdCLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLEdBQVksSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBUyxDQUFDLENBQUM7WUFFakksb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFjLEVBQUUsSUFBSSx5Q0FBaUIsRUFBRSxDQUFDLENBQUM7WUFDbkUsWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJDQUFvQixDQUFDLENBQUMsQ0FBQztZQUNwRixZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlEQUF1QixFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsb0JBQVMsRUFBRSxDQUFDO2dCQUNoQixZQUFZLENBQUMsR0FBRywrQ0FBdUMsSUFBSyxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUNELE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBTSxJQUFBLDBCQUFtQixFQUFnQyxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDekgsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZCQUFhLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNLLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUIsb0JBQW9CLEdBQUcsSUFBSSxtREFBd0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxSixhQUFhLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkNBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sSUFBQSw0QkFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDaEMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QixNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2pFLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RCxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RCxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxpREFBaUQsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNsRSxNQUFNLHlCQUF5QixDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxzREFBc0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN2RSxNQUFNLHlCQUF5QixDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMxQyxNQUFNLHlCQUF5QixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM3RSxNQUFNLElBQUEsNEJBQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDL0MsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxjQUFjLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDaEssQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsOENBQThDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDL0QsTUFBTSxPQUFPLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkQsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sV0FBVyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sV0FBVyxDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsbUZBQW1GLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEcsTUFBTSxPQUFPLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkQsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2Qyw0Q0FBNEM7WUFDNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM1QixRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDaEIsQ0FBQztZQUNELHlCQUF5QjtZQUN6QixNQUFNLElBQUEsNEJBQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDNUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sV0FBVyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxVQUFVLHlCQUF5QixDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsUUFBa0IsRUFBRSxhQUFtQztRQUMzSCxNQUFNLE9BQU8sR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyRCxNQUFNLElBQUEsNEJBQU0sRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDIn0=