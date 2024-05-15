const crypto = require('crypto');

// Khóa mã hóa và giải mã. Đảm bảo rằng chúng có cùng độ dài.
const key = 'key';
const iv = crypto.randomBytes(16);

// Mã hóa
function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

// Giải mã
function decrypt(text, key) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(Buffer.from(text, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const plainText = '0x123456';
function test() {
    const encryptedText = encrypt(plainText);
    const decryptedText = decrypt(encryptedText, "key");

    console.log('Plain Text:', plainText);
    console.log('Encrypted Text:', encryptedText);
    console.log('Decrypted Text:', decryptedText);
}
test();