@echo off
curl -X POST "http://168.220.234.220:8000/rest/v1/tenant_requests" ^
-H "Content-Type: application/json" ^
-H "apikey: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLXNlbGYtaG9zdCIsImlhdCI6MTc2NTU3NjQ3NywiZXhwIjoyMDgwOTM2NDc3fQ.Gv96bPOJdaiSPShpIae8jfcweCOnRCKbEwzVATm2r6U" ^
-H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLXNlbGYtaG9zdCIsImlhdCI6MTc2NTU3NjQ3NywiZXhwIjoyMDgwOTM2NDc3fQ.Gv96bPOJdaiSPShpIae8jfcweCOnRCKbEwzVATm2r6U" ^
-H "Prefer: return=representation" ^
-d "{\"requested_plan_id\":\"05b58104-b6ae-4e02-af00-1efe0c17fe42\",\"business_name\":\"TestBusiness\",\"subdomain\":\"testcurl123\",\"contact_name\":\"Test User\",\"contact_email\":\"test@example.com\",\"contact_phone\":\"+1234567890\"}"
