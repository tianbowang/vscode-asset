/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/browser/web.api", "vs/workbench/browser/web.main", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/base/common/performance", "vs/platform/actions/common/actions", "vs/base/common/async", "vs/base/common/arrays"], function (require, exports, web_api_1, web_main_1, lifecycle_1, commands_1, performance_1, actions_1, async_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workspace = exports.window = exports.env = exports.logger = exports.commands = exports.create = void 0;
    let created = false;
    const workbenchPromise = new async_1.DeferredPromise();
    /**
     * Creates the workbench with the provided options in the provided container.
     *
     * @param domElement the container to create the workbench in
     * @param options for setting up the workbench
     */
    function create(domElement, options) {
        // Mark start of workbench
        (0, performance_1.mark)('code/didLoadWorkbenchMain');
        // Assert that the workbench is not created more than once. We currently
        // do not support this and require a full context switch to clean-up.
        if (created) {
            throw new Error('Unable to create the VSCode workbench more than once.');
        }
        else {
            created = true;
        }
        // Register commands if any
        if (Array.isArray(options.commands)) {
            for (const command of options.commands) {
                commands_1.CommandsRegistry.registerCommand(command.id, (accessor, ...args) => {
                    // we currently only pass on the arguments but not the accessor
                    // to the command to reduce our exposure of internal API.
                    return command.handler(...args);
                });
                // Commands with labels appear in the command palette
                if (command.label) {
                    for (const menu of (0, arrays_1.asArray)(command.menu ?? web_api_1.Menu.CommandPalette)) {
                        actions_1.MenuRegistry.appendMenuItem(asMenuId(menu), { command: { id: command.id, title: command.label } });
                    }
                }
            }
        }
        // Startup workbench and resolve waiters
        let instantiatedWorkbench = undefined;
        new web_main_1.BrowserMain(domElement, options).open().then(workbench => {
            instantiatedWorkbench = workbench;
            workbenchPromise.complete(workbench);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            if (instantiatedWorkbench) {
                instantiatedWorkbench.shutdown();
            }
            else {
                workbenchPromise.p.then(instantiatedWorkbench => instantiatedWorkbench.shutdown());
            }
        });
    }
    exports.create = create;
    function asMenuId(menu) {
        switch (menu) {
            case web_api_1.Menu.CommandPalette: return actions_1.MenuId.CommandPalette;
            case web_api_1.Menu.StatusBarWindowIndicatorMenu: return actions_1.MenuId.StatusBarWindowIndicatorMenu;
        }
    }
    var commands;
    (function (commands) {
        /**
         * {@linkcode IWorkbench.commands IWorkbench.commands.executeCommand}
         */
        async function executeCommand(command, ...args) {
            const workbench = await workbenchPromise.p;
            return workbench.commands.executeCommand(command, ...args);
        }
        commands.executeCommand = executeCommand;
    })(commands || (exports.commands = commands = {}));
    var logger;
    (function (logger) {
        /**
         * {@linkcode IWorkbench.logger IWorkbench.logger.log}
         */
        function log(level, message) {
            workbenchPromise.p.then(workbench => workbench.logger.log(level, message));
        }
        logger.log = log;
    })(logger || (exports.logger = logger = {}));
    var env;
    (function (env) {
        /**
         * {@linkcode IWorkbench.env IWorkbench.env.retrievePerformanceMarks}
         */
        async function retrievePerformanceMarks() {
            const workbench = await workbenchPromise.p;
            return workbench.env.retrievePerformanceMarks();
        }
        env.retrievePerformanceMarks = retrievePerformanceMarks;
        /**
         * {@linkcode IWorkbench.env IWorkbench.env.getUriScheme}
         */
        async function getUriScheme() {
            const workbench = await workbenchPromise.p;
            return workbench.env.getUriScheme();
        }
        env.getUriScheme = getUriScheme;
        /**
         * {@linkcode IWorkbench.env IWorkbench.env.openUri}
         */
        async function openUri(target) {
            const workbench = await workbenchPromise.p;
            return workbench.env.openUri(target);
        }
        env.openUri = openUri;
    })(env || (exports.env = env = {}));
    var window;
    (function (window) {
        /**
         * {@linkcode IWorkbench.window IWorkbench.window.withProgress}
         */
        async function withProgress(options, task) {
            const workbench = await workbenchPromise.p;
            return workbench.window.withProgress(options, task);
        }
        window.withProgress = withProgress;
        async function createTerminal(options) {
            const workbench = await workbenchPromise.p;
            workbench.window.createTerminal(options);
        }
        window.createTerminal = createTerminal;
    })(window || (exports.window = window = {}));
    var workspace;
    (function (workspace) {
        /**
         * {@linkcode IWorkbench.workspace IWorkbench.workspace.openTunnel}
         */
        async function openTunnel(tunnelOptions) {
            const workbench = await workbenchPromise.p;
            return workbench.workspace.openTunnel(tunnelOptions);
        }
        workspace.openTunnel = openTunnel;
    })(workspace || (exports.workspace = workspace = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLmZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3dlYi5mYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHVCQUFlLEVBQWMsQ0FBQztJQUUzRDs7Ozs7T0FLRztJQUNILFNBQWdCLE1BQU0sQ0FBQyxVQUF1QixFQUFFLE9BQXNDO1FBRXJGLDBCQUEwQjtRQUMxQixJQUFBLGtCQUFJLEVBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUVsQyx3RUFBd0U7UUFDeEUscUVBQXFFO1FBQ3JFLElBQUksT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7UUFDMUUsQ0FBQzthQUFNLENBQUM7WUFDUCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCwyQkFBMkI7UUFDM0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3JDLEtBQUssTUFBTSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUV4QywyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFO29CQUNsRSwrREFBK0Q7b0JBQy9ELHlEQUF5RDtvQkFDekQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDO2dCQUVILHFEQUFxRDtnQkFDckQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ25CLEtBQUssTUFBTSxJQUFJLElB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