 /*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  'use strict';

  var PsgDiagramSearch;

  PsgDiagramSearch = function(diagramViewer) {
    this.globalAlpha = 0.60;
    this.connectorObject = ["CONNECTORSET"];
    this.highlightColour = 'red';
    this.title1 = "Title1";
    this.title2 = diagramViewer.json.properties.type;
    
    this.highlightShape = {};
    this.highlightConnectorObject = {};
    this.diagramViewer = diagramViewer;
    this.template = this.diagramViewer.json.properties.type;
    this.view = cwAPI.getCurrentView().cwView;
    if(cwApi.customLibs.PsgDiagramSearchConfig) {
      if(cwApi.customLibs.PsgDiagramSearchConfig.hasOwnProperty(this.view)) {
        if(cwApi.customLibs.PsgDiagramSearchConfig[this.view ].hasOwnProperty(this.diagramViewer.json.properties.type)) {
          this.config = cwApi.customLibs.PsgDiagramSearchConfig[this.view][this.diagramViewer.json.properties.type]; 
        } else {
          this.config = null;
        }
      } else {
        if(cwApi.customLibs.PsgDiagramSearchConfig.default.hasOwnProperty(this.diagramViewer.json.properties.type)) {
          this.config = cwApi.customLibs.PsgDiagramSearchConfig.default[this.diagramViewer.json.properties.type]; 
        } else {
          this.config = null;
        }
      }
    }
    else {
      this.config = null;
    }


    if (!diagramViewer.isImageDiagram()) {
      this.setupDiagramOptions(diagramViewer);
      this.createSearchButton(diagramViewer);
    }
  };

  PsgDiagramSearch.prototype.setupDiagramOptions = function(diagramViewer) {
    var i, entry, objectTypeScriptName, propertyScriptname, paletteEntry, associationRegionEntry, associationRegion;
    this.diagramOptions = {};

    for (paletteEntry in diagramViewer.json.diagram.paletteEntries) {
      if (diagramViewer.json.diagram.paletteEntries.hasOwnProperty(paletteEntry)) {
        entry = diagramViewer.json.diagram.paletteEntries[paletteEntry];
        objectTypeScriptName = entry.PaletteObjectTypeScriptName.toLowerCase();
        if (!this.diagramOptions.hasOwnProperty(objectTypeScriptName)) {
          this.diagramOptions[objectTypeScriptName] = {};
          this.diagramOptions[objectTypeScriptName].properties = [];
          this.diagramOptions[objectTypeScriptName].properties.push('name');
          this.diagramOptions[objectTypeScriptName].associations = {};
        } else {
          if (objectTypeScriptName === 'eventresult') {
            propertyScriptname = 'internalexternal';
          } else {
            propertyScriptname = 'type';
          }
          if (this.diagramOptions[objectTypeScriptName].properties.indexOf(propertyScriptname) === -1) {
            this.diagramOptions[objectTypeScriptName].properties.push(propertyScriptname);
          }
        }
        for (i = 0; i < entry.PropertiesToExport.length; i += 1) {
          propertyScriptname = entry.PropertiesToExport[i].toLowerCase();
          if (this.diagramOptions[objectTypeScriptName].properties.indexOf(propertyScriptname) === -1) {
            this.diagramOptions[objectTypeScriptName].properties.push(propertyScriptname);
          }
        }
        for(associationRegionEntry in entry.AssociationsRegions){
        	if (entry.AssociationsRegions.hasOwnProperty(associationRegionEntry)){
        		associationRegion = entry.AssociationsRegions[associationRegionEntry];
        		if (!this.diagramOptions[objectTypeScriptName].associations.hasOwnProperty(associationRegion.AssociationTypeScriptName)){
        			this.diagramOptions[objectTypeScriptName].associations[associationRegion.AssociationTypeScriptName] = [];
        		}
        		this.diagramOptions[objectTypeScriptName].associations[associationRegion.AssociationTypeScriptName] = this.diagramOptions[objectTypeScriptName].associations[associationRegion.AssociationTypeScriptName].concat(associationRegion.PropertiesToSelect);
        	}
        }
      }
    }

    this.getAllAssociatedItems(diagramViewer);
  };

  PsgDiagramSearch.prototype.getAllAssociatedItems = function(diagramViewer) {
  	var otScriptName, atScriptName, cwObject, i = 0, j = 0, item, at;
  	this.itemsByScriptname = {};
  	for(i = 0; i < diagramViewer.json.diagram.shapes.length; i += 1){
  		cwObject = diagramViewer.json.diagram.shapes[i].cwObject;
  		if (!cwApi.isUndefinedOrNull(cwObject)){
  			otScriptName = cwObject.objectTypeScriptName;
  			if (this.diagramOptions.hasOwnProperty(otScriptName)){
  				for(atScriptName in this.diagramOptions[otScriptName].associations){
  					if(this.diagramOptions[otScriptName].associations.hasOwnProperty(atScriptName)){
  						for(at in cwObject.associations){
	  						if (cwObject.associations.hasOwnProperty(at) && at.indexOf(atScriptName.toLowerCase()) !== -1){
	  							for(j = 0; j < cwObject.associations[at].length; j += 1){
	  								item = cwObject.associations[at][j];
	  								if (!this.itemsByScriptname.hasOwnProperty(atScriptName)){
	  									this.itemsByScriptname[atScriptName] = [];
	  								}
	  								this.itemsByScriptname[atScriptName].push(item);
	  							}
	  						}
	  					}
  					}
  				}
  			}
  		}
  	}

  	for(at in this.itemsByScriptname){
  		if (this.itemsByScriptname.hasOwnProperty(at)){
  			this.itemsByScriptname[at].sort(function(a, b){
    				var x = a.name.toLowerCase();
				    var y = b.name.toLowerCase();
				    if (x < y) {return -1;}
				    if (x > y) {return 1;}
				    return 0;
				});
  		}
  	}
  };

  PsgDiagramSearch.prototype.createSearchButton = function(diagramViewer) {
    var searchButton, o, that = this;
    searchButton = diagramViewer.$breadcrumb.find('a#cw-diagram-search');
    if (searchButton.length > 0) {
      searchButton.unbind('click');
    } else {
      o = [];
      o.push('<a id="cw-diagram-search" class="btn btn-diagram-search no-text" title="', $.i18n.prop('DiagramSearchSearchIcon'), '"><span class="btn-text"></span><i class="fa fa-search"></i></a>');
      diagramViewer.$breadcrumb.find('.cwDiagramBreadcrumbZoneRight').append(o.join(''));
      searchButton = diagramViewer.$breadcrumb.find('.btn-diagram-search');
    }

    searchButton.on('click', function() {
      that.setupDiagramSearchZone(diagramViewer);
    });
  };

  PsgDiagramSearch.prototype.setupDiagramSearchZone = function(diagramViewer) {
    var o, $div, paletteEntry, objScriptname, objType, loadedEntries, that = this;
    o = [];
    loadedEntries = [];
    o.push('<div class="cw-diagram-search-container">');
    o.push('<h3>', this.title2, '</h3>');
    o.push('<div class="cw-diagram-search">');

    o.push('Objet Type : <select id="', diagramViewer.id, '-options-select">');
    o.push('<option value="0"> </option>');
    for (paletteEntry in diagramViewer.json.diagram.paletteEntries) {
      if (diagramViewer.json.diagram.paletteEntries.hasOwnProperty(paletteEntry)) {
        objScriptname = diagramViewer.json.diagram.paletteEntries[paletteEntry].PaletteObjectTypeScriptName.toLowerCase();
        if(this.config && this.config.hasOwnProperty(objScriptname) || this.config === null) {
          objType = cwApi.mm.getObjectType(objScriptname);
          if (!cwApi.isUndefined(objType)) {
            if (loadedEntries.indexOf(objScriptname) === -1) {
              o.push('<option value="', objScriptname, '">', objType.name, '</option>');
              loadedEntries.push(objScriptname);
            }
          }
        }
      }
    }
    o.push('</select>');
    o.push('<ul class="cw-search-zone-properties"></ul></div>');
    o.push('</div>');
    $div = $(o.join(''));
    cwApi.CwPopout.showPopout(this.title1);
    cwApi.CwPopout.setContent($div);
    this.setupOptionEvents(diagramViewer);
    cwApi.CwPopout.onClose(function() {
      that.setupSearchParameters(false);
    });
  };

  PsgDiagramSearch.prototype.setupOptionEvents = function(diagramViewer) {
    var that = this,
      displayPropertyField, displayLookup, displayAssociationField;
    displayLookup = function(output, property, lookups) {
      var i;
      output.push(property.name, ' : <select id="', diagramViewer.id, '-options-property-', property.scriptName, '" data-property-scriptname="', property.scriptName, '" >');
      output.push('<option value="0"> </option>');
      for (i = 0; i < lookups.length; i += 1) {
        output.push('<option value="', lookups[i].id, '">', lookups[i].name, '</option>');
      }
      output.push('</select>');
    };
    displayAssociationField = function(output, association){
    	var display = false, i, o = [], alreadyDisplayedItemIds = [];
    	o.push(association.DisplayName, ' : <select id="', diagramViewer.id, '-options-association-', association.ScriptName, '" data-association-scriptname="', association.ScriptName, '">');
    	o.push('<option value="0"> </option>');
    	if(that.itemsByScriptname.hasOwnProperty(association.ScriptName)){
	    	for(i = 0; i < that.itemsByScriptname[association.ScriptName].length; i += 1){
	    		if(alreadyDisplayedItemIds.indexOf(that.itemsByScriptname[association.ScriptName][i].object_id) === -1){	
	    			o.push('<option value="', that.itemsByScriptname[association.ScriptName][i].object_id, '">', that.itemsByScriptname[association.ScriptName][i].name, '</option>');
	    			alreadyDisplayedItemIds.push(that.itemsByScriptname[association.ScriptName][i].object_id);
	    		}
	    	}
	    	display = true;
			}
			o.push('</select>');
    	if (display){
	    	output.push('<li class="cw-diagram-options-li" data-association-scriptname="', association.ScriptName, '">');
	    	output.push(o.join(''));
	    	output.push('</li>');
	    }
	  };
    displayPropertyField = function(output, property) {
      var display = true,
        o = [],
        lookups;

      switch (property.type) {
        case 'Boolean':
          lookups = [{
            'id': 'false',
            'name': $.i18n.prop('DiagramSearchFalseValue')
          }, {
            'id': 'true',
            'name': $.i18n.prop('DiagramSearchTrueValue')
          }];
          displayLookup(o, property, lookups);
          break;
        case 'Lookup':
        case 'FixedLookup':
          lookups = property.lookups;
          displayLookup(o, property, lookups);
          break;
        default:
          o.push(property.name, ' : <input type="text" id="', diagramViewer.id, '-options-property-', property.scriptName, '" data-property-scriptname="', property.scriptName, '" />');
          break;
      }
      if (display) {
        output.push('<li class="cw-diagram-options-li" data-property-scriptname="', property.scriptName, '">');
        output.push(o.join(''));
        output.push('</li>');
      }
    };

    $('select#' + diagramViewer.id + '-options-select').change(function(e) {
      $('ul.cw-search-zone-properties li').remove();
      var selectedOt, output, properties, property, associations, associationScriptName, association, i;
      selectedOt = e.target.value;
      output = [];
      if (that.diagramOptions.hasOwnProperty(selectedOt)) {
        properties = that.diagramOptions[selectedOt].properties;
        if (!cwApi.isUndefined(properties)) {
          for (i = 0; i < properties.length; i += 1) {
            property = cwApi.mm.getProperty(selectedOt, properties[i]);
            if (!cwApi.isUndefined(property)) {
              if(that.config === null || that.config && that.config[selectedOt] && that.config[selectedOt].indexOf(property.scriptName) !== -1) {
                displayPropertyField(output, property);                
              }
            }
          }  
        }
        associations = that.diagramOptions[selectedOt].associations;
        if (!cwApi.isUndefined(associations)){
        	for(associationScriptName in associations){
        		if (associations.hasOwnProperty(associationScriptName)){
        			association = cwAPI.mm.getMetaModel().AssociationScriptNames[associationScriptName];
        			if (!cwApi.isUndefined(association)){
                if(that.config === null || that.config && that.config[selectedOt] && that.config[selectedOt].indexOf(association.ScriptName) !== -1) {
        				  displayAssociationField(output, association);
                }
        			}
        		}
        	}
        }
        $('ul.cw-search-zone-properties').append(output.join(''));
        that.setupSearchParameters(true);
      } else {
        that.setupSearchParameters(false);
      }

      $.each($('ul.cw-search-zone-properties input, ul.cw-search-zone-properties select'), function(i, item) {
        /*jslint unparam:true*/
        $(item).on('change', function() {
          that.setupSearchParameters(true);
        });
        $(item).on('keyup', function() {
          that.setupSearchParameters(true);
        });
      });
    });
  };


  PsgDiagramSearch.prototype.setGlobalAlphaShape = function(diagramViewer, shape) {
    if (!cwApi.isUndefinedOrNull(shape) && !cwApi.isUndefinedOrNull(shape.shape) && !cwApi.isUndefinedOrNull(shape.shape.cwObject)) {
      if (!cwApi.isUndefined(this.searchParameters) && this.searchParameters.search === true && this.highlightShape[shape.shape.Id] < 2) {
        diagramViewer.ctx.globalAlpha = this.globalAlpha;
      } else {
        diagramViewer.ctx.globalAlpha = 1;
      }
    }
  };

  PsgDiagramSearch.prototype.setGlobalAlphaJoiner = function(diagramViewer, joiner) {
    if (!cwApi.isUndefinedOrNull(joiner) && !cwApi.isUndefined(this.searchParameters) && this.searchParameters.search === true) {
      if (!this.isJoinerNeedToBeHighlight(joiner)) {
        diagramViewer.ctx.globalAlpha = this.globalAlpha;
      } else {
        diagramViewer.ctx.globalAlpha = 1;
      }
    }
  };

  PsgDiagramSearch.prototype.resetGlobalAlpha = function(diagramViewer) {
    if (!cwApi.isUndefined(this.searchParameters) && this.searchParameters.search === true) {
      diagramViewer.ctx.globalAlpha = this.globalAlpha;
    } else {
      diagramViewer.ctx.globalAlpha = 1;
    }
  };

  PsgDiagramSearch.prototype.setHighlightShape = function(diagramViewer,shape) {
    if (!cwApi.isUndefinedOrNull(shape) && !cwApi.isUndefinedOrNull(shape.shape) && !cwApi.isUndefinedOrNull(shape.shape.cwObject)) {
      if (!cwApi.isUndefined(this.searchParameters) && this.searchParameters.search === true) {
        if(this.isShapeNeedToBeHighlight(shape)) { 
          diagramViewer.strokeShape(diagramViewer.ctx,shape,this.highlightColour ,5);
          return;
        }
      }
      this.highlightShape[shape.shape.Id] = 0;
    }
  };

  PsgDiagramSearch.prototype.isShapeNeedToBeHighlight = function(shape) {
    if(this.highlightConnectorObject.hasOwnProperty(shape.shape.Id)) { // Check if it's a connectorSet
      if(this.highlightConnectorObject[shape.shape.Id].before && this.highlightConnectorObject[shape.shape.Id].after) {  // Check if it should be highlight
        this.highlightShape[shape.shape.Id] = 2;
        this.highlightConnectorObject[shape.shape.Id].before = false;  
        this.highlightConnectorObject[shape.shape.Id].after = false;   
        return true;
      }
      // if it's connector init it
    } else if(this.connectorObject.indexOf(shape.shape.cwObject.objectTypeScriptName.toUpperCase()) !== -1) {
      this.highlightConnectorObject[shape.shape.Id] = {};
      this.highlightConnectorObject[shape.shape.Id].before = false;  
      this.highlightConnectorObject[shape.shape.Id].after = false;                    
    }
    if (this.matchSearchCriteria(shape.shape.cwObject)) { // if regular shape, check if it should be highlight
      this.highlightShape[shape.shape.Id] = 2;
      return true;
    }
    return false;
  };

  PsgDiagramSearch.prototype.setHighlightJoiner = function(diagramViewer,joiner) {
    if (!cwApi.isUndefinedOrNull(joiner) && !cwApi.isUndefinedOrNull(joiner.joiner) && this.isJoinerNeedToBeHighlight(joiner)) {
      var style = {};
      var ctx = diagramViewer.ctx;
      style.StrokeColor = this.highlightColour ;
      style.StrokePattern = "SOLID";

      joiner.setJoinerStyle(ctx,style);
      if (joiner.joiner.points.length > 0) {

        // Draw joiners lines
        joiner.drawJoinerLines(ctx, (style.StrokePattern.toUpperCase() !== "SOLID"));

        if (!cwAPI.isUndefinedOrNull(joiner.paletteEntry)) {

          // Draw joiner symbols
          if (joiner.joiner.points.length > 1) {
              joiner.drawJoinerSide(ctx, joiner.paletteEntry, "JoinerToEndSymbol");
              joiner.drawJoinerSide(ctx, joiner.paletteEntry, "JoinerFromEndSymbol");
          }
        }
      }
    }
  };

  PsgDiagramSearch.prototype.isJoinerNeedToBeHighlight = function(joiner) {
    var toto = "ae";
    // si le from est un connectorSet
    if(this.highlightConnectorObject.hasOwnProperty(joiner.joiner.FromSeq)) {
      if(this.highlightShape.hasOwnProperty(joiner.joiner.ToSeq) && this.highlightShape[joiner.joiner.ToSeq] >= 2) {
        this.highlightConnectorObject[joiner.joiner.FromSeq].before = true;
      }
    }
    // si le to est un connectorSet
    if(this.highlightConnectorObject.hasOwnProperty(joiner.joiner.ToSeq)) {
      if(this.highlightShape.hasOwnProperty(joiner.joiner.FromSeq) && this.highlightShape[joiner.joiner.FromSeq] >= 2) {
        this.highlightConnectorObject[joiner.joiner.ToSeq].after = true;
      }
    }

    if(this.highlightShape.hasOwnProperty(joiner.joiner.FromSeq) && this.highlightShape[joiner.joiner.FromSeq] >= 2 && this.highlightShape.hasOwnProperty(joiner.joiner.ToSeq) && this.highlightShape[joiner.joiner.ToSeq] >= 2) {
      return true;
    } else {
      return false;
    }
  };



  cwAPI.Diagrams.CwDiagramViewer.prototype.strokeShape = function (ctx, shape, strokeColor, width) {
      if (ctx !== undefined) {
          ctx.strokeStyle = strokeColor;
          if (width !== undefined) {
              ctx.lineWidth = width; //2
          } else {
              ctx.lineWidth = 1; //2
          }
          var item = shape.getItem();
          shape.drawSymbolPath(ctx, 100, item);
          ctx.stroke();
          ctx.lineWidth = 1;
      }
  };


  PsgDiagramSearch.prototype.setupSearchParameters = function(set) {
    if (set === false) {
      if (cwApi.isUndefined(this.searchParameters)) {
        this.searchParameters = {};
      }
      this.searchParameters.search = false;
      return undefined;
    }

    var i, params, canSearch, inputField, inputValue, selectedOt, at;
    canSearch = true;
    selectedOt = $('select#' + this.diagramViewer.id + '-options-select').val();
    params = {};
    params.properties = {};
    params.associations =	 {};
    if (this.diagramOptions.hasOwnProperty(selectedOt)) {
      for (i = 0; i < this.diagramOptions[selectedOt].properties.length; i += 1) {
        inputField = $('#' + this.diagramViewer.id + '-options-property-' + this.diagramOptions[selectedOt].properties[i]);
        if (inputField.attr('type') === 'checkbox') {
          inputValue = inputField.is(':checked');
        } else {
          inputValue = inputField.val();
        }
        params.properties[this.diagramOptions[selectedOt].properties[i]] = inputValue;
      }
      for(at in this.diagramOptions[selectedOt].associations){
      	if (this.diagramOptions[selectedOt].associations.hasOwnProperty(at)){
      		inputField = $('#' + this.diagramViewer.id + '-options-association-' + at);
      		inputValue = inputField.val();
      		params.associations[at] = inputValue;
      	}
      }
    }
    this.searchParameters = params;
    this.searchParameters.objectTypeScriptName = selectedOt;
    if (selectedOt !== "0") {
      this.searchParameters.search = canSearch;
    } else {
      this.searchParameters.search = false;
    }
  };

  PsgDiagramSearch.prototype.matchSearchCriteria = function(item) {
    var itemPropertyValue, searchValue, property, propertyScriptname, at, associatedItem, atScriptName, b = true, i;
    if (item.objectTypeScriptName !== this.searchParameters.objectTypeScriptName) {
      return false;
    }
    for (propertyScriptname in this.searchParameters.properties) {
      if (this.searchParameters.properties.hasOwnProperty(propertyScriptname)) {
        property = cwApi.mm.getProperty(item.objectTypeScriptName, propertyScriptname);
        searchValue = this.searchParameters.properties[propertyScriptname];
        itemPropertyValue = item.properties[propertyScriptname];

        if (property.type === 'Lookup' || property.type === 'FixedLookup') {
          if (searchValue && searchValue !== "0" && item.properties[propertyScriptname + '_id'] && item.properties[propertyScriptname + '_id'].toString() !== searchValue) {
            return false;
          }
        } else if (property.type === 'Boolean') {
          if (searchValue && searchValue !== "0" && itemPropertyValue.toString().toLowerCase() !== searchValue.toLowerCase()) {
            return false;
          }
        } else {
          if (searchValue && searchValue !== '' && itemPropertyValue && itemPropertyValue.toString().toLowerCase().indexOf(searchValue.toLowerCase()) === -1) {
            return false;
          }
        }
      }
    }
    for(at in this.searchParameters.associations){
	  	if (this.searchParameters.associations.hasOwnProperty(at)){
	  		if(this.searchParameters.associations[at] != 0 && this.searchParameters.associations[at] !== undefined){
		  		b = false;
		  		for(atScriptName in item.associations){
		  			if(item.associations.hasOwnProperty(atScriptName)){
		  				if (atScriptName.indexOf(at) !== 1){
		  					for(i = 0; i < item.associations[atScriptName].length; i += 1){
		  						if (item.associations[atScriptName][i].object_id == this.searchParameters.associations[at]){
		  							b = true;
		  						}
		  					}
	    				}
	    			}
    			}
    		}
    	}
    }
    return b;
  };

  PsgDiagramSearch.prototype.register = function() {
  
  };

  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.PsgDiagramSearch) {
    cwApi.customLibs.PsgDiagramSearch = PsgDiagramSearch;
  };

}(cwAPI, jQuery));
