const axios = require("axios");
const axios = require("axios");
const fs = require("fs");
const fs = require("fs");

const findUrl = (y) => {
    if (y.external) {
        return y.external.url;
    } else if (y.file) {
        return y.file.url;
    }
};


exports.findUrl = findUrl;async function downloadImage(imgFile, reqUrl) {

    if (!reqUrl) return;

    let filePath = imgFile;

    await axios({
        method: "GET",
        url: reqUrl,
        responseType: "stream"
    }).then(res => {
        res.data.pipe(fs.createWriteStream(filePath));
        res.data.on("end", () => {
            console.log("download complete");
        });

        res.data.on('progress', () => {
            console.log('progressing');
        });
    });

    return imgFile;
}
exports.downloadImage = downloadImage;

