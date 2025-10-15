import cv2
import numpy as np
import pyautogui
import mss
import time

# mss ile ekran görüntüsü al
sct = mss.mss()

# Hedef görseli
template = cv2.imread("hedef.png", cv2.IMREAD_GRAYSCALE)
if template is None: 
    raise FileNotFoundError("Görsel bulunamadı! Dosya yolunu ve adını kontrol et.")

w, h = template.shape[::-1]

print("Bot başlıyor... 3 saniye içinde oyun ekranına geçin.")
time.sleep(3)

while True:
    # 1️⃣ Ekran görüntüsü al
    screenshot = np.array(sct.grab(sct.monitors[1]))
    gray = cv2.cvtColor(screenshot, cv2.COLOR_BGR2GRAY)

    # 2️⃣ Şablon eşleme
    result = cv2.matchTemplate(gray, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    threshold = 0.8
    if max_val > threshold:
        # 3️⃣ Hedefin ortasına tıkla
        target_x = max_loc[0] + w // 2
        target_y = max_loc[1] + h // 2
        pyautogui.moveTo(target_x, target_y, duration=0.2)
        pyautogui.click()
        print(f"Hedef bulundu ve tıklandı: {max_val:.2f}")

        # 4️⃣ Saldırı tuşuna bas
        pyautogui.press('space')
        print("Saldırı tuşuna basıldı.")

    else:
        print("Hedef bulunamadı.")

    time.sleep(0.5)
