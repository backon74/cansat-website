"""Rebuild index.html from src/index.src.html.
Run from the repo root:  python3 src/build.py
Inlines the Moonhouse logo font and the intro logo SVG into the page."""
import base64, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'src/index.src.html').read_text()
svg = (root / 'src/intro-logo.svg').read_text(); svg = svg[svg.index('<svg'):]
svg = re.sub(r'<text[\s\S]*?</text>', '', svg); svg = re.sub(r'<title>.*?</title>', '', svg)
svg = (svg.replace('class="cls-4"', 'class="cls-4 orbit"')
          .replace('<g id="Asset_3" data-name="Asset 3">', '<g id="Asset_3" class="badge">')
          .replace('<svg ', '<svg aria-hidden="true" focusable="false" ', 1))
font = base64.b64encode((root / 'assets/moonhouse.ttf').read_bytes()).decode()
out = src.replace('__MOONHOUSE__', 'data:font/ttf;base64,' + font).replace('__INTRO_SVG__', svg)
assert '__' not in out.replace('__proto__', ''), 'unfilled placeholder'
(root / 'index.html').write_text(out)
print('built index.html')
