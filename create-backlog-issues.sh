#!/bin/bash

# This script creates GitHub issues from markdown files in docs/issues/
# Requires: GitHub CLI (gh) and authentication (gh auth login)



gh issue create --title "🌐 Display and manage Enode webhook subscription status" \
  --body-file docs/issues/enode-webhook-status.md \
  --label enhancement,backlog,admin,enode
