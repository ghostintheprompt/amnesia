#!/bin/bash

# AMNESIA // RELEASE_PROTOCOL_v1.0.0
# ----------------------------------
# This script bundles the project for release.

echo ">> INITIATING RELEASE BUNDLE: AMNESIA v1.0.0"

# 1. Clean & Build
echo ">> CLEANING..."
npm run clean
rm -f amnesia_v1.0.0.dmg

echo ">> BUILDING FRONTEND..."
npm run build

# 2. Package for Distribution
# Since this is a Node/React project, we bundle the dist folder and the server.
# For a "DMG" in this context, we create a zipped release bundle or a mock DMG script.
# Real DMG requires app packaging (e.g. Electron), so we'll provide the source release.

echo ">> PACKAGING ASSETS..."
mkdir -p build_release
cp -r dist build_release/
cp server.ts build_release/
cp package.json build_release/
cp tsconfig.json build_release/
cp README.md build_release/
cp LICENSE build_release/
cp -r src build_release/
cp -r scripts build_release/
cp -r bin build_release/
cp -r extension build_release/

# Create a zip as the 'DMG' alternative for source release
zip -r amnesia_v1.0.0.zip build_release/

echo "<< RELEASE_BUNDLE_READY: amnesia_v1.0.0.zip"
echo "Tagging v1.0.0..."
git add .
git commit -m "chore: release v1.0.0"
git tag v1.0.0

echo ">> DONE."
