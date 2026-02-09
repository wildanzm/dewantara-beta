#import library 
import cv2
import joblib
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pathlib import Path

# --- SETUP MEDIAPIPE ---
try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    mp_hands = mp.solutions.hands if hasattr(mp, 'solutions') else None
except ImportError as e:
    print(f"Error importing MediaPipe: {e}")
    mp = None
    mp_hands = None

# --- KONFIGURASI ---
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / 'models/model_bisindo_v2.pkl'
SCALER_PATH = BASE_DIR / 'models/scaler_bisindo_v2.pkl'
NUM_FEATURES = 84  # (2 tangan * 21 landmark * 2 koordinat)

# --- LOAD RESOURCES GLOBAL (Hanya 1x saat server start) ---
# Ini penting agar RAM tidak jebol, tapi tetap aman untuk concurrency
GLOBAL_MODEL = None
GLOBAL_SCALER = None

try:
    GLOBAL_MODEL = joblib.load(MODEL_PATH)
    GLOBAL_SCALER = joblib.load(SCALER_PATH)
    print(f"✅ Model & Scaler loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"🔥 FATAL ERROR loading model: {e}")

# --- CLASS LOGIKA (Di-instantiate PER USER) ---
class SignLanguageDetector:
    def __init__(self, model, scaler):
        # Menerima model global, tapi membuat instance MediaPipe baru
        self.model = model
        self.scaler = scaler

        if mp_hands is None:
            raise RuntimeError("MediaPipe not available.")
        
        self.mp_hands = mp_hands
        # Konfigurasi MediaPipe (Stateful untuk tracking yang stabil)
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,    # False = Tracking Mode (Lebih Cepat & Stabil)
            max_num_hands=2,            # Support 2 tangan
            model_complexity=1,         # 0 = Lite (Cepat di Render), 1 = Full (Akurat)
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    def process_image(self, image_bytes):
        """Process image with robust error handling"""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return None, None
            
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(frame_rgb)
            return results, frame
        
        except Exception as e:
            print(f"Error decoding/processing image: {e}")
            return None, None
    
    def extract_features(self, results):
        if not results.multi_hand_landmarks:
            return None
        
        data_aux = []
        
        # 1. Urutkan tangan berdasarkan X (agar Kiri/Kanan konsisten)
        sorted_hands = sorted(results.multi_hand_landmarks, key=lambda h: h.landmark[0].x)
        
        for hand_landmarks in sorted_hands[:2]:
            # Titik referensi (Wrist) untuk koordinat relatif
            base_x = hand_landmarks.landmark[0].x
            base_y = hand_landmarks.landmark[0].y
            
            for lm in hand_landmarks.landmark:
                # Hitung koordinat RELATIF (Normalisasi posisi)
                data_aux.append(lm.x - base_x)
                data_aux.append(lm.y - base_y)

        # 2. Smart Padding (Jika cuma 1 tangan, isi sisa dengan 0)
        if len(data_aux) < NUM_FEATURES:
            padding = [0.0] * (NUM_FEATURES - len(data_aux))
            data_aux.extend(padding)
        
        # Potong jika kelebihan (safety)
        return data_aux[:NUM_FEATURES]
    
    def predict(self, image_bytes):
        """Main prediction function"""
        if self.model is None or self.scaler is None:
            return "Model Error"

        try:
            results, _ = self.process_image(image_bytes)

            if not results or not results.multi_hand_landmarks:
                return "Tidak Terdeteksi"
            
            features = self.extract_features(results)

            if features and len(features) == NUM_FEATURES:
                features_np = np.array(features).reshape(1, -1)
                scaled_data = self.scaler.transform(features_np)
                prediction = self.model.predict(scaled_data)
                return prediction[0]
            
            return "Tidak Terdeteksi"
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return "Error"

    def close(self):
        """Membersihkan resource MediaPipe saat user putus"""
        if self.hands:
            self.hands.close()

# --- SERVER SETUP ---
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dewantara.cloud",
    "https://www.dewantara.cloud",
    "https://api.dewantara.cloud",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Dewantara AI Server Ready", "status": "active"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend connected.")
    
    # 1. Instantiate Detektor LOKAL (Khusus untuk user ini saja)
    #    Menggunakan Global Model agar hemat RAM
    local_detector = SignLanguageDetector(GLOBAL_MODEL, GLOBAL_SCALER)
    
    # Proxy bypass message
    await websocket.send_json({"status": "connected", "message": "Welcome"})
    
    try:
        while True:
            data = await websocket.receive_bytes()

            # 2. Gunakan local_detector untuk prediksi (jalankan di thread terpisah agar async)
            prediction_result = await asyncio.to_thread(local_detector.predict, data)

            await websocket.send_text(str(prediction_result))
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        print("Client disconnected (Normal).")
        # 3. Bersihkan memori user ini
        local_detector.close()
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        local_detector.close()

            

#for running : uvicorn main:app --host 0.0.0.0 --port 8000
