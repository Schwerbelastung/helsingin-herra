// Helsinki Tycoon - Procedural Audio System
// All sounds synthesized via Web Audio API — no audio files needed

const Sound = (() => {
    let audioCtx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let musicEnabled = true;
    let sfxEnabled = true;
    let musicInterval = null;
    let currentSeason = 'winter';

    // --- Seasonal pentatonic scales (frequencies in Hz) ---
    // Winter: D minor pentatonic, low register — contemplative, Nordic
    // Spring: C major pentatonic — fresh, awakening
    // Summer: G major pentatonic, higher — bright, warm
    // Autumn: A minor pentatonic — mellow, warm
    const SEASON_SCALES = {
        winter: {
            notes: [147, 165, 196, 220, 262, 294, 330, 392],  // D minor pent, low
            tempo: 3000,
            harmonyChance: 0.3,
            melodyGain: 0.09,
            harmonyGain: 0.06,
            waveform: 'sine',
            harmonyWave: 'triangle',
        },
        spring: {
            notes: [262, 294, 330, 392, 440, 524, 588, 660],  // C major pent
            tempo: 2400,
            harmonyChance: 0.4,
            melodyGain: 0.1,
            harmonyGain: 0.07,
            waveform: 'sine',
            harmonyWave: 'triangle',
        },
        summer: {
            notes: [392, 440, 494, 588, 660, 784, 880, 988],  // G major pent, high
            tempo: 2200,
            harmonyChance: 0.45,
            melodyGain: 0.09,
            harmonyGain: 0.06,
            waveform: 'sine',
            harmonyWave: 'sine',
        },
        autumn: {
            notes: [220, 262, 294, 330, 392, 440, 524, 588],  // A minor pent
            tempo: 2600,
            harmonyChance: 0.35,
            melodyGain: 0.09,
            harmonyGain: 0.065,
            waveform: 'sine',
            harmonyWave: 'triangle',
        },
    };

    // === INIT ===

    function init() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        musicGain = audioCtx.createGain();
        musicGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        musicGain.connect(masterGain);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
        sfxGain.connect(masterGain);
    }

    function ensureAudio() {
        if (!audioCtx) init();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // === CORE SYNTHESIS ===

    function playTone(freq, duration, type, gain, target) {
        ensureAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        // Safari requires explicit setValueAtTime before any ramp
        g.gain.setValueAtTime(gain || 0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(g);
        g.connect(target || sfxGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    function playNoise(duration, gain) {
        ensureAudio();
        const now = audioCtx.currentTime;
        const bufferSize = Math.floor(audioCtx.sampleRate * duration);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(gain || 0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
        source.connect(g);
        g.connect(sfxGain);
        source.start(now);
    }

    // === AMBIENT MUSIC ===

    function startMusic() {
        ensureAudio();
        if (musicInterval) return;

        let noteIndex = 0;
        function playNextNote() {
            if (!musicEnabled) return;

            const scale = SEASON_SCALES[currentSeason] || SEASON_SCALES.winter;
            const notes = scale.notes;

            // Pick note: 70% sequential, 30% random
            const baseNote = notes[noteIndex % notes.length];
            const note = Math.random() > 0.3 ? baseNote :
                         notes[Math.floor(Math.random() * notes.length)];

            playTone(note, 0.8, scale.waveform, scale.melodyGain, musicGain);

            // Harmony: offset note at lower octave
            if (Math.random() < scale.harmonyChance) {
                const harmIdx = (noteIndex + 3) % notes.length;
                setTimeout(() => {
                    playTone(notes[harmIdx] * 0.5, 1.0, scale.harmonyWave, scale.harmonyGain, musicGain);
                }, 300);
            }

            // Occasional bass drone for atmosphere
            if (Math.random() < 0.15) {
                playTone(notes[0] * 0.25, 2.0, 'sine', 0.05, musicGain);
            }

            noteIndex++;
        }

        // Start immediately
        playNextNote();
        musicInterval = setInterval(playNextNote, SEASON_SCALES[currentSeason]?.tempo || 2500);
    }

    function stopMusic() {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    }

    function setSeason(season) {
        const changed = currentSeason !== season;
        currentSeason = season;
        // Restart music with new tempo/scale if playing
        if (changed && musicInterval) {
            stopMusic();
            startMusic();
        }
    }

    // === UI SOUNDS ===

    function playClick() {
        playTone(800, 0.04, 'square', 0.08);
    }

    function playStartGame() {
        // Nordic fanfare: ascending with warmth
        const notes = [294, 330, 392, 440, 392, 440, 524, 588];
        notes.forEach((f, i) => {
            setTimeout(() => playTone(f, 0.25, 'sine', 0.12), i * 150);
        });
        // Bass foundation
        setTimeout(() => playTone(147, 1.2, 'triangle', 0.06), 0);
        setTimeout(() => playTone(196, 1.0, 'triangle', 0.06), 600);
    }

    // === GAME ACTION SOUNDS ===

    function playBuy() {
        // Cash register: quick ascending trio + coin noise
        playTone(523, 0.08, 'square', 0.1);
        setTimeout(() => playTone(659, 0.08, 'square', 0.1), 60);
        setTimeout(() => playTone(784, 0.12, 'square', 0.12), 120);
        setTimeout(() => playNoise(0.03, 0.06), 180);
    }

    function playSell() {
        // Descending tones: coins leaving
        playTone(784, 0.08, 'square', 0.1);
        setTimeout(() => playTone(659, 0.08, 'square', 0.1), 60);
        setTimeout(() => playTone(523, 0.12, 'square', 0.08), 120);
    }

    function playUpgrade() {
        // Rising shimmer: 4 notes climbing
        const notes = [330, 440, 524, 660];
        notes.forEach((f, i) => {
            setTimeout(() => playTone(f, 0.15, 'triangle', 0.1), i * 100);
        });
    }

    function playRepair() {
        // Hammer taps: short percussive hits
        playNoise(0.03, 0.08);
        setTimeout(() => playTone(400, 0.04, 'square', 0.06), 80);
        setTimeout(() => playNoise(0.03, 0.08), 160);
        setTimeout(() => playTone(500, 0.06, 'triangle', 0.08), 240);
    }

    function playEndTurn() {
        // Soft double chime
        playTone(524, 0.2, 'sine', 0.08);
        setTimeout(() => playTone(392, 0.25, 'sine', 0.06), 150);
    }

    function playLoan() {
        // Low register confirmation
        playTone(196, 0.15, 'triangle', 0.1);
        setTimeout(() => playTone(262, 0.12, 'triangle', 0.08), 120);
        setTimeout(() => playTone(330, 0.15, 'sine', 0.1), 240);
    }

    // === EVENT SOUNDS ===

    function playEventPositive() {
        // Bright ascending chime
        const notes = [440, 524, 660, 784];
        notes.forEach((f, i) => {
            setTimeout(() => playTone(f, 0.2, 'sine', 0.1), i * 120);
        });
    }

    function playEventNegative() {
        // Ominous descending + low rumble
        playTone(330, 0.3, 'sawtooth', 0.08);
        setTimeout(() => playTone(262, 0.3, 'sawtooth', 0.08), 200);
        setTimeout(() => playTone(196, 0.4, 'sawtooth', 0.06), 400);
        playTone(100, 0.6, 'sine', 0.04); // low rumble
    }

    function playEventSpecial() {
        // Alien invasion: eerie warble + sci-fi sweep
        ensureAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(150, now + 1.0);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 1.0);
        // Eerie high sine
        setTimeout(() => playTone(1200, 0.5, 'sine', 0.04), 200);
        setTimeout(() => playTone(1400, 0.4, 'sine', 0.03), 500);
    }

    function playPolarBears() {
        // Funny bear growl + comedic slide whistle
        ensureAudio();
        const now = audioCtx.currentTime;
        // Low growl (noise-like via detuned sawtooth)
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
        osc.frequency.setValueAtTime(70, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.8);
        // Comedic slide whistle after growl
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const g2 = audioCtx.createGain();
            osc2.type = 'sine';
            const t = audioCtx.currentTime;
            osc2.frequency.setValueAtTime(400, t);
            osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
            osc2.frequency.exponentialRampToValueAtTime(300, t + 0.5);
            g2.gain.setValueAtTime(0.06, t);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc2.connect(g2);
            g2.connect(sfxGain);
            osc2.start(t);
            osc2.stop(t + 0.5);
        }, 600);
    }

    function playAngryBird() {
        // Slingshot launch: stretchy rubber "twang" rising into a whistle
        ensureAudio();
        const now = audioCtx.currentTime;
        // Rubber band twang
        const twang = audioCtx.createOscillator();
        const tg = audioCtx.createGain();
        twang.type = 'sawtooth';
        twang.frequency.setValueAtTime(120, now);
        twang.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        twang.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        tg.gain.setValueAtTime(0.1, now);
        tg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        twang.connect(tg);
        tg.connect(sfxGain);
        twang.start(now);
        twang.stop(now + 0.3);
        // Flying whistle (rising then falling as bird crosses screen)
        setTimeout(() => {
            const fly = audioCtx.createOscillator();
            const fg = audioCtx.createGain();
            fly.type = 'sine';
            const t = audioCtx.currentTime;
            fly.frequency.setValueAtTime(500, t);
            fly.frequency.exponentialRampToValueAtTime(1400, t + 0.8);
            fly.frequency.exponentialRampToValueAtTime(400, t + 1.6);
            fg.gain.setValueAtTime(0.07, t);
            fg.gain.setValueAtTime(0.07, t + 1.2);
            fg.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
            fly.connect(fg);
            fg.connect(sfxGain);
            fly.start(t);
            fly.stop(t + 1.6);
        }, 200);
        // Angry squawk at peak
        setTimeout(() => {
            const squawk = audioCtx.createOscillator();
            const sg = audioCtx.createGain();
            squawk.type = 'square';
            const t = audioCtx.currentTime;
            squawk.frequency.setValueAtTime(900, t);
            squawk.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
            squawk.frequency.exponentialRampToValueAtTime(700, t + 0.15);
            sg.gain.setValueAtTime(0.06, t);
            sg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            squawk.connect(sg);
            sg.connect(sfxGain);
            squawk.start(t);
            squawk.stop(t + 0.15);
        }, 800);
    }

    function playRivalAction() {
        // Subtle alert: two quick low tones
        playTone(330, 0.08, 'triangle', 0.06);
        setTimeout(() => playTone(294, 0.1, 'triangle', 0.05), 100);
    }

    function playOffer() {
        // Attention-getting doorbell-like chime
        playTone(523, 0.15, 'sine', 0.08);
        setTimeout(() => playTone(659, 0.15, 'sine', 0.08), 150);
        setTimeout(() => playTone(784, 0.2, 'sine', 0.06), 300);
    }

    // === AUCTION SOUNDS ===

    let auctionMusicInterval = null;
    let auctionBassOsc = null;
    let auctionBassGain = null;

    function playAuctionStart() {
        // Dramatic gavel strike + rising tension
        playNoise(0.06, 0.15); // gavel crack
        setTimeout(() => playNoise(0.04, 0.1), 80);
        // Dramatic rising tones
        setTimeout(() => playTone(220, 0.3, 'sawtooth', 0.07), 150);
        setTimeout(() => playTone(277, 0.3, 'sawtooth', 0.07), 300);
        setTimeout(() => playTone(330, 0.4, 'sawtooth', 0.08), 450);
        // Tension chord
        setTimeout(() => {
            playTone(165, 0.6, 'sawtooth', 0.05);
            playTone(220, 0.6, 'triangle', 0.04);
        }, 650);
    }

    function playAuctionBid() {
        // Escalating bid — ascending chime
        playTone(440, 0.1, 'sine', 0.08);
        setTimeout(() => playTone(554, 0.1, 'sine', 0.08), 80);
        setTimeout(() => playTone(659, 0.15, 'sine', 0.07), 160);
    }

    function playAuctionRivalBid() {
        // Rival raises — slightly menacing
        playTone(330, 0.12, 'sawtooth', 0.06);
        setTimeout(() => playTone(392, 0.12, 'sawtooth', 0.06), 100);
        setTimeout(() => playTone(466, 0.15, 'sawtooth', 0.05), 200);
    }

    function playAuctionDropout() {
        // Deflating descending tone
        playTone(330, 0.15, 'triangle', 0.06);
        setTimeout(() => playTone(262, 0.15, 'triangle', 0.05), 120);
        setTimeout(() => playTone(196, 0.25, 'triangle', 0.04), 240);
    }

    function playAuctionWin() {
        // Triumphant mini-fanfare
        playTone(523, 0.15, 'sawtooth', 0.07);
        setTimeout(() => playTone(659, 0.15, 'sawtooth', 0.07), 130);
        setTimeout(() => playTone(784, 0.3, 'sawtooth', 0.08), 260);
        setTimeout(() => {
            playTone(523, 0.8, 'sawtooth', 0.05);
            playTone(659, 0.8, 'sawtooth', 0.05);
            playTone(784, 0.8, 'sawtooth', 0.05);
        }, 450);
    }

    function playAuctionLose() {
        // Sad descending trombone
        ensureAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.6);
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.8);
    }

    function startAuctionMusic() {
        ensureAudio();
        if (auctionMusicInterval) return;

        // Soft pulsing bass drone (sine to avoid buzz)
        auctionBassGain = audioCtx.createGain();
        auctionBassGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        auctionBassGain.connect(musicGain);
        auctionBassOsc = audioCtx.createOscillator();
        auctionBassOsc.type = 'sine';
        auctionBassOsc.frequency.value = 55; // low A
        auctionBassOsc.connect(auctionBassGain);
        auctionBassOsc.start();

        // Rhythmic tension pattern — fast ticking heartbeat
        let tick = 0;
        const pattern = [165, 0, 196, 0, 165, 0, 220, 196]; // tension notes with rests
        auctionMusicInterval = setInterval(() => {
            if (!musicEnabled) return;
            const note = pattern[tick % pattern.length];
            if (note > 0) {
                playTone(note, 0.12, 'triangle', 0.04, musicGain);
                // Occasional high accent
                if (tick % 8 === 6) {
                    playTone(note * 2, 0.08, 'sine', 0.03, musicGain);
                }
            }
            // Heartbeat pulse on every other beat
            if (tick % 2 === 0) {
                playTone(55, 0.08, 'sine', 0.05, musicGain);
            }
            tick++;
        }, 350);
    }

    function stopAuctionMusic() {
        if (auctionMusicInterval) {
            clearInterval(auctionMusicInterval);
            auctionMusicInterval = null;
        }
        if (auctionBassOsc) {
            try { auctionBassOsc.stop(); } catch(e) {}
            auctionBassOsc = null;
        }
        auctionBassGain = null;
    }

    // === WIN / LOSE ===

    function playVictory() {
        // Triumphant brass-style fanfare in Bb major
        // Opening call: short-short-short-LONG
        const call = [466, 466, 466, 587];
        call.forEach((f, i) => {
            const dur = i < 3 ? 0.15 : 0.6;
            setTimeout(() => playTone(f, dur, 'sawtooth', 0.08), i * 160);
        });
        // Rising answer
        const rise = [523, 587, 659, 784];
        rise.forEach((f, i) => {
            setTimeout(() => playTone(f, 0.25, 'sawtooth', 0.07), 700 + i * 170);
        });
        // Grand final chord: Bb major triad held long
        setTimeout(() => {
            playTone(466, 1.8, 'sawtooth', 0.06);
            playTone(587, 1.8, 'sawtooth', 0.06);
            playTone(699, 1.8, 'sawtooth', 0.06);
            playTone(932, 1.8, 'sine', 0.05);
        }, 1400);
        // Bass foundation
        setTimeout(() => playTone(233, 2.0, 'triangle', 0.06), 0);
        setTimeout(() => playTone(175, 2.0, 'triangle', 0.06), 1400);
        // Shimmer flourish
        const shimmer = [932, 1047, 1175, 1397, 1760];
        shimmer.forEach((f, i) => {
            setTimeout(() => playTone(f, 0.3, 'sine', 0.03), 1600 + i * 80);
        });
    }

    function playBankrupt() {
        // Sad descending: minor feel
        const notes = [440, 392, 330, 262, 196];
        notes.forEach((f, i) => {
            setTimeout(() => playTone(f, 0.4, 'sawtooth', 0.06), i * 250);
        });
    }

    // === TOGGLES ===

    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (musicGain) {
            musicGain.gain.setValueAtTime(musicEnabled ? 0.5 : 0, audioCtx.currentTime);
        }
        if (musicEnabled && !musicInterval) startMusic();
        return musicEnabled;
    }

    function toggleSfx() {
        sfxEnabled = !sfxEnabled;
        if (sfxGain) {
            sfxGain.gain.setValueAtTime(sfxEnabled ? 0.7 : 0, audioCtx.currentTime);
        }
        return sfxEnabled;
    }

    function isMusicEnabled() { return musicEnabled; }
    function isSfxEnabled() { return sfxEnabled; }

    return {
        init,
        startMusic,
        stopMusic,
        setSeason,
        playClick,
        playStartGame,
        playBuy,
        playSell,
        playUpgrade,
        playRepair,
        playEndTurn,
        playLoan,
        playEventPositive,
        playEventNegative,
        playEventSpecial,
        playPolarBears,
        playAngryBird,
        playRivalAction,
        playOffer,
        playAuctionStart,
        playAuctionBid,
        playAuctionRivalBid,
        playAuctionDropout,
        playAuctionWin,
        playAuctionLose,
        startAuctionMusic,
        stopAuctionMusic,
        playVictory,
        playBankrupt,
        toggleMusic,
        toggleSfx,
        isMusicEnabled,
        isSfxEnabled,
    };
})();
