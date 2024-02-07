/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/uriIpc", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, event_1, lifecycle_1, objects_1, uri_1, uriIpc_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionTipsChannel = exports.ExtensionManagementChannelClient = exports.ExtensionManagementChannel = void 0;
    function transformIncomingURI(uri, transformer) {
        return uri ? uri_1.URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : undefined;
    }
    function transformOutgoingURI(uri, transformer) {
        return transformer ? transformer.transformOutgoingURI(uri) : uri;
    }
    function transformIncomingExtension(extension, transformer) {
        transformer = transformer ? transformer : uriIpc_1.DefaultURITransformer;
        const manifest = extension.manifest;
        const transformed = (0, uriIpc_1.transformAndReviveIncomingURIs)({ ...extension, ...{ manifest: undefined } }, transformer);
        return { ...transformed, ...{ manifest } };
    }
    function transformIncomingOptions(options, transformer) {
        return options?.profileLocation ? (0, uriIpc_1.transformAndReviveIncomingURIs)(options, transformer ?? uriIpc_1.DefaultURITransformer) : options;
    }
    function transformOutgoingExtension(extension, transformer) {
        return transformer ? (0, objects_1.cloneAndChange)(extension, value => value instanceof uri_1.URI ? transformer.transformOutgoingURI(value) : undefined) : extension;
    }
    class ExtensionManagementChannel {
        constructor(service, getUriTransformer) {
            this.service = service;
            this.getUriTransformer = getUriTransformer;
            this.onInstallExtension = event_1.Event.buffer(service.onInstallExtension, true);
            this.onDidInstallExtensions = event_1.Event.buffer(service.onDidInstallExtensions, true);
            this.onUninstallExtension = event_1.Event.buffer(service.onUninstallExtension, true);
            this.onDidUninstallExtension = event_1.Event.buffer(service.onDidUninstallExtension, true);
            this.onDidUpdateExtensionMetadata = event_1.Event.buffer(service.onDidUpdateExtensionMetadata, true);
        }
        listen(context, event) {
            const uriTransformer = this.getUriTransformer(context);
            switch (event) {
                case 'onInstallExtension': {
                    return event_1.Event.map(this.onInstallExtension, e => {
                        return {
                            ...e,
                            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
                        };
                    });
                }
                case 'onDidInstallExtensions': {
                    return event_1.Event.map(this.onDidInstallExtensions, results => results.map(i => ({
                        ...i,
                        local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local,
                        profileLocation: i.profileLocation ? transformOutgoingURI(i.profileLocation, uriTransformer) : i.profileLocation
                    })));
                }
                case 'onUninstallExtension': {
                    return event_1.Event.map(this.onUninstallExtension, e => {
                        return {
                            ...e,
                            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
                        };
                    });
                }
                case 'onDidUninstallExtension': {
                    return event_1.Event.map(this.onDidUninstallExtension, e => {
                        return {
                            ...e,
                            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
                        };
                    });
                }
                case 'onDidUpdateExtensionMetadata': {
                    return event_1.Event.map(this.onDidUpdateExtensionMetadata, e => transformOutgoingExtension(e, uriTransformer));
                }
            }
            throw new Error('Invalid listen');
        }
        async call(context, command, args) {
            const uriTransformer = this.getUriTransformer(context);
            switch (command) {
                case 'zip': {
                    const extension = transformIncomingExtension(args[0], uriTransformer);
                    const uri = await this.service.zip(extension);
                    return transformOutgoingURI(uri, uriTransformer);
                }
                case 'unzip': {
                    return this.service.unzip(transformIncomingURI(args[0], uriTransformer));
                }
                case 'install': {
                    return this.service.install(transformIncomingURI(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
                }
                case 'installFromLocation': {
                    return this.service.installFromLocation(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                }
                case 'installExtensionsFromProfile': {
                    return this.service.installExtensionsFromProfile(args[0], transformIncomingURI(args[1], uriTransformer), transformIncomingURI(args[2], uriTransformer));
                }
                case 'getManifest': {
                    return this.service.getManifest(transformIncomingURI(args[0], uriTransformer));
                }
                case 'getTargetPlatform': {
                    return this.service.getTargetPlatform();
                }
                case 'canInstall': {
                    return this.service.canInstall(args[0]);
                }
                case 'installFromGallery': {
                    return this.service.installFromGallery(args[0], transformIncomingOptions(args[1], uriTransformer));
                }
                case 'installGalleryExtensions': {
                    const arg = args[0];
                    return this.service.installGalleryExtensions(arg.map(({ extension, options }) => ({ extension, options: transformIncomingOptions(options, uriTransformer) ?? {} })));
                }
                case 'uninstall': {
                    return this.service.uninstall(transformIncomingExtension(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
                }
                case 'reinstallFromGallery': {
                    return this.service.reinstallFromGallery(transformIncomingExtension(args[0], uriTransformer));
                }
                case 'getInstalled': {
                    const extensions = await this.service.getInstalled(args[0], transformIncomingURI(args[1], uriTransformer));
                    return extensions.map(e => transformOutgoingExtension(e, uriTransformer));
                }
                case 'toggleAppliationScope': {
                    const extension = await this.service.toggleAppliationScope(transformIncomingExtension(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                    return transformOutgoingExtension(extension, uriTransformer);
                }
                case 'copyExtensions': {
                    return this.service.copyExtensions(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                }
                case 'updateMetadata': {
                    const e = await this.service.updateMetadata(transformIncomingExtension(args[0], uriTransformer), args[1], transformIncomingURI(args[2], uriTransformer));
                    return transformOutgoingExtension(e, uriTransformer);
                }
                case 'getExtensionsControlManifest': {
                    return this.service.getExtensionsControlManifest();
                }
                case 'download': {
                    return this.service.download(args[0], args[1], args[2]);
                }
                case 'cleanUp': {
                    return this.service.cleanUp();
                }
            }
            throw new Error('Invalid call');
        }
    }
    exports.ExtensionManagementChannel = ExtensionManagementChannel;
    class ExtensionManagementChannelClient extends lifecycle_1.Disposable {
        get onInstallExtension() { return this._onInstallExtension.event; }
        get onDidInstallExtensions() { return this._onDidInstallExtensions.event; }
        get onUninstallExtension() { return this._onUninstallExtension.event; }
        get onDidUninstallExtension() { return this._onDidUninstallExtension.event; }
        get onDidUpdateExtensionMetadata() { return this._onDidUpdateExtensionMetadata.event; }
        constructor(channel) {
            super();
            this.channel = channel;
            this._onInstallExtension = this._register(new event_1.Emitter());
            this._onDidInstallExtensions = this._register(new event_1.Emitter());
            this._onUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUpdateExtensionMetadata = this._register(new event_1.Emitter());
            this._register(this.channel.listen('onInstallExtension')(e => this.fireEvent(this._onInstallExtension, { ...e, source: this.isUriComponents(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this._register(this.channel.listen('onDidInstallExtensions')(results => this.fireEvent(this._onDidInstallExtensions, results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) })))));
            this._register(this.channel.listen('onUninstallExtension')(e => this.fireEvent(this._onUninstallExtension, { ...e, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this._register(this.channel.listen('onDidUninstallExtension')(e => this.fireEvent(this._onDidUninstallExtension, { ...e, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this._register(this.channel.listen('onDidUpdateExtensionMetadata')(e => this._onDidUpdateExtensionMetadata.fire(transformIncomingExtension(e, null))));
        }
        fireEvent(event, data) {
            event.fire(data);
        }
        isUriComponents(thing) {
            if (!thing) {
                return false;
            }
            return typeof thing.path === 'string' &&
                typeof thing.scheme === 'string';
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = this.channel.call('getTargetPlatform');
            }
            return this._targetPlatformPromise;
        }
        async canInstall(extension) {
            const currentTargetPlatform = await this.getTargetPlatform();
            return extension.allTargetPlatforms.some(targetPlatform => (0, extensionManagement_1.isTargetPlatformCompatible)(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
        }
        zip(extension) {
            return Promise.resolve(this.channel.call('zip', [extension]).then(result => uri_1.URI.revive(result)));
        }
        unzip(zipLocation) {
            return Promise.resolve(this.channel.call('unzip', [zipLocation]));
        }
        install(vsix, options) {
            return Promise.resolve(this.channel.call('install', [vsix, options])).then(local => transformIncomingExtension(local, null));
        }
        installFromLocation(location, profileLocation) {
            return Promise.resolve(this.channel.call('installFromLocation', [location, profileLocation])).then(local => transformIncomingExtension(local, null));
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            const result = await this.channel.call('installExtensionsFromProfile', [extensions, fromProfileLocation, toProfileLocation]);
            return result.map(local => transformIncomingExtension(local, null));
        }
        getManifest(vsix) {
            return Promise.resolve(this.channel.call('getManifest', [vsix]));
        }
        installFromGallery(extension, installOptions) {
            return Promise.resolve(this.channel.call('installFromGallery', [extension, installOptions])).then(local => transformIncomingExtension(local, null));
        }
        async installGalleryExtensions(extensions) {
            const results = await this.channel.call('installGalleryExtensions', [extensions]);
            return results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) }));
        }
        uninstall(extension, options) {
            return Promise.resolve(this.channel.call('uninstall', [extension, options]));
        }
        reinstallFromGallery(extension) {
            return Promise.resolve(this.channel.call('reinstallFromGallery', [extension])).then(local => transformIncomingExtension(local, null));
        }
        getInstalled(type = null, extensionsProfileResource) {
            return Promise.resolve(this.channel.call('getInstalled', [type, extensionsProfileResource]))
                .then(extensions => extensions.map(extension => transformIncomingExtension(extension, null)));
        }
        updateMetadata(local, metadata, extensionsProfileResource) {
            return Promise.resolve(this.channel.call('updateMetadata', [local, metadata, extensionsProfileResource]))
                .then(extension => transformIncomingExtension(extension, null));
        }
        toggleAppliationScope(local, fromProfileLocation) {
            return this.channel.call('toggleAppliationScope', [local, fromProfileLocation])
                .then(extension => transformIncomingExtension(extension, null));
        }
        copyExtensions(fromProfileLocation, toProfileLocation) {
            return this.channel.call('copyExtensions', [fromProfileLocation, toProfileLocation]);
        }
        getExtensionsControlManifest() {
            return Promise.resolve(this.channel.call('getExtensionsControlManifest'));
        }
        async download(extension, operation, donotVerifySignature) {
            const result = await this.channel.call('download', [extension, operation, donotVerifySignature]);
            return uri_1.URI.revive(result);
        }
        async cleanUp() {
            return this.channel.call('cleanUp');
        }
        registerParticipant() { throw new Error('Not Supported'); }
    }
    exports.ExtensionManagementChannelClient = ExtensionManagementChannelClient;
    class ExtensionTipsChannel {
        constructor(service) {
            this.service = service;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        call(context, command, args) {
            switch (command) {
                case 'getConfigBasedTips': return this.service.getConfigBasedTips(uri_1.URI.revive(args[0]));
                case 'getImportantExecutableBasedTips': return this.service.getImportantExecutableBasedTips();
                case 'getOtherExecutableBasedTips': return this.service.getOtherExecutableBasedTips();
            }
            throw new Error('Invalid call');
        }
    }
    exports.ExtensionTipsChannel = ExtensionTipsChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudElwYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTWFuYWdlbWVudElwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsU0FBUyxvQkFBb0IsQ0FBQyxHQUE4QixFQUFFLFdBQW1DO1FBQ2hHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzdGLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLEdBQVEsRUFBRSxXQUFtQztRQUMxRSxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDbEUsQ0FBQztJQUVELFNBQVMsMEJBQTBCLENBQUMsU0FBMEIsRUFBRSxXQUFtQztRQUNsRyxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLDhCQUFxQixDQUFDO1FBQ2hFLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBQSx1Q0FBOEIsRUFBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RyxPQUFPLEVBQUUsR0FBRyxXQUFXLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQVMsd0JBQXdCLENBQWdELE9BQXNCLEVBQUUsV0FBbUM7UUFDM0ksT0FBTyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFBLHVDQUE4QixFQUFDLE9BQU8sRUFBRSxXQUFXLElBQUksOEJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQzNILENBQUM7SUFFRCxTQUFTLDBCQUEwQixDQUFDLFNBQTBCLEVBQUUsV0FBbUM7UUFDbEcsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUEsd0JBQWMsRUFBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFlBQVksU0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDakosQ0FBQztJQUVELE1BQWEsMEJBQTBCO1FBUXRDLFlBQW9CLE9BQW9DLEVBQVUsaUJBQWtFO1lBQWhILFlBQU8sR0FBUCxPQUFPLENBQTZCO1lBQVUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFpRDtZQUNuSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLHNCQUFzQixHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLDRCQUE0QixHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBWSxFQUFFLEtBQWE7WUFDakMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELFFBQVEsS0FBSyxFQUFFLENBQUM7Z0JBQ2YsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBK0MsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxFQUFFO3dCQUMzRixPQUFPOzRCQUNOLEdBQUcsQ0FBQzs0QkFDSixlQUFlLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWU7eUJBQ2hILENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFDRCxLQUFLLHdCQUF3QixDQUFDLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxhQUFLLENBQUMsR0FBRyxDQUF1RSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FDN0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2pCLEdBQUcsQ0FBQzt3QkFDSixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7d0JBQzlFLGVBQWUsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTtxQkFDaEgsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUNELEtBQUssc0JBQXNCLENBQUMsQ0FBQyxDQUFDO29CQUM3QixPQUFPLGFBQUssQ0FBQyxHQUFHLENBQW1ELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDakcsT0FBTzs0QkFDTixHQUFHLENBQUM7NEJBQ0osZUFBZSxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlO3lCQUNoSCxDQUFDO29CQUNILENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUM7Z0JBQ0QsS0FBSyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBeUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxFQUFFO3dCQUMxRyxPQUFPOzRCQUNOLEdBQUcsQ0FBQzs0QkFDSixlQUFlLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWU7eUJBQ2hILENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFDRCxLQUFLLDhCQUE4QixDQUFDLENBQUMsQ0FBQztvQkFDckMsT0FBTyxhQUFLLENBQUMsR0FBRyxDQUFtQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDM0ksQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBWSxFQUFFLE9BQWUsRUFBRSxJQUFVO1lBQ25ELE1BQU0sY0FBYyxHQUEyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0UsUUFBUSxPQUFPLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNaLE1BQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDdEUsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBQ0QsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLENBQUM7Z0JBQ0QsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDL0gsQ0FBQztnQkFDRCxLQUFLLHFCQUFxQixDQUFDLENBQUMsQ0FBQztvQkFDNUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDdkksQ0FBQztnQkFDRCxLQUFLLDhCQUE4QixDQUFDLENBQUMsQ0FBQztvQkFDckMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pKLENBQUM7Z0JBQ0QsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUNoRixDQUFDO2dCQUNELEtBQUssbUJBQW1CLENBQUMsQ0FBQyxDQUFDO29CQUMxQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDekMsQ0FBQztnQkFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLENBQUM7Z0JBQ0QsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLENBQUM7Z0JBQ0QsS0FBSywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLE1BQU0sR0FBRyxHQUEyQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEssQ0FBQztnQkFDRCxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUN2SSxDQUFDO2dCQUNELEtBQUssc0JBQXNCLENBQUMsQ0FBQyxDQUFDO29CQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9GLENBQUM7Z0JBQ0QsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNyQixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztvQkFDM0csT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNFLENBQUM7Z0JBQ0QsS0FBSyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQy9KLE9BQU8sMEJBQTBCLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO2dCQUNELEtBQUssZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO29CQUN2QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDbEksQ0FBQztnQkFDRCxLQUFLLGdCQUFnQixDQUFDLENBQUMsQ0FBQztvQkFDdkIsTUFBTSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUN6SixPQUFPLDBCQUEwQixDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFDRCxLQUFLLDhCQUE4QixDQUFDLENBQUMsQ0FBQztvQkFDckMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLENBQUM7Z0JBQ3BELENBQUM7Z0JBQ0QsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ0QsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQy9CLENBQUM7WUFDRixDQUFDO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFqSUQsZ0VBaUlDO0lBSUQsTUFBYSxnQ0FBaUMsU0FBUSxzQkFBVTtRQUsvRCxJQUFJLGtCQUFrQixLQUFLLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHbkUsSUFBSSxzQkFBc0IsS0FBSyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRzNFLElBQUksb0JBQW9CLEtBQUssT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUd2RSxJQUFJLHVCQUF1QixLQUFLLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHN0UsSUFBSSw0QkFBNEIsS0FBSyxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXZGLFlBQTZCLE9BQWlCO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQVU7WUFmN0Isd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1lBRzNFLDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFDLENBQUMsQ0FBQztZQUczRiwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUEyQixDQUFDLENBQUM7WUFHL0UsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBOEIsQ0FBQyxDQUFDO1lBR3JGLGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW1CLENBQUMsQ0FBQztZQUsvRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUF3QixvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BRLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQW9DLHdCQUF3QixDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hYLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQTBCLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQTZCLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQWtCLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6SyxDQUFDO1FBUVMsU0FBUyxDQUFJLEtBQWlCLEVBQUUsSUFBTztZQUNoRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxlQUFlLENBQUMsS0FBYztZQUNyQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ1osT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsT0FBTyxPQUFhLEtBQU0sQ0FBQyxJQUFJLEtBQUssUUFBUTtnQkFDM0MsT0FBYSxLQUFNLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQztRQUMxQyxDQUFDO1FBR0QsaUJBQWlCO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFpQixtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RGLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUNwQyxDQUFDO1FBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUE0QjtZQUM1QyxNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDN0QsT0FBTyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsSUFBQSxnREFBMEIsRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGtCQUFrQixFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUM3SixDQUFDO1FBRUQsR0FBRyxDQUFDLFNBQTBCO1lBQzdCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBZ0IsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqSCxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQWdCO1lBQ3JCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBdUIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFRCxPQUFPLENBQUMsSUFBUyxFQUFFLE9BQTRCO1lBQzlDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBa0IsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvSSxDQUFDO1FBRUQsbUJBQW1CLENBQUMsUUFBYSxFQUFFLGVBQW9CO1lBQ3RELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBa0IscUJBQXFCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZLLENBQUM7UUFFRCxLQUFLLENBQUMsNEJBQTRCLENBQUMsVUFBa0MsRUFBRSxtQkFBd0IsRUFBRSxpQkFBc0I7WUFDdEgsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBb0IsOEJBQThCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ2hKLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxXQUFXLENBQUMsSUFBUztZQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQXFCLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsa0JBQWtCLENBQUMsU0FBNEIsRUFBRSxjQUErQjtZQUMvRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWtCLG9CQUFvQixFQUFFLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0SyxDQUFDO1FBRUQsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFVBQWtDO1lBQ2hFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQTJCLDBCQUEwQixFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDck8sQ0FBQztRQUVELFNBQVMsQ0FBQyxTQUEwQixFQUFFLE9BQTBCO1lBQy9ELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBTyxXQUFXLEVBQUUsQ0FBQyxTQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxTQUEwQjtZQUM5QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWtCLHNCQUFzQixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hKLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBNkIsSUFBSSxFQUFFLHlCQUErQjtZQUM5RSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQW9CLGNBQWMsRUFBRSxDQUFDLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7aUJBQzdHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCxjQUFjLENBQUMsS0FBc0IsRUFBRSxRQUEyQixFQUFFLHlCQUErQjtZQUNsRyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWtCLGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7aUJBQ3hILElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxLQUFzQixFQUFFLG1CQUF3QjtZQUNyRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFrQix1QkFBdUIsRUFBRSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2lCQUM5RixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsY0FBYyxDQUFDLG1CQUF3QixFQUFFLGlCQUFzQjtZQUM5RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFPLGdCQUFnQixFQUFFLENBQUMsbUJBQW1CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQzVGLENBQUM7UUFFRCw0QkFBNEI7WUFDM0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUE2Qiw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7UUFDdkcsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBNEIsRUFBRSxTQUEyQixFQUFFLG9CQUE2QjtZQUN0RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFnQixVQUFVLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNoSCxPQUFPLFNBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFPO1lBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsbUJBQW1CLEtBQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDM0Q7SUF0SUQsNEVBc0lDO0lBRUQsTUFBYSxvQkFBb0I7UUFFaEMsWUFBb0IsT0FBOEI7WUFBOUIsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7UUFDbEQsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFZLEVBQUUsS0FBYTtZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFZLEVBQUUsT0FBZSxFQUFFLElBQVU7WUFDN0MsUUFBUSxPQUFPLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZGLEtBQUssaUNBQWlDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsQ0FBQztnQkFDOUYsS0FBSyw2QkFBNkIsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ3ZGLENBQUM7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7S0FDRDtJQWxCRCxvREFrQkMifQ==