var Talkie_Animate_Slider = function(slider, panel_element_or_selector) {
    var panel_element = Talkie.element(panel_element_or_selector);
    if (!panel_element) return;
    var panel_index = parseInt(panel_element.getAttribute("data-talkie-panel-index"));
    
    this.animations = [[function(timeline) {
        var previously_selected_panel = slider.selected_panel;
        slider._selectPanel(panel_index);
        timeline.setUndo(function() {
            slider._selectPanel(previously_selected_panel);
        });
    }]];
};
Talkie_Animate_Slider.prototype = new Talkie_Animate_Base();

var Talkie_Slider = function(element_or_selector) {
    var slider_element = Talkie.element(element_or_selector);
    
    if (!slider_element.classList) {
        // Oh, hello IE!
        if (!slider_element.className.match(/\btalkie-slider\b/)) {
            slider_element.className += " talkie-slider";
        }
    }
    else if (!slider_element.classList.contains("talkie-slider")) {
        slider_element.classList.add("talkie-slider");
    }
    
    this.arrow_prev = slider_element.getElementsByClassName("talkie-slider-arrowprev")[0];
    this.arrow_next = slider_element.getElementsByClassName("talkie-slider-arrownext")[0];
    
    this.frame = document.createElement("div");
    this.frame.className = "talkie-slider-frame";
    slider_element.appendChild(this.frame);
    
    this.panels = document.createElement("div");
    this.panels.className = "talkie-slider-panels";
    this.frame.appendChild(this.panels);
    
    this.panel_elements = slider_element.querySelectorAll(".talkie-slider-panel");
    this.num_panels = this.panel_elements.length;
    for (var i=0; i < this.panel_elements.length; i++) {
        var panel = this.panel_elements[i];
        this.panels.appendChild(panel);
        panel.style.width = this.frame.offsetWidth + "px";
        panel.setAttribute("data-talkie-panel-index", i);
    }
    
    if (d3) {
        d3.select(this.panels).selectAll(".talkie-slider-panel").data(d3.range(this.num_panels));
    }
    var nav = slider_element.querySelector(".talkie-slider-nav");
    if (nav) this.navigation(nav);
    
    this._panelChanged(0);
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
        nav.classed("talkie-slider-nav", true);
        nav.selectAll(".talkie-slider-nav-dot")
            .data(d3.range(this.num_panels)).enter()
            .append("div").attr("class", "talkie-slider-nav-dot");
        this.navdots = nav.selectAll(".talkie-slider-nav-dot");
        
        this.navdots.on("click", function(i) {
            slider._selectPanel(i, true);
            return false;
        });
        
        this._markSelectedNavDot();
    }
    return this;
};
Talkie_Slider.prototype.panel = function(panel_element_or_selector) {
    return new Talkie_Animate_Slider(this, panel_element_or_selector);
};
Talkie_Slider.prototype.slideTo = function(panel_element_or_selector) {
    this._selectPanelByElement(Talkie.element(panel_element_or_selector));
};

// explicitly - true if the panel was changed explicitly by the user
Talkie_Slider.prototype._panelChanged = function(new_panel, explicitly) {
    var previously_selected_panel = this.selected_panel;
    this.selected_panel = parseInt(new_panel);
    
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
        "fromPanel": this.panel_elements[previously_selected_panel],
        "toPanel": this.panel_elements[this.selected_panel],
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
Talkie_Slider.prototype._selectPanel = function(i, explicitly) {
    this._panelChanged(i, explicitly);
};
Talkie_Slider.prototype._selectPanelByElement = function(element) {
    if (!element) return;
    this._panelChanged(element.getAttribute("data-talkie-panel-index"));
};
Talkie_Slider.prototype._selectNextPanel = function() {
    if (this.selected_panel == this.num_panels-1) return;
    
    this._panelChanged(this.selected_panel + 1, true);
};
Talkie_Slider.prototype._selectPreviousPanel = function() {
    if (this.selected_panel == 0) return;
    
    this._panelChanged(this.selected_panel - 1, true);
};


Talkie.slider = function(element_or_selector) {
    return new Talkie_Slider(element_or_selector);
};
