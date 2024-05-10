const { expressjwt: expressJwt } = require('express-jwt');

function authJwt() {
    const secret = "thisismysecret";
    return console.log(
        expressJwt({
            secret,
            algorithms: ["HS256"],
        }).unless({
            path: ['/users/login', '/users/register', '/users/login/validateOTP', '/users/register/validateOTP', 'users/resendOTP']
        })
    );
}

module.exports = authJwt;