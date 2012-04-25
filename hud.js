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
var selectedMenu = "#073642"; // base2
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
    var info = buildingDescription(tmpbldg);

    if (tmpbldg.minActive == tmpbldg.maxColonists) {
        info += "Required colonists:" + tmpbldg.minActive + "</br>";
    }
    else {
        info += "Colonists:<ul class='reslist'>";
        info += "<li>Minimum:" + tmpbldg.minActive + "</li>";
        info += "<li>Maximum:" + tmpbldg.maxColonists + "</li>";
        info += "</ul>";
    }

    tmpbldg.destroy();
    return info;
};

var isScreenNarrow = function() {
    return Crafty.viewport.width < 700;
};

var createBuildMenu = function() {
    tutorial.onEvent("buildMenuOpen");

    var menu_width = 105;
    var menu_height = 20;
    var menu_padding = 3;
 
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

function colouredText(t, col) {
    return "<font color=\"" + col + "\">" + t + "</font>";
}

function _createConstructionDescription(buildingName, unaffordableResources) {

    var txt = "<b>" + buildingName + "</b><br>";
    txt += "<i>" + buildingBlueprints[buildingName].desc + "</i><br/>";
    txt += "Costs:<ul class='reslist'>";
    for (var i = 0; 
         i < buildingBlueprints[buildingName].constructionCost.length; 
         ++i) {
        var res = buildingBlueprints[buildingName].constructionCost[i];

        var resColor = unaffordableResources.indexOf(res.r) >= 0
            ? errorTextCol
            : textCol;

        txt += "<li>" 
            + colouredText((-res.delta).toString() + " " + res.r, resColor) 
            + "</li>";
    }

    txt += "</ul>";
    txt += describeNonExistentBuilding(buildingName);

    return txt;
}

function updateBuildingMenuAffordability() {
    Crafty("BuildMenu").each(function() {
        this.evaluateAffordability();
    });
}

function _addBuildMenuItem(menuX, menuY, menuWidth, menuHeight, buildingName) {

    var unaffordableResources = economy.debit(
        buildingBlueprints[buildingName].constructionCost, true);

    var txt = _createConstructionDescription(buildingName, unaffordableResources);

    var makeBuildingText = function(buildingName, isAffordable) {
        var buildingNameCol = isAffordable ? textCol : errorTextCol;
        return colouredText(buildingName, buildingNameCol);
    };

    selectedBuilding = null; // intentional global
    Crafty.e("BuildMenu")
        .text(makeBuildingText(buildingName, unaffordableResources.length == 0))
        .attr({x : menuX, 
               y : menuY,
               w: menuWidth-1,
               h: menuHeight-2,
               savedText: null,
               buildingName: buildingName,

               isAffordable: unaffordableResources.length == 0,

               getDisplayName: function() { 
                   var nameText = makeBuildingText(
                       this.buildingName, this.isAffordable);
                   return selectedBuilding == this 
                       ? boldText(nameText) 
                       : nameText;
               },

               evaluateAffordability: function() {
                   var latestUnaffordableResources = economy.debit(
                       buildingBlueprints[this.buildingName].constructionCost, true
                   );
                   this.isAffordable = latestUnaffordableResources.length == 0;
                   this.descriptionText = _createConstructionDescription(
                       this.buildingName,
                       latestUnaffordableResources
                   );
                   
                   this.text(this.getDisplayName());
               },
               
               descriptionText: txt,
              })

        .bind("MouseOver", function() {
            var tmp = this.descriptionText;
            var save;
            Crafty("Selected").each(function() {
                save = this.text();
                this.text(tmp);
            });
            this.savedText = save;

            if (this.isAffordable) {
                this.css({"background-color": selectedMenu});
            }
        })
        .css({"cursor":"pointer",
              "text-align":"center"})
        .bind("MouseOut", function() {
            if (this.savedText != null) {
                var send = this.savedText;
                Crafty("Selected").each(function () {
                    this.text(send);
                });
                this.savedText = null;
            }
            if (selectedBuilding != this) {
                this.css({"background-color": bgCol});
            }
        })
        .bind("Click", function() {
            
            if (this.isAffordable === false) {
                return;
            }

            Crafty.audio.play("mainmenu");
            selectedBuilding = null;
            Crafty("BuildMenu").each(function () {
                this.css({"background-color": bgCol});
                this.text(this.getDisplayName());
            });
            this.css({"background-color": selectedMenu});
            selectedBuilding = this;
            hud_state.mode = hudModes.build;
            hud_state.modeArg = this.buildingName;
            this.text(this.getDisplayName());
            var tmp = this.descriptionText;
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
                "-moz-user-select":"none",
                "-ms-user-select":"none",
                "-webkit-user-select":"none"
                });
            this.attr({z: 1000, alpha: 1.0});
            }
        });

    selectedTopLevelMenu = null;

    Crafty.c("MenuTopLevel", {
            label : "Blank",
            submenu : null,
            menuCtor : null,
            onClick : function() {
                // Ensure all other menus are closed
                Crafty("MenuTopLevel").each(function() {
                    this.css({"background-color": bgCol});
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
                selectedTopLevelMenu = this; // intentionally global
            },
            init : function () {
                this.requires("HUD, Mouse");
                this.w = 100; 
                this.x = Crafty.viewport.width - (this.w + menuMargin);
                this.bind("MouseDown", function() {
                    Crafty.audio.play("mainmenu");
                    this.onClick();
                });
                this.bind("MouseOver", function() {
                    this.css({"background-color": selectedMenu});
                });
                this.bind("MouseOut", function() {
                    if (selectedTopLevelMenu === this) {
                        this.css({"background-color": selectedMenu});
                    }
                    else {
                        this.css({"background-color": bgCol});
                    }
                });

                this.css({"cursor":"pointer",
                          "text-align":"center"});
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
};

var refreshStatusBar = function() {
    var topMsg = statusMessages.calculateTopMessage();
    var newText = topMsg == null ? " " : topMsg.m;
    var newMsgStr = topMsg == null ? -100 : topMsg.s;

    Crafty("StatusBar").each(function() {
        this.textColor( newMsgStr === magicTutorialPriority ? textCol
                        : newMsgStr > 0 ? errorTextCol 
                        : newMsgStr === 0 ? textCol
                        : goodTextCol);
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

    return info;
};

var hud_select_building = function() {
    var bldg = Crafty(hud_state.modeArg);
    tutorial.onEvent("selectBuilding", bldg.name);
    var info = "<b>" + bldg.name + "</b><br>";
    info += buildingDescription(bldg);

    info += "<br/>";

    var bldgNeedsColonists = bldg.minActive > 0;
    if (bldgNeedsColonists) {
        info += "<font color=\"" + (bldg.isActive() ? goodTextCol : errorTextCol) + "\">";
        info += "Colonists: " + bldg._colonists + "/" + bldg.minActive + "<br/>";
        if (bldg.maxColonists > bldg.minActive) {
            info += "<ul class='reslist'><li>(Max " + bldg.maxColonists + ")</li></ul></font>"
        }
    }

    info += bldg.isActive() ? "Active" : "<b><font color=\"" + errorTextCol + "\">INACTIVE - needs colonist</font></b>";
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
                .css({"cursor":"pointer"})
                .bind("MouseDown", function() {
                    var bldg = Crafty(hud_state.modeArg);
                    tutorial.onEvent("populate", bldg.name);
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
                .css({"cursor":"pointer"})
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

var boldText = function(t) {
    return "<strong>"+t+"</strong>";
}

var hud_create = function() {

    Crafty.c("ButtonHighlight", {
        init: function(){
            this.bind("MouseOver", function() {
                this.css({"background-color":selectedMenu});
            });
            this.bind("MouseOut", function() {
                this.css({"background-color":bgCol});
            });
            this.css({
                "cursor":"pointer",
                "text-align":"center"
            });
        },
    });

    // Box for the economy object to fill in
    // with its current state.  As this gets
    // more complex it could do with breaking down
    // to separate items
    Crafty.e("Status, HUD")
        .attr({ x : menuMargin, y : menuMargin+40, w : 110, h : 250} )
        .text("No colony");
    // Controls the speed of time / economy
    Crafty.e("Time, HUD, Mouse, ButtonHighlight")
        .attr({ x: menuMargin, y: menuMargin+20, h: 15, w: 25})
        .text(boldText("x1"))
        .bind("MouseDown", function() {
            switch (economy.speed)
            {
            case 1:
                economy.speed = 2;
                this.text(boldText("x2"));
                break;
            case 2:
                economy.speed = 5;
                this.text(boldText("x5"));
                break;
            case 5:
            default:
                economy.speed = 1;
                this.text(boldText("x1"));
            }
            })
    ;

    // The Pause button.  It doesn't like
    // being pressed repeatedly
    Crafty.e("Pause, HUD, Mouse, ButtonHighlight")
        .attr({x:menuMargin+70, y:menuMargin + 20, h:15, w:40})
        .text(boldText("Pause"))
        .bind("MouseDown", function() {
            if (economy.speed > 0)
            {
                economy.speed = 0;
                this.text(boldText("Play"));
                Crafty("Time").each(function() {this.text(boldText("--")) });
            } else {
                economy.speed = 1;
                economy.newStep();
                this.text(boldText("Pause"));                
                
                Crafty("Time").each(function() {this.text(boldText("x1")) });
            }
        });
    var statusBar = Crafty.e("StatusBar, HUD")
        .attr({
            x: menuMargin,
            y: menuMargin,
            w: (Crafty.viewport.width - (105 + menuMargin*2)),
            h: 15,
        })
        .text(" ")
        .css({"background-color": selectedMenu});
    ;
}

var hud_show = function() {
    var menu_height = 20;
    var menu_width = 100;
    var cur_y = Crafty.viewport.height - (menu_height + menuMargin);
    Crafty.e("MenuTopLevel")
        .attr({y: cur_y, h: menu_height - 2, 
                menuCtor: createBuildMenu, submenu: "BuildMenu"})
        .text(boldText("Build"));
    cur_y -= menu_height;
    Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height - 2})
        .text(boldText("Destroy"))
        .bind("MouseDown", function() {
            hud_state.mode = hudModes.destroy;
            hud_state.modeArg = "";
            Crafty.audio.play("mainmenu");
        });
    cur_y -= menu_height;
    Crafty.e("MenuTopLevel")
        .attr({ y: cur_y, h: menu_height -2})
        .text(boldText("Select"));

    cur_y -= menu_height;
    resourceOverlayView = null; // intentionally global
    resourceOverlayView = Crafty.e("ResourceMenu, HUD, Mouse, ButtonHighlight")
        .attr({x: Crafty.viewport.width - (menu_width + menuMargin), y: cur_y,
               w:menu_width, h: menu_height -2, isOverlayEnabled: false})
        .text(boldText("Show Resources"))
        .css({"cursor":"pointer",
            "text-align":"center"})
        .bind("MouseDown", function() {
            Crafty.audio.play("mainmenu");
            this.isOverlayEnabled = !this.isOverlayEnabled;
            if (this.isOverlayEnabled) {
                this.text(boldText("Hide Resources"));
            } else {
                this.text(boldText("Show Resources"));
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
    if (isShown) {
        tutorial.onEvent("resourcesViewOpened");
    }
    Crafty("ResourceOverlay").each(function() {
        this.setVisibility(isShown);
    });
    
}

var statusMessages = {
    _currentMessages: [],
    
    addMessage: function(newMsg, strength) {
        assert(newMsg != null, "newMsg should be a string");
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
