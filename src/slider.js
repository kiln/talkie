    var selected_panel_name,
        selectPanelByName, selectNextPanel, selectPreviousPanel;
    function initPanels() {
        var panels = document.getElementById("panels");
        var selected_panel = 0;
        var panel_elements = [];
        for (var i=0; i < panels.childNodes.length; i++) {
            var node = panels.childNodes[i];
            if (node.getAttribute && node.className === "panel")
                panel_elements.push(panels.childNodes[i]);
        }
        var num_panels = panel_elements.length;
        
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
        
        var panelChanged = function() {
            selected_panel_name = panel_elements[selected_panel].id.substr("panel-".length);
            
            if (d3) {
                d3.select(panels).transition().duration(500)
                    .style("margin-left", (-900 * selected_panel) + "px");
            
                d3.select("#arrowprevious").transition().duration(500).style("opacity", selected_panel == 0 ? 0 : 1);
                d3.select("#arrownext").transition().duration(500).style("opacity", selected_panel == num_panels-1 ? 0 : 1);
            }
            else {
                panels.style.marginLeft = (-900 * selected_panel) + "px";
            
                if (selected_panel == 0) {
                    var arrow_prev_style = document.getElementById("arrowprevious").style;
                    arrow_prev_style.opacity = 1;
                    arrow_prev_style.visibility = "hidden";
                }
                else
                    document.getElementById("arrowprevious").style.visibility = "visible";
            
                if (selected_panel == num_panels-1)
                    document.getElementById("arrownext").style.visibility = "hidden";
                else
                    document.getElementById("arrownext").style.visibility = "visible";
            }

            if (navdots) {
                navdots.classed("navdotselected", function(d,i) {
                    return (i == selected_panel);
                });
            }
            
            fireEvent("torkie.panel.load", panel_elements[selected_panel]);
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
                if (track != null && !track.paused) track.pause();
                selectPanel(i);
                return false;
            });
        }
        
        selectNextPanel = function() {
            if (selected_panel == num_panels-1) return;
            
            selected_panel++;
            if (track != null && !track.paused) track.pause();
            panelChanged();
        };
        selectPreviousPanel = function() {
            if (selected_panel == 0) return;
            
            selected_panel--;
            if (track != null && !track.paused) track.pause();
            panelChanged();
        };
        
        addEventListener("arrownext-link", "click", function(e) {
            preventDefault(e);
            selectNextPanel();
        });
        addEventListener("arrowprevious-link", "click", function(e) {
            preventDefault(e);
            selectPreviousPanel();
        });
    }


    var animatePanelTransition = function(from_panel, to_panel) {
        Torkie.selectPanelByName(to_panel);
        Torkie.setAnimationUndo(function() { Torkie.selectPanelByName(from_panel); });
    };
