const redis = require('redis');
const client = redis.createClient({
    password: process.env.REDIS_TOKEN,
    socket: {
        host: 'redis-10927.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 10927
    }
})

const connectRedis = async () => {
    // kết nối với redis
    await client.connect()

    // xử lý lỗi
    client.on('error', (err) => {
        console.error(`An error occurred with Redis: ${err}`)
    })

    console.log('Redis connected successfully...')
}
const disconnectRedis = async () => {

}
async function seter(key, value, exp) {
    if (exp) {
        await client.SETEX(key, exp, value);
    } else {
        await client.SET(key, value)
    }
}
async function geter(key) {
    const result = await client.get(key)
    return result
}

// async function test() {
//     console.log("connecting")
//     await connectRedis()
//     // console.log("============")
//     // await client.SETEX('key', 10, 'something1');
//     // console.log("============")
//     const result = await client.get('key');
//     console.log(result)
//     console.log("============")
// }
module.exports = { connectRedis, geter, seter };

