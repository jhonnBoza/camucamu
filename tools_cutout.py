from PIL import Image
import os

src = r"c:\Users\aldyj\Downloads\pag\assets\frasco.png"
out = r"c:\Users\aldyj\Downloads\pag\assets\frasco-clean.png"

img = Image.open(src).convert("RGBA")
w, h = img.size
pixels = img.load()

# Flood-fill from edges: remove near-black connected to border
visited = [[False] * w for _ in range(h)]
stack = []

def is_bg(x, y):
    r, g, b, a = pixels[x, y]
    return (r + g + b) / 3 < 40

for x in range(w):
    stack.append((x, 0))
    stack.append((x, h - 1))
for y in range(h):
    stack.append((0, y))
    stack.append((w - 1, y))

while stack:
    x, y = stack.pop()
    if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
        continue
    visited[y][x] = True
    if not is_bg(x, y):
        continue
    r, g, b, _ = pixels[x, y]
    bright = (r + g + b) / 3
    alpha = 0 if bright < 28 else int(max(0, min(255, (bright - 28) * 12)))
    pixels[x, y] = (r, g, b, alpha)
    stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

img.save(out, "PNG")
print("saved", out, os.path.getsize(out))
print("corner alpha", img.getpixel((2, 2))[3], img.getpixel((w // 2, 10))[3])
