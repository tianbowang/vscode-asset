/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/css!./aria"], function (require, exports, dom) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.status = exports.alert = exports.setARIAContainer = void 0;
    // Use a max length since we are inserting the whole msg in the DOM and that can cause browsers to freeze for long messages #94233
    const MAX_MESSAGE_LENGTH = 20000;
    let ariaContainer;
    let alertContainer;
    let alertContainer2;
    let statusContainer;
    let statusContainer2;
    function setARIAContainer(parent) {
        ariaContainer = document.createElement('div');
        ariaContainer.className = 'monaco-aria-container';
        const createAlertContainer = () => {
            const element = document.createElement('div');
            element.className = 'monaco-alert';
            element.setAttribute('role', 'alert');
            element.setAttribute('aria-atomic', 'true');
            ariaContainer.appendChild(element);
            return element;
        };
        alertContainer = createAlertContainer();
        alertContainer2 = createAlertContainer();
        const createStatusContainer = () => {
            const element = document.createElement('div');
            element.className = 'monaco-status';
            element.setAttribute('aria-live', 'polite');
            element.setAttribute('aria-atomic', 'true');
            ariaContainer.appendChild(element);
            return element;
        };
        statusContainer = createStatusContainer();
        statusContainer2 = createStatusContainer();
        parent.appendChild(ariaContainer);
    }
    exports.setARIAContainer = setARIAContainer;
    /**
     * Given the provided message, will make sure that it is read as alert to screen readers.
     */
    function alert(msg) {
        if (!ariaContainer) {
            return;
        }
        // Use alternate containers such that duplicated messages get read out by screen readers #99466
        if (alertContainer.textContent !== msg) {
            dom.clearNode(alertContainer2);
            insertMessage(alertContainer, msg);
        }
        else {
            dom.clearNode(alertContainer);
            insertMessage(alertContainer2, msg);
        }
    }
    exports.alert = alert;
    /**
     * Given the provided message, will make sure that it is read as status to screen readers.
     */
    function status(msg) {
        if (!ariaContainer) {
            return;
        }
        if (statusContainer.textContent !== msg) {
            dom.clearNode(statusContainer2);
            insertMessage(statusContainer, msg);
        }
        else {
            dom.clearNode(statusContainer);
            insertMessage(statusContainer2, msg);
        }
    }
    exports.status = status;
    function insertMessage(target, msg) {
        dom.clearNode(target);
        if (msg.length > MAX_MESSAGE_LENGTH) {
            msg = msg.substr(0, MAX_MESSAGE_LENGTH);
        }
        target.textContent = msg;
        // See https://www.paciellogroup.com/blog/2012/06/html5-accessibility-chops-aria-rolealert-browser-support/
        target.style.visibility = 'hidden';
        target.style.visibility = 'visible';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2FyaWEvYXJpYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsa0lBQWtJO0lBQ2xJLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0lBQ2pDLElBQUksYUFBMEIsQ0FBQztJQUMvQixJQUFJLGNBQTJCLENBQUM7SUFDaEMsSUFBSSxlQUE0QixDQUFDO0lBQ2pDLElBQUksZUFBNEIsQ0FBQztJQUNqQyxJQUFJLGdCQUE2QixDQUFDO0lBQ2xDLFNBQWdCLGdCQUFnQixDQUFDLE1BQW1CO1FBQ25ELGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7UUFFbEQsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLEVBQUU7WUFDakMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztZQUNuQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1QyxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUNGLGNBQWMsR0FBRyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3hDLGVBQWUsR0FBRyxvQkFBb0IsRUFBRSxDQUFDO1FBRXpDLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxFQUFFO1lBQ2xDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7WUFDcEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFDRixlQUFlLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztRQUMxQyxnQkFBZ0IsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQTNCRCw0Q0EyQkM7SUFDRDs7T0FFRztJQUNILFNBQWdCLEtBQUssQ0FBQyxHQUFXO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQixPQUFPO1FBQ1IsQ0FBQztRQUVELCtGQUErRjtRQUMvRixJQUFJLGNBQWMsQ0FBQyxXQUFXLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDeEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvQixhQUFhLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7YUFBTSxDQUFDO1lBQ1AsR0FBRyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QixhQUFhLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDRixDQUFDO0lBYkQsc0JBYUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLE1BQU0sQ0FBQyxHQUFXO1FBQ2pDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQixPQUFPO1FBQ1IsQ0FBQztRQUVELElBQUksZUFBZSxDQUFDLFdBQVcsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUN6QyxHQUFHLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDaEMsYUFBYSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNyQyxDQUFDO2FBQU0sQ0FBQztZQUNQLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0IsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFDRixDQUFDO0lBWkQsd0JBWUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxNQUFtQixFQUFFLEdBQVc7UUFDdEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFFekIsMkdBQTJHO1FBQzNHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDckMsQ0FBQyJ9