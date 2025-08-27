import axios, { AxiosInstance } from "axios";

let MuySaludableApi: AxiosInstance | null = null;

async function loadConfig():Promise<void> {
  try {
    
    MuySaludableApi = axios.create({
      //baseURL: "http://192.168.100.154:8000/api",
      baseURL: "https://muysaludableqaapi-252581130032.us-central1.run.app/api",
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error loading config:", error);
    
    // Usa una baseURL predeterminada si falla la carga del JSON.
    MuySaludableApi = axios.create({
      baseURL: 'https://muysaludableqaapi-252581130032.us-central1.run.app/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Llama a la función para cargar la configuración al inicio.
loadConfig();

// Función helper para asegurar que la API esté inicializada
const getApiInstance = (): AxiosInstance => {
  if (!MuySaludableApi) {
    throw new Error('MuySaludableApi no está inicializada');
  }
  return MuySaludableApi;
};

export { getApiInstance as MuySaludableApi };
