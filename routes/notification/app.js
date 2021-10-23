var express = require('express');
var router = express.Router();
let crypto = require('crypto');
const fetch = require("node-fetch")

class FBExpressRequest {

  constructor(props={},db){
    this.props = {
      PartnerID: props.PartnerID || "",
      APIClientID: props.APIClientID || "",
      APIClientSecret: props.APIClientSecret || "",
      SharedSecret: props.SharedSecret || "",
      Sandbox: (props.Sandbox===true)
    }
    this.db = db
    this.calculaHMAC = this.calculaHMAC.bind(this)
    this.calculaAccessToken = this.calculaAccessToken.bind(this)
    this.generaID = this.generaID.bind(this)
    this.generateRequestData = this.generateRequestData.bind(this)
  }

  calculaHMAC(timestamp){
    return crypto.createHmac('sha256', this.props.SharedSecret).update(`${timestamp}${this.props.PartnerID}`).digest('hex');
  }

  calculaAccessToken(){
    return `XWF|${this.props.APIClientID}|${this.props.APIClientSecret}`
  }

  generaID(seed){
    let horaActual = (new Date()).getTime()
    let rand = parseInt(Math.random() * 89 + 10)
    return `${horaActual}${rand}`
  }

  generateRequestData(data={}){
     let horaActual = parseInt(((new Date()).getTime())/1000)
     return {
       timestamp: horaActual,
       hmac: this.calculaHMAC(horaActual),
       access_token: this.calculaAccessToken(),
       paid_amount:(data.monto || 0),
       transaction_id: this.generaID(),
       retailer_phone: `+${(String(data.retailer || "")).replace("+","")}`,
       dry_run: this.props.Sandbox,
       extra:"Recarga Exitosa"
     }
  }
}

class PayValidaObjeto{
  constructor(props){
    this.props = {
      merchantID: props.merchantID || "",
      client_secret: props.client_secret || "",
      notification_secret: props.notification_secret || ""
    }
    this.pv_checksum = this.pv_checksum.bind(this)

  }

  pv_checksum(data={}){
    let po_id = data.po_id || ""
    let status = data.status || ""
    // console.log("PVCSCalculado",String(crypto.createHash('sha256').update(`${po_id}${status}${this.props.notification_secret}`).digest('hex')))
    // console.log("HASHED PRE",`${po_id}${status}${this.props.notification_secret}`)
    return String(crypto.createHash('sha256').update(`${po_id}${status}${this.props.notification_secret}`).digest('hex'));
  }
}

router.use("/test",function (req,res,next){
  res.send("OK")
})

router.use("/pv",async function (req,res,next){
  let procesar = false
  if(req.body.pv_po_id!==undefined && req.body.po_id!==undefined && req.body.status!==undefined && req.body.status==="approved"){
    let existeDuplicado = await req.dbMongo.collection("pv_check_processed").find({
      "pv_po_id": req.body.pv_po_id,
      "po_id": req.body.po_id,
      "status": req.body.status
    }).toArray()
    if(existeDuplicado.length<=0){
      let nuevoRegistro =  JSON.parse(JSON.stringify(req.body))
      nuevoRegistro.fecha = (new Date()).getTime()
      let InsertadoLog = await req.dbMongo.collection("pv_check_processed").insertOne(nuevoRegistro)
      procesar = true
    }
  }
  if(procesar===true){
    let pagoInfo = {
      recibidoPV:JSON.parse(JSON.stringify(req.body || {})),
      enviadoXPP:{},
      recibidoXPP:{},
      beneficiario:{},
      descripcion:"Error desconocido",
      fecha:(new Date()).getTime()
    }
    let continuar = true
    let PVObjeto = new PayValidaObjeto(req.configuraciones.payvalida)
    let anexoChecksumLog = ""
    if(PVObjeto.pv_checksum(req.body)!==String(req.body.pv_checksum || "")){
     continuar = false
     pagoInfo.descripcion = "No se pudo verificar el Checksum de la notificacion de PayValida. Posible intento de injeccion. Calculado: " + PVObjeto.pv_checksum(req.body)
    }

    pagoInfo.beneficiario = false

    if(continuar===true){
      let pv_po_id = ((String(req.body.po_id)).split("_"))[0]
      let orden_destino = await req.dbMongo.collection("clients").find({pv_po_id:pv_po_id}).toArray()
      if(orden_destino.length>0){
        pagoInfo.beneficiario = orden_destino[0]
      }else{
        continuar = false
        pagoInfo.descripcion = "No se encuentra el numero de Orden de PayValida Registrado en Clientes"
      }
    }
    let XPPObject = {}
    if(continuar===true){
      XPPObject = new FBExpressRequest(req.configuraciones.fbxpp)
      pagoInfo.enviadoXPP.variables =  XPPObject.generateRequestData({
        monto: ( !(isNaN(parseFloat(req.body.amount))))?Math.floor(parseFloat(req.body.amount)):0,
        retailer: pagoInfo.beneficiario.xpp_retailer_phone || "",
      })
      let llaves = Object.keys(pagoInfo.enviadoXPP.variables)
      pagoInfo.enviadoXPP.url = "https://graph.expresswifi.com/retailer_recharge?"
      for(xll=0;xll<llaves.length;xll++){
        pagoInfo.enviadoXPP.url+=`${(xll>0)?"&":""}${llaves[xll]}=${encodeURIComponent(pagoInfo.enviadoXPP.variables[llaves[xll]])}`
      }
      if(pagoInfo.enviadoXPP.variables.paid_amount<=0 || pagoInfo.enviadoXPP.variables.retailer_phone.length<=1){
        continuar = false
        pagoInfo.descripcion = "Los parametros a enviar a XPP (paid_amount y/o retailer_phone) no son validos"
      }
    }

    if(continuar===true){
      let response = {}
      try{
        response = await fetch(pagoInfo.enviadoXPP.url,{
          method: "POST"
        })
      }catch(e){
        pagoInfo.descripcion = `Hubo un problema con la petición a XPP`
        pagoInfo.recibidoXPP = e
        continuar = false
        response = {}
      }
      if(continuar===true){
        try{
          pagoInfo.recibidoXPP = await response.json()
        }catch(e){
          pagoInfo.recibidoXPP = {}
          pagoInfo.descripcion = `La Respuesta de XPP No es un elemento JSON`
          continuar = false
        }
      }
    }

    if(continuar===true){
      pagoInfo.descripcion = "Proceso Finalizado Exitosamente"
      if(pagoInfo.recibidoXPP.success!==true){
        pagoInfo.descripcion = `El servidor XPP Reporta un Error al Intentar Recargar`
        continuar = false
      }
    }
    pagoInfo.descripcion+=". " + anexoChecksumLog
    if(continuar===true){
      req.dbMongo.collection("payments").insertOne(pagoInfo)
    }else{
      req.dbMongo.collection("payment_errors").insertOne(pagoInfo)
    }
  }

  res.send("OK")
})

module.exports = router;
