import os
from flask import Flask

app = Flask(__name__)

print("=== VERIFICACIÓN DE IMÁGENES ===")
print(f"Directorio actual: {os.getcwd()}")
print()

# Verificar estructura de carpetas
static_path = "static"
images_path = "static/images"

print(f"¿Existe 'static'? {os.path.exists(static_path)}")
print(f"¿Existe 'static/images'? {os.path.exists(images_path)}")
print()

if os.path.exists(images_path):
    archivos = os.listdir(images_path)
    print(f"Archivos en static/images/: {archivos}")
    
    # Verificar archivos específicos
    for archivo in ['pastor.jpg', 'pastora.jpg']:
        ruta_completa = os.path.join(images_path, archivo)
        existe = os.path.exists(ruta_completa)
        if existe:
            tamaño = os.path.getsize(ruta_completa)
            print(f"✅ {archivo} - Existe - Tamaño: {tamaño} bytes")
        else:
            print(f"❌ {archivo} - NO existe")
else:
    print("❌ La carpeta static/images no existe")