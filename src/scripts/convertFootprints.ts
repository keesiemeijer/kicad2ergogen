import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import convertToErgogenFootprint from "./ergogenWriterNext";
import { parseKiCadSexp } from "./parser";

const DEFAULT_INPUT_PATH = "footprints-kicad";
const DEFAULT_OUTPUT_PATH = "footprints-ergogen";
const ENABLED_PROPERTIES_PATH = "enabled-properties.json";

async function main() {
  const [inputArg, outputArg] = process.argv.slice(2);

  const inputPath = resolve(inputArg ?? DEFAULT_INPUT_PATH);
  const outputPath = resolve(outputArg ?? DEFAULT_OUTPUT_PATH);
  const enabledPropertyNames = await loadEnabledPropertyNames();
  const inputStats = await stat(inputPath).catch(() => null);

  if (!inputStats) {
    throw new Error(`Input path does not exist: ${inputPath}`);
  }

  if (inputStats.isDirectory()) {
    const files = await collectFootprintFiles(inputPath);

    if (files.length === 0) {
      console.warn(`No .kicad_mod files found in ${inputPath}`);
      return;
    }

    for (const file of files) {
      const relPath = relative(inputPath, file);
      const outputFile = join(outputPath, replaceExtension(relPath, ".js"));
      await convertFile(file, outputFile, enabledPropertyNames);
    }

    console.log(
      `Converted ${files.length} footprint${files.length === 1 ? "" : "s"}.`,
    );
    return;
  }

  const outputFile = extname(outputPath)
    ? outputPath
    : join(outputPath, replaceExtension(inputPath, ".js"));
  await convertFile(inputPath, outputFile, enabledPropertyNames);
  console.log("Converted 1 footprint.");
}

async function collectFootprintFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFootprintFiles(fullPath);
      }
      return entry.isFile() && entry.name.endsWith(".kicad_mod")
        ? [fullPath]
        : [];
    }),
  );

  return files.flat().sort();
}

async function convertFile(
  inputFile: string,
  outputFile: string,
  enabledPropertyNames: string[],
) {
  const input = await readFile(inputFile, "utf8");
  const ast = parseKiCadSexp(input);
  const result = convertToErgogenFootprint(ast, { enabledPropertyNames });

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, result.ergogenCode, "utf8");
  console.log(`${inputFile} -> ${outputFile}`);
}

async function loadEnabledPropertyNames(): Promise<string[]> {
  const configPath = resolve(ENABLED_PROPERTIES_PATH);
  const configContent = await readFile(configPath, "utf8").catch(() => null);

  if (configContent === null) {
    return [];
  }

  const config = JSON.parse(configContent) as unknown;
  if (
    !Array.isArray(config) ||
    config.some((item) => typeof item !== "string")
  ) {
    throw new Error(
      `${ENABLED_PROPERTIES_PATH} must be a JSON array of property names`,
    );
  }

  return config;
}

function replaceExtension(filePath: string, newExtension: string) {
  return filePath.replace(/\.kicad_mod$/i, newExtension);
}

function printUsage() {
  console.error(
    "Usage: pnpm convert-footprints [input-file-or-dir] [output-file-or-dir]",
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
