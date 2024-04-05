/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */


/// <reference no-default-lib="true"/>

/////////////////////////////
/// Window APIs
/////////////////////////////

interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}

interface AesCbcParams extends Algorithm {
    iv: BufferSource;
}

interface AesCtrParams extends Algorithm {
    counter: BufferSource;
    length: number;
}

interface AesDerivedKeyParams extends Algorithm {
    length: number;
}

interface AesGcmParams extends Algorithm {
    additionalData?: BufferSource;
    iv: BufferSource;
    tagLength?: number;
}

interface AesKeyAlgorithm extends KeyAlgorithm {
    length: number;
}

interface AesKeyGenParams extends Algorithm {
    length: number;
}

interface Algorithm {
    name: string;
}

interface AnalyserOptions extends AudioNodeOptions {
    fftSize?: number;
    maxDecibels?: number;
    minDecibels?: number;
    smoothingTimeConstant?: number;
}

interface AnimationEventInit extends EventInit {
    animationName?: string;
    elapsedTime?: number;
    pseudoElement?: string;
}

interface AnimationPlaybackEventInit extends EventInit {
    currentTime?: CSSNumberish | null;
    timelineTime?: CSSNumberish | null;
}

interface AssignedNodesOptions {
    flatten?: boolean;
}

interface AudioBufferOptions {
    length: number;
    numberOfChannels?: number;
    sampleRate: number;
}

interface AudioBufferSourceOptions {
    buffer?: AudioBuffer | null;
    detune?: number;
    loop?: boolean;
    loopEnd?: number;
    loopStart?: number;
    playbackRate?: number;
}

interface AudioConfiguration {
    bitrate?: number;
    channels?: string;
    contentType: string;
    samplerate?: number;
    spatialRendering?: boolean;
}

interface AudioContextOptions {
    latencyHint?: AudioContextLatencyCategory | number;
    sampleRate?: number;
}

interface AudioNodeOptions {
    channelCount?: number;
    channelCountMode?: ChannelCountMode;
    channelInterpretation?: ChannelInterpretation;
}

interface AudioProcessingEventInit extends EventInit {
    inputBuffer: AudioBuffer;
    outputBuffer: AudioBuffer;
    playbackTime: number;
}

interface AudioTimestamp {
    contextTime?: number;
    performanceTime?: DOMHighResTimeStamp;
}

interface AudioWorkletNodeOptions extends AudioNodeOptions {
    numberOfInputs?: number;
    numberOfOutputs?: number;
    outputChannelCount?: number[];
    parameterData?: Record<string, number>;
    processorOptions?: any;
}

interface AuthenticationExtensionsClientInputs {
    appid?: string;
    credProps?: boolean;
    hmacCreateSecret?: boolean;
}

interface AuthenticationExtensionsClientOutputs {
    appid?: boolean;
    credProps?: CredentialPropertiesOutput;
    hmacCreateSecret?: boolean;
}

interface AuthenticatorSelectionCriteria {
    authenticatorAttachment?: AuthenticatorAttachment;
    requireResidentKey?: boolean;
    residentKey?: ResidentKeyRequirement;
    userVerification?: UserVerificationRequirement;
}

interface AvcEncoderConfig {
    format?: AvcBitstreamFormat;
}

interface BiquadFilterOptions extends AudioNodeOptions {
    Q?: number;
    detune?: number;
    frequency?: number;
    gain?: number;
    type?: BiquadFilterType;
}

interface BlobEventInit {
    data: Blob;
    timecode?: DOMHighResTimeStamp;
}

interface BlobPropertyBag {
    endings?: EndingType;
    type?: string;
}

interface CSSMatrixComponentOptions {
    is2D?: boolean;
}

interface CSSNumericType {
    angle?: number;
    flex?: number;
    frequency?: number;
    length?: number;
    percent?: number;
    percentHint?: CSSNumericBaseType;
    resolution?: number;
    time?: number;
}

interface CSSStyleSheetInit {
    baseURL?: string;
    disabled?: boolean;
    media?: MediaList | string;
}

interface CacheQueryOptions {
    ignoreMethod?: boolean;
    ignoreSearch?: boolean;
    ignoreVary?: boolean;
}

interface CanvasRenderingContext2DSettings {
    alpha?: boolean;
    colorSpace?: PredefinedColorSpace;
    desynchronized?: boolean;
    willReadFrequently?: boolean;
}

interface ChannelMergerOptions extends AudioNodeOptions {
    numberOfInputs?: number;
}

interface ChannelSplitterOptions extends AudioNodeOptions {
    numberOfOutputs?: number;
}

interface CheckVisibilityOptions {
    checkOpacity?: boolean;
    checkVisibilityCSS?: boolean;
}

interface ClientQueryOptions {
    includeUncontrolled?: boolean;
    type?: ClientTypes;
}

interface ClipboardEventInit extends EventInit {
    clipboardData?: DataTransfer | null;
}

interface ClipboardItemOptions {
    presentationStyle?: PresentationStyle;
}

interface CloseEventInit extends EventInit {
    code?: number;
    reason?: string;
    wasClean?: boolean;
}

interface CompositionEventInit extends UIEventInit {
    data?: string;
}

interface ComputedEffectTiming extends EffectTiming {
    activeDuration?: CSSNumberish;
    currentIteration?: number | null;
    endTime?: CSSNumberish;
    localTime?: CSSNumberish | null;
    progress?: number | null;
    startTime?: CSSNumberish;
}

interface ComputedKeyframe {
    composite: CompositeOperationOrAuto;
    computedOffset: number;
    easing: string;
    offset: number | null;
    [property: string]: string | number | null | undefined;
}

interface ConstantSourceOptions {
    offset?: number;
}

interface ConstrainBooleanParameters {
    exact?: boolean;
    ideal?: boolean;
}

interface ConstrainDOMStringParameters {
    exact?: string | string[];
    ideal?: string | string[];
}

interface ConstrainDoubleRange extends DoubleRange {
    exact?: number;
    ideal?: number;
}

interface ConstrainULongRange extends ULongRange {
    exact?: number;
    ideal?: number;
}

interface ConvolverOptions extends AudioNodeOptions {
    buffer?: AudioBuffer | null;
    disableNormalization?: boolean;
}

interface CredentialCreationOptions {
    publicKey?: PublicKeyCredentialCreationOptions;
    signal?: AbortSignal;
}

interface CredentialPropertiesOutput {
    rk?: boolean;
}

interface CredentialRequestOptions {
    mediation?: CredentialMediationRequirement;
    publicKey?: PublicKeyCredentialRequestOptions;
    signal?: AbortSignal;
}

interface CryptoKeyPair {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
}

interface CustomEventInit<T = any> extends EventInit {
    detail?: T;
}

interface DOMMatrix2DInit {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
    m11?: number;
    m12?: number;
    m21?: number;
    m22?: number;
    m41?: number;
    m42?: number;
}

interface DOMMatrixInit extends DOMMatrix2DInit {
    is2D?: boolean;
    m13?: number;
    m14?: number;
    m23?: number;
    m24?: number;
    m31?: number;
    m32?: number;
    m33?: number;
    m34?: number;
    m43?: number;
    m44?: number;
}

interface DOMPointInit {
    w?: number;
    x?: number;
    y?: number;
    z?: number;
}

interface DOMQuadInit {
    p1?: DOMPointInit;
    p2?: DOMPointInit;
    p3?: DOMPointInit;
    p4?: DOMPointInit;
}

interface DOMRectInit {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
}

interface DelayOptions extends AudioNodeOptions {
    delayTime?: number;
    maxDelayTime?: number;
}

interface DeviceMotionEventAccelerationInit {
    x?: number | null;
    y?: number | null;
    z?: number | null;
}

interface DeviceMotionEventInit extends EventInit {
    acceleration?: DeviceMotionEventAccelerationInit;
    accelerationIncludingGravity?: DeviceMotionEventAccelerationInit;
    interval?: number;
    rotationRate?: DeviceMotionEventRotationRateInit;
}

interface DeviceMotionEventRotationRateInit {
    alpha?: number | null;
    beta?: number | null;
    gamma?: number | null;
}

interface DeviceOrientationEventInit extends EventInit {
    absolute?: boolean;
    alpha?: number | null;
    beta?: number | null;
    gamma?: number | null;
}

interface DisplayMediaStreamOptions {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
}

interface DocumentTimelineOptions {
    originTime?: DOMHighResTimeStamp;
}

interface DoubleRange {
    max?: number;
    min?: number;
}

interface DragEventInit extends MouseEventInit {
    dataTransfer?: DataTransfer | null;
}

interface DynamicsCompressorOptions extends AudioNodeOptions {
    attack?: number;
    knee?: number;
    ratio?: number;
    release?: number;
    threshold?: number;
}

interface EcKeyAlgorithm extends KeyAlgorithm {
    namedCurve: NamedCurve;
}

interface EcKeyGenParams extends Algorithm {
    namedCurve: NamedCurve;
}

interface EcKeyImportParams extends Algorithm {
    namedCurve: NamedCurve;
}

interface EcdhKeyDeriveParams extends Algorithm {
    public: CryptoKey;
}

interface EcdsaParams extends Algorithm {
    hash: HashAlgorithmIdentifier;
}

interface EffectTiming {
    delay?: number;
    direction?: PlaybackDirection;
    duration?: number | CSSNumericValue | string;
    easing?: string;
    endDelay?: number;
    fill?: FillMode;
    iterationStart?: number;
    iterations?: number;
    playbackRate?: number;
}

interface ElementCreationOptions {
    is?: string;
}

interface ElementDefinitionOptions {
    extends?: string;
}

interface EncodedVideoChunkInit {
    data: BufferSource;
    duration?: number;
    timestamp: number;
    type: EncodedVideoChunkType;
}

interface EncodedVideoChunkMetadata {
    decoderConfig?: VideoDecoderConfig;
}

interface ErrorEventInit extends EventInit {
    colno?: number;
    error?: any;
    filename?: string;
    lineno?: number;
    message?: string;
}

interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}

interface EventListenerOptions {
    capture?: boolean;
}

interface EventModifierInit extends UIEventInit {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    modifierAltGraph?: boolean;
    modifierCapsLock?: boolean;
    modifierFn?: boolean;
    modifierFnLock?: boolean;
    modifierHyper?: boolean;
    modifierNumLock?: boolean;
    modifierScrollLock?: boolean;
    modifierSuper?: boolean;
    modifierSymbol?: boolean;
    modifierSymbolLock?: boolean;
    shiftKey?: boolean;
}

interface EventSourceInit {
    withCredentials?: boolean;
}

interface FilePropertyBag extends BlobPropertyBag {
    lastModified?: number;
}

interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
}

interface FileSystemFlags {
    create?: boolean;
    exclusive?: boolean;
}

interface FileSystemGetDirectoryOptions {
    create?: boolean;
}

interface FileSystemGetFileOptions {
    create?: boolean;
}

interface FileSystemRemoveOptions {
    recursive?: boolean;
}

interface FocusEventInit extends UIEventInit {
    relatedTarget?: EventTarget | null;
}

interface FocusOptions {
    preventScroll?: boolean;
}

interface FontFaceDescriptors {
    ascentOverride?: string;
    descentOverride?: string;
    display?: FontDisplay;
    featureSettings?: string;
    lineGapOverride?: string;
    stretch?: string;
    style?: string;
    unicodeRange?: string;
    variant?: string;
    weight?: string;
}

interface FontFaceSetLoadEventInit extends EventInit {
    fontfaces?: FontFace[];
}

interface FormDataEventInit extends EventInit {
    formData: FormData;
}

interface FullscreenOptions {
    navigationUI?: FullscreenNavigationUI;
}

interface GainOptions extends AudioNodeOptions {
    gain?: number;
}

interface GamepadEffectParameters {
    duration?: number;
    startDelay?: number;
    strongMagnitude?: number;
    weakMagnitude?: number;
}

interface GamepadEventInit extends EventInit {
    gamepad: Gamepad;
}

interface GetAnimationsOptions {
    subtree?: boolean;
}

interface GetNotificationOptions {
    tag?: string;
}

interface GetRootNodeOptions {
    composed?: boolean;
}

interface HashChangeEventInit extends EventInit {
    newURL?: string;
    oldURL?: string;
}

interface HkdfParams extends Algorithm {
    hash: HashAlgorithmIdentifier;
    info: BufferSource;
    salt: BufferSource;
}

interface HmacImportParams extends Algorithm {
    hash: HashAlgorithmIdentifier;
    length?: number;
}

interface HmacKeyAlgorithm extends KeyAlgorithm {
    hash: KeyAlgorithm;
    length: number;
}

interface HmacKeyGenParams extends Algorithm {
    hash: HashAlgorithmIdentifier;
    length?: number;
}

interface IDBDatabaseInfo {
    name?: string;
    version?: number;
}

interface IDBIndexParameters {
    multiEntry?: boolean;
    unique?: boolean;
}

interface IDBObjectStoreParameters {
    autoIncrement?: boolean;
    keyPath?: string | string[] | null;
}

interface IDBTransactionOptions {
    durability?: IDBTransactionDurability;
}

interface IDBVersionChangeEventInit extends EventInit {
    newVersion?: number | null;
    oldVersion?: number;
}

interface IIRFilterOptions extends AudioNodeOptions {
    feedback: number[];
    feedforward: number[];
}

interface IdleRequestOptions {
    timeout?: number;
}

interface ImageBitmapOptions {
    colorSpaceConversion?: ColorSpaceConversion;
    imageOrientation?: ImageOrientation;
    premultiplyAlpha?: PremultiplyAlpha;
    resizeHeight?: number;
    resizeQuality?: ResizeQuality;
    resizeWidth?: number;
}

interface ImageBitmapRenderingContextSettings {
    alpha?: boolean;
}

interface ImageDataSettings {
    colorSpace?: PredefinedColorSpace;
}

interface ImageEncodeOptions {
    quality?: number;
    type?: string;
}

interface ImportMeta {
    url: string;
}

interface InputEventInit extends UIEventInit {
    data?: string | null;
    dataTransfer?: DataTransfer | null;
    inputType?: string;
    isComposing?: boolean;
    targetRanges?: StaticRange[];
}

interface IntersectionObserverEntryInit {
    boundingClientRect: DOMRectInit;
    intersectionRatio: number;
    intersectionRect: DOMRectInit;
    isIntersecting: boolean;
    rootBounds: DOMRectInit | null;
    target: Element;
    time: DOMHighResTimeStamp;
}

interface IntersectionObserverInit {
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
}

interface JsonWebKey {
    alg?: string;
    crv?: string;
    d?: string;
    dp?: string;
    dq?: string;
    e?: string;
    ext?: boolean;
    k?: string;
    key_ops?: string[];
    kty?: string;
    n?: string;
    oth?: RsaOtherPrimesInfo[];
    p?: string;
    q?: string;
    qi?: string;
    use?: string;
    x?: string;
    y?: string;
}

interface KeyAlgorithm {
    name: string;
}

interface KeyboardEventInit extends EventModifierInit {
    /** @deprecated */
    charCode?: number;
    code?: string;
    isComposing?: boolean;
    key?: string;
    /** @deprecated */
    keyCode?: number;
    location?: number;
    repeat?: boolean;
}

interface Keyframe {
    composite?: CompositeOperationOrAuto;
    easing?: string;
    offset?: number | null;
    [property: string]: string | number | null | undefined;
}

interface KeyframeAnimationOptions extends KeyframeEffectOptions {
    id?: string;
    timeline?: AnimationTimeline | null;
}

interface KeyframeEffectOptions extends EffectTiming {
    composite?: CompositeOperation;
    iterationComposite?: IterationCompositeOperation;
    pseudoElement?: string | null;
}

interface LockInfo {
    clientId?: string;
    mode?: LockMode;
    name?: string;
}

interface LockManagerSnapshot {
    held?: LockInfo[];
    pending?: LockInfo[];
}

interface LockOptions {
    ifAvailable?: boolean;
    mode?: LockMode;
    signal?: AbortSignal;
    steal?: boolean;
}

interface MIDIConnectionEventInit extends EventInit {
    port?: MIDIPort;
}

interface MIDIMessageEventInit extends EventInit {
    data?: Uint8Array;
}

interface MIDIOptions {
    software?: boolean;
    sysex?: boolean;
}

interface MediaCapabilitiesDecodingInfo extends MediaCapabilitiesInfo {
    configuration?: MediaDecodingConfiguration;
}

interface MediaCapabilitiesEncodingInfo extends MediaCapabilitiesInfo {
    configuration?: MediaEncodingConfiguration;
}

interface MediaCapabilitiesInfo {
    powerEfficient: boolean;
    smooth: boolean;
    supported: boolean;
}

interface MediaConfiguration {
    audio?: AudioConfiguration;
    video?: VideoConfiguration;
}

interface MediaDecodingConfiguration extends MediaConfiguration {
    type: MediaDecodingType;
}

interface MediaElementAudioSourceOptions {
    mediaElement: HTMLMediaElement;
}

interface MediaEncodingConfiguration extends MediaConfiguration {
    type: MediaEncodingType;
}

interface MediaEncryptedEventInit extends EventInit {
    initData?: ArrayBuffer | null;
    initDataType?: string;
}

interface MediaImage {
    sizes?: string;
    src: string;
    type?: string;
}

interface MediaKeyMessageEventInit extends EventInit {
    message: ArrayBuffer;
    messageType: MediaKeyMessageType;
}

interface MediaKeySystemConfiguration {
    audioCapabilities?: MediaKeySystemMediaCapability[];
    distinctiveIdentifier?: MediaKeysRequirement;
    initDataTypes?: string[];
    label?: string;
    persistentState?: MediaKeysRequirement;
    sessionTypes?: string[];
    videoCapabilities?: MediaKeySystemMediaCapability[];
}

interface MediaKeySystemMediaCapability {
    contentType?: string;
    encryptionScheme?: string | null;
    robustness?: string;
}

interface MediaMetadataInit {
    album?: string;
    artist?: string;
    artwork?: MediaImage[];
    title?: string;
}

interface MediaPositionState {
    duration?: number;
    playbackRate?: number;
    position?: number;
}

interface MediaQueryListEventInit extends EventInit {
    matches?: boolean;
    media?: string;
}

interface MediaRecorderOptions {
    audioBitsPerSecond?: number;
    bitsPerSecond?: number;
    mimeType?: string;
    videoBitsPerSecond?: number;
}

interface MediaSessionActionDetails {
    action: MediaSessionAction;
    fastSeek?: boolean;
    seekOffset?: number;
    seekTime?: number;
}

interface MediaStreamAudioSourceOptions {
    mediaStream: MediaStream;
}

interface MediaStreamConstraints {
    audio?: boolean | MediaTrackConstraints;
    peerIdentity?: string;
    preferCurrentTab?: boolean;
    video?: boolean | MediaTrackConstraints;
}

interface MediaStreamTrackEventInit extends EventInit {
    track: MediaStreamTrack;
}

interface MediaTrackCapabilities {
    aspectRatio?: DoubleRange;
    autoGainControl?: boolean[];
    channelCount?: ULongRange;
    deviceId?: string;
    displaySurface?: string;
    echoCancellation?: boolean[];
    facingMode?: string[];
    frameRate?: DoubleRange;
    groupId?: string;
    height?: ULongRange;
    noiseSuppression?: boolean[];
    sampleRate?: ULongRange;
    sampleSize?: ULongRange;
    width?: ULongRange;
}

interface MediaTrackConstraintSet {
    aspectRatio?: ConstrainDouble;
    autoGainControl?: ConstrainBoolean;
    channelCount?: ConstrainULong;
    deviceId?: ConstrainDOMString;
    displaySurface?: ConstrainDOMString;
    echoCancellation?: ConstrainBoolean;
    facingMode?: ConstrainDOMString;
    frameRate?: ConstrainDouble;
    groupId?: ConstrainDOMString;
    height?: ConstrainULong;
    noiseSuppression?: ConstrainBoolean;
    sampleRate?: ConstrainULong;
    sampleSize?: ConstrainULong;
    width?: ConstrainULong;
}

interface MediaTrackConstraints extends MediaTrackConstraintSet {
    advanced?: MediaTrackConstraintSet[];
}

interface MediaTrackSettings {
    aspectRatio?: number;
    autoGainControl?: boolean;
    channelCount?: number;
    deviceId?: string;
    displaySurface?: string;
    echoCancellation?: boolean;
    facingMode?: string;
    frameRate?: number;
    groupId?: string;
    height?: number;
    noiseSuppression?: boolean;
    sampleRate?: number;
    sampleSize?: number;
    width?: number;
}

interface MediaTrackSupportedConstraints {
    aspectRatio?: boolean;
    autoGainControl?: boolean;
    channelCount?: boolean;
    deviceId?: boolean;
    displaySurface?: boolean;
    echoCancellation?: boolean;
    facingMode?: boolean;
    frameRate?: boolean;
    groupId?: boolean;
    height?: boolean;
    noiseSuppression?: boolean;
    sampleRate?: boolean;
    sampleSize?: boolean;
    width?: boolean;
}

interface MessageEventInit<T = any> extends EventInit {
    data?: T;
    lastEventId?: string;
    origin?: string;
    ports?: MessagePort[];
    source?: MessageEventSource | null;
}

interface MouseEventInit extends EventModifierInit {
    button?: number;
    buttons?: number;
    clientX?: number;
    clientY?: number;
    movementX?: number;
    movementY?: number;
    relatedTarget?: EventTarget | null;
    screenX?: number;
    screenY?: number;
}

interface MultiCacheQueryOptions extends CacheQueryOptions {
    cacheName?: string;
}

interface MutationObserverInit {
    /** Set to a list of attribute local names (without namespace) if not all attribute mutations need to be observed and attributes is true or omitted. */
    attributeFilter?: string[];
    /** Set to true if attributes is true or omitted and target's attribute value before the mutation needs to be recorded. */
    attributeOldValue?: boolean;
    /** Set to true if mutations to target's attributes are to be observed. Can be omitted if attributeOldValue or attributeFilter is specified. */
    attributes?: boolean;
    /** Set to true if mutations to target's data are to be observed. Can be omitted if characterDataOldValue is specified. */
    characterData?: boolean;
    /** Set to true if characterData is set to true or omitted and target's data before the mutation needs to be recorded. */
    characterDataOldValue?: boolean;
    /** Set to true if mutations to target's children are to be observed. */
    childList?: boolean;
    /** Set to true if mutations to not just target, but also target's descendants are to be observed. */
    subtree?: boolean;
}

interface NavigationPreloadState {
    enabled?: boolean;
    headerValue?: string;
}

interface NotificationAction {
    action: string;
    icon?: string;
    title: string;
}

interface NotificationOptions {
    actions?: NotificationAction[];
    badge?: string;
    body?: string;
    data?: any;
    dir?: NotificationDirection;
    icon?: string;
    image?: string;
    lang?: string;
    renotify?: boolean;
    requireInteraction?: boolean;
    silent?: boolean | null;
    tag?: string;
    timestamp?: EpochTimeStamp;
    vibrate?: VibratePattern;
}

interface OfflineAudioCompletionEventInit extends EventInit {
    renderedBuffer: AudioBuffer;
}

interface OfflineAudioContextOptions {
    length: number;
    numberOfChannels?: number;
    sampleRate: number;
}

interface OptionalEffectTiming {
    delay?: number;
    direction?: PlaybackDirection;
    duration?: number | string;
    easing?: string;
    endDelay?: number;
    fill?: FillMode;
    iterationStart?: number;
    iterations?: number;
    playbackRate?: number;
}

interface OscillatorOptions extends AudioNodeOptions {
    detune?: number;
    frequency?: number;
    periodicWave?: PeriodicWave;
    type?: OscillatorType;
}

interface PageTransitionEventInit extends EventInit {
    persisted?: boolean;
}

interface PannerOptions extends AudioNodeOptions {
    coneInnerAngle?: number;
    coneOuterAngle?: number;
    coneOuterGain?: number;
    distanceModel?: DistanceModelType;
    maxDistance?: number;
    orientationX?: number;
    orientationY?: number;
    orientationZ?: number;
    panningModel?: PanningModelType;
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    refDistance?: number;
    rolloffFactor?: number;
}

interface PaymentCurrencyAmount {
    currency: string;
    value: string;
}

interface PaymentDetailsBase {
    displayItems?: PaymentItem[];
    modifiers?: PaymentDetailsModifier[];
}

interface PaymentDetailsInit extends PaymentDetailsBase {
    id?: string;
    total: PaymentItem;
}

interface PaymentDetailsModifier {
    additionalDisplayItems?: PaymentItem[];
    data?: any;
    supportedMethods: string;
    total?: PaymentItem;
}

interface PaymentDetailsUpdate extends PaymentDetailsBase {
    paymentMethodErrors?: any;
    total?: PaymentItem;
}

interface PaymentItem {
    amount: PaymentCurrencyAmount;
    label: string;
    pending?: boolean;
}

interface PaymentMethodChangeEventInit extends PaymentRequestUpdateEventInit {
    methodDetails?: any;
    methodName?: string;
}

interface PaymentMethodData {
    data?: any;
    supportedMethods: string;
}

interface PaymentRequestUpdateEventInit extends EventInit {
}

interface PaymentValidationErrors {
    error?: string;
    paymentMethod?: any;
}

interface Pbkdf2Params extends Algorithm {
    hash: HashAlgorithmIdentifier;
    iterations: number;
    salt: BufferSource;
}

interface PerformanceMarkOptions {
    detail?: any;
    startTime?: DOMHighResTimeStamp;
}

interface PerformanceMeasureOptions {
    detail?: any;
    duration?: DOMHighResTimeStamp;
    end?: string | DOMHighResTimeStamp;
    start?: string | DOMHighResTimeStamp;
}

interface PerformanceObserverInit {
    buffered?: boolean;
    entryTypes?: string[];
    type?: string;
}

interface PeriodicWaveConstraints {
    disableNormalization?: boolean;
}

interface PeriodicWaveOptions extends PeriodicWaveConstraints {
    imag?: number[] | Float32Array;
    real?: number[] | Float32Array;
}

interface PermissionDescriptor {
    name: PermissionName;
}

interface PictureInPictureEventInit extends EventInit {
    pictureInPictureWindow: PictureInPictureWindow;
}

interface PlaneLayout {
    offset: number;
    stride: number;
}

interface PointerEventInit extends MouseEventInit {
    coalescedEvents?: PointerEvent[];
    height?: number;
    isPrimary?: boolean;
    pointerId?: number;
    pointerType?: string;
    predictedEvents?: PointerEvent[];
    pressure?: number;
    tangentialPressure?: number;
    tiltX?: number;
    tiltY?: number;
    twist?: number;
    width?: number;
}

interface PopStateEventInit extends EventInit {
    state?: any;
}

interface PositionOptions {
    enableHighAccuracy?: boolean;
    maximumAge?: number;
    timeout?: number;
}

interface ProgressEventInit extends EventInit {
    lengthComputable?: boolean;
    loaded?: number;
    total?: number;
}

interface PromiseRejectionEventInit extends EventInit {
    promise: Promise<any>;
    reason?: any;
}

interface PropertyDefinition {
    inherits: boolean;
    initialValue?: string;
    name: string;
    syntax?: string;
}

interface PropertyIndexedKeyframes {
    composite?: CompositeOperationOrAuto | CompositeOperationOrAuto[];
    easing?: string | string[];
    offset?: number | (number | null)[];
    [property: string]: string | string[] | number | null | (number | null)[] | undefined;
}

interface PublicKeyCredentialCreationOptions {
    attestation?: AttestationConveyancePreference;
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    challenge: BufferSource;
    excludeCredentials?: PublicKeyCredentialDescriptor[];
    extensions?: AuthenticationExtensionsClientInputs;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    rp: PublicKeyCredentialRpEntity;
    timeout?: number;
    user: PublicKeyCredentialUserEntity;
}

interface PublicKeyCredentialDescriptor {
    id: BufferSource;
    transports?: AuthenticatorTransport[];
    type: PublicKeyCredentialType;
}

interface PublicKeyCredentialEntity {
    name: string;
}

interface PublicKeyCredentialParameters {
    alg: COSEAlgorithmIdentifier;
    type: PublicKeyCredentialType;
}

interface PublicKeyCredentialRequestOptions {
    allowCredentials?: PublicKeyCredentialDescriptor[];
    challenge: BufferSource;
    extensions?: AuthenticationExtensionsClientInputs;
    rpId?: string;
    timeout?: number;
    userVerification?: UserVerificationRequirement;
}

interface PublicKeyCredentialRpEntity extends PublicKeyCredentialEntity {
    id?: string;
}

interface PublicKeyCredentialUserEntity extends PublicKeyCredentialEntity {
    displayName: string;
    id: BufferSource;
}

interface PushSubscriptionJSON {
    endpoint?: string;
    expirationTime?: EpochTimeStamp | null;
    keys?: Record<string, string>;
}

interface PushSubscriptionOptionsInit {
    applicationServerKey?: BufferSource | string | null;
    userVisibleOnly?: boolean;
}

interface QueuingStrategy<T = any> {
    highWaterMark?: number;
    size?: QueuingStrategySize<T>;
}

interface QueuingStrategyInit {
    /**
     * Creates a new ByteLengthQueuingStrategy with the provided high water mark.
     *
     * Note that the provided high water mark will not be validated ahead of time. Instead, if it is negative, NaN, or not a number, the resulting ByteLengthQueuingStrategy will cause the corresponding stream constructor to throw.
     */
    highWaterMark: number;
}

interface RTCAnswerOptions extends RTCOfferAnswerOptions {
}

interface RTCCertificateExpiration {
    expires?: number;
}

interface RTCConfiguration {
    bundlePolicy?: RTCBundlePolicy;
    certificates?: RTCCertificate[];
    iceCandidatePoolSize?: number;
    iceServers?: RTCIceServer[];
    iceTransportPolicy?: RTCIceTransportPolicy;
    rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

interface RTCDTMFToneChangeEventInit extends EventInit {
    tone?: string;
}

interface RTCDataChannelEventInit extends EventInit {
    channel: RTCDataChannel;
}

interface RTCDataChannelInit {
    id?: number;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
    negotiated?: boolean;
    ordered?: boolean;
    protocol?: string;
}

interface RTCDtlsFingerprint {
    algorithm?: string;
    value?: string;
}

interface RTCEncodedAudioFrameMetadata {
    contributingSources?: number[];
    synchronizationSource?: number;
}

interface RTCEncodedVideoFrameMetadata {
    dependencies?: number[];
    frameId?: number;
    height?: number;
    spatialIndex?: number;
    synchronizationSource?: number;
    temporalIndex?: number;
    width?: number;
}

interface RTCErrorEventInit extends EventInit {
    error: RTCError;
}

interface RTCErrorInit {
    errorDetail: RTCErrorDetailType;
    httpRequestStatusCode?: number;
    receivedAlert?: number;
    sctpCauseCode?: number;
    sdpLineNumber?: number;
    sentAlert?: number;
}

interface RTCIceCandidateInit {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string | null;
}

interface RTCIceCandidatePair {
    local?: RTCIceCandidate;
    remote?: RTCIceCandidate;
}

interface RTCIceCandidatePairStats extends RTCStats {
    availableIncomingBitrate?: number;
    availableOutgoingBitrate?: number;
    bytesReceived?: number;
    bytesSent?: number;
    currentRoundTripTime?: number;
    lastPacketReceivedTimestamp?: DOMHighResTimeStamp;
    lastPacketSentTimestamp?: DOMHighResTimeStamp;
    localCandidateId: string;
    nominated?: boolean;
    remoteCandidateId: string;
    requestsReceived?: number;
    requestsSent?: number;
    responsesReceived?: number;
    responsesSent?: number;
    state: RTCStatsIceCandidatePairState;
    totalRoundTripTime?: number;
    transportId: string;
}

interface RTCIceServer {
    credential?: string;
    urls: string | string[];
    username?: string;
}

interface RTCInboundRtpStreamStats extends RTCReceivedRtpStreamStats {
    audioLevel?: number;
    bytesReceived?: number;
    concealedSamples?: number;
    concealmentEvents?: number;
    decoderImplementation?: string;
    estimatedPlayoutTimestamp?: DOMHighResTimeStamp;
    fecPacketsDiscarded?: number;
    fecPacketsReceived?: number;
    firCount?: number;
    frameHeight?: number;
    frameWidth?: number;
    framesDecoded?: number;
    framesDropped?: number;
    framesPerSecond?: number;
    framesReceived?: number;
    headerBytesReceived?: number;
    insertedSamplesForDeceleration?: number;
    jitterBufferDelay?: number;
    jitterBufferEmittedCount?: number;
    keyFramesDecoded?: number;
    kind: string;
    lastPacketReceivedTimestamp?: DOMHighResTimeStamp;
    mid?: string;
    nackCount?: number;
    packetsDiscarded?: number;
    pliCount?: number;
    qpSum?: number;
    remoteId?: string;
    removedSamplesForAcceleration?: number;
    silentConcealedSamples?: number;
    totalAudioEnergy?: number;
    totalDecodeTime?: number;
    totalInterFrameDelay?: number;
    totalProcessingDelay?: number;
    totalSamplesDuration?: number;
    totalSamplesReceived?: number;
    totalSquaredInterFrameDelay?: number;
    trackIdentifier: string;
}

interface RTCLocalSessionDescriptionInit {
    sdp?: string;
    type?: RTCSdpType;
}

interface RTCOfferAnswerOptions {
}

interface RTCOfferOptions extends RTCOfferAnswerOptions {
    iceRestart?: boolean;
    offerToReceiveAudio?: boolean;
    offerToReceiveVideo?: boolean;
}

interface RTCOutboundRtpStreamStats extends RTCSentRtpStreamStats {
    firCount?: number;
    frameHeight?: number;
    frameWidth?: number;
    framesEncoded?: number;
    framesPerSecond?: number;
    framesSent?: number;
    headerBytesSent?: number;
    hugeFramesSent?: number;
    keyFramesEncoded?: number;
    mediaSourceId?: string;
    nackCount?: number;
    pliCount?: number;
    qpSum?: number;
    qualityLimitationResolutionChanges?: number;
    remoteId?: string;
    retransmittedBytesSent?: number;
    retransmittedPacketsSent?: number;
    rid?: string;
    targetBitrate?: number;
    totalEncodeTime?: number;
    totalEncodedBytesTarget?: number;
    totalPacketSendDelay?: number;
}

interface RTCPeerConnectionIceErrorEventInit extends EventInit {
    address?: string | null;
    errorCode: number;
    errorText?: string;
    port?: number | null;
    url?: string;
}

interface RTCPeerConnectionIceEventInit extends EventInit {
    candidate?: RTCIceCandidate | null;
    url?: string | null;
}

interface RTCReceivedRtpStreamStats extends RTCRtpStreamStats {
    jitter?: number;
    packetsLost?: number;
    packetsReceived?: number;
}

interface RTCRtcpParameters {
    cname?: string;
    reducedSize?: boolean;
}

interface RTCRtpCapabilities {
    codecs: RTCRtpCodecCapability[];
    headerExtensions: RTCRtpHeaderExtensionCapability[];
}

interface RTCRtpCodec {
    channels?: number;
    clockRate: number;
    mimeType: string;
    sdpFmtpLine?: string;
}

interface RTCRtpCodecCapability extends RTCRtpCodec {
}

interface RTCRtpCodecParameters extends RTCRtpCodec {
    payloadType: number;
}

interface RTCRtpCodingParameters {
    rid?: string;
}

interface RTCRtpContributingSource {
    audioLevel?: number;
    rtpTimestamp: number;
    source: number;
    timestamp: DOMHighResTimeStamp;
}

interface RTCRtpEncodingParameters extends RTCRtpCodingParameters {
    active?: boolean;
    maxBitrate?: number;
    maxFramerate?: number;
    networkPriority?: RTCPriorityType;
    priority?: RTCPriorityType;
    scaleResolutionDownBy?: number;
}

interface RTCRtpHeaderExtensionCapability {
    uri: string;
}

interface RTCRtpHeaderExtensionParameters {
    encrypted?: boolean;
    id: number;
    uri: string;
}

interface RTCRtpParameters {
    codecs: RTCRtpCodecParameters[];
    headerExtensions: RTCRtpHeaderExtensionParameters[];
    rtcp: RTCRtcpParameters;
}

interface RTCRtpReceiveParameters extends RTCRtpParameters {
}

interface RTCRtpSendParameters extends RTCRtpParameters {
    degradationPreference?: RTCDegradationPreference;
    encodings: RTCRtpEncodingParameters[];
    transactionId: string;
}

interface RTCRtpStreamStats extends RTCStats {
    codecId?: string;
    kind: string;
    ssrc: number;
    transportId?: string;
}

interface RTCRtpSynchronizationSource extends RTCRtpContributingSource {
}

interface RTCRtpTransceiverInit {
    direction?: RTCRtpTransceiverDirection;
    sendEncodings?: RTCRtpEncodingParameters[];
    streams?: MediaStream[];
}

interface RTCSentRtpStreamStats extends RTCRtpStreamStats {
    bytesSent?: number;
    packetsSent?: number;
}

interface RTCSessionDescriptionInit {
    sdp?: string;
    type: RTCSdpType;
}

interface RTCStats {
    id: string;
    timestamp: DOMHighResTimeStamp;
    type: RTCStatsType;
}

interface RTCTrackEventInit extends EventInit {
    receiver: RTCRtpReceiver;
    streams?: MediaStream[];
    track: MediaStreamTrack;
    transceiver: RTCRtpTransceiver;
}

interface RTCTransportStats extends RTCStats {
    bytesReceived?: number;
    bytesSent?: number;
    dtlsCipher?: string;
    dtlsState: RTCDtlsTransportState;
    localCertificateId?: string;
    remoteCertificateId?: string;
    selectedCandidatePairId?: string;
    srtpCipher?: string;
    tlsVersion?: string;
}

interface ReadableStreamGetReaderOptions {
    /**
     * Creates a ReadableStreamBYOBReader and locks the stream to the new reader.
     *
     * This call behaves the same way as the no-argument variant, except that it only works on readable byte streams, i.e. streams which were constructed specifically with the ability to handle "bring your own buffer" reading. The returned BYOB reader provides the ability to directly read individual chunks from the stream via its read() method, into developer-supplied buffers, allowing more precise control over allocation.
     */
    mode?: ReadableStreamReaderMode;
}

interface ReadableStreamReadDoneResult<T> {
    done: true;
    value?: T;
}

interface ReadableStreamReadValueResult<T> {
    done: false;
    value: T;
}

interface ReadableWritablePair<R = any, W = any> {
    readable: ReadableStream<R>;
    /**
     * Provides a convenient, chainable way of piping this readable stream through a transform stream (or any other { writable, readable } pair). It simply pipes the stream into the writable side of the supplied pair, and returns the readable side for further use.
     *
     * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
     */
    writable: WritableStream<W>;
}

interface RegistrationOptions {
    scope?: string;
    type?: WorkerType;
    updateViaCache?: ServiceWorkerUpdateViaCache;
}

interface ReportingObserverOptions {
    buffered?: boolean;
    types?: string[];
}

interface RequestInit {
    /** A BodyInit object or null to set request's body. */
    body?: BodyInit | null;
    /** A string indicating how the request will interact with the browser's cache to set request's cache. */
    cache?: RequestCache;
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
    headers?: HeadersInit;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to set request's method. */
    method?: string;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: RequestMode;
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: RequestRedirect;
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: ReferrerPolicy;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
    /** Can only be null. Used to disassociate request from any Window. */
    window?: null;
}

interface ResizeObserverOptions {
    box?: ResizeObserverBoxOptions;
}

interface ResponseInit {
    headers?: HeadersInit;
    status?: number;
    statusText?: string;
}

interface RsaHashedImportParams extends Algorithm {
    hash: HashAlgorithmIdentifier;
}

interface RsaHashedKeyAlgorithm extends RsaKeyAlgorithm {
    hash: KeyAlgorithm;
}

interface RsaHashedKeyGenParams extends RsaKeyGenParams {
    hash: HashAlgorithmIdentifier;
}

interface RsaKeyAlgorithm extends KeyAlgorithm {
    modulusLength: number;
    publicExponent: BigInteger;
}

interface RsaKeyGenParams extends Algorithm {
    modulusLength: number;
    publicExponent: BigInteger;
}

interface RsaOaepParams extends Algorithm {
    label?: BufferSource;
}

interface RsaOtherPrimesInfo {
    d?: string;
    r?: string;
    t?: string;
}

interface RsaPssParams extends Algorithm {
    saltLength: number;
}

interface SVGBoundingBoxOptions {
    clipped?: boolean;
    fill?: boolean;
    markers?: boolean;
    stroke?: boolean;
}

interface ScrollIntoViewOptions extends ScrollOptions {
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
}

interface ScrollOptions {
    behavior?: ScrollBehavior;
}

interface ScrollToOptions extends ScrollOptions {
    left?: number;
    top?: number;
}

interface SecurityPolicyViolationEventInit extends EventInit {
    blockedURI?: string;
    columnNumber?: number;
    disposition: SecurityPolicyViolationEventDisposition;
    documentURI: string;
    effectiveDirective: string;
    lineNumber?: number;
    originalPolicy: string;
    referrer?: string;
    sample?: string;
    sourceFile?: string;
    statusCode: number;
    violatedDirective: string;
}

interface ShadowRootInit {
    delegatesFocus?: boolean;
    mode: ShadowRootMode;
    slotAssignment?: SlotAssignmentMode;
}

interface ShareData {
    files?: File[];
    text?: string;
    title?: string;
    url?: string;
}

interface SpeechSynthesisErrorEventInit extends SpeechSynthesisEventInit {
    error: SpeechSynthesisErrorCode;
}

interface SpeechSynthesisEventInit extends EventInit {
    charIndex?: number;
    charLength?: number;
    elapsedTime?: number;
    name?: string;
    utterance: SpeechSynthesisUtterance;
}

interface StaticRangeInit {
    endContainer: Node;
    endOffset: number;
    startContainer: Node;
    startOffset: number;
}

interface StereoPannerOptions extends AudioNodeOptions {
    pan?: number;
}

interface StorageEstimate {
    quota?: number;
    usage?: number;
}

interface StorageEventInit extends EventInit {
    key?: string | null;
    newValue?: string | null;
    oldValue?: string | null;
    storageArea?: Storage | null;
    url?: string;
}

interface StreamPipeOptions {
    preventAbort?: boolean;
    preventCancel?: boolean;
    /**
     * Pipes this readable stream to a given writable stream destination. The way in which the piping process behaves under various error conditions can be customized with a number of passed options. It returns a promise that fulfills when the piping process completes successfully, or rejects if any errors were encountered.
     *
     * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
     *
     * Errors and closures of the source and destination streams propagate as follows:
     *
     * An error in this source readable stream will abort destination, unless preventAbort is truthy. The returned promise will be rejected with the source's error, or with any error that occurs during aborting the destination.
     *
     * An error in destination will cancel this source readable stream, unless preventCancel is truthy. The returned promise will be rejected with the destination's error, or with any error that occurs during canceling the source.
     *
     * When this source readable stream closes, destination will be closed, unless preventClose is truthy. The returned promise will be fulfilled once this process completes, unless an error is encountered while closing the destination, in which case it will be rejected with that error.
     *
     * If destination starts out closed or closing, this source readable stream will be canceled, unless preventCancel is true. The returned promise will be rejected with an error indicating piping to a closed stream failed, or with any error that occurs during canceling the source.
     *
     * The signal option can be set to an AbortSignal to allow aborting an ongoing pipe operation via the corresponding AbortController. In this case, this source readable stream will be canceled, and destination aborted, unless the respective options preventCancel or preventAbort are set.
     */
    preventClose?: boolean;
    signal?: AbortSignal;
}

interface StructuredSerializeOptions {
    transfer?: Transferable[];
}

interface SubmitEventInit extends EventInit {
    submitter?: HTMLElement | null;
}

interface TextDecodeOptions {
    stream?: boolean;
}

interface TextDecoderOptions {
    fatal?: boolean;
    ignoreBOM?: boolean;
}

interface TextEncoderEncodeIntoResult {
    read: number;
    written: number;
}

interface ToggleEventInit extends EventInit {
    newState?: string;
    oldState?: string;
}

interface TouchEventInit extends EventModifierInit {
    changedTouches?: Touch[];
    targetTouches?: Touch[];
    touches?: Touch[];
}

interface TouchInit {
    altitudeAngle?: number;
    azimuthAngle?: number;
    clientX?: number;
    clientY?: number;
    force?: number;
    identifier: number;
    pageX?: number;
    pageY?: number;
    radiusX?: number;
    radiusY?: number;
    rotationAngle?: number;
    screenX?: number;
    screenY?: number;
    target: EventTarget;
    touchType?: TouchType;
}

interface TrackEventInit extends EventInit {
    track?: TextTrack | null;
}

interface Transformer<I = any, O = any> {
    flush?: TransformerFlushCallback<O>;
    readableType?: undefined;
    start?: TransformerStartCallback<O>;
    transform?: TransformerTransformCallback<I, O>;
    writableType?: undefined;
}

interface TransitionEventInit extends EventInit {
    elapsedTime?: number;
    propertyName?: string;
    pseudoElement?: string;
}

interface UIEventInit extends EventInit {
    detail?: number;
    view?: Window | null;
    /** @deprecated */
    which?: number;
}

interface ULongRange {
    max?: number;
    min?: number;
}

interface UnderlyingByteSource {
    autoAllocateChunkSize?: number;
    cancel?: UnderlyingSourceCancelCallback;
    pull?: (controller: ReadableByteStreamController) => void | PromiseLike<void>;
    start?: (controller: ReadableByteStreamController) => any;
    type: "bytes";
}

interface UnderlyingDefaultSource<R = any> {
    cancel?: UnderlyingSourceCancelCallback;
    pull?: (controller: ReadableStreamDefaultController<R>) => void | PromiseLike<void>;
    start?: (controller: ReadableStreamDefaultController<R>) => any;
    type?: undefined;
}

interface UnderlyingSink<W = any> {
    abort?: UnderlyingSinkAbortCallback;
    close?: UnderlyingSinkCloseCallback;
    start?: UnderlyingSinkStartCallback;
    type?: undefined;
    write?: UnderlyingSinkWriteCallback<W>;
}

interface UnderlyingSource<R = any> {
    autoAllocateChunkSize?: number;
    cancel?: UnderlyingSourceCancelCallback;
    pull?: UnderlyingSourcePullCallback<R>;
    start?: UnderlyingSourceStartCallback<R>;
    type?: ReadableStreamType;
}

interface ValidityStateFlags {
    badInput?: boolean;
    customError?: boolean;
    patternMismatch?: boolean;
    rangeOverflow?: boolean;
    rangeUnderflow?: boolean;
    stepMismatch?: boolean;
    tooLong?: boolean;
    tooShort?: boolean;
    typeMismatch?: boolean;
    valueMissing?: boolean;
}

interface VideoColorSpaceInit {
    fullRange?: boolean | null;
    matrix?: VideoMatrixCoefficients | null;
    primaries?: VideoColorPrimaries | null;
    transfer?: VideoTransferCharacteristics | null;
}

interface VideoConfiguration {
    bitrate: number;
    colorGamut?: ColorGamut;
    contentType: string;
    framerate: number;
    hdrMetadataType?: HdrMetadataType;
    height: number;
    scalabilityMode?: string;
    transferFunction?: TransferFunction;
    width: number;
}

interface VideoDecoderConfig {
    codec: string;
    codedHeight?: number;
    codedWidth?: number;
    colorSpace?: VideoColorSpaceInit;
    description?: BufferSource;
    displayAspectHeight?: number;
    displayAspectWidth?: number;
    hardwareAcceleration?: HardwareAcceleration;
    optimizeForLatency?: boolean;
}

interface VideoDecoderInit {
    error: WebCodecsErrorCallback;
    output: VideoFrameOutputCallback;
}

interface VideoDecoderSupport {
    config?: VideoDecoderConfig;
    supported?: boolean;
}

interface VideoEncoderConfig {
    alpha?: AlphaOption;
    avc?: AvcEncoderConfig;
    bitrate?: number;
    bitrateMode?: VideoEncoderBitrateMode;
    codec: string;
    displayHeight?: number;
    displayWidth?: number;
    framerate?: number;
    hardwareAcceleration?: HardwareAcceleration;
    height: number;
    latencyMode?: LatencyMode;
    scalabilityMode?: string;
    width: number;
}

interface VideoEncoderEncodeOptions {
    keyFrame?: boolean;
}

interface VideoEncoderInit {
    error: WebCodecsErrorCallback;
    output: EncodedVideoChunkOutputCallback;
}

interface VideoEncoderSupport {
    config?: VideoEncoderConfig;
    supported?: boolean;
}

interface VideoFrameBufferInit {
    codedHeight: number;
    codedWidth: number;
    colorSpace?: VideoColorSpaceInit;
    displayHeight?: number;
    displayWidth?: number;
    duration?: number;
    format: VideoPixelFormat;
    layout?: PlaneLayout[];
    timestamp: number;
    visibleRect?: DOMRectInit;
}

interface VideoFrameCallbackMetadata {
    captureTime?: DOMHighResTimeStamp;
    expectedDisplayTime: DOMHighResTimeStamp;
    height: number;
    mediaTime: number;
    presentationTime: DOMHighResTimeStamp;
    presentedFrames: number;
    processingDuration?: number;
    receiveTime?: DOMHighResTimeStamp;
    rtpTimestamp?: number;
    width: number;
}

interface VideoFrameCopyToOptions {
    layout?: PlaneLayout[];
    rect?: DOMRectInit;
}

interface VideoFrameInit {
    alpha?: AlphaOption;
    displayHeight?: number;
    displayWidth?: number;
    duration?: number;
    timestamp?: number;
    visibleRect?: DOMRectInit;
}

interface WaveShaperOptions extends AudioNodeOptions {
    curve?: number[] | Float32Array;
    oversample?: OverSampleType;
}

interface WebGLContextAttributes {
    alpha?: boolean;
    antialias?: boolean;
    depth?: boolean;
    desynchronized?: boolean;
    failIfMajorPerformanceCaveat?: boolean;
    powerPreference?: WebGLPowerPreference;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    stencil?: boolean;
}

interface WebGLContextEventInit extends EventInit {
    statusMessage?: string;
}

interface WebTransportCloseInfo {
    closeCode?: number;
    reason?: string;
}

interface WebTransportErrorOptions {
    source?: WebTransportErrorSource;
    streamErrorCode?: number | null;
}

interface WebTransportHash {
    algorithm?: string;
    value?: BufferSource;
}

interface WebTransportOptions {
    allowPooling?: boolean;
    congestionControl?: WebTransportCongestionControl;
    requireUnreliable?: boolean;
    serverCertificateHashes?: WebTransportHash[];
}

interface WebTransportSendStreamOptions {
    sendOrder?: number | null;
}

interface WheelEventInit extends MouseEventInit {
    deltaMode?: number;
    deltaX?: number;
    deltaY?: number;
    deltaZ?: number;
}

interface WindowPostMessageOptions extends StructuredSerializeOptions {
    targetOrigin?: string;
}

interface WorkerOptions {
    credentials?: RequestCredentials;
    name?: string;
    type?: WorkerType;
}

interface WorkletOptions {
    credentials?: RequestCredentials;
}

interface WriteParams {
    data?: BufferSource | Blob | string | null;
    position?: number | null;
    size?: number | null;
    type: WriteCommandType;
}

type NodeFilter = ((node: Node) => number) | { acceptNode(node: Node): number; };

declare var NodeFilter: {
    readonly FILTER_ACCEPT: 1;
    readonly FILTER_REJECT: 2;
    readonly FILTER_SKIP: 3;
    readonly SHOW_ALL: 0xFFFFFFFF;
    readonly SHOW_ELEMENT: 0x1;
    readonly SHOW_ATTRIBUTE: 0x2;
    readonly SHOW_TEXT: 0x4;
    readonly SHOW_CDATA_SECTION: 0x8;
    readonly SHOW_ENTITY_REFERENCE: 0x10;
    readonly SHOW_ENTITY: 0x20;
    readonly SHOW_PROCESSING_INSTRUCTION: 0x40;
    readonly SHOW_COMMENT: 0x80;
    readonly SHOW_DOCUMENT: 0x100;
    readonly SHOW_DOCUMENT_TYPE: 0x200;
    readonly SHOW_DOCUMENT_FRAGMENT: 0x400;
    readonly SHOW_NOTATION: 0x800;
};

type XPathNSResolver = ((prefix: string | null) => string | null) | { lookupNamespaceURI(prefix: string | null): string | null; };

/**
 * The ANGLE_instanced_arrays extension is part of the WebGL API and allows to draw the same object, or groups of similar objects multiple times, if they share the same vertex data, primitive count and type.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ANGLE_instanced_arrays)
 */
interface ANGLE_instanced_arrays {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ANGLE_instanced_arrays/drawArraysInstancedANGLE) */
    drawArraysInstancedANGLE(mode: GLenum, first: GLint, count: GLsizei, primcount: GLsizei): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ANGLE_instanced_arrays/drawElementsInstancedANGLE) */
    drawElementsInstancedANGLE(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, primcount: GLsizei): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ANGLE_instanced_arrays/vertexAttribDivisorANGLE) */
    vertexAttribDivisorANGLE(index: GLuint, divisor: GLuint): void;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: 0x88FE;
}

interface ARIAMixin {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) */
    ariaAtomic: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) */
    ariaAutoComplete: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) */
    ariaBusy: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) */
    ariaChecked: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) */
    ariaColCount: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) */
    ariaColIndex: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) */
    ariaColSpan: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) */
    ariaCurrent: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) */
    ariaDisabled: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) */
    ariaExpanded: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) */
    ariaHasPopup: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) */
    ariaHidden: string | null;
    ariaInvalid: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) */
    ariaKeyShortcuts: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) */
    ariaLabel: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) */
    ariaLevel: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) */
    ariaLive: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) */
    ariaModal: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) */
    ariaMultiLine: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) */
    ariaMultiSelectable: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) */
    ariaOrientation: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) */
    ariaPlaceholder: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) */
    ariaPosInSet: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) */
    ariaPressed: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) */
    ariaReadOnly: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) */
    ariaRequired: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) */
    ariaRoleDescription: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) */
    ariaRowCount: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) */
    ariaRowIndex: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) */
    ariaRowSpan: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) */
    ariaSelected: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) */
    ariaSetSize: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) */
    ariaSort: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) */
    ariaValueMax: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) */
    ariaValueMin: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) */
    ariaValueNow: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) */
    ariaValueText: string | null;
    role: string | null;
}

/**
 * A controller object that allows you to abort one or more DOM requests as and when desired.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortController)
 */
interface AbortController {
    /**
     * Returns the AbortSignal object associated with this object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortController/signal)
     */
    readonly signal: AbortSignal;
    /**
     * Invoking this method will set this object's AbortSignal's aborted flag and signal to any observers that the associated activity is to be aborted.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortController/abort)
     */
    abort(reason?: any): void;
}

declare var AbortController: {
    prototype: AbortController;
    new(): AbortController;
};

interface AbortSignalEventMap {
    "abort": Event;
}

/**
 * A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal)
 */
interface AbortSignal extends EventTarget {
    /**
     * Returns true if this AbortSignal's AbortController has signaled to abort, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/aborted)
     */
    readonly aborted: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_event) */
    onabort: ((this: AbortSignal, ev: Event) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/reason) */
    readonly reason: any;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/throwIfAborted) */
    throwIfAborted(): void;
    addEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var AbortSignal: {
    prototype: AbortSignal;
    new(): AbortSignal;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_static) */
    abort(reason?: any): AbortSignal;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/timeout_static) */
    timeout(milliseconds: number): AbortSignal;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbstractRange) */
interface AbstractRange {
    /**
     * Returns true if range is collapsed, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbstractRange/collapsed)
     */
    readonly collapsed: boolean;
    /**
     * Returns range's end node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbstractRange/endContainer)
     */
    readonly endContainer: Node;
    /**
     * Returns range's end offset.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbstractRange/endOffset)
     */
    readonly endOffset: number;
    /**
     * Returns range's start node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbstractRange/startContainer)
     */
    readonly startContainer: Node;
    /**
     * Returns range's start offset.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbstractRange/startOffset)
     */
    readonly startOffset: number;
}

declare var AbstractRange: {
    prototype: AbstractRange;
    new(): AbstractRange;
};

interface AbstractWorkerEventMap {
    "error": ErrorEvent;
}

interface AbstractWorker {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/error_event) */
    onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;
    addEventListener<K extends keyof AbstractWorkerEventMap>(type: K, listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AbstractWorkerEventMap>(type: K, listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

/**
 * A node able to provide real-time frequency and time-domain analysis information. It is an AudioNode that passes the audio stream unchanged from the input to the output, but allows you to take the generated data, process it, and create audio visualizations.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode)
 */
interface AnalyserNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/fftSize) */
    fftSize: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/frequencyBinCount) */
    readonly frequencyBinCount: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/maxDecibels) */
    maxDecibels: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/minDecibels) */
    minDecibels: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/smoothingTimeConstant) */
    smoothingTimeConstant: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/getByteFrequencyData) */
    getByteFrequencyData(array: Uint8Array): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/getByteTimeDomainData) */
    getByteTimeDomainData(array: Uint8Array): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/getFloatFrequencyData) */
    getFloatFrequencyData(array: Float32Array): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnalyserNode/getFloatTimeDomainData) */
    getFloatTimeDomainData(array: Float32Array): void;
}

declare var AnalyserNode: {
    prototype: AnalyserNode;
    new(context: BaseAudioContext, options?: AnalyserOptions): AnalyserNode;
};

interface Animatable {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animate) */
    animate(keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAnimations) */
    getAnimations(options?: GetAnimationsOptions): Animation[];
}

interface AnimationEventMap {
    "cancel": AnimationPlaybackEvent;
    "finish": AnimationPlaybackEvent;
    "remove": Event;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation) */
interface Animation extends EventTarget {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/currentTime) */
    currentTime: CSSNumberish | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/effect) */
    effect: AnimationEffect | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finished) */
    readonly finished: Promise<Animation>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/id) */
    id: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/cancel_event) */
    oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finish_event) */
    onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/remove_event) */
    onremove: ((this: Animation, ev: Event) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/pending) */
    readonly pending: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/playState) */
    readonly playState: AnimationPlayState;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/playbackRate) */
    playbackRate: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/ready) */
    readonly ready: Promise<Animation>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/replaceState) */
    readonly replaceState: AnimationReplaceState;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/startTime) */
    startTime: CSSNumberish | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/timeline) */
    timeline: AnimationTimeline | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/cancel) */
    cancel(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/commitStyles) */
    commitStyles(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finish) */
    finish(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/pause) */
    pause(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/persist) */
    persist(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/play) */
    play(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/reverse) */
    reverse(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/updatePlaybackRate) */
    updatePlaybackRate(playbackRate: number): void;
    addEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: Animation, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: Animation, ev: AnimationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var Animation: {
    prototype: Animation;
    new(effect?: AnimationEffect | null, timeline?: AnimationTimeline | null): Animation;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect) */
interface AnimationEffect {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect/getComputedTiming) */
    getComputedTiming(): ComputedEffectTiming;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect/getTiming) */
    getTiming(): EffectTiming;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect/updateTiming) */
    updateTiming(timing?: OptionalEffectTiming): void;
}

declare var AnimationEffect: {
    prototype: AnimationEffect;
    new(): AnimationEffect;
};

/**
 * Events providing information related to animations.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEvent)
 */
interface AnimationEvent extends Event {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEvent/animationName) */
    readonly animationName: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEvent/elapsedTime) */
    readonly elapsedTime: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEvent/pseudoElement) */
    readonly pseudoElement: string;
}

declare var AnimationEvent: {
    prototype: AnimationEvent;
    new(type: string, animationEventInitDict?: AnimationEventInit): AnimationEvent;
};

interface AnimationFrameProvider {
    cancelAnimationFrame(handle: number): void;
    requestAnimationFrame(callback: FrameRequestCallback): number;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationPlaybackEvent) */
interface AnimationPlaybackEvent extends Event {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationPlaybackEvent/currentTime) */
    readonly currentTime: CSSNumberish | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationPlaybackEvent/timelineTime) */
    readonly timelineTime: CSSNumberish | null;
}

declare var AnimationPlaybackEvent: {
    prototype: AnimationPlaybackEvent;
    new(type: string, eventInitDict?: AnimationPlaybackEventInit): AnimationPlaybackEvent;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationTimeline) */
interface AnimationTimeline {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationTimeline/currentTime) */
    readonly currentTime: CSSNumberish | null;
}

declare var AnimationTimeline: {
    prototype: AnimationTimeline;
    new(): AnimationTimeline;
};

/**
 * A DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr)
 */
interface Attr extends Node {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/localName) */
    readonly localName: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/name) */
    readonly name: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/namespaceURI) */
    readonly namespaceURI: string | null;
    readonly ownerDocument: Document;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/ownerElement) */
    readonly ownerElement: Element | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/prefix) */
    readonly prefix: string | null;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/specified)
     */
    readonly specified: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Attr/value) */
    value: string;
}

declare var Attr: {
    prototype: Attr;
    new(): Attr;
};

/**
 * A short audio asset residing in memory, created from an audio file using the AudioContext.decodeAudioData() method, or from raw data using AudioContext.createBuffer(). Once put into an AudioBuffer, the audio can then be played by being passed into an AudioBufferSourceNode.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer)
 */
interface AudioBuffer {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/duration) */
    readonly duration: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/length) */
    readonly length: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/numberOfChannels) */
    readonly numberOfChannels: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/sampleRate) */
    readonly sampleRate: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/copyFromChannel) */
    copyFromChannel(destination: Float32Array, channelNumber: number, bufferOffset?: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/copyToChannel) */
    copyToChannel(source: Float32Array, channelNumber: number, bufferOffset?: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBuffer/getChannelData) */
    getChannelData(channel: number): Float32Array;
}

declare var AudioBuffer: {
    prototype: AudioBuffer;
    new(options: AudioBufferOptions): AudioBuffer;
};

/**
 * An AudioScheduledSourceNode which represents an audio source consisting of in-memory audio data, stored in an AudioBuffer. It's especially useful for playing back audio which has particularly stringent timing accuracy requirements, such as for sounds that must match a specific rhythm and can be kept in memory rather than being played from disk or the network.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode)
 */
interface AudioBufferSourceNode extends AudioScheduledSourceNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/buffer) */
    buffer: AudioBuffer | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/detune) */
    readonly detune: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/loop) */
    loop: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/loopEnd) */
    loopEnd: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/loopStart) */
    loopStart: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/playbackRate) */
    readonly playbackRate: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode/start) */
    start(when?: number, offset?: number, duration?: number): void;
    addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(type: K, listener: (this: AudioBufferSourceNode, ev: AudioScheduledSourceNodeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(type: K, listener: (this: AudioBufferSourceNode, ev: AudioScheduledSourceNodeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var AudioBufferSourceNode: {
    prototype: AudioBufferSourceNode;
    new(context: BaseAudioContext, options?: AudioBufferSourceOptions): AudioBufferSourceNode;
};

/**
 * An audio-processing graph built from audio modules linked together, each represented by an AudioNode.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext)
 */
interface AudioContext extends BaseAudioContext {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/baseLatency) */
    readonly baseLatency: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/outputLatency) */
    readonly outputLatency: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/close) */
    close(): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/createMediaElementSource) */
    createMediaElementSource(mediaElement: HTMLMediaElement): MediaElementAudioSourceNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/createMediaStreamDestination) */
    createMediaStreamDestination(): MediaStreamAudioDestinationNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/createMediaStreamSource) */
    createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/getOutputTimestamp) */
    getOutputTimestamp(): AudioTimestamp;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/resume) */
    resume(): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioContext/suspend) */
    suspend(): Promise<void>;
    addEventListener<K extends keyof BaseAudioContextEventMap>(type: K, listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof BaseAudioContextEventMap>(type: K, listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var AudioContext: {
    prototype: AudioContext;
    new(contextOptions?: AudioContextOptions): AudioContext;
};

/**
 * AudioDestinationNode has no output (as it is the output, no more AudioNode can be linked after it in the audio graph) and one input. The number of channels in the input must be between 0 and the maxChannelCount value or an exception is raised.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioDestinationNode)
 */
interface AudioDestinationNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioDestinationNode/maxChannelCount) */
    readonly maxChannelCount: number;
}

declare var AudioDestinationNode: {
    prototype: AudioDestinationNode;
    new(): AudioDestinationNode;
};

/**
 * The position and orientation of the unique person listening to the audio scene, and is used in audio spatialization. All PannerNodes spatialize in relation to the AudioListener stored in the BaseAudioContext.listener attribute.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener)
 */
interface AudioListener {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/forwardX) */
    readonly forwardX: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/forwardY) */
    readonly forwardY: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/forwardZ) */
    readonly forwardZ: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/positionX) */
    readonly positionX: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/positionY) */
    readonly positionY: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/positionZ) */
    readonly positionZ: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/upX) */
    readonly upX: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/upY) */
    readonly upY: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/upZ) */
    readonly upZ: AudioParam;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/setOrientation)
     */
    setOrientation(x: number, y: number, z: number, xUp: number, yUp: number, zUp: number): void;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioListener/setPosition)
     */
    setPosition(x: number, y: number, z: number): void;
}

declare var AudioListener: {
    prototype: AudioListener;
    new(): AudioListener;
};

/**
 * A generic interface for representing an audio processing module. Examples include:
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode)
 */
interface AudioNode extends EventTarget {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/channelCount) */
    channelCount: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/channelCountMode) */
    channelCountMode: ChannelCountMode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/channelInterpretation) */
    channelInterpretation: ChannelInterpretation;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/context) */
    readonly context: BaseAudioContext;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/numberOfInputs) */
    readonly numberOfInputs: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/numberOfOutputs) */
    readonly numberOfOutputs: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/connect) */
    connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode;
    connect(destinationParam: AudioParam, output?: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioNode/disconnect) */
    disconnect(): void;
    disconnect(output: number): void;
    disconnect(destinationNode: AudioNode): void;
    disconnect(destinationNode: AudioNode, output: number): void;
    disconnect(destinationNode: AudioNode, output: number, input: number): void;
    disconnect(destinationParam: AudioParam): void;
    disconnect(destinationParam: AudioParam, output: number): void;
}

declare var AudioNode: {
    prototype: AudioNode;
    new(): AudioNode;
};

/**
 * The Web Audio API's AudioParam interface represents an audio-related parameter, usually a parameter of an AudioNode (such as GainNode.gain).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam)
 */
interface AudioParam {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/automationRate) */
    automationRate: AutomationRate;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/defaultValue) */
    readonly defaultValue: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/maxValue) */
    readonly maxValue: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/minValue) */
    readonly minValue: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/value) */
    value: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/cancelAndHoldAtTime) */
    cancelAndHoldAtTime(cancelTime: number): AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/cancelScheduledValues) */
    cancelScheduledValues(cancelTime: number): AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/exponentialRampToValueAtTime) */
    exponentialRampToValueAtTime(value: number, endTime: number): AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/linearRampToValueAtTime) */
    linearRampToValueAtTime(value: number, endTime: number): AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/setTargetAtTime) */
    setTargetAtTime(target: number, startTime: number, timeConstant: number): AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/setValueAtTime) */
    setValueAtTime(value: number, startTime: number): AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/setValueCurveAtTime) */
    setValueCurveAtTime(values: number[] | Float32Array, startTime: number, duration: number): AudioParam;
}

declare var AudioParam: {
    prototype: AudioParam;
    new(): AudioParam;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParamMap) */
interface AudioParamMap {
    forEach(callbackfn: (value: AudioParam, key: string, parent: AudioParamMap) => void, thisArg?: any): void;
}

declare var AudioParamMap: {
    prototype: AudioParamMap;
    new(): AudioParamMap;
};

/**
 * The Web Audio API events that occur when a ScriptProcessorNode input buffer is ready to be processed.
 * @deprecated As of the August 29 2014 Web Audio API spec publication, this feature has been marked as deprecated, and is soon to be replaced by AudioWorklet.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioProcessingEvent)
 */
interface AudioProcessingEvent extends Event {
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioProcessingEvent/inputBuffer)
     */
    readonly inputBuffer: AudioBuffer;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioProcessingEvent/outputBuffer)
     */
    readonly outputBuffer: AudioBuffer;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioProcessingEvent/playbackTime)
     */
    readonly playbackTime: number;
}

/** @deprecated */
declare var AudioProcessingEvent: {
    prototype: AudioProcessingEvent;
    new(type: string, eventInitDict: AudioProcessingEventInit): AudioProcessingEvent;
};

interface AudioScheduledSourceNodeEventMap {
    "ended": Event;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioScheduledSourceNode) */
interface AudioScheduledSourceNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioScheduledSourceNode/ended_event) */
    onended: ((this: AudioScheduledSourceNode, ev: Event) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioScheduledSourceNode/start) */
    start(when?: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioScheduledSourceNode/stop) */
    stop(when?: number): void;
    addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(type: K, listener: (this: AudioScheduledSourceNode, ev: AudioScheduledSourceNodeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(type: K, listener: (this: AudioScheduledSourceNode, ev: AudioScheduledSourceNodeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var AudioScheduledSourceNode: {
    prototype: AudioScheduledSourceNode;
    new(): AudioScheduledSourceNode;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorklet)
 */
interface AudioWorklet extends Worklet {
}

declare var AudioWorklet: {
    prototype: AudioWorklet;
    new(): AudioWorklet;
};

interface AudioWorkletNodeEventMap {
    "processorerror": Event;
}

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletNode)
 */
interface AudioWorkletNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletNode/processorerror_event) */
    onprocessorerror: ((this: AudioWorkletNode, ev: Event) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletNode/parameters) */
    readonly parameters: AudioParamMap;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletNode/port) */
    readonly port: MessagePort;
    addEventListener<K extends keyof AudioWorkletNodeEventMap>(type: K, listener: (this: AudioWorkletNode, ev: AudioWorkletNodeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AudioWorkletNodeEventMap>(type: K, listener: (this: AudioWorkletNode, ev: AudioWorkletNodeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var AudioWorkletNode: {
    prototype: AudioWorkletNode;
    new(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions): AudioWorkletNode;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse)
 */
interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse/authenticatorData) */
    readonly authenticatorData: ArrayBuffer;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse/signature) */
    readonly signature: ArrayBuffer;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse/userHandle) */
    readonly userHandle: ArrayBuffer | null;
}

declare var AuthenticatorAssertionResponse: {
    prototype: AuthenticatorAssertionResponse;
    new(): AuthenticatorAssertionResponse;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse)
 */
interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/attestationObject) */
    readonly attestationObject: ArrayBuffer;
    getAuthenticatorData(): ArrayBuffer;
    getPublicKey(): ArrayBuffer | null;
    getPublicKeyAlgorithm(): COSEAlgorithmIdentifier;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/getTransports) */
    getTransports(): string[];
}

declare var AuthenticatorAttestationResponse: {
    prototype: AuthenticatorAttestationResponse;
    new(): AuthenticatorAttestationResponse;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorResponse)
 */
interface AuthenticatorResponse {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorResponse/clientDataJSON) */
    readonly clientDataJSON: ArrayBuffer;
}

declare var AuthenticatorResponse: {
    prototype: AuthenticatorResponse;
    new(): AuthenticatorResponse;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BarProp) */
interface BarProp {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BarProp/visible) */
    readonly visible: boolean;
}

declare var BarProp: {
    prototype: BarProp;
    new(): BarProp;
};

interface BaseAudioContextEventMap {
    "statechange": Event;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext) */
interface BaseAudioContext extends EventTarget {
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/audioWorklet)
     */
    readonly audioWorklet: AudioWorklet;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/currentTime) */
    readonly currentTime: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/destination) */
    readonly destination: AudioDestinationNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/listener) */
    readonly listener: AudioListener;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/statechange_event) */
    onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/sampleRate) */
    readonly sampleRate: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/state) */
    readonly state: AudioContextState;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createAnalyser) */
    createAnalyser(): AnalyserNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createBiquadFilter) */
    createBiquadFilter(): BiquadFilterNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createBuffer) */
    createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createBufferSource) */
    createBufferSource(): AudioBufferSourceNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createChannelMerger) */
    createChannelMerger(numberOfInputs?: number): ChannelMergerNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createChannelSplitter) */
    createChannelSplitter(numberOfOutputs?: number): ChannelSplitterNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createConstantSource) */
    createConstantSource(): ConstantSourceNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createConvolver) */
    createConvolver(): ConvolverNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createDelay) */
    createDelay(maxDelayTime?: number): DelayNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createDynamicsCompressor) */
    createDynamicsCompressor(): DynamicsCompressorNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createGain) */
    createGain(): GainNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createIIRFilter) */
    createIIRFilter(feedforward: number[], feedback: number[]): IIRFilterNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createOscillator) */
    createOscillator(): OscillatorNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createPanner) */
    createPanner(): PannerNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createPeriodicWave) */
    createPeriodicWave(real: number[] | Float32Array, imag: number[] | Float32Array, constraints?: PeriodicWaveConstraints): PeriodicWave;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createScriptProcessor)
     */
    createScriptProcessor(bufferSize?: number, numberOfInputChannels?: number, numberOfOutputChannels?: number): ScriptProcessorNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createStereoPanner) */
    createStereoPanner(): StereoPannerNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createWaveShaper) */
    createWaveShaper(): WaveShaperNode;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/decodeAudioData) */
    decodeAudioData(audioData: ArrayBuffer, successCallback?: DecodeSuccessCallback | null, errorCallback?: DecodeErrorCallback | null): Promise<AudioBuffer>;
    addEventListener<K extends keyof BaseAudioContextEventMap>(type: K, listener: (this: BaseAudioContext, ev: BaseAudioContextEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof BaseAudioContextEventMap>(type: K, listener: (this: BaseAudioContext, ev: BaseAudioContextEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var BaseAudioContext: {
    prototype: BaseAudioContext;
    new(): BaseAudioContext;
};

/**
 * The beforeunload event is fired when the window, the document and its resources are about to be unloaded.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BeforeUnloadEvent)
 */
interface BeforeUnloadEvent extends Event {
    returnValue: any;
}

declare var BeforeUnloadEvent: {
    prototype: BeforeUnloadEvent;
    new(): BeforeUnloadEvent;
};

/**
 * A simple low-order filter, and is created using the AudioContext.createBiquadFilter() method. It is an AudioNode that can represent different kinds of filters, tone control devices, and graphic equalizers.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode)
 */
interface BiquadFilterNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode/Q) */
    readonly Q: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode/detune) */
    readonly detune: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode/frequency) */
    readonly frequency: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode/gain) */
    readonly gain: AudioParam;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode/type) */
    type: BiquadFilterType;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode/getFrequencyResponse) */
    getFrequencyResponse(frequencyHz: Float32Array, magResponse: Float32Array, phaseResponse: Float32Array): void;
}

declare var BiquadFilterNode: {
    prototype: BiquadFilterNode;
    new(context: BaseAudioContext, options?: BiquadFilterOptions): BiquadFilterNode;
};

/**
 * A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob)
 */
interface Blob {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/size) */
    readonly size: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/type) */
    readonly type: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/arrayBuffer) */
    arrayBuffer(): Promise<ArrayBuffer>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/slice) */
    slice(start?: number, end?: number, contentType?: string): Blob;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/stream) */
    stream(): ReadableStream<Uint8Array>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/text) */
    text(): Promise<string>;
}

declare var Blob: {
    prototype: Blob;
    new(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BlobEvent) */
interface BlobEvent extends Event {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BlobEvent/data) */
    readonly data: Blob;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BlobEvent/timecode) */
    readonly timecode: DOMHighResTimeStamp;
}

declare var BlobEvent: {
    prototype: BlobEvent;
    new(type: string, eventInitDict: BlobEventInit): BlobEvent;
};

interface Body {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/body) */
    readonly body: ReadableStream<Uint8Array> | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/bodyUsed) */
    readonly bodyUsed: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/arrayBuffer) */
    arrayBuffer(): Promise<ArrayBuffer>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/blob) */
    blob(): Promise<Blob>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/formData) */
    formData(): Promise<FormData>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/json) */
    json(): Promise<any>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/text) */
    text(): Promise<string>;
}

interface BroadcastChannelEventMap {
    "message": MessageEvent;
    "messageerror": MessageEvent;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel) */
interface BroadcastChannel extends EventTarget {
    /**
     * Returns the channel name (as passed to the constructor).
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/name)
     */
    readonly name: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/message_event) */
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/messageerror_event) */
    onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null;
    /**
     * Closes the BroadcastChannel object, opening it up to garbage collection.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/close)
     */
    close(): void;
    /**
     * Sends the given message to other BroadcastChannel objects set up for this channel. Messages can be structured objects, e.g. nested objects and arrays.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/postMessage)
     */
    postMessage(message: any): void;
    addEventListener<K extends keyof BroadcastChannelEventMap>(type: K, listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof BroadcastChannelEventMap>(type: K, listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var BroadcastChannel: {
    prototype: BroadcastChannel;
    new(name: string): BroadcastChannel;
};

/**
 * This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy)
 */
interface ByteLengthQueuingStrategy extends QueuingStrategy<ArrayBufferView> {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/highWaterMark) */
    readonly highWaterMark: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/size) */
    readonly size: QueuingStrategySize<ArrayBufferView>;
}

declare var ByteLengthQueuingStrategy: {
    prototype: ByteLengthQueuingStrategy;
    new(init: QueuingStrategyInit): ByteLengthQueuingStrategy;
};

/**
 * A CDATA section that can be used within XML to include extended portions of unescaped text. The symbols < and & don’t need escaping as they normally do when inside a CDATA section.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CDATASection)
 */
interface CDATASection extends Text {
}

declare var CDATASection: {
    prototype: CDATASection;
    new(): CDATASection;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation) */
interface CSSAnimation extends Animation {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation/animationName) */
    readonly animationName: string;
    addEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var CSSAnimation: {
    prototype: CSSAnimation;
    new(): CSSAnimation;
};

/**
 * A single condition CSS at-rule, which consists of a condition and a statement block. It is a child of CSSGroupingRule.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSConditionRule)
 */
interface CSSConditionRule extends CSSGroupingRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSConditionRule/conditionText) */
    readonly conditionText: string;
}

declare var CSSConditionRule: {
    prototype: CSSConditionRule;
    new(): CSSConditionRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSContainerRule) */
interface CSSContainerRule extends CSSConditionRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSContainerRule/containerName) */
    readonly containerName: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSContainerRule/containerQuery) */
    readonly containerQuery: string;
}

declare var CSSContainerRule: {
    prototype: CSSContainerRule;
    new(): CSSContainerRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule) */
interface CSSCounterStyleRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/additiveSymbols) */
    additiveSymbols: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/fallback) */
    fallback: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/name) */
    name: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/negative) */
    negative: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/pad) */
    pad: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/prefix) */
    prefix: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/range) */
    range: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/speakAs) */
    speakAs: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/suffix) */
    suffix: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/symbols) */
    symbols: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSCounterStyleRule/system) */
    system: string;
}

declare var CSSCounterStyleRule: {
    prototype: CSSCounterStyleRule;
    new(): CSSCounterStyleRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontFaceRule) */
interface CSSFontFaceRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontFaceRule/style) */
    readonly style: CSSStyleDeclaration;
}

declare var CSSFontFaceRule: {
    prototype: CSSFontFaceRule;
    new(): CSSFontFaceRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontFeatureValuesRule) */
interface CSSFontFeatureValuesRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontFeatureValuesRule/fontFamily) */
    fontFamily: string;
}

declare var CSSFontFeatureValuesRule: {
    prototype: CSSFontFeatureValuesRule;
    new(): CSSFontFeatureValuesRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontPaletteValuesRule) */
interface CSSFontPaletteValuesRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontPaletteValuesRule/basePalette) */
    readonly basePalette: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontPaletteValuesRule/fontFamily) */
    readonly fontFamily: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontPaletteValuesRule/name) */
    readonly name: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSFontPaletteValuesRule/overrideColors) */
    readonly overrideColors: string;
}

declare var CSSFontPaletteValuesRule: {
    prototype: CSSFontPaletteValuesRule;
    new(): CSSFontPaletteValuesRule;
};

/**
 * Any CSS at-rule that contains other rules nested within it.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule)
 */
interface CSSGroupingRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/cssRules) */
    readonly cssRules: CSSRuleList;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/deleteRule) */
    deleteRule(index: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/insertRule) */
    insertRule(rule: string, index?: number): number;
}

declare var CSSGroupingRule: {
    prototype: CSSGroupingRule;
    new(): CSSGroupingRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImageValue) */
interface CSSImageValue extends CSSStyleValue {
}

declare var CSSImageValue: {
    prototype: CSSImageValue;
    new(): CSSImageValue;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImportRule) */
interface CSSImportRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImportRule/href) */
    readonly href: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImportRule/layerName) */
    readonly layerName: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImportRule/media) */
    readonly media: MediaList;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImportRule/styleSheet) */
    readonly styleSheet: CSSStyleSheet | null;
}

declare var CSSImportRule: {
    prototype: CSSImportRule;
    new(): CSSImportRule;
};

/**
 * An object representing a set of style for a given keyframe. It corresponds to the contains of a single keyframe of a @keyframes at-rule. It implements the CSSRule interface with a type value of 8 (CSSRule.KEYFRAME_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframeRule)
 */
interface CSSKeyframeRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframeRule/keyText) */
    keyText: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframeRule/style) */
    readonly style: CSSStyleDeclaration;
}

declare var CSSKeyframeRule: {
    prototype: CSSKeyframeRule;
    new(): CSSKeyframeRule;
};

/**
 * An object representing a complete set of keyframes for a CSS animation. It corresponds to the contains of a whole @keyframes at-rule. It implements the CSSRule interface with a type value of 7 (CSSRule.KEYFRAMES_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframesRule)
 */
interface CSSKeyframesRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframesRule/cssRules) */
    readonly cssRules: CSSRuleList;
    readonly length: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframesRule/name) */
    name: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframesRule/appendRule) */
    appendRule(rule: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframesRule/deleteRule) */
    deleteRule(select: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeyframesRule/findRule) */
    findRule(select: string): CSSKeyframeRule | null;
    [index: number]: CSSKeyframeRule;
}

declare var CSSKeyframesRule: {
    prototype: CSSKeyframesRule;
    new(): CSSKeyframesRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeywordValue) */
interface CSSKeywordValue extends CSSStyleValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSKeywordValue/value) */
    value: string;
}

declare var CSSKeywordValue: {
    prototype: CSSKeywordValue;
    new(value: string): CSSKeywordValue;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSLayerBlockRule) */
interface CSSLayerBlockRule extends CSSGroupingRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSLayerBlockRule/name) */
    readonly name: string;
}

declare var CSSLayerBlockRule: {
    prototype: CSSLayerBlockRule;
    new(): CSSLayerBlockRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSLayerStatementRule) */
interface CSSLayerStatementRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSLayerStatementRule/nameList) */
    readonly nameList: ReadonlyArray<string>;
}

declare var CSSLayerStatementRule: {
    prototype: CSSLayerStatementRule;
    new(): CSSLayerStatementRule;
};

interface CSSMathClamp extends CSSMathValue {
    readonly lower: CSSNumericValue;
    readonly upper: CSSNumericValue;
    readonly value: CSSNumericValue;
}

declare var CSSMathClamp: {
    prototype: CSSMathClamp;
    new(lower: CSSNumberish, value: CSSNumberish, upper: CSSNumberish): CSSMathClamp;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathInvert) */
interface CSSMathInvert extends CSSMathValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathInvert/value) */
    readonly value: CSSNumericValue;
}

declare var CSSMathInvert: {
    prototype: CSSMathInvert;
    new(arg: CSSNumberish): CSSMathInvert;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathMax) */
interface CSSMathMax extends CSSMathValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathMax/values) */
    readonly values: CSSNumericArray;
}

declare var CSSMathMax: {
    prototype: CSSMathMax;
    new(...args: CSSNumberish[]): CSSMathMax;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathMin) */
interface CSSMathMin extends CSSMathValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathMin/values) */
    readonly values: CSSNumericArray;
}

declare var CSSMathMin: {
    prototype: CSSMathMin;
    new(...args: CSSNumberish[]): CSSMathMin;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathNegate) */
interface CSSMathNegate extends CSSMathValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathNegate/value) */
    readonly value: CSSNumericValue;
}

declare var CSSMathNegate: {
    prototype: CSSMathNegate;
    new(arg: CSSNumberish): CSSMathNegate;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathProduct) */
interface CSSMathProduct extends CSSMathValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathProduct/values) */
    readonly values: CSSNumericArray;
}

declare var CSSMathProduct: {
    prototype: CSSMathProduct;
    new(...args: CSSNumberish[]): CSSMathProduct;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathSum) */
interface CSSMathSum extends CSSMathValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathSum/values) */
    readonly values: CSSNumericArray;
}

declare var CSSMathSum: {
    prototype: CSSMathSum;
    new(...args: CSSNumberish[]): CSSMathSum;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathValue) */
interface CSSMathValue extends CSSNumericValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathValue/operator) */
    readonly operator: CSSMathOperator;
}

declare var CSSMathValue: {
    prototype: CSSMathValue;
    new(): CSSMathValue;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMatrixComponent) */
interface CSSMatrixComponent extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMatrixComponent/matrix) */
    matrix: DOMMatrix;
}

declare var CSSMatrixComponent: {
    prototype: CSSMatrixComponent;
    new(matrix: DOMMatrixReadOnly, options?: CSSMatrixComponentOptions): CSSMatrixComponent;
};

/**
 * A single CSS @media rule. It implements the CSSConditionRule interface, and therefore the CSSGroupingRule and the CSSRule interface with a type value of 4 (CSSRule.MEDIA_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMediaRule)
 */
interface CSSMediaRule extends CSSConditionRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMediaRule/media) */
    readonly media: MediaList;
}

declare var CSSMediaRule: {
    prototype: CSSMediaRule;
    new(): CSSMediaRule;
};

/**
 * An object representing a single CSS @namespace at-rule. It implements the CSSRule interface, with a type value of 10 (CSSRule.NAMESPACE_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNamespaceRule)
 */
interface CSSNamespaceRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNamespaceRule/namespaceURI) */
    readonly namespaceURI: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNamespaceRule/prefix) */
    readonly prefix: string;
}

declare var CSSNamespaceRule: {
    prototype: CSSNamespaceRule;
    new(): CSSNamespaceRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericArray) */
interface CSSNumericArray {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericArray/length) */
    readonly length: number;
    forEach(callbackfn: (value: CSSNumericValue, key: number, parent: CSSNumericArray) => void, thisArg?: any): void;
    [index: number]: CSSNumericValue;
}

declare var CSSNumericArray: {
    prototype: CSSNumericArray;
    new(): CSSNumericArray;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue) */
interface CSSNumericValue extends CSSStyleValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/add) */
    add(...values: CSSNumberish[]): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/div) */
    div(...values: CSSNumberish[]): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/equals) */
    equals(...value: CSSNumberish[]): boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/max) */
    max(...values: CSSNumberish[]): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/min) */
    min(...values: CSSNumberish[]): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/mul) */
    mul(...values: CSSNumberish[]): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/sub) */
    sub(...values: CSSNumberish[]): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/to) */
    to(unit: string): CSSUnitValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/toSum) */
    toSum(...units: string[]): CSSMathSum;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/type) */
    type(): CSSNumericType;
}

declare var CSSNumericValue: {
    prototype: CSSNumericValue;
    new(): CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/parse_static) */
    parse(cssText: string): CSSNumericValue;
};

/**
 * CSSPageRule is an interface representing a single CSS @page rule. It implements the CSSRule interface with a type value of 6 (CSSRule.PAGE_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPageRule)
 */
interface CSSPageRule extends CSSGroupingRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPageRule/selectorText) */
    selectorText: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPageRule/style) */
    readonly style: CSSStyleDeclaration;
}

declare var CSSPageRule: {
    prototype: CSSPageRule;
    new(): CSSPageRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPerspective) */
interface CSSPerspective extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPerspective/length) */
    length: CSSPerspectiveValue;
}

declare var CSSPerspective: {
    prototype: CSSPerspective;
    new(length: CSSPerspectiveValue): CSSPerspective;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPropertyRule) */
interface CSSPropertyRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPropertyRule/inherits) */
    readonly inherits: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPropertyRule/initialValue) */
    readonly initialValue: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPropertyRule/name) */
    readonly name: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSPropertyRule/syntax) */
    readonly syntax: string;
}

declare var CSSPropertyRule: {
    prototype: CSSPropertyRule;
    new(): CSSPropertyRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRotate) */
interface CSSRotate extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRotate/angle) */
    angle: CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRotate/x) */
    x: CSSNumberish;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRotate/y) */
    y: CSSNumberish;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRotate/z) */
    z: CSSNumberish;
}

declare var CSSRotate: {
    prototype: CSSRotate;
    new(angle: CSSNumericValue): CSSRotate;
    new(x: CSSNumberish, y: CSSNumberish, z: CSSNumberish, angle: CSSNumericValue): CSSRotate;
};

/**
 * A single CSS rule. There are several types of rules, listed in the Type constants section below.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRule)
 */
interface CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRule/cssText) */
    cssText: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRule/parentRule) */
    readonly parentRule: CSSRule | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRule/parentStyleSheet) */
    readonly parentStyleSheet: CSSStyleSheet | null;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRule/type)
     */
    readonly type: number;
    readonly STYLE_RULE: 1;
    readonly CHARSET_RULE: 2;
    readonly IMPORT_RULE: 3;
    readonly MEDIA_RULE: 4;
    readonly FONT_FACE_RULE: 5;
    readonly PAGE_RULE: 6;
    readonly NAMESPACE_RULE: 10;
    readonly KEYFRAMES_RULE: 7;
    readonly KEYFRAME_RULE: 8;
    readonly SUPPORTS_RULE: 12;
}

declare var CSSRule: {
    prototype: CSSRule;
    new(): CSSRule;
    readonly STYLE_RULE: 1;
    readonly CHARSET_RULE: 2;
    readonly IMPORT_RULE: 3;
    readonly MEDIA_RULE: 4;
    readonly FONT_FACE_RULE: 5;
    readonly PAGE_RULE: 6;
    readonly NAMESPACE_RULE: 10;
    readonly KEYFRAMES_RULE: 7;
    readonly KEYFRAME_RULE: 8;
    readonly SUPPORTS_RULE: 12;
};

/**
 * A CSSRuleList is an (indirect-modify only) array-like object containing an ordered collection of CSSRule objects.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRuleList)
 */
interface CSSRuleList {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRuleList/length) */
    readonly length: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSRuleList/item) */
    item(index: number): CSSRule | null;
    [index: number]: CSSRule;
}

declare var CSSRuleList: {
    prototype: CSSRuleList;
    new(): CSSRuleList;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSScale) */
interface CSSScale extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSScale/x) */
    x: CSSNumberish;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSScale/y) */
    y: CSSNumberish;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSScale/z) */
    z: CSSNumberish;
}

declare var CSSScale: {
    prototype: CSSScale;
    new(x: CSSNumberish, y: CSSNumberish, z?: CSSNumberish): CSSScale;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkew) */
interface CSSSkew extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkew/ax) */
    ax: CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkew/ay) */
    ay: CSSNumericValue;
}

declare var CSSSkew: {
    prototype: CSSSkew;
    new(ax: CSSNumericValue, ay: CSSNumericValue): CSSSkew;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkewX) */
interface CSSSkewX extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkewX/ax) */
    ax: CSSNumericValue;
}

declare var CSSSkewX: {
    prototype: CSSSkewX;
    new(ax: CSSNumericValue): CSSSkewX;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkewY) */
interface CSSSkewY extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSkewY/ay) */
    ay: CSSNumericValue;
}

declare var CSSSkewY: {
    prototype: CSSSkewY;
    new(ay: CSSNumericValue): CSSSkewY;
};

/**
 * An object that is a CSS declaration block, and exposes style information and various style-related methods and properties.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration)
 */
interface CSSStyleDeclaration {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/accent-color) */
    accentColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-content) */
    alignContent: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-items) */
    alignItems: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-self) */
    alignSelf: string;
    alignmentBaseline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/all) */
    all: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation) */
    animation: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-composition) */
    animationComposition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-delay) */
    animationDelay: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-direction) */
    animationDirection: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-duration) */
    animationDuration: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode) */
    animationFillMode: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count) */
    animationIterationCount: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-name) */
    animationName: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-play-state) */
    animationPlayState: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-timing-function) */
    animationTimingFunction: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/appearance) */
    appearance: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/aspect-ratio) */
    aspectRatio: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) */
    backdropFilter: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/backface-visibility) */
    backfaceVisibility: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background) */
    background: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-attachment) */
    backgroundAttachment: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-blend-mode) */
    backgroundBlendMode: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-clip) */
    backgroundClip: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-color) */
    backgroundColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-image) */
    backgroundImage: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-origin) */
    backgroundOrigin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-position) */
    backgroundPosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-position-x) */
    backgroundPositionX: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-position-y) */
    backgroundPositionY: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-repeat) */
    backgroundRepeat: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-size) */
    backgroundSize: string;
    baselineShift: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/block-size) */
    blockSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border) */
    border: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block) */
    borderBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-color) */
    borderBlockColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end) */
    borderBlockEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end-color) */
    borderBlockEndColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end-style) */
    borderBlockEndStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end-width) */
    borderBlockEndWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start) */
    borderBlockStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start-color) */
    borderBlockStartColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start-style) */
    borderBlockStartStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start-width) */
    borderBlockStartWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-style) */
    borderBlockStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-width) */
    borderBlockWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom) */
    borderBottom: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-color) */
    borderBottomColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius) */
    borderBottomLeftRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-right-radius) */
    borderBottomRightRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-style) */
    borderBottomStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-width) */
    borderBottomWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-collapse) */
    borderCollapse: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-color) */
    borderColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-end-end-radius) */
    borderEndEndRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-end-start-radius) */
    borderEndStartRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image) */
    borderImage: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-outset) */
    borderImageOutset: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-repeat) */
    borderImageRepeat: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-slice) */
    borderImageSlice: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-source) */
    borderImageSource: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-width) */
    borderImageWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline) */
    borderInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-color) */
    borderInlineColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end) */
    borderInlineEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end-color) */
    borderInlineEndColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end-style) */
    borderInlineEndStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end-width) */
    borderInlineEndWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start) */
    borderInlineStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start-color) */
    borderInlineStartColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start-style) */
    borderInlineStartStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start-width) */
    borderInlineStartWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-style) */
    borderInlineStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-width) */
    borderInlineWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left) */
    borderLeft: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left-color) */
    borderLeftColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left-style) */
    borderLeftStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left-width) */
    borderLeftWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-radius) */
    borderRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right) */
    borderRight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right-color) */
    borderRightColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right-style) */
    borderRightStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right-width) */
    borderRightWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-spacing) */
    borderSpacing: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-start-end-radius) */
    borderStartEndRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-start-start-radius) */
    borderStartStartRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-style) */
    borderStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top) */
    borderTop: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-color) */
    borderTopColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-left-radius) */
    borderTopLeftRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-right-radius) */
    borderTopRightRadius: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-style) */
    borderTopStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-width) */
    borderTopWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-width) */
    borderWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/bottom) */
    bottom: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-shadow) */
    boxShadow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-sizing) */
    boxSizing: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/break-after) */
    breakAfter: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/break-before) */
    breakBefore: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/break-inside) */
    breakInside: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/caption-side) */
    captionSide: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/caret-color) */
    caretColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clear) */
    clear: string;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clip)
     */
    clip: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clip-path) */
    clipPath: string;
    clipRule: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color) */
    color: string;
    colorInterpolation: string;
    colorInterpolationFilters: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color-scheme) */
    colorScheme: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-count) */
    columnCount: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-fill) */
    columnFill: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-gap) */
    columnGap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule) */
    columnRule: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule-color) */
    columnRuleColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule-style) */
    columnRuleStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule-width) */
    columnRuleWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-span) */
    columnSpan: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-width) */
    columnWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/columns) */
    columns: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain) */
    contain: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-contain-intrinsic-block-size) */
    containIntrinsicBlockSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-height) */
    containIntrinsicHeight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-contain-intrinsic-inline-size) */
    containIntrinsicInlineSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-size) */
    containIntrinsicSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-width) */
    containIntrinsicWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/container) */
    container: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/container-name) */
    containerName: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/container-type) */
    containerType: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/content) */
    content: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/counter-increment) */
    counterIncrement: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/counter-reset) */
    counterReset: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/counter-set) */
    counterSet: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/cssFloat) */
    cssFloat: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/cssText) */
    cssText: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/cursor) */
    cursor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/direction) */
    direction: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/display) */
    display: string;
    dominantBaseline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/empty-cells) */
    emptyCells: string;
    fill: string;
    fillOpacity: string;
    fillRule: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/filter) */
    filter: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex) */
    flex: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-basis) */
    flexBasis: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-direction) */
    flexDirection: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-flow) */
    flexFlow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-grow) */
    flexGrow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-shrink) */
    flexShrink: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-wrap) */
    flexWrap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/float) */
    float: string;
    floodColor: string;
    floodOpacity: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font) */
    font: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-family) */
    fontFamily: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-feature-settings) */
    fontFeatureSettings: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-kerning) */
    fontKerning: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-optical-sizing) */
    fontOpticalSizing: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-palette) */
    fontPalette: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-size) */
    fontSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-size-adjust) */
    fontSizeAdjust: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-stretch) */
    fontStretch: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-style) */
    fontStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis) */
    fontSynthesis: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis-small-caps) */
    fontSynthesisSmallCaps: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis-style) */
    fontSynthesisStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis-weight) */
    fontSynthesisWeight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant) */
    fontVariant: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-alternates) */
    fontVariantAlternates: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-caps) */
    fontVariantCaps: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-east-asian) */
    fontVariantEastAsian: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-ligatures) */
    fontVariantLigatures: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric) */
    fontVariantNumeric: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-position) */
    fontVariantPosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variation-settings) */
    fontVariationSettings: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-weight) */
    fontWeight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/forced-color-adjust) */
    forcedColorAdjust: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/gap) */
    gap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid) */
    grid: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-area) */
    gridArea: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-auto-columns) */
    gridAutoColumns: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow) */
    gridAutoFlow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-auto-rows) */
    gridAutoRows: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-column) */
    gridColumn: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-column-end) */
    gridColumnEnd: string;
    /** @deprecated This is a legacy alias of `columnGap`. */
    gridColumnGap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-column-start) */
    gridColumnStart: string;
    /** @deprecated This is a legacy alias of `gap`. */
    gridGap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-row) */
    gridRow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-row-end) */
    gridRowEnd: string;
    /** @deprecated This is a legacy alias of `rowGap`. */
    gridRowGap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-row-start) */
    gridRowStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template) */
    gridTemplate: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template-areas) */
    gridTemplateAreas: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template-columns) */
    gridTemplateColumns: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template-rows) */
    gridTemplateRows: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/height) */
    height: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/hyphenate-character) */
    hyphenateCharacter: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/hyphens) */
    hyphens: string;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/image-orientation)
     */
    imageOrientation: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/image-rendering) */
    imageRendering: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inline-size) */
    inlineSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset) */
    inset: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-block) */
    insetBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-block-end) */
    insetBlockEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-block-start) */
    insetBlockStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-inline) */
    insetInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-inline-end) */
    insetInlineEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-inline-start) */
    insetInlineStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/isolation) */
    isolation: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-content) */
    justifyContent: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-items) */
    justifyItems: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-self) */
    justifySelf: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/left) */
    left: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/length) */
    readonly length: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/letter-spacing) */
    letterSpacing: string;
    lightingColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/line-break) */
    lineBreak: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/line-height) */
    lineHeight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style) */
    listStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style-image) */
    listStyleImage: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style-position) */
    listStylePosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style-type) */
    listStyleType: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin) */
    margin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-block) */
    marginBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-block-end) */
    marginBlockEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-block-start) */
    marginBlockStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-bottom) */
    marginBottom: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-inline) */
    marginInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-inline-end) */
    marginInlineEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-inline-start) */
    marginInlineStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-left) */
    marginLeft: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-right) */
    marginRight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-top) */
    marginTop: string;
    marker: string;
    markerEnd: string;
    markerMid: string;
    markerStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask) */
    mask: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-clip) */
    maskClip: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-composite) */
    maskComposite: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-image) */
    maskImage: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-mode) */
    maskMode: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-origin) */
    maskOrigin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-position) */
    maskPosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-repeat) */
    maskRepeat: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-size) */
    maskSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-type) */
    maskType: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/math-style) */
    mathStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-block-size) */
    maxBlockSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-height) */
    maxHeight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-inline-size) */
    maxInlineSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-width) */
    maxWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-block-size) */
    minBlockSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-height) */
    minHeight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-inline-size) */
    minInlineSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-width) */
    minWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode) */
    mixBlendMode: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/object-fit) */
    objectFit: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/object-position) */
    objectPosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset) */
    offset: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-distance) */
    offsetDistance: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-path) */
    offsetPath: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-rotate) */
    offsetRotate: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/opacity) */
    opacity: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/order) */
    order: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/orphans) */
    orphans: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline) */
    outline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-color) */
    outlineColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-offset) */
    outlineOffset: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-style) */
    outlineStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-width) */
    outlineWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow) */
    overflow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-anchor) */
    overflowAnchor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-clip-margin) */
    overflowClipMargin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-wrap) */
    overflowWrap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-x) */
    overflowX: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-y) */
    overflowY: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior) */
    overscrollBehavior: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-block) */
    overscrollBehaviorBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-inline) */
    overscrollBehaviorInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-x) */
    overscrollBehaviorX: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-y) */
    overscrollBehaviorY: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding) */
    padding: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-block) */
    paddingBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-block-end) */
    paddingBlockEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-block-start) */
    paddingBlockStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-bottom) */
    paddingBottom: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-inline) */
    paddingInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-inline-end) */
    paddingInlineEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-inline-start) */
    paddingInlineStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-left) */
    paddingLeft: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-right) */
    paddingRight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-top) */
    paddingTop: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page) */
    page: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page-break-after) */
    pageBreakAfter: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page-break-before) */
    pageBreakBefore: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page-break-inside) */
    pageBreakInside: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/paint-order) */
    paintOrder: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/parentRule) */
    readonly parentRule: CSSRule | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective) */
    perspective: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective-origin) */
    perspectiveOrigin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/place-content) */
    placeContent: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/place-items) */
    placeItems: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/place-self) */
    placeSelf: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/pointer-events) */
    pointerEvents: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/position) */
    position: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/print-color-adjust) */
    printColorAdjust: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/quotes) */
    quotes: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/resize) */
    resize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/right) */
    right: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/rotate) */
    rotate: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/row-gap) */
    rowGap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/ruby-position) */
    rubyPosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scale) */
    scale: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-behavior) */
    scrollBehavior: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin) */
    scrollMargin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block) */
    scrollMarginBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-end) */
    scrollMarginBlockEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-start) */
    scrollMarginBlockStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-bottom) */
    scrollMarginBottom: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline) */
    scrollMarginInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-end) */
    scrollMarginInlineEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-start) */
    scrollMarginInlineStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-left) */
    scrollMarginLeft: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-right) */
    scrollMarginRight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-top) */
    scrollMarginTop: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding) */
    scrollPadding: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block) */
    scrollPaddingBlock: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-end) */
    scrollPaddingBlockEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-start) */
    scrollPaddingBlockStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-bottom) */
    scrollPaddingBottom: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline) */
    scrollPaddingInline: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-end) */
    scrollPaddingInlineEnd: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-start) */
    scrollPaddingInlineStart: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-left) */
    scrollPaddingLeft: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-right) */
    scrollPaddingRight: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-top) */
    scrollPaddingTop: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-align) */
    scrollSnapAlign: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-stop) */
    scrollSnapStop: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type) */
    scrollSnapType: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scrollbar-gutter) */
    scrollbarGutter: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-image-threshold) */
    shapeImageThreshold: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-margin) */
    shapeMargin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-outside) */
    shapeOutside: string;
    shapeRendering: string;
    stopColor: string;
    stopOpacity: string;
    stroke: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeOpacity: string;
    strokeWidth: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/tab-size) */
    tabSize: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/table-layout) */
    tableLayout: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-align) */
    textAlign: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-align-last) */
    textAlignLast: string;
    textAnchor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-combine-upright) */
    textCombineUpright: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration) */
    textDecoration: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-color) */
    textDecorationColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-line) */
    textDecorationLine: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip-ink) */
    textDecorationSkipInk: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-style) */
    textDecorationStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-thickness) */
    textDecorationThickness: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis) */
    textEmphasis: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis-color) */
    textEmphasisColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis-position) */
    textEmphasisPosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis-style) */
    textEmphasisStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-indent) */
    textIndent: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-orientation) */
    textOrientation: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-overflow) */
    textOverflow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-rendering) */
    textRendering: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-shadow) */
    textShadow: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-transform) */
    textTransform: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-underline-offset) */
    textUnderlineOffset: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-underline-position) */
    textUnderlinePosition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/top) */
    top: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/touch-action) */
    touchAction: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform) */
    transform: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-box) */
    transformBox: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-origin) */
    transformOrigin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-style) */
    transformStyle: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition) */
    transition: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-delay) */
    transitionDelay: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-duration) */
    transitionDuration: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-property) */
    transitionProperty: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-timing-function) */
    transitionTimingFunction: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/translate) */
    translate: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/unicode-bidi) */
    unicodeBidi: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/user-select) */
    userSelect: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/vertical-align) */
    verticalAlign: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/visibility) */
    visibility: string;
    /**
     * @deprecated This is a legacy alias of `alignContent`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-content)
     */
    webkitAlignContent: string;
    /**
     * @deprecated This is a legacy alias of `alignItems`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-items)
     */
    webkitAlignItems: string;
    /**
     * @deprecated This is a legacy alias of `alignSelf`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-self)
     */
    webkitAlignSelf: string;
    /**
     * @deprecated This is a legacy alias of `animation`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation)
     */
    webkitAnimation: string;
    /**
     * @deprecated This is a legacy alias of `animationDelay`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-delay)
     */
    webkitAnimationDelay: string;
    /**
     * @deprecated This is a legacy alias of `animationDirection`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-direction)
     */
    webkitAnimationDirection: string;
    /**
     * @deprecated This is a legacy alias of `animationDuration`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-duration)
     */
    webkitAnimationDuration: string;
    /**
     * @deprecated This is a legacy alias of `animationFillMode`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode)
     */
    webkitAnimationFillMode: string;
    /**
     * @deprecated This is a legacy alias of `animationIterationCount`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count)
     */
    webkitAnimationIterationCount: string;
    /**
     * @deprecated This is a legacy alias of `animationName`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-name)
     */
    webkitAnimationName: string;
    /**
     * @deprecated This is a legacy alias of `animationPlayState`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-play-state)
     */
    webkitAnimationPlayState: string;
    /**
     * @deprecated This is a legacy alias of `animationTimingFunction`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-timing-function)
     */
    webkitAnimationTimingFunction: string;
    /**
     * @deprecated This is a legacy alias of `appearance`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/appearance)
     */
    webkitAppearance: string;
    /**
     * @deprecated This is a legacy alias of `backfaceVisibility`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/backface-visibility)
     */
    webkitBackfaceVisibility: string;
    /**
     * @deprecated This is a legacy alias of `backgroundClip`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-clip)
     */
    webkitBackgroundClip: string;
    /**
     * @deprecated This is a legacy alias of `backgroundOrigin`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-origin)
     */
    webkitBackgroundOrigin: string;
    /**
     * @deprecated This is a legacy alias of `backgroundSize`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-size)
     */
    webkitBackgroundSize: string;
    /**
     * @deprecated This is a legacy alias of `borderBottomLeftRadius`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius)
     */
    webkitBorderBottomLeftRadius: string;
    /**
     * @deprecated This is a legacy alias of `borderBottomRightRadius`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-right-radius)
     */
    webkitBorderBottomRightRadius: string;
    /**
     * @deprecated This is a legacy alias of `borderRadius`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-radius)
     */
    webkitBorderRadius: string;
    /**
     * @deprecated This is a legacy alias of `borderTopLeftRadius`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-left-radius)
     */
    webkitBorderTopLeftRadius: string;
    /**
     * @deprecated This is a legacy alias of `borderTopRightRadius`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-right-radius)
     */
    webkitBorderTopRightRadius: string;
    /**
     * @deprecated This is a legacy alias of `boxAlign`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-align)
     */
    webkitBoxAlign: string;
    /**
     * @deprecated This is a legacy alias of `boxFlex`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-flex)
     */
    webkitBoxFlex: string;
    /**
     * @deprecated This is a legacy alias of `boxOrdinalGroup`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-ordinal-group)
     */
    webkitBoxOrdinalGroup: string;
    /**
     * @deprecated This is a legacy alias of `boxOrient`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-orient)
     */
    webkitBoxOrient: string;
    /**
     * @deprecated This is a legacy alias of `boxPack`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-pack)
     */
    webkitBoxPack: string;
    /**
     * @deprecated This is a legacy alias of `boxShadow`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-shadow)
     */
    webkitBoxShadow: string;
    /**
     * @deprecated This is a legacy alias of `boxSizing`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-sizing)
     */
    webkitBoxSizing: string;
    /**
     * @deprecated This is a legacy alias of `filter`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/filter)
     */
    webkitFilter: string;
    /**
     * @deprecated This is a legacy alias of `flex`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex)
     */
    webkitFlex: string;
    /**
     * @deprecated This is a legacy alias of `flexBasis`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
     */
    webkitFlexBasis: string;
    /**
     * @deprecated This is a legacy alias of `flexDirection`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
     */
    webkitFlexDirection: string;
    /**
     * @deprecated This is a legacy alias of `flexFlow`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
     */
    webkitFlexFlow: string;
    /**
     * @deprecated This is a legacy alias of `flexGrow`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
     */
    webkitFlexGrow: string;
    /**
     * @deprecated This is a legacy alias of `flexShrink`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
     */
    webkitFlexShrink: string;
    /**
     * @deprecated This is a legacy alias of `flexWrap`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
     */
    webkitFlexWrap: string;
    /**
     * @deprecated This is a legacy alias of `justifyContent`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-content)
     */
    webkitJustifyContent: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-line-clamp) */
    webkitLineClamp: string;
    /**
     * @deprecated This is a legacy alias of `mask`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask)
     */
    webkitMask: string;
    /**
     * @deprecated This is a legacy alias of `maskBorder`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border)
     */
    webkitMaskBoxImage: string;
    /**
     * @deprecated This is a legacy alias of `maskBorderOutset`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-outset)
     */
    webkitMaskBoxImageOutset: string;
    /**
     * @deprecated This is a legacy alias of `maskBorderRepeat`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-repeat)
     */
    webkitMaskBoxImageRepeat: string;
    /**
     * @deprecated This is a legacy alias of `maskBorderSlice`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-slice)
     */
    webkitMaskBoxImageSlice: string;
    /**
     * @deprecated This is a legacy alias of `maskBorderSource`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-source)
     */
    webkitMaskBoxImageSource: string;
    /**
     * @deprecated This is a legacy alias of `maskBorderWidth`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-width)
     */
    webkitMaskBoxImageWidth: string;
    /**
     * @deprecated This is a legacy alias of `maskClip`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-clip)
     */
    webkitMaskClip: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-mask-composite) */
    webkitMaskComposite: string;
    /**
     * @deprecated This is a legacy alias of `maskImage`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-image)
     */
    webkitMaskImage: string;
    /**
     * @deprecated This is a legacy alias of `maskOrigin`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-origin)
     */
    webkitMaskOrigin: string;
    /**
     * @deprecated This is a legacy alias of `maskPosition`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-position)
     */
    webkitMaskPosition: string;
    /**
     * @deprecated This is a legacy alias of `maskRepeat`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-repeat)
     */
    webkitMaskRepeat: string;
    /**
     * @deprecated This is a legacy alias of `maskSize`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-size)
     */
    webkitMaskSize: string;
    /**
     * @deprecated This is a legacy alias of `order`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/order)
     */
    webkitOrder: string;
    /**
     * @deprecated This is a legacy alias of `perspective`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective)
     */
    webkitPerspective: string;
    /**
     * @deprecated This is a legacy alias of `perspectiveOrigin`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective-origin)
     */
    webkitPerspectiveOrigin: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-fill-color) */
    webkitTextFillColor: string;
    /**
     * @deprecated This is a legacy alias of `textSizeAdjust`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-size-adjust)
     */
    webkitTextSizeAdjust: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke) */
    webkitTextStroke: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke-color) */
    webkitTextStrokeColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke-width) */
    webkitTextStrokeWidth: string;
    /**
     * @deprecated This is a legacy alias of `transform`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform)
     */
    webkitTransform: string;
    /**
     * @deprecated This is a legacy alias of `transformOrigin`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-origin)
     */
    webkitTransformOrigin: string;
    /**
     * @deprecated This is a legacy alias of `transformStyle`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-style)
     */
    webkitTransformStyle: string;
    /**
     * @deprecated This is a legacy alias of `transition`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition)
     */
    webkitTransition: string;
    /**
     * @deprecated This is a legacy alias of `transitionDelay`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-delay)
     */
    webkitTransitionDelay: string;
    /**
     * @deprecated This is a legacy alias of `transitionDuration`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-duration)
     */
    webkitTransitionDuration: string;
    /**
     * @deprecated This is a legacy alias of `transitionProperty`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-property)
     */
    webkitTransitionProperty: string;
    /**
     * @deprecated This is a legacy alias of `transitionTimingFunction`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-timing-function)
     */
    webkitTransitionTimingFunction: string;
    /**
     * @deprecated This is a legacy alias of `userSelect`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/user-select)
     */
    webkitUserSelect: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/white-space) */
    whiteSpace: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/widows) */
    widows: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/width) */
    width: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/will-change) */
    willChange: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/word-break) */
    wordBreak: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/word-spacing) */
    wordSpacing: string;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-wrap)
     */
    wordWrap: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/writing-mode) */
    writingMode: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/z-index) */
    zIndex: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/getPropertyPriority) */
    getPropertyPriority(property: string): string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/getPropertyValue) */
    getPropertyValue(property: string): string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/item) */
    item(index: number): string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/removeProperty) */
    removeProperty(property: string): string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/setProperty) */
    setProperty(property: string, value: string | null, priority?: string): void;
    [index: number]: string;
}

declare var CSSStyleDeclaration: {
    prototype: CSSStyleDeclaration;
    new(): CSSStyleDeclaration;
};

/**
 * CSSStyleRule represents a single CSS style rule. It implements the CSSRule interface with a type value of 1 (CSSRule.STYLE_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleRule)
 */
interface CSSStyleRule extends CSSRule {
    readonly cssRules: CSSRuleList;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleRule/selectorText) */
    selectorText: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleRule/style) */
    readonly style: CSSStyleDeclaration;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleRule/styleMap) */
    readonly styleMap: StylePropertyMap;
    deleteRule(index: number): void;
    insertRule(rule: string, index?: number): number;
}

declare var CSSStyleRule: {
    prototype: CSSStyleRule;
    new(): CSSStyleRule;
};

/**
 * A single CSS style sheet. It inherits properties and methods from its parent, StyleSheet.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet)
 */
interface CSSStyleSheet extends StyleSheet {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/cssRules) */
    readonly cssRules: CSSRuleList;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/ownerRule) */
    readonly ownerRule: CSSRule | null;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/rules)
     */
    readonly rules: CSSRuleList;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/addRule)
     */
    addRule(selector?: string, style?: string, index?: number): number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/deleteRule) */
    deleteRule(index: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/insertRule) */
    insertRule(rule: string, index?: number): number;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/removeRule)
     */
    removeRule(index?: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/replace) */
    replace(text: string): Promise<CSSStyleSheet>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/replaceSync) */
    replaceSync(text: string): void;
}

declare var CSSStyleSheet: {
    prototype: CSSStyleSheet;
    new(options?: CSSStyleSheetInit): CSSStyleSheet;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleValue) */
interface CSSStyleValue {
    toString(): string;
}

declare var CSSStyleValue: {
    prototype: CSSStyleValue;
    new(): CSSStyleValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleValue/parse_static) */
    parse(property: string, cssText: string): CSSStyleValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleValue/parseAll_static) */
    parseAll(property: string, cssText: string): CSSStyleValue[];
};

/**
 * An object representing a single CSS @supports at-rule. It implements the CSSConditionRule interface, and therefore the CSSRule and CSSGroupingRule interfaces with a type value of 12 (CSSRule.SUPPORTS_RULE).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSSupportsRule)
 */
interface CSSSupportsRule extends CSSConditionRule {
}

declare var CSSSupportsRule: {
    prototype: CSSSupportsRule;
    new(): CSSSupportsRule;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformComponent) */
interface CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformComponent/is2D) */
    is2D: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformComponent/toMatrix) */
    toMatrix(): DOMMatrix;
    toString(): string;
}

declare var CSSTransformComponent: {
    prototype: CSSTransformComponent;
    new(): CSSTransformComponent;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformValue) */
interface CSSTransformValue extends CSSStyleValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformValue/is2D) */
    readonly is2D: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformValue/length) */
    readonly length: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransformValue/toMatrix) */
    toMatrix(): DOMMatrix;
    forEach(callbackfn: (value: CSSTransformComponent, key: number, parent: CSSTransformValue) => void, thisArg?: any): void;
    [index: number]: CSSTransformComponent;
}

declare var CSSTransformValue: {
    prototype: CSSTransformValue;
    new(transforms: CSSTransformComponent[]): CSSTransformValue;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransition) */
interface CSSTransition extends Animation {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransition/transitionProperty) */
    readonly transitionProperty: string;
    addEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSTransition, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSTransition, ev: AnimationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var CSSTransition: {
    prototype: CSSTransition;
    new(): CSSTransition;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTranslate) */
interface CSSTranslate extends CSSTransformComponent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTranslate/x) */
    x: CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTranslate/y) */
    y: CSSNumericValue;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTranslate/z) */
    z: CSSNumericValue;
}

declare var CSSTranslate: {
    prototype: CSSTranslate;
    new(x: CSSNumericValue, y: CSSNumericValue, z?: CSSNumericValue): CSSTranslate;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSUnitValue) */
interface CSSUnitValue extends CSSNumericValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSUnitValue/unit) */
    readonly unit: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSUnitValue/value) */
    value: number;
}

declare var CSSUnitValue: {
    prototype: CSSUnitValue;
    new(value: number, unit: string): CSSUnitValue;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSUnparsedValue) */
interface CSSUnparsedValue extends CSSStyleValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSUnparsedValue/length) */
    readonly length: number;
    forEach(callbackfn: (value: CSSUnparsedSegment, key: number, parent: CSSUnparsedValue) => void, thisArg?: any): void;
    [index: number]: CSSUnparsedSegment;
}

declare var CSSUnparsedValue: {
    prototype: CSSUnparsedValue;
    new(members: CSSUnparsedSegment[]): CSSUnparsedValue;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSVariableReferenceValue) */
interface CSSVariableReferenceValue {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSVariableReferenceValue/fallback) */
    readonly fallback: CSSUnparsedValue | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSVariableReferenceValue/variable) */
    variable: string;
}

declare var CSSVariableReferenceValue: {
    prototype: CSSVariableReferenceValue;
    new(variable: string, fallback?: CSSUnparsedValue | null): CSSVariableReferenceValue;
};

/**
 * Provides a storage mechanism for Request / Response object pairs that are cached, for example as part of the ServiceWorker life cycle. Note that the Cache interface is exposed to windowed scopes as well as workers. You don't have to use it in conjunction with service workers, even though it is defined in the service worker spec.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache)
 */
interface Cache {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/add) */
    add(request: RequestInfo | URL): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/addAll) */
    addAll(requests: RequestInfo[]): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/delete) */
    delete(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<boolean>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/keys) */
    keys(request?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/match) */
    match(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<Response | undefined>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/matchAll) */
    matchAll(request?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Response>>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/put) */
    put(request: RequestInfo | URL, response: Response): Promise<void>;
}

declare var Cache: {
    prototype: Cache;
    new(): Cache;
};

/**
 * The storage for Cache objects.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage)
 */
interface CacheStorage {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/delete) */
    delete(cacheName: string): Promise<boolean>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/has) */
    has(cacheName: string): Promise<boolean>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/keys) */
    keys(): Promise<string[]>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/match) */
    match(request: RequestInfo | URL, options?: MultiCacheQueryOptions): Promise<Response | undefined>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/open) */
    open(cacheName: string): Promise<Cache>;
}

declare var CacheStorage: {
    prototype: CacheStorage;
    new(): CacheStorage;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasCaptureMediaStreamTrack) */
interface CanvasCaptureMediaStreamTrack extends MediaStreamTrack {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasCaptureMediaStreamTrack/canvas) */
    readonly canvas: HTMLCanvasElement;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasCaptureMediaStreamTrack/requestFrame) */
    requestFrame(): void;
    addEventListener<K extends keyof MediaStreamTrackEventMap>(type: K, listener: (this: CanvasCaptureMediaStreamTrack, ev: MediaStreamTrackEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof MediaStreamTrackEventMap>(type: K, listener: (this: CanvasCaptureMediaStreamTrack, ev: MediaStreamTrackEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var CanvasCaptureMediaStreamTrack: {
    prototype: CanvasCaptureMediaStreamTrack;
    new(): CanvasCaptureMediaStreamTrack;
};

interface CanvasCompositing {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalAlpha) */
    globalAlpha: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) */
    globalCompositeOperation: GlobalCompositeOperation;
}

interface CanvasDrawImage {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawImage) */
    drawImage(image: CanvasImageSource, dx: number, dy: number): void;
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
}

interface CanvasDrawPath {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/beginPath) */
    beginPath(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clip) */
    clip(fillRule?: CanvasFillRule): void;
    clip(path: Path2D, fillRule?: CanvasFillRule): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fill) */
    fill(fillRule?: CanvasFillRule): void;
    fill(path: Path2D, fillRule?: CanvasFillRule): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInPath) */
    isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
    isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInStroke) */
    isPointInStroke(x: number, y: number): boolean;
    isPointInStroke(path: Path2D, x: number, y: number): boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/stroke) */
    stroke(): void;
    stroke(path: Path2D): void;
}

interface CanvasFillStrokeStyles {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillStyle) */
    fillStyle: string | CanvasGradient | CanvasPattern;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeStyle) */
    strokeStyle: string | CanvasGradient | CanvasPattern;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createConicGradient) */
    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createLinearGradient) */
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createPattern) */
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createRadialGradient) */
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
}

interface CanvasFilters {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/filter) */
    filter: string;
}

/**
 * An opaque object describing a gradient. It is returned by the methods CanvasRenderingContext2D.createLinearGradient() or CanvasRenderingContext2D.createRadialGradient().
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasGradient)
 */
interface CanvasGradient {
    /**
     * Adds a color stop with the given color to the gradient at the given offset. 0.0 is the offset at one end of the gradient, 1.0 is the offset at the other end.
     *
     * Throws an "IndexSizeError" DOMException if the offset is out of range. Throws a "SyntaxError" DOMException if the color cannot be parsed.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasGradient/addColorStop)
     */
    addColorStop(offset: number, color: string): void;
}

declare var CanvasGradient: {
    prototype: CanvasGradient;
    new(): CanvasGradient;
};

interface CanvasImageData {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createImageData) */
    createImageData(sw: number, sh: number, settings?: ImageDataSettings): ImageData;
    createImageData(imagedata: ImageData): ImageData;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getImageData) */
    getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/putImageData) */
    putImageData(imagedata: ImageData, dx: number, dy: number): void;
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
}

interface CanvasImageSmoothing {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) */
    imageSmoothingEnabled: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality) */
    imageSmoothingQuality: ImageSmoothingQuality;
}

interface CanvasPath {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arc) */
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arcTo) */
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo) */
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/closePath) */
    closePath(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/ellipse) */
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineTo) */
    lineTo(x: number, y: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/moveTo) */
    moveTo(x: number, y: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo) */
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rect) */
    rect(x: number, y: number, w: number, h: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/roundRect) */
    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]): void;
}

interface CanvasPathDrawingStyles {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineCap) */
    lineCap: CanvasLineCap;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineDashOffset) */
    lineDashOffset: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineJoin) */
    lineJoin: CanvasLineJoin;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineWidth) */
    lineWidth: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/miterLimit) */
    miterLimit: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getLineDash) */
    getLineDash(): number[];
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash) */
    setLineDash(segments: number[]): void;
}

/**
 * An opaque object describing a pattern, based on an image, a canvas, or a video, created by the CanvasRenderingContext2D.createPattern() method.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasPattern)
 */
interface CanvasPattern {
    /**
     * Sets the transformation matrix that will be used when rendering the pattern during a fill or stroke painting operation.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasPattern/setTransform)
     */
    setTransform(transform?: DOMMatrix2DInit): void;
}

declare var CanvasPattern: {
    prototype: CanvasPattern;
    new(): CanvasPattern;
};

interface CanvasRect {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clearRect) */
    clearRect(x: number, y: number, w: number, h: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillRect) */
    fillRect(x: number, y: number, w: number, h: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeRect) */
    strokeRect(x: number, y: number, w: number, h: number): void;
}

/**
 * The CanvasRenderingContext2D interface, part of the Canvas API, provides the 2D rendering context for the drawing surface of a <canvas> element. It is used for drawing shapes, text, images, and other objects.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D)
 */
interface CanvasRenderingContext2D extends CanvasCompositing, CanvasDrawImage, CanvasDrawPath, CanvasFillStrokeStyles, CanvasFilters, CanvasImageData, CanvasImageSmoothing, CanvasPath, CanvasPathDrawingStyles, CanvasRect, CanvasShadowStyles, CanvasState, CanvasText, CanvasTextDrawingStyles, CanvasTransform, CanvasUserInterface {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/canvas) */
    readonly canvas: HTMLCanvasElement;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getContextAttributes) */
    getContextAttributes(): CanvasRenderingContext2DSettings;
}

declare var CanvasRenderingContext2D: {
    prototype: CanvasRenderingContext2D;
    new(): CanvasRenderingContext2D;
};

interface CanvasShadowStyles {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowBlur) */
    shadowBlur: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowColor) */
    shadowColor: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX) */
    shadowOffsetX: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY) */
    shadowOffsetY: number;
}

interface CanvasState {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/reset) */
    reset(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/restore) */
    restore(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/save) */
    save(): void;
}

interface CanvasText {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillText) */
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/measureText) */
    measureText(text: string): TextMetrics;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeText) */
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
}

interface CanvasTextDrawingStyles {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/direction) */
    direction: CanvasDirection;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/font) */
    font: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fontKerning) */
    fontKerning: CanvasFontKerning;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textAlign) */
    textAlign: CanvasTextAlign;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textBaseline) */
    textBaseline: CanvasTextBaseline;
}

interface CanvasTransform {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getTransform) */
    getTransform(): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/resetTransform) */
    resetTransform(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rotate) */
    rotate(angle: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/scale) */
    scale(x: number, y: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setTransform) */
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    setTransform(transform?: DOMMatrix2DInit): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/transform) */
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/translate) */
    translate(x: number, y: number): void;
}

interface CanvasUserInterface {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawFocusIfNeeded) */
    drawFocusIfNeeded(element: Element): void;
    drawFocusIfNeeded(path: Path2D, element: Element): void;
}

/**
 * The ChannelMergerNode interface, often used in conjunction with its opposite, ChannelSplitterNode, reunites different mono inputs into a single output. Each input is used to fill a channel of the output. This is useful for accessing each channels separately, e.g. for performing channel mixing where gain must be separately controlled on each channel.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ChannelMergerNode)
 */
interface ChannelMergerNode extends AudioNode {
}

declare var ChannelMergerNode: {
    prototype: ChannelMergerNode;
    new(context: BaseAudioContext, options?: ChannelMergerOptions): ChannelMergerNode;
};

/**
 * The ChannelSplitterNode interface, often used in conjunction with its opposite, ChannelMergerNode, separates the different channels of an audio source into a set of mono outputs. This is useful for accessing each channel separately, e.g. for performing channel mixing where gain must be separately controlled on each channel.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ChannelSplitterNode)
 */
interface ChannelSplitterNode extends AudioNode {
}

declare var ChannelSplitterNode: {
    prototype: ChannelSplitterNode;
    new(context: BaseAudioContext, options?: ChannelSplitterOptions): ChannelSplitterNode;
};

/**
 * The CharacterData abstract interface represents a Node object that contains characters. This is an abstract interface, meaning there aren't any object of type CharacterData: it is implemented by other interfaces, like Text, Comment, or ProcessingInstruction which aren't abstract.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData)
 */
interface CharacterData extends Node, ChildNode, NonDocumentTypeChildNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/data) */
    data: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/length) */
    readonly length: number;
    readonly ownerDocument: Document;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/appendData) */
    appendData(data: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/deleteData) */
    deleteData(offset: number, count: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/insertData) */
    insertData(offset: number, data: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/replaceData) */
    replaceData(offset: number, count: number, data: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/substringData) */
    substringData(offset: number, count: number): string;
}

declare var CharacterData: {
    prototype: CharacterData;
    new(): CharacterData;
};

interface ChildNode extends Node {
    /**
     * Inserts nodes just after node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/after)
     */
    after(...nodes: (Node | string)[]): void;
    /**
     * Inserts nodes just before node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/before)
     */
    before(...nodes: (Node | string)[]): void;
    /**
     * Removes node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/remove)
     */
    remove(): void;
    /**
     * Replaces node with nodes, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/replaceWith)
     */
    replaceWith(...nodes: (Node | string)[]): void;
}

/** @deprecated */
interface ClientRect extends DOMRect {
}

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Clipboard)
 */
interface Clipboard extends EventTarget {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Clipboard/read) */
    read(): Promise<ClipboardItems>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Clipboard/readText) */
    readText(): Promise<string>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Clipboard/write) */
    write(data: ClipboardItems): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Clipboard/writeText) */
    writeText(data: string): Promise<void>;
}

declare var Clipboard: {
    prototype: Clipboard;
    new(): Clipboard;
};

/**
 * Events providing information related to modification of the clipboard, that is cut, copy, and paste events.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ClipboardEvent)
 */
interface ClipboardEvent extends Event {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ClipboardEvent/clipboardData) */
    readonly clipboardData: DataTransfer | null;
}

declare var ClipboardEvent: {
    prototype: ClipboardEvent;
    new(type: string, eventInitDict?: ClipboardEventInit): ClipboardEvent;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ClipboardItem)
 */
interface ClipboardItem {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ClipboardItem/types) */
    readonly types: ReadonlyArray<string>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ClipboardItem/getType) */
    getType(type: string): Promise<Blob>;
}

declare var ClipboardItem: {
    prototype: ClipboardItem;
    new(items: Record<string, string | Blob | PromiseLike<string | Blob>>, options?: ClipboardItemOptions): ClipboardItem;
};

/**
 * A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent)
 */
interface CloseEvent extends Event {
    /**
     * Returns the WebSocket connection close code provided by the server.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/code)
     */
    readonly code: number;
    /**
     * Returns the WebSocket connection close reason provided by the server.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/reason)
     */
    readonly reason: string;
    /**
     * Returns true if the connection closed cleanly; false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/wasClean)
     */
    readonly wasClean: boolean;
}

declare var CloseEvent: {
    prototype: CloseEvent;
    new(type: string, eventInitDict?: CloseEventInit): CloseEvent;
};

/**
 * Textual notations within markup; although it is generally not visually shown, such comments are available to be read in the source view.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Comment)
 */
interface Comment extends CharacterData {
}

declare var Comment: {
    prototype: Comment;
    new(data?: string): Comment;
};

/**
 * The DOM CompositionEvent represents events that occur due to the user indirectly entering text.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CompositionEvent)
 */
interface CompositionEvent extends UIEvent {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CompositionEvent/data) */
    readonly data: string;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CompositionEvent/initCompositionEvent)
     */
    initCompositionEvent(typeArg: string, bubblesArg?: boolean, cancelableArg?: boolean, viewArg?: WindowProxy | null, dataArg?: string): void;
}

declare var CompositionEvent: {
    prototype: CompositionEvent;
    new(type: string, eventInitDict?: CompositionEventInit): CompositionEvent;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CompressionStream) */
interface CompressionStream extends GenericTransformStream {
}

declare var CompressionStream: {
    prototype: CompressionStream;
    new(format: CompressionFormat): CompressionStream;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ConstantSourceNode) */
interface ConstantSourceNode extends AudioScheduledSourceNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ConstantSourceNode/offset) */
    readonly offset: AudioParam;
    addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(type: K, listener: (this: ConstantSourceNode, ev: AudioScheduledSourceNodeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(type: K, listener: (this: ConstantSourceNode, ev: AudioScheduledSourceNodeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var ConstantSourceNode: {
    prototype: ConstantSourceNode;
    new(context: BaseAudioContext, options?: ConstantSourceOptions): ConstantSourceNode;
};

/**
 * An AudioNode that performs a Linear Convolution on a given AudioBuffer, often used to achieve a reverb effect. A ConvolverNode always has exactly one input and one output.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ConvolverNode)
 */
interface ConvolverNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ConvolverNode/buffer) */
    buffer: AudioBuffer | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ConvolverNode/normalize) */
    normalize: boolean;
}

declare var ConvolverNode: {
    prototype: ConvolverNode;
    new(context: BaseAudioContext, options?: ConvolverOptions): ConvolverNode;
};

/**
 * This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CountQueuingStrategy)
 */
interface CountQueuingStrategy extends QueuingStrategy {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CountQueuingStrategy/highWaterMark) */
    readonly highWaterMark: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CountQueuingStrategy/size) */
    readonly size: QueuingStrategySize;
}

declare var CountQueuingStrategy: {
    prototype: CountQueuingStrategy;
    new(init: QueuingStrategyInit): CountQueuingStrategy;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Credential)
 */
interface Credential {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Credential/id) */
    readonly id: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Credential/type) */
    readonly type: string;
}

declare var Credential: {
    prototype: Credential;
    new(): Credential;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer)
 */
interface CredentialsContainer {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/create) */
    create(options?: CredentialCreationOptions): Promise<Credential | null>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/get) */
    get(options?: CredentialRequestOptions): Promise<Credential | null>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/preventSilentAccess) */
    preventSilentAccess(): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/store) */
    store(credential: Credential): Promise<Credential>;
}

declare var CredentialsContainer: {
    prototype: CredentialsContainer;
    new(): CredentialsContainer;
};

/**
 * Basic cryptography features available in the current context. It allows access to a cryptographically strong random number generator and to cryptographic primitives.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto)
 */
interface Crypto {
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto/subtle)
     */
    readonly subtle: SubtleCrypto;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto/getRandomValues) */
    getRandomValues<T extends ArrayBufferView | null>(array: T): T;
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto/randomUUID)
     */
    randomUUID(): `${string}-${string}-${string}-${string}-${string}`;
}

declare var Crypto: {
    prototype: Crypto;
    new(): Crypto;
};

/**
 * The CryptoKey dictionary of the Web Crypto API represents a cryptographic key.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey)
 */
interface CryptoKey {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/algorithm) */
    readonly algorithm: KeyAlgorithm;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/extractable) */
    readonly extractable: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/type) */
    readonly type: KeyType;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/usages) */
    readonly usages: KeyUsage[];
}

declare var CryptoKey: {
    prototype: CryptoKey;
    new(): CryptoKey;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry) */
interface CustomElementRegistry {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define) */
    define(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/get) */
    get(name: string): CustomElementConstructor | undefined;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/upgrade) */
    upgrade(root: Node): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/whenDefined) */
    whenDefined(name: string): Promise<CustomElementConstructor>;
}

declare var CustomElementRegistry: {
    prototype: CustomElementRegistry;
    new(): CustomElementRegistry;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent) */
interface CustomEvent<T = any> extends Event {
    /**
     * Returns any custom data event was created with. Typically used for synthetic events.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/detail)
     */
    readonly detail: T;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/initCustomEvent)
     */
    initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: T): void;
}

declare var CustomEvent: {
    prototype: CustomEvent;
    new<T>(type: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
};

/**
 * An abnormal event (called an exception) which occurs as a result of calling a method or accessing a property of a web API.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException)
 */
interface DOMException extends Error {
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException/code)
     */
    readonly code: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException/message) */
    readonly message: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException/name) */
    readonly name: string;
    readonly INDEX_SIZE_ERR: 1;
    readonly DOMSTRING_SIZE_ERR: 2;
    readonly HIERARCHY_REQUEST_ERR: 3;
    readonly WRONG_DOCUMENT_ERR: 4;
    readonly INVALID_CHARACTER_ERR: 5;
    readonly NO_DATA_ALLOWED_ERR: 6;
    readonly NO_MODIFICATION_ALLOWED_ERR: 7;
    readonly NOT_FOUND_ERR: 8;
    readonly NOT_SUPPORTED_ERR: 9;
    readonly INUSE_ATTRIBUTE_ERR: 10;
    readonly INVALID_STATE_ERR: 11;
    readonly SYNTAX_ERR: 12;
    readonly INVALID_MODIFICATION_ERR: 13;
    readonly NAMESPACE_ERR: 14;
    readonly INVALID_ACCESS_ERR: 15;
    readonly VALIDATION_ERR: 16;
    readonly TYPE_MISMATCH_ERR: 17;
    readonly SECURITY_ERR: 18;
    readonly NETWORK_ERR: 19;
    readonly ABORT_ERR: 20;
    readonly URL_MISMATCH_ERR: 21;
    readonly QUOTA_EXCEEDED_ERR: 22;
    readonly TIMEOUT_ERR: 23;
    readonly INVALID_NODE_TYPE_ERR: 24;
    readonly DATA_CLONE_ERR: 25;
}

declare var DOMException: {
    prototype: DOMException;
    new(message?: string, name?: string): DOMException;
    readonly INDEX_SIZE_ERR: 1;
    readonly DOMSTRING_SIZE_ERR: 2;
    readonly HIERARCHY_REQUEST_ERR: 3;
    readonly WRONG_DOCUMENT_ERR: 4;
    readonly INVALID_CHARACTER_ERR: 5;
    readonly NO_DATA_ALLOWED_ERR: 6;
    readonly NO_MODIFICATION_ALLOWED_ERR: 7;
    readonly NOT_FOUND_ERR: 8;
    readonly NOT_SUPPORTED_ERR: 9;
    readonly INUSE_ATTRIBUTE_ERR: 10;
    readonly INVALID_STATE_ERR: 11;
    readonly SYNTAX_ERR: 12;
    readonly INVALID_MODIFICATION_ERR: 13;
    readonly NAMESPACE_ERR: 14;
    readonly INVALID_ACCESS_ERR: 15;
    readonly VALIDATION_ERR: 16;
    readonly TYPE_MISMATCH_ERR: 17;
    readonly SECURITY_ERR: 18;
    readonly NETWORK_ERR: 19;
    readonly ABORT_ERR: 20;
    readonly URL_MISMATCH_ERR: 21;
    readonly QUOTA_EXCEEDED_ERR: 22;
    readonly TIMEOUT_ERR: 23;
    readonly INVALID_NODE_TYPE_ERR: 24;
    readonly DATA_CLONE_ERR: 25;
};

/**
 * An object providing methods which are not dependent on any particular document. Such an object is returned by the Document.implementation property.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMImplementation)
 */
interface DOMImplementation {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMImplementation/createDocument) */
    createDocument(namespace: string | null, qualifiedName: string | null, doctype?: DocumentType | null): XMLDocument;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMImplementation/createDocumentType) */
    createDocumentType(qualifiedName: string, publicId: string, systemId: string): DocumentType;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMImplementation/createHTMLDocument) */
    createHTMLDocument(title?: string): Document;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMImplementation/hasFeature)
     */
    hasFeature(...args: any[]): true;
}

declare var DOMImplementation: {
    prototype: DOMImplementation;
    new(): DOMImplementation;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrix) */
interface DOMMatrix extends DOMMatrixReadOnly {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m21: number;
    m22: number;
    m23: number;
    m24: number;
    m31: number;
    m32: number;
    m33: number;
    m34: number;
    m41: number;
    m42: number;
    m43: number;
    m44: number;
    invertSelf(): DOMMatrix;
    multiplySelf(other?: DOMMatrixInit): DOMMatrix;
    preMultiplySelf(other?: DOMMatrixInit): DOMMatrix;
    rotateAxisAngleSelf(x?: number, y?: number, z?: number, angle?: number): DOMMatrix;
    rotateFromVectorSelf(x?: number, y?: number): DOMMatrix;
    rotateSelf(rotX?: number, rotY?: number, rotZ?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrix/scale3dSelf) */
    scale3dSelf(scale?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrix/scaleSelf) */
    scaleSelf(scaleX?: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    setMatrixValue(transformList: string): DOMMatrix;
    skewXSelf(sx?: number): DOMMatrix;
    skewYSelf(sy?: number): DOMMatrix;
    translateSelf(tx?: number, ty?: number, tz?: number): DOMMatrix;
}

declare var DOMMatrix: {
    prototype: DOMMatrix;
    new(init?: string | number[]): DOMMatrix;
    fromFloat32Array(array32: Float32Array): DOMMatrix;
    fromFloat64Array(array64: Float64Array): DOMMatrix;
    fromMatrix(other?: DOMMatrixInit): DOMMatrix;
};

type SVGMatrix = DOMMatrix;
declare var SVGMatrix: typeof DOMMatrix;

type WebKitCSSMatrix = DOMMatrix;
declare var WebKitCSSMatrix: typeof DOMMatrix;

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly) */
interface DOMMatrixReadOnly {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/a) */
    readonly a: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/b) */
    readonly b: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/c) */
    readonly c: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/d) */
    readonly d: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/e) */
    readonly e: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/f) */
    readonly f: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/is2D) */
    readonly is2D: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/isIdentity) */
    readonly isIdentity: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m11) */
    readonly m11: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m12) */
    readonly m12: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m13) */
    readonly m13: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m14) */
    readonly m14: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m21) */
    readonly m21: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m22) */
    readonly m22: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m23) */
    readonly m23: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m24) */
    readonly m24: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m31) */
    readonly m31: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m32) */
    readonly m32: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m33) */
    readonly m33: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m34) */
    readonly m34: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m41) */
    readonly m41: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m42) */
    readonly m42: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m43) */
    readonly m43: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/m44) */
    readonly m44: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/flipX) */
    flipX(): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/flipY) */
    flipY(): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/inverse) */
    inverse(): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/multiply) */
    multiply(other?: DOMMatrixInit): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/rotate) */
    rotate(rotX?: number, rotY?: number, rotZ?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/rotateAxisAngle) */
    rotateAxisAngle(x?: number, y?: number, z?: number, angle?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/rotateFromVector) */
    rotateFromVector(x?: number, y?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/scale) */
    scale(scaleX?: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/scale3d) */
    scale3d(scale?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/scaleNonUniform)
     */
    scaleNonUniform(scaleX?: number, scaleY?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/skewX) */
    skewX(sx?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/skewY) */
    skewY(sy?: number): DOMMatrix;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/toFloat32Array) */
    toFloat32Array(): Float32Array;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/toFloat64Array) */
    toFloat64Array(): Float64Array;
    toJSON(): any;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/transformPoint) */
    transformPoint(point?: DOMPointInit): DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/translate) */
    translate(tx?: number, ty?: number, tz?: number): DOMMatrix;
    toString(): string;
}

declare var DOMMatrixReadOnly: {
    prototype: DOMMatrixReadOnly;
    new(init?: string | number[]): DOMMatrixReadOnly;
    fromFloat32Array(array32: Float32Array): DOMMatrixReadOnly;
    fromFloat64Array(array64: Float64Array): DOMMatrixReadOnly;
    fromMatrix(other?: DOMMatrixInit): DOMMatrixReadOnly;
};

/**
 * Provides the ability to parse XML or HTML source code from a string into a DOM Document.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMParser)
 */
interface DOMParser {
    /**
     * Parses string using either the HTML or XML parser, according to type, and returns the resulting Document. type can be "text/html" (which will invoke the HTML parser), or any of "text/xml", "application/xml", "application/xhtml+xml", or "image/svg+xml" (which will invoke the XML parser).
     *
     * For the XML parser, if string cannot be parsed, then the returned Document will contain elements describing the resulting error.
     *
     * Note that script elements are not evaluated during parsing, and the resulting document's encoding will always be UTF-8.
     *
     * Values other than the above for type will cause a TypeError exception to be thrown.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMParser/parseFromString)
     */
    parseFromString(string: string, type: DOMParserSupportedType): Document;
}

declare var DOMParser: {
    prototype: DOMParser;
    new(): DOMParser;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPoint) */
interface DOMPoint extends DOMPointReadOnly {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPoint/w) */
    w: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPoint/x) */
    x: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPoint/y) */
    y: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPoint/z) */
    z: number;
}

declare var DOMPoint: {
    prototype: DOMPoint;
    new(x?: number, y?: number, z?: number, w?: number): DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPoint/fromPoint_static) */
    fromPoint(other?: DOMPointInit): DOMPoint;
};

type SVGPoint = DOMPoint;
declare var SVGPoint: typeof DOMPoint;

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly) */
interface DOMPointReadOnly {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/w) */
    readonly w: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/x) */
    readonly x: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/y) */
    readonly y: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/z) */
    readonly z: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/matrixTransform) */
    matrixTransform(matrix?: DOMMatrixInit): DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/toJSON) */
    toJSON(): any;
}

declare var DOMPointReadOnly: {
    prototype: DOMPointReadOnly;
    new(x?: number, y?: number, z?: number, w?: number): DOMPointReadOnly;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/fromPoint_static) */
    fromPoint(other?: DOMPointInit): DOMPointReadOnly;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad) */
interface DOMQuad {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad/p1) */
    readonly p1: DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad/p2) */
    readonly p2: DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad/p3) */
    readonly p3: DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad/p4) */
    readonly p4: DOMPoint;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad/getBounds) */
    getBounds(): DOMRect;
    toJSON(): any;
}

declare var DOMQuad: {
    prototype: DOMQuad;
    new(p1?: DOMPointInit, p2?: DOMPointInit, p3?: DOMPointInit, p4?: DOMPointInit): DOMQuad;
    fromQuad(other?: DOMQuadInit): DOMQuad;
    fromRect(other?: DOMRectInit): DOMQuad;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRect) */
interface DOMRect extends DOMRectReadOnly {
    height: number;
    width: number;
    x: number;
    y: number;
}

declare var DOMRect: {
    prototype: DOMRect;
    new(x?: number, y?: number, width?: number, height?: number): DOMRect;
    fromRect(other?: DOMRectInit): DOMRect;
};

type SVGRect = DOMRect;
declare var SVGRect: typeof DOMRect;

interface DOMRectList {
    readonly length: number;
    item(index: number): DOMRect | null;
    [index: number]: DOMRect;
}

declare var DOMRectList: {
    prototype: DOMRectList;
    new(): DOMRectList;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly) */
interface DOMRectReadOnly {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/bottom) */
    readonly bottom: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/height) */
    readonly height: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/left) */
    readonly left: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/right) */
    readonly right: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/top) */
    readonly top: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/width) */
    readonly width: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/x) */
    readonly x: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/y) */
    readonly y: number;
    toJSON(): any;
}

declare var DOMRectReadOnly: {
    prototype: DOMRectReadOnly;
    new(x?: number, y?: number, width?: number, height?: number): DOMRectReadOnly;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/fromRect_static) */
    fromRect(other?: DOMRectInit): DOMRectReadOnly;
};

/**
 * A type returned by some APIs which contains a list of DOMString (strings).
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMStringList)
 */
interface DOMStringList {
    /**
     * Returns the number of strings in strings.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMStringList/length)
     */
    readonly length: number;
    /**
     * Returns true if strings contains string, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMStringList/contains)
     */
    contains(string: string): boolean;
    /**
     * Returns the string with index index from strings.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMStringList/item)
     */
    item(index: number): string | null;
    [index: number]: string;
}

declare var DOMStringList: {
    prototype: DOMStringList;
    new(): DOMStringList;
};

/**
 * Used by the dataset HTML attribute to represent data for custom attributes added to elements.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMStringMap)
 */
interface DOMStringMap {
    [name: string]: string | undefined;
}

declare var DOMStringMap: {
    prototype: DOMStringMap;
    new(): DOMStringMap;
};

/**
 * A set of space-separated tokens. Such a set is returned by Element.classList, HTMLLinkElement.relList, HTMLAnchorElement.relList, HTMLAreaElement.relList, HTMLIframeElement.sandbox, or HTMLOutputElement.htmlFor. It is indexed beginning with 0 as with JavaScript Array objects. DOMTokenList is always case-sensitive.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList)
 */
interface DOMTokenList {
    /**
     * Returns the number of tokens.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/length)
     */
    readonly length: number;
    /**
     * Returns the associated set as string.
     *
     * Can be set, to change the associated attribute.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/value)
     */
    value: string;
    toString(): string;
    /**
     * Adds all arguments passed, except those already present.
     *
     * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
     *
     * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/add)
     */
    add(...tokens: string[]): void;
    /**
     * Returns true if token is present, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/contains)
     */
    contains(token: string): boolean;
    /**
     * Returns the token with index index.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/item)
     */
    item(index: number): string | null;
    /**
     * Removes arguments passed, if they are present.
     *
     * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
     *
     * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/remove)
     */
    remove(...tokens: string[]): void;
    /**
     * Replaces token with newToken.
     *
     * Returns true if token was replaced with newToken, and false otherwise.
     *
     * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
     *
     * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/replace)
     */
    replace(token: string, newToken: string): boolean;
    /**
     * Returns true if token is in the associated attribute's supported tokens. Returns false otherwise.
     *
     * Throws a TypeError if the associated attribute has no supported tokens defined.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/supports)
     */
    supports(token: string): boolean;
    /**
     * If force is not given, "toggles" token, removing it if it's present and adding it if it's not present. If force is true, adds token (same as add()). If force is false, removes token (same as remove()).
     *
     * Returns true if token is now present, and false otherwise.
     *
     * Throws a "SyntaxError" DOMException if token is empty.
     *
     * Throws an "InvalidCharacterError" DOMException if token contains any spaces.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/toggle)
     */
    toggle(token: string, force?: boolean): boolean;
    forEach(callbackfn: (value: string, key: number, parent: DOMTokenList) => void, thisArg?: any): void;
    [index: number]: string;
}

declare var DOMTokenList: {
    prototype: DOMTokenList;
    new(): DOMTokenList;
};

/**
 * Used to hold the data that is being dragged during a drag and drop operation. It may hold one or more data items, each of one or more data types. For more information about drag and drop, see HTML Drag and Drop API.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer)
 */
interface DataTransfer {
    /**
     * Returns the kind of operation that is currently selected. If the kind of operation isn't one of those that is allowed by the effectAllowed attribute, then the operation will fail.
     *
     * Can be set, to change the selected operation.
     *
     * The possible values are "none", "copy", "link", and "move".
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/dropEffect)
     */
    dropEffect: "none" | "copy" | "link" | "move";
    /**
     * Returns the kinds of operations that are to be allowed.
     *
     * Can be set (during the dragstart event), to change the allowed operations.
     *
     * The possible values are "none", "copy", "copyLink", "copyMove", "link", "linkMove", "move", "all", and "uninitialized",
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/effectAllowed)
     */
    effectAllowed: "none" | "copy" | "copyLink" | "copyMove" | "link" | "linkMove" | "move" | "all" | "uninitialized";
    /**
     * Returns a FileList of the files being dragged, if any.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/files)
     */
    readonly files: FileList;
    /**
     * Returns a DataTransferItemList object, with the drag data.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/items)
     */
    readonly items: DataTransferItemList;
    /**
     * Returns a frozen array listing the formats that were set in the dragstart event. In addition, if any files are being dragged, then one of the types will be the string "Files".
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/types)
     */
    readonly types: ReadonlyArray<string>;
    /**
     * Removes the data of the specified formats. Removes all data if the argument is omitted.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/clearData)
     */
    clearData(format?: string): void;
    /**
     * Returns the specified data. If there is no such data, returns the empty string.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/getData)
     */
    getData(format: string): string;
    /**
     * Adds the specified data.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/setData)
     */
    setData(format: string, data: string): void;
    /**
     * Uses the given element to update the drag feedback, replacing any previously specified feedback.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransfer/setDragImage)
     */
    setDragImage(image: Element, x: number, y: number): void;
}

declare var DataTransfer: {
    prototype: DataTransfer;
    new(): DataTransfer;
};

/**
 * One drag data item. During a drag operation, each drag event has a dataTransfer property which contains a list of drag data items. Each item in the list is a DataTransferItem object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItem)
 */
interface DataTransferItem {
    /**
     * Returns the drag data item kind, one of: "string", "file".
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItem/kind)
     */
    readonly kind: string;
    /**
     * Returns the drag data item type string.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItem/type)
     */
    readonly type: string;
    /**
     * Returns a File object, if the drag data item kind is File.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItem/getAsFile)
     */
    getAsFile(): File | null;
    /**
     * Invokes the callback with the string data as the argument, if the drag data item kind is text.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItem/getAsString)
     */
    getAsString(callback: FunctionStringCallback | null): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItem/webkitGetAsEntry) */
    webkitGetAsEntry(): FileSystemEntry | null;
}

declare var DataTransferItem: {
    prototype: DataTransferItem;
    new(): DataTransferItem;
};

/**
 * A list of DataTransferItem objects representing items being dragged. During a drag operation, each DragEvent has a dataTransfer property and that property is a DataTransferItemList.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItemList)
 */
interface DataTransferItemList {
    /**
     * Returns the number of items in the drag data store.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItemList/length)
     */
    readonly length: number;
    /**
     * Adds a new entry for the given data to the drag data store. If the data is plain text then a type string has to be provided also.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItemList/add)
     */
    add(data: string, type: string): DataTransferItem | null;
    add(data: File): DataTransferItem | null;
    /**
     * Removes all the entries in the drag data store.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItemList/clear)
     */
    clear(): void;
    /**
     * Removes the indexth entry in the drag data store.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DataTransferItemList/remove)
     */
    remove(index: number): void;
    [index: number]: DataTransferItem;
}

declare var DataTransferItemList: {
    prototype: DataTransferItemList;
    new(): DataTransferItemList;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DecompressionStream) */
interface DecompressionStream extends GenericTransformStream {
}

declare var DecompressionStream: {
    prototype: DecompressionStream;
    new(format: CompressionFormat): DecompressionStream;
};

/**
 * A delay-line; an AudioNode audio-processing module that causes a delay between the arrival of an input data and its propagation to the output.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DelayNode)
 */
interface DelayNode extends AudioNode {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DelayNode/delayTime) */
    readonly delayTime: AudioParam;
}

declare var DelayNode: {
    prototype: DelayNode;
    new(context: BaseAudioContext, options?: DelayOptions): DelayNode;
};

/**
 * The DeviceMotionEvent provides web developers with information about the speed of changes for the device's position and orientation.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEvent)
 */
interface DeviceMotionEvent extends Event {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEvent/acceleration) */
    readonly acceleration: DeviceMotionEventAcceleration | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEvent/accelerationIncludingGravity) */
    readonly accelerationIncludingGravity: DeviceMotionEventAcceleration | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEvent/interval) */
    readonly interval: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEvent/rotationRate) */
    readonly rotationRate: DeviceMotionEventRotationRate | null;
}

declare var DeviceMotionEvent: {
    prototype: DeviceMotionEvent;
    new(type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
};

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventAcceleration)
 */
interface DeviceMotionEventAcceleration {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventAcceleration/x) */
    readonly x: number | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventAcceleration/y) */
    readonly y: number | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventAcceleration/z) */
    readonly z: number | null;
}

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventRotationRate)
 */
interface DeviceMotionEventRotationRate {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventRotationRate/alpha) */
    readonly alpha: number | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventRotationRate/beta) */
    readonly beta: number | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DeviceMotionEventRotationRate/gamma) */
    readonly gamma: number | null;
}

/**
 * The DeviceOrientationEvent provides web developers with information from the physical orientation of the device running the web page.
 * Available only in secur