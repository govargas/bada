#!/usr/bin/env bash
#
# Smoke-test the favorites API end-to-end against a running backend.
# Usage:
#   1. In one terminal:  cd backend && npm run dev
#   2. In another:       ./backend/scripts/test-favorites.sh
#
# Optional env overrides:
#   BASE=http://localhost:3000   EMAIL=test@example.com   PASSWORD=testpass123
#   BEACH=SE0110000000000001

set -u

BASE="${BASE:-http://localhost:3000}"
EMAIL="${EMAIL:-test+favtest@example.com}"
PASSWORD="${PASSWORD:-testpass123}"
BEACH="${BEACH:-SE0110000000000001}"

pass=0; fail=0
green=$'\033[32m'; red=$'\033[31m'; dim=$'\033[2m'; reset=$'\033[0m'

# check <label> <actual> <expected>
check() {
  if [ "$2" = "$3" ]; then
    printf "  ${green}PASS${reset} %-42s (got %s)\n" "$1" "$2"; pass=$((pass+1))
  else
    printf "  ${red}FAIL${reset} %-42s (got %s, expected %s)\n" "$1" "$2" "$3"; fail=$((fail+1))
  fi
}

# Temp file for request bodies. Passing JSON via a file (--data-binary @file)
# makes the payload completely opaque to shell brace-expansion / word-splitting
# and to curl's {}[] URL globbing (also disabled with -g), which can otherwise
# mangle bodies containing commas like {"a":1,"b":2} in some environments.
BODY_FILE="$(mktemp -t bada-fav-body)"
trap 'rm -f "$BODY_FILE"' EXIT

# build_args METHOD PATH [DATA] [AUTH] -> populates global CURL_ARGS array
build_args() {
  local method="$1" path="$2" data="${3:-}" auth="${4:-}"
  CURL_ARGS=(-g -X "$method" "$BASE$path")
  [ -n "$auth" ] && CURL_ARGS+=(-H "Authorization: Bearer $auth")
  if [ -n "$data" ]; then
    printf '%s' "$data" > "$BODY_FILE"
    CURL_ARGS+=(-H "Content-Type: application/json" --data-binary @"$BODY_FILE")
  fi
}

# status METHOD PATH [DATA] [AUTH]  -> prints HTTP code
status() {
  build_args "$@"
  curl -s -o /dev/null -w "%{http_code}" "${CURL_ARGS[@]}"
}

# body METHOD PATH [DATA] [AUTH]  -> prints response body
body() {
  build_args "$@"
  curl -s "${CURL_ARGS[@]}"
}

echo "Testing favorites API at $BASE"
echo "User: $EMAIL   Beach: $BEACH"
echo

# 0. Server reachable?
if ! curl -s -o /dev/null "$BASE/api/health"; then
  echo "${red}Cannot reach $BASE — is the backend running? (cd backend && npm run dev)${reset}"
  exit 1
fi

# JSON payloads are built into variables FIRST. Never inline JSON inside a
# double-quoted "$(...)" — macOS bash 3.2 mis-parses nested quotes there and
# brace-expands the literal { } (e.g. {"a":1,"b":2} -> two words split at the
# comma), corrupting the body. Assigning to a variable first avoids this.
cred_json="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
fav_json="{\"beachId\":\"$BEACH\",\"note\":\"smoke test\"}"
fav_min_json="{\"beachId\":\"$BEACH\"}"
reorder_json="{\"order\":[\"$BEACH\"]}"

# 1. Register (201 first time, 409 if user already exists — both OK)
code=$(status POST /api/auth/register "$cred_json")
if [ "$code" = "201" ] || [ "$code" = "409" ]; then
  printf "  ${green}PASS${reset} %-42s (got %s)\n" "register (201 new / 409 existing)" "$code"; pass=$((pass+1))
else
  printf "  ${red}FAIL${reset} %-42s (got %s)\n" "register" "$code"; fail=$((fail+1))
fi

# 2. Login -> token
TOKEN=$(body POST /api/auth/login "$cred_json" | sed -E 's/.*"token":"([^"]+)".*/\1/')
if [ -n "$TOKEN" ] && [ "${TOKEN#eyJ}" != "$TOKEN" ]; then
  printf "  ${green}PASS${reset} %-42s ${dim}(%s…)${reset}\n" "login returns JWT" "${TOKEN:0:18}"; pass=$((pass+1))
else
  printf "  ${red}FAIL${reset} %-42s — cannot continue without a token\n" "login returns JWT"; fail=$((fail+1))
  echo; echo "${red}Aborting: login failed.${reset}"; exit 1
fi

# 3. Auth is enforced (no token -> 401)
code=$(status GET /api/favorites)
check "GET /favorites without token -> 401" "$code" "401"

# 4. List favorites with token -> 200
code=$(status GET /api/favorites '' "$TOKEN")
check "GET /favorites with token -> 200"    "$code" "200"

# 5. Clean slate: remove this beach if a previous run left it
status DELETE "/api/favorites/by-beach/$BEACH" '' "$TOKEN" >/dev/null

# 6. Add a favorite -> 201
code=$(status POST /api/favorites "$fav_json" "$TOKEN")
check "POST /favorites -> 201"               "$code" "201"

# 7. It shows up in the list
if body GET /api/favorites '' "$TOKEN" | grep -q "$BEACH"; then
  printf "  ${green}PASS${reset} %-42s\n" "favorite appears in list"; pass=$((pass+1))
else
  printf "  ${red}FAIL${reset} %-42s\n" "favorite appears in list"; fail=$((fail+1))
fi

# 8. Duplicate add -> 409
code=$(status POST /api/favorites "$fav_min_json" "$TOKEN")
check "POST same favorite again -> 409"      "$code" "409"

# 9. Reorder -> 204
code=$(status PATCH /api/favorites/reorder "$reorder_json" "$TOKEN")
check "PATCH /favorites/reorder -> 204"      "$code" "204"

# 10. Delete by beach -> 200
code=$(status DELETE "/api/favorites/by-beach/$BEACH" '' "$TOKEN")
check "DELETE /favorites/by-beach -> 200"    "$code" "200"

# 11. Gone from the list
if body GET /api/favorites '' "$TOKEN" | grep -q "$BEACH"; then
  printf "  ${red}FAIL${reset} %-42s (still present)\n" "favorite removed from list"; fail=$((fail+1))
else
  printf "  ${green}PASS${reset} %-42s\n" "favorite removed from list"; pass=$((pass+1))
fi

# 12. Decoupling check: health never touches the DB
code=$(status GET /api/health)
check "GET /api/health -> 200 (no DB)"       "$code" "200"

echo
if [ "$fail" -eq 0 ]; then
  echo "${green}All $pass checks passed.${reset}"
  exit 0
else
  echo "${red}$fail failed${reset}, ${green}$pass passed.${reset}"
  exit 1
fi
