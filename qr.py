import qrcode
from PIL import Image
import os

# URL del proyecto
url = "https://numerodoradoclub.com/"
logo_path = "logo.png"  # Asegúrate que tenga fondo transparente

# Validar existencia del logo
if not os.path.exists(logo_path):
    raise FileNotFoundError(f"⚠️ Logo no encontrado: {logo_path}")

# Crear QR
qr = qrcode.QRCode(
    version=10,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# QR con fondo transparente python qr.py
qr_img = qr.make_image(fill_color="#000000", back_color="#FFFFFF").convert("RGBA")

# Cargar logo con transparencia
logo = Image.open(logo_path).convert("RGBA")
logo_size = 100
logo = logo.resize((logo_size, logo_size))

# Posición centrada
pos = (
    (qr_img.size[0] - logo_size) // 2,
    (qr_img.size[1] - logo_size) // 2
)

# Pegar logo con transparencia
qr_img.paste(logo, pos, mask=logo)

# Guardar imagen final
qr_img.save("qr_numero_dorado.png")
print("✅ QR generado con fondo transparente y logo incrustado.")
