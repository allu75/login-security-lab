import express from "express";
import session from "express-session";
import { init, get, run, all } from "./db.js";
import bcrypt from "bcrypt";

const app = express();
const PORT = process.env.PORT ?? 3000;

await init();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "dev-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: false
    }
  })
);

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  next();
};

app.get("/", (req, res) => {
  res.send(`
    <h1>Insecure Login Lab</h1>
    <ul>
      <li><a href="/index.html">Login</a></li>
      <li><a href="/profile.html">Profile</a> (requires login)</li>
      <li><a href="/debug/users">Debug: users</a></li>
    </ul>
  `);
});

app.get("/debug/users", async (req, res) => {
  const users = await all("SELECT id, email, password, role FROM users");
  res.json(users);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await get(
    `SELECT id, email, password, role
     FROM users
     WHERE email = ?`,
    [email]
  );

  if (!user) return res.status(404).json({ message: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  req.session.user = { id: user.id, email: user.email, role: user.role };

  res.json({ message: "Logged in", user: req.session.user });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

app.post("/profile/update", requireAuth, async (req, res) => {
  const { email } = req.body;

  await run(`
    UPDATE users
    SET email = ?, 
    WHERE id=?`,
    [email, req.session.user.id]
  );

  res.json({ message: "Profile updated" });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
