import zlib
import struct
import math
import os

def create_png(width, height, filename):
    # RGBA
    raw_data = bytearray()
    
    # Emerald color: #059669 -> (5, 150, 105)
    # Emerald light: #10b981 -> (16, 185, 129)
    # White: (255, 255, 255)
    center_x = width / 2
    center_y = height / 2
    radius = width * 0.45
    corner_radius = width * 0.22
    
    for y in range(height):
        raw_data.append(0) # filter type 0
        for x in range(width):
            # Rounded rectangle distance
            dx = max(abs(x - center_x) - (width/2 - corner_radius), 0)
            dy = max(abs(y - center_y) - (height/2 - corner_radius), 0)
            dist_sq = dx*dx + dy*dy
            
            if dist_sq > corner_radius * corner_radius:
                # Transparent outer
                raw_data.extend((0, 0, 0, 0))
            else:
                # Inside rounded rect: Emerald background
                r, g, b = 5, 150, 105
                # Center circular badge
                cdist = math.hypot(x - center_x, y - center_y)
                if abs(cdist - width*0.35) < width*0.02:
                    # Outer ring
                    r, g, b = 16, 185, 129
                elif width * 0.2 <= cdist <= width * 0.28:
                    # Inner ring
                    r, g, b = 52, 211, 153
                # Split card rectangle
                card_w = width * 0.44
                card_h = height * 0.28
                if abs(x - center_x) < card_w and abs(y - center_y) < card_h:
                    r, g, b = 255, 255, 255
                    # Inner Lek center circle
                    if cdist < width * 0.12:
                        r, g, b = 5, 150, 105
                        # Monogram L in center circle
                        lx = (x - center_x) / (width * 0.12)
                        ly = (y - center_y) / (width * 0.12)
                        if (-0.3 <= lx <= -0.1 and -0.5 <= ly <= 0.5) or (0.1 <= ly <= 0.5 and -0.3 <= lx <= 0.4):
                            r, g, b = 255, 255, 255
                
                raw_data.extend((r, g, b, 255))
                
    def chunk(chunk_type, data):
        return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    png += chunk(b'IEND', b'')
    
    with open(filename, 'wb') as f:
        f.write(png)

os.makedirs('public/icons', exist_ok=True)
create_png(192, 192, 'public/icons/icon-192.png')
create_png(512, 512, 'public/icons/icon-512.png')
create_png(512, 512, 'public/icons/icon-512-maskable.png')
create_png(192, 192, 'public/apple-touch-icon.png')
create_png(64, 64, 'public/favicon.ico')
print("Successfully generated all PWA icons!")

