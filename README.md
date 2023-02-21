# React Component Library

This is a React component library that provides reusable UI components for building web applications.

## Installation

You can install this library via NPM by running the following command:

```npm install icu-validation-ui```

## Usage

To use this component library in your project, you can import individual components like so:

```js
import { PreBias } from "icu-validation-ui"

function MyComponent() {
	const [count, setCount] = useState(0)
	return (<PreBias setPrebiasValue={setCount} />);
}
```

## Available Components

- `PreBias`: A pre-bias component
- `QRReader`: A QR code reader component
- `PredictionTimeline`: A prediction timeline component to show model validated results. 
- `Timeline`: The timeline visualization component used in `PredictionTimeline`

## Contributing

To contribute to this project, please follow these steps:

Fork the repo
Create a new branch (git checkout -b my-new-feature)
Make changes and commit (git commit -am 'Add some feature')
Push to the branch (git push origin my-new-feature)
Create a new pull request

## License
This project is licensed under the MIT License. See the LICENSE file for more details.