var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	next();
});

/**
 * Si voy a utilizar AWS Cognito, entonces no deberia de usuar estas credenciales????
 */
AWS.config.loadFromPath('./secret_config.json');
AWS.config.region = 'us-east-1';

/**
 * Esta URL es llamada desde el "cliente" con Angular desde /public/app.js en el factory
 * "AWSmaker" pasando un argumento con el nombre "UserIDFromAngularApp" que es ingresado
 * desde la vista principal en el inpute text....
 */
router.route('/aws')
	.post(function (req, res) {

		var UserID = req.body.UserIDFromAngularApp;
		console.log("UserID: ", UserID);

		var cognitoidentity = new AWS.CognitoIdentity();
		var params = {
			/**
			 * [IdentityPoolId description] Ya lo he obtenido: anteriormente lo confundi con
			 * el UserIdentityPool, pero me di cuenta que es mas bien el que se crea en
			 * "Federated Identities"
			 * @type {String} us-east-1:b56ca9ad-f64b-xxxx-xxxx-xxxxxxxxxxxx
			 */
			IdentityPoolId: 'your_cognito_identity_pool_id',
			/**
			 * [Logins description] Esta parte no la comprendo.... trate con un user que tengo
			 * configurado en IAM con los provilegios de Administrador, pero no tengo idea como se
			 * enlaza con el "IdentityPool"
			 * @type {Object} ....
			 */
			Logins: {
				"your_developer_authenticated_identity_name": UserID
			}
		};

		cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
			if (err) {
				console.log(err, err.stack); res.json({failure: 'Connection failure', error: err.stack});
			} else {
				console.log(data); // so you can see your result server side
				res.json(data); // send it back
			}
		});

	});

app.use('/simpleapi', router);

var port = 3000;
var IP = "localhost";
app.listen(port, function(){
	console.log("CognitoAngularNode server listening at", IP + ":" + port);
});
