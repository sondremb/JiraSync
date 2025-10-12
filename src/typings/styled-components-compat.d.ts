import "styled-components";

// Praise ChatGPT 🙏🙏🙏
declare module "styled-components" {
	import * as React from "react";
	import { DefaultTheme, SimpleInterpolation } from "styled-components";

	// Overload createGlobalStyle to return something JSX accepts directly.
	export function createGlobalStyle<P = {}, T = DefaultTheme>(
		first: TemplateStringsArray,
		...interpolations: SimpleInterpolation[]
	): React.ComponentType<P>;
}
