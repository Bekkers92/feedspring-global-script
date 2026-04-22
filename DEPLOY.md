

Deployed through Netlify.

Site name: `feedspring`

Production bundle:

```html
<!-- Site Engine (SSE)
     https://engine.sygnal.com
-->
<script
  src="https://feedspring.netlify.app/index.js"
  dev-src="http://127.0.0.1:3000/dist/index.js"
></script>
```


# To Deploy 

Netlify should be configured with:

- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: blank

Local build:

``` 
npm run build 
```

Manual production deploy:

```
netlify deploy --dir=dist --prod
```

