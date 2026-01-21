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
logger = logging.getLogger("DEWANTARA_FINAL")

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
    return {"message": "Server Ready"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("✅ KONEKSI: Handshake Berhasil!")
    
    try:
        while True:
            # 1. Terima Data (Text Base64 / Command)
            data_str = await websocket.receive_text()
            
            # --- FITUR BARU: HEARTBEAT / PING ---
            # Jika frontend kirim "PING", balas "PONG" biar koneksi gak diputus proxy
            if data_str == "PING":
                await websocket.send_text(json.dumps({"prediction": "Connected", "confidence": 1.0}))
                continue
            
            # 2. Proses Gambar Base64
            try:
                # Buang header "data:image/..." jika ada
                if "base64," in data_str:
                    data_str = data_str.split("base64,")[1]
                
                img_bytes = base64.b64decode(data_str)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    continue
                
                # --- AREA LOGIKA AI ANDA ---
                # (Masukkan kode MediaPipe disini nanti)
                
                # Balasan Default Stabil
                response = {
                    "prediction": "Stabil",
                    "confidence": 1.0
                }
                await websocket.send_text(json.dumps(response))

            except Exception as e_process:
                # Error proses gambar jangan bikin putus
                logger.error(f"⚠️ Gagal Decode: {e_process}")
                await websocket.send_text(json.dumps({"prediction": "-", "confidence": 0.0}))

            # Jeda yield CPU
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        logger.info("❌ Client Disconnected (Normal)")
    except Exception as e:
        logger.error(f"💀 CRASH: {str(e)}")