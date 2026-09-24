# hevy-javascript
TypeScript client for JavaScript, featuring React bindings for the [Hevy](https://www.hevyapp.com/) public API.

> Unofficial. Not affiliated with or endorsed by Hevy. The Hevy API requires a Hevy Pro subscription; get your API key at https://hevy.com/settings?developer. Meant for personal use.

## Install
```bash
npm install hevy-javascript
```

React 18 or newer is required for the React bindings. The client works without React.
## Simple JS Example
```ts

import { createHevyClient, HevyError } from "hevy-javascript";

const hevy = createHevyClient({ apiKey: process.env.HEVY_API_KEY });

try {
	const count = await hevy.getTotalWorkouts();
	const routine = await hevy.getRoutine("routine-id");
} catch (err) {
	if (err instanceof HevyError) console.error(err.status, err.body);
}
```


## React.JS Quickstart
React bindings exist to speed up the process. Here, it's as simple as inputting a HevyProvider alongside your API key, 

```tsx
import { HevyProvider, useHevy } from "hevy-javascript";

function App() {

return (
	<HevyProvider apiKey={userApiKey}>
		<RecentWorkouts />
	</HevyProvider>
	);
}

  

function RecentWorkouts() {
	const hevy = useHevy();
	const [workouts, setWorkouts] = useState<Workout[]>([]);

useEffect(() => {
	hevy.getWorkouts(1, 10).then((res) => setWorkouts(res.workouts));
}, [hevy]);

return (
	<ul>
	{workouts.map((w) => (
		<li key={w.id}>{w.title}</li>
	))}
	</ul>
	);
}
```

## Keeping your API key safe
Your API key has **full read and write access** to your Hevy account. Anything passed to `apiKey` in browser code can be read by anyone who loads the page.

- **Fine:** local tools, private dashboards, or apps where each user enters their own key.
- **Not fine:** a public site that ships *your* key to every visitor.
## API
---

| Resource | Methods |
|---|---|
| **Workouts** | `getWorkouts(page?, pageSize?)`<br>`getTotalWorkouts()`<br>`getWorkoutsSinceDate({ since, page?, pageSize? })`<br>`getWorkout(id)`<br>`createWorkout(workout)`<br>`updateWorkout(id, workout)` |
| **User** | `getUserInfo()` |
| **Routines** | `getRoutines(page?, pageSize?)`<br>`getRoutine(id)`<br>`createRoutine(routine)`<br>`updateRoutine(id, routine)` |
| **Routine folders** | `getRoutineFolders(page?, pageSize?)`<br>`getRoutineFolder(id)`<br>`createRoutineFolder(folder)` |
| **Exercise templates** | `getExerciseTemplates(page?, pageSize?)`<br>`getExerciseTemplate(id)`<br>`createExerciseTemplate(exercise)` |
| **Exercise history** | `getExerciseHistory(templateId, { startDate?, endDate? })` |
| **Body measurements** | `getBodyMeasurements(page?, pageSize?)`<br>`getBodyMeasurement(date)`<br>`createBodyMeasurement(m)`<br>`updateBodyMeasurement(date, m)` |
## License
ISC