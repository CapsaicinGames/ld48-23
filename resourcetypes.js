var resourcetypes = Object.freeze({

    energy: { name: "Energy", initialValue: 100 },
    colonists: { name: "Colonists", initialValue: 10 },
    food: { name: "Food", initialValue: 15 },
    ice: { name: "Ice", initialValue: 0 },
    water: { name: "Water", initialValue: 15 },
    regolith: { name: "Regolith", initialValue: 0 },
    steelore: { name: "Steel ore", initialValue: 0 },
    plastic: { name: "Plastic", initialValue: 20 },
    steel: { name: "Steel", initialValue: 20 },
    preciousore: { name: "Rare earth ore", initialValue: 0 },
    preciousmetal: { name: "Rare earth", initialValue: 0 },
    widgets: { name: "Widgets", initialValue: 0 },

});
var newResourceDelta = function(resource, cost) {
    return { 
        r: typeof resource === "string" ? resource : resource.name, 
        delta: cost 
    };
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
