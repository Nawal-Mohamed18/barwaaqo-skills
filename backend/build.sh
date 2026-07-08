#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py seed_courses || true
python manage.py seed_admin || true
