/**
 * Loading Manager
 * Handles loading screen and asset loading
 */
class LoadingManager {
    constructor() {
      this.loadingScreen = document.getElementById('loading-screen');
      this.loadingBar = document.getElementById('loading-bar');
      this.loadingText = document.getElementById('loading-text');
      this.questLog = document.getElementById('quest-log');
      
      this.manager = new THREE.LoadingManager();
      this.setupManager();
    }
    
    setupManager() {
      this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        this.loadingBar.style.width = (progress * 100) + '%';
        this.loadingText.textContent = 'Loading ' + Math.floor(progress * 100) + '%';
      };
      
      this.manager.onLoad = () => {
        setTimeout(() => {
          this.loadingScreen.style.opacity = '0';
          setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            // Show quest log after loading
            setTimeout(() => {
              this.questLog.style.transform = 'translateX(0)';
            }, 1000);
          }, 1000);
        }, 500);
      };
    }
    
    getManager() {
      return this.manager;
    }
  }