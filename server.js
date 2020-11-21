require('isomorphic-fetch');
const dotenv = require('dotenv');
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const express = require('express');
var router = express.Router();
//const getRawBody = require('raw-body');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const Shopify = require('shopify-api-node');

const {
  SHOPIFY_API_KEY,
	SHOPIFY_API_PASSWORD,
	SHOPIFY_SECRET_KEY,
	SHOPNAME,
	HOST
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

  // Use raw-body to get the body (buffer)
  //const body = await getRawBody(req);

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', SHOPIFY_SECRET_KEY)
		//.update(body, 'utf8', 'hex')
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
		next(new Error('Not from Shopify!'));;
	}
}

//app.use(bodyParser.json());
app.use(bodyParser.raw({type: 'application/json'}));
app.use(bodyParser.urlencoded({
	extended: true
}));

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.get('/register-product-webhooks', async (req, res) => {
	const webhookResult = await shopify.webhook.list();
	const removeRegisteredWebhook = async (webhooks) => {
		for ( let index = 0; index < webhooks.length; index++ ) {
			if ( webhooks[index].topic == "products/create" || webhooks[index].topic == "products/update" ) {
				await shopify.webhook.delete(webhooks[index].id);
			}
		}
	};

	removeRegisteredWebhook(webhookResult);

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
	console.log('productData', productData );
	res.sendStatus(200);
});

app.use('/', router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
