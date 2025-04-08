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
    } else {
      // Default BPM if none specified
      this.bpm = 120;
      this.beatInterval = 60 / this.bpm;
    }
  }
  
  parseFileName() {
    // Handle special cases first
    if (this.file.startsWith("spotifydown.com")) {
      // Extract just the main title from spotifydown filename
      this.title = "Una Noche en Medellín";
      // Set a default BPM for this song
      this.bpm = 110;
      return;
    }
    
    // Remove file extension
    const fileNameWithoutExt = this.file.replace(".mp3", "");
    
    // Check for the standard NAME-BPM format
    const standardFormat = fileNameWithoutExt.match(/^(.+)-(\d+)$/);
    if (standardFormat) {
      this.title = standardFormat[1].trim();
      this.bpm = parseInt(standardFormat[2], 10);
      return;
    }
    
    // Handle files without BPM specified in the name (e.g., "Starships.mp3")
    // For these, we'll use default values or provide manual mappings
    const defaultBPMs = {
      "Starships": 127,
      "Stereo Love": 128
      // Add more manual mappings if needed
    };
    
    // Set the title to the filename (without extension)
    this.title = fileNameWithoutExt;
    
    // Try to get a known BPM for this song, or use a default
    this.bpm = defaultBPMs[this.title] || 120;
  }
  
  play() {
    this.audio.play().catch(error => {
      console.error("Error playing audio:", error);
      // Handle autoplay restrictions
      if (error.name === 'NotAllowedError') {
        console.warn("Audio playback was prevented by browser. User interaction needed.");
      }
    });
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