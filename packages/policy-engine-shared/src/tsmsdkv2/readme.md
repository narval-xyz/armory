# TSM SDK Type Definitions

The tsmsdkv2 npm package is javascript and does not contain type definitions, which makes working with it annoying.
This is type definitions for it.

### How to create this, if you need to regenerate them.

- Go into the npm package base
- Create a `tsconfig.json` with the following

```
{
  "compilerOptions": {
    "declaration": true,
    "allowJs": true,
    "checkJs": true,
    "outDir": "./types",
    "target": "es2020",
    "lib": ["es2020"],
    "module": "esnext",
    "moduleResolution": "node"
  },
  "include": ["./*.js"],
  "exclude": ["**.test.js", "node_modules"],
}
```

- run `npx tsc` so typescript can generate some types.
- copy the `./types` here
- Check `api_ecdsa.d.ts`, it might have a duplicate `Sign` function that'll cause type errors. Delete the wrong one -- it should have a `string` response, not an object.
