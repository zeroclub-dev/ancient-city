/**
 * QuestManager
 * Handles quest state and updates
 */
class QuestManager {
    constructor() {
      this.questLog = document.getElementById('quest-log');
      this.questState = {
        templeFound: false,
        talkedToKeeper: false,
        currentObjective: 'Find the Temple of Apollo'
      };
      this.questMarker = null;
    }
    
    updateQuestLog() {
      let questText = '';
      
      if (!this.questState.templeFound) {
        questText = '<p><strong>The Musical Heritage</strong></p>' +
          '<p>Find the Temple of Apollo where the ancient instruments are kept. The temple keeper awaits your arrival to show you the instruments of the gods.</p>' +
          '<p><strong>Hint:</strong> Look for a large white marble building with gold accents near the center of the agora.</p>';
      } else if (!this.questState.talkedToKeeper) {
        questText = '<p><strong>The Musical Heritage</strong></p>' +
          '<p>You have found the Temple of Apollo. Talk to the temple keeper to learn about the ancient instruments.</p>';
      } else {
        questText = '<p><strong>The Musical Heritage</strong></p>' +
          '<p>Enter the Temple of Apollo and explore the ancient instruments on display.</p>' +
          '<p><strong>Hint:</strong> Enter through the main doorway of the temple.</p>';
      }
      
      this.questLog.innerHTML = '<h3>Current Quest</h3>' + questText;
    }
    
    createQuestMarker(position) {
      const markerDiv = document.createElement('div');
      markerDiv.className = 'quest-marker';
      markerDiv.innerHTML = '▼';
      markerDiv.style.position = 'absolute';
      document.body.appendChild(markerDiv);
      
      // Create the marker object with update function
      this.questMarker = {
        element: markerDiv,
        position: position,
        update: (camera) => {
          // Convert 3D position to screen coordinates
          const vector = position.clone();
          vector.project(camera);
          
          // Convert to CSS coordinates
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
          
          // Check if marker is in front of camera
          if (vector.z < 1) {
            markerDiv.style.display = 'block';
            markerDiv.style.transform = `translate(-50%, -50%)`;
            markerDiv.style.left = `${x}px`;
            markerDiv.style.top = `${y}px`;
          } else {
            markerDiv.style.display = 'none';
          }
          
          // Hide marker if quest is complete
          if (this.questState.templeFound) {
            markerDiv.style.display = 'none';
          }
        }
      };
      
      return this.questMarker;
    }
    
    update(camera) {
      if (this.questMarker) {
        this.questMarker.update(camera);
      }
    }
    
    // Quest state setters
    setTempleFound(found) {
      this.questState.templeFound = found;
      this.questState.currentObjective = 'Talk to the Temple Keeper';
      this.updateQuestLog();
    }
    
    setTalkedToKeeper(talked) {
      this.questState.talkedToKeeper = talked;
      this.questState.currentObjective = 'Enter the Temple';
      this.updateQuestLog();
    }
    
    // Quest state getters
    getQuestState() {
      return this.questState;
    }
  }