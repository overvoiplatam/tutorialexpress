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
  // let clients = await req.dbMongo.collection("clients").find({}).toArray()
  // console.log(req.herramientas.es_email("hola"))
  res.render("index",{title:"Inicio de Sesion"})
});

router.post('/', async function(req,res,next){
  //let clients = await req.dbMongo.collection("clients").find({}).toArray()
  //console.log(req.herramientas.es_email("hola"))
  res.render("iniciandosesion",{title:"Inicio de Sesion",layout:"nuevo",usuario:req.body.username})

});



module.exports = router;
