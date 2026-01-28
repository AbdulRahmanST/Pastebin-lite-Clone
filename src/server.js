import express from "express";
import health from "./routes/health.js";
import pastes from "./routes/pastes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pastebin Lite API Running");
});

app.use("/api/healthz", health);
app.use("/api/pastes", pastes);
app.use("/p", pastes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Running on", PORT));
