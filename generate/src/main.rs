use std::fs;

use webidl2wit::PackageName;
use weedle::Parse;

fn main() {
    let mut webidl_ast = vec![];
    for path in fs::read_dir("../webidl").unwrap() {
        let contents = fs::read_to_string(path.unwrap().path()).unwrap();
        // TODO: find a better solution than leaking
        let contents = Box::leak(Box::new(contents));
        let mut webidl = weedle::Definitions::parse(contents).unwrap().1;
        webidl_ast.append(&mut webidl)
    }
    let wit_ast = webidl2wit::webidl_to_wit(
        webidl_ast,
        webidl2wit::ConversionOptions {
            package_name: PackageName::new("webidl", "browser", None),
            interface_name: "global".to_string(),
            unsupported_features: webidl2wit::HandleUnsupported::Warn,
            phantom_interface: [
                "LifecycleConnectedCallback",
                "LifecycleDisconnectedCallback",
                "LifecycleAdoptedCallback",
                "LifecycleAttributeChangedCallback",
                "VideoFrame",
                "EventHandlerNonNull",
                "OnBeforeUnloadEventHandlerNonNull",
                "OnErrorEventHandlerNonNull",
                "TreeColumn",
                "Principal",
                "KeyframeAnimationOptions",
                "ConsoleInstanceDumpCallback",
                "PluginTag",
                "URI",
                "GenerateAssertionCallback",
                "ValidateAssertionCallback",
                "WindowProxy",
                "ObserverCallback",
                "DOMTimeStamp",
                "UnderlyingSourceStartCallback",
                "UnderlyingSourcePullCallback",
                "UnderlyingSourceCancelCallback",
                "UnderlyingSinkStartCallback",
                "UnderlyingSinkWriteCallback",
                "UnderlyingSinkCloseCallback",
                "UnderlyingSinkAbortCallback",
                "TransformerStartCallback",
                "TransformerTransformCallback",
                "TransformerFlushCallback",
                "QueuingStrategySize",
                "Function",
                "PaymentDetailsUpdate",
                "NotificationPermissionCallback",
                "MutationCallback",
                "AnyCallback",
                "U2FRegisterCallback",
                "U2FSignCallback",
                "VoidFunction",
                "NodeFilter",
                "ResizeObserverCallback",
                "IntersectionCallback",
                "BoxObject",
                "TreeColumns",
                "nsIScriptableRegion",
                "PositionCallback",
                "PositionErrorCallback",
                "nsISelectionListener",
                "DecodeSuccessCallback",
                "DecodeErrorCallback",
                "FileMode",
                "BlobCallback",
                "FileSystemEntryCallback",
                "ErrorCallback",
                "nsITreeSelection",
                "FrameRequestCallback",
                "ApplicationCache",
                "IdleRequestCallback",
                "Flex",
                "Grid",
                "StaticRange",
                "StackFrame",
                "nsITransportProvider",
                "EventListener",
                "Date",
                "FileCallback",
                "GetNotificationOptions",
                "nsIVariant",
                "FunctionStringCallback",
                "FontFaceSetForEachCallback",
                "CustomElementCreationCallback",
                "FileSystemEntriesCallback",
                "imgIRequest",
                "RTCPeerConnectionIceErrorEventInit",
                "AnonymousContent",
                "XPathNSResolver",
            ]
            .iter()
            .map(|s| s.to_string())
            .collect(),
            ..Default::default()
        },
    )
    .unwrap();
    let wit_output = wit_ast.to_string();
    std::fs::write("../wit/web.wit", wit_output).unwrap();
}
