#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://localhost:8000}"
OUTPUT_DIR="${2:-artifacts/responsive}"
AGE_GATE_BYPASS_PARAM="${AGE_GATE_BYPASS_PARAM:-qa_age_verified=1}"

VIEWPORTS=(
  "360x800"
  "390x844"
  "768x1024"
  "1024x768"
  "1280x800"
  "1440x900"
)

ROUTES=(
  "/us/cart"
  "/us/checkout"
  "/us/account"
)

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run responsive smoke checks." >&2
  exit 1
fi

if ! curl -sfI "${BASE_URL}" >/dev/null 2>&1; then
  echo "Storefront not reachable at ${BASE_URL}." >&2
  echo "Start the app first (for example: yarn dev)." >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

timestamp="$(date +%Y%m%d-%H%M%S)"
run_dir="${OUTPUT_DIR}/${timestamp}"
mkdir -p "${run_dir}"

echo "Saving screenshots to ${run_dir}"

for route in "${ROUTES[@]}"; do
  route_name="$(echo "${route}" | sed 's#^/##; s#/#-#g')"
  for viewport in "${VIEWPORTS[@]}"; do
    width="${viewport%x*}"
    height="${viewport#*x}"
    if [[ "${route}" == *"?"* ]]; then
      target="${BASE_URL}${route}&${AGE_GATE_BYPASS_PARAM}"
    else
      target="${BASE_URL}${route}?${AGE_GATE_BYPASS_PARAM}"
    fi
    out_file="${run_dir}/${route_name}-${viewport}.png"

    echo "Capturing ${target} @ ${viewport}"
    npx playwright screenshot \
      --browser chromium \
      --wait-for-timeout 1200 \
      --viewport-size "${width},${height}" \
      "${target}" \
      "${out_file}" >/dev/null
  done
done

echo "Responsive smoke capture complete."
echo "Artifacts: ${run_dir}"
