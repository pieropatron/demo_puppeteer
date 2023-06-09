import puppeteer, { Browser, WaitForOptions } from "puppeteer-core";
import {program as commander} from 'commander';
import {Logger} from "@pieropatron/tinylogger";

commander
	.option('--login [value]', 'Login from cookie')
	.option('--pcode [value]', 'pcode from cookie')
	.parse(process.argv)
	;

const {login, pcode} = commander.opts() as {login: string, pcode: string};

if (!login || !pcode){
	throw new Error(`--login and --pcode required`);
}

const url = "https://stihi.ru/";
const logger = new Logger('visiter');

const TIMEOUT = 60000;

const gt_opts: WaitForOptions = {
	timeout: TIMEOUT,
	waitUntil: "networkidle2"
};

const minDelay = 500;
const randomDelay = async ()=> {
	return new Promise<void>((resolve)=>{
		const delay = Math.floor(Math.random() * (5000 - minDelay) + minDelay);
		setTimeout(()=>resolve(), delay);
	});
};

let browser: Browser;

const run = async () => {
	browser = await puppeteer.launch({
		executablePath: "chromium"
	});

	const page = await browser.newPage();

	await page.setCookie({
		name: "pcode", value: pcode,
		url
	});

	await page.setCookie({
		name: "login", value: login,
		url
	});

	await page.setViewport({
		width: 800,
		height: 600,
		isLandscape: true
	});

	const reponse = await page.goto(url + "poems/list.html?topic=all", gt_opts);

	if (!reponse?.ok){
		logger.debug('response fail');
		return browser.close();
	}

	const last_href: string = await page.$$eval(".poemlink", as => (as[0] as any).href);
	const arhref = last_href.split("/");
	const last_poem = arhref.pop();
	const prefix = arhref.join("/");

	if (!last_poem || !/^[0-9]+$/.test(last_poem)){
		return browser.close();
	}

	let last_num = parseInt(last_poem);
	while (last_num){
		const link = `${prefix}/${last_num}`;
		logger.info(`open`, link);
		await page.goto(link, gt_opts);
		await randomDelay();
		last_num--;
	}

	await browser.close();
};

run()
	.then(()=>{
        logger.info("finished");
		process.exit(0);
	})
	.catch(e=>{
		if (browser)
			browser.close();
		logger.error(e);
		process.exit(1);
	});
