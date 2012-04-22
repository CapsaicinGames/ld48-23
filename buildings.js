// contains all constructions

var buildingBlueprints = {};

function buildings_setup() {
    Crafty.c("Building", {
        _colonists: 1,
        resourceDeltas: [],
        
        init: function() {
            this.resourceDeltas = [];
            this.requires("WorldEntity");
            this.bind("Click", function() {
                if (hud_state.mode === hudModes.destroy) {
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

    var newResourceDelta = function(resource, cost) {
        return { r: resource.name, delta: cost };
    }

    buildingBlueprints = {
        "Mine": {
            constructionCost: [ 
                newResourceDelta(resourcetypes.steel, -3),
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() { return createMine(-1, 1); }
        },
        "Super Mine": { 
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -7),
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() { return createMine(-2, 2); }
        },
        "Solar Panel": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, grass")
                    .resourceDelta(resourcetypes.energy, 3);
            },
       },
         "Hydroponics": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, grass")
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
                return Crafty.e("Building, grass")
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.ice, 1)
                    .resourceDelta(resourcetypes.water, -1);
            },
        },
         "Blast furnace": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, grass")
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
                return Crafty.e("Building, grass")
                    .resourceDelta(resourcetypes.energy, -2)
                    .resourceDelta(resourcetypes.regolith, -1)
                    .resourceDelta(resourcetypes.plastic, 1);
            },
        },
    }
}

function createMine(powerDrain, resourceProduction) {
    return Crafty.e("Building, minesprite")
        .resourceDelta(resourcetypes.energy, powerDrain)
        .attr("onBuild", function(tileResource) {
            this.resourceDelta(tileResource, resourceProduction);
        });
}

