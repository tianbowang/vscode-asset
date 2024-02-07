/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/ui/tree/dataTree", "vs/base/common/async", "vs/base/parts/contextmenu/electron-sandbox/contextmenu", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/diagnostics/common/diagnostics", "vs/platform/files/common/files", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/native/common/nativeHostService", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/window/electron-sandbox/window", "vs/base/browser/keyboardEvent", "vs/base/browser/window", "vs/css!./media/processExplorer", "vs/base/browser/ui/codicons/codiconStyles"], function (require, exports, nls_1, dom_1, dataTree_1, async_1, contextmenu_1, globals_1, diagnostics_1, files_1, mainProcessService_1, nativeHostService_1, iconsStyleSheet_1, window_1, keyboardEvent_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startup = void 0;
    const DEBUG_FLAGS_PATTERN = /\s--inspect(?:-brk|port)?=(?<port>\d+)?/;
    const DEBUG_PORT_PATTERN = /\s--inspect-port=(?<port>\d+)/;
    class ProcessListDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (isProcessItem(element)) {
                return 'process';
            }
            if (isMachineProcessInformation(element)) {
                return 'machine';
            }
            if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                return 'error';
            }
            if (isProcessInformation(element)) {
                return 'header';
            }
            return '';
        }
    }
    class ProcessTreeDataSource {
        hasChildren(element) {
            if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                return false;
            }
            if (isProcessItem(element)) {
                return !!element.children?.length;
            }
            else {
                return true;
            }
        }
        getChildren(element) {
            if (isProcessItem(element)) {
                return element.children ? element.children : [];
            }
            if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                return [];
            }
            if (isProcessInformation(element)) {
                // If there are multiple process roots, return these, otherwise go directly to the root process
                if (element.processRoots.length > 1) {
                    return element.processRoots;
                }
                else {
                    return [element.processRoots[0].rootProcess];
                }
            }
            if (isMachineProcessInformation(element)) {
                return [element.rootProcess];
            }
            return [element.processes];
        }
    }
    class ProcessHeaderTreeRenderer {
        constructor() {
            this.templateId = 'header';
        }
        renderTemplate(container) {
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            const name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            const CPU = (0, dom_1.append)(row, (0, dom_1.$)('.cpu'));
            const memory = (0, dom_1.append)(row, (0, dom_1.$)('.memory'));
            const PID = (0, dom_1.append)(row, (0, dom_1.$)('.pid'));
            return { name, CPU, memory, PID };
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = (0, nls_1.localize)('name', "Process Name");
            templateData.CPU.textContent = (0, nls_1.localize)('cpu', "CPU (%)");
            templateData.PID.textContent = (0, nls_1.localize)('pid', "PID");
            templateData.memory.textContent = (0, nls_1.localize)('memory', "Memory (MB)");
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    class MachineRenderer {
        constructor() {
            this.templateId = 'machine';
        }
        renderTemplate(container) {
            const data = Object.create(null);
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            data.name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            return data;
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = node.element.name;
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    class ErrorRenderer {
        constructor() {
            this.templateId = 'error';
        }
        renderTemplate(container) {
            const data = Object.create(null);
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            data.name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            return data;
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = node.element.errorMessage;
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    class ProcessRenderer {
        constructor(platform, totalMem, mapPidToName) {
            this.platform = platform;
            this.totalMem = totalMem;
            this.mapPidToName = mapPidToName;
            this.templateId = 'process';
        }
        renderTemplate(container) {
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            const name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            const CPU = (0, dom_1.append)(row, (0, dom_1.$)('.cpu'));
            const memory = (0, dom_1.append)(row, (0, dom_1.$)('.memory'));
            const PID = (0, dom_1.append)(row, (0, dom_1.$)('.pid'));
            return { name, CPU, PID, memory };
        }
        renderElement(node, index, templateData, height) {
            const { element } = node;
            const pid = element.pid.toFixed(0);
            let name = element.name;
            if (this.mapPidToName.has(element.pid)) {
                name = this.mapPidToName.get(element.pid);
            }
            templateData.name.textContent = name;
            templateData.name.title = element.cmd;
            templateData.CPU.textContent = element.load.toFixed(0);
            templateData.PID.textContent = pid;
            templateData.PID.parentElement.id = `pid-${pid}`;
            const memory = this.platform === 'win32' ? element.mem : (this.totalMem * (element.mem / 100));
            templateData.memory.textContent = (memory / files_1.ByteSize.MB).toFixed(0);
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    function isMachineProcessInformation(item) {
        return !!item.name && !!item.rootProcess;
    }
    function isProcessInformation(item) {
        return !!item.processRoots;
    }
    function isProcessItem(item) {
        return !!item.pid;
    }
    class ProcessExplorer {
        constructor(windowId, data) {
            this.data = data;
            this.mapPidToName = new Map();
            const mainProcessService = new mainProcessService_1.ElectronIPCMainProcessService(windowId);
            this.nativeHostService = new nativeHostService_1.NativeHostService(windowId, mainProcessService);
            this.applyStyles(data.styles);
            this.setEventHandlers(data);
            globals_1.ipcRenderer.on('vscode:pidToNameResponse', (event, pidToNames) => {
                this.mapPidToName.clear();
                for (const [pid, name] of pidToNames) {
                    this.mapPidToName.set(pid, name);
                }
            });
            globals_1.ipcRenderer.on('vscode:listProcessesResponse', async (event, processRoots) => {
                processRoots.forEach((info, index) => {
                    if (isProcessItem(info.rootProcess)) {
                        info.rootProcess.name = index === 0 ? `${this.data.applicationName} main` : 'remote agent';
                    }
                });
                if (!this.tree) {
                    await this.createProcessTree(processRoots);
                }
                else {
                    this.tree.setInput({ processes: { processRoots } });
                    this.tree.layout(window_2.mainWindow.innerHeight, window_2.mainWindow.innerWidth);
                }
                this.requestProcessList(0);
            });
            this.lastRequestTime = Date.now();
            globals_1.ipcRenderer.send('vscode:pidToNameRequest');
            globals_1.ipcRenderer.send('vscode:listProcesses');
        }
        setEventHandlers(data) {
            window_2.mainWindow.document.onkeydown = (e) => {
                const cmdOrCtrlKey = data.platform === 'darwin' ? e.metaKey : e.ctrlKey;
                // Cmd/Ctrl + w closes issue window
                if (cmdOrCtrlKey && e.keyCode === 87) {
                    e.stopPropagation();
                    e.preventDefault();
                    globals_1.ipcRenderer.send('vscode:closeProcessExplorer');
                }
                // Cmd/Ctrl + zooms in
                if (cmdOrCtrlKey && e.keyCode === 187) {
                    (0, window_1.zoomIn)(window_2.mainWindow);
                }
                // Cmd/Ctrl - zooms out
                if (cmdOrCtrlKey && e.keyCode === 189) {
                    (0, window_1.zoomOut)(window_2.mainWindow);
                }
            };
        }
        async createProcessTree(processRoots) {
            const container = window_2.mainWindow.document.getElementById('process-list');
            if (!container) {
                return;
            }
            const { totalmem } = await this.nativeHostService.getOSStatistics();
            const renderers = [
                new ProcessRenderer(this.data.platform, totalmem, this.mapPidToName),
                new ProcessHeaderTreeRenderer(),
                new MachineRenderer(),
                new ErrorRenderer()
            ];
            this.tree = new dataTree_1.DataTree('processExplorer', container, new ProcessListDelegate(), renderers, new ProcessTreeDataSource(), {
                identityProvider: {
                    getId: (element) => {
                        if (isProcessItem(element)) {
                            return element.pid.toString();
                        }
                        if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                            return element.hostName;
                        }
                        if (isProcessInformation(element)) {
                            return 'processes';
                        }
                        if (isMachineProcessInformation(element)) {
                            return element.name;
                        }
                        return 'header';
                    }
                }
            });
            this.tree.setInput({ processes: { processRoots } });
            this.tree.layout(window_2.mainWindow.innerHeight, window_2.mainWindow.innerWidth);
            this.tree.onKeyDown(e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 35 /* KeyCode.KeyE */ && event.altKey) {
                    const selectionPids = this.getSelectedPids();
                    void Promise.all(selectionPids.map((pid) => this.nativeHostService.killProcess(pid, 'SIGTERM'))).then(() => this.tree?.refresh());
                }
            });
            this.tree.onContextMenu(e => {
                if (isProcessItem(e.element)) {
                    this.showContextMenu(e.element, true);
                }
            });
            container.style.height = `${window_2.mainWindow.innerHeight}px`;
            window_2.mainWindow.addEventListener('resize', () => {
                container.style.height = `${window_2.mainWindow.innerHeight}px`;
                this.tree?.layout(window_2.mainWindow.innerHeight, window_2.mainWindow.innerWidth);
            });
        }
        isDebuggable(cmd) {
            const matches = DEBUG_FLAGS_PATTERN.exec(cmd);
            return (matches && matches.groups.port !== '0') || cmd.indexOf('node ') >= 0 || cmd.indexOf('node.exe') >= 0;
        }
        attachTo(item) {
            const config = {
                type: 'node',
                request: 'attach',
                name: `process ${item.pid}`
            };
            let matches = DEBUG_FLAGS_PATTERN.exec(item.cmd);
            if (matches) {
                config.port = Number(matches.groups.port);
            }
            else {
                // no port -> try to attach via pid (send SIGUSR1)
                config.processId = String(item.pid);
            }
            // a debug-port=n or inspect-port=n overrides the port
            matches = DEBUG_PORT_PATTERN.exec(item.cmd);
            if (matches) {
                // override port
                config.port = Number(matches.groups.port);
            }
            globals_1.ipcRenderer.send('vscode:workbenchCommand', { id: 'debug.startFromConfig', from: 'processExplorer', args: [config] });
        }
        applyStyles(styles) {
            const styleElement = (0, dom_1.createStyleSheet)();
            const content = [];
            if (styles.listFocusBackground) {
                content.push(`.monaco-list:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { color: ${styles.listHoverForeground}; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`.monaco-list:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            // Scrollbars
            if (styles.scrollbarShadowColor) {
                content.push(`
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${styles.scrollbarShadowColor} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 6px 6px -6px inset;
				}
			`);
            }
            if (styles.scrollbarSliderBackgroundColor) {
                content.push(`
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${styles.scrollbarSliderBackgroundColor};
				}
			`);
            }
            if (styles.scrollbarSliderHoverBackgroundColor) {
                content.push(`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${styles.scrollbarSliderHoverBackgroundColor};
				}
			`);
            }
            if (styles.scrollbarSliderActiveBackgroundColor) {
                content.push(`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${styles.scrollbarSliderActiveBackgroundColor};
				}
			`);
            }
            styleElement.textContent = content.join('\n');
            if (styles.color) {
                window_2.mainWindow.document.body.style.color = styles.color;
            }
        }
        showContextMenu(item, isLocal) {
            const items = [];
            const pid = Number(item.pid);
            if (isLocal) {
                items.push({
                    accelerator: 'Alt+E',
                    label: (0, nls_1.localize)('killProcess', "Kill Process"),
                    click: () => {
                        this.nativeHostService.killProcess(pid, 'SIGTERM');
                    }
                });
                items.push({
                    label: (0, nls_1.localize)('forceKillProcess', "Force Kill Process"),
                    click: () => {
                        this.nativeHostService.killProcess(pid, 'SIGKILL');
                    }
                });
                items.push({
                    type: 'separator'
                });
            }
            items.push({
                label: (0, nls_1.localize)('copy', "Copy"),
                click: () => {
                    // Collect the selected pids
                    const selectionPids = this.getSelectedPids();
                    // If the selection does not contain the right clicked item, copy the right clicked
                    // item only.
                    if (!selectionPids?.includes(pid)) {
                        selectionPids.length = 0;
                        selectionPids.push(pid);
                    }
                    const rows = selectionPids?.map(e => window_2.mainWindow.document.getElementById(`pid-${e}`)).filter(e => !!e);
                    if (rows) {
                        const text = rows.map(e => e.innerText).filter(e => !!e);
                        this.nativeHostService.writeClipboardText(text.join('\n'));
                    }
                }
            });
            items.push({
                label: (0, nls_1.localize)('copyAll', "Copy All"),
                click: () => {
                    const processList = window_2.mainWindow.document.getElementById('process-list');
                    if (processList) {
                        this.nativeHostService.writeClipboardText(processList.innerText);
                    }
                }
            });
            if (item && isLocal && this.isDebuggable(item.cmd)) {
                items.push({
                    type: 'separator'
                });
                items.push({
                    label: (0, nls_1.localize)('debug', "Debug"),
                    click: () => {
                        this.attachTo(item);
                    }
                });
            }
            (0, contextmenu_1.popup)(items);
        }
        requestProcessList(totalWaitTime) {
            setTimeout(() => {
                const nextRequestTime = Date.now();
                const waited = totalWaitTime + nextRequestTime - this.lastRequestTime;
                this.lastRequestTime = nextRequestTime;
                // Wait at least a second between requests.
                if (waited > 1000) {
                    globals_1.ipcRenderer.send('vscode:pidToNameRequest');
                    globals_1.ipcRenderer.send('vscode:listProcesses');
                }
                else {
                    this.requestProcessList(waited);
                }
            }, 200);
        }
        getSelectedPids() {
            return this.tree?.getSelection()?.map(e => {
                if (!e || !('pid' in e)) {
                    return undefined;
                }
                return e.pid;
            }).filter(e => !!e);
        }
    }
    function createCodiconStyleSheet() {
        const codiconStyleSheet = (0, dom_1.createStyleSheet)();
        codiconStyleSheet.id = 'codiconStyles';
        const iconsStyleSheet = (0, iconsStyleSheet_1.getIconsStyleSheet)(undefined);
        function updateAll() {
            codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
        }
        const delayer = new async_1.RunOnceScheduler(updateAll, 0);
        iconsStyleSheet.onDidChange(() => delayer.schedule());
        delayer.schedule();
    }
    function startup(configuration) {
        const platformClass = configuration.data.platform === 'win32' ? 'windows' : configuration.data.platform === 'linux' ? 'linux' : 'mac';
        window_2.mainWindow.document.body.classList.add(platformClass); // used by our fonts
        createCodiconStyleSheet();
        (0, window_1.applyZoom)(configuration.data.zoomLevel, window_2.mainWindow);
        new ProcessExplorer(configuration.windowId, configuration.data);
    }
    exports.startup = startup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc0V4cGxvcmVyTWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvY29kZS9lbGVjdHJvbi1zYW5kYm94L3Byb2Nlc3NFeHBsb3Jlci9wcm9jZXNzRXhwbG9yZXJNYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTBCaEcsTUFBTSxtQkFBbUIsR0FBRyx5Q0FBeUMsQ0FBQztJQUN0RSxNQUFNLGtCQUFrQixHQUFHLCtCQUErQixDQUFDO0lBRTNELE1BQU0sbUJBQW1CO1FBQ3hCLFNBQVMsQ0FBQyxPQUF5RTtZQUNsRixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBOEY7WUFDM0csSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELElBQUksMkJBQTJCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELElBQUksSUFBQSxxQ0FBdUIsRUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxPQUFPLE9BQU8sQ0FBQztZQUNoQixDQUFDO1lBRUQsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxPQUFPLFFBQVEsQ0FBQztZQUNqQixDQUFDO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBQ0Q7SUFZRCxNQUFNLHFCQUFxQjtRQUMxQixXQUFXLENBQUMsT0FBNEc7WUFDdkgsSUFBSSxJQUFBLHFDQUF1QixFQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQ25DLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQTRHO1lBQ3ZILElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2pELENBQUM7WUFFRCxJQUFJLElBQUEscUNBQXVCLEVBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNuQywrRkFBK0Y7Z0JBQy9GLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3JDLE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQztnQkFDN0IsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksMkJBQTJCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQ0Q7SUFFRCxNQUFNLHlCQUF5QjtRQUEvQjtZQUNDLGVBQVUsR0FBVyxRQUFRLENBQUM7UUFzQi9CLENBQUM7UUFwQkEsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUEsWUFBTSxFQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSxHQUFHLElBQUEsWUFBTSxFQUFDLEdBQUcsRUFBRSxJQUFBLE9BQUMsRUFBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUEsWUFBTSxFQUFDLEdBQUcsRUFBRSxJQUFBLE9BQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUEsWUFBTSxFQUFDLEdBQUcsRUFBRSxJQUFBLE9BQUMsRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sR0FBRyxHQUFHLElBQUEsWUFBTSxFQUFDLEdBQUcsRUFBRSxJQUFBLE9BQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRUQsYUFBYSxDQUFDLElBQXlDLEVBQUUsS0FBYSxFQUFFLFlBQXNDLEVBQUUsTUFBMEI7WUFDekksWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2pFLFlBQVksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUEsY0FBUSxFQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMxRCxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFBLGNBQVEsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEQsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXJFLENBQUM7UUFFRCxlQUFlLENBQUMsWUFBaUI7WUFDaEMsZ0JBQWdCO1FBQ2pCLENBQUM7S0FDRDtJQUVELE1BQU0sZUFBZTtRQUFyQjtZQUNDLGVBQVUsR0FBVyxTQUFTLENBQUM7UUFhaEMsQ0FBQztRQVpBLGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sR0FBRyxHQUFHLElBQUEsWUFBTSxFQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBQSxZQUFNLEVBQUMsR0FBRyxFQUFFLElBQUEsT0FBQyxFQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsYUFBYSxDQUFDLElBQWdELEVBQUUsS0FBYSxFQUFFLFlBQXFDLEVBQUUsTUFBMEI7WUFDL0ksWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDbkQsQ0FBQztRQUNELGVBQWUsQ0FBQyxZQUFxQztZQUNwRCxnQkFBZ0I7UUFDakIsQ0FBQztLQUNEO0lBRUQsTUFBTSxhQUFhO1FBQW5CO1lBQ0MsZUFBVSxHQUFXLE9BQU8sQ0FBQztRQWE5QixDQUFDO1FBWkEsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsTUFBTSxHQUFHLEdBQUcsSUFBQSxZQUFNLEVBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFBLFlBQU0sRUFBQyxHQUFHLEVBQUUsSUFBQSxPQUFDLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN6QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDRCxhQUFhLENBQUMsSUFBNkMsRUFBRSxLQUFhLEVBQUUsWUFBcUMsRUFBRSxNQUEwQjtZQUM1SSxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUMzRCxDQUFDO1FBQ0QsZUFBZSxDQUFDLFlBQXFDO1lBQ3BELGdCQUFnQjtRQUNqQixDQUFDO0tBQ0Q7SUFHRCxNQUFNLGVBQWU7UUFDcEIsWUFBb0IsUUFBZ0IsRUFBVSxRQUFnQixFQUFVLFlBQWlDO1lBQXJGLGFBQVEsR0FBUixRQUFRLENBQVE7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQVUsaUJBQVksR0FBWixZQUFZLENBQXFCO1lBRXpHLGVBQVUsR0FBVyxTQUFTLENBQUM7UUFGOEUsQ0FBQztRQUc5RyxjQUFjLENBQUMsU0FBc0I7WUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBQSxZQUFNLEVBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFekMsTUFBTSxJQUFJLEdBQUcsSUFBQSxZQUFNLEVBQUMsR0FBRyxFQUFFLElBQUEsT0FBQyxFQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTSxHQUFHLEdBQUcsSUFBQSxZQUFNLEVBQUMsR0FBRyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBQSxZQUFNLEVBQUMsR0FBRyxFQUFFLElBQUEsT0FBQyxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTSxHQUFHLEdBQUcsSUFBQSxZQUFNLEVBQUMsR0FBRyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFbkMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFDRCxhQUFhLENBQUMsSUFBa0MsRUFBRSxLQUFhLEVBQUUsWUFBc0MsRUFBRSxNQUEwQjtZQUNsSSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBRXpCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5DLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDeEIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUUsQ0FBQztZQUM1QyxDQUFDO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFFdEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO1lBQ25DLFlBQVksQ0FBQyxHQUFHLENBQUMsYUFBYyxDQUFDLEVBQUUsR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBRWxELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0YsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxNQUFNLEdBQUcsZ0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUVELGVBQWUsQ0FBQyxZQUFzQztZQUNyRCxnQkFBZ0I7UUFDakIsQ0FBQztLQUNEO0lBZUQsU0FBUywyQkFBMkIsQ0FBQyxJQUFTO1FBQzdDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUMsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUMsSUFBUztRQUN0QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzVCLENBQUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFTO1FBQy9CLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVELE1BQU0sZUFBZTtRQVNwQixZQUFZLFFBQWdCLEVBQVUsSUFBeUI7WUFBekIsU0FBSSxHQUFKLElBQUksQ0FBcUI7WUFOdkQsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQU9oRCxNQUFNLGtCQUFrQixHQUFHLElBQUksa0RBQTZCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUkscUNBQWlCLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUF1QixDQUFDO1lBRW5HLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU1QixxQkFBVyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLEtBQWMsRUFBRSxVQUE4QixFQUFFLEVBQUU7Z0JBQzdGLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRTFCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxxQkFBVyxDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLEVBQUUsS0FBYyxFQUFFLFlBQXlDLEVBQUUsRUFBRTtnQkFDbEgsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDcEMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7d0JBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO29CQUM1RixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFVLENBQUMsV0FBVyxFQUFFLG1CQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7Z0JBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbEMscUJBQVcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUM1QyxxQkFBVyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxJQUF5QjtZQUNqRCxtQkFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFnQixFQUFFLEVBQUU7Z0JBQ3BELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUV4RSxtQ0FBbUM7Z0JBQ25DLElBQUksWUFBWSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFLENBQUM7b0JBQ3RDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUVuQixxQkFBVyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO2dCQUVELHNCQUFzQjtnQkFDdEIsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDdkMsSUFBQSxlQUFNLEVBQUMsbUJBQVUsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO2dCQUVELHVCQUF1QjtnQkFDdkIsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDdkMsSUFBQSxnQkFBTyxFQUFDLG1CQUFVLENBQUMsQ0FBQztnQkFDckIsQ0FBQztZQUNGLENBQUMsQ0FBQztRQUNILENBQUM7UUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBeUM7WUFDeEUsTUFBTSxTQUFTLEdBQUcsbUJBQVUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDaEIsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFcEUsTUFBTSxTQUFTLEdBQUc7Z0JBQ2pCLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNwRSxJQUFJLHlCQUF5QixFQUFFO2dCQUMvQixJQUFJLGVBQWUsRUFBRTtnQkFDckIsSUFBSSxhQUFhLEVBQUU7YUFDbkIsQ0FBQztZQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxtQkFBUSxDQUFDLGlCQUFpQixFQUN6QyxTQUFTLEVBQ1QsSUFBSSxtQkFBbUIsRUFBRSxFQUN6QixTQUFTLEVBQ1QsSUFBSSxxQkFBcUIsRUFBRSxFQUMzQjtnQkFDQyxnQkFBZ0IsRUFBRTtvQkFDakIsS0FBSyxFQUFFLENBQUMsT0FBNEcsRUFBRSxFQUFFO3dCQUN2SCxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDOzRCQUM1QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQy9CLENBQUM7d0JBRUQsSUFBSSxJQUFBLHFDQUF1QixFQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7NEJBQ3RDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQzt3QkFDekIsQ0FBQzt3QkFFRCxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7NEJBQ25DLE9BQU8sV0FBVyxDQUFDO3dCQUNwQixDQUFDO3dCQUVELElBQUksMkJBQTJCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzs0QkFDMUMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDO3dCQUNyQixDQUFDO3dCQUVELE9BQU8sUUFBUSxDQUFDO29CQUNqQixDQUFDO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQVUsQ0FBQyxXQUFXLEVBQUUsbUJBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxLQUFLLENBQUMsT0FBTywwQkFBaUIsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3BELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDN0MsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNuSSxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDM0IsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxtQkFBVSxDQUFDLFdBQVcsSUFBSSxDQUFDO1lBRXZELG1CQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxtQkFBVSxDQUFDLFdBQVcsSUFBSSxDQUFDO2dCQUN2RCxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxtQkFBVSxDQUFDLFdBQVcsRUFBRSxtQkFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLFlBQVksQ0FBQyxHQUFXO1lBQy9CLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFPLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9HLENBQUM7UUFFTyxRQUFRLENBQUMsSUFBaUI7WUFDakMsTUFBTSxNQUFNLEdBQVE7Z0JBQ25CLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixJQUFJLEVBQUUsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFO2FBQzNCLENBQUM7WUFFRixJQUFJLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1Asa0RBQWtEO2dCQUNsRCxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsQ0FBQztZQUVELHNEQUFzRDtZQUN0RCxPQUFPLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QyxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLGdCQUFnQjtnQkFDaEIsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRUQscUJBQVcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2SCxDQUFDO1FBRU8sV0FBVyxDQUFDLE1BQTZCO1lBQ2hELE1BQU0sWUFBWSxHQUFHLElBQUEsc0JBQWdCLEdBQUUsQ0FBQztZQUN4QyxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFFN0IsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxtRUFBbUUsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQztnQkFDakgsT0FBTyxDQUFDLElBQUksQ0FBQyx5RUFBeUUsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQztZQUN4SCxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyx3REFBd0QsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQztZQUN2RyxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvRUFBb0UsTUFBTSxDQUFDLDZCQUE2QixLQUFLLENBQUMsQ0FBQztnQkFDNUgsT0FBTyxDQUFDLElBQUksQ0FBQywwRUFBMEUsTUFBTSxDQUFDLDZCQUE2QixLQUFLLENBQUMsQ0FBQztZQUNuSSxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyx5REFBeUQsTUFBTSxDQUFDLDZCQUE2QixLQUFLLENBQUMsQ0FBQztZQUNsSCxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQywyRUFBMkUsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQztZQUMxSCxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxnRUFBZ0UsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQztZQUMvRyxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxvRUFBb0UsTUFBTSxDQUFDLGdCQUFnQiwyQkFBMkIsQ0FBQyxDQUFDO1lBQ3RJLENBQUM7WUFFRCxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxNQUFNLENBQUMsZ0JBQWdCLDJCQUEyQixDQUFDLENBQUM7WUFDbEgsQ0FBQztZQUVELGFBQWE7WUFDYixJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDOzttQkFFRyxNQUFNLENBQUMsb0JBQW9COzs7O21CQUkzQixNQUFNLENBQUMsb0JBQW9COzs7O21CQUkzQixNQUFNLENBQUMsb0JBQW9COztJQUUxQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsOEJBQThCLEVBQUUsQ0FBQztnQkFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQzs7bUJBRUcsTUFBTSxDQUFDLDhCQUE4Qjs7SUFFcEQsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELElBQUksTUFBTSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7Z0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUM7O21CQUVHLE1BQU0sQ0FBQyxtQ0FBbUM7O0lBRXpELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxJQUFJLE1BQU0sQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDO2dCQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDOzttQkFFRyxNQUFNLENBQUMsb0NBQW9DOztJQUUxRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsWUFBWSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNsQixtQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3JELENBQUM7UUFDRixDQUFDO1FBRU8sZUFBZSxDQUFDLElBQWlCLEVBQUUsT0FBZ0I7WUFDMUQsTUFBTSxLQUFLLEdBQXVCLEVBQUUsQ0FBQztZQUNyQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTdCLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDVixXQUFXLEVBQUUsT0FBTztvQkFDcEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxjQUFjLENBQUM7b0JBQzlDLEtBQUssRUFBRSxHQUFHLEVBQUU7d0JBQ1gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ3BELENBQUM7aUJBQ0QsQ0FBQyxDQUFDO2dCQUVILEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ1YsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDO29CQUN6RCxLQUFLLEVBQUUsR0FBRyxFQUFFO3dCQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNwRCxDQUFDO2lCQUNELENBQUMsQ0FBQztnQkFFSCxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNWLElBQUksRUFBRSxXQUFXO2lCQUNqQixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDVixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztnQkFDL0IsS0FBSyxFQUFFLEdBQUcsRUFBRTtvQkFDWCw0QkFBNEI7b0JBQzVCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDN0MsbUZBQW1GO29CQUNuRixhQUFhO29CQUNiLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ25DLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO3dCQUN6QixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6QixDQUFDO29CQUNELE1BQU0sSUFBSSxHQUFHLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxtQkFBVSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBa0IsQ0FBQztvQkFDdkgsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDVixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQWEsQ0FBQzt3QkFDckUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDNUQsQ0FBQztnQkFDRixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDVixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztnQkFDdEMsS0FBSyxFQUFFLEdBQUcsRUFBRTtvQkFDWCxNQUFNLFdBQVcsR0FBRyxtQkFBVSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3ZFLElBQUksV0FBVyxFQUFFLENBQUM7d0JBQ2pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2xFLENBQUM7Z0JBQ0YsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNwRCxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNWLElBQUksRUFBRSxXQUFXO2lCQUNqQixDQUFDLENBQUM7Z0JBRUgsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDVixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztvQkFDakMsS0FBSyxFQUFFLEdBQUcsRUFBRTt3QkFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNyQixDQUFDO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxJQUFBLG1CQUFLLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDO1FBRU8sa0JBQWtCLENBQUMsYUFBcUI7WUFDL0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25DLE1BQU0sTUFBTSxHQUFHLGFBQWEsR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7Z0JBRXZDLDJDQUEyQztnQkFDM0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUM7b0JBQ25CLHFCQUFXLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7b0JBQzVDLHFCQUFXLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQzFDLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDRixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDO1FBRU8sZUFBZTtZQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDekIsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO1FBQ2pDLENBQUM7S0FDRDtJQUVELFNBQVMsdUJBQXVCO1FBQy9CLE1BQU0saUJBQWlCLEdBQUcsSUFBQSxzQkFBZ0IsR0FBRSxDQUFDO1FBQzdDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxlQUFlLENBQUM7UUFFdkMsTUFBTSxlQUFlLEdBQUcsSUFBQSxvQ0FBa0IsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxTQUFTLFNBQVM7WUFDakIsaUJBQWlCLENBQUMsV0FBVyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkQsZUFBZSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN0RCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUVELFNBQWdCLE9BQU8sQ0FBQyxhQUFpRDtRQUN4RSxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0SSxtQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLG9CQUFvQjtRQUMzRSx1QkFBdUIsRUFBRSxDQUFDO1FBQzFCLElBQUEsa0JBQVMsRUFBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQkFBVSxDQUFDLENBQUM7UUFFcEQsSUFBSSxlQUFlLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQVBELDBCQU9DIn0=