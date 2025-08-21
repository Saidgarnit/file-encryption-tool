# SecureFile - File Encryption Tool

![SecureFile Logo](images/shield-icon.png)

A browser-based file encryption tool with AES-256 security.

## 🔗 Links
- **Live Demo:** [https://file-encryption-tool.vercel.app/](https://file-encryption-tool.vercel.app/)
- **GitHub Repository:** [https://github.com/Saidgarnit/file-encryption-tool.git](https://github.com/Saidgarnit/file-encryption-tool.git)

## 🔒 About

SecureFile provides military-grade encryption for your sensitive files using client-side processing. Files never leave your device, with all encryption happening directly in your browser.

## ✨ Features

- **AES-256 Encryption**: Industry-standard, military-grade encryption algorithm
- **Client-Side Processing**: All encryption/decryption happens in your browser - files never leave your device
- **Drag & Drop Interface**: Simple, user-friendly file selection
- **File Integrity Verification**: SHA-256 hash checks verify files haven't been tampered with
- **Password Strength Meter**: Helps users create strong, secure passwords
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 How to Use

1. **Encrypt a File**:
   - Drag & drop or select a file
   - Create a strong password
   - Click "Encrypt & Download"
   - Store the encrypted file securely

2. **Decrypt a File**:
   - Drag & drop or select an encrypted (.encrypted) file
   - Enter the password you used to encrypt the file
   - Click "Decrypt & Download"
   - Verify file integrity automatically

## 🔧 Technical Details

- **Frontend**: HTML5, CSS3, JavaScript
- **Encryption**: CryptoJS library implementing AES-256-CBC
- **Styling**: Bootstrap 5 for responsive design
- **File Handling**: Native File API for drag-and-drop functionality

## ⚠️ Security Notes

- Your password is never stored or transmitted
- If you forget your encryption password, your files CANNOT be recovered
- For maximum security, use a unique, strong password for each important file

## 📋 License

MIT License - Feel free to use and modify for your own projects.

---

**Last updated:** 2025-08-21  
**Author:** [Saidgarnit](https://github.com/Saidgarnit)
