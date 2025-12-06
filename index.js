const express=require('express');
const cors=require('cors');
require('dotenv').config();
const port=3000;


const app=express();
app.use(cors());
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster.okwqxwh.mongodb.net/?appName=Cluster`;

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
    const database=client.db('petservice');
    const petServices=database.collection('services')
    const orderCollection=database.collection('orders')
   
    // post or add db
    app.post('/services',async(req,res)=>{
      const data=req.body;
      console.log(data);
      const result=await petServices.insertOne(data);
      res.send(result)
    })

    
    // get sevices form db
    // app.get('/services',async(req,res)=>{
    // const result=await petServices.find().toArray();
    // res.send(result)
    // })

//get sevices form db && Category Section
      app.get('/services', async (req, res) => {
      let query = {};
      const category = req.query.category;
// console.log(category);

      if (category) {
    query = { category: { $regex: category, $options: "i" } };
  }
      const result = await petServices.find(query).toArray();
      res.send(result);
    });


    app.get("/services/latest", async (req, res) => {
      const latestServices = await petServices
        .find({})
        .sort({ _id: -1 })  
        .limit(6)           
        .toArray();
      res.send(latestServices);
    });

    app.get('/services/:id',async(req,res)=>{
      const id=req.params.id;
      console.log(id);
      
      const query={_id:new ObjectId(id)}
      const result=await petServices.findOne(query);
      res.send(result)
    })
    app.get('/my-listing',async(req,res)=>{
       const {email}=req.query;
       const query={email:email}
       const result=await petServices.find(query).toArray()
       res.send(result)
      
    })
    app.put('/update/:id',async(req,res)=>{
      const data=req.body;
      const id =req.params;
      const query={_id:new ObjectId(id)}
      const updateService={
        $set:data
      }
      const result=await petServices.updateOne(query,updateService)
      res.send(result)
    })
    app.delete('/delete/:id',async(req,res)=>{
      const id =req.params;
      const query={_id:new ObjectId(id)}
      const result=await petServices.deleteOne(query)
      res.send(result)

    })

    app.post('/orders',async(req,res)=>{
      const data=req.body;
      console.log(data);
      const result=await orderCollection.insertOne(data)
      res.status(201).send(result)
      
    })
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });
    app.get('/my-orders', async (req, res) => {
      const email = req.query.email;
      const orders = await orderCollection.find({ buyerEmail: email }).toArray();
      res.send(orders);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('hello,Developer')
})
app.listen(port,()=>{
    console.log(`sever is running on ${port}`);
    
})
