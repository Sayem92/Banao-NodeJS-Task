const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const usersCollection = client.db("BanaoNodeJobTask").collection("Users");

        //user registration ---------
        app.put('/registration', async (req, res) => {
            const user = req.body
            const email = user.email
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }

            const result = await usersCollection.updateOne(filter, updateDoc, options);

            if (result.matchedCount === 1) {
                return res.status(400).send({ message: "User already exist!!" });
            }
            if (result.matchedCount === 0) {
                return res.status(200).send({ message: "User registered successfully." });
            }

        });

        //user login ---------
        app.get('/login', async (req, res) => {
            const user = req.body
            const email = user.email
            const password = user.password
            const query = { email: email, password: password }
            const result = await usersCollection.findOne(query);

            if (result?.email === email && result?.password === password) {
                return res.status(200).send({ message: 'User Login successful' });
            }
            else {
                return res.status(404).send({ message: 'User email are password not matching' });
            }
        });


        //forgot password ---------
        app.put('/forgot-password', async (req, res) => {
            const user = req.body
            const email = user.email
            const password = user.password

            const userEmail = await usersCollection.findOne({ email: email });

            if (userEmail.email === email) {

                const filter = { email: email }
                const options = { upsert: true }
                const updateDoc = {
                    $set: {
                        password: password
                    }
                }
                const result = await usersCollection.updateOne(filter, updateDoc, options);

                return res.status(200).send({ message: "User password changed successfully" });

            }
            else {
                return res.status(404).send({ message: "User account are not found" });
            }

        });



    }
    finally {

    }
}

run().catch(err => console.log(err))


app.get('/', async (req, res) => {
    res.send('Banao NodeJs task server is running');
})

app.listen(port, () => console.log(`Banao NodeJs task running on ${port}`))



