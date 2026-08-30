SRCS = ./emscripten/VoiceKernel.cpp ./tarte/src/voice.cpp ./tarte/src/websterFDTD.cpp  
INCLUDES = -I./emscripten -I./tarte/include -I./tarte/include/vocal_folds -I./tarte/include/utility -I../eigen/

CFLAGS  = -std=c++20

build: $(SRCS)
	em++ --bind -O3 -std=c++20\
		-s WASM=1 \
		-s WASM_ASYNC_COMPILATION=0 \
		-s SINGLE_FILE=1 \
		$(SRCS) \
		$(INCLUDES) \
		-o ./buildout/voice-kernel.wasmmodule.js \
		-s MODULARIZE=1 \
		-s EXPORT_ES6=1 \
		-s EXPORTED_FUNCTIONS="['_malloc']" \
		-s EXPORTED_RUNTIME_METHODS="['HEAPF32']"\
		

clean:
	@rm -f build/voice-kernel.wasmmodule.js