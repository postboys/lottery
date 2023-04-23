#!/bin/bash
cd $(dirname $0)
npm ci --omit=dev
rm -f layer.zip
zip -r layer.zip ./node_modules/*
