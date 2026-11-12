# MoneyWise

The React frontend calls the Express API, which stores data in MongoDB. Spending analysis uses a separate Flask service.

## Local setup

1. Use Node.js 20 or newer and a **MongoDB replica set or sharded cluster**. A standalone MongoDB server cannot run the transactions used for balance changes and group repayments.
2. In `backend`, install dependencies with `npm ci`. Set `MONGODB_URI` and `JWT_SECRET` in `.env`, then run `npm start`. Set `FRONTEND_URL` when the frontend uses an origin other than `http://localhost:3000`.
3. In `frontend`, run `npm install` and `npm start`. Set `REACT_APP_API_URL` when the API runs somewhere other than `http://localhost:5000`.
4. In `python-service`, install `requirements.txt` into a Python environment and run `python app.py`. Set `FLASK_URL` in the backend if Flask uses a different address from `http://127.0.0.1:5001`.

The API starts after it verifies MongoDB connectivity and transaction support. `GET /health/ready` returns HTTP 503 when MongoDB is unavailable. Optional AI suggestions require both `GEMINI_API_KEY` and `GEMINI_MODEL`.

Existing wallets receive a paise-rounded opening checkpoint on their first balance change after this update. Historical changes before the checkpoint cannot be reconstructed from the new wallet ledger. Older roommate groups with no recorded owner remain usable, with archiving disabled until ownership can be established.

New keyed savings contributions return a compact receipt with the goal ID and saved balance. Fetch the goal to refresh its history. These receipts are retained for seven days. Replay records created before this change retain their existing lifetime.
