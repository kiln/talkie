var selected_panel_name,
    selectPanelByName, selectNextPanel, selectPreviousPanel;
Talkie.slider = function(element_or_selector) {
    var panels;
    if (typeof element_or_selector === "string") {
        panels = document.querySelector(element_or_selector);
    }
    else {
        panels = element_or_selector;
    }
    
    var frame = document.createElement("div");
    frame.className = "talkie-slider-frame";
    var frame_inner = document.createElement("div");
    frame_inner.className = "talkie-slider-frame-inner";

    var arrow_prev = document.createElement("div");
    arrow_prev.className = "talkie-slider-arrowprev";
    var arrow_prev_link = document.createElement("a");
    arrow_prev_link.className = "talkie-slider-arrowprev-link";
    arrow_prev_link.setAttribute("href", "#");
    var arrow_prev_img = document.createElement("img");
    arrow_prev_img.setAttribute("src", "../images/arrow-prev.png");
    arrow_prev_img.setAttribute("width", "24");
    arrow_prev_img.setAttribute("height", "43");
    arrow_prev_img.setAttribute("alt", "⬅");
    arrow_prev_link.appendChild(arrow_prev_img);
    arrow_prev.appendChild(arrow_prev_link);

    var arrow_next = document.createElement("div");
    arrow_next.className = "talkie-slider-arrownext";
    var arrow_next_link = document.createElement("a");
    arrow_next_link.className = "talkie-slider-arrownext-link";
    arrow_next_link.setAttribute("href", "#");
    var arrow_next_img = document.createElement("img");
    arrow_next_img.setAttribute("src", "../images/arrow-next.png");
    arrow_next_img.setAttribute("width", "24");
    arrow_next_img.setAttribute("height", "43");
    arrow_next_img.setAttribute("alt", "➡");
    arrow_next_link.appendChild(arrow_next_img);
    arrow_next.appendChild(arrow_next_link);
    
    frame.appendChild(arrow_prev);
    frame.appendChild(frame_inner);
    frame.appendChild(arrow_next);
    panels.parentNode.insertBefore(frame, panels);
    
    var selected_panel = 0;
    var panel_elements = [];
    for (var i=0; i < panels.childNodes.length; i++) {
        var node = panels.childNodes[i];
        if (node.getAttribute && node.className === "talkie-slider-panel")
            panel_elements.push(panels.childNodes[i]);
    }
    var num_panels = panel_elements.length;
    frame_inner.appendChild(panels);
    // if (panels.className) panels.className += " talkie-panels";
    // else panels.className = "talkie-panels";
    
    var panels_by_name = {};
    for (var i=0; i < num_panels; i++) {
        panels_by_name[panel_elements[i].id.substr("panel-".length)] = i;
    }
    
    if (d3) {
        d3.select(panels).selectAll(".panel").data(d3.range(num_panels));
    
        d3.select(".navdotcontainer").selectAll(".navdot")
            .data(d3.range(num_panels)).enter()
            .append("div").attr("class", "navdot");
        var navdots = d3.select(".navdotcontainer").selectAll(".navdot");
    }
    
    // explicitly - true if the panel was changed explicitly by the user
    var panelChanged = function(explicitly) {
        var previously_selected_panel_name = selected_panel_name;
        selected_panel_name = panel_elements[selected_panel].id.substr("panel-".length);
        
        if (d3) {
            d3.select(panels).transition().duration(500)
                .style("margin-left", (-frame_inner.clientWidth * selected_panel) + "px");
        
            d3.select(arrow_prev).transition().duration(500).style("opacity", selected_panel == 0 ? 0 : 1);
            d3.select(arrow_next).transition().duration(500).style("opacity", selected_panel == num_panels-1 ? 0 : 1);
        }
        else {
            panels.style.marginLeft = (-frame_inner.clientWidth * selected_panel) + "px";
        
            if (selected_panel == 0) {
                arrow_prev.style.opacity = 1;
                arrow_prev.style.visibility = "hidden";
            }
            else
                arrow_prev.style.visibility = "visible";
        
            if (selected_panel == num_panels-1)
                arrow_next.style.visibility = "hidden";
            else
                arrow_next.style.visibility = "visible";
        }

        if (navdots) {
            navdots.classed("navdotselected", function(d,i) {
                return (i == selected_panel);
            });
        }
        
        Talkie.fireEvent("Talkie.slider.load", panel_elements[selected_panel], {
            "explicitly": explicitly,
            "fromPanel": previously_selected_panel_name,
            "toPanel": selected_panel_name
        });
    };
    panelChanged();
    
    var selectPanel = function(i) {
        selected_panel = i;
        panelChanged();
    };
    selectPanelByName = function(panel_name) {
        if (panel_name in panels_by_name)
            selectPanel(panels_by_name[panel_name]);
    };

    if (navdots) {
        navdots.on("click", function(i) {
            selectPanel(i);
            return false;
        });
    }
    
    selectNextPanel = function() {
        if (selected_panel == num_panels-1) return;
        
        selected_panel++;
        panelChanged(true);
    };
    selectPreviousPanel = function() {
        if (selected_panel == 0) return;
        
        selected_panel--;
        panelChanged(true);
    };
    
    Talkie.addEventListener(arrow_next_link, "click", function(e) {
        Talkie.preventDefault(e);
        selectNextPanel();
    });
    Talkie.addEventListener(arrow_prev_link, "click", function(e) {
        Talkie.preventDefault(e);
        selectPreviousPanel();
    });
    
    return {
        "panel": function(panel_name) {
            return function() {
                var previously_selected_panel = selected_panel_name;
                selectPanelByName(panel_name);
                this.setUndo(function() {
                    selectPanelByName(previously_selected_panel);
                });
            };
        },
        "slideTo": function(panel_name) {
            selectPanelByName(panel_name);
        }
    };
};
