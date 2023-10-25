import * as Peko from "https://deno.land/x/peko@2.1.0/mod.ts";
import { bundle } from "https://deno.land/x/emit/mod.ts";
// import "./globe.ts";

const router = new Peko.Router();

router.get("/", Peko.cacher(), Peko.staticFiles(new URL("./index.html", import.meta.url)));
router.get("/globe.ts", Peko.cacher(), async () => {
  const { code } = await bundle(new URL("./globe.ts", import.meta.url));
  return new Response(code, {
    headers: new Headers({ "Content-Type": "text/javascript" })
  });
})

Deno.serve((req) => router.handle(req));