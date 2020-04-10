/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const snapshotButton = document.querySelector('button#snapshot');
const filterSelect = document.querySelector('select#filter');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [videoSelect];

// Put variables in global scope to make them available to the browser console.
const video = window.video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
canvas.width = 280;
canvas.height = 380;
video.className = 'blur';


function snapshotUpdate(){
  canvas.className = filterSelect.value;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  
  document.getElementById("textreturn").innerHTML = getReferenceColot(canvas);
  setTimeout(snapshotUpdate, 100);
}
snapshotButton.onclick = function() {
	snapshotUpdate()
};

filterSelect.onchange = function() {
  video.className = filterSelect.value;
};

function mathsInterpolation(x0,x1,y0,y1,yf){
	return Math.floor(x0 - (x0-x1)/(y0-y1)*(y0-yf));
}
function getReferenceColot(canvas) {
	var mmg20   = getAverage(canvas, 150,100,60,10).concat(20);
	var mmg50   = getAverage(canvas, 150,140,60,10).concat(50);
	var mmg100  = getAverage(canvas, 150,185,60,10).concat(100);
	var mmg300  = getAverage(canvas, 150,226,60,10).concat(300);
	var mmg500  = getAverage(canvas, 150,264,60,10).concat(500);
	var mmg1000 = getAverage(canvas, 150,303,60,10).concat(1000);
	var mmg1500 = getAverage(canvas, 150,341,60,10).concat(1500);
	var mmgTst  = getAverage(canvas, 33,130,20,50).concat(0);
	var mmgCal  = [0,0,0,0];
	
	var mmgTotal = [mmg20, mmg50, mmg100, mmg300, mmg500, mmg1000, mmg1500];
	for(let r = 0; r < 3; r++){
		for(let i = 0; i < 6; i++){
			if(mmgTotal[i][r]>=mmgTst[r] && mmgTst[r]>mmgTotal[i+1][r]){
				mmgCal[r] = mathsInterpolation(	mmgTotal[i][3], mmgTotal[i+1][3],
												mmgTotal[i][r], mmgTotal[i+1][r],
												mmgTst[r]);
			}
			if(i == 5 && mmgCal[r]==0){
				mmgCal[r] = mathsInterpolation(	mmgTotal[i][3], mmgTotal[i+1][3],
												mmgTotal[i][r], mmgTotal[i+1][r],
												mmgTst[r]);
			}
		}
	}
	mmgCal[3] = Math.floor((mmgCal[0]+mmgCal[1]+mmgCal[2])/3);
	return "R=" + mmgCal[0] + " G=" + mmgCal[1] + " B=" + mmgCal[2] + " Avg=" + mmgCal[3];
}

function getAverage(canvas, x, y, xi, yj){
	var cR = 0;
	var cG = 0;
	var cB = 0;
	var nX, nY, pixel = 0;
	var context = canvas.getContext("2d");
	context.fillStyle = 'rgb(255,255,0)';
	context.font = "20px Arial";
	for( let i=0; i < xi; i++) {
		for( let j=0; j < yj; j++) {
			nX = Number(x) + Number(i);
			nY = Number(y) + Number(j);
			pixel = context.getImageData(nX, nY, 1, 1);
			cR+= pixel.data[0];
			cG+= pixel.data[1];
			cB+= pixel.data[2];
			context.fillRect(nX, nY, 1, 1);
		}
	}
	cR = Math.floor(cR / xi /yj);
	cG = Math.floor(cG / xi /yj);
	cB = Math.floor(cB / xi /yj);
	context.fillText(cR+","+cG+","+cB, x-20, y-5);
	return [cR, cG, cB];
}

function getColor(canvas, x, y, xi, yi){  
    var context = canvas.getContext("2d");
    var pixel = context.getImageData(x, y, 2, 2);

    // Red = rgb[0], green = rgb[1], blue = rgb[2]
    // All colors are within range [0, 255]
    var rgb = pixel.data;

    return rgb;
}

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
	if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }

}
//textreturn
//document.getElementById("demo").innerHTML = 
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);


const constraints = {
  audio: false,
  video: true
};

function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

//navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

function start() {

  const videoSource = videoSelect.value;
  const constraints = {
    audio: false,
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
  snapshotUpdate();
}

videoSelect.onchange = start;
start();
