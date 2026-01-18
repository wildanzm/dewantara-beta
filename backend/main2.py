#import library
import cv2
import joblib
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import asyncio

# Inisialisasi FastAPI
app = FastAPI()

# Muat model dan scaler yang sudah dilatih
try:
    model = joblib.load('models/3bisindo_model.pkl')
    scaler = joblib.load('models/3scaler.pkl')
    print("Model dan scaler berhasil dimuat.")
except FileNotFoundError:
    print("Error: File tidak ditemukan")
    exit()


# Inisialisasi MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,  # Deteksi hingga 2 tangan
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
mp_draw = mp.solutions.drawing_utils

# Definisikan endpoint WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("frontend terhubung.")
    try:
        while True:
            # Menerima data frame gambar dari frontend sebagai bytes
            data = await websocket.receive_bytes()

            nparr = np.frombuffer(data, np.uint8) #ubah bytes ke angka
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR) # ubah angka ke gambar

            if frame is None:
                continue

            # Proses gambar dengan MediaPipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)

            prediction = "Tidak Terdeteksi"

            if results.multi_hand_landmarks:
                all_landmarks = []

                # Ekstrak landmark dari semua tangan yang terdeteksi (maksimal 2)
                for hand_landmarks in results.multi_hand_landmarks:
                    for lm in hand_landmarks.landmark:
                        # ambil posisi koordinat x dan y, sesuai dengan data training
                        all_landmarks.extend([lm.x, lm.y])

                # Padding jika hanya satu tangan yang terdeteksi (mastiin agar inputnya 84 fitur)
                # Model dilatih dengan 84 fitur (2 tangan * 21 landmark * 2 koordinat)
                num_features = 84
                if len(all_landmarks) < num_features:
                    padding = [0.0] * (num_features - len(all_landmarks))
                    all_landmarks.extend(padding)

                # Pastikan jumlah fitur sesuai sebelum prediksi
                if len(all_landmarks) == num_features:
                    # Ubah menjadi numpy array dan lakukan scaling
                    input_data = np.array(all_landmarks).reshape(1, -1)
                    scaled_data = scaler.transform(input_data)

                    # Lakukan prediksi
                    pred = model.predict(scaled_data)
                    prediction = pred

            # Kirim hasil prediksi kembali ke frontend
            await websocket.send_text(prediction)

            # Tambahkan jeda singkat untuk mencegah server overload
            await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        print("Klien terputus.")
    except Exception as e:
        print(f"Terjadi error: {e}")
    finally:
        # Pastikan koneksi ditutup dengan baik
        await websocket.close()


# uvicorn main:app --host 0.0.0.0 --port 8000 for running the server
