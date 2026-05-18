# kicad2ergogen

A KiCad footprint to Ergogen footprint converter.

## Usage

<https://kicad2ergogen.genteure.com>

To convert local KiCad footprints from the terminal:

```bash
pnpm convert-footprints
```

This defaults to reading from `footprints-kicad` and writing to `footprints-ergogen`.
It also accepts either a single `.kicad_mod` file or a directory of footprints:

```bash
pnpm convert-footprints test/cases out
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
