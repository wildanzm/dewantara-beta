from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import asyncio
import base64
import numpy as np
import cv2
import json

# --- SETUP LOGGING ---
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("DEWANTARA_BASE64")

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
    return {"message": "Server Ready (Base64 Mode)"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("✅ KONEKSI: Client Terhubung!")
    
    try:
        while True:
            # 1. TERIMA DATA SEBAGAI TEXT (Base64 String)
            # Karena frontend sekarang mengirim string, bukan bytes
            data_str = await websocket.receive_text()
            
            try:
                # 2. DECODE BASE64 KE GAMBAR
                # Format data: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
                # Kita buang header "data:image/jpeg;base64," kalau ada
                if "base64," in data_str:
                    data_str = data_str.split("base64,")[1]
                
                # Decode string jadi bytes
                img_bytes = base64.b64decode(data_str)
                
                # Convert bytes ke Numpy Array (OpenCV format)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    logger.warning("⚠️ Gagal decode gambar")
                    continue
                
                # --- (DISINI NANTI LOGIKA AI MEDIAPIPE ANDA) ---
                # Untuk sekarang kita bypass dulu biar stabil
                
                # 3. KIRIM BALASAN
                response = {
                    "prediction": "Stabil",
                    "confidence": 1.0
                }
                await websocket.send_text(json.dumps(response))

            except Exception as e_process:
                logger.error(f"⚠️ Error Proses Gambar: {str(e_process)}")
                # Jangan putus koneksi, kirim feedback error saja
                await websocket.send_text(json.dumps({"prediction": "Error", "confidence": 0.0}))

            # Jeda napas agar CPU server tidak 100%
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        logger.info("❌ Client Disconnected (Normal)")
    except Exception as e:
        logger.error(f"💀 CRASH KONEKSI: {str(e)}")