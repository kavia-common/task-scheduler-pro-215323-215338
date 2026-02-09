/**
 * Audio service for playing alarm sounds using HTML5 Audio API.
 * Supports playing, looping, and stopping audio files.
 */

// PUBLIC_INTERFACE
export class AudioService {
  /**
   * Initialize audio service
   */
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.currentLoop = false;
  }

  /**
   * Play an audio file
   * @param {string} audioPath - Path to audio file (relative to public folder)
   * @param {boolean} loop - Whether to loop the audio
   * @returns {Promise<boolean>} - Success status
   */
  async play(audioPath = "/assets/alarm.mp3", loop = false) {
    try {
      // Stop any currently playing audio
      this.stop();

      // Create new audio element
      this.audio = new Audio(audioPath);
      this.audio.loop = loop;
      this.currentLoop = loop;

      // Play the audio
      await this.audio.play();
      this.isPlaying = true;

      // Listen for end event (only matters if not looping)
      this.audio.addEventListener("ended", () => {
        if (!this.currentLoop) {
          this.isPlaying = false;
        }
      });

      // Listen for errors
      this.audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        this.isPlaying = false;
      });

      return true;
    } catch (e) {
      console.error("Failed to play alarm sound:", e);
      this.isPlaying = false;
      return false;
    }
  }

  /**
   * Stop the currently playing audio
   */
  stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
      } catch (e) {
        console.error("Failed to stop audio:", e);
      }
    }
    this.isPlaying = false;
    this.currentLoop = false;
  }

  /**
   * Check if audio is currently playing
   * @returns {boolean}
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Set volume (0.0 to 1.0)
   * @param {number} volume - Volume level
   */
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// PUBLIC_INTERFACE
export const audioService = new AudioService();
