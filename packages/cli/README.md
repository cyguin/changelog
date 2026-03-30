# @cyguin/changelog-cli

CLI scaffolder for `@cyguin/changelog`.

## what it is

Scaffolds a complete API layer into your Next.js app with one command.

## install

```bash
npm install @cyguin/changelog-cli
```

## use

```bash
npx changelog-init
```

This drops:

```
app/api/changelog/route.ts       GET (list), POST (create)
app/api/changelog/[id]/route.ts GET, PUT, DELETE
app/api/changelog/read/route.ts  GET (unread count), POST (mark read)
```

## links

[Full changelog monorepo →](https://github.com/cyguin/changelog)

[Full docs →](https://github.com/cyguin/changelog#readme)
