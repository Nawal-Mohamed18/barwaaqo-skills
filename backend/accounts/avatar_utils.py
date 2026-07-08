from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

AVATAR_SIZE = 512


def process_avatar(uploaded_file, crop=None):
    """
    Resize and optionally crop avatar to a square JPEG.
    crop: optional dict with x, y, size (0-1 normalized) from frontend editor.
    """
    img = Image.open(uploaded_file)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    if crop and all(k in crop for k in ("x", "y", "size")):
        w, h = img.size
        side = int(float(crop["size"]) * min(w, h))
        side = max(1, min(side, min(w, h)))
        left = int(float(crop["x"]) * w)
        top = int(float(crop["y"]) * h)
        left = max(0, min(left, w - side))
        top = max(0, min(top, h - side))
        img = img.crop((left, top, left + side, top + side))
    else:
        img = ImageOps.fit(img, (AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=88, optimize=True)
        buf.seek(0)
        return ContentFile(buf.read(), name="avatar.jpg")

    img = img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=88, optimize=True)
    buf.seek(0)
    return ContentFile(buf.read(), name="avatar.jpg")
