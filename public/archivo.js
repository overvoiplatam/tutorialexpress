const ArregloSimulado = [
  {
    title:"Titulo 01",
    contenido:"Contenido del Texto 01"
  },
  {
    title:"Titulo 02",
    contenido:"Contenido del Texto 02"
  },
  {
    title:"Titulo 03",
    contenido:"Contenido del Texto 03"
  }
]

function dibujaObjeto(objeto){
  const container = document.createElement("div");
  container.style.color = "white"

  const divTitulo = document.createElement("h1");
  divTitulo.innerHTML = objeto.title;
  divTitulo.style.backgroundColor = "black"
  divTitulo.addEventListener("click",e=>{
    alert(objeto.title)
  })
  container.appendChild(divTitulo)

  const divParrafo = document.createElement("p");
  divParrafo.innerHTML = objeto.contenido;
  divParrafo.style.backgroundColor = "#d2d2d2"
  divParrafo.classList.add("active")
  container.appendChild(divParrafo)

  document.getElementById("ResultadoFinal").appendChild(container);
  objeto.rendered = true
}

function copyObjeto(objeto){
  return JSON.parse(JSON.stringify(objeto))
}

function dibujaTodo(){
  document.getElementById("ResultadoFinal").innerHTML = ""
  ArregloSimulado.forEach(dibujaObjeto);
}

function dibujaTodoRemoto(Arreglo){
  document.getElementById("ResultadoFinal").innerHTML = ""
  Arreglo.forEach(dibujaObjeto);
}


async function consultaExterna(){
  document.getElementById("ResultadoFinal").innerHTML = "Cargando del servidor..."
  const RespuestaServidor = await fetch("/cards")
  //const RespuestaServidor = await fetch("http://localhost:3001/cards")
  const RespuestaBodyJSON = await RespuestaServidor.json()
  // console.log(RespuestaBodyJSON)
  dibujaTodoRemoto(RespuestaBodyJSON)
}

async function consultaExternaXML(){
  document.getElementById("ResultadoFinal").innerHTML = "Cargando del servidor..."
  const RespuestaServidor = await fetch("/cards/fakexml")
  //const RespuestaServidor = await fetch("http://localhost:3001/cards")
  const RespuestaBodyTexto = await RespuestaServidor.text()
  document.getElementById("ResultadoFinal").innerHTML = RespuestaBodyTexto
}



const botonAccion = document.createElement("button")
botonAccion.innerHTML = "Crear Contenido Remoto"
botonAccion.addEventListener("click",consultaExterna)

document.body.appendChild(botonAccion)

const botonAccion2 = document.createElement("button")
botonAccion2.innerHTML = "Crear Contenido"
botonAccion2.addEventListener("click",dibujaTodo)

document.body.appendChild(botonAccion2)

const botonAccion3 = document.createElement("button")
botonAccion3.innerHTML = "Crear Contenido Remoto XML"
botonAccion3.addEventListener("click",consultaExternaXML)

document.body.appendChild(botonAccion3)




// for(let x=0;x<ArregloSimulado.length;x++){
//   dibujaObjeto(ArregloSimulado[x])
// }
