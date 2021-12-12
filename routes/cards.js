var express = require('express');
var router = express.Router();

router.use('/fakexml', async function(req,res,next){

  const NumeroInicial = (new Date()).getTime()
  const ArregloCosos = []
  for(let x=0;x<10;x++){
    ArregloCosos.push(
      {
        title:`Titulo "HOla" 0${x} - ${NumeroInicial+x}`,
        contenido:`Contenido del Texto 0${x} - ${NumeroInicial+x}`
      }
    )
  }
  setTimeout(()=>{
    res.send(ArregloCosos.map(o=>{
      return `
        <div>
          <h1>${o.title}</h1>
          <p>${o.contenido}</p>
        </div>
      `
    }).join(''))
  },1000)


});

router.use('/:id', async function(req,res,next){

  const NumeroInicial = (new Date()).getTime()
  const ArregloCosos = []
  for(let x=0;x<10;x++){
    ArregloCosos.push(
      {
        title:`${req.params.id} Titulo "HOla" 0${x} - ${NumeroInicial+x}`,
        contenido:`${req.params.id} Contenido del Texto 0${x} - ${NumeroInicial+x}`
      }
    )
  }
  setTimeout(()=>{
    res.send(JSON.stringify(ArregloCosos))
  },1000)


});


router.use('/', async function(req,res,next){

  const NumeroInicial = (new Date()).getTime()
  const ArregloCosos = []
  for(let x=0;x<10;x++){
    ArregloCosos.push(
      {
        title:`Titulo 0${x} - ${NumeroInicial+x}`,
        contenido:`Contenido del Texto 0${x} - ${NumeroInicial+x}`
      }
    )
  }
  setTimeout(()=>{
    res.send(JSON.stringify(ArregloCosos))
  },1000)


});


module.exports = router;
