var express = require('express');
var router = express.Router();

function padFecha(n) { return n < 10 ? '0' + n : n }


function fechaYMD(date){
  return date.getFullYear().toString() + "/" + padFecha(date.getMonth() + 1) + "/"  + padFecha( date.getDate()) + " "  + padFecha( date.getHours() ) + ":"  + padFecha( date.getMinutes() ) + ":" + padFecha( date.getSeconds() )
}

router.get('/listClients', async function(req,res,next){
  let clients = await req.dbMongo.collection("clients").find({}).toArray()
  res.send(JSON.stringify({
    tipo:"success",
    mensaje:"Solicitud Recibida",
    data:clients
  }))
});

router.get('/csvClients', async function(req,res,next){
  let clients = await req.dbMongo.collection("clients").find({}).toArray()
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="retailer.csv');
  let archivo = `"ID","Nombre","ID PayValida","Telefono de Retailer"`
  clients.forEach((cliente) => {
    archivo+=`\n"${(String(cliente._id)).replace(/"/g, "'")}","${(String(cliente.name)).replace(/"/g, "'")}","${(String(cliente.pv_po_id)).replace(/"/g, "'")}","${(String(cliente.xpp_retailer_phone)).replace(/"/g, "'")}"`
  });
  res.send(archivo)
});

router.get('/deleteClients/:id', async function(req,res,next){
  let id = false
  try{
    id = await req.herramientas.toMongoID(req.params.id)
  } catch(error){
    console.log(error)
    id = false
  }
  if(id!==false){
    let clients = await req.dbMongo.collection("clients").deleteMany({_id:id})
  }
  res.send(JSON.stringify({
    tipo:"success",
    mensaje:"Solicitud Procesada",
    data:"OK"
  }))

});


router.post('/addClients', async function(req,res,next){

  let respuesta = {
    tipo:"error",
    mensaje:"Error desconocido",
    data:""
  }

  let defecto = {
    "name":req.body.name || "",
    "pv_po_id":req.body.pv_po_id || "",
    "xpp_retailer_phone":req.body.xpp_retailer_phone || ""
  }

  let prueba = Object.keys(defecto)
  let ok = true

  for(x=0;x<prueba.length;x++){
    if(defecto[prueba[x]] === ""){
      ok = false
      if(prueba[x]==="name"){
        respuesta.mensaje = "No ha escrito ningun nombre"
      }
      if(prueba[x]==="pv_po_id"){
        respuesta.mensaje = "No ha colocado un Identificación de la orden del comercio de PayValida"
      }
      if(prueba[x]==="xpp_retailer_phone"){
        respuesta.mensaje = "No ha colocado un Numero de Retailer de XPP"
      }
    }
  }

  if(ok===true){
    let nuevo = await req.dbMongo.collection("clients").insertOne(defecto)
    respuesta.tipo = "success"
    respuesta.mensaje = "Registro Creado"
  }

  res.send(JSON.stringify(respuesta))

});


router.use('/editClients/:id',  async function(req,res,next){

  let respuesta = {
    tipo:"error",
    mensaje:"Error desconocido",
    data:""
  }

  let defecto = {
    "name":req.body.name || "",
    "pv_po_id":req.body.pv_po_id || "",
    "xpp_retailer_phone":req.body.xpp_retailer_phone || ""
  }

  let prueba = Object.keys(defecto)
  let ok = true

  for(x=0;x<prueba.length;x++){
    if(defecto[prueba[x]] === ""){
      ok = false
      if(prueba[x]==="name"){
        respuesta.mensaje = "No ha escrito ningun nombre"
      }
      if(prueba[x]==="pv_po_id"){
        respuesta.mensaje = "No ha colocado un Identificación de la orden del comercio de PayValida"
      }
      if(prueba[x]==="xpp_retailer_phone"){
        respuesta.mensaje = "No ha colocado un Numero de Retailer de XPP"
      }
    }
  }

  if(ok===true){
    let id = false
    try{
      id = await req.herramientas.toMongoID(req.params.id)
    } catch(error){
      console.log(error)
      id = false
    }
    if(id!==false){
      await req.dbMongo.collection("clients").updateMany({_id:id},{$set:defecto})
      respuesta.tipo = "success"
      respuesta.mensaje = "Registro Modificado"
    }else{
      respuesta.mensaje = "Registro no existe"
    }
  }

  res.send(JSON.stringify(respuesta))

});



router.use('/listPayments/:id', async function(req,res,next){
  let respuesta = {
    tipo:"error",
    mensaje:"Solicitud Recibida",
    data:{}
  }
  let id = false
  try{
    id = await req.herramientas.toMongoID(req.params.id)
  } catch(error){
    console.log(error)
    id = false
  }
  if(id!==false){
    respuesta.data = await req.dbMongo.collection("payments").findOne({_id:id})
    respuesta.tipo = "success"
    respuesta.mensaje = "Registro Encontrado"
  }else{
    respuesta.mensaje = "Registro no existe"
  }
  res.send(JSON.stringify(respuesta))
});

router.use('/listPayments', async function(req,res,next){
  let clients = await req.dbMongo.collection("payments").find({}).toArray()
  res.send(JSON.stringify({
    tipo:"success",
    mensaje:"Solicitud Recibida",
    data:clients
  }))
});

router.get('/csvPayments', async function(req,res,next){
  let pagos = await req.dbMongo.collection("payments").find({}).toArray()
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="payments.csv');
  let archivo = `"ID","Fecha","Nombre Retailer","ID PayValida","Telefono de Retailer","ID Transaccion PayValida","Estado de Transaccion PayValida","Monto PayValida","Moneda PayValida","PayValida Tipo de Pago","ID Transaccion XPP","Monto Enviado XPP"`
  pagos.forEach((pago) => {
    archivo+="\n"
    archivo+=`"${(String(pago._id)).replace(/"/g, "'")}",`
    archivo+=`"${(String(fechaYMD(new Date(pago.fecha)))).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.beneficiario.name)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.beneficiario.pv_po_id)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.beneficiario.xpp_retailer_phone)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.pv_po_id)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.status)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.amount)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.iso_currency)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.pv_payment)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.enviadoXPP.variables.transaction_id)).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.enviadoXPP.variables.paid_amount)).replace(/"/g, "'")}"`
  });
  res.send(archivo)
});



router.use('/listErrors/:id', async function(req,res,next){
  let respuesta = {
    tipo:"error",
    mensaje:"Solicitud Recibida",
    data:{}
  }
  let id = false
  try{
    id = await req.herramientas.toMongoID(req.params.id)
  } catch(error){
    console.log(error)
    id = false
  }
  if(id!==false){
    respuesta.data = await req.dbMongo.collection("payment_errors").findOne({_id:id})
    respuesta.tipo = "success"
    respuesta.mensaje = "Registro Encontrado"
  }else{
    respuesta.mensaje = "Registro no existe"
  }
  res.send(JSON.stringify(respuesta))
});


router.use('/listErrors', async function(req,res,next){
  let clients = await req.dbMongo.collection("payment_errors").find({}).toArray()
  res.send(JSON.stringify({
    tipo:"success",
    mensaje:"Solicitud Recibida",
    data:clients
  }))
});

router.get('/csvErrors', async function(req,res,next){
  let pagos = await req.dbMongo.collection("payment_errors").find({}).toArray()
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="payment_errors.csv');
  let archivo = `"ID","Fecha","Nombre Retailer","ID PayValida","Telefono de Retailer","ID Transaccion PayValida","Estado de Transaccion PayValida","Monto PayValida","Moneda PayValida","PayValida Tipo de Pago","ID Transaccion XPP","Monto Enviado XPP","Detalles del Error"`
  pagos.forEach((pago) => {
    archivo+="\n"
    archivo+=`"${(String(pago._id)).replace(/"/g, "'")}",`
    archivo+=`"${(String(fechaYMD(new Date(pago.fecha)))).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.beneficiario.name || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.beneficiario.pv_po_id || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.beneficiario.xpp_retailer_phone || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.pv_po_id || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.status || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.amount || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.iso_currency || "")).replace(/"/g, "'")}",`
    archivo+=`"${(String(pago.recibidoPV.pv_payment || "")).replace(/"/g, "'")}",`
    if(pago.enviadoXPP.variables){
      archivo+=`"${(String(pago.enviadoXPP.variables.transaction_id)).replace(/"/g, "'")}",`
      archivo+=`"${(String(pago.enviadoXPP.variables.paid_amount)).replace(/"/g, "'")}"`
    }else{
      archivo+=`"",""`
    }
    archivo+=`,"${(String(pago.descripcion || "")).replace(/"/g, "'")}"`
  });

  res.send(archivo)
});


module.exports = router;
