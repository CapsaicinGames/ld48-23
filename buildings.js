// contains all constructions

var buildingBlueprints = {};

function buildings_setup() {
    Crafty.c("Building", {
        _colonists: 1,
        resourceDeltas: {},
        
        init: function() {
            this.resourceDeltas = {};
            this.requires("WorldEntity");
        },

        resourceDelta: function(resource, delta) {
            this.resourceDeltas[resource.name] = delta;
            return this;
        },
        isActive: function() {
            return this._colonists > 0; 
        },
        onBuild: function(tileResource) {
            // intentionally blank
        },
    });

    var newCtorCost = function(resource, cost) {
        return { r: resource.name, cost: cost };
    }

    buildingBlueprints = {
        "Mine": {
            constructionCost: [ 
                newCtorCost(resourcetypes.steel, 3),
                newCtorCost(resourcetypes.plastic, 1),
            ],
            factory: function() { return createMine(-1, 1); }
        },
        "Super Mine": { 
            constructionCost: [
                newCtorCost(resourcetypes.steel, 7),
                newCtorCost(resourcetypes.plastic, 2),
            ],
            factory: function() { return createMine(-2, 2); }
        },
        "Solar Panel": {
            constructionCost: [
                newCtorCost(resourcetypes.plastic, 2),
            ],
            factory: function() {
                return Crafty.e("Building")
                    .resourceDelta(resourcetypes.energy, 3);
            },
        },
    }

}

function createMine(powerDrain, resourceProduction) {
    return Crafty.e("Building, grass")
        .resourceDelta(resourcetypes.energy, powerDrain)
        .attr("onBuild", function(tileResource) {
            this.resourceDelta(tileResource, resourceProduction);
        });
}

