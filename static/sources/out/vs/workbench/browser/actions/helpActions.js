/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/product/common/product", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/platform/product/common/productService", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, product_1, platform_1, telemetry_1, opener_1, uri_1, actions_1, keyCodes_1, productService_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeybindingsReferenceAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.keybindingsReference'; }
        static { this.AVAILABLE = !!(platform_1.isLinux ? product_1.default.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? product_1.default.keyboardShortcutsUrlMac : product_1.default.keyboardShortcutsUrlWin); }
        constructor() {
            super({
                id: KeybindingsReferenceAction.ID,
                title: {
                    value: (0, nls_1.localize)('keybindingsReference', "Keyboard Shortcuts Reference"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miKeyboardShortcuts', comment: ['&& denotes a mnemonic'] }, "&&Keyboard Shortcuts Reference"),
                    original: 'Keyboard Shortcuts Reference'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */)
                },
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '2_reference',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isLinux ? productService.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    class OpenIntroductoryVideosUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openVideoTutorialsUrl'; }
        static { this.AVAILABLE = !!product_1.default.introductoryVideosUrl; }
        constructor() {
            super({
                id: OpenIntroductoryVideosUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openVideoTutorialsUrl', "Video Tutorials"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miVideoTutorials', comment: ['&& denotes a mnemonic'] }, "&&Video Tutorials"),
                    original: 'Video Tutorials'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '2_reference',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.introductoryVideosUrl) {
                openerService.open(uri_1.URI.parse(productService.introductoryVideosUrl));
            }
        }
    }
    class OpenTipsAndTricksUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openTipsAndTricksUrl'; }
        static { this.AVAILABLE = !!product_1.default.tipsAndTricksUrl; }
        constructor() {
            super({
                id: OpenTipsAndTricksUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openTipsAndTricksUrl', "Tips and Tricks"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miTipsAndTricks', comment: ['&& denotes a mnemonic'] }, "Tips and Tri&&cks"),
                    original: 'Tips and Tricks'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '2_reference',
                    order: 3
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.tipsAndTricksUrl) {
                openerService.open(uri_1.URI.parse(productService.tipsAndTricksUrl));
            }
        }
    }
    class OpenDocumentationUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openDocumentationUrl'; }
        static { this.AVAILABLE = !!(platform_1.isWeb ? product_1.default.serverDocumentationUrl : product_1.default.documentationUrl); }
        constructor() {
            super({
                id: OpenDocumentationUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openDocumentationUrl', "Documentation"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Documentation"),
                    original: 'Documentation'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '1_welcome',
                    order: 3
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isWeb ? productService.serverDocumentationUrl : productService.documentationUrl;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    class OpenNewsletterSignupUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openNewsletterSignupUrl'; }
        static { this.AVAILABLE = !!product_1.default.newsletterSignupUrl; }
        constructor() {
            super({
                id: OpenNewsletterSignupUrlAction.ID,
                title: (0, nls_1.localize2)('newsletterSignup', 'Signup for the VS Code Newsletter'),
                category: actionCommonCategories_1.Categories.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            openerService.open(uri_1.URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(telemetryService.machineId)}`));
        }
    }
    class OpenYouTubeUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openYouTubeUrl'; }
        static { this.AVAILABLE = !!product_1.default.youTubeUrl; }
        constructor() {
            super({
                id: OpenYouTubeUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openYouTubeUrl', "Join Us on YouTube"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miYouTube', comment: ['&& denotes a mnemonic'] }, "&&Join Us on YouTube"),
                    original: 'Join Us on YouTube'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '3_feedback',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.youTubeUrl) {
                openerService.open(uri_1.URI.parse(productService.youTubeUrl));
            }
        }
    }
    class OpenRequestFeatureUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openRequestFeatureUrl'; }
        static { this.AVAILABLE = !!product_1.default.requestFeatureUrl; }
        constructor() {
            super({
                id: OpenRequestFeatureUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openUserVoiceUrl', "Search Feature Requests"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miUserVoice', comment: ['&& denotes a mnemonic'] }, "&&Search Feature Requests"),
                    original: 'Search Feature Requests'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '3_feedback',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.requestFeatureUrl) {
                openerService.open(uri_1.URI.parse(productService.requestFeatureUrl));
            }
        }
    }
    class OpenLicenseUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openLicenseUrl'; }
        static { this.AVAILABLE = !!(platform_1.isWeb ? product_1.default.serverLicense : product_1.default.licenseUrl); }
        constructor() {
            super({
                id: OpenLicenseUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openLicenseUrl', "View License"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miLicense', comment: ['&& denotes a mnemonic'] }, "View &&License"),
                    original: 'View License'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '4_legal',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isWeb ? productService.serverLicenseUrl : productService.licenseUrl;
            if (url) {
                if (platform_1.language) {
                    const queryArgChar = url.indexOf('?') > 0 ? '&' : '?';
                    openerService.open(uri_1.URI.parse(`${url}${queryArgChar}lang=${platform_1.language}`));
                }
                else {
                    openerService.open(uri_1.URI.parse(url));
                }
            }
        }
    }
    class OpenPrivacyStatementUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openPrivacyStatementUrl'; }
        static { this.AVAILABE = !!product_1.default.privacyStatementUrl; }
        constructor() {
            super({
                id: OpenPrivacyStatementUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openPrivacyStatement', "Privacy Statement"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miPrivacyStatement', comment: ['&& denotes a mnemonic'] }, "Privac&&y Statement"),
                    original: 'Privacy Statement'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '4_legal',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.privacyStatementUrl) {
                openerService.open(uri_1.URI.parse(productService.privacyStatementUrl));
            }
        }
    }
    // --- Actions Registration
    if (KeybindingsReferenceAction.AVAILABLE) {
        (0, actions_1.registerAction2)(KeybindingsReferenceAction);
    }
    if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenIntroductoryVideosUrlAction);
    }
    if (OpenTipsAndTricksUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenTipsAndTricksUrlAction);
    }
    if (OpenDocumentationUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenDocumentationUrlAction);
    }
    if (OpenNewsletterSignupUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenNewsletterSignupUrlAction);
    }
    if (OpenYouTubeUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenYouTubeUrlAction);
    }
    if (OpenRequestFeatureUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenRequestFeatureUrlAction);
    }
    if (OpenLicenseUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenLicenseUrlAction);
    }
    if (OpenPrivacyStatementUrlAction.AVAILABE) {
        (0, actions_1.registerAction2)(OpenPrivacyStatementUrlAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMvaGVscEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsTUFBTSwwQkFBMkIsU0FBUSxpQkFBTztpQkFFL0IsT0FBRSxHQUFHLHVDQUF1QyxDQUFDO2lCQUM3QyxjQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQU8sQ0FBQyxDQUFDLENBQUMsaUJBQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsaUJBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsaUJBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBRTlKO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxFQUFFO2dCQUNqQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLDhCQUE4QixDQUFDO29CQUN2RSxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUscUJBQXFCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGdDQUFnQyxDQUFDO29CQUM3SCxRQUFRLEVBQUUsOEJBQThCO2lCQUN4QztnQkFDRCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2dCQUN6QixFQUFFLEVBQUUsSUFBSTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsTUFBTSw2Q0FBbUM7b0JBQ3pDLElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxJQUFBLG1CQUFRLEVBQUMsaURBQTZCLEVBQUUsaURBQTZCLENBQUM7aUJBQy9FO2dCQUNELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxl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