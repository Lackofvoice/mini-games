"""Generate original obstacle PNGs, their manifest and an offline script."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/sprites/obstacles'
# Reuse the standard-library PNG encoder without running the main asset build.
import struct
import zlib

def png(w, h, pixels):
    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data))
    rows = b''.join(b'\0' + pixels[i:i+4*w] for i in range(0, len(pixels), 4*w))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!IIBBBBB', w,h,8,6,0,0,0)) + chunk(b'IDAT', zlib.compress(rows,9)) + chunk(b'IEND',b'')

INK = '222133'
WHITE = 'fff1dc'

class Canvas:
    def __init__(self):
        self.shapes = []

    def poly(self, color, *points):
        def inside(x, y):
            result = False
            for (a,b),(c,d) in zip(points, points[1:] + points[:1]):
                if (b > y) != (d > y) and x < (c-a)*(y-b)/(d-b)+a:
                    result = not result
            return result
        self.shapes.append((bytes.fromhex(color) + b'\xff', inside))

    def rect(self, color, x, y, w, h):
        self.poly(color, (x,y),(x+w,y),(x+w,y+h),(x,y+h))

    def ellipse(self, color, x, y, rx, ry):
        self.shapes.append((bytes.fromhex(color) + b'\xff', lambda a,b: ((a-x)/rx)**2+((b-y)/ry)**2<=1))

    def render(self,w,h):
        out = bytearray()
        for y in range(h):
            for x in range(w):
                samples = [next((rgba for rgba, inside in reversed(self.shapes)
                    if inside((x+(i+.5)/4)*64/w,(y+(j+.5)/4)*64/h)), b'\0'*4)
                    for j in range(4) for i in range(4)]
                opaque = [p for p in samples if p[3]]
                out.extend([sum(p[c] for p in opaque)//len(opaque) for c in range(3)] + [len(opaque)*255//16] if opaque else [0]*4)
        return png(w,h,out)

def draw(kind,n):
    c=Canvas()
    r,p,e=c.rect,c.poly,c.ellipse
    if kind=='cone':
        x=[32,40,50][n]
        p(INK,(6,54),(x-4,8+n*11),(x+4,8+n*11),(57,54))
        p('f97731',(12,51),(x,13+n*11),(52,51))
        for f in [.43,.72]:
            y=13+n*11+(51-13-n*11)*f
            r(WHITE,x+(12-x)*f+2,y, (52-12)*f-4,4)
        r(INK,4,53,56,8);r('e45536',8,54,48,4)
    elif kind in ['pothole','puddle']:
        e(INK,32,51,29,11);e('777181' if kind=='pothole' else '416884',32,50,26,8)
        e('2d2b38' if kind=='pothole' else '64a2b5',33,51,20-n*2,5)
        p('9f9093' if kind=='pothole' else 'adced9',(14,47),(24,44),(45,47),(29,47),(24,51),(22,47))
    elif kind=='tires':
        for i in range(2+n):
            y=53-i*13;e(INK,32,y,27,9);e('535868',32,y-3,23,6);e(INK,32,y-4,13,3)
    elif kind in ['crate','box','chock']:
        y=37 if kind=='chock' else 13
        r(INK,9,y,46,61-y);r('bd8150',12,y+3,40,55-y);r('865033',12,53,40,5)
        r('f1c18a',16,y+7,31,4)
        if kind=='crate':p('73492e',(14,18),(20,18),(51,53),(44,53))
        else:r('e9c78d',28,y+4,8,49-y)
    elif kind=='barrier':
        p(INK,(8,59),(15,23),(21,23),(21,59));p(INK,(43,59),(43,23),(49,23),(56,59))
        r(INK,2,19,60,25);r(WHITE,5,22,54,19)
        for x in ([8,25,42] if n==0 else [5,23,41]):
            p('dc2626',(x,40),(x+7,22),(x+15,22),(x+8,40))
    elif kind in ['rock','pile']:
        for x,y,scale in ([(32,53,1)] if kind=='rock' else [(17,53,.7),(44,53,.8),(32,45,.65)]):
            p(INK,(x-22*scale,y+7),(x-18*scale,y-13),(x+4,y-23*scale-n*2),(x+20*scale,y-6),(x+21*scale,y+7))
            p('8b8490',(x-17*scale,y+3),(x-11*scale,y-12),(x+4,y-18*scale-n*2),(x+16*scale,y-4),(x+16*scale,y+3))
    else:
        r(INK,29,0,6,39);r('978273',31,1,2,35)
        if kind=='light':
            r(INK,18,26,28,36);r('504b59',21,29,22,30)
            for y in [34,44,54]:e(INK,32,y,6,4);e('695457',32,y-1,3,2)
        elif kind=='sale':
            r(INK,3,37,58,20);r('dc2626',5,39,54,16)
            letters=['111100111001111','010101111101101','100100100100111','111100110100111']
            for i,letter in enumerate(letters):
                for j,b in enumerate(letter):
                    if b=='1':r(WHITE,11+i*11+j%3*3,40+j//3*3,3,3)
        elif kind=='flags':
            r(INK,3,35,58,4)
            for x,color in [(5,'dc2626'),(24,'efaf50'),(43,'62a9ab')]:
                p(INK,(x,37),(x+16,37),(x+8,61));p(color,(x+2,39),(x+14,39),(x+8,56))
        elif kind=='branch':
            p(INK,(3,46),(32,35),(60,40),(61,49),(8,58))
            p('845238',(7,47),(32,39),(57,42),(56,47),(10,54))
            for x,y in [(11,48),(26,50),(46,43),(55,50)]:
                e(INK,x,y,9,8);e('729452',x,y,7,6)
        else:
            p(INK,(29,27),(35,27),(35,43),(46,48),(46,60),(39,63),(34,56),(36,51),(29,47))
            r('e5ab50',37,51,8,7)
    return c

sets = [
 ('cone',3,48,48,'jump-over',4),('pothole',3,64,48,'jump-over',3),
 ('tires',2,64,64,'dodge-around',2),('crate',1,64,64,'jump-over',2),('box',1,48,48,'jump-over',2),
 ('barrier',2,96,64,'dodge-around',2),('puddle',2,64,48,'slow-down',2),
 ('rock',2,48,48,'jump-over',2),('pile',2,64,64,'dodge-around',2),('chock',1,48,48,'jump-over',2),
 *((k,1,96,96,'overhead',1) for k in ['light','sale','flags','branch','cable'])
]
manifest=[]
for kind,count,w,h,behavior,weight in sets:
    for n in range(count):
        key=f'{kind}-{n+1}'
        file=('overhead/' if behavior=='overhead' else '')+key+'.png'
        data=draw(kind,n).render(w,h)
        (OUT/file).write_bytes(data)
        flat=kind in ['pothole','puddle']
        hit=(.16,.68,.68,.25) if behavior=='overhead' else (.15,.68 if flat else .36,.70,.26 if flat else .60)
        manifest.append(dict(key=key,family=kind,file=file,width=w,height=h,hit=hit,type=behavior,weight=weight))
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='ascii')
for row in manifest:
    row['data']='data:image/png;base64,'+base64.b64encode((OUT/row['file']).read_bytes()).decode()
(ROOT/'game_assets/obstacles.js').write_text('// Generated by tools/make_obstacle_sprites.py.\nwindow.RV_OBSTACLES = '+json.dumps(manifest,indent=2)+';\n',encoding='ascii')
