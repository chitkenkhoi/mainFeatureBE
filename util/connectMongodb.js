
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://chitkenkhoi:teptom0792.@cluster0.iqajlh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
        console.log(e)
    }
}
async function close() {
    try {
        await client.close();
        console.log("Client closed")
    } catch (e) {
        console.log(e)
    }
}
module.exports = { run, client, close }
