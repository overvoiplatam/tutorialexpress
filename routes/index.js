var express = require('express');
var router = express.Router();



router.get('/', async function(req,res,next){
  let clients = await req.dbMongo.collection("clients").find({}).toArray()
  res.render("index",{title:"Inicio"})
});


module.exports = router;
