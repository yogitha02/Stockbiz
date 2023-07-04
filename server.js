const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('request');

const app = express();
const port = 6000;

// Connect to your MongoDB database using Mongoose
const MONGODB_URI = 'mongodb://127.0.0.1/stockmarket';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define a schema for your user data
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Create a Mongoose model for your user data based on the schema
const User = mongoose.model('User', userSchema);
// your_secret_key = 'ftdegyhjioedgyhjnwei'
// JWT secret key
const jwtSecretKey = 'ftdegyhjioedgyhjnwei';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('htmlfiles'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.get('/news', (req, res) => {
  res.sendFile(__dirname + '/htmlfiles/news.html');
});

app.get('/education', (req, res) => {
  res.sendFile(__dirname + '/htmlfiles/education.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document using the Mongoose model
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    // Save the new user document to your database
    await newUser.save();
    res.redirect('/news');
    // res.json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user document that matches the email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password matches using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Authentication successful, create a JWT token
      const token = jwt.sign({ userId: user._id }, jwtSecretKey, { expiresIn: '1h' });

      // Return the token in the response
      // res.json({ token });
      res.redirect(`/news?token=${token}`);

    } else {
      // Authentication failed, show error message
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Define Article schema
const articleSchema = new mongoose.Schema({
  title: String,
  subHeading: String,
  author: String,
  content: String,
  time: String,
});

// Create Article model
const Article = mongoose.model("Article", articleSchema);


// Route to store a new article
// Route to store a new article
app.post("/articles", async (req, res) => {
  try {
    const articleData = req.body;

    // Create a new Article instance
    const article = new Article(articleData);

    // Save the article to the database
    await article.save();

    res.status(201).json(article);
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).send("Error saving article");
  }
});


// Route to get all articles
// Fetch articles
app.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// this is start
// Route to get articles for a specific stock
// app.get("/articles", async (req, res) => {
//   try {
//     const selectedStock = req.query.stock;

//     // Create a query object to filter articles based on the selected stock
//     const query = selectedStock ? { stock: selectedStock } : {};

//     const articles = await Article.find(query);
//     res.json(articles);
//   } catch (error) {
//     console.error("Error fetching articles:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
 