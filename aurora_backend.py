import sys
import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import urllib.parse
import urllib.request

app = Flask(__name__)
CORS(app)  # Permite que tu app de React Native se conecte sin bloqueos de seguridad

def obtener_metadatos_lastfm(track_name):
    """Extrae portadas y metadatos HD desde la API abierta de Last.fm"""
    try:
        api_key = "2cfbc70b676f414bf679b369e59d9c84" # API Key pública de desarrollo musical
        url = f"http://ws.audioscrobbler.com/2.0/?method=track.search&track={urllib.parse.quote(track_name)}&api_key={api_key}&format=json&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            track_matches = data.get('results', {}).get('trackmatches', {}).get('track', [])
            if track_matches:
                top_track = track_matches[0]
                # Buscar imágenes del álbum si están disponibles
                images = top_track.get('image', [])
                cover_url = ""
                for img in images:
                    if img.get('size') == 'extralarge' or img.get('size') == 'large':
                        cover_url = img.get('#text')
                
                return {
                    "title": top_track.get('name', 'Unknown Track'),
                    "artist": top_track.get('artist', 'Unknown Artist'),
                    "cover": cover_url if cover_url else "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500"
                }
    except Exception as e:
        print(f"Error en Last.fm Indexer: {e}", file=sys.stderr)
    return None

@app.route('/api/search', methods=['GET'])
def search_track():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"status": "error", "message": "Query vacía"}), 400

    try:
        # Ejecución quirúrgica de yt-dlp para extraer el streaming directo de audio
        # Usamos los argumentos optimizados para velocidad: --skip-download y --dump-single-json
        command = [
            'yt-dlp',
            '--skip-download',
            '--dump-single-json',
            '--format', 'bestaudio/best',
            f'ytsearch1:{query}'
        ]
        
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        video_data = json.loads(result.stdout)
        
        if 'entries' in video_data and len(video_data['entries']) > 0:
            entry = video_data['entries'][0]
            audio_url = entry.get('url') # URL del buffer directo de streaming
            ytdl_title = entry.get('title')
            
            # Refinar metadatos usando el indexador de Last.fm
            meta = obtener_metadatos_lastfm(query)
            if not meta:
                meta = {
                    "title": entry.get('track', ytdl_title),
                    "artist": entry.get('artist', entry.get('uploader', 'Aurora Core')),
                    "cover": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500"
                }

            # Enviar el paquete de datos estructurado directo al Contexto de la App
            return jsonify({
                "status": "success",
                "audioUrl": audio_url,
                "title": meta["title"],
                "artist": {
                    "name": meta["artist"],
                    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                },
                "album": {
                    "name": entry.get('album', 'Single Espectro Digital'),
                    "coverUrl": meta["cover"],
                    "releaseYear": entry.get('release_year', '2026')
                }
            })
        else:
            return jsonify({"status": "error", "message": "No se encontraron fuentes de audio"}), 404

    except Exception as e:
        print(f"Fallo crítico en el motor de raspado: {e}", file=sys.stderr)
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Correr en localhost de forma interna e invisible
    app.run(host='127.0.0.1', port=5000, debug=False)

