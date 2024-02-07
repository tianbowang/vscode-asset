/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/performance"], function (require, exports, event_1, lifecycle_1, uri_1, performance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalPty = void 0;
    /**
     * Responsible for establishing and maintaining a connection with an existing terminal process
     * created on the local pty host.
     */
    class LocalPty extends lifecycle_1.Disposable {
        constructor(id, shouldPersist, _proxy) {
            super();
            this.id = id;
            this.shouldPersist = shouldPersist;
            this._proxy = _proxy;
            this._properties = {
                cwd: '',
                initialCwd: '',
                fixedDimensions: { cols: undefined, rows: undefined },
                title: '',
                shellType: undefined,
                hasChildProcesses: true,
                resolvedShellLaunchConfig: {},
                overrideDimensions: undefined,
                failedShellIntegrationActivation: false,
                usedShellIntegrationInjection: undefined
            };
            this._lastDimensions = { cols: -1, rows: -1 };
            this._inReplay = false;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessReplayComplete = this._register(new event_1.Emitter());
            this.onProcessReplayComplete = this._onProcessReplayComplete.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._onRestoreCommands = this._register(new event_1.Emitter());
            this.onRestoreCommands = this._onRestoreCommands.event;
        }
        start() {
            return this._proxy.start(this.id);
        }
        detach(forcePersist) {
            return this._proxy.detachFromProcess(this.id, forcePersist);
        }
        shutdown(immediate) {
            this._proxy.shutdown(this.id, immediate);
        }
        async processBinary(data) {
            if (this._inReplay) {
                return;
            }
            return this._proxy.processBinary(this.id, data);
        }
        input(data) {
            if (this._inReplay) {
                return;
            }
            this._proxy.input(this.id, data);
        }
        resize(cols, rows) {
            if (this._inReplay || this._lastDimensions.cols === cols && this._lastDimensions.rows === rows) {
                return;
            }
            this._lastDimensions.cols = cols;
            this._lastDimensions.rows = rows;
            this._proxy.resize(this.id, cols, rows);
        }
        async clearBuffer() {
            this._proxy.clearBuffer?.(this.id);
        }
        freePortKillProcess(port) {
            if (!this._proxy.freePortKillProcess) {
                throw new Error('freePortKillProcess does not exist on the local pty service');
            }
            return this._proxy.freePortKillProcess(port);
        }
        async getInitialCwd() {
            return this._properties.initialCwd;
        }
        async getCwd() {
            return this._properties.cwd || this._properties.initialCwd;
        }
        async refreshProperty(type) {
            return this._proxy.refreshProperty(this.id, type);
        }
        async updateProperty(type, value) {
            return this._proxy.updateProperty(this.id, type, value);
        }
        acknowledgeDataEvent(charCount) {
            if (this._inReplay) {
                return;
            }
            this._proxy.acknowledgeDataEvent(this.id, charCount);
        }
        setUnicodeVersion(version) {
            return this._proxy.setUnicodeVersion(this.id, version);
        }
        handleData(e) {
            this._onProcessData.fire(e);
        }
        handleExit(e) {
            this._onProcessExit.fire(e);
        }
        handleReady(e) {
            this._onProcessReady.fire(e);
        }
        handleDidChangeProperty({ type, value }) {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */:
                    this._properties.cwd = value;
                    break;
                case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                    this._properties.initialCwd = value;
                    break;
                case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                    if (value.cwd && typeof value.cwd !== 'string') {
                        value.cwd = uri_1.URI.revive(value.cwd);
                    }
            }
            this._onDidChangeProperty.fire({ type, value });
        }
        async handleReplay(e) {
            (0, performance_1.mark)(`code/terminal/willHandleReplay/${this.id}`);
            try {
                this._inReplay = true;
                for (const innerEvent of e.events) {
                    if (innerEvent.cols !== 0 || innerEvent.rows !== 0) {
                        // never override with 0x0 as that is a marker for an unknown initial size
                        this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: innerEvent.cols, rows: innerEvent.rows, forceExactSize: true } });
                    }
                    const e = { data: innerEvent.data, trackCommit: true };
                    this._onProcessData.fire(e);
                    await e.writePromise;
                }
            }
            finally {
                this._inReplay = false;
            }
            if (e.commands) {
                this._onRestoreCommands.fire(e.commands);
            }
            // remove size override
            this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: undefined });
            (0, performance_1.mark)(`code/terminal/didHandleReplay/${this.id}`);
            this._onProcessReplayComplete.fire();
        }
        handleOrphanQuestion() {
            this._proxy.orphanQuestionReply(this.id);
        }
    }
    exports.LocalPty = LocalPty;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxQdHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2VsZWN0cm9uLXNhbmRib3gvbG9jYWxQdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOzs7T0FHRztJQUNILE1BQWEsUUFBUyxTQUFRLHNCQUFVO1FBOEJ2QyxZQUNVLEVBQVUsRUFDVixhQUFzQixFQUNkLE1BQW1CO1lBRXBDLEtBQUssRUFBRSxDQUFDO1lBSkMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNWLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1lBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQWhDcEIsZ0JBQVcsR0FBd0I7Z0JBQ25ELEdBQUcsRUFBRSxFQUFFO2dCQUNQLFVBQVUsRUFBRSxFQUFFO2dCQUNkLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDckQsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLGlCQUFpQixFQUFFLElBQUk7Z0JBQ3ZCLHlCQUF5QixFQUFFLEVBQUU7Z0JBQzdCLGtCQUFrQixFQUFFLFNBQVM7Z0JBQzdCLGdDQUFnQyxFQUFFLEtBQUs7Z0JBQ3ZDLDZCQUE2QixFQUFFLFNBQVM7YUFDeEMsQ0FBQztZQUNlLG9CQUFlLEdBQW1DLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRWxGLGNBQVMsR0FBRyxLQUFLLENBQUM7WUFFVCxtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQThCLENBQUMsQ0FBQztZQUNuRixrQkFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBQ2xDLDZCQUF3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