"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHistoryProvider = void 0;
const vscode_1 = require("vscode");
const repository_1 = require("./repository");
const util_1 = require("./util");
const uri_1 = require("./uri");
const emoji_1 = require("./emoji");
const operation_1 = require("./operation");
class GitHistoryProvider {
    get currentHistoryItemGroup() { return this._currentHistoryItemGroup; }
    set currentHistoryItemGroup(value) {
        this._currentHistoryItemGroup = value;
        this._onDidChangeCurrentHistoryItemGroup.fire();
    }
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
        this._onDidChangeCurrentHistoryItemGroup = new vscode_1.EventEmitter();
        this.onDidChangeCurrentHistoryItemGroup = this._onDidChangeCurrentHistoryItemGroup.event;
        this._onDidChangeDecorations = new vscode_1.EventEmitter();
        this.onDidChangeFileDecorations = this._onDidChangeDecorations.event;
        this.historyItemDecorations = new Map();
        this.disposables = [];
        this.disposables.push(repository.onDidRunGitStatus(this.onDidRunGitStatus, this));
        this.disposables.push((0, util_1.filterEvent)(repository.onDidRunOperation, e => e.operation === operation_1.Operation.Refresh)(() => this._onDidChangeCurrentHistoryItemGroup.fire()));
        this.disposables.push(vscode_1.window.registerFileDecorationProvider(this));
    }
    async onDidRunGitStatus() {
        // Check if HEAD has changed
        if (this._HEAD?.name === this.repository.HEAD?.name &&
            this._HEAD?.commit === this.repository.HEAD?.commit &&
            this._HEAD?.upstream?.name === this.repository.HEAD?.upstream?.name &&
            this._HEAD?.upstream?.remote === this.repository.HEAD?.upstream?.remote &&
            this._HEAD?.upstream?.commit === this.repository.HEAD?.upstream?.commit) {
            return;
        }
        this._HEAD = this.repository.HEAD;
        // Check if HEAD does not support incoming/outgoing (detached commit, tag)
        if (!this._HEAD?.name || !this._HEAD?.commit || this._HEAD.type === 2 /* RefType.Tag */) {
            this.currentHistoryItemGroup = undefined;
            return;
        }
        this.currentHistoryItemGroup = {
            id: `refs/heads/${this._HEAD.name ?? ''}`,
            label: this._HEAD.name ?? '',
            base: this._HEAD.upstream ?
                {
                    id: `refs/remotes/${this._HEAD.upstream.remote}/${this._HEAD.upstream.name}`,
                    label: `${this._HEAD.upstream.remote}/${this._HEAD.upstream.name}`,
                } : undefined
        };
    }
    async provideHistoryItems(historyItemGroupId, options) {
        //TODO@lszomoru - support limit and cursor
        if (typeof options.limit === 'number') {
            throw new Error('Unsupported options.');
        }
        if (typeof options.limit?.id !== 'string') {
            throw new Error('Unsupported options.');
        }
        const refParentId = options.limit.id;
        const refId = await this.repository.revParse(historyItemGroupId) ?? '';
        const historyItems = [];
        const commits = await this.repository.log({ range: `${refParentId}..${refId}`, shortStats: true, sortByAuthorDate: true });
        await (0, emoji_1.ensureEmojis)();
        historyItems.push(...commits.map(commit => {
            const newLineIndex = commit.message.indexOf('\n');
            const subject = newLineIndex !== -1 ? commit.message.substring(0, newLineIndex) : commit.message;
            return {
                id: commit.hash,
                parentIds: commit.parents,
                label: (0, emoji_1.emojify)(subject),
                description: commit.authorName,
                icon: new vscode_1.ThemeIcon('git-commit'),
                timestamp: commit.authorDate?.getTime(),
                statistics: commit.shortStat ?? { files: 0, insertions: 0, deletions: 0 },
            };
        }));
        return historyItems;
    }
    async provideHistoryItemSummary(historyItemId, historyItemParentId) {
        if (!historyItemParentId) {
            const commit = await this.repository.getCommit(historyItemId);
            historyItemParentId = commit.parents.length > 0 ? commit.parents[0] : `${historyItemId}^`;
        }
        const allChanges = await this.repository.diffBetweenShortStat(historyItemParentId, historyItemId);
        return { id: historyItemId, parentIds: [historyItemParentId], label: '', statistics: allChanges };
    }
    async provideHistoryItemChanges(historyItemId, historyItemParentId) {
        if (!historyItemParentId) {
            const commit = await this.repository.getCommit(historyItemId);
            historyItemParentId = commit.parents.length > 0 ? commit.parents[0] : `${historyItemId}^`;
        }
        const historyItemChangesUri = [];
        const historyItemChanges = [];
        const changes = await this.repository.diffBetween(historyItemParentId, historyItemId);
        for (const change of changes) {
            const historyItemUri = change.uri.with({
                query: `ref=${historyItemId}`
            });
            // History item change
            historyItemChanges.push({
                uri: historyItemUri,
                originalUri: (0, uri_1.toGitUri)(change.originalUri, historyItemParentId),
                modifiedUri: (0, uri_1.toGitUri)(change.originalUri, historyItemId),
                renameUri: change.renameUri,
            });
            // History item change decoration
            const letter = repository_1.Resource.getStatusLetter(change.status);
            const tooltip = repository_1.Resource.getStatusText(change.status);
            const color = repository_1.Resource.getStatusColor(change.status);
            const fileDecoration = new vscode_1.FileDecoration(letter, tooltip, color);
            this.historyItemDecorations.set(historyItemUri.toString(), fileDecoration);
            historyItemChangesUri.push(historyItemUri);
        }
        this._onDidChangeDecorations.fire(historyItemChangesUri);
        return historyItemChanges;
    }
    async resolveHistoryItemGroupCommonAncestor(historyItemId1, historyItemId2) {
        if (!historyItemId2) {
            const upstreamRef = await this.resolveHistoryItemGroupBase(historyItemId1);
            if (!upstreamRef) {
                return undefined;
            }
            historyItemId2 = `refs/remotes/${upstreamRef.remote}/${upstreamRef.name}`;
        }
        const ancestor = await this.repository.getMergeBase(historyItemId1, historyItemId2);
        if (!ancestor) {
            return undefined;
        }
        try {
            const commitCount = await this.repository.getCommitCount(`${historyItemId1}...${historyItemId2}`);
            return { id: ancestor, ahead: commitCount.ahead, behind: commitCount.behind };
        }
        catch (err) {
            this.logger.error(`Failed to get ahead/behind for '${historyItemId1}...${historyItemId2}': ${err.message}`);
        }
        return undefined;
    }
    provideFileDecoration(uri) {
        return this.historyItemDecorations.get(uri.toString());
    }
    async resolveHistoryItemGroupBase(historyItemId) {
        try {
            const remoteBranch = await this.repository.getBranchBase(historyItemId);
            if (!remoteBranch?.remote || !remoteBranch?.name || !remoteBranch?.commit || remoteBranch?.type !== 1 /* RefType.RemoteHead */) {
                return undefined;
            }
            return {
                name: remoteBranch.name,
                remote: remoteBranch.remote,
                commit: remoteBranch.commit
            };
        }
        catch (err) {
            this.logger.error(`Failed to get branch base for '${historyItemId}': ${err.message}`);
        }
        return undefined;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.GitHistoryProvider = GitHistoryProvider;
//# sourceMappingURL=historyProvider.js.map