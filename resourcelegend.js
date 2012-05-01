
function showResourceLegend() {
    Crafty.e("ResourceLegend, HUD")
        .attr({
            x: menuMargin,
            y: 345 + menuMargin,
            w: 125,
            h: 100
        })
        .text("<em>Place a mine to extrace each resource</em></br></br>"
              + colouredText(boldText("ICE"), goodTextCol) + ": Extracts ice</br>"
              + colouredText(boldText("I"), goodTextCol) + ": Extracts iorn ore</br>"
              + colouredText(boldText("R"), goodTextCol) + ": Extracts regolith</br>"
              + colouredText(boldText("RE"), goodTextCol) + ": Extracts rare earth ore</br>"
             )
    ;
}

function hideResourceLegend() {
    Crafty("ResourceLegend").each(function() {
        this.destroy();
    });
}
