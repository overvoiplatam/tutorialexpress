var express = require('express');
var router = express.Router();

router.get('/', async function(req,res,next){
  // let clients = await req.dbMongo.collection("clients").find({}).toArray()
  // console.log(req.herramientas.es_email("hola"))
  res.send("ESTOY AQUI AHORA")
});

router.get('/AAAA', async function(req,res,next){
  // let clients = await req.dbMongo.collection("clients").find({}).toArray()
  // console.log(req.herramientas.es_email("hola"))
  res.send("ESTOY AQUI AHORA Tambien")
});

module.exports = router;
