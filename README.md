🔐 # Device Auth

Device Auth is a **Devise-inspired authentication and authorization library for Node.js**.

It gives you:

- **Config-driven auth** (email + password, roles, JWT, password rules)
- **Plug-and-play Express routes** via `createAuthRouter`
- **JWT-based security** with `authenticate` middleware
- **Role-based authorization** with `authorize`
- **Database-agnostic adapter system** (`mongooseAdapter`, future Prisma, etc.)
- **Lifecycle hooks** (before/after register/login) for side effects

You bring your framework (Express) and database (Mongo, Prisma, SQL). Device Auth handles the rest.

---

## ✨ Features

- **✅ JWT Authentication (Access Tokens)**
- **🔑 Role-based Authorization**
- **🧩 Adapter Pattern (DB-agnostic)**
- **🚀 Ready-to-use Express routes** via `createAuthRouter`
- **🔒 Secure password hashing**
- **📦 Mongoose adapter (Stable)**
- **🧪 Prisma adapter (In progress – V2)**
- **🧠 Inspired by Ruby on Rails Devise**

---

## 📦 Installation

```bash
npm install device_auth
```

or

```bash
yarn add device_auth
```

`device_auth` itself is DB-agnostic. Database drivers / ORMs are **optional** and only required if you use the corresponding adapter:

- For Mongoose adapter: `mongoose`
- For Prisma adapter (V2): `@prisma/client`

---

## ⚡ Quick Start (Express + MongoDB)

### 1️⃣ Environment Variables

Create a `.env` file:

```env
MONGO_URL=mongodb://localhost:27017/device-auth
DEVICE_AUTH_JWT_SECRET=your-super-secret-key
```

### 2️⃣ User Model (Mongoose)

```ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model('User', UserSchema);
```

### 3️⃣ Express App Setup

```ts
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

import {
  deviceAuth,
  mongooseAdapter,
  createAuthRouter,
  authenticate,
  authorize,
} from 'node-device-auth';

import { User } from './models/User';

const app = express();
app.use(express.json());

// 1. Connect MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

// 2. Initialize Device Auth
deviceAuth
  .init({
    authType: 'jwt',
    signupFields: ['email', 'password'],
    defaultRole: 'user',
    password: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: true,
      saltRounds: 10,
    },
    token: {
      accessTokenTtl: '15m',
    },
  })
  .useAdapter(
    mongooseAdapter({
      userModel: User,
    }),
  );

// 3. Mount Auth Routes
app.use('/auth', createAuthRouter());

// 4. Example Protected Route
app.get(
  '/admin',
  authenticate,
  authorize('admin'),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  },
);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

## 🔁 Authentication Routes

The default router created by `createAuthRouter()` exposes:

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| POST   | `/auth/register` | Register new user |
| POST   | `/auth/login` | Login user         |
| GET    | `/auth/me`    | Get current user   |

You can mount it under any base path (e.g. `/api/auth`).

```ts
app.use('/auth', createAuthRouter());
```

---

## 🔐 Middleware

### `authenticate`

Validates the JWT from the `Authorization: Bearer <token>` header and attaches the user to `req.user`.

```ts
app.get('/profile', authenticate, (req, res) => {
  res.json(req.user);
});
```

### `authorize(...roles)`

Restricts access based on user role.

```ts
app.get('/admin', authenticate, authorize('admin', 'staff'), (req, res) => {
  res.json({ message: 'Admin or staff only' });
});
```

---

## 🧩 Adapter System

Device Auth uses a **pluggable adapter architecture**, allowing it to work with different databases without changing core logic.

Supported / planned adapters:

| Adapter  | Status                     |
| -------- | -------------------------- |
| Mongoose | ✅ Stable                  |
| Prisma   | 🚧 In Progress (V2)        |
| TypeORM  | ❌ Planned                 |

The public exports you can use:

- `mongooseAdapter` – helper for MongoDB via Mongoose
- `MongooseAdapter` – underlying class (advanced use)

---

## ⚙️ Configuration

The central entry point is `deviceAuth`:

```ts
import { deviceAuth, defaultConfig } from 'device_auth';

deviceAuth.init({
  ...defaultConfig,
  authType: 'jwt',
  defaultRole: 'user',
  signupFields: ['email', 'password'],
  // override anything you need
});
```

Key options:

- **`authType`**: currently `jwt`
- **`signupFields`**: required fields on registration
- **`defaultRole`**: assigned when no role is provided
- **`password`**:
  - `minLength`
  - `requireNumbers`
  - `requireSpecialChars`
  - `saltRounds`
- **`token`**:
  - `accessTokenTtl` (e.g. `15m`, `1h`)

The merged configuration is accessible via:

```ts
const config = deviceAuth.config;
```

---

## 🧠 Hooks

Hooks let you run side effects around key lifecycle events without forking core logic.

Supported hook names:

- `beforeRegister`
- `afterRegister`
- `beforeLogin`
- `afterLogin`

Register hooks on `deviceAuth`:

```ts
import { deviceAuth } from 'device_auth';

deviceAuth
  .registerHook('beforeRegister', async (createData) => {
    // e.g. validate extra fields, audit, etc.
  })
  .registerHook('afterRegister', async (user) => {
    // e.g. send welcome email
  })
  .registerHook('beforeLogin', async (user) => {
    // e.g. check if user is blocked
  })
  .registerHook('afterLogin', async (user) => {
    // e.g. log login event
  });
```

Hook errors are intentionally swallowed so they **never break core auth flow**.

---

## 🛣️ Roadmap (V2)

Planned for upcoming versions:

- 🔁 Refresh tokens
- 📱 Multi-device sessions
- 🚪 Logout (single device / all devices)
- 📧 Forgot & reset password
- ✅ Email verification
- 🧪 Stable Prisma adapter
- 🧠 Additional hooks & lifecycle events

---

## 🧪 Testing

```bash
npm test
```

Postman collection – _coming soon_.

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. **Create** a new branch

   ```bash
   git checkout -b feature/my-feature
   ```

3. **Commit** your changes
4. **Push** to your branch
5. **Open** a Pull Request

---

## 📄 License

MIT License © 2025

