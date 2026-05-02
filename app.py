import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, make_response, request, jsonify

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

# Petición de oración — envío por correo vía Brevo SMTP
@app.route('/enviar-peticion', methods=['POST'])
def enviar_peticion():
    data = request.get_json()
    nombre  = data.get('nombre', '').strip()
    peticion = data.get('peticion', '').strip()

    if not nombre or not peticion:
        return jsonify({'ok': False, 'error': 'Faltan datos'}), 400

    smtp_user = os.environ.get('BREVO_USER', 'a9ef68001@smtp-brevo.com')
    smtp_pass = os.environ.get('BREVO_PASS', 'K62hRBGCD73yUf40')
    dest      = os.environ.get('MAIL_DEST',  'ictueoracion@gmail.com')

    msg = MIMEMultipart()
    msg['From']    = smtp_user
    msg['To']      = dest
    msg['Subject'] = f'🙏 Petición de oración de {nombre} — ICTUE LAMPA'

    cuerpo = f"""
Nueva petición de oración recibida desde la página web de ICTUE LAMPA:

Nombre: {nombre}

Petición:
{peticion}

---
Este mensaje fue enviado automáticamente desde ictue-lampa-web.onrender.com
"""
    msg.attach(MIMEText(cuerpo, 'plain', 'utf-8'))

    try:
        with smtplib.SMTP('smtp-relay.brevo.com', 587, timeout=30) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, dest, msg.as_string())
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


# Función para ejecutar la aplicación
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
