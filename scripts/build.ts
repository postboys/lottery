import AxiosFactory from "axios";
import { BuildOptions, build as esbuild } from "esbuild";

const getRequiredEnv = <T extends readonly string[]>(keys: T) => {
    const missing = keys.filter(k => !process.env[k]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    const result = {} as Record<T[number], string>;
    for (const key of keys) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result[key as T[number]] = process.env[key]!;
    }
    return result;
};

const env = getRequiredEnv(["VAULT_ROLE_ID", "VAULT_SECRET_ID", "APP_ENV"] as const);
const axios = AxiosFactory.create({ baseURL: process.env.VAULT_ADDR ?? "http://localhost:9200" });

const loginWithAppRole = async () => {
    const response = await axios.post<{ auth: { client_token: string } }>("/v1/auth/approle/login", {
        role_id: env.VAULT_ROLE_ID,
        secret_id: env.VAULT_SECRET_ID,
    });
    return response.data.auth.client_token;
};

const getCredentials = async () => {
    const token = await loginWithAppRole();
    const response = await axios.get<{ data: { data: Record<string, string> } }>(
        `/v1/kv/data/${env.APP_ENV}`,
        { headers: { "X-Vault-Token": token } },
    );
    return response.data.data.data;
};

const build = async () => {
    const credentials = await getCredentials();
    const define: Record<string, string> = {
        "process.env.DATABASE_NAME": JSON.stringify(env.APP_ENV),
        "process.env.DATABASE_USER": JSON.stringify(env.APP_ENV),
    };
    Object.entries(credentials).forEach(([key, value]) => {
        define[`process.env.${key}`] = JSON.stringify(value);
    });

    const options: BuildOptions = {
        bundle: true,
        entryPoints: ["src/main.ts"],
        outfile: "lib/main.js",
        packages: "external",
        platform: "node",
        target: "node22",
        define,
    };

    await esbuild(options);
};

build().catch((e: unknown) => {
    console.error(e);
    process.exit(1);
});
