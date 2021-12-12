var express = require('express');
var router = express.Router();

router.use('/', async function(req,res,next){

  res.render('cartas',{layout:"trampa"})

});


module.exports = router;
