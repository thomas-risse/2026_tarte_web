#include <Eigen/Dense>
#include "emscripten/bind.h"
#include "voice.h"
#include "body_cover_pair.h"
// #include "articulation.h"

using namespace emscripten;

const unsigned kRenderQuantumFrames = 128;
const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

class VoiceKernel
{
  using ftype = double;
  using Vec = Eigen::ArrayX<ftype>;

private:
  std::shared_ptr<tarte::Voice<tarte::BodyCoverPair<ftype>, ftype>> proc;
  tarte::Articulation art;

  float Pin_{0};
  float out;

  int oversampling_ = 1;

  float sr_{44100}, sr0_{441000};

public:
  VoiceKernel()
  {
    // Model instanciation
    sr_ = sr0_ * oversampling_;
    proc = std::make_shared<tarte::Voice<tarte::BodyCoverPair<ftype>, ftype>>(sr_, true);

    art.SetFromVowel(tarte::vowels::a);
    proc->get_resonator()->set_l0(17e-2);
    proc->get_resonator()->set_time_varying_geometry(true);
    proc->get_resonator()->set_lp_frequencies(5);
    proc->get_resonator()->SetTargetGeometryFromArticulation(art);
    proc->get_vocal_folds()->set_noise_ratio(0.08);
    proc->set_lambda_sav(1000);
  }

  void Process(uintptr_t output_ptr,
               unsigned channel_count)
  {
    // float* input_buffer = reinterpret_cast<float*>(input_ptr);
    float *output_buffer = reinterpret_cast<float *>(output_ptr);

    for (unsigned sample = 0; sample < kRenderQuantumFrames; ++sample)
    {
      // Dirty oversampling_, no downsampling filter... Should be okay as there should not be really high frequency content
      for (int i = 0; i < oversampling_; i++)
      {
        proc->Process(Pin_);
        out = proc->ReadRadiatedPressure();
      }
      output_buffer[sample] = out;
    }
  }

  void setPin(float Pin)
  {
    Pin_ = Pin;
  }
};

EMSCRIPTEN_BINDINGS(CLASS_VoiceKernel)
{
  class_<VoiceKernel>("VoiceKernel")
      .constructor()
      .function("process",
                &VoiceKernel::Process,
                allow_raw_pointers())
      .function("setPin",
                &VoiceKernel::setPin,
                allow_raw_pointers());
}
