// contains all constructions

var buildingBlueprints = {};

function initBuildings() {
    Crafty.c("Building", {
        _colonists: 1,
        Building: function(resourceDeltas) {
            this._resourceDeltas = resourceDeltas;
            return this;
        },
        isActive: function() {
            return this._colonists > 0; 
        },
        getBuildingName: function() {
            return this._name;
        },
    });

    buildingBlueprints = {
        "Ice Mine": Crafty.e("Building")
            .Building(new ResourceDeltas()
                      .add(resourcetypes.energy, -1)
                      .add(resourcetypes.ice, 1)
                     ),
        "Solar Panel": Crafty.e("Building")
            .Building(new ResourceDeltas()
                      .add(resourcetypes.energy, 2)
                     ),
    };

}

