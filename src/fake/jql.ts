/**
 * Just enough JQL for the fake backend: parses the syntax rules use, and
 * evaluates `project`, `component` and `key` clauses with `=`, `!=`, `in` and
 * `not in`, joined by AND, OR, NOT and parentheses. Anything else is an error,
 * so a rule the fake can't evaluate fails loudly instead of matching nothing.
 */

export interface JqlIssue {
	key: string;
	projectKey: string;
	components: readonly number[];
}

type Expr =
	| { kind: "and" | "or"; left: Expr; right: Expr }
	| { kind: "not"; expr: Expr }
	| { kind: "clause"; field: string; op: string; values: string[] };

export type ParseResult =
	| { ok: true; expr: Expr }
	| { ok: false; error: string };

const operators = ["!=", "!~", ">=", "<=", "=", "~", ">", "<"];

type Token = { kind: "word" | "string" | "op" | "punct"; text: string };

function tokenize(jql: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;
	while (i < jql.length) {
		const char = jql[i];
		if (/\s/.test(char)) {
			i++;
		} else if (char === '"' || char === "'") {
			const end = jql.indexOf(char, i + 1);
			if (end === -1) throw new Error(`Unterminated string at ${i}`);
			tokens.push({ kind: "string", text: jql.slice(i + 1, end) });
			i = end + 1;
		} else if ("(),".includes(char)) {
			tokens.push({ kind: "punct", text: char });
			i++;
		} else {
			const op = operators.find((o) => jql.startsWith(o, i));
			if (op) {
				tokens.push({ kind: "op", text: op });
				i += op.length;
				continue;
			}
			const word = /^[^\s()",'=!~<>]+/.exec(jql.slice(i));
			if (!word) throw new Error(`Unexpected "${char}" at ${i}`);
			tokens.push({ kind: "word", text: word[0] });
			i += word[0].length;
		}
	}
	return tokens;
}

export function parseJql(jql: string): ParseResult {
	try {
		const tokens = tokenize(jql);
		let pos = 0;
		const peek = () => tokens[pos];
		const isKeyword = (word: string, token = peek()) =>
			token?.kind === "word" && token.text.toUpperCase() === word;
		const expect = (text: string) => {
			if (peek()?.text !== text) throw new Error(`Expected "${text}"`);
			pos++;
		};

		const parseOr = (): Expr => {
			let left = parseAnd();
			while (isKeyword("OR")) {
				pos++;
				left = { kind: "or", left, right: parseAnd() };
			}
			return left;
		};
		const parseAnd = (): Expr => {
			let left = parseNot();
			while (isKeyword("AND")) {
				pos++;
				left = { kind: "and", left, right: parseNot() };
			}
			return left;
		};
		const parseNot = (): Expr => {
			if (isKeyword("NOT")) {
				pos++;
				return { kind: "not", expr: parseNot() };
			}
			if (peek()?.text === "(") {
				pos++;
				const expr = parseOr();
				expect(")");
				return expr;
			}
			return parseClause();
		};
		const parseValue = (): string => {
			const token = peek();
			if (token?.kind !== "word" && token?.kind !== "string")
				throw new Error("Expected a value");
			pos++;
			return token.text;
		};
		const parseClause = (): Expr => {
			const field = parseValue().toLowerCase();
			let op: string;
			if (peek()?.kind === "op") {
				op = peek().text;
				pos++;
			} else if (isKeyword("IN")) {
				op = "in";
				pos++;
			} else if (isKeyword("NOT") && isKeyword("IN", tokens[pos + 1])) {
				op = "not in";
				pos += 2;
			} else if (isKeyword("IS")) {
				pos++;
				op = isKeyword("NOT") ? "is not" : "is";
				if (op === "is not") pos++;
			} else {
				throw new Error(`Expected an operator after "${field}"`);
			}
			if (op === "in" || op === "not in") {
				expect("(");
				const values = [parseValue()];
				while (peek()?.text === ",") {
					pos++;
					values.push(parseValue());
				}
				expect(")");
				return { kind: "clause", field, op, values };
			}
			return { kind: "clause", field, op, values: [parseValue()] };
		};

		const expr = parseOr();
		if (pos < tokens.length)
			throw new Error(`Unexpected "${tokens[pos].text}"`);
		return { ok: true, expr };
	} catch (error) {
		return { ok: false, error: (error as Error).message };
	}
}

/** Throws for fields or operators the fake can't evaluate. */
export function matchesIssue(expr: Expr, issue: JqlIssue): boolean {
	switch (expr.kind) {
		case "and":
			return matchesIssue(expr.left, issue) && matchesIssue(expr.right, issue);
		case "or":
			return matchesIssue(expr.left, issue) || matchesIssue(expr.right, issue);
		case "not":
			return !matchesIssue(expr.expr, issue);
		case "clause": {
			const actual = fieldValues(expr.field, issue);
			const wanted = expr.values.map((v) => v.toUpperCase());
			const hit = actual.some((value) => wanted.includes(value));
			switch (expr.op) {
				case "=":
				case "in":
					return hit;
				case "!=":
				case "not in":
					return !hit;
				default:
					throw new Error(
						`The fake backend can't evaluate "${expr.field} ${expr.op}"`,
					);
			}
		}
	}
}

function fieldValues(field: string, issue: JqlIssue): string[] {
	switch (field) {
		case "project":
			return [issue.projectKey.toUpperCase()];
		case "component":
			return issue.components.map(String);
		case "key":
		case "issue":
			return [issue.key.toUpperCase()];
		default:
			throw new Error(`The fake backend can't evaluate the field "${field}"`);
	}
}
