var resourcetypes = Object.freeze({

    energy: { name: "Energy" },
    colonists: { name: "Colonists" },
    food: { name: "Food" },
    ice: { name: "Ice" },
    regolith: { name: "Regolith" },
    steelore: { name: "Steel ore" },
    plastic: { name: "Plastic" },
    steel: { name: "Steel" },
    preciousore: { name: "Precious metal ore"},

});

function ResourceDeltas() {
    this.resources = [];
    return this;
}

ResourceDeltas.prototype.add = function(resource, delta) {
    this.resources.push({r: resource, d: delta});
    return this;
}
