const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        ' http://localhost:5173',
        'https://food-wave-dba6f.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json())



const uri = "mongodb+srv://food-zone:op5uDwOaApRJ2Gz6@cluster0.35nuqgc.mongodb.net/?retryWrites=true&w=majority";

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
        // await client.connect();

        const foodCollection = client.db('foods-services').collection('featured-foods')
        const availableCollection = client.db('available-foods').collection('foods')
        const requestCollection = client.db('reqCollection').collection('req')



        app.get('/add', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result)
            // console.log(result)
        })

        app.get('/avail', async (req, res) => {
            const cursor = availableCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/avail/:id', async (req,res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await availableCollection.findOne(query)
            res.send(result)
        })

        app.put('/avail/:id', async (req,res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id)}
            const options = {upsert: true}
            const updatedFood = req.body
            const food = {
                $set: {
                    food_name:updatedFood.food_name,
                    image:updatedFood.image,
                    food_quantity:updatedFood.food_quantity,
                    picup_Location:updatedFood.picup_Location,
                    expired_date:updatedFood.expired_date,
                    additional_note:updatedFood.additional_note,
                    donator_img:updatedFood.donator_img,
                    donator_name:updatedFood.donator_name,
                    email:updatedFood.email,
                }
            }
            const result = await availableCollection.updateOne(filter,food,options)
            res.send(result)
        })

        app.post('/request',async (req,res) => {
            const reqFood = req.body
            const result = await requestCollection.insertOne(reqFood)
            res.send(result)
        })

        app.get('/request', async (req,res) => {
            const cursor = requestCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.delete('/request/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await requestCollection.deleteOne(query)
            res.send(result)  
        })

        app.post('/avail', async (req, res) => {
            const newFood = req.body;
            console.log(newFood)

            const result = await availableCollection.insertOne(newFood)
            res.send(result);
        })

        app.delete('/avail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await availableCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})