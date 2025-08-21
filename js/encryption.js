/**
 * SecureFile - File Encryption Tool
 * Encryption and decryption functionality
 * 
 * @author Saidgarnit
 * @date 2025-08-21
 */

class FileEncryption {
    constructor() {
        this.CHUNK_SIZE = 1024 * 1024; // 1MB chunks for processing large files
    }
    
    /**
     * Encrypt a file using AES-256
     * @param {File} file - The file to encrypt
     * @param {string} password - The encryption password
     * @param {Object} callbacks - Callback functions for progress, completion, and errors
     */
    encrypt(file, password, callbacks = {}) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                // Generate a secure key from the password
                const salt = CryptoJS.lib.WordArray.random(128/8);
                const key = CryptoJS.PBKDF2(password, salt, {
                    keySize: 256/32,
                    iterations: 1000
                });
                
                // Generate a random initialization vector
                const iv = CryptoJS.lib.WordArray.random(128/8);
                
                // Get file data
                const fileData = new Uint8Array(event.target.result);
                
                // Calculate file hash for integrity verification
                const fileHash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileData)).toString();
                
                // Encrypt the file
                const encrypted = this._encryptData(fileData, key, iv, callbacks.onProgress);
                
                // Create metadata for decryption
                const metadata = {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    hash: fileHash,
                    salt: salt.toString(),
                    iv: iv.toString(),
                    version: '1.0'
                };
                
                // Combine metadata and encrypted content
                const metadataStr = JSON.stringify(metadata);
                const metadataLength = new Uint32Array([metadataStr.length]);
                
                // Create the final file format: [4 bytes metadata length][metadata json][encrypted data]
                const finalFile = new Uint8Array(4 + metadataStr.length + encrypted.sigBytes);
                
                // Add metadata length (4 bytes)
                finalFile.set(new Uint8Array(metadataLength.buffer), 0);
                
                // Add metadata
                for (let i = 0; i < metadataStr.length; i++) {
                    finalFile[4 + i] = metadataStr.charCodeAt(i);
                }
                
                // Add encrypted data
                const encryptedArray = this._wordArrayToUint8Array(encrypted);
                finalFile.set(encryptedArray, 4 + metadataStr.length);
                
                if (typeof callbacks.onComplete === 'function') {
                    callbacks.onComplete(finalFile, file.name);
                }
            } catch (error) {
                if (typeof callbacks.onError === 'function') {
                    callbacks.onError(error.message);
                }
                console.error('Encryption error:', error);
            }
        };
        
        reader.onerror = () => {
            if (typeof callbacks.onError === 'function') {
                callbacks.onError('File reading failed');
            }
        };
        
        // Read the file
        reader.readAsArrayBuffer(file);
    }
    
    /**
     * Decrypt a file
     * @param {File} file - The encrypted file
     * @param {string} password - The decryption password
     * @param {Object} callbacks - Callback functions for progress, completion, and errors
     */
    decrypt(file, password, callbacks = {}) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const fileData = new Uint8Array(event.target.result);
                
                // Extract metadata length (first 4 bytes)
                const metadataLength = new Uint32Array(fileData.slice(0, 4).buffer)[0];
                
                // Extract metadata
                const metadataBytes = fileData.slice(4, 4 + metadataLength);
                const metadataStr = String.fromCharCode.apply(null, metadataBytes);
                const metadata = JSON.parse(metadataStr);
                
                // Extract encrypted data
                const encryptedData = fileData.slice(4 + metadataLength);
                
                // Derive key from password and salt
                const salt = CryptoJS.enc.Hex.parse(metadata.salt);
                const key = CryptoJS.PBKDF2(password, salt, {
                    keySize: 256/32,
                    iterations: 1000
                });
                
                // Get IV from metadata
                const iv = CryptoJS.enc.Hex.parse(metadata.iv);
                
                // Decrypt the data
                const decrypted = this._decryptData(encryptedData, key, iv, callbacks.onProgress);
                
                // Verify file integrity
                const decryptedHash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(decrypted)).toString();
                const integrityValid = decryptedHash === metadata.hash;
                
                if (typeof callbacks.onComplete === 'function') {
                    callbacks.onComplete(decrypted, metadata.fileName, {
                        valid: integrityValid,
                        originalHash: metadata.hash,
                        decryptedHash: decryptedHash
                    });
                }
            } catch (error) {
                if (typeof callbacks.onError === 'function') {
                    callbacks.onError(error.message || 'Invalid password or corrupted file');
                }
                console.error('Decryption error:', error);
            }
        };
        
        reader.onerror = () => {
            if (typeof callbacks.onError === 'function') {
                callbacks.onError('File reading failed');
            }
        };
        
        // Read the file
        reader.readAsArrayBuffer(file);
    }
    
    /**
     * Encrypt data using AES-256-CBC
     * @private
     */
    _encryptData(data, key, iv, progressCallback) {
        const wordArray = CryptoJS.lib.WordArray.create(data);
        
        // For simplicity in this demo, we encrypt everything at once
        // In a real implementation, we would process in chunks for large files
        const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        
        if (typeof progressCallback === 'function') {
            progressCallback(100);
        }
        
        return encrypted.ciphertext;
    }
    
    /**
     * Decrypt data using AES-256-CBC
     * @private
     */
    _decryptData(data, key, iv, progressCallback) {
        // Convert Uint8Array to WordArray
        const wordArray = CryptoJS.lib.WordArray.create(data);
        
        // Create a CipherParams object
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: wordArray
        });
        
        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        
        if (typeof progressCallback === 'function') {
            progressCallback(100);
        }
        
        // Convert to Uint8Array
        return this._wordArrayToUint8Array(decrypted);
    }
    
    /**
     * Convert CryptoJS WordArray to Uint8Array
     * @private
     */
    _wordArrayToUint8Array(wordArray) {
        const words = wordArray.words;
        const sigBytes = wordArray.sigBytes;
        const result = new Uint8Array(sigBytes);
        
        let i = 0;
        for (let j = 0; j < sigBytes; j += 4) {
            const w = words[i++];
            result[j] = (w >>> 24) & 0xff;
            if (j + 1 < sigBytes) result[j + 1] = (w >>> 16) & 0xff;
            if (j + 2 < sigBytes) result[j + 2] = (w >>> 8) & 0xff;
            if (j + 3 < sigBytes) result[j + 3] = w & 0xff;
        }
        
        return result;
    }
}