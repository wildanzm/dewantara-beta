from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import asyncio # Wajib import ini

# --- SETUP LOGGING ---
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("DEWANTARA_FIX")

app = FastAPI()

# --- SETUP CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Server Ready for WSS"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # 1. Terima Handshake
    await websocket.accept()
    logger.info("✅ DEBUG: Handshake Sukses! Client Terhubung.")
    
    # HAPUS JEDA TIDUR (asyncio.sleep) AGAR RESPONSIF
    
    # Kirim pesan sambutan
    try:
        await websocket.send_text('{"prediction": "Connected", "confidence": 1.0}')
    except Exception as e:
        logger.error(f"Gagal kirim sambutan: {e}")

    try:
        while True:
            # 2. TERIMA DATA (Langsung baca, jangan tunggu)
            data = await websocket.receive_bytes()
            
            # (Disini logika AI MediaPipe Anda)
            
            # 3. Balas Cepat
            await websocket.send_text('{"prediction": "Membaca...", "confidence": 0.5}')
            
            # Jeda mikroskopis hanya untuk yield CPU (0.001 detik)
            await asyncio.sleep(0.001)
            
    except WebSocketDisconnect as e:
        # PENTING: Kita log kodenya untuk tahu siapa yang memutus
        logger.info(f"❌ DEBUG: Client Disconnected. Code: {e.code}")
    except Exception as e:
        logger.error(f"🔥 DEBUG Error Fatal: {e}")