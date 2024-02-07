/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEditorFeatures = exports.registerEditorFeature = void 0;
    const editorFeatures = [];
    /**
     * Registers an editor feature. Editor features will be instantiated only once, as soon as
     * the first code editor is instantiated.
     */
    function registerEditorFeature(ctor) {
        editorFeatures.push(ctor);
    }
    exports.registerEditorFeature = registerEditorFeature;
    function getEditorFeatures() {
        return editorFeatures.slice(0);
    }
    exports.getEditorFeatures = getEditorFeatures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vZWRpdG9yRmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sY0FBYyxHQUF3QixFQUFFLENBQUM7SUFFL0M7OztPQUdHO0lBQ0gsU0FBZ0IscUJBQXFCLENBQW9DLElBQW9EO1FBQzVILGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBeUIsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFGRCxzREFFQztJQUVELFNBQWdCLGlCQUFpQjtRQUNoQyxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZELDhDQUVDIn0=