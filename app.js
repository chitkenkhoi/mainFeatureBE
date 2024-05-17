const express = require('express')
const app = express();
const PORT = process.env.PORT || 4001;
const { transporter } = require('./util/sendMail.js');
const { run, client, close } = require('./util/connectMongodb')
const callWriteFunction = require('./util/callSmartContract.js')
var bodyParser = require('body-parser');
var http = require('http');
var { expressjwt: jwt } = require("express-jwt");
var JWT = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
const ethers = require('ethers');
const crypto = require('crypto'); //sha256 Object
const multer = require('multer');
const { ObjectId } = require('mongodb')
const sendMoney = require('./util/sendMoney.js')
const { connectRedis, geter, seter } = require('./util/redis.js')
const { encrypt, decrypt } = require('./util/encrypt.js')
// multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: false
}));
// set secret variable
app.set('secret', 'thisismysecret');
app.use(jwt({
    secret: 'thisismysecret',
    algorithms: ["HS256"],
}).unless({
    path: ['/users/login', '/users/register', '/users/login/validateOTP', '/users/register/validateOTP', 'users/resendOTP', '/ping']
}));
app.use(bearerToken());
run();
connectRedis();
app.use(function (req, res, next) {
    if (req.originalUrl.indexOf('/users') >= 0 || req.originalUrl.indexOf('/ping') >= 0) {
        return next();
    }

    var token = req.token;
    JWT.verify(token, app.get('secret'), async function (err, decoded) {
        if (err) {
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                    'token returned from /users call in the authorization header ' +
                    ' as a Bearer token'
            });
            return;
        } else {

            req.id = decoded.id;
            const verify = async () => {
                const result = await geter(`${decoded.id}_logout`)
                return result
            }
            const result = await verify()
            if (result) {
                if (parseInt(decoded.iat) < parseInt(result)) {
                    res.send({
                        success: false,
                        message: 'Session ended'
                    });
                    return;
                }
            }
            req.publickey = decoded.publickey
            req.iat = decoded.iat;
            req.isData = decoded.isData
            return next();
        }
    });
});


function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}
async function sendOTP(email, OTP) {
    try {
        const mailOptions = {
            from: "chitkenkhoi@gmai.com",
            to: [email],
            subject: "OTP for authentication",
            text: `Your OTP code is ${OTP}`,
        }
        await transporter.sendMail(mailOptions);
        return true
    } catch (error) {
        console.log(error)
        return false
    }

}
////////////////////////// SERVER START HERE///////////////////////
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get('/token/validate', async function (req, res) {
    if (req.isData) {
        res.json({
            message: "Valid token",
            name: "Le Quang Khoi",
            publickey: req.publickey,
            noti: false
        })
    } else {
        const result = await geter(`${req.id}_isData`)
        if (result) {
            var token = JWT.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                id: req.id,
                publickey: req.publickey,
                isData: true
            }, app.get('secret'));
            res.json({
                message: "Success register on blockchain",
                token: token
            })
            return
        }
        res.json({
            message: "Valid token",
            name: "Le Quang Khoi",
            publickey: req.publickey,
            noti: true
        })
    }

})
app.post('/users/register', async function (req, res) {
    try {
        var credential = req.body.email
        const db = client.db("Autheticate")
        const document = await db.collection("accounts").findOne({ credential: credential })
        if (document) {
            var response = {
                message: "Email has been registered"
            }
            res.json(response)
            return
        }
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }
        if (await sendOTP(credential, otp)) {
            const insertOTP = async () => {
                const col = db.collection("OTPcode")
                const doc = { credential: credential, OTP: otp }
                const result = await col.insertOne(doc)
            }
            insertOTP();
            var response = {
                message: "OTP sent"
            }
            const cleanOldDoc = await db.collection("CacheRegister").deleteMany({ credential: credential })        //xoá hết mk cũ trong cache
            const sha256Hash = crypto.createHash('sha256');
            sha256Hash.update(req.body.password);
            var hash_password = sha256Hash.digest('hex');
            const doc = { credential: credential, hash_password: hash_password }
            const result = await db.collection("CacheRegister").insertOne(doc)
        } else {
            var response = {
                message: "OTP not sent"
            }
        }
        res.json(response)
    } catch (e) {
        console.log(e)
    }
})
app.post('/users/register/validateOTP', async function (req, res) {
    try {
        const OTP = req.body.OTP
        const email = req.body.email
        const db = client.db("Autheticate")
        var doc = await db.collection("OTPcode").findOne({ credential: email, OTP: OTP });
        if (doc) {
            await db.collection("OTPcode").deleteMany({ credential: email })
            const cache_doc = await db.collection("CacheRegister").findOne({ credential: email })                  //tìm mật khẩu
            const randomWallet = ethers.Wallet.createRandom();
            const publickey = randomWallet.address;
            const privatekey = randomWallet.privateKey;
            const chars = '0123456789';
            const pin = req.body.pin;
            const encrypt_privatekey = encrypt(privatekey, pin)
            var document = { public_key: publickey, private_key: encrypt_privatekey, credential: email, hash_password: cache_doc.hash_password, isData: false }
            const result = await db.collection("accounts").insertOne(document)
            const find = await db.collection("accounts").findOne({ credential: email })
            var token = JWT.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                id: find._id,
                publickey: publickey,
                isData: false
            }, app.get('secret'));
            var response = {
                message: "Auth ok",
                token: token,
                pin: pin
            }
            await db.collection("CacheRegister").deleteMany({ credential: email })
            const resp = await sendMoney(publickey)
            if (!resp.success) {
                var response = {
                    message: "Some thing is wrong please try again"
                }
            }

        } else {
            var response = {
                message: "OTP is wrong"
            }
        }
        res.json(response)


    } catch (e) {
        console.log(e)
    }
})
app.post('users/resendOTP', async function (req, res) {
    try {
        const email = req.body.email
        const db = client.db("Autheticate")
        const document = await db.collection("OTPcode").findOne({ credential: email })
        if (document) {
            await db.collection("OTPcode").deleteOne({ _id: document._id })
        }
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }
        if (await sendOTP(email, otp)) {
            const insertOTP = async () => {
                const col = db.collection("OTPcode")
                const doc = { credential: email, OTP: otp }
                const result = await col.insertOne(doc)
            }
            insertOTP();
            var response = {
                message: "OTP sent"
            }
        } else {
            var response = {
                message: "OTP not sent"
            }
        }
        res.json(response)
    } catch (e) {
        console.log(e)
    }
})
app.post('/users/login/validateOTP', async function (req, res) {
    try {
        const OTP = req.body.OTP
        const email = req.body.email
        const db = client.db("Autheticate")

        var doc = await db.collection("OTPcode").findOne({ credential: email, OTP: OTP });
        if (doc) {
            const result = await db.collection("accounts").findOne({ credential: email })
            const clean = await db.collection("OTPcode").deleteMany({ credential: email })
            var token = JWT.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                id: result._id,
                publickey: result.public_key,
                isData: result.isData
            }, app.get('secret'));
            var response = {
                message: "Auth ok",
                token: token
            }
        } else {
            var response = {
                message: "OTP is wrong"
            }
        }
        res.json(response)

    } catch (e) {
        console.log(e)
    }
})
app.post('/users/login', async function (req, res) {
    try {
        var credential = req.body.email
        const sha256Hash = crypto.createHash('sha256');
        sha256Hash.update(req.body.password);
        var hash_password = sha256Hash.digest('hex');
        console.log("This is", hash_password);
        const collection = client.db("Autheticate").collection("accounts")
        // const result = await collection.findOne({credential:credential,hash_password:hash_password})
        // res.json(result)
        const document = await collection.findOne({ credential: credential, hash_password: hash_password })
        if (!document) {
            res.json(getErrorMessage('\'credential or password\''))
            return
        }
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }
        const sendStatus = await sendOTP(credential, otp)
        if (sendStatus) {
            const insertOTP = async () => {
                const col = client.db("Autheticate").collection("OTPcode")
                const clean = await client.db("Autheticate").collection("OTPcode").deleteMany({ credential: credential })
                doc = { credential: credential, OTP: otp }
                const result = await col.insertOne(doc)
            }
            insertOTP();
            var response = {
                message: "OTP sent"
            }
        } else {
            var response = {
                message: "OTP not sent"
            }
        }
        res.json(response)
    } catch (er) {
        console.log(er)
    }
});
app.post('/invokeTransaction', async function (req, res) {
    try {
        const db = client.db("Autheticate")
        const id = new ObjectId(req.id)
        const findPrivateKey = await db.collection("accounts").findOne({ _id: id })
        const pin = req.body.pin
        console.log(findPrivateKey)

        if (typeof req.body.args === 'string') {
            req.body.args = JSON.parse(req.body.args);
            console.log("runned============================")
        }
        console.log(req.body.args)
        if (findPrivateKey) {
            const privatekey = decrypt(findPrivateKey.private_key, pin)
            const rs = await callWriteFunction(req.body.func, req.body.args, privatekey)
            console.log(privatekey)
            if (rs.success && req.body.func === "registerCompany") {
                const updateOperation = {
                    $set: {
                        // Update fields and values you want to change
                        isData: true,
                    }
                };
                const result = await db.collection("accounts").updateOne({ _id: id }, updateOperation);
                await seter(`${req.id}_isData`, '1', 3600)
            }
            res.send(rs)
        } else {
            res.json({
                message: "no privatekey"
            })
        }
    } catch (e) {
        res.json({
            message: "some thing is wrong"
        })
    }

})
app.get('/logoutAll', async function (req, res) {
    const id = req.id
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    await seter(`${id}_logout`, currentTimestampInSeconds.toString(), 3600)
    const result = await geter(`${id}_logout`)
    console.log(result, typeof result)
    res.json({
        message: "success"
    })
})
app.get('/ping', function (req, res) {
    res.json({
        message: "pong"
    })
})
// app.test('/test', async function (req, res) {
//     const id = new ObjectId(req.id)
//     const doc = await db.collection("accounts").findOne({ _id: id })
// })
