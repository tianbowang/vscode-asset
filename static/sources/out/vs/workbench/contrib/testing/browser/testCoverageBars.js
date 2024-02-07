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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/assert", "vs/base/common/htmlContent", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/observable", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testCoverage", "vs/workbench/contrib/testing/common/testCoverageService", "vs/platform/hover/browser/hover"], function (require, exports, dom_1, assert_1, htmlContent_1, lazy_1, lifecycle_1, numbers_1, observable_1, types_1, nls_1, configuration_1, colorRegistry_1, configuration_2, testCoverage_1, testCoverageService_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExplorerTestCoverageBars = exports.ManagedTestCoverageBars = void 0;
    let ManagedTestCoverageBars = class ManagedTestCoverageBars extends lifecycle_1.Disposable {
        /** Gets whether coverage is currently visible for the resource. */
        get visible() {
            return !!this._coverage;
        }
        constructor(options, hoverService, configurationService) {
            super();
            this.options = options;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this.el = new lazy_1.Lazy(() => {
                if (this.options.compact) {
                    const el = (0, dom_1.h)('.test-coverage-bars.compact', [
                        (0, dom_1.h)('.tpc@overall'),
                        (0, dom_1.h)('.bar@tpcBar'),
                    ]);
                    this.attachHover(el.tpcBar, getOverallHoverText);
                    return el;
                }
                else {
                    const el = (0, dom_1.h)('.test-coverage-bars', [
                        (0, dom_1.h)('.tpc@overall'),
                        (0, dom_1.h)('.bar@statement'),
                        (0, dom_1.h)('.bar@function'),
                        (0, dom_1.h)('.bar@branch'),
                    ]);
                    this.attachHover(el.statement, stmtCoverageText);
                    this.attachHover(el.function, fnCoverageText);
                    this.attachHover(el.branch, branchCoverageText);
                    return el;
                }
            });
            this.visibleStore = this._register(new lifecycle_1.DisposableStore());
        }
        attachHover(target, factory) {
            target.onmouseenter = () => {
                if (!this._coverage) {
                    return;
                }
                const content = factory(this._coverage);
                if (!content) {
                    return;
                }
                const hover = this.hoverService.showHover({
                    content,
                    target,
                    appearance: {
                        showPointer: true,
                        compact: true,
                        skipFadeInAnimation: true,
                    }
                });
                if (hover) {
                    this.visibleStore.add(hover);
                }
            };
        }
        setCoverageInfo(coverage) {
            const ds = this.visibleStore;
            if (!coverage) {
                if (this._coverage) {
                    this._coverage = undefined;
                    ds.clear();
                }
                return;
            }
            if (!this._coverage) {
                const root = this.el.value.root;
                ds.add((0, lifecycle_1.toDisposable)(() => this.options.container.removeChild(root)));
                this.options.container.appendChild(root);
                ds.add(this.configurationService.onDidChangeConfiguration(c => {
                    if (!this._coverage) {
                        return;
                    }
                    if (c.affectsConfiguration("testing.displayedCoveragePercent" /* TestingConfigKeys.CoveragePercent */) || c.affectsConfiguration("testing.coverageBarThresholds" /* TestingConfigKeys.CoverageBarThresholds */)) {
                        this.doRender(this._coverage);
                    }
                }));
            }
            this._coverage = coverage;
            this.doRender(coverage);
        }
        doRender(coverage) {
            const el = this.el.value;
            const precision = this.options.compact ? 0 : 2;
            const thresholds = (0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.coverageBarThresholds" /* TestingConfigKeys.CoverageBarThresholds */);
            const overallStat = calculateDisplayedStat(coverage, (0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.displayedCoveragePercent" /* TestingConfigKeys.CoveragePercent */));
            el.overall.textContent = displayPercent(overallStat, precision);
            if ('tpcBar' in el) { // compact mode
                renderBar(el.tpcBar, overallStat, false, thresholds);
            }
            else {
                renderBar(el.statement, percent(coverage.statement), coverage.statement.total === 0, thresholds);
                renderBar(el.function, coverage.function && percent(coverage.function), coverage.function?.total === 0, thresholds);
                renderBar(el.branch, coverage.branch && percent(coverage.branch), coverage.branch?.total === 0, thresholds);
            }
        }
    };
    exports.ManagedTestCoverageBars = ManagedTestCoverageBars;
    exports.ManagedTestCoverageBars = ManagedTestCoverageBars = __decorate([
        __param(1, hover_1.IHoverService),
        __param(2, configuration_1.IConfigurationService)
    ], ManagedTestCoverageBars);
    const percent = (cc) => (0, numbers_1.clamp)(cc.total === 0 ? 1 : cc.covered / cc.total, 0, 1);
    const epsilon = 10e-8;
    const barWidth = 16;
    const renderBar = (bar, pct, isZero, thresholds) => {
        if (pct === undefined) {
            bar.style.display = 'none';
            return;
        }
        bar.style.display = 'block';
        bar.style.width = `${barWidth}px`;
        // this is floored so the bar is only completely filled at 100% and not 99.9%
        bar.style.setProperty('--test-bar-width', `${Math.floor(pct * 16)}px`);
        if (isZero) {
            bar.style.color = 'currentColor';
            bar.style.opacity = '0.5';
            return;
        }
        let best = colorThresholds[0].color; //  red
        let distance = pct;
        for (const { key, color } of colorThresholds) {
            const t = thresholds[key] / 100;
            if (t && pct >= t && pct - t < distance) {
                best = color;
                distance = pct - t;
            }
        }
        bar.style.color = best;
        bar.style.opacity = '1';
    };
    const colorThresholds = [
        { color: `var(${(0, colorRegistry_1.asCssVariableName)(colorRegistry_1.chartsRed)})`, key: 'red' },
        { color: `var(${(0, colorRegistry_1.asCssVariableName)(colorRegistry_1.chartsYellow)})`, key: 'yellow' },
        { color: `var(${(0, colorRegistry_1.asCssVariableName)(colorRegistry_1.chartsGreen)})`, key: 'green' },
    ];
    const calculateDisplayedStat = (coverage, method) => {
        switch (method) {
            case "statement" /* TestingDisplayedCoveragePercent.Statement */:
                return percent(coverage.statement);
            case "minimum" /* TestingDisplayedCoveragePercent.Minimum */: {
                let value = percent(coverage.statement);
                if (coverage.branch) {
                    value = Math.min(value, percent(coverage.branch));
                }
                if (coverage.function) {
                    value = Math.min(value, percent(coverage.function));
                }
                return value;
            }
            case "totalCoverage" /* TestingDisplayedCoveragePercent.TotalCoverage */:
                return (0, testCoverage_1.getTotalCoveragePercent)(coverage.statement, coverage.branch, coverage.function);
            default:
                (0, assert_1.assertNever)(method);
        }
    };
    const displayPercent = (value, precision = 2) => {
        const display = (value * 100).toFixed(precision);
        // avoid showing 100% coverage if it just rounds up:
        if (value < 1 - epsilon && display === '100') {
            return `${100 - (10 ** -precision)}%`;
        }
        return `${display}%`;
    };
    const stmtCoverageText = (coverage) => (0, nls_1.localize)('statementCoverage', '{0}/{1} statements covered ({2})', coverage.statement.covered, coverage.statement.total, displayPercent(percent(coverage.statement)));
    const fnCoverageText = (coverage) => coverage.function && (0, nls_1.localize)('functionCoverage', '{0}/{1} functions covered ({2})', coverage.function.covered, coverage.function.total, displayPercent(percent(coverage.function)));
    const branchCoverageText = (coverage) => coverage.branch && (0, nls_1.localize)('branchCoverage', '{0}/{1} branches covered ({2})', coverage.branch.covered, coverage.branch.total, displayPercent(percent(coverage.branch)));
    const getOverallHoverText = (coverage) => new htmlContent_1.MarkdownString([
        stmtCoverageText(coverage),
        fnCoverageText(coverage),
        branchCoverageText(coverage),
    ].filter(types_1.isDefined).join('\n\n'));
    /**
     * Renders test coverage bars for a resource in the given container. It will
     * not render anything unless a test coverage report has been opened.
     */
    let ExplorerTestCoverageBars = class ExplorerTestCoverageBars extends ManagedTestCoverageBars {
        constructor(options, hoverService, configurationService, testCoverageService) {
            super(options, hoverService, configurationService);
            this.resource = (0, observable_1.observableValue)(this, undefined);
            const isEnabled = (0, configuration_2.observeTestingConfiguration)(configurationService, "testing.showCoverageInExplorer" /* TestingConfigKeys.ShowCoverageInExplorer */);
            this._register((0, observable_1.autorun)(async (reader) => {
                let info;
                const coverage = testCoverageService.selected.read(reader);
                if (coverage && isEnabled.read(reader)) {
                    const resource = this.resource.read(reader);
                    if (resource) {
                        info = coverage.getComputedForUri(resource);
                    }
                }
                this.setCoverageInfo(info);
            }));
        }
        /** @inheritdoc */
        setResource(resource, transaction) {
            this.resource.set(resource, transaction);
        }
        setCoverageInfo(coverage) {
            super.setCoverageInfo(coverage);
            this.options.container?.classList.toggle('explorer-item-with-test-coverage', this.visible);
        }
    };
    exports.ExplorerTestCoverageBars = ExplorerTestCoverageBars;
    exports.ExplorerTestCoverageBars = ExplorerTestCoverageBars = __decorate([
        __param(1, hover_1.IHoverService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, testCoverageService_1.ITestCoverageService)
    ], ExplorerTestCoverageBars);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvdmVyYWdlQmFycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9icm93c2VyL3Rlc3RDb3ZlcmFnZUJhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0N6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBMEJ0RCxtRUFBbUU7UUFDbkUsSUFBVyxPQUFPO1lBQ2pCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDekIsQ0FBQztRQUVELFlBQ29CLE9BQWdDLEVBQ3BDLFlBQTRDLEVBQ3BDLG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUpXLFlBQU8sR0FBUCxPQUFPLENBQXlCO1lBQ25CLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFoQ25FLE9BQUUsR0FBRyxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ25DLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxFQUFFLEdBQUcsSUFBQSxPQUFDLEVBQUMsNkJBQTZCLEVBQUU7d0JBQzNDLElBQUEsT0FBQyxFQUFDLGNBQWMsQ0FBQzt3QkFDakIsSUFBQSxPQUFDLEVBQUMsYUFBYSxDQUFDO3FCQUNoQixDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7b0JBQ2pELE9BQU8sRUFBRSxDQUFDO2dCQUNYLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxNQUFNLEVBQUUsR0FBRyxJQUFBLE9BQUMsRUFBQyxxQkFBcUIsRUFBRTt3QkFDbkMsSUFBQSxPQUFDLEVBQUMsY0FBYyxD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