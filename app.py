from flask import Flask, render_template, make_response

# Crear la aplicación Flask
app = Flask(__name__)

# Configuración básica
app.config['SECRET_KEY'] = 'mi-iglesia-ctue-2025'

# Ruta principal (página de inicio)
@app.route('/')
def index():
    """Página principal de ICTUE LAMPA - Cristo Tu Única Esperanza"""
    return render_template('index.html')

# Sitemap XML para SEO
@app.route('/sitemap.xml')
def sitemap():
    """Sitemap XML para ayudar a Google a indexar la página"""
    sitemap_xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://ictue-lampa-web.onrender.com/</loc>
        <lastmod>2025-06-18</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://ictue-lampa-web.onrender.com/#nosotros</loc>
        <lastmod>2025-06-18</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://ictue-lampa-web.onrender.com/#servicios</loc>
        <lastmod>2025-06-18</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://ictue-lampa-web.onrender.com/#eventos</loc>
        <lastmod>2025-06-18</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://ictue-lampa-web.onrender.com/#contacto</loc>
        <lastmod>2025-06-18</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>"""
    
    response = make_response(sitemap_xml)
    response.headers["Content-Type"] = "application/xml"
    return response

# Robots.txt para SEO
@app.route('/robots.txt')
def robots():
    """Archivo robots.txt para indicar a Google qué indexar"""
    robots_txt = """User-agent: *
Allow: /
Sitemap: https://ictue-lampa-web.onrender.com/sitemap.xml

# ICTUE LAMPA - Cristo Tu Única Esperanza
# Iglesia cristiana en Santiago, Lampa
# Callejón Balmaceda 1087"""
    
    response = make_response(robots_txt)
    response.headers["Content-Type"] = "text/plain"
    return response

# Función para ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)