const CryptoJs = require("crypto-js");
const { base64ToHex, hexToBase64 } = require("./conversion");
const fetch = require("node-fetch");
const makeContract = require("./contract");

var key = CryptoJs.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_KEY);
var iv = CryptoJs.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_IV);

const makeRequest = async(url, jsonBody, jsonHeader, cred) => {
    try {
//   const cred = await makeContract()

//   const token = {
//       tk: cred[0],
//       src: "AS-IN-D659B-e3M"
//   }
//   const body = {
//       UsN: username,
//       Pwd: password,
//       xAppSource: "AS-IN-D659B-e3M"
//   }
//   const jsonBody = JSON.stringify(body);
//   const jsonHeader = JSON.stringify(token)

  var resData;

  var key = CryptoJs.enc.Utf8.parse(cred[1]);
  var iv = CryptoJs.enc.Utf8.parse(cred[2]);

  const encryptedBody = CryptoJs.AES.encrypt(jsonBody, key, {
      iv: iv,
  }).toString();
  const encryptedHeader = CryptoJs.AES.encrypt(jsonHeader, key, {
      iv: iv,
  }).toString();
  const hexBody = base64ToHex(encryptedBody);
  const hexHeader = base64ToHex(encryptedHeader);

  const options = {
      method: "POST",
      headers: {
        "x-lapo-eve-proc": hexHeader + cred[0],
        "Content-Type": "application/json",
      },
      body: hexBody,
  }
//   session = req.session;
//   session.userid = username;
//   res.redirect("/businessplanner/home");

  var e360Res = await fetch(url, options)
  var jsonRes = await e360Res.json()
  if(jsonRes.status==200) {
      let bytes = CryptoJs.AES.decrypt(hexToBase64(jsonRes.data), key, { iv: iv });
      resData = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
      const result = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
      
      return result
    //   console.log(userData)
    //   req.session.userData = userData;
    //   res.redirect('/businessplanner/home');
  } else {
    //   res.redirect('/businessplanner/loginfailed');
    console.log(jsonRes)
  }
    } catch(err) {
        console.log(err)
    }
}

module.exports = makeRequest;