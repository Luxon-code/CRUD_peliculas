import pymysql as mysql
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import os
app = Flask(__name__)
app.config['UPLOAD_FOLDER']='./static/imagenes'
user = "root"
passwordUser=""
baseDatos="peliculasPython"
host="localhost"
miConexion = mysql.connect(host=host, user=user, passwd=passwordUser , db=baseDatos)

@app.route("/")
def inicio():
    listaPeliculas = listarPeliculas()
    listaGeneros = listarGeneros()
    return render_template("frmPelicula.html", listaPeliculas=listaPeliculas,listaGeneros=listaGeneros)

@app.route("/agregar", methods=["POST"])
def agregar():
    mensaje=""
    estado = False
    try:
        codigo = request.form["txtCodigo"]
        titulo = request.form["txtTitulo"]
        duracion = request.form["txtDuracion"]
        director = request.form["txtDirector"]
        fechaLanzamiento = request.form["txtFechaLanzamiento"]
        resumen = request.form["txtResumen"]
        genero = request.form["cbGenero"]
        pelicula=(codigo,titulo,duracion,director,fechaLanzamiento,resumen,genero)
        cursor = miConexion.cursor()
        consulta="insert into peliculas values(null,%s,%s,%s,%s,%s,%s,%s)"
        resultado = cursor.execute(consulta,pelicula)
        miConexion.commit()
        if(cursor.rowcount==1):
            archivo = request.files["fileImagen"]
            nombreArchivo = secure_filename(archivo.filename)
            listaNombreArchivo = nombreArchivo.split(".",1)
            extension = listaNombreArchivo[1].lower()
            consulta = "select max(idPeliculas) from peliculas"
            resultado = cursor.execute(consulta)
            ultimoId = cursor.fetchone()[0]
            nuevoNombre = str(ultimoId) +"."+extension
            archivo.save(os.path.join(app.config["UPLOAD_FOLDER"],nuevoNombre))
            mensaje="pelicula agregada correctamente"
            estado = True
    except miConexion.Error as err:
        miConexion.rollback()
        mensaje = f"problemas al agregar la pelicula.Error {err}"
    return jsonify({"estado":estado,"mensaje":mensaje,"listaPeliculas":listarPeliculas()})
def listarPeliculas():
    try:
        cursor = miConexion.cursor()
        consulta="select peliculas.*,generos.genNombre from peliculas inner join generos on pelGenero = idGenero"
        resultado = cursor.execute(consulta)
        return cursor.fetchall()
    except Exception as error:
        mensaje = error 
def listarGeneros():
    try:
        cursor = miConexion.cursor()
        consulta="select * from generos"
        resultado = cursor.execute(consulta)
        return cursor.fetchall()
    except Exception as error:
        mensaje = error 
@app.route("/consultarPorCodigo", methods=["POST"])
def consultarPorCodigo():
    peliculaConsultada = None
    mensaje = ""
    try:
        codigo = int(request.form["codigo"])
        cursor = miConexion.cursor()
        consulta = "select * from peliculas where pelCodigo = %s"
        resultado = cursor.execute(consulta,(codigo))
        if cursor.rowcount>0:
            peliculaConsultada = cursor.fetchone() 
        else:
            mensaje = "No existe Pelicula con ese codigo"
    except Exception as error:
        mensaje = error
    return jsonify({"peliculaConsultada":peliculaConsultada,"mensaje":mensaje})
@app.route("/actualizar", methods=["POST"])
def actualizar():
    mensaje = ""
    estado = False
    listaPeliculas = []
    try:
        codigo = request.form["txtCodigo"]
        titulo = request.form["txtTitulo"]
        duracion = request.form["txtDuracion"]
        director = request.form["txtDirector"]
        fechaLanzamiento = request.form["txtFechaLanzamiento"]
        resumen = request.form["txtResumen"]
        genero = request.form["cbGenero"]
        id = int(request.form["idPelicula"])
        cursor = miConexion.cursor()
        peliculaActualizada = (codigo,titulo,duracion,director,fechaLanzamiento,resumen,genero,id)
        consulta = "update peliculas set pelCodigo=%s,pelTitulo=%s,pelDuracion=%s,pelDirector=%s,pelFechaLanzamiento=%s,pelResumen=%s,pelGenero=%s where idPeliculas=%s"
        resultado = cursor.execute(consulta,peliculaActualizada)
        miConexion.commit()
        if cursor.rowcount>0:
            estado=True
            mensaje = "Pelicula Actualizada Correctamente"
            listaPeliculas = listarPeliculas()
    except Exception as error:
        miConexion.rollback()
        mensaje  = error
    return jsonify({"estado":estado,"mensaje":mensaje,"listaPeliculas":listaPeliculas})
@app.route("/eliminar",methods=["POST"])
def eliminar():
    mensaje = ""
    estado = False
    listaPeliculas = []
    try:
        Id = int(request.form["idPelicula"])
        cursor = miConexion.cursor()
        consulta = "DELETE FROM peliculas WHERE `peliculas`.`idPeliculas` = %s"
        resultado = cursor.execute(consulta,(Id))
        miConexion.commit()
        if cursor.rowcount>0:
            os.remove(app.config["UPLOAD_FOLDER"]+"/"+str(Id) +".jpg")
            estado = True
            mensaje = "Pelicula eliminada Correctamente"
            listaPeliculas = listarPeliculas()
    except Exception as error:
        mensaje = error
    return jsonify({"mensaje":mensaje,"estado":estado,"listaPeliculas":listaPeliculas})
if __name__== "__main__":
    app.run(port=300,debug=True)