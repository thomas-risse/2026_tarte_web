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

  float sr_{44100}, sr0_{44100};

public:
  VoiceKernel()
  {
    // Model instanciation
    sr_ = sr0_ * oversampling_;
    proc = std::make_shared<tarte::Voice<tarte::BodyCoverPair<ftype>, ftype>>(sr_, true);

    art.SetFromVowel(tarte::vowels::a);
    proc->get_resonator()->set_l0(17e-2);
    proc->get_resonator()->set_time_varying_geometry(true);
    proc->get_resonator()->set_N_update_geometry(20);
    proc->get_resonator()->SetTargetGeometryFromArticulation(art);
    proc->get_vocal_folds()->set_noise_ratio(0.08);
    proc->get_vocal_folds()->set_epsilon_smooth(1e-4);
    proc->set_lambda_sav(1000);
  }

  void Process(uintptr_t output_ptr,
               unsigned channel_count)
  {
    // float* input_buffer = reinterpret_cast<float*>(input_ptr);
    float *output_buffer = reinterpret_cast<float *>(output_ptr);

    for (unsigned sample = 0; sample < kRenderQuantumFrames; ++sample)
    {
      proc->Process(Pin_);
      output_buffer[sample] = proc->ReadRadiatedPressure() / 10000.; // - 80dB gain to be safe
    }
  }

  ftype ProcessSingle(ftype Pin)
  {
    Pin_ = Pin;

    // Dirty oversampling_, no downsampling filter... Should be okay as there should not be really high frequency content
    for (int i = 0; i < oversampling_; i++)
    {
      proc->Process(Pin_);
    }
    return proc->ReadRadiatedPressure() / 10000.; // - 80dB gain to be safe
  }

  void setPin(float Pin)
  {
    Pin_ = Pin;
  }

  void setMusclesActivation(const ftype &ct_activity,
                            const ftype &ta_activity,
                            const ftype &lc_activity)
  {
    proc->get_vocal_folds()->set_muscles_activation(ct_activity,
                                                    ta_activity,
                                                    lc_activity);
  }

  void setGeometryFromFormants(const ftype &F1, const ftype &F2)
  {
    art.SetFromFormants(F1, F2);
    proc->get_resonator()->SetTargetGeometryFromArticulation(art);
  }
};

EMSCRIPTEN_BINDINGS(CLASS_VoiceKernel)
{
  class_<VoiceKernel>("VoiceKernel")
      .constructor()
      .function("process",
                &VoiceKernel::Process,
                allow_raw_pointers())
      .function("processSingle",
                &VoiceKernel::ProcessSingle,
                allow_raw_pointers())
      .function("setPin",
                &VoiceKernel::setPin,
                allow_raw_pointers())
      .function("setMusclesActivation",
                &VoiceKernel::setMusclesActivation,
                allow_raw_pointers());
}
