Clinical Management Dashboard

This project is a clinical operations dashboard built with Next.js (frontend) and integrated with external APIs for authentication, patient management, and appointments.

✅ Features Implemented

Dashboard (Static Layout)
Initial dashboard with basic navigation and static overview sections.
Authentication (API Integrated)
Login integrated with backend API.
Session-based redirection after login.

Patients Module

a) Fetch all patients (GET /patients)

b) Fetch patient by ID (GET /patients/:id)

c) Create new patient (POST /patients)

Appointments Module (Partial)

a) Integrated API connection.

b) Appointment creation in progress.

⏳ Pending / Future Enhancements

Complete Appointments CRUD (update, list, delete).

Add Clinical Modules (medications, allergies, conditions).

Improve Dashboard with dynamic data.

Implement Role-based access control (RBAC) for provider/admin.

🛠️ Tech Stack

Frontend: Next.js 14, React, TailwindCSS, ShadCN/UI

State & Data: React Query, Axios

Backend API: External healthcare APIs (Cerbo / ModMed Sandbox integration in progress)

🌐 API Endpoints Used

Authentication

POST ema/ws/oauth2/grant

Patient Module

a) Create Patient → POST ema/fhir/v2/Patient

b) Get Patient List → GET ema/fhir/v2/Patient

c) Get Patient by ID → GET ema/fhir/v2/Patient/:id