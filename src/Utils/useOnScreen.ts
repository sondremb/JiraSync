import { useEffect, useState, type RefObject } from "react";

/** Whether the element is (partly) in the viewport. True until first measured. */
export const useOnScreen = (ref: RefObject<Element | null>): boolean => {
	const [onScreen, setOnScreen] = useState(true);
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const observer = new IntersectionObserver(([entry]) =>
			setOnScreen(entry.isIntersecting),
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);
	return onScreen;
};
