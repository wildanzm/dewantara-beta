import cv2
import joblib
import numpy as np
import os
import asyncio
import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# --- KONFIGURASI PATH ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models/3bisindo_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models/3scaler.pkl')

NUM_FEATURES = 84

# --- IMPORT MEDIAPIPE ---
try:
    import mediapipe as mp
    mp_hands = mp.solutions.hands if hasattr(mp, 'solutions') else None
except ImportError as e:
    print(f"Error importing MediaPipe: {e}")
    mp_hands = None

# --- CLASS LOGIKA ---
class SignLanguageDetector:
    def __init__(self):
        self.model = self.load_file(MODEL_PATH)
        self.scaler = self.load_file(SCALER_PATH)

        if mp_hands is None:
            print("CRITICAL WARNING: MediaPipe hands module not available.")
        else:
            self.mp_hands = mp_hands
            self.hands = self.mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=2,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )

    def load_file(self, path):
        try:
            return joblib.load(path)
        except FileNotFoundError:
            print(f"Error: File tidak ditemukan - {path}")
            return None
    
    def process_image(self, image_data):
        try:
            # --- UPDATE: HANDLING BASE64 STRING ---
            # Jika input adalah string (Base64), kita decode dulu
            if isinstance(image_data, str):
                # Hapus header "data:image/jpeg;base64," jika ada
                if "base64," in image_data:
                    image_data = image_data.split("base64,")[1]
                
                # Decode base64 ke bytes
                image_bytes = base64.b64decode(image_data)
                nparr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                # Jika input sudah bytes (binary)
                nparr = np.frombuffer(image_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return None, None
            
            # Konversi ke RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            if hasattr(self, 'hands'):
                results = self.hands.process(frame_rgb)
                return results, frame
            return None, frame
            
        except Exception as e:
            print(f"Error processing image: {e}")
            return None, None
    
    def extract_features(self, results):
        if not results or not results.multi_hand_landmarks:
            return None
        
        all_landmarks = []
        for hand_landmarks in results.multi_hand_landmarks:
            for lm in hand_landmarks.landmark:
                all_landmarks.extend([lm.x, lm.y])

        if len(all_landmarks) < NUM_FEATURES:
            padding = [0.0] * (NUM_FEATURES - len(all_landmarks))
            all_landmarks.extend(padding)
        
        return all_landmarks[:NUM_FEATURES]
    
    def predict(self, image_data):
        if self.model is None:
            return "Model Error"

        results, _ = self.process_image(image_data)

        if not results:
            return "Tidak Terdeteksi"
        
        features = self.extract_features(results)

        if features and len(features) == NUM_FEATURES:
            try:
                features_np = np.array(features).reshape(1, -1)
                scaled_data = self.scaler.transform(features_np)
                prediction = self.model.predict(scaled_data)
                return prediction[0]
            except Exception as e:
                print(f"Prediction Error: {e}")
                return "Error"
        
        return "Tidak Terdeteksi"

# --- INISIALISASI APP ---
app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://dewantara.cloud",
    "https://www.dewantara.cloud",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = SignLanguageDetector()

@app.get("/")
def home():
    return {"message": "DEWANTARA API Running"}

# --- WEBSOCKET ENDPOINT (UPDATED) ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("DEBUG: Client Connected") # Log Debug
    
    try:
        while True:
            # --- UPDATE: GANTI KE receive_text() ---
            # Kita terima sebagai TEXT karena format Base64 adalah text.
            # receive_bytes() akan error jika Frontend kirim string.
            data = await websocket.receive_text()
            
            # Cek apakah data kosong
            if not data:
                print("DEBUG: Terima data kosong")
                continue

            # Jalankan prediksi (Logic decode ada di dalam class)
            hasil_prediksi = await asyncio.to_thread(detector.predict, data)

            # Kirim hasil
            await websocket.send_text(str(hasil_prediksi))

            # Jeda
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        print("DEBUG: Client Disconnected Gracefully")
    except Exception as e:
        print(f"DEBUG: WebSocket Error Fatal: {e}")
        try:
            await websocket.close(code=1011)
        except RuntimeError:
            pass

            

#for running : uvicorn main:app --host 0.0.0.0 --port 8000
