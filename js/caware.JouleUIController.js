function JouleUIController(){ 
    this.errorIds = [];
    this.errorTimeout = 10;
    this.useWeather = false;
    this.showDiff = false;
    this.scaleSelection = 'scale';
    
    this.spinVar = {
        lines: 12, // The number of lines to draw
        length: 5, // The length of each line
        width: 2, // The line thickness
        radius: 5, // The radius of the inner circle
        color: '#000', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false // Whether to render a shadow
    };
    
    this.spinner = null;
    
    this.loadSpin = function(io, callback){
        if (io == "in"){
            this.spinner = new Spinner(this.spinVar).spin();
            //$('#divSpinner').hide();
            $('#divSpinner').append(this.spinner.el);
            $('#divSpinner').fadeIn("fast", callback())
        }
        else if (io == "out"){
            $('#divSpinner').hide();
            this.spinner.stop();
        }
    };
    
    this.treeNodeClick = function(node, useri){
        var ploturl = new Array();
        var sensorUrl = treeIndex.getItem(node.nodeValue)[1];
        var senCopy = sensorUrl.slice(0);
        colourpool.toggleColour(senCopy.toString());
        
        this.loadSpin("in", function(){
            if (plotController.togglePlotByUrl(senCopy) < 0){
                colourpool.toggleColour(senCopy.toString());
            }
            plotController.calculateData(useri.useWeather, useri.showDiff);
            useri.loadSpin("out");
        });
    };
    
    this.addMonth = function(useri){
        this.loadSpin("in", function(){
            plotController.addMonth();
            plotController.calculateData(useri.useWeather, useri.showDiff);
            useri.loadSpin("out");
        });
    };
        
    this.jouleFinishedLoading = function(useri, uiType){
        this.loadSpin("in", function(){
            weather = new WeatherJSONBridge();
            plotArray = new Array();
            treeIndex = new IntValueStore();
            plotController = new PlotController(config,ui,weather);
            sensorAccess = new SensorAccessor(config.indexUrl.value,config.sensorFilesUrl.value,config);
            errorList = useri.catchError(useri, cache.getObject, [config.errorUrl.value]);
            colourpool = new ColourPool(config.plotColour.value);
            
            switch (uiType) {
              case 'line':   
                useri.changeTree(config.indexUrl.value, "treeuse");
                //var startplot = ["/energyData/W046-eng-"];
                //colourpool.toggleColour(startplot);
                //plotController.togglePlotByUrl(startplot);
                plotController.calculateData(useri.useWeather, useri.showDiff);
                refreshTree();
                break;
                
//               case 'stacked':
//                 useri.changeTree(config.indexUrl.value, "treeuse");
//                 var startplot = ["/elec/primary-cs2-riser/F-lighting/S-m15-", "/elec/primary-cs1-riser/F-lighting/S-m23-", "/elec/primary-cs4-riser/F-lighting/S-m30-"];
//                 colourpool.toggleColour(startplot);
//                 plotController.togglePlotByUrl(startplot);
//                 
//                 var startplot = ["/elec/primary-cs2-riser/G-lighting/S-m17-", "/elec/primary-G-exr/S-m20-", "/elec/primary-cs1-riser/G-lighting/S-m22-", "/elec/primary-cs4-riser/G-lighting/S-m34-", "/elec/primary-smb2/G-lighting/S-m33-"];
//                 colourpool.toggleColour(startplot);
//                 plotController.togglePlotByUrl(startplot);
//                 
//                 var startplot = ["/elec/primary-cs3-riser/S-lighting/S-m11-", "/elec/primary-cs2-riser/S-lighting/S-m13-", "/elec/primary-cs1-riser/S-lighting/S-m42-", "/elec/primary-cs4-riser/S-lighting/S-m28-"];
//                 colourpool.toggleColour(startplot);
//                 plotController.togglePlotByUrl(startplot);
//                 
//                 plotController.calculateData(useri.useWeather, useri.showDiff);
//                 refreshTree();
//                 break;
            }   
            useri.loadSpin("out");
        });
    };
    
    this.jouleStopLoading = function(useri){
        useri.loadSpin("out");
    };
    
    this.jouleTempToggle = function(useri){
      this.loadSpin("in", function(){});
        if (useri.useWeather == true){
            $('#temperButton').removeClass('success');
            useri.useWeather = false;
        }
        else if (useri.useWeather == false){
            $('#temperButton').addClass('success');
            useri.useWeather = true
        }
        plotController.calculateData(useri.useWeather, useri.showDiff);
        useri.loadSpin("out");
    };
    
    this.jouleShowDiff = function(useri){
      this.loadSpin("in", function(){});
        if (useri.showDiff == true){
            $('#showDiffButton').removeClass('success');
            useri.showDiff = false;
        }
        else if (useri.showDiff == false){
            $('#showDiffButton').addClass('success');
            useri.showDiff = true
        }
        plotController.calculateData(useri.useWeather, useri.showDiff);
        useri.loadSpin("out");
    };
    
    this.jouleScaleSelectionToggle = function(useri, scaleType){
        switch (scaleType) {
          case 'all': 
            $('#scaleAllButton').addClass('success');
            $('#scaleSelectionButton').removeClass('success');
            $('#zoomButton').removeClass('success');
            useri.scaleSelection = 'all';
            break;
          case 'scale':
            $('#scaleAllButton').removeClass('success');
            $('#scaleSelectionButton').addClass('success');
            $('#zoomButton').removeClass('success');
            useri.scaleSelection = 'scale'
            break;
          case 'zoom':
            $('#scaleAllButton').removeClass('success');
            $('#scaleSelectionButton').removeClass('success');
            $('#zoomButton').addClass('success');
            useri.scaleSelection = 'zoom'
            break;
        }
        plotController.calculateData(useri.useWeather, useri.showDiff);
    };
      
    
    this.toggleTabs = function(){
    
    };
    
    this.changeTree = function(indexUrl,treeType){
        if (treeType == 'treegeo'){
            $('#geobutton').addClass('success');
            $('#functbutton').removeClass('success');
        }
        else if (treeType == 'treeuse'){
            $('#geobutton').removeClass('success');
            $('#functbutton').addClass('success');
        }
        buildTree(indexUrl, treeType);
    };
    
    this.showError = function(error, errorText, errorType, timeout, useri){
        var id = new Date().getTime().toString();
        var genHTML = "<div class=\"alert-message "+errorType+"\" id=\""+id+"\"><p><strong>";
        switch(errorType) {
          case "warn":
            genHTML += "Warning ";
            break;
          case "error":
            genHTML += "Error ";
            break;
          case "success":
            genHTML += "Success ";
            break;
          case "info":
            genHTML += "Info ";
            break;
        }
        genHTML += "</strong> "+errorText+" </p></div>";
        $('#notify-bar').prepend(genHTML);
        var time = timeout*1000;
        var t = setTimeout('ui.hideError('+id+')', time);
    };
    
    this.hideError = function(id){
        jQid = '#'+id;
        $(jQid).hide("fast", function(){
            $(jQid).remove();
        });
    };
    
    this.catchError = function(useri, call, arg){
        var obj = call(arg);
        if (obj.error){
            useri.showError(obj.error, obj.errorText, obj.errorType, useri.errorTimeout, useri);
        }
        return obj.result;
    };
}