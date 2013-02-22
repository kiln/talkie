// If jQuery is loaded, register ourselves as a jQuery plugin
if (window.jQuery) {
    var special_commands = {
        "animate": function($el) {
            var el = $el.get(0);
            return Talkie.animate(el.ownerDocument).select(el);
        }
    };
    
    var commands = {
        "timeline": function(element, timeline, options) {
            var t = Talkie.timeline(element, timeline, options);
            jQuery(element).data("_talkie_timeline", t);
        }
    };
    
    jQuery.fn.talkie = function(command) {
        var other_params = Array.prototype.slice.call(arguments, 1);
        var f = special_commands[command];
        if (f) {
            return f.apply(window, [this].concat(other_params));
        }
        f = commands[command];
        if (typeof f === "undefined") {
            Talkie.warn("No such command: " + command);
            return this;
        }
        return this.each(function() {
            f.apply(window, [this].concat(other_params));
        });
    };
}
