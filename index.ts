// Jorge Sánchez López
// Parcial 

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import axios from "axios";

// Tipos
type Team = {
  id: number;
  name: string;
  city: string;
  titles: number;
};

// "Base de datos" simulada
let teams: Team[] = [
  { id: 1, name: "Lakers", city: "Los Angeles", titles: 17 },
  { id: 2, name: "Celtics", city: "Boston", titles: 17 },
];

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Middleware de error genérico ---
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error detectado:", err.message);
  res
    .status(500)
    .json({ error: "Error interno del servidor", detail: err.message });
};

const testApi = async () => {
    const api = axios.create({
    baseURL: `http://localhost:3000`,
  });
try {
    console.log("\nEquipos iniciales:");
    let res = await api.get("/teams");
    console.log(res.data);

    const newTeam = { name: "Bulls", city: "Chicago", titles: 6 };
    const created = await api.post("/teams", newTeam);
    console.log("Equipo creado:", created.data);

    console.log("\nObtener equipos tras la incorporación:");
    res = await api.get("/teams");
    console.log(res.data);

    await api.delete(`/teams/${created.data.id}`);

    console.log("\nObtener equipos tras la eliminación:");
    res = await api.get("/teams");
    console.log(res.data);

    console.log("\nTest Finalizado.");
  } catch (err: any) {
    console.error("ERROR", err.message);
  }
}

// --- Rutas ---
// --- GET ---
app.get("/", (req: Request, res: Response) => {
  res.send("Okey makei, te has conectado correctamente.");
});

app.get("/teams", (req: Request, res: Response) => {
  res.json(teams);
});

app.get("/teams/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const team = teams.find((t) => t.id === id);
   return team
    ? res.json(team)
    : res.status(404).json({ error: "Equipo no encontrado" });
});

// --- POST ---
app.post("/teams", (req: Request, res: Response) => {
  const { name, city, titles } = req.body;
  if (!name || !city || typeof titles !== "number") {
    return res.status(400).json({ message: "Datos no validos" });
  }

  const newTeam: Team = {
    id: Date.now(),
    name,
    city,
    titles,
  };

  teams.push(newTeam);
  res.status(201).json(newTeam);
});

// --- DELETE ---
app.delete("/teams/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const exists = teams.some((t) => t.id === id);
  if (!exists) {
    return res.status(404).json({ message: "Error 404" });
  }
  teams = teams.filter((t) => t.id !== id);
  res.json({ message: "Equipo eliminado correctamente" });
});

setTimeout(() => {
    testApi();
}, 1000);

// Middleware final
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de error
app.use(errorHandler);

// --- Inicio del servidor ---
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
});

/*
{
  "name": "Warriors",
  "city": "San Francisco",
  "titles": 7
}
*/