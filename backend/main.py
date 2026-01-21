from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import asyncio

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
    return {"message": "Server Running on Port 8001"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # 1. Terima Handshake
    await websocket.accept()
    logger.info("✅ DEBUG: Handshake Sukses! Client Terhubung.")
    
    # --- TAMBAHAN PENTING: JEDA STABILISASI ---
    # Beri waktu 0.5 detik agar koneksi benar-benar 'settled' di sisi Client/Proxy
    await asyncio.sleep(0.5) 
    
    # Kirim text sambutan
    try:
        await websocket.send_text(f'{{"prediction": "Connected", "confidence": 1.0}}')
    except Exception as e:
        logger.error(f"Gagal kirim sambutan: {e}")

    try:
        while True:
            # 2. TUNGGU DATA BINARY
            data = await websocket.receive_bytes()
            
            # (Opsional: Log data masuk)
            # logger.info("📩 Data masuk...")

            # 3. Proses & Balas
            # ... logika prediksi Anda ...
            await websocket.send_text(f'{{"prediction": "Standby", "confidence": 0.0}}')
            
            # Jeda agar CPU tidak 100%
            await asyncio.sleep(0.01)
            
    except WebSocketDisconnect:
        logger.info("❌ DEBUG: Client Disconnected (Normal/Network)")
    except Exception as e:
        logger.error(f"🔥 DEBUG Error Fatal: {e}")