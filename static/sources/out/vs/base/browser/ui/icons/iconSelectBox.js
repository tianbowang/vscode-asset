/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/css!./iconSelectBox"], function (require, exports, dom, aria_1, inputBox_1, scrollableElement_1, event_1, lifecycle_1, themables_1, nls_1, highlightedLabel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IconSelectBox = void 0;
    class IconSelectBox extends lifecycle_1.Disposable {
        static { this.InstanceCount = 0; }
        constructor(options) {
            super();
            this.options = options;
            this.domId = `icon_select_box_id_${++IconSelectBox.InstanceCount}`;
            this._onDidSelect = this._register(new event_1.Emitter());
            this.onDidSelect = this._onDidSelect.event;
            this.renderedIcons = [];
            this.focusedItemIndex = 0;
            this.numberOfElementsPerRow = 1;
            this.iconContainerWidth = 36;
            this.iconContainerHeight = 36;
            this.domNode = dom.$('.icon-select-box');
            this._register(this.create());
        }
        create() {
            const disposables = new lifecycle_1.DisposableStore();
            const iconSelectBoxContainer = dom.append(this.domNode, dom.$('.icon-select-box-container'));
            iconSelectBoxContainer.style.margin = '10px 15px';
            const iconSelectInputContainer = dom.append(iconSelectBoxContainer, dom.$('.icon-select-input-container'));
            iconSelectInputContainer.style.paddingBottom = '10px';
            this.inputBox = disposables.add(new inputBox_1.InputBox(iconSelectInputContainer, undefined, {
                placeholder: (0, nls_1.localize)('iconSelect.placeholder', "Search icons"),
                inputBoxStyles: this.options.inputBoxStyles,
            }));
            const iconsContainer = this.iconsContainer = dom.$('.icon-select-icons-container', { id: `${this.domId}_icons` });
            iconsContainer.role = 'listbox';
            iconsContainer.tabIndex = 0;
            this.scrollableElement = disposables.add(new scrollableElement_1.DomScrollableElement(iconsContainer, {
                useShadows: false,
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
            }));
            dom.append(iconSelectBoxContainer, this.scrollableElement.getDomNode());
            if (this.options.showIconInfo) {
                this.iconIdElement = new highlightedLabel_1.HighlightedLabel(dom.append(dom.append(iconSelectBoxContainer, dom.$('.icon-select-id-container')), dom.$('.icon-select-id-label')));
            }
            const iconsDisposables = disposables.add(new lifecycle_1.MutableDisposable());
            iconsDisposables.value = this.renderIcons(this.options.icons, [], iconsContainer);
            this.scrollableElement.scanDomNode();
            disposables.add(this.inputBox.onDidChange(value => {
                const icons = [], matches = [];
                for (const icon of this.options.icons) {
                    const match = this.matchesContiguous(value, icon.id);
                    if (match) {
                        icons.push(icon);
                        matches.push(match);
                    }
                }
                if (icons.length) {
                    iconsDisposables.value = this.renderIcons(icons, matches, iconsContainer);
                    this.scrollableElement?.scanDomNode();
                }
            }));
            this.inputBox.inputElement.role = 'combobox';
            this.inputBox.inputElement.ariaHasPopup = 'menu';
            this.inputBox.inputElement.ariaAutoComplete = 'list';
            this.inputBox.inputElement.ariaExpanded = 'true';
            this.inputBox.inputElement.setAttribute('aria-controls', iconsContainer.id);
            return disposables;
        }
        renderIcons(icons, matches, container) {
            const disposables = new lifecycle_1.DisposableStore();
            dom.clearNode(container);
            const focusedIcon = this.renderedIcons[this.focusedItemIndex]?.icon;
            let focusedIconIndex = 0;
            const renderedIcons = [];
            if (icons.length) {
                for (let index = 0; index < icons.length; index++) {
                    const icon = icons[index];
                    const iconContainer = dom.append(container, dom.$('.icon-container', { id: `${this.domId}_icons_${index}` }));
                    iconContainer.style.width = `${this.iconContainerWidth}px`;
                    iconContainer.style.height = `${this.iconContainerHeight}px`;
                    iconContainer.title = icon.id;
                    iconContainer.role = 'button';
                    iconContainer.setAttribute('aria-setsize', `${icons.length}`);
                    iconContainer.setAttribute('aria-posinset', `${index + 1}`);
                    dom.append(iconContainer, dom.$(themables_1.ThemeIcon.asCSSSelector(icon)));
                    renderedIcons.push({ icon, element: iconContainer, highlightMatches: matches[index] });
                    disposables.add(dom.addDisposableListener(iconContainer, dom.EventType.CLICK, (e) => {
                        e.stopPropagation();
                        this.setSelection(index);
                    }));
                    if (icon === focusedIcon) {
                        focusedIconIndex = index;
                    }
                }
            }
            else {
                const noResults = (0, nls_1.localize)('iconSelect.noResults', "No results");
                dom.append(container, dom.$('.icon-no-results', undefined, noResults));
                (0, aria_1.alert)(noResults);
            }
            this.renderedIcons.splice(0, this.renderedIcons.length, ...renderedIcons);
            this.focusIcon(focusedIconIndex);
            return disposables;
        }
        focusIcon(index) {
            const existing = this.renderedIcons[this.focusedItemIndex];
            if (existing) {
                existing.element.classList.remove('focused');
            }
            this.focusedItemIndex = index;
            const renderedItem = this.renderedIcons[index];
            if (renderedItem) {
                renderedItem.element.classList.add('focused');
            }
            if (this.inputBox) {
                if (renderedItem) {
                    this.inputBox.inputElement.setAttribute('aria-activedescendant', renderedItem.element.id);
                }
                else {
                    this.inputBox.inputElement.removeAttribute('aria-activedescendant');
                }
            }
            if (this.iconIdElement) {
                if (renderedItem) {
                    this.iconIdElement.set(renderedItem.icon.id, renderedItem.highlightMatches);
                }
                else {
                    this.iconIdElement.set('');
                }
            }
            this.reveal(index);
        }
        reveal(index) {
            if (!this.scrollableElement) {
                return;
            }
            if (index < 0 || index >= this.renderedIcons.length) {
                return;
            }
            const element = this.renderedIcons[index].element;
            if (!element) {
                return;
            }
            const { height } = this.scrollableElement.getScrollDimensions();
            const { scrollTop } = this.scrollableElement.getScrollPosition();
            if (element.offsetTop + this.iconContainerHeight > scrollTop + height) {
                this.scrollableElement.setScrollPosition({ scrollTop: element.offsetTop + this.iconContainerHeight - height });
            }
            else if (element.offsetTop < scrollTop) {
                this.scrollableElement.setScrollPosition({ scrollTop: element.offsetTop });
            }
        }
        matchesContiguous(word, wordToMatchAgainst) {
            const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
            if (matchIndex !== -1) {
                return [{ start: matchIndex, end: matchIndex + word.length }];
            }
            return null;
        }
        layout(dimension) {
            this.domNode.style.width = `${dimension.width}px`;
            this.domNode.style.height = `${dimension.height}px`;
            const iconsContainerWidth = dimension.width - 30;
            this.numberOfElementsPerRow = Math.floor(iconsContainerWidth / this.iconContainerWidth);
            if (this.numberOfElementsPerRow === 0) {
                throw new Error('Insufficient width');
            }
            const extraSpace = iconsContainerWidth % this.iconContainerWidth;
            const iconElementMargin = Math.floor(extraSpace / this.numberOfElementsPerRow);
            for (const { element } of this.renderedIcons) {
                element.style.marginRight = `${iconElementMargin}px`;
            }
            const containerPadding = extraSpace % this.numberOfElementsPerRow;
            if (this.iconsContainer) {
                this.iconsContainer.style.paddingLeft = `${Math.floor(containerPadding / 2)}px`;
                this.iconsContainer.style.paddingRight = `${Math.ceil(containerPadding / 2)}px`;
            }
            if (this.scrollableElement) {
                this.scrollableElement.getDomNode().style.height = `${this.iconIdElement ? dimension.height - 80 : dimension.height - 40}px`;
                this.scrollableElement.scanDomNode();
            }
        }
        getFocus() {
            return [this.focusedItemIndex];
        }
        setSelection(index) {
            if (index < 0 || index >= this.renderedIcons.length) {
                throw new Error(`Invalid index ${index}`);
            }
            this.focusIcon(index);
            this._onDidSelect.fire(this.renderedIcons[index].icon);
        }
        clearInput() {
            if (this.inputBox) {
                this.inputBox.value = '';
            }
        }
        focus() {
            this.inputBox?.focus();
            this.focusIcon(0);
        }
        focusNext() {
            this.focusIcon((this.focusedItemIndex + 1) % this.renderedIcons.length);
        }
        focusPrevious() {
            this.focusIcon((this.focusedItemIndex - 1 + this.renderedIcons.length) % this.renderedIcons.length);
        }
        focusNextRow() {
            let nextRowIndex = this.focusedItemIndex + this.numberOfElementsPerRow;
            if (nextRowIndex >= this.renderedIcons.length) {
                nextRowIndex = (nextRowIndex + 1) % this.numberOfElementsPerRow;
                nextRowIndex = nextRowIndex >= this.renderedIcons.length ? 0 : nextRowIndex;
            }
            this.focusIcon(nextRowIndex);
        }
        focusPreviousRow() {
            let previousRowIndex = this.focusedItemIndex - this.numberOfElementsPerRow;
            if (previousRowIndex < 0) {
                const numberOfRows = Math.floor(this.renderedIcons.length / this.numberOfElementsPerRow);
                previousRowIndex = this.focusedItemIndex + (this.numberOfElementsPerRow * numberOfRows) - 1;
                previousRowIndex = previousRowIndex < 0
                    ? this.renderedIcons.length - 1
                    : previousRowIndex >= this.renderedIcons.length
                        ? previousRowIndex - this.numberOfElementsPerRow
                        : previousRowIndex;
            }
            this.focusIcon(previousRowIndex);
        }
        getFocusedIcon() {
            return this.renderedIcons[this.focusedItemIndex].icon;
        }
    }
    exports.IconSelectBox = IconSelectBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvblNlbGVjdEJveC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2ljb25zL2ljb25TZWxlY3RCb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRyxNQUFhLGFBQWMsU0FBUSxzQkFBVTtpQkFFN0Isa0JBQWEsR0FBRyxDQUFDLEFBQUosQ0FBSztRQW9CakMsWUFDa0IsT0FBOEI7WUFFL0MsS0FBSyxFQUFFLENBQUM7WUFGUyxZQUFPLEdBQVAsT0FBTyxDQUF1QjtZQXBCdkMsVUFBSyxHQUFHLHNCQUFzQixFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUkvRCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWEsQ0FBQyxDQUFDO1lBQ3ZELGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFdkMsa0JBQWEsR0FBd0IsRUFBRSxDQUFDO1lBRXhDLHFCQUFnQixHQUFXLENBQUMsQ0FBQztZQUM3QiwyQkFBc0IsR0FBVyxDQUFDLENBQUM7WUFNMUIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLHdCQUFtQixHQUFHLEVBQUUsQ0FBQztZQU16QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxNQUFNO1lBQ2IsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsTUFBTSxzQkFBc0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDN0Ysc0JBQXNCLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7WUFFbEQsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQzNHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1lBQ3RELElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1CQUFRLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxFQUFFO2dCQUNqRixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsY0FBYyxDQUFDO2dCQUMvRCxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjO2FBQzNDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsSCxjQUFjLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUNoQyxjQUFjLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdDQUFvQixDQUFDLGNBQWMsRUFBRTtnQkFDakYsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFVBQVUsb0NBQTRCO2FBQ3RDLENBQUMsQ0FBQyxDQUFDO1lBQ0osR0FBRyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUV4RSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvSixDQUFDO1lBRUQsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLGdCQUFnQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFckMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakQsTUFBTSxLQUFLLEdBQUcsRUFBRSxFQUFFLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQy9CLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDdkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3JELElBQUksS0FBSyxFQUFFLENBQUM7d0JBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDckIsQ0FBQztnQkFDRixDQUFDO2dCQUNELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNsQixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUMxRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLENBQUM7Z0JBQ3ZDLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztZQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1lBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztZQUNyRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1lBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTVFLE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7UUFFTyxXQUFXLENBQUMsS0FBa0IsRUFBRSxPQUFtQixFQUFFLFNBQXNCO1lBQ2xGLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDcEUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFDekIsTUFBTSxhQUFhLEdBQXdCLEVBQUUsQ0FBQztZQUM5QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztvQkFDbkQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMxQixNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssVUFBVSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQztvQkFDM0QsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLElBQUksQ0FBQztvQkFDN0QsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM5QixhQUFhLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztvQkFDOUIsYUFBYSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDOUQsYUFBYSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDNUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUV2RixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRTt3QkFDL0YsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVKLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO3dCQUMxQixnQkFBZ0IsR0FBRyxLQUFLLENBQUM7b0JBQzFCLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLFNBQVMsR0FBRyxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDakUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDdkUsSUFBQSxZQUFLLEVBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEIsQ0FBQztZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVqQyxPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBRU8sU0FBUyxDQUFDLEtBQWE7WUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNkLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztZQUM5QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9DLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2xCLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25CLElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQ3JFLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM3RSxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRU8sTUFBTSxDQUFDLEtBQWE7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckQsT0FBTztZQUNSLENBQUM7WUFDRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsT0FBTztZQUNSLENBQUM7WUFDRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDaEUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2pFLElBQUksT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDO2dCQUN2RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNoSCxDQUFDO2lCQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLENBQUM7UUFDRixDQUFDO1FBRU8saUJBQWlCLENBQUMsSUFBWSxFQUFFLGtCQUEwQjtZQUNqRSxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDaEYsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBd0I7WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssSUFBSSxDQUFDO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQztZQUVwRCxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2pELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3hGLElBQUksSUFBSSxDQUFDLHNCQUFzQixLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDdkMsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNqRSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQy9FLEtBQUssTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDOUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRyxpQkFBaUIsSUFBSSxDQUFDO1lBQ3RELENBQUM7WUFFRCxNQUFNLGdCQUFnQixHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7WUFDbEUsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDaEYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2pGLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUM3SCxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEMsQ0FBQztRQUNGLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxZQUFZLENBQUMsS0FBYTtZQUN6QixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsVUFBVTtZQUNULElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDMUIsQ0FBQztRQUNGLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFRCxTQUFTO1lBQ1IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxhQUFhO1lBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFRCxZQUFZO1lBQ1gsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztZQUN2RSxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMvQyxZQUFZLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO2dCQUNoRSxZQUFZLEdBQUcsWUFBWSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUM3RSxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBQzNFLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3pGLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVGLGdCQUFnQixHQUFHLGdCQUFnQixHQUFHLENBQUM7b0JBQ3RDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUMvQixDQUFDLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO3dCQUM5QyxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQjt3QkFDaEQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1lBQ3RCLENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELGNBQWM7WUFDYixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZELENBQUM7O0lBNVFGLHNDQThRQyJ9