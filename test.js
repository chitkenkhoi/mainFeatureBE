const crypto = require('crypto');

// Encryption function
function encrypt(text, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Decryption function
function decrypt(encryptedText, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key)
        ;
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Example usage
console.log(decrypt("1865ff21d04af48e64a840781a3c46a8d59377aa34aaedfe9cd8bc0a115027ceed1ac1f9b70f25c6b555742d994b9f8564b68a4ce60e83dc6c9a82f5eb0a9911dbfb8abd3fafd3bbb6157e2f52567bec", "161102"))