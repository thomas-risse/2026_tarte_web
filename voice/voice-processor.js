
import Module from './buildout/voice-kernel.wasmmodule.js';
import {RENDER_QUANTUM_FRAMES, MAX_CHANNEL_COUNT, FreeQueue}
  from '../jsutils/free-queue.js';

/**
 * WASM-powered phsyical audio synthesis.
 *
 * @class VoiceProcessor
 * @extends AudioWorkletProcessor
 */
class VoiceProcessor extends AudioWorkletProcessor {
  // WASM module instance.
  #module = undefined;

  static get parameterDescriptors(){
    return [{
      name:"Pin",
      defaultValue:0.0,
      minValue:0,
      maxValue:5000,
    }]
  };

  /**
   * @constructor
   */
  constructor() {
    super();

    Module().then((module) => {
      this._module = module;
      
      // Allocate the buffer for the heap access. Start with stereo, but it can
      // be expanded up to 32 channels.
      this._heapInputBuffer = new FreeQueue(
        this._module, RENDER_QUANTUM_FRAMES, 2, MAX_CHANNEL_COUNT);
      this._heapOutputBuffer = new FreeQueue(
        this._module, RENDER_QUANTUM_FRAMES, 2, MAX_CHANNEL_COUNT);
      this._kernel = new this._module.VoiceKernel();
      console.log('Voice WASM worklet initialized successfully');
    });
  }

  /**
   * System-invoked process callback function.
   * @param  {Array} inputs Incoming audio stream.
   * @param  {Array} outputs Outgoing audio stream.
   * @param  {Object} parameters AudioParam data.
   * @return {Boolean} Active source flag.
   */
  process(inputs, outputs, parameters) {
    if (this._module === undefined || this._heapInputBuffer === undefined) {
      // Wait for the WASM module to be loaded.
      return true;
    }

    // Use the 1st input and output only to make the example simple. |input|
    // and |output| here have the similar structure with the AudioBuffer
    // interface. (i.e. An array of Float32Array)
    const input = inputs[0]; // first input, first channel
    const output = outputs[0];

    
    const Pin = parameters['Pin'];
    
    this._kernel.setPin(Pin[0]);

    // For this given render quantum, the channel count of the node is fixed
    // and identical for the input and the output.
    const channelCount = input.length;

    // // Prepare HeapAudioBuffer for the channel count change in the current
    // // render quantum.
    // this._heapInputBuffer.adaptChannel(channelCount);
    this._heapOutputBuffer.adaptChannel(channelCount);

    // // Copy-in, process and copy-out.
    const ret = this._kernel.process(
        // this._heapInputBuffer.getHeapAddress(),
        this._heapOutputBuffer.getHeapAddress(),
        channelCount);
    for (let channel = 0; channel < channelCount; ++channel) {
      output[channel].set(this._heapOutputBuffer.getChannelData(channel));
    }
    return true;
  }
}

registerProcessor('voice-processor', VoiceProcessor);
