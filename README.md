
# My Campus Planner

## About
My Campus Planner helps students organize tasks and manage their study time.

## Features
- Add, edit, and delete tasks.
- Search tasks using regular expressions.
- Sort tasks by title, date, and duration.
- View dashboard statistics.
- Save tasks in localStorage.
- Import and export JSON files.
- Set duration limits.
- Responsive design and keyboard navigation.

## Project Structure
```text
My-Campus-Planner/
├── index.html
├── tests.html
├── seed.json
├── style/
│   └── index.css
├── script/
│   └── index.js
└── README.md
```

## Regex Catalog
- Title: `/^\S(?:.*\S)?$/`
- Duration: `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
- Date: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
- Tag: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
- Duplicate words: `/\b(\w+)\s+\1\b/i`

## Keyboard Navigation
- `Tab`: Move between controls.
- `Enter` or `Space`: Activate buttons.
- `Shift + Tab`: Move backward.

## Accessibility
The app uses semantic HTML, form labels, visible focus styles, responsive layouts, and ARIA live messages.

## Testing
Open `tests.html` in a browser and click **Run Tests**.

Use `seed.json` to test JSON import with at least 10 sample tasks.

## Contact
- GitHub: https://github.com/undegeya
- Email: u.ndegeya@alustudent.com

## Deployment
GitHub Pages: YOUR-GITHUB-PAGES-URL
