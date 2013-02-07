var cancelTransition = function(element) {
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
};
var startTransition = function(element, duration, easing) {
    if (typeof duration === "undefined") duration = 1000;
    
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
};

var Talkie_Animate = function(selector) {
    this.element = d3.select(selector);
    if (this.element.empty()) {
        Talkie.warn("Selector does not match anything: " + selector);
    }
};

Talkie.animate = function(selector) {
    return new Talkie_Animate(selector);
}

Talkie_Animate.prototype.text = function(from_text, to_text, duration, easing) {
    var element = this.element;
    var t = startTransition(element, duration, easing);
    t.text(to_text);
    
    Talkie.setAnimationUndo(function() {
        cancelTransition(element);
        element.text(from_text);
    });
    
    return this;
};
    
Talkie_Animate.prototype.attr = function(attribute, from_value, to_value, duration, easing) {
    var element = this.element;
    element.attr(attribute, from_value);
    startTransition(element, duration, easing).attr(attribute, to_value);
    
    Talkie.setAnimationUndo(function() {
        cancelTransition(element);
        element.attr(attribute, from_value);
    });
    
    return this;
};

Talkie_Animate.prototype._style_single = function(style, from_value, to_value, duration, easing) {
    var element = this.element;
    element.style(style, from_value);
    startTransition(element, duration, easing).style(style, to_value);
    
    Talkie.setAnimationUndo(function() {
        cancelTransition(element);
        element.style(style, from_value);
    });
    
    return this;
};

Talkie_Animate.prototype._style_multi = function(style_changes, duration, easing) {
    var element = this.element;
    var t = startTransition(element, duration, easing);
    
    for (var i=0; i < style_changes.length; i++) {
        var style_change = style_changes[i],
            style = style_change[0],
            from_value = style_change[1],
            to_value = style_change[2];
        
        element.style(style, from_value);
        t.style(style, to_value);
    }
    
    Talkie.setAnimationUndo(function() {
        cancelTransition(element);
        for (var i=0; i < style_changes.length; i++) {
            var style_change = style_changes[i],
                style = style_change[0],
                from_value = style_change[1];
            
            element.style(style, from_value);
        }
    });
    
    return this;
};

Talkie_Animate.prototype.style = function(discriminator) {
    if (typeof discriminator === "string") {
        return this._style_single.apply(this, arguments);
    }
    else {
        return this._style_multi.apply(this, arguments);
    }
}
