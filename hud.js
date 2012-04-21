
var hud_setup = function() {
Crafty.c("HUD", {
        
            init: function () {
                this.addComponent("2D, DOM, Text"); 
                this.textColor("#0000ff")
                this.textFont({size:"10px", family:"sans"})
                this.css({
                    "background-color":"white",
                    "opacity": "0.5",
                    });
                this.z = 1000;
                }
            });



Crafty.e("Status, HUD")
    .attr({ x : 20, y : 30, w : 100, h : 150} )
    .text("No colony");
Crafty.e("Time, HUD, Mouse")
    .attr({ x: 20, y: 10, h: 15, w: 50})
    .text("x1")
    .bind("Click", function() {
            switch (economy.speed)
            {
                case 1:
                    economy.speed = 2;
                    this.text("x2");
                    break;
                case 2:
                    economy.speed = 5;
                    this.text("x5");
                    break;
                case 5:
                default:
                    economy.speed = 1;
                    this.text("x1");
                    }
            });
Crafty.e("Pause, HUD, Mouse")
    .attr({x:70, y:10, h:15, w:50})
    .text("Pause")
    .bind("Click", function() {
            if (economy.speed > 0)
            {
                economy.speed = 0;
                this.text("Play");
                Crafty("Time").each(function() {this.text("--") });
            } else {
                economy.speed = 1;
                economy.newStep();
                this.text("Pause");
                Crafty("Time").each(function() {this.text("x1") });
            }
            });
};
