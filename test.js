const redis = require('redis');
const client = redis.createClient({
    socket: {
        host: "127.0.0.1",
        port: "6379"
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

async function test() {
    console.log("connecting")
    await connectRedis()
    // console.log("============")
    // await client.SETEX('key', 10, 'something1');
    // console.log("============")
    const result = await client.get('key');
    console.log(result)
    console.log("============")
}
test();