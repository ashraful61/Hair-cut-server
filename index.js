const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clustertestashraf.z94m9ys.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


// function verifyJwtToken(req, res, next){
//   const authHeader = req.headers.authorization;

//   if(!authHeader){
//       return res.status(401).send({message: 'unauthorized access'});
//   }
//   const token = authHeader.split(' ')[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
//       if(err){
//           return res.status(403).send({message: 'Forbidden access'});
//       }
//       req.decoded = decoded;
//       next();
//   })
// }

const run = async () => {
  try {
    const db = client.db("hairCut");
    const serviceCollection = db.collection("services");
    const reviewCollection = db.collection("reviews");


   //Post jwt api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    
    //Get all services or specific item
    app.get("/services", async (req, res) => {
      const query = {}
      if(req?.query?.limit) {
       const cursor = serviceCollection.find(query);
       const services = await cursor.limit(3).toArray();
       res.send(services);
      }
      else {
       const cursor = serviceCollection.find(query);
       const services = await cursor.toArray();
       res.send(services);
      }
    });

    //Get service by id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //Post services
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });



    //Orders API

    app.get("/orders",  async (req, res) => {
      const decoded = req.decoded;
      if(decoded.email !== req.query.email) {
        res.status(403).send({message: 'Unauthorized access'})
      }
      // console.log('inside orders', decoded );
      let query = {};
      if (req?.query?.email) {
        query = {
          email: req?.query?.email,
        };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.post("/orders",  async (req, res) => {
    
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.patch("/orders/:id",  async (req, res) => {
    
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const status = req.body.status;
      const updatedOrder = {
        $set: {
          status: status,
        },
      };
      const result = await orderCollection.updateOne(query, updatedOrder);
      res.send(result);
    });

    app.delete("/orders/:id",  async (req, res) => {
   
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Car mechanic server is running");
});

app.listen(port, () => {
  console.log(`Car mechanic server running on port:${port}`);
});
