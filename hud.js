
var menu_margin = 30;

var createBuildMenu = function() {
    var menu_width = 75;
    var menu_height = 15;
    var cur_x = Crafty.viewport.width - 200;
    var cur_y = Crafty.viewport.height - (menu_margin + menu_height);
    for (var name in buildingBlueprints)
    {
        if (buildingBlueprints[name].buildable != false)
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

    }
};

var hudModes = Object.freeze({
    nothing: {},
    select: {},
    build: {},
    destroy: {},
    placeShip: {},
    manage: {}
});

var hud_state = {
    mode: hudModes.placeShip,
    modeArg: ""
};

var hud_setup = function() {
    Crafty.c("HUD", {
        init: function () {
            this.addComponent("2D, DOM, Text"); 
            this.textColor("#0000ff");
            this.textFont({size:"10px", family:"sans"});
            this.css({
                "background-color":"white",
                "border-radius":"3px",
                "padding":"1px",
                });
            this.attr({z: 1000, alpha: 0.8});
            }
        });

    // Box for the economy object to fill in
    // with its current state.  As this gets
    // more complex it could do with breaking down
    // to separate items
    Crafty.e("Status, HUD")
        .attr({ x : menu_margin, y : menu_margin+20, w : 100, h : 200} )
        .text("No colony");
    // Controls the speed of time / economy
    Crafty.e("Time, HUD, Mouse")
        .attr({ x: menu_margin, y: menu_margin, h: 15, w: 50})
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
        .attr({x:menu_margin+50, y:menu_margin, h:15, w:50})
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
                hud_state.mode = hudModes.select;
                if (this.submenu != null)
                {
                    this.menuCtor();
                }
            },
            init : function () {
                this.requires("HUD, Mouse");
                this.w = 60; 
                this.x = Crafty.viewport.width - (this.w + menu_margin);
                this.bind("Click", function() {this.onClick();});
            }
        });
    Crafty.c("BuildMenu", {
            init : function() {
                this.requires("HUD, Mouse");
                }
            });
    Crafty.e("Selected, HUD")
        .attr({ y: menu_margin+40, h: 220, w: 100, x: Crafty.viewport.width - (menu_margin + 100)})
        .text("Nothing selected");

};

var hud_show = function() {
    var menu_height = 15;
    var cur_y = Crafty.viewport.height - (menu_height + menu_margin);
    Crafty.e("MenuTopLevel")
        .attr({y: cur_y, h: menu_height, 
                menuCtor: createBuildMenu, submenu: "BuildMenu"})
        .text("Build");
    cur_y -= menu_height;
    Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height})
        .text("Destroy")
        .bind("Click", function() {
            hud_state.mode = hudModes.destroy;
            hud_state.modeArg = "";
        });
    cur_y -= menu_height;
    Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height, isOverlayEnabled: false})
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
