/**
 * Music.js
 * Handles individual music track data and playback
 */
class Music {
    constructor(file) {
      this.file = file;
      this.audio = new Audio();
      this.isPlaying = false;
      
      // Parse filename to extract title and BPM
      this.title = "";
      this.bpm = 0;
      this.parseFileName();
      
      // Set up audio element
      this.audio.src = `./textures/music/${file}`;
      this.audio.preload = "metadata";
      
      // Duration properties
      this.duration = 0;
      this.audio.onloadedmetadata = () => {
        this.duration = this.audio.duration;
      };
      
      // Current time updater
      this.currentTime = 0;
      this.audio.ontimeupdate = () => {
        this.currentTime = this.audio.currentTime;
      };
      
      // Setup beat calculation
      this.lastBeatTime = 0;
      this.beatInterval = 0;
      if (this.bpm > 0) {
        this.beatInterval = 60 / this.bpm;
      }
    }
    
    parseFileName() {
      // Extract title and BPM from filename format: NAME-BPM.mp3
      const fileNameWithoutExt = this.file.replace(".mp3", "");
      const parts = fileNameWithoutExt.split("-");
      
      if (parts.length >= 2) {
        this.title = parts[0].trim();
        // Try to parse BPM as a number
        const bpmValue = parseInt(parts[1], 10);
        if (!isNaN(bpmValue)) {
          this.bpm = bpmValue;
        }
      } else {
        // If filename doesn't match expected format, just use it as title
        this.title = fileNameWithoutExt;
      }
    }
    
    play() {
      this.audio.play();
      this.isPlaying = true;
      
      // Reset beat timer
      this.lastBeatTime = this.audio.currentTime;
    }
    
    pause() {
      this.audio.pause();
      this.isPlaying = false;
    }
    
    stop() {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
    
    // Check if we're on a beat
    isOnBeat() {
      if (this.bpm <= 0 || !this.isPlaying) return false;
      
      const currentTime = this.audio.currentTime;
      // Check if enough time has passed since the last beat
      if (currentTime - this.lastBeatTime >= this.beatInterval) {
        // Update last beat time to the nearest beat time
        const beatsSinceLastRecorded = Math.floor((currentTime - this.lastBeatTime) / this.beatInterval);
        this.lastBeatTime += beatsSinceLastRecorded * this.beatInterval;
        return true;
      }
      
      return false;
    }
    
    // Get formatted current time as MM:SS
    getFormattedCurrentTime() {
      return this.formatTime(this.currentTime);
    }
    
    // Get formatted duration as MM:SS
    getFormattedDuration() {
      return this.formatTime(this.duration);
    }
    
    // Format time in seconds to MM:SS
    formatTime(timeInSeconds) {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Get current progress percentage (0-100)
    getProgressPercentage() {
      if (this.duration <= 0) return 0;
      return (this.currentTime / this.duration) * 100;
    }
  }