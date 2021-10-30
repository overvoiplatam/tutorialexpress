var validator = require("email-validator");
const ObjectID = require('mongodb').ObjectID;
var fs = require("fs");
var path = require("path");
const validUrl = require('valid-url');
var funciones = {};
const escapeStringRegexp = require('escape-string-regexp');

funciones.padFecha= function (n) { return n < 10 ? '0' + n : n }


funciones.fechaYMD = function(date){
  return date.getFullYear().toString() + "/" + padFecha(date.getMonth() + 1) + "/"  + padFecha( date.getDate()) + " "  + padFecha( date.getHours() ) + ":"  + padFecha( date.getMinutes() ) + ":" + padFecha( date.getSeconds() )
}


funciones.toMongoID = async function(sting){
  var new_id = await new ObjectID(sting);
  return new_id;
}

funciones.capitaliza= function (origen){
  let string = String(origen)
  return string[0].toUpperCase() + string.slice(1);
}


funciones.validUrl=validUrl;

funciones.asyncForEach = async function (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

funciones.rmdir = function(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            funciones.rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};
funciones.escapaRegex = escapeStringRegexp;

funciones.es_email = function(cadena){
  return validator.validate(cadena);
}

funciones.md5 = require('md5');

funciones.genera_usuario= function (largo=12) {
    var charset = "0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < largo; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

funciones.genera_token= function (largo=10) {
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < largo; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
funciones.genera_randomMAC= function (largo=24) {
    var charset = "abcdef0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < largo; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}



funciones.genera_password= function (largo=10) {
    var charset = "abcdefghijklmnopqrstuvwxyz_[]#-()ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < largo; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}


funciones.estrue= function (valor){
  if(valor!=="true" && valor!==true){
    return false;
  }else{
    return true;
  }

}
funciones.is_mid= function (input){
  var texto = String(input).replace(/\W/g, '');
  if(typeof(texto)!='string' ||   (texto.length!=12 && texto.length!=24)  || ObjectID.isValid(texto)!==true ){
    return false;
  }else{
    return true;
  }
}

funciones.es_hex = function (input) {
//  var a = parseInt(h,16);
//  return (a.toString(16) ===h.toLowerCase())
  var texto = String(input).replace(/[^0-9ABCDEFabcdef]/g, '');
  if(typeof(texto)!='string' ||   (texto.length<2)   ){
    return false;
  }else{
    return true;
  }
}

funciones.aMacMig = function(input){
  var base = input.toLowerCase();

  var texto = String(base).replace(/[^0-9ABCDEFabcdef]/g, '');
  return texto
}

funciones.es_token = function (input){

  if(typeof(input)!=='string' ){
    return false;
  }else{
    var texto =  String(input).replace(/[^0-9A-Za-z_]/g, '');
    if(String(texto)!== String(input)  || String(input).length<=0  ){
      return false;
    }else{
      return true;
    }

  }
}

funciones.tiene_texto = function (input){

  if(typeof(input)!=='string' ){
    return false;
  }else{
    var texto =  String(input).replace(/[^0-9A-Za-z]/g, '');
    if(String(texto).length<=0  ){
      return false;
    }else{
      return true;
    }

  }
}





module.exports = funciones;
