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
    await client.set('check', '1')
    const result = await client.get('check');
    console.log(result)
    console.log("============")
    await client.quit()
    console.log("closed")
}
test();