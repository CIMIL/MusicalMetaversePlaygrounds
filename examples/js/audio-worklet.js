let micStream;
let micNode;
let analyser;
let featureExtractorNode;
let analyserDataArray = null;
let audioCtx;
let essentiaNode;
let init = false;
let dataArray;
let chord;
let x = 0;


const meter = new Tone.Meter();
const fft = new Tone.FFT(256);
const toneMic = new Tone.UserMedia();
var toneRms = null;
var toneFFT = null;

//button variables
let micEnabled;
let started = false;

async function createEssentiaNode(audioCtx) {
  let url = './js/processor.js';
  await audioCtx.audioWorklet.addModule(url);

  return new AudioWorkletNode(audioCtx, 'essentia-worklet-processor'); 
}

function loop() {
  analyserProc.getFloatTimeDomainData(analyserDataArray);
  analyser.getFloatTimeDomainData(dataArray);

  featureExtractorNode.port.onmessage = (e) => {
    chord = e.data;
    sendTimeStamp('CHORD');
  };

  meter.getValue();
  toneRms = meter._rms;

  toneFFT = fft.getValue();
}

function getEsSamples() {
  analyser.getFloatTimeDomainData(dataArray);
  //console.log(dataArray)
  return dataArray;
}

function start() {
  requestMicAccess()
    .then(startAudioProcessing)
    .then(() => {
      // start loop
      //loop()
      setInterval(loop, 10);
    })
    .catch((err) => {
      if (err.name == 'NotAllowedError') {
        alert(
          'Could not access microphone - Please allow microphone access for this site'
        );
      } else {
        alert(err);
        console.log('Exception name: ', err.name);
        throw err;
      }
    });
}

async function requestMicAccess() {
  console.log('Initializing mic stream...');

  let micStream = await navigator.mediaDevices.getUserMedia({
    //audio: true,
    video: false,
    audio:{
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
      latency: 0,
    },
    sampleRate: 48000,
  });
  return micStream;
}

async function startAudioProcessing(stream) {
  micStream = stream;

  if (!micStream.active) {
    throw 'Mic stream not active';
  }

  if (audioCtx.state == 'closed') {
    audioCtx = new AudioContext({ latencyHint: 0.00001});
  } else if (audioCtx.state == 'suspended') {
    audioCtx.resume();
  }

  micNode = audioCtx.createMediaStreamSource(micStream);

  analyser = audioCtx.createAnalyser();
  analyserProc = audioCtx.createAnalyser();

  analyser.fftSize = 256; 
  dataArray = new Float32Array(analyser.frequencyBinCount);

  analyserProc.fftSize = 256; 
  analyserDataArray = new Float32Array(analyserProc.frequencyBinCount);

  featureExtractorNode = await createEssentiaNode(audioCtx);
  init = true;

  micNode.connect(analyser);

  micNode.connect(featureExtractorNode);
  featureExtractorNode.connect(analyserProc);
}

function stop() {
  console.error('Implementa stop');
}

function onConnect() {
  
  const micBtnEle = document.getElementById('mic-btn');
  NAF.connection.adapter.enableMicrophone(false);

  micBtnEle.addEventListener('click', function () {
    NAF.connection.adapter.enableMicrophone(true);
    micEnabled = !micEnabled;
    micBtnEle.textContent = micEnabled ? 'Mute Mic' : 'Unmute Mic';

    toneMic.open();
    toneMic.connect(meter);
    toneMic.connect(fft);
    Tone.context.resume();

    NAF.connection.subscribeToDataChannel("msg-delay", calculateDelay);

    if (audioCtx == undefined || audioCtx.state == 'closed') {
      audioCtx = new AudioContext({ latencyHint: 0.00001});
    } else if (audioCtx.state == 'suspended') {
      audioCtx.resume();
    }

    //start/stop audio analysis
    if (!started) {
      start();
      started = true;
    } else {
      stop();
    }
  });
}

window.onload = () => {
  AudioContext = window.AudioContext || window.webkitAudioContext;
  micEnabled = false;
};

function calculateDelay(senderId, dataType, data, targetObj){
  var event = data.split(':')[0];
  var generatedTime = data.split(':')[1];
  var receivedTime = new Date().getTime();
  var timeDelay = receivedTime - generatedTime;

}


function sendTimeStamp(nomeEvento){
  var creationTime = new Date().getTime();
  NAF.connection.broadcastDataGuaranteed("msg-delay", nomeEvento + ':' + creationTime);
}
