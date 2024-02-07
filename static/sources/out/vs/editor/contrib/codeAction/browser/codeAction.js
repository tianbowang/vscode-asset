/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/contrib/editorState/browser/editorState", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "../common/types"], function (require, exports, arrays_1, cancellation_1, errors_1, lifecycle_1, uri_1, bulkEditService_1, range_1, selection_1, languageFeatures_1, model_1, editorState_1, nls, commands_1, notification_1, progress_1, telemetry_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyCodeAction = exports.ApplyCodeActionReason = exports.getCodeActions = exports.fixAllCommandId = exports.organizeImportsCommandId = exports.sourceActionCommandId = exports.refactorPreviewCommandId = exports.refactorCommandId = exports.autoFixCommandId = exports.quickFixCommandId = exports.codeActionCommandId = void 0;
    exports.codeActionCommandId = 'editor.action.codeAction';
    exports.quickFixCommandId = 'editor.action.quickFix';
    exports.autoFixCommandId = 'editor.action.autoFix';
    exports.refactorCommandId = 'editor.action.refactor';
    exports.refactorPreviewCommandId = 'editor.action.refactor.preview';
    exports.sourceActionCommandId = 'editor.action.sourceAction';
    exports.organizeImportsCommandId = 'editor.action.organizeImports';
    exports.fixAllCommandId = 'editor.action.fixAll';
    class ManagedCodeActionSet extends lifecycle_1.Disposable {
        static codeActionsPreferredComparator(a, b) {
            if (a.isPreferred && !b.isPreferred) {
                return -1;
            }
            else if (!a.isPreferred && b.isPreferred) {
                return 1;
            }
            else {
                return 0;
            }
        }
        static codeActionsComparator({ action: a }, { action: b }) {
            if (a.isAI && !b.isAI) {
                return 1;
            }
            else if (!a.isAI && b.isAI) {
                return -1;
            }
            if ((0, arrays_1.isNonEmptyArray)(a.diagnostics)) {
                return (0, arrays_1.isNonEmptyArray)(b.diagnostics) ? ManagedCodeActionSet.codeActionsPreferredComparator(a, b) : -1;
            }
            else if ((0, arrays_1.isNonEmptyArray)(b.diagnostics)) {
                return 1;
            }
            else {
                return ManagedCodeActionSet.codeActionsPreferredComparator(a, b); // both have no diagnostics
            }
        }
        constructor(actions, documentation, disposables) {
            super();
            this.documentation = documentation;
            this._register(disposables);
            this.allActions = [...actions].sort(ManagedCodeActionSet.codeActionsComparator);
            this.validActions = this.allActions.filter(({ action }) => !action.disabled);
        }
        get hasAutoFix() {
            return this.validActions.some(({ action: fix }) => !!fix.kind && types_1.CodeActionKind.QuickFix.contains(new types_1.CodeActionKind(fix.kind)) && !!fix.isPreferred);
        }
        get hasAIFix() {
            return this.validActions.some(({ action: fix }) => !!fix.isAI);
        }
        get allAIFixes() {
            return this.validActions.every(({ action: fix }) => !!fix.isAI);
        }
    }
    const emptyCodeActionsResponse = { actions: [], documentation: undefined };
    async function getCodeActions(registry, model, rangeOrSelection, trigger, progress, token) {
        const filter = trigger.filter || {};
        const notebookFilter = {
            ...filter,
            excludes: [...(filter.excludes || []), types_1.CodeActionKind.Notebook],
        };
        const codeActionContext = {
            only: filter.include?.value,
            trigger: trigger.type,
        };
        const cts = new editorState_1.TextModelCancellationTokenSource(model, token);
        // if the trigger is auto (autosave, lightbulb, etc), we should exclude notebook codeActions
        const excludeNotebookCodeActions = (trigger.type === 2 /* languages.CodeActionTriggerType.Auto */);
        const providers = getCodeActionProviders(registry, model, (excludeNotebookCodeActions) ? notebookFilter : filter);
        const disposables = new lifecycle_1.DisposableStore();
        const promises = providers.map(async (provider) => {
            try {
                progress.report(provider);
                const providedCodeActions = await provider.provideCodeActions(model, rangeOrSelection, codeActionContext, cts.token);
                if (providedCodeActions) {
                    disposables.add(providedCodeActions);
                }
                if (cts.token.isCancellationRequested) {
                    return emptyCodeActionsResponse;
                }
                const filteredActions = (providedCodeActions?.actions || []).filter(action => action && (0, types_1.filtersAction)(filter, action));
                const documentation = getDocumentationFromProvider(provider, filteredActions, filter.include);
                return {
                    actions: filteredActions.map(action => new types_1.CodeActionItem(action, provider)),
                    documentation
                };
            }
            catch (err) {
                if ((0, errors_1.isCancellationError)(err)) {
                    throw err;
                }
                (0, errors_1.onUnexpectedExternalError)(err);
                return emptyCodeActionsResponse;
            }
        });
        const listener = registry.onDidChange(() => {
            const newProviders = registry.all(model);
            if (!(0, arrays_1.equals)(newProviders, providers)) {
                cts.cancel();
            }
        });
        try {
            const actions = await Promise.all(promises);
            const allActions = actions.map(x => x.actions).flat();
            const allDocumentation = [
                ...(0, arrays_1.coalesce)(actions.map(x => x.documentation)),
                ...getAdditionalDocumentationForShowingActions(registry, model, trigger, allActions)
            ];
            return new ManagedCodeActionSet(allActions, allDocumentation, disposables);
        }
        finally {
            listener.dispose();
            cts.dispose();
        }
    }
    exports.getCodeActions = getCodeActions;
    function getCodeActionProviders(registry, model, filter) {
        return registry.all(model)
            // Don't include providers that we know will not return code actions of interest
            .filter(provider => {
            if (!provider.providedCodeActionKinds) {
                // We don't know what type of actions this provider will return.
                return true;
            }
            return provider.providedCodeActionKinds.some(kind => (0, types_1.mayIncludeActionsOfKind)(filter, new types_1.CodeActionKind(kind)));
        });
    }
    function* getAdditionalDocumentationForShowingActions(registry, model, trigger, actionsToShow) {
        if (model && actionsToShow.length) {
            for (const provider of registry.all(model)) {
                if (provider._getAdditionalMenuItems) {
                    yield* provider._getAdditionalMenuItems?.({ trigger: trigger.type, only: trigger.filter?.include?.value }, actionsToShow.map(item => item.action));
                }
            }
        }
    }
    function getDocumentationFromProvider(provider, providedCodeActions, only) {
        if (!provider.documentation) {
            return undefined;
        }
        const documentation = provider.documentation.map(entry => ({ kind: new types_1.CodeActionKind(entry.kind), command: entry.command }));
        if (only) {
            let currentBest;
            for (const entry of documentation) {
                if (entry.kind.contains(only)) {
                    if (!currentBest) {
                        currentBest = entry;
                    }
                    else {
                        // Take best match
                        if (currentBest.kind.contains(entry.kind)) {
                            currentBest = entry;
                        }
                    }
                }
            }
            if (currentBest) {
                return currentBest?.command;
            }
        }
        // Otherwise, check to see if any of the provided actions match.
        for (const action of providedCodeActions) {
            if (!action.kind) {
                continue;
            }
            for (const entry of documentation) {
                if (entry.kind.contains(new types_1.CodeActionKind(action.kind))) {
                    return entry.command;
                }
            }
        }
        return undefined;
    }
    var ApplyCodeActionReason;
    (function (ApplyCodeActionReason) {
        ApplyCodeActionReason["OnSave"] = "onSave";
        ApplyCodeActionReason["FromProblemsView"] = "fromProblemsView";
        ApplyCodeActionReason["FromCodeActions"] = "fromCodeActions";
    })(ApplyCodeActionReason || (exports.ApplyCodeActionReason = ApplyCodeActionReason = {}));
    async function applyCodeAction(accessor, item, codeActionReason, options, token = cancellation_1.CancellationToken.None) {
        const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
        const commandService = accessor.get(commands_1.ICommandService);
        const telemetryService = accessor.get(telemetry_1.ITelemetryService);
        const notificationService = accessor.get(notification_1.INotificationService);
        telemetryService.publicLog2('codeAction.applyCodeAction', {
            codeActionTitle: item.action.title,
            codeActionKind: item.action.kind,
            codeActionIsPreferred: !!item.action.isPreferred,
            reason: codeActionReason,
        });
        await item.resolve(token);
        if (token.isCancellationRequested) {
            return;
        }
        if (item.action.edit?.edits.length) {
            const result = await bulkEditService.apply(item.action.edit, {
                editor: options?.editor,
                label: item.action.title,
                quotableLabel: item.action.title,
                code: 'undoredo.codeAction',
                respectAutoSaveConfig: codeActionReason !== ApplyCodeActionReason.OnSave,
                showPreview: options?.preview,
            });
            if (!result.isApplied) {
                return;
            }
        }
        if (item.action.command) {
            try {
                await commandService.executeCommand(item.action.command.id, ...(item.action.command.arguments || []));
            }
            catch (err) {
                const message = asMessage(err);
                notificationService.error(typeof message === 'string'
                    ? message
                    : nls.localize('applyCodeActionFailed', "An unknown error occurred while applying the code action"));
            }
        }
    }
    exports.applyCodeAction = applyCodeAction;
    function asMessage(err) {
        if (typeof err === 'string') {
            return err;
        }
        else if (err instanceof Error && typeof err.message === 'string') {
            return err.message;
        }
        else {
            return undefined;
        }
    }
    commands_1.CommandsRegistry.registerCommand('_executeCodeActionProvider', async function (accessor, resource, rangeOrSelection, kind, itemResolveCount) {
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.illegalArgument)();
        }
        const { codeActionProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(resource);
        if (!model) {
            throw (0, errors_1.illegalArgument)();
        }
        const validatedRangeOrSelection = selection_1.Selection.isISelection(rangeOrSelection)
            ? selection_1.Selection.liftSelection(rangeOrSelection)
            : range_1.Range.isIRange(rangeOrSelection)
                ? model.validateRange(rangeOrSelection)
                : undefined;
        if (!validatedRangeOrSelection) {
            throw (0, errors_1.illegalArgument)();
        }
        const include = typeof kind === 'string' ? new types_1.CodeActionKind(kind) : undefined;
        const codeActionSet = await getCodeActions(codeActionProvider, model, validatedRangeOrSelection, { type: 1 /* languages.CodeActionTriggerType.Invoke */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { includeSourceActions: true, include } }, progress_1.Progress.None, cancellation_1.CancellationToken.None);
        const resolving = [];
        const resolveCount = Math.min(codeActionSet.validActions.length, typeof itemResolveCount === 'number' ? itemResolveCount : 0);
        for (let i = 0; i < resolveCount; i++) {
            resolving.push(codeActionSet.validActions[i].resolve(cancellation_1.CancellationToken.None));
        }
        try {
            await Promise.all(resolving);
            return codeActionSet.validActions.map(item => item.action);
        }
        finally {
            setTimeout(() => codeActionSet.dispose(), 100);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi9icm93c2VyL2NvZGVBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBeUJuRixRQUFBLG1CQUFtQixHQUFHLDBCQUEwQixDQUFDO0lBQ2pELFFBQUEsaUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7SUFDN0MsUUFBQSxnQkFBZ0IsR0FBRyx1QkFBdUIsQ0FBQztJQUMzQyxRQUFBLGlCQUFpQixHQUFHLHdCQUF3QixDQUFDO0lBQzdDLFFBQUEsd0JBQXdCLEdBQUcsZ0NBQWdDLENBQUM7SUFDNUQsUUFBQSxxQkFBcUIsR0FBRyw0QkFBNEIsQ0FBQztJQUNyRCxRQUFBLHdCQUF3QixHQUFHLCtCQUErQixDQUFDO0lBQzNELFFBQUEsZUFBZSxHQUFHLHNCQUFzQixDQUFDO0lBRXRELE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7UUFFcEMsTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQXVCLEVBQUUsQ0FBdUI7WUFDN0YsSUFBSSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNyQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQztpQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVDLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNGLENBQUM7UUFFTyxNQUFNLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFrQixFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBa0I7WUFDaEcsSUFBSSxDQUFDLENBQUMs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