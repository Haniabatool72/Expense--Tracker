# 💸 Expense Tracker

A clean, responsive expense tracker built with plain HTML, CSS, and JavaScript. Record income and expenses, see your balance update instantly, and keep everything saved in your browser. No frameworks, no build step, no backend.

## Features

- **Add income and expenses** with a description, amount, date, and category
- **Automatic balance** with total income, total expenses, and a live income-vs-expense bar
- **Categories** that change with the transaction type (for example Salary or Freelance for income, Food or Bills for expenses)
- **Delete transactions** with a smooth removal animation
- **Filter** the list by All, Income, or Expenses
- **Persistent data** saved in `localStorage`, so it survives refreshes and restarts
- **Input validation** with clear, inline error messages
- **Responsive layout** that works on phones, tablets, and desktops
- **Accessible** with labelled form fields, visible keyboard focus, and reduced-motion support
- **Safe rendering**: user text is inserted as plain text, never as HTML

## Technologies

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic page structure |
| CSS3 | Grid and Flexbox layout, custom properties, animations |
| JavaScript (ES6+) | App logic, validation, and `localStorage` |

## Project Structure

```
expense-tracker/
├── index.html   # Page markup
├── style.css    # Styles and animations
├── script.js    # App logic
└── README.md
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Haniabatool72>/expense-tracker.git
   cd expense-tracker
   ```

2. **Open the app**: double-click `index.html`, or serve the folder locally:

   ```bash
   # Python 3
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

   You can also use the VS Code **Live Server** extension.

There are no dependencies to install. An internet connection is only needed to load the Manrope font from Google Fonts; the app falls back to system fonts without it.

## Usage

1. Choose **Expense** or **Income**.
2. Enter a description, amount, date, and category.
3. Select **Add transaction**. The balance and list update right away.
4. Use the bin icon to delete a transaction, and the tabs to filter the list.

### Validation rules

| Field | Rule |
| --- | --- |
| Description | 2 to 60 characters |
| Amount | Positive number, up to 2 decimals, at most 100,000,000 |
| Date | Required, cannot be in the future |
| Category | Required |

## Customization

Open `script.js` and edit the `CONFIG` and `CATEGORIES` objects at the top:

```js
const CONFIG = { locale: 'en-US', currency: 'USD', /* ... */ };
```

For example, set `currency: 'PKR'` and `locale: 'en-PK'` to display rupees.

## Data and Privacy

All data stays in your browser's `localStorage` under the key `expense-tracker.transactions.v1`. Nothing is sent to a server. Clearing site data removes your transactions.

## Possible Improvements

- Edit existing transactions
- Export and import data (CSV or JSON)
- Monthly summaries and charts
- Dark mode

## License

Released under the MIT License.

## Author

Developed by **HANIA BATOOL**
