import { 
  AudioContext,
  AudioWorkletNode,
} from 'node-web-audio-api';

const audioContext = new AudioContext();

await audioContext.audioWorklet.addModule('voice-processor.js');
const voice = new AudioWorkletNode(audioContext, 'voice-processor');
voice.connect(audioContext.destination);


voice.parameters.get('Pin').setValueAtTime(1000, audioContext.currentTime);

setInterval(() => {
  const val = Math.random() * 2000;
  voice.parameters.get('Pin').linearRampToValueAtTime(val, audioContext.currentTime + 1.);
}, 1000);
