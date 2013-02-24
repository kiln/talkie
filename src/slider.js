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
    var slider_element = Talkie.element(element_or_selector);
    
    this.arrow_prev = slider_element.getElementsByClassName("talkie-slider-arrowprev")[0];
    this.arrow_next = slider_element.getElementsByClassName("talkie-slider-arrownext")[0];
    
    this.frame = document.createElement("div");
    this.frame.className = "talkie-slider-frame";
    slider_element.appendChild(this.frame);
    
    this.panels = document.createElement("div");
    this.panels.className = "talkie-slider-panels";
    this.frame.appendChild(this.panels);
    
    this.selected_panel = 0;
    this.panel_elements = slider_element.querySelectorAll(".talkie-slider-panel");
    this.num_panels = this.panel_elements.length;
    this.panels_by_name = {};
    for (var i=0; i < this.panel_elements.length; i++) {
        var panel = this.panel_elements[i];
        this.panels.appendChild(panel);
        panel.style.width = this.frame.offsetWidth + "px";
        this.panels_by_name[panel.id.substr("panel-".length)] = i;
    }
    
    if (d3) {
        d3.select(this.panels).selectAll(".talkie-slider-panel").data(d3.range(this.num_panels));
    }
    var nav = slider_element.querySelector(".talkie-slider-nav");
    if (nav) this.navigation(nav);
    
    this._panelChanged();
    var slider = this;
    
    if (this.arrow_next) {
        slider_element.appendChild(this.arrow_next);
        this.arrow_next.style.top = (slider_element.offsetHeight - this.arrow_next.offsetHeight) / 2 + "px";
        Talkie.addEventListener(this.arrow_next, "click", function(e) {
            Talkie.preventDefault(e);
            slider._selectNextPanel();
        });
    }
    if (this.arrow_prev) {
        slider_element.appendChild(this.arrow_prev);
        this.arrow_prev.style.top = (slider_element.offsetHeight - this.arrow_prev.offsetHeight) / 2 + "px";
        Talkie.addEventListener(this.arrow_prev, "click", function(e) {
            Talkie.preventDefault(e);
            slider._selectPreviousPanel();
        });
    }
};


Talkie_Slider.prototype.navigation = function(element_or_selector) {
    var slider = this;
    var element = Talkie.element(element_or_selector);
    if (d3) {
        var nav = d3.select(element);
        nav.selectAll(".talkie-slider-nav-dot")
            .data(d3.range(this.num_panels)).enter()
            .append("div").attr("class", "talkie-slider-nav-dot");
        this.navdots = nav.selectAll(".talkie-slider-nav-dot");
        
        this.navdots.on("click", function(i) {
            slider._selectPanel(i);
            return false;
        });
        
        this._markSelectedNavDot();
    }
    return this;
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
            .style("margin-left", (-this.frame.clientWidth * this.selected_panel) + "px");
    
        if (this.arrow_prev) {
            d3.select(this.arrow_prev).transition().duration(500).style("opacity", this.selected_panel == 0 ? 0 : 1);
        }
        if (this.arrow_next) {
            d3.select(this.arrow_next).transition().duration(500).style("opacity", this.selected_panel == this.num_panels-1 ? 0 : 1);
        }
    }
    else {
        this.panels.style.marginLeft = (-this.frame.clientWidth * this.selected_panel) + "px";
        
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
    
    this._markSelectedNavDot();
    
    Talkie.fireEvent("Talkie.slider.load", this.panel_elements[this.selected_panel], {
        "explicitly": explicitly,
        "fromPanel": previously_selected_panel_name,
        "toPanel": this.selected_panel_name,
        "slider": this
    });
};
Talkie_Slider.prototype._markSelectedNavDot = function() {
    if (this.navdots) {
        var slider = this;
        this.navdots.classed("talkie-slider-nav-dot-selected", function(d,i) {
            return (i == slider.selected_panel);
        });
    }
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
