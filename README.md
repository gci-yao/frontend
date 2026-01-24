# GreenHatah Fullstack (generated)

Structure:
- backend/  (Django REST)
- frontend/ (Vite + React)

Backend quick start:
1. cd backend
2. python -m venv venv
3. source venv/bin/activate
4. pip install -r requirements.txt
5. python manage.py migrate
6. python manage.py createsuperuser   (optionnel)
7. python manage.py runserver 8000

Frontend quick start:
1. cd frontend
2. npm install
3. copy .env.example to .env and set VITE_API_BASE_URL=http://localhost:8000/api
4. npm run dev

Après démarrage, ouvre:
- Frontend: http://localhost:5173
- Backend admin: http://localhost:8000/admin
