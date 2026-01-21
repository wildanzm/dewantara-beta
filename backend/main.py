from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import asyncio

# --- SETUP LOGGING ---
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("ECHO_TEST")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "Echo Server Running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("✅ TEST KONEKSI: Handshake Sukses")
    
    try:
        while True:
            # 1. Terima Data apapun (Bytes)
            data = await websocket.receive_bytes()
            
            # 2. JANGAN PROSES AI (Hanya hitung ukuran)
            size = len(data)
            
            # 3. Balas langsung
            # Ini membuktikan jalur komunikasi dua arah sehat
            await websocket.send_text(f'{{"prediction": "Server Stabil", "confidence": 1.0, "size": {size}}}')
            
            # Log agar kita tahu data mengalir
            # logger.info(f"Ping! Terima {size} bytes")
            
            # Jeda agar tidak spam log
            await asyncio.sleep(0.1)

    except WebSocketDisconnect:
        logger.info("ℹ️ Client Disconnected (Normal)")
    except Exception as e:
        logger.error(f"🔥 Error: {e}")