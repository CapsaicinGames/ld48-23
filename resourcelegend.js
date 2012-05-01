
function showResourceLegend() {
    Crafty.e("ResourceLegend, HUD")
        .attr({
            x: menuMargin,
            y: 345 + menuMargin,
            w: 125,
            h: 100
        })
        .text("Place a mine to extrace each resource</br></br>"
              + "ICE: Extracts ice</br>"
              + "I: Extracts iorn ore</br>"
              + "R: Extracts regolith</br>"
              + "RE: Extracts rare earth ore</br>"
             )
    ;
}

function hideResourceLegend() {
    Crafty("ResourceLegend").each(function() {
        this.destroy();
    });
}
