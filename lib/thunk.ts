/**
 * The sound of a rubber stamp: a low thump and a short papery slap.
 * Synthesised, so there is no audio file to ship. Only ever call this from a
 * click handler; browsers block audio that isn't user-initiated anyway.
 */
export function thunk() {
  try {
    const ctx = new AudioContext();
    const t = ctx.currentTime;

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.frequency.setValueAtTime(150, t);
    body.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    bodyGain.gain.setValueAtTime(0.45, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    body.connect(bodyGain).connect(ctx.destination);
    body.start(t);
    body.stop(t + 0.2);

    const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length) ** 3;
    }
    const slap = ctx.createBufferSource();
    const tone = ctx.createBiquadFilter();
    const slapGain = ctx.createGain();
    slap.buffer = noise;
    tone.type = "lowpass";
    tone.frequency.value = 1600;
    slapGain.gain.value = 0.3;
    slap.connect(tone).connect(slapGain).connect(ctx.destination);
    slap.start(t);

    setTimeout(() => void ctx.close(), 400);
  } catch {
    // No audio is fine.
  }
}
