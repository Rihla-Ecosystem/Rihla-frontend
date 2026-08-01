#!/bin/bash
# 1. Register
curl -s -X POST "http://localhost:3000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "sara3@example.com", "password": "Password123", "display_name": "Sara Al-Rashid", "gender": "FEMALE", "nationality": "Egyptian", "language": ["en", "ar"]}' > /dev/null

# 2. Login
LOGIN_RES=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "sara3@example.com", "password": "Password123"}')

TOKEN=$(echo $LOGIN_RES | jq -r '.accessToken')
echo "Token: $TOKEN"

# 3. Call /env
echo "Calling /env"
curl -s -X GET "http://localhost:3000/api/env?lat=29.9792&lon=31.1342" \
     -H "Authorization: Bearer $TOKEN" | jq

# 4. Call /geo/pois
echo "Calling /geo/pois"
curl -s -X GET "http://localhost:3000/api/geo/pois?lat=29.9792&lon=31.1342" \
     -H "Authorization: Bearer $TOKEN" | jq
