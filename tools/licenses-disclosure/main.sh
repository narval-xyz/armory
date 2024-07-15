#!/bin/bash

licenses=$(npx license-checker --production --json)

if [ $? -ne 0 ]; then
  echo "Failed to generate the license report"
  exit 1
fi

echo "# Licenses Disclosure"
echo ""
echo "This project includes third-party libraries listed below. Each library is provided under its own license."
echo "- [Open Policy Engine](https://github.com/open-policy-agent/opa/) - Apache-2.0"
echo "$licenses" | jq -r 'to_entries | sort_by(.key)[] |
  if .value.repository then
    "- [\(.key)](\(.value.repository)) - \(.value.licenses)"
  else
    "- \(.key) - \(.value.licenses)"
  end'
