
var menu_margin = 30;
var selectedMenu = "#e0ffe0";

function horizontalMenuCreator(menuWidth, menuHeight, menuPadding, itemCount) {
    this.menuWidth = menuWidth;
    this.menuHeight = menuHeight;
    this.menuPadding = menuPadding;

    this.curX = Crafty.viewport.width - 200;
    this.curY = Crafty.viewport.height - (menu_margin + this.menuHeight);

    this.nextMenuItem = function() {
        this.curX -= this.menuWidth + this.menuPadding;
        if (this.curX < menu_margin) {
            this.curY -= (this.menuHeight + this.menuPadding);
            this.curX = Crafty.viewport.width - 205 - this.menuWidth;
        }
    };

    return this;
}

function verticalMenuCreator(menuWidth, menuHeight, menuPadding, itemCount) {
    this.menuWidth = menuWidth;
    this.menuHeight = menuHeight;
    this.menuPadding = menuPadding;

    var itemsPerColumn = (Crafty.viewport.height - menu_margin) 
        / (menuHeight + menuPadding);

    this.curX = Crafty.viewport.width - 250;
    this.curY = menu_margin 
        + (itemCount < itemsPerColumn 
           ? (itemsPerColumn - itemCount) * (menuHeight + menuPadding) 
           : 0 
          );

    this.nextMenuItem = function() {
        this.curY += this.menuHeight + this.menuPadding;
        if (this.curY > Crafty.viewport.height - menu_margin) {
            this.curY = menu_margin;
            this.curX -= (this.menuPadding + this.menuWidth);
        }
    };

    return this;
}

var createBuildMenu = function() {
    var menu_width = 95;
    var menu_height = 16;
    var menu_padding = 5;
 
    var buildingNames = Object.keys(buildingBlueprints);
    buildingNames.sort();

    var buildingCount = buildingNames.length;

    var chosenMenuCreator = Crafty.viewport.width < 700
        ? horizontalMenuCreator
        : verticalMenuCreator;
    var menuBuilder
        = chosenMenuCreator(menu_width, menu_height, menu_padding, buildingCount);

    for (var buildingIndex in buildingNames)
    {
        var name = buildingNames[buildingIndex];

        if (buildingBlueprints[name].buildable != false)
        {
            _addBuildMenuItem(menuBuilder.curX, menuBuilder.curY, 
                              menu_width, menu_height, name);
            menuBuilder.nextMenuItem();
        }

    }
};

function _addBuildMenuItem(menuX, menuY, menuWidth, menuHeight, buildingName) {
    var txt = "<b>" + buildingName + "</b><br>";
    txt += "Costs:<ul class='reslist'>";
    for (var i = 0; 
         i < buildingBlueprints[buildingName].constructionCost.length; 
         ++i) {
        var res = buildingBlueprints[buildingName].constructionCost[i];
        txt += "<li>" + (-res.delta) + " " + res.r + "</li>";
    }

    txt += "</ul>";
    Crafty.e("BuildMenu")
        .text(buildingName)
        .attr({x : menuX, 
               y : menuY,
               w: menuWidth-1,
               h: menuHeight-2,
               printText: txt})
        .bind("Click", function() {
            
            Crafty("BuildMenu").each(function () {
                this.css({"background-color": "white"});
            });
            this.css({"background-color": selectedMenu});
            hud_state.mode = hudModes.build;
            hud_state.modeArg = this._text;
            var tmp = this.printText;
            Crafty("Selected").each(function() {
                this.text(tmp);
            });
        });
}

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
        .attr({ x : menu_margin, y : menu_margin+20, w : 110, h : 220} )
        .text("No colony");
    // Controls the speed of time / economy
    Crafty.e("Time, HUD, Mouse")
        .attr({ x: menu_margin, y: menu_margin, h: 15, w: 44})
        .text("x1")
        .bind("MouseDown", function() {
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
        .bind("MouseDown", function() {
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
                    this.css({"background-color":"white"});
                    if (this.submenu != null) {
                        // Delete the menu
                        Crafty(this.submenu).each(function() {
                            this.destroy();
                            });
                    }
                });
                // Clear current hud mode
                hud_state.mode = hudModes.select;
                hud_colonists(false,false);
                Crafty("Selected").each(function() {
                    this.text("Nothing selected");
                    });
                if (this.submenu != null)
                {
                    this.menuCtor();
                }

                var showStatusBar = this.submenu == null;
                Crafty("StatusBar").each(function () {
                        this.visible = showStatusBar;
                    });

                this.css({"background-color": selectedMenu});
            },
            init : function () {
                this.requires("HUD, Mouse");
                this.w = 60; 
                this.x = Crafty.viewport.width - (this.w + menu_margin);
                this.bind("MouseDown", function() {this.onClick();});
            }
        });
    Crafty.c("ColonistMenu", {
            init : function() {
                this.requires("HUD, Mouse");
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

    var statusBar = Crafty.e("StatusBar, HUD")
        .attr({
            x: menu_margin,
            y: Crafty.viewport.height - menu_margin - 15,
            w: (Crafty.viewport.width - (menu_margin*2)) * 0.75,
            h: 15,
            onTick: function() {
                var topMsg = statusMessages.calculateTopMessage();
                if (topMsg === null) {
                    this.text(" ");
                } else {
                    this.textColor(topMsg.s > 0 ? "#ff0000" : "#0000ff");
                    this.text("<b>" + topMsg.m + "</b>");
                }
                statusMessages.wipeAllMessages();
                //console.log(statusMessages);
            },
        })
        .text("here is a status message")
    ;

    statusMessages.addMessage("Choose a tile on the asteroid to place your lander");
    statusBar.onTick();

};

var hud_select_building = function() {
    var bldg = Crafty(hud_state.modeArg);
    var info = "<b>" + bldg.name + "</b><br>";
    var subinfo = "";
    for (var i = 0; i < bldg.resourceDeltas.length; ++i) {
        var res = bldg.resourceDeltas[i];
        if (res.delta < 0) {
            subinfo += "<li>" + (-res.delta) + " " + res.r + "</li>";
        }
    }
    if (subinfo.length > 0) {
        info += "Consumes:<ul class='reslist'>" + 
                subinfo + "</ul>";
        subinfo = "";
    }
    for (var i = 0; i < bldg.resourceDeltas.length; ++i) {
        var res = bldg.resourceDeltas[i];
        if (res.delta > 0) {
            subinfo += "<li>" + res.delta + " " + res.r + "</li>";
        }
    }
    if (subinfo.length > 0) {
        info += "Produces:<ul class='reslist'>";
        info += subinfo + "</ul>";
        subinfo = "";
    }
    if (bldg.has("Storage")) {
        info += "Stores:<ul class='reslist'>";
        for (var i = 0; i < bldg.storageDeltas.length; ++i) {
            var res = bldg.storageDeltas[i];
            if (res.delta > 0) {
                info += "<li>" + res.delta + " " + res.r + "</li>";
            }
        }
        info += "</ul>";
    }

    var bldgNeedsColonists = bldg.minActive > 0;

    if (bldgNeedsColonists) {
        info += "Colonists: " + bldg._colonists + "<br>";
    }

    info += bldg.isActive() ? "Active" : "<b>INACTIVE</b>";
    if (bldg.missing != "") {
        info += "<br>" + bldg.missing;
    }
    Crafty("Selected").each(function () { 
            this.text(info);}); 

    hud_colonists(bldgNeedsColonists, bldgNeedsColonists);
   
};

var hud_colonists = function(showplus, showminus) {
    Crafty("ColonistMenu").each(function() {this.destroy();});
    if (showplus === true) {
        Crafty.e("ColInc, ColonistMenu")
            .attr({x: Crafty.viewport.width - 50, y: menu_margin, w: 20, h: 15})
            .text("+")
            .bind("MouseDown", function() {
                    economy.populate(Crafty(hud_state.modeArg), 1);
                    hud_select_building();
                });
    }
    if (showminus === true) {
        Crafty.e("ColDec, ColonistMenu")
            .attr({x: Crafty.viewport.width - 80, y: menu_margin, w: 20, h: 15})
            .text("-")
            .bind("MouseDown", function() {
                    economy.populate(Crafty(hud_state.modeArg), -1);
                    hud_select_building();
                });
    } else {
    }
};

var hud_show = function() {
    var menu_height = 15;
    var cur_y = Crafty.viewport.height - (menu_height + menu_margin);
    Crafty.e("MenuTopLevel")
        .attr({y: cur_y, h: menu_height - 2, 
                menuCtor: createBuildMenu, submenu: "BuildMenu"})
        .text("Build");
    cur_y -= menu_height;
    Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height - 2})
        .text("Destroy")
        .bind("MouseDown", function() {
            hud_state.mode = hudModes.destroy;
            hud_state.modeArg = "";
        });
    cur_y -= menu_height;

    resourceOverlayView = null; // intentionally global
    resourceOverlayView = Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height -2, isOverlayEnabled: false})
        .text("Resources")
        .bind("MouseDown", function() {
            this.isOverlayEnabled = !this.isOverlayEnabled;
            showResources(this.isOverlayEnabled);
        });

};

var refreshResources = function() {
    showResources(resourceOverlayView.isOverlayEnabled);
}

var showResources = function(isShown) {
    Crafty("ResourceOverlay").each(function() {
        this.setVisibility(isShown);
    });
    
}

var statusMessages = {
    _currentMessages: [],
    
    addMessage: function(newMsg, strength) {
        this._currentMessages.push({m:newMsg, s:strength});
    },

    calculateTopMessage: function() {
        var strongestMessage = null;

        for(var msgIndex = 0; msgIndex < this._currentMessages.length; ++msgIndex) {
            if (strongestMessage === null || strongestMessage.s < this._currentMessages[msgIndex].s) {
                strongestMessage = this._currentMessages[msgIndex];
            }
        }
        
        return strongestMessage;
    },

    wipeAllMessages: function() {
        this._currentMessages = [];
    },
};
