> [Wiki](Home) ▸ [[API Reference]] ▸ **Animation**

Conceptually, Talkie’s animation support is in two parts, though they are most often used together. The [timeline](#wiki-timeline) module supports attaching actions to an audio-triggered timeline, and the [animation](#wiki-animation) module provides some useful actions for you to attach.

(If for some reason you wish not to use [d3](http://d3js.org), you may use the timeline module without the animation module. Only the latter relies on d3.)

## The timeline module

<a name="timeline" href="Animation#wiki-timeline">#</a> Talkie.<b>timeline</b>(<i>audio</i>, timeline, [<i>options</i>])

It returns a timeline object, which may support certain timeline-specific actions. Right now the only function the timeline object has is `rewind()`, which rewinds the timeline to the beginning. If you don’t need that, you may as well not bother with the return value at all.

    var caption = Talkie.animate().select("#caption");
    var timeline = Talkie.timeline("#soundtrack", {
      "0:05": caption.text("This text will appear after five seconds"),
      "0:10": caption.text("And be replaced by this after a further five")
    });


The **audio** parameter should refer to an HTML 5 `<audio>` or `<video>` element. It should be either an actual DOM object, or a selector that selects the DOM object.

The **timeline** parameter defines what happens when. Its keys are timecodes, either strings in "mm:ss" format (e.g. `"03:15.20"`) or just a number of seconds (e.g. `195.20`). Its values are actions, which fire when the play head crosses the specified point on the track. See [actions](#wiki-actions) below.

Supported **options** are:
  * `onplay` gives a terse way to define a handler for the play event (which fires when the soundtrack starts to play).


### Actions

A good Talkie will allow random access as well as sequential play: the user may click about in the audio controls, skipping back and forth between different parts of the track. The Talkie library takes care of the necessary book-keeping, and the actions defined by the animation module are built to undo themselves where necessary, but if you define your own custom actions then you will need to define what (if anything) needs to happen when the action is undone.

A user-defined action is just be a function, run at the appropriate point. If the action leaves a lasting change that should be undone when the user skips back, the action should call `this.setUndo` passing the reversal procedure. The `fast_forward` property is true if the animation should be skipped over rather than performed at normal speed. Here is a complete example of a custom action that uses jQuery to fade in a particular element at the two-second mark:

    Talkie.timeline("#soundtrack", {
      "0:02": function() {
        if (this.fast_forward) {
          // If we’re just skipping past this point rather than lingering here,
          // it typically looks better just to transition the element to its
          // post-animation state immediately without performing the actual animation.
          $("#logo").show();
        }
        else {
          // This is the common case where the animation is just playing through
          // (or less commonly if the user has skipped just past this timecode)
          // where we should perform the animation as normal.
          $("#logo").fadeIn();
        }
        
        this.setUndo(function() {
          // To undo the action, hide the logo
          $("#logo").hide();
        });
      }
    );

As well as defining your own actions, you can use the actions defined by the animation module, which use d3 to animate DOM attributes and CSS styles.

## The animation module

<a name="Talkie-animate" href="Animation#wiki-Talkie-animate">#</a> Talkie.<b>animate</b>([<i>root element</i>])

    var animate = Talkie.animate();
    Talkie.timeline("#soundtrack", {
      "0:02": animate.select("#box").style("opacity", 1, 200),
      "0:04": animate.select("#stick").style("transform", "rotate(90)", 1000)
    });

This is the initial entry point to the animation module. `Talkie.animate()` returns an object that you can use to animate elements in the document. The optional parameter is used when the document you are animating is not the main document:  typically an SVG file loaded by an `<object>` element. See [stickman](http://bl.ocks.org/4742544) for an example.

Returns a Talkie.Animate object.

<a name="Talkie-Animate-select" href="Animation#wiki-Talkie-Animate-select">#</a> animate.<b>select</b>(<i>selector</i>)

Point to a particular element that you want to animate. Returns a Talkie.Animate_Element object that points to the selected element but has no associated animations yet. Use the methods below to attach animations.

These objects behave as though they were immutable. The animation methods return a new object, leaving the original unchanged.

<a name="Talkie-Animate_Element-style" href="Animation#wiki-Talkie-Animate_Element-style">#</a> animate_element.<b>style</b>(<i>name</i>, <i>value</i>, [<i>duration</i>], [<i>easing</i>])

Animate a CSS style. In other words, returns a new Animate_Element object that has an animation for this style added to the end of its animation queue. Duration is in milliseconds. If the duration is omitted then the transition is performed immediately.

<a name="Talkie-Animate_Element-style" href="Animation#wiki-Talkie-Animate_Element-style">#</a> animate_element.<b>style</b>(<i>styles</i>, [<i>duration</i>], [<i>easing</i>])

Animate several styles simultaneously. For example:

    "0:05": number.style("font-size", "12px").text("✺")
                  .style({"font-size": "576px", "color": "#F83195"}, 500)

This example is taken from the [countdown demo](http://bl.ocks.org/4742904).

<a name="Talkie-Animate_Element-attr" href="Animation#wiki-Talkie-Animate_Element-attr">#</a> animate_element.<b>attr</b>(<i>name</i>, <i>value</i>, [<i>duration</i>], [<i>easing</i>])

Animate an attribute value.

<a name="Talkie-Animate_Element-and" href="Animation#wiki-Talkie-Animate_Element-and">#</a> animate_element.<b>and</b>(<i>another_animation</i>)

Used to create compound animations that affect several elements. The *other_animation* will typically be another Animate_Element object, but it may also be a user-defined action.

<a name="Talkie-Animate_Element-run" href="Animation#wiki-Talkie-Animate_Element-run">#</a> animate_element.<b>run</b>()

Run the animation immediately. You shouldn’t need to call this method yourself under ordinary circumstances, but it might occasionally be useful within a sophisticated user-defined action.
