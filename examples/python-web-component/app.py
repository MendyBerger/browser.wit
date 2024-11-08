import enum
from typing import Dict, List, Optional, Tuple
import browser
from browser.imports.poll import Pollable, poll
from browser.imports.global_ import get_window, DefineElementOptions, ShadowRootInit, ShadowRootMode

class Browser(browser.Browser):
    def start(self):
        declare_card()


def declare_card():
    window = get_window()
    res = window.define_element("progress-bar", DefineElementOptions(
        None,
        ["percent"],
        False,
    ))

    created_element = []
    events = {}

    constructor = res.constructor_subscribe()
    events[(Event.CONSTRUCTOR, None)] = constructor

    while True:
        for event, index in block_on(events):
            match event:
                case Event.CONSTRUCTOR:
                    instance = res.constructor_get()
                    created_element.append(instance)
                    index = len(created_element) - 1
                    events[(Event.CONNECTED, index)] = instance.connected_callback_subscribe()
                    events[(Event.ATTRIBUTE_CHANGED, index)] = instance.attribute_changed_callback_subscribe()
                case Event.CONNECTED:
                    el = created_element[index].get_element()
                    shadow = el.as_element().attach_shadow(ShadowRootInit(ShadowRootMode.OPEN))
                    styles = el.style()
                    styles.set_property("display", "grid", None)
                    styles.set_property("margin", "24px", None)
                    styles.set_property("border-radius", "12px", None)
                    styles.set_property("background-color", "#e8e8e8", None)
                    styles.set_property("height", "18px", None)
                    styles.set_property("overflow", "hidden", None)
                    progress = get_window().document().create_element("div", None)
                    progress.as_html_element().style().set_property("margin", "0px", None)
                    progress.as_html_element().style().set_property("height", "100", None)
                    progress.as_html_element().style().set_property("background", "#1f2286", None)
                    shadow.as_document_fragment().as_node().append_child(progress.as_node())
                case Event.ATTRIBUTE_CHANGED:
                    changes = created_element[index].attribute_changed_callback_get()
                    match changes.name:
                        case "percent":
                            instance.get_element().as_element().shadow_root().as_document_fragment().query_selector("div").as_html_element().style().set_property("width", changes.new_value + "%", None)


class Event(enum.Enum):
    CONSTRUCTOR = 1,
    CONNECTED = 2,
    ATTRIBUTE_CHANGED = 3,


def block_on(events: Dict[Tuple[Event, Optional[int]], Pollable]) -> List[Tuple[Event, Optional[int]]]:
    events_vec = list(events.keys())
    output = []
    for i in poll(list(events.values())):
        output.append(events_vec[i])
    return output
