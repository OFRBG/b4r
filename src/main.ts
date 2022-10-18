import type { Config } from "prettier";

type Prettier = Config;

type Npm = {
  gitChecks?: boolean;
};

type Brrrr = {
  prettier: Prettier;
  npm: Npm;
};

const defaultValues = {
  prettier: {
    $schema: "https://json.schemastore.org/prettierrc",
  },
  npm: {},
};

const inner = {};

export const main = new Proxy<Brrrr>(inner as Brrrr, {
  get: (target, p) => {
    if (!target[p]) {
      target[p] = defaultValues[p];
    }

    return target[p];
  },
  set: (target, p, newValue) => {
    if (!target[p]) {
      target[p] = {};
    }

    try {
      target[p] = newValue;
    } catch {
      return false;
    }

    return true;
  },
});
