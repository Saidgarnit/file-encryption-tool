/**
 * SecureFile - File Encryption Tool
 * File handling and drag-and-drop functionality
 * 
 * @author Saidgarnit
 * @date 2025-08-21
 */

class FileHandler {
    constructor() {
        this.encryptFile = null;
        this.decryptFile = null;
        this.maxFileSize = 100 * 1024 * 1024; // 100MB max file size
    }
    
    /**
     * Initialize file handling
     */
    init() {
        console.log("Initializing FileHandler");
        
        // Check if Dropzone is loaded
        if (typeof Dropzone === 'undefined') {
            console.error("Dropzone library not loaded!");
            alert("Dropzone library failed to load. Please check your internet connection or try refreshing the page.");
            return;
        }
        
        console.log("Dropzone version:", Dropzone.version || "Unknown");
        
        // Disable Dropzone's autoDiscover (do this again to be sure)
        Dropzone.autoDiscover = false;
        
        // Check if elements exist
        const encryptElement = document.getElementById('encrypt-dropzone');
        const decryptElement = document.getElementById('decrypt-dropzone');
        
        if (!encryptElement) {
            console.error("encrypt-dropzone element not found!");
            return;
        }
        
        if (!decryptElement) {
            console.error("decrypt-dropzone element not found!");
            return;
        }
        
        console.log("Found dropzone elements, initializing...");
        
        // Remove any existing dropzone instances
        if (encryptElement.dropzone) {
            console.log("Removing existing encrypt dropzone");
            encryptElement.dropzone.destroy();
        }
        
        if (decryptElement.dropzone) {
            console.log("Removing existing decrypt dropzone");
            decryptElement.dropzone.destroy();
        }
        
        try {
            // Setup encrypt dropzone
            this.encryptDropzone = new Dropzone('#encrypt-dropzone', {
                url: 'javascript:void(0)',  // Prevent actual upload attempts
                method: 'post',
                maxFiles: 1,
                maxFilesize: this.maxFileSize / (1024 * 1024), // Convert to MB
                acceptedFiles: '',
                autoProcessQueue: false,
                addRemoveLinks: true,
                dictDefaultMessage: "Drag files here or click to upload",
                dictRemoveFile: 'Remove',
                clickable: true,
                createImageThumbnails: false,
                previewsContainer: false, // Disable preview container
                uploadMultiple: false,
                parallelUploads: 1,
                init: function() {
                    console.log("Encrypt dropzone initialized successfully");
                    console.log("Encrypt dropzone clickable:", this.clickable);
                    console.log("Encrypt dropzone element:", this.element);
                }
            });
            
            console.log("Encrypt dropzone created:", this.encryptDropzone);
            console.log("Encrypt dropzone clickable elements:", this.encryptDropzone.clickableElements);
        } catch (error) {
            console.error("Error creating encrypt dropzone:", error);
            return;
        }
        
        try {
            // Setup decrypt dropzone
            this.decryptDropzone = new Dropzone('#decrypt-dropzone', {
                url: 'javascript:void(0)',  // Prevent actual upload attempts
                method: 'post',
                maxFiles: 1,
                maxFilesize: this.maxFileSize / (1024 * 1024), // Convert to MB
                acceptedFiles: '.encrypted',
                autoProcessQueue: false,
                addRemoveLinks: true,
                dictDefaultMessage: "Drag encrypted files here or click to upload",
                dictRemoveFile: 'Remove',
                clickable: true,
                createImageThumbnails: false,
                previewsContainer: false, // Disable preview container
                uploadMultiple: false,
                parallelUploads: 1,
                init: function() {
                    console.log("Decrypt dropzone initialized successfully");
                    console.log("Decrypt dropzone clickable:", this.clickable);
                    console.log("Decrypt dropzone element:", this.element);
                }
            });
            
            console.log("Decrypt dropzone created:", this.decryptDropzone);
            console.log("Decrypt dropzone clickable elements:", this.decryptDropzone.clickableElements);
        } catch (error) {
            console.error("Error creating decrypt dropzone:", error);
            return;
        }
        
        // Event listeners for encrypt dropzone
        this.encryptDropzone.on('addedfile', (file) => {
            console.log("File added to encrypt dropzone:", file.name);
            
            // Store the file for encryption
            this.encryptFile = file;
            
            // Update file info display
            document.getElementById('encrypt-file-info').classList.remove('d-none');
            document.getElementById('encrypt-filename').textContent = file.name;
            document.getElementById('encrypt-filesize').textContent = this._formatFileSize(file.size);
            
            // Enable encrypt button if password is valid
            this._checkEncryptButton();
        });
        
        this.encryptDropzone.on('removedfile', () => {
            this.encryptFile = null;
            document.getElementById('encrypt-file-info').classList.add('d-none');
            document.getElementById('encryptButton').disabled = true;
        });
        
        this.encryptDropzone.on('error', (file, errorMessage) => {
            alert(errorMessage);
            this.encryptDropzone.removeFile(file);
        });
        
        // Event listeners for decrypt dropzone
        this.decryptDropzone.on('addedfile', (file) => {
            console.log("File added to decrypt dropzone:", file.name);
            
            if (!file.name.endsWith('.encrypted')) {
                alert('Only .encrypted files can be decrypted');
                this.decryptDropzone.removeFile(file);
                return;
            }
            
            this.decryptFile = file;
            document.getElementById('decrypt-file-info').classList.remove('d-none');
            document.getElementById('decrypt-filename').textContent = file.name;
            document.getElementById('decrypt-filesize').textContent = this._formatFileSize(file.size);
            this._checkDecryptButton();
        });
        
        this.decryptDropzone.on('removedfile', () => {
            this.decryptFile = null;
            document.getElementById('decrypt-file-info').classList.add('d-none');
            document.getElementById('decryptButton').disabled = true;
        });
        
        this.decryptDropzone.on('error', (file, errorMessage) => {
            alert(errorMessage);
            this.decryptDropzone.removeFile(file);
        });
        
        // Password input for decrypt
        document.getElementById('decryptPassword').addEventListener('input', () => {
            this._checkDecryptButton();
        });
    }
    
    // Rest of your methods remain the same...
    getEncryptFile() {
        return this.encryptFile;
    }
    
    getDecryptFile() {
        return this.decryptFile;
    }
    
    resetEncryptUpload() {
        if (this.encryptDropzone) {
            this.encryptDropzone.removeAllFiles(true);
        }
        this.encryptFile = null;
        document.getElementById('encrypt-file-info').classList.add('d-none');
    }
    
    resetDecryptUpload() {
        if (this.decryptDropzone) {
            this.decryptDropzone.removeAllFiles(true);
        }
        this.decryptFile = null;
        document.getElementById('decrypt-file-info').classList.add('d-none');
        document.getElementById('integrityResult').classList.add('d-none');
    }
    
    _formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    _checkEncryptButton() {
        const passwordInput = document.getElementById('encryptPassword');
        const passwordConfirmInput = document.getElementById('encryptPasswordConfirm');
        const encryptButton = document.getElementById('encryptButton');
        
        // Check if we have a file and matching passwords
        const hasFile = this.encryptFile !== null;
        const hasPassword = passwordInput.value.length >= 8;
        const passwordsMatch = passwordInput.value === passwordConfirmInput.value;
        
        encryptButton.disabled = !(hasFile && hasPassword && passwordsMatch);
    }
    
    _checkDecryptButton() {
        const passwordInput = document.getElementById('decryptPassword');
        const decryptButton = document.getElementById('decryptButton');
        
        // Check if we have a file and a password
        const hasFile = this.decryptFile !== null;
        const hasPassword = passwordInput.value.length > 0;
        
        decryptButton.disabled = !(hasFile && hasPassword);
    }
}