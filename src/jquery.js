// If jQuery is loaded, register ourselves as a jQuery plugin
if (window.jQuery) {
    jQuery.fn.talkie = function(timeline, options) {
        return this.each(function() {
            Talkie._initAudio(this, timeline, options);
        });
    };
}
