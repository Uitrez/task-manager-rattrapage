Task Manager – Projet Fullstack

- Projet fullstack de gestion de tâches avec :
- Backend : Node.js, Express, Sequelize, PostgreSQL
- Frontend : React (Vite)
- Base de données : PostgreSQL via Docker Compose
- Authentification : JWT
- RBAC : owner / editor / reader
- Gestion des conflits : Optimistic concurrency (HTTP 428 / 409)

Prérequis :

- Node.js ≥ 18
- Docker Desktop (avec Docker Compose)
- Git

Vérification :

node -v
docker -v
docker compose version

Structure du projet :
task-manager-rattrapage/
│
├── api/            
├── web/            
├── compose.yml     
└── README.md

Lancement de la base de données (Docker) :
- docker compose up -d

Base PostgreSQL disponible sur :

- host : localhost
- port : 5432
- db : taskdb
- user : app
- password : app

Backend (API)

1) Installation :
cd api
npm install

2) Variables d’environnement :

Créer le fichier api/.env à partir de l’exemple :
cp .env.example .env

Contenu attendu :

DATABASE_URL=postgres://app:app@localhost:5432/taskdb
JWT_SECRET=supersecret
PORT=3001

3) Migrations :
npm run migrate

4) Lancer l’API :
npm run dev

API disponible sur :

http://localhost:3001

Test :

curl http://localhost:3001/health

Réponse attendue :

{"ok":true}



Frontend (React)

1) Installation :
cd web
npm install

2) Lancer le front :
npm run dev

Frontend disponible sur :
http://localhost:5173


Authentification

Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'


Le token JWT doit être envoyé dans le header :

Authorization: Bearer <TOKEN>


Gestion des listes

Créer une liste
curl -X POST http://localhost:3001/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ma liste","isCoop":true}'

Voir mes listes
curl http://localhost:3001/lists \
  -H "Authorization: Bearer $TOKEN"


  Gestion des membres (listes coop)

Ajouter un membre (owner only)
curl -X POST http://localhost:3001/lists/:id/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","role":"editor"}'

Retirer un membre (owner only)
curl -X DELETE http://localhost:3001/lists/:id/members/:userId \
  -H "Authorization: Bearer $TOKEN"


  Gestion des tâches

Créer une tâche
curl -X POST http://localhost:3001/lists/:id/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ma tâche"}'


Gestion des conflits (Optimistic Concurrency)

Principe
- Le serveur renvoie Last-Modified
- Le client doit envoyer If-Unmodified-Since
- Sinon → 428 Precondition Required
- Si la ressource a changé → 409 Conflict


Exemple complet
1) Création
curl -i -X POST http://localhost:3001/lists/2/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Task concurrency"}'


Repérer le header :

Last-Modified: Fri, 09 Jan 2026 13:30:39 GMT

2) PATCH sans header → 428
curl -i -X PATCH http://localhost:3001/tasks/3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

3) PATCH avec header valide → 200
curl -i -X PATCH http://localhost:3001/tasks/3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "If-Unmodified-Since: Fri, 09 Jan 2026 13:30:39 GMT" \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

4) PATCH avec ancien header → 409
curl -i -X PATCH http://localhost:3001/tasks/3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "If-Unmodified-Since: Fri, 09 Jan 2026 13:30:39 GMT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Conflict"}'


  Conclusion

Ce projet implémente :
- une API REST sécurisée
- un contrôle d’accès par rôles
- une gestion avancée des conflits
- un frontend React fonctionnel
- une base de données persistante via Docker