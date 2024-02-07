/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionItem = exports.CodeActionCommandArgs = exports.filtersAction = exports.mayIncludeActionsOfKind = exports.CodeActionTriggerSource = exports.CodeActionAutoApply = exports.CodeActionKind = void 0;
    class CodeActionKind {
        static { this.sep = '.'; }
        static { this.None = new CodeActionKind('@@none@@'); } // Special code action that contains nothing
        static { this.Empty = new CodeActionKind(''); }
        static { this.QuickFix = new CodeActionKind('quickfix'); }
        static { this.Refactor = new CodeActionKind('refactor'); }
        static { this.RefactorExtract = CodeActionKind.Refactor.append('extract'); }
        static { this.RefactorInline = CodeActionKind.Refactor.append('inline'); }
        static { this.RefactorMove = CodeActionKind.Refactor.append('move'); }
        static { this.RefactorRewrite = CodeActionKind.Refactor.append('rewrite'); }
        static { this.Notebook = new CodeActionKind('notebook'); }
        static { this.Source = new CodeActionKind('source'); }
        static { this.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports'); }
        static { this.SourceFixAll = CodeActionKind.Source.append('fixAll'); }
        static { this.SurroundWith = CodeActionKind.Refactor.append('surround'); }
        constructor(value) {
            this.value = value;
        }
        equals(other) {
            return this.value === other.value;
        }
        contains(other) {
            return this.equals(other) || this.value === '' || other.value.startsWith(this.value + CodeActionKind.sep);
        }
        intersects(other) {
            return this.contains(other) || other.contains(this);
        }
        append(part) {
            return new CodeActionKind(this.value + CodeActionKind.sep + part);
        }
    }
    exports.CodeActionKind = CodeActionKind;
    var CodeActionAutoApply;
    (function (CodeActionAutoApply) {
        CodeActionAutoApply["IfSingle"] = "ifSingle";
        CodeActionAutoApply["First"] = "first";
        CodeActionAutoApply["Never"] = "never";
    })(CodeActionAutoApply || (exports.CodeActionAutoApply = CodeActionAutoApply = {}));
    var CodeActionTriggerSource;
    (function (CodeActionTriggerSource) {
        CodeActionTriggerSource["Refactor"] = "refactor";
        CodeActionTriggerSource["RefactorPreview"] = "refactor preview";
        CodeActionTriggerSource["Lightbulb"] = "lightbulb";
        CodeActionTriggerSource["Default"] = "other (default)";
        CodeActionTriggerSource["SourceAction"] = "source action";
        CodeActionTriggerSource["QuickFix"] = "quick fix action";
        CodeActionTriggerSource["FixAll"] = "fix all";
        CodeActionTriggerSource["OrganizeImports"] = "organize imports";
        CodeActionTriggerSource["AutoFix"] = "auto fix";
        CodeActionTriggerSource["QuickFixHover"] = "quick fix hover window";
        CodeActionTriggerSource["OnSave"] = "save participants";
        CodeActionTriggerSource["ProblemsView"] = "problems view";
    })(CodeActionTriggerSource || (exports.CodeActionTriggerSource = CodeActionTriggerSource = {}));
    function mayIncludeActionsOfKind(filter, providedKind) {
        // A provided kind may be a subset or superset of our filtered kind.
        if (filter.include && !filter.include.intersects(providedKind)) {
            return false;
        }
        if (filter.excludes) {
            if (filter.excludes.some(exclude => excludesAction(providedKind, exclude, filter.include))) {
                return false;
            }
        }
        // Don't return source actions unless they are explicitly requested
        if (!filter.includeSourceActions && CodeActionKind.Source.contains(providedKind)) {
            return false;
        }
        return true;
    }
    exports.mayIncludeActionsOfKind = mayIncludeActionsOfKind;
    function filtersAction(filter, action) {
        const actionKind = action.kind ? new CodeActionKind(action.kind) : undefined;
        // Filter out actions by kind
        if (filter.include) {
            if (!actionKind || !filter.include.contains(actionKind)) {
                return false;
            }
        }
        if (filter.excludes) {
            if (actionKind && filter.excludes.some(exclude => excludesAction(actionKind, exclude, filter.include))) {
                return false;
            }
        }
        // Don't return source actions unless they are explicitly requested
        if (!filter.includeSourceActions) {
            if (actionKind && CodeActionKind.Source.contains(actionKind)) {
                return false;
            }
        }
        if (filter.onlyIncludePreferredActions) {
            if (!action.isPreferred) {
                return false;
            }
        }
        return true;
    }
    exports.filtersAction = filtersAction;
    function excludesAction(providedKind, exclude, include) {
        if (!exclude.contains(providedKind)) {
            return false;
        }
        if (include && exclude.contains(include)) {
            // The include is more specific, don't filter out
            return false;
        }
        return true;
    }
    class CodeActionCommandArgs {
        static fromUser(arg, defaults) {
            if (!arg || typeof arg !== 'object') {
                return new CodeActionCommandArgs(defaults.kind, defaults.apply, false);
            }
            return new CodeActionCommandArgs(CodeActionCommandArgs.getKindFromUser(arg, defaults.kind), CodeActionCommandArgs.getApplyFromUser(arg, defaults.apply), CodeActionCommandArgs.getPreferredUser(arg));
        }
        static getApplyFromUser(arg, defaultAutoApply) {
            switch (typeof arg.apply === 'string' ? arg.apply.toLowerCase() : '') {
                case 'first': return "first" /* CodeActionAutoApply.First */;
                case 'never': return "never" /* CodeActionAutoApply.Never */;
                case 'ifsingle': return "ifSingle" /* CodeActionAutoApply.IfSingle */;
                default: return defaultAutoApply;
            }
        }
        static getKindFromUser(arg, defaultKind) {
            return typeof arg.kind === 'string'
                ? new CodeActionKind(arg.kind)
                : defaultKind;
        }
        static getPreferredUser(arg) {
            return typeof arg.preferred === 'boolean'
                ? arg.preferred
                : false;
        }
        constructor(kind, apply, preferred) {
            this.kind = kind;
            this.apply = apply;
            this.preferred = preferred;
        }
    }
    exports.CodeActionCommandArgs = CodeActionCommandArgs;
    class CodeActionItem {
        constructor(action, provider, highlightRange) {
            this.action = action;
            this.provider = provider;
            this.highlightRange = highlightRange;
        }
        async resolve(token) {
            if (this.provider?.resolveCodeAction && !this.action.edit) {
                let action;
                try {
                    action = await this.provider.resolveCodeAction(this.action, token);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }
                if (action) {
                    this.action.edit = action.edit;
                }
            }
            return this;
        }
    }
    exports.CodeActionItem = CodeActionItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVBY3Rpb24vY29tbW9uL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLGNBQWM7aUJBQ0YsUUFBRyxHQUFHLEdBQUcsQ0FBQztpQkFFWCxTQUFJLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBQyw0Q0FBNEM7aUJBQ25GLFVBQUssR0FBRyxJQUFJLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDL0IsYUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUMxQyxhQUFRLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzFDLG9CQUFlLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzVELG1CQUFjLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzFELGlCQUFZLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3RELG9CQUFlLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzVELGFBQVEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDMUMsV0FBTSxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN0QywwQkFBcUIsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUN4RSxpQkFBWSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxD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