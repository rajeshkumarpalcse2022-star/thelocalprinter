# Local Printer Backend

Express.js backend API for the Local Printer printing-services marketplace.

## Setup

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Run

```bash
npm run dev
```

## Health Check

```
GET /api/health
```
