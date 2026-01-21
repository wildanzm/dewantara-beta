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
    await websocket.accept()
    logger.info("✅ DEBUG: Handshake Sukses!")
    
    try:
        while True:
            # 1. Terima Data
            data = await websocket.receive_bytes()
            
            try:
                # --- ZONA BAHAYA (AI PROCESSING) ---
                # Bungkus kodingan CV2/MediaPipe disini
                
                # Contoh simulasi (Ganti dengan logika asli Anda):
                # np_arr = np.frombuffer(data, np.uint8)
                # img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                # results = hands.process(img) 
                
                # Dummy Response (untuk tes kestabilan dulu)
                response = '{"prediction": "Stabil", "confidence": 1.0}'
                await websocket.send_text(response)
                
            except Exception as e_ai:
                # INI PENTING: Tangkap error AI biar server tidak putus
                logger.error(f"🔥 ERROR AI: {str(e_ai)}")
                # Kirim feedback ke frontend biar tidak hang
                await websocket.send_text('{"prediction": "Error AI", "confidence": 0.0}')

            # Yield CPU sedikit
            await asyncio.sleep(0.001)
            
    except WebSocketDisconnect:
        logger.info("❌ Client Disconnected (Normal)")
    except Exception as e:
        logger.error(f"💀 CRASH FATAL: {str(e)}")