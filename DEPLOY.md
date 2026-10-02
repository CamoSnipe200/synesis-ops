# Deploy Synesis ops dashboard

## Live (phone / off-Hyperion)
**https://camosnipe200.github.io/synesis-ops/**

Repo: https://github.com/CamoSnipe200/synesis-ops (public GitHub Pages, `main` `/`)

## Refresh remote after board edits
```bash
# 1) edit canonical board
$EDITOR /workspace/synesis-ops-dashboard/data/board.json

# 2) sync static export
cp /workspace/synesis-ops-dashboard/data/board.json /workspace/synesis-ops-dashboard/deploy/board.json
# ensure receipt thumbs in deploy/board.json use ./receipts/*.jpg
python3 - <<'PY'
import json
from pathlib import Path
p=Path('/workspace/synesis-ops-dashboard/deploy/board.json')
b=json.loads(p.read_text())
for r in b.get('receipts',[]):
    stem=Path(r['thumb']).stem
    r['thumb']=f'./receipts/{stem}.jpg'
p.write_text(json.dumps(b,indent=2)+'\n')
PY

# 3) push
cd /workspace/synesis-ops-dashboard/deploy
git add -A && git -c user.email=ops@synesis.local -c user.name=Goliath commit -m "refresh board" && git push
```

## Vercel (preferred long-term — blocked today)
Caleb team `caleb-leavesleys-projects` / MCP user `calebleavesley-2952` (hobby):
- `create_project` → **403** (no permission to create project)
- Box `VERCEL_TOKEN` invalid
- Goliath/EL: grant project-create on the team (or create `synesis-ops` project in dashboard), then redeploy from `deploy/` via MCP `create_deployment` or `npx vercel --prod --scope caleb-leavesleys-projects`.

## Box (always)
```bash
cd /workspace/synesis-ops-dashboard && node server.mjs
# http://127.0.0.1:3847/  (also 0.0.0.0:3847)
```
