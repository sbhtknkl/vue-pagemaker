# Vue PageMaker Engine

A Vue.js 3 implementation of the PageMaker framework that creates complete applications from JSON metadata configurations. This engine replicates the functionality of the original AngularJS PageMaker system using modern Vue.js architecture.

## Features

- **JSON-driven UI**: Build complete interfaces from JSON metadata
- **Widget-based Architecture**: Modular, reusable UI components
- **Data Flow Management**: Automatic data binding and state management
- **Modal System**: Built-in modal support following PageMaker patterns
- **Action System**: Event handling and component communication
- **Validation**: Built-in form validation system
- **Grid System**: Data grid component with editing capabilities
- **API Integration**: Seamless REST API integration
- **Hot Reload**: Docker-based development with file watching

## Quick Start

### Using Docker (Recommended)

1. Clone or create the project directory
2. Start the development server:

```bash
cd vue-pagemaker
docker-compose up -d
```

3. Open your browser to `http://localhost:3000`

### Manual Setup

1. Serve the files using any web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

2. Open your browser to the server URL

## Project Structure

```
vue-pagemaker/
├── index.html              # Main HTML file
├── js/
│   ├── components/
│   │   ├── PageMaker.js     # Main PageMaker component
│   │   ├── WidgetRenderer.js # Dynamic widget renderer
│   │   └── widgets/         # Individual widget components
│   │       ├── Container.js
│   │       ├── Input.js
│   │       ├── Button.js
│   │       ├── Form.js
│   │       ├── Label.js
│   │       ├── Select.js
│   │       └── Grid.js
│   ├── services/
│   │   ├── ApiService.js    # HTTP request handling
│   │   └── MetadataService.js # Metadata processing
│   ├── utils/
│   │   └── PageMakerUtils.js # Utility functions
│   └── app.js               # Main application
├── Dockerfile               # Docker configuration
├── docker-compose.yml      # Development setup
├── nginx.conf              # Nginx configuration
└── README.md               # This file
```

## PageMaker JSON Format

The Vue PageMaker engine supports both old and new PageMaker JSON formats:

### New Format (Recommended)

```json
{
  "success": true,
  "return": {
    "main_container": {
      "pm::Type": "container",
      "pm::Meta": {
        "pm::className": "my-page",
        "padding": "20px"
      },
      "pm::Modals": {
        "myModal": {
          "pm::title": "My Modal",
          "pm::width": 500,
          "pm::meta": { ... }
        }
      },
      "child_widget": {
        "pm::type": "input",
        "label": "Enter text:",
        "placeholder": "Type here..."
      }
    }
  }
}
```

### Key Principles

1. **Uppercase Properties**: `pm::Type`, `pm::Meta`, `pm::Modals` have special parser treatment and go OUTSIDE `pm::Meta`
2. **Regular Properties**: All widget properties (labels, data-get, etc.) go INSIDE `pm::Meta`
3. **Children**: Everything else at the root level are child components

## Widget Types

### Core Widgets

- **container**: Layout wrapper (most common widget)
- **input**: Text input with validation
- **button**: Interactive button with actions
- **form**: Form container with data management
- **label**: Text display with variable interpolation
- **select**: Dropdown selection
- **grid_agura**: Data grid with columns

### Widget Properties

All widgets support:
- `label`: Display label
- `className`: CSS classes
- `style`: Inline styles
- `hidden`: Hide widget
- `disabled`: Disable widget

### Form Widgets

Form widgets additionally support:
- `name`: Field name for data binding
- `required`: Required field validation
- `validation`: Validation rules array
- `default`: Default value

### Actions

Buttons and forms support actions:
- `openModal`: Open a modal
- `closeModal`: Close a modal
- `submit`: Submit form data
- `broadcast`: Send data to other widgets
- `navigate`: Navigate to URL

## API Integration

The engine follows PageMaker API patterns:

### Response Format

All API responses should follow this format:

```json
{
  "success": true,
  "return": {
    "data": "actual data here"
  }
}
```

### Data Loading

Use `data-get` or `pm::dataGet` in widget metadata:

```json
{
  "pm::type": "form",
  "pm::Meta": {
    "pm::dataGet": {
      "url": "/api/user-data",
      "params": { "id": 123 }
    }
  }
}
```

## Modal System

Define modals using the object key pattern:

```json
{
  "pm::Modals": {
    "modalId": {
      "pm::title": "Modal Title",
      "pm::width": 600,
      "pm::height": 400,
      "pm::meta": {
        "pm::Type": "form",
        "pm::Meta": { ... },
        "field1": { ... },
        "field2": { ... }
      }
    }
  }
}
```

Open modals with button actions:

```json
{
  "pm::type": "button",
  "pm::title": "Open Modal",
  "onclick": [{
    "action": "openModal",
    "modalId": "modalId"
  }]
}
```

## Data Flow

The engine manages data in two main contexts:

1. **allData**: Global application data
2. **formData**: Form-specific data (passed to child components)

Data flows from parent to child components automatically. Form widgets update formData, which syncs with the global state.

## Development

### Hot Reload

When using Docker, the development setup includes:
- File watching for automatic reload
- CORS headers for API development
- No caching for immediate updates

### Adding New Widgets

1. Create new widget file in `js/components/widgets/`
2. Follow the widget interface pattern
3. Register in `js/app.js`
4. Add to widget type mapping in `WidgetRenderer.js`

### Custom Styling

Add custom CSS to `index.html` or create separate CSS files. The engine includes basic styling that can be overridden.

## Testing

The application includes demo metadata that showcases:
- Container layouts
- Form with validation
- Modal interactions
- Grid display
- Button actions

## Browser Support

- Chrome/Chromium 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## License

This Vue PageMaker engine is designed to be compatible with the original PageMaker framework patterns and conventions.

## Contributing

When contributing to this engine:
1. Follow PageMaker JSON format specifications
2. Maintain backward compatibility
3. Add comprehensive examples
4. Update documentation

For questions about PageMaker patterns, refer to the original PageMaker documentation. "# vue-pagemaker" 
