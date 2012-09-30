function buildTree(indexUrl, checked){
    //Get the sensor index file and build and display the sensor tree.
    sensors = getSensors(indexUrl,checked);
    tree(sensors,checked);
}
        
function refreshTree(){
    //Check that the sensors index file has been run at least once to collect data, and refresh the tree
    if (typeof sensors != "underfined") tree(sensors);
}
        
function getSensors(indexfile,checked){
    //Get the sensor index file and build the JS object tree from it.
    var elecsensors = ui.catchError(ui, cache.getObject, [indexfile]).sensors.elec;
    //Get array of sensors from index file, and create blank destination object
    var treedata = new Object();
    //var bld = 'Building';
	treeIndex.clearStore();
    var objcircuit = {}; //"AVerage":treeIndex.addNewItem(0)};
    var objStats; // = {"(Total - Monitored) Difference":treeIndex.addNewItem(0)};
    //treeIndex.appendItemURL("dataDiff", objStats["(Total - Monitored) Difference"]);
    //objcircuit[bld] = null;
	//console.log(elecsensors.length);
	
    for(var i=0;i<elecsensors.length;i++){
        console.log("looped");
        var path = elecsensors[i].path;        
        var av = sensorAccess.getLatestAverage(path);
        //console.log(av);
        //get most recent reading & work out size and total thus.
        //objcircuit[path] = treeIndex.addNewItem(av);
        //console.log(objcircuit[i]);
        //treeIndex.appendItemURL(elecsensors[i].path, objcircuit[path]);
      
      
		//var roomArray = elecsensors[i].room;
		var school = elecsensors[i].school;
		var faculty = elecsensors[i].faculty;
		var department = elecsensors[i].department;
        var code = elecsensors[i].path.split("/")[2].split("-")[0];
                 
		//var faculty="";

		//var objroom = new Object();
		//var objfloor = new Object();

		if(!(school in objcircuit)){
				objcircuit[school] = {"Average":treeIndex.addNewItem(av)};
				treeIndex.appendItemURL(path,objcircuit[school].Average);
                }
		else{
			var ind = objcircuit[school].Average;
			treeIndex.sumItemAverage(av, ind);
			treeIndex.appendItemURL(path, ind);
			}
                
		if(!(faculty in objcircuit[school])){
			objcircuit[school][faculty] = {"Average":treeIndex.addNewItem(av)};
			treeIndex.appendItemURL(path,objcircuit[school][faculty].Average);
			}
		else{
			var ind = objcircuit[school][faculty].Average;
			treeIndex.sumItemAverage(av,ind);// += recentaverage;
			treeIndex.appendItemURL(path, ind);
			}
                
		if(!(department in objcircuit[school][faculty])){
				objcircuit[school][faculty][department+" ("+code+")"] = treeIndex.addNewItem(path);
				}
		else{
			var tmpobj = {};
			objcircuit[school][faculty][department+" ("+code+")"] = treeIndex.addNewItem(path);
			}

      
            
		av = null;
    }
        
        treedata.Electricity = new Object();
        //treedata.Stats = objStats;
        treedata.Electricity = objcircuit;
        return treedata;
}
