/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preloadsScriptStr = void 0;
    async function webviewPreloads(ctx) {
        // eslint-disable-next-line no-restricted-globals
        const $window = window;
        const userAgent = navigator.userAgent;
        const isChrome = (userAgent.indexOf('Chrome') >= 0);
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();
        let currentOptions = ctx.options;
        const isWorkspaceTrusted = ctx.isWorkspaceTrusted;
        let currentRenderOptions = ctx.renderOptions;
        const settingChange = createEmitter();
        const acquireVsCodeApi = globalThis.acquireVsCodeApi;
        const vscode = acquireVsCodeApi();
        delete globalThis.acquireVsCodeApi;
        const tokenizationStyle = new CSSStyleSheet();
        tokenizationStyle.replaceSync(ctx.style.tokenizationCss);
        const runWhenIdle = (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function')
            ? (runner) => {
                setTimeout(() => {
                    if (disposed) {
                        return;
                    }
                    const end = Date.now() + 15; // one frame at 64fps
                    runner(Object.freeze({
                        didTimeout: true,
                        timeRemaining() {
                            return Math.max(0, end - Date.now());
                        }
                    }));
                });
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                    }
                };
            }
            : (runner, timeout) => {
                const handle = requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        cancelIdleCallback(handle);
                    }
                };
            };
        // check if an input element is focused within the output element
        const checkOutputInputFocus = () => {
            const activeElement = $window.document.activeElement;
            if (!activeElement) {
                return;
            }
            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                postNotebookMessage('outputInputFocus', { inputFocused: true });
                activeElement.addEventListener('blur', () => {
                    postNotebookMessage('outputInputFocus', { inputFocused: false });
                }, { once: true });
            }
        };
        const handleInnerClick = (event) => {
            if (!event || !event.view || !event.view.document) {
                return;
            }
            let outputFocus = undefined;
            for (const node of event.composedPath()) {
                if (node instanceof HTMLElement && node.classList.contains('output')) {
                    outputFocus = {
                        id: node.id
                    };
                    break;
                }
            }
            for (const node of event.composedPath()) {
                if (node instanceof HTMLAnchorElement && node.href) {
                    if (node.href.startsWith('blob:')) {
                        if (outputFocus) {
                            postNotebookMessage('outputFocus', outputFocus);
                        }
                        handleBlobUrlClick(node.href, node.download);
                    }
                    else if (node.href.startsWith('data:')) {
                        if (outputFocus) {
                            postNotebookMessage('outputFocus', outputFocus);
                        }
                        handleDataUrl(node.href, node.download);
                    }
                    else if (node.getAttribute('href')?.trim().startsWith('#')) {
                        // Scrolling to location within current doc
                        if (!node.hash) {
                            postNotebookMessage('scroll-to-reveal', { scrollTop: 0 });
                            return;
                        }
                        const targetId = node.hash.substring(1);
                        // Check outer document first
                        let scrollTarget = event.view.document.getElementById(targetId);
                        if (!scrollTarget) {
                            // Fallback to checking preview shadow doms
                            for (const preview of event.view.document.querySelectorAll('.preview')) {
                                scrollTarget = preview.shadowRoot?.getElementById(targetId);
                                if (scrollTarget) {
                                    break;
                                }
                            }
                        }
                        if (scrollTarget) {
                            const scrollTop = scrollTarget.getBoundingClientRect().top + event.view.scrollY;
                            postNotebookMessage('scroll-to-reveal', { scrollTop });
                            return;
                        }
                    }
                    else {
                        const href = node.getAttribute('href');
                        if (href) {
                            if (href.startsWith('command:') && outputFocus) {
                                postNotebookMessage('outputFocus', outputFocus);
                            }
                            postNotebookMessage('clicked-link', { href });
                        }
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
            if (outputFocus) {
                postNotebookMessage('outputFocus', outputFocus);
            }
        };
        const handleDataUrl = async (data, downloadName) => {
            postNotebookMessage('clicked-data-url', {
                data,
                downloadName
            });
        };
        const handleBlobUrlClick = async (url, downloadName) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    handleDataUrl(reader.result, downloadName);
                });
                reader.readAsDataURL(blob);
            }
            catch (e) {
                console.error(e.message);
            }
        };
        $window.document.body.addEventListener('click', handleInnerClick);
        $window.document.body.addEventListener('focusin', checkOutputInputFocus);
        function createKernelContext() {
            return Object.freeze({
                onDidReceiveKernelMessage: onDidReceiveKernelMessage.event,
                postKernelMessage: (data) => postNotebookMessage('customKernelMessage', { message: data }),
            });
        }
        async function runKernelPreload(url) {
            try {
                return await activateModuleKernelPreload(url);
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        }
        async function activateModuleKernelPreload(url) {
            const module = await __import(url);
            if (!module.activate) {
                console.error(`Notebook preload '${url}' was expected to be a module but it does not export an 'activate' function`);
                return;
            }
            return module.activate(createKernelContext());
        }
        const dimensionUpdater = new class {
            constructor() {
                this.pending = new Map();
            }
            updateHeight(id, height, options) {
                if (!this.pending.size) {
                    setTimeout(() => {
                        this.updateImmediately();
                    }, 0);
                }
                const update = this.pending.get(id);
                if (update && update.isOutput) {
                    this.pending.set(id, {
                        id,
                        height,
                        init: update.init,
                        isOutput: update.isOutput,
                    });
                }
                else {
                    this.pending.set(id, {
                        id,
                        height,
                        ...options,
                    });
                }
            }
            updateImmediately() {
                if (!this.pending.size) {
                    return;
                }
                postNotebookMessage('dimension', {
                    updates: Array.from(this.pending.values())
                });
                this.pending.clear();
            }
        };
        const resizeObserver = new class {
            constructor() {
                this._observedElements = new WeakMap();
                this._observer = new ResizeObserver(entries => {
                    for (const entry of entries) {
                        if (!$window.document.body.contains(entry.target)) {
                            continue;
                        }
                        const observedElementInfo = this._observedElements.get(entry.target);
                        if (!observedElementInfo) {
                            continue;
                        }
                        this.postResizeMessage(observedElementInfo.cellId);
                        if (entry.target.id !== observedElementInfo.id) {
                            continue;
                        }
                        if (!entry.contentRect) {
                            continue;
                        }
                        if (!observedElementInfo.output) {
                            // markup, update directly
                            this.updateHeight(observedElementInfo, entry.target.offsetHeight);
                            continue;
                        }
                        const newHeight = entry.contentRect.height;
                        const shouldUpdatePadding = (newHeight !== 0 && observedElementInfo.lastKnownPadding === 0) ||
                            (newHeight === 0 && observedElementInfo.lastKnownPadding !== 0);
                        if (shouldUpdatePadding) {
                            // Do not update dimension in resize observer
                            $window.requestAnimationFrame(() => {
                                if (newHeight !== 0) {
                                    entry.target.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}px`;
                                }
                                else {
                                    entry.target.style.padding = `0px`;
                                }
                                this.updateHeight(observedElementInfo, entry.target.offsetHeight);
                            });
                        }
                        else {
                            this.updateHeight(observedElementInfo, entry.target.offsetHeight);
                        }
                    }
                });
            }
            updateHeight(observedElementInfo, offsetHeight) {
                if (observedElementInfo.lastKnownHeight !== offsetHeight) {
                    observedElementInfo.lastKnownHeight = offsetHeight;
                    dimensionUpdater.updateHeight(observedElementInfo.id, offsetHeight, {
                        isOutput: observedElementInfo.output
                    });
                }
            }
            observe(container, id, output, cellId) {
                if (this._observedElements.has(container)) {
                    return;
                }
                this._observedElements.set(container, { id, output, lastKnownPadding: ctx.style.outputNodePadding, lastKnownHeight: -1, cellId });
                this._observer.observe(container);
            }
            postResizeMessage(cellId) {
                // Debounce this callback to only happen after
                // 250 ms. Don't need resize events that often.
                clearTimeout(this._outputResizeTimer);
                this._outputResizeTimer = setTimeout(() => {
                    postNotebookMessage('outputResized', {
                        cellId
                    });
                }, 250);
            }
        };
        function scrollWillGoToParent(event) {
            for (let node = event.target; node; node = node.parentNode) {
                if (!(node instanceof Element) || node.id === 'container' || node.classList.contains('cell_container') || node.classList.contains('markup') || node.classList.contains('output_container')) {
                    return false;
                }
                // scroll up
                if (event.deltaY < 0 && node.scrollTop > 0) {
                    // there is still some content to scroll
                    return true;
                }
                // scroll down
                if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
                    // per https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
                    // scrollTop is not rounded but scrollHeight and clientHeight are
                    // so we need to check if the difference is less than some threshold
                    if (node.scrollHeight - node.scrollTop - node.clientHeight < 2) {
                        continue;
                    }
                    // if the node is not scrollable, we can continue. We don't check the computed style always as it's expensive
                    if ($window.getComputedStyle(node).overflowY === 'hidden' || $window.getComputedStyle(node).overflowY === 'visible') {
                        continue;
                    }
                    return true;
                }
            }
            return false;
        }
        const handleWheel = (event) => {
            if (event.defaultPrevented || scrollWillGoToParent(event)) {
                return;
            }
            postNotebookMessage('did-scroll-wheel', {
                payload: {
                    deltaMode: event.deltaMode,
                    deltaX: event.deltaX,
                    deltaY: event.deltaY,
                    deltaZ: event.deltaZ,
                    // Refs https://github.com/microsoft/vscode/issues/146403#issuecomment-1854538928
                    wheelDelta: event.wheelDelta && isChrome ? (event.wheelDelta / $window.devicePixelRatio) : event.wheelDelta,
                    wheelDeltaX: event.wheelDeltaX && isChrome ? (event.wheelDeltaX / $window.devicePixelRatio) : event.wheelDeltaX,
                    wheelDeltaY: event.wheelDeltaY && isChrome ? (event.wheelDeltaY / $window.devicePixelRatio) : event.wheelDeltaY,
                    detail: event.detail,
                    shiftKey: event.shiftKey,
                    type: event.type
                }
            });
        };
        function focusFirstFocusableOrContainerInOutput(cellOrOutputId, alternateId) {
            const cellOutputContainer = $window.document.getElementById(cellOrOutputId) ??
                (alternateId ? $window.document.getElementById(alternateId) : undefined);
            if (cellOutputContainer) {
                if (cellOutputContainer.contains($window.document.activeElement)) {
                    return;
                }
                let focusableElement = cellOutputContainer.querySelector('[tabindex="0"], [href], button, input, option, select, textarea');
                if (!focusableElement) {
                    focusableElement = cellOutputContainer;
                    focusableElement.tabIndex = -1;
                }
                focusableElement.focus();
            }
        }
        function createFocusSink(cellId, focusNext) {
            const element = document.createElement('div');
            element.id = `focus-sink-${cellId}`;
            element.tabIndex = 0;
            element.addEventListener('focus', () => {
                postNotebookMessage('focus-editor', {
                    cellId: cellId,
                    focusNext
                });
            });
            return element;
        }
        function _internalHighlightRange(range, tagName = 'mark', attributes = {}) {
            // derived from https://github.com/Treora/dom-highlight-range/blob/master/highlight-range.js
            // Return an array of the text nodes in the range. Split the start and end nodes if required.
            function _textNodesInRange(range) {
                if (!range.startContainer.ownerDocument) {
                    return [];
                }
                // If the start or end node is a text node and only partly in the range, split it.
                if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
                    const startContainer = range.startContainer;
                    const endOffset = range.endOffset; // (this may get lost when the splitting the node)
                    const createdNode = startContainer.splitText(range.startOffset);
                    if (range.endContainer === startContainer) {
                        // If the end was in the same container, it will now be in the newly created node.
                        range.setEnd(createdNode, endOffset - range.startOffset);
                    }
                    range.setStart(createdNode, 0);
                }
                if (range.endContainer.nodeType === Node.TEXT_NODE
                    && range.endOffset < range.endContainer.length) {
                    range.endContainer.splitText(range.endOffset);
                }
                // Collect the text nodes.
                const walker = range.startContainer.ownerDocument.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, node => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT);
                walker.currentNode = range.startContainer;
                // // Optimise by skipping nodes that are explicitly outside the range.
                // const NodeTypesWithCharacterOffset = [
                //  Node.TEXT_NODE,
                //  Node.PROCESSING_INSTRUCTION_NODE,
                //  Node.COMMENT_NODE,
                // ];
                // if (!NodeTypesWithCharacterOffset.includes(range.startContainer.nodeType)) {
                //   if (range.startOffset < range.startContainer.childNodes.length) {
                //     walker.currentNode = range.startContainer.childNodes[range.startOffset];
                //   } else {
                //     walker.nextSibling(); // TODO verify this is correct.
                //   }
                // }
                const nodes = [];
                if (walker.currentNode.nodeType === Node.TEXT_NODE) {
                    nodes.push(walker.currentNode);
                }
                while (walker.nextNode() && range.comparePoint(walker.currentNode, 0) !== 1) {
                    if (walker.currentNode.nodeType === Node.TEXT_NODE) {
                        nodes.push(walker.currentNode);
                    }
                }
                return nodes;
            }
            // Replace [node] with <tagName ...attributes>[node]</tagName>
            function wrapNodeInHighlight(node, tagName, attributes) {
                const highlightElement = node.ownerDocument.createElement(tagName);
                Object.keys(attributes).forEach(key => {
                    highlightElement.setAttribute(key, attributes[key]);
                });
                const tempRange = node.ownerDocument.createRange();
                tempRange.selectNode(node);
                tempRange.surroundContents(highlightElement);
                return highlightElement;
            }
            if (range.collapsed) {
                return {
                    remove: () => { },
                    update: () => { }
                };
            }
            // First put all nodes in an array (splits start and end nodes if needed)
            const nodes = _textNodesInRange(range);
            // Highlight each node
            const highlightElements = [];
            for (const nodeIdx in nodes) {
                const highlightElement = wrapNodeInHighlight(nodes[nodeIdx], tagName, attributes);
                highlightElements.push(highlightElement);
            }
            // Remove a highlight element created with wrapNodeInHighlight.
            function _removeHighlight(highlightElement) {
                if (highlightElement.childNodes.length === 1) {
                    highlightElement.parentNode?.replaceChild(highlightElement.firstChild, highlightElement);
                }
                else {
                    // If the highlight somehow contains multiple nodes now, move them all.
                    while (highlightElement.firstChild) {
                        highlightElement.parentNode?.insertBefore(highlightElement.firstChild, highlightElement);
                    }
                    highlightElement.remove();
                }
            }
            // Return a function that cleans up the highlightElements.
            function _removeHighlights() {
                // Remove each of the created highlightElements.
                for (const highlightIdx in highlightElements) {
                    _removeHighlight(highlightElements[highlightIdx]);
                }
            }
            function _updateHighlight(highlightElement, attributes = {}) {
                Object.keys(attributes).forEach(key => {
                    highlightElement.setAttribute(key, attributes[key]);
                });
            }
            function updateHighlights(attributes) {
                for (const highlightIdx in highlightElements) {
                    _updateHighlight(highlightElements[highlightIdx], attributes);
                }
            }
            return {
                remove: _removeHighlights,
                update: updateHighlights
            };
        }
        function selectRange(_range) {
            const sel = $window.getSelection();
            if (sel) {
                try {
                    sel.removeAllRanges();
                    const r = document.createRange();
                    r.setStart(_range.startContainer, _range.startOffset);
                    r.setEnd(_range.endContainer, _range.endOffset);
                    sel.addRange(r);
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        function highlightRange(range, useCustom, tagName = 'mark', attributes = {}) {
            if (useCustom) {
                const ret = _internalHighlightRange(range, tagName, attributes);
                return {
                    range: range,
                    dispose: ret.remove,
                    update: (color, className) => {
                        if (className === undefined) {
                            ret.update({
                                'style': `background-color: ${color}`
                            });
                        }
                        else {
                            ret.update({
                                'class': className
                            });
                        }
                    }
                };
            }
            else {
                $window.document.execCommand('hiliteColor', false, matchColor);
                const cloneRange = $window.getSelection().getRangeAt(0).cloneRange();
                const _range = {
                    collapsed: cloneRange.collapsed,
                    commonAncestorContainer: cloneRange.commonAncestorContainer,
                    endContainer: cloneRange.endContainer,
                    endOffset: cloneRange.endOffset,
                    startContainer: cloneRange.startContainer,
                    startOffset: cloneRange.startOffset
                };
                return {
                    range: _range,
                    dispose: () => {
                        selectRange(_range);
                        try {
                            document.designMode = 'On';
                            $window.document.execCommand('removeFormat', false, undefined);
                            document.designMode = 'Off';
                            $window.getSelection()?.removeAllRanges();
                        }
                        catch (e) {
                            console.log(e);
                        }
                    },
                    update: (color, className) => {
                        selectRange(_range);
                        try {
                            document.designMode = 'On';
                            $window.document.execCommand('removeFormat', false, undefined);
                            $window.document.execCommand('hiliteColor', false, color);
                            document.designMode = 'Off';
                            $window.getSelection()?.removeAllRanges();
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                };
            }
        }
        function createEmitter(listenerChange = () => undefined) {
            const listeners = new Set();
            return {
                fire(data) {
                    for (const listener of [...listeners]) {
                        listener.fn.call(listener.thisArg, data);
                    }
                },
                event(fn, thisArg, disposables) {
                    const listenerObj = { fn, thisArg };
                    const disposable = {
                        dispose: () => {
                            listeners.delete(listenerObj);
                            listenerChange(listeners);
                        },
                    };
                    listeners.add(listenerObj);
                    listenerChange(listeners);
                    if (disposables instanceof Array) {
                        disposables.push(disposable);
                    }
                    else if (disposables) {
                        disposables.add(disposable);
                    }
                    return disposable;
                },
            };
        }
        function showRenderError(errorText, outputNode, errors) {
            outputNode.innerText = errorText;
            const errList = document.createElement('ul');
            for (const result of errors) {
                console.error(result);
                const item = document.createElement('li');
                item.innerText = result.message;
                errList.appendChild(item);
            }
            outputNode.appendChild(errList);
        }
        const outputItemRequests = new class {
            constructor() {
                this._requestPool = 0;
                this._requests = new Map();
            }
            getOutputItem(outputId, mime) {
                const requestId = this._requestPool++;
                let resolve;
                const p = new Promise(r => resolve = r);
                this._requests.set(requestId, { resolve: resolve });
                postNotebookMessage('getOutputItem', { requestId, outputId, mime });
                return p;
            }
            resolveOutputItem(requestId, output) {
                const request = this._requests.get(requestId);
                if (!request) {
                    return;
                }
                this._requests.delete(requestId);
                request.resolve(output);
            }
        };
        let hasWarnedAboutAllOutputItemsProposal = false;
        function createOutputItem(id, mime, metadata, valueBytes, allOutputItemData, appended) {
            function create(id, mime, metadata, valueBytes, appended) {
                return Object.freeze({
                    id,
                    mime,
                    metadata,
                    appendedText() {
                        if (appended) {
                            return textDecoder.decode(appended.valueBytes);
                        }
                        return undefined;
                    },
                    data() {
                        return valueBytes;
                    },
                    text() {
                        return textDecoder.decode(valueBytes);
                    },
                    json() {
                        return JSON.parse(this.text());
                    },
                    blob() {
                        return new Blob([valueBytes], { type: this.mime });
                    },
                    get _allOutputItems() {
                        if (!hasWarnedAboutAllOutputItemsProposal) {
                            hasWarnedAboutAllOutputItemsProposal = true;
                            console.warn(`'_allOutputItems' is proposed API. DO NOT ship an extension that depends on it!`);
                        }
                        return allOutputItemList;
                    },
                });
            }
            const allOutputItemCache = new Map();
            const allOutputItemList = Object.freeze(allOutputItemData.map(outputItem => {
                const mime = outputItem.mime;
                return Object.freeze({
                    mime,
                    getItem() {
                        const existingTask = allOutputItemCache.get(mime);
                        if (existingTask) {
                            return existingTask;
                        }
                        const task = outputItemRequests.getOutputItem(id, mime).then(item => {
                            return item ? create(id, item.mime, metadata, item.valueBytes) : undefined;
                        });
                        allOutputItemCache.set(mime, task);
                        return task;
                    }
                });
            }));
            const item = create(id, mime, metadata, valueBytes, appended);
            allOutputItemCache.set(mime, Promise.resolve(item));
            return item;
        }
        const onDidReceiveKernelMessage = createEmitter();
        const ttPolicy = $window.trustedTypes?.createPolicy('notebookRenderer', {
            createHTML: value => value, // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
            createScript: value => value, // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
        });
        $window.addEventListener('wheel', handleWheel);
        const matchColor = $window.getComputedStyle($window.document.getElementById('_defaultColorPalatte')).color;
        const currentMatchColor = $window.getComputedStyle($window.document.getElementById('_defaultColorPalatte')).backgroundColor;
        class JSHighlighter {
            constructor() {
                this._activeHighlightInfo = new Map();
            }
            addHighlights(matches, ownerID) {
                for (let i = matches.length - 1; i >= 0; i--) {
                    const match = matches[i];
                    const ret = highlightRange(match.originalRange, true, 'mark', match.isShadow ? {
                        'style': 'background-color: ' + matchColor + ';',
                    } : {
                        'class': 'find-match'
                    });
                    match.highlightResult = ret;
                }
                const highlightInfo = {
                    matches,
                    currentMatchIndex: -1
                };
                this._activeHighlightInfo.set(ownerID, highlightInfo);
            }
            removeHighlights(ownerID) {
                this._activeHighlightInfo.get(ownerID)?.matches.forEach(match => {
                    match.highlightResult?.dispose();
                });
                this._activeHighlightInfo.delete(ownerID);
            }
            highlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    console.error('Modified current highlight match before adding highlight list.');
                    return;
                }
                const oldMatch = highlightInfo.matches[highlightInfo.currentMatchIndex];
                oldMatch?.highlightResult?.update(matchColor, oldMatch.isShadow ? undefined : 'find-match');
                const match = highlightInfo.matches[index];
                highlightInfo.currentMatchIndex = index;
                const sel = $window.getSelection();
                if (!!match && !!sel && match.highlightResult) {
                    let offset = 0;
                    try {
                        const outputOffset = $window.document.getElementById(match.id).getBoundingClientRect().top;
                        const tempRange = document.createRange();
                        tempRange.selectNode(match.highlightResult.range.startContainer);
                        match.highlightResult.range.startContainer.parentElement?.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
                        const rangeOffset = tempRange.getBoundingClientRect().top;
                        tempRange.detach();
                        offset = rangeOffset - outputOffset;
                    }
                    catch (e) {
                        console.error(e);
                    }
                    match.highlightResult?.update(currentMatchColor, match.isShadow ? undefined : 'current-find-match');
                    $window.document.getSelection()?.removeAllRanges();
                    postNotebookMessage('didFindHighlightCurrent', {
                        offset
                    });
                }
            }
            unHighlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    return;
                }
                const oldMatch = highlightInfo.matches[index];
                if (oldMatch && oldMatch.highlightResult) {
                    oldMatch.highlightResult.update(matchColor, oldMatch.isShadow ? undefined : 'find-match');
                }
            }
            dispose() {
                $window.document.getSelection()?.removeAllRanges();
                this._activeHighlightInfo.forEach(highlightInfo => {
                    highlightInfo.matches.forEach(match => {
                        match.highlightResult?.dispose();
                    });
                });
            }
        }
        class CSSHighlighter {
            constructor() {
                this._activeHighlightInfo = new Map();
                this._matchesHighlight = new Highlight();
                this._matchesHighlight.priority = 1;
                this._currentMatchesHighlight = new Highlight();
                this._currentMatchesHighlight.priority = 2;
                CSS.highlights?.set(`find-highlight`, this._matchesHighlight);
                CSS.highlights?.set(`current-find-highlight`, this._currentMatchesHighlight);
            }
            _refreshRegistry(updateMatchesHighlight = true) {
                // for performance reasons, only update the full list of highlights when we need to
                if (updateMatchesHighlight) {
                    this._matchesHighlight.clear();
                }
                this._currentMatchesHighlight.clear();
                this._activeHighlightInfo.forEach((highlightInfo) => {
                    if (updateMatchesHighlight) {
                        for (let i = 0; i < highlightInfo.matches.length; i++) {
                            this._matchesHighlight.add(highlightInfo.matches[i].originalRange);
                        }
                    }
                    if (highlightInfo.currentMatchIndex < highlightInfo.matches.length && highlightInfo.currentMatchIndex >= 0) {
                        this._currentMatchesHighlight.add(highlightInfo.matches[highlightInfo.currentMatchIndex].originalRange);
                    }
                });
            }
            addHighlights(matches, ownerID) {
                for (let i = 0; i < matches.length; i++) {
                    this._matchesHighlight.add(matches[i].originalRange);
                }
                const newEntry = {
                    matches,
                    currentMatchIndex: -1,
                };
                this._activeHighlightInfo.set(ownerID, newEntry);
            }
            highlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    console.error('Modified current highlight match before adding highlight list.');
                    return;
                }
                highlightInfo.currentMatchIndex = index;
                const match = highlightInfo.matches[index];
                if (match) {
                    let offset = 0;
                    try {
                        const outputOffset = $window.document.getElementById(match.id).getBoundingClientRect().top;
                        match.originalRange.startContainer.parentElement?.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
                        const rangeOffset = match.originalRange.getBoundingClientRect().top;
                        offset = rangeOffset - outputOffset;
                        postNotebookMessage('didFindHighlightCurrent', {
                            offset
                        });
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                this._refreshRegistry(false);
            }
            unHighlightCurrentMatch(index, ownerID) {
                const highlightInfo = this._activeHighlightInfo.get(ownerID);
                if (!highlightInfo) {
                    return;
                }
                highlightInfo.currentMatchIndex = -1;
            }
            removeHighlights(ownerID) {
                this._activeHighlightInfo.delete(ownerID);
                this._refreshRegistry();
            }
            dispose() {
                $window.document.getSelection()?.removeAllRanges();
                this._currentMatchesHighlight.clear();
                this._matchesHighlight.clear();
            }
        }
        const _highlighter = (CSS.highlights) ? new CSSHighlighter() : new JSHighlighter();
        function extractSelectionLine(selection) {
            const range = selection.getRangeAt(0);
            // we need to keep a reference to the old selection range to re-apply later
            const oldRange = range.cloneRange();
            const captureLength = selection.toString().length;
            // use selection API to modify selection to get entire line (the first line if multi-select)
            // collapse selection to start so that the cursor position is at beginning of match
            selection.collapseToStart();
            // extend selection in both directions to select the line
            selection.modify('move', 'backward', 'lineboundary');
            selection.modify('extend', 'forward', 'lineboundary');
            const line = selection.toString();
            // using the original range and the new range, we can find the offset of the match from the line start.
            const rangeStart = getStartOffset(selection.getRangeAt(0), oldRange);
            // line range for match
            const lineRange = {
                start: rangeStart,
                end: rangeStart + captureLength,
            };
            // re-add the old range so that the selection is restored
            selection.removeAllRanges();
            selection.addRange(oldRange);
            return { line, range: lineRange };
        }
        function getStartOffset(lineRange, originalRange) {
            // sometimes, the old and new range are in different DOM elements (ie: when the match is inside of <b></b>)
            // so we need to find the first common ancestor DOM element and find the positions of the old and new range relative to that.
            const firstCommonAncestor = findFirstCommonAncestor(lineRange.startContainer, originalRange.startContainer);
            const selectionOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, lineRange.startContainer) + lineRange.startOffset;
            const textOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, originalRange.startContainer) + originalRange.startOffset;
            return textOffset - selectionOffset;
        }
        // modified from https://stackoverflow.com/a/68583466/16253823
        function findFirstCommonAncestor(nodeA, nodeB) {
            const range = new Range();
            range.setStart(nodeA, 0);
            range.setEnd(nodeB, 0);
            return range.commonAncestorContainer;
        }
        function getTextContentLength(node) {
            let length = 0;
            if (node.nodeType === Node.TEXT_NODE) {
                length += node.textContent?.length || 0;
            }
            else {
                for (const childNode of node.childNodes) {
                    length += getTextContentLength(childNode);
                }
            }
            return length;
        }
        // modified from https://stackoverflow.com/a/48812529/16253823
        function getSelectionOffsetRelativeTo(parentElement, currentNode) {
            if (!currentNode) {
                return 0;
            }
            let offset = 0;
            if (currentNode === parentElement || !parentElement.contains(currentNode)) {
                return offset;
            }
            // count the number of chars before the current dom elem and the start of the dom
            let prevSibling = currentNode.previousSibling;
            while (prevSibling) {
                offset += getTextContentLength(prevSibling);
                prevSibling = prevSibling.previousSibling;
            }
            return offset + getSelectionOffsetRelativeTo(parentElement, currentNode.parentNode);
        }
        const find = (query, options) => {
            let find = true;
            const matches = [];
            const range = document.createRange();
            range.selectNodeContents($window.document.getElementById('findStart'));
            const sel = $window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
            viewModel.toggleDragDropEnabled(false);
            try {
                document.designMode = 'On';
                while (find && matches.length < 500) {
                    find = $window.find(query, /* caseSensitive*/ !!options.caseSensitive, 
                    /* backwards*/ false, 
                    /* wrapAround*/ false, 
                    /* wholeWord */ !!options.wholeWord, 
                    /* searchInFrames*/ true, false);
                    if (find) {
                        const selection = $window.getSelection();
                        if (!selection) {
                            console.log('no selection');
                            break;
                        }
                        // Markdown preview are rendered in a shadow DOM.
                        if (options.includeMarkup && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1
                            && selection.getRangeAt(0).startContainer.classList.contains('markup')) {
                            // markdown preview container
                            const preview = selection.anchorNode?.firstChild;
                            const root = preview.shadowRoot;
                            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
                            // find the match in the shadow dom by checking the selection inside the shadow dom
                            if (shadowSelection && shadowSelection.anchorNode) {
                                matches.push({
                                    type: 'preview',
                                    id: preview.id,
                                    cellId: preview.id,
                                    container: preview,
                                    isShadow: true,
                                    originalRange: shadowSelection.getRangeAt(0),
                                    searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : undefined,
                                });
                            }
                        }
                        // Outputs might be rendered inside a shadow DOM.
                        if (options.includeOutput && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1
                            && selection.getRangeAt(0).startContainer.classList.contains('output_container')) {
                            // output container
                            const cellId = selection.getRangeAt(0).startContainer.parentElement.id;
                            const outputNode = selection.anchorNode?.firstChild;
                            const root = outputNode.shadowRoot;
                            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
                            if (shadowSelection && shadowSelection.anchorNode) {
                                matches.push({
                                    type: 'output',
                                    id: outputNode.id,
                                    cellId: cellId,
                                    container: outputNode,
                                    isShadow: true,
                                    originalRange: shadowSelection.getRangeAt(0),
                                    searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : undefined,
                                });
                            }
                        }
                        const anchorNode = selection.anchorNode?.parentElement;
                        if (anchorNode) {
                            const lastEl = matches.length ? matches[matches.length - 1] : null;
                            // Optimization: avoid searching for the output container
                            if (lastEl && lastEl.container.contains(anchorNode) && options.includeOutput) {
                                matches.push({
                                    type: lastEl.type,
                                    id: lastEl.id,
                                    cellId: lastEl.cellId,
                                    container: lastEl.container,
                                    isShadow: false,
                                    originalRange: selection.getRangeAt(0),
                                    searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : undefined,
                                });
                            }
                            else {
                                // Traverse up the DOM to find the container
                                for (let node = anchorNode; node; node = node.parentElement) {
                                    if (!(node instanceof Element)) {
                                        break;
                                    }
                                    if (node.classList.contains('output') && options.includeOutput) {
                                        // inside output
                                        const cellId = node.parentElement?.parentElement?.id;
                                        if (cellId) {
                                            matches.push({
                                                type: 'output',
                                                id: node.id,
                                                cellId: cellId,
                                                container: node,
                                                isShadow: false,
                                                originalRange: selection.getRangeAt(0),
                                                searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : undefined,
                                            });
                                        }
                                        break;
                                    }
                                    if (node.id === 'container' || node === $window.document.body) {
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            _highlighter.addHighlights(matches, options.ownerID);
            $window.document.getSelection()?.removeAllRanges();
            viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
            document.designMode = 'Off';
            postNotebookMessage('didFind', {
                matches: matches.map((match, index) => ({
                    type: match.type,
                    id: match.id,
                    cellId: match.cellId,
                    index,
                    searchPreviewInfo: match.searchPreviewInfo,
                }))
            });
        };
        const copyOutputImage = async (outputId, altOutputId, retries = 5) => {
            if (!$window.document.hasFocus() && retries > 0) {
                // copyImage can be called from outside of the webview, which means this function may be running whilst the webview is gaining focus.
                // Since navigator.clipboard.write requires the document to be focused, we need to wait for focus.
                // We cannot use a listener, as there is a high chance the focus is gained during the setup of the listener resulting in us missing it.
                setTimeout(() => { copyOutputImage(outputId, altOutputId, retries - 1); }, 20);
                return;
            }
            try {
                const image = $window.document.getElementById(outputId)?.querySelector('img')
                    ?? $window.document.getElementById(altOutputId)?.querySelector('img');
                if (image) {
                    await navigator.clipboard.write([new ClipboardItem({
                            'image/png': new Promise((resolve) => {
                                const canvas = document.createElement('canvas');
                                if (canvas !== null) {
                                    canvas.width = image.naturalWidth;
                                    canvas.height = image.naturalHeight;
                                    const context = canvas.getContext('2d');
                                    context?.drawImage(image, 0, 0);
                                }
                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        resolve(blob);
                                    }
                                    canvas.remove();
                                }, 'image/png');
                            })
                        })]);
                }
                else {
                    console.error('Could not find image element to copy for output with id', outputId);
                }
            }
            catch (e) {
                console.error('Could not copy image:', e);
            }
        };
        $window.addEventListener('message', async (rawEvent) => {
            const event = rawEvent;
            switch (event.data.type) {
                case 'initializeMarkup': {
                    try {
                        await Promise.all(event.data.cells.map(info => viewModel.ensureMarkupCell(info)));
                    }
                    finally {
                        dimensionUpdater.updateImmediately();
                        postNotebookMessage('initializedMarkup', { requestId: event.data.requestId });
                    }
                    break;
                }
                case 'createMarkupCell':
                    viewModel.ensureMarkupCell(event.data.cell);
                    break;
                case 'showMarkupCell':
                    viewModel.showMarkupCell(event.data.id, event.data.top, event.data.content, event.data.metadata);
                    break;
                case 'hideMarkupCells':
                    for (const id of event.data.ids) {
                        viewModel.hideMarkupCell(id);
                    }
                    break;
                case 'unhideMarkupCells':
                    for (const id of event.data.ids) {
                        viewModel.unhideMarkupCell(id);
                    }
                    break;
                case 'deleteMarkupCell':
                    for (const id of event.data.ids) {
                        viewModel.deleteMarkupCell(id);
                    }
                    break;
                case 'updateSelectedMarkupCells':
                    viewModel.updateSelectedCells(event.data.selectedCellIds);
                    break;
                case 'html': {
                    const data = event.data;
                    if (data.createOnIdle) {
                        outputRunner.enqueueIdle(data.outputId, signal => {
                            // cancel the idle callback if it exists
                            return viewModel.renderOutputCell(data, signal);
                        });
                    }
                    else {
                        outputRunner.enqueue(data.outputId, signal => {
                            // cancel the idle callback if it exists
                            return viewModel.renderOutputCell(data, signal);
                        });
                    }
                    break;
                }
                case 'view-scroll':
                    {
                        // const date = new Date();
                        // console.log('----- will scroll ----  ', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds());
                        event.data.widgets.forEach(widget => {
                            outputRunner.enqueue(widget.outputId, () => {
                                viewModel.updateOutputsScroll([widget]);
                            });
                        });
                        viewModel.updateMarkupScrolls(event.data.markupCells);
                        break;
                    }
                case 'clear':
                    renderers.clearAll();
                    viewModel.clearAll();
                    $window.document.getElementById('container').innerText = '';
                    break;
                case 'clearOutput': {
                    const { cellId, rendererId, outputId } = event.data;
                    outputRunner.cancelOutput(outputId);
                    viewModel.clearOutput(cellId, outputId, rendererId);
                    break;
                }
                case 'hideOutput': {
                    const { cellId, outputId } = event.data;
                    outputRunner.enqueue(outputId, () => {
                        viewModel.hideOutput(cellId);
                    });
                    break;
                }
                case 'showOutput': {
                    const { outputId, cellTop, cellId, content } = event.data;
                    outputRunner.enqueue(outputId, () => {
                        viewModel.showOutput(cellId, outputId, cellTop);
                        if (content) {
                            viewModel.updateAndRerender(cellId, outputId, content);
                        }
                    });
                    break;
                }
                case 'copyImage': {
                    await copyOutputImage(event.data.outputId, event.data.altOutputId);
                    break;
                }
                case 'ack-dimension': {
                    for (const { cellId, outputId, height } of event.data.updates) {
                        viewModel.updateOutputHeight(cellId, outputId, height);
                    }
                    break;
                }
                case 'preload': {
                    const resources = event.data.resources;
                    for (const { uri } of resources) {
                        kernelPreloads.load(uri);
                    }
                    break;
                }
                case 'updateRenderers': {
                    const { rendererData } = event.data;
                    renderers.updateRendererData(rendererData);
                    break;
                }
                case 'focus-output':
                    focusFirstFocusableOrContainerInOutput(event.data.cellOrOutputId, event.data.alternateId);
                    break;
                case 'decorations': {
                    let outputContainer = $window.document.getElementById(event.data.cellId);
                    if (!outputContainer) {
                        viewModel.ensureOutputCell(event.data.cellId, -100000, true);
                        outputContainer = $window.document.getElementById(event.data.cellId);
                    }
                    outputContainer?.classList.add(...event.data.addedClassNames);
                    outputContainer?.classList.remove(...event.data.removedClassNames);
                    break;
                }
                case 'customKernelMessage':
                    onDidReceiveKernelMessage.fire(event.data.message);
                    break;
                case 'customRendererMessage':
                    renderers.getRenderer(event.data.rendererId)?.receiveMessage(event.data.message);
                    break;
                case 'notebookStyles': {
                    const documentStyle = $window.document.documentElement.style;
                    for (let i = documentStyle.length - 1; i >= 0; i--) {
                        const property = documentStyle[i];
                        // Don't remove properties that the webview might have added separately
                        if (property && property.startsWith('--notebook-')) {
                            documentStyle.removeProperty(property);
                        }
                    }
                    // Re-add new properties
                    for (const [name, value] of Object.entries(event.data.styles)) {
                        documentStyle.setProperty(`--${name}`, value);
                    }
                    break;
                }
                case 'notebookOptions':
                    currentOptions = event.data.options;
                    viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
                    currentRenderOptions = event.data.renderOptions;
                    settingChange.fire(currentRenderOptions);
                    break;
                case 'tokenizedCodeBlock': {
                    const { codeBlockId, html } = event.data;
                    MarkdownCodeBlock.highlightCodeBlock(codeBlockId, html);
                    break;
                }
                case 'tokenizedStylesChanged': {
                    tokenizationStyle.replaceSync(event.data.css);
                    break;
                }
                case 'find': {
                    _highlighter.removeHighlights(event.data.options.ownerID);
                    find(event.data.query, event.data.options);
                    break;
                }
                case 'findHighlightCurrent': {
                    _highlighter?.highlightCurrentMatch(event.data.index, event.data.ownerID);
                    break;
                }
                case 'findUnHighlightCurrent': {
                    _highlighter?.unHighlightCurrentMatch(event.data.index, event.data.ownerID);
                    break;
                }
                case 'findStop': {
                    _highlighter.removeHighlights(event.data.ownerID);
                    break;
                }
                case 'returnOutputItem': {
                    outputItemRequests.resolveOutputItem(event.data.requestId, event.data.output);
                }
            }
        });
        const renderFallbackErrorName = 'vscode.fallbackToNextRenderer';
        class Renderer {
            constructor(data) {
                this.data = data;
                this._onMessageEvent = createEmitter();
            }
            receiveMessage(message) {
                this._onMessageEvent.fire(message);
            }
            async renderOutputItem(item, element, signal) {
                try {
                    await this.load();
                }
                catch (e) {
                    if (!signal.aborted) {
                        showRenderError(`Error loading renderer '${this.data.id}'`, element, e instanceof Error ? [e] : []);
                    }
                    return;
                }
                if (!this._api) {
                    if (!signal.aborted) {
                        showRenderError(`Renderer '${this.data.id}' does not implement renderOutputItem`, element, []);
                    }
                    return;
                }
                try {
                    const renderStart = performance.now();
                    await this._api.renderOutputItem(item, element, signal);
                    this.postDebugMessage('Rendered output item', { id: item.id, duration: `${performance.now() - renderStart}ms` });
                }
                catch (e) {
                    if (signal.aborted) {
                        return;
                    }
                    if (e instanceof Error && e.name === renderFallbackErrorName) {
                        throw e;
                    }
                    showRenderError(`Error rendering output item using '${this.data.id}'`, element, e instanceof Error ? [e] : []);
                    this.postDebugMessage('Rendering output item failed', { id: item.id, error: e + '' });
                }
            }
            disposeOutputItem(id) {
                this._api?.disposeOutputItem?.(id);
            }
            createRendererContext() {
                const { id, messaging } = this.data;
                const context = {
                    setState: newState => vscode.setState({ ...vscode.getState(), [id]: newState }),
                    getState: () => {
                        const state = vscode.getState();
                        return typeof state === 'object' && state ? state[id] : undefined;
                    },
                    getRenderer: async (id) => {
                        const renderer = renderers.getRenderer(id);
                        if (!renderer) {
                            return undefined;
                        }
                        if (renderer._api) {
                            return renderer._api;
                        }
                        return renderer.load();
                    },
                    workspace: {
                        get isTrusted() { return isWorkspaceTrusted; }
                    },
                    settings: {
                        get lineLimit() { return currentRenderOptions.lineLimit; },
                        get outputScrolling() { return currentRenderOptions.outputScrolling; },
                        get outputWordWrap() { return currentRenderOptions.outputWordWrap; },
                        get linkifyFilePaths() { return currentRenderOptions.linkifyFilePaths; },
                    },
                    get onDidChangeSettings() { return settingChange.event; }
                };
                if (messaging) {
                    context.onDidReceiveMessage = this._onMessageEvent.event;
                    context.postMessage = message => postNotebookMessage('customRendererMessage', { rendererId: id, message });
                }
                return Object.freeze(context);
            }
            load() {
                this._loadPromise ??= this._load();
                return this._loadPromise;
            }
            /** Inner function cached in the _loadPromise(). */
            async _load() {
                this.postDebugMessage('Start loading renderer');
                try {
                    // Preloads need to be loaded before loading renderers.
                    await kernelPreloads.waitForAllCurrent();
                    const importStart = performance.now();
                    const module = await __import(this.data.entrypoint.path);
                    this.postDebugMessage('Imported renderer', { duration: `${performance.now() - importStart}ms` });
                    if (!module) {
                        return;
                    }
                    this._api = await module.activate(this.createRendererContext());
                    this.postDebugMessage('Activated renderer', { duration: `${performance.now() - importStart}ms` });
                    const dependantRenderers = ctx.rendererData
                        .filter(d => d.entrypoint.extends === this.data.id);
                    if (dependantRenderers.length) {
                        this.postDebugMessage('Activating dependant renderers', { dependents: dependantRenderers.map(x => x.id).join(', ') });
                    }
                    // Load all renderers that extend this renderer
                    await Promise.all(dependantRenderers.map(async (d) => {
                        const renderer = renderers.getRenderer(d.id);
                        if (!renderer) {
                            throw new Error(`Could not find extending renderer: ${d.id}`);
                        }
                        try {
                            return await renderer.load();
                        }
                        catch (e) {
                            // Squash any errors extends errors. They won't prevent the renderer
                            // itself from working, so just log them.
                            console.error(e);
                            this.postDebugMessage('Activating dependant renderer failed', { dependent: d.id, error: e + '' });
                            return undefined;
                        }
                    }));
                    return this._api;
                }
                catch (e) {
                    this.postDebugMessage('Loading renderer failed');
                    throw e;
                }
            }
            postDebugMessage(msg, data) {
                postNotebookMessage('logRendererDebugMessage', {
                    message: `[renderer ${this.data.id}] - ${msg}`,
                    data
                });
            }
        }
        const kernelPreloads = new class {
            constructor() {
                this.preloads = new Map();
            }
            /**
             * Returns a promise that resolves when the given preload is activated.
             */
            waitFor(uri) {
                return this.preloads.get(uri) || Promise.resolve(new Error(`Preload not ready: ${uri}`));
            }
            /**
             * Loads a preload.
             * @param uri URI to load from
             * @param originalUri URI to show in an error message if the preload is invalid.
             */
            load(uri) {
                const promise = Promise.all([
                    runKernelPreload(uri),
                    this.waitForAllCurrent(),
                ]);
                this.preloads.set(uri, promise);
                return promise;
            }
            /**
             * Returns a promise that waits for all currently-registered preloads to
             * activate before resolving.
             */
            waitForAllCurrent() {
                return Promise.all([...this.preloads.values()].map(p => p.catch(err => err)));
            }
        };
        const outputRunner = new class {
            constructor() {
                this.outputs = new Map();
                this.pendingOutputCreationRequest = new Map();
            }
            /**
             * Pushes the action onto the list of actions for the given output ID,
             * ensuring that it's run in-order.
             */
            enqueue(outputId, action) {
                this.pendingOutputCreationRequest.get(outputId)?.dispose();
                this.pendingOutputCreationRequest.delete(outputId);
                const record = this.outputs.get(outputId);
                if (!record) {
                    const controller = new AbortController();
                    this.outputs.set(outputId, { abort: controller, queue: new Promise(r => r(action(controller.signal))) });
                }
                else {
                    record.queue = record.queue.then(async (r) => {
                        if (!record.abort.signal.aborted) {
                            await action(record.abort.signal);
                        }
                    });
                }
            }
            enqueueIdle(outputId, action) {
                this.pendingOutputCreationRequest.get(outputId)?.dispose();
                outputRunner.pendingOutputCreationRequest.set(outputId, runWhenIdle(() => {
                    outputRunner.enqueue(outputId, action);
                    outputRunner.pendingOutputCreationRequest.delete(outputId);
                }));
            }
            /**
             * Cancels the rendering of all outputs.
             */
            cancelAll() {
                // Delete all pending idle requests
                this.pendingOutputCreationRequest.forEach(r => r.dispose());
                this.pendingOutputCreationRequest.clear();
                for (const { abort } of this.outputs.values()) {
                    abort.abort();
                }
                this.outputs.clear();
            }
            /**
             * Cancels any ongoing rendering out an output.
             */
            cancelOutput(outputId) {
                // Delete the pending idle request if it exists
                this.pendingOutputCreationRequest.get(outputId)?.dispose();
                this.pendingOutputCreationRequest.delete(outputId);
                const output = this.outputs.get(outputId);
                if (output) {
                    output.abort.abort();
                    this.outputs.delete(outputId);
                }
            }
        };
        const renderers = new class {
            constructor() {
                this._renderers = new Map();
                for (const renderer of ctx.rendererData) {
                    this.addRenderer(renderer);
                }
            }
            getRenderer(id) {
                return this._renderers.get(id);
            }
            rendererEqual(a, b) {
                if (a.id !== b.id || a.entrypoint.path !== b.entrypoint.path || a.entrypoint.extends !== b.entrypoint.extends || a.messaging !== b.messaging) {
                    return false;
                }
                if (a.mimeTypes.length !== b.mimeTypes.length) {
                    return false;
                }
                for (let i = 0; i < a.mimeTypes.length; i++) {
                    if (a.mimeTypes[i] !== b.mimeTypes[i]) {
                        return false;
                    }
                }
                return true;
            }
            updateRendererData(rendererData) {
                const oldKeys = new Set(this._renderers.keys());
                const newKeys = new Set(rendererData.map(d => d.id));
                for (const renderer of rendererData) {
                    const existing = this._renderers.get(renderer.id);
                    if (existing && this.rendererEqual(existing.data, renderer)) {
                        continue;
                    }
                    this.addRenderer(renderer);
                }
                for (const key of oldKeys) {
                    if (!newKeys.has(key)) {
                        this._renderers.delete(key);
                    }
                }
            }
            addRenderer(renderer) {
                this._renderers.set(renderer.id, new Renderer(renderer));
            }
            clearAll() {
                outputRunner.cancelAll();
                for (const renderer of this._renderers.values()) {
                    renderer.disposeOutputItem();
                }
            }
            clearOutput(rendererId, outputId) {
                outputRunner.cancelOutput(outputId);
                this._renderers.get(rendererId)?.disposeOutputItem(outputId);
            }
            async render(item, preferredRendererId, element, signal) {
                const primaryRenderer = this.findRenderer(preferredRendererId, item);
                if (!primaryRenderer) {
                    const errorMessage = ($window.document.documentElement.style.getPropertyValue('--notebook-cell-renderer-not-found-error') || '').replace('$0', () => item.mime);
                    this.showRenderError(item, element, errorMessage);
                    return;
                }
                // Try primary renderer first
                if (!(await this._doRender(item, element, primaryRenderer, signal)).continue) {
                    return;
                }
                // Primary renderer failed in an expected way. Fallback to render the next mime types
                for (const additionalItemData of item._allOutputItems) {
                    if (additionalItemData.mime === item.mime) {
                        continue;
                    }
                    const additionalItem = await additionalItemData.getItem();
                    if (signal.aborted) {
                        return;
                    }
                    if (additionalItem) {
                        const renderer = this.findRenderer(undefined, additionalItem);
                        if (renderer) {
                            if (!(await this._doRender(additionalItem, element, renderer, signal)).continue) {
                                return; // We rendered successfully
                            }
                        }
                    }
                }
                // All renderers have failed and there is nothing left to fallback to
                const errorMessage = ($window.document.documentElement.style.getPropertyValue('--notebook-cell-renderer-fallbacks-exhausted') || '').replace('$0', () => item.mime);
                this.showRenderError(item, element, errorMessage);
            }
            async _doRender(item, element, renderer, signal) {
                try {
                    await renderer.renderOutputItem(item, element, signal);
                    return { continue: false }; // We rendered successfully
                }
                catch (e) {
                    if (signal.aborted) {
                        return { continue: false };
                    }
                    if (e instanceof Error && e.name === renderFallbackErrorName) {
                        return { continue: true };
                    }
                    else {
                        throw e; // Bail and let callers handle unknown errors
                    }
                }
            }
            findRenderer(preferredRendererId, info) {
                let renderer;
                if (typeof preferredRendererId === 'string') {
                    renderer = Array.from(this._renderers.values())
                        .find((renderer) => renderer.data.id === preferredRendererId);
                }
                else {
                    const renderers = Array.from(this._renderers.values())
                        .filter((renderer) => renderer.data.mimeTypes.includes(info.mime) && !renderer.data.entrypoint.extends);
                    if (renderers.length) {
                        // De-prioritize built-in renderers
                        renderers.sort((a, b) => +a.data.isBuiltin - +b.data.isBuiltin);
                        // Use first renderer we find in sorted list
                        renderer = renderers[0];
                    }
                }
                return renderer;
            }
            showRenderError(info, element, errorMessage) {
                const errorContainer = document.createElement('div');
                const error = document.createElement('div');
                error.className = 'no-renderer-error';
                error.innerText = errorMessage;
                const cellText = document.createElement('div');
                cellText.innerText = info.text();
                errorContainer.appendChild(error);
                errorContainer.appendChild(cellText);
                element.innerText = '';
                element.appendChild(errorContainer);
            }
        }();
        const viewModel = new class ViewModel {
            constructor() {
                this._markupCells = new Map();
                this._outputCells = new Map();
            }
            clearAll() {
                for (const cell of this._markupCells.values()) {
                    cell.dispose();
                }
                this._markupCells.clear();
                for (const output of this._outputCells.values()) {
                    output.dispose();
                }
                this._outputCells.clear();
            }
            async createMarkupCell(init, top, visible) {
                const existing = this._markupCells.get(init.cellId);
                if (existing) {
                    console.error(`Trying to create markup that already exists: ${init.cellId}`);
                    return existing;
                }
                const cell = new MarkupCell(init.cellId, init.mime, init.content, top, init.metadata);
                cell.element.style.visibility = visible ? '' : 'hidden';
                this._markupCells.set(init.cellId, cell);
                await cell.ready;
                return cell;
            }
            async ensureMarkupCell(info) {
                let cell = this._markupCells.get(info.cellId);
                if (cell) {
                    cell.element.style.visibility = info.visible ? '' : 'hidden';
                    await cell.updateContentAndRender(info.content, info.metadata);
                }
                else {
                    cell = await this.createMarkupCell(info, info.offset, info.visible);
                }
            }
            deleteMarkupCell(id) {
                const cell = this.getExpectedMarkupCell(id);
                if (cell) {
                    cell.remove();
                    cell.dispose();
                    this._markupCells.delete(id);
                }
            }
            async updateMarkupContent(id, newContent, metadata) {
                const cell = this.getExpectedMarkupCell(id);
                await cell?.updateContentAndRender(newContent, metadata);
            }
            showMarkupCell(id, top, newContent, metadata) {
                const cell = this.getExpectedMarkupCell(id);
                cell?.show(top, newContent, metadata);
            }
            hideMarkupCell(id) {
                const cell = this.getExpectedMarkupCell(id);
                cell?.hide();
            }
            unhideMarkupCell(id) {
                const cell = this.getExpectedMarkupCell(id);
                cell?.unhide();
            }
            getExpectedMarkupCell(id) {
                const cell = this._markupCells.get(id);
                if (!cell) {
                    console.log(`Could not find markup cell '${id}'`);
                    return undefined;
                }
                return cell;
            }
            updateSelectedCells(selectedCellIds) {
                const selectedCellSet = new Set(selectedCellIds);
                for (const cell of this._markupCells.values()) {
                    cell.setSelected(selectedCellSet.has(cell.id));
                }
            }
            toggleDragDropEnabled(dragAndDropEnabled) {
                for (const cell of this._markupCells.values()) {
                    cell.toggleDragDropEnabled(dragAndDropEnabled);
                }
            }
            updateMarkupScrolls(markupCells) {
                for (const { id, top } of markupCells) {
                    const cell = this._markupCells.get(id);
                    if (cell) {
                        cell.element.style.top = `${top}px`;
                    }
                }
            }
            async renderOutputCell(data, signal) {
                const preloadErrors = await Promise.all(data.requiredPreloads.map(p => kernelPreloads.waitFor(p.uri).then(() => undefined, err => err)));
                if (signal.aborted) {
                    return;
                }
                const cellOutput = this.ensureOutputCell(data.cellId, data.cellTop, false);
                return cellOutput.renderOutputElement(data, preloadErrors, signal);
            }
            ensureOutputCell(cellId, cellTop, skipCellTopUpdateIfExist) {
                let cell = this._outputCells.get(cellId);
                const existed = !!cell;
                if (!cell) {
                    cell = new OutputCell(cellId);
                    this._outputCells.set(cellId, cell);
                }
                if (existed && skipCellTopUpdateIfExist) {
                    return cell;
                }
                cell.element.style.top = cellTop + 'px';
                return cell;
            }
            clearOutput(cellId, outputId, rendererId) {
                const cell = this._outputCells.get(cellId);
                cell?.clearOutput(outputId, rendererId);
            }
            showOutput(cellId, outputId, top) {
                const cell = this._outputCells.get(cellId);
                cell?.show(outputId, top);
            }
            updateAndRerender(cellId, outputId, content) {
                const cell = this._outputCells.get(cellId);
                cell?.updateContentAndRerender(outputId, content);
            }
            hideOutput(cellId) {
                const cell = this._outputCells.get(cellId);
                cell?.hide();
            }
            updateOutputHeight(cellId, outputId, height) {
                const cell = this._outputCells.get(cellId);
                cell?.updateOutputHeight(outputId, height);
            }
            updateOutputsScroll(updates) {
                for (const request of updates) {
                    const cell = this._outputCells.get(request.cellId);
                    cell?.updateScroll(request);
                }
            }
        }();
        class MarkdownCodeBlock {
            static { this.pendingCodeBlocksToHighlight = new Map(); }
            static highlightCodeBlock(id, html) {
                const el = MarkdownCodeBlock.pendingCodeBlocksToHighlight.get(id);
                if (!el) {
                    return;
                }
                const trustedHtml = ttPolicy?.createHTML(html) ?? html;
                el.innerHTML = trustedHtml;
                const root = el.getRootNode();
                if (root instanceof ShadowRoot) {
                    if (!root.adoptedStyleSheets.includes(tokenizationStyle)) {
                        root.adoptedStyleSheets.push(tokenizationStyle);
                    }
                }
            }
            static requestHighlightCodeBlock(root) {
                const codeBlocks = [];
                let i = 0;
                for (const el of root.querySelectorAll('.vscode-code-block')) {
                    const lang = el.getAttribute('data-vscode-code-block-lang');
                    if (el.textContent && lang) {
                        const id = `${Date.now()}-${i++}`;
                        codeBlocks.push({ value: el.textContent, lang: lang, id });
                        MarkdownCodeBlock.pendingCodeBlocksToHighlight.set(id, el);
                    }
                }
                return codeBlocks;
            }
        }
        class MarkupCell {
            constructor(id, mime, content, top, metadata) {
                this._isDisposed = false;
                const self = this;
                this.id = id;
                this._content = { value: content, version: 0, metadata: metadata };
                let resolve;
                let reject;
                this.ready = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
                let cachedData;
                this.outputItem = Object.freeze({
                    id,
                    mime,
                    get metadata() {
                        return self._content.metadata;
                    },
                    text: () => {
                        return this._content.value;
                    },
                    json: () => {
                        return undefined;
                    },
                    data: () => {
                        if (cachedData?.version === this._content.version) {
                            return cachedData.value;
                        }
                        const data = textEncoder.encode(this._content.value);
                        cachedData = { version: this._content.version, value: data };
                        return data;
                    },
                    blob() {
                        return new Blob([this.data()], { type: this.mime });
                    },
                    _allOutputItems: [{
                            mime,
                            getItem: async () => this.outputItem,
                        }]
                });
                const root = $window.document.getElementById('container');
                const markupCell = document.createElement('div');
                markupCell.className = 'markup';
                markupCell.style.position = 'absolute';
                markupCell.style.width = '100%';
                this.element = document.createElement('div');
                this.element.id = this.id;
                this.element.classList.add('preview');
                this.element.style.position = 'absolute';
                this.element.style.top = top + 'px';
                this.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
                markupCell.appendChild(this.element);
                root.appendChild(markupCell);
                this.addEventListeners();
                this.updateContentAndRender(this._content.value, this._content.metadata).then(() => {
                    if (!this._isDisposed) {
                        resizeObserver.observe(this.element, this.id, false, this.id);
                    }
                    resolve();
                }, () => reject());
            }
            dispose() {
                this._isDisposed = true;
                this.renderTaskAbort?.abort();
                this.renderTaskAbort = undefined;
            }
            addEventListeners() {
                this.element.addEventListener('dblclick', () => {
                    postNotebookMessage('toggleMarkupPreview', { cellId: this.id });
                });
                this.element.addEventListener('click', e => {
                    postNotebookMessage('clickMarkupCell', {
                        cellId: this.id,
                        altKey: e.altKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey,
                        shiftKey: e.shiftKey,
                    });
                });
                this.element.addEventListener('contextmenu', e => {
                    postNotebookMessage('contextMenuMarkupCell', {
                        cellId: this.id,
                        clientX: e.clientX,
                        clientY: e.clientY,
                    });
                });
                this.element.addEventListener('mouseenter', () => {
                    postNotebookMessage('mouseEnterMarkupCell', { cellId: this.id });
                });
                this.element.addEventListener('mouseleave', () => {
                    postNotebookMessage('mouseLeaveMarkupCell', { cellId: this.id });
                });
                this.element.addEventListener('dragstart', e => {
                    markupCellDragManager.startDrag(e, this.id);
                });
                this.element.addEventListener('drag', e => {
                    markupCellDragManager.updateDrag(e, this.id);
                });
                this.element.addEventListener('dragend', e => {
                    markupCellDragManager.endDrag(e, this.id);
                });
            }
            async updateContentAndRender(newContent, metadata) {
                this._content = { value: newContent, version: this._content.version + 1, metadata };
                this.renderTaskAbort?.abort();
                const controller = new AbortController();
                this.renderTaskAbort = controller;
                try {
                    await renderers.render(this.outputItem, undefined, this.element, this.renderTaskAbort.signal);
                }
                finally {
                    if (this.renderTaskAbort === controller) {
                        this.renderTaskAbort = undefined;
                    }
                }
                const root = (this.element.shadowRoot ?? this.element);
                const html = [];
                for (const child of root.children) {
                    switch (child.tagName) {
                        case 'LINK':
                        case 'SCRIPT':
                        case 'STYLE':
                            // not worth sending over since it will be stripped before rendering
                            break;
                        default:
                            html.push(child.outerHTML);
                            break;
                    }
                }
                const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
                postNotebookMessage('renderedMarkup', {
                    cellId: this.id,
                    html: html.join(''),
                    codeBlocks
                });
                dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
                    isOutput: false
                });
            }
            show(top, newContent, metadata) {
                this.element.style.visibility = '';
                this.element.style.top = `${top}px`;
                if (typeof newContent === 'string' || metadata) {
                    this.updateContentAndRender(newContent ?? this._content.value, metadata ?? this._content.metadata);
                }
                else {
                    this.updateMarkupDimensions();
                }
            }
            hide() {
                this.element.style.visibility = 'hidden';
            }
            unhide() {
                this.element.style.visibility = '';
                this.updateMarkupDimensions();
            }
            remove() {
                this.element.remove();
            }
            async updateMarkupDimensions() {
                dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
                    isOutput: false
                });
            }
            setSelected(selected) {
                this.element.classList.toggle('selected', selected);
            }
            toggleDragDropEnabled(enabled) {
                if (enabled) {
                    this.element.classList.add('draggable');
                    this.element.setAttribute('draggable', 'true');
                }
                else {
                    this.element.classList.remove('draggable');
                    this.element.removeAttribute('draggable');
                }
            }
        }
        class OutputCell {
            constructor(cellId) {
                this.outputElements = new Map();
                const container = $window.document.getElementById('container');
                const upperWrapperElement = createFocusSink(cellId);
                container.appendChild(upperWrapperElement);
                this.element = document.createElement('div');
                this.element.style.position = 'absolute';
                this.element.style.outline = '0';
                this.element.id = cellId;
                this.element.classList.add('cell_container');
                container.appendChild(this.element);
                this.element = this.element;
                const lowerWrapperElement = createFocusSink(cellId, true);
                container.appendChild(lowerWrapperElement);
            }
            dispose() {
                for (const output of this.outputElements.values()) {
                    output.dispose();
                }
                this.outputElements.clear();
            }
            createOutputElement(data) {
                let outputContainer = this.outputElements.get(data.outputId);
                if (!outputContainer) {
                    outputContainer = new OutputContainer(data.outputId);
                    this.element.appendChild(outputContainer.element);
                    this.outputElements.set(data.outputId, outputContainer);
                }
                return outputContainer.createOutputElement(data.outputId, data.outputOffset, data.left, data.cellId);
            }
            async renderOutputElement(data, preloadErrors, signal) {
                const startTime = Date.now();
                const outputElement /** outputNode */ = this.createOutputElement(data);
                await outputElement.render(data.content, data.rendererId, preloadErrors, signal);
                // don't hide until after this step so that the height is right
                outputElement /** outputNode */.element.style.visibility = data.initiallyHidden ? 'hidden' : '';
                if (!!data.executionId && !!data.rendererId) {
                    postNotebookMessage('notebookPerformanceMessage', { cellId: data.cellId, executionId: data.executionId, duration: Date.now() - startTime, rendererId: data.rendererId });
                }
            }
            clearOutput(outputId, rendererId) {
                const output = this.outputElements.get(outputId);
                output?.clear(rendererId);
                output?.dispose();
                this.outputElements.delete(outputId);
            }
            show(outputId, top) {
                const outputContainer = this.outputElements.get(outputId);
                if (!outputContainer) {
                    return;
                }
                this.element.style.visibility = '';
                this.element.style.top = `${top}px`;
                dimensionUpdater.updateHeight(outputId, outputContainer.element.offsetHeight, {
                    isOutput: true,
                });
            }
            hide() {
                this.element.style.visibility = 'hidden';
            }
            updateContentAndRerender(outputId, content) {
                this.outputElements.get(outputId)?.updateContentAndRender(content);
            }
            updateOutputHeight(outputId, height) {
                this.outputElements.get(outputId)?.updateHeight(height);
            }
            updateScroll(request) {
                this.element.style.top = `${request.cellTop}px`;
                const outputElement = this.outputElements.get(request.outputId);
                if (outputElement) {
                    outputElement.updateScroll(request.outputOffset);
                    if (request.forceDisplay && outputElement.outputNode) {
                        // TODO @rebornix @mjbvz, there is a misalignment here.
                        // We set output visibility on cell container, other than output container or output node itself.
                        outputElement.outputNode.element.style.visibility = '';
                    }
                }
                if (request.forceDisplay) {
                    this.element.style.visibility = '';
                }
            }
        }
        class OutputContainer {
            get outputNode() {
                return this._outputNode;
            }
            constructor(outputId) {
                this.outputId = outputId;
                this.element = document.createElement('div');
                this.element.classList.add('output_container');
                this.element.setAttribute('data-vscode-context', JSON.stringify({ 'preventDefaultContextMenuItems': true }));
                this.element.style.position = 'absolute';
                this.element.style.overflow = 'hidden';
            }
            dispose() {
                this._outputNode?.dispose();
            }
            clear(rendererId) {
                if (rendererId) {
                    renderers.clearOutput(rendererId, this.outputId);
                }
                this.element.remove();
            }
            updateHeight(height) {
                this.element.style.maxHeight = `${height}px`;
                this.element.style.height = `${height}px`;
            }
            updateScroll(outputOffset) {
                this.element.style.top = `${outputOffset}px`;
            }
            createOutputElement(outputId, outputOffset, left, cellId) {
                this.element.innerText = '';
                this.element.style.maxHeight = '0px';
                this.element.style.top = `${outputOffset}px`;
                this._outputNode?.dispose();
                this._outputNode = new OutputElement(outputId, left, cellId);
                this.element.appendChild(this._outputNode.element);
                return this._outputNode;
            }
            updateContentAndRender(content) {
                this._outputNode?.updateAndRerender(content);
            }
        }
        vscode.postMessage({
            __vscode_notebook_message: true,
            type: 'initialized'
        });
        for (const preload of ctx.staticPreloadsData) {
            kernelPreloads.load(preload.entrypoint);
        }
        function postNotebookMessage(type, properties) {
            vscode.postMessage({
                __vscode_notebook_message: true,
                type,
                ...properties
            });
        }
        class OutputElement {
            constructor(outputId, left, cellId) {
                this.outputId = outputId;
                this.cellId = cellId;
                this.hasResizeObserver = false;
                this.element = document.createElement('div');
                this.element.id = outputId;
                this.element.classList.add('output');
                this.element.style.position = 'absolute';
                this.element.style.top = `0px`;
                this.element.style.left = left + 'px';
                this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
                this.element.addEventListener('mouseenter', () => {
                    postNotebookMessage('mouseenter', { id: outputId });
                });
                this.element.addEventListener('mouseleave', () => {
                    postNotebookMessage('mouseleave', { id: outputId });
                });
            }
            dispose() {
                this.renderTaskAbort?.abort();
                this.renderTaskAbort = undefined;
            }
            async render(content, preferredRendererId, preloadErrors, signal) {
                this.renderTaskAbort?.abort();
                this.renderTaskAbort = undefined;
                this._content = { preferredRendererId, preloadErrors };
                if (content.type === 0 /* RenderOutputType.Html */) {
                    const trustedHtml = ttPolicy?.createHTML(content.htmlContent) ?? content.htmlContent; // CodeQL [SM03712] The content comes from renderer extensions, not from direct user input.
                    this.element.innerHTML = trustedHtml;
                }
                else if (preloadErrors.some(e => e instanceof Error)) {
                    const errors = preloadErrors.filter((e) => e instanceof Error);
                    showRenderError(`Error loading preloads`, this.element, errors);
                }
                else {
                    const item = createOutputItem(this.outputId, content.output.mime, content.metadata, content.output.valueBytes, content.allOutputs, content.output.appended);
                    const controller = new AbortController();
                    this.renderTaskAbort = controller;
                    // Abort rendering if caller aborts
                    signal?.addEventListener('abort', () => controller.abort());
                    try {
                        await renderers.render(item, preferredRendererId, this.element, controller.signal);
                    }
                    finally {
                        if (this.renderTaskAbort === controller) {
                            this.renderTaskAbort = undefined;
                        }
                    }
                }
                if (!this.hasResizeObserver) {
                    this.hasResizeObserver = true;
                    resizeObserver.observe(this.element, this.outputId, true, this.cellId);
                }
                const offsetHeight = this.element.offsetHeight;
                const cps = document.defaultView.getComputedStyle(this.element);
                if (offsetHeight !== 0 && cps.padding === '0px') {
                    // we set padding to zero if the output height is zero (then we can have a zero-height output DOM node)
                    // thus we need to ensure the padding is accounted when updating the init height of the output
                    dimensionUpdater.updateHeight(this.outputId, offsetHeight + ctx.style.outputNodePadding * 2, {
                        isOutput: true,
                        init: true,
                    });
                    this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
                }
                else {
                    dimensionUpdater.updateHeight(this.outputId, this.element.offsetHeight, {
                        isOutput: true,
                        init: true,
                    });
                }
                const root = this.element.shadowRoot ?? this.element;
                const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
                if (codeBlocks.length > 0) {
                    postNotebookMessage('renderedCellOutput', {
                        codeBlocks
                    });
                }
            }
            updateAndRerender(content) {
                if (this._content) {
                    this.render(content, this._content.preferredRendererId, this._content.preloadErrors);
                }
            }
        }
        const markupCellDragManager = new class MarkupCellDragManager {
            constructor() {
                $window.document.addEventListener('dragover', e => {
                    // Allow dropping dragged markup cells
                    e.preventDefault();
                });
                $window.document.addEventListener('drop', e => {
                    e.preventDefault();
                    const drag = this.currentDrag;
                    if (!drag) {
                        return;
                    }
                    this.currentDrag = undefined;
                    postNotebookMessage('cell-drop', {
                        cellId: drag.cellId,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        dragOffsetY: e.clientY,
                    });
                });
            }
            startDrag(e, cellId) {
                if (!e.dataTransfer) {
                    return;
                }
                if (!currentOptions.dragAndDropEnabled) {
                    return;
                }
                this.currentDrag = { cellId, clientY: e.clientY };
                const overlayZIndex = 9999;
                if (!this.dragOverlay) {
                    this.dragOverlay = document.createElement('div');
                    this.dragOverlay.style.position = 'absolute';
                    this.dragOverlay.style.top = '0';
                    this.dragOverlay.style.left = '0';
                    this.dragOverlay.style.zIndex = `${overlayZIndex}`;
                    this.dragOverlay.style.width = '100%';
                    this.dragOverlay.style.height = '100%';
                    this.dragOverlay.style.background = 'transparent';
                    $window.document.body.appendChild(this.dragOverlay);
                }
                e.target.style.zIndex = `${overlayZIndex + 1}`;
                e.target.classList.add('dragging');
                postNotebookMessage('cell-drag-start', {
                    cellId: cellId,
                    dragOffsetY: e.clientY,
                });
                // Continuously send updates while dragging instead of relying on `updateDrag`.
                // This lets us scroll the list based on drag position.
                const trySendDragUpdate = () => {
                    if (this.currentDrag?.cellId !== cellId) {
                        return;
                    }
                    postNotebookMessage('cell-drag', {
                        cellId: cellId,
                        dragOffsetY: this.currentDrag.clientY,
                    });
                    $window.requestAnimationFrame(trySendDragUpdate);
                };
                $window.requestAnimationFrame(trySendDragUpdate);
            }
            updateDrag(e, cellId) {
                if (cellId !== this.currentDrag?.cellId) {
                    this.currentDrag = undefined;
                }
                else {
                    this.currentDrag = { cellId, clientY: e.clientY };
                }
            }
            endDrag(e, cellId) {
                this.currentDrag = undefined;
                e.target.classList.remove('dragging');
                postNotebookMessage('cell-drag-end', {
                    cellId: cellId
                });
                if (this.dragOverlay) {
                    $window.document.body.removeChild(this.dragOverlay);
                    this.dragOverlay = undefined;
                }
                e.target.style.zIndex = '';
            }
        }();
    }
    function preloadsScriptStr(styleValues, options, renderOptions, renderers, preloads, isWorkspaceTrusted, nonce) {
        const ctx = {
            style: styleValues,
            options,
            renderOptions,
            rendererData: renderers,
            staticPreloadsData: preloads,
            isWorkspaceTrusted,
            nonce,
        };
        // TS will try compiling `import()` in webviewPreloads, so use a helper function instead
        // of using `import(...)` directly
        return `
		const __import = (x) => import(x);
		(${webviewPreloads})(
			JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(ctx))}"))
		)\n//# sourceURL=notebookWebviewPreloads.js\n`;
    }
    exports.preloadsScriptStr = preloadsScriptStr;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1ByZWxvYWRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvcmVuZGVyZXJzL3dlYnZpZXdQcmVsb2Fkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1RmhHLEtBQUssVUFBVSxlQUFlLENBQUMsR0FBbUI7UUFDakQsaURBQWlEO1FBQ2pELE1BQU0sT0FBTyxHQUFHLE1BQTRCLENBQUM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN0QyxNQUFNLFFBQVEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBRXRDLElBQUksY0FBYyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDakMsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUM7UUFDbEQsSUFBSSxvQkFBb0IsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQzdDLE1BQU0sYUFBYSxHQUErQixhQUFhLEVBQWlCLENBQUM7UUFFakYsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDckQsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNsQyxPQUFRLFVBQWtCLENBQUMsZ0JBQWdCLENBQUM7UUFFNUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQzlDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXpELE1B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