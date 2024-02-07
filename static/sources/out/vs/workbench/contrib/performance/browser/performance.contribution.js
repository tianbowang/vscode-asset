/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/performance/browser/perfviewEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiationService", "vs/base/common/event", "vs/workbench/contrib/performance/browser/inputLatencyContrib"], function (require, exports, nls_1, actions_1, instantiation_1, platform_1, actionCommonCategories_1, contributions_1, editor_1, perfviewEditor_1, editorService_1, instantiationService_1, event_1, inputLatencyContrib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // -- startup performance view
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(perfviewEditor_1.PerfviewContrib, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(perfviewEditor_1.PerfviewInput.Id, class {
        canSerialize() {
            return true;
        }
        serialize() {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(perfviewEditor_1.PerfviewInput);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perfview.show',
                title: (0, nls_1.localize2)('show.label', 'Startup Performance'),
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            return editorService.openEditor(instaService.createInstance(perfviewEditor_1.PerfviewInput), { pinned: true });
        }
    });
    (0, actions_1.registerAction2)(class PrintServiceCycles extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perf.insta.printAsyncCycles',
                title: (0, nls_1.localize2)('cycles', 'Print Service Cycles'),
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            if (instaService instanceof instantiationService_1.InstantiationService) {
                const cycle = instaService._globalGraph?.findCycleSlow();
                if (cycle) {
                    console.warn(`CYCLE`, cycle);
                }
                else {
                    console.warn(`YEAH, no more cycles`);
                }
            }
        }
    });
    (0, actions_1.registerAction2)(class PrintServiceTraces extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perf.insta.printTraces',
                title: (0, nls_1.localize2)('insta.trace', 'Print Service Traces'),
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run() {
            if (instantiationService_1.Trace.all.size === 0) {
                console.log('Enable via `instantiationService.ts#_enableAllTracing`');
                return;
            }
            for (const item of instantiationService_1.Trace.all) {
                console.log(item);
            }
        }
    });
    (0, actions_1.registerAction2)(class PrintEventProfiling extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perf.event.profiling',
                title: (0, nls_1.localize2)('emitter', 'Print Emitter Profiles'),
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run() {
            if (event_1.EventProfiling.all.size === 0) {
                console.log('USE `EmitterOptions._profName` to enable profiling');
                return;
            }
            for (const item of event_1.EventProfiling.all) {
                console.log(`${item.name}: ${item.invocationCount} invocations COST ${item.elapsedOverall}ms, ${item.listenerCount} listeners, avg cost is ${item.durations.reduce((a, b) => a + b, 0) / item.durations.length}ms`);
            }
        }
    });
    // -- input latency
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(inputLatencyContrib_1.InputLatencyContrib, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybWFuY2UuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wZXJmb3JtYW5jZS9icm93c2VyL3BlcmZvcm1hbmNlLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWdCaEcsOEJBQThCO0lBRTlCLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUMvRixnQ0FBZSwrQkFFZixDQUFDO0lBRUYsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLHlCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLHdCQUF3QixDQUMzRiw4QkFBYSxDQUFDLEVBQUUsRUFDaEI7UUFDQyxZQUFZO1lBQ1gsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsU0FBUztZQUNSLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNELFdBQVcsQ0FBQyxvQkFBMkM7WUFDdEQsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsOEJBQWEsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FDRCxDQUNELENBQUM7SUFHRixJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO1FBRXBDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxlQUFlO2dCQUNuQixLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsWUFBWSxFQUFFLHFCQUFxQixDQUFDO2dCQUNyRCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxTQUFTO2dCQUM5QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxZQUFZ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