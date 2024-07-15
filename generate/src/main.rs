use std::fs;

use webidl2wit::{Ident, PackageName};
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
            package_name: PackageName::new("web", "browser", None),
            interface_name: Ident::new("global"),
            unsupported_features: webidl2wit::HandleUnsupported::Warn,
            ..Default::default()
        },
    )
    .unwrap();
    let wit_output = wit_ast.to_string();
    std::fs::write("../wit/web.wit", wit_output).unwrap();
}
