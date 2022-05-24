const express = require('express')
const cors = require('cors')
const stripe = require('stripe')("sk_test_51L1AeqHfb8VoLvD9wkDKJ6BbEPBkhJtUouDuHb6hPR1jbPBfVjA41sQaCjQAihLzlhjzm6tivmNJ2slGO68s6H7m00K7WEcjF5")
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgfkb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()

        // all collection
        const userCollection = client.db('assignment12').collection('user')
        const partsCollection = client.db('assignment12').collection('parts')
        const reviewsCollection = client.db('assignment12').collection('reviews')
        const ordersCollection = client.db('assignment12').collection('orders')

        // all get api
        app.get('/parts', async (req, res) => {
            const parts = await partsCollection.find().toArray()
            res.send(parts)
        })

        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const reviews = (await reviewsCollection.find().toArray()).reverse()
            res.send(reviews)
        })

        app.get('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const singleOrder = await ordersCollection.findOne(query)
            res.send(singleOrder)
        })

        app.get('/myOrders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query)
            const myOrders = await cursor.toArray()
            res.send(myOrders)
        })


        // all post api
        app.post('/reviews', async (req, res) => {
            const newReviews = req.body;
            const result = await reviewsCollection.insertOne(newReviews);
            res.send(result);
        })

        app.post('/orders', async (req, res) => {
            const newOrders = req.body;
            const result = await ordersCollection.insertOne(newOrders)
            res.send(result)
        })

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body
            const amount = price * 100
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({ clientSecret: paymentIntent.client_secret })
        })

        // all delete api
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })

        // all put api
        app.put('/user/:email', async (req, res) => {
            const user = req.body
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true }

            const updateDoc = {
                $set: user,
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })



    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('running assignment 12 server')
})
app.listen(port, () => {
    console.log("Listening to port", port);
})