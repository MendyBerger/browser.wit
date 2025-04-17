package main

import (
	"strconv"

	goexampleworld "example.com/internal/go-example-namespace/go-example-package/go-example-world"
	"example.com/internal/wasi/io/poll"
	"example.com/internal/webidl/browser/global"
	"go.bytecodealliance.org/cm"
)

type Event int

const (
	Increase Event = iota
	Decrease
)

func init() {
	// TODO: enable once we remove the go-specific world.
	// browser.Exports.Start = func() {
	goexampleworld.Exports.Start = func() {
		var document = global.GetWindow().Document().Value()
		var root = document.GetElementByID("app").Value().AsNode()
		var root_styles = root.AsElement().Value().AsHTMLElement().Value().Style()
		root_styles.SetProperty("display", "flex", cm.None[string]())
		root_styles.SetProperty("gap", "10px", cm.None[string]())

		// add elements
		var increase = document.CreateElement("button", cm.None[global.ElementCreationOptionsOrString]())
		increase.AsNode().SetTextContent("+")
		root.AppendChild(increase.AsNode())
		var label = document.CreateElement("span", cm.None[global.ElementCreationOptionsOrString]()).AsNode()
		label.SetTextContent("Counter: ")
		root.AppendChild(label)
		var output = document.CreateElement("span", cm.None[global.ElementCreationOptionsOrString]()).AsNode()
		root.AppendChild(output)
		var decrease = document.CreateElement("button", cm.None[global.ElementCreationOptionsOrString]())
		decrease.AsNode().SetTextContent("-")
		root.AppendChild(decrease.AsNode())

		// counter logic
		var i = 0
		pollables := map[Event]poll.Pollable{
			Increase: increase.AsHTMLElement().Value().OnclickSubscribe(),
			Decrease: decrease.AsHTMLElement().Value().OnclickSubscribe(),
		}
		for {
			output.SetTextContent(strconv.Itoa(i))
			for _, event := range block_on(pollables) {
				switch event {
				case Increase:
					i++
				case Decrease:
					i--
				}
			}
		}
	}
}

func block_on(events map[Event]poll.Pollable) []Event {
	type KeyValue struct {
		event    Event
		pollable poll.Pollable
	}

	events_vec := make([]KeyValue, 0, len(events))
	for event, pollable := range events {
		events_vec = append(events_vec, KeyValue{event, pollable})
	}

	pollables := make([]poll.Pollable, 0, len(events_vec))
	for _, value := range events_vec {
		pollables = append(pollables, value.pollable)
	}

	var resolved_events = poll.Poll(cm.ToList(pollables)).Slice()

	output := make([]Event, 0, len(resolved_events))
	for _, index := range resolved_events {
		var event = events_vec[index].event
		output = append(output, event)
	}

	return output
}

// main is required for the `wasi` target, even if it isn't used.
func main() {}
