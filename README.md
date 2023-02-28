# RiskFix:  A Modular Package for Visual-Interactive Validation of Risk-Prediction Machine Learning Models

This is a *React component library* that provides reusable UI components for building web applications. 

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

#### PreBias: A pre-bias component
- `setPrebiasValue`: (value: number) => void;

#### QRReader: A QR code reader component

- `bedside_info`: string;
  - A string representing the information about the bedside monitoring device.
- `bedside_devices`: string | null;
  - A string or null value representing the list of devices connected to the bedside monitoring system.
- `setBedsideDevices`: React.Dispatch<React.SetStateAction<string | null>>;
  - A React state hook function that takes a string or null value and sets the bedside devices.
- `setBedsideInfo`: React.Dispatch<React.SetStateAction<string>>;
  - A React state hook function that takes a string value and sets the bedside info.
- `handleScan`: (data: any) => void;
  - A function that takes a data object as an argument and is called when a QR code is successfully scanned.
- `handleError`: (err: any) => void;
  -  A function that takes an error object as an argument and is called when there is an error with the QR code scan.

#### PredictionTimeline: A prediction timeline component to show model validated results.
- `prebiasValue`: number | undefined;
	- An optional number value representing the pre-bias value for the risk prediction model.
- `bedsideDevices`: string | null;
	- A string or null value representing the list of devices connected to the bedside monitoring system.
- `bedsideInfo`: string;
	- A string value representing the information about the bedside monitoring device.
- `user`: { email: string } | undefined;
	- An optional object with an email property representing the user information.
- `postValidation`: (val: IValidation) => Promise<number | undefined>
	- A function that takes a validation object as an argument and returns a promise that resolves to a number or undefined value.
- `fetchAnnotations`: (user: string, devid: number, start_time: number, end_time: number) => Promise<IAnnotation>
	- A function that takes user, devid, start_time, and end_time as arguments and returns a promise that resolves to an annotation object.
- `postAnnotation`: (val: IPostAnnotation) => Promise<number | undefined>
	- A function that takes an annotation object as an argument and returns a promise that resolves to a number or undefined value.
- `fetchPrediction`: (devid: number, limit: number, start_time: number, end_time: number) => Promise<PredictionScores>
	- A function that takes devid, limit, start_time, and end_time as arguments and returns a promise that resolves to a prediction scores object.
- `fetchValidations`: (user: string, devid: number, start_time: number, end_time: number) => Promise<ValidatedScores>
	- A function that takes user, devid, start_time, and end_time as arguments and returns a promise that resolves to a validated scores object.

#### Timeline: The timeline visualization component used within the PredictionTimeline component.
- `devid`: number;
	- A number value representing the ID of the monitoring device.
- `prebias`: number;
	- A number value representing the pre-bias value for the risk prediction model.
- `modelPause`: boolean;
	- A boolean value indicating whether the model is paused or not.
- `user`: string;
	- A string value representing the user information.
- `fetchInterval`
	- The time of the interval between points, in milliseconds. An example value would be: 30000 for 30 second intervals.
- `timeWindow`
	- The size of display window in terms of time, in milliseconds. For example, if we wanted to show the last 5 mins. we would put in: (5 * 60 * 1000).
- `rollbackTime`
	- If a time rollback is required from the latest set of points, use this to start after a certain number of milliseconds before the current time within the model values.
- `fetchPrediction`: (devid: number, limit: number, start_time: number, end_time: number) => Promise<PredictionScores>
	- A function that takes devid, limit, start_time, and end_time as arguments and returns a promise that resolves to a prediction scores object.
- `fetchValidations`: (user: string, devid: number, start_time: number, end_time: number) => Promise<ValidatedScores>
	- A function that takes user, devid, start_time, and end_time as arguments and returns a promise that resolves to a validated scores object.
- `postValidation`: (val: IValidation) => Promise<number | undefined>
	- A function that takes a validation object as an argument and returns a promise that resolves to a number or undefined value.


## Contributing

To contribute to this project, please follow these steps:

Fork the repo
Create a new branch (git checkout -b my-new-feature)
Make changes and commit (git commit -am 'Add some feature')
Push to the branch (git push origin my-new-feature)
Create a new pull request

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
