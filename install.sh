#!/bin/bash
# script to sync into this repo into users home directory

SCRIPTNAME=$(basename "$0")

# Change to directory where the install script resides
cd "$(dirname "$0")"

echo "Updating the git submodule for applauncher2."
git submodule update --init --recursive

echo "Copying the applauncher2 configuration."
cp ai-to-touch.config.yml applauncher2/cfg/ai-to-touch.config.yml

echo "Done."
