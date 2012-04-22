var resourcetypes = Object.freeze({

    energy: { name: "Energy", initialValue: 100 },
    colonists: { name: "Spare Colonists", initialValue: 10 },
    food: { name: "Food", initialValue: 50 },
    ice: { name: "Ice", initialValue: 0 },
    water: { name: "Water", initialValue: 50 },
    regolith: { name: "Regolith", initialValue: 0 },
    steelore: { name: "Steel ore", initialValue: 0 },
    plastic: { name: "Plastic", initialValue: 20 },
    steel: { name: "Steel", initialValue: 20 },
    preciousore: { name: "Precious metal ore", initialValue: 0 },
    preciousmetal: { name: "Precious metal", initialValue: 0 },
    widgets: { name: "Widgets", initialValue: 0 },

});
var newResourceDelta = function(resource, cost) {
    return { r: resource.name, delta: cost };
}

var colonistNeeds = Object.freeze({
    per: 1,
    every: 1,
    uses: [
        newResourceDelta(resourcetypes.food, -0.05),
        newResourceDelta(resourcetypes.water, -0.05),
        ]
});

var colonistBreeding = Object.freeze({
    everyNeed: 1,
    neededDelta: [
        newResourceDelta(resourcetypes.food, 0.1),
        newResourceDelta(resourcetypes.water, 0.1),
        ]
});
