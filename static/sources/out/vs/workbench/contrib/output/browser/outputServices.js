/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/workbench/services/output/common/output", "vs/workbench/contrib/output/browser/outputLinkProvider", "vs/editor/common/services/resolverService", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/output/common/outputChannelModelService", "vs/editor/common/languages/language", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, uri_1, lifecycle_1, instantiation_1, storage_1, platform_1, output_1, outputLinkProvider_1, resolverService_1, log_1, lifecycle_2, viewsService_1, outputChannelModelService_1, language_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputService = void 0;
    const OUTPUT_ACTIVE_CHANNEL_KEY = 'output.activechannel';
    let OutputChannel = class OutputChannel extends lifecycle_1.Disposable {
        constructor(outputChannelDescriptor, outputChannelModelService, languageService) {
            super();
            this.outputChannelDescriptor = outputChannelDescriptor;
            this.scrollLock = false;
            this.id = outputChannelDescriptor.id;
            this.label = outputChannelDescriptor.label;
            this.uri = uri_1.URI.from({ scheme: output_1.OUTPUT_SCHEME, path: this.id });
            this.model = this._register(outputChannelModelService.createOutputChannelModel(this.id, this.uri, outputChannelDescriptor.languageId ? languageService.createById(outputChannelDescriptor.languageId) : languageService.createByMimeType(outputChannelDescriptor.log ? output_1.LOG_MIME : output_1.OUTPUT_MIME), outputChannelDescriptor.file));
        }
        append(output) {
            this.model.append(output);
        }
        update(mode, till) {
            this.model.update(mode, till, true);
        }
        clear() {
            this.model.clear();
        }
        replace(value) {
            this.model.replace(value);
        }
    };
    OutputChannel = __decorate([
        __param(1, outputChannelModelService_1.IOutputChannelModelService),
        __param(2, language_1.ILanguageService)
    ], OutputChannel);
    let OutputService = class OutputService extends lifecycle_1.Disposable {
        constructor(storageService, instantiationService, textModelResolverService, logService, lifecycleService, viewsService, contextKeyService) {
            super();
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.lifecycleService = lifecycleService;
            this.viewsService = viewsService;
            this.channels = new Map();
            this._onActiveOutputChannel = this._register(new event_1.Emitter());
            this.onActiveOutputChannel = this._onActiveOutputChannel.event;
            this.activeChannelIdInStorage = this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */, '');
            this.activeOutputChannelContext = output_1.ACTIVE_OUTPUT_CHANNEL_CONTEXT.bindTo(contextKeyService);
            this.activeOutputChannelContext.set(this.activeChannelIdInStorage);
            this._register(this.onActiveOutputChannel(channel => this.activeOutputChannelContext.set(channel)));
            this.activeFileOutputChannelContext = output_1.CONTEXT_ACTIVE_FILE_OUTPUT.bindTo(contextKeyService);
            // Register as text model content provider for output
            textModelResolverService.registerTextModelContentProvider(output_1.OUTPUT_SCHEME, this);
            instantiationService.createInstance(outputLinkProvider_1.OutputLinkProvider);
            // Create output channels for already registered channels
            const registry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            for (const channelIdentifier of registry.getChannels()) {
                this.onDidRegisterChannel(channelIdentifier.id);
            }
            this._register(registry.onDidRegisterChannel(this.onDidRegisterChannel, this));
            // Set active channel to first channel if not set
            if (!this.activeChannel) {
                const channels = this.getChannelDescriptors();
                this.setActiveChannel(channels && channels.length > 0 ? this.getChannel(channels[0].id) : undefined);
            }
            this._register(event_1.Event.filter(this.viewsService.onDidChangeViewVisibility, e => e.id === output_1.OUTPUT_VIEW_ID && e.visible)(() => {
                if (this.activeChannel) {
                    this.viewsService.getActiveViewWithId(output_1.OUTPUT_VIEW_ID)?.showChannel(this.activeChannel, true);
                }
            }));
            this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
        }
        provideTextContent(resource) {
            const channel = this.getChannel(resource.path);
            if (channel) {
                return channel.model.loadModel();
            }
            return null;
        }
        async showChannel(id, preserveFocus) {
            const channel = this.getChannel(id);
            if (this.activeChannel?.id !== channel?.id) {
                this.setActiveChannel(channel);
                this._onActiveOutputChannel.fire(id);
            }
            const outputView = await this.viewsService.openView(output_1.OUTPUT_VIEW_ID, !preserveFocus);
            if (outputView && channel) {
                outputView.showChannel(channel, !!preserveFocus);
            }
        }
        getChannel(id) {
            return this.channels.get(id);
        }
        getChannelDescriptor(id) {
            return platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(id);
        }
        getChannelDescriptors() {
            return platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels();
        }
        getActiveChannel() {
            return this.activeChannel;
        }
        async onDidRegisterChannel(channelId) {
            const channel = this.createChannel(channelId);
            this.channels.set(channelId, channel);
            if (!this.activeChannel || this.activeChannelIdInStorage === channelId) {
                this.setActiveChannel(channel);
                this._onActiveOutputChannel.fire(channelId);
                const outputView = this.viewsService.getActiveViewWithId(output_1.OUTPUT_VIEW_ID);
                outputView?.showChannel(channel, true);
            }
        }
        createChannel(id) {
            const channelDisposables = [];
            const channel = this.instantiateChannel(id);
            channel.model.onDispose(() => {
                if (this.activeChannel === channel) {
                    const channels = this.getChannelDescriptors();
                    const channel = channels.length ? this.getChannel(channels[0].id) : undefined;
                    if (channel && this.viewsService.isViewVisible(output_1.OUTPUT_VIEW_ID)) {
                        this.showChannel(channel.id);
                    }
                    else {
                        this.setActiveChannel(undefined);
                    }
                }
                platform_1.Registry.as(output_1.Extensions.OutputChannels).removeChannel(id);
                (0, lifecycle_1.dispose)(channelDisposables);
            }, channelDisposables);
            return channel;
        }
        instantiateChannel(id) {
            const channelData = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(id);
            if (!channelData) {
                this.logService.error(`Channel '${id}' is not registered yet`);
                throw new Error(`Channel '${id}' is not registered yet`);
            }
            return this.instantiationService.createInstance(OutputChannel, channelData);
        }
        setActiveChannel(channel) {
            this.activeChannel = channel;
            this.activeFileOutputChannelContext.set(!!channel?.outputChannelDescriptor?.file);
            if (this.activeChannel) {
                this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannel.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
    };
    exports.OutputService = OutputService;
    exports.OutputService = OutputService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, log_1.ILogService),
        __param(4, lifecycle_2.ILifecycleService),
        __param(5, viewsService_1.IViewsService),
        __param(6, contextkey_1.IContextKeyService)
    ], OutputService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0U2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL291dHB1dC9icm93c2VyL291dHB1dFNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCaEcsTUFBTSx5QkFBeUIsR0FBRyxzQkFBc0IsQ0FBQztJQUV6RCxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFRckMsWUFDVSx1QkFBaUQsRUFDOUIseUJBQXFELEVBQy9ELGVBQWlDO1lBRW5ELEtBQUssRUFBRSxDQUFDO1lBSkMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQVAzRCxlQUFVLEdBQVksS0FBSyxDQUFDO1lBWTNCLElBQUksQ0FBQyxFQUFFLEdBQUcsdUJBQXVCLENBQUMsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsdUJBQXVCLENBQUMsS0FBSyxDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxzQkFBYSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsaUJBQVEsQ0FBQyxDQUFDLENBQUMsb0JB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