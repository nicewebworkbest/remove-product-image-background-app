const fs = require('fs');
const url = require('url');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const {
  REMOVE_BG_API_URL,
  REMOVE_BG_API_KEY,
  IMAGE_DIR_PATH
} = process.env;

const removeImageBackground = async ( imgUrl ) => {
  const parsed = url.parse(imgUrl);
  const imgFileName = path.basename(parsed.pathname).split('.').slice(0, -1).join('.') + '.png';
  const outputFile = IMAGE_DIR_PATH + '/' + imgFileName;
  await axios({
    url: REMOVE_BG_API_URL,
    method: 'post',
    data: {
      image_url: imgUrl,
      size: 'preview',
    },
    headers: {
      'X-Api-Key': REMOVE_BG_API_KEY
    },
    responseType: 'stream'
  })
  .then(response => {
    response.data.pipe(fs.createWriteStream(outputFile));
  })
  .catch(err => {
    new Error(err);
  });

  return imgFileName;
};

module.exports = removeImageBackground;
