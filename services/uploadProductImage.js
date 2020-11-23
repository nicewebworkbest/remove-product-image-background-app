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

const uploadProductImage = async (productId, originalImage, fileName) => {
	var uploadImage = {};
	if ( originalImage.position != null ) {
		uploadImage.position = originalImage.position;
	}
	if ( originalImage.variant_ids != null ) {
		uploadImage.variant_ids = originalImage.variant_ids;
	}
	if ( originalImage.alt != null ) {
		uploadImage.alt = originalImage.alt;
	}
	uploadImage.metafields = [
		{
			"key": "removed_bg",
			"value": "yes",
			"value_type": "string",
			"namespace": "global"
		}
	];
	uploadImage.src = HOST + '/' + IMAGE_DIR_PATH + '/' + fileName;

	return uploadResult = await shopify.productImage.create(productId, uploadImage);
};

module.exports = uploadProductImage;
