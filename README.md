Demo project for visit pages of one of most popular poetry resource in Russia, using puppeteer lib (https://github.com/puppeteer/puppeteer).

# Installation:
``` bash
git clone https://github.com/pieropatron/demo_puppeteer.git
npm install
```

sign in to https://stihi.ru/

check cookie values of "login" and "pcode"

# Start
After that, script could be started by:
``` bash
npm start -- --login=<login from cookies> --pcode=<pcode from cookies>
```
