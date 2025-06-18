from flask import Flask, render_template

# Crear la aplicación Flask
app = Flask(__name__)

# Configuración básica
app.config['SECRET_KEY'] = 'mi-iglesia-ctue-2025'

# Ruta principal (página de inicio)
@app.route('/')
def index():
    """Página principal de la iglesia"""
    return render_template('index.html')

# Función para ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)