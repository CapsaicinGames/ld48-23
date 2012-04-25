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
        energyDelta: 0,
        
        init: function() {
            for(var rKey in resourcetypes) {
                this._resources[resourcetypes[rKey].name] = resourcetypes[rKey].initialValue;
            }
            this.oldres = Crafty.clone(this._resources);
        },
        
        getResourceValue: function(resourceType) {
            return this._resources[resourceType.name];
        },

        /** Attempt to debit an array of resources
         *  @param resourceList array of map{r,delta}
         *  @param isOnlyTest if true, doesn't actually debit, only tests for success
         *  @returns array of names of resources we coudn't afford
         */
        debit: function (resourceList, isOnlyTest) {
            var success = [];
            for (var i = 0; i < resourceList.length; i++) {
                var res = resourceList[i];
                if (res.delta < 0) {
                    if (this._resources[res.r] < -res.delta)
                        success.push(res.r);
                }
            }

            if (isOnlyTest == undefined || isOnlyTest === false) {
                if (success.length == 0) {
                    for (var i = 0; i < resourceList.length; i++) {
                        var res = resourceList[i];
                        this._resources[res.r] += res.delta;
                    }
                }
                updateBuildingMenuAffordability();
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

            var energySorter = function(a, b) {
                var a_energy = 0;
                var b_energy = 0;
                for (var i = 0; i < a.delta.length; ++i) {
                    if (a.delta[i].r == resourcetypes.energy.name) {
                        a_energy = a.delta[i].delta;
                        break;
                    }
                }
                for (var i = 0; i < b.delta.length; ++i) {
                    if (b.delta[i].r == resourcetypes.energy.name) {
                        b_energy = b.delta[i].delta;
                        break;
                    }
                }
                var ret;
                if (a_energy < b_energy) {
                    ret = 1;
                } else if (a_energy > b_energy) {
                    ret = -1;
                } else {
                    ret = 0;
                }
                return ret;
            };
            bldgList.sort(energySorter);

            this.energyDelta = 0;
            // Try to perform each building's transaction.
            // If it fails, record some text saying why for
            // the building and enable the overlay saying it failed.
            // Otherwise clear the overlay
            // Also measure energy production

            for (var i = 0; i < bldgList.length; ++i) {
                var cur_energy = 0;
                var missing = this.debit(bldgList[i].delta);

                var bldg = Crafty(bldgList[i].ent);

                if (missing.length == 0) {
                    bldg.onTick();
                    for (var j = 0; j < bldgList[i].delta.length; ++j) {
                        if (bldgList[i].delta[j].r == resourcetypes.energy.name) {
                            cur_energy = bldgList[i].delta[j].delta;
                            break;
                        }
                    }
                    
                    this.energyDelta += cur_energy;
                    var bldg = Crafty(bldgList[i].ent);
                    bldg.showOverlay("no");
                    bldg.missing = "";
                } else {
                    bldg.showOverlay("res", missing);
                    var tmp = "Missing ";
                    for (var j = 0; j < missing.length; ++j) {
                        tmp += missing[j] + " ";
                    }
                    bldg.missing = tmp;
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
                if (this.isActive() === false) {
                    return;
                }

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
                if (type === resourcetypes.points.name) {
                    // skip, no max points
                } else if (type === resourcetypes.colonists.name) {
                    // Colonists are a special case as the total
                    // is used and not the spare resource
                    if (this._totalColonists > newStorage[type]) {
                        var diff = this._totalColonists - newStorage[type];
                        //console.log("Removing " + diff + " colonists due to lack of capacity");
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
                if (this.debit(colonistNeeds.uses).length !== 0) {
                    kill++;
                    break;
                 }
            }
            this.grimReaperStalksTheColony(kill);
        },

        isBreedingPossible: function(oldcolonistscount, oldres) {

            // can breed if enough food,
            // and enough space

            var isEveryoneAlive = this._totalColonists > 0 && oldcolonistscount <= this._totalColonists;
            var msgPrefix = isEveryoneAlive === false ? "Colonists are dying! " : "";

            var breed = true;

            for (var i = 0; i < colonistBreeding.neededDelta.length; ++i) {
                var res = colonistBreeding.neededDelta[i];
                var diff = this._resources[res.r] - oldres[res.r];
                if (diff < (res.delta - EPSILON)) {
                    breed = false;

                    var resourceMsg 
                        = diff < -EPSILON ? "Losing " + diff.toFixed(2) + " " + res.r + " per day. "
                        : this._resources[res.r] < EPSILON ? "Out of " + res.r + "!"
//                        : isEveryoneAlive ? "Need more " + res.r + "!"
                        : "Gaining " + Math.abs(diff.toFixed(1)) + " " + res.r + " per day, need " 
                            + res.delta + " for more colonists. ";
                    
                    statusMessages.addMessage(msgPrefix + resourceMsg,
                                              isEveryoneAlive === false && diff <= 0.0 ? 10 
                                              : -3);

                }
            }

            for (var i = 0; i < colonistBreeding.neededMin.length; ++i) {
                var res = colonistBreeding.neededMin[i];
                if (this._resources[res.r] < (res.delta - EPSILON)) {
                    breed = false;
                    var isResourceLow = this._resources[res.r] <= 9.5;

                    var resourceMsg = "Don't have minimum of " + res.delta + " " + res.r + " for more colonists";
                    resourceMsg = (isResourceLow ? res.r + " is very low! " : "") 
                        + resourceMsg;

                    statusMessages.addMessage(msgPrefix + resourceMsg,
                                              isEveryoneAlive === false && diff <= 0.0 ? 10 
                                              : isResourceLow ? 5
                                              : -3);
                }
            }

            if (isEveryoneAlive === false) {
                return false;
            }

            if (this._storage["Colonists"] <= 
                this._totalColonists) {
                breed = false;
                statusMessages.addMessage("No space for more colonists - build a habitat", -5);
            }
            
            return breed;
        },

        doBreed: function() {
            this.debit(colonistBreeding.breedCost);
            this._resources["Colonists"]++;
            this._totalColonists++;
        }

    });

    // Actually create the economy object
    return Crafty.e("Economy")
        .attr({
            days: 0,
            speed: 1,
            dead: 0,
            totalDays: 600,
            timePerStep: 2000,
            newStep: function() {
                this.days++;
                this.oldres = Crafty.clone(this._resources);
                this.oldcolonistscount = this._totalColonists;
                this.updateProduction();
                
                if (!(this.days % colonistNeeds.every)) {
                    this.consumeResources();
                    //console.log(killed + " died, now " + this._totalColonists);
                }
                
                if (this.isBreedingPossible(this.oldcolonistscount, this.oldres)) {
                    this.doBreed();
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
                if (this.totalDays - this.days <= 0) {
                    Crafty.scene("GameOver");
                } else {
                    this.timeout(function() {this.newStep();}, this.timePerStep);
                }
                tutorial.onEvent("tick");
                updateStatusBar();
                this.createMessages();
                updateBuildingMenuAffordability();
            },
            populate: function(building, delta) {
                if (building.minActive == 0) { 
                    // doesn't need any colonists
                    return;
                }
                
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
                else {
                    statusMessages.addMessage(
                        "Not enough colonists for new " + building.name 
                            + ", will start inactive!",
                        15
                    );
                }
            },

            createMessages : function() {
                if (this.energyDelta <= 0.0001) {
                    statusMessages.addMessage(
                        "No excess energy production. Build more solar panels!",
                        1);
                }
            },
            
            updateStatus : function() {
                
                var newstatus = "<table class='statustable'><tr><th>Resource</th><th>Amt</th></tr>";
                var localDays = this.days;
                var colSelect = function(oldVal, newVal){
                    return localDays == 1 ? textCol
                        : oldVal > newVal + 0.0001 ? errorTextCol
                        : oldVal < newVal - 0.0001 ? goodTextCol
                        : textCol;
                    };
                
                for(var rKey in this._resources) {
                    var key = rKey;
                    var val = this._resources[rKey];

                    var resTextCol = colSelect(this.oldres[rKey], val);

                    if (rKey === "Colonists") {
                        key = "Idle " + rKey;
                        val = this._resources[rKey].toFixed(0);
                    } else {
                        val = this._resources[rKey].toFixed(1);
                    }
                    
                    var classinfo = key == resourcetypes.points.name ?
                            " class='summary'" : "";
                    newstatus += "<tr" + classinfo + "><td>" + key + "</td><td style='text-align: right'><font color=\"" + resTextCol + "\">" + val + "</font></td></tr>";
                }
                var colonySizeCol = colSelect(this.oldcolonistscount, this._totalColonists);
                newstatus += "<tr class='summary'><td>Colony size</td><td style='text-align: right'><font color=\"" + colonySizeCol + "\">" 
                    + this._totalColonists + "</font></td></tr>";

                var energyProductionCol = colSelect(0.05, this.energyDelta);
                newstatus += "<tr class='summary'><td>Energy production</td><td style='text-align: right'><font color=\"" + energyProductionCol + "\">" 
                    + this.energyDelta.toFixed(1) + "</font></td></tr>";
                newstatus += "<tr><td>&nbsp;</td></tr><tr class='summary' id='day'><td>Days Left</td><td style='text-align: right'>" + (this.totalDays - this.days) + "</td></tr></table>";
                Crafty("Status").each(function() {
                        this.text(newstatus);
                });

                
            }});
};
