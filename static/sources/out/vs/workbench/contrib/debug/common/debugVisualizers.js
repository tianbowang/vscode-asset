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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugContext", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, lifecycle_1, types_1, contextkey_1, extensions_1, instantiation_1, log_1, debug_1, debugContext_1, debugModel_1, extensions_2, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugVisualizerService = exports.DebugVisualizer = exports.IDebugVisualizerService = void 0;
    exports.IDebugVisualizerService = (0, instantiation_1.createDecorator)('debugVisualizerService');
    class DebugVisualizer {
        get name() {
            return this.viz.name;
        }
        get iconPath() {
            return this.viz.iconPath;
        }
        get iconClass() {
            return this.viz.iconClass;
        }
        constructor(handle, viz) {
            this.handle = handle;
            this.viz = viz;
        }
        async resolve(token) {
            return this.viz.visualization ??= await this.handle.resolveDebugVisualizer(this.viz, token);
        }
        async execute() {
            await this.handle.executeDebugVisualizerCommand(this.viz.id);
        }
    }
    exports.DebugVisualizer = DebugVisualizer;
    let DebugVisualizerService = class DebugVisualizerService {
        constructor(contextKeyService, extensionService, logService) {
            this.contextKeyService = contextKeyService;
            this.extensionService = extensionService;
            this.logService = logService;
            this.handles = new Map();
            this.didActivate = new Map();
            this.registrations = [];
            visualizersExtensionPoint.setHandler((_, { added, removed }) => {
                this.registrations = this.registrations.filter(r => !removed.some(e => extensions_1.ExtensionIdentifier.equals(e.description.identifier, r.extensionId)));
                added.forEach(e => this.processExtensionRegistration(e.description));
            });
        }
        /** @inheritdoc */
        async getApplicableFor(variable, token) {
            const threadId = variable.getThreadId();
            if (threadId === undefined) { // an expression, not a variable
                return { object: [], dispose: () => { } };
            }
            const context = {
                sessionId: variable.getSession()?.getId() || '',
                containerId: variable.parent.getId(),
                threadId,
                variable: {
                    name: variable.name,
                    value: variable.value,
                    type: variable.type,
                    evaluateName: variable.evaluateName,
                    variablesReference: variable.reference || 0,
                    indexedVariables: variable.indexedVariables,
                    memoryReference: variable.memoryReference,
                    namedVariables: variable.namedVariables,
                    presentationHint: variable.presentationHint,
                }
            };
            for (let p = variable; p instanceof debugModel_1.Variable; p = p.parent) {
                if (p.parent instanceof debugModel_1.Scope) {
                    context.frameId = p.parent.stackFrame.frameId;
                }
            }
            const overlay = (0, debugContext_1.getContextForVariable)(this.contextKeyService, variable, [
                [debug_1.CONTEXT_VARIABLE_NAME.key, variable.name],
                [debug_1.CONTEXT_VARIABLE_VALUE.key, variable.value],
                [debug_1.CONTEXT_VARIABLE_TYPE.key, variable.type],
            ]);
            const maybeVisualizers = await Promise.all(this.registrations.map(async (registration) => {
                if (!overlay.contextMatchesRules(registration.expr)) {
                    return;
                }
                let prom = this.didActivate.get(registration.id);
                if (!prom) {
                    prom = this.extensionService.activateByEvent(`onDebugVisualizer:${registration.id}`);
                    this.didActivate.set(registration.id, prom);
                }
                await prom;
                if (token.isCancellationRequested) {
                    return;
                }
                const handle = this.handles.get(toKey(registration.extensionId, registration.id));
                return handle && { handle, result: await handle.provideDebugVisualizers(context, token) };
            }));
            const ref = {
                object: maybeVisualizers.filter(types_1.isDefined).flatMap(v => v.result.map(r => new DebugVisualizer(v.handle, r))),
                dispose: () => {
                    for (const viz of maybeVisualizers) {
                        viz?.handle.disposeDebugVisualizers(viz.result.map(r => r.id));
                    }
                },
            };
            if (token.isCancellationRequested) {
                ref.dispose();
            }
            return ref;
        }
        /** @inheritdoc */
        register(handle) {
            const key = toKey(handle.extensionId, handle.id);
            this.handles.set(key, handle);
            return (0, lifecycle_1.toDisposable)(() => this.handles.delete(key));
        }
        processExtensionRegistration(ext) {
            const viz = ext.contributes?.debugVisualizers;
            if (!(viz instanceof Array)) {
                return;
            }
            for (const { when, id } of viz) {
                try {
                    const expr = contextkey_1.ContextKeyExpr.deserialize(when);
                    if (expr) {
                        this.registrations.push({ expr, id, extensionId: ext.identifier });
                    }
                }
                catch (e) {
                    this.logService.error(`Error processing debug visualizer registration from extension '${ext.identifier.value}'`, e);
                }
            }
        }
    };
    exports.DebugVisualizerService = DebugVisualizerService;
    exports.DebugVisualizerService = DebugVisualizerService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, extensions_2.IExtensionService),
        __param(2, log_1.ILogService)
    ], DebugVisualizerService);
    const toKey = (extensionId, id) => `${extensions_1.ExtensionIdentifier.toKey(extensionId)}\0${id}`;
    const visualizersExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'debugVisualizers',
        jsonSchema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'Name of the debug visualizer'
                    },
                    when: {
                        type: 'string',
                        description: 'Condition when the debug visualizer is applicable'
                    }
                },
                required: ['id', 'when']
            }
        },
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                if (contrib.id) {
                    result.push(`onDebugVisualizer:${contrib.id}`);
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdWaXN1YWxpemVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL2RlYnVnVmlzdWFsaXplcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZW5GLFFBQUEsdUJBQXVCLEdBQUcsSUFBQSwrQkFBZSxFQUEwQix3QkFBd0IsQ0FBQyxDQUFDO0lBVzFHLE1BQWEsZUFBZTtRQUMzQixJQUFXLElBQUk7WUFDZCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFXLFFBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBVyxTQUFTO1lBQ25CLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDM0IsQ0FBQztRQUVELFlBQTZCLE1BQXdCLEVBQW1CLEdBQXdCO1lBQW5FLFdBQU0sR0FBTixNQUFNLENBQWtCO1lBQW1CLFFBQUcsR0FBSCxHQUFHLENBQXFCO1FBQUksQ0FBQztRQUU5RixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQXdCO1lBQzVDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEtBQUssTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBQ25CLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUM7S0FDRDtJQXRCRCwwQ0FzQkM7SUFnQk0sSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFB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