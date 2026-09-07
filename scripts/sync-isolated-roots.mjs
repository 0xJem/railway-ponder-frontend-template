import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const checkOnly = process.argv.includes("--check");
const rootWorkspaceUrl = new URL("../pnpm-workspace.yaml", import.meta.url);
const rootWorkspace = await readFile(rootWorkspaceUrl, "utf8");
const rootPackages = 'packages:\n  - "packages/*"\n  - "apps/*"';
const rootAllowBuilds =
  'allowBuilds:\n  "@biomejs/biome@1.9.4": true\n  "esbuild@0.25.1 || 0.25.12": true';

const createAppWorkspace = (allowBuilds) => {
  if (
    !rootWorkspace.includes(rootPackages) ||
    !rootWorkspace.includes(rootAllowBuilds)
  ) {
    throw new Error(
      "Root pnpm workspace structure changed; update the isolated-root generator.",
    );
  }

  return Buffer.from(
    rootWorkspace
      .replace(rootPackages, 'packages:\n  - "."')
      .replace(rootAllowBuilds, allowBuilds),
  );
};

const files = [
  {
    name: "Frontend Ponder schema",
    source: new URL("../apps/indexer/ponder.schema.ts", import.meta.url),
    target: new URL("../apps/frontend/src/ponder.schema.ts", import.meta.url),
  },
  {
    name: "Frontend pnpm workspace policy",
    content: createAppWorkspace(
      'allowBuilds:\n  "esbuild@0.25.1": true',
    ),
    target: new URL("../apps/frontend/pnpm-workspace.yaml", import.meta.url),
  },
  {
    name: "Indexer pnpm workspace policy",
    content: createAppWorkspace(
      'allowBuilds:\n  "@biomejs/biome@1.9.4": true\n  "esbuild@0.25.12": true',
    ),
    target: new URL("../apps/indexer/pnpm-workspace.yaml", import.meta.url),
  },
  {
    name: "Indexer TypeScript config",
    source: new URL("../tsconfig.json", import.meta.url),
    target: new URL("../apps/indexer/tsconfig.json", import.meta.url),
  },
];

let stale = false;

for (const file of files) {
  const source = file.content ?? (await readFile(file.source));
  const target = await readFile(file.target).catch(() => undefined);

  if (target?.equals(source)) {
    console.log(`${file.name} is up to date.`);
  } else if (checkOnly) {
    console.error(
      `${file.name} is stale. Run \`pnpm artifacts:sync\` and commit the result.`,
    );
    stale = true;
  } else {
    await mkdir(fileURLToPath(new URL(".", file.target)), { recursive: true });
    await writeFile(file.target, source);
    console.log(`Updated ${file.name}.`);
  }
}

if (stale) process.exitCode = 1;
