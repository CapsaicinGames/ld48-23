
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

    // Box for the economy object to fill in
    // with its current state.  As this gets
    // more complex it could do with breaking down
    // to separate items
    Crafty.e("Status, HUD")
        .attr({ x : 20, y : 30, w : 100, h : 100} )
        .text("No colony");
    // Controls the speed of time / economy
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

    // The Pause button.  It doesn't like
    // being pressed repeatedly
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
    
    Crafty.c("MenuTopLevel", {
            label : "Blank",
            submenu : null,
            onClick : function() {
                // Ensure all other menus are closed
                Crafty("MenuTopLevel").each(function() {
                        if (this.submenu != null) {
                            // Delete the menu
                            Crafty(this.submenu).each(function() {
                                this.destroy();
                                });
                        }
                    });
                if (this.submenu != null)
                {
                    Crafty.e(this.submenu);
                }
            },
            init : function () {
                this.requires("HUD, Mouse");
                this.x = Crafty.viewport.width - 80;
                this.w = 60; 
                this.bind("Click", function() {this.onClick();});
            }
        });
    Crafty.c("BuildMenu", {
            init : function() {
                this.requires("HUD, Mouse");
                this.attr({ x: Crafty.viewport.width - 180,
                            y: 10,
                            w: 50,
                            h: 15});
                this.text("Mine");
                }
            });

    Crafty.e("MenuTopLevel")
        .attr({y: 10, h:15, label: "Build", submenu: "BuildMenu"})
        .text("Build");
    Crafty.e("MenuTopLevel")
        .attr({ y: 25, h:15, label: "Something"})
        .text("Research");

};
