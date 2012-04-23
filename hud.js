/* In theory all code that displays a nice white box
 * on the screen is here.  In actuality, it's mixed in with
 * the game logic a lot.
 */

// Don't put anything on the screen closer to the edge
// than this.  The viewport is also shifted slightly down
// and to the right for some reason, can't work out why
var menuMargin = 25;
var bgCol = "#002b36"; // base03
var textCol = "#839496"; // base0
var goodTextCol = "#268bd2"; // blue (because green is a bit yellow)
var errorTextCol = "#dc322f"; // red
var selectedMenu = "#073642"; // base02
//var selectedMenu = "#e0ffe0";

function horizontalMenuCreator(menuWidth, menuHeight, menuPadding, itemCount) {
    this.menuWidth = menuWidth;
    this.menuHeight = menuHeight;
    this.menuPadding = menuPadding;

    this.curX = Crafty.viewport.width - 200;
    this.curY = Crafty.viewport.height - (menuMargin + this.menuHeight);

    this.nextMenuItem = function() {
        this.curX -= this.menuWidth + this.menuPadding;
        if (this.curX < this.menuWidth) {
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

    var itemsPerColumn = (Crafty.viewport.height - menuMargin) 
        / (menuHeight + menuPadding);

    this.curX = Crafty.viewport.width - 250;
    this.curY = menuMargin 
        + (itemCount < itemsPerColumn 
           ? (itemsPerColumn - itemCount) * (menuHeight + menuPadding) 
           : 0 
          );

    this.nextMenuItem = function() {
        this.curY += this.menuHeight + this.menuPadding;
        if (this.curY > Crafty.viewport.height - menuMargin) {
            this.curY = menuMargin;
            this.curX -= (this.menuPadding + this.menuWidth);
        }
    };

    return this;
}

var describeNonExistentBuilding = function(name) {
    var fakeResource = {name: "(resource)", mineRate: 1};
    var tmpbldg = buildingBlueprints[name].factory();
    tmpbldg.onBuild(fakeResource);
    var txt = buildingDescription(tmpbldg);
    tmpbldg.destroy();
    return txt;
};

var isScreenNarrow = function() {
    return Crafty.viewport.width < 700;
};

var createBuildMenu = function() {
    tutorial.onEvent("buildMenuOpen");

    var menu_width = 95;
    var menu_height = 16;
    var menu_padding = 5;
 
    var buildingNames = Object.keys(buildingBlueprints);
    buildingNames.sort();

    var buildingCount = buildingNames.length;

    var isNarrowScreen = isScreenNarrow();

    var chosenMenuCreator = isNarrowScreen
        ? horizontalMenuCreator
        : verticalMenuCreator;

    if (isNarrowScreen) {
        buildingNames.reverse();
    }

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
    txt += "<i>" + buildingBlueprints[buildingName].desc + "</i><br/>";
    txt += "Costs:<ul class='reslist'>";
    for (var i = 0; 
         i < buildingBlueprints[buildingName].constructionCost.length; 
         ++i) {
        var res = buildingBlueprints[buildingName].constructionCost[i];
        txt += "<li>" + (-res.delta) + " " + res.r + "</li>";
    }

    txt += "</ul>";
    txt += describeNonExistentBuilding(buildingName);
    Crafty.e("BuildMenu")
        .text(buildingName)
        .attr({x : menuX, 
               y : menuY,
               w: menuWidth-1,
               h: menuHeight-2,
               savedText: null,
               printText: txt})
        .bind("MouseOver", function() {
            var tmp = this.printText;
            var save;
            Crafty("Selected").each(function() {
                save = this.text();
                this.text(tmp);
            });
            this.savedText = save;
        })
        .bind("MouseOut", function() {
            if (this.savedText != null) {
                var send = this.savedText;
                Crafty("Selected").each(function () {
                    this.text(send);
                });
                this.savedText = null;
            }
        })
        .bind("Click", function() {
            
            Crafty.audio.play("mainmenu");
            Crafty("BuildMenu").each(function () {
                this.css({"background-color": bgCol});
            });
            this.css({"background-color": selectedMenu});
            hud_state.mode = hudModes.build;
            hud_state.modeArg = this._text;
            var tmp = this.printText;
            Crafty("Selected").each(function() {
                this.text(tmp);
            });
            this.savedText = null;
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
            this.textColor(textCol);
            this.textFont({size:"10px", family:"sans-serif"});
            this.css({
                "background-color":bgCol,
                "border-radius":"3px",
                "padding":"1px",
                });
            this.attr({z: 1000, alpha: 1.0});
            }
        });

    // Box for the economy object to fill in
    // with its current state.  As this gets
    // more complex it could do with breaking down
    // to separate items
    Crafty.e("Status, HUD")
        .attr({ x : menuMargin, y : menuMargin+20, w : 110, h : 250} )
        .text("No colony");
    // Controls the speed of time / economy
    Crafty.e("Time, HUD, Mouse")
        .attr({ x: menuMargin, y: menuMargin, h: 15, w: 44})
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
        .attr({x:menuMargin+50, y:menuMargin, h:15, w:50})
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
                    this.css({"background-color":bgCol});
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

                var showStatusBar = this.submenu == null || isScreenNarrow() == false;
                Crafty("StatusBar").each(function () {
                        this.visible = showStatusBar;
                    });

                this.css({"background-color": selectedMenu});
            },
            init : function () {
                this.requires("HUD, Mouse");
                this.w = 60; 
                this.x = Crafty.viewport.width - (this.w + menuMargin);
                this.bind("MouseDown", function() {
                    Crafty.audio.play("mainmenu");
                    this.onClick();
                });
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
    var statusBar = Crafty.e("StatusBar, HUD")
        .attr({
            x: menuMargin,
            y: Crafty.viewport.height - menuMargin - 15,
            w: (Crafty.viewport.width - (menuMargin*2)) * 0.7,
            h: 15,
        })
        .text(" ")
    ;

};

var refreshStatusBar = function() {
    var topMsg = statusMessages.calculateTopMessage();
    var newText = topMsg == null ? " " : topMsg.m;

    Crafty("StatusBar").each(function() {
        this.textColor(topMsg.s > 0 ? errorTextCol : textCol);
        this.text(newText);
    });
};

var updateStatusBar = function() {
    refreshStatusBar();
    statusMessages.wipeAllMessages();
};

var buildingDescription = function(bldg) {
    var info = "";
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

    return info;
};

var hud_select_building = function() {
    var bldg = Crafty(hud_state.modeArg);
    var info = "<b>" + bldg.name + "</b><br>";
    info += buildingDescription(bldg);
    info += bldg.isActive() ? "Active" : "<b>INACTIVE</b>";
    if (bldg.missing != "") {
        info += "<br/><font color=\"" + errorTextCol + "\">" + bldg.missing + "</font>";
    }
    Crafty("Selected").each(function () { 
            this.text(info);}); 

    hud_colonists(bldg._colonists < bldg.maxColonists, bldg._colonists > 0);
   
};

var hud_colonists = function(showplus, showminus) {
    if (showplus === true) {
        if (Crafty("ColInc").length == 0) {
            Crafty.e("ColInc, ColonistMenu")
                .attr({x: Crafty.viewport.width - (menuMargin + 15), y: menuMargin, w: 15, h: 15})
                .text("+")
                .bind("MouseDown", function() {
                        var bldg = Crafty(hud_state.modeArg);
                        economy.populate(bldg, 1);
                        hud_select_building();
                    });
        }
    } else {
        Crafty("ColInc").each(function() {this.destroy();});
    }
    if (showminus === true) {
        if (Crafty("ColDec").length == 0) {
            Crafty.e("ColDec, ColonistMenu")
                .attr({x: Crafty.viewport.width - (menuMargin + 100), y: menuMargin, w: 15, h: 15})
                .text("-")
                .bind("MouseDown", function() {
                        var bldg = Crafty(hud_state.modeArg);
                        economy.populate(bldg, -1);
                        hud_select_building();
                    });
        }
    } else {
        Crafty("ColDec").each(function() {this.destroy();});
    }
    if (showplus || showminus) {
        if (Crafty("ColMenu").length == 0) {
            Crafty.e("ColMenu, ColonistMenu")
                .attr({w:60, h: 15, y: menuMargin,
                        x: Crafty.viewport.width - (menuMargin + 80)})
                .text("Colonists");
        }
    } else {
        Crafty("ColMenu").each(function() {this.destroy();});
    }
};

var hud_show = function() {
    var menu_height = 15;
    var cur_y = Crafty.viewport.height - (menu_height + menuMargin);
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
            Crafty.audio.play("mainmenu");
        });
    cur_y -= menu_height;
    Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height -2})
        .text("Select");

    cur_y -= menu_height;
    resourceOverlayView = null; // intentionally global
    resourceOverlayView = Crafty.e("ResourceMenu, HUD, Mouse")
        .attr({x: Crafty.viewport.width - (60 + menuMargin), y: cur_y,
                w:60, h: menu_height -2, isOverlayEnabled: false})
        .text("Resources")
        .bind("MouseDown", function() {
            Crafty.audio.play("mainmenu");
            this.isOverlayEnabled = !this.isOverlayEnabled;
            if (this.isOverlayEnabled) {
                    this.css({"background-color":selectedMenu});
            } else {
                    this.css({"background-color":bgCol});
            }
            showResources(this.isOverlayEnabled);
        });
    cur_y -= menu_height;

    Crafty("Selected").each(function() {this.destroy();});
    Crafty.e("Selected, HUD")
        .attr({ y: menuMargin+20, h: cur_y -(menuMargin + 15), w: 100, x: Crafty.viewport.width - (menuMargin + 100)})
        .text("Nothing selected");

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
