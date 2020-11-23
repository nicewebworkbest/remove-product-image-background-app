//require('isomorphic-fetch');
const Shopify = require('shopify-api-node');
const dotenv = require('dotenv');
dotenv.config();
const {
  SHOPIFY_API_KEY,
	SHOPIFY_API_PASSWORD,
	SHOPIFY_SECRET_KEY,
	SHOPNAME,
	HOST,
	IMAGE_DIR_PATH
} = process.env;

const shopify = new Shopify({
  shopName: SHOPNAME,
  apiKey: SHOPIFY_API_KEY,
	password: SHOPIFY_API_PASSWORD
});

const removeProductImage = async (productId, imgId) => {
	shopify.productImage.delete(productId, imgId);
	console.log(imgId + " Image deleted");
};

module.exports = removeProductImage;
