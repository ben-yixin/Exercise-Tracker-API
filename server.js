const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = process.env.PORT || 3000
mongoose.connect(process.env.URI ,{useNewUrlParser:true,useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
const exerciseSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date}
})
const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique:true},
  log: [exerciseSchema]
})


const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

const createUser = (user) =>{
  User.create({username: user}, (err,data)=>{
    console.log(data)
    if(err) console.log(err)
  })
}

app.post('/api/users',(req,res)=>{
    const user = req.body.username
    console.log(user)
    User.create({username: user}, (err,data)=>{
      console.log(data)
      if(err) console.log(err)
      res.json({username: user, _id: data._id})
  })
})

app.get('/api/users',(req,res)=>{
  User.find({}, (err,data)=>{
    if(err) console.log(err)

    var userArr = [];

    data.forEach((user)=>{
      var obj = {};
      obj[user._id] = user.username
      userArr.push(obj);
    })
    console.log(userArr)
    res.json(userArr)
  })
})

app.post('/api/users/:_id/exercises',(req,res)=>{
  let userID = req.params._id;
  if(req.body.date == ''){
    let date = new Date()
    req.body.date = date.toDateString()
  };
  User.findByIdAndUpdate(userID, {$push: {log:[req.body]}}, {new: true}, (err,data)=>{
    if(err) console.log(err)
    let responseObj = {};
    responseObj['_id'] = data._id;
    responseObj['username'] = data.username;
    responseObj['date'] = new Date().toDateString();
    responseObj['duration'] = req.body.duration;
    responseObj['description'] = req.body.description;
    console.log(data)
    console.log(responseObj)
    res.json(responseObj)
  })
})

app.get('/api/users/:_id/logs', (req,res)=>{
  let userID = req.params._id;
  User.findById(userID, (err,data)=>{
    if(err) console.log(err)
    res.json({exercises: data.log, count: data.log.length})
  })
})

app.get('/api/users/:id/logs', (req,res)=>{
  let userID = req.params.id;
  User.findById(userID, (err,data)=>{
    if(err) console.log(err)
    res.json({exercises: data.log, count: data.log.length})
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
