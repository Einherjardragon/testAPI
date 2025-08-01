"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Char = void 0;
const charArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "~", "-", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "s", "y", "z"];
class Char {
    randomChar(len) {
        let result = '';
        for (var i = 0; i < len; i++) {
            let rand = Math.floor(Math.random() * 73);
            result += charArray[rand];
        }
        return result;
    }
}
exports.Char = Char;
