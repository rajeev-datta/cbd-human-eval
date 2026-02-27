# cbd-human-eval.github.io

Static webpage for human evaluation of 6,250 images with descriptor matching. Evaluators view images and answer yes/no for each descriptor, with responses automatically logged to a Google Sheet.

## Quick Stats
- **6,250 total images** across 250 species
- **50 taxonomic classes** 
- **Dynamic descriptors** loaded per species
- **Automatic Google Sheets integration** for response collection

## Data Organization

```
├── class_to_species/          # 50 txt files mapping species to classes
├── images/                    # 250 folders (one per species)
│   └── species_name/          # 25 images per species on average
│       ├── uuid1.jpg
│       ├── uuid2.jpg
│       └── ...
├── descriptors/               # 250 json files (one per species)
│   └── species_name.json      # List of 4-8 descriptors
├── config.js                  # Auto-generated config (6,250 images)
└── generate_config.py         # Script to build config from data
```

## Setup Instructions

### 1. Configuration (Pre-built)
The configuration has been automatically generated from your data files:
```bash
python3 generate_config.py
```
This creates:
- `config.js` - All 6,250 images with descriptors
- `data_summary.json` - Statistics about the dataset

### 2. Google Sheets Integration
Follow the detailed setup guide in [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md):
1. Create a Google Sheet
2. Set up a Google Apps Script webhook
3. Deploy as web app
4. Update `config.js` with deployment URL

### 3. Deploy to GitHub Pages
```bash
git push origin main
```
Then in GitHub Settings → Pages, enable "Deploy from a branch" on main.

Your site will be live at: `https://yourusername.github.io/cbd-human-eval.github.io/`

## How It Works

### For Evaluators
1. **View Image** - See one image at a time with its species and class
2. **Context** - See other species in the same taxonomic class
3. **Evaluate** - Answer yes/no for each descriptor (4-8 per image)
4. **Submit** - Response saved to Google Sheet, next image loads
5. **Progress** - Track which image you're on (e.g., "Image 123 of 6250")

### Under the Hood
1. **Data Generation** - Python script processes local files into JavaScript config
2. **Image Serving** - Static files hosted on GitHub Pages
3. **Response Collection** - Google Apps Script receives answers via POST
4. **Sheet Organization** - Automatic tabs per species, rows per image

## File Guide

| File | Purpose |
|------|---------|
| [index.html](index.html) | Main webpage UI |
| [app.js](app.js) | Evaluation logic |
| [config.js](config.js) | Auto-generated image data (6,250 images) |
| [styles.css](styles.css) | Responsive styling |
| [generate_config.py](generate_config.py) | Build config from data files |
| [GoogleAppsScript.gs](GoogleAppsScript.gs) | Google Sheet webhook endpoint |
| [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) | Detailed setup guide |

## Updating Data

To add more images:
1. Place images in `images/{species_name}/` folders
2. Add descriptors JSON to `descriptors/{species_name}.json`
3. Run: `python3 generate_config.py`
4. Commit and push to GitHub

## Features

- ✅ **Progressive Enhancement** - Works without JavaScript
- ✅ **Responsive Design** - Desktop, tablet, and mobile
- ✅ **Offline Support** - Images load independently
- ✅ **Progress Tracking** - Shows current image number
- ✅ **Context Aware** - Displays related species for classification
- ✅ **Automatic Sheet Tabs** - One tab per species in Google Sheet
- ✅ **Timestamp Recording** - All responses timestamped

## Example Response Format in Google Sheet

Sheet: "calocera_cornea"
```
| Timestamp                 | ImageID                           | Q1: small jelly-like | Q2: bright color | Q3: coral-shaped | ...
|---------------------------|-----------------------------------|---------------------|------------------|------------------|
| 2026-02-26T10:30:00.000Z | calocera_cornea_uuid1             | Yes                 | Yes              | Yes              |
| 2026-02-26T10:35:00.000Z | calocera_cornea_uuid2             | No                  | Yes              | No               |
```

## Troubleshooting

**Config not showing images?**
```bash
python3 generate_config.py
```

**Google Sheet not receiving responses?**
- Check Google Apps Script deployment URL in `config.js`
- Verify Sheet ID in GoogleAppsScript.gs
- Check browser console for errors

**Images not loading?**
- Verify `images/{species_name}/` folder structure
- All files must be `.jpg` format
- Run `generate_config.py` to refresh config

## License & Attribution
See [LICENSE](LICENSE) and [ATTRIBUTION](ATTRIBUTION) for details.
