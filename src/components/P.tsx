import { Text } from "@utdanningsdirektoratet/lisa";
import styled from "styled-components";

// @ts-expect-error styled-components v5 circular defaultProps inference (TS2615)
export const P = styled(Text).attrs({ as: "p" })``;
