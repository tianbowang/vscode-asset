/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.endLoggingFS = exports.beginLoggingFS = exports.endTrackingDisposables = exports.beginTrackingDisposables = void 0;
    class DisposableTracker {
        constructor() {
            this.allDisposables = [];
        }
        trackDisposable(x) {
            this.allDisposables.push([x, new Error().stack]);
        }
        setParent(child, parent) {
            for (let idx = 0; idx < this.allDisposables.length; idx++) {
                if (this.allDisposables[idx][0] === child) {
                    this.allDisposables.splice(idx, 1);
                    return;
                }
            }
        }
        markAsDisposed(x) {
            for (let idx = 0; idx < this.allDisposables.length; idx++) {
                if (this.allDisposables[idx][0] === x) {
                    this.allDisposables.splice(idx, 1);
                    return;
                }
            }
        }
        markAsSingleton(disposable) {
            // noop
        }
    }
    let currentTracker = null;
    function beginTrackingDisposables() {
        currentTracker = new DisposableTracker();
        (0, lifecycle_1.setDisposableTracker)(currentTracker);
    }
    exports.beginTrackingDisposables = beginTrackingDisposables;
    function endTrackingDisposables() {
        if (currentTracker) {
            (0, lifecycle_1.setDisposableTracker)(null);
            console.log(currentTracker.allDisposables.map(e => `${e[0]}\n${e[1]}`).join('\n\n'));
            currentTracker = null;
        }
    }
    exports.endTrackingDisposables = endTrackingDisposables;
    function beginLoggingFS(withStacks = false) {
        self.beginLoggingFS?.(withStacks);
    }
    exports.beginLoggingFS = beginLoggingFS;
    function endLoggingFS() {
        self.endLoggingFS?.();
    }
    exports.endLoggingFS = endLoggingFS;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvdWJsZXNob290aW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL3Ryb3VibGVzaG9vdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBTSxpQkFBaUI7UUFBdkI7WUFDQyxtQkFBYyxHQUE0QixFQUFFLENBQUM7UUF1QjlDLENBQUM7UUF0QkEsZUFBZSxDQUFDLENBQWM7WUFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxTQUFTLENBQUMsS0FBa0IsRUFBRSxNQUFtQjtZQUNoRCxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDM0QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUMzQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25DLE9BQU87Z0JBQ1IsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBQ0QsY0FBYyxDQUFDLENBQWM7WUFDNUIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQzNELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDdkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNuQyxPQUFPO2dCQUNSLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUNELGVBQWUsQ0FBQyxVQUF1QjtZQUN0QyxPQUFPO1FBQ1IsQ0FBQztLQUNEO0lBRUQsSUFBSSxjQUFjLEdBQTZCLElBQUksQ0FBQztJQUVwRCxTQUFnQix3QkFBd0I7UUFDdkMsY0FBYyxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUN6QyxJQUFBLGdDQUFvQixFQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFIRCw0REFHQztJQUVELFNBQWdCLHNCQUFzQjtRQUNyQyxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ3BCLElBQUEsZ0NBQW9CLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdEYsY0FBYyxHQUFHLElBQUksQ0FBQztRQUN2QixDQUFDO0lBQ0YsQ0FBQztJQU5ELHdEQU1DO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLGFBQXNCLEtBQUs7UUFDbkQsSUFBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFGRCx3Q0FFQztJQUVELFNBQWdCLFlBQVk7UUFDckIsSUFBSyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUZELG9DQUVDIn0=