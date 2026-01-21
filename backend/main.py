import cv2
import joblib
import numpy as np
import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware


# --- KONFIGURASI PATH (PENTING UNTUK VPS) ---
# Menggunakan absolute path agar file model terbaca dimanapun Gunicorn dijalankan
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models/3bisindo_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models/3scaler.pkl')

NUM_FEATURES = 84  # 84 fitur (2 tangan * 21 landmark * 2 koordinat)

# --- IMPORT MEDIAPIPE ---
try:
    import mediapipe as mp
    # Cek ketersediaan module
    mp_hands = mp.solutions.hands if hasattr(mp, 'solutions') else None
except ImportError as e:
    print(f"Error importing MediaPipe: {e}")
    mp_hands = None

# --- CLASS LOGIKA ---
class SignLanguageDetector:
    def __init__(self):
        self.model = self.load_file(MODEL_PATH)
        self.scaler = self.load_file(SCALER_PATH)

        # Validasi MediaPipe
        if mp_hands is None:
            # Di production, ini akan log error tapi tidak mematikan server seketika
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
            # Return None agar server tidak langsung crash saat startup
            return None
    
    def process_image(self, image_bytes):
        try:
            # Ubah bytes ke gambar OpenCV
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return None, None
            
            # Konversi ke RGB untuk MediaPipe
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

        # Logika padding (isi 0 jika tangan terdeteksi kurang dari 2)
        if len(all_landmarks) < NUM_FEATURES:
            padding = [0.0] * (NUM_FEATURES - len(all_landmarks))
            all_landmarks.extend(padding)
        
        # Potong jika lebih (opsional, untuk safety)
        return all_landmarks[:NUM_FEATURES]
    
    def predict(self, image_bytes):
        # Cek apakah model berhasil di-load
        if self.model is None or self.scaler is None:
            return "Model Error"

        results, _ = self.process_image(image_bytes)

        if not results:
            return "Tidak Terdeteksi"
        
        features = self.extract_features(results)

        if features and len(features) == NUM_FEATURES:
            try:
                features_np = np.array(features).reshape(1, -1) # Rapikan array
                scaled_data = self.scaler.transform(features_np) # Standarisasi
                prediction = self.model.predict(scaled_data)     # Prediksi
                return prediction[0]
            except Exception as e:
                print(f"Prediction Error: {e}")
                return "Error"
        
        return "Tidak Terdeteksi"

# --- INISIALISASI APP ---
app = FastAPI()

# Konfigurasi CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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

# Inisialisasi Detektor
detector = SignLanguageDetector()

@app.get("/")
def home():
    return {"message": "DEWANTARA Sign Language API is Running"}

@app.get("/health")
def health():
    # Endpoint untuk cek kesehatan server
    if detector.model is None:
        return {"status": "unhealthy", "reason": "Model not loaded"}
    return {"status": "healthy"}

# --- WEBSOCKET ENDPOINT (FIXED) ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend terhubung via WebSocket.")
    
    try:
        while True:
            # Terima data (Bytes dari Blob JS)
            # Pastikan Frontend mengirim data binary (Blob), bukan Base64 string text
            data = await websocket.receive_bytes()

            # Lakukan prediksi
            # Jalankan di thread pool agar tidak memblokir async loop
            hasil_prediksi = await asyncio.to_thread(detector.predict, data)

            # Kirim hasil
            await websocket.send_text(str(hasil_prediksi))

            # Jeda sangat singkat agar CPU tidak 100%
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        # Client menutup koneksi (Normal)
        print("Klien terputus (Disconnect).")
        # JANGAN panggil websocket.close() di sini karena sudah putus
        
    except Exception as e:
        # Error tidak terduga
        print(f"WebSocket Error: {e}")
        # Coba tutup koneksi jika masih terbuka
        try:
            await websocket.close(code=1011)
        except RuntimeError:
            pass # Abaikan jika sudah tertutup

            

#for running : uvicorn main:app --host 0.0.0.0 --port 8000
