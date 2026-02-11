# Project Erebus v6.5 Asset Pack Guide

This document lists the **audio/video assets** expected by `autoexec.retro` and where to place them so the campaign feels cinematic and suspenseful.

---

## 1) Folder Layout

Place files in these real project folders:

- `assets/videos/`
- `assets/sounds/`

Recommended subfolders for organization:

- `assets/videos/erebus/`
- `assets/sounds/erebus/`

> The script checks clip names in event payloads (e.g. `EREBUS_TAPE_01`), so include those tokens in filenames.

---

## 2) Required Core Media (for puzzle progression)

## Video

1. `assets/videos/erebus_tape_01.mp4`
   - Narrative purpose: primary recovered tape from Webb
   - Puzzle role: reveals the key word `LATTICE`
   - Recommended duration: 35–75 seconds

2. `assets/videos/erebus_tape_02.mp4` *(optional but strongly recommended)*
   - Narrative purpose: contradictory source evidence
   - Puzzle role: lore reinforcement only (not required key)
   - Recommended duration: 30–60 seconds

## Audio

1. `assets/sounds/erebus_whisper_01.mp3`
   - Narrative purpose: ambient whisper layer / hidden speech
   - Puzzle role: immersion + optional clue support
   - Recommended duration: 20–45 seconds

2. `assets/sounds/erebus_numbers_47.mp3`
   - Narrative purpose: numbers station style clue
   - Puzzle role: supports key phrase `FREQUENCY47`
   - Recommended duration: 15–30 seconds

---

## 3) Existing System Sounds to Provide/Improve

The script uses built-in sound types through `sound:play type=...`, which map via `features/SoundSystem.js`.

High-impact files to provide in `assets/sounds/`:

- `startup.mp3`
- `floppy.mp3`
- `dialup.mp3`
- `typewriter.mp3`
- `secret.mp3`
- `achievement.mp3`
- `collect.mp3`
- `error.mp3`
- `shutdown.mp3`

If these are missing, synthesized fallbacks may be used, but custom assets dramatically improve horror tone.

---

## 4) Creative Direction (to keep it suspenseful)

## Tape Aesthetic (Video)

- 4:3 framing, slight CRT bloom, low-light scenes
- Timestamp overlays that drift or reset
- Drop-frame glitches exactly when key words appear
- 1–2 subliminal frame inserts of directory paths / hex values

## Audio Aesthetic

- Narrowband EQ (telephone/radio feel)
- Low-frequency room tone + tape hiss
- Hard-panned whispers that alternate channels
- Number station cadence, slight wow/flutter for analogue dread

---

## 5) Lore Hooks to Encode in Media

Embed these recurring motifs:

- `03:47`
- `SECTOR 47`
- `OBSERVER`
- `LATTICE`
- `FREQUENCY 47`

These map directly to script puzzle vocabulary and strengthen narrative continuity.

---

## 6) Optional Expansion Assets (for future script updates)

You can add these now for future phases:

- `assets/videos/erebus_tape_03.mp4` (command-room style rebuttal)
- `assets/videos/erebus_tape_final.mp4` (post-ending stinger)
- `assets/sounds/erebus_beacon_loop.mp3` (long ambient pulse)
- `assets/sounds/erebus_reverse_prayer.mp3` (secret unlock sting)

---

## 7) How Players Should Use Media In-Game

Current script flow expects the player to:

1. Open **Video Player** and play a clip with `EREBUS_TAPE_01` in its src/name.
2. Open **Media Player** and play/stop an audio clip to trigger transcript generation.
3. Read generated transcript files in `C:/Users/User/Desktop/EREBUS/MEDIA/TRANSCRIPTS/`.
4. Submit decoded keys via:
   - `DECODED/video_key.txt` (`LATTICE`)
   - `DECODED/audio_key.txt` (`FREQUENCY47`)

---

## 8) QA Checklist After Dropping Assets

- Clip loads in Video Player without decode errors.
- Tape ending event occurs (`videoplayer:ended`).
- Media clue transcript file appears after tape/audio interactions.
- Notepad save with key text advances puzzle state.
- Atmosphere sounds are audible and balanced (no clipping).

