import { createClient } from "@ponder/client";
import * as schema from "../../../indexer/ponder.schema";

// Validate the environment variable
const PONDER_URL = import.meta.env.VITE_PONDER_URL;
if (!PONDER_URL) {
  throw new Error("VITE_PONDER_URL is not set");
}

const client = createClient(PONDER_URL, { schema });

export { client, schema };
