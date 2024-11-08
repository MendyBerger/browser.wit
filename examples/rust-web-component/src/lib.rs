wit_bindgen::generate!({
    path: "../../wit",
    world: "browser",
    with: {
        "wasi:io/poll@0.2.2": wasi::io::poll,
    },
});

mod implement_some_traits {
    impl std::hash::Hash for crate::global::CreatedElement {
        fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
            self.handle().hash(state);
        }
    }
    impl PartialEq for crate::global::CreatedElement {
        fn eq(&self, other: &Self) -> bool {
            self.handle() == other.handle()
        }
    }
    impl Eq for crate::global::CreatedElement {}
}

use std::collections::HashMap;
use std::rc::Rc;

use wasi::io::poll::Pollable;

use crate::web::browser::global;
use crate::global::{CreatedElement, ShadowRootInit, ShadowRootMode};
use crate::global::get_window;

struct MyComponent;

impl Guest for MyComponent {
    fn start() {
        declare_card();
    }
}

fn declare_card() {
    let window = global::get_window();
    let res = window.define_element("collapsible-component", &global::DefineElementOptions {
        observed_attributes: vec!["summary".into(), "open".into()],
        superclass: None,
        form_associated: false,
    });

    let mut events = HashMap::new();

    let constructor = res.constructor_subscribe();
    events.insert(Event::Constructor, constructor);

    loop {
        for event in block_on(&mut events) {
            match event {
                Event::Constructor => {
                    let instance = Rc::new(res.constructor_get().unwrap());
                    events.insert(Event::Connected(Rc::clone(&instance)), instance.connected_callback_subscribe());
                    events.insert(Event::AttributeChanged(Rc::clone(&instance)), instance.attribute_changed_callback_subscribe());
                }
                Event::Connected(instance) => {
                    let el = instance.get_element();
                    let shadow = el.as_element().attach_shadow(ShadowRootInit { mode: ShadowRootMode::Open });
                    let styles = el.style();
                    styles.set_property("display", "grid", None);
                    styles.set_property("gap", "16px", None);
                    styles.set_property("padding", "24px", None);
                    styles.set_property("margin", "24px", None);
                    styles.set_property("border-radius", "12px", None);
                    styles.set_property("box-shadow", "#78787873 0 0px 10px", None);
                    let summary = get_window().document().unwrap().create_element("h4", None);
                    summary.set_id("summary");
                    events.insert(Event::ToggleOpen(instance), summary.as_html_element().onclick_subscribe());
                    summary.as_html_element().style().set_property("margin", "0", None);
                    summary.as_html_element().style().set_property("cursor", "pointer", None);
                    shadow.as_document_fragment().as_node().append_child(&summary.as_node());
                    let slot = get_window().document().unwrap().create_element("slot", None);
                    shadow.as_document_fragment().as_node().append_child(&slot.as_node());
                }
                Event::AttributeChanged(instance) => {
                    let changes = instance.attribute_changed_callback_get().unwrap();
                    match changes.name.as_str() {
                        "summary" => {
                            instance.get_element().as_element().shadow_root().unwrap().as_document_fragment().query_selector("#summary").unwrap().as_node().set_text_content(&changes.new_value.unwrap_or_default());
                        }
                        _ => {}
                    }
                }
                Event::ToggleOpen(instance) => {
                    let styles = instance.get_element().as_element().shadow_root().unwrap().as_document_fragment().query_selector("slot").unwrap().as_html_element().style();
                    match styles.get_property_value("display").as_str() {
                        "none" => styles.set_property("display", "block", None),
                        _ => styles.set_property("display", "none", None),
                    };
                }
            }
        }
    }
}


// fn print(s: &str) {
//     let window = global::get_window();
//     window.console().print(s);
// }


#[derive(Clone, Hash, Eq, PartialEq, Debug)]
enum Event {
    Constructor,
    Connected(Rc<CreatedElement>),
    AttributeChanged(Rc<CreatedElement>),
    ToggleOpen(Rc<CreatedElement>),
}
fn block_on(events: &mut HashMap<Event, Pollable>) -> Vec<Event> {
    let events_vec = events.iter().collect::<Vec<(&Event, &Pollable)>>();
    let pollables = events_vec.iter().map(|(_, p)| *p).collect::<Vec<_>>();

    let resolved_events = wasi::io::poll::poll(&pollables).into_iter().map(|i| events_vec[i as usize].0.clone()).collect::<Vec<Event>>();
    let mut output = vec![];
    for event in resolved_events {
        output.push(event);
    }
    output
}

export!(MyComponent);
