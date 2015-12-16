# grunt-assemble-kss 

> KSS Style Guide Generator plugin for Assemble


## Getting Started

```sh
$ npm i grunt-assemble-kss --save-dev
```

Next, register the plugin with Assemble:

```js
assemble: {
  options: {
    plugins: ['grunt-assemble-kss', 'other/plugins/*'],
    kss: {
        src: "test/fixtures/scss",
        src_mask: "*.scss",
        overviewMarkdownFile:"styleguide.md",
        dest: "test/actual",
        template: "test/fixtures/layouts/style-guide-layout.hbs"
    }
  }
}
```


## Options


## Contributing

We welcome all kinds of contributions! 

***

## Author

**Ergosign**

## License

Copyright © 2015 Ergosign
Released under the MIT license.

