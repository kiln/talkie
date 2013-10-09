// http://stackoverflow.com/questions/9677885/convert-svg-path-to-absolute-commands
var makePathAbsolute = function(path) {
    if (path.getAttribute("data-talkie-madeAbsolute")) return;
    path.setAttribute("data-talkie-madeAbsolute", true);
    
    var x0, y0, x1, y1, x2, y2, segs = path.pathSegList;
    for (var x=0, y=0, i=0, len = segs.numberOfItems; i<len; ++i) {
        var seg = segs.getItem(i), c=seg.pathSegTypeAsLetter;
        if (/[MLHVCSQTA]/.test(c)){
            if ('x' in seg) x = seg.x;
            if ('y' in seg) y = seg.y;
        }
        else {
            if ('x1' in seg) x1 = x + seg.x1;
            if ('x2' in seg) x2 = x + seg.x2;
            if ('y1' in seg) y1 = y + seg.y1;
            if ('y2' in seg) y2 = y + seg.y2;
            if ('x' in seg) x += seg.x;
            if ('y' in seg) y += seg.y;
            switch(c) {
                case 'm': segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i); break;
                case 'l': segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i); break;
                case 'h': segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i); break;
                case 'v': segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i); break;
                case 'c': segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i); break;
                case 's': segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i); break;
                case 'q': segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i); break;
                case 't': segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i); break;
                case 'a': segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i); break;
                case 'z': case 'Z': x = x0; y = y0; break;
            }
        }
        // Record the start of a subpath
        if (c=='M' || c=='m') x0 = x, y0 = y;
    }
};

var normaliseElement = function(element) {
    if (element.empty()) return;
    var node = element.node();
    if (node.nodeName === "path") makePathAbsolute(node);
};




function Talkie_Animate_Base() {
    this.animations = [];
}
Talkie_Animate_Base.prototype.clone = function() {
    var r = new Talkie_Animate_Base();
    r.animations = this.animations.slice(0);
    return r;
};
Talkie_Animate_Base.prototype.pushAnimation = function(f, args) {
    var r = this.clone();
    r.animations.push([f, args]);
    return r;
};
Talkie_Animate_Base.prototype.and = function(chained_animation) {
    function runAnimation(timeline, chained_animation) {
        if (typeof chained_animation === "function") {
            chained_animation.call(timeline);
        }
        else {
            chained_animation.run(timeline);
        }
    }
    
    return this.pushAnimation(runAnimation, chained_animation);
};
Talkie_Animate_Base.prototype.run = function(timeline) {
    if (!timeline) timeline = {setUndo: function() {}};
    for (var i=0; i < this.animations.length; i++) {
        var animation = this.animations[i],
            method = animation[0],
            args = animation[1];
        method.call(this, timeline, args);
    }
};


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
    this._root = d3.select(root_element);
    if (this._root.empty()) {
        Talkie.warn("Selector does not match anything: " + root_element);
    }
}
Talkie.animate = function(root_element) {
    return new Talkie_Animate(root_element);
}

var animation_methods = [];

Talkie_Animate.prototype._element = function(selector) {
    if (selector instanceof window.Element) return d3.selectAll(selector);
    var element = this._root.selectAll(selector);
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

animation_methods.push("morphTo");
// which attributes determine the morphology of the element?
var morphAttributes = {
    "circle": ["cx", "cy", "r"],
    "path": ["d"],
    "line": ["x1", "y1", "x2", "y2"]
};
Talkie_Animate.prototype.morphTo = function(element, timeline, target_selector, duration, easing) {
    normaliseElement(element);
    var target = this._element(target_selector);
    if (target.empty()) return;
    normaliseElement(target);
    
    var t = startTransition(element, timeline, duration, easing)
    var from_values = [];
    var attributes = morphAttributes[target.node().nodeName]; // which attributes to morph
    if (!attributes) {
        Talkie.warn("Talkie doesn’t know how to morph a " + target.node().nodeName + " element");
        return;
    }
    
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
}
Talkie_Animate_Element.prototype = new Talkie_Animate_Base();
Talkie_Animate_Element.prototype.clone = function() {
    var r = new Talkie_Animate_Element(this.animate, this.element);
    r.animations = this.animations.slice(0);
    return r;
};

// For each animation method, make a wrapper
for (var i=0; i < animation_methods.length; i++) {
    (function(method) {
        Talkie_Animate_Element.prototype[method] = function() {
            if (this.element.empty()) return this;
            return this.pushAnimation(function(timeline, args) {
                this.animate[method].apply(this.animate, [this.element, timeline].concat(args));
            }, Array.prototype.slice.call(arguments, 0));
        };
    })(animation_methods[i]);
}
