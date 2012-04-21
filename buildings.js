// contains all constructions

var buildingBlueprints = {};

function initBuildings() {
    Crafty.c("Building", {
        _colonists: 1,
        _resourceDeltas: {},
        
        init: function() {
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
        "Mine": createMine(-1, 1),
        "Super Mine": createMine(-2, 2),
        "Solar Panel": Crafty.e("Building")
            .resourceDelta(resourcetypes.energy, 3),
    };

}

function createMine(powerDrain, resourceProduction) {
    return Crafty.e("Building")
        .resourceDelta(resourcetypes.energy, powerDrain)
        .attr("onBuild", function(tileResource) {
            this.resourceDelta(tileResource, resourceProduction);
        });
}

