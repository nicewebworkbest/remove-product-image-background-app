//require('isomorphic-fetch');
const dotenv = require('dotenv');
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const Shopify = require('shopify-api-node');
const removeRegisteredWebhook = require('./services/removeRegisteredWebhook');
const removeImageBackground = require('./services/removeImageBackground');
const removeProductImage = require('./services/removeProductImage');
const uploadProductImage = require('./services/uploadProductImage');
const getImageMetafields = require('./services/getImageMetafields');
const changeProductVariantImage = require('./services/changeProductVariantImage');

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

const verifyWebhook = ( req, res, next ) => {
	// We'll compare the hmac to our own hash
	//const hmac = req.get('X-Shopify-Hmac-Sha256');
	const hmac = req.header('X-Shopify-Hmac-Sha256');

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', SHOPIFY_SECRET_KEY)
		.update(req.body.toString())
    .digest('base64');

  // Compare our hash to Shopify's hash
  if ( hash === hmac ) {
		// It's a match! All good
		console.log('Phew, it came from Shopify!');
		next();
  } else {
		// No match! This request didn't originate from Shopify
		console.log('Danger! Not from Shopify!');
		next(new Error('Not from Shopify!'));
	}
}

app.use(bodyParser.raw({type: 'application/json'}));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use("/" + IMAGE_DIR_PATH, express.static(IMAGE_DIR_PATH));

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.get('/remove-product-webhooks', async (req, res) => {
	const webhookResult = await shopify.webhook.list();
	await removeRegisteredWebhook(webhookResult);
	const result = await shopify.webhook.list();
	res.send(result);
});

router.get('/register-product-webhooks', async (req, res) => {
	const webhookResult = await shopify.webhook.list();
	await removeRegisteredWebhook(webhookResult);

	await shopify.webhook.create({
		topic: "products/create",
		address: `${HOST}/webhooks/products/create-update`,
		format: "json"
	});
	await shopify.webhook.create({
		topic: "products/update",
		address: `${HOST}/webhooks/products/create-update`,
		format: "json"
	});

	const result = await shopify.webhook.list();
	res.send(result);
});

router.post('/webhooks/products/create-update', verifyWebhook, async (req, res) => {
	const data = req.body.toString();
	const productData = JSON.parse(data);
	const productId = productData.id;
	console.log('productId', productId);

	for ( let index = 0; index < productData.images.length; index++ ) {
		let image = productData.images[index];
		console.log('image', image);
		let imageMetafields = await getImageMetafields(image.id);
		let backgroundRemoved = imageMetafields.some(metafield => {
			return (metafield.key == 'removed_bg') && (metafield.value == 'yes');
		});
		console.log('backgroundRemoved', backgroundRemoved);

		if (!backgroundRemoved) {
			let fileName = await removeImageBackground(image.src);
			uploadProductImage(productId, image, fileName)
				.then((uploadedProductImage) => {
					removeProductImage(productId, image.id);
					console.log('uploadedProductImage', uploadedProductImage);
				})
				.catch((err) => {
					console.log(err);
				});

			// for (let index = 0; index < image.variant_ids.length; index++) {
			// 	let productVariant = await changeProductVariantImage(uploadedProductImage.id, image.variant_ids[index]);
			// 	console.log(productVariant);
			// }
		}
	}

	res.sendStatus(200);
});

router.get('/webhooks/products/create-update', async (req, res) => {
	// const productId = 5602577416352;
	// var image = {
	// 	id: 20330386456736,
	// 	product_id: 5602577416352,
	// 	position: 1,
	// 	created_at: '2020-11-21T14:23:00-05:00',
	// 	updated_at: '2020-11-21T14:23:00-05:00',
	// 	alt: 'Man wearing chequered red and black shirt',
	// 	width: 612,
	// 	height: 408,
	// 	src: 'https://cdn.shopify.com/s/files/1/0480/2779/5616/products/red-plaid-shirt_925x_95025b1f-2c44-4e88-a102-cf1d98afa514.png?v=1605986580',
	// 	variant_ids: [],
	// 	admin_graphql_api_id: 'gid://shopify/ProductImage/20330386456736'
	// };

	// const imageMetafields = await getImageMetafields(image.id);
	// const backgroundRemoved = imageMetafields.some(metafield => {
	// 	return (metafield.key == 'removed_bg') && (metafield.value == 'yes');
	// });

	// if (!backgroundRemoved) {
	// 	const fileName = await removeImageBackground(image.src);
	// 	await removeProductImage(productId, image.id);
	// 	const uploadedProductImage = await uploadProductImage(productId, image, fileName);
	// 	for (let index = 0; index < image.variant_ids.length; index++) {
	// 		await changeProductVariantImage(uploadedProductImage.id, image.variant_ids[index]);
	// 	}
	// }
	// res.body = 'OK';
	// res.sendStatus(200);
});

app.use('/', router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
