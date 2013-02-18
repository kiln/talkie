Talkie.preventDefault = function(e) {
    if (window.event && event.preventDefault) {
        event.preventDefault();
    }
    else if (e.preventDefault) {
        e.preventDefault();
    }
    else {
        event.returnValue = false;
    }
};
function _addEventListener(element, event_name, event_handler) {
    if (element.addEventListener)
        element.addEventListener(event_name, event_handler, false);
    else if (element.attachEvent)
        element.attachEvent("on" + event_name, event_handler);
    else
        element["on" + event_handler] = event_handler;
}
Talkie.addEventListener = function(selector_or_element, event_name, event_handler) {
    if (typeof selector_or_element === "string") {
        var elements = document.querySelectorAll(selector_or_element);
        for (var i=0; i<elements.length; i++) {
            var element = elements[i];
            _addEventListener(element, event_name, event_handler);
        }
    }
    else {
        // Assume it’s an element
        _addEventListener(selector_or_element, event_name, event_handler);
    }
};
Talkie.fireEvent = function(event_type, element, attributes) {
    var event;
    if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(event_type, true, true);
    }
    else if (document.createEventObject) {
        event = document.createEventObject();
        event.eventType = event_type;
    }
    
    if (attributes) {
        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                event[attr] = attributes[attr];
            }
        }
    }

    if (element.dispatchEvent) {
        element.dispatchEvent(event);
    }
    else if (element.fireEvent) {
        element.fireEvent("on" + event.eventType, event);
    }
};
