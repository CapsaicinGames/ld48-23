// tea-leaved from http://snippets.dzone.com/posts/show/849
shuffle = function(o) {
   for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
   return o; 
};

var economy_setup = function() {
    
    Crafty.c("Economy", {
        _resources: {},
        _totalColonists: 0,
        _storage: {},
        
        init: function() {
            for(var rKey in resourcetypes) {
                this._resources[resourcetypes[rKey].name] = resourcetypes[rKey].initialValue;
            }
        },
        
        getResourceValue: function(resourceType) {
            return this._resources[resourceType.name];
        },

        /** Attempt to debit an array of resources
         *  @param resourceList array of map{r,.delta)
         *  @returns true iff debit was successful
         */
        debit: function (resourceList) {
            var success = [];
            for (var i = 0; i < resourceList.length; i++) {
                var res = resourceList[i];
                if (res.delta < 0) {
                    if (this._resources[res.r] < -res.delta)
                        success.push(res.r);
                }
            }

            if (success.length == 0) {
                for (var i = 0; i < resourceList.length; i++) {
                    var res = resourceList[i];
                    this._resources[res.r] += res.delta;
                }
            }

            return success;
        },

        updateProduction: function() {
            var bldgList = [];
            // Find out what building is making what.  If it's
            // not not being operated, mark it as such
            Crafty("Building").each(function() {
                if (this.isActive() === true)
                    bldgList.push({ent: this[0], delta: this.resourceDeltas});
                else
                    this.showOverlay("inactive");
                    
            });
            // Try to perform each building's transaction.
            // If it fails, record some text saying why for
            // the building and enable the overlay saying it failed.
            // Otherwise clear the overlay
            for (var i = 0; i < bldgList.length; ++i) {
                var missing = this.debit(bldgList[i].delta);
                if (missing.length == 0) {
                    Crafty(bldgList[i].ent).showOverlay("no");
                    Crafty(bldgList[i].ent).missing = "";
                } else {
                    Crafty(bldgList[i].ent).showOverlay("res");
                    var tmp = "Missing ";
                    for (var j = 0; j < missing.length; ++j) {
                        tmp += missing[j] + " ";
                    }
                    Crafty(bldgList[i].ent).missing = tmp;
                }
            }

            // Recalculate the number of colonists
            var totalcol = 0;
            Crafty("Building").each(function() {
                totalcol += this._colonists;
            });
            this._totalColonists = totalcol + this._resources["Colonists"];
        },
        /** Ensure that resources are only stockpiled
         *  if there is room for them.  The current storage
         *  is updated.
         */
        constrainResources: function() {
            var newStorage = {};
            // Find out how much we can store
            Crafty("Storage").each(function() {
                for (var i = 0; i < this.storageDeltas.length; ++i) {
                    var res = this.storageDeltas[i];
                    if (newStorage[res.r] == undefined) {
                        newStorage[res.r] = res.delta;
                    } else {
                        newStorage[res.r] += res.delta;
                    }
                }
            });
            this._storage = newStorage;

            // Now if we have more resources than the maximum storage
            // for that type, remove them
            for (var type in this._resources) {
                if (type === "Colonists") {
                    // Colonists are a special case as the total
                    // is used and not the spare resource
                    if (this._totalColonists > newStorage[type]) {
                        var diff = this._totalColonists - newStorage[type];
                        console.log("Removing " + diff + " colonists due to lack of capacity");
                        this.grimReaperStalksTheColony(diff);
                    }                
                } else {
                    var max = newStorage[type];
                    if (max == undefined) {
                        // It's undefined if there's no storage for
                        // this type at all yet
                        max = 0;
                    }
                    if (this._resources[type] > max) {
                        this._resources[type] = max;
                    }
                }
            }
        },
        /** THIS FUNCTION KILLS COLONISTS
         *
         *  First it kills idle colonists, then it
         *  picks a building at random and depopulates it.
         *  @param kill The number to kill
         *  @returns The number killed.  If these don't match
         *  then we're out of people
         */
        grimReaperStalksTheColony: function(kill) {
            var topkill = 0;
            // Kill spare colonists first
            while (kill > 0 && this._resources["Colonists"] > 0) {
                this._resources["Colonists"]--;
                kill--;
            }
            var totalcol = 0;
            // Then the ones in buildings
            shuffle(Crafty("Building")).each(function() {
                while (kill > 0 && this._colonists > 0)
                {
                    kill--;
                    this._colonists--;
                }
                totalcol += this._colonists;
            });
            this._totalColonists = totalcol + this._resources["Colonists"];
            return topkill;

        },
        /** Make people eat and drink, and kill 'em if there's
         *  not enough.
         */
        consumeResources: function() {
            var rescount = Math.ceil(this._totalColonists / colonistNeeds.per);
            var kill = 0;
            for (var i = 0; i < rescount; ++i) {
                if (this.debit(colonistNeeds.uses).length == 0) {
                    kill++;
                    break;
                 }
            }
            this.grimReaperStalksTheColony(kill);
        },
        tickBuildings: function() {
            Crafty("Building").each(function() {
                this.onTick(); 
            });
        },
    });

    // Actually create the economy object
    return Crafty.e("Economy")
            .attr({
            days: 0,
            speed: 1,
            dead: 0,
            breedingConstraint: "Unknown",
            timePerStep: 2000,
            newStep: function() {
                this.days++;
                var oldres = Crafty.clone(this._resources);
                var olddead = this.dead;
                this.updateProduction();
                this.tickBuildings();
                if (!(this.days % colonistNeeds.every)) {
                    this.consumeResources();
                    //console.log(killed + " died, now " + this._totalColonists);
                }
                if (this.dead === olddead) {
                    // no deaths, there were enough resources
                    var breed = true;
                    for (var i = 0; i < colonistBreeding.neededDelta.length; ++i) {
                        var res = colonistBreeding.neededDelta[i];
                        var diff = this._resources[res.r] - oldres[res.r];
                        if (diff < res.delta) {
                            breed = false;
                            this.breedingConstraint = "Don't have " +
                                res.delta + " surplus " + res.r;
                        }
                    }
                    if (this._storage["Colonists"] <= 
                            this._totalColonists) {
                        breed = false;
                        this.breedingConstraint = "Don't have enough space";
                    }
                    if (breed) {
                        this._resources["Colonists"]++;
                        this._totalColonists++;
                        //console.log("Bred to " + this._totalColonists);
                    } else {
                        console.log(this.breedingConstraint);
                    }
                } else {
                    this.breedingConstraint = "Colonists are dying!";
                        console.log(this.breedingConstraint);
                }
                this.constrainResources();
                this.updateStatus();
                switch(this.speed)
                {
                case 5:
                    this.timePerStep = 400;
                    break;
                case 2:
                    this.timePerStep = 1000;
                    break;
                case 0:
                    return;
                    break;
                case 1:
                default:
                    this.timePerStep = 2000;
                }
                this.timeout(function() {this.newStep();}, this.timePerStep);
            },
            populate: function(building, delta) {
                var okay = false;
                var newbldgtotal = building._colonists + delta;
                if (delta > 0 && 
                    this._resources["Colonists"] >= delta &&
                    newbldgtotal <= building.maxColonists) {
                    okay = true;
                } else if (delta < 0 && newbldgtotal >= 0) {
                    okay = true;
                } else {
                    okay = false;
                }
                if (okay === true) {
                    building._colonists += delta;
                    this._resources["Colonists"] -= delta;
                }
            },
            updateStatus : function() {

                var newstatus = "";

                for(var rKey in this._resources) {
                    var key = rKey;
                    var val = this._resources[rKey];
                    if (rKey === "Colonists") {
                        key = "Idle " + rKey;
                        val = this._resources[rKey].toFixed(0);
                    } else {
                        val = this._resources[rKey].toFixed(1);
                    }
                    newstatus += "<b>" + key + "</b>: " + val + "<br/>";
                }
                newstatus += "<b>Colony size</b>: " + this._totalColonists + "<br>";
                newstatus += "<b>Day</b>: " + this.days + "<br>";
                Crafty("Status").each(function() {
                        this.text(newstatus);
                });
            }});
};

