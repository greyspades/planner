function base64ToHex(base64) {
    const raw = atob(base64);
    let hex = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i);
      const hexCode = charCode.toString(16);
      hex += hexCode.padStart(2, '0'); // Ensure two digits for each byte
    }
    return hex;
}

function hexToBase64(hexString) {
    // Convert the hexadecimal string to a byte array
    return Buffer.from(hexString, 'hex').toString('base64');
}

module.exports = {
    base64ToHex,
    hexToBase64
};