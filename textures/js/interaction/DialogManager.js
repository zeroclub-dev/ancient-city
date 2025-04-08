/**
 * DialogManager
 * Handles dialog display and interaction
 */
class DialogManager {
    constructor() {
      this.dialogBox = document.getElementById('dialog-box');
      this.dialogSpeaker = document.getElementById('dialog-speaker');
      this.dialogText = document.getElementById('dialog-text');
      this.isDialogOpen = false;
      
      // Add dialog continue click handler
      document.querySelector('.dialog-continue').addEventListener('click', this.continueDialog.bind(this));
    }
    
    showDialog(speaker, text) {
      this.dialogSpeaker.textContent = speaker;
      this.dialogText.textContent = text;
      this.dialogBox.style.display = 'block';
      this.isDialogOpen = true;
      
      // Set global flag
      window.isDialogOpen = true;
    }
    
    continueDialog() {
      this.dialogBox.style.display = 'none';
      this.isDialogOpen = false;
      
      // Set global flag
      window.isDialogOpen = false;
    }
    
    isOpen() {
      return this.isDialogOpen;
    }
  }