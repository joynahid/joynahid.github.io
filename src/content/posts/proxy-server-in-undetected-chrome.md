---
title: "Configuring a Proxy Server in Undetected Chrome"
slug: proxy-server-in-undetected-chrome
description: How to use a proxy server in an undetected chrome browser.
tags: ["undetected-chrome", "proxy", "selenium"]
pubDate: "2025-03-16"
heroImage: '/assets/proxy-server-in-undetected-chrome/cover.png'
---

![Proxy Server in Undetected Chrome](/assets/proxy-server-in-undetected-chrome/cover.png)

Recently I was working with a project that required me to scrape a website. The website was protected by Cloudflare, so I needed to use a residential proxy server to bypass the protection. I was using the `undetected-chromedriver` library to create an undetected chrome browser instance which is a patched version of `selenium`'s `webdriver`.

I found that there's a way to set a proxy server using the flags.

```python
options = Options()
options.add_argument("--proxy-server={}:{}".format(ip, port))
```

But this didn't work for me. Some reports say this worked only for localhost proxies.

### Why the flag method doesn't work reliably

The `--proxy-server` flag approach often fails with `undetected-chromedriver` for several reasons:

1. **Authentication issues**: The flag method doesn't handle proxy authentication well, especially with external proxies that require username/password.

2. **Fingerprinting detection**: When using the flag method, websites with advanced bot detection can still identify automation because the proxy configuration leaves certain fingerprinting traces.

3. **WebRTC leaks**: The flag method doesn't properly handle WebRTC, which can leak your real IP address even when a proxy is configured.

4. **Inconsistent behavior**: The flag method works inconsistently across different Chrome versions and operating systems, making it unreliable for production use.

Here's the way that works for any proxy server. Using an extension. Yes a chrome extension will be created and installed in the runtime.

```python
import os, time
import undetected_chromedriver as uc

class ChromeProxy:

    def __init__(
        self,
        host: str,
        port: int,
        username: str = "",
        password: str = ""
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password

    def get_path(self) -> str:
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), "proxy_extension")

    def create_extension(
        self,
        name: str = "Chrome Proxy",
        version = "1.0.0"
    ) -> str:
        proxy_folder = self.get_path()
        os.makedirs(proxy_folder, exist_ok = True)

        # generate manifest (establish extension name and version)
        manifest = ChromeProxy.manifest_json
        manifest = manifest.replace("<ext_name>", name)
        manifest = manifest.replace("<ext_ver>", version)

        # write manifest to extension directory
        with open(f"{proxy_folder}/manifest.json","w") as f:
            f.write(manifest)

        # generate javascript code (replace some placeholders)
        js = ChromeProxy.background_js 
        js = js.replace("<proxy_host>", self.host)
        js = js.replace("<proxy_port>", str(self.port))
        js = js.replace("<proxy_username>", self.username)
        js = js.replace("<proxy_password>", self.password)

        # write javascript code to extension directory
        with open(f"{proxy_folder}/background.js","w") as f:
            f.write(js)

        return proxy_folder

    manifest_json = """
    {
        "version": "<ext_ver>",
        "manifest_version": 3,
        "name": "<ext_name>",
        "permissions": [
            "proxy",
            "tabs",
            "storage",
            "webRequest",
            "webRequestAuthProvider"
        ],
        "host_permissions": [
            "<all_urls>"
        ],
        "background": {
            "service_worker": "background.js"
        },
        "minimum_chrome_version": "22.0.0"
    }
    """

    background_js = """
    var config = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "http",
                host: "<proxy_host>",
                port: parseInt("<proxy_port>")
            },
            bypassList: ["localhost"]
        }
    };

    chrome.proxy.settings.set({
        value: config,
        scope: "regular"
    }, function() {});

    function callbackFn(details) {
        return {
            authCredentials: {
                username: "<proxy_username>",
                password: "<proxy_password>"
            }
        };
    }

    chrome.webRequest.onAuthRequired.addListener(
        callbackFn, {
            urls: ["<all_urls>"]
        },
        ['blocking']
    );
    """

proxy = ChromeProxy(
    host = "localhost",
    port = 3128,
    username = "",
    password = ""
)
extension_path = proxy.create_extension()

options = uc.ChromeOptions()
options.add_argument(f"--load-extension={extension_path}")

driver = uc.Chrome(options = options)
driver.get("https://www.2ip.io/")
time.sleep(10)
```

In this code, you just need to pass the proxy server details like `host`, `port`, `username`, `password` and it will create an extension and install it in the runtime.

I tested this with a residential proxy server from [oxylabs.io](https://oxylabs.io/) and it worked like a charm.


### Credits
- [desis123](https://github.com/desis123) for pointing out the solution.
- [ooojustin](https://github.com/ooojustin) for the class based implementation.
- [Original Discussion](https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1306).
