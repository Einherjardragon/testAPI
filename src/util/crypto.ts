const cryptos = require("crypto");
const secret = 'JRz$QY->gsUh^JH^ZQ-/JewQA=/doNdr';
import { Char } from "../util/char";
const char = new Char();
const charStartlength = 9;
const charEndlength = 5;

export class aseutil {

    //hmac加鹽加密，先轉成sha256後將數據透過secret進行加密，輸出成hex或base64格式  無解密，只應用比較方式確認是否相同
    hmacencry(data){
        cryptos.createHmac('sha256',secret).update(data).digest('hex');  //digest hex or base64
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

    /**
     * 
     * @param data 
     * @param type type 0則為需要額外加密  1則為直接轉base64
     * @returns 
     */
    encryBase64(data,type=0) {
        // const enStr = btoa(unescape(encodeURIComponent(data)));
        const enStr = Buffer.from(data).toString('base64');  //new Buffer(data).toString('base64')
        const randStrStart = char.randomChar(charStartlength);
        const randStrEnd = char.randomChar(charEndlength);
        const newenStr = randStrStart + enStr + randStrEnd;
        return type === 0 ? newenStr : enStr;
    }

    decryBase64(data) {
        const enLengths = data.length;
        //去頭
        const subStart = data.substring(charStartlength, enLengths);
        const spliLength = subStart.length;
        //去尾
        const subEnd = subStart.substring(spliLength - charEndlength, 0);
        // let resultStr = decodeURIComponent(escape( atob(subEnd)));
        const resultStr = Buffer.from(subEnd,'base64').toString();  //new Buffer(subEnd,'base64').toString()
        return resultStr;
    }

    sha1Hash(val) {
        let hash = cryptos.createHash('sha1');
        hash.update(val);
        return hash.digest('hex');
    }
};


//select AES_DECRYPT(patientName,"JRz$QY->gsUh^JH^ZQ-/JewQA=/doNdr") from v5_med_m1.dicom_records;
//select * from v5_med_m1.dicom_records WHERE AES_DECRYPT(FROM_BASE64(),"JRz$QY->gsUh^JH^ZQ-/JewQA=/doNdr","aes-256-ecb") LIKE "%王%";
//select AES_DECRYPT(FROM_BASE64(patientName),"JRz$QY->gsUh^JH^ZQ-/JewQA=/doNdr","aes-256-ecb") from v5_med_m1.dicom_records WHERE patientName LIKE "%王%";
//select AES_DECRYPT(FROM_BASE64("q6B3B2l+CdVtQ00Vr5tyIw=="),"JRz$QY->gsUh^JH^ZQ-/JewQA=/doNdr","aes-256-ecb");