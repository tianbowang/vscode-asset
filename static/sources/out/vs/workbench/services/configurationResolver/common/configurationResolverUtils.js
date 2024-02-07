define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyDeprecatedVariableMessage = void 0;
    function applyDeprecatedVariableMessage(schema) {
        schema.pattern = schema.pattern || '^(?!.*\\$\\{(env|config|command)\\.)';
        schema.patternErrorMessage = schema.patternErrorMessage ||
            nls.localize('deprecatedVariables', "'env.', 'config.' and 'command.' are deprecated, use 'env:', 'config:' and 'command:' instead.");
    }
    exports.applyDeprecatedVariableMessage = applyDeprecatedVariableMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlc29sdmVyVXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uUmVzb2x2ZXIvY29tbW9uL2NvbmZpZ3VyYXRpb25SZXNvbHZlclV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFPQSxTQUFnQiw4QkFBOEIsQ0FBQyxNQUFtQjtRQUNqRSxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksc0NBQXNDLENBQUM7UUFDMUUsTUFBTSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxtQkFBbUI7WUFDdEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxnR0FBZ0csQ0FBQyxDQUFDO0lBQ3hJLENBQUM7SUFKRCx3RUFJQyJ9