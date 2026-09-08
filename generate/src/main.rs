use std::collections::HashSet;
use std::fs;

use webidl2wit::PackageName;
use weedle::Parse;

fn main() {
    let mut webidl_ast = vec![];
    // Sorted so that the generated wit is byte-for-byte reproducible;
    // `read_dir` yields entries in an unspecified, filesystem-dependent order.
    let mut webidl_paths = fs::read_dir("../webidl")
        .unwrap()
        .map(|entry| entry.unwrap().path())
        .collect::<Vec<_>>();
    webidl_paths.sort();
    for path in webidl_paths {
        let contents = fs::read_to_string(path).unwrap();
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
            resource_inheritance: webidl2wit::ResourceInheritance::Both,
            ..Default::default()
        },
    )
    .unwrap();
    let wit_output = wit_ast.to_string();
    let wit_output = give_event_streams_a_payload(&wit_output);
    let wit_output = comment_out_unusable_items(&wit_output);
    std::fs::write("../wit/web.wit", wit_output).unwrap();
}

/// Gives every event handler stream an `event` payload.
///
/// `webidl2wit` turns `attribute EventHandler onclick` into `onclick: func() -> stream`,
/// leaving the payload open because WebIDL's `EventHandler` does not say which event
/// subtype it carries. An empty payload is worse than the base type on both ends: the
/// guest gets a bare tick it cannot inspect, and jco mishandles payload-less streams.
/// Every `EventHandler` is called with an `Event`, so that is what the stream carries.
fn give_event_streams_a_payload(wit: &str) -> String {
    wit.lines()
        .map(|line| match line.strip_suffix(": func() -> stream;") {
            Some(start) if start.trim_start().starts_with("on") => {
                format!("{start}: func() -> stream<event>;")
            }
            _ => line.to_string(),
        })
        .collect::<Vec<_>>()
        .join("\n")
        + "\n"
}

/// Items that are valid wit but trip up a specific guest language's bindings
/// generator, and so are commented out in the generated file.
///
/// These used to be applied by hand-editing `wit/web.wit`, which meant every
/// regeneration silently dropped them. Keeping them here makes regeneration
/// reproducible. Each entry must match at least one generated line, so a stale
/// entry fails the build instead of rotting.
const LANGUAGE_WORKAROUNDS: &[(&str, &str)] = &[
    ("breaks in C#", "encoding: func() -> string;"),
    ("breaks in C#", "encoding: option<string>,"),
    ("breaks in C#", "read-as-text: func(blob: borrow<blob>, encoding: option<string>) -> string;"),
    ("breaks in C#", "read-as-text: func(size: u64, encoding: option<string>) -> option<idb-file-request>;"),
    ("breaks in C#", "set-encoding: func(encoding: string);"),
    ("breaks in Go", "%async: func() -> bool;"),
    ("breaks in Go", "set-async: func(%async: bool);"),
    ("breaks in moonbit", "%as: func() -> string;"),
    ("breaks in moonbit", "%use: option<string>,"),
    ("breaks in moonbit", "assert: func(condition: option<bool>, data: list<any>);"),
    ("breaks in moonbit", "drop: func(row: s32, orientation: s32, data-transfer: option<borrow<data-transfer>>);"),
    ("breaks in moonbit", "insert-adjacent-element: func(where: string, element: borrow<element>) -> option<element>;"),
    ("breaks in moonbit", "insert-adjacent-text: func(where: string, data: string);"),
    ("breaks in moonbit", "is: option<string>,"),
    ("breaks in moonbit", "set-as: func(%as: string);"),
    ("breaks in moonbit", "stencil-func-separate: func(face: g-lenum, %func: g-lenum, ref: g-lint, mask: g-luint);"),
    (
        "breaks in Rust: wit-bindgen skips the variant this names, leaving it dangling",
        "type binary-data = array-buffer-or-array-buffer-view;",
    ),
];

/// Items that `webidl2wit` emits but wit cannot express, and so are commented out.
///
/// `webidl2wit` has no notion of WebIDL overloads, and empty dictionaries have no
/// wit equivalent, so the raw output does not parse without these.
const INVALID_WIT: &[&str] = &[
    "record rtc-answer-options {  }",
    "record rtc-offer-answer-options {  }",
];

/// Comments out everything the generated wit cannot keep, giving a reason for each.
///
/// Five rules, applied per line:
///  * anything in [`INVALID_WIT`] or [`LANGUAGE_WORKAROUNDS`];
///  * a member whose name is already taken in the same block. WebIDL overloads all
///    collapse onto one wit name, and wit names are case-insensitive, so a WebGL
///    method also collides with its same-named constant. The first one wins;
///  * a method with the same name as the resource holding it, which wit forbids;
///  * a signature carrying a borrow inside a future, which has no bindings;
///  * anything referring to a type that does not exist, whether because a rule above
///    removed it or because `webidl2wit` never emitted it in the first place.
fn comment_out_unusable_items(wit: &str) -> String {
    let mut hits = vec![0usize; LANGUAGE_WORKAROUNDS.len()];
    let mut output = String::with_capacity(wit.len());
    // The blocks currently being walked, innermost last, each with the member names
    // it has used so far.
    let mut blocks: Vec<(String, HashSet<String>)> = Vec::new();
    // Types nothing may refer to: either never emitted, or removed by INVALID_WIT.
    let defined = defined_types(wit);
    let removed = INVALID_WIT
        .iter()
        .filter_map(|item| block_opened(item.trim_end_matches('}').trim_end()))
        .collect::<HashSet<_>>();

    for line in wit.lines() {
        let trimmed = line.trim_start();
        let indent = &line[..line.len() - trimmed.len()];

        let disable = |reason: &str, output: &mut String| {
            output.push_str(&format!("{indent}// {reason}\n"));
            output.push_str(&format!("{indent}// {trimmed}\n"));
        };

        if INVALID_WIT.contains(&trimmed) {
            disable("wit can't express this", &mut output);
            continue;
        }
        if let Some(name) = block_opened(trimmed) {
            blocks.push((name, HashSet::new()));
        } else if trimmed == "}" {
            blocks.pop();
        } else if trimmed.starts_with("import ")
            || trimmed.starts_with("include ")
            || trimmed.starts_with("use ")
        {
            // World and interface items, not members.
        } else if let Some((block_name, used)) = blocks.last_mut() {
            if let Some(index) = LANGUAGE_WORKAROUNDS
                .iter()
                .position(|(_, item)| *item == trimmed)
            {
                hits[index] += 1;
                disable(LANGUAGE_WORKAROUNDS[index].0, &mut output);
                continue;
            }
            // A `future` is an owned handle, so a borrow inside one is meaningless;
            // wit-bindgen panics rather than rejecting it. WebIDL only produces these
            // for a `Promise<T>` in an argument position.
            if trimmed.contains("future<borrow<") {
                disable("a borrow inside a future has no bindings", &mut output);
                continue;
            }
            if let Some(name) = type_references(trimmed)
                .into_iter()
                .find(|name| removed.contains(name) || !defined.contains(name))
            {
                disable(&format!("`{name}` does not exist"), &mut output);
                continue;
            }
            if let Some(member) = member_name(trimmed) {
                if &member == block_name {
                    disable(
                        "a method can't have the same name as its resource",
                        &mut output,
                    );
                    continue;
                }
                if !used.insert(member) {
                    disable("the name is already taken in this block", &mut output);
                    continue;
                }
            }
        }

        output.push_str(line);
        output.push('\n');
    }

    let stale = LANGUAGE_WORKAROUNDS
        .iter()
        .zip(&hits)
        .filter(|(_, &count)| count == 0)
        .map(|((_, item), _)| *item)
        .collect::<Vec<_>>();
    assert!(
        stale.is_empty(),
        "{} entries in LANGUAGE_WORKAROUNDS matched nothing and are stale:\n{}",
        stale.len(),
        stale.join("\n")
    );
    output
}

/// The name of the block this line opens, if it opens one.
fn block_opened(line: &str) -> Option<String> {
    let line = line.strip_suffix('{')?.trim_end();
    let (kind, name) = line.split_once(' ')?;
    matches!(
        kind,
        "resource" | "record" | "variant" | "interface" | "enum" | "flags" | "world"
    )
    .then(|| normalize(name))
}

/// The name this line declares as a member of the enclosing block, if any.
fn member_name(line: &str) -> Option<String> {
    let end = line.find([':', '('])?;
    let name = &line[..end];
    (!name.is_empty()
        && name
            .chars()
            .all(|c| c.is_alphanumeric() || c == '-' || c == '%'))
    .then(|| normalize(name))
}

/// Every type name the wit defines.
fn defined_types(wit: &str) -> HashSet<String> {
    wit.lines()
        .filter_map(|line| {
            let line = line.trim();
            let (kind, rest) = line.split_once(' ')?;
            match kind {
                "resource" | "record" | "variant" | "enum" | "flags" | "interface" => {
                    block_opened(line).or_else(|| Some(normalize(rest.split_whitespace().next()?)))
                }
                // `type foo = bar;`
                "type" => Some(normalize(rest.split(' ').next()?)),
                _ => None,
            }
        })
        .collect()
}

/// Every type this line refers to.
///
/// An identifier that names a parameter or a field is followed by a `:`, and the
/// first identifier is the member being declared, so everything else is a type.
fn type_references(line: &str) -> Vec<String> {
    const BUILTIN: &[&str] = &[
        "bool",
        "s8",
        "s16",
        "s32",
        "s64",
        "u8",
        "u16",
        "u32",
        "u64",
        "f32",
        "f64",
        "char",
        "string",
        "list",
        "option",
        "result",
        "tuple",
        "borrow",
        "own",
        "future",
        "stream",
        "func",
        "async",
        "static",
        "constructor",
    ];
    let is_ident = |c: char| c.is_alphanumeric() || c == '-' || c == '_' || c == '%';

    let mut references = Vec::new();
    let mut rest = line;
    let mut is_first = true;
    while let Some(start) = rest.find(is_ident) {
        let token_and_rest = &rest[start..];
        let end = token_and_rest
            .find(|c| !is_ident(c))
            .unwrap_or(token_and_rest.len());
        let (token, after) = token_and_rest.split_at(end);
        rest = after;
        // `->` and the like leave a stray `-`, which is not an identifier.
        if !token.starts_with(|c: char| c.is_alphanumeric() || c == '%') {
            continue;
        }
        let declares_a_name = is_first || after.starts_with(':');
        if !declares_a_name && !BUILTIN.contains(&token) {
            references.push(normalize(token));
        }
        is_first = false;
    }
    references
}

/// wit names are case-insensitive, and `%` only escapes a keyword.
fn normalize(name: &str) -> String {
    name.trim_start_matches('%').to_lowercase()
}
