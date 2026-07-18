#!/usr/bin/env bash
# smoke_test.sh — end-to-end HTTP smoke test for TryItOn!
# Starts the server from /workspace, registers a user, logs in,
# exercises every protected route + API, and reports a summary.
set -u

cd /workspace || { echo "FAIL: cannot cd /workspace"; exit 1; }

# ---- 1. Start a clean server instance ----
pkill -9 -f "node app.js" 2>/dev/null
sleep 1
rm -f /tmp/server.log /tmp/cookies.txt

# Start server detached so this script can continue
setsid node app.js > /tmp/server.log 2>&1 < /dev/null &
SRV_PID=$!
disown 2>/dev/null || true
echo "→ server pid: $SRV_PID"

# Wait for port 3000 to respond (max ~10s)
ready=0
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo 000)
  if [ "$code" = "200" ]; then ready=1; break; fi
  sleep 0.5
done
if [ "$ready" != "1" ]; then
  echo "FAIL: server did not start. Log:"
  cat /tmp/server.log
  kill -9 $SRV_PID 2>/dev/null
  exit 1
fi
echo "✓ server is up"

PASS=0
FAIL=0
check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "✓ $label → HTTP $actual"
    PASS=$((PASS+1))
  else
    echo "✗ $label → expected $expected, got $actual"
    FAIL=$((FAIL+1))
  fi
}

B="http://localhost:3000"
C=/tmp/cookies.txt
TS=$(date +%s)

# ---- 2. Public pages ----
check "GET / (landing)"            200 "$(curl -s -o /dev/null -w '%{http_code}' $B/)"
check "GET /auth/register"         200 "$(curl -s -o /dev/null -w '%{http_code}' $B/auth/register)"
check "GET /auth/login"            200 "$(curl -s -o /dev/null -w '%{http_code}' $B/auth/login)"
check "GET /data/shops.json"       200 "$(curl -s -o /dev/null -w '%{http_code}' $B/data/shops.json)"
check "GET /css/variables.css"     200 "$(curl -s -o /dev/null -w '%{http_code}' $B/css/variables.css)"
check "GET /js/api.js"             200 "$(curl -s -o /dev/null -w '%{http_code}' $B/js/api.js)"
check "GET /images/avatar/logo.png" 200 "$(curl -s -o /dev/null -w '%{http_code}' $B/images/avatar/logo.png)"
check "GET /nope (404 page)"       404 "$(curl -s -o /dev/null -w '%{http_code}' $B/nope)"

# ---- 3. Auth: register ----
EMAIL="tester_${TS}@tryiton.test"
check "POST /auth/register" 302 "$(curl -s -o /dev/null -w '%{http_code}' -c $C \
  -d "email=$EMAIL" -d "username=tester_${TS}" -d "password=Secret123" -d "confirmPassword=Secret123" \
  $B/auth/register)"

# ---- 4. Auth: login (fresh cookie jar) ----
rm -f $C
check "POST /auth/login" 302 "$(curl -s -o /dev/null -w '%{http_code}' -c $C \
  -d "email=$EMAIL" -d "password=Secret123" \
  $B/auth/login)"

# ---- 5. Protected pages (with session cookie) ----
for p in dashboard profile avatar design wardrobe shop recommend; do
  check "GET /$p" 200 "$(curl -s -o /dev/null -w '%{http_code}' -b $C $B/$p)"
done

# ---- 6. Protected pages WITHOUT cookie → should redirect (302) ----
check "GET /dashboard (no auth)" 302 "$(curl -s -o /dev/null -w '%{http_code}' $B/dashboard)"

# ---- 7. API: profile ----
check "GET /api/me" 200 "$(curl -s -o /dev/null -w '%{http_code}' -b $C $B/api/me)"
ME=$(curl -s -b $C $B/api/me)
echo "   /api/me body: $ME"

# ---- 8. API: create outfit ----
check "POST /api/outfits (create)" 201 "$(curl -s -o /dev/null -w '%{http_code}' -b $C \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Outfit","shirt":"red","pants":"blue","hat":"yellow"}' \
  $B/api/outfits)"

# ---- 9. API: list outfits ----
LIST=$(curl -s -b $C $B/api/outfits)
check "GET /api/outfits" 200 "$(curl -s -o /dev/null -w '%{http_code}' -b $C $B/api/outfits)"
echo "   /api/outfits body: $LIST"

# grab first outfit id
OID=$(echo "$LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)
if [ -n "$OID" ]; then
  check "POST /api/outfits/$OID/duplicate" 201 "$(curl -s -o /dev/null -w '%{http_code}' -b $C -X POST $B/api/outfits/$OID/duplicate)"
  check "DELETE /api/outfits/$OID" 204 "$(curl -s -o /dev/null -w '%{http_code}' -b $C -X DELETE $B/api/outfits/$OID)"
else
  echo "✗ could not extract outfit id"
  FAIL=$((FAIL+1))
fi

# ---- 10. Shops JSON sanity ----
SHOPS=$(curl -s $B/data/shops.json)
SHOP_COUNT=$(echo "$SHOPS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('shops', [])))" 2>/dev/null)
if [ "$SHOP_COUNT" = "3" ]; then
  echo "✓ /data/shops.json → 3 shops"
  PASS=$((PASS+1))
else
  echo "✗ /data/shops.json → expected 3 shops, got $SHOP_COUNT"
  FAIL=$((FAIL+1))
fi

# ---- 11. Logout ----
check "GET /auth/logout" 302 "$(curl -s -o /dev/null -w '%{http_code}' -b $C -c $C $B/auth/logout)"
# After logout, protected page should redirect (cookie cleared)
check "GET /dashboard (after logout)" 302 "$(curl -s -o /dev/null -w '%{http_code}' -b $C $B/dashboard)"

# ---- Summary ----
echo ""
echo "============================="
echo "  SMOKE TEST COMPLETE"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "============================="

# clean up
kill -9 $SRV_PID 2>/dev/null
[ "$FAIL" = "0" ] && exit 0 || exit 1
