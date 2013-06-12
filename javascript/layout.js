$(document).ready(function(e) {
	  $("#legendToggle").click(function(){
		if ($("#legendDiv").css('display')=='none'){
		  $("#legTogText").html('MAP LEGEND ▲');
		}
		else{
		  $("#legTogText").html('MAP LEGEND ▼');
		}
		$("#legendDiv").slideToggle();
	  });
    });

var popupOpen = false,
	 j = 0,
    _storyData = [],
    selection,
    mapPoint;

var checkImg = function(obj){

	var img = new RegExp (/(?:.jpe?g|.gif|.png)/i);
	var url = new RegExp (/http/i);

	for (var prop in obj){
		if (typeof(obj[prop]) == 'string'){
			if (img.test((obj[prop])) == true && url.test((obj[prop])) == true){
				return(obj[prop]);
			}
		}
	}
};
var findTitle = function(obj){

	var udrScr = new RegExp (/"_"/i);
	var url = new RegExp (/http/i);

	var title = null;
	for (var prop in obj){
		if (typeof(obj[prop]) == 'string'){
			if (title == null && udrScr.test((obj[prop])) == false && (obj[prop]).length > 1 && url.test((obj[prop])) == false){
				title = obj[prop];
			}
		}
	}
	return (title);
};

function findLayers(layers,index){
	var csvLayers = [];
	dojo.forEach(layers,function(layer){
		if(layer.id.search("csv") == 0 && layer.visibility == true){
			dojo.forEach(layer.featureCollection.layers,function(lyr){
				csvLayers.push(lyr.layerObject);
			});
		}
		else if(layer.id.search("featColl") == 0 && layer.visibility == true){
			dojo.forEach(layer.featureCollection.layers,function(lyr){
				csvLayers.push(lyr.layerObject);
			});
		}
	});
	_csvLayers[index] = csvLayers;
	generateGraphics(index);
}

function generateGraphics(index){
	var shaded = true;
	dojo.forEach(_csvLayers[index],function(layer,i){
		if (i < 1){
			layer.hide();

			$("#story"+index).append("<div id='story"+index+"group"+i+"' class='group'></div>");

			var sp = new esri.layers.GraphicsLayer();
			map.addLayer(sp);
			_storyPoints[index] = sp;

			if (layer.graphics[0].attributes.Order){
				layer.graphics.sort(function(a,b){
					return a.attributes.Order - b.attributes.Order;
				});
			}

			dojo.forEach(layer.graphics,function(graphic,j){
				if (j < 99){
					if (shaded == true){
						shaded = false;
						$("#story"+index+"group"+i).append("<div id='story"+index+"group"+i+"point"+j+"' class='storyPoint' title='Click for more information'></div>");
					}
					else{
						shaded = true;
						$("#story"+index+"group"+i).append("<div id='story"+index+"group"+i+"point"+j+"' class='storyPoint storyPointShaded' title='Click for more information '></div>");
					}

					$("#story"+index+"group"+i+"point"+j).data("attributes", graphic.attributes);
					$("#story"+index+"group"+i+"point"+j).data("geometry", graphic.geometry);
					$("#story"+index+"group"+i+"point"+j).data("infoWindow", layer.infoTemplate);

					var group;
					var fileChange;
					if(graphic.attributes.Color){
						if (graphic.attributes.Color.toLowerCase() == "b"){
							group = 'blue';
							fileChange = 'b';
						}
						else{
							group = 'red';
							fileChange = '';
						}
					}
					else{
						group = 'red';
						fileChange = '';
					}

					var pt = graphic.geometry;
					var attr = graphic.attributes;
					var sym = new esri.symbol.PictureMarkerSymbol("images/icons/"+group+"/NumberIcon"+fileChange+(j+1)+".png", 22, 28).setOffset(3,8);
					var info = layer.infoTemplate;

					if (graphic.attributes.Order){
						$("#story"+index+"group"+i+"point"+j).append("<div id='story"+index+"group"+i+"indexCon"+j+"' class='indexCon "+group+"'><div id='story"+index+"group"+i+"pointIndex"+j+"' class='pointIndex'>"+graphic.attributes.Order+"</div></div>");
					}
					else{
						$("#story"+index+"group"+i+"point"+j).append("<div id='story"+index+"group"+i+"indexCon"+j+"' class='indexCon "+group+"'><img id='story"+index+"group"+i+"pointIndex"+j+"' class='pointIndex' src='images/icons/"+group+"/NumberIcon"+fileChange+(j+1)+".png'></div>");
					}
					/*
					else{
						$("#story"+index+"group"+i+"point"+j).append("<div id='story"+index+"group"+i+"indexCon"+j+"' class='indexCon "+group+"'><div id='story"+index+"group"+i+"pointIndex"+j+"' class='pointIndex'>"+(j+1)+"</div></div>");
					}
					*/

					var image = graphic.attributes.Thumb_URL || checkImg(graphic.attributes);
					var ifImg = true;

					if (image != null && image != "http://www.landscope.org/_res/img/contentTypeThumbnails/articleSmall.png"){
						$("#story"+index+"group"+i+"point"+j).append("<div id='story"+index+"group"+i+"imgCon"+j+"' class='imgCon'><img id='story"+index+"group"+i+"img"+j+"' class='spImg' src='"+image+"' alt=''></div>");
					}
					else{
						ifImg = false;
					}

					var title = graphic.attributes.Name || findTitle(graphic.attributes);

					$("#story"+index+"group"+i+"point"+j).data("title", title);

					if (title != null){
						$("#story"+index+"group"+i+"point"+j).append("<div id='story"+index+"group"+i+"textCon"+j+"' class='textCon'><p id='story"+index+"group"+i+"titleText"+j+"' class='titleText'>"+title+"</p></div>");

						var textWidth;

						if (ifImg == true){
							textWidth = (($(".storyPoint").width()) - 115);
							$("#story"+index+"group"+i+"textCon"+j).css('left',115);
						}
						else{
							textWidth = (($(".storyPoint").width()) - 35);
							$("#story"+index+"group"+i+"textCon"+j).css('left',35);
						}
						$("#story"+index+"group"+i+"textCon"+j).width(textWidth);
					}

					attr.displayTitle = title;

					sp.add(new esri.Graphic(pt,sym,attr,info));

				}

			});
		}
	});


	startUpListeners(index);

	$(".titleText").ellipsis();
}

function startUpListeners(index){
	dojo.connect(_storyPoints[index],"onMouseOver",function(event){
		_maps[index].setCursor('pointer');
		event.graphic.setSymbol(event.graphic.symbol.setHeight(34).setWidth(27).setOffset(3,10));
        if (popupOpen == false){
    		$("#hoverInfo").html(event.graphic.attributes.displayTitle);
			var pt = _maps[index].toScreen(event.graphic.geometry);
			hoverInfoPos(pt.x,pt.y);
		}
	});
	dojo.connect(_storyPoints[index],"onMouseOut",function(event){
		_maps[index].setCursor('default');
		event.graphic.setSymbol(event.graphic.symbol.setHeight(28).setWidth(22).setOffset(3,8));
        $("#hoverInfo").hide();
	});
	dojo.connect(_maps[index],"onClick",function(){
		popupOpen = true;
	});
	dojo.connect(_popup[index],"onHide",function(){
		popupOpen = false;
		_popup[index].clearFeatures();
        $(".storyPoint").removeClass('selection');
	});
	dojo.connect(_storyPoints[index], "onClick", function(event) {
        _popup[index].hide();
        var scrollTop = ($("#storyPoints").scrollTop());
        $("#hoverInfo").hide();
        $(".storyPoint").removeClass("selection");
        $(".storyPoint").each(function(){
            if ($(this).data("attributes") === event.graphic.attributes){
                $(this).addClass("selection");
                if($(this).position().top < 0){
                    $("#storyPoints").scrollTop(scrollTop + $(this).position().top);
                }
                else if($(this).position().top +$(this).height() > $("#storyPoints").height()){
                    $("#storyPoints").scrollTop($("#storyPoints").scrollTop() + $(this).position().top - $("#storyPoints").height() + $(this).height());
                }
            }
        });
    });
	$(".storyPoint").mouseover(function(e) {
        $(".storyPoint").removeClass('active');
		$(this).addClass('active');
        if (popupOpen == false){
    		$("#hoverInfo").html($(this).data('title'));
			var pt = _maps[index].toScreen($(this).data('geometry'));
			hoverInfoPos(pt.x,pt.y);
			var attr = $(this).data('attributes');
			dojo.forEach(_storyPoints,function (lyr,idx){
				dojo.forEach(lyr.graphics,function(graphic,ix){
					if (graphic.attributes == attr){
						graphic.setSymbol(graphic.symbol.setHeight(34).setWidth(27).setOffset(3,10));
					}
				});
			});
		}
    });
	$(".storyPoint").click(function(e) {
        popupOpen = true;
        $(".storyPoint").removeClass("selection");
        $(this).addClass("selection");
		_popup[index].show($(this).data('geometry'));
		if(_maps[j].extent.contains($(this).data('geometry')) == false){
			panMap($(this).data('geometry'));
		}
		var attr = $(this).data('attributes');
		dojo.forEach(_storyPoints,function (lyr,idx){
			dojo.forEach(lyr.graphics,function(graphic,ix){
				if (graphic.attributes == attr){
					_popup[index].setFeatures([graphic]);
				}
			});
		});
        $("#hoverInfo").hide();
    });
	$("#storyPoints").mouseout(function(e) {
        $(".storyPoint").removeClass('active');
        $("#hoverInfo").hide();
        dojo.forEach(_storyPoints,function (lyr,idx){
    		dojo.forEach(lyr.graphics,function(graphic,ix){
				graphic.setSymbol(graphic.symbol.setHeight(28).setWidth(22).setOffset(3,8));
			});
		});
    });

	$(".tab").click(function(e) {
        j = $(this).data("count");
		$(".tab").removeClass('selectedStory');
		$(this).addClass('selectedStory');
		$(".mapDiv").hide();
		$(".story").hide();
		$(".legendDiv").hide();
		$("#mapDiv"+j).show();
		$("#story"+j).show();
		$("#legendDiv"+j).show();
		dojo.byId("title").innerHTML = configOptions.title || _mapInfo[j].title || "";
        dojo.byId("subtitle").innerHTML = configOptions.subtitle|| _mapInfo[j].subtitle || "";
		dojo.byId("description").innerHTML = configOptions.description|| _mapInfo[j].description || "";
    });
}

function panMap(pt){
	var ext = _maps[j].extent;
	var height = ext.getHeight();
	var width = ext.getWidth();
	if (pt.x < ext.xmin && pt.y > ext.ymax){
		var xmin = (pt.x - (width/5));
		var xmax = (pt.x - (width/5) + width);
		var ymax = (pt.y + (height/5));
		var ymin =(pt.y + (height/5) - height);
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.x > ext.xmax && pt.y > ext.ymax){
		var xmin = (pt.x + (width/5) - width);
		var xmax = (pt.x + (width/5));
		var ymax = (pt.y + (height/5));
		var ymin =(pt.y + (height/5) - height);
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.x > ext.xmax && pt.y < ext.ymin){
		var xmin = (pt.x + (width/5) - width);
		var xmax = (pt.x + (width/5));
		var ymax = (pt.y - (height/5) + height);
		var ymin =(pt.y - (height/5));
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.x < ext.xmin && pt.y < ext.ymin){
		var xmin = (pt.x - (width/5));
		var xmax = (pt.x - (width/5) + width);
		var ymax = (pt.y - (height/5) + height);
		var ymin =(pt.y - (height/5));
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.x < ext.xmin){
		var xmin = (pt.x - (width/5));
		var xmax = (pt.x - (width/5) + width);
		var ymax = ext.ymax;
		var ymin = ext.ymin;
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.x > ext.xmax){
		var xmin = (pt.x + (width/5) - width);
		var xmax = (pt.x + (width/5));
		var ymax = ext.ymax;
		var ymin = ext.ymin;
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.y > ext.ymax){
		var xmin = ext.xmin;
		var xmax = ext.xmax;
		var ymax = (pt.y + (height/5));
		var ymin =(pt.y + (height/5) - height);
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
	else if (pt.y < ext.ymin){
		var xmin = ext.xmin;
		var xmax = ext.xmax;
		var ymax = (pt.y - (height/5) + height);
		var ymin =(pt.y - (height/5));
		_maps[j].setExtent(new esri.geometry.Extent({"xmin":xmin,"ymin":ymin,"xmax":xmax,"ymax":ymax,
  "spatialReference":{"wkid":102100}}));
	}
}

function hoverInfoPos(x,y){
    if (x <= ($("#map").width())-230){
		$("#hoverInfo").css("left",x+15);
	}
	else{
		$("#hoverInfo").css("left",x-25-($("#hoverInfo").width()));
	}
	if (y >= ($("#hoverInfo").height())+50){
		$("#hoverInfo").css("top",y-35-($("#hoverInfo").height()));
	}
	else{
		$("#hoverInfo").css("top",y-15+($("#hoverInfo").height()));
	}
	$("#hoverInfo").show();
}
