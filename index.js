require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require( 'mongodb');
const dns = require('dns')
const urlparser = require('url')

const uri = "mongodb+srv://ustczjy17:VfuN2aLC%402jC_eh@cluster0.o6qjn.mongodb.net/urlshortner?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// 确保连接成功后再进行数据库操作
async function connectToDB() {
  try {
    await client.connect();  // 连接到 MongoDB
    db = client.db("urlshortner");  // 选择数据库
    urls = db.collection("11"); // 选择集合
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// 确保 MongoDB 在启动时就连接
connectToDB();

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname,
async (err , address) => {
  if (!address){
    res.json({error: 'invalid url'})
  }else{

    const urlCount = await urls.countDocuments({})
    const urlDoc = {
      url,
      short_url: urlCount
    }

    const result = await urls.insertOne(urlDoc)
    console.log(result);
    res.json({ original_url: url, short_url: urlCount })
  }
  })
});

app.get("/api/shorturl/:short_url", async (req, res) =>{
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({ short_url: +shorturl })
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});