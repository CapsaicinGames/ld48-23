// contains all constructions

var buildingBlueprints = {};

function buildings_setup() {
    Crafty.c("Building", {
        _colonists: 1,
        _resourceDeltas: {},
        
        init: function() {
            this.requires("WorldEntity");
            this._resourceDeltas = {};
        },

        resourceDelta: function(resource, delta) {
            this._resourceDeltas[resource.name] = delta;
            return this;
        },
        isActive: function() {
            return this._colonists > 0; 
        },
        onBuild: function(tileResource) {
            // intentionally blank
        },
    });

    buildingBlueprints = {
        "Mine": {
            factory: function() { return createMine(-1, 1); }
        },
        "Super Mine": { 
            factory: function() { return createMine(-2, 2); }
        },
        "Solar Panel": {
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

