(function (window, $, undefined) {
  'use strict';

  var rangefinder;

  rangefinder = function rangefinder(cockpit) {
    console.log("Loading Laser Range Finder in browser.");
    this.cockpit = cockpit;

    this.name = 'rangefinder';   
    this.viewName = 'Laser Range Finder'; 
    this.canBeDisabled = true; 

    //Setup parameters

    this.offset =  -0.00000;  //Camera offset to correct lenses
    this.h_cm = 6.0; //Distance from camera center to laser
    this.threshold = 5; //Color recognition threshold
    this.DEBUG = false; //Debug mode
    this.centerCorrectionX = -5; //Center Correction on laser
    this.centerCorrectionY = 5; //Center Correction on laser
    this.searchHeight = 10;

    this.fps = 30; //How many frames it should be looking through a second


    this.width = 640;
    this.height = 320;

    //System variables
    this.canvas;
    this.context;
    this.img;
    this.lastPoint;
    this.outOfRangeTime;
    this.range1;
    this.range2;
    this.mainRefresh;
   
    this.videoCanvas;
    this.videoContext;

    this.enable = function () {
      var rov = this;
      rov.canvas = jQuery('<canvas id="mastercanvas" style="position:absolute;top:150px;left:0;'+(rov.DEBUG?'':'display:none;')+'" width="'+rov.width+'" height="'+rov.searchHeight+'"></canvas>');
      jQuery('body').append(rov.canvas);
      rov.context = rov.canvas[0].getContext("2d");
      rov.img = document.getElementById('video');
      rov.img.crossOrigin = "Anonymous";

      rov.lastPoint=[];
      rov.outOfRangeTime = [];

      jQuery('#capestatus_footercontent').append('<div id="rangefinder" class="span2 pull-right" ><h2 id="rangeDetector1"></h2><h2 id="rangeDetector2"></h2></div>');
      rov.range1 = jQuery('#rangeDetector1');
      rov.range2 = jQuery('#rangeDetector2');
      rov.videoCanvas = jQuery('#video-canvas');
      rov.videoContext = rov.videoCanvas[0].getContext("2d");
      rov.mainRefresh = setInterval(rov.distanceCalculate, 1000 / rov.fps,rov);
    };
    this.disable = function () {
      var rov = this;

      clearInterval(rov.mainRefresh);
      rov.canvas = undefined;
      rov.context = undefined;
      rov.img = undefined;
      rov.lastPoint = [];
      rov.outOfRangeTime = undefined;
      rov.range1 = undefined;
      rov.range2 = undefined;
      rov.videoCanvas = undefined;
      rov.videoContext = undefined;

      jQuery('#rangefinder,#mastercanvas').remove();
    };
  };

  rangefinder.prototype.distanceCalculate = function(rov) {
  //  console.log(rov.height/2);
   // rov.context.drawImage(rov.img, 0, -((rov.height/2)+rov.centerCorrectionY),rov.width,rov.searchHeight);
    rov.context.drawImage(rov.img, 0, -(((rov.height/2)+rov.searchHeight/2)+rov.centerCorrectionY),rov.width,rov.height);
  //  var point1 = rov.searchArea(0+rov.centerCorrectionX,0);
    rov.context.beginPath();
    rov.context.moveTo((rov.width/2)+rov.centerCorrectionX, 0);
    rov.context.lineTo((rov.width/2)+rov.centerCorrectionX, rov.searchHeight);
    rov.context.stroke();
  
  var point2 = rov.searchArea((rov.width/2)+rov.centerCorrectionX,0);

 //   var cm1 = Math.floor(rov.h_cm / Math.tan(((-point1[0])-(-(320+rov.centerCorrectionX))) * 0.0024259339 + rov.offset));
    var cm2 = Math.floor(rov.h_cm / Math.tan((point2[0]-((rov.width/2)+rov.centerCorrectionX)) * 0.0024259339 + rov.offset));
/*
    var color = '#ffffff';
    if(point1[2] == 0) color = '#ff0000';
    rov.range1.html(rov.readablizeMetric(cm1)).css('color',color);
*/


    rov.drawArrow(rov,320+rov.centerCorrectionX+point2[0],170+rov.centerCorrectionY+point2[1]);

    var color = '#ffffff';
    if(point2[2] == 0) color= '#ff0000';
    rov.range1.html(rov.readablizeMetric(cm2)).css('color',color);
  }
  rangefinder.prototype.drawArrow = function(x,y) {
    var rov = this;
    rov.videoContext.beginPath();
    rov.videoContext.arc(x, y, 75, 0, 2*Math.PI);
    rov.videoContext.lineWidth = 2;
    rov.videoContext.strokeStyle = 'red';
    rov.videoContext.stroke();
  }
  rangefinder.prototype.readablizeMetric = function(cm) {
    if(cm >= 100){
      return (cm/100).toFixed(1) + 'm';
    }else if(cm < 100 && cm > 50){
      return (cm/10).toFixed(1) + 'dm';
    }else{
      return cm + 'cm';
    }
  }

  rangefinder.prototype.searchArea = function(xAre,yAre){
    var rov = this;
    var imgData=rov.context.getImageData(xAre,yAre,(rov.width/2),rov.searchHeight);
    var imgDataOrg=rov.context.getImageData(xAre,yAre,(rov.width/2),rov.searchHeight);

    var y = 0;
    var x = 0;
    var left = 500;
    var right = 0;
    var bottom =0;
    var top = 500;
    var distance = 0;
    var maxRed = 128;
    var reddestPixel = -1;
    var redPixelCount = 0;
    var id = xAre+yAre;

    if(rov.DEBUG && false){
      for (var i=0,j=0;i<imgData.data.length;i+=4,j++){
        //Using Three dimensions euclidean distance calculation to find reddest pixel
        var temp = 255-Math.sqrt(Math.pow(parseFloat(imgData.data[i]) - 255, 2.0) + Math.pow(parseFloat(imgData.data[i+1]) - 0, 2.0) + Math.pow(parseFloat(imgData.data[i]+2) - 0, 2.0));
        
        if(imgData.data[i] > maxRed) maxRed = imgData.data[i];
        
        if(temp > distance){
          distance = temp;
          reddestPixel = i;
        }
        imgData.data[i] = temp;
        imgData.data[i+1] = temp;
        imgData.data[i+2] = temp;
        imgData.data[i+3]= 255;

      }
      for (var i=0;i<imgData.data.length;i+=4){
        imgData.data[i] = imgData.data[i] * (255/distance);
        imgData.data[i+1] = imgData.data[i+1] * (255/distance);
        imgData.data[i+2] = imgData.data[i+2] * (255/distance);
        imgData.data[i+3]= 255;
      } 
      for (var i=0;i<imgData.data.length;i+=4) if(imgDataOrg.data[i] > (maxRed-threshold)) redPixelCount++;
    }else{
      for (var i=0,j=0;i<imgData.data.length;i+=4,j++) if(imgData.data[i] > maxRed ) maxRed = imgData.data[i];
    }

    for (var i=0;i<imgData.data.length;i+=4){
      if(x==imgData['width']-1){
        y++;
        x = 0;
      }else{
        x++;
      }
      if(imgDataOrg.data[i] > (maxRed-rov.threshold) && (rov.DEBUG?redPixelCount < 150:true)){
        imgData.data[i]= 0;
        imgData.data[i+1]= 255;
        imgData.data[i+2]= 0;
        if(x<left) left = x;
        if(x>right) right = x;
        if(y>bottom) bottom = y;
        if(y<top) top = y;
      }
      
      if(i==reddestPixel){
        imgData.data[i]= 0;
        imgData.data[i+1]= 255;
        imgData.data[i+2]= 255;

        if(x<left) left = x;
        if(x>right) right = x;
        if(y>bottom) bottom = y;
        if(y<top) top = y;
      }
      
      
    }

    var height = bottom-top;
    var width = right-left;

    if(rov.DEBUG) rov.context.putImageData(imgData,xAre,yAre);

    var position = [(xAre+left-1)+((width+1)/2),(yAre+top)+((height+1)/2)];

    if(rov.lastPoint[id] == undefined) rov.lastPoint[id] = []; 
    if(this.outOfRangeTime[id] == undefined) this.outOfRangeTime[id] = []; 
    
    var outOfRange = (position[0] > rov.lastPoint[id][0]+10) || (position[0] < rov.lastPoint[id][0]-10) || (position[1] > rov.lastPoint[id][1]+10) || (position[1] < rov.lastPoint[id][1]-10) ;
    if(outOfRange==true){
      this.outOfRangeTime[id]++;
    }else{
      this.outOfRangeTime[id] = 0;
    }
    if(this.outOfRangeTime[id] > 40) this.outOfRangeTime[id] = 0;
    
    if(this.outOfRangeTime[id] == 0 ){
        rov.lastPoint[id] = position;
        return [position[0],position[1],1]
    }
    return [position[0],position[1],0];
  }
  window.Cockpit.plugins.push(rangefinder);

}(window, jQuery));
