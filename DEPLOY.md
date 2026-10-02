# Deploy Synesis ops dashboard (static)

Team: Caleb Leavesley's projects (`caleb-leavesleys-projects` / `team_kWigHoS0WclVWc4Gt7Vh9utU`)

## Refresh board then redeploy
```bash
cp /workspace/synesis-ops-dashboard/data/board.json /workspace/synesis-ops-dashboard/deploy/board.json
# fix thumbs to relative if needed
cd /workspace/synesis-ops-dashboard/deploy
npx vercel --prod --yes --scope caleb-leavesleys-projects
```

Or use Vercel MCP `create_deployment` with inlined files from this folder.

## Auth note
Box `VERCEL_TOKEN` was invalid at seed time; MCP `user-Vercel` on parent is the working path.
