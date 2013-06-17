dojo.require("esri.map");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require("dijit.dijit"); // optimize: load dijit layer
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.dijit.Popup");

var map, _maps = [], _popup = [], _mapInfo = [], urlObject, _csvLayers = [], _storyPoints = [], mapsLoaded = 0, mapsReady = false;

function initMap() {
      patchID();
      
      if(configOptions.geometryserviceurl && location.protocol === "https:"){
        configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:','https:');
      }
      esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);  
      


      if(!configOptions.sharingurl){
        configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
      }
      esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
       
      if(!configOptions.proxyurl){   
        configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
      }

      esri.config.defaults.io.proxyUrl =  configOptions.proxyurl;

      esri.config.defaults.io.alwaysUseProxy = false;
      
      urlObject = esri.urlToObject(document.location.href);
      urlObject.query = urlObject.query || {};
      
      if(urlObject.query.title){
        configOptions.title = urlObject.query.title;
      }
      if(urlObject.query.subtitle){
        configOptions.title = urlObject.query.subtitle;
      }
      if(urlObject.query.webmap){
        configOptions.webmap = urlObject.query.webmap;      
      } 
      if(urlObject.query.bingMapsKey){
        configOptions.bingmapskey = urlObject.query.bingMapsKey;      
      }
	  
      
     if (configOptions.webmaps.length === 1){
         $("#tabs").hide();
     }
     
   	 createMaps();
}


function createMaps(){
		
	dojo.forEach(configOptions.webmaps,function(webmap,i){
		
	  $("#map").append("<div id='mapDiv"+i+"' class='mapDiv'></div>");
	  $("#storyPoints").append("<div id='story"+i+"' class='story'></div>");
	  $("#tabs").append("<div id='tab"+i+"' class='tab'></div>");
	  $("#legendDiv").append("<div id='legendDiv"+i+"' class='legendDiv'></div>");
	  
	  $("#tab"+i).data("count", i);
	  
	  var popup = new esri.dijit.Popup({
		highlight:true
      }, dojo.create("div"));
	  
	  _popup[i] = popup;

      var mapDeferred = esri.arcgis.utils.createMap(webmap.id, "mapDiv"+i, {
        mapOptions: {
          slider: true,
          nav: false,
          wrapAround180:true,
		  infoWindow:popup
        },
        ignorePopups:false,
        bingMapsKey: configOptions.bingmapskey
      });

      mapDeferred.addCallback(function (response) {
		  
        mapInfo = {"title": response.itemInfo.item.title || "",
				   "subtitle": response.itemInfo.item.snippet || "",
				   "description": response.itemInfo.item.description || ""};
        
		$("#tab"+i).html(mapInfo.title);
		
        map = response.map;
		_maps[i] = map;
		_mapInfo[i] = mapInfo;
		
		dojo.connect(map,"onUpdateEnd",hideLoader);
		  
        var layers = response.itemInfo.itemData.operationalLayers;
		
        if(map.loaded){
          initUI(response, i);
		  findLayers(layers,i);
        }
        else{
          dojo.connect(map,"onLoad",function(){
            initUI(response, i);
			findLayers(layers,i);
          });
        }
        //resize the map when the browser resizes
        dojo.connect(dijit.byId('map'), 'resize', map,map.resize);
       });

      mapDeferred.addErrback(function (error) {
          alert("Unable to create map: " + " " + dojo.toJson(error.message));
      });
	});
}


    function initUI(response, i) {
      //add chrome theme for popup
      dojo.addClass(map.infoWindow.domNode, "chrome");
      //add the scalebar 
      var scalebar = new esri.dijit.Scalebar({
        map: map,
        scalebarUnit:"english" //metric or english
      });

      $(".esriSimpleSliderIncrementButton").addClass("zoomButtonIn");
      $(".zoomButtonIn").each(function (i) {
        $(this).after("<div class='esriSimpleSliderIncrementButton initExtentButton'><img style='margin-top:5px' src='images/home.png'></div>");
        $(".initExtentButton").click(function () {
            map.setExtent(map._mapParams.extent);
        });
      });

      var layerInfo = esri.arcgis.utils.getLegendLayers(response);
      
      if(layerInfo.length > 0){
        var legendDijit = new esri.dijit.Legend({
          map:map,
          layerInfos:layerInfo
        },"legendDiv"+i);
        legendDijit.startup();
      }
      else{
        $("#legendDiv").hide();
      }
	}
	
	function buildLayersList(layers){
      //build a list of layers for the legend.
      var layerInfos = [];
      dojo.forEach(layers, function(mapLayer, index) {
		if(mapLayer.id.search("csv") != 0) {
			if(mapLayer.featureCollection){
			  if (mapLayer.featureCollection.layers && mapLayer.featureCollection.showLegend) {
				if(mapLayer.featureCollection.layers.length === 1){
				  layerInfos.push({"layer":mapLayer.featureCollection.layers[0].layerObject,"title":mapLayer.title});
				}
				else{
				  dojo.forEach(mapLayer.featureCollection.layers, function(layer) {
					 layerInfos.push({
						layer: layer.layerObject, 
						title: layer.layerDefinition.name
					  });
				  }); 
				}
				
			  }
			 }else if (mapLayer.layerObject){
				layerInfos.push({layer:mapLayer.layerObject, title:mapLayer.title});
			 }
		}
      });
			return layerInfos;
}
	
function hideLoader(){
	if (mapsLoaded <= configOptions.webmaps.length){
		if (mapsLoaded == configOptions.webmaps.length - 1){
			mapsReady = true;
			mapsLoaded++
			document.title = configOptions.title|| _mapInfo[0].title || "";
        	dojo.byId("title").innerHTML = configOptions.title || _mapInfo[0].title || "";
        	dojo.byId("subtitle").innerHTML = configOptions.subtitle|| _mapInfo[0].subtitle || "";
			dojo.byId("description").innerHTML = configOptions.description|| _mapInfo[0].description || "";
			$("#tab0").addClass('selectedStory');
			$("#legendDiv0").show();
			dojo.forEach(configOptions.webmaps,function(map,i){
				if (i != 0){
					$("#mapDiv"+i).hide();
				}
			});
			$("#mapBlind").fadeOut();
			$("#loadingCon").hide();
            dijit.byId("mainWindow").layout();
		}
		else{
			mapsLoaded++
		}
	}
}


function patchID() {  //patch id manager for use in apps.arcgis.com
       esri.id._isIdProvider = function(server, resource) {
       // server and resource are assumed one of portal domains
 
       var i = -1, j = -1;
 
       dojo.forEach(this._gwDomains, function(domain, idx) {
         if (i === -1 && domain.regex.test(server)) {
           i = idx;
         }
         if (j === -1 && domain.regex.test(resource)) {
           j = idx;
         }
       });
 
       var retVal = false;
   
       if (i > -1 && j > -1) {
         if (i === 0 || i === 4) {
           if (j === 0 || j === 4) {
             retVal = true;
           }
         }
         else if (i === 1) {
           if (j === 1 || j === 2) {
             retVal = true;
           }
         }
         else if (i === 2) {
           if (j === 2) {
             retVal = true;
           }
         }
         else if (i === 3) {
           if (j === 3) {
             retVal = true;
           }
         }
       }
 
       return retVal;
     };    
    }
