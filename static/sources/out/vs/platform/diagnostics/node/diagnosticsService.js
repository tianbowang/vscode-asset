var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/json", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/id", "vs/base/node/pfs", "vs/base/node/ps", "vs/platform/diagnostics/common/diagnostics", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry"], function (require, exports, osLib, async_1, json_1, network_1, path_1, platform_1, uri_1, id_1, pfs_1, ps_1, diagnostics_1, files_1, productService_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiagnosticsService = exports.collectLaunchConfigs = exports.getMachineInfo = exports.collectWorkspaceStats = void 0;
    const worksapceStatsCache = new Map();
    async function collectWorkspaceStats(folder, filter) {
        const cacheKey = `${folder}::${filter.join(':')}`;
        const cached = worksapceStatsCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const configFilePatterns = [
            { tag: 'grunt.js', filePattern: /^gruntfile\.js$/i },
            { tag: 'gulp.js', filePattern: /^gulpfile\.js$/i },
            { tag: 'tsconfig.json', filePattern: /^tsconfig\.json$/i },
            { tag: 'package.json', filePattern: /^package\.json$/i },
            { tag: 'jsconfig.json', filePattern: /^jsconfig\.json$/i },
            { tag: 'tslint.json', filePattern: /^tslint\.json$/i },
            { tag: 'eslint.json', filePattern: /^eslint\.json$/i },
            { tag: 'tasks.json', filePattern: /^tasks\.json$/i },
            { tag: 'launch.json', filePattern: /^launch\.json$/i },
            { tag: 'settings.json', filePattern: /^settings\.json$/i },
            { tag: 'webpack.config.js', filePattern: /^webpack\.config\.js$/i },
            { tag: 'project.json', filePattern: /^project\.json$/i },
            { tag: 'makefile', filePattern: /^makefile$/i },
            { tag: 'sln', filePattern: /^.+\.sln$/i },
            { tag: 'csproj', filePattern: /^.+\.csproj$/i },
            { tag: 'cmake', filePattern: /^.+\.cmake$/i },
            { tag: 'github-actions', filePattern: /^.+\.ya?ml$/i, relativePathPattern: /^\.github(?:\/|\\)workflows$/i },
            { tag: 'devcontainer.json', filePattern: /^devcontainer\.json$/i },
            { tag: 'dockerfile', filePattern: /^(dockerfile|docker\-compose\.ya?ml)$/i }
        ];
        const fileTypes = new Map();
        const configFiles = new Map();
        const MAX_FILES = 20000;
        function collect(root, dir, filter, token) {
            const relativePath = dir.substring(root.length + 1);
            return async_1.Promises.withAsyncBody(async (resolve) => {
                let files;
                try {
                    files = await pfs_1.Promises.readdir(dir, { withFileTypes: true });
                }
                catch (error) {
                    // Ignore folders that can't be read
                    resolve();
                    return;
                }
                if (token.count >= MAX_FILES) {
                    token.count += files.length;
                    token.maxReached = true;
                    resolve();
                    return;
                }
                let pending = files.length;
                if (pending === 0) {
                    resolve();
                    return;
                }
                let filesToRead = files;
                if (token.count + files.length > MAX_FILES) {
                    token.maxReached = true;
                    pending = MAX_FILES - token.count;
                    filesToRead = files.slice(0, pending);
                }
                token.count += files.length;
                for (const file of filesToRead) {
                    if (file.isDirectory()) {
                        if (!filter.includes(file.name)) {
                            await collect(root, (0, path_1.join)(dir, file.name), filter, token);
                        }
                        if (--pending === 0) {
                            resolve();
                            return;
                        }
                    }
                    else {
                        const index = file.name.lastIndexOf('.');
                        if (index >= 0) {
                            const fileType = file.name.substring(index + 1);
                            if (fileType) {
                                fileTypes.set(fileType, (fileTypes.get(fileType) ?? 0) + 1);
                            }
                        }
                        for (const configFile of configFilePatterns) {
                            if (configFile.relativePathPattern?.test(relativePath) !== false && configFile.filePattern.test(file.name)) {
                                configFiles.set(configFile.tag, (configFiles.get(configFile.tag) ?? 0) + 1);
                            }
                        }
                        if (--pending === 0) {
                            resolve();
                            return;
                        }
                    }
                }
            });
        }
        const statsPromise = async_1.Promises.withAsyncBody(async (resolve) => {
            const token = { count: 0, maxReached: false };
            await collect(folder, folder, filter, token);
            const launchConfigs = await collectLaunchConfigs(folder);
            resolve({
                configFiles: asSortedItems(configFiles),
                fileTypes: asSortedItems(fileTypes),
                fileCount: token.count,
                maxFilesReached: token.maxReached,
                launchConfigFiles: launchConfigs
            });
        });
        worksapceStatsCache.set(cacheKey, statsPromise);
        return statsPromise;
    }
    exports.collectWorkspaceStats = collectWorkspaceStats;
    function asSortedItems(items) {
        return Array.from(items.entries(), ([name, count]) => ({ name: name, count: count }))
            .sort((a, b) => b.count - a.count);
    }
    function getMachineInfo() {
        const machineInfo = {
            os: `${osLib.type()} ${osLib.arch()} ${osLib.release()}`,
            memory: `${(osLib.totalmem() / files_1.ByteSize.GB).toFixed(2)}GB (${(osLib.freemem() / files_1.ByteSize.GB).toFixed(2)}GB free)`,
            vmHint: `${Math.round((id_1.virtualMachineHint.value() * 100))}%`,
        };
        const cpus = osLib.cpus();
        if (cpus && cpus.length > 0) {
            machineInfo.cpus = `${cpus[0].model} (${cpus.length} x ${cpus[0].speed})`;
        }
        return machineInfo;
    }
    exports.getMachineInfo = getMachineInfo;
    async function collectLaunchConfigs(folder) {
        try {
            const launchConfigs = new Map();
            const launchConfig = (0, path_1.join)(folder, '.vscode', 'launch.json');
            const contents = await pfs_1.Promises.readFile(launchConfig);
            const errors = [];
            const json = (0, json_1.parse)(contents.toString(), errors);
            if (errors.length) {
                console.log(`Unable to parse ${launchConfig}`);
                return [];
            }
            if ((0, json_1.getNodeType)(json) === 'object' && json['configurations']) {
                for (const each of json['configurations']) {
                    const type = each['type'];
                    if (type) {
                        if (launchConfigs.has(type)) {
                            launchConfigs.set(type, launchConfigs.get(type) + 1);
                        }
                        else {
                            launchConfigs.set(type, 1);
                        }
                    }
                }
            }
            return asSortedItems(launchConfigs);
        }
        catch (error) {
            return [];
        }
    }
    exports.collectLaunchConfigs = collectLaunchConfigs;
    let DiagnosticsService = class DiagnosticsService {
        constructor(telemetryService, productService) {
            this.telemetryService = telemetryService;
            this.productService = productService;
        }
        formatMachineInfo(info) {
            const output = [];
            output.push(`OS Version:       ${info.os}`);
            output.push(`CPUs:             ${info.cpus}`);
            output.push(`Memory (System):  ${info.memory}`);
            output.push(`VM:               ${info.vmHint}`);
            return output.join('\n');
        }
        formatEnvironment(info) {
            const output = [];
            output.push(`Version:          ${this.productService.nameShort} ${this.productService.version} (${this.productService.commit || 'Commit unknown'}, ${this.productService.date || 'Date unknown'})`);
            output.push(`OS Version:       ${osLib.type()} ${osLib.arch()} ${osLib.release()}`);
            const cpus = osLib.cpus();
            if (cpus && cpus.length > 0) {
                output.push(`CPUs:             ${cpus[0].model} (${cpus.length} x ${cpus[0].speed})`);
            }
            output.push(`Memory (System):  ${(osLib.totalmem() / files_1.ByteSize.GB).toFixed(2)}GB (${(osLib.freemem() / files_1.ByteSize.GB).toFixed(2)}GB free)`);
            if (!platform_1.isWindows) {
                output.push(`Load (avg):       ${osLib.loadavg().map(l => Math.round(l)).join(', ')}`); // only provided on Linux/macOS
            }
            output.push(`VM:               ${Math.round((id_1.virtualMachineHint.value() * 100))}%`);
            output.push(`Screen Reader:    ${info.screenReader ? 'yes' : 'no'}`);
            output.push(`Process Argv:     ${info.mainArguments.join(' ')}`);
            output.push(`GPU Status:       ${this.expandGPUFeatures(info.gpuFeatureStatus)}`);
            return output.join('\n');
        }
        async getPerformanceInfo(info, remoteData) {
            return Promise.all([(0, ps_1.listProcesses)(info.mainPID), this.formatWorkspaceMetadata(info)]).then(async (result) => {
                let [rootProcess, workspaceInfo] = result;
                let processInfo = this.formatProcessList(info, rootProcess);
                remoteData.forEach(diagnostics => {
                    if ((0, diagnostics_1.isRemoteDiagnosticError)(diagnostics)) {
                        processInfo += `\n${diagnostics.errorMessage}`;
                        workspaceInfo += `\n${diagnostics.errorMessage}`;
                    }
                    else {
                        processInfo += `\n\nRemote: ${diagnostics.hostName}`;
                        if (diagnostics.processes) {
                            processInfo += `\n${this.formatProcessList(info, diagnostics.processes)}`;
                        }
                        if (diagnostics.workspaceMetadata) {
                            workspaceInfo += `\n|  Remote: ${diagnostics.hostName}`;
                            for (const folder of Object.keys(diagnostics.workspaceMetadata)) {
                                const metadata = diagnostics.workspaceMetadata[folder];
                                let countMessage = `${metadata.fileCount} files`;
                                if (metadata.maxFilesReached) {
                                    countMessage = `more than ${countMessage}`;
                                }
                                workspaceInfo += `|    Folder (${folder}): ${countMessage}`;
                                workspaceInfo += this.formatWorkspaceStats(metadata);
                            }
                        }
                    }
                });
                return {
                    processInfo,
                    workspaceInfo
                };
            });
        }
        async getSystemInfo(info, remoteData) {
            const { memory, vmHint, os, cpus } = getMachineInfo();
            const systemInfo = {
                os,
                memory,
                cpus,
                vmHint,
                processArgs: `${info.mainArguments.join(' ')}`,
                gpuStatus: info.gpuFeatureStatus,
                screenReader: `${info.screenReader ? 'yes' : 'no'}`,
                remoteData
            };
            if (!platform_1.isWindows) {
                systemInfo.load = `${osLib.loadavg().map(l => Math.round(l)).join(', ')}`;
            }
            if (platform_1.isLinux) {
                systemInfo.linuxEnv = {
                    desktopSession: process.env['DESKTOP_SESSION'],
                    xdgSessionDesktop: process.env['XDG_SESSION_DESKTOP'],
                    xdgCurrentDesktop: process.env['XDG_CURRENT_DESKTOP'],
                    xdgSessionType: process.env['XDG_SESSION_TYPE']
                };
            }
            return Promise.resolve(systemInfo);
        }
        async getDiagnostics(info, remoteDiagnostics) {
            const output = [];
            return (0, ps_1.listProcesses)(info.mainPID).then(async (rootProcess) => {
                // Environment Info
                output.push('');
                output.push(this.formatEnvironment(info));
                // Process List
                output.push('');
                output.push(this.formatProcessList(info, rootProcess));
                // Workspace Stats
                if (info.windows.some(window => window.folderURIs && window.folderURIs.length > 0 && !window.remoteAuthority)) {
                    output.push('');
                    output.push('Workspace Stats: ');
                    output.push(await this.formatWorkspaceMetadata(info));
                }
                remoteDiagnostics.forEach(diagnostics => {
                    if ((0, diagnostics_1.isRemoteDiagnosticError)(diagnostics)) {
                        output.push(`\n${diagnostics.errorMessage}`);
                    }
                    else {
                        output.push('\n\n');
                        output.push(`Remote:           ${diagnostics.hostName}`);
                        output.push(this.formatMachineInfo(diagnostics.machineInfo));
                        if (diagnostics.processes) {
                            output.push(this.formatProcessList(info, diagnostics.processes));
                        }
                        if (diagnostics.workspaceMetadata) {
                            for (const folder of Object.keys(diagnostics.workspaceMetadata)) {
                                const metadata = diagnostics.workspaceMetadata[folder];
                                let countMessage = `${metadata.fileCount} files`;
                                if (metadata.maxFilesReached) {
                                    countMessage = `more than ${countMessage}`;
                                }
                                output.push(`Folder (${folder}): ${countMessage}`);
                                output.push(this.formatWorkspaceStats(metadata));
                            }
                        }
                    }
                });
                output.push('');
                output.push('');
                return output.join('\n');
            });
        }
        formatWorkspaceStats(workspaceStats) {
            const output = [];
            const lineLength = 60;
            let col = 0;
            const appendAndWrap = (name, count) => {
                const item = ` ${name}(${count})`;
                if (col + item.length > lineLength) {
                    output.push(line);
                    line = '|                 ';
                    col = line.length;
                }
                else {
                    col += item.length;
                }
                line += item;
            };
            // File Types
            let line = '|      File types:';
            const maxShown = 10;
            const max = workspaceStats.fileTypes.length > maxShown ? maxShown : workspaceStats.fileTypes.length;
            for (let i = 0; i < max; i++) {
                const item = workspaceStats.fileTypes[i];
                appendAndWrap(item.name, item.count);
            }
            output.push(line);
            // Conf Files
            if (workspaceStats.configFiles.length >= 0) {
                line = '|      Conf files:';
                col = 0;
                workspaceStats.configFiles.forEach((item) => {
                    appendAndWrap(item.name, item.count);
                });
                output.push(line);
            }
            if (workspaceStats.launchConfigFiles.length > 0) {
                let line = '|      Launch Configs:';
                workspaceStats.launchConfigFiles.forEach(each => {
                    const item = each.count > 1 ? ` ${each.name}(${each.count})` : ` ${each.name}`;
                    line += item;
                });
                output.push(line);
            }
            return output.join('\n');
        }
        expandGPUFeatures(gpuFeatures) {
            const longestFeatureName = Math.max(...Object.keys(gpuFeatures).map(feature => feature.length));
            // Make columns aligned by adding spaces after feature name
            return Object.keys(gpuFeatures).map(feature => `${feature}:  ${' '.repeat(longestFeatureName - feature.length)}  ${gpuFeatures[feature]}`).join('\n                  ');
        }
        formatWorkspaceMetadata(info) {
            const output = [];
            const workspaceStatPromises = [];
            info.windows.forEach(window => {
                if (window.folderURIs.length === 0 || !!window.remoteAuthority) {
                    return;
                }
                output.push(`|  Window (${window.title})`);
                window.folderURIs.forEach(uriComponents => {
                    const folderUri = uri_1.URI.revive(uriComponents);
                    if (folderUri.scheme === network_1.Schemas.file) {
                        const folder = folderUri.fsPath;
                        workspaceStatPromises.push(collectWorkspaceStats(folder, ['node_modules', '.git']).then(stats => {
                            let countMessage = `${stats.fileCount} files`;
                            if (stats.maxFilesReached) {
                                countMessage = `more than ${countMessage}`;
                            }
                            output.push(`|    Folder (${(0, path_1.basename)(folder)}): ${countMessage}`);
                            output.push(this.formatWorkspaceStats(stats));
                        }).catch(error => {
                            output.push(`|      Error: Unable to collect workspace stats for folder ${folder} (${error.toString()})`);
                        }));
                    }
                    else {
                        output.push(`|    Folder (${folderUri.toString()}): Workspace stats not available.`);
                    }
                });
            });
            return Promise.all(workspaceStatPromises)
                .then(_ => output.join('\n'))
                .catch(e => `Unable to collect workspace stats: ${e}`);
        }
        formatProcessList(info, rootProcess) {
            const mapProcessToName = new Map();
            info.windows.forEach(window => mapProcessToName.set(window.pid, `window [${window.id}] (${window.title})`));
            info.pidToNames.forEach(({ pid, name }) => mapProcessToName.set(pid, name));
            const output = [];
            output.push('CPU %\tMem MB\t   PID\tProcess');
            if (rootProcess) {
                this.formatProcessItem(info.mainPID, mapProcessToName, output, rootProcess, 0);
            }
            return output.join('\n');
        }
        formatProcessItem(mainPid, mapProcessToName, output, item, indent) {
            const isRoot = (indent === 0);
            // Format name with indent
            let name;
            if (isRoot) {
                name = item.pid === mainPid ? `${this.productService.applicationName} main` : 'remote agent';
            }
            else {
                if (mapProcessToName.has(item.pid)) {
                    name = mapProcessToName.get(item.pid);
                }
                else {
                    name = `${'  '.repeat(indent)} ${item.name}`;
                }
            }
            const memory = process.platform === 'win32' ? item.mem : (osLib.totalmem() * (item.mem / 100));
            output.push(`${item.load.toFixed(0).padStart(5, ' ')}\t${(memory / files_1.ByteSize.MB).toFixed(0).padStart(6, ' ')}\t${item.pid.toFixed(0).padStart(6, ' ')}\t${name}`);
            // Recurse into children if any
            if (Array.isArray(item.children)) {
                item.children.forEach(child => this.formatProcessItem(mainPid, mapProcessToName, output, child, indent + 1));
            }
        }
        async getWorkspaceFileExtensions(workspace) {
            const items = new Set();
            for (const { uri } of workspace.folders) {
                const folderUri = uri_1.URI.revive(uri);
                if (folderUri.scheme !== network_1.Schemas.file) {
                    continue;
                }
                const folder = folderUri.fsPath;
                try {
                    const stats = await collectWorkspaceStats(folder, ['node_modules', '.git']);
                    stats.fileTypes.forEach(item => items.add(item.name));
                }
                catch { }
            }
            return { extensions: [...items] };
        }
        async reportWorkspaceStats(workspace) {
            for (const { uri } of workspace.folders) {
                const folderUri = uri_1.URI.revive(uri);
                if (folderUri.scheme !== network_1.Schemas.file) {
                    continue;
                }
                const folder = folderUri.fsPath;
                try {
                    const stats = await collectWorkspaceStats(folder, ['node_modules', '.git']);
                    this.telemetryService.publicLog2('workspace.stats', {
                        'workspace.id': workspace.telemetryId,
                        rendererSessionId: workspace.rendererSessionId
                    });
                    stats.fileTypes.forEach(e => {
                        this.telemetryService.publicLog2('workspace.stats.file', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                    stats.launchConfigFiles.forEach(e => {
                        this.telemetryService.publicLog2('workspace.stats.launchConfigFile', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                    stats.configFiles.forEach(e => {
                        this.telemetryService.publicLog2('workspace.stats.configFiles', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                }
                catch {
                    // Report nothing if collecting metadata fails.
                }
            }
        }
    };
    exports.DiagnosticsService = DiagnosticsService;
    exports.DiagnosticsService = DiagnosticsService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, productService_1.IProductService)
    ], DiagnosticsService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9kaWFnbm9zdGljcy9ub2RlL2RpYWdub3N0aWNzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBMkJBLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7SUFDaEUsS0FBSyxVQUFVLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxNQUFnQjtRQUMzRSxNQUFNLFFBQVEsR0FBRyxHQUFHLE1BQU0sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbEQsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELElBQUksTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRCxNQUFNLGtCQUFrQixHQUF5QjtZQUNoRCxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFO1lBQ3BELEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUU7WUFDbEQsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRTtZQUMxRCxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFO1lBQ3hELEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUU7WUFDMUQsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRTtZQUN0RCxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFO1lBQ3RELEVBQUUsR0FBRyxFQUFFLFlBQVks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