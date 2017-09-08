"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const puppeteer = require("puppeteer");
const url_1 = require("url");
const Chrome = puppeteer;
const PDF_DIR = path.resolve(__dirname, '../pdf/');
async function generatePDF(zhihuLink) {
    if (!zhihuLink) {
        throw new Error('require zhihuLink');
    }
    const url = new url_1.URL(zhihuLink);
    const answerRe = /\/answer\/(\d+)\/?/;
    if (!answerRe.test(url.pathname)) {
        throw new Error('require correct link, current is ' + zhihuLink);
    }
    const browser = await Chrome.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(zhihuLink);
    await page.exposeFunction('delay', (ms) => new Promise(resolve => setTimeout(resolve, ms)));
    await page.evaluate(async () => {
        const url = new window.URL(location.href);
        const answerRe = /\/answer\/(\d+)\/?/;
        const answerId = answerRe.exec(url.pathname)[1];
        const scrollToBottom = () => new Promise(resolve => {
            const scrollHeight = document.body.scrollHeight;
            const interval = setInterval(async () => {
                document.documentElement.scrollTop += 100;
                if (scrollHeight - document.documentElement.scrollTop < window.innerHeight) {
                    clearInterval(interval);
                    await window.delay(3000);
                    resolve();
                }
            }, 1);
        });
        await scrollToBottom();
        const richContent = document.querySelector('.RichContent-actions');
        richContent.parentElement.removeChild(richContent);
        const answer = document.querySelector(`[name="${answerId}"]`).parentElement.parentElement.cloneNode(true);
        document.body.innerHTML = '';
        document.body.appendChild(answer);
    });
    const title = await page.title();
    await page.pdf({
        path: `${PDF_DIR}/${title}.pdf`,
        format: 'A4',
        displayHeaderFooter: false,
        printBackground: true
    });
    browser.close();
}
exports.default = generatePDF;
module.exports = generatePDF;
