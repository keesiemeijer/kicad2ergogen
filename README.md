# kicad2ergogen

A batch KiCad footprint to Ergogen footprint converter.

## Usage

To convert footprints online go to [https://kicad2ergogen.genteure.com](https://kicad2ergogen.genteure.com)

To batch convert local KiCad footprints from your terminal:

```bash
pnpm convert-footprints
```

This reads all the KiCad footprint files in the `footprints-kicad` directory and writes the converted ergogen footprint files to the `footprints-ergogen` directory.

It also accepts either a single `.kicad_mod` file or a directory of footprints, followed by an optional output file or directory:

```bash
pnpm convert-footprints path/to/input/directory path/to/output/directory
```

To uncomment selected source properties in the generated Ergogen footprint, add their names to `enabled-properties.json`:

```json
["Reference", "Value", "part", "silkscreen"]
```

## Building

The usual node project stuff with `pnpm`:

```bash
pnpm install
pnpm build
```
