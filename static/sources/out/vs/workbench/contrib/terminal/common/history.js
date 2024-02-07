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
define(["require", "exports", "vs/base/common/process", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/base/common/uri", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/path"], function (require, exports, process_1, lifecycle_1, map_1, configuration_1, files_1, instantiation_1, storage_1, uri_1, remoteAgentService_1, network_1, platform_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizeFishHistoryCmd = exports.fetchFishHistory = exports.fetchPwshHistory = exports.fetchZshHistory = exports.fetchBashHistory = exports.TerminalPersistedHistory = exports.clearShellFileHistory = exports.getShellFileHistory = exports.getDirectoryHistory = exports.getCommandHistory = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["DefaultHistoryLimit"] = 100] = "DefaultHistoryLimit";
    })(Constants || (Constants = {}));
    var StorageKeys;
    (function (StorageKeys) {
        StorageKeys["Entries"] = "terminal.history.entries";
        StorageKeys["Timestamp"] = "terminal.history.timestamp";
    })(StorageKeys || (StorageKeys = {}));
    let commandHistory = undefined;
    function getCommandHistory(accessor) {
        if (!commandHistory) {
            commandHistory = accessor.get(instantiation_1.IInstantiationService).createInstance(TerminalPersistedHistory, 'commands');
        }
        return commandHistory;
    }
    exports.getCommandHistory = getCommandHistory;
    let directoryHistory = undefined;
    function getDirectoryHistory(accessor) {
        if (!directoryHistory) {
            directoryHistory = accessor.get(instantiation_1.IInstantiationService).createInstance(TerminalPersistedHistory, 'dirs');
        }
        return directoryHistory;
    }
    exports.getDirectoryHistory = getDirectoryHistory;
    // Shell file history loads once per shell per window
    const shellFileHistory = new Map();
    async function getShellFileHistory(accessor, shellType) {
        const cached = shellFileHistory.get(shellType);
        if (cached === null) {
            return [];
        }
        if (cached !== undefined) {
            return cached;
        }
        let result;
        switch (shellType) {
            case "bash" /* PosixShellType.Bash */:
                result = await fetchBashHistory(accessor);
                break;
            case "pwsh" /* PosixShellType.PowerShell */: // WindowsShellType.PowerShell has the same value
                result = await fetchPwshHistory(accessor);
                break;
            case "zsh" /* PosixShellType.Zsh */:
                result = await fetchZshHistory(accessor);
                break;
            case "fish" /* PosixShellType.Fish */:
                result = await fetchFishHistory(accessor);
                break;
            default: return [];
        }
        if (result === undefined) {
            shellFileHistory.set(shellType, null);
            return [];
        }
        const array = Array.from(result);
        shellFileHistory.set(shellType, array);
        return array;
    }
    exports.getShellFileHistory = getShellFileHistory;
    function clearShellFileHistory() {
        shellFileHistory.clear();
    }
    exports.clearShellFileHistory = clearShellFileHistory;
    let TerminalPersistedHistory = class TerminalPersistedHistory extends lifecycle_1.Disposable {
        get entries() {
            this._ensureUpToDate();
            return this._entries.entries();
        }
        constructor(_storageDataKey, _configurationService, _storageService) {
            super();
            this._storageDataKey = _storageDataKey;
            this._configurationService = _configurationService;
            this._storageService = _storageService;
            this._timestamp = 0;
            this._isReady = false;
            this._isStale = true;
            // Init cache
            this._entries = new map_1.LRUCache(this._getHistoryLimit());
            // Listen for config changes to set history limit
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */)) {
                    this._entries.limit = this._getHistoryLimit();
                }
            }));
            // Listen to cache changes from other windows
            this._register(this._storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this._getTimestampStorageKey(), this._store)(() => {
                if (!this._isStale) {
                    this._isStale = this._storageService.getNumber(this._getTimestampStorageKey(), -1 /* StorageScope.APPLICATION */, 0) !== this._timestamp;
                }
            }));
        }
        add(key, value) {
            this._ensureUpToDate();
            this._entries.set(key, value);
            this._saveState();
        }
        remove(key) {
            this._ensureUpToDate();
            this._entries.delete(key);
            this._saveState();
        }
        clear() {
            this._ensureUpToDate();
            this._entries.clear();
            this._saveState();
        }
        _ensureUpToDate() {
            // Initial load
            if (!this._isReady) {
                this._loadState();
                this._isReady = true;
            }
            // React to stale cache caused by another window
            if (this._isStale) {
                // Since state is saved whenever the entries change, it's a safe assumption that no
                // merging of entries needs to happen, just loading the new state.
                this._entries.clear();
                this._loadState();
                this._isStale = false;
            }
        }
        _loadState() {
            this._timestamp = this._storageService.getNumber(this._getTimestampStorageKey(), -1 /* StorageScope.APPLICATION */, 0);
            // Load global entries plus
            const serialized = this._loadPersistedState();
            if (serialized) {
                for (const entry of serialized.entries) {
                    this._entries.set(entry.key, entry.value);
                }
            }
        }
        _loadPersistedState() {
            const raw = this._storageService.get(this._getEntriesStorageKey(), -1 /* StorageScope.APPLICATION */);
            if (raw === undefined || raw.length === 0) {
                return undefined;
            }
            let serialized = undefined;
            try {
                serialized = JSON.parse(raw);
            }
            catch {
                // Invalid data
                return undefined;
            }
            return serialized;
        }
        _saveState() {
            const serialized = { entries: [] };
            this._entries.forEach((value, key) => serialized.entries.push({ key, value }));
            this._storageService.store(this._getEntriesStorageKey(), JSON.stringify(serialized), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._timestamp = Date.now();
            this._storageService.store(this._getTimestampStorageKey(), this._timestamp, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        _getHistoryLimit() {
            const historyLimit = this._configurationService.getValue("terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */);
            return typeof historyLimit === 'number' ? historyLimit : 100 /* Constants.DefaultHistoryLimit */;
        }
        _getTimestampStorageKey() {
            return `${"terminal.history.timestamp" /* StorageKeys.Timestamp */}.${this._storageDataKey}`;
        }
        _getEntriesStorageKey() {
            return `${"terminal.history.entries" /* StorageKeys.Entries */}.${this._storageDataKey}`;
        }
    };
    exports.TerminalPersistedHistory = TerminalPersistedHistory;
    exports.TerminalPersistedHistory = TerminalPersistedHistory = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, storage_1.IStorageService)
    ], TerminalPersistedHistory);
    async function fetchBashHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows) {
            return undefined;
        }
        const content = await fetchFileContents(process_1.env['HOME'], '.bash_history', false, fileService, remoteAgentService);
        if (content === undefined) {
            return undefined;
        }
        // .bash_history does not differentiate wrapped commands from multiple commands. Parse
        // the output to get the
        const fileLines = content.split('\n');
        const result = new Set();
        let currentLine;
        let currentCommand = undefined;
        let wrapChar = undefined;
        for (let i = 0; i < fileLines.length; i++) {
            currentLine = fileLines[i];
            if (currentCommand === undefined) {
                currentCommand = currentLine;
            }
            else {
                currentCommand += `\n${currentLine}`;
            }
            for (let c = 0; c < currentLine.length; c++) {
                if (wrapChar) {
                    if (currentLine[c] === wrapChar) {
                        wrapChar = undefined;
                    }
                }
                else {
                    if (currentLine[c].match(/['"]/)) {
                        wrapChar = currentLine[c];
                    }
                }
            }
            if (wrapChar === undefined) {
                if (currentCommand.length > 0) {
                    result.add(currentCommand.trim());
                }
                currentCommand = undefined;
            }
        }
        return result.values();
    }
    exports.fetchBashHistory = fetchBashHistory;
    async function fetchZshHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows) {
            return undefined;
        }
        const content = await fetchFileContents(process_1.env['HOME'], '.zsh_history', false, fileService, remoteAgentService);
        if (content === undefined) {
            return undefined;
        }
        const fileLines = content.split(/\:\s\d+\:\d+;/);
        const result = new Set();
        for (let i = 0; i < fileLines.length; i++) {
            const sanitized = fileLines[i].replace(/\\\n/g, '\n').trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
        }
        return result.values();
    }
    exports.fetchZshHistory = fetchZshHistory;
    async function fetchPwshHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        let folderPrefix;
        let filePath;
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        const isFileWindows = remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows;
        if (isFileWindows) {
            folderPrefix = process_1.env['APPDATA'];
            filePath = '\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt';
        }
        else {
            folderPrefix = process_1.env['HOME'];
            filePath = '.local/share/powershell/PSReadline/ConsoleHost_history.txt';
        }
        const content = await fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService);
        if (content === undefined) {
            return undefined;
        }
        const fileLines = content.split('\n');
        const result = new Set();
        let currentLine;
        let currentCommand = undefined;
        let wrapChar = undefined;
        for (let i = 0; i < fileLines.length; i++) {
            currentLine = fileLines[i];
            if (currentCommand === undefined) {
                currentCommand = currentLine;
            }
            else {
                currentCommand += `\n${currentLine}`;
            }
            if (!currentLine.endsWith('`')) {
                const sanitized = currentCommand.trim();
                if (sanitized.length > 0) {
                    result.add(sanitized);
                }
                currentCommand = undefined;
                continue;
            }
            // If the line ends with `, the line may be wrapped. Need to also test the case where ` is
            // the last character in the line
            for (let c = 0; c < currentLine.length; c++) {
                if (wrapChar) {
                    if (currentLine[c] === wrapChar) {
                        wrapChar = undefined;
                    }
                }
                else {
                    if (currentLine[c].match(/`/)) {
                        wrapChar = currentLine[c];
                    }
                }
            }
            // Having an even number of backticks means the line is terminated
            // TODO: This doesn't cover more complicated cases where ` is within quotes
            if (!wrapChar) {
                const sanitized = currentCommand.trim();
                if (sanitized.length > 0) {
                    result.add(sanitized);
                }
                currentCommand = undefined;
            }
            else {
                // Remove trailing backtick
                currentCommand = currentCommand.replace(/`$/, '');
                wrapChar = undefined;
            }
        }
        return result.values();
    }
    exports.fetchPwshHistory = fetchPwshHistory;
    async function fetchFishHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows) {
            return undefined;
        }
        /**
         * From `fish` docs:
         * > The command history is stored in the file ~/.local/share/fish/fish_history
         *   (or $XDG_DATA_HOME/fish/fish_history if that variable is set) by default.
         *
         * (https://fishshell.com/docs/current/interactive.html#history-search)
         */
        const overridenDataHome = process_1.env['XDG_DATA_HOME'];
        // TODO: Unchecked fish behavior:
        // What if XDG_DATA_HOME was defined but somehow $XDG_DATA_HOME/fish/fish_history
        // was not exist. Does fish fall back to ~/.local/share/fish/fish_history?
        const content = await (overridenDataHome
            ? fetchFileContents(process_1.env['XDG_DATA_HOME'], 'fish/fish_history', false, fileService, remoteAgentService)
            : fetchFileContents(process_1.env['HOME'], '.local/share/fish/fish_history', false, fileService, remoteAgentService));
        if (content === undefined) {
            return undefined;
        }
        /**
         * These apply to `fish` v3.5.1:
         * - It looks like YAML but it's not. It's, quoting, *"a broken psuedo-YAML"*.
         *   See these discussions for more details:
         *   - https://github.com/fish-shell/fish-shell/pull/6493
         *   - https://github.com/fish-shell/fish-shell/issues/3341
         * - Every record should exactly start with `- cmd:` (the whitespace between `-` and `cmd` cannot be replaced with tab)
         * - Both `- cmd: echo 1` and `- cmd:echo 1` are valid entries.
         * - Backslashes are esacped as `\\`.
         * - Multiline commands are joined with a `\n` sequence, hence they're read as single line commands.
         * - Property `when` is optional.
         * - History navigation respects the records order and ignore the actual `when` property values (chronological order).
         * - If `cmd` value is multiline , it just takes the first line. Also YAML operators like `>-` or `|-` are not supported.
         */
        const result = new Set();
        const cmds = content.split('\n')
            .filter(x => x.startsWith('- cmd:'))
            .map(x => x.substring(6).trimStart());
        for (let i = 0; i < cmds.length; i++) {
            const sanitized = sanitizeFishHistoryCmd(cmds[i]).trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
        }
        return result.values();
    }
    exports.fetchFishHistory = fetchFishHistory;
    function sanitizeFishHistoryCmd(cmd) {
        /**
         * NOTE
         * This repeatedReplace() call can be eliminated by using look-ahead
         * caluses in the original RegExp pattern:
         *
         * >>> ```ts
         * >>> cmds[i].replace(/(?<=^|[^\\])((?:\\\\)*)(\\n)/g, '$1\n')
         * >>> ```
         *
         * But since not all browsers support look aheads we opted to a simple
         * pattern and repeatedly calling replace method.
         */
        return repeatedReplace(/(^|[^\\])((?:\\\\)*)(\\n)/g, cmd, '$1$2\n');
    }
    exports.sanitizeFishHistoryCmd = sanitizeFishHistoryCmd;
    function repeatedReplace(pattern, value, replaceValue) {
        let last;
        let current = value;
        while (true) {
            last = current;
            current = current.replace(pattern, replaceValue);
            if (current === last) {
                return current;
            }
        }
    }
    async function fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService) {
        if (!folderPrefix) {
            return undefined;
        }
        const isRemote = !!remoteAgentService.getConnection()?.remoteAuthority;
        const historyFileUri = uri_1.URI.from({
            scheme: isRemote ? network_1.Schemas.vscodeRemote : network_1.Schemas.file,
            path: (isFileWindows ? path_1.win32.join : path_1.posix.join)(folderPrefix, filePath)
        });
        let content;
        try {
            content = await fileService.readFile(historyFileUri);
        }
        catch (e) {
            // Handle file not found only
            if (e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                return undefined;
            }
            throw e;
        }
        if (content === undefined) {
            return undefined;
        }
        return content.value.toString();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvY29tbW9uL2hpc3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMENoRyxJQUFXLFNBRVY7SUFGRCxXQUFXLFNBQVM7UUFDbkIseUVBQXlCLENBQUE7SUFDMUIsQ0FBQyxFQUZVLFNBQVMsS0FBVCxTQUFTLFFBRW5CO0lBRUQsSUFBVyxXQUdWO0lBSEQsV0FBVyxXQUFXO1FBQ3JCLG1EQUFvQyxDQUFBO1FBQ3BDLHVEQUF3QyxDQUFBO0lBQ3pDLENBQUMsRUFIVSxXQUFXLEtBQVgsV0FBVyxRQUdyQjtJQUVELElBQUksY0FBYyxHQUE0RSxTQUFTLENBQUM7SUFDeEcsU0FBZ0IsaUJBQWlCLENBQUMsUUFBMEI7UUFDM0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3JCLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUMsY0FBYyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsQ0FBK0QsQ0FBQztRQUN6SyxDQUFDO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUxELDhDQUtDO0lBRUQsSUFBSSxnQkFBZ0IsR0FBd0UsU0FBUyxDQUFDO0lBQ3RHLFNBQWdCLG1CQUFtQixDQUFDLFFBQTBCO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3ZCLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLEVBQUUsTUFBTSxDQUEyRCxDQUFDO1FBQ25LLENBQUM7UUFDRCxPQUFPLGdCQUFnQixDQUFDO0lBQ3pCLENBQUM7SUFMRCxrREFLQztJQUVELHFEQUFxRDtJQUNyRCxNQUFNLGdCQUFn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