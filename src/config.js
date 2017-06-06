 /*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  'use strict';

  var PsgDiagramSearchConfig = {
    test_highlight_diagram : {
      "PA - Sub Process Workflow" : {
        process : ["name","type","PROCESSTOASSOROBOTTOPROCESSTOROBOT"]
      }
    },
    default : {
      "PA - Sub Process Workflow" : {
        process : ["name","PROCESSTOASSOROBOTTOPROCESSTOROBOT"]
      },
      "PA - Value Stream Breakdown" : {
        process : ["type","name"]
      }    
    }
  };

  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.PsgDiagramSearch) {
    cwApi.customLibs.PsgDiagramSearchConfig = PsgDiagramSearchConfig;
  };

}(cwAPI, jQuery));