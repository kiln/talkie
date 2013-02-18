function startTransition(element, timeline, duration, easing) {
    if (typeof duration === "undefined") duration = 0;
    
    cancelTransition(element);
    var k = element.node().__kiln_transitions__;
    var t = element.transition().duration(Talkie.fast_forward ? 0 : duration);
    if (easing) t.ease(easing);
    return {
        "attr": function(name, value) {
            k.push(["attr", name, value]);
            t.attr(name, value);
        },
        "style": function(name, value) {
            k.push(["style", name, value]);
            t.style(name, value);
        },
        "text": function(value) {
            k.push(["text", value]);
            t.text(value);
        },
        "attrInterpolateString": function(name, start_value, end_value) {
            k.push(["attr", name, end_value]);
            t.attrTween(name, function() { return d3.interpolateString(start_value, end_value); });
        }
    };
}
function cancelTransition(element) {
    element.transition().duration(0);
    var node = element.node();
    var k = node.__kiln_transitions__;
    if (k) {
        for (var i=0; i<k.length; i++) {
            var x = k[i], f = x[0], name = x[1], value = x[2];
            element[f](name, value);
        }
        k.length = 0;
    }
    else {
        node.__kiln_transitions__ = [];
    }
}

function Talkie_Animate(root_element) {
    if (typeof root_element === "undefined") root_element = document;
    this._root = d3.select(root_element)
}
Talkie.animate = function(root_element) {
    return new Talkie_Animate(root_element);
}

var animation_methods = [];

Talkie_Animate.prototype._element = function(selector) {
    var element = this._root.select(selector);
    if (element.empty()) {
        Talkie.warn("Selector does not match anything: " + selector + " in " + this._root);
    }
    return element;
};

Talkie_Animate.prototype.raw = function() {
    return this._root;
};

animation_methods.push("text");
Talkie_Animate.prototype.text = function(element, timeline, to_text, duration, easing) {
    var t = startTransition(element, timeline, duration, easing);
    var from_text = element.text();
    t.text(to_text);
    
    timeline.setUndo(function() {
        cancelTransition(element);
        element.text(from_text);
    });
    
    return this;
};

animation_methods.push("attr");
Talkie_Animate.prototype.attr = function(element, timeline, attribute, to_value, duration, easing) {
    var t = startTransition(element, timeline, duration, easing);
    var from_value = element.attr(attribute);
    t.attr(attribute, to_value);
    
    timeline.setUndo(function() {
        cancelTransition(element);
        element.attr(attribute, from_value);
    });
    
    return this;
};

animation_methods.push("attributes");
Talkie_Animate.prototype.attributes = function(element, timeline, attributes, target_selector, duration, easing) {
    var target = this._element(target_selector);
    
    var t = startTransition(element, timeline, duration, easing)
    var from_values = [];
    for (var i=0; i < attributes.length; i++) {
        var attribute = attributes[i];
        from_values.push(element.attr(attribute));
        t.attr(attribute, target.attr(attribute));
    }
    
    timeline.setUndo(function() {
        cancelTransition(element);
        for (var i=0; i < attributes.length; i++) {
            element.attr(attributes[i], from_values[i]);
        }
    });
    
    return this;
};

Talkie_Animate.prototype._style_single = function(element, timeline, style, to_value, duration, easing) {
    var t = startTransition(element, timeline, duration, easing);
    var from_value = element.style(style);
    t.style(style, to_value);
    
    timeline.setUndo(function() {
        cancelTransition(element);
        element.style(style, from_value);
    });
    
    return this;
};

Talkie_Animate.prototype._style_multi = function(element, timeline, style_changes, duration, easing) {
    var t = startTransition(element, timeline, duration, easing);
    
    var from_values = {};
    for (var style in style_changes) {
        if (!style_changes.hasOwnProperty(style)) continue;
        from_values[style] = element.style(style);
        t.style(style, style_changes[style]);
    }
    
    timeline.setUndo(function() {
        cancelTransition(element);
        for (var style in style_changes) {
            if (!style_changes.hasOwnProperty(style)) continue;
            element.style(style, from_values[style]);
        }
    });
    
    return this;
};

animation_methods.push("style");
Talkie_Animate.prototype.style = function(element, timeline, discriminator) {
    if (typeof discriminator === "string") {
        return this._style_single.apply(this, arguments);
    }
    else {
        return this._style_multi.apply(this, arguments);
    }
};

Talkie_Animate.prototype.select = function(selector) {
    var element = this._element(selector);
    return new Talkie_Animate_Element(this, element);
}

function Talkie_Animate_Element(animate, element) {
    this.animate = animate;
    this.element = element;
    this.animations = [];
}
Talkie_Animate_Element.prototype.clone = function() {
    var r = new Talkie_Animate_Element(this.animate, this.element);
    r.animations = this.animations.slice(0);
    return r;
};

// For each animation method, make a wrapper
for (var i=0; i < animation_methods.length; i++) {
    (function(method) {
        Talkie_Animate_Element.prototype[method] = function() {
            var r = this.clone();
            r.animations.push([method, Array.prototype.slice.call(arguments, 0)]);
            return r;
        };
    })(animation_methods[i]);
}
Talkie_Animate_Element.prototype.and = function(chained_animation) {
    var r = this.clone();
    r.animations.push(["and", chained_animation]);
    return r;
};
Talkie_Animate_Element.prototype.run = function(timeline) {
    for (var i=0; i < this.animations.length; i++) {
        var animation = this.animations[i],
            method = animation[0],
            args = animation[1];
        
        if (method === "and") {
            if (typeof args === "function") args.call(timeline); else args.run(timeline);
        }
        else if (!this.element.empty()) {
            this.animate[method].apply(this.animate, [this.element, timeline].concat(args));
        }
    }
};
