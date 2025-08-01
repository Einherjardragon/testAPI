"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aseutil = void 0;
const cryptos = require("crypto");
const secret = 'JRz$QY->gsUh^JH^ZQ-/JewQA=/doNdr';
const char_1 = require("../util/char");
const char = new char_1.Char();
const charStartlength = 9;
const charEndlength = 5;
class aseutil {
    hmacencry(data) {
        cryptos.createHmac('sha256', secret).update(data).digest('hex');
    }
    encryption(data = '', iv = "") {
        iv = iv || "";
        var clearEncoding = 'utf8';
        var cipherEncoding = 'base64';
        var cipherChunks = [];
        var cipher = cryptos.createCipheriv('aes-256-ecb', secret, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
        cipherChunks.push(cipher.final(cipherEncoding));
        return cipherChunks.join('');
    }
    decryption(data, iv = "") {
        if (!data) {
            return "";
        }
        iv = iv || "";
        var clearEncoding = 'utf8';
        var cipherEncoding = 'base64';
        var cipherChunks = [];
        var decipher = cryptos.createDecipheriv('aes-256-ecb', secret, iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
        cipherChunks.push(decipher.final(clearEncoding));
        return cipherChunks.join('');
    }
    encryBase64(data, type = 0) {
        const enStr = Buffer.from(data).toString('base64');
        const randStrStart = char.randomChar(charStartlength);
        const randStrEnd = char.randomChar(charEndlength);
        const newenStr = randStrStart + enStr + randStrEnd;
        return type === 0 ? newenStr : enStr;
    }
    decryBase64(data) {
        const enLengths = data.length;
        const subStart = data.substring(charStartlength, enLengths);
        const spliLength = subStart.length;
        const subEnd = subStart.substring(spliLength - charEndlength, 0);
        const resultStr = Buffer.from(subEnd, 'base64').toString();
        return resultStr;
    }
    sha1Hash(val) {
        let hash = cryptos.createHash('sha1');
        hash.update(val);
        return hash.digest('hex');
    }
}
exports.aseutil = aseutil;
;
