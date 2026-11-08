"""Repo-native vector swatches. These are illustrations, never client-work photos."""
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'public'
images = root / 'images'
images.mkdir(parents=True, exist_ok=True)

defs = '''<defs>
<filter id="shadow" x="-80%" y="-50%" width="260%" height="230%"><feDropShadow dx="12" dy="24" stdDeviation="15" flood-color="#5d4335" flood-opacity=".17"/></filter>
<linearGradient id="gloss" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#fff" stop-opacity=".5"/><stop offset=".26" stop-color="#fff" stop-opacity=".04"/><stop offset=".72" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient>
<linearGradient id="handle" x1="0" x2="1" y1="0" y2=".1"><stop stop-color="#f8f2e6"/><stop offset=".4" stop-color="#eae0cf"/><stop offset="1" stop-color="#c7b7a0"/></linearGradient>
<radialGradient id="back"><stop stop-color="#f3eee4"/><stop offset="1" stop-color="#dfd5c4"/></radialGradient>
</defs>'''

def nail(x, y, color, angle=0, scale=1, french=False, line=False, handle=False):
    shape = 'M-53 13C-53-45-32-83 0-83S53-45 53 13V92Q53 111 34 111H-34Q-53 111-53 92Z'
    base = f'<path d="{shape}" fill="{color}"/>'
    if french:
        base += '<path d="M-52 5C-47-51-25-83 0-83S47-51 52 5C40-29 15-43 0-43S-40-29-52 5Z" fill="#f9f5eb"/>'
    if line:
        base += '<path d="M-55 63C18 45-17-33 54-27" fill="none" stroke="#6e3c43" stroke-width="2"/><path d="M-55 71C16 53-9-22 54-18" fill="none" stroke="#faf4e9" stroke-width="3"/>'
    base += f'<path d="{shape}" fill="url(#gloss)"/><path d="M-34-13C-34-38-20-59-10-61" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="4" stroke-linecap="round"/>'
    if handle:
        base = '<rect x="-12" y="65" width="24" height="275" rx="12" fill="url(#handle)"/>' + base
    return f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})" filter="url(#shadow)">{base}</g>'

colors = {
    'nude': ('#e9ded4', '#d1aea2', False, False),
    'french': ('#e7e3d9', '#d3b5a8', True, False),
    'cherry': ('#dfd2c9', '#6c293b', False, False),
    'line': ('#e6ded1', '#d3b5a7', False, True),
    'olive': ('#deded1', '#7d8268', False, False),
    'pink': ('#ead8d5', '#bb4f70', False, False),
}
for name, (bg, color, french, line) in colors.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700">{defs}<rect width="600" height="700" fill="{bg}"/>'
    svg += '<ellipse cx="460" cy="130" rx="240" ry="230" fill="#f9f5eb" opacity=".2"/><path d="M-100 570 600 40" stroke="#f8f2e4" stroke-width="170" opacity=".12"/>'
    svg += '<ellipse cx="300" cy="570" rx="230" ry="65" fill="#ad9982" opacity=".06"/>'
    for x,y,angle,scale in [(175,330,-24,.99),(303,276,-7,1.12),(423,360,18,1.03)]:
        svg += nail(x,y,color,angle,scale,french,line,True)
    svg += '<circle cx="332" cy="637" r="13" fill="#b9a58b"/><circle cx="332" cy="637" r="7" fill="#e4d8c5"/>'
    svg += '<text x="32" y="660" font-family="Georgia,serif" font-size="12" letter-spacing="3" fill="#897867">COLOR STUDY</text></svg>'
    (images / f'{name}.svg').write_text(svg, encoding='utf-8')

hero = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1000">{defs}<rect width="850" height="1000" fill="url(#back)"/>'
hero += '<path d="M-100 780 850-80" stroke="#f8f1e2" stroke-width="250" opacity=".18"/><path d="M300 1100 1000 400" stroke="#b1a183" stroke-width="2" opacity=".2"/>'
hero += '<ellipse cx="480" cy="600" rx="265" ry="290" fill="#5c4b36" opacity=".06" transform="rotate(-25 480 600)"/>'
hero += '<g transform="rotate(-15 430 530)"><rect x="195" y="180" width="480" height="650" rx="230" fill="#eee6d7" filter="url(#shadow)"/><rect x="209" y="195" width="452" height="620" rx="220" fill="none" stroke="#f9f4e9" stroke-opacity=".65"/></g>'
hero += nail(257,480,'#d2afa2',-29,1.55,False,False,True)
hero += nail(435,387,'#d7bcb0',-3,1.58,True,False,True)
hero += nail(603,498,'#713044',27,1.55,False,False,True)
hero += '<circle cx="448" cy="873" r="20" fill="#b7a58a" filter="url(#shadow)"/><circle cx="448" cy="873" r="10" fill="#e4d9c5"/>'
hero += '<text x="680" y="755" font-family="Georgia,serif" font-size="79" fill="#9e8c73" transform="rotate(-90 680 755)">little details.</text>'
hero += '<circle cx="721" cy="171" r="52" fill="none" stroke="#b9ab93" stroke-width="1"/><path d="M721 148v46m-23-23h46m-39-16 32 32m-32 0 32-32" stroke="#ae9b80" stroke-width="1"/>'
hero += '</svg>'
(images / 'hero.svg').write_text(hero, encoding='utf-8')
(root / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#663847"/><text x="11" y="44" fill="#f8f6f1" font-family="Georgia,serif" font-size="42" font-style="italic">m.</text></svg>', encoding='utf-8')
print('Created 7 demo SVG illustrations and favicon.')
