const redis = require('redis');

const client = redis.createClient({
    password: '0kmmtS5zzWqOuMRi77UiRmscBEzasrmC',
    socket: {
        host: 'redis-10927.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 10927
    }
});
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
    try {
        await client.disconnect();
        console.log("disconnected")
    } catch (e) {
        console.log(e)
    }


}
const test = async () => {
    await connectRedis()
    // await client.set("test", "value")
    const result = await client.get("a")
    console.log(result)
    await disconnectRedis();
}


test();
