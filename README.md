# Hi, It's Nahid here!

![MIT License](https://img.shields.io/badge/MIT-license-blue)

Glad you are interested in here. This repo is cloned and modified (by me) version of [this jekyll theme](https://github.com/P0WEX/Gesko).

If you're interested to clone/ fork and use it for your portfolio or resume (whatever) just do it.

It is highly customizable. All you need to work inside the `_data` directory and `_config` file. Your posts will go to `_posts` directory. Play around with the [**Front Matter**](https://jekyllrb.com/docs/front-matter/) thing of jekyll too. The `tree` structure is well balanced. Hope you understand the rest.

## Installation

> First of all, install `Ruby` if not installed.

Run local server:

```bash
$ git clone https://github.com/joynahid/joynahid.github.io.git
$ cd joynahid.github.io
$ bundle install
$ bundle exec jekyll build
$ bundle exec jekyll serve --watch
```

Navigate to `localhost:4000`. You're Welcome, Fork and be Stargazer.
If you want to upload it to Github Pages, remember to update the `_congif.yml` and if you are going to upload in a repo called yournickname.github.io, remember to update the `{{ site.baseurl }}` to `{{ site.url }}` .
Note that there is also a gtag in the [`_layouts/default.html`](https://github.com/P0WEX/Gesko/blob/6776e4afc384dc3d50ce2001715929c8e70a914c/_layouts/default.html#L9), you should remove it.

To create new tag, create a folder in `tag/` with the name of the new one. In this folder add an `index.html` file and just add this header:
```
---
layout: tag
tag: yourNewTag
---
```
Then build again and you're ready!!

## Contributing

Yeaaa feel free to open a pull request.


If you see any typos or formatting errors in a post, or want to helping reduce backlogs or any other issue that needs to be addressed, please do not hesitate to open a pull request and fix it!, please read [contributing](./CONTRIBUTING.md) before PR.

## License

This project is open source and available under the [MIT License](LICENSE.md).