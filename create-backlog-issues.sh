#!/bin/bash

# This script creates GitHub issues from markdown files in docs/issues/
# Requires: GitHub CLI (gh) and authentication (gh auth login)

gh issue create --title "🐛 Datetime parsing error: can't subtract offset-naive and offset-aware datetimes" \
  --body-file docs/issues/datetime-offset-bug.md \
  --label bug,backlog,cache