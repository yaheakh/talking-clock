// Shared text-to-speech helper. Loaded by widget.html, alert.html, settings.html.
// Every function resolves with { ok, engine, error? } so callers can show real diagnostics.

function pickSystemVoice(voiceName) {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  if (voiceName) {
    const v = voices.find(v => v.name === voiceName);
    if (v) return v;
  }
  return null;
}

function speakSystem(text, ttsSettings) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve({ ok: false, engine: 'system', error: 'speechSynthesis is not available in this window' });
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = (ttsSettings && ttsSettings.rate) || 1;
    utter.volume = (ttsSettings && ttsSettings.volume) ?? 1;
    const voice = pickSystemVoice(ttsSettings && ttsSettings.voiceName);
    if (voice) utter.voice = voice;

    let settled = false;
    utter.onstart = () => { if (!settled) { settled = true; resolve({ ok: true, engine: 'system' }); } };
    utter.onerror = (e) => { if (!settled) { settled = true; resolve({ ok: false, engine: 'system', error: e.error || 'speechSynthesis error' }); } };

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);

    // Some platforms never fire onstart reliably — assume it worked after a short delay.
    setTimeout(() => { if (!settled) { settled = true; resolve({ ok: true, engine: 'system' }); } }, 700);
  });
}

async function speakElevenLabs(text, cfg) {
  cfg = cfg || {};
  if (!cfg.apiKey || !cfg.voiceId) {
    return { ok: false, engine: 'elevenlabs', error: 'API Key or Voice ID is missing — fill both fields first.' };
  }
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': cfg.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: cfg.modelId || 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!resp.ok) {
      let detail = '';
      try {
        const j = await resp.json();
        detail = (j && j.detail && (j.detail.message || JSON.stringify(j.detail))) || JSON.stringify(j);
      } catch (e) {
        detail = await resp.text().catch(() => '');
      }
      let hint = '';
      if (resp.status === 401) hint = ' (invalid or missing API key)';
      else if (resp.status === 404 || resp.status === 400) hint = ' (check the Voice ID is correct)';
      else if (resp.status === 429) hint = ' (rate limit or quota exceeded)';
      return { ok: false, engine: 'elevenlabs', error: `HTTP ${resp.status}${hint}: ${detail}` };
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    try {
      await audio.play();
    } catch (playErr) {
      return { ok: false, engine: 'elevenlabs', error: `Audio blocked from playing: ${playErr.message || playErr}` };
    }
    return { ok: true, engine: 'elevenlabs' };
  } catch (err) {
    return { ok: false, engine: 'elevenlabs', error: `Network/request error: ${err.message || err}` };
  }
}

async function speak(text, ttsSettings) {
  if (!text) return { ok: false, error: 'No text to speak' };
  ttsSettings = ttsSettings || {};
  if (ttsSettings.engine === 'elevenlabs') {
    const result = await speakElevenLabs(text, ttsSettings.elevenlabs);
    if (!result.ok) {
      const fallback = await speakSystem(text, ttsSettings);
      return { ...result, fallback };
    }
    return result;
  }
  return speakSystem(text, ttsSettings);
}

window.TTS = { speak, speakSystem, speakElevenLabs };
