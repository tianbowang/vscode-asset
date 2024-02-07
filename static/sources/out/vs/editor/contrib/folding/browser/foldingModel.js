/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "./foldingRanges", "vs/base/common/hash"], function (require, exports, event_1, foldingRanges_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNextFoldLine = exports.getPreviousFoldLine = exports.getParentFoldLine = exports.setCollapseStateForType = exports.setCollapseStateForMatchingLines = exports.setCollapseStateForRest = exports.setCollapseStateAtLevel = exports.setCollapseStateUp = exports.setCollapseStateLevelsUp = exports.setCollapseStateLevelsDown = exports.toggleCollapseState = exports.FoldingModel = void 0;
    class FoldingModel {
        get regions() { return this._regions; }
        get textModel() { return this._textModel; }
        get decorationProvider() { return this._decorationProvider; }
        constructor(textModel, decorationProvider) {
            this._updateEventEmitter = new event_1.Emitter();
            this.onDidChange = this._updateEventEmitter.event;
            this._textModel = textModel;
            this._decorationProvider = decorationProvider;
            this._regions = new foldingRanges_1.FoldingRegions(new Uint32Array(0), new Uint32Array(0));
            this._editorDecorationIds = [];
        }
        toggleCollapseState(toggledRegions) {
            if (!toggledRegions.length) {
                return;
            }
            toggledRegions = toggledRegions.sort((r1, r2) => r1.regionIndex - r2.regionIndex);
            const processed = {};
            this._decorationProvider.changeDecorations(accessor => {
                let k = 0; // index from [0 ... this.regions.length]
                let dirtyRegionEndLine = -1; // end of the range where decorations need to be updated
                let lastHiddenLine = -1; // the end of the last hidden lines
                const updateDecorationsUntil = (index) => {
                    while (k < index) {
                        const endLineNumber = this._regions.getEndLineNumber(k);
                        const isCollapsed = this._regions.isCollapsed(k);
                        if (endLineNumber <= dirtyRegionEndLine) {
                            const isManual = this.regions.getSource(k) !== 0 /* FoldSource.provider */;
                            accessor.changeDecorationOptions(this._editorDecorationIds[k], this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual));
                        }
                        if (isCollapsed && endLineNumber > lastHiddenLine) {
                            lastHiddenLine = endLineNumber;
                        }
                        k++;
                    }
                };
                for (const region of toggledRegions) {
                    const index = region.regionIndex;
                    const editorDecorationId = this._editorDecorationIds[index];
                    if (editorDecorationId && !processed[editorDecorationId]) {
                        processed[editorDecorationId] = true;
                        updateDecorationsUntil(index); // update all decorations up to current index using the old dirtyRegionEndLine
                        const newCollapseState = !this._regions.isCollapsed(index);
                        this._regions.setCollapsed(index, newCollapseState);
                        dirtyRegionEndLine = Math.max(dirtyRegionEndLine, this._regions.getEndLineNumber(index));
                    }
                }
                updateDecorationsUntil(this._regions.length);
            });
            this._updateEventEmitter.fire({ model: this, collapseStateChanged: toggledRegions });
        }
        removeManualRanges(ranges) {
            const newFoldingRanges = new Array();
            const intersects = (foldRange) => {
                for (const range of ranges) {
                    if (!(range.startLineNumber > foldRange.endLineNumber || foldRange.startLineNumber > range.endLineNumber)) {
                        return true;
                    }
                }
                return false;
            };
            for (let i = 0; i < this._regions.length; i++) {
                const foldRange = this._regions.toFoldRange(i);
                if (foldRange.source === 0 /* FoldSource.provider */ || !intersects(foldRange)) {
                    newFoldingRanges.push(foldRange);
                }
            }
            this.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newFoldingRanges));
        }
        update(newRegions, blockedLineNumers = []) {
            const foldedOrManualRanges = this._currentFoldedOrManualRanges(blockedLineNumers);
            const newRanges = foldingRanges_1.FoldingRegions.sanitizeAndMerge(newRegions, foldedOrManualRanges, this._textModel.getLineCount());
            this.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newRanges));
        }
        updatePost(newRegions) {
            const newEditorDecorations = [];
            let lastHiddenLine = -1;
            for (let index = 0, limit = newRegions.length; index < limit; index++) {
                const startLineNumber = newRegions.getStartLineNumber(index);
                const endLineNumber = newRegions.getEndLineNumber(index);
                const isCollapsed = newRegions.isCollapsed(index);
                const isManual = newRegions.getSource(index) !== 0 /* FoldSource.provider */;
                const decorationRange = {
                    startLineNumber: startLineNumber,
                    startColumn: this._textModel.getLineMaxColumn(startLineNumber),
                    endLineNumber: endLineNumber,
                    endColumn: this._textModel.getLineMaxColumn(endLineNumber) + 1
                };
                newEditorDecorations.push({ range: decorationRange, options: this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual) });
                if (isCollapsed && endLineNumber > lastHiddenLine) {
                    lastHiddenLine = endLineNumber;
                }
            }
            this._decorationProvider.changeDecorations(accessor => this._editorDecorationIds = accessor.deltaDecorations(this._editorDecorationIds, newEditorDecorations));
            this._regions = newRegions;
            this._updateEventEmitter.fire({ model: this });
        }
        _currentFoldedOrManualRanges(blockedLineNumers = []) {
            const isBlocked = (startLineNumber, endLineNumber) => {
                for (const blockedLineNumber of blockedLineNumers) {
                    if (startLineNumber < blockedLineNumber && blockedLineNumber <= endLineNumber) { // first line is visible
                        return true;
                    }
                }
                return false;
            };
            const foldedRanges = [];
            for (let i = 0, limit = this._regions.length; i < limit; i++) {
                let isCollapsed = this.regions.isCollapsed(i);
                const source = this.regions.getSource(i);
                if (isCollapsed || source !== 0 /* FoldSource.provider */) {
                    const foldRange = this._regions.toFoldRange(i);
                    const decRange = this._textModel.getDecorationRange(this._editorDecorationIds[i]);
                    if (decRange) {
                        if (isCollapsed && isBlocked(decRange.startLineNumber, decRange.endLineNumber)) {
                            isCollapsed = false; // uncollapse is the range is blocked
                        }
                        foldedRanges.push({
                            startLineNumber: decRange.startLineNumber,
                            endLineNumber: decRange.endLineNumber,
                            type: foldRange.type,
                            isCollapsed,
                            source
                        });
                    }
                }
            }
            return foldedRanges;
        }
        /**
         * Collapse state memento, for persistence only
         */
        getMemento() {
            const foldedOrManualRanges = this._currentFoldedOrManualRanges();
            const result = [];
            const maxLineNumber = this._textModel.getLineCount();
            for (let i = 0, limit = foldedOrManualRanges.length; i < limit; i++) {
                const range = foldedOrManualRanges[i];
                if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
                    continue;
                }
                const checksum = this._getLinesChecksum(range.startLineNumber + 1, range.endLineNumber);
                result.push({
                    startLineNumber: range.startLineNumber,
                    endLineNumber: range.endLineNumber,
                    isCollapsed: range.isCollapsed,
                    source: range.source,
                    checksum: checksum
                });
            }
            return (result.length > 0) ? result : undefined;
        }
        /**
         * Apply persisted state, for persistence only
         */
        applyMemento(state) {
            if (!Array.isArray(state)) {
                return;
            }
            const rangesToRestore = [];
            const maxLineNumber = this._textModel.getLineCount();
            for (const range of state) {
                if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
                    continue;
                }
                const checksum = this._getLinesChecksum(range.startLineNumber + 1, range.endLineNumber);
                if (!range.checksum || checksum === range.checksum) {
                    rangesToRestore.push({
                        startLineNumber: range.startLineNumber,
                        endLineNumber: range.endLineNumber,
                        type: undefined,
                        isCollapsed: range.isCollapsed ?? true,
                        source: range.source ?? 0 /* FoldSource.provider */
                    });
                }
            }
            const newRanges = foldingRanges_1.FoldingRegions.sanitizeAndMerge(this._regions, rangesToRestore, maxLineNumber);
            this.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newRanges));
        }
        _getLinesChecksum(lineNumber1, lineNumber2) {
            const h = (0, hash_1.hash)(this._textModel.getLineContent(lineNumber1)
                + this._textModel.getLineContent(lineNumber2));
            return h % 1000000; // 6 digits is plenty
        }
        dispose() {
            this._decorationProvider.removeDecorations(this._editorDecorationIds);
        }
        getAllRegionsAtLine(lineNumber, filter) {
            const result = [];
            if (this._regions) {
                let index = this._regions.findRange(lineNumber);
                let level = 1;
                while (index >= 0) {
                    const current = this._regions.toRegion(index);
                    if (!filter || filter(current, level)) {
                        result.push(current);
                    }
                    level++;
                    index = current.parentIndex;
                }
            }
            return result;
        }
        getRegionAtLine(lineNumber) {
            if (this._regions) {
                const index = this._regions.findRange(lineNumber);
                if (index >= 0) {
                    return this._regions.toRegion(index);
                }
            }
            return null;
        }
        getRegionsInside(region, filter) {
            const result = [];
            const index = region ? region.regionIndex + 1 : 0;
            const endLineNumber = region ? region.endLineNumber : Number.MAX_VALUE;
            if (filter && filter.length === 2) {
                const levelStack = [];
                for (let i = index, len = this._regions.length; i < len; i++) {
                    const current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
                        while (levelStack.length > 0 && !current.containedBy(levelStack[levelStack.length - 1])) {
                            levelStack.pop();
                        }
                        levelStack.push(current);
                        if (filter(current, levelStack.length)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                for (let i = index, len = this._regions.length; i < len; i++) {
                    const current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
                        if (!filter || filter(current)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return result;
        }
    }
    exports.FoldingModel = FoldingModel;
    /**
     * Collapse or expand the regions at the given locations
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function toggleCollapseState(foldingModel, levels, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const region = foldingModel.getRegionAtLine(lineNumber);
            if (region) {
                const doCollapse = !region.isCollapsed;
                toToggle.push(region);
                if (levels > 1) {
                    const regionsInside = foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                    toToggle.push(...regionsInside);
                }
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.toggleCollapseState = toggleCollapseState;
    /**
     * Collapse or expand the regions at the given locations including all children.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function setCollapseStateLevelsDown(foldingModel, doCollapse, levels = Number.MAX_VALUE, lineNumbers) {
        const toToggle = [];
        if (lineNumbers && lineNumbers.length > 0) {
            for (const lineNumber of lineNumbers) {
                const region = foldingModel.getRegionAtLine(lineNumber);
                if (region) {
                    if (region.isCollapsed !== doCollapse) {
                        toToggle.push(region);
                    }
                    if (levels > 1) {
                        const regionsInside = foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                        toToggle.push(...regionsInside);
                    }
                }
            }
        }
        else {
            const regionsInside = foldingModel.getRegionsInside(null, (r, level) => r.isCollapsed !== doCollapse && level < levels);
            toToggle.push(...regionsInside);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateLevelsDown = setCollapseStateLevelsDown;
    /**
     * Collapse or expand the regions at the given locations including all parents.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function setCollapseStateLevelsUp(foldingModel, doCollapse, levels, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region, level) => region.isCollapsed !== doCollapse && level <= levels);
            toToggle.push(...regions);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateLevelsUp = setCollapseStateLevelsUp;
    /**
     * Collapse or expand a region at the given locations. If the inner most region is already collapsed/expanded, uses the first parent instead.
     * @param doCollapse Whether to collapse or expand
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function setCollapseStateUp(foldingModel, doCollapse, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region) => region.isCollapsed !== doCollapse);
            if (regions.length > 0) {
                toToggle.push(regions[0]);
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateUp = setCollapseStateUp;
    /**
     * Folds or unfolds all regions that have a given level, except if they contain one of the blocked lines.
     * @param foldLevel level. Level == 1 is the top level
     * @param doCollapse Whether to collapse or expand
    */
    function setCollapseStateAtLevel(foldingModel, foldLevel, doCollapse, blockedLineNumbers) {
        const filter = (region, level) => level === foldLevel && region.isCollapsed !== doCollapse && !blockedLineNumbers.some(line => region.containsLine(line));
        const toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateAtLevel = setCollapseStateAtLevel;
    /**
     * Folds or unfolds all regions, except if they contain or are contained by a region of one of the blocked lines.
     * @param doCollapse Whether to collapse or expand
     * @param blockedLineNumbers the location of regions to not collapse or expand
     */
    function setCollapseStateForRest(foldingModel, doCollapse, blockedLineNumbers) {
        const filteredRegions = [];
        for (const lineNumber of blockedLineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, undefined);
            if (regions.length > 0) {
                filteredRegions.push(regions[0]);
            }
        }
        const filter = (region) => filteredRegions.every((filteredRegion) => !filteredRegion.containedBy(region) && !region.containedBy(filteredRegion)) && region.isCollapsed !== doCollapse;
        const toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForRest = setCollapseStateForRest;
    /**
     * Folds all regions for which the lines start with a given regex
     * @param foldingModel the folding model
     */
    function setCollapseStateForMatchingLines(foldingModel, regExp, doCollapse) {
        const editorModel = foldingModel.textModel;
        const regions = foldingModel.regions;
        const toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i)) {
                const startLineNumber = regions.getStartLineNumber(i);
                if (regExp.test(editorModel.getLineContent(startLineNumber))) {
                    toToggle.push(regions.toRegion(i));
                }
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForMatchingLines = setCollapseStateForMatchingLines;
    /**
     * Folds all regions of the given type
     * @param foldingModel the folding model
     */
    function setCollapseStateForType(foldingModel, type, doCollapse) {
        const regions = foldingModel.regions;
        const toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i) && type === regions.getType(i)) {
                toToggle.push(regions.toRegion(i));
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForType = setCollapseStateForType;
    /**
     * Get line to go to for parent fold of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Parent fold start line
     */
    function getParentFoldLine(lineNumber, foldingModel) {
        let startLineNumber = null;
        const foldingRegion = foldingModel.getRegionAtLine(lineNumber);
        if (foldingRegion !== null) {
            startLineNumber = foldingRegion.startLineNumber;
            // If current line is not the start of the current fold, go to top line of current fold. If not, go to parent fold
            if (lineNumber === startLineNumber) {
                const parentFoldingIdx = foldingRegion.parentIndex;
                if (parentFoldingIdx !== -1) {
                    startLineNumber = foldingModel.regions.getStartLineNumber(parentFoldingIdx);
                }
                else {
                    startLineNumber = null;
                }
            }
        }
        return startLineNumber;
    }
    exports.getParentFoldLine = getParentFoldLine;
    /**
     * Get line to go to for previous fold at the same level of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Previous fold start line
     */
    function getPreviousFoldLine(lineNumber, foldingModel) {
        let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
        // If on the folding range start line, go to previous sibling.
        if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
            // If current line is not the start of the current fold, go to top line of current fold. If not, go to previous fold.
            if (lineNumber !== foldingRegion.startLineNumber) {
                return foldingRegion.startLineNumber;
            }
            else {
                // Find min line number to stay within parent.
                const expectedParentIndex = foldingRegion.parentIndex;
                let minLineNumber = 0;
                if (expectedParentIndex !== -1) {
                    minLineNumber = foldingModel.regions.getStartLineNumber(foldingRegion.parentIndex);
                }
                // Find fold at same level.
                while (foldingRegion !== null) {
                    if (foldingRegion.regionIndex > 0) {
                        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex - 1);
                        // Keep at same level.
                        if (foldingRegion.startLineNumber <= minLineNumber) {
                            return null;
                        }
                        else if (foldingRegion.parentIndex === expectedParentIndex) {
                            return foldingRegion.startLineNumber;
                        }
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        else {
            // Go to last fold that's before the current line.
            if (foldingModel.regions.length > 0) {
                foldingRegion = foldingModel.regions.toRegion(foldingModel.regions.length - 1);
                while (foldingRegion !== null) {
                    // Found fold before current line.
                    if (foldingRegion.startLineNumber < lineNumber) {
                        return foldingRegion.startLineNumber;
                    }
                    if (foldingRegion.regionIndex > 0) {
                        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex - 1);
                    }
                    else {
                        foldingRegion = null;
                    }
                }
            }
        }
        return null;
    }
    exports.getPreviousFoldLine = getPreviousFoldLine;
    /**
     * Get line to go to next fold at the same level of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Next fold start line
     */
    function getNextFoldLine(lineNumber, foldingModel) {
        let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
        // If on the folding range start line, go to next sibling.
        if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
            // Find max line number to stay within parent.
            const expectedParentIndex = foldingRegion.parentIndex;
            let maxLineNumber = 0;
            if (expectedParentIndex !== -1) {
                maxLineNumber = foldingModel.regions.getEndLineNumber(foldingRegion.parentIndex);
            }
            else if (foldingModel.regions.length === 0) {
                return null;
            }
            else {
                maxLineNumber = foldingModel.regions.getEndLineNumber(foldingModel.regions.length - 1);
            }
            // Find fold at same level.
            while (foldingRegion !== null) {
                if (foldingRegion.regionIndex < foldingModel.regions.length) {
                    foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex + 1);
                    // Keep at same level.
                    if (foldingRegion.startLineNumber >= maxLineNumber) {
                        return null;
                    }
                    else if (foldingRegion.parentIndex === expectedParentIndex) {
                        return foldingRegion.startLineNumber;
                    }
                }
                else {
                    return null;
                }
            }
        }
        else {
            // Go to first fold that's after the current line.
            if (foldingModel.regions.length > 0) {
                foldingRegion = foldingModel.regions.toRegion(0);
                while (foldingRegion !== null) {
                    // Found fold after current line.
                    if (foldingRegion.startLineNumber > lineNumber) {
                        return foldingRegion.startLineNumber;
                    }
                    if (foldingRegion.regionIndex < foldingModel.regions.length) {
                        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex + 1);
                    }
                    else {
                        foldingRegion = null;
                    }
                }
            }
        }
        return null;
    }
    exports.getNextFoldLine = getNextFoldLine;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9mb2xkaW5nL2Jyb3dzZXIvZm9sZGluZ01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTBCaEcsTUFBYSxZQUFZO1FBVXhCLElBQVcsT0FBTyxLQUFxQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlELElBQVcsU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBVyxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFFcEUsWUFBWSxTQUFxQixFQUFFLGtCQUF1QztZQVB6RCx3QkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBMkIsQ0FBQztZQUM5RCxnQkFBVyxHQUFtQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBTzVGLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksOEJBQWMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUVNLG1CQUFtQixDQUFDLGNBQStCO1lBQ3pELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVCLE9BQU87WUFDUixDQUFDO1lBQ0QsY0FBYyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFF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