import * as Peko from "https://deno.land/x/peko@2.1.0/mod.ts";
import { bundle } from "https://deno.land/x/emit@0.26.0/mod.ts";
import data from "./globe/world.json" assert { type: "json" };
import "./globe/main.ts"; // for file-watching

const router = new Peko.Router();
router.use(async (_, next) => { 
  try { await next() }
  catch(e) { 
    console.log(e);
    return new Response("Woopsie!", { status: 500 });
  } 
});

router.get("/", Peko.staticFiles(new URL("./index.html", import.meta.url)));

router.get("/globe.js", Peko.cacher(), async () => {
  const { code } = await bundle(new URL("./globe/main.ts", import.meta.url));
  return new Response(code, {
    headers: new Headers({ "Content-Type": "text/javascript" })
  });
});

router.get("/diasporas/:country/:year", Peko.cacher(), async (ctx) => {
  const country = ctx.params.country;
  const year = ctx.params.year;
  if (!country || !year) throw new Error("No year or country param provided to GET /diasporas/:country/:years");
  if (!data.features.some(feature => feature.id === country)) throw new Error("Bad country code provided to GET /diasporas/:country/:years");

  const migrations = await Promise.all(data.features.map(async feature => {
    const migrationRes = await fetch(`https://api.unhcr.org/population/v1/asylum-applications/?year=[${year}]&coo=${country}&coa=${feature.id}`);
    if (migrationRes.status === 200) migrationRes.json();
    console.error("UNHCR request denied.");
  }));

  console.log(migrations);
  return new Response(JSON.stringify(migrations), { 
    headers: {
      "Content-Type": "application/json"
    } 
  });
});

Deno.serve((req) => router.handle(req));