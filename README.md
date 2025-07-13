# Medical Calculator - Opioid Titration Tool

A modern, responsive, and PWA-ready medical calculator for opioid titration with multiple helper tools.

## Features

### Core Functionality
- **Opioid Titration Calculator**: Calculate MME (Morphine Milligram Equivalent) for 10+ medications
- **TDD Helper**: Total Daily Dose calculator from IV rates
- **CSCI Helper**: Continuous Subcutaneous Infusion calculator
- **IV Infusion Helper**: IV infusion parameters calculator
- **Rotation Helper**: Opioid rotation calculations with safety reduction
- **Breakthrough Calculator**: PRN dosing recommendations
- **Balance Titration**: Balanced dose adjustment between medications

### Modern Features
- **PWA Ready**: Installable app with offline functionality
- **Responsive Design**: Mobile-first approach with touch-friendly controls
- **Theme Support**: Material Design and Neumorphic themes
- **State Persistence**: LocalStorage with IndexedDB fallback
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Modular architecture with optimized calculations

### Medical Safety Features
- **Clinical Pearls**: Built-in safety guidelines and recommendations
- **Drug Information**: Comprehensive drug information modals
- **Safety Validation**: Automatic warnings for high MME values
- **Prescription Helper**: Generated prescription text examples
- **Pin/Lock Functionality**: Prevent accidental dose changes

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **UI Framework**: TailwindCSS with custom components
- **Build System**: Vite with PWA plugin
- **State Management**: Custom state manager with localStorage
- **Architecture**: Modular ES6 modules
- **PWA**: Service Worker, Web App Manifest
- **Testing**: Jest (planned)
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── index.html              # Main HTML entry point
├── main.js                 # Application initialization
├── styles.css              # Consolidated styles
├── config/
│   └── drug-config.js      # Drug configurations and constants
├── services/
│   ├── calculation-engine.js # Core calculation logic
│   └── state-manager.js     # State management and persistence
├── components/
│   └── modals.js           # Modal dialogs and helpers
└── utils/
    └── helpers.js          # Utility functions (planned)

public/
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
└── icons/                  # PWA icons (planned)
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd pcklsh

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
npm run test       # Run tests (when implemented)
npm run clean      # Clean build directory
```

## Usage

### Basic Calculator
1. Select medications from the dropdown menus
2. Enter doses in the appropriate units
3. View total MME and individual contributions
4. Use breakthrough calculator for PRN recommendations

### Helper Tools
- **TDD Helper**: Calculate total daily dose from IV infusion parameters
- **CSCI Helper**: Calculate syringe parameters for continuous subcutaneous infusion
- **IV Infusion Helper**: Calculate IV infusion concentrations and rates
- **Rotation Helper**: Calculate equivalent doses when switching between opioids

### Titration Modes
- **PRN Mode**: Calculate based on breakthrough medication usage
- **Percentage Mode**: Apply percentage increases/decreases
- **Balance Mode**: Decrease one medication while increasing another

## Medical Disclaimer

This tool is designed for use by qualified healthcare professionals only. All calculations should be verified independently before clinical use. The developers assume no responsibility for clinical decisions made using this tool.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and formatting
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue in the GitHub repository.

## Acknowledgments

- Original concept and medical expertise from the FM Gang team
- Built with modern web technologies for optimal performance
- Designed with healthcare professionals in mind