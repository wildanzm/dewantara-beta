from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

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
    
    # Kirim text sambutan (Frontend aman menerima text dari server)
    await websocket.send_text(f'{{"prediction": "Connected", "confidence": 1.0}}')
    
    try:
        while True:
            # 2. TUNGGU DATA BINARY (BLOB)
            # PENTING: Gunakan receive_bytes karena Frontend mengirim Blob
            data = await websocket.receive_bytes()
            
            # logger.info(f"📩 DEBUG: Menerima {len(data)} bytes data gambar")
            
            # 3. Balas Dummy (Format JSON agar Frontend tidak error parse)
            # Frontend mengharapkan JSON {prediction, confidence}
            await websocket.send_text(f'{{"prediction": "Tes", "confidence": 0.99}}')
            
    except WebSocketDisconnect:
        logger.info("❌ DEBUG: Client Disconnected")
    except Exception as e:
        logger.error(f"🔥 DEBUG Error Fatal: {e}")