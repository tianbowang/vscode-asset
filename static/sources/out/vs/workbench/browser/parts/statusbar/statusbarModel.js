/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/browser/dom", "vs/base/common/event"], function (require, exports, lifecycle_1, statusbar_1, dom_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarViewModel = void 0;
    class StatusbarViewModel extends lifecycle_1.Disposable {
        static { this.HIDDEN_ENTRIES_KEY = 'workbench.statusbar.hidden'; }
        get entries() { return this._entries.slice(0); }
        get lastFocusedEntry() {
            return this._lastFocusedEntry && !this.isHidden(this._lastFocusedEntry.id) ? this._lastFocusedEntry : undefined;
        }
        constructor(storageService) {
            super();
            this.storageService = storageService;
            this._onDidChangeEntryVisibility = this._register(new event_1.Emitter());
            this.onDidChangeEntryVisibility = this._onDidChangeEntryVisibility.event;
            this._entries = []; // Intentionally not using a map here since multiple entries can have the same ID
            this.hidden = new Set();
            this.restoreState();
            this.registerListeners();
        }
        restoreState() {
            const hiddenRaw = this.storageService.get(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* StorageScope.PROFILE */);
            if (hiddenRaw) {
                try {
                    const hiddenArray = JSON.parse(hiddenRaw);
                    this.hidden = new Set(hiddenArray);
                }
                catch (error) {
                    // ignore parsing errors
                }
            }
        }
        registerListeners() {
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, StatusbarViewModel.HIDDEN_ENTRIES_KEY, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidStorageValueChange()));
        }
        onDidStorageValueChange() {
            // Keep current hidden entries
            const currentlyHidden = new Set(this.hidden);
            // Load latest state of hidden entries
            this.hidden.clear();
            this.restoreState();
            const changed = new Set();
            // Check for each entry that is now visible
            for (const id of currentlyHidden) {
                if (!this.hidden.has(id)) {
                    changed.add(id);
                }
            }
            // Check for each entry that is now hidden
            for (const id of this.hidden) {
                if (!currentlyHidden.has(id)) {
                    changed.add(id);
                }
            }
            // Update visibility for entries have changed
            if (changed.size > 0) {
                for (const entry of this._entries) {
                    if (changed.has(entry.id)) {
                        this.updateVisibility(entry.id, true);
                        changed.delete(entry.id);
                    }
                }
            }
        }
        add(entry) {
            // Add to set of entries
            this._entries.push(entry);
            // Update visibility directly
            this.updateVisibility(entry, false);
            // Sort according to priority
            this.sort();
            // Mark first/last visible entry
            this.markFirstLastVisibleEntry();
        }
        remove(entry) {
            const index = this._entries.indexOf(entry);
            if (index >= 0) {
                // Remove from entries
                this._entries.splice(index, 1);
                // Re-sort entries if this one was used
                // as reference from other entries
                if (this._entries.some(otherEntry => (0, statusbar_1.isStatusbarEntryLocation)(otherEntry.priority.primary) && otherEntry.priority.primary.id === entry.id)) {
                    this.sort();
                }
                // Mark first/last visible entry
                this.markFirstLastVisibleEntry();
            }
        }
        isHidden(id) {
            return this.hidden.has(id);
        }
        hide(id) {
            if (!this.hidden.has(id)) {
                this.hidden.add(id);
                this.updateVisibility(id, true);
                this.saveState();
            }
        }
        show(id) {
            if (this.hidden.has(id)) {
                this.hidden.delete(id);
                this.updateVisibility(id, true);
                this.saveState();
            }
        }
        findEntry(container) {
            return this._entries.find(entry => entry.container === container);
        }
        getEntries(alignment) {
            return this._entries.filter(entry => entry.alignment === alignment);
        }
        focusNextEntry() {
            this.focusEntry(+1, 0);
        }
        focusPreviousEntry() {
            this.focusEntry(-1, this.entries.length - 1);
        }
        isEntryFocused() {
            return !!this.getFocusedEntry();
        }
        getFocusedEntry() {
            return this._entries.find(entry => (0, dom_1.isAncestorOfActiveElement)(entry.container));
        }
        focusEntry(delta, restartPosition) {
            const getVisibleEntry = (start) => {
                let indexToFocus = start;
                let entry = (indexToFocus >= 0 && indexToFocus < this._entries.length) ? this._entries[indexToFocus] : undefined;
                while (entry && this.isHidden(entry.id)) {
                    indexToFocus += delta;
                    entry = (indexToFocus >= 0 && indexToFocus < this._entries.length) ? this._entries[indexToFocus] : undefined;
                }
                return entry;
            };
            const focused = this.getFocusedEntry();
            if (focused) {
                const entry = getVisibleEntry(this._entries.indexOf(focused) + delta);
                if (entry) {
                    this._lastFocusedEntry = entry;
                    entry.labelContainer.focus();
                    return;
                }
            }
            const entry = getVisibleEntry(restartPosition);
            if (entry) {
                this._lastFocusedEntry = entry;
                entry.labelContainer.focus();
            }
        }
        updateVisibility(arg1, trigger) {
            // By identifier
            if (typeof arg1 === 'string') {
                const id = arg1;
                for (const entry of this._entries) {
                    if (entry.id === id) {
                        this.updateVisibility(entry, trigger);
                    }
                }
            }
            // By entry
            else {
                const entry = arg1;
                const isHidden = this.isHidden(entry.id);
                // Use CSS to show/hide item container
                if (isHidden) {
                    (0, dom_1.hide)(entry.container);
                }
                else {
                    (0, dom_1.show)(entry.container);
                }
                if (trigger) {
                    this._onDidChangeEntryVisibility.fire({ id: entry.id, visible: !isHidden });
                }
                // Mark first/last visible entry
                this.markFirstLastVisibleEntry();
            }
        }
        saveState() {
            if (this.hidden.size > 0) {
                this.storageService.store(StatusbarViewModel.HIDDEN_ENTRIES_KEY, JSON.stringify(Array.from(this.hidden.values())), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            else {
                this.storageService.remove(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* StorageScope.PROFILE */);
            }
        }
        sort() {
            // Split up entries into 2 buckets:
            // - those with `priority: number` that can be compared
            // - those with `priority: string` that must be sorted
            //   relative to another entry if possible
            const mapEntryWithNumberedPriorityToIndex = new Map();
            const mapEntryWithRelativePriority = new Map();
            for (let i = 0; i < this._entries.length; i++) {
                const entry = this._entries[i];
                if (typeof entry.priority.primary === 'number') {
                    mapEntryWithNumberedPriorityToIndex.set(entry, i);
                }
                else {
                    let entries = mapEntryWithRelativePriority.get(entry.priority.primary.id);
                    if (!entries) {
                        entries = [];
                        mapEntryWithRelativePriority.set(entry.priority.primary.id, entries);
                    }
                    entries.push(entry);
                }
            }
            // Sort the entries with `priority: number` according to that
            const sortedEntriesWithNumberedPriority = Array.from(mapEntryWithNumberedPriorityToIndex.keys());
            sortedEntriesWithNumberedPriority.sort((entryA, entryB) => {
                if (entryA.alignment === entryB.alignment) {
                    // Sort by primary/secondary priority: higher values move towards the left
                    if (entryA.priority.primary !== entryB.priority.primary) {
                        return Number(entryB.priority.primary) - Number(entryA.priority.primary);
                    }
                    if (entryA.priority.secondary !== entryB.priority.secondary) {
                        return entryB.priority.secondary - entryA.priority.secondary;
                    }
                    // otherwise maintain stable order (both values known to be in map)
                    return mapEntryWithNumberedPriorityToIndex.get(entryA) - mapEntryWithNumberedPriorityToIndex.get(entryB);
                }
                if (entryA.alignment === 0 /* StatusbarAlignment.LEFT */) {
                    return -1;
                }
                if (entryB.alignment === 0 /* StatusbarAlignment.LEFT */) {
                    return 1;
                }
                return 0;
            });
            let sortedEntries;
            // Entries with location: sort in accordingly
            if (mapEntryWithRelativePriority.size > 0) {
                sortedEntries = [];
                for (const entry of sortedEntriesWithNumberedPriority) {
                    const relativeEntries = mapEntryWithRelativePriority.get(entry.id);
                    // Fill relative entries to LEFT
                    if (relativeEntries) {
                        sortedEntries.push(...relativeEntries.filter(entry => (0, statusbar_1.isStatusbarEntryLocation)(entry.priority.primary) && entry.priority.primary.alignment === 0 /* StatusbarAlignment.LEFT */));
                    }
                    // Fill referenced entry
                    sortedEntries.push(entry);
                    // Fill relative entries to RIGHT
                    if (relativeEntries) {
                        sortedEntries.push(...relativeEntries.filter(entry => (0, statusbar_1.isStatusbarEntryLocation)(entry.priority.primary) && entry.priority.primary.alignment === 1 /* StatusbarAlignment.RIGHT */));
                    }
                    // Delete from map to mark as handled
                    mapEntryWithRelativePriority.delete(entry.id);
                }
                // Finally, just append all entries that reference another entry
                // that does not exist to the end of the list
                for (const [, entries] of mapEntryWithRelativePriority) {
                    sortedEntries.push(...entries);
                }
            }
            // No entries with relative priority: take sorted entries as is
            else {
                sortedEntries = sortedEntriesWithNumberedPriority;
            }
            // Take over as new truth of entries
            this._entries = sortedEntries;
        }
        markFirstLastVisibleEntry() {
            this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(0 /* StatusbarAlignment.LEFT */));
            this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(1 /* StatusbarAlignment.RIGHT */));
        }
        doMarkFirstLastVisibleStatusbarItem(entries) {
            let firstVisibleItem;
            let lastVisibleItem;
            for (const entry of entries) {
                // Clear previous first
                entry.container.classList.remove('first-visible-item', 'last-visible-item');
                const isVisible = !this.isHidden(entry.id);
                if (isVisible) {
                    if (!firstVisibleItem) {
                        firstVisibleItem = entry;
                    }
                    lastVisibleItem = entry;
                }
            }
            // Mark: first visible item
            firstVisibleItem?.container.classList.add('first-visible-item');
            // Mark: last visible item
            lastVisibleItem?.container.classList.add('last-visible-item');
        }
    }
    exports.StatusbarViewModel = StatusbarViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3N0YXR1c2Jhci9zdGF0dXNiYXJNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsa0JBQW1CLFNBQVEsc0JBQVU7aUJBRXpCLHVCQUFrQixHQUFHLDRCQUE0QixBQUEvQixDQUFnQztRQU0xRSxJQUFJLE9BQU8sS0FBaUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUUsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakgsQ0FBQztRQUlELFlBQTZCLGNBQStCO1lBQzNELEtBQUssRUFBRSxDQUFDO1lBRG9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQWIzQyxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFvQyxDQUFDLENBQUM7WUFDdEcsK0JBQTBCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQztZQUVyRSxhQUFRLEdBQStCLEVBQUUsQ0FBQyxDQUFDLGlGQUFpRjtZQVE1SCxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUtsQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLFlBQVk7WUFDbkIsTUFBTSxTQUFTLEdBQUcsSUFBSSxD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