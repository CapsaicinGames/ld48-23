
var createBuildMenu = function() {
    var cur_x = Crafty.viewport.width - 200;
    var cur_y = Crafty.viewport.height - 30;
    var menu_width = 75;
    var menu_height = 15;
    for (var name in buildingBlueprints)
    {
        Crafty.e("BuildMenu")
            .text(name)
            .attr({x : cur_x, 
                    y : cur_y,
                    w: menu_width-1,
                    h: menu_height-1})
            .bind("Click", function() {
                    hud_state.mode = hudModes.build;
                    hud_state.modeArg = this._text;
                });
        cur_x -= menu_width;
        if (cur_x < menu_width) {
            cur_y -= menu_height;
            cur_x = Crafty.viewport.width - 200 - menu_width;
        }

    }
};

var hudModes = Object.freeze({
    nothing: {},
    build: {},
    destroy: {},
    manage: {}
});

var hud_state = {
    mode: hudModes.nothing,
    modeArg: "",
};

var hud_setup = function() {
    Crafty.c("HUD", {
        init: function () {
            this.addComponent("2D, DOM, Text"); 
            this.textColor("#0000ff");
            this.textFont({size:"10px", family:"sans"});
            this.css({
                "background-color":"white",
                });
            this.attr({z: 1000, alpha: 0.8});
            }
        });

    // Box for the economy object to fill in
    // with its current state.  As this gets
    // more complex it could do with breaking down
    // to separate items
    Crafty.e("Status, HUD")
        .attr({ x : 20, y : 30, w : 100, h : 200} )
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
            menuCtor : null,
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
                // Clear current hud mode
                hud_state.mode = hudModes.nothing;
                if (this.submenu != null)
                {
                    this.menuCtor();
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
                }
            });

    Crafty.e("MenuTopLevel")
        .attr({y: Crafty.viewport.height - 30, h:15, menuCtor: createBuildMenu, submenu: "BuildMenu"})
        .text("Build");
    Crafty.e("MenuTopLevel")
        .attr({ y: Crafty.viewport.height - 45, h:15})
        .text("Destroy")
        .bind("Click", function() {
            hud_state.mode = hudModes.destroy;
            hud_state.modeArg = "";
        });
    Crafty.e("MenuTopLevel")
        .attr({ y: Crafty.viewport.height - 60, h:15, isOverlayEnabled: false})
        .text("Resources")
        .bind("Click", function() {
            var isOverlayEnabledNow = !this.isOverlayEnabled;
            console.log("setting visibility " + isOverlayEnabledNow);
            Crafty("ResourceOverlay").each(function() {
                this.setVisibility(isOverlayEnabledNow);
            });
            this.isOverlayEnabled = isOverlayEnabledNow;
        });

};
