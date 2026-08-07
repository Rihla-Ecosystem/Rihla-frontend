#!/bin/bash
curl -s -v -X POST "http://localhost:3000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "sara2@example.com", "password": "password123", "firstName": "Sara", "lastName": "Rashid", "displayName": "Sara Al-Rashid"}'
