/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/date", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/comments/common/commentsConfiguration"], function (require, exports, dom, date_1, lifecycle_1, platform_1, commentsConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimestampWidget = void 0;
    class TimestampWidget extends lifecycle_1.Disposable {
        constructor(configurationService, container, timeStamp) {
            super();
            this.configurationService = configurationService;
            this._date = dom.append(container, dom.$('span.timestamp'));
            this._date.style.display = 'none';
            this._useRelativeTime = this.useRelativeTimeSetting;
            this.setTimestamp(timeStamp);
        }
        get useRelativeTimeSetting() {
            return this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION).useRelativeTime;
        }
        async setTimestamp(timestamp) {
            if ((timestamp !== this._timestamp) || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
                this.updateDate(timestamp);
            }
            this._timestamp = timestamp;
            this._useRelativeTime = this.useRelativeTimeSetting;
        }
        updateDate(timestamp) {
            if (!timestamp) {
                this._date.textContent = '';
                this._date.style.display = 'none';
            }
            else if ((timestamp !== this._timestamp)
                || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
                this._date.style.display = '';
                let textContent;
                let tooltip;
                if (this.useRelativeTimeSetting) {
                    textContent = this.getRelative(timestamp);
                    tooltip = this.getDateString(timestamp);
                }
                else {
                    textContent = this.getDateString(timestamp);
                }
                this._date.textContent = textContent;
                if (tooltip) {
                    this._date.title = tooltip;
                }
            }
        }
        getRelative(date) {
            return (0, date_1.fromNow)(date, true, true);
        }
        getDateString(date) {
            return date.toLocaleString(platform_1.language);
        }
    }
    exports.TimestampWidget = TimestampWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL3RpbWVzdGFtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxlQUFnQixTQUFRLHNCQUFVO1FBSzlDLFlBQW9CLG9CQUEyQyxFQUFFLFNBQXNCLEVBQUUsU0FBZ0I7WUFDeEcsS0FBSyxFQUFFLENBQUM7WUFEVyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRTlELElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBQ3BELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQVksc0JBQXNCO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBeUIsd0NBQWdCLENBQUMsQ0FBQyxlQUFlLENBQUM7UUFDckcsQ0FBQztRQUVNLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBMkI7WUFDcEQsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztnQkFDaEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUNyRCxDQUFDO1FBRU8sVUFBVSxDQUFDLFNBQWdCO1lBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ25DLENBQUM7aUJBQU0sSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDO21CQUN0QyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO2dCQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUM5QixJQUFJLFdBQW1CLENBQUM7Z0JBQ3hCLElBQUksT0FBMkIsQ0FBQztnQkFDaEMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztvQkFDakMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdDLENBQUM7Z0JBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUNyQyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztnQkFDNUIsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRU8sV0FBVyxDQUFDLElBQVU7WUFDN0IsT0FBTyxJQUFBLGNBQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyxhQUFhLENBQUMsSUFBVTtZQUMvQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQVEsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FDRDtJQXZERCwwQ0F1REMifQ==