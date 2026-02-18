# Twilight Imperium 4 - Rules Q&A

A searchable, filterable reference for Twilight Imperium 4 rules questions and answers. This is a static site that can be hosted on GitHub Pages with no backend required.

## Features

- **Search**: Search through questions and answers
- **Filter by Source**: Filter rules by their source document
- **Filter by Tags**: Filter rules by category tags
- **Mobile-Friendly**: Responsive design that works on all devices
- **No Backend Required**: Pure HTML/CSS/JavaScript, perfect for GitHub Pages

## Usage

### Viewing the Site

1. Open `index.html` in your web browser
2. Or host it on GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to your main/master branch
   - Your site will be available at `https://yourusername.github.io/ti4-rules/`

### Adding More Q&A Entries

Edit the `rules-qa.csv` file. The CSV format is:

```
question,answer,tags,Source Text,Source Link
```

- **question**: The question text (use quotes if it contains commas)
- **answer**: The answer text (use quotes if it contains commas)
- **tags**: Category tag (e.g., GENERAL, COMBAT, MOVEMENT)
- **Source Text**: Name of the source document
- **Source Link**: URL to the source document

## Files

- `index.html` - Main HTML page
- `styles.css` - Styling and responsive design
- `script.js` - JavaScript for filtering and rendering
- `rules-qa.csv` - Q&A data file

## License

This project is open source. The Twilight Imperium 4 rules content belongs to Fantasy Flight Games.