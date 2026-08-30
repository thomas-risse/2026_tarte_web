import { html, render } from 'https://unpkg.com/lit-html';
import 'https://unpkg.com/@ircam/sc-components@latest';

import resumeAudioContext from './ext_lib/resume-audio-context.js';
import loadAudioBuffer from './ext_lib/load-audio-buffer.js';
const audioContext = new AudioContext();
await resumeAudioContext(audioContext);



// import { VoiceProcessor } from './voice/voice-processor.js';
console.log(audioContext.audioWorklet);
await audioContext.audioWorklet.addModule('./voice/voice-processor.js');


const voice = new AudioWorkletNode(audioContext, 'voice-processor');
voice.connect(audioContext.destination);

let voices = [];
for (let i=0; i< 10; ++i){
  voices.push(new AudioWorkletNode(audioContext, 'voice-processor'));
  voices[i].connect(audioContext.destination);
}


render(html`
  <h1>browser-voice</h1>
  <div>
    <h3>Subglottal pressure</h3>
    <sc-slider
        min = "0."
        max="2000."
        number-box
        value=${0.}
        @input=${e=>voice.parameters.get('Pin').linearRampToValueAtTime(e.detail.value, audioContext.currentTime + 0.5)}
        ></sc-slider>
  </div>
  <div>
    <h3>Cricothyroid activity</h3>
    <sc-slider
        min = "0."
        max="1."
        number-box
        value=${0.}
        @input=${e=>voice.parameters.get('a_ct').linearRampToValueAtTime(e.detail.value, audioContext.currentTime + 0.5)}
        ></sc-slider>
  </div>
  <div>
    <h3>Thyroarytenoid activity</h3>
    <sc-slider
        min = "0."
        max="1."
        number-box
        value=${0.}
        @input=${e=>voice.parameters.get('a_ta').linearRampToValueAtTime(e.detail.value, audioContext.currentTime + 0.5)}
        ></sc-slider>
  </div>
  <div>
    <h3>Cricoarytenoid activity</h3>
    <sc-slider
        min = "0."
        max="1."
        number-box
        value=${0.49}
        @input=${e=>voice.parameters.get('a_lc').linearRampToValueAtTime(e.detail.value, audioContext.currentTime + 0.5)}
        ></sc-slider>
  </div>
`, document.body);
