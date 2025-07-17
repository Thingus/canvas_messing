// Webpack replaces resource imports like our .tif files
// with strings, so we need this here to inform Typescript
// of this
declare module '*.tif' {
  const content: string;
  export default content;
}
