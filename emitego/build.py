# Arma emitego/index.html a partir de page.tpl.html + parrilla.json
import json
d = json.load(open("emitego/parrilla.json"))
s = json.dumps(d, ensure_ascii=False).replace("</", "<\\/")
open("emitego/index.html", "w").write(open("emitego/page.tpl.html").read().replace("__DATA__", s))
