import { Bounce, ToastContainer } from "react-toastify";

// Split from the main bundle via React.lazy in App.tsx — toasts are only
// needed on user interaction, not first paint.
export default function ToastHost() {
	return (
		<ToastContainer
			position="top-right"
			autoClose={5000}
			newestOnTop={true}
			closeOnClick={true}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="colored"
			transition={Bounce}
		/>
	);
}
