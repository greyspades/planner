const fetch = require("node-fetch")

const makeContract = async () => {
  try {
    const options = {
      method: "GET"
    };
    var credData = await fetch(
      "http://10.0.0.184:8015/03a3b2c6f7d8e1c4_0a",
      options
    ).then((response) => {
      if (response.ok) {
        const headers = response.headers.get("x-lapo-eve-proc");
        // console.log(headers.split("~"))
        return headers.split("~")
      }
    });
    return credData;
  } catch (err) {
    console.log(err);
  }
};

module.exports = makeContract;
