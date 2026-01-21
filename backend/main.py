from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

# --- SETUP LOGGING ---
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("TEST_API")

app = FastAPI()

# --- SETUP CORS (Buka Semua) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Test Server Running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("⚡ DEBUG: New Connection Request")
    
    # 1. Terima Handshake
    await websocket.accept()
    logger.info("✅ DEBUG: Handshake Accepted!")
    
    # 2. Kirim Pesan Sambutan
    await websocket.send_text("Hello from Server")
    
    try:
        while True:
            # 3. Tunggu Data (Text)
            data = await websocket.receive_text()
            logger.info(f"📩 DEBUG: Terima Data: {data}")
            
            # 4. Balas (Echo)
            await websocket.send_text(f"Server received: {data}")
            
    except WebSocketDisconnect:
        logger.info("❌ DEBUG: Client Disconnected")
    except Exception as e:
        logger.error(f"🔥 DEBUG: Error: {e}")