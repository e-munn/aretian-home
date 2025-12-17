#!/bin/bash
# Download Overture Maps building data for Barcelona Eixample
# Requires: pip install overturemaps

# Barcelona Eixample bounding box (roughly 1.6km x 1.6km centered on Eixample)
# Format: minLon,minLat,maxLon,maxLat
BBOX="2.148,41.383,2.165,41.399"

echo "Downloading Overture buildings for Barcelona Eixample..."
echo "Bounding box: $BBOX"

overturemaps download \
  --bbox=$BBOX \
  -f geojson \
  --type=building \
  -o public/barcelona-buildings.geojson

echo "Done! Saved to public/barcelona-buildings.geojson"
echo "File size:"
ls -lh public/barcelona-buildings.geojson
