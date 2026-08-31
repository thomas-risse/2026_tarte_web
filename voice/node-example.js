import { 
  AudioContext,
  AudioWorkletNode,
} from 'node-web-audio-api';

const audioContext = new AudioContext();

await audioContext.audioWorklet.addModule('voice-processor.js');
const voice = new AudioWorkletNode(audioContext, 'voice-processor');
voice.connect(audioContext.destination);

// voice.parameters.get('a_ct').setValueAtTime(1, audioContext.currentTime + 20);

voice.parameters.get('Pin').setValueAtTime(2000, audioContext.currentTime);

// setInterval(() => {
//   const val = Math.random() * 2000;
//   voice.parameters.get('Pin').linearRampToValueAtTime(val, audioContext.currentTime + 1.);
// }, 1000);

setInterval(() => {
  const val = Math.random() * 1.;
  voice.parameters.get('a_ct').linearRampToValueAtTime(val, audioContext.currentTime + 1.);
}, 1000);

setInterval(() => {
  const val = Math.random() * 1.;
  voice.parameters.get('F1').linearRampToValueAtTime(val, audioContext.currentTime + 1.);
}, 1000);

setInterval(() => {
  const val = Math.random() * 1.;
  voice.parameters.get('F2').linearRampToValueAtTime(val, audioContext.currentTime + 1.);
}, 1000);