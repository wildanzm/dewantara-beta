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
MODEL_PATH = 'models/3bisindo_model.pkl'
SCALER_PATH = 'models/3scaler.pkl'
NUM_FEATURES = 84 # untuk input yaitu 84 fitur (2 tangan * 21 landmark * 2 koordinat)

#bikin class untuk proses logika
class SignLanguageDetector:
    def __init__(self):
        self.model = self.load_file(MODEL_PATH)
        self.scaler = self.load_file(SCALER_PATH)

        #inisialisasi MediaPipe
        if mp_hands is None:
            raise RuntimeError("MediaPipe hands module not available. Please install mediapipe correctly.")
        
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
            exit()
    
    def process_image(self, image_bytes):
        #ubah bytes ke gambar OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return None, None
        
        #konversi ke RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        return results, frame
    
    def extract_features(self, results):
        #ambil koordinat dan lakukan padding
        if not results.multi_hand_landmarks:
            return None
        
        all_landmakrs = []
        for hand_landmarks in results.multi_hand_landmarks:
            for lm in hand_landmarks.landmark:
                all_landmakrs.extend([lm.x, lm.y])

        #logika padding (tambah 0 jika kurang dari 84 fitur)
        if len(all_landmakrs) < NUM_FEATURES:
            padding = [0.0] * (NUM_FEATURES - len(all_landmakrs))
            all_landmakrs.extend(padding)
        
        return all_landmakrs
    
    def predict(self, image_bytes):
        #fungsi utama yang di call websocket
        results, _ = self.process_image(image_bytes)

        if not results:
            return "Tidak Terdeteksi"
        
        features = self.extract_features(results)

        if features and len(features) == NUM_FEATURES:
            features_np = np.array(features).reshape(1, -1) #rapihkan fitur
            scaled_data = self.scaler.transform(features_np) #standarisasi fitur
            prediction = self.model.predict(scaled_data) #lakukan prediksi
            return prediction[0]
        
        return "Tidak Terdeteksi"
    
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

#endpoint websocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("frontend terhubung.")
    
    try:
        while True:
            # terima data frame gambar dari frontend sebagai bytes
            data = await websocket.receive_bytes()

            # lakukan prediksi
            hasil_prediksi = detector.predict(data)

            # kirim hasil prediksi ke frontend
            await websocket.send_text(str(hasil_prediksi))

            # jeda singkat untuk mencegah overload server
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        # Koneksi sudah diputus oleh klien/browser, tidak perlu close() lagi
        print("Klien terputus (Normal).")
        
    except Exception as e:
        # Tangkap error lain (misal masalah pemrosesan gambar)
        print(f"Terjadi error: {e}")
        # Opsional: Coba tutup jika belum tertutup (pakai try-except lagi biar aman)
        try:
            await websocket.close()
        except:
            pass

            

#for running : uvicorn main:app --host 0.0.0.0 --port 8000
