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
canvas.width = 480;
canvas.height = 360;
//video.className = 'blur';

snapshotButton.onclick = function() {
  canvas.className = filterSelect.value;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  

  canvas.getContext('2d').fillStyle = 'rgb(' + Math.floor(255) + ',' +
                       Math.floor(255) + ',0)';
  canvas.getContext('2d').fillRect(25,25,25,25);
  
  document.getElementById("textreturn").innerHTML = getColor(canvas, 24,24);
  
};

filterSelect.onchange = function() {
  video.className = filterSelect.value;
};


function getColor(canvas, x, y) {    
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
}

videoSelect.onchange = start;
start();