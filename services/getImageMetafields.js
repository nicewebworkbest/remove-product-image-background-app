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

const getImageMetafields = async (imgId) => {
	return await shopify.metafield
		.list({
			metafield: { owner_resource: 'product_image', owner_id: imgId }
		});
};

module.exports = getImageMetafields;
