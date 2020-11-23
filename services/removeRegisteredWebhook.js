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

const removeRegisteredWebhook = async (webhooks) => {
	for ( let index = 0; index < webhooks.length; index++ ) {
		if ( webhooks[index].topic == "products/create" || webhooks[index].topic == "products/update" ) {
			await shopify.webhook.delete(webhooks[index].id);
		}
	}
};

module.exports = removeRegisteredWebhook;
