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

const products = require("./data/products.json");

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d1298ft.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// start

app.get("/category/:id", (req, res) => {
  const id = req.params.id;
  const category_phone = products.filter((n) => n.category_id == id);
  console.log(category_phone);
  res.send(category_phone);
});

// end

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

    app.get("/category", async (req, res) => {
      const query = {};
      const options = await categoryCollection.find(query).toArray();
      res.send(options);
    });

    // app.get("/category/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const category_phone = await productsCollection.find(filter);
    //   console.log(category_phone);
    //   res.send(category_phone);
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

    // booking

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        buying: booking.appointmentDate,
        email: booking.email,
        treatment: booking.treatment,
      };

      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `You already have a booking on ${booking.appointmentDate}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
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
