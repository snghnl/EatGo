import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "./openapi.json",
    output: "src/client",
    plugins: [
        "@hey-api/client-next",
        "zod",
        {
            name: "@hey-api/sdk",
            // NOTE: this doesn't allow tree-shaking
            validator: true,
            asClass: true,
            operationId: true,
            methodNameBuilder: (operation) => {
                // @ts-ignore
                let name: string = operation.operationId.split("-").at(-1);

                name = name
                    .split("_")
                    .map((word, idx) => {
                        if (idx != 0) {
                            return word.charAt(0).toUpperCase() + word.slice(1);
                        }

                        return word;
                    })
                    .join("");

                return name;
            },
        },
    ],
});
