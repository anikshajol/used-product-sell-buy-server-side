const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d1298ft.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productsCollection = client.db("sbSwap").collection("products");
    const usersCollection = client.db("sbSwap").collection("users");
    const categoryCollection = client.db("sbSwap").collection("category");

    // get products
    app.get("/products", async (req, res) => {
      const query = {};
      const options = await productsCollection.find(query).toArray();
      res.send(options);
    });

    // app.get("/category/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { ObjectId: _id };
    //   const category = await categoryCollection.find(query);
    // });
    app.get("/category", async (req, res) => {
      const query = {};
      const options = await categoryCollection.find(query).toArray();
      res.send(options);
    });

    // app.get("/category/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const category = await bookingsCollection.findOne(query);
    //   res.send(category);
    // });

    // save user info

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      console.log(token);
      res.send({ result, token });
    });
    console.log("database connected");
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("sbSwap Server is running...");
});

app.listen(port, () => {
  console.log(`sbswap Server is running...on ${port}`);
});
