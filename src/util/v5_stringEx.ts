
// https://medium.com/@Whien/%E9%80%8F%E9%81%8E-nodejs-crypto-%E5%B9%AB%E5%8A%A9%E7%94%B7%E5%AD%A9%E8%88%87%E5%A5%B3%E5%AD%A9%E5%AE%8C%E6%88%90%E9%9D%9E%E5%B0%8D%E7%A8%B1%E5%8A%A0%E5%AF%86%E7%9A%84%E7%A7%81%E8%A8%8A%E5%82%B3%E8%BC%B8-207ccb54ec20
// https://pvt5r486.github.io/f2e/20190711/4123217379/

import * as crypto from "crypto";
import {staticConstruct} from "./static_construct";

@staticConstruct
export class StringEx {

    private static self: StringEx;
    static construct() {
        // 將主要的加密字串, 引導到以硬體上的資料
        this.self = new StringEx(`8813@Fox`);
    }
    static hash(str: string): string {
        return Buffer.from(str, 'binary').toString('base64');
    }
    static encode(str: string): string {
        var buffer = Buffer.from(str, 'utf8');
        const encrypt = crypto.publicEncrypt(this.self.buff_publicKey, buffer);
        return encrypt.toString('base64');
    }    
    static decode(str: string): string {
        var buffer = Buffer.from(str,'base64');
        const decrypt = crypto.privateDecrypt({key: this.self.buff_privateKey, passphrase:this.self.defKey}, buffer);
        return decrypt.toString('utf8');
    }
    
    private readonly buff_publicKey: string;
    private readonly buff_privateKey: string;
    private readonly defKey: string;
    constructor(defKey: string) {
        this.defKey = defKey;
        
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs1',
              format: 'pem',
              cipher: 'aes-256-cbc',
              passphrase: defKey
            }
          });
        this.buff_publicKey = publicKey;
        this.buff_privateKey = privateKey;
    }
}