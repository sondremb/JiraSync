import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Text } from "@utdanningsdirektoratet/lisa";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Text>🚧 Personvernerklæring kommer 🚧</Text>;
}
