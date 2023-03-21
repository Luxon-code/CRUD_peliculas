let lista = []
$(function() {
    $("#tblPeliculas").DataTable()
    $("#fileImagen").on("change",validarFoto)
})
async function agregarPelicula(){
    if (validarDatos()){
        const url = '/agregar'
        const datos = new FormData(document.getElementById("frmPelicula"))
        const response = await
            fetch(url,{method: "POST", body: datos})
        const respuesta = await response.json()
        console.log(respuesta)
        if(respuesta.estado){
            Swal.fire("Registro Pelicula",respuesta.mensaje,"success")
            lista = respuesta.listaPeliculas
            listarPeliculas()
            limpiar()
        }else{
            Swal.fire("Registro Pelicula",respuesta.mensaje,"warning")
        }
    }else{
        Swal.fire("Registro Pelicula","faltan datos","warning")
    }
}
function validarDatos(){
    codigo =  document.getElementById("txtCodigo")
    titulo = document.getElementById("txtTitulo")
    duracion = document.getElementById("txtDuracion")
    director = document.getElementById("txtDirector")
    fechaLanzamiento = document.getElementById("txtFechaLanzamiento")
    resumen = document.getElementById("txtResumen")
    genero = document.getElementById("cbGenero")
    foto = document.getElementById("fileImagen")
    if ((codigo.value!="") && (titulo.value!="") && (duracion.value!="") && (director.value!="") && (fechaLanzamiento.value!="")&&(resumen.value!="")&&(genero.value!=0)
    &&(foto.value!="")){
        return true
    }else{
        return false
    }
}
function validarFoto(evt){
    let foto = document.getElementById("fileImagen")
    let archivos = evt.target.files
    let nombreArchivo  = archivos[0].name
    let tamaArchivo = archivos[0].size
    if(tamaArchivo>5000000){
        Swal.fire("Cargar Foto","La Foto no puede tener mas de 1Mega","warning")
        foto.value = ""
    }else{
        let extension = nombreArchivo.split(".").pop().toLowerCase()
        if(extension!="jpg"){
            Swal.fire("Cargar Foto","El formato de la foto debe ser JPG","warning")
            foto.value = ""
        }
    }
}
function listarPeliculas(){
    let datos = "";
    lista.forEach(pel => {
        datos += "<tr>";
        datos += "<td>"+pel[1]+"</td>";
        datos += "<td>"+pel[2]+"</td>";
        datos += "<td>"+pel[3]+"</td>";
        datos += "<td>"+pel[4]+"</td>";
        datos += "<td>"+convertirFecha(pel[5])+"</td>";
        datos += "<td>"+pel[6]+"</td>";
        datos += "<td>"+pel[8]+"</td>";
        foto = pel[0]+".jpg"
        datos += "<td> <img src='../static/imagenes/"+foto+"'width='100' height='100'></td>";
        datos += "</tr>";
    }) 
    document.getElementById("datosPeliculas").innerHTML = datos
}
function limpiar(){
    document.getElementById("idPelicula").value = ""
    document.getElementById("txtCodigo").value = ""
    document.getElementById("txtTitulo").value = ""
    document.getElementById("txtDuracion").value = ""
    document.getElementById("txtDirector").value = ""
    document.getElementById("txtFechaLanzamiento").value = ""
    document.getElementById("txtResumen").value = ""
    document.getElementById("cbGenero").value = 0
    document.getElementById("fileImagen").value = ""
}
function convertirFecha(fechaPython){
    let fecha = new Date(fechaPython)
    dia = fecha.getDate()
    mes = fecha.getMonth()+1
    año = fecha.getFullYear()
    if(mes<10){
        mes="0"+mes
    }
    if(dia<10){
        dia="0"+dia
    }
    fechaCompleta = año+"-"+mes+"-"+dia
    return fechaCompleta
}
async function consultarPorCodigo(){
    if (document.getElementById("txtCodigo").value !=""){
        const url = '/consultarPorCodigo'
        const codigo = document.getElementById("txtCodigo").value
        const data = new FormData()
        data.append("codigo", codigo)
        const response = await
            fetch(url,{method: "POST", body:data})
        const respuesta = await response.json()
        console.log(respuesta)
        if(respuesta.peliculaConsultada!=null){
            document.getElementById("idPelicula").value = respuesta.peliculaConsultada[0]
            document.getElementById("txtTitulo").value = respuesta.peliculaConsultada[2]
            document.getElementById("txtDuracion").value = respuesta.peliculaConsultada[3]
            document.getElementById("txtDirector").value = respuesta.peliculaConsultada[4]
            document.getElementById("txtFechaLanzamiento").value = convertirFecha(respuesta.peliculaConsultada[5])
            document.getElementById("txtResumen").value = respuesta.peliculaConsultada[6]
            document.getElementById("cbGenero").value = respuesta.peliculaConsultada[7]
        }else{
            Swal.fire("Consultar Pelicula",respuesta.mensaje,"warning")
            limpiar()
        }
    }else{
        Swal.fire("Consultar Pelicula","Debe ingresar codigo de la pelicula","warning")
        limpiar()
    }
}
async function actualizar(){
    if (document.getElementById("idPelicula").value==""){
        Swal.fire("Actualizar Pelicula","Debe consultar Primero para Actualizar","warning")
    }else{
        url = "/actualizar"
        const data = new FormData(document.getElementById("frmPelicula"))
        const response = await
            fetch(url,{method: "POST", body: data})
        const respuesta = await response.json()
        if(respuesta.estado){
            Swal.fire("Actualizar Pelicula",respuesta.mensaje,"success")
            lista = respuesta.listaPeliculas
            listarPeliculas()
            limpiar()
        }else{
            Swal.fire("Actualizar Pelicula",respuesta.mensaje,"warning")
        }
    }
}
function modalSweetAlert(){
    Swal.fire({
        title: 'Eliminar Pelicula',
        text: "¿Esta seguro que quiere eliminar a está pelicula?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
            Eliminar()
        }
      })
}
async function Eliminar(){
    if (document.getElementById("idPelicula").value !=""){
        const url = '/eliminar'
        const idPelicula = document.getElementById("idPelicula").value
        const data = new FormData()
        data.append("idPelicula", idPelicula)
        const response = await
            fetch(url,{method: "POST", body:data})
        const respuesta = await response.json()
        console.log(respuesta)
        if(respuesta.estado){
            Swal.fire("Eliminar Pelicula",respuesta.mensaje,"success")
            lista = respuesta.listaPeliculas
            listarPeliculas()
            limpiar()
        }else{
            Swal.fire("Eliminar Pelicula",respuesta.mensaje,"warning")
        }
    }else{
        Swal.fire("Eliminar Pelicula","Debe Consultar primero para eliminar","warning")
    }
}