/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/common/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/idGenerator", "vs/base/common/linkedText", "vs/nls", "vs/css!./media/quickInput"], function (require, exports, dom, event_1, event_2, keyboardEvent_1, touch_1, iconLabels_1, idGenerator_1, linkedText_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderQuickInputDescription = exports.quickInputButtonToAction = void 0;
    const iconPathToClass = {};
    const iconClassGenerator = new idGenerator_1.IdGenerator('quick-input-button-icon-');
    function getIconClass(iconPath) {
        if (!iconPath) {
            return undefined;
        }
        let iconClass;
        const key = iconPath.dark.toString();
        if (iconPathToClass[key]) {
            iconClass = iconPathToClass[key];
        }
        else {
            iconClass = iconClassGenerator.nextId();
            dom.createCSSRule(`.${iconClass}, .hc-light .${iconClass}`, `background-image: ${dom.asCSSUrl(iconPath.light || iconPath.dark)}`);
            dom.createCSSRule(`.vs-dark .${iconClass}, .hc-black .${iconClass}`, `background-image: ${dom.asCSSUrl(iconPath.dark)}`);
            iconPathToClass[key] = iconClass;
        }
        return iconClass;
    }
    function quickInputButtonToAction(button, id, run) {
        let cssClasses = button.iconClass || getIconClass(button.iconPath);
        if (button.alwaysVisible) {
            cssClasses = cssClasses ? `${cssClasses} always-visible` : 'always-visible';
        }
        return {
            id,
            label: '',
            tooltip: button.tooltip || '',
            class: cssClasses,
            enabled: true,
            run
        };
    }
    exports.quickInputButtonToAction = quickInputButtonToAction;
    function renderQuickInputDescription(description, container, actionHandler) {
        dom.reset(container);
        const parsed = (0, linkedText_1.parseLinkedText)(description);
        let tabIndex = 0;
        for (const node of parsed.nodes) {
            if (typeof node === 'string') {
                container.append(...(0, iconLabels_1.renderLabelWithIcons)(node));
            }
            else {
                let title = node.title;
                if (!title && node.href.startsWith('command:')) {
                    title = (0, nls_1.localize)('executeCommand', "Click to execute command '{0}'", node.href.substring('command:'.length));
                }
                else if (!title) {
                    title = node.href;
                }
                const anchor = dom.$('a', { href: node.href, title, tabIndex: tabIndex++ }, node.label);
                anchor.style.textDecoration = 'underline';
                const handleOpen = (e) => {
                    if (dom.isEventLike(e)) {
                        dom.EventHelper.stop(e, true);
                    }
                    actionHandler.callback(node.href);
                };
                const onClick = actionHandler.disposables.add(new event_1.DomEmitter(anchor, dom.EventType.CLICK)).event;
                const onKeydown = actionHandler.disposables.add(new event_1.DomEmitter(anchor, dom.EventType.KEY_DOWN)).event;
                const onSpaceOrEnter = event_2.Event.chain(onKeydown, $ => $.filter(e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                }));
                actionHandler.disposables.add(touch_1.Gesture.addTarget(anchor));
                const onTap = actionHandler.disposables.add(new event_1.DomEmitter(anchor, touch_1.EventType.Tap)).event;
                event_2.Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.disposables);
                container.appendChild(anchor);
            }
        }
    }
    exports.renderQuickInputDescription = renderQuickInputDescription;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2Jyb3dzZXIvcXVpY2tJbnB1dFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBTSxlQUFlLEdBQTJCLEVBQUUsQ0FBQztJQUNuRCxNQUFNLGtCQUFrQixHQUFHLElBQUkseUJBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRXZFLFNBQVMsWUFBWSxDQUFDLFFBQWdEO1FBQ3JFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxJQUFJLFNBQWlCLENBQUM7UUFFdEIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFCLFNBQVMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsQ0FBQzthQUFNLENBQUM7WUFDUCxTQUFTLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDeEMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFNBQVMsZ0JBQWdCLFNBQVMsRUFBRSxFQUFFLHFCQUFxQixHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsSSxHQUFHLENBQUMsYUFBYSxDQUFDLGFBQWEsU0FBUyxnQkFBZ0IsU0FBUyxFQUFFLEVBQUUscUJBQXFCLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6SCxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxD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