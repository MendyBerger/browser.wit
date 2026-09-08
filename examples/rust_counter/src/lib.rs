use futures_util::stream::{self, StreamExt};

wit_bindgen::generate!({
    path: "../../wit",
    world: "browser",
});

use crate::webidl::browser::global;

struct MyComponent;

impl Guest for MyComponent {
    async fn start() {
        let document = global::get_window().document().unwrap();
        let root = document.get_element_by_id("app").unwrap().as_html_element().unwrap();
        let root_styles = root.style();
        root_styles.set_property("display", "flex", None);
        root_styles.set_property("gap", "10px", None);

        // add elements
        let increase = document.create_element("button", None).as_html_button_element().unwrap();
        increase.set_text_content(Some("+"));
        root.append_child(&increase.as_node());
        let label = document.create_element("span", None).as_html_span_element().unwrap();
        label.set_text_content(Some("Counter: "));
        root.append_child(&label.as_node());
        let output = document.create_element("span", None).as_html_span_element().unwrap();
        root.append_child(&output.as_node());
        let decrease = document.create_element("button", None).as_html_button_element().unwrap();
        decrease.set_text_content(Some("-"));
        root.append_child(&decrease.as_node());

        // counter logic
        let mut i = 0;
        // Each `onclick` is a `stream<event>`; merging the two gives one stream to await,
        // which replaces polling a list of pollables.
        let mut events = stream::select(
            increase.onclick().into_stream().map(|_| Event::Increase),
            decrease.onclick().into_stream().map(|_| Event::Decrease),
        );
        output.set_text_content(Some(&i.to_string()));
        while let Some(event) = events.next().await {
            match event {
                Event::Increase => i += 1,
                Event::Decrease => i -= 1,
            }
            output.set_text_content(Some(&i.to_string()));
        }
    }
}

#[derive(Clone, Copy, Debug)]
enum Event {
    Increase,
    Decrease,
}

export!(MyComponent);
