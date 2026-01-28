#import library 
import cv2
import joblib
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import asyncio

# Import MediaPipe dengan error handling
try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    # Untuk versi baru MediaPipe
    mp_hands = mp.solutions.hands if hasattr(mp, 'solutions') else None
except ImportError as e:
    print(f"Error importing MediaPipe: {e}")
    mp = None
    mp_hands = None

#konfigurasi
MODEL_PATH = 'models/model_bisindo_v2.pkl'
SCALER_PATH = 'models/scaler_bisindo_v2.pkl'
NUM_FEATURES = 84 # untuk input yaitu 84 fitur (2 tangan * 21 landmark * 2 koordinat)

#bikin class untuk proses logika
class SignLanguageDetector:
    def __init__(self):
        self.model = self.load_file(MODEL_PATH)
        self.scaler = self.load_file(SCALER_PATH)

        # Initialize MediaPipe with performance optimization
        if mp_hands is None:
            raise RuntimeError("MediaPipe hands module not available. Please install mediapipe correctly.")
        
        self.mp_hands = mp_hands
        # Performance vs. Accuracy Sweet Spot: Lite model (complexity=0) for speed
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,  # BISINDO support (2 hands)
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def load_file(self, path):
        try:
            return joblib.load(path)
        except FileNotFoundError:
            print(f"Error: File tidak ditemukan - {path}")
            exit()
    
    def process_image(self, image_bytes):
        """Process image with robust error handling"""
        try:
            # Convert bytes to OpenCV image
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return None, None
            
            # Convert to RGB for MediaPipe
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
    
        # 1. Urutkan tangan berdasarkan koordinat X pergelangan tangan (landmark 0)
        # Ini agar urutan fitur (Kiri/Kanan) selalu konsisten dengan saat training
        sorted_hands = sorted(results.multi_hand_landmarks, key=lambda h: h.landmark[0].x)
    
        for hand_landmarks in sorted_hands[:2]: # Ambil maksimal 2 tangan
            # Titik referensi (Wrist/Pergelangan)
            base_x = hand_landmarks.landmark[0].x
            base_y = hand_landmarks.landmark[0].y
        
            for lm in hand_landmarks.landmark:
                # 2. Hitung koordinat RELATIF (dikurangi base_x dan base_y)
                data_aux.append(lm.x - base_x)
                data_aux.append(lm.y - base_y)

        # 3. Smart padding agar tetap 84 fitur jika hanya 1 tangan yang terdeteksi
        if len(data_aux) < NUM_FEATURES:
            padding = [0.0] * (NUM_FEATURES - len(data_aux))
            data_aux.extend(padding)
    
        return data_aux
    
    def predict(self, image_bytes):
        """Main prediction function called by WebSocket"""
        try:
            results, _ = self.process_image(image_bytes)

            if not results:
                return "Tidak Terdeteksi"
            
            features = self.extract_features(results)

            if features and len(features) == NUM_FEATURES:
                features_np = np.array(features).reshape(1, -1)  # Reshape features
                scaled_data = self.scaler.transform(features_np)  # Standardize features
                prediction = self.model.predict(scaled_data)  # Predict
                return prediction[0]
            
            return "Tidak Terdeteksi"
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return "Error"
    
# Inisialisasi FastAPI
app = FastAPI()

# Configure CORS for production
origins = [
    "http://localhost:3000",           # Local development
    "http://127.0.0.1:3000",           # Local development alternative
    "https://dewantara.cloud",         # Production domain
    "https://www.dewantara.cloud",     # Production domain with www
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = SignLanguageDetector() #objek detektor

@app.get("/")
def home():
    return {"message": "Dewantara AI Server Ready", "status": "active"}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend connected.")
    
    # Proxy bypass: Send welcome packet to flush Cloudflare/Render buffers
    await websocket.send_json({"status": "connected", "message": "Welcome to BISINDO Detection API"})
    
    try:
        while True:
            # Receive image frame from frontend as bytes
            data = await websocket.receive_bytes()

            # Perform prediction
            prediction_result = detector.predict(data)

            # Send prediction result to frontend
            await websocket.send_text(str(prediction_result))

            # Brief delay to prevent server overload
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        # Connection already closed by client/browser, no need to close() again
        # This prevents "Double Close" runtime errors
        print("Client disconnected (Normal).")
    
    except Exception as e:
        # Catch other errors (e.g., image processing issues)
        print(f"WebSocket error: {e}")

            

#for running : uvicorn main:app --host 0.0.0.0 --port 8000
