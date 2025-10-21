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
type LD = {
    id: number
    filmName: string
    rotationType: "CAV" | "CLV",
    region: string,
    lengthMinutes: number,
    videoFormat: "NTSC" | "PAL"
};

// "Base de datos" simulada
let discos: LD[] = [
    { id: 1, filmName: "War Hourse", rotationType: "CAV", region: "España", lengthMinutes: 120, videoFormat: "NTSC" },
    { id: 2, filmName: "El Nano", rotationType: "CAV", region: "España", lengthMinutes: 120, videoFormat: "NTSC" },
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
    //Obtener todos los discos (GET /ld).
    console.log("\nDiscos iniciales:");
    let res = await api.get("/ld");
    // Muestra la lista inicial en consola.
    console.log(res.data);

    //Crear un nuevo disco (POST /ld)
    const newTeam = { filmName: "Los 100", rotationType: "CAV", region: "Española", lengthMinutes: 150, videoFormat: "PAL" };
    const created = await api.post("/ld", newTeam);
    console.log("Disco creado:", created.data);

    //Volver a obtener todos los equipos (GET /teams)
    //Comprueba que aparece el nuevo equipo
    console.log("\nObtener discos tras la incorporación:");
    res = await api.get("/ld");
    console.log(res.data);

    //Eliminar ese equipo (DELETE /ld/:id)
    console.log("\nEliminando disco:");
    await api.delete(`/ld/${created.data.id}`);

    //Mostrar la lista final
    console.log("\nObtener discos tras la eliminación:");
    res = await api.get("/ld");
    console.log(res.data);

    //Finalizar test
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

app.get("/ld", (req: Request, res: Response) => {
  res.json(discos);
});

app.get("/ld/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const team = discos.find((t) => t.id === id);
   return team
    ? res.json(team)
    : res.status(404).json({ error: "Disco no encontrado" });
});

// --- POST ---
app.post("/ld", (req: Request, res: Response) => {
  const { filmName, rotationType, region, lengthMinutes, videoFormat } = req.body;
  if (!filmName || !rotationType|| !region || !lengthMinutes || !videoFormat) {
    return res.status(400).json({ message: "Datos no validos" });
  }

  const newTeam: LD = {
    id: Date.now(),
    filmName,
    rotationType,
    region,
    lengthMinutes,
    videoFormat,
  };

  discos.push(newTeam);
  res.status(201).json(newTeam);
});

// --- DELETE ---
app.delete("/ld/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const exists = discos.some((t) => t.id === id);
  if (!exists) {
    return res.status(404).json({ message: "Error 404" });
  }
  discos = discos.filter((t) => t.id !== id);
  res.json({ message: "Disco eliminado correctamente" });
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

/* // para probar
{
    filmName: "Los 100",
    rotationType: "CAV",
    region: "Española",
    lengthMinutes: 150,
    videoFormat: "PAL"
}
*/