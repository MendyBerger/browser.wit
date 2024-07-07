wit_bindgen::generate!({
    path: "../../wit",
});

use crate::web::browser::global;

struct MyComponent;

impl Guest for MyComponent {
    fn start() {
        let document = global::get_window().document();
        let el = document.create_element("input", &global::ElementCreationOptionsOrString::ElementCreationOptions(global::ElementCreationOptions {
            is: None,
            pseudo: None,
        }));
        let body = document.body().unwrap().as_element().as_node();
        body.append_child(&el.as_node());
    }
}

export!(MyComponent);
