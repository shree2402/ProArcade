# API Documentation

Base URL:

```text
http://localhost:4000
```

Production URL should be configured with your deployed backend domain.

All authenticated routes require httpOnly cookies set by login/register.

## POST `/auth/register`

### Purpose

Create a new user account and set authentication cookies.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

### Example Request

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password1234"}'
```

### Example Response

```json
{
  "user": {
    "id": "cmq_user_id",
    "email": "user@example.com",
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "onboardingRequired": true
}
```

### Status Codes

- `201` Created
- `400` Validation error
- `409` Email or password already exists
- `429` Rate limited

## POST `/auth/login`

### Purpose

Authenticate a user and set JWT cookies.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

### Example Response

```json
{
  "user": {
    "id": "cmq_user_id",
    "email": "user@example.com",
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "onboardingRequired": false
}
```

### Status Codes

- `200` OK
- `400` Validation error
- `401` Invalid credentials
- `429` Rate limited

## GET `/auth/me`

### Purpose

Return the currently authenticated user.

### Request Body

None.

### Example Request

```bash
curl http://localhost:4000/auth/me --cookie "pa_access=..."
```

### Example Response

```json
{
  "user": {
    "id": "cmq_user_id",
    "email": "user@example.com",
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "onboardingRequired": false
}
```

### Status Codes

- `200` OK
- `401` Authentication required

## POST `/profile/tasks`

### Purpose

Save onboarding task preferences.

### Request Body

```json
{
  "favoriteTasks": [
    { "name": "Read fiction", "durationMinutes": 20 },
    { "name": "Sketch", "durationMinutes": 15 },
    { "name": "Listen to music", "durationMinutes": 10 }
  ],
  "productiveTasks": [
    { "name": "Deep work sprint", "durationMinutes": 45 },
    { "name": "Workout", "durationMinutes": 40 },
    { "name": "Clean desk", "durationMinutes": 30 }
  ]
}
```

### Example Response

```json
{
  "ok": true,
  "onboardingRequired": false,
  "tasks": [
    {
      "id": "task_id",
      "userId": "user_id",
      "type": "FAVORITE",
      "name": "Read fiction",
      "durationMinutes": 20
    }
  ]
}
```

### Status Codes

- `201` Created
- `400` Validation error
- `401` Authentication required

## POST `/game/start`

### Purpose

Create or resume a game session.

### Request Body

None.

### Example Response

```json
{
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "status": "ACTIVE",
    "currentTile": 1,
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "pendingTask": null,
  "board": {
    "ladders": [{ "from": 4, "to": 14, "kind": "LADDER" }],
    "snakes": [{ "from": 17, "to": 7, "kind": "SNAKE" }],
    "winTile": 100
  }
}
```

### Status Codes

- `201` Created/resumed
- `401` Authentication required

## POST `/game/roll`

### Purpose

Roll a six-sided die, move the user, assign tasks on snake/ladder tiles, and persist game state.

### Request Body

None.

### Example Response

```json
{
  "dice": 5,
  "landedTile": 9,
  "finalTile": 31,
  "effect": { "from": 9, "to": 31, "kind": "LADDER" },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "status": "LOCKED_BY_LADDER",
    "currentTile": 31,
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "assignedTask": {
    "id": "assigned_task_id",
    "gameSessionId": "session_id",
    "taskName": "Read fiction",
    "durationMinutes": 20,
    "status": "PENDING",
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "gallery": [],
  "victory": false
}
```

### Status Codes

- `200` OK
- `401` Authentication required
- `409` Board locked or session complete

## POST `/game/verify-proof`

### Purpose

Upload task proof image, store it, verify it, unlock the board if accepted, and save it to the gallery.

### Request Body

`multipart/form-data`

| Field | Type | Required |
| --- | --- | --- |
| `image` | JPEG, PNG, or WebP file | Yes |

### Example Request

```bash
curl -X POST http://localhost:4000/game/verify-proof \
  -b cookies.txt \
  -F "image=@proof.jpg"
```

### Example Success Response

```json
{
  "verification": {
    "verified": true,
    "reason": "The proof image matches the assigned task.",
    "confidence": 0.99
  },
  "unlocked": true,
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "status": "ACTIVE",
    "currentTile": 31,
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "media": {
    "taskName": "Read fiction",
    "s3Url": "http://localhost:4000/uploads/proofs/file.jpg"
  }
}
```

### Example Rejection Response

```json
{
  "verification": {
    "verified": false,
    "reason": "The image does not prove the assigned task.",
    "confidence": 0.42
  },
  "unlocked": false
}
```

### Status Codes

- `200` Verified
- `400` Missing/invalid image
- `401` Authentication required
- `409` No pending task
- `422` Proof rejected
- `503` AWS credentials missing

## GET `/game/state`

### Purpose

Return the persisted game session, pending task, board config, gallery, and victory state.

### Example Response

```json
{
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "status": "ACTIVE",
    "currentTile": 31,
    "createdAt": "2026-06-08T00:00:00.000Z"
  },
  "pendingTask": null,
  "gallery": [],
  "board": {
    "ladders": [],
    "snakes": [],
    "effects": [],
    "winTile": 100
  },
  "victory": false
}
```

### Status Codes

- `200` OK
- `401` Authentication required

## GET `/gallery`

### Purpose

Return verified proof images for the authenticated user.

### Example Response

```json
{
  "items": [
    {
      "id": "media_id",
      "userId": "user_id",
      "taskName": "Read fiction",
      "s3Url": "http://localhost:4000/uploads/proofs/file.jpg",
      "uploadedAt": "2026-06-08T00:00:00.000Z"
    }
  ]
}
```

### Status Codes

- `200` OK
- `401` Authentication required
