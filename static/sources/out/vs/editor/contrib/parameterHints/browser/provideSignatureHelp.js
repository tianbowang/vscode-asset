/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey"], function (require, exports, cancellation_1, errors_1, types_1, uri_1, position_1, languages, languageFeatures_1, resolverService_1, commands_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.provideSignatureHelp = exports.Context = void 0;
    exports.Context = {
        Visible: new contextkey_1.RawContextKey('parameterHintsVisible', false),
        MultipleSignatures: new contextkey_1.RawContextKey('parameterHintsMultipleSignatures', false),
    };
    async function provideSignatureHelp(registry, model, position, context, token) {
        const supports = registry.ordered(model);
        for (const support of supports) {
            try {
                const result = await support.provideSignatureHelp(model, position, token, context);
                if (result) {
                    return result;
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
        }
        return undefined;
    }
    exports.provideSignatureHelp = provideSignatureHelp;
    commands_1.CommandsRegistry.registerCommand('_executeSignatureHelpProvider', async (accessor, ...args) => {
        const [uri, position, triggerCharacter] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof triggerCharacter === 'string' || !triggerCharacter);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const result = await provideSignatureHelp(languageFeaturesService.signatureHelpProvider, ref.object.textEditorModel, position_1.Position.lift(position), {
                triggerKind: languages.SignatureHelpTriggerKind.Invoke,
                isRetrigger: false,
                triggerCharacter,
            }, cancellation_1.CancellationToken.None);
            if (!result) {
                return undefined;
            }
            setTimeout(() => result.dispose(), 0);
            return result.value;
        }
        finally {
            ref.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZVNpZ25hdHVyZUhlbHAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3BhcmFtZXRlckhpbnRzL2Jyb3dzZXIvcHJvdmlkZVNpZ25hdHVyZUhlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZW5GLFFBQUEsT0FBTyxHQUFHO1FBQ3RCLE9BQU8sRUFBRSxJQUFJLDBCQUFhLENBQVUsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO1FBQ25FLGtCQUFrQixFQUFFLElBQUksMEJBQWEsQ0FBVSxrQ0FBa0MsRUFBRSxLQUFLLENBQUM7S0FDekYsQ0FBQztJQUVLLEtBQUssVUFBVSxvQkFBb0IsQ0FDekMsUUFBa0UsRUFDbEUsS0FBaUIsRUFDakIsUUFBa0IsRUFDbEIsT0FBdUMsRUFDdkMsS0FBd0I7UUFHeEIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV6QyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQztnQkFDSixNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbkYsSUFBSSxNQUFNLEVBQUUsQ0FBQztvQkFDWixPQUFPLE1BQU0sQ0FBQztnQkFDZixDQUFDO1lBQ0YsQ0FBQztZQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2QsSUFBQSxrQ0FBeUIsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFyQkQsb0RBcUJDO0lBRUQsMkJBQWdCLENBQUMsZUFBZSxDQUFDLCtCQUErQixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUErQixFQUFFLEVBQUU7UUFDeEgsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDL0MsSUFBQSxrQkFBVSxFQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFBLGtCQUFVLEVBQUMsbUJBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFBLGtCQUFVLEVBQUMsT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXRFLE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQ0FBd0IsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBaUIsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQztZQUVKLE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQW9CLENBQUMsdUJBQXVCLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsbUJBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzdJLFdBQVcsRUFBRSxTQUFTLENBQUMsd0JBQXdCLENBQUMsTUFBTTtnQkFDdEQsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLGdCQUFnQjthQUNoQixFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBRUQsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFckIsQ0FBQztnQkFBUyxDQUFDO1lBQ1YsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsQ0FBQztJQUNGLENBQUMsQ0FBQyxDQUFDIn0=