var express = require('express');
var router = express.Router();

router.use('/', async function(req,res,next){
  console.log("YO PRIMERO");
  next()
});

router.use('/', async function(req,res,next){
  console.log("YO PRIMERO ANTES DEL SEGUNDO PERO DESPUES DEL PRIMERO");
  next()
});

router.get('/', async function(req,res,next){
  console.log("YO SEGUNDO GET")
  let clients = await req.dbMongo.collection("clients").find({}).toArray()
  console.log(req.herramientas.es_email("hola"))
  res.render("index",{title:"Inicio"})
});

router.post('/', async function(req,res,next){
  console.log("YO SEGUNDO POST")
  let clients = await req.dbMongo.collection("clients").find({}).toArray()
  console.log(req.herramientas.es_email("hola"))
  res.render("index",{title:"Inicio"})
});

router.put('/', async function(req,res,next){
  console.log("YO SEGUNDO PUT")
  let clients = await req.dbMongo.collection("clients").find({}).toArray()
  console.log(req.herramientas.es_email("hola"))
  res.render("index",{title:"Inicio"})
});


module.exports = router;
