const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k39mtry.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run(){
try{
    const categoryCollection = client.db('carDealer').collection('category');
    const productsCollection = client.db('carDealer').collection('products');
    const usersCollection = client.db('carDealer').collection('users');  
    // api for category
      app.get('/category', async (req, res) => {
        const query = {};
        const options = await categoryCollection.find(query).toArray();
        res.send(options);
      })

 //get categoryproducts
      app.get('/products/:id', async (req, res) => {
        const id=req.params.id;
        const query = {category_id:ObjectId(id)};
        const options = await productsCollection.find(query).toArray();
        console.log(options)
        res.send(options);
       
      })


   

      

      app.get('/jwt', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        if (user) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            return res.send({ accessToken: token });
        }
        res.status(403).send({ accessToken: '' })
    });
    
    app.get('/users', async (req, res) => {
        const query = {};
        const users = await usersCollection.find(query).toArray();
        res.send(users);
    });

      app.post('/users', async (req, res) => {
        const user = req.body;
        console.log(user);
        const result = await usersCollection.insertOne(user);
        res.send(result);
    });




}
finally{

}
}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('car dealer server is running');
})

app.listen(port, () => console.log(`car dealer running on ${port}`))