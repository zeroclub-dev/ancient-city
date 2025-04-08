/**
 * MusicManager
 * Manages music playback and display interface
 */
class MusicManager {
    constructor() {
      this.tracks = [];
      this.currentTrackIndex = 0;
      this.isPlaying = false;
      this.shuffle = true;
      
      // Flags for initialization
      this.initialized = false;
      this.uiCreated = false;
      
      // UI Elements
      this.playerContainer = null;
      this.titleElement = null;
      this.timeElement = null;
      this.progressBarContainer = null;
      this.progressBar = null;
      
      // Animation properties
      this.pulseAnimationActive = false;
      this.pulseStartTime = 0;
      this.pulseDuration = 150; // ms
      this.animationFrameId = null;
      
      // Create UI elements
      this.createUI();
      
      // Set up audio files
      this.initMusicFiles().then(() => {
        console.log("Music files initialized");
        this.initialized = true;
      });
      
      // Set up initialization on first user interaction
      this.setupInitOnInteraction();
    }
    
    async initMusicFiles() {
      // This would typically fetch a list of music files from the server
      // For now, we'll use a predefined list for demonstration
      const musicFiles = [
        "Apollo-128.mp3",
        "Delphi-110.mp3",
        "Elysium-90.mp3",
        "Olympus-125.mp3",
        "Zeus-140.mp3"
      ];
      
      // Clear existing tracks
      this.tracks = [];
      
      // Create track objects
      for (const file of musicFiles) {
        const track = new Music(file);
        this.tracks.push(track);
      }
      
      // Shuffle tracks if needed
      if (this.shuffle) {
        this.shuffleTracks();
      }
      
      // Update UI to show first track
      if (this.tracks.length > 0) {
        this.updateUIForTrack(this.tracks[this.currentTrackIndex]);
      }
      
      return true;
    }
    
    shuffleTracks() {
      // Fisher-Yates shuffle algorithm
      for (let i = this.tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
      }
    }
    
    createUI() {
      // Create player container
      this.playerContainer = document.createElement('div');
      this.playerContainer.id = 'music-player';
      this.playerContainer.className = 'music-player';
      
      // Create player content
      const playerContent = `
        <div class="music-info">
          <div class="title" id="music-title">Loading Music...</div>
          <div class="time" id="music-time">0:00 / 0:00</div>
        </div>
        <div class="progress-container" id="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="controls">
          <button id="prev-button" class="control-button">⏮</button>
          <button id="play-button" class="control-button">⏵</button>
          <button id="next-button" class="control-button">⏭</button>
        </div>
      `;
      
      this.playerContainer.innerHTML = playerContent;
      
      // Add styles
      this.addStyles();
      
      // Append to document body
      document.body.appendChild(this.playerContainer);
      
      // Get elements
      this.titleElement = document.getElementById('music-title');
      this.timeElement = document.getElementById('music-time');
      this.progressBarContainer = document.getElementById('progress-container');
      this.progressBar = document.getElementById('progress-bar');
      
      // Add event listeners to buttons
      document.getElementById('play-button').addEventListener('click', () => this.togglePlay());
      document.getElementById('next-button').addEventListener('click', () => this.nextTrack());
      document.getElementById('prev-button').addEventListener('click', () => this.prevTrack());
      
      // Progress bar scrubbing
      this.progressBarContainer.addEventListener('click', (e) => {
        if (!this.tracks.length) return;
        
        const rect = this.progressBarContainer.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        
        const currentTrack = this.tracks[this.currentTrackIndex];
        currentTrack.audio.currentTime = percentage * currentTrack.duration;
      });
      
      // Set UI as created
      this.uiCreated = true;
      
      // Start UI update loop
      this.startUpdateLoop();
    }
    
    addStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .music-player {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          background: linear-gradient(135deg, rgba(70, 90, 120, 0.9), rgba(40, 50, 70, 0.9));
          border-radius: 12px;
          padding: 15px;
          color: white;
          font-family: 'Arial', sans-serif;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        
        .pulse {
          transform: scale(1.02);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
        }
        
        .music-info {
          margin-bottom: 10px;
        }
        
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .progress-container {
          width: 100%;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          cursor: pointer;
          margin-bottom: 10px;
        }
        
        .progress-bar {
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 3px;
          width: 0%;
        }
        
        .controls {
          display: flex;
          justify-content: center;
        }
        
        .control-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          margin: 0 10px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .control-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    setupInitOnInteraction() {
      const initFunction = () => {
        // Initialize music if not already done
        if (!this.initialized) {
          // First user interaction - immediately play music
          if (this.tracks.length > 0) {
            this.playCurrentTrack();
          }
          
          // Remove event listeners after initialization
          document.removeEventListener('click', initFunction);
          document.removeEventListener('keydown', initFunction);
        }
      };
      
      // Add event listeners for first interaction
      document.addEventListener('click', initFunction);
      document.addEventListener('keydown', initFunction);
    }
    
    startUpdateLoop() {
      const update = () => {
        if (this.tracks.length > 0) {
          const currentTrack = this.tracks[this.currentTrackIndex];
          
          // Update time display and progress bar
          this.timeElement.textContent = `${currentTrack.getFormattedCurrentTime()} / ${currentTrack.getFormattedDuration()}`;
          this.progressBar.style.width = `${currentTrack.getProgressPercentage()}%`;
          
          // Check for beat to trigger pulse animation
          if (currentTrack.isOnBeat() && !this.pulseAnimationActive) {
            this.startPulseAnimation();
          }
          
          // Update pulse animation if active
          if (this.pulseAnimationActive) {
            this.updatePulseAnimation();
          }
          
          // Check if track ended and play next
          if (currentTrack.isPlaying && currentTrack.audio.ended) {
            this.nextTrack();
          }
        }
        
        // Continue the update loop
        this.animationFrameId = requestAnimationFrame(update);
      };
      
      // Start the update loop
      this.animationFrameId = requestAnimationFrame(update);
    }
    
    updateUIForTrack(track) {
      if (!this.uiCreated) return;
      
      this.titleElement.textContent = track.title;
      this.timeElement.textContent = `${track.getFormattedCurrentTime()} / ${track.getFormattedDuration()}`;
      this.progressBar.style.width = `${track.getProgressPercentage()}%`;
      
      // Update play/pause button
      const playButton = document.getElementById('play-button');
      playButton.textContent = track.isPlaying ? "⏸" : "⏵";
    }
    
    startPulseAnimation() {
      this.pulseAnimationActive = true;
      this.pulseStartTime = performance.now();
      this.playerContainer.classList.add('pulse');
    }
    
    updatePulseAnimation() {
      const currentTime = performance.now();
      const elapsed = currentTime - this.pulseStartTime;
      
      if (elapsed >= this.pulseDuration) {
        // End the animation
        this.pulseAnimationActive = false;
        this.playerContainer.classList.remove('pulse');
      }
    }
    
    playCurrentTrack() {
      if (this.tracks.length === 0) return;
      
      // Stop all other tracks
      this.tracks.forEach(track => track.stop());
      
      // Play the current track
      const currentTrack = this.tracks[this.currentTrackIndex];
      currentTrack.play();
      this.isPlaying = true;
      
      // Update UI
      this.updateUIForTrack(currentTrack);
    }
    
    togglePlay() {
      if (this.tracks.length === 0) return;
      
      const currentTrack = this.tracks[this.currentTrackIndex];
      
      if (currentTrack.isPlaying) {
        currentTrack.pause();
        this.isPlaying = false;
      } else {
        currentTrack.play();
        this.isPlaying = true;
      }
      
      // Update UI
      this.updateUIForTrack(currentTrack);
    }
    
    nextTrack() {
      if (this.tracks.length === 0) return;
      
      // Stop current track
      this.tracks[this.currentTrackIndex].stop();
      
      // Move to next track
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
      
      // Play the new track
      this.playCurrentTrack();
    }
    
    prevTrack() {
      if (this.tracks.length === 0) return;
      
      // Stop current track
      this.tracks[this.currentTrackIndex].stop();
      
      // Move to previous track
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      
      // Play the new track
      this.playCurrentTrack();
    }
    
    // Clean up resources when needed
    cleanup() {
      // Stop update loop
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Stop all tracks
      this.tracks.forEach(track => track.stop());
      
      // Remove player from DOM
      if (this.playerContainer && this.playerContainer.parentNode) {
        this.playerContainer.parentNode.removeChild(this.playerContainer);
      }
    }
  }
  
  // Export as global if needed
  window.MusicManager = MusicManager;