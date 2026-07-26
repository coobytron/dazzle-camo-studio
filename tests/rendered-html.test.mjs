import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("bundles every model exposed by the 3D libraries", async () => {
  const modelPaths = [
    "alien-stinger-battleship.glb",
    "battleship-beta.glb",
    "giulio-cesare-dreadnought.glb",
    "self-portrait.glb",
  ];
  await Promise.all(
    modelPaths.map((name) => access(new URL(`../public/models/${name}`, import.meta.url))),
  );

  const sources = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dazzle-expansion.tsx", import.meta.url), "utf8"),
  ]);
  for (const modelPath of modelPaths) {
    assert.ok(
      sources.every((source) => source.includes(`models/${modelPath}`)),
      `${modelPath} must be available in both Studio and Poster Press`,
    );
  }
});
