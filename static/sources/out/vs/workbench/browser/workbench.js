/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/async", "vs/base/browser/browser", "vs/base/common/performance", "vs/base/common/errors", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/instantiation/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/notifications/notificationsCenter", "vs/workbench/browser/parts/notifications/notificationsAlerts", "vs/workbench/browser/parts/notifications/notificationsStatus", "vs/workbench/browser/parts/notifications/notificationsTelemetry", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/workbench/browser/parts/notifications/notificationsToasts", "vs/base/browser/ui/aria/aria", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/base/common/errorMessage", "vs/workbench/browser/contextkeys", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiationService", "vs/workbench/browser/layout", "vs/workbench/services/host/browser/host", "vs/platform/dialogs/common/dialogs", "vs/base/browser/window", "vs/workbench/browser/style"], function (require, exports, nls_1, dom_1, event_1, async_1, browser_1, performance_1, errors_1, platform_1, platform_2, contributions_1, editor_1, extensions_1, layoutService_1, storage_1, configuration_1, lifecycle_1, notification_1, notificationsCenter_1, notificationsAlerts_1, notificationsStatus_1, notificationsTelemetry_1, notificationsCommands_1, notificationsToasts_1, aria_1, fontMeasurements_1, fontInfo_1, errorMessage_1, contextkeys_1, arrays_1, instantiationService_1, layout_1, host_1, dialogs_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Workbench = void 0;
    class Workbench extends layout_1.Layout {
        constructor(parent, options, serviceCollection, logService) {
            super(parent);
            this.options = options;
            this.serviceCollection = serviceCollection;
            this._onWillShutdown = this._register(new event_1.Emitter());
            this.onWillShutdown = this._onWillShutdown.event;
            this._onDidShutdown = this._register(new event_1.Emitter());
            this.onDidShutdown = this._onDidShutdown.event;
            this.previousUnexpectedError = { message: undefined, time: 0 };
            // Perf: measure workbench startup time
            (0, performance_1.mark)('code/willStartWorkbench');
            this.registerErrorHandler(logService);
        }
        registerErrorHandler(logService) {
            // Listen on unhandled rejection events
            this._register((0, dom_1.addDisposableListener)(window_1.mainWindow, 'unhandledrejection', event => {
                // See https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
                (0, errors_1.onUnexpectedError)(event.reason);
                // Prevent the printing of this event to the console
                event.preventDefault();
            }));
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => this.handleUnexpectedError(error, logService));
            if (typeof window_1.mainWindow.require?.config === 'function') {
                window_1.mainWindow.require.config({
                    onError: (err) => {
                        if (err.phase === 'loading') {
                            (0, errors_1.onUnexpectedError)(new Error((0, nls_1.localize)('loaderErrorNative', "Failed to load a required file. Please restart the application to try again. Details: {0}", JSON.stringify(err))));
                        }
                        console.error(err);
                    }
                });
            }
        }
        handleUnexpectedError(error, logService) {
            const message = (0, errorMessage_1.toErrorMessage)(error, true);
            if (!message) {
                return;
            }
            const now = Date.now();
            if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1000) {
                return; // Return if error message identical to previous and shorter than 1 second
            }
            this.previousUnexpectedError.time = now;
            this.previousUnexpectedError.message = message;
            // Log it
            logService.error(message);
        }
        startup() {
            try {
                // Configure emitter leak warning threshold
                (0, event_1.setGlobalLeakWarningThreshold)(175);
                // Services
                const instantiationService = this.initServices(this.serviceCollection);
                instantiationService.invokeFunction(accessor => {
                    const lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const configurationService = accessor.get(configuration_1.IConfigurationService);
                    const hostService = accessor.get(host_1.IHostService);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    // Layout
                    this.initLayout(accessor);
                    // Registries
                    platform_1.Registry.as(contributions_1.Extensions.Workbench).start(accessor);
                    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).start(accessor);
                    // Context Keys
                    this._register(instantiationService.createInstance(contextkeys_1.WorkbenchContextKeysHandler));
                    // Register Listeners
                    this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
                    // Render Workbench
                    this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);
                    // Workbench Layout
                    this.createWorkbenchLayout();
                    // Layout
                    this.layout();
                    // Restore
                    this.restore(lifecycleService);
                });
                return instantiationService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                throw error; // rethrow because this is a critical issue we cannot handle properly here
            }
        }
        initServices(serviceCollection) {
            // Layout Service
            serviceCollection.set(layoutService_1.IWorkbenchLayoutService, this);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // All Contributed Services
            const contributedServices = (0, extensions_1.getSingletonServiceDescriptors)();
            for (const [id, descriptor] of contributedServices) {
                serviceCollection.set(id, descriptor);
            }
            const instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            // Wrap up
            instantiationService.invokeFunction(accessor => {
                const lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
                // TODO@Sandeep debt around cyclic dependencies
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                if (typeof configurationService.acquireInstantiationService === 'function') {
                    configurationService.acquireInstantiationService(instantiationService);
                }
                // Signal to lifecycle that services are set
                lifecycleService.phase = 2 /* LifecyclePhase.Ready */;
            });
            return instantiationService;
        }
        registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
            // Configuration changes
            this._register(configurationService.onDidChangeConfiguration(e => this.updateFontAliasing(e, configurationService)));
            // Font Info
            if (platform_2.isNative) {
                this._register(storageService.onWillSaveState(e => {
                    if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                        this.storeFontInfo(storageService);
                    }
                }));
            }
            else {
                this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
            }
            // Lifecycle
            this._register(lifecycleService.onWillShutdown(event => this._onWillShutdown.fire(event)));
            this._register(lifecycleService.onDidShutdown(() => {
                this._onDidShutdown.fire();
                this.dispose();
            }));
            // In some environments we do not get enough time to persist state on shutdown.
            // In other cases, VSCode might crash, so we periodically save state to reduce
            // the chance of loosing any state.
            // The window loosing focus is a good indication that the user has stopped working
            // in that window so we pick that at a time to collect state.
            this._register(hostService.onDidChangeFocus(focus => {
                if (!focus) {
                    storageService.flush();
                }
            }));
            // Dialogs showing/hiding
            this._register(dialogService.onWillShowDialog(() => this.mainContainer.classList.add('modal-dialog-visible')));
            this._register(dialogService.onDidShowDialog(() => this.mainContainer.classList.remove('modal-dialog-visible')));
        }
        updateFontAliasing(e, configurationService) {
            if (!platform_2.isMacintosh) {
                return; // macOS only
            }
            if (e && !e.affectsConfiguration('workbench.fontAliasing')) {
                return;
            }
            const aliasing = configurationService.getValue('workbench.fontAliasing');
            if (this.fontAliasing === aliasing) {
                return;
            }
            this.fontAliasing = aliasing;
            // Remove all
            const fontAliasingValues = ['antialiased', 'none', 'auto'];
            this.mainContainer.classList.remove(...fontAliasingValues.map(value => `monaco-font-aliasing-${value}`));
            // Add specific
            if (fontAliasingValues.some(option => option === aliasing)) {
                this.mainContainer.classList.add(`monaco-font-aliasing-${aliasing}`);
            }
        }
        restoreFontInfo(storageService, configurationService) {
            const storedFontInfoRaw = storageService.get('editorFontInfo', -1 /* StorageScope.APPLICATION */);
            if (storedFontInfoRaw) {
                try {
                    const storedFontInfo = JSON.parse(storedFontInfoRaw);
                    if (Array.isArray(storedFontInfo)) {
                        fontMeasurements_1.FontMeasurements.restoreFontInfo(storedFontInfo);
                    }
                }
                catch (err) {
                    /* ignore */
                }
            }
            fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(configurationService.getValue('editor'), browser_1.PixelRatio.value));
        }
        storeFontInfo(storageService) {
            const serializedFontInfo = fontMeasurements_1.FontMeasurements.serializeFontInfo();
            if (serializedFontInfo) {
                storageService.store('editorFontInfo', JSON.stringify(serializedFontInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
            // ARIA
            (0, aria_1.setARIAContainer)(this.mainContainer);
            // State specific classes
            const platformClass = platform_2.isWindows ? 'windows' : platform_2.isLinux ? 'linux' : 'mac';
            const workbenchClasses = (0, arrays_1.coalesce)([
                'monaco-workbench',
                platformClass,
                platform_2.isWeb ? 'web' : undefined,
                browser_1.isChrome ? 'chromium' : browser_1.isFirefox ? 'firefox' : browser_1.isSafari ? 'safari' : undefined,
                ...this.getLayoutClasses(),
                ...(this.options?.extraClasses ? this.options.extraClasses : [])
            ]);
            this.mainContainer.classList.add(...workbenchClasses);
            window_1.mainWindow.document.body.classList.add(platformClass); // used by our fonts
            if (platform_2.isWeb) {
                window_1.mainWindow.document.body.classList.add('web');
            }
            // Apply font aliasing
            this.updateFontAliasing(undefined, configurationService);
            // Warm up font cache information before building up too many dom elements
            this.restoreFontInfo(storageService, configurationService);
            // Create Parts
            for (const { id, role, classes, options } of [
                { id: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, role: 'none', classes: ['titlebar'] },
                { id: "workbench.parts.banner" /* Parts.BANNER_PART */, role: 'banner', classes: ['banner'] },
                { id: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, role: 'none', classes: ['activitybar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] }, // Use role 'none' for some parts to make screen readers less chatty #114892
                { id: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, role: 'none', classes: ['sidebar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
                { id: "workbench.parts.editor" /* Parts.EDITOR_PART */, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
                { id: "workbench.parts.panel" /* Parts.PANEL_PART */, role: 'none', classes: ['panel', 'basepanel', (0, layoutService_1.positionToString)(this.getPanelPosition())] },
                { id: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, role: 'none', classes: ['auxiliarybar', 'basepanel', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'right' : 'left'] },
                { id: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, role: 'status', classes: ['statusbar'] }
            ]) {
                const partContainer = this.createPart(id, role, classes);
                (0, performance_1.mark)(`code/willCreatePart/${id}`);
                this.getPart(id).create(partContainer, options);
                (0, performance_1.mark)(`code/didCreatePart/${id}`);
            }
            // Notification Handlers
            this.createNotificationsHandlers(instantiationService, notificationService);
            // Add Workbench to DOM
            this.parent.appendChild(this.mainContainer);
        }
        createPart(id, role, classes) {
            const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
            part.classList.add('part', ...classes);
            part.id = id;
            part.setAttribute('role', role);
            if (role === 'status') {
                part.setAttribute('aria-live', 'off');
            }
            return part;
        }
        createNotificationsHandlers(instantiationService, notificationService) {
            // Instantiate Notification components
            const notificationsCenter = this._register(instantiationService.createInstance(notificationsCenter_1.NotificationsCenter, this.mainContainer, notificationService.model));
            const notificationsToasts = this._register(instantiationService.createInstance(notificationsToasts_1.NotificationsToasts, this.mainContainer, notificationService.model));
            this._register(instantiationService.createInstance(notificationsAlerts_1.NotificationsAlerts, notificationService.model));
            const notificationsStatus = instantiationService.createInstance(notificationsStatus_1.NotificationsStatus, notificationService.model);
            this._register(instantiationService.createInstance(notificationsTelemetry_1.NotificationsTelemetry));
            // Visibility
            this._register(notificationsCenter.onDidChangeVisibility(() => {
                notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
                notificationsToasts.update(notificationsCenter.isVisible);
            }));
            this._register(notificationsToasts.onDidChangeVisibility(() => {
                notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
            }));
            // Register Commands
            (0, notificationsCommands_1.registerNotificationCommands)(notificationsCenter, notificationsToasts, notificationService.model);
            // Register with Layout
            this.registerNotifications({
                onDidChangeNotificationsVisibility: event_1.Event.map(event_1.Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
            });
        }
        restore(lifecycleService) {
            // Ask each part to restore
            try {
                this.restoreParts();
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
            }
            // Transition into restored phase after layout has restored
            // but do not wait indefinitely on this to account for slow
            // editors restoring. Since the workbench is fully functional
            // even when the visible editors have not resolved, we still
            // want contributions on the `Restored` phase to work before
            // slow editors have resolved. But we also do not want fast
            // editors to resolve slow when too many contributions get
            // instantiated, so we find a middle ground solution via
            // `Promise.race`
            this.whenReady.finally(() => Promise.race([
                this.whenRestored,
                (0, async_1.timeout)(2000)
            ]).finally(() => {
                // Update perf marks only when the layout is fully
                // restored. We want the time it takes to restore
                // editors to be included in these numbers
                function markDidStartWorkbench() {
                    (0, performance_1.mark)('code/didStartWorkbench');
                    performance.measure('perf: workbench create & restore', 'code/didLoadWorkbenchMain', 'code/didStartWorkbench');
                }
                if (this.isRestored()) {
                    markDidStartWorkbench();
                }
                else {
                    this.whenRestored.finally(() => markDidStartWorkbench());
                }
                // Set lifecycle phase to `Restored`
                lifecycleService.phase = 3 /* LifecyclePhase.Restored */;
                // Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
                const eventuallyPhaseScheduler = this._register(new async_1.RunOnceScheduler(() => {
                    this._register((0, dom_1.runWhenWindowIdle)(window_1.mainWindow, () => lifecycleService.phase = 4 /* LifecyclePhase.Eventually */, 2500));
                }, 2500));
                eventuallyPhaseScheduler.schedule();
            }));
        }
    }
    exports.Workbench = Workbench;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci93b3JrYmVuY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0RoRyxNQUFhLFNBQVUsU0FBUSxlQUFNO1FBUXBDLFlBQ0MsTUFBbUIsRUFDRixPQUFzQyxFQUN0QyxpQkFBb0MsRUFDckQsVUFBdUI7WUFFdkIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBSkcsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7WUFDdEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQVRyQyxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUMzRSxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBRXBDLG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDN0Qsa0JBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQTBEM0MsNEJBQXVCLEdBQWtELEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFoRGhILHVDQUF1QztZQUN2QyxJQUFBLGtCQUFJLEVBQUMseUJBQXlCLENBQUMsQ0FBQztZQUVoQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVPLG9CQUFvQixDQUFDLFVBQXVCO1lBRW5ELHVDQUF1QztZQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsbUJBQVUsRUFBRSxvQkFBb0IsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFFOUUsNkVBQTZFO2dCQUM3RSxJQUFBLDBCQUFpQixFQUFD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