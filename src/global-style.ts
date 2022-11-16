import { colors } from "@udir/lisa";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
	html {
		background-color: ${colors.utvidetPrimærpalett.stålblå98.hex};
	}

	// Hentet fra Josh W. Comeau's CSS reset:
	// https://www.joshwcomeau.com/css/custom-css-reset/
	/* 1. Use a more-intuitive box-sizing model. */
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	/* 2. Remove default margin */
	* {
		margin: 0;
	}
	/* 3. Allow percentage-based heights in the application */
	html,
	body {
		height: 100%;
	}
	/* Typographic tweaks!
	4. Add accessible line-height
	5. Improve text rendering
	*/
	body {
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}
	/* 6. Improve media defaults */
	img,
	picture,
	video,
	canvas,
	svg {
		display: block;
		max-width: 100%;
	}
	/* 7. Remove built-in form typography styles */
	input,
	button,
	textarea,
	select {
		font: inherit;
	}
	/* 8. Avoid text overflows */
	p,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		overflow-wrap: break-word;
	}
`;
