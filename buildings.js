// contains all constructions

var buildingBlueprints = {};

function buildings_setup() {
    Crafty.c("Building", {
        _colonists: 1,
        resourceDeltas: [],
        destroyable: true,
        name: "Unknown",
        
        init: function() {
            this.resourceDeltas = [];
            this.requires("WorldEntity");
            this.bind("Click", function() {
                if (hud_state.mode === hudModes.select) {
                    var info = "<b>" + this.name + "</b><br>";
                    var subinfo = "";
                    for (var i = 0; i < this.resourceDeltas.length; ++i) {
                        var res = this.resourceDeltas[i];
                        if (res.delta < 0) {
                            subinfo += "<li>" + (-res.delta) + " " + res.r + "</li>";
                        }
                    }
                    if (subinfo.length > 0) {
                        info += "Consumes:<ul class='reslist'>" + 
                                subinfo + "</ul>";
                        subinfo = "";
                    }
                    for (var i = 0; i < this.resourceDeltas.length; ++i) {
                        var res = this.resourceDeltas[i];
                        if (res.delta > 0) {
                            subinfo += "<li>" + res.delta + " " + res.r + "</li>";
                        }
                    }
                    if (subinfo.length > 0) {
                        info += "Produces:<ul class='reslist'>";
                        info += subinfo + "</ul>";
                        subinfo = "";
                    }
                    if (this.has("Storage")) {
                        info += "Stores:<ul class='reslist'>";
                        for (var i = 0; i < this.storageDeltas.length; ++i) {
                            var res = this.storageDeltas[i];
                            if (res.delta > 0) {
                                info += "<li>" + res.delta + " " + res.r + "</li>";
                            }
                        }
                        info += "</ul>";
                    }
                    info += "Colonists: " + this._colonists;
                    hud_state.modeArg = this[0];
                    Crafty("Selected").each(function () { this.text(info);}); 
                } else if (hud_state.mode === hudModes.destroy &&
                    this.destroyable === true) {
                    this.destroy();
                }
            });
        },

        resourceDelta: function(resource, delta) {
            this.resourceDeltas.push(newResourceDelta(resource, delta));
            return this;
        },
        isActive: function() {
            return this._colonists > 0; 
        },
        onBuild: function(tileResource) {
            // intentionally blank
        },
    });

    Crafty.c("PowerGenerator", { init : function() { this.requires("Building"); } });
    Crafty.c("Storage", {
        storageDeltas: [],
        init : function() {
            this.requires("Building");
            this.storageDeltas = [];            
        },
        storageDelta: function(resource,delta) {
            this.storageDeltas.push(newResourceDelta(resource, delta));
            return this;
        }
    });

    var newResourceDelta = function(resource, cost) {
        return { r: resource.name, delta: cost };
    }

    buildingBlueprints = {
        "LandedShip": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2000000),
            ],
            factory: function() {
                return Crafty.e("Storage, placeholderSprite")
                    .attr({destroyable: false, name: "Colony Ship"})
                    .storageDelta(resourcetypes.colonists, 10)
                    .storageDelta(resourcetypes.food, 100)
                    .storageDelta(resourcetypes.ice, 50)
                    .storageDelta(resourcetypes.energy, 50)
                    .storageDelta(resourcetypes.water, 50)
                    .storageDelta(resourcetypes.regolith, 50)
                    .storageDelta(resourcetypes.steelore, 50)
                    .storageDelta(resourcetypes.plastic, 50)
                    .storageDelta(resourcetypes.steel, 50)
                    .storageDelta(resourcetypes.preciousore, 10)
                    .storageDelta(resourcetypes.preciousmetal, 10);
            },
            buildable: false,
        },
        "Mine": {
            constructionCost: [ 
                newResourceDelta(resourcetypes.steel, -3),
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() { return createMine(-1, 1, "Mine"); }
        },
        "Super Mine": { 
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -7),
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() { return createMine(-2, 2, "Super Mine"); }
        },
        "Habitat": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, placeholderSprite")
                    .attr({name: "Habitat"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.colonists, 25);
            },
        },
        "Capacitor Bank": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, placeholderSprite")
                    .attr({name: "Capacitor Bank"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.energy, 100);
            },
        },
        "Ore locker": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, placeholderSprite")
                    .attr({name: "Ore locker"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.steelore, 100)
                    .storageDelta(resourcetypes.regolith, 100)
                    .storageDelta(resourcetypes.preciousore, 100);
            },
        },
        "Solar Panel": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("PowerGenerator, solarpanelsprite")
                    .attr({name: "Solar Panel"})
                    .resourceDelta(resourcetypes.energy, 3);
            },
       },
         "Hydroponics": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .attr({name: "Hydroponics"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.water, -1)
                    .resourceDelta(resourcetypes.food, 1);
            },
        },
         "Ice melter": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .attr({name: "Ice melter"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.ice, -1)
                    .resourceDelta(resourcetypes.water, 1);
            },
        },
         "Widget factory": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .attr({name: "Widget factory"})
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steel, -1)
                    .resourceDelta(resourcetypes.plastic, -2)
                    .resourceDelta(resourcetypes.widget, 2);
            },
        },
         "Smelter": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -3),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.preciousore, -1)
                    .resourceDelta(resourcetypes.preciousmetal, 1);
            },
        },
         "Blast furnace": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steelore, -2)
                    .resourceDelta(resourcetypes.steel, 2);
            },
        },
         "RegoPlasticiser": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .resourceDelta(resourcetypes.energy, -2)
                    .resourceDelta(resourcetypes.regolith, -1)
                    .resourceDelta(resourcetypes.plastic, 1);
            },
        },
    }
}

function createMine(powerDrain, resourceProduction, mineName) {
    return Crafty.e("Building, minesprite")
        .resourceDelta(resourcetypes.energy, powerDrain)
        .attr({name: mineName,
            onBuild: function(tileResource) {
            this.resourceDelta(tileResource, resourceProduction);
        }});
}

