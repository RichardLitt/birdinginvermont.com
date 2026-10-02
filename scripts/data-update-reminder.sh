#!/usr/bin/env bash
# Email a reminder to refresh the site's eBird data: the town, region and
# county maps, Project 251, and the Montpelier hotspot dates. Meant to run from
# cron each quarter, after eBird's mid-month EBD release.
#
# Usage: REMINDER_EMAIL=you@gmail.com bash scripts/data-update-reminder.sh [--dry-run]
#   --dry-run  print the email instead of sending it
#
# It sends through Gmail's SMTP server with curl, as REMINDER_EMAIL, to
# REMINDER_EMAIL. Gmail needs an app password (https://myaccount.google.com/apppasswords),
# kept in the macOS Keychain, not in this repo. Store it once with:
#   security add-generic-password -a you@gmail.com -s birdinginvermont-reminder -w
# (it prompts for the password). Other providers: set SMTP_URL, e.g.
# smtps://smtp.fastmail.com:465.
#
# Cron, at 9:00 on the 20th of March, June, September and December (crontab -e):
#   0 9 20 3,6,9,12 * REMINDER_EMAIL=you@gmail.com /bin/bash /path/to/birdinginvermont.com/scripts/data-update-reminder.sh >> /tmp/birdinginvermont-reminder.log 2>&1

set -euo pipefail

DRY_RUN=false
[ "${1:-}" = --dry-run ] && DRY_RUN=true

TO="${REMINDER_EMAIL:-}"
if [ -z "$TO" ]; then
  echo "Set REMINDER_EMAIL to the address to remind." >&2
  exit 1
fi
SMTP_URL="${SMTP_URL:-smtps://smtp.gmail.com:465}"
MONTH=$(date +'%B %Y')

MESSAGE=$(cat <<EOF
From: Birding in Vermont <$TO>
To: $TO
Subject: Time to update the eBird data on birdinginvermont.com ($MONTH)
Date: $(date -R 2>/dev/null || date '+%a, %d %b %Y %H:%M:%S %z')
Content-Type: text/plain; charset=utf-8

A new eBird Basic Dataset is out. To refresh the site (details in ebird-ext's
scripts/README.md and docs/project-251.md):

1. Download the latest Vermont EBD, with the sampling file:
   https://ebird.org/data/download
2. In src/ebird-ext, update the town, region and county maps:
   node scripts/updateAreaSightings.js <ebd file>
3. Project 251: cut this year's rows from the EBD, then
   node cli.js 251 --input=<file> --year=<year>
4. Montpelier hotspots:
   node montpelier.js hotspotDates <sampling file>
5. Open and merge the ebird-ext PR. Dependabot then opens a PR on the site
   that points it at the new ebird-ext; merge that once its checks pass.
6. Tell Project 251 birders which towns still need visits:
   https://birdinginvermont.com/251
EOF
)

if [ "$DRY_RUN" = true ]; then
  echo "$MESSAGE"
  exit 0
fi

if ! PASSWORD=$(security find-generic-password -a "$TO" -s birdinginvermont-reminder -w 2>/dev/null); then
  echo "No app password in the Keychain for $TO. Store it with:" >&2
  echo "  security add-generic-password -a $TO -s birdinginvermont-reminder -w" >&2
  exit 1
fi

printf '%s\n' "$MESSAGE" | curl --silent --show-error --ssl-reqd \
  --url "$SMTP_URL" \
  --user "$TO:$PASSWORD" \
  --mail-from "$TO" \
  --mail-rcpt "$TO" \
  --upload-file -
echo "$(date '+%F %T') Sent the data update reminder to $TO."
