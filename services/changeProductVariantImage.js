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

const changeProductVariantImage = async (imgId, variantId) => {
	await shopify.productVariant.update(variantId, { image_id: imgId });
};

module.exports = changeProductVariantImage;
