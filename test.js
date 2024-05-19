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
const sha256Hash = crypto.createHash('sha256');
sha256Hash.update("lequangkhoim@gmail.com"+"123456");
var hash_password = sha256Hash.digest('hex');
console.log(hash_password)