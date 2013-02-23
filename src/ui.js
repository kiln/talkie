Talkie.ui = { "version": "1.0" }; // Not necessarily the same as Talkie.version

Talkie.ui.playButton = function(element_or_selector, timeline) {
    var element = Talkie.element(element_or_selector);
    
    var play_button = document.createElement("div");
    play_button.className = "talkie-play-button";
    
    if (Talkie.getStyle(element, "position") !== "relative") {
        element.style.position = "relative";
    }
    element.appendChild(play_button);
    play_button.style.left = (element.offsetWidth - play_button.offsetWidth) / 2 + "px";
    play_button.style.top = (element.offsetHeight - play_button.offsetHeight) / 2 + "px";
    
    Talkie.addEventListener(play_button, "click", function() {
        timeline.play();
    });
    timeline.onPlay(function() {
        element.removeChild(play_button);
    })
};
