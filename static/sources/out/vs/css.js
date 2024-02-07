/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = void 0;
    /**
     * Invoked by the loader at run-time
     *
     * @skipMangle
     */
    function load(name, req, load, config) {
        config = config || {};
        const cssConfig = (config['vs/css'] || {});
        if (cssConfig.disabled) {
            // the plugin is asked to not create any style sheets
            load({});
            return;
        }
        const cssUrl = req.toUrl(name + '.css');
        loadCSS(name, cssUrl, () => {
            load({});
        }, (err) => {
            if (typeof load.error === 'function') {
                load.error('Could not find ' + cssUrl + '.');
            }
        });
    }
    exports.load = load;
    function loadCSS(name, cssUrl, callback, errorback) {
        if (linkTagExists(name, cssUrl)) {
            callback();
            return;
        }
        createLinkTag(name, cssUrl, callback, errorback);
    }
    function linkTagExists(name, cssUrl) {
        // eslint-disable-next-line no-restricted-globals
        const links = window.document.getElementsByTagName('link');
        for (let i = 0, len = links.length; i < len; i++) {
            const nameAttr = links[i].getAttribute('data-name');
            const hrefAttr = links[i].getAttribute('href');
            if (nameAttr === name || hrefAttr === cssUrl) {
                return true;
            }
        }
        return false;
    }
    function createLinkTag(name, cssUrl, callback, errorback) {
        const linkNode = document.createElement('link');
        linkNode.setAttribute('rel', 'stylesheet');
        linkNode.setAttribute('type', 'text/css');
        linkNode.setAttribute('data-name', name);
        attachListeners(name, linkNode, callback, errorback);
        linkNode.setAttribute('href', cssUrl);
        // eslint-disable-next-line no-restricted-globals
        const head = window.document.head || window.document.getElementsByTagName('head')[0];
        head.appendChild(linkNode);
    }
    function attachListeners(name, linkNode, callback, errorback) {
        const unbind = () => {
            linkNode.removeEventListener('load', loadEventListener);
            linkNode.removeEventListener('error', errorEventListener);
        };
        const loadEventListener = (e) => {
            unbind();
            callback();
        };
        const errorEventListener = (e) => {
            unbind();
            errorback(e);
        };
        linkNode.addEventListener('load', loadEventListener);
        linkNode.addEventListener('error', errorEventListener);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9jc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHOzs7O09BSUc7SUFDSCxTQUFnQixJQUFJLENBQUMsSUFBWSxFQUFFLEdBQStCLEVBQUUsSUFBbUMsRUFBRSxNQUF1QztRQUMvSSxNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUN0QixNQUFNLFNBQVMsR0FBcUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFFN0QsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDeEIscURBQXFEO1lBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNULE9BQU87UUFDUixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1lBQzFCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsRUFBRSxDQUFDLEdBQVEsRUFBRSxFQUFFO1lBQ2YsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFsQkQsb0JBa0JDO0lBRUQsU0FBUyxPQUFPLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxRQUFvQixFQUFFLFNBQTZCO1FBQ2pHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFFBQVEsRUFBRSxDQUFD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