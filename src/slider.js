var Talkie_Animate_Slider = function(slider, panel_name) {
    this.animations = [[function(timeline) {
        var previously_selected_panel = slider.selected_panel_name;
        slider._selectPanelByName(panel_name);
        timeline.setUndo(function() {
            slider._selectPanelByName(previously_selected_panel);
        });
    }]];
};
Talkie_Animate_Slider.prototype = new Talkie_Animate_Base();

var Talkie_Slider = function(element_or_selector) {
    this.panels = Talkie.element(element_or_selector);
    
    var frame = document.createElement("div");
    frame.className = "talkie-slider-frame";
    this.frame_inner = document.createElement("div");
    this.frame_inner.className = "talkie-slider-frame-inner";

    var arrow_prev_maybe = this.panels.getElementsByClassName("talkie-slider-arrowprev");
    this.arrow_prev = arrow_prev_maybe.length ? arrow_prev_maybe[0] : null;

    var arrow_next_maybe = this.panels.getElementsByClassName("talkie-slider-arrownext");
    this.arrow_next = arrow_next_maybe.length ? arrow_next_maybe[0] : null;
    
    if (this.arrow_prev) frame.appendChild(this.arrow_prev);
    frame.appendChild(this.frame_inner);
    if (this.arrow_next) frame.appendChild(this.arrow_next);
    this.panels.parentNode.insertBefore(frame, this.panels);
    
    this.selected_panel = 0;
    this.panel_elements = [];
    for (var i=0; i < this.panels.childNodes.length; i++) {
        var node = this.panels.childNodes[i];
        if (node.getAttribute && node.className === "talkie-slider-panel")
            this.panel_elements.push(this.panels.childNodes[i]);
    }
    this.num_panels = this.panel_elements.length;
    this.frame_inner.appendChild(this.panels);
    
    this.panels_by_name = {};
    for (var i=0; i < this.num_panels; i++) {
        this.panels_by_name[this.panel_elements[i].id.substr("panel-".length)] = i;
    }
    
    if (d3) {
        d3.select(this.panels).selectAll(".panel").data(d3.range(this.num_panels));
    
        d3.select(".navdotcontainer").selectAll(".navdot")
            .data(d3.range(this.num_panels)).enter()
            .append("div").attr("class", "navdot");
        var navdots = d3.select(".navdotcontainer").selectAll(".navdot");
    }
    
    this._panelChanged();

    if (navdots) {
        navdots.on("click", function(i) {
            this._selectPanel(i);
            return false;
        });
    }
    
    var slider = this;
    if (this.arrow_next) {
        Talkie.addEventListener(this.arrow_next, "click", function(e) {
            Talkie.preventDefault(e);
            slider._selectNextPanel();
        });
    }
    if (this.arrow_prev) {
        Talkie.addEventListener(this.arrow_prev, "click", function(e) {
            Talkie.preventDefault(e);
            slider._selectPreviousPanel();
        });
    }
};


Talkie_Slider.prototype.panel = function(panel_name) {
    return new Talkie_Animate_Slider(this, panel_name);
};
Talkie_Slider.prototype.slideTo = function(panel_name) {
    this._selectPanelByName(panel_name);
};

// explicitly - true if the panel was changed explicitly by the user
Talkie_Slider.prototype._panelChanged = function(explicitly) {
    var previously_selected_panel_name = this.selected_panel_name;
    this.selected_panel_name = this.panel_elements[this.selected_panel].id.substr("panel-".length);
    
    if (d3) {
        d3.select(this.panels).transition().duration(500)
            .style("margin-left", (-this.frame_inner.clientWidth * this.selected_panel) + "px");
    
        if (this.arrow_prev) {
            d3.select(this.arrow_prev).transition().duration(500).style("opacity", this.selected_panel == 0 ? 0 : 1);
        }
        if (this.arrow_next) {
            d3.select(this.arrow_next).transition().duration(500).style("opacity", this.selected_panel == this.num_panels-1 ? 0 : 1);
        }
    }
    else {
        this.panels.style.marginLeft = (-this.frame_inner.clientWidth * this.selected_panel) + "px";
        
        if (this.arrow_prev) {
            if (this.selected_panel == 0) {
                this.arrow_prev.style.opacity = 1;
                this.arrow_prev.style.visibility = "hidden";
            }
            else
                this.arrow_prev.style.visibility = "visible";
        }
    
        if (this.arrow_next) {
            if (this.selected_panel == this.num_panels-1)
                this.arrow_next.style.visibility = "hidden";
            else
                this.arrow_next.style.visibility = "visible";
        }
    }

    if (this.navdots) {
        this.navdots.classed("navdotselected", function(d,i) {
            return (i == this.selected_panel);
        });
    }
    
    Talkie.fireEvent("Talkie.slider.load", this.panel_elements[this.selected_panel], {
        "explicitly": explicitly,
        "fromPanel": previously_selected_panel_name,
        "toPanel": this.selected_panel_name,
        "slider": this
    });
};
Talkie_Slider.prototype._selectPanel = function(i) {
    this.selected_panel = i;
    this._panelChanged();
};
Talkie_Slider.prototype._selectPanelByName = function(panel_name) {
    if (panel_name in this.panels_by_name)
        this._selectPanel(this.panels_by_name[panel_name]);
};
Talkie_Slider.prototype._selectNextPanel = function() {
    if (this.selected_panel == this.num_panels-1) return;
    
    this.selected_panel++;
    this._panelChanged(true);
};
Talkie_Slider.prototype._selectPreviousPanel = function() {
    if (this.selected_panel == 0) return;
    
    this.selected_panel--;
    this._panelChanged(true);
};


Talkie.slider = function(element_or_selector) {
    return new Talkie_Slider(element_or_selector);
};
