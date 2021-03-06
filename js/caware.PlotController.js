function PlotController(config, useri, weather) {
    // A Class for defining a controller object for plots
    this.autoFilter = config.autoFilter.value;
    this.weather = weather;
    this.ui = useri;
    this.plotarray = new Array();
    this.maxplots = config.maxNumberPlots.value;
    this.badUrls = [];
    this.viewrange = {"startdate":new Date(),"enddate":new Date()};
    
    var sensorindex = ui.catchError(ui, cache.getObject, config.indexUrl.value);
    
    this.getPlots = function(){
        return this.plotarray;
    };
    
    this.getColourByUrl = function(ploturl){
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (ploturl.compare(this.plotarray[i].url)){
                    found = true;
                    return this.plotarray[i].colour;
                    break;
                }
            }
        }
    };
    
    this.updateAvgSelected = function(ploturl, avgsel){
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (ploturl.compare(this.plotarray[i].sensor)){
                    found = true;
                    this.plotarray[i].avgselected = avgsel;
                    break;
                }
            }
        }
        if (!found) return -1;
        else if (found) return 1;
    };
    
    this.updateAvgByIndex = function (id, avgsel){
        this.plotarray[id].avgselected = avgsel;
    };
    
    this.togglePlotByUrl = function(sensorurl){
        // Adds a new plot to the store from an array of ploturls
        var colourCopy = sensorurl.slice(0);
        if (sensorurl[0] === "dataDiff"){
            sensorurl.splice(0, 1);
            var statType = "dataDiff"
        }

        var elecsensors = sensorindex.sensors.elec;        
        var monthread = 'monthly-readings';
        var year, month, endyear, endmonth;
        var startmax, endmax;
        
        for(var i=0;i<elecsensors.length;i++){
            for(var z=0;z<sensorurl.length;z++){
            	//alert("elecsensors.length = " + elecsensors.length);
            	//alert("sensorurl.length = " + sensorurl.length);
                if (elecsensors[i].path == sensorurl[z]){
                    var key = "monthly-readings";
                    var recentreading = elecsensors[i][key][0];
                    var endmax = elecsensors[i][key][0].match(/[0-9]{4}-[0-9]{2}/)[0];
                    var tmplen = elecsensors[i][key].length-1;
                    var startmax = elecsensors[i][key][tmplen].match(/[0-9]{4}-[0-9]{2}/)[0];
                    var mymatch = recentreading.match(/-[0-9]{4}-[0-9]{2}/)[0];
                    var recentyear = mymatch.slice(1,5);
                    var recentmonth = mymatch.slice(6,8);
                    
                    year = recentyear;
                    month = recentmonth;
                    endyear = recentyear;
                    endmonth = recentmonth;
                }
            }
        }
        
        ploturl = [];
        for (var x=0; x<sensorurl.length; x++){
        	//alert(config.sensorFilesUrl.value+sensorurl[x]);
            ploturl[x] = config.sensorFilesUrl.value+sensorurl[x];
        }
        
        //alert("made it");
        var plotline = {"id":0,"url":ploturl,"buildingCode":"","sensor":colourCopy,
                        "startmonth":month.toString(), "startyear":year.toString(),
                        "endmonth":endmonth.toString(), "endyear":endyear.toString(),
                        "startmonthyear":month.toString()+'-'+year.toString(),
                        "endmonthyear":endmonth.toString()+'-'+endyear.toString(),
                        "startmax":startmax, "endmax":endmax,
                        "buildingCode":"Building Code",
                        "circuit":"Circuit", "avgselected":10.0,
                        "avgtotal":15.0, "totalenergy":20.0,
                        "maxtime":0, "mintime":0,
                        "maxenergy":0.0, "minenergy":0.0,
                        "data":new Array()}
                        
        if (statType){
            plotline["colour"] = colourpool.getColour(colourCopy.toString());
            plotline["stat"] = statType;
        }
        else{
            plotline["colour"] = colourpool.getColour(sensorurl.toString());
            plotline["stat"] = "none";
        }
        var found = false;
        
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (cmpArray(plotline.sensor, this.plotarray[i].sensor)){
                    found = true;
                    this.plotarray.splice(i,1);
                    break;
                }
            }
        }
        
        if (!found){
            if (this.plotarray.length == this.maxplots){
            }
            else {
                this.plotarray.push(plotline);
                //Get starting dates from first plot in array, and iterate to find the earliest / latest dates.
                var tmpstart = new Date.parse(this.plotarray[0].startyear+"-01-"+this.plotarray[0].startmonth);
                var tmpend = new Date.parse(this.plotarray[0].endyear+"-01-"+this.plotarray[0].endmonth);
                
                for (var p in this.plotarray){
                    if (this.plotarray.hasOwnProperty(p)){
                        var plotstart = new Date.parse(this.plotarray[p].startyear+"-01-"+this.plotarray[p].startmonth);
                        var plotend = new Date.parse(this.plotarray[p].endyear+"-01-"+this.plotarray[p].endmonth);
                        
                        if (plotstart.isBefore(tmpstart)){
                            tmpstart = Date.parse(this.plotarray[p].startyear+"-01-"+this.plotarray[p].startmonth);
                        }
                        if (plotend.isAfter(tmpend)){
                            tmpend = Date.parse(this.plotarray[p].endyear+"-01-"+this.plotarray[p].endmonth);
                        }
                    }
                }
                
                this.viewrange.startdate = tmpstart;
                this.viewrange.enddate = tmpend;
                
                for (var p in this.plotarray){
                    if (this.plotarray.hasOwnProperty(p)){
                        //make mure start max into data before is before stuff.
                        var tmpstartmax = Date.parse(this.plotarray[p].startmax.slice(0,4)+"-01-"+this.plotarray[p].startmax.slice(5,7));
                        var tmpendmax = Date.parse(this.plotarray[p].endmax.slice(0,4)+"-01-"+this.plotarray[p].endmax.slice(5,7));
                        if (tmpstartmax.isBefore(this.viewrange.startdate)){
                            //If the sensors history goes back further than the view range, use the viewrange as the start
                            this.plotarray[p].startyear = this.viewrange.startdate.getFullYear().toString();
                            this.plotarray[p].startmonth = this.viewrange.startdate.getMonth()+1;
                            this.plotarray[p].startmonth = this.plotarray[p].startmonth.toString();
                        }
                        else {
                            //Else, use the sensor's earliest data set
                            this.plotarray[p].startyear = tmpstartmax.getFullYear().toString();
                            this.plotarray[p].startmonth = tmpstartmax.getMonth()+1;
                            this.plotarray[p].startmonth = this.plotarray[p].startmonth.toString();
                        }
                        if (tmpendmax.isAfter(this.viewrange.enddate)){
                            //If the sensors most recent data is after the viewport, use the viewport as the end point
                            this.plotarray[p].endyear = this.viewrange.enddate.getFullYear().toString();
                            this.plotarray[p].endmonth = this.viewrange.enddate.getMonth()+1;
                            this.plotarray[p].endmonth = this.plotarray[p].endmonth.toString();
                        }
                        else {
                            //Else, use the most recent data availible from the sensor.
                            this.plotarray[p].endyear = tmpendmax.getFullYear().toString();
                            this.plotarray[p].endmonth = tmpendmax.getMonth()+1;
                            this.plotarray[p].endmonth = this.plotarray[p].endmonth.toString();
                        }
                    }
                }
            }
        }
        
        if (this.plotarray.length == 0) return 0;
        else {
            for (var p in this.plotarray){
                if (this.plotarray.hasOwnProperty(p)){
                    this.plotarray[p].id = p;
                }
            }
            return this.plotarray;
        }
    };
    
    this.getPlotByUrl = function(ploturl){
        // Gets a new plot from the store
        return false;
    };
    
    this.replacePlotByUrl = function(plot){
        // Replaces a plot already in the store.
        return false;
    };
    
    this.addMonth = function(){
        //
        this.viewrange.startdate = new Date(this.viewrange.startdate).addMonths(-1);
        var noDataPlotCount = 0;
        var noDataSensors = [];
        
        for (var p in this.plotarray){
            if (this.plotarray.hasOwnProperty(p)){
                var tmpmonth = (this.viewrange.startdate.getMonth()+1); // get current month
                if (tmpmonth < 10) tmpmonth = "0"+tmpmonth;
                
                for (var u=0; u< this.plotarray[p].url.length; u++){
                    var noDataCount = 0;
                    var tmpstr = this.plotarray[p].url[u].substring(30);
                    
                    if (sensorAccess.checkReadingExists(tmpstr, this.viewrange.startdate.getFullYear().toString()+'-'+tmpmonth.toString())){
                        //at least one URL has data for the month so extend the plot date.
                        this.plotarray[p].startyear = this.viewrange.startdate.getFullYear().toString();
                        this.plotarray[p].startmonth = tmpmonth.toString();
                        this.plotarray[p].startmonthyear = tmpmonth.toString()+'-'+this.viewrange.startdate.getFullYear().toString();
                    }
                    else {
                        noDataSensors.push(tmpstr);
                        var badstr = config.sensorFilesUrl.value+tmpstr+this.viewrange.startdate.getFullYear().toString()+'-'+tmpmonth.toString();
                        console.log("No Reading for "+tmpstr);
                        this.badUrls.push(badstr);
                        noDataCount++;
                    }
                }
                if (this.plotarray[p].url.length == noDataCount){
                    noDataPlotCount++;
                }
                else if (noDataSensors.length > 0){
                    var sensorString = "";
                    for (warn in noDataSensors){
                        if (noDataSensors.hasOwnProperty(warn)){
                            sensorString += noDataSensors[warn].split("/S-")[1].split("-")[0]+", ";
                        }
                    }
                    this.ui.showError("Warning:", "No readings available for sensors "+sensorString, "warn", 8, ui);
                }
                
            }
        }
        if (this.plotarray.length == noDataPlotCount){
            this.ui.showError("Info:", "No more history data availble for currently displayed sensors.", "info", 8, ui);
            this.viewrange.startdate = new Date(this.viewrange.startdate).addMonths(1);
        }
        //console.log("Bad URLS:");
        //console.log(this.badUrls);
    };
    
    this.removeMonth = function(){
        return false
    };
    
    this.calculateData = function(useWeather, showDiff){
        
        if (showDiff){
            var diffArr = [];
            var stYear = this.viewrange.startdate.getFullYear().toString();
            var endYear = this.viewrange.enddate.getFullYear().toString();
            var stMonth = (this.viewrange.startdate.getMonth()+1);
            var endMonth = (this.viewrange.enddate.getMonth()+1);
            if (stMonth < 10) stMonth = "0"+stMonth;
            if (endMonth < 10) endMonth = "0"+endMonth;
            
            var monthArray = getMonthsBetween(stMonth,stYear,endMonth,endYear);
            for (mnth in monthArray){
                var date1 = new Date();
                if (monthArray.hasOwnProperty(mnth)){
                    diffArr.push(sensorAccess.getMissingMonitored(monthArray[mnth]));
                }
                var date2 = new Date();
                console.log(date2 - date1);
            }
        }
        // Calculate and return the data points, start, end and maximum values used for drawing the plots.
        
        //  Create and initialise an array for storing the json data from the sensors
        var jsonArray = new Array();
        for (var x=0;x<this.maxplots;x++){
            jsonArray.push([]);
        }
        
        if (this.plotarray.length == 0) return 0;
        
        var plotArray = this.plotarray;
        var errorArr = [];
        
        this.testURL = function(url){
            for (item in this.badUrls){
                if (this.badUrls.hasOwnProperty(item)){
                    if (url === this.badUrls[item]+".json"){
                        //console.log('bad item stopped');
                        //console.log(url);
                        return false;
                    }
                }
            }
            return true;
        };
        
        //For each plot in plotArray
        for(var i=0;i<plotArray.length;i++){
        //If the plot contains more than one URL, add up the data in the multiple URLs
            if (plotArray[i].url.length > 1){
                //Create array to store the summed data
                var totaldata = new Array();
                var totalobj = new Object();
                //For each URL belonging to the plot
                
                for (var k=0; k<plotArray[i].url.length; k++){
                    //Add the json object of that array to the array in jsonArray
                    montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    var positiveFlip = false;
                    var initialised = false;
                    for (var t=0;t<montharray.length;t++){
                        if (!initialised){
                            var tmpURL = plotArray[i].url[k]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[k].split("/S-m")[1]+montharray[t]+".json";
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var z=0; z<errorList[sen].length; z++){
                                            var error = errorList[sen][z];
                                            if(fileName === error.filename){
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                }
                                            }
                                        } 
                                    }
                                }
                                
                                var sensorSName = "S-m"+plotArray[i].url[k].split("/S-m")[1];
                                if(plotArray[i].stat === 'dataDiff' && sensorSName === "S-m36-"){
                                    positiveFlip = true;
                                    for (var d=0; d<tempJSON.data.length; d++){
                                        if(typeof(tempJSON.data[d][1]) === "number"){
                                        }
                                    }
                                    jsonArray[i][k] = tempJSON;
                                }
                                else if (sensorSName === "S-m44-" && fix44){
                                    //console.log("fixing!");
                                    for (var d=0; d<tempJSON.data.length; d++){
                                        if (tempJSON.data[d][0] <= 1338379200000){
                                            console.log("A*40");
                                            tempJSON.data[d][1] = tempJSON.data[d][1] * 40;
                                        }
                                    }
                                    jsonArray[i][k] = tempJSON;
                                    //console.log("fixed!");
                                }
                                else{
                                    jsonArray[i][k] = tempJSON;
                                }
                                initialised = true;
                            }
                        }
                        else{
                            var tmpURL = plotArray[i].url[k]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[k].split("/S-m")[1]+montharray[t]+".json";
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var z=0; z<errorList[sen].length; z++){
                                            var error = errorList[sen][z];
                                            if(fileName === error.filename){
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                }
                                            }
                                        } 
                                    }
                                }
                                var sensorSName = "S-m"+plotArray[i].url[k].split("/S-m")[1];
                                if(plotArray[i].stat === 'dataDiff' && sensorSName === "S-m36-"){
                                    positiveFlip = true;
                                    
                                    for (var d=0; d<tempJSON.data.length; d++){
                                        if(typeof(tempJSON.data[d][1]) === "number"){
                                        }
                                    }
                                    
                                    jsonArray[i][k].data = jsonArray[i][k].data.concat(tempJSON.data);
                                }
                                else if (sensorSName === "S-m44-" && fix44){
                                    //console.log("");
                                    for (var d=0; d<tempJSON.data.length; d++){
                                        if (tempJSON.data[d][0] <= 1338379200000){
                                            console.log("B*40");
                                            tempJSON.data[d][1] = tempJSON.data[d][1] * 40;
                                        }
                                    }
                                    jsonArray[i][k].data = jsonArray[i][k].data.concat(tempJSON.data);
                                    //jsonArray[i][k] = tempJSON;
                                    //console.log("fixed!");
                                }
                                else{
                                    jsonArray[i][k].data = jsonArray[i][k].data.concat(tempJSON.data);
                                }
							}
                        }
                    }
                    //Add the buildingCode to the buildingCode
                    //Use coverage if availible
                    var coveravail = false;
                    if (jsonArray[i][k].coverage){
                        if (jsonArray[i][k].coverage != 'cOVERAGE'){
                            jsonArray[i][0].buildingCode += ", "+jsonArray[i][k].coverage;
                            coveravail = true;
                        }
                    }
                    
                    if (!coveravail){
                        jsonArray[i][0].buildingCode += ", "+jsonArray[i][k].buildingCode+"-"+jsonArray[i][k].identifier;
                    }
                    
                    
                    //go through dataset, and add in any dates we found that aren't in the
                    //total data set, and initialise them to 0.
                    var tmpdata = jsonArray[i][k].data.slice(0);
                    for(var p=0; p<tmpdata.length; p++){
                        var key = tmpdata[p][0].toString();
                        
                        if (!totalobj.hasOwnProperty(key)){
                            totalobj[key] = 0.0;
                        }
                        
                        var bad = false;
                        if (typeof totalobj[key] == "string"){
                            bad = true;
                            totalobj[key] = parseFloat(totalobj[key].split(':')[1]);
                        }
                        if (typeof tmpdata[p][1] == "string"){
                            bad = true;
                            tmpdata[p][1] = parseFloat(tmpdata[p][1].split(':')[1]);
                        }
                        
                        if(positiveFlip){
                            totalobj[key] -= tmpdata[p][1];
                            //totalobj[key] =- totalobj[key];
                            //console.log("flipped!"+fileName);
                        }
                        else{
                            totalobj[key] += tmpdata[p][1];
                            //console.log("Added "+fileName);
                        }
                        
                        if (bad){
                            totalobj[key] = "BAD:"+totalobj[key].toString();
                        }
                    }
                    
                    if (positiveFlip){
                        var wasFlipped = true;
                    }
                    positiveFlip = false;
                    }
                
                if(wasFlipped){
                    for (var dat in totalobj){
                        if(totalobj.hasOwnProperty(dat)){
                        }
                    }
                }
                
                // Convert string of epoch date into int, and sort dates.
                var totalarr = [];
                for (var dat in totalobj){
                    if(wasFlipped){
                        var bad = false;
                        if (typeof totalobj[dat] == "string"){
                            bad = true;
                            totalobj[dat] = parseFloat(totalobj[dat].split(':')[1]);
                        }
                        var minusTemp =-totalobj[dat];
                        if (bad) totalarr.push([parseInt(dat, 10),"BAD:"+minusTemp.toString()]);
                        else totalarr.push([parseInt(dat, 10),minusTemp]);
                    }
                    else{
                        totalarr.push([parseInt(dat, 10),totalobj[dat]]);
                    }
                }
                wasFlipped = false
                totalarr.sort(sortArrayNum);
                
                for (var dat in totalarr){
                    var tmpdate = new Date(totalarr[dat][0]);
                }
                
                jsonArray[i][0].data = totalarr;
                totaldata = null;
                totalobj = undefined;
                jsonArray[i][0].buildingCode = "--";
            }
            else{
                montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                var initialised = false;
                for (var t=0;t<montharray.length;t++){
                        if (!initialised){
                            var tmpURL = plotArray[i].url[0]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[0].split("/S-m")[1]+montharray[t]+".json";
                                
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var e=0; e<errorList[sen].length; e++){
                                            var error = errorList[sen][e];
                                            if(fileName === error.filename){
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                }
                                            }
                                        } 
                                    }
                                }
                                var sensorSName = "S-m"+plotArray[i].url[0].split("/S-m")[1];
                                //console.log(sensorSName);
                                if (sensorSName === "S-m44-" && fix44){
                                    //console.log("this 44!");
                                    for (var d=0; d<tempJSON.data.length; d++){
                                        if (tempJSON.data[d][0] <= 1338379200000){
                                            console.log("C*40");
                                            tempJSON.data[d][1] = tempJSON.data[d][1] * 40;
                                        }
                                    }
                                    //jsonArray[i][k] = tempJSON;
                                    //console.log("fixed!");
                                }
                                jsonArray[i][0] = tempJSON;
                                initialised = true;
                            }
                        }
                        else{
                            var tmpURL = plotArray[i].url[0]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[0].split("/S-m")[1]+montharray[t]+".json";
                                
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var e=0; e<errorList[sen].length; e++){
                                            var error = errorList[sen][e];
                                            if(fileName === error.filename){
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                }
                                            }
                                        } 
                                    }
                                }
                                var sensorSName = "S-m"+plotArray[i].url[0].split("/S-m")[1];
                                //console.log(sensorSName);
                                if (sensorSName === "S-m44-" && fix44){
                                    //console.log("fixing!");
                                    for (var d=0; d<tempJSON.data.length; d++){
                                        if (tempJSON.data[d][0] <= 1338379200000){
                                            console.log("D*40");
                                            tempJSON.data[d][1] = tempJSON.data[d][1] * 40;
                                        }
                                    }
                                    //jsonArray[i][k] = tempJSON;
                                    //console.log("fixed!");
                                }
                                jsonArray[i][0].data = jsonArray[i][0].data.concat(tempJSON.data);
                            }
                        }
                    }
            }
            var tmptotal = 0;
            var tmpdata = new Array();
            
            plotArray[i].buildingCode = jsonArray[i][0].buildingCode+"-"+jsonArray[i][0].identifier;
            //plotArray[i].buildingCode = jsonArray[i][0].buildingCode+"-"+jsonArray[i][0].identifier;
            plotArray[i].buildingName = jsonArray[i][0].buildingName;
            
            
            //for (var j=0; j<jsonArray[i].length; j++){
            //    var tmpx = jsonArray[i][0].data[j][0];
            //    var tmpy = jsonArray[i][0].data[j][1];
            //    var bad = false;
            
            //plotArray[i].area += ;
            
            plotArray[i].area = "0";
			plotArray[i].site ="";
			plotArray[i].age ="";
			
			var siteChars = new Object(); // or just {}
			siteChars["Old Schools"] = 'A';
			siteChars["Old Press"] = 'B';
			siteChars["Scroope House"] = "C";
			siteChars["Downing"] = "D";
			siteChars["Old Addenbrooke's"] = "E";
			siteChars["North West"] = "F";
			siteChars["Milton Road"] = "G";
			siteChars["Addenbrooke's/Forvie"] = "H";
			siteChars["North City"] = "K";
			siteChars["South City"] = "L";
			siteChars["New Museums"] = "M";
			siteChars["Other"] = "Q";
			siteChars["Lords Bridge"] = "R";
			siteChars["Sidgwick"] = "S";
			siteChars["Madingley Rise"] = "T";
			siteChars["West Cambridge"] = "W";
			
			//min=0;
			//max=0;
            if (jsonArray[i].length != 1){
            for (var j=0; j<jsonArray[i].length; j++){
            	plotArray[i].area = (parseFloat(plotArray[i].area) + parseFloat(jsonArray[i][j].area)).toString();
				//alert(plotArray[i].site);
				//alert((plotArray[i].site).indexOf(siteChars[jsonArray[i][j].site]));
				if((plotArray[i].site).indexOf(siteChars[jsonArray[i][j].site]) == -1)
					{
					plotArray[i].site = plotArray[i].site + siteChars[jsonArray[i][j].site] + ",";
					}
				//alert(jsonArray[i][j].buidlingCode.substring(0,1)
				//plotArray[i].site += jsonArray[i][j].buidlingCode.substring(0,1);
				}
			//remove last character
			plotArray[i].site = plotArray[i].site.slice(0,plotArray[i].site.length-1);
			plotArray[i].area = (parseFloat(plotArray[i].area)).toFixed(2);
			//plotArray[i].age = min.toString() + "-" + max.toString();
            }
            else{
            plotArray[i].area = jsonArray[i][0].area;
            plotArray[i].site = jsonArray[i][0].site;
            plotArray[i].age = jsonArray[i][0].buildingAge;
            }
            
            plotArray[i].staff = jsonArray[i][0].staff;


            
            var plotBadData = false;
            var badPoints = 0;
            
            for (var j=0; j<jsonArray[i][0].data.length; j++){
                var tmpx = jsonArray[i][0].data[j][0];
                var tmpy = jsonArray[i][0].data[j][1];
                var bad = false;
                
                if (!plotBadData){
                    if (typeof tmpy == "number"){
                        if (tmpy > this.autoFilter.maxY){
                            bad = true;
                        }
                        else if (tmpy < this.autoFilter.minY){
                            bad = true;
                        }
                    }
                }
                if (typeof tmpy == "string"){
                    tmpy = parseFloat(tmpy.split(':')[1]);
                    bad = true;
                }
                
                if (!bad) tmptotal += tmpy;
                
                if (tmpdata.length == 0){
                    plotArray[i].maxtime = tmpx;
                    plotArray[i].mintime = tmpx;
                    if (!bad){
                        plotArray[i].maxenergy = tmpy;
                        plotArray[i].minenergy = tmpy;
                    }
                    else{
                        plotArray[i].maxenergy = 0;
                        plotArray[i].minenergy = 0;
                    }
                }
                else {
                    if (tmpx > plotArray[i].maxtime){plotArray[i].maxtime = tmpx;}
                    else if (tmpx < plotArray[i].mintime){plotArray[i].mintime = tmpx;}
                    if (!bad){
                        if (tmpy > plotArray[i].maxenergy){plotArray[i].maxenergy = tmpy;}
                        else if (tmpy < plotArray[i].minenergy){plotArray[i].minenergy = tmpy;}
                    }
                }
                
                var tmpDataPoint = {x:new Date(tmpx), y: tmpy};
                if(bad){
                    if(plotBadData){
                        tmpDataPoint.bad = true;
                        tmpdata.push(tmpDataPoint);
                    }
                    else{
                        if(j>0){
                    	//alert("j = " + j);
                    	//alert("tmpdata = " + tmpdata);                    	
                    	//alert("badPoints = " + badPoints);      
						//alert("j-badPoints-1 = " + (j-badPoints-1));                          	              	
						//alert("tmpdata[j-badPoints-1] = " + tmpdata[j-badPoints-1]);                          	              	                        
                        
                        //if (tmpdata[j-badPoints-1]==undefined)
                        //{tmpdata[0].bad = true}
                        //else
						//{
                        tmpdata[j-badPoints-1].bad = true;
                        //}
                        }
                    }
                    ++badPoints;
                }
                else{
                    tmpdata.push(tmpDataPoint);
                }
            }
            plotArray[i].avgtotal = Math.round((tmptotal / tmpdata.length)*1000)/1000;
            plotArray[i].totalenergy = Math.round(tmptotal*1000)/1000;
            plotArray[i].data = tmpdata;
            tmpdata = null;
            tmptotal = 0;
        }
        
        var dataArray = new Array();
        var start = null;
        var end = null;
        var chartmax = [];
        var plotcolours = [];
        
        for (var i=0; i<plotArray.length; i++){
            plotcolours[i] = plotArray[i].colour;
            if (i == 0){
                start = new Date(plotArray[0].data[0].x);
                end = new Date(plotArray[0].data[plotArray[0].data.length - 1].x);
            }
            else {
                if (plotArray[i].data[0].x < start){
                    start = new Date(plotArray[i].data[0].x);
                }
                if (plotArray[i].data[plotArray[i].data.length - 1].x > end){
                    end = new Date(plotArray[i].data[plotArray[i].data.length - 1].x);
                }
            }
            chartmax[i] = plotArray[i].data[0].y
            for (var j=0; j<plotArray[i].data.length; j++){
                if (plotArray[i].data[j].y > chartmax[i]){
                    chartmax[i] = plotArray[i].data[j].y;
                }
            }
            dataArray.push(plotArray[i].data);
        }
        
        var chartcount = plotArray.length;
        
        if (useWeather){
            var sDate = new Date(start);
            var eDate = new Date(end);
            
            var fin = true;
            var days = 0;
            var weatherarr = [];
            while (fin){
                if (Date.compare(sDate.clearTime(), eDate.clearTime()) > 0){
                    fin = false;
                }
                else{
                    var weatherString = sDate.getFullYear().toString()+'-';
                    weatherString += (sDate.getMonth()).toString()+'-';
                    weatherString += sDate.getDate().toString();
                    var temp = weather.getTemp(weatherString);
                    for (datum in temp.data){
                        var wrk = temp.data[datum];
                        weatherarr.push({'x':wrk[0],'y':parseInt(wrk[1], 10)});
                    }

                days++;
                sDate.add(1).days();
                }
            
            }
        }
        drawChart(dataArray,start,end,chartmax,chartcount,plotcolours,weatherarr,errorArr,diffArr);
    };
    
    this.clearPlots = function(){
        this.plotarray = new Array();
    };
}