/**
 * SecureFile - File Encryption Tool
 * Main application script
 * 
 * @author Saidgarnit
 * @date 2025-08-21
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, starting initialization...");
    
    // Initialize file handling
    const fileHandler = new FileHandler();
    fileHandler.init();
    
    // Initialize password strength meter
    const passwordInput = document.getElementById('encryptPassword');
    const passwordConfirmInput = document.getElementById('encryptPasswordConfirm');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordFeedback = document.getElementById('passwordFeedback');
    
    console.log("Password inputs found:", {
        passwordInput: !!passwordInput,
        passwordConfirmInput: !!passwordConfirmInput,
        passwordStrength: !!passwordStrength,
        passwordFeedback: !!passwordFeedback
    });
    
    // Encryption controls
    const encryptButton = document.getElementById('encryptButton');
    const encryptProgress = document.getElementById('encryptProgress');
    const progressBar = encryptProgress ? encryptProgress.querySelector('.progress-bar') : null;
    
    console.log("Encrypt controls found:", {
        encryptButton: !!encryptButton,
        encryptProgress: !!encryptProgress,
        progressBar: !!progressBar
    });
    
    // Decryption controls
    const decryptButton = document.getElementById('decryptButton');
    const decryptProgress = document.getElementById('decryptProgress');
    const decryptProgressBar = decryptProgress ? decryptProgress.querySelector('.progress-bar') : null;
    const integrityResult = document.getElementById('integrityResult');
    const integrityAlert = integrityResult ? integrityResult.querySelector('.alert') : null;
    const integrityMessage = document.getElementById('integrityMessage');
    
    console.log("Decrypt controls found:", {
        decryptButton: !!decryptButton,
        decryptProgress: !!decryptProgress,
        decryptProgressBar: !!decryptProgressBar,
        integrityResult: !!integrityResult,
        integrityAlert: !!integrityAlert,
        integrityMessage: !!integrityMessage
    });
    
    // Only proceed if essential elements exist
    if (!passwordInput || !passwordConfirmInput || !encryptButton || !decryptButton) {
        console.error("Essential elements missing! Cannot initialize properly.");
        alert("Some page elements are missing. Please refresh the page.");
        return;
    }
    
    // Toggle password visibility
    setupPasswordToggle('encryptPassword', 'toggleEncryptPassword');
    setupPasswordToggle('encryptPasswordConfirm', 'toggleEncryptPasswordConfirm');
    setupPasswordToggle('decryptPassword', 'toggleDecryptPassword');
    
    // Check password strength
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        
        // Update progress bar
        passwordStrength.className = 'progress-bar';
        if (password) {
            passwordStrength.classList.add('strength-' + strength.score);
        } else {
            passwordStrength.style.width = '0%';
        }
        
        // Update feedback
        passwordFeedback.textContent = password ? strength.feedback : '';
        
        // Check if password fields match and are strong enough
        validateEncryptionForm();
    });
    
    // Check if passwords match
    passwordConfirmInput.addEventListener('input', validateEncryptionForm);
    
    // Encrypt button click handler
    encryptButton.addEventListener('click', function() {
        const file = fileHandler.getEncryptFile();
        const password = passwordInput.value;
        
        if (!file || !password) return;
        
        encryptButton.disabled = true;
        encryptProgress.classList.remove('d-none');
        
        // Start encryption
        const encryption = new FileEncryption();
        encryption.encrypt(file, password, {
            onProgress: function(percent) {
                progressBar.style.width = percent + '%';
            },
            onComplete: function(encryptedData, fileName) {
                // Create download link
                const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName + '.encrypted';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Reset form after short delay
                setTimeout(() => {
                    encryptButton.disabled = false;
                    encryptProgress.classList.add('d-none');
                    progressBar.style.width = '0%';
                    showSuccessMessage('File encrypted and downloaded successfully!');
                    
                    // Reset form
                    passwordInput.value = '';
                    passwordConfirmInput.value = '';
                    passwordStrength.style.width = '0%';
                    passwordFeedback.textContent = '';
                    fileHandler.resetEncryptUpload();
                }, 1000);
            },
            onError: function(error) {
                encryptButton.disabled = false;
                encryptProgress.classList.add('d-none');
                showErrorMessage('Encryption failed: ' + error);
            }
        });
    });
    
    // Decrypt button click handler
    decryptButton.addEventListener('click', function() {
        const file = fileHandler.getDecryptFile();
        const password = document.getElementById('decryptPassword').value;
        
        if (!file || !password) return;
        
        decryptButton.disabled = true;
        decryptProgress.classList.remove('d-none');
        integrityResult.classList.add('d-none');
        
        // Start decryption
        const encryption = new FileEncryption();
        encryption.decrypt(file, password, {
            onProgress: function(percent) {
                decryptProgressBar.style.width = percent + '%';
            },
            onComplete: function(decryptedData, fileName, integrity) {
                // Show integrity result
                integrityResult.classList.remove('d-none');
                
                if (integrity.valid) {
                    integrityAlert.className = 'alert alert-success';
                    integrityAlert.querySelector('.bi').className = 'bi bi-check-circle-fill me-2';
                    integrityMessage.textContent = 'File integrity verified. No tampering detected.';
                    
                    // Create download link
                    const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showSuccessMessage('File decrypted and downloaded successfully!');
                } else {
                    integrityAlert.className = 'alert alert-danger';
                    integrityAlert.querySelector('.bi').className = 'bi bi-exclamation-circle-fill me-2';
                    integrityMessage.textContent = 'File integrity check failed! The file may have been tampered with.';
                    
                    showErrorMessage('Decryption failed: File integrity check failed');
                }
                
                // Reset form after short delay
                setTimeout(() => {
                    decryptButton.disabled = false;
                    decryptProgress.classList.add('d-none');
                    decryptProgressBar.style.width = '0%';
                    document.getElementById('decryptPassword').value = '';
                    fileHandler.resetDecryptUpload();
                }, 1000);
            },
            onError: function(error) {
                decryptButton.disabled = false;
                decryptProgress.classList.add('d-none');
                showErrorMessage('Decryption failed: ' + error);
            }
        });
    });
    
    // Helper functions
    function validateEncryptionForm() {
        const password = passwordInput.value;
        const confirmPassword = passwordConfirmInput.value;
        const file = fileHandler.getEncryptFile();
        
        // Check if we have a file, password is strong enough, and passwords match
        const strength = checkPasswordStrength(password);
        const isStrong = password && strength.score >= 2;
        const passwordsMatch = password && password === confirmPassword;
        
        encryptButton.disabled = !(file && isStrong && passwordsMatch);
        
        // Show password match status if both fields have content
        if (password && confirmPassword) {
            if (!passwordsMatch) {
                passwordConfirmInput.classList.add('is-invalid');
            } else {
                passwordConfirmInput.classList.remove('is-invalid');
                passwordConfirmInput.classList.add('is-valid');
            }
        } else {
            passwordConfirmInput.classList.remove('is-invalid', 'is-valid');
        }
    }
    
    function setupPasswordToggle(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        const icon = button.querySelector('i');
        
        button.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    }
    
    function checkPasswordStrength(password) {
        if (!password) {
            return { score: 0, feedback: '' };
        }
        
        // Calculate password strength (simplified version)
        let score = 0;
        let feedback = '';
        
        // Length check
        if (password.length < 8) {
            feedback = 'Password is too short';
        } else if (password.length >= 16) {
            score += 2;
        } else if (password.length >= 12) {
            score += 1;
        }
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score += 0.5;
        if (/[a-z]/.test(password)) score += 0.5;
        if (/[0-9]/.test(password)) score += 0.5;
        if (/[^A-Za-z0-9]/.test(password)) score += 0.5;
        
        // Variety of characters
        const uniqueChars = new Set(password.split('')).size;
        if (uniqueChars > 10) score += 1;
        else if (uniqueChars > 5) score += 0.5;
        
        // Cap at 4
        score = Math.min(4, Math.floor(score));
        
        // Generate feedback
        if (score <= 1) {
            feedback = feedback || 'Password is weak';
        } else if (score === 2) {
            feedback = 'Password is fair';
        } else if (score === 3) {
            feedback = 'Password is good';
        } else {
            feedback = 'Password is strong';
        }
        
        return { score, feedback };
    }
    
    function showSuccessMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed bottom-0 end-0 m-3';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            <i class="bi bi-check-circle-fill me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }
    
    function showErrorMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed bottom-0 end-0 m-3';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            <i class="bi bi-exclamation-circle-fill me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }
});