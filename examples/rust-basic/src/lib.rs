wit_bindgen::generate!({
    path: "../../wit",
    world: "browser",
    with: {
        "wasi:io/poll@0.2.2": wasi::io::poll,
    },
});

use crate::webidl_temp::browser::global;

struct MyComponent;

impl Guest for MyComponent {
    fn start() {
        let document = global::get_window().document().unwrap();
        let el = document.create_element("input", None);
        let body = document.body().unwrap().as_element().as_node();
        body.append_child(&el.as_node());
        let el = el.as_html_element().unwrap();
        let mut i = 0;
        loop {
            el.onclick_subscribe().block();
            i += 1;
            el.as_html_input_element().unwrap().set_value(&format!("click {}", i));
        }
    }
}

export!(MyComponent);
