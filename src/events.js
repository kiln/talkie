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
Talkie.addEventListener = function(element_id, event_name, event_handler) {
    var element = document.getElementById(element_id);
    if (element.addEventListener)
        element.addEventListener(event_name, event_handler, false);
    else if (element.attachEvent)
        element.attachEvent("on" + event_name, event_handler);
    else
        element["on" + event_handler] = event_handler;
};
Talkie.fireEvent = function(event_type, element) {
    var event;
    if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(event_type, true, true);
    }
    else if (document.createEventObject) {
        event = document.createEventObject();
        event.eventType = event_type;
    }

    if (element.dispatchEvent) {
        element.dispatchEvent(event);
    }
    else if (element.fireEvent) {
        element.fireEvent("on" + event.eventType, event);
    }
};
