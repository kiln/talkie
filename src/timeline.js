function _t(timecode) {
    if (typeof timecode === "string") {
        var m = timecode.match(/^(\d+):(\d+(?:\.\d+)?)$/);
        if (m) {
            return parseInt(m[1]) * 60 + parseFloat(m[2]);
        }
        Talkie.warn("Failed to parse timecode: " + timecode);
    }
    return timecode;
}

var animation_undo_stack = [],
    animation_current_index = -1; // index of last animation performed
var timecode;
Talkie.timeline = function(soundtrack_element, track_animations, options) {
    soundtrack_element.addEventListener("timeupdate", function() {
        while (animation_undo_stack.length > 0
            && animation_undo_stack[animation_undo_stack.length-1][0] > this.currentTime)
        {
            var stack_top = animation_undo_stack.pop();
            stack_top[1]();
            animation_current_index = stack_top[2];
        }
        
        for (var i = animation_current_index + 1;
             i < track_animations.length && _t(track_animations[i][0]) <= this.currentTime;
             i++
        ) {
            Talkie.fast_forward = (i+1 < track_animations.length && track_animations[i+1][0] <= this.currentTime);
            timecode = _t(track_animations[i][0]);
            track_animations[i][1]();
            animation_current_index = i;
        }
    }, false);
    if (options && options.onplay) {
        soundtrack_element.addEventListener("play", options.onplay, false);
    }
}
Talkie.setAnimationUndo = function(undo_function) {
    animation_undo_stack.push([timecode, undo_function, animation_current_index]);
}
/*
Talkie.rewind = function() {
    if (track.readyState >= 1) {
        animation_undo_stack = [];
        animation_current_index = -1;
        soundtrack.pause();
        soundtrack.currentTime = 0;
    }
}
*/
