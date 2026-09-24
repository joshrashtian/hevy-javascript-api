// Regenerates src/schema.d.ts from Hevy's OpenAPI spec.
//
// Hevy only publishes the spec embedded in its Swagger UI bundle, so we pull
// it out of there first. The generator runs via npx with TypeScript 5 because
// openapi-typescript needs the JS compiler API, which TypeScript 7 dropped.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const res = await fetch("https://api.hevyapp.com/docs/swagger-ui-init.js");
if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status}`);

const match = (await res.text()).match(/"swaggerDoc":\s*(\{[\s\S]*?\}),\s*"customOptions"/);
if (!match) throw new Error("Could not find swaggerDoc in swagger-ui-init.js");

const spec = JSON.parse(match[1]);
fixPropertyRequiredFlags(spec);
writeFileSync("hevy-openapi.json", JSON.stringify(spec, null, 2) + "\n");
console.log(`Wrote hevy-openapi.json (${Object.keys(spec.paths).length} paths)`);

execFileSync(
  "npx",
  ["-y", "-p", "openapi-typescript@7", "-p", "typescript@5", "openapi-typescript", "hevy-openapi.json", "-o", "src/schema.d.ts"],
  { stdio: "inherit" },
);

// Some Hevy schemas use Swagger 2 style `required: true` on a property instead
// of listing it in the parent's `required` array, which breaks the generator.
function fixPropertyRequiredFlags(node) {
  if (!node || typeof node !== "object") return;
  if (node.properties) {
    for (const [name, prop] of Object.entries(node.properties)) {
      if (typeof prop?.required === "boolean") {
        if (prop.required) node.required = [...new Set([...(node.required ?? []), name])];
        delete prop.required;
      }
    }
  }
  for (const child of Object.values(node)) fixPropertyRequiredFlags(child);
}
