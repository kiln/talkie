Talkie = {
    "version": "1.0.3"
};

var warn = Talkie.warn = function() {
    if (console && console.log) {
        if (console.log.apply) {
            console.log.apply(console, arguments);
        }
        else {
            // Not only does IE not have console.log.apply, its console.log
            // will not usefully print the arguments pseudo-array; so we convert
            // the arguments to a real array first.
            console.log(Array.prototype.slice.call(arguments, 0));
        }
    }
};

Talkie.extend = function(d) {
    for (var k in d) {
        if (d.hasOwnProperty(k)) {
            if (Talkie.hasOwnProperty(k)) {
                warn("Refusing to override Talkie." + k);
                continue;
            }
            Talkie[k] = d[k];
        }
    }
};

Talkie.element = function(element_or_selector) {
    if (typeof element_or_selector === "string") {
        return document.querySelector(element_or_selector);
    }
    return element_or_selector;
};

Talkie.getStyle = function(element, style) {
    if (element.currentStyle) return element.currentStyle[style];
    return document.defaultView.getComputedStyle(element, null).getPropertyValue(style);
};
