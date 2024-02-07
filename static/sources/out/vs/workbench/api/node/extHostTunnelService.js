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
define(["require", "exports", "child_process", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/log/common/log", "vs/platform/remote/common/managedSocket", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/sign/common/sign", "vs/platform/tunnel/common/tunnel", "vs/platform/tunnel/node/tunnelService", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, child_process_1, buffer_1, event_1, lifecycle_1, numbers_1, platform_1, resources, uri_1, pfs, log_1, managedSocket_1, remoteAuthorityResolver_1, sign_1, tunnel_1, tunnelService_1, extHostInitDataService_1, extHostRpcService_1, extHostTunnelService_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeExtHostTunnelService = exports.tryFindRootPorts = exports.findPorts = exports.getRootProcesses = exports.loadConnectionTable = exports.parseIpAddress = exports.loadListeningPorts = exports.getSockets = void 0;
    function getSockets(stdout) {
        const lines = stdout.trim().split('\n');
        const mapped = [];
        lines.forEach(line => {
            const match = /\/proc\/(\d+)\/fd\/\d+ -> socket:\[(\d+)\]/.exec(line);
            if (match && match.length >= 3) {
                mapped.push({
                    pid: parseInt(match[1], 10),
                    socket: parseInt(match[2], 10)
                });
            }
        });
        const socketMap = mapped.reduce((m, socket) => {
            m[socket.socket] = socket;
            return m;
        }, {});
        return socketMap;
    }
    exports.getSockets = getSockets;
    function loadListeningPorts(...stdouts) {
        const table = [].concat(...stdouts.map(loadConnectionTable));
        return [
            ...new Map(table.filter(row => row.st === '0A')
                .map(row => {
                const address = row.local_address.split(':');
                return {
                    socket: parseInt(row.inode, 10),
                    ip: parseIpAddress(address[0]),
                    port: parseInt(address[1], 16)
                };
            }).map(port => [port.ip + ':' + port.port, port])).values()
        ];
    }
    exports.loadListeningPorts = loadListeningPorts;
    function parseIpAddress(hex) {
        let result = '';
        if (hex.length === 8) {
            for (let i = hex.length - 2; i >= 0; i -= 2) {
                result += parseInt(hex.substr(i, 2), 16);
                if (i !== 0) {
                    result += '.';
                }
            }
        }
        else {
            // Nice explanation of host format in tcp6 file: https://serverfault.com/questions/592574/why-does-proc-net-tcp6-represents-1-as-1000
            for (let i = 0; i < hex.length; i += 8) {
                const word = hex.substring(i, i + 8);
                let subWord = '';
                for (let j = 8; j >= 2; j -= 2) {
                    subWord += word.substring(j - 2, j);
                    if ((j === 6) || (j === 2)) {
                        // Trim leading zeros
                        subWord = parseInt(subWord, 16).toString(16);
                        result += `${subWord}`;
                        subWord = '';
                        if (i + j !== hex.length - 6) {
                            result += ':';
                        }
                    }
                }
            }
        }
        return result;
    }
    exports.parseIpAddress = parseIpAddress;
    function loadConnectionTable(stdout) {
        const lines = stdout.trim().split('\n');
        const names = lines.shift().trim().split(/\s+/)
            .filter(name => name !== 'rx_queue' && name !== 'tm->when');
        const table = lines.map(line => line.trim().split(/\s+/).reduce((obj, value, i) => {
            obj[names[i] || i] = value;
            return obj;
        }, {}));
        return table;
    }
    exports.loadConnectionTable = loadConnectionTable;
    function knownExcludeCmdline(command) {
        return !!command.match(/.*\.vscode-server-[a-zA-Z]+\/bin.*/)
            || (command.indexOf('out/server-main.js') !== -1)
            || (command.indexOf('_productName=VSCode') !== -1);
    }
    function getRootProcesses(stdout) {
        const lines = stdout.trim().split('\n');
        const mapped = [];
        lines.forEach(line => {
            const match = /^\d+\s+\D+\s+root\s+(\d+)\s+(\d+).+\d+\:\d+\:\d+\s+(.+)$/.exec(line);
            if (match && match.length >= 4) {
                mapped.push({
                    pid: parseInt(match[1], 10),
                    ppid: parseInt(match[2]),
                    cmd: match[3]
                });
            }
        });
        return mapped;
    }
    exports.getRootProcesses = getRootProcesses;
    async function findPorts(connections, socketMap, processes) {
        const processMap = processes.reduce((m, process) => {
            m[process.pid] = process;
            return m;
        }, {});
        const ports = [];
        connections.forEach(({ socket, ip, port }) => {
            const pid = socketMap[socket] ? socketMap[socket].pid : undefined;
            const command = pid ? processMap[pid]?.cmd : undefined;
            if (pid && command && !knownExcludeCmdline(command)) {
                ports.push({ host: ip, port, detail: command, pid });
            }
        });
        return ports;
    }
    exports.findPorts = findPorts;
    function tryFindRootPorts(connections, rootProcessesStdout, previousPorts) {
        const ports = new Map();
        const rootProcesses = getRootProcesses(rootProcessesStdout);
        for (const connection of connections) {
            const previousPort = previousPorts.get(connection.port);
            if (previousPort) {
                ports.set(connection.port, previousPort);
                continue;
            }
            const rootProcessMatch = rootProcesses.find((value) => value.cmd.includes(`${connection.port}`));
            if (rootProcessMatch) {
                let bestMatch = rootProcessMatch;
                // There are often several processes that "look" like they could match the port.
                // The one we want is usually the child of the other. Find the most child process.
                let mostChild;
                do {
                    mostChild = rootProcesses.find(value => value.ppid === bestMatch.pid);
                    if (mostChild) {
                        bestMatch = mostChild;
                    }
                } while (mostChild);
                ports.set(connection.port, { host: connection.ip, port: connection.port, pid: bestMatch.pid, detail: bestMatch.cmd, ppid: bestMatch.ppid });
            }
            else {
                ports.set(connection.port, { host: connection.ip, port: connection.port, ppid: Number.MAX_VALUE });
            }
        }
        return ports;
    }
    exports.tryFindRootPorts = tryFindRootPorts;
    let NodeExtHostTunnelService = class NodeExtHostTunnelService extends extHostTunnelService_1.ExtHostTunnelService {
        constructor(extHostRpc, initData, logService, signService) {
            super(extHostRpc, initData, logService);
            this.initData = initData;
            this.signService = signService;
            this._initialCandidates = undefined;
            this._foundRootPorts = new Map();
            this._candidateFindingEnabled = false;
            if (platform_1.isLinux && initData.remote.isRemote && initData.remote.authority) {
                this._proxy.$setRemoteTunnelService(process.pid);
                this.setInitialCandidates();
            }
        }
        async $registerCandidateFinder(enable) {
            if (enable && this._candidateFindingEnabled) {
                // already enabled
                return;
            }
            this._candidateFindingEnabled = enable;
            let oldPorts = undefined;
            // If we already have found initial candidates send those immediately.
            if (this._initialCandidates) {
                oldPorts = this._initialCandidates;
                await this._proxy.$onFoundNewCandidates(this._initialCandidates);
            }
            // Regularly scan to see if the candidate ports have changed.
            const movingAverage = new numbers_1.MovingAverage();
            let scanCount = 0;
            while (this._candidateFindingEnabled) {
                const startTime = new Date().getTime();
                const newPorts = (await this.findCandidatePorts()).filter(candidate => ((0, tunnel_1.isLocalhost)(candidate.host) || (0, tunnel_1.isAllInterfaces)(candidate.host)));
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) found candidate ports ${newPorts.map(port => port.port).join(', ')}`);
                const timeTaken = new Date().getTime() - startTime;
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) candidate port scan took ${timeTaken} ms.`);
                // Do not count the first few scans towards the moving average as they are likely to be slower.
                if (scanCount++ > 3) {
                    movingAverage.update(timeTaken);
                }
                if (!oldPorts || (JSON.stringify(oldPorts) !== JSON.stringify(newPorts))) {
                    oldPorts = newPorts;
                    await this._proxy.$onFoundNewCandidates(oldPorts);
                }
                const delay = this.calculateDelay(movingAverage.value);
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) next candidate port scan in ${delay} ms.`);
                await (new Promise(resolve => setTimeout(() => resolve(), delay)));
            }
        }
        calculateDelay(movingAverage) {
            // Some local testing indicated that the moving average might be between 50-100 ms.
            return Math.max(movingAverage * 20, 2000);
        }
        async setInitialCandidates() {
            this._initialCandidates = await this.findCandidatePorts();
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) Initial candidates found: ${this._initialCandidates.map(c => c.port).join(', ')}`);
        }
        async findCandidatePorts() {
            let tcp = '';
            let tcp6 = '';
            try {
                tcp = await pfs.Promises.readFile('/proc/net/tcp', 'utf8');
                tcp6 = await pfs.Promises.readFile('/proc/net/tcp6', 'utf8');
            }
            catch (e) {
                // File reading error. No additional handling needed.
            }
            const connections = loadListeningPorts(tcp, tcp6);
            const procSockets = await (new Promise(resolve => {
                (0, child_process_1.exec)('ls -l /proc/[0-9]*/fd/[0-9]* | grep socket:', (error, stdout, stderr) => {
                    resolve(stdout);
                });
            }));
            const socketMap = getSockets(procSockets);
            const procChildren = await pfs.Promises.readdir('/proc');
            const processes = [];
            for (const childName of procChildren) {
                try {
                    const pid = Number(childName);
                    const childUri = resources.joinPath(uri_1.URI.file('/proc'), childName);
                    const childStat = await pfs.Promises.stat(childUri.fsPath);
                    if (childStat.isDirectory() && !isNaN(pid)) {
                        const cwd = await pfs.Promises.readlink(resources.joinPath(childUri, 'cwd').fsPath);
                        const cmd = await pfs.Promises.readFile(resources.joinPath(childUri, 'cmdline').fsPath, 'utf8');
                        processes.push({ pid, cwd, cmd });
                    }
                }
                catch (e) {
                    //
                }
            }
            const unFoundConnections = [];
            const filteredConnections = connections.filter((connection => {
                const foundConnection = socketMap[connection.socket];
                if (!foundConnection) {
                    unFoundConnections.push(connection);
                }
                return foundConnection;
            }));
            const foundPorts = findPorts(filteredConnections, socketMap, processes);
            let heuristicPorts;
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) number of possible root ports ${unFoundConnections.length}`);
            if (unFoundConnections.length > 0) {
                const rootProcesses = await (new Promise(resolve => {
                    (0, child_process_1.exec)('ps -F -A -l | grep root', (error, stdout, stderr) => {
                        resolve(stdout);
                    });
                }));
                this._foundRootPorts = tryFindRootPorts(unFoundConnections, rootProcesses, this._foundRootPorts);
                heuristicPorts = Array.from(this._foundRootPorts.values());
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) heuristic ports ${heuristicPorts.map(heuristicPort => heuristicPort.port).join(', ')}`);
            }
            return foundPorts.then(foundCandidates => {
                if (heuristicPorts) {
                    return foundCandidates.concat(heuristicPorts);
                }
                else {
                    return foundCandidates;
                }
            });
        }
        makeManagedTunnelFactory(authority) {
            return async (tunnelOptions) => {
                const t = new tunnelService_1.NodeRemoteTunnel({
                    commit: this.initData.commit,
                    quality: this.initData.quality,
                    logService: this.logService,
                    ipcLogger: null,
                    // services and address providers have stubs since we don't need
                    // the connection identification that the renderer process uses
                    remoteSocketFactoryService: {
                        _serviceBrand: undefined,
                        async connect(_connectTo, path, query, debugLabel) {
                            const result = await authority.makeConnection();
                            return ExtHostManagedSocket.connect(result, path, query, debugLabel);
                        },
                        register() {
                            throw new Error('not implemented');
                        },
                    },
                    addressProvider: {
                        getAddress() {
                            return Promise.resolve({
                                connectTo: new remoteAuthorityResolver_1.ManagedRemoteConnection(0),
                                connectionToken: authority.connectionToken,
                            });
                        },
                    },
                    signService: this.signService,
                }, 'localhost', tunnelOptions.remoteAddress.host || 'localhost', tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort);
                await t.waitForReady();
                const disposeEmitter = new event_1.Emitter();
                return {
                    localAddress: (0, tunnelModel_1.parseAddress)(t.localAddress) ?? t.localAddress,
                    remoteAddress: { port: t.tunnelRemotePort, host: t.tunnelRemoteHost },
                    onDidDispose: disposeEmitter.event,
                    dispose: () => {
                        t.dispose();
                        disposeEmitter.fire();
                        disposeEmitter.dispose();
                    },
                };
            };
        }
    };
    exports.NodeExtHostTunnelService = NodeExtHostTunnelService;
    exports.NodeExtHostTunnelService = NodeExtHostTunnelService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, log_1.ILogService),
        __param(3, sign_1.ISignService)
    ], NodeExtHostTunnelService);
    class ExtHostManagedSocket extends managedSocket_1.ManagedSocket {
        static connect(passing, path, query, debugLabel) {
            const d = new lifecycle_1.DisposableStore();
            const half = {
                onClose: d.add(new event_1.Emitter()),
                onData: d.add(new event_1.Emitter()),
                onEnd: d.add(new event_1.Emitter()),
            };
            d.add(passing.onDidReceiveMessage(d => half.onData.fire(buffer_1.VSBuffer.wrap(d))));
            d.add(passing.onDidEnd(() => half.onEnd.fire()));
            d.add(passing.onDidClose(error => half.onClose.fire({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                error,
                hadError: !!error
            })));
            const socket = new ExtHostManagedSocket(passing, debugLabel, half);
            socket._register(d);
            return (0, managedSocket_1.connectManagedSocket)(socket, path, query, debugLabel, half);
        }
        constructor(passing, debugLabel, half) {
            super(debugLabel, half);
            this.passing = passing;
        }
        write(buffer) {
            this.passing.send(buffer.buffer);
        }
        closeRemote() {
            this.passing.end();
        }
        async drain() {
            await this.passing.drain?.();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR1bm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0VHVubmVsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLFNBQWdCLFVBQVUsQ0FBQyxNQUFjO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxNQUFNLEdBQXNDLEVBQUUsQ0FBQztRQUNyRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BCLE1BQU0sS0FBSyxHQUFHLDRDQUE0QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQztZQUN2RSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNYLEdBQUcsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDM0IsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2lCQUM5QixDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzdDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxFQUFFLEVBQXNDLENBQUMsQ0FBQztRQUMzQyxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFD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